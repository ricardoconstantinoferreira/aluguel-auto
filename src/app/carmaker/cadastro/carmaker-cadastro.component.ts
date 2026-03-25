import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { CarmakerService } from '../carmaker.service';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';

@Component({
  selector: 'app-carmaker-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatPaginator, NgxLoadingModule],
  templateUrl: './carmaker-cadastro.component.html',
  styleUrls: ['./carmaker-cadastro.component.css']
})
export class CarmakerCadastroComponent implements AfterViewInit {
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
  loading = false;

  constructor(private fb: FormBuilder, private service: CarmakerService) { }

  ngAfterViewInit() {
    this.updatePagedData();
  }

  updatePagedData() {
    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;

    this.loading = true;
    this.service.list().subscribe({
      next: (data) => {
        this.allData = data;
        this.totalItems = this.allData.length;
        this.pagedDate = this.allData.slice(offset, limit);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
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
      this.loading = true;
      this.service.update(this.editingId, payload).subscribe({
        next: () => {
          this.loading = false;
          this.openModal('Sucesso', 'Montadora atualizada com sucesso');
          this.resetForm();
          this.updatePagedData();
        },
        error: err => {
          this.loading = false;
          this.openModal('Erro ao atualizar', err?.error?.message || err?.message || 'Erro ao atualizar montadora');
        }
      });
      return;
    }

    this.loading = true;
    this.service.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Montadora cadastrada com sucesso');
        this.resetForm();
        this.updatePagedData();
      },
      error: err => {
        this.loading = false;
        this.openModal('Erro ao cadastrar', err?.error?.message || err?.message || 'Erro ao cadastrar montadora');
      }
    });
  }

  onEdit(item: any) {
    this.editingId = item.id;
    this.form.patchValue({ descricao: item.description || item.descricao || '' });
    this.form.markAsUntouched();
  }

  onDelete(item: any) {
    this.pendingDeleteItem = item;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete() {
    if (!this.pendingDeleteItem) return;
    const item = this.pendingDeleteItem;
    this.closeDeleteConfirmModal();
    this.loading = true;
    this.service.delete(item.id).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Montadora deletada com sucesso');
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.adjustPageAfterDelete();
        this.updatePagedData();
      },
      error: err => {
        this.loading = false;
        this.openModal('Erro ao deletar', err?.error?.message || err?.message || 'Erro ao deletar montadora');
      }
    });
  }

  cancelEdit() {
    this.resetForm();
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
