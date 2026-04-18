import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TipoDespesa, TipoDespesaService } from '../tipo-despesa/tipo-despesa.service';
import { Model } from 'src/app/model/model.interface';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';
import { ModelService } from 'src/app/model/model.service';
import { forkJoin } from 'rxjs';
import { CadastroService } from './cadastro.service';

@Component({
  selector: 'app-cadastro',
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgxLoadingModule],
  templateUrl: './cadastro.component.html',
  styleUrl: './cadastro.component.css'
})
export class CadastroComponent implements OnInit {

  type_expenses: TipoDespesa[] = [];
  models: Model[] = [];
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  loading = false;

  form = this.fb.group({
    id: ['', []],
    typeExpensesId: [null, [Validators.required]],
    modelId: [null, [Validators.required]],
    value: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private tipoDespesaService: TipoDespesaService,
    private modelService: ModelService,
    private cadastroService: CadastroService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    forkJoin({
      type_expenses: this.tipoDespesaService.list(),
      models: this.modelService.list()
    }).subscribe({
      next: ({type_expenses, models}) => {
        this.type_expenses = type_expenses;
        this.models = models;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
      
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, typeExpensesId, modelId, value } = this.form.value;
    const payload: any = {
      expensesTypeId: Number(typeExpensesId),
      modelId: Number(modelId),
      value: Number(String(value).replace(/\./g, '').replace(',', '.'))
    };

    if (id) {
      payload.id = Number(id);
    }

    this.loading = true;
    this.cadastroService.create(payload).subscribe({
      next: (result) => {
        this.loading = false;
        this.openModal('Sucesso', result.message);
        this.form.reset();

      },
      error: err => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.error?.error || err?.message || '';
        this.openModal('Erro', `Erro ao cadastrar despesa (${err?.status || 'sem status'}): ${backendMessage}`);
      }
    });

  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');

    if (!digits) {
      this.form.patchValue({ value: '' }, { emitEvent: false });
      input.value = '';
      return;
    }

    const numericValue = Number(digits) / 100;
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    this.form.patchValue({ value: formatted }, { emitEvent: false });
    input.value = formatted;
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
