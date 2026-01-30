import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ResetPasswordService {
  constructor(private http: HttpClient) { }

  resetPassword(id: string | number, password: string, confirmPassword: string): Observable<any> {
    const uri = 'api/auto/customer/reset-password/'+id;
    const body = { password: password, confirmPassword: confirmPassword };

    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' }, responseType: 'text' as 'json' }; 

    return this.http.put(uri, body, options);
  }
}
