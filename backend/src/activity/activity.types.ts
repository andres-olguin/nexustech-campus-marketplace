import { ObjectId } from 'mongodb';

export interface ActivityLogDocument {
  _id?: ObjectId;
  eventId?: string;
  eventName: string;
  userId: string;
  resourceId: string;
  occurredAt: string;
  metadata?: {
    sellerId?: string;
    status?: string;
    orderStatus?: string;
    [key: string]: unknown;
  };
}

export interface InteractionDocument {
  _id?: ObjectId;
  targetId: string; // ID del producto o pedido
  targetType: 'product' | 'order';
  senderId: string; // ID del comprador o vendedor
  receiverId: string;
  message: string;
  createdAt: string;
}
