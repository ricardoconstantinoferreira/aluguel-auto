import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ModelService } from 'src/app/model/model.service';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { resolveApiAssetUrl } from 'src/app/shared/api-url.util';

@Component({
  selector: 'app-alugar-carros',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './alugar-carros.component.html',
  styleUrl: './alugar-carros.component.css',
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class AlugarCarrosComponent implements AfterViewInit {

  allData: any[] = [];
  filteredData: any[] = [];
  pagedDate: any[] = [];
  searchTerm = '';
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
    this.loadData();
    registerLocaleData(localePt);
  }

  loadData() {
    this.service.list().subscribe(data => {
      this.allData = data;
      this.applyFilter(false);
    });
  }

  onSearch() {
    this.applyFilter(true);
  }

  private applyFilter(resetPage: boolean) {
    const term = this.searchTerm?.trim().toLowerCase() || '';

    if (term) {
      this.filteredData = this.allData.filter(item => {
        const descricao = (item.description || item.descricao || '').toString().toLowerCase();
        const ano = (item.year || item.ano || '').toString().toLowerCase();
        const montadora = (item.descriptionCarmaker || '').toString().toLowerCase();
        const categoria = (item.descriptionCategory || '').toString().toLowerCase();

        return descricao.includes(term)
          || ano.includes(term)
          || montadora.includes(term)
          || categoria.includes(term);
      });
    } else {
      this.filteredData = [...this.allData];
    }

    if (resetPage) {
      this.currentPage = 0;
    }

    this.updatePagedData();
  }

  updatePagedData() {
    this.totalItems = this.filteredData.length;
    const maxPageIndex = Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);
    if (this.currentPage > maxPageIndex) {
      this.currentPage = maxPageIndex;
    }

    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;
    this.pagedDate = this.filteredData.slice(offset, limit);
  }

   onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  rent(item: any): void {
    let data = {
      modelId: item.id,
      customerId: localStorage.getItem('customer_id'),
      qty: 0
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
