import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, of, tap } from 'rxjs';

export interface Categoria {
  id: number;
  descricao: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private categoria$ = new BehaviorSubject<Categoria[]>([]);

  constructor(private http: HttpClient) { }

  refresh(): void {
    const uri = "/api/auto/category";
    this.http.get<Categoria[]>(uri).pipe(catchError(() => of([]))).subscribe(list => this.categoria$.next(list));
  }

  list(): Observable<Categoria[]> {
    const uri = "/api/auto/category";
    return this.http.get<Categoria[]>(uri).pipe(catchError(() => of([])));
  }

  create(payload: { description: string }): Observable<any> {
      const uri = '/api/auto/category';
      const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
      return this.http.post<Categoria>(uri, payload, options).pipe(
        tap(created => {
          if (created && (created as any).id) {
            const current = this.categoria$.getValue();
            this.categoria$.next([...current, created]);
          } else {
            this.refresh();
          }
        })
      );
    }
  
    update(id: number, payload: { description: string }): Observable<any> {
      const uri = `/api/auto/category/${id}`;
      const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
      return this.http.put<Categoria>(uri, payload, options).pipe(
        tap(() => this.refresh())
      );
    }
  
    delete(id: number): Observable<any> {
      const uri = `/api/auto/category/${id}`;
      const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
      return this.http.delete<void>(uri, options).pipe(
        tap(() => this.refresh())
      );
    }


}
