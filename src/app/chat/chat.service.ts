import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface ChatApiResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly uri = 'api/auto/assistent';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<ChatApiResponse> {
    let data = {
      message
    };

    return this.http.post<any>(this.uri, data);
  }

  
}
