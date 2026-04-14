import { CommonModule, registerLocaleData } from '@angular/common';
import { AfterViewInit, Component, ElementRef, LOCALE_ID, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import localePt from '@angular/common/locales/pt';
import { DashboardCustomerByPeriod, DashboardService, DashboardVehicleByPeriod } from './dashboard.service';

registerLocaleData(localePt);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('vehiclesPieChart') vehiclesPieChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('customersPieChart') customersPieChartRef?: ElementRef<HTMLCanvasElement>;

  readonly months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Marco' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  readonly years = this.buildYears();

  selectedMonth = this.months[0].value;
  selectedYear = this.years[0];
  loadingChart = false;
  chartError = '';
  hasChartData = false;
  loadingCustomerChart = false;
  customerChartError = '';
  hasCustomerChartData = false;
  private vehiclesPieChart?: Chart;
  private customersPieChart?: Chart;
  valueTotal = 0;

  constructor(private dashboardService: DashboardService) {}

  onFiltersChange(): void {
    this.loadCarsByPeriodChart();
    this.loadCustomersByPeriodChart();
    this.loadTotalValue();
  }

  ngAfterViewInit(): void {
    this.loadCarsByPeriodChart();
    this.loadCustomersByPeriodChart();
    this.loadTotalValue();
  }

  private loadCarsByPeriodChart(): void {
    this.loadingChart = true;
    this.chartError = '';

    this.dashboardService.getModelsByPeriod(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        const normalized = this.normalizeChartData(response);
        this.hasChartData = normalized.length > 0;
        this.renderVehiclesPieChart(normalized);
        this.loadingChart = false;
      },
      error: () => {
        this.loadingChart = false;
        this.hasChartData = false;
        this.destroyChart();
        this.chartError = 'Nao foi possivel carregar o grafico para o periodo informado.';
      }
    });
  }

  private loadCustomersByPeriodChart(): void {
    this.loadingCustomerChart = true;
    this.customerChartError = '';

    this.dashboardService.getCustomerByPeriod(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        const normalized = this.normalizeCustomerChartData(response);
        this.hasCustomerChartData = normalized.length > 0;
        this.renderCustomersPieChart(normalized);
        this.loadingCustomerChart = false;
      },
      error: () => {
        this.loadingCustomerChart = false;
        this.hasCustomerChartData = false;
        this.destroyCustomersChart();
        this.customerChartError = 'Nao foi possivel carregar o grafico de clientes para o periodo informado.';
      }
    });
  }

  private loadTotalValue(): void {

    this.dashboardService.getValueTotalByPeriod(this.selectedMonth, this.selectedYear).subscribe({
      next: (response) => {
        this.valueTotal = response;
      },
      error: () => {
        console.log("Nao foi possível calcular o valor");
      }
    })
  }

  private normalizeChartData(data: DashboardVehicleByPeriod[]): DashboardVehicleByPeriod[] {
    return (data || []).filter(item =>
      !!item &&
      typeof item.description === 'string' &&
      item.description.trim().length > 0 &&
      typeof item.qtde === 'number' &&
      item.qtde > 0
    );
  }

  private normalizeCustomerChartData(data: DashboardCustomerByPeriod[]): DashboardCustomerByPeriod[] {
    return (data || []).filter(item =>
      !!item &&
      typeof item.name === 'string' &&
      item.name.trim().length > 0 &&
      typeof item.qtde === 'number' &&
      item.qtde > 0
    );
  }

  private renderVehiclesPieChart(data: DashboardVehicleByPeriod[]): void {
    const canvas = this.vehiclesPieChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.destroyChart();

    if (data.length === 0) {
      return;
    }

    this.vehiclesPieChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: data.map(item => item.description),
        datasets: [{
          data: data.map(item => item.qtde),
          backgroundColor: [
            '#2F4F7F',
            '#4CAF50',
            '#FF9800',
            '#E91E63',
            '#03A9F4',
            '#9C27B0',
            '#795548',
            '#00BCD4'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private renderCustomersPieChart(data: DashboardCustomerByPeriod[]): void {
    const canvas = this.customersPieChartRef?.nativeElement;
    if (!canvas) {
      return;
    }

    this.destroyCustomersChart();

    if (data.length === 0) {
      return;
    }

    this.customersPieChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: data.map(item => item.name),
        datasets: [{
          data: data.map(item => item.qtde),
          backgroundColor: [
            '#0EA5E9',
            '#14B8A6',
            '#F59E0B',
            '#F43F5E',
            '#8B5CF6',
            '#22C55E',
            '#F97316',
            '#6366F1'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  private destroyChart(): void {
    if (this.vehiclesPieChart) {
      this.vehiclesPieChart.destroy();
      this.vehiclesPieChart = undefined;
    }
  }

  private destroyCustomersChart(): void {
    if (this.customersPieChart) {
      this.customersPieChart.destroy();
      this.customersPieChart = undefined;
    }
  }

  private buildYears(): number[] {
    const startYear = 2026;
    const endYear = new Date().getFullYear() + 11;
    const years: number[] = [];

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.destroyCustomersChart();
  }
}
