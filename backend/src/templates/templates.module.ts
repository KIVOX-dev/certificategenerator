import { Body, Controller, Get, Injectable, Module, Param, Post, Put, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { z } from 'zod';
import { zodBody } from '../common/zod.pipe';
import { AdminGuard } from '../auth/admin.guard';
import { AppException } from '../common/app.exception';
import { Template, TEMPLATE_TYPES } from '../database/schemas';

const templateSchema = z.object({ name: z.string().trim().min(2).max(100), type: z.enum(TEMPLATE_TYPES), templateData: z.string().min(2).max(2_000_000), isActive: z.boolean().optional(), isDefault: z.boolean().optional() }).strict();
type TemplateDto = z.infer<typeof templateSchema>;

@Injectable()
export class TemplatesService {
  constructor(@InjectModel(Template.name) private templates: Model<Template>) {}

  private view(t: any, withData = false) {
    return {
      id: String(t._id), name: t.name, type: t.type, isActive: t.isActive, isDefault: t.isDefault, updatedAt: t.updatedAt,
      ...(withData ? { templateData: t.templateData } : {}),
    };
  }

  async list() {
    return (await this.templates.find().sort({ createdAt: 1 })).map((t) => this.view(t));
  }

  async get(id: string) {
    const t = isValidObjectId(id) ? await this.templates.findById(id) : null;
    if (!t) throw new AppException('NOT_FOUND', 'Template not found.', 404);
    return this.view(t, true);
  }

  async create(dto: TemplateDto) {
    if (dto.type === 'IMAGE') this.assertJson(dto.templateData);
    if (dto.isDefault) await this.templates.updateMany({}, { isDefault: false });
    return this.view(await this.templates.create(dto), true);
  }

  async update(id: string, dto: Partial<TemplateDto>) {
    const t = isValidObjectId(id) ? await this.templates.findById(id) : null;
    if (!t) throw new AppException('NOT_FOUND', 'Template not found.', 404);
    if ((dto.type ?? t.type) === 'IMAGE' && dto.templateData) this.assertJson(dto.templateData);
    if (dto.isDefault) await this.templates.updateMany({ _id: { $ne: t._id } }, { isDefault: false });
    Object.assign(t, dto);
    await t.save();
    return this.view(t, true);
  }

  private assertJson(s: string) {
    try { JSON.parse(s); } catch { throw new AppException('VALIDATION_ERROR', 'IMAGE template data must be valid JSON.', 400); }
  }
}

@Controller('admin/templates')
@UseGuards(AdminGuard)
export class TemplatesController {
  constructor(private svc: TemplatesService) {}
  @Get() list() { return this.svc.list(); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.get(id); }
  @Post() create(@Body(zodBody(templateSchema)) dto: TemplateDto) { return this.svc.create(dto); }
  @Put(':id') update(@Param('id') id: string, @Body(zodBody(templateSchema.partial())) dto: Partial<TemplateDto>) { return this.svc.update(id, dto); }
}

@Module({ controllers: [TemplatesController], providers: [TemplatesService] })
export class TemplatesModule {}
