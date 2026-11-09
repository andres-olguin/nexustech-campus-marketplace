import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export abstract class RecordEntity {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt!: Date;
}
@Entity('users')
export class User extends RecordEntity {
  @Column({ unique: true }) email!: string;
  @Column({ select: false }) passwordHash!: string;
  @Column() name!: string;
}
@Entity('buyer_profiles')
export class BuyerProfile extends RecordEntity {
  @Column({ type: 'uuid', unique: true }) userId!: string;
}
@Entity('seller_profiles')
export class SellerProfile extends RecordEntity {
  @Column({ type: 'uuid', unique: true }) userId!: string;
  @Column() displayName!: string;
}
@Entity('categories')
export class Category extends RecordEntity {
  @Column({ unique: true }) name!: string;
  @Column({ type: 'uuid' }) ownerId!: string;
}
@Entity('products')
export class Product extends RecordEntity {
  @Column() name!: string;
  @Column({ type: 'text' }) description!: string;
  @Column({ type: 'uuid' }) categoryId!: string;
  @Column({ type: 'uuid' }) sellerId!: string;
  @Column({ type: 'integer' }) price!: number;
  @Column({ type: 'integer' }) stock!: number;
  @Column({ type: 'text', nullable: true }) imageUrl!: string | null;
  @Column({ default: true }) isActive!: boolean;
  @UpdateDateColumn({ type: 'timestamptz' }) updatedAt!: Date;
}
@Entity('cart_items')
@Index(['userId', 'productId'], { unique: true })
export class CartItem extends RecordEntity {
  @Column({ type: 'uuid' }) userId!: string;
  @Column({ type: 'uuid' }) productId!: string;
  @Column({ type: 'integer' }) quantity!: number;
}
@Entity('favorites')
@Index(['userId', 'productId'], { unique: true })
export class Favorite extends RecordEntity {
  @Column({ type: 'uuid' }) userId!: string;
  @Column({ type: 'uuid' }) productId!: string;
}
export type OrderStatus = 'confirmed' | 'cancelled';
@Entity('orders')
@Index(['userId', 'idempotencyKey'], { unique: true })
export class Order extends RecordEntity {
  @Column({ type: 'uuid' }) userId!: string;
  @Column({ type: 'varchar', default: 'confirmed' }) status!: OrderStatus;
  @Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } }) total!: number;
  @Column({ type: 'text' }) shippingAddress!: string;
  @Column() idempotencyKey!: string;
}
@Entity('order_items')
export class OrderItem extends RecordEntity {
  @Column({ type: 'uuid' }) orderId!: string;
  @Column({ type: 'uuid' }) productId!: string;
  @Column() name!: string;
  @Column({ type: 'integer' }) unitPrice!: number;
  @Column({ type: 'integer' }) quantity!: number;
}
@Entity('simulated_transactions')
export class SimulatedTransaction extends RecordEntity {
  @Column({ type: 'uuid', unique: true }) orderId!: string;
  @Column({ default: 'approved' }) status!: 'approved' | 'reversed';
  @Column({ default: 'simulation' }) provider!: string;
  @Column({ type: 'bigint', transformer: { to: (v: number) => v, from: (v: string) => Number(v) } }) amount!: number;
}
export const entities = [User, BuyerProfile, SellerProfile, Category, Product, CartItem, Favorite, Order, OrderItem, SimulatedTransaction];
