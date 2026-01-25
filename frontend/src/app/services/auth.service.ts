import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_URL = 'http://localhost:8080/api/auth/';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post(API_URL + 'signin', {
            username: credentials.username,
            password: credentials.password
        }).pipe(
            tap((res: any) => {
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('user', JSON.stringify(res));
                }
            })
        );
    }

    register(user: any): Observable<any> {
        return this.http.post(API_URL + 'signup', {
            username: user.username,
            email: user.email,
            password: user.password
        });
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }
}
