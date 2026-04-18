import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CadastroService {

  constructor(private http: HttpClient) { }

  create(payload: { id?: number; typeExpensesId: number; modelId: number; value: number }): Observable<any> {
    const uri = '/api/auto/expenses';
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.post(uri, payload, options);
  }
}
