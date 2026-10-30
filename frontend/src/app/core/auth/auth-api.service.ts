import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface Workspace {
  id: string; legalName: string; displayName: string; role: string; status: string;
}
export interface AuthState {
  user: { id: string; email: string };
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';
  private csrfToken: string | null = null;

  private csrf(): Observable<{ headerName: string; token: string }> {
    return this.http.get<{ headerName: string; token: string }>(`${this.api}/auth/csrf`, { withCredentials: true });
  }

  private postWithCsrf<T>(url: string, body: unknown): Observable<T> {
    return this.csrf().pipe(switchMap(({ headerName, token }) => {
      this.csrfToken = token;
      return this.http.post<T>(url, body, {
        withCredentials: true,
        headers: new HttpHeaders({ [headerName]: token })
      });
    }));
  }

  register(payload: { email: string; password: string; legalCompanyName: string; workspaceName: string }): Observable<{ message: string }> {
    return this.postWithCsrf(`${this.api}/auth/register`, payload);
  }

  login(email: string, password: string): Observable<AuthState> {
    return this.postWithCsrf<AuthState>(`${this.api}/auth/login`, { email, password });
  }

  me(): Observable<AuthState> {
    return this.http.get<AuthState>(`${this.api}/auth/me`, { withCredentials: true });
  }

  workspaces(): Observable<Workspace[]> {
    return this.http.get<Workspace[]>(`${this.api}/workspaces`, { withCredentials: true });
  }

  selectWorkspace(workspaceId: string): Observable<{ message: string }> {
    return this.postWithCsrf(`${this.api}/workspaces/select`, { workspaceId });
  }

  createWorkspace(legalName: string, displayName: string): Observable<Workspace> {
    return this.postWithCsrf(`${this.api}/workspaces`, { legalName, displayName });
  }

  logout(): Observable<{ message: string }> {
    return this.postWithCsrf(`${this.api}/auth/logout`, {});
  }
}
