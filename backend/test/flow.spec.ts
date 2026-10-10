import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { tmpdir } from 'os';
import { join } from 'path';
import { normalizeIndianPhone, maskPhone } from '../src/common/phone';
import { normalizeName } from '../src/common/name';

describe('certificate platform (e2e)', () => {
  let mongo: MongoMemoryServer;
  let app: INestApplication;
  let http: any;
  const admin = request.agent;
  let adminAgent: any;
  let eventId: string;
  let certDbId: string;
  let certId: string;
  let certNumber: string;

  beforeAll(async () => {
    // CI provides a real MongoDB service (TEST_DATABASE_URL); locally an in-memory server is started.
    if (process.env.TEST_DATABASE_URL) {
      const base = process.env.TEST_DATABASE_URL.replace(/\/+$/, '');
      process.env.DATABASE_URL = base + '/certs_test_' + Date.now();
    } else {
      mongo = await MongoMemoryServer.create();
      process.env.DATABASE_URL = mongo.getUri('certs_test');
    }
    process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
    process.env.APP_URL = 'https://example.test';
    process.env.DISABLE_RATE_LIMIT = 'true';
    process.env.STORAGE_DRIVER = 'local';
    process.env.STORAGE_LOCAL_DIR = join(tmpdir(), `cert-test-${Date.now()}`);
    const { AppModule } = await import('../src/app.module');
    const { configureApp } = await import('../src/setup');
    const { AuthService } = await import('../src/auth/auth.service');
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(mod.createNestApplication());
    await app.init();
    await app.get(AuthService).ensureAdmin('admin@test.com', 'Passw0rd!long');
    http = app.getHttpServer();
    adminAgent = admin(http);
  });

  afterAll(async () => {
    if (process.env.TEST_DATABASE_URL) {
      const { getConnectionToken } = await import('@nestjs/mongoose');
      await app?.get<any>(getConnectionToken())?.dropDatabase?.();
    }
    await app?.close();
    await mongo?.stop();
  });

  describe('helpers', () => {
    it('normalizes Indian phones', () => {
      for (const p of ['9876543210', '+919876543210', '+91 9876543210', '09876543210', '91-98765-43210']) {
        expect(normalizeIndianPhone(p)).toBe('+919876543210');
      }
      for (const p of ['12345', '5876543210', 'abcdefghij', '', '+9198765432101']) expect(normalizeIndianPhone(p)).toBeNull();
      expect(maskPhone('+919876543210')).toBe('******3210');
    });
    it('normalizes names', () => {
      expect(normalizeName('  ramesh   kumar ')).toBe('Ramesh Kumar');
      expect(normalizeName('RAMESH KUMAR')).toBe('Ramesh Kumar');
      expect(normalizeName("Anne McDonald")).toBe('Anne McDonald');
      expect(normalizeName('')).toBeNull();
      expect(normalizeName('A')).toBeNull();
      expect(normalizeName('<script>')).toBeNull();
    });
  });

  describe('root', () => {
    it('answers the bare API address with a friendly message', async () => {
      const res = await request(http).get('/').expect(200);
      expect(res.body).toMatchObject({ status: 'running', health: '/api/health' });
      await request(http).get('/nothing-here').expect(404);
    });
  });

  describe('health', () => {
    it('reports database, app url and commit without secrets', async () => {
      const res = await request(http).get('/api/health').expect(200);
      expect(res.body).toMatchObject({ ok: true, database: 'up', appUrl: 'https://example.test' });
      expect(JSON.stringify(res.body)).not.toMatch(/secret|password|mongodb/i);
    });
  });

  describe('security', () => {
    it('rejects unauthenticated admin requests', async () => {
      for (const path of ['/api/admin/events', '/api/admin/certificates', '/api/admin/registrations', '/api/admin/stats', '/api/admin/templates']) {
        await request(http).get(path).expect(401);
      }
      await request(http).post('/api/admin/events').send({ name: 'x' }).expect(401);
      await request(http).post('/api/admin/certificates/abc/revoke').expect(401);
      await request(http).get('/api/admin/events').set('Authorization', 'Bearer garbage').expect(401);
    });
    it('rejects bad admin login', async () => {
      await request(http).post('/api/admin/auth/login').send({ email: 'admin@test.com', password: 'wrong' }).expect(401);
      await request(http).post('/api/admin/auth/login').send({ email: 'nobody@test.com', password: 'x' }).expect(401);
      await request(http).post('/api/admin/auth/login').send({ email: 'not-an-email', password: 'x' }).expect(400);
    });
    it('logs in with an httpOnly cookie and no password hash', async () => {
      const res = await adminAgent.post('/api/admin/auth/login').send({ email: 'admin@test.com', password: 'Passw0rd!long' }).expect(200);
      expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
      expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Strict/i);
      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
      await adminAgent.get('/api/admin/auth/me').expect(200);
    });
  });

  describe('events', () => {
    it('creates an event with registration URL and QR', async () => {
      const res = await adminAgent
        .post('/api/admin/events')
        .send({ name: 'First Aid Training Program', organizationName: 'ABC Foundation', issueDate: '2026-10-08', status: 'ACTIVE' })
        .expect(201);
      eventId = res.body.id;
      expect(res.body.eventCode).toMatch(/^[A-Z0-9]{8}$/);
      expect(res.body.registrationUrl).toBe(`https://example.test/register/${res.body.eventCode}`);
      expect(res.body.qrCodeDataUrl).toMatch(/^data:image\/png;base64,/);
      (global as any).__code = res.body.eventCode;
    });
    it('validates event input and custom code conflicts', async () => {
      await adminAgent.post('/api/admin/events').send({ name: 'x' }).expect(400);
      await adminAgent.post('/api/admin/events').send({ name: 'Dup', organizationName: 'Org', eventCode: (global as any).__code }).expect(409);
    });
    it('exposes only public fields and 404s unknown/draft events', async () => {
      const code = (global as any).__code;
      const res = await request(http).get(`/api/events/${code}`).expect(200);
      expect(res.body).toEqual({ eventCode: code, name: 'First Aid Training Program', description: '', organizationName: 'ABC Foundation', open: true });
      await request(http).get('/api/events/NOPE1234').expect(404);
      const draft = await adminAgent.post('/api/admin/events').send({ name: 'Draft Event', organizationName: 'Org' }).expect(201);
      await request(http).get(`/api/events/${draft.body.eventCode}`).expect(404);
    });
    it('updates and lists events', async () => {
      await adminAgent.put(`/api/admin/events/${eventId}`).send({ description: 'Learn first aid' }).expect(200);
      const list = await adminAgent.get('/api/admin/events').expect(200);
      expect(list.body.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('registration → certificate → verification', () => {
    const body = { fullName: 'ramesh kumar', phone: '+91 98765 43210' };

    it('rejects invalid input with friendly codes', async () => {
      const code = (global as any).__code;
      const a = await request(http).post(`/api/events/${code}/register`).send({ fullName: '', phone: '9876543210' }).expect(400);
      expect(a.body.code).toBe('INVALID_NAME');
      const b = await request(http).post(`/api/events/${code}/register`).send({ fullName: 'Ramesh', phone: '12345' }).expect(400);
      expect(b.body.code).toBe('INVALID_PHONE');
      await request(http).post(`/api/events/${code}/register`).send({ fullName: 'Ramesh', phone: '9876543210', isAdmin: true }).expect(400);
      await request(http).post('/api/events/NOPE1234/register').send(body).expect(404);
    });

    it('creates a certificate and a real PDF', async () => {
      const code = (global as any).__code;
      const res = await request(http).post(`/api/events/${code}/register`).send(body).expect(200);
      expect(res.body.outcome).toBe('CREATED');
      const c = res.body.certificate;
      expect(c.certificateNumber).toMatch(/^WTL-[A-Z0-9]{2,6}-00001$/);
      expect(c.recipientName).toBe('Ramesh Kumar');
      expect(c.status).toBe('ACTIVE');
      expect(JSON.stringify(res.body)).not.toMatch(/9876543210|phone/i);
      certId = c.certificateId;
      certNumber = c.certificateNumber;

      const pdf = await request(http).get(`/api/certificates/${certId}/pdf`).buffer(true).parse((r, cb) => {
        const chunks: Buffer[] = [];
        r.on('data', (d: Buffer) => chunks.push(d));
        r.on('end', () => cb(null, Buffer.concat(chunks)));
      }).expect(200);
      expect(pdf.headers['content-type']).toBe('application/pdf');
      expect(pdf.headers['content-disposition']).toMatch(/attachment/);
      expect((pdf.body as Buffer).subarray(0, 5).toString()).toBe('%PDF-');
      expect((pdf.body as Buffer).length).toBeGreaterThan(5000);

      const prev = await request(http).get(`/api/certificates/${certId}/preview`).expect(200);
      expect(prev.headers['content-type']).toBe('image/webp');
    });

    it('returns the existing certificate for a duplicate phone', async () => {
      const code = (global as any).__code;
      const res = await request(http).post(`/api/events/${code}/register`).send({ fullName: 'Someone Else', phone: '9876543210' }).expect(200);
      expect(res.body.outcome).toBe('EXISTING');
      expect(res.body.certificate.certificateNumber).toBe(certNumber);
      expect(res.body.certificate.recipientName).toBe('Ramesh Kumar');
    });

    it('allows the same phone for a different event', async () => {
      const ev = await adminAgent.post('/api/admin/events').send({ name: 'Second Event', organizationName: 'Org', status: 'ACTIVE' }).expect(201);
      const res = await request(http).post(`/api/events/${ev.body.eventCode}/register`).send(body).expect(200);
      expect(res.body.outcome).toBe('CREATED');
      expect(res.body.certificate.certificateNumber).toMatch(/^WTL-[A-Z0-9]{2,6}-00001$/);
    });

    it('deletes an event together with its certificates', async () => {
      const ev = await adminAgent.post('/api/admin/events').send({ name: 'To Delete', organizationName: 'Org', status: 'ACTIVE' }).expect(201);
      const reg = await request(http).post(`/api/events/${ev.body.eventCode}/register`).send(body).expect(200);
      const id = reg.body.certificate.certificateId;
      await request(http).get(`/api/certificates/${id}`).expect(200);
      const del = await adminAgent.delete(`/api/admin/events/${ev.body.id}`).expect(200);
      expect(del.body).toMatchObject({ deleted: true, certificates: 1 });
      await request(http).get(`/api/certificates/${id}`).expect(404);
      await adminAgent.get(`/api/admin/events/${ev.body.id}`).expect(404);
    });

    it('handles concurrent identical submissions without duplicates', async () => {
      const ev = await adminAgent.post('/api/admin/events').send({ name: 'Race Event', organizationName: 'Org', status: 'ACTIVE' }).expect(201);
      const rs = await Promise.all([1, 2, 3].map(() => request(http).post(`/api/events/${ev.body.eventCode}/register`).send({ fullName: 'Race Runner', phone: '9123456780' })));
      const numbers = new Set(rs.filter((r) => r.status === 200).map((r) => r.body.certificate.certificateNumber));
      expect(numbers.size).toBe(1);
      expect(rs.every((r) => r.status === 200)).toBe(true);
    });

    it('verifies by secure id and by number, hiding the phone', async () => {
      for (const ref of [certId, certNumber]) {
        const res = await request(http).get(`/api/certificates/${ref}`).expect(200);
        expect(res.body).toMatchObject({ status: 'ACTIVE', recipientName: 'Ramesh Kumar', eventName: 'First Aid Training Program', organizationName: 'ABC Foundation' });
        expect(JSON.stringify(res.body)).not.toMatch(/9876|\+91/);
      }
    });

    it('returns 404 for unknown certificates', async () => {
      const res = await request(http).get('/api/certificates/WTL-CSTN-99999').expect(404);
      expect(res.body.code).toBe('CERTIFICATE_NOT_FOUND');
      await request(http).get('/api/certificates/zzzzzzzzzzzzzzzz').expect(404);
      await request(http).get('/api/certificates/%7B%22%24ne%22%3Anull%7D').expect(404);
    });

    it('lets admins search by name, phone and number', async () => {
      for (const q of ['Ramesh', '9876543210', '3210', certNumber, 'First Aid']) {
        const res = await adminAgent.get('/api/admin/certificates').query({ q }).expect(200);
        expect(res.body.items.some((i: any) => i.certificateNumber === certNumber)).toBe(true);
        if (q === 'Ramesh') certDbId = res.body.items.find((i: any) => i.certificateNumber === certNumber).id;
      }
      const regs = await adminAgent.get('/api/admin/registrations').expect(200);
      expect(regs.body.items[0].phone).toMatch(/^\+91/);
      const xlsx = await adminAgent.get('/api/admin/certificates/export?status=ACTIVE').buffer(true).parse((res, cb) => { const d: Buffer[] = []; res.on('data', (c: Buffer) => d.push(c)); res.on('end', () => cb(null, Buffer.concat(d))); }).expect(200);
      expect(xlsx.headers['content-type']).toContain('spreadsheetml');
      expect((xlsx.body as Buffer).subarray(0, 2).toString()).toBe('PK');
      const stats = await adminAgent.get('/api/admin/stats').expect(200);
      expect(stats.body.totalCertificates).toBeGreaterThanOrEqual(3);
    });

    it('revokes and restores a certificate', async () => {
      await adminAgent.post(`/api/admin/certificates/${certDbId}/revoke`).expect(200);
      const res = await request(http).get(`/api/certificates/${certId}`).expect(200);
      expect(res.body.status).toBe('REVOKED');
      expect(res.body.recipientName).toBeNull();
      await request(http).get(`/api/certificates/${certId}/pdf`).expect(403);
      await adminAgent.post(`/api/admin/certificates/${certDbId}/restore`).expect(200);
      expect((await request(http).get(`/api/certificates/${certId}`)).body.status).toBe('ACTIVE');
    });
  });

  describe('event status and expiry', () => {
    it('refuses registration when closed', async () => {
      const code = (global as any).__code;
      await adminAgent.put(`/api/admin/events/${eventId}`).send({ status: 'CLOSED' }).expect(200);
      const res = await request(http).post(`/api/events/${code}/register`).send({ fullName: 'New Person', phone: '9000000001' }).expect(403);
      expect(res.body.code).toBe('EVENT_CLOSED');
      expect((await request(http).get(`/api/events/${code}`)).body.open).toBe(false);
    });
    it('reports expired certificates', async () => {
      const ev = await adminAgent.post('/api/admin/events').send({ name: 'Old Event', organizationName: 'Org', status: 'ACTIVE', expiryDate: '2000-01-01' }).expect(201);
      const reg = await request(http).post(`/api/events/${ev.body.eventCode}/register`).send({ fullName: 'Old Timer', phone: '9000000002' }).expect(200);
      const res = await request(http).get(`/api/certificates/${reg.body.certificate.certificateId}`).expect(200);
      expect(res.body.status).toBe('EXPIRED');
    });
  });

  describe('public site URL setting', () => {
    it('requires an admin', async () => {
      await request(http).get('/api/admin/settings').expect(401);
      await request(http).put('/api/admin/settings/site-url').send({ siteUrl: 'https://x.example.org' }).expect(401);
      await request(http).post('/api/admin/settings/fix-certificate-urls').expect(401);
    });

    it('starts from the environment value', async () => {
      const res = await adminAgent.get('/api/admin/settings').expect(200);
      expect(res.body).toMatchObject({ siteUrl: 'https://example.test', source: 'environment', count: 0 });
    });

    it('rejects unsafe or invalid addresses', async () => {
      for (const siteUrl of ['not a url', 'http://evil.example.com', 'javascript:alert(1)', 'ftp://files.example.com']) {
        await adminAgent.put('/api/admin/settings/site-url').send({ siteUrl }).expect(400);
      }
    });

    it('overrides APP_URL, updates links/QR codes, and repairs old certificates', async () => {
      const set = await adminAgent.put('/api/admin/settings/site-url').send({ siteUrl: 'https://certs.example.org/anything/' }).expect(200);
      expect(set.body).toMatchObject({ siteUrl: 'https://certs.example.org', source: 'database' });
      expect(set.body.count).toBeGreaterThan(0); // certificates issued earlier still carry the old address

      const health = await request(http).get('/api/health').expect(200);
      expect(health.body.appUrl).toBe('https://certs.example.org');

      const ev = await adminAgent.get(`/api/admin/events/${eventId}`).expect(200);
      expect(ev.body.registrationUrl).toBe(`https://certs.example.org/register/${ev.body.eventCode}`);

      const fixed = await adminAgent.post('/api/admin/settings/fix-certificate-urls').expect(200);
      expect(fixed.body.count).toBeGreaterThan(0);
      let left = 1;
      for (let i = 0; i < 90 && left > 0; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        left = (await adminAgent.get('/api/admin/settings').expect(200)).body.count;
      }
      expect(left).toBe(0);

      const list = await adminAgent.get('/api/admin/certificates').expect(200);
      expect(list.body.items.every((c: any) => c.verificationUrl.startsWith('https://certs.example.org/certificate/'))).toBe(true);
      // same secure id and number, still downloadable
      await request(http).get(`/api/certificates/${certId}`).expect(200);
    });

    it('issues new certificates with the new address', async () => {
      const ev = await adminAgent.post('/api/admin/events').send({ name: 'After Fix', organizationName: 'Org', status: 'ACTIVE' }).expect(201);
      expect(ev.body.registrationUrl.startsWith('https://certs.example.org/register/')).toBe(true);
      await request(http).post(`/api/events/${ev.body.eventCode}/register`).send({ fullName: 'New Person', phone: '9000000077' }).expect(200);
      const list = await adminAgent.get('/api/admin/certificates').query({ q: 'New Person' }).expect(200);
      expect(list.body.items[0].verificationUrl.startsWith('https://certs.example.org/certificate/')).toBe(true);
    });
  });
});
