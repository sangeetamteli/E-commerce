export interface Order {
    orderId?: number;
    userId: number;
    deliveryAddress: string;
    paymentMethod: string;
    totalAmount: number;
    items: {
        productId: number;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
        productName?: string;
    }[];
    status?: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
