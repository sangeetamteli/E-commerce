import { Product } from './product';

describe('Product Interface', () => {
  it('should allow creating a valid product object', () => {
    const product: Product = {
      productId: 1,
      title: 'Test Product',
      description: 'A sample product for testing',
      availableQuantity: 10,
      price: 499.99,
      imageUrl: 'https://example.com/test-product.jpg',
      categoryId: 2,
      isActive: true,
      createAt: new Date().toISOString(),
      updateAt: new Date().toISOString()
    };

    expect(product).toBeTruthy();
    expect(product.title).toBe('Test Product');
  });
});
