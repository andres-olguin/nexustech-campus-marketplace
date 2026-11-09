import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityEvents } from '../common/activity-events';
import { DataSource, EntityManager, In } from 'typeorm';
import { CartItem, Order, OrderItem, Product, SimulatedTransaction, User } from '../database/entities';
import { CheckoutDto, PageQuery } from '../common/dto';
@Injectable()
export class OrdersService {
  constructor(private readonly db: DataSource, private readonly events: ActivityEvents) {}
  async checkout(userId: string, dto: CheckoutDto) {
    const result = await this.db.transaction(async em => {
      // Same lock as cart writes: serializes checkout and edits, including an empty cart.
      await em.findOneOrFail(User, { where: { id: userId }, lock: { mode: 'pessimistic_write' } });
      const previous = await em.findOneBy(Order, { userId, idempotencyKey: dto.idempotencyKey });
      if (previous) {
        if (previous.shippingAddress !== dto.shippingAddress) throw new ConflictException('Clave de idempotencia reutilizada con otra dirección');
        return { order: await this.details(em, previous), created: false };
      }
      const cart = await em.find(CartItem, { where: { userId }, order: { productId: 'ASC' } });
      if (!cart.length) throw new ConflictException('Carrito vacío');
      // Deterministic lock order across buyers avoids deadlocks over overlapping carts.
      const products = await em.find(Product, { where: { id: In(cart.map(i => i.productId)) }, order: { id: 'ASC' }, lock: { mode: 'pessimistic_write' } });
      const byId = new Map(products.map(p => [p.id, p]));
      let total = 0;
      for (const item of cart) {
        const product = byId.get(item.productId);
        if (!product || !product.isActive || product.sellerId === userId || product.stock < item.quantity) throw new ConflictException('Publicación no disponible o stock insuficiente');
        total += product.price * item.quantity;
      }
      const order = await em.save(Order, em.create(Order, { userId, total, shippingAddress: dto.shippingAddress, idempotencyKey: dto.idempotencyKey, status: 'confirmed' }));
      for (const item of cart) {
        const product = byId.get(item.productId)!;
        await em.save(OrderItem, em.create(OrderItem, { orderId: order.id, productId: product.id, name: product.name, unitPrice: product.price, quantity: item.quantity }));
        product.stock -= item.quantity;
        await em.save(Product, product);
      }
      await em.save(SimulatedTransaction, em.create(SimulatedTransaction, { orderId: order.id, amount: total, provider: 'simulation', status: 'approved' }));
      await em.delete(CartItem, { userId });
      return { order: await this.details(em, order), created: true };
    });
    if (result.created) this.events.publish('order.created', userId, result.order.id);
    return result.order;
  }
  async list(userId: string, q: PageQuery) {
    const [rows, total] = await this.db.getRepository(Order).findAndCount({ where: { userId }, order: { createdAt: 'DESC', id: 'ASC' }, skip: (q.page - 1) * q.limit, take: q.limit });
    return { items: await Promise.all(rows.map(o => this.details(this.db.manager, o))), total, page: q.page, limit: q.limit };
  }
  async get(userId: string, id: string) {
    const order = await this.db.getRepository(Order).findOneBy({ id, userId });
    if (!order) throw new NotFoundException('Pedido no encontrado');
    return this.details(this.db.manager, order);
  }
  async cancel(userId: string, id: string) {
    const result = await this.db.transaction(async em => {
      const order = await em.findOne(Order, { where: { id, userId }, lock: { mode: 'pessimistic_write' } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      if (order.status !== 'confirmed') throw new ConflictException('Pedido ya cancelado');
      const items = await em.findBy(OrderItem, { orderId: id });
      const products = await em.find(Product, { where: { id: In(items.map(i => i.productId)) }, order: { id: 'ASC' }, lock: { mode: 'pessimistic_write' } });
      for (const product of products) {
        const quantity = items.filter(i => i.productId === product.id).reduce((sum, i) => sum + i.quantity, 0);
        if (product.stock + quantity > 100000) throw new ConflictException('Reposición excede límite de inventario');
        product.stock += quantity;
        await em.save(Product, product);
      }
      order.status = 'cancelled';
      await em.save(Order, order);
      await em.update(SimulatedTransaction, { orderId: id }, { status: 'reversed' });
      return this.details(em, order);
    });
    this.events.publish('order.cancelled', userId, id);
    return result;
  }
  private async details(em: EntityManager, order: Order) {
    const [items, transactions] = await Promise.all([
      em.find(OrderItem, { where: { orderId: order.id }, order: { id: 'ASC' } }),
      em.findBy(SimulatedTransaction, { orderId: order.id }),
    ]);
    return { ...order, items, transactions };
  }
}
