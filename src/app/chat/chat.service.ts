import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatApiResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly uriAsk = 'api/auto/assistent/ask';
  private readonly uriRent = 'api/auto/assistent/rent';

  constructor(private http: HttpClient) {}

  ask(message: string): Observable<ChatApiResponse> {
    const data = {
      message
    };

    return this.http.post<ChatApiResponse>(this.uriAsk, data);
  }

  rent(message: string): Observable<ChatApiResponse> {
    const data = {
      message
    };

    return this.http.post<ChatApiResponse>(this.uriRent, data);
  }
}
