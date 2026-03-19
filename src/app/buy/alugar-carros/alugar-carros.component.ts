import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ModelService } from 'src/app/model/model.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { resolveApiAssetUrl } from 'src/app/shared/api-url.util';

@Component({
  selector: 'app-alugar-carros',
  imports: [CommonModule, ReactiveFormsModule, MatPaginator],
  templateUrl: './alugar-carros.component.html',
  styleUrl: './alugar-carros.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class AlugarCarrosComponent implements AfterViewInit {

  allData: any[] = [];
  pagedDate: any[] = [];
  pageSize = 10;
  currentPage = 0;
  totalItems: number = 0; 
  editingId: number | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  pendingDeleteItem: any | null = null;
  protected readonly resolveImageUrl = resolveApiAssetUrl;

  constructor(
    private service: ModelService, private router: Router, private http: HttpClient
  ){}

  ngAfterViewInit(): void {
    this.updatePagedData();
    registerLocaleData(localePt);
  }

  updatePagedData() {
    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;

    this.service.list().subscribe(data => {
      this.allData = data;
      this.totalItems = this.allData.length;
      this.pagedDate = this.allData.slice(offset, limit);
    });
  }

   onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  rent(item: any): void {
    let data = {
      modelId: item.id,
      customerId: localStorage.getItem('customer_id')
    };
    
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' }, responseType: 'text' as 'json' }; 
    this.http.post('api/auto/prerent', data, options).subscribe(
      res => {

        let qty = localStorage.getItem('cart_items');
        if (qty) {
          data['qty'] = parseInt(qty, 10) + 1;
        } else {
          data['qty'] = 1;
        } 
        localStorage.setItem('cart_items', data['qty'].toString());
      },
      err => {
        let message = JSON.parse(err.error).message || 'Ocorreu um erro ao alugar o carro. Por favor, tente novamente.';
        this.openModal('Carro não adicionado', message);
      }
    );
  }

  closeModal() {
    this.showModal = false;
  }

  private openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }
}
