import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getConfig } from '../config/config';
import {
  Certificate, CertificateSchema, Counter, CounterSchema, Event, EventSchema,
  Registration, RegistrationSchema, Setting, SettingSchema, Template, TemplateSchema, User, UserSchema,
} from './schemas';

const models = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
  { name: Event.name, schema: EventSchema },
  { name: Registration.name, schema: RegistrationSchema },
  { name: Certificate.name, schema: CertificateSchema },
  { name: Template.name, schema: TemplateSchema },
  { name: Counter.name, schema: CounterSchema },
  { name: Setting.name, schema: SettingSchema },
]);

@Global()
@Module({
  imports: [MongooseModule.forRootAsync({ useFactory: () => ({ uri: getConfig().databaseUrl, autoIndex: true }) }), models],
  exports: [models],
})
export class DatabaseModule {}
