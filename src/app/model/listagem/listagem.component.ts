import { AfterViewInit, Component } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ModelService } from '../model.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-listagem',
  imports: [CommonModule, ReactiveFormsModule, MatPaginator],
  templateUrl: './listagem.component.html',
  styleUrls: ['./listagem.component.css']
})
export class ListagemComponent implements AfterViewInit {

  allData: any[] = [];
  pagedDate: any[] = [];
  pageSize = 5;
  currentPage = 0;
  totalItems: number = 0; 
  editingId: number | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  pendingDeleteItem: any | null = null;

  constructor(private service: ModelService, private router: Router) { }

  ngAfterViewInit(): void {
    this.updatePagedData();
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

  onEdit(item: any) {
    this.router.navigate(['/model/cadastro'], {
      state: {
        prefillModel: {
          id: item?.id,
          descricao: item?.description || item?.descricao || '',
          preco: item?.price ?? item?.preco ?? '',
          ano: item?.year ?? item?.ano ?? new Date().getFullYear(),
          carmakerId: item?.carmakerId ?? item?.carmaker?.id ?? null,
          categoriaId: item?.categoryId ?? item?.category?.id ?? null,
          imageUrl: item?.imageUrl ?? item?.imagemUrl ?? item?.image ?? item?.imagem ?? null,
        }
      }
    });
  }

  onInactivate(item: any) {
    this.pendingDeleteItem = item;
    this.showDeleteConfirmModal = true;
  }

  onActivate(item: any) {
    this.service.activate(item.id).subscribe({
      next: () => {
        this.openModal('Sucesso','Registro ativado com sucesso');
        this.updatePagedData();
      },
      error: err => this.openModal('Erro ao ativar', err?.error?.message || err?.message || 'Erro ao ativar registro')
    });
  }

  confirmInactivate() {
    if (!this.pendingDeleteItem) return;

    const item = this.pendingDeleteItem;
    this.closeDeleteConfirmModal();

    this.service.inactivate(item.id).subscribe({
      next: () => {
        this.openModal('Sucesso', 'Registro inativado com sucesso');
        this.adjustPageAfterInactivate();
        this.updatePagedData();
      },
      error: err => this.openModal('Erro ao inativar', err?.error?.message || err?.message || 'Erro ao inativar registro')
    });
  }

  closeModal() {
    this.showModal = false;
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal = false;
    this.pendingDeleteItem = null;
  }

  private openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  private adjustPageAfterInactivate() {
    const remainingItems = this.totalItems - 1;
    const maxPageIndex = Math.max(0, Math.ceil(remainingItems / this.pageSize) - 1);
    if (this.currentPage > maxPageIndex) {
      this.currentPage = maxPageIndex;
    }
  }

}
