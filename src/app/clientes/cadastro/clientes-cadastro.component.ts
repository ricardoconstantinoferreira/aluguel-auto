import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientesService } from '../clientes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clientes-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './clientes-cadastro.component.html',
  styleUrls: ['./clientes-cadastro.component.css']
})
export class ClientesCadastroComponent {
  tipos = ['Usuário', 'Cliente Comum', 'Cliente Empresa'];

  cpfValidator = (control: AbstractControl) => {
    const raw = (control.value || '').toString().replace(/\D/g, '');
    if (!raw) return null; // leave required check to Validators.required
    return raw.length === 11 ? null : { invalidCpfLength: true };
  }

  form = this.fb.group({
    documento: ['', [Validators.required, this.cpfValidator]],
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    tipo: [null, [Validators.required]]
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

    this.service.create(payload).subscribe({
      next: () => {
        alert('Cliente cadastrado com sucesso, você receberá um e-mail para cadastrar sua senha.');
        this.router.navigate(['/clientes/cadastro']);
      },
      error: err => alert('Erro ao cadastrar: ' + (err?.error?.message || err?.message || ''))
    });
  }
}
