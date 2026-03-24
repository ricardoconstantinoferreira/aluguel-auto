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

    // Keep only specific unauthenticated routes public.
    const requestPath = this.normalizePath(cloned.url);
    const isPublicAuth = requestPath === '/api/auto/auth/login' || requestPath === '/api/auto/auth';
    const isPublicCustomerCreate = requestPath === '/api/auto/customer' && cloned.method === 'POST';
    const isPublicResetPassword = requestPath.startsWith('/api/auto/customer/reset-password') || requestPath.startsWith('/api/reset-password');
    const isPublic = isPublicAuth || isPublicCustomerCreate || isPublicResetPassword;

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

  private normalizePath(url: string): string {
    const withoutQuery = (url || '').split('?')[0].split('#')[0];
    const withoutOrigin = withoutQuery.replace(/^https?:\/\/[^/]+/i, '');
    const withLeadingSlash = withoutOrigin.startsWith('/') ? withoutOrigin : `/${withoutOrigin}`;
    const trimmed = withLeadingSlash.replace(/\/+$/, '');
    return trimmed || '/';
  }
}
