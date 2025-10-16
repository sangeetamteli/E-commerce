import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CartItemDTO } from '../model/cart-item-dto';

@Injectable({ providedIn: 'root' })
export class CartService {
  private apiUrl = 'http://localhost:8080/api/products/cart';

  // Live cart items
  private _cartItems$ = new BehaviorSubject<CartItemDTO[]>([]);
  cartItems$ = this._cartItems$.asObservable();

  constructor(private http: HttpClient) { }

  getCart(userId: number): Observable<CartItemDTO[]> {
    return this.http.get<CartItemDTO[]>(`${this.apiUrl}/view?userId=${userId}`);
  }

  addToCart(userId: number, productId: number, quantity: number): Observable<CartItemDTO[]> {
    return this.http.post<CartItemDTO[]>(`${this.apiUrl}/add`, { userId, productId, quantity });
  }

  removeFromCart(userId: number, productId: number): Observable<CartItemDTO[]> {
    return this.http.delete<CartItemDTO[]>(`${this.apiUrl}/remove?userId=${userId}&productId=${productId}`);
  }

  clearCart(userId: number): Observable<CartItemDTO[]> {
    return this.http.delete<CartItemDTO[]>(`${this.apiUrl}/clear?userId=${userId}`);
  }

  updateCart(userId: number, items: CartItemDTO[]): Observable<CartItemDTO[]> {
    return this.http.put<CartItemDTO[]>(`${this.apiUrl}/update?userId=${userId}`, items).pipe(
      tap(updatedItems => this._cartItems$.next(updatedItems))
    );
  }

  refreshCart(userId: number): void {
    this.getCart(userId).subscribe(items => this._cartItems$.next(items));
  }
}