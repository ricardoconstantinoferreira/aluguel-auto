import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';

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
        debugger;
        if (res) {
          localStorage.setItem(this.tokenKey, res);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }
}
