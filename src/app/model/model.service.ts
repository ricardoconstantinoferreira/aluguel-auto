import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModelService {
  constructor(private http: HttpClient) { }

  create(formData: FormData): Observable<any> {
    const uri = 'api/auto/model';
    // Don't set Content-Type header for FormData; browser will set the boundary
    const options = { headers: new HttpHeaders({ 'Accept-Language': 'pt-BR' }) };
    return this.http.post(uri, formData, options);
  }
}
