import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarmakerService } from '../carmaker.service';

@Component({
  selector: 'app-carmaker-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './carmaker-cadastro.component.html',
  styleUrls: ['./carmaker-cadastro.component.css']
})
export class CarmakerCadastroComponent {
  form = this.fb.group({
    descricao: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder, private router: Router, private service: CarmakerService) { }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const descricao = this.form.value.descricao ?? '';
    const payload = { descricao };

    this.service.create(payload).subscribe({
      next: () => {
        alert('Montadora cadastrada com sucesso');
        this.form.reset();
        this.form.get('descricao')?.setErrors(null);
      },
      error: err => alert('Erro ao cadastrar montadora: ' + (err?.error?.message || err?.message || ''))
    });
  }
}
