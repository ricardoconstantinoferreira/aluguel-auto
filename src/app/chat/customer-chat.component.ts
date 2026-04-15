import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ChatApiResponse, ChatService } from './chat.service';

interface ChatMessage {
  author: 'customer' | 'bot';
  text: string;
}

@Component({
  selector: 'app-customer-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-chat.component.html',
  styleUrls: ['./customer-chat.component.css']
})
export class CustomerChatComponent {
  isOpen = false;
  isLoading = false;
  message = '';
  messages: ChatMessage[] = [
    {
      author: 'bot',
      text: 'Oi! Como posso te ajudar com sua locacao hoje?'
    }
  ];

  constructor(private chatService: ChatService) {}

  toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }

  send(): void {
    const content = (this.message || '').trim();
    if (!content || this.isLoading) {
      return;
    }

    this.messages.push({ author: 'customer', text: content });
    this.message = '';
    this.isLoading = true;

    this.resolveApiCall(content).subscribe({
      next: (response) => {
        this.messages.push({ author: 'bot', text: response.message });
        this.isLoading = false;
      },
      error: (data) => {
        this.messages.push({
          author: 'bot',
          text: 'Nao consegui responder agora. Tente novamente em instantes.'
        });
        this.isLoading = false;
      }
    });
  }

  private resolveApiCall(message: string): Observable<ChatApiResponse> {
    if (this.isRentIntent(message)) {
      return this.chatService.rent(message);
    }

    return this.chatService.ask(message);
  }

  private isRentIntent(message: string): boolean {
    const normalizedMessage = (message || '').toLowerCase();
    const rentKeywords = [
      'alugar',
      'aluguel',
      'locar',
      'locacao',
      'reservar',
      'reserva',
      'fechar locacao',
      'quero esse carro',
      'quero alugar'
    ];

    return rentKeywords.some((keyword) => normalizedMessage.includes(keyword));
  }
}
