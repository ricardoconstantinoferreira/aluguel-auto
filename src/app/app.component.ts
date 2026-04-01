import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { CustomerChatComponent } from './chat/customer-chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, CustomerChatComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ferreira-auto';

  constructor(public authService: AuthService) {
  }

  logout() {
    this.authService.logout();
  }

  get canShowCustomerChat(): boolean {
    return this.authService.isLoggedIn && this.authService.isCustomerCommon;
  }
}
