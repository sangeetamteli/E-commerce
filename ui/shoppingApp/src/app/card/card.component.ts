import { Component, Input } from '@angular/core';
import { Product } from '../model/product';
import { CartService } from '../service/cart.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html'
})
export class CardComponent {

  @Input() product!: Product; // ! = definite assignment assertion operation
  @Input() selectedUser!: any;

  constructor(private cartService: CartService) { }

  viewDetailsEvent(productId: number) {
    console.log('View details for', productId);
  }

  onAddToCart(event: Event) {
    event.stopPropagation();

    if (!this.product.productId || !this.selectedUser?.id) {
      console.error('Missing productId or userId');
      return;
    }

    this.cartService.addToCart(
      this.selectedUser.id,
      this.product.productId!,
      1      //quantity                     
    ).subscribe({
      next: (cart) => {
        console.log('Added to cart', cart);
        alert(`${this.product.title} added to cart!`);
      },
      error: (err) => {
        console.error('Error adding to cart', err);
        alert('Failed to add product to cart');
      }
    });
  }
}

