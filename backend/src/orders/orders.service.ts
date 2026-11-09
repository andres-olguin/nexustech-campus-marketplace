import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityEvents } from '../common/activity-events';
import { DataSource, EntityManager, In } from 'typeorm';
import { CartItem, Order, OrderItem, OrderFulfillment, OrderStatus, Product, SimulatedTransaction, User } from '../database/entities';
import { CheckoutDto, PageQuery, FulfillmentStatusDto } from '../common/dto';
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
        await em.save(OrderItem, em.create(OrderItem, { orderId: order.id, productId: product.id, sellerId: product.sellerId, name: product.name, unitPrice: product.price, quantity: item.quantity }));
        product.stock -= item.quantity;
        await em.save(Product, product);
      }
      for (const sellerId of new Set(products.map(p => p.sellerId))) {
        await em.save(OrderFulfillment, em.create(OrderFulfillment, { orderId: order.id, sellerId, status: 'confirmed' }));
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
      const fulfillments = await em.findBy(OrderFulfillment, { orderId: id });
      if (order.status !== 'confirmed' || fulfillments.some(f => f.status !== 'confirmed')) throw new ConflictException('Solo puedes cancelar antes de que algún vendedor inicie preparación');
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
      await em.update(OrderFulfillment, { orderId: id }, { status: 'cancelled' });
      await em.update(SimulatedTransaction, { orderId: id }, { status: 'reversed' });
      return this.details(em, order);
    });
    this.events.publish('order.cancelled', userId, id);
    return result;
  }
  async sellerOrders(sellerId: string, q: PageQuery) {
    const [rows, total] = await this.db.getRepository(OrderFulfillment).findAndCount({ where: { sellerId }, order: { createdAt: 'DESC', id: 'ASC' }, skip: (q.page - 1) * q.limit, take: q.limit });
    const items = await Promise.all(rows.map(async fulfillment => {
      const order = await this.db.getRepository(Order).findOneByOrFail({ id: fulfillment.orderId });
      return this.sellerDetails(this.db.manager, order, sellerId);
    }));
    return { items, total, page: q.page, limit: q.limit };
  }
  async advance(sellerId: string, id: string, dto: FulfillmentStatusDto) {
    const result = await this.db.transaction(async em => {
      // Shared with cancellation and other sellers: serializes all order transitions.
      const order = await em.findOne(Order, { where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!order) throw new NotFoundException('Pedido no encontrado');
      const segments = await em.findBy(OrderFulfillment, { orderId: id });
      const own = segments.find(f => f.sellerId === sellerId);
      if (!own) throw new NotFoundException('Pedido no encontrado');
      const next: Partial<Record<OrderStatus, OrderStatus>> = { confirmed: 'preparing', preparing: 'shipped', shipped: 'delivered' };
      if (order.status === 'cancelled' || next[own.status] !== dto.status) throw new ConflictException('Transición no permitida; avanzar exactamente un estado');
      own.status = dto.status;
      await em.save(OrderFulfillment, own);
      const progress: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
      order.status = progress[Math.min(...segments.map(f => progress.indexOf(f.status)))];
      await em.save(Order, order);
      return this.sellerDetails(em, order, sellerId);
    });
    this.events.publish('order.fulfillment.updated', sellerId, id, { sellerId, status: dto.status, orderStatus: result.orderStatus });
    return result;
  }
  private async sellerDetails(em: EntityManager, order: Order, sellerId: string) {
    const items = await em.find(OrderItem, { where: { orderId: order.id, sellerId }, order: { id: 'ASC' } });
    const fulfillment = await em.findOneByOrFail(OrderFulfillment, { orderId: order.id, sellerId });
    // Do not disclose other sellers' items, overall total, buyer identity or payment data.
    return { id: order.id, createdAt: order.createdAt, orderStatus: order.status, shippingAddress: order.shippingAddress,
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), items, fulfillment };
  }
  private async details(em: EntityManager, order: Order) {
    // A transaction owns one pg connection; avoid concurrent query() calls on that client.
    const items = await em.find(OrderItem, { where: { orderId: order.id }, order: { id: 'ASC' } });
    const transactions = await em.findBy(SimulatedTransaction, { orderId: order.id });
    const fulfillments = await em.find(OrderFulfillment, { where: { orderId: order.id }, order: { sellerId: 'ASC' } });
    return { ...order, items, transactions, fulfillments };
  }
}
