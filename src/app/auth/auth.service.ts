import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Cliente } from '../clientes/cliente';
import { BuyService } from '../buy/buy.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'auth_token';
  private customerTypeKey = 'customer_type';

  constructor(
    private http: HttpClient,
    private buyService: BuyService
  ) { }

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
          localStorage.setItem('customer_name', cliente.name);
          localStorage.setItem('customer_email', cliente.email);
          localStorage.setItem('customer_id', cliente.id.toString());

          this.cartItems;

        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.customerTypeKey);
    localStorage.removeItem('customer_name');
    localStorage.removeItem('customer_email');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('cart_items');
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

  get cartItems() {
    return this.buyService.getCartItemsCount().subscribe((res: any) => {
      localStorage.setItem('cart_items', res.toString());
    });
  }

  get cartItemsCount(): number {
    const cartItems = localStorage.getItem('cart_items');
    return cartItems ? parseInt(cartItems, 10) : 0;
  }

  get isAdmin(): boolean {
    return localStorage.getItem(this.customerTypeKey) == "USER";
  }

  get isCustomerCommon(): boolean {
    return localStorage.getItem(this.customerTypeKey) == "CUSTOMER_COMMON";
  }


}
