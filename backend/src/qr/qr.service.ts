import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { getConfig } from '../config/config';

/** Two distinct QR purposes: event registration and certificate verification. */
@Injectable()
export class QrService {
  registrationUrl(eventCode: string) {
    return `${getConfig().appUrl}/register/${encodeURIComponent(eventCode)}`;
  }
  verificationUrl(certificateId: string) {
    return `${getConfig().appUrl}/certificate/${encodeURIComponent(certificateId)}`;
  }
  dataUrl(text: string, width = 512): Promise<string> {
    return QRCode.toDataURL(text, { errorCorrectionLevel: 'M', margin: 2, width });
  }
  registrationQr(eventCode: string) {
    return this.dataUrl(this.registrationUrl(eventCode), 1024);
  }
  verificationQr(certificateId: string) {
    return this.dataUrl(this.verificationUrl(certificateId), 400);
  }
}
