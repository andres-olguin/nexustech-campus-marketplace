import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CartItem, Favorite, Product, User } from '../database/entities';
import { CartDto, PageQuery } from '../common/dto';
@Injectable()
export class CartService {
  constructor(private readonly db: DataSource) {}
  async cart(userId: string) {
    const items = await this.db.getRepository(CartItem).find({ where: { userId }, order: { productId: 'ASC' } });
    const enriched = await Promise.all(items.map(async item => ({ ...item, product: await this.db.getRepository(Product).findOneBy({ id: item.productId }) })));
    return { items: enriched, total: enriched.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0) };
  }
  async put(userId: string, dto: CartDto) {
    return this.db.transaction(async em => {
      await em.findOneOrFail(User, { where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      const product = await em.findOne(Product, { where: { id: dto.productId, isActive: true }, lock: { mode: 'pessimistic_read' } });
      if (!product) throw new NotFoundException('Producto no encontrado');
      if (product.sellerId === userId) throw new ConflictException('No puedes comprar tu propia publicación');
      if (product.stock < dto.quantity) throw new ConflictException('Stock insuficiente');
      const existing = await em.findOneBy(CartItem, { userId, productId: dto.productId });
      if (!existing && await em.countBy(CartItem, { userId }) >= 100) throw new ConflictException('Máximo 100 productos por carrito');
      return em.save(CartItem, { ...existing, userId, ...dto });
    });
  }
  async remove(userId: string, productId: string) {
    await this.db.transaction(async em => {
      await em.findOneOrFail(User, { where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      await em.delete(CartItem, { userId, productId });
    });
    return { deleted: true };
  }
  async favorites(userId: string, q: PageQuery) {
    const [rows, total] = await this.db.getRepository(Favorite).findAndCount({ where: { userId }, order: { createdAt: 'DESC', id: 'ASC' }, skip: (q.page - 1) * q.limit, take: q.limit });
    const items = await Promise.all(rows.map(async i => ({ ...i, product: await this.db.getRepository(Product).findOneBy({ id: i.productId }) })));
    return { items, total, page: q.page, limit: q.limit };
  }
  async favorite(userId: string, productId: string, remove = false) {
    const repo = this.db.getRepository(Favorite);
    if (remove) { await repo.delete({ userId, productId }); return { deleted: true }; }
    if (!await this.db.getRepository(Product).existsBy({ id: productId, isActive: true })) throw new NotFoundException('Producto no encontrado');
    await repo.upsert({ userId, productId }, ['userId', 'productId']);
    return repo.findOneByOrFail({ userId, productId });
  }
}
