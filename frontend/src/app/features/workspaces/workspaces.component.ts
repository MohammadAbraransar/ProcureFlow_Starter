import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthApiService, Workspace } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-workspaces', standalone: true, imports: [FormsModule],
  template: `
    <main class="workspace-page"><header><a class="brand" href="/workspaces"><span>P</span> procure<strong>flow</strong></a><button class="signout" (click)="signOut()">Sign out</button></header>
      <section class="workspace-content"><span class="eyebrow">YOUR ORGANISATION</span><h1>Choose a workspace</h1><p class="muted">Select the company context you want to work in. Your company data is separated by workspace.</p>
        @if (error()) { <div class="error" role="alert">{{ error() }}</div> }
        <div class="workspace-list">@for (item of workspaces(); track item.id) { <button class="workspace-card" (click)="select(item)"><span class="workspace-avatar">{{ initials(item.displayName) }}</span><span class="workspace-copy"><strong>{{ item.displayName }}</strong><small>{{ item.legalName }} · {{ item.role }}</small></span><span class="arrow">→</span></button> }</div>
        <section class="create-card"><h2>Create another workspace</h2><p class="muted">For a separate legal entity or business unit.</p><label>Legal company name<input [(ngModel)]="legalName" name="legalName" placeholder="Legal registered name"></label><label>Workspace name<input [(ngModel)]="displayName" name="displayName" placeholder="Team or company name"></label><button class="create-button" [disabled]="saving()" (click)="create()">{{ saving() ? 'Creating…' : '＋ Create workspace' }}</button></section>
        <p class="footnote">Only workspaces where your account has an active membership are shown.</p>
      </section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:#f5f7f8;color:#172334;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.workspace-page header{height:72px;background:#fff;border-bottom:1px solid #e8edef;display:flex;align-items:center;justify-content:space-between;padding:0 6%}.brand{font-size:20px;font-weight:800;text-decoration:none;color:#173448}.brand span{display:inline-grid;place-items:center;background:#147e6c;color:#fff;width:29px;height:29px;border-radius:8px;margin-right:8px}.brand strong{font-weight:400;color:#6d8581}.signout{border:0;background:transparent;color:#667788;cursor:pointer}.workspace-content{width:min(100% - 36px,650px);margin:64px auto}.eyebrow{font-size:10px;font-weight:800;letter-spacing:1.5px;color:#138b76}.workspace-content h1{font-size:34px;letter-spacing:-1.3px;margin:12px 0}.muted{color:#748391;font-size:13px;line-height:1.7}.workspace-list{display:grid;gap:10px;margin:28px 0}.workspace-card{width:100%;display:flex;align-items:center;gap:14px;text-align:left;background:#fff;border:1px solid #e2e9eb;border-radius:10px;padding:17px;cursor:pointer}.workspace-card:hover{border-color:#178c78;box-shadow:0 5px 20px #1734480b}.workspace-avatar{width:42px;height:42px;border-radius:10px;background:#e8f4f1;color:#147b6a;display:grid;place-items:center;font-weight:800}.workspace-copy{display:grid;gap:5px;flex:1}.workspace-copy strong{font-size:13px}.workspace-copy small{font-size:11px;color:#83909b}.arrow{font-size:20px;color:#138b76}.create-card{background:#fff;border:1px solid #e2e9eb;border-radius:10px;padding:22px;margin-top:30px}.create-card h2{font-size:16px;margin:0}.create-card label{display:grid;gap:7px;margin:14px 0;font-size:11px;font-weight:700;color:#425365}.create-card input{height:42px;border:1px solid #dce4e8;border-radius:7px;padding:0 11px;font:inherit}.create-button{background:#147e6c;color:#fff;border:0;border-radius:7px;padding:12px 16px;font-weight:700;cursor:pointer}.create-button:disabled{opacity:.6}.footnote{font-size:10px;color:#9aa5ae;margin-top:22px}.error{background:#fff0ef;color:#a7352d;padding:10px;border-radius:7px;font-size:12px}
  `]
})
export class WorkspacesComponent {
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);
  readonly workspaces = signal<Workspace[]>([]);
  readonly error = signal('');
  readonly saving = signal(false);
  legalName = ''; displayName = '';

  constructor() { this.load(); }
  load(): void {
    this.api.me().subscribe({ next: data => this.workspaces.set(data.workspaces), error: () => void this.router.navigateByUrl('/login') });
  }
  initials(value: string): string { return value.split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase(); }
  select(item: Workspace): void {
    this.api.selectWorkspace(item.id).subscribe({ next: () => void this.router.navigateByUrl('/'), error: () => this.error.set('Could not select that workspace. Refresh and try again.') });
  }
  create(): void {
    this.error.set('');
    if (this.legalName.trim().length < 2 || this.displayName.trim().length < 2) { this.error.set('Enter both company names.'); return; }
    this.saving.set(true);
    this.api.createWorkspace(this.legalName.trim(), this.displayName.trim()).subscribe({
      next: item => { this.saving.set(false); this.workspaces.update(items => [...items, item]); this.legalName = ''; this.displayName = ''; },
      error: () => { this.saving.set(false); this.error.set('Workspace could not be created. Please try again.'); }
    });
  }
  signOut(): void { this.api.logout().subscribe({ next: () => void this.router.navigateByUrl('/login'), error: () => void this.router.navigateByUrl('/login') }); }
}
