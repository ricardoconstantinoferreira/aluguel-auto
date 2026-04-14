import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';

export interface DashboardVehicleByPeriod {
  description: string;
  qtde: number;
}

export interface DashboardCustomerByPeriod {
  name: string;
  qtde: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly baseUrl = '/api/auto/dashboard';

  constructor(private http: HttpClient) {}

  getModelsByPeriod(month: string, year: number): Observable<DashboardVehicleByPeriod[]> {
    const uri = `${this.baseUrl}/model-by-period/${month}/${year}`;
    return this.http.get<any[]>(uri).pipe(catchError(() => of([])));
  }

  getCustomerByPeriod(month: string, year: number): Observable<DashboardCustomerByPeriod[]> {
    const uri = `${this.baseUrl}/customer-by-period/${month}/${year}`;
    return this.http.get<any[]>(uri).pipe(catchError(() => of([])));
  }

  getValueTotalByPeriod(month: string, year: number): Observable<number> {
    const uri = `${this.baseUrl}/order-value-total/${month}/${year}`;
    return this.http.get<number>(uri).pipe(catchError(() => of(0)));
  }
}
