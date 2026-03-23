import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../clientes.service';
import { Router } from '@angular/router';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';

@Component({
  selector: 'app-clientes-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './clientes-cadastro.component.html',
  styleUrls: ['./clientes-cadastro.component.css']
})
export class ClientesCadastroComponent {
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  loading = false;

  cpfValidator = (control: AbstractControl) => {
    const raw = (control.value || '').toString().replace(/\D/g, '');
    if (!raw) return null; // leave required check to Validators.required
    return raw.length === 11 ? null : { invalidCpfLength: true };
  }

  form = this.fb.group({
    documento: ['', [Validators.required, this.cpfValidator]],
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(private fb: FormBuilder, @Inject(ClientesService) private service: ClientesService, private router: Router) { }

  onDocumentoInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 11);
    let formatted = value;
    if (value.length > 9) {
      formatted = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    } else if (value.length > 6) {
      formatted = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    } else if (value.length > 3) {
      formatted = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    }
    this.form.get('documento')?.setValue(formatted, { emitEvent: false });
    this.form.get('documento')?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = { ...this.form.value, documento: (this.form.value.documento || '').replace(/\D/g, '') };

    this.loading = true;
    this.service.create(payload).subscribe({
      next: data => {
        console.log(data);
        this.loading = false;
        this.openModal('Sucesso', 'Cliente cadastrado com sucesso, você receberá um e-mail para cadastrar sua senha.');
        this.form.reset();
      },
      error: err => {
        this.loading = false;
        const backendMessage = err?.error?.message || err?.message || '';
        this.openModal('Erro', 'Erro ao cadastrar: ' + this.decodeBackendMessage(backendMessage));
      }
    });
  }

  closeModal() {
    this.showModal = false;
  }

  private openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  private decodeBackendMessage(message: string): string {
    const text = (message || '').toString();

    try {
      const bytes = Array.from(text)
        .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('');

      const decoded = decodeURIComponent(bytes);
      return decoded.replace(/j�/g, 'já');
    } catch {
      return text.replace(/j�/g, 'já');
    }
  }
}
