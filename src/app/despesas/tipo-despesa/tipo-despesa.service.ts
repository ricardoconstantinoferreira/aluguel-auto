import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of } from 'rxjs';

export interface TipoDespesa {
  id: number;
  description?: string;
  descricao?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TipoDespesaService {
  private readonly uri = '/api/auto/expenses-type';

  constructor(private http: HttpClient) { }

  list(): Observable<TipoDespesa[]> {
    return this.http.get<TipoDespesa[]>(this.uri).pipe(catchError(() => of([])));
  }

  create(payload: { description: string }): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.post<TipoDespesa>(this.uri, payload, options);
  }

  update(id: number, payload: { description: string }): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.put<TipoDespesa>(`${this.uri}/${id}`, payload, options);
  }

  delete(id: number): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.delete<void>(`${this.uri}/${id}`, options);
  }
}
