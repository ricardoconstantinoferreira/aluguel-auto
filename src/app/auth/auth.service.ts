import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Cliente } from '../clientes/cliente';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private customerTypeKey = 'customer_type';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    const uri = 'api/auto/auth/login';
    let data = {
      email: email,
      password: password
    };
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' }, responseType: 'text' as 'json' }; 
    return this.http.post<any>(uri, data, options).pipe(
      tap(res => {
        const cliente: Cliente = JSON.parse(res);

        if (cliente && cliente.token) {
          localStorage.setItem(this.tokenKey, cliente.token);
          localStorage.setItem(this.customerTypeKey, cliente.customerType);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerTypeKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get customerType(): string | null {
    return localStorage.getItem(this.customerTypeKey);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}
