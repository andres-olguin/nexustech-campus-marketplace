import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ActivityEvents } from '../common/activity-events';
import { Category, Product } from '../database/entities';
import { CatalogQuery, CategoryDto, ProductDto, UpdateProductDto } from '../common/dto';
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
  async list(q: CatalogQuery) {
    if (q.minPrice !== undefined && q.maxPrice !== undefined && q.minPrice > q.maxPrice) throw new BadRequestException('Rango de precio inválido');
    const query = this.db.getRepository(Product).createQueryBuilder('p').where('p.isActive = true');
    if (q.search) query.andWhere('(p.name ILIKE :search OR p.description ILIKE :search)', { search: `%${q.search.replace(/[\\%_]/g, '\\$&')}%` });
    if (q.categoryId) query.andWhere('p.categoryId = :categoryId', { categoryId: q.categoryId });
    if (q.minPrice !== undefined) query.andWhere('p.price >= :minPrice', { minPrice: q.minPrice });
    if (q.maxPrice !== undefined) query.andWhere('p.price <= :maxPrice', { maxPrice: q.maxPrice });
    const [items, total] = await query.orderBy('p.createdAt', 'DESC').addOrderBy('p.id', 'ASC').skip((q.page - 1) * q.limit).take(q.limit).getManyAndCount();
    return { items, total, page: q.page, limit: q.limit };
  }
  async get(id: string) {
    const product = await this.db.getRepository(Product).findOneBy({ id, isActive: true });
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }
  async create(userId: string, dto: ProductDto) {
    const product = await this.db.getRepository(Product).save({ ...dto, sellerId: userId });
    this.events.publish('product.created', userId, product.id);
    return product;
  }
  async update(userId: string, id: string, dto?: UpdateProductDto) {
    const product = await this.db.transaction(async em => {
      const product = await em.findOne(Product, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!product) throw new NotFoundException('Producto no encontrado');
      if (product.sellerId !== userId) throw new ForbiddenException('Solo el vendedor puede modificar el producto');
      Object.assign(product, dto ?? { isActive: false });
      return em.save(Product, product);
    });
    this.events.publish('product.updated', userId, id);
    return dto ? product : { deleted: true };
  }
}
