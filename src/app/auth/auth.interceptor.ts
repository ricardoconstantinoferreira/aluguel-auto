import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { resolveApiRequestUrl } from '../shared/api-url.util';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const resolvedUrl = resolveApiRequestUrl(req.url);
    let cloned = resolvedUrl === req.url ? req : req.clone({ url: resolvedUrl });

    // Endpoints that should NOT receive Authorization header
    const publicPaths = ['api/auto/auth/login', '/api/auto/auth', '/api/auto/customer', '/api/reset-password'];
    const isPublic = publicPaths.some(p => cloned.url.includes(p));

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

    return next.handle(cloned).pipe(
      catchError(err => {
        if (err.status === 401 || err.status === 403) {
          this.auth.logout();
          this.router.navigate(['/login']);
        }
        throw err;
      })
    );
  }
}
