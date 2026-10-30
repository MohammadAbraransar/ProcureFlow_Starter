import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthApiService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'app-auth', standalone: true, imports: [FormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-brand"><a class="auth-logo" routerLink="/login"><span>P</span> procure<strong>flow</strong></a><div class="auth-pitch"><span class="auth-kicker">PROCUREMENT, WITH CLARITY</span><h1>Better decisions<br>start with <em>better data.</em></h1><p>Bring supplier quotations, purchase orders and invoices into one reviewable workflow.</p><div class="auth-points"><span>✓ Human-reviewed AI extraction</span><span>✓ Clear supplier comparisons</span><span>✓ A traceable decision history</span></div></div><small class="auth-brand-foot">ProcureFlow · Early access</small></section>
      <section class="auth-form-wrap"><div class="auth-form-card">
        <div class="auth-mobile-logo">P&nbsp; procure<strong>flow</strong></div>
        <span class="auth-kicker">{{ registerMode() ? 'CREATE YOUR WORKSPACE' : 'WELCOME BACK' }}</span>
        <h2>{{ registerMode() ? 'Start your workspace' : 'Sign in to ProcureFlow' }}</h2>
        <p class="auth-intro">{{ registerMode() ? 'Set up your company account to get started.' : 'Use your company account to continue.' }}</p>
        @if (registerMode()) {
          <label>Company legal name<input name="legalName" [(ngModel)]="legalCompanyName" autocomplete="organization" placeholder="Example Manufacturing Pvt Ltd"></label>
          <label>Workspace name<input name="workspaceName" [(ngModel)]="workspaceName" placeholder="Example Manufacturing"></label>
        }
        <label>Work email<input name="email" type="email" [(ngModel)]="email" autocomplete="email" placeholder="you@company.com"></label>
        <label>Password<input name="password" type="password" [(ngModel)]="password" [attr.autocomplete]="registerMode() ? 'new-password' : 'current-password'" placeholder="{{ registerMode() ? 'At least 12 characters' : 'Your password' }}"></label>
        @if (error()) { <div class="auth-error" role="alert">{{ error() }}</div> }
        @if (notice()) { <div class="auth-success" role="status">{{ notice() }}</div> }
        <button class="auth-submit" [disabled]="loading()" (click)="submit()">{{ loading() ? 'Please wait…' : (registerMode() ? 'Create company account' : 'Sign in') }}</button>
        <p class="auth-switch">{{ registerMode() ? 'Already have an account?' : 'New to ProcureFlow?' }} <button (click)="toggleMode()">{{ registerMode() ? 'Sign in' : 'Create an account' }}</button></p>
        <p class="auth-legal">By continuing, you agree to use this early-access service responsibly. Company documents should only be uploaded after the product's production security review.</p>
      </div></section>
    </main>
  `,
  styles: [`
    :host{display:block;min-height:100vh;color:#172334;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.auth-shell{min-height:100vh;display:grid;grid-template-columns:minmax(320px, .92fr) 1.08fr;background:#fff}.auth-brand{background:#102b3b;color:#fff;padding:42px 8%;display:flex;flex-direction:column;justify-content:space-between}.auth-logo{font-size:21px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:-.7px}.auth-logo span,.auth-mobile-logo{color:#1b9b83}.auth-logo strong,.auth-mobile-logo strong{font-weight:400;color:#a8c9c4}.auth-logo span{display:inline-grid;place-items:center;background:#1b9b83;color:#fff;border-radius:9px;width:30px;height:30px;margin-right:9px}.auth-pitch{max-width:460px;margin:70px auto}.auth-kicker{font-size:10px;font-weight:800;letter-spacing:1.8px;color:#15977e}.auth-pitch .auth-kicker{color:#79c7b6}.auth-pitch h1{font-size:clamp(38px,4.3vw,60px);line-height:1.08;letter-spacing:-2.4px;margin:20px 0}.auth-pitch h1 em{font-style:normal;color:#77c5b4}.auth-pitch p{color:#b5c6ce;line-height:1.8;max-width:370px}.auth-points{display:grid;gap:16px;margin-top:38px;color:#e0e9ec;font-size:13px}.auth-brand-foot{color:#8da5b0;font-size:11px}.auth-form-wrap{display:grid;place-items:center;padding:42px 24px}.auth-form-card{width:min(100%,420px)}.auth-form-card h2{font-size:29px;letter-spacing:-1px;margin:14px 0 8px}.auth-intro{color:#718091;font-size:13px;margin:0 0 28px}.auth-form-card label{display:grid;gap:8px;margin:17px 0;font-size:12px;font-weight:700;color:#344456}.auth-form-card input{height:46px;border:1px solid #dbe2e8;border-radius:8px;padding:0 13px;font:inherit;font-weight:400;outline:none}.auth-form-card input:focus{border-color:#168e7a;box-shadow:0 0 0 3px #168e7a18}.auth-submit{width:100%;height:48px;background:#117d6c;color:#fff;border:0;border-radius:8px;font-weight:700;margin-top:8px;cursor:pointer}.auth-submit:disabled{opacity:.6;cursor:wait}.auth-switch{text-align:center;color:#758292;font-size:12px;margin-top:22px}.auth-switch button{border:0;background:none;color:#117d6c;font-weight:700;cursor:pointer}.auth-legal{font-size:10px;line-height:1.6;color:#96a1ad;margin-top:38px;text-align:center}.auth-error,.auth-success{padding:11px 12px;border-radius:7px;font-size:12px;margin:12px 0}.auth-error{background:#fff0ef;color:#a7352d}.auth-success{background:#eaf7f2;color:#176b53}.auth-mobile-logo{display:none;font-weight:800;margin-bottom:30px}.auth-mobile-logo strong{color:#68827e}@media(max-width:760px){.auth-shell{grid-template-columns:1fr}.auth-brand{display:none}.auth-form-wrap{min-height:100vh;align-items:center}.auth-mobile-logo{display:block}}
  `]
})
export class AuthComponent {
  private readonly api = inject(AuthApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly registerMode = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  email = ''; password = ''; legalCompanyName = ''; workspaceName = '';

  constructor() { this.registerMode.set(this.route.snapshot.data['register'] === true); }

  toggleMode(): void { this.registerMode.update(v => !v); this.error.set(''); this.notice.set(''); }
  submit(): void {
    this.error.set(''); this.notice.set('');
    if (!this.email.trim() || !this.password) { this.error.set('Enter your work email and password.'); return; }
    this.loading.set(true);
    if (this.registerMode()) {
      if (!this.legalCompanyName.trim() || !this.workspaceName.trim()) { this.loading.set(false); this.error.set('Enter your company legal name and workspace name.'); return; }
      this.api.register({ email: this.email.trim(), password: this.password, legalCompanyName: this.legalCompanyName.trim(), workspaceName: this.workspaceName.trim() }).subscribe({
        next: result => { this.loading.set(false); this.registerMode.set(false); this.password = ''; this.notice.set(result.message); },
        error: err => { this.loading.set(false); this.error.set(err?.status === 409 ? 'An account with this email already exists.' : err?.status === 0 ? 'Cannot reach the API. Start the backend and try again.' : 'Could not create the account. Check the details and try again.'); }
      });
    } else {
      this.api.login(this.email.trim(), this.password).subscribe({
        next: () => { this.loading.set(false); void this.router.navigateByUrl('/workspaces'); },
        error: err => { this.loading.set(false); this.error.set(err?.status === 401 ? 'Email or password is incorrect.' : err?.status === 0 ? 'Cannot reach the API. Start the backend and try again.' : 'Sign-in failed. Please try again.'); }
      });
    }
  }
}
