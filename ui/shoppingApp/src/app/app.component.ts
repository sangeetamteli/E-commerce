import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { Notification, NotificationService } from './notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  isLoginPage = false;
  isAdminPage = false;
  toasts: Notification[] = []; // toast used to store active notifications.

  private notificationSubscription?: Subscription;

  constructor(private router: Router, private notificationService: NotificationService) {
    // some router events are notificationStart, notificationEnd
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage = event.urlAfterRedirects.startsWith('/login');
        this.isAdminPage = event.urlAfterRedirects.startsWith('/admin');
      }
    });
  }

  ngOnInit() {
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notification => {
      this.toasts.push(notification);
    });
  }

  ngOnDestroy() {
    this.notificationSubscription?.unsubscribe();
  }

  remove(toast: Notification) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}
