import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';
import { forkJoin } from 'rxjs';
import { resolveApiAssetUrl } from 'src/app/shared/api-url.util';
import { TipoDespesa, TipoDespesaService } from '../tipo-despesa/tipo-despesa.service';

@Component({
  selector: 'app-listagem',
  imports: [CommonModule, FormsModule, NgxLoadingModule],
  templateUrl: './listagem.component.html',
  styleUrl: './listagem.component.css'
})
export class ListagemComponent implements OnInit {

  allData: any[] = [];
  filteredData: any[] = [];
  typeExpenses: TipoDespesa[] = [];
  selectedTypeExpenseId: number | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  pendingDeleteItem: any | null = null;
  loading = false;
  protected readonly resolveImageUrl = resolveApiAssetUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly tipoDespesaService: TipoDespesaService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    forkJoin({
      expenses: this.http.get<any[]>('/api/auto/expenses'),
      types: this.tipoDespesaService.list()
    }).subscribe({
      next: ({ expenses, types }) => {
        this.allData = expenses || [];
        this.typeExpenses = types || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro', `Erro ao carregar listagem: ${backendMessage}`);
      }
    });
  }

  onTypeChange(value: string): void {
    const parsed = value === '' ? null : Number(value);
    this.selectedTypeExpenseId = Number.isNaN(parsed as number) ? null : parsed;
    this.applyFilter();
  }

  onDelete(item: any): void {
    this.pendingDeleteItem = item;
    this.showDeleteConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.pendingDeleteItem?.id) {
      return;
    }

    const id = this.pendingDeleteItem.id;
    this.closeDeleteConfirmModal();
    this.loading = true;

    this.http.delete(`/api/auto/expenses/${id}`).subscribe({
      next: () => {
        this.loading = false;
        this.openModal('Sucesso', 'Despesa deletada com sucesso');
        this.allData = this.allData.filter((item) => item?.id !== id);
        this.applyFilter();
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

  getModelName(item: any): string {
    return item?.descriptionModel
      || item?.modelDescription
      || item?.model?.description
      || item?.model?.descricao
      || '-';
  }

  getModelImage(item: any): string {
    return item?.image
      || item?.imageUrl
      || item?.imagem
      || item?.imagemUrl
      || item?.model?.image
      || item?.model?.imageUrl
      || item?.model?.imagem
      || item?.model?.imagemUrl
      || '';
  }

  getExpenseTypeName(item: any): string {
    return item?.descriptionExpensesType
      || item?.typeExpenseDescription
      || item?.expensesType?.description
      || item?.expensesType?.descricao
      || '-';
  }

  formatValue(value: any): string {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return value ? String(value) : 'R$ 0,00';
    }

    return numeric.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  private applyFilter(): void {
    if (this.selectedTypeExpenseId === null) {
      this.filteredData = [...this.allData];
      return;
    }

    this.filteredData = this.allData.filter((item) => {
      const typeId = item?.expensesTypeId ?? item?.typeExpensesId ?? item?.expensesType?.id ?? item?.typeExpenses?.id;
      return Number(typeId) === this.selectedTypeExpenseId;
    });
  }

  private openModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

}
