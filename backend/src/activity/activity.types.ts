export interface ActivityLogDocument {
  _id?: any;
  eventName: string;
  userId: string;
  resourceId: string;
  occurredAt: string;
  metadata?: {
    sellerId?: string;
    status?: string;
    orderStatus?: string;
    [key: string]: any;
  };
}

export interface InteractionDocument {
  _id?: any;
  targetId: string; // ID del producto o pedido
  targetType: 'product' | 'order';
  senderId: string; // ID del comprador o vendedor
  receiverId?: string;
  message: string;
  createdAt: string;
}
