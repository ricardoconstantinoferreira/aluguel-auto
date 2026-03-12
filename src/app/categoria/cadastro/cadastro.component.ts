import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CategoriaService } from '../categoria.service';

@Component({
  selector: 'app-cadastro',
  imports: [CommonModule, ReactiveFormsModule, MatPaginator],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements AfterViewInit {

  form = this.fb.group({
    descricao: ['', [Validators.required]]
  });

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

  constructor(private fb: FormBuilder, private service: CategoriaService) {}

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

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const descricao = this.form.value.descricao ?? '';
    const payload = { description: descricao };

    if (this.editingId !== null) {
      this.update(payload);
      return;
    } else {
      this.create(payload);
    }
  }

  create(payload: any) {
    this.service.create(payload).subscribe({
       next: () => {
        this.openModal('Sucesso', 'Categoria cadastrada com sucesso');
        this.resetForm();
        this.updatePagedData();
      },
      error: err => {
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao cadastrar', backendMessage);
      }
    });
  }

  update(payload: any) {
    this.service.update(this.editingId, payload).subscribe({
      next: () => {
        this.openModal('Sucesso', 'Categoria atualizada com sucesso');
        this.resetForm();
        this.updatePagedData();
      },
      error: err => {
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao atualizar', backendMessage);
      }
    });
  }

  cancelEdit() {
    this.resetForm();
  }

  onEdit(item: any) {
    this.editingId = item.id;
    this.form.patchValue({ descricao: item.description || item.descricao || '' });
    this.form.markAsUntouched();
  }

  confirmDelete() {
    if (!this.pendingDeleteItem) return;
    const item = this.pendingDeleteItem;
    this.closeDeleteConfirmModal();
    this.service.delete(item.id).subscribe({
      next: () => {
        this.openModal('Sucesso', 'Categoria deletada com sucesso');
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.adjustPageAfterDelete();
        this.updatePagedData();
      },
      error: err => {
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro ao deletar', backendMessage);
      }
    });
  }

  onDelete(item: any) {
    this.pendingDeleteItem = item;
    this.showDeleteConfirmModal = true;
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

  private resetForm() {
    this.editingId = null;
    this.form.reset();
    this.form.get('descricao')?.setErrors(null);
  }

  private adjustPageAfterDelete() {
    const remainingItems = this.totalItems - 1;
    const maxPageIndex = Math.max(0, Math.ceil(remainingItems / this.pageSize) - 1);
    if (this.currentPage > maxPageIndex) {
      this.currentPage = maxPageIndex;
    }
  }

}
