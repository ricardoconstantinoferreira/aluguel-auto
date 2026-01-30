import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private http: HttpClient) { }

  create(cliente: any): Observable<any> {
    let uri = 'api/auto/customer';

    let data = {
      "name": cliente.nome,
      "email": cliente.email,
      "document": cliente.documento,
      "customerType": cliente.tipo
    };

    const options = { headers: { 'Content-Type': 'application/json',  'Accept-Language': 'pt-BR'} };
    return this.http.post(uri, data, options);
  }
}
