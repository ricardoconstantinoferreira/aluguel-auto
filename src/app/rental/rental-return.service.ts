import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalReturnService {
  constructor(private http: HttpClient) {}

  listByStatus(status: number): Observable<any> {
    return this.http.get(`/api/auto/order/list-rent/${status}`);
  }

  returned(orderId: number): Observable<any> {
    return this.http.put(`/api/auto/order/returned/${orderId}`, {});
  }
}
