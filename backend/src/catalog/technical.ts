import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsObject, IsString, MaxLength, Validate, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { fields, profiles } from './facet-contract';

export type SpecValue = string | number | string[];
const sources = new Set(Object.entries(fields).map(([key, rule]) => rule === 'exact' ? key : rule.source));
const numeric = new Set(Object.values(fields).flatMap(rule => rule !== 'exact' && rule.mode !== 'exact' ? [rule.source] : []));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);
const goodText = (v: unknown): v is string =>
  typeof v === 'string' && v.trim() === v && v.length > 0 && v.length <= 100 && !/[\u0000-\u001f\u007f]/.test(v);
const goodNumber = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 1e9;
const comparable = (v: string) => v.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

@ValidatorConstraint({ name: 'technicalValues' })
class TechnicalValuesValidator implements ValidatorConstraintInterface {
  validate(value: unknown) {
    return isRecord(value) && Object.entries(value).every(([key, v]) =>
      sources.has(key) && (numeric.has(key) ? goodNumber(v) :
        goodText(v) || goodNumber(v) ||
        Array.isArray(v) && v.length >= 1 && v.length <= 16 && v.every(goodText) && new Set(v.map(comparable)).size === v.length));
  }
  defaultMessage() { return 'Los atributos técnicos deben usar claves conocidas y valores válidos'; }
}

export class TechnicalDto {
  @ApiProperty({ enum: [...profiles] }) @IsIn(profiles) profile!: typeof profiles[number];
  @ApiProperty({ maxLength: 1500, description: 'Ficha técnica declarada por el vendedor' })
  @IsString() @MaxLength(1500) text!: string;
  @ApiProperty({
    type: 'object',
    additionalProperties: { oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'array', items: { type: 'string' } }] },
    example: { ramGb: 16, ramType: 'DDR4', ramSpeed: 3200 },
  })
  @IsObject() @Validate(TechnicalValuesValidator) values!: Record<string, SpecValue>;
}

export function parseFacets(encoded?: string) {
  if (!encoded) return [];
  let value: unknown;
  try { value = JSON.parse(encoded); } catch { throw new BadRequestException('Filtros técnicos inválidos'); }
  if (!isRecord(value) || Object.keys(value).length > 24) throw new BadRequestException('Filtros técnicos inválidos');
  return Object.entries(value).map(([key, selected]) => {
    if (!Object.hasOwn(fields, key) || !goodText(selected)) throw new BadRequestException('Filtro técnico inválido');
    const rule = fields[key];
    const source = rule === 'exact' ? key : rule.source;
    const mode = rule === 'exact' ? 'exact' : rule.mode;
    if (numeric.has(source)) {
      const n = Number(selected);
      if (!goodNumber(n)) throw new BadRequestException('Valor numérico de filtro inválido');
      return { source, mode, number: n, selected };
    }
    return { source, mode, selected, number: null };
  });
}
