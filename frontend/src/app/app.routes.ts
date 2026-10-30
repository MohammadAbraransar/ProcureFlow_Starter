import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthComponent } from './features/auth/auth.component';
import { WorkspacesComponent } from './features/workspaces/workspaces.component';
import { AuthApiService } from './core/auth/auth-api.service';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';

const requireSession = () => {
  const auth = inject(AuthApiService);
  const router = inject(Router);
  return auth.me().pipe(
    map(state => state.activeWorkspaceId ? true : router.parseUrl('/workspaces')),
    catchError(() => of(router.parseUrl('/login')))
  );
};

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent, data: { register: true } },
  { path: 'workspaces', component: WorkspacesComponent },
  { path: '', component: DashboardComponent, canActivate: [requireSession] },
  { path: '**', redirectTo: '' }
];
