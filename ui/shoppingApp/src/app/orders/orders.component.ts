import { Component, OnInit } from '@angular/core';
import { OrderService } from '../service/order.service';
import { Order } from '../model/order/order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;
  userId!: number;
  role!: string;

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {
    this.loadUserAndOrders();
  }

  loadUserAndOrders(): void {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      this.error = 'User not logged in';
      this.loading = false;
      return;
    }

    const currentUser = JSON.parse(userJson);
    this.userId = currentUser.id;
    this.role = currentUser.role;

    // Fetch orders based on role
    if (this.role === 'Admin') {
      this.orderService.getAllOrders().subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch admin orders:', err);
          this.error = 'Failed to fetch admin orders.';
          this.loading = false;
        }
      });
    } else {
      this.orderService.getOrdersByUser(this.userId).subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch user orders:', err);
          this.error = 'Failed to fetch your orders.';
          this.loading = false;
        }
      });
    }
  }
}