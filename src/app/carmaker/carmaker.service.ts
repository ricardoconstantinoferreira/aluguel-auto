import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface Carmaker {
  id: number;
  descricao: string;
}

@Injectable({ providedIn: 'root' })
export class CarmakerService {
  private carmakers$ = new BehaviorSubject<Carmaker[]>([]);

  constructor(private http: HttpClient) {
    this.refresh();
  }

  getAll(): Observable<Carmaker[]> {
    return this.carmakers$.asObservable();
  }

  refresh(): void {
    const uri = 'api/auto/carmaker';
    this.http.get<Carmaker[]>(uri).pipe(catchError(() => of([]))).subscribe(list => this.carmakers$.next(list));
  }

  // backward-compatible direct list call
  list(): Observable<Carmaker[]> {
    const uri = 'api/auto/carmaker';
    return this.http.get<Carmaker[]>(uri).pipe(catchError(() => of([])));
  }

  create(payload: { descricao: string }): Observable<any> {
    const uri = 'api/auto/carmaker';
    const options = { headers: { 'Content-Type': 'application/json', 'Accept-Language': 'pt-BR' } };
    return this.http.post<Carmaker>(uri, payload, options).pipe(
      tap(created => {
        if (created && (created as any).id) {
          const current = this.carmakers$.getValue();
          this.carmakers$.next([...current, created]);
        } else {
          this.refresh();
        }
      })
    );
  }
}
