import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../service/product.service';
import { CartService } from '../service/cart.service';
import { Product } from '../model/product';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error = 'Invalid Product ID';
      return;
    }

    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (prod) => {
        this.product = prod;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Product not found';
        this.loading = false;
      }
    });
  }

  handleAddToCart(): void {
    if (!this.product) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      this.notificationService.notify({
        message: 'Please login first!',
        type: 'warning',
        header: 'Add to Cart'
      });
      return;
    }

    if (this.product.availableQuantity <= 0) {
      this.notificationService.notify({
        message: 'Product is out of stock!',
        type: 'warning',
        header: 'Add to Cart'
      });
      return;
    }

    // Add product to cart
    this.cartService.addToCart(user.id, this.product.productId!, 1).subscribe({
      next: () => {
        // Show notification
        this.notificationService.notify({
          message: `${this.product!.title} added to cart!`,
          type: 'success',
          header: 'Cart Update'
        });
        this.product!.availableQuantity -= 1;

        this.productService.decreaseStock(this.product!.productId!, 1).subscribe({
          next: (updatedProduct) => this.product = updatedProduct,
          error: (err) => console.error('Failed to update stock', err)
        });
      },
      error: (err) => {
        console.error(err);
        this.notificationService.notify({
          message: 'Failed to add product to cart!',
          type: 'error',
          header: 'Cart Update'
        });
      }
    });
  }
}
