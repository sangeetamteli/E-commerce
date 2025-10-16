import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Product } from '../model/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';
  private allProducts: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadProducts(): void {
    this.http.get<Product[]>(`${this.apiUrl}/get-products`).subscribe({
      next: (products: Product[]) => {
        this.allProducts = products;
        this.productsSubject.next([...this.allProducts]);
      },
      error: (err) => {
        console.error('Error loading products', err);
      }
    });
  }

  applyFilter(criteria: { category?: number | null; min?: number | null; max?: number | null; search?: string }): void {
    const filtered = this.allProducts.filter(product => {
      const matchesCategory = (criteria.category != null && criteria.category !== 0)
        ? product.categoryId === criteria.category
        : true;
      const matchesMin = criteria.min != null ? product.price >= criteria.min : true;
      const matchesMax = criteria.max != null ? product.price <= criteria.max : true;
      const matchesSearch = criteria.search?.trim()
        ? product.title.toLowerCase().includes(criteria.search.toLowerCase())
        : true;
      return matchesCategory && matchesMin && matchesMax && matchesSearch;
    });
    this.productsSubject.next(filtered);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/get-product/${id}`);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/update-product/${product.productId}`, product).pipe(
      tap((updated) => {
        const idx = this.allProducts.findIndex(p => p.productId === updated.productId);
        if (idx !== -1) {
          this.allProducts[idx] = updated;
          this.productsSubject.next([...this.allProducts]);
        }
      })
    );
  }

  addProduct(product: Product): Observable<Product> {
    const { productId, ...payload } = product;
    return this.http.post<Product>(`${this.apiUrl}/add-product`, payload).pipe(
      tap((newProd) => {
        this.allProducts.push(newProd);
        this.productsSubject.next([...this.allProducts]);
      })
    );
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete-product/${productId}`).pipe(
      tap(() => {
        this.allProducts = this.allProducts.filter(p => p.productId !== productId);
        this.productsSubject.next([...this.allProducts]);
      })
    );
  }

  decreaseStock(productId: number, quantity: number): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/decrease-stock/${productId}?quantity=${quantity}`, {}).pipe(
      tap((updated) => {
        const idx = this.allProducts.findIndex(p => p.productId === updated.productId);
        if (idx !== -1) {
          this.allProducts[idx] = updated;
          this.productsSubject.next([...this.allProducts]);
        }
      })
    );
  }
}
