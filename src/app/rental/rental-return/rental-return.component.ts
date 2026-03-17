import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { RuleService } from '../rule.service';
import { RentalReturnService } from '../rental-return.service';

interface RentalOrderView {
  id: number;
  cliente: string;
  dataLocacao: Date | null;
  totalPedido: number;
  status: string;
  jurosPagar: number;
  devolucaoFeita: boolean;
}

@Component({
  selector: 'app-rental-return',
  standalone: false,
  templateUrl: './rental-return.component.html',
  styleUrl: './rental-return.component.css'
})
export class RentalReturnComponent implements OnInit {
  statusOptions = [
    { label: 'Alugado', value: 0 },
    { label: 'Devolução', value: 1 }
  ];

  selectedStatus = 0;
  allOrders: RentalOrderView[] = [];
  pagedOrders: RentalOrderView[] = [];

  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  private rulePercentageInterest = 0;
  private ruleQtdeDaysRent = 0;

  constructor(
    private rentalReturnService: RentalReturnService,
    private ruleService: RuleService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  onStatusChange(): void {
    this.currentPage = 0;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }

  onReturned(order: RentalOrderView): void {
    this.rentalReturnService.returned(order.id).subscribe({
      next: () => {
        order.jurosPagar = this.calculateInterest(order);
        order.status = 'Devolução';
        order.devolucaoFeita = true;
      },
      error: err => {
        console.error('Erro ao registrar devolucao', err);
      }
    });
  }

  private loadOrders(): void {
    this.rentalReturnService.listByStatus(this.selectedStatus).subscribe({
      next: response => {
        const items = Array.isArray(response) ? response : [];
        this.allOrders = items.map(item => this.mapOrder(item));
        this.totalItems = items.length;
        this.updatePagedData();
      },
      error: err => {
        console.error('Erro ao listar pedidos de locacao', err);
        this.allOrders = [];
        this.pagedOrders = [];
        this.totalItems = 0;
      }
    });
  }

  private updatePagedData(): void {
    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;
    this.pagedOrders = this.allOrders.slice(offset, limit);
  }

  private mapOrder(item: any): RentalOrderView {
    const id = Number(item?.orderId ?? item?.id ?? 0);
    const cliente = String(item?.customer ?? item?.customer ?? item?.customer ?? '-');
    const dataLocacao = item?.dateOrder ?? item?.dateOrder ?? item?.dateOrder ?? item?.dateOrder;
    const totalPedido = this.parseNumber(item?.totalPrice ?? item?.totalPrice ?? item?.totalPrice ?? 0);
    const statusRaw = item?.statusOrder ?? item?.statusOrder ?? item?.statusOrder;
    const status = String(statusRaw ?? (this.selectedStatus === 1 ? 'Devolução' : 'Alugado'));
    const jurosPagar = this.parseNumber(item?.interestValuePayment ?? item?.interestValuePayment ?? 0);
    const devolucaoFeita = this.selectedStatus === 1 || /devolu/i.test(status);

    return {
      id,
      cliente,
      dataLocacao,
      totalPedido,
      status,
      jurosPagar,
      devolucaoFeita
    };
  }

  private calculateInterest(order: RentalOrderView): number {
    if (!order.dataLocacao || this.rulePercentageInterest <= 0 || this.ruleQtdeDaysRent <= 0) {
      return 0;
    }

    const today = new Date();
    const limitDate = new Date(order.dataLocacao);
    limitDate.setHours(0, 0, 0, 0);
    limitDate.setDate(limitDate.getDate() + this.ruleQtdeDaysRent);

    if (today <= limitDate) {
      return 0;
    }

    const interestValue = order.totalPedido * (this.rulePercentageInterest / 100);
    return Math.round(interestValue * 100) / 100;
  }


  private parseNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    const parsed = Number(String(value).replace(',', '.'));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private extractSingleItem(response: any): any | null {
    if (!response) {
      return null;
    }

    if (Array.isArray(response)) {
      return response.length > 0 ? response[0] : null;
    }

    return response;
  }

}
