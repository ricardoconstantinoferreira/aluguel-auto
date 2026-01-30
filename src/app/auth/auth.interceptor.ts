import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let cloned = req;

    // Endpoints that should NOT receive Authorization header
    const publicPaths = ['api/auto/auth/login', '/api/auto/auth', '/api/auto/customer', '/api/reset-password'];
    const isPublic = publicPaths.some(p => req.url.includes(p));

    const token = this.auth.token;
    if (token && !isPublic) {
      cloned = cloned.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // remove Authorization header if present for public endpoints
      if (cloned.headers.has('Authorization') && isPublic) {
        cloned = cloned.clone({ headers: cloned.headers.delete('Authorization') });
      }
    }

    // Ensure Accept-Language header is present (can be overridden by explicit request options)
    if (!cloned.headers.has('Accept-Language')) {
      cloned = cloned.clone({
        setHeaders: { 'Accept-Language': 'pt-BR' }
      });
    }

    return next.handle(cloned);
  }
}
