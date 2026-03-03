import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarmakerService, Carmaker } from 'src/app/carmaker/carmaker.service';
import { ModelService } from '../model.service';

@Component({
  selector: 'app-model-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './model-cadastro.component.html',
  styleUrls: ['./model-cadastro.component.css']
})
export class ModelCadastroComponent implements OnInit {
  carmakers: Carmaker[] = [];
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;

  form = this.fb.group({
    id: ['', []],
    descricao: ['', [Validators.required]],
    preco: ['', [Validators.required]],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    carmakerId: [null, [Validators.required]],
    imagem: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private carmakerService: CarmakerService,
    private modelService: ModelService
  ) { }

  ngOnInit() {
    this.carmakerService.list().subscribe(data => this.carmakers = data);
    // ensure we have latest data
    this.carmakerService.refresh();
    this.loadPrefillFromState();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const imageControl = this.form.get('imagem');

    if (!input.files || !input.files.length) {
      this.selectedFile = null;
      this.previewUrl = null;
      imageControl?.setValue('');
      imageControl?.markAsTouched();
      imageControl?.updateValueAndValidity();
      return;
    }

    this.selectedFile = input.files[0];
    imageControl?.setValue(this.selectedFile.name);
    imageControl?.markAsTouched();
    imageControl?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  onPriceInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digits = (input.value || '').replace(/\D/g, '');

    if (!digits) {
      this.form.patchValue({ preco: '' }, { emitEvent: false });
      input.value = '';
      return;
    }

    const numericValue = Number(digits) / 100;
    const formatted = numericValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    this.form.patchValue({ preco: formatted }, { emitEvent: false });
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

  onSubmit() {
    if (!this.selectedFile) {
      this.form.get('imagem')?.setErrors({ required: true });
      this.form.get('imagem')?.markAsTouched();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, descricao, ano, carmakerId, preco } = this.form.value;
    const descricaoValue = (descricao ?? '').toString().trim();
    const fd = new FormData();
    if (id) fd.append('id', String(id));
    fd.append('description', descricaoValue);
    fd.append('year', String(ano));
    fd.append('carmakerId', String(carmakerId));
    fd.append('price', String(preco).replace(/\./g, '').replace(',', '.'));
    fd.append('active', Boolean(true).toString());
    if (this.selectedFile) fd.append('image', this.selectedFile, this.selectedFile.name);

    this.modelService.create(fd).subscribe({
      next: () => {
        this.openModal('Sucesso', 'Modelo cadastrado com sucesso');
        this.form.reset({ ano: new Date().getFullYear(), carmakerId: null });
        this.previewUrl = null;
        this.selectedFile = null;
      },
      error: err => this.openModal('Erro', 'Erro ao cadastrar modelo: ' + (err?.error?.message || err?.message || ''))
    });
  }

  private loadPrefillFromState() {
    const state = (history.state || {}) as any;
    const prefill = state?.prefillModel;
    if (!prefill) return;

    this.form.patchValue({
      id: prefill.id ?? '',
      descricao: prefill.descricao || prefill.description || '',
      preco: this.formatPriceForDisplay(prefill.preco ?? prefill.price ?? ''),
      ano: Number(prefill.ano ?? prefill.year ?? new Date().getFullYear()),
      carmakerId: prefill.carmakerId ?? prefill.carmaker?.id ?? null
    });
  }

  private formatPriceForDisplay(price: any): string {
    if (price === null || price === undefined || price === '') return '';

    if (typeof price === 'number') {
      return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const normalized = String(price).trim().replace(/\./g, '').replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return String(price);
    return parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
