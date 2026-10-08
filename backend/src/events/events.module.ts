import { Module } from '@nestjs/common';
import { AdminEventsController, PublicEventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [PublicEventsController, AdminEventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
