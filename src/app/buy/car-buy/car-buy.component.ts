import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { BuyService } from '../buy.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';
import { Router } from '@angular/router';
import { resolveApiAssetUrl } from 'src/app/shared/api-url.util';

@Component({
  selector: 'app-car-buy',
  imports: [CommonModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './car-buy.component.html',
  styleUrl: './car-buy.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class CarBuyComponent implements OnInit {

  allData: any[] = [];
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  loading = false;
  protected readonly resolveImageUrl = resolveApiAssetUrl;

  constructor(private authService: AuthService, private buyService: BuyService, private router: Router) { }

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

  sendOrder(allData: any) {
    let data = {
      customerId: localStorage.getItem('customer_id'),
      itemsDto: allData.map((item: any) => ({
        modelId: item.model.id
      }))
    };
    
    this.loading = true;
    this.buyService.sendOrder(data).subscribe(() => {
      this.openModal('Sucesso', 'Pedido de locação realizado com sucesso!'); 
      
      this.loading = false;
    });
  }

  closeModal() {
    this.showModal = false;

    this.allData = [];
    localStorage.setItem('cart_items', '0');
    this.router.navigate(['/buy/alugar-carros']);
  }

  private openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

}
