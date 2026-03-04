import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ResetPasswordService } from './reset-password.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  id: string | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordsMatch });

  constructor(
    private fb: FormBuilder,
    private resetService: ResetPasswordService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.id = this.route.snapshot.queryParams['id'] ?? null;
  }

  passwordsMatch(control: AbstractControl) {
    const p = control.get('password')?.value;
    const cp = control.get('confirmPassword')?.value;
    return p && cp && p === cp ? null : { passwordsMismatch: true };
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const password = this.form.value.password;
    const confirmPassword = this.form.value.confirmPassword;
    const id = this.id;

    if (!id) {
      this.openModal('Erro', 'ID ausente na query string');
      return;
    }

    this.resetService.resetPassword(id, password, confirmPassword).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: err => this.openModal('Erro', 'Erro ao cadastrar senha: ' + (err?.error?.message || err?.message || ''))
    });
  }
}
