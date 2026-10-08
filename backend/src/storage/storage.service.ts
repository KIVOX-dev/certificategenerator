import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { dirname, join, normalize } from 'path';
import { getConfig } from '../config/config';

export interface StorageDriver {
  put(key: string, data: Buffer, contentType: string): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
}

class LocalDriver implements StorageDriver {
  constructor(private readonly root: string) {}
  private path(key: string) {
    const p = normalize(join(this.root, key));
    if (!p.startsWith(normalize(this.root))) throw new Error('Invalid storage key');
    return p;
  }
  async put(key: string, data: Buffer) {
    const p = this.path(key);
    await fs.mkdir(dirname(p), { recursive: true });
    await fs.writeFile(p, data);
  }
  async get(key: string) {
    try { return await fs.readFile(this.path(key)); } catch { return null; }
  }
  async remove(key: string) {
    await fs.rm(this.path(key), { force: true });
  }
}

/** Works with any S3-compatible store (AWS S3, Cloudflare R2, MinIO, Spaces...). */
class S3Driver implements StorageDriver {
  private client: any;
  private sdk: any;
  constructor(private readonly cfg = getConfig().storage) {}
  private async init() {
    if (!this.client) {
      this.sdk = await import('@aws-sdk/client-s3');
      this.client = new this.sdk.S3Client({
        region: this.cfg.region,
        endpoint: this.cfg.url || undefined,
        forcePathStyle: !!this.cfg.url,
        credentials: { accessKeyId: this.cfg.accessKey, secretAccessKey: this.cfg.secretKey },
      });
    }
  }
  async put(key: string, data: Buffer, contentType: string) {
    await this.init();
    await this.client.send(new this.sdk.PutObjectCommand({ Bucket: this.cfg.bucket, Key: key, Body: data, ContentType: contentType }));
  }
  async get(key: string) {
    await this.init();
    try {
      const out = await this.client.send(new this.sdk.GetObjectCommand({ Bucket: this.cfg.bucket, Key: key }));
      return Buffer.from(await out.Body.transformToByteArray());
    } catch { return null; }
  }
  async remove(key: string) {
    await this.init();
    await this.client.send(new this.sdk.DeleteObjectCommand({ Bucket: this.cfg.bucket, Key: key }));
  }
}

/**
 * Files are always streamed through the API (so revoked certificates can be
 * blocked and the bucket can stay private). Only the key is stored in MongoDB.
 */
@Injectable()
export class StorageService implements StorageDriver {
  private readonly driver: StorageDriver;
  constructor() {
    const cfg = getConfig().storage;
    this.driver = cfg.driver === 's3' ? new S3Driver(cfg) : new LocalDriver(cfg.localDir);
  }
  put(key: string, data: Buffer, contentType: string) { return this.driver.put(key, data, contentType); }
  get(key: string) { return this.driver.get(key); }
  remove(key: string) { return this.driver.remove(key); }
}
