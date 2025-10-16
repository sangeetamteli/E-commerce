import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';// to make http requests
import { Observable, BehaviorSubject } from 'rxjs';//keep track of current logged in user
import { tap } from 'rxjs/operators';//login success-> it saves user info,...

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'User' | 'Admin';
}

export interface LoginResponse { // structure of backend login
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/api/auth/login';
    private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());

    constructor(private http: HttpClient) { }

    // makes post request backend with email,password pipe attaches tap without subscribing(used only in component)
    login(email: string, password: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.apiUrl, { email, password }).pipe(
            tap((res) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    private getStoredUser(): User | null {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    }

    getLoggedInAdminId(): number | null {
        const user = this.getCurrentUser();
        return user?.role === 'Admin' ? user.id : null;
    }
}
