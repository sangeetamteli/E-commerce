import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/service/product.service';
import { Product } from 'src/app/model/product';

@Component({
  selector: 'app-admin-products',
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {

  products: Product[] = [];
  editingProduct: Product | null = null;
  isEditMode = false;
  showForm = false;

  notificationMessage: string | null = null;

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.products$.subscribe(products => this.products = products);
    this.productService.loadProducts();
  }

  private showNotification(message: string) {
    this.notificationMessage = message;
    setTimeout(() => this.notificationMessage = null, 3000); // Auto-hide in 3s
  }

  addProduct(): void {
    this.editingProduct = {
      title: '',
      description: '',
      availableQuantity: 0,
      price: 0,
      categoryId: 1,
      isActive: true,
      imageUrl: ''
    };
    this.isEditMode = false;
    this.showForm = true;
  }

  editProduct(product: Product): void {
    this.editingProduct = { ...product };
    this.isEditMode = true;
    this.showForm = true;
  }

  saveProduct(productData: Product): void {
    if (this.isEditMode && this.editingProduct?.productId) {
      this.productService.updateProduct({ ...this.editingProduct, ...productData }).subscribe({
        next: () => {
          this.showNotification('✅ Product updated successfully!');
          this.showForm = false;
          this.editingProduct = null;
        },
        error: (err) => {
          console.error(err);
          this.showNotification('❌ Error updating product!');
        }
      });
    } else {
      this.productService.addProduct(productData).subscribe({
        next: () => {
          this.showNotification('✅ Product added successfully!');
          this.showForm = false;
          this.editingProduct = null;
        },
        error: (err) => {
          console.error(err);
          this.showNotification('❌ Error adding product!');
        }
      });
    }
  }

  cancelForm(): void {
    this.editingProduct = null;
    this.showForm = false;
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure?')) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => this.showNotification('🗑️ Product deleted successfully!'),
        error: (err) => {
          console.error(err);
          this.showNotification('❌ Error deleting product!');
        }
      });
    }
  }
}
