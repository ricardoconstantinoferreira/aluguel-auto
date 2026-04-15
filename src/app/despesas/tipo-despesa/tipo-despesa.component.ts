import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';
import { TipoDespesaService } from './tipo-despesa.service';

@Component({
  selector: 'app-tipo-despesa',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatPaginator, NgxLoadingModule],
  templateUrl: './tipo-despesa.component.html',
  styleUrls: ['./tipo-despesa.component.css']
})
export class TipoDespesaComponent implements OnInit {

  form = this.fb.group({
    descricao: ['', [Validators.required]]
  });

  allData: any[] = [];
  filteredData: any[] = [];
  pagedDate: any[] = [];
  searchTerm = '';
  pageSize = 5;
  currentPage = 0;
  totalItems = 0;
  editingId: number | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  pendingDeleteItem: any | null = null;
  loading = false;

  constructor(private fb: FormBuilder, private service: TipoDespesaService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.service.list().subscribe({
      next: (data) => {
        this.allData = data;
        this.applyFilter(false);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilter(true);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const descricao = (this.form.value.descricao ?? '').toString().trim();
    const payload = { description: descricao };

    if (this.editingId !== null) {
      this.update(payload);
      return;
    }

    this.create(payload);
  }

  onEdit(item: any): void {
    this.editingId = item.id;
    this.form.patchValue({ descricao: item.description || item.descricao || '' });
    this.form.markAsUntouched();
  }

  onDelete(item: any): void {
    this.pendingDeleteItem = item;
    this.showDeleteConfirmModal = true;
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  confirmDelete(): void {
    if (!this.pendingDeleteItem) {
      return;
    }

    const item = this.pendingDeleteItem;
    this.closeDeleteConfirmModal();

    this.loading = true;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Tipo de despesa deletado com sucesso');
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.adjustPageAfterDelete();
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao deletar', backendMessage);
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.pendingDeleteItem = null;
  }

  private create(payload: { description: string }): void {
    this.loading = true;
    this.service.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Tipo de despesa cadastrado com sucesso');
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao cadastrar', backendMessage);
      }
    });
  }

  private update(payload: { description: string }): void {
    if (this.editingId === null) {
      return;
    }

    this.loading = true;
    this.service.update(this.editingId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Tipo de despesa atualizado com sucesso');
        this.resetForm();
        this.loadData();
      },
      error: (err) => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao atualizar', backendMessage);
      }
    });
  }

  private applyFilter(resetPage: boolean): void {
    const term = this.searchTerm?.trim().toLowerCase() || '';

    if (term) {
      this.filteredData = this.allData.filter((item) => {
        const id = (item.id || '').toString().toLowerCase();
        const descricao = (item.description || item.descricao || '').toString().toLowerCase();
        return id.includes(term) || descricao.includes(term);
      });
    } else {
      this.filteredData = [...this.allData];
    }

    if (resetPage) {
      this.currentPage = 0;
    }

    this.updatePagedData();
  }

  private updatePagedData(): void {
    this.totalItems = this.filteredData.length;
    const maxPageIndex = Math.max(0, Math.ceil(this.totalItems / this.pageSize) - 1);

    if (this.currentPage > maxPageIndex) {
      this.currentPage = maxPageIndex;
    }

    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;
    this.pagedDate = this.filteredData.slice(offset, limit);
  }

  private openModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset();
    this.form.get('descricao')?.setErrors(null);
  }

  private adjustPageAfterDelete(): void {
    const remainingItems = this.totalItems - 1;
    const maxPageIndex = Math.max(0, Math.ceil(remainingItems / this.pageSize) - 1);
    if (this.currentPage > maxPageIndex) {
      this.currentPage = maxPageIndex;
    }
  }
}
