import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ActivityEvents } from '../common/activity-events';
import { Category, Product } from '../database/entities';
import { CatalogQuery, CategoryDto, ProductDto, UpdateProductDto } from '../common/dto';
import { parseFacets, SpecValue } from './technical';

const sorts: Record<string, [string, 'ASC' | 'DESC']> = {
  default: ['p.createdAt', 'DESC'],
  'price-asc': ['p.price', 'ASC'],
  'price-desc': ['p.price', 'DESC'],
  'name-asc': ['p.name', 'ASC'],
  'name-desc': ['p.name', 'DESC'],
};

@Injectable()
export class CatalogService {
  constructor(private readonly db: DataSource, private readonly events: ActivityEvents) {}
  categories() { return this.db.getRepository(Category).find({ order: { name: 'ASC' } }); }
  createCategory(userId: string, dto: CategoryDto) { return this.db.getRepository(Category).save({ name: dto.name.trim(), ownerId: userId }); }
  async updateCategory(userId: string, id: string, dto?: CategoryDto) {
    const repo = this.db.getRepository(Category);
    const category = await repo.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (category.ownerId !== userId) throw new ForbiddenException('Solo el creador puede modificar esta categoría');
    if (dto) return repo.save({ ...category, name: dto.name.trim() });
    await repo.remove(category);
    return { deleted: true };
  }
  private baseQuery(q: CatalogQuery) {
    if (q.minPrice !== undefined && q.maxPrice !== undefined && q.minPrice > q.maxPrice) throw new BadRequestException('Rango de precio inválido');
    const query = this.db.getRepository(Product).createQueryBuilder('p').where('p.isActive = true');
    if (q.search) query.andWhere(
      "(p.name ILIKE :search OR p.description ILIKE :search OR p.technical->>'text' ILIKE :search OR EXISTS (SELECT 1 FROM categories c WHERE c.id = p.\"categoryId\" AND c.name ILIKE :search))",
      { search: `%${q.search.replace(/[\\%_]/g, '\\$&')}%` },
    );
    if (q.categoryId) query.andWhere('p.categoryId = :categoryId', { categoryId: q.categoryId });
    if (q.minPrice !== undefined) query.andWhere('p.price >= :minPrice', { minPrice: q.minPrice });
    if (q.maxPrice !== undefined) query.andWhere('p.price <= :maxPrice', { maxPrice: q.maxPrice });
    if (q.profile) query.andWhere("p.technical->>'profile' = :profile", { profile: q.profile });
    return query;
  }
  async list(q: CatalogQuery) {
    const query = this.baseQuery(q);
    parseFacets(q.facets).forEach(({ source, mode, number, selected }, i) => {
      const attr = `jsonb_extract_path(p.technical, 'values', :key${i})`;
      query.setParameter(`key${i}`, source);
      if (number !== null) {
        const op = mode === 'min' ? '>=' : mode === 'max' ? '<=' : '=';
        query.andWhere(`CASE WHEN jsonb_typeof(${attr}) = 'number' THEN (${attr} #>> '{}')::numeric ${op} :value${i} ELSE false END`,
          { [`value${i}`]: number });
      } else {
        query.andWhere(`EXISTS (SELECT 1 FROM jsonb_array_elements_text(CASE WHEN jsonb_typeof(${attr}) = 'array' THEN ${attr} ELSE jsonb_build_array(${attr}) END) AS spec(value)
          WHERE lower(spec.value) = lower(:value${i}))`, { [`value${i}`]: selected });
      }
    });
    const [column, direction] = Object.hasOwn(sorts, q.sort || '') ? sorts[q.sort!] : sorts.default;
    const [items, total] = await query.orderBy(column, direction).addOrderBy('p.id', 'ASC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount();
    return { items, total, page: q.page, limit: q.limit };
  }
  async facets(q: CatalogQuery) {
    const [sql, params] = this.baseQuery(q).andWhere('p.technical IS NOT NULL')
      .select('p.technical', 'technical').getQueryAndParameters();
    // Se devuelven hasta 40 valores distintos por campo, sin descargar el catálogo.
    return this.db.query<{ key: string; value: Exclude<SpecValue, string[]>; count: number }[]>(`
      SELECT key, value, count FROM (
        SELECT key, value, count, row_number() OVER (PARTITION BY key ORDER BY count DESC, value) AS rank
        FROM (
          SELECT field.key, choice.value, count(*)::int AS count
          FROM (${sql}) AS products
          CROSS JOIN LATERAL jsonb_each(products.technical->'values') AS field(key, value)
          CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(field.value) = 'array' THEN field.value ELSE jsonb_build_array(field.value) END) AS choice(value)
          GROUP BY field.key, choice.value
        ) AS grouped
      ) AS options WHERE rank <= 40 ORDER BY key, rank
    `, params);
  }
  async get(id: string) {
    const product = await this.db.getRepository(Product).findOneBy({ id, isActive: true });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  async create(userId: string, dto: ProductDto) {
    return this.db.transaction(async em => {
      const product = await em.save(Product, em.create(Product, { ...dto, sellerId: userId }));
      await this.events.enqueue(em, 'product.created', userId, product.id);
      return product;
    });
  }
  async update(userId: string, id: string, dto?: UpdateProductDto) {
    const product = await this.db.transaction(async em => {
      const product = await em.findOne(Product, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!product) throw new NotFoundException('Producto no encontrado');
      if (product.sellerId !== userId) throw new ForbiddenException('Solo el vendedor puede modificar el producto');
      Object.assign(product, dto ?? { isActive: false });
      const saved = await em.save(Product, product);
      await this.events.enqueue(em, 'product.updated', userId, id);
      return saved;
    });

    return dto ? product : { deleted: true };
  }
}
