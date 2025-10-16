import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { OrderService } from 'src/app/service/order.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  stats = {
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0
  };

  currentRoute: string = '';
  showOrderStats: boolean = false;

  constructor(private router: Router, private orderService: OrderService) { }

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
        // Show order stats only when /admin/orders page is open
        this.showOrderStats = this.currentRoute === '/admin/orders';
        if (this.showOrderStats) {
          this.loadOrderStats();
        }
      });
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  loadOrderStats() {
    this.orderService.getAllOrders().subscribe((orders: any[]) => {
      this.stats.total = orders.length;
      this.stats.pending = orders.filter(o => o.status === 'PENDING').length;
      this.stats.shipped = orders.filter(o => o.status === 'SHIPPED').length;
      this.stats.delivered = orders.filter(o => o.status === 'DELIVERED').length;
      this.stats.cancelled = orders.filter(o => o.status === 'CANCELLED').length;

      const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
      this.stats.totalRevenue = deliveredOrders.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      );
    });
  }
}
