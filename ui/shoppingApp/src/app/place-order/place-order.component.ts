import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderService } from '../service/order.service';
import { NotificationService } from '../notification.service';
import { CartItemDTO } from '../model/cart-item-dto';
import { Order } from '../model/order/order';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.scss']
})
export class PlaceOrderComponent implements OnInit {
  cart: CartItemDTO[] = [];
  totalPrice = 0;

  orderData = { address: '', paymentMethod: '' };

  contactDetails = {
    fullName: '',
    phoneNumber: '',
    email: ''
  };

  selectedUser: any;
  orderSuccess = false;
  placedOrderTotal = 0;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (!user) {
      this.notificationService.notify({
        message: 'Please log in to place an order.',
        type: 'warning',
        header: 'Login Required'
      });
      this.router.navigate(['/login']);
      return;
    }

    this.selectedUser = JSON.parse(user);
    this.contactDetails.fullName = this.selectedUser?.name || '';
    this.contactDetails.email = this.selectedUser?.email || '';

    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as {
      cartItems?: CartItemDTO[];
      totalPrice?: number;
      userId?: number;
    };

    if (state?.cartItems && state?.cartItems.length > 0) {
      this.cart = state.cartItems;
      this.totalPrice = state.totalPrice || 0;
    } else {
      // fallback if navigated directly without state
      this.loadCart();
    }
  }

  loadCart() {
    this.cartService.getCart(this.selectedUser.id).subscribe({
      next: (items) => {
        this.cart = items || [];
        this.calculateTotal();
      },
      error: (err) => console.error('Failed to load cart:', err)
    });
  }

  calculateTotal() {
    this.totalPrice = this.cart.reduce((sum, item) => sum + item.subtotal, 0);
  }

  placeOrder() {
    if (!this.cart.length) {
      return this.notificationService.notify({
        message: 'Your cart is empty.',
        type: 'warning',
        header: 'Cart Error'
      });
    }

    if (!this.orderData.address.trim()) {
      return this.notificationService.notify({
        message: 'Please enter a delivery address.',
        type: 'warning',
        header: 'Missing Address'
      });
    }
    const orderPayload: Order = {
      userId: this.selectedUser.id,
      deliveryAddress: this.orderData.address,
      paymentMethod: this.orderData.paymentMethod,
      totalAmount: this.totalPrice,
      items: this.cart.map((item: CartItemDTO) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.subtotal,
        productName: item.title
      })),
      status: 'PENDING'
    };


    this.orderService.placeOrder(orderPayload).subscribe({
      next: () => {
        this.orderSuccess = true;
        this.placedOrderTotal = this.totalPrice;

        this.notificationService.notify({
          message: 'Order placed successfully!',
          type: 'success',
          header: 'Success'
        });

        this.cartService.clearCart(this.selectedUser.id).subscribe(() => {
          this.cart = [];
          this.totalPrice = 0;
        });
      },
      error: (err) => {
        console.error('❌ Order placement failed:', err);
        this.notificationService.notify({
          message: 'Failed to place order. Try again.',
          type: 'error',
          header: 'Order Error'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
