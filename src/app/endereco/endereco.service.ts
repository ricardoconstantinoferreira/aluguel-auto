import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EnderecoService {
  constructor(private http: HttpClient) {}

  getCustomer(customerId: number): Observable<any> {
    return this.http.get(`api/auto/customer/${customerId}`);
  }

  updateCustomer(customerId: number, payload: any): Observable<any> {
    return this.http.put(`api/auto/customer/${customerId}`, payload);
  }

  updatePassword(customerId: number, payload: any): Observable<any> {
    return this.http.put(`api/auto/customer/${customerId}/updated-password`, payload);
  }

  getAddress(customerId: number): Observable<any> {
    return this.http.get(`api/auto/address/customer/${customerId}`);
  }

  createAddress(payload: any): Observable<any> {
    return this.http.post('api/auto/address/', payload);
  }

  updateAddress(customerId: number, payload: any): Observable<any> {
    return this.http.put(`api/auto/address/customer/${customerId}`, payload);
  }

  getOrders(customerId: number): Observable<any> {
    return this.http.get(`api/auto/order/${customerId}`);
  }

  getOrderItems(orderId: number, customerId: number): Observable<any> {
    return this.http.get(`api/auto/order-items/order/customer/${orderId}/${customerId}`);
  }

  lookupCep(cep: string): Observable<any> {
    return this.http.get(`https://brasilapi.com.br/api/cep/v1/${cep}`);
  }
}
