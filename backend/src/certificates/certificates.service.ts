import * as ExcelJS from 'exceljs';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isValidObjectId, Model, Types } from 'mongoose';
import { AppException } from '../common/app.exception';
import { escapeRegex, generateCertificateId } from '../common/ids';
import { normalizeName } from '../common/name';
import { normalizeIndianPhone } from '../common/phone';
import { Certificate, CertificateDoc, Counter, Event, EventDoc, Registration, Template } from '../database/schemas';
import { EventsService } from '../events/events.service';
import { CertificateRenderData } from '../pdf/template-renderers';
import { PdfService, TemplateSource } from '../pdf/pdf.service';
import { QrService } from '../qr/qr.service';
import { StorageService } from '../storage/storage.service';

export const formatDate = (d?: Date | null) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }) : '';

export type RegisterOutcome = 'CREATED' | 'EXISTING' | 'PROCESSING';

@Injectable()
export class CertificatesService {
  private readonly logger = new Logger(CertificatesService.name);

  constructor(
    @InjectModel(Certificate.name) private certs: Model<Certificate>,
    @InjectModel(Registration.name) private regs: Model<Registration>,
    @InjectModel(Counter.name) private counters: Model<Counter>,
    @InjectModel(Template.name) private templates: Model<Template>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    private events: EventsService,
    private pdf: PdfService,
    private qr: QrService,
    private storage: StorageService,
  ) {}

  // ---------- participant flow ----------

  /** Create-or-find the registration, then issue (or return) the certificate. */
  async register(eventCode: string, input: { fullName: string; phone: string }) {
    const event = await this.events.findByCode(eventCode);
    if (!event || event.status === 'DRAFT') throw new AppException('EVENT_NOT_FOUND', 'This event link is not valid.', 404);
    if (event.status !== 'ACTIVE') throw new AppException('EVENT_CLOSED', 'Registration for this event is closed.', 403);

    const fullName = normalizeName(input.fullName);
    if (!fullName) throw new AppException('INVALID_NAME', 'Please enter your full name.', 400, { fullName: 'INVALID_NAME' });
    const normalizedPhone = normalizeIndianPhone(input.phone);
    if (!normalizedPhone) throw new AppException('INVALID_PHONE', 'Please enter a valid 10-digit mobile number.', 400, { phone: 'INVALID_PHONE' });

    let registration = await this.regs.findOne({ eventId: event._id, normalizedPhone });
    if (!registration) {
      try {
        registration = await this.regs.create({ eventId: event._id, fullName, phoneNumber: input.phone.trim(), normalizedPhone });
      } catch (e: any) {
        if (e?.code !== 11000) throw e;
        registration = await this.regs.findOne({ eventId: event._id, normalizedPhone }); // lost a race
      }
    }
    if (!registration) throw new AppException('CERTIFICATE_ERROR', 'We could not create your certificate right now.', 500);

    const existing = await this.certs.findOne({ registrationId: registration._id }).sort({ createdAt: -1 });
    if (existing && !event.allowDuplicates) {
      if (existing.pdfStatus === 'PENDING' && Date.now() - existing.createdAt.getTime() < 60_000) {
        return { outcome: 'PROCESSING' as RegisterOutcome, certificate: this.publicView(existing) };
      }
      const ready = await this.ensureFiles(existing);
      return { outcome: 'EXISTING' as RegisterOutcome, certificate: this.publicView(ready) };
    }

    const now = new Date();
    const certificateId = generateCertificateId();
    let cert: CertificateDoc;
    try {
      cert = await this.certs.create({
      singleKey: event.allowDuplicates ? undefined : String(registration._id),
      registrationId: registration._id,
      eventId: event._id,
      certificateNumber: await this.nextNumber(event),
      certificateId,
      recipientName: registration.fullName === fullName || !event.allowDuplicates ? registration.fullName : fullName,
      normalizedPhone,
      eventName: event.name,
      eventDescription: event.description ?? '',
      organizationName: event.organizationName,
      certificateTitle: event.certificateTitle || 'Certificate of Completion',
      issueDate: event.issueDate ?? now,
      templateId: event.templateId,
      expiryDate: event.expiryDate,
      issuedAt: now,
      verificationUrl: await this.qr.verificationUrl(certificateId),
      });
    } catch (e: any) {
      if (e?.code !== 11000) throw e;
      // A concurrent request issued it first.
      const winner = await this.certs.findOne({ registrationId: registration._id }).sort({ createdAt: -1 });
      if (!winner) throw e;
      return { outcome: 'PROCESSING' as RegisterOutcome, certificate: this.publicView(winner) };
    }
    try {
      const ready = await this.ensureFiles(cert);
      return { outcome: 'CREATED' as RegisterOutcome, certificate: this.publicView(ready) };
    } catch (e) {
      this.logger.error(`PDF generation failed for ${cert.certificateNumber}: ${e}`);
      throw new AppException('CERTIFICATE_ERROR', 'We could not create your certificate right now. Please try again.', 500);
    }
  }

  /** WTL-CUDTN-00001: organisation prefix, per-event code, and a running number that is counted separately for each code. */
  async nextNumber(event: EventDoc) {
    const prefix = (process.env.CERT_PREFIX || 'WTL').toUpperCase().replace(/[^A-Z0-9]/g, '');
    const code = event.certificateCode || event.eventCode.replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'GEN';
    const c = await this.counters.findOneAndUpdate({ _id: `cert-${prefix}-${code}` }, { $inc: { seq: 1 } }, { upsert: true, new: true });
    return `${prefix}-${code}-${String(c.seq).padStart(5, '0')}`;
  }

  // ---------- files ----------

  private async templateFor(cert: CertificateDoc): Promise<TemplateSource | null> {
    let t = cert.templateId ? await this.templates.findOne({ _id: cert.templateId, isActive: true }) : null;
    if (!t) t = await this.templates.findOne({ isDefault: true, isActive: true });
    return t ? { type: t.type, templateData: t.templateData } : null;
  }

  /** Generate PDF + preview if missing (also used to retry after a failure). */
  async ensureFiles(cert: CertificateDoc): Promise<CertificateDoc> {
    if (cert.pdfStatus === 'READY' && cert.pdfKey && cert.previewKey) return cert;
    try {
      const data: CertificateRenderData = {
        certificateTitle: cert.certificateTitle,
        recipientName: cert.recipientName,
        eventName: cert.eventName,
        eventDescription: cert.eventDescription,
        organizationName: cert.organizationName,
        issueDate: formatDate(cert.issueDate ?? cert.issuedAt),
        certificateNumber: cert.certificateNumber,
        verificationUrl: cert.verificationUrl,
        qrDataUrl: await this.qr.verificationQr(cert.certificateId),
      };
      const { pdf, preview } = await this.pdf.render(data, await this.templateFor(cert));
      const base = `certificates/${cert.certificateId}`;
      await this.storage.put(`${base}.pdf`, pdf, 'application/pdf');
      await this.storage.put(`${base}.webp`, preview, 'image/webp');
      cert.pdfKey = `${base}.pdf`;
      cert.previewKey = `${base}.webp`;
      cert.pdfUrl = `/api/certificates/${cert.certificateId}/pdf`;
      cert.pdfStatus = 'READY';
      await cert.save();
      return cert;
    } catch (e) {
      cert.pdfStatus = 'FAILED';
      await cert.save().catch(() => undefined);
      throw e;
    }
  }

  /** Discard stored files so they are re-rendered (e.g. after replacing the template). */
  async regenerate(id: string) {
    const cert = await this.getDoc(id);
    cert.pdfStatus = 'PENDING';
    await cert.save();
    return this.publicView(await this.ensureFiles(cert));
  }

  // ---------- site URL repair ----------

  private fixing = false;

  private async staleFilter() {
    const base = await this.qr.siteUrl();
    return { verificationUrl: { $not: new RegExp(`^${escapeRegex(base)}/certificate/`) } };
  }

  /** How many issued certificates carry a QR code that points somewhere other than the current site URL. */
  async staleUrlCount() {
    return { count: await this.certs.countDocuments(await this.staleFilter()), running: this.fixing };
  }

  /**
   * Re-issues the PDF + preview (same number, same secure id) of every certificate whose QR points at an old site URL.
   * Runs in the background; the admin panel polls staleUrlCount().
   */
  async fixStaleUrls() {
    const { count } = await this.staleUrlCount();
    if (this.fixing || count === 0) return { started: false, count, running: this.fixing };
    this.fixing = true;
    void (async () => {
      try {
        for (const c of await this.certs.find(await this.staleFilter())) {
          try {
            c.verificationUrl = await this.qr.verificationUrl(c.certificateId);
            c.pdfStatus = 'PENDING';
            await c.save();
            await this.ensureFiles(c);
          } catch (e) {
            this.logger.error(`Could not repair ${c.certificateNumber}: ${e}`);
          }
        }
      } finally {
        this.fixing = false;
      }
    })();
    return { started: true, count, running: true };
  }

  // ---------- public lookup ----------

  effectiveStatus(c: CertificateDoc): 'ACTIVE' | 'REVOKED' | 'EXPIRED' {
    if (c.status === 'REVOKED') return 'REVOKED';
    if (c.status === 'EXPIRED' || (c.expiryDate && c.expiryDate.getTime() < Date.now())) return 'EXPIRED';
    return 'ACTIVE';
  }

  /** Accepts the secure certificateId (used in QR codes) or the human readable number. */
  async findByRef(ref: string): Promise<CertificateDoc> {
    const r = String(ref).trim().slice(0, 60);
    const cert = await this.certs.findOne(/^[A-Z0-9]{2,8}(-[A-Z0-9]{2,8})+-\d{4,}$/i.test(r) ? { certificateNumber: r.toUpperCase() } : { certificateId: r.toLowerCase() });
    if (!cert) throw new AppException('CERTIFICATE_NOT_FOUND', 'We could not find a certificate with this number.', 404);
    return cert;
  }

  /** Public data. Never includes phone numbers; revoked certificates hide the recipient. */
  publicView(c: CertificateDoc) {
    const status = this.effectiveStatus(c);
    const active = status === 'ACTIVE';
    return {
      status,
      certificateNumber: c.certificateNumber,
      certificateId: c.certificateId,
      recipientName: status === 'REVOKED' ? null : c.recipientName,
      eventName: status === 'REVOKED' ? null : c.eventName,
      organizationName: status === 'REVOKED' ? null : c.organizationName,
      certificateTitle: status === 'REVOKED' ? null : c.certificateTitle,
      issueDate: status === 'REVOKED' ? null : c.issueDate ?? c.issuedAt,
      downloadable: active && c.pdfStatus === 'READY',
    };
  }

  async publicByRef(ref: string) {
    return this.publicView(await this.findByRef(ref));
  }

  async fileByRef(ref: string, kind: 'pdf' | 'preview') {
    let cert = await this.findByRef(ref);
    if (this.effectiveStatus(cert) !== 'ACTIVE') throw new AppException('CERTIFICATE_NOT_ACTIVE', 'This certificate is no longer valid.', 403);
    return this.readFile(cert, kind);
  }

  async readFile(cert: CertificateDoc, kind: 'pdf' | 'preview') {
    let key = kind === 'pdf' ? cert.pdfKey : cert.previewKey;
    let buf = key ? await this.storage.get(key) : null;
    if (!buf) {
      cert.pdfStatus = 'PENDING';
      cert = await this.ensureFiles(cert);
      key = kind === 'pdf' ? cert.pdfKey : cert.previewKey;
      buf = key ? await this.storage.get(key) : null;
    }
    if (!buf) throw new AppException('CERTIFICATE_ERROR', 'We could not prepare your certificate. Please try again.', 500);
    const safe = cert.certificateNumber.replace(/[^A-Za-z0-9-]/g, '');
    return { buffer: buf, filename: `Certificate-${safe}.${kind === 'pdf' ? 'pdf' : 'webp'}`, contentType: kind === 'pdf' ? 'application/pdf' : key?.endsWith('.jpg') ? 'image/jpeg' : 'image/webp' };
  }

  // ---------- admin ----------

  async getDoc(id: string) {
    const c = isValidObjectId(id) ? await this.certs.findById(id) : null;
    if (!c) throw new AppException('NOT_FOUND', 'Certificate not found.', 404);
    return c;
  }

  adminView(c: CertificateDoc) {
    return {
      id: String(c._id),
      certificateNumber: c.certificateNumber,
      certificateId: c.certificateId,
      recipientName: c.recipientName,
      phone: c.normalizedPhone,
      eventId: String(c.eventId),
      eventName: c.eventName,
      organizationName: c.organizationName,
      status: this.effectiveStatus(c),
      storedStatus: c.status,
      issuedAt: c.issuedAt,
      issueDate: c.issueDate,
      expiryDate: c.expiryDate,
      pdfStatus: c.pdfStatus,
      verificationUrl: c.verificationUrl,
    };
  }

  private adminFilter(opts: { q?: string; status?: string; eventId?: string }): FilterQuery<Certificate> {
    const filter: FilterQuery<Certificate> = {};
    if (opts.status && ['ACTIVE', 'REVOKED', 'EXPIRED'].includes(opts.status)) filter.status = opts.status as any;
    if (opts.eventId && isValidObjectId(opts.eventId)) filter.eventId = new Types.ObjectId(opts.eventId) as any;
    if (opts.q?.trim()) {
      const q = opts.q.trim();
      const rx = new RegExp(escapeRegex(q), 'i');
      const digits = q.replace(/\D/g, '');
      const or: FilterQuery<Certificate>[] = [{ recipientName: rx }, { certificateNumber: rx }, { eventName: rx }];
      if (digits.length >= 4) or.push({ normalizedPhone: new RegExp(escapeRegex(digits.slice(-10)) + '$') });
      filter.$or = or;
    }
    return filter;
  }

  /** Excel workbook of every certificate matching the admin filters (same filters as the list). */
  async adminExport(opts: { q?: string; status?: string; eventId?: string }) {
    const items = await this.certs.find(this.adminFilter(opts)).sort({ createdAt: -1 }).limit(50_000);
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Certificates');
    ws.columns = [
      { header: 'Certificate No', key: 'number', width: 22 },
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Event', key: 'event', width: 34 },
      { header: 'Organization', key: 'org', width: 24 },
      { header: 'Issued', key: 'issued', width: 14, style: { numFmt: 'dd mmm yyyy' } },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Verification link', key: 'url', width: 50 },
    ];
    for (const c of items) {
      ws.addRow({
        number: c.certificateNumber, name: c.recipientName, phone: String(c.normalizedPhone ?? ''), event: c.eventName,
        org: c.organizationName, issued: c.issuedAt, status: this.effectiveStatus(c), url: c.verificationUrl,
      });
    }
    ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF533AFD' } };
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: 'A1', to: 'H1' };
    const buffer = Buffer.from(await wb.xlsx.writeBuffer());
    const date = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    return { buffer, filename: `certificates-${date}.xlsx`, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
  }

  async adminList(opts: { q?: string; status?: string; eventId?: string; page: number; limit: number }) {
    const filter = this.adminFilter(opts);
    const [items, total] = await Promise.all([
      this.certs.find(filter).sort({ createdAt: -1 }).skip((opts.page - 1) * opts.limit).limit(opts.limit),
      this.certs.countDocuments(filter),
    ]);
    return { items: items.map((c) => this.adminView(c)), total, page: opts.page, limit: opts.limit };
  }

  async adminGet(id: string) {
    return this.adminView(await this.getDoc(id));
  }

  async setRevoked(id: string, revoked: boolean) {
    const c = await this.getDoc(id);
    c.status = revoked ? 'REVOKED' : 'ACTIVE';
    c.revokedAt = revoked ? new Date() : undefined;
    await c.save();
    return this.adminView(c);
  }

  async adminFile(id: string, kind: 'pdf' | 'preview') {
    return this.readFile(await this.getDoc(id), kind);
  }
}
