import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CarmakerService, Carmaker } from 'src/app/carmaker/carmaker.service';
import { ModelService } from '../model.service';
import { Categoria, CategoriaService } from 'src/app/categoria/categoria.service';
import { resolveApiAssetUrl } from 'src/app/shared/api-url.util';

@Component({
  selector: 'app-model-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './model-cadastro.component.html',
  styleUrls: ['./model-cadastro.component.css']
})
export class ModelCadastroComponent implements OnInit {
  carmakers: Carmaker[] = [];
  categorias: Categoria[] = [];
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  existingImageUrl: string | null = null;
  existingImageLabel = '';
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;

  form = this.fb.group({
    id: ['', []],
    descricao: ['', [Validators.required]],
    preco: ['', [Validators.required]],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    qtde: ['', [Validators.required]],
    carmakerId: [null, [Validators.required]],
    categoriaId: [null, [Validators.required]],
    imagem: ['', [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private carmakerService: CarmakerService,
    private modelService: ModelService,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit() {
    this.carmakerService.list().subscribe(data => this.carmakers = data);
    this.categoriaService.list().subscribe(data => this.categorias = data);
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
    this.existingImageUrl = null;
    this.existingImageLabel = '';
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

  async onSubmit() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, descricao, ano, carmakerId, preco, categoriaId, qtde} = this.form.value;
    const descricaoValue = (descricao ?? '').toString().trim();
    const fd = new FormData();
    if (id) fd.append('id', String(id));
    fd.append('description', descricaoValue);
    fd.append('year', String(ano));
    fd.append('carmakerId', String(carmakerId));
    fd.append('price', String(preco).replace(/\./g, '').replace(',', '.'));
    fd.append('active', Boolean(true).toString());
    fd.append('categoryId', String(categoriaId));
    fd.append('qtde', String(qtde));
    if (this.selectedFile) fd.append('image', this.selectedFile, this.selectedFile.name);

    this.modelService.create(fd).subscribe({
      next: () => {
        this.openModal('Sucesso', 'Modelo cadastrado com sucesso');
        this.form.reset({ ano: new Date().getFullYear(), carmakerId: null });
        this.previewUrl = null;
        this.selectedFile = null;
        this.existingImageUrl = null;
        this.existingImageLabel = '';
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
      carmakerId: prefill.carmakerId ?? prefill.carmaker?.id ?? null,
      categoriaId: prefill.categoriaId ?? prefill.categoria?.id ?? null,
      qtde: prefill.qtde ?? prefill.qtde ?? null
    });

    const imageUrl = prefill.imagemUrl || prefill.imageUrl || prefill.image || prefill.imagem || null;
    if (imageUrl) {
      this.existingImageUrl = String(imageUrl);
      this.previewUrl = this.resolveImageUrl(this.existingImageUrl);
      this.existingImageLabel = this.getImageName(this.existingImageUrl);
      this.form.patchValue({ imagem: this.existingImageLabel || this.existingImageUrl });
      this.form.get('imagem')?.setErrors(null);
      this.form.get('imagem')?.updateValueAndValidity();
    }
  }

  private resolveImageUrl(imagePath: string): string {
    const path = (imagePath || '').trim();
    if (!path) {
      return '';
    }

    return resolveApiAssetUrl(path);
  }

  private formatPriceForDisplay(price: any): string {
    if (price === null || price === undefined || price === '') return '';

    if (typeof price === 'number') {
      return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    const raw = String(price).trim();
    if (!raw) return '';

    const sanitized = raw.replace(/\s/g, '');
    const hasComma = sanitized.includes(',');
    const hasDot = sanitized.includes('.');

    let normalized = sanitized;

    if (hasComma && hasDot) {
      const lastComma = sanitized.lastIndexOf(',');
      const lastDot = sanitized.lastIndexOf('.');
      const decimalSeparator = lastComma > lastDot ? ',' : '.';

      normalized = decimalSeparator === ','
        ? sanitized.replace(/\./g, '').replace(',', '.')
        : sanitized.replace(/,/g, '');
    } else if (hasComma) {
      normalized = sanitized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = sanitized.replace(/,/g, '');
    }

    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return raw;
    return parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private getImageName(url: string): string {
    const cleanUrl = (url || '').split('?')[0];
    const parts = cleanUrl.split('/').filter(Boolean);
    return parts.length ? decodeURIComponent(parts[parts.length - 1]) : '';
  }
}
