import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { z } from 'zod';
import { zodBody } from '../common/zod.pipe';
import { createEventSchema, updateEventSchema } from './events.dto';
import { EventsService } from './events.service';

@Controller('events')
export class PublicEventsController {
  constructor(private events: EventsService) {}

  @Get(':eventCode')
  get(@Param('eventCode') code: string) {
    return this.events.publicByCode(code);
  }
}

@Controller('admin/events')
@UseGuards(AdminGuard)
export class AdminEventsController {
  constructor(private events: EventsService) {}

  @Post()
  create(@Body(zodBody(createEventSchema)) dto: z.infer<typeof createEventSchema>) {
    return this.events.create(dto as any);
  }

  @Get()
  list(@Query('q') q?: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.events.list(q, Math.max(1, +page || 1), Math.min(100, Math.max(1, +limit || 20)));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.events.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body(zodBody(updateEventSchema)) dto: z.infer<typeof updateEventSchema>) {
    return this.events.update(id, dto as any);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }
}
