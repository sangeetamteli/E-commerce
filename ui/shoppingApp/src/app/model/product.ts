export interface Product {
    productId?: number;
    title: string;
    description: string;
    availableQuantity: number;
    price: number;
    imageUrl: string;
    categoryId: number;
    isActive?: boolean;
    createAt?: string;
    updateAt?: string;
}
