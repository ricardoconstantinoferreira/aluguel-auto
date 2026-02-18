import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { Model } from './model.interface';

@Injectable({ providedIn: 'root' })
export class ModelService {
  constructor(private http: HttpClient) { }

  create(formData: FormData): Observable<any> {
    const uri = '/api/auto/model';
    return this.http.post(uri, formData);
  }

  list(): Observable<Model[]> {
    const uri = '/api/auto/model';
    return this.http.get<Model[]>(uri).pipe(catchError(() => of([])));
  }

  inactivate(id: number): Observable<any> {
    const uri = `/api/auto/model/${id}/inactive`;
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.patch(uri, {}, options);
  }
}
