import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading-reloaded-ng19';
import { EnderecoService } from '../endereco.service';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';

@Component({
  selector: 'app-endereco-cadastro',
  imports: [CommonModule, ReactiveFormsModule, NgxLoadingModule],
  templateUrl: './endereco-cadastro.component.html',
  styleUrls: ['./endereco-cadastro.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class EnderecoCadastroComponent implements OnInit {
  selectedMenu: 'dados-pessoais' | 'dados-endereco' | 'dados-pedidos' = 'dados-pessoais';

  loading = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';

  customerId = Number(localStorage.getItem('customer_id'));
  customerName = localStorage.getItem('customer_name') || '';
  customerEmail = localStorage.getItem('customer_email') || '';
  customerDocument = '';

  addressId: number | null = null;
  hasAddress = false;
  editingPersonal = false;
  editingAddress = false;
  changingPassword = false;

  orders: any[] = [];
  orderItemsByOrderId: Record<number, any[]> = {};

  cpfValidator = (control: AbstractControl) => {
    const raw = (control.value || '').toString().replace(/\D/g, '');
    if (!raw) {
      return null;
    }
    return raw.length === 11 ? null : { invalidCpfLength: true };
  };

  personalForm = this.fb.group({
    documento: ['', [Validators.required, this.cpfValidator]],
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]]
  });

  passwordForm = this.fb.group({
    senhaAtual: ['', [Validators.required]],
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmarNovaSenha: ['', [Validators.required]]
  });

  addressForm = this.fb.group({
    cep: ['', [Validators.required]],
    logradouro: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]]
  });

  constructor(private fb: FormBuilder, private enderecoService: EnderecoService) {}

  ngOnInit(): void {
    if (!this.customerId) {
      this.openModal('Erro', 'Nao foi possivel identificar o cliente logado.');
      return;
    }

    this.loadCustomer();
    this.loadAddress();
    this.loadOrders();

    registerLocaleData(localePt);
  }

  selectMenu(menu: 'dados-pessoais' | 'dados-endereco' | 'dados-pedidos'): void {
    this.selectedMenu = menu;
  }

  loadCustomer(): void {
    this.loading = true;

    this.enderecoService.getCustomer(this.customerId).subscribe({
      next: (customer) => {
        const data = this.normalizeCustomer(customer);
        this.customerDocument = data.document;
        this.customerName = data.name;
        this.customerEmail = data.email;

        this.personalForm.patchValue({
          documento: this.applyCpfMask(this.customerDocument),
          nome: this.customerName,
          email: this.customerEmail
        });

        this.loading = false;
      },
      error: () => {
        this.personalForm.patchValue({
          documento: '',
          nome: this.customerName,
          email: this.customerEmail
        });
        this.loading = false;
      }
    });
  }

  loadAddress(): void {
    this.enderecoService.getAddress(this.customerId).subscribe({
      next: (address) => {
        const data = this.normalizeAddress(address);
        this.hasAddress = !!data;

        if (!data) {
          return;
        }

        this.addressId = data.id;
        this.addressForm.patchValue({
          cep: this.applyCepMask(data.zipCode),
          logradouro: data.street,
          numero: data.number,
          complemento: data.complement,
          bairro: data.neighborhood,
          cidade: data.city,
          estado: data.state
        });
      },
      error: () => {
        this.hasAddress = false;
      }
    });
  }

  loadOrderItems(orderId: number): void {
    this.enderecoService.getOrderItems(orderId, this.customerId).subscribe({
      next: (items) => {
        this.orderItemsByOrderId[orderId] = Array.isArray(items) ? items : [];
      },
      error: () => {
        this.orderItemsByOrderId[orderId] = [];
      }
    });
  }

  loadOrders(): void {
    this.enderecoService.getOrders(this.customerId).subscribe({
      next: (orders) => {
        this.orders = Array.isArray(orders) ? orders : [];
        this.orders.forEach((order) => this.loadOrderItems(order.id));
      },
      error: () => {
        this.orders = [];
        this.orderItemsByOrderId = {};
      }
    });
  }

  getOrderItems(orderId: number): any[] {
    return this.orderItemsByOrderId[orderId] || [];
  }

  togglePersonalEdit(): void {
    this.editingPersonal = !this.editingPersonal;

    if (this.editingPersonal) {
      this.personalForm.patchValue({
        documento: this.applyCpfMask(this.customerDocument),
        nome: this.customerName,
        email: this.customerEmail
      });
    }
  }

  onDocumentoInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.personalForm.get('documento')?.setValue(this.applyCpfMask(input.value), { emitEvent: false });
    this.personalForm.get('documento')?.updateValueAndValidity();
  }

  submitPersonalData(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    const payload = {
      document: (this.personalForm.value.documento || '').replace(/\D/g, ''),
      name: this.personalForm.value.nome,
      email: this.personalForm.value.email
    };

    this.loading = true;
    this.enderecoService.updateCustomer(this.customerId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.editingPersonal = false;
        this.customerDocument = payload.document;
        this.customerName = payload.name || '';
        this.customerEmail = payload.email || '';
        localStorage.setItem('customer_name', this.customerName);
        localStorage.setItem('customer_email', this.customerEmail);
        this.openModal('Sucesso', 'Dados pessoais atualizados com sucesso.');
      },
      error: (err) => {
        this.loading = false;
        this.openModal('Erro', this.getErrorMessage(err, 'Nao foi possivel atualizar os dados pessoais.'));
      }
    });
  }

  togglePasswordChange(): void {
    this.changingPassword = !this.changingPassword;

    if (!this.changingPassword) {
      this.passwordForm.reset();
    }
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const senhaAtual = this.passwordForm.value.senhaAtual || '';
    const novaSenha = this.passwordForm.value.novaSenha || '';
    const confirmarNovaSenha = this.passwordForm.value.confirmarNovaSenha || '';

    if (novaSenha !== confirmarNovaSenha) {
      this.openModal('Atencao', 'A nova senha e a confirmacao de senha devem ser iguais.');
      return;
    }

    const payload = {
      currentPassword: senhaAtual,
      newPassword: novaSenha,
      confirmPassword: confirmarNovaSenha
    };

    this.loading = true;
    this.enderecoService.updatePassword(this.customerId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.changingPassword = false;
        this.passwordForm.reset();
        this.openModal('Sucesso', 'Senha atualizada com sucesso.');
      },
      error: (err) => {
        this.loading = false;
        this.openModal('Erro', this.getErrorMessage(err, 'A senha atual informada e invalida ou nao foi possivel atualizar.'));
      }
    });
  }

  toggleAddressEdit(): void {
    this.editingAddress = !this.editingAddress;

    if (!this.editingAddress && this.hasAddress) {
      this.loadAddress();
    }
  }

  submitAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }

    const payload = {
      zipcode: (this.addressForm.value.cep || '').replace(/\D/g, ''),
      address: this.addressForm.value.logradouro,
      number: this.addressForm.value.numero,
      complement: this.addressForm.value.complemento,
      neighborhood: this.addressForm.value.bairro,
      city: this.addressForm.value.cidade,
      state: this.addressForm.value.estado,
      customerId: this.customerId
    };

    this.loading = true;

    if (!this.hasAddress) {
      this.enderecoService.createAddress(payload).subscribe({
        next: () => {
          this.loading = false;
          this.hasAddress = true;
          this.editingAddress = false;
          this.loadAddress();
          this.openModal('Sucesso', 'Endereco cadastrado com sucesso.');
        },
        error: (err) => {
          this.loading = false;
          this.openModal('Erro', this.getErrorMessage(err, 'Nao foi possivel cadastrar o endereco.'));
        }
      });
      return;
    }

    if (!this.customerId || !this.addressId) {
      this.loading = false;
      this.openModal('Erro', 'Nao foi possivel localizar o identificador do endereco para atualizacao.');
      return;
    }

    this.enderecoService.updateAddress(this.customerId, payload).subscribe({
      next: () => {
        this.loading = false;
        this.editingAddress = false;
        this.loadAddress();
        this.openModal('Sucesso', 'Endereco atualizado com sucesso.');
      },
      error: (err) => {
        this.loading = false;
        this.openModal('Erro', this.getErrorMessage(err, 'Nao foi possivel atualizar o endereco.'));
      }
    });
  }

  onCepInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const masked = this.applyCepMask(input.value);
    this.addressForm.get('cep')?.setValue(masked, { emitEvent: false });
  }

  onCepBlur(): void {
    const cep = (this.addressForm.value.cep || '').replace(/\D/g, '');

    if (cep.length !== 8) {
      return;
    }

    this.enderecoService.lookupCep(cep).subscribe({
      next: (cepData) => {
        this.addressForm.patchValue({
          logradouro: cepData?.street || '',
          bairro: cepData?.neighborhood || '',
          cidade: cepData?.city || '',
          estado: (cepData?.state || '').toUpperCase()
        });
      },
      error: () => {
        this.openModal('Atencao', 'CEP nao encontrado ou indisponivel para consulta no momento.');
      }
    });
  }

  getOrderDescription(order: any): string {
    return order?.description || order?.modelDescription || order?.modeloDescricao || order?.model?.description || '-';
  }

  getOrderPrice(order: any): number {
    return Number(order?.totalPrice || order?.totalPrice || order?.totalPrice || 0);
  }

  getOrderDate(order: any): string {
    return order?.dateOrder || order?.dateOrder || order?.dateOrder || '';
  }

  getOrderImage(image: any): string {

    if (!image) {
      return '';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return `http://localhost:8080/${image}`;
  }

  closeModal(): void {
    this.showModal = false;
  }

  private openModal(title: string, message: string): void {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  private normalizeCustomer(customer: any): { document: string; name: string; email: string } {
    return {
      document: customer?.document || customer?.documento || '',
      name: customer?.name || customer?.nome || this.customerName,
      email: customer?.email || this.customerEmail
    };
  }

  private normalizeAddress(address: any): any {
    if (!address) {
      return null;
    }

    return {
      id: address?.id || address?.addressId || null,
      zipCode: address?.zipcode || address?.zipcode || '',
      street: address?.address || address?.address || '',
      number: address?.number || address?.numero || '',
      complement: address?.complement || address?.complemento || '',
      neighborhood: address?.neighborhood || address?.bairro || '',
      city: address?.city || address?.cidade || '',
      state: (address?.state || address?.estado || '').toUpperCase()
    };
  }

  private applyCpfMask(value: string): string {
    const digits = (value || '').replace(/\D/g, '').slice(0, 11);

    if (digits.length > 9) {
      return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
    }
    if (digits.length > 6) {
      return digits.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    }
    if (digits.length > 3) {
      return digits.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    }

    return digits;
  }

  private applyCepMask(value: string): string {
    const digits = (value || '').replace(/\D/g, '').slice(0, 8);

    if (digits.length > 5) {
      return digits.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
    }

    return digits;
  }

  private getErrorMessage(err: any, fallback: string): string {
    return err?.error?.message || err?.message || fallback;
  }
}
