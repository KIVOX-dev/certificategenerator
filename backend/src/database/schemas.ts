import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const EVENT_STATUSES = ['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];
export const CERTIFICATE_STATUSES = ['ACTIVE', 'REVOKED', 'EXPIRED'] as const;
export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number];
export const TEMPLATE_TYPES = ['HTML', 'IMAGE'] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true, lowercase: true, trim: true }) email: string;
  @Prop({ required: true }) passwordHash: string;
  @Prop({ required: true, enum: ['ADMIN', 'SUPER_ADMIN'], default: 'ADMIN' }) role: string;
}
export type UserDoc = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true })
export class Event {
  @Prop({ required: true, unique: true, uppercase: true, trim: true }) eventCode: string;
  @Prop({ required: true, trim: true, maxlength: 200 }) name: string;
  @Prop({ default: '', maxlength: 1000 }) description: string;
  @Prop({ required: true, trim: true, maxlength: 200 }) organizationName: string;
  @Prop({ default: 'Certificate of Completion', maxlength: 100 }) certificateTitle: string;
  /** Short code used in certificate numbers, e.g. CUDTN -> WTL-CUDTN-00001. Derived from the event code when empty. */
  @Prop({ uppercase: true, trim: true, maxlength: 6 }) certificateCode?: string;
  @Prop() issueDate?: Date;
  @Prop() expiryDate?: Date;
  @Prop({ required: true, enum: EVENT_STATUSES, default: 'DRAFT', index: true }) status: EventStatus;
  @Prop({ type: Types.ObjectId, ref: 'Template' }) templateId?: Types.ObjectId;
  /** When true, the same phone may be issued more than one certificate for this event. */
  @Prop({ default: false }) allowDuplicates: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type EventDoc = HydratedDocument<Event>;
export const EventSchema = SchemaFactory.createForClass(Event);

@Schema({ timestamps: true })
export class Registration {
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true }) eventId: Types.ObjectId;
  @Prop({ required: true }) fullName: string;
  @Prop({ required: true }) phoneNumber: string;
  @Prop({ required: true }) normalizedPhone: string;
  createdAt: Date;
  updatedAt: Date;
}
export type RegistrationDoc = HydratedDocument<Registration>;
export const RegistrationSchema = SchemaFactory.createForClass(Registration);
// One registration per phone per event; the same phone may register for other events.
RegistrationSchema.index({ eventId: 1, normalizedPhone: 1 }, { unique: true });
RegistrationSchema.index({ normalizedPhone: 1 });
RegistrationSchema.index({ fullName: 1 });

@Schema({ timestamps: true })
export class Certificate {
  @Prop({ type: Types.ObjectId, ref: 'Registration', required: true, index: true }) registrationId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Event', required: true, index: true }) eventId: Types.ObjectId;
  /** Human readable, e.g. WTL-CUDTN-00001. */
  @Prop({ required: true, unique: true }) certificateNumber: string;
  /** Unguessable public identifier used in verification URLs / QR codes. */
  @Prop({ required: true, unique: true }) certificateId: string;
  @Prop({ required: true }) recipientName: string;
  @Prop({ required: true }) normalizedPhone: string; // private: admin only
  // Snapshot of event data so issued certificates never change retroactively.
  @Prop({ required: true }) eventName: string;
  @Prop({ default: '' }) eventDescription: string;
  @Prop({ required: true }) organizationName: string;
  @Prop({ required: true }) certificateTitle: string;
  @Prop() issueDate?: Date;
  @Prop({ type: Types.ObjectId, ref: 'Template' }) templateId?: Types.ObjectId;
  @Prop({ required: true, enum: CERTIFICATE_STATUSES, default: 'ACTIVE', index: true }) status: CertificateStatus;
  @Prop({ required: true, default: () => new Date() }) issuedAt: Date;
  @Prop() expiryDate?: Date;
  @Prop({ enum: ['PENDING', 'READY', 'FAILED'], default: 'PENDING' }) pdfStatus: string;
  @Prop() pdfKey?: string;
  @Prop() previewKey?: string;
  @Prop() pdfUrl?: string;
  @Prop({ required: true }) verificationUrl: string;
  @Prop() revokedAt?: Date;
  /** Set to the registration id when duplicates are disallowed; the unique sparse index makes concurrent issuance safe. */
  @Prop() singleKey?: string;
  createdAt: Date;
  updatedAt: Date;
}
export type CertificateDoc = HydratedDocument<Certificate>;
export const CertificateSchema = SchemaFactory.createForClass(Certificate);
CertificateSchema.index({ recipientName: 1 });
CertificateSchema.index({ normalizedPhone: 1 });
CertificateSchema.index({ createdAt: -1 });
CertificateSchema.index({ singleKey: 1 }, { unique: true, sparse: true });

@Schema({ timestamps: true })
export class Template {
  @Prop({ required: true, trim: true }) name: string;
  @Prop({ required: true, enum: TEMPLATE_TYPES }) type: TemplateType;
  /** HTML: the HTML source. IMAGE: JSON string { backgroundUrl, width, height, fields }. */
  @Prop({ required: true }) templateData: string;
  @Prop({ default: true }) isActive: boolean;
  @Prop({ default: false }) isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
export type TemplateDoc = HydratedDocument<Template>;
export const TemplateSchema = SchemaFactory.createForClass(Template);

/** Atomic counters (certificate numbers per prefix + event code). */
@Schema()
export class Counter {
  @Prop({ required: true }) _id: string;
  @Prop({ default: 0 }) seq: number;
}
export const CounterSchema = SchemaFactory.createForClass(Counter);

/** Runtime settings editable from the admin panel (e.g. the public site URL). */
@Schema({ timestamps: true })
export class Setting {
  @Prop({ required: true }) _id: string;
  @Prop({ required: true }) value: string;
}
export const SettingSchema = SchemaFactory.createForClass(Setting);
