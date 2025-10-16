import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/model/order/order';
import { OrderService } from 'src/app/service/order.service';
import { NotificationService } from 'src/app/notification.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.error = 'Failed to load orders.';
        this.loading = false;
      }
    });
  }

  updateStatus(orderId: number, status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    this.orderService.updateOrderStatus(orderId, status).subscribe({
      next: (response) => {
        console.log('✅ Backend response:', response);
        this.notificationService.notify({
          message: `Order ${orderId} updated to ${status}`,
          type: 'success',
          header: 'Order Update',
        });
        this.loadOrders();
      },
      error: (err) => {
        console.error('❌ Failed to update order:', err);
        this.notificationService.notify({
          message: `Failed to update order ${orderId}`,
          type: 'error',
          header: 'Order Update',
        });
      },
    });
  }

  onStatusChange(event: Event, orderId: number) {
    const newStatus = (event.target as HTMLSelectElement).value.toUpperCase() as
      'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    this.updateStatus(orderId, newStatus);
  }

}
