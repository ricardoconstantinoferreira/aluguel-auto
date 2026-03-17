import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface RulePayload {
  percentageInterest: number | string;
  qtdeDaysRent: number | string;
}

@Injectable({
  providedIn: 'root'
})
export class RuleService {
  private readonly uri = '/api/auto/rental';

  constructor(private http: HttpClient) {}

  save(payload: RulePayload): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.post(this.uri, payload, options);
  }

  get(): Observable<any> {
    return this.http.get(this.uri);
  }

  update(payload: RulePayload, id: number): Observable<any> {
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    let uri = `/api/auto/rental/${id}`;
    return this.http.put(uri, payload, options);
  } 
}
