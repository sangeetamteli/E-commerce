import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Order } from '../model/order/order';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private apiUrl = 'http://localhost:8080/api/orders';
  /*y behaviour.. -> multiple components depends on this whenever their is updation in orders , all components get updated 
  automatically. asObservable()->all components can listen to changes but they cant modify directly*/
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  orders$ = this.ordersSubject.asObservable();

  constructor(private http: HttpClient) { }

  placeOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/place`, order).pipe(
      tap(newOrder => {
        const currentOrders = this.ordersSubject.getValue();
        this.ordersSubject.next([...currentOrders, newOrder]);
      })
    );
  }

  getOrdersByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user/${userId}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/all`).pipe(
      tap(orders => this.ordersSubject.next(orders))
    );
  }
  updateOrderStatus(
    orderId: number,
    status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  ): Observable<string> {
    return this.http.put(`${this.apiUrl}/${orderId}/status`, { status }, { responseType: 'text' }).pipe(
      tap(() => {
        const updatedOrders = this.ordersSubject.getValue().map(order => {
          if (order.orderId === orderId) {
            order.status = status;
          }
          return order;
        });
        this.ordersSubject.next(updatedOrders);
      })
    );
  }

  refreshOrders(): void {
    this.getAllOrders().subscribe();
  }
}
