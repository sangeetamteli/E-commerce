import { Component, OnInit } from '@angular/core';
import { CartService } from '../service/cart.service';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';
import { CartItemDTO } from '../model/cart-item-dto';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItemDTO[] = [];
  totalPrice = 0;
  userId!: number;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id;

    if (this.userId) {
      this.loadCart();
    }
  }

  loadCart(): void {
    this.cartService.getCart(this.userId).subscribe({
      next: items => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: err => console.error('Failed to load cart', err)
    });
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  }

  saveCart(): void {
    // Save updated cart to backend/local storage
    this.cartService.updateCart(this.userId, this.cartItems).subscribe({
      next: items => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: err => console.error('Failed to update cart', err)
    });
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(this.userId, productId).subscribe({
      next: items => {
        this.cartItems = items;
        this.calculateTotal();
        this.notificationService.notify({ message: 'Item removed from cart', type: 'info', header: 'Cart Update' });
      },
      error: err => this.notificationService.notify({ message: 'Failed to remove item', type: 'error', header: 'Cart Update' })
    });
  }

  clearCart(): void {
    this.cartService.clearCart(this.userId).subscribe({
      next: () => {
        this.cartItems = [];
        this.totalPrice = 0;
        this.notificationService.notify({ message: 'Cart cleared', type: 'warning', header: 'Cart Update' });
      },
      error: err => this.notificationService.notify({ message: 'Failed to clear cart', type: 'error', header: 'Cart Update' })
    });
  }

  placeOrder(): void {
    if (this.cartItems.length === 0) {
      this.notificationService.notify({ message: 'Your cart is empty!', type: 'warning', header: 'Cart' });
      return;
    }

    // Save current cart state before navigating
    this.saveCart();

    this.router.navigate(['/place-order'], {
      state: { cartItems: this.cartItems, totalPrice: this.totalPrice, userId: this.userId }
    });
  }
  increaseQuantity(item: CartItemDTO): void {
    item.quantity += 1;
    item.subtotal = item.quantity * item.price;
    this.calculateTotal();

    this.cartService.updateCart(this.userId, this.cartItems).subscribe({
      next: (items: CartItemDTO[]) => this.cartItems = items,
      error: (err: any) => console.error('Failed to update cart', err)
    });
  }

  decreaseQuantity(item: CartItemDTO): void {
    if (item.quantity > 1) {
      item.quantity -= 1;
      item.subtotal = item.quantity * item.price;
      this.calculateTotal();

      this.cartService.updateCart(this.userId, this.cartItems).subscribe({
        next: (items: CartItemDTO[]) => this.cartItems = items,
        error: (err: any) => console.error('Failed to update cart', err)
      });
    }
  }
}