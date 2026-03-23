import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  constructor(private http: HttpClient) { }

  create(cliente: any): Observable<any> {
    let uri = 'api/auto/customer';
    const resolvedUrl = `${environment.apiBaseUrl.replace(/\/+$/, '')}/${uri.replace(/^\/+/, '')}`;
    console.log('[ClientesService] URL cadastro cliente:', resolvedUrl);

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
