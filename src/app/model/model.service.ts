import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModelService {
  constructor(private http: HttpClient) { }

  create(formData: FormData): Observable<any> {
    const uri = '/api/auto/model';
    return this.http.post(uri, formData);
  }
}
