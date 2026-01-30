import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CarmakerService, Carmaker } from 'src/app/carmaker/carmaker.service';
import { ModelService } from '../model.service';

@Component({
  selector: 'app-model-cadastro',
  templateUrl: './model-cadastro.component.html',
  styleUrls: ['./model-cadastro.component.css']
})
export class ModelCadastroComponent implements OnInit {
  carmakers: Carmaker[] = [];
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  form = this.fb.group({
    descricao: ['', [Validators.required]],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    carmakerId: [null, [Validators.required]]
  });

  constructor(
    private fb: FormBuilder,
    private carmakerService: CarmakerService,
    private modelService: ModelService
  ) { }

  ngOnInit() {
    this.carmakerService.getAll().subscribe(data => this.carmakers = data);
    // ensure we have latest data
    this.carmakerService.refresh();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    this.selectedFile = input.files[0];

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result;
    reader.readAsDataURL(this.selectedFile);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { descricao, ano, carmakerId } = this.form.value;
    const fd = new FormData();
    fd.append('descricao', descricao);
    fd.append('ano', String(ano));
    fd.append('carmakerId', String(carmakerId));
    if (this.selectedFile) fd.append('imagem', this.selectedFile, this.selectedFile.name);

    this.modelService.create(fd).subscribe({
      next: () => {
        alert('Modelo cadastrado com sucesso');
        this.form.reset({ ano: new Date().getFullYear(), carmakerId: null });
        this.previewUrl = null;
        this.selectedFile = null;
      },
      error: err => alert('Erro ao cadastrar modelo: ' + (err?.error?.message || err?.message || ''))
    });
  }
}
