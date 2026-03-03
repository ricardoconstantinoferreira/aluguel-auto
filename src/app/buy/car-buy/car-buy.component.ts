import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { BuyService } from '../buy.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

@Component({
  selector: 'app-car-buy',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './car-buy.component.html',
  styleUrl: './car-buy.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class CarBuyComponent implements OnInit {

  allData: any[] = [];

  constructor(private authService: AuthService, private buyService: BuyService) { }

  ngOnInit(): void {
    this.buyService.getCartItems().subscribe(items => {
      this.allData = items as any[];
    }); 

    registerLocaleData(localePt);
  }

  cartItemsCount(): number {
    return this.authService.cartItemsCount;
  }

  cartItems() {
    return this.authService.cartItems;
  }

  removeFromCart(itemId: number): void {
    this.buyService.removeFromCart(itemId).subscribe(() => {
      this.allData = this.allData.filter(item => item.model.id !== itemId);
      let count = localStorage.getItem('cart_items');
    
      if (count) {
        let newCount = parseInt(count) - 1;
        localStorage.setItem('cart_items', newCount.toString());
      }
    });
  }

}
