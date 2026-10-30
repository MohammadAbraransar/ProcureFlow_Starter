import { Component, computed, inject, signal } from '@angular/core';
import { AuthApiService } from '../../core/auth/auth-api.service';

interface ReviewItem {
  id: string; supplier: string; document: string; amount: string;
  issue: string; severity: 'Review' | 'Attention' | 'Ready';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand"><span class="brand-icon">P</span><span>procure<span class="brand-light">flow</span></span></div>
        <div class="workspace"><span class="workspace-label">WORKSPACE</span><strong>{{ activeWorkspaceName() }}</strong><small>Active workspace</small></div>
        <nav aria-label="Main navigation">
          <a class="nav-link active" href="#overview"><span>◫</span> Overview</a>
          <a class="nav-link" href="#quotations"><span>▤</span> Quotations <em>12</em></a>
          <a class="nav-link" href="#purchase-orders"><span>▣</span> Purchase orders</a>
          <a class="nav-link" href="#invoices"><span>▧</span> Invoices <em class="alert-count">3</em></a>
          <a class="nav-link" href="#suppliers"><span>♧</span> Suppliers</a>
        </nav>
        <div class="sidebar-bottom"><div class="help-card"><strong>Need a hand?</strong><p>Your procurement workspace, organised.</p><a href="mailto:support@procureflow.example">Contact support ↗</a></div><div class="profile"><div class="avatar">AD</div><div><strong>{{ accountEmail() }}</strong><small>Workspace member</small></div><span class="profile-menu">···</span></div></div>
      </aside>
      <main class="main" id="overview">
        <header class="topbar"><div class="breadcrumb">Workspace <span>/</span> Overview <a href="/workspaces">Switch workspace</a></div><div class="top-actions"><span class="demo-pill">DEMO DATA</span><button class="icon-btn" aria-label="Notifications">♧<i></i></button><div class="top-avatar">AD</div></div></header>
        <section class="page-heading"><div><p class="eyebrow">FRIDAY, 30 OCTOBER 2026</p><h1>Good morning, Admin <span>✦</span></h1><p class="subheading">Here’s what’s happening across your purchasing workflow.</p></div><button class="primary-btn" (click)="showNotice.set(true)">＋ New request</button></section>
        @if (showNotice()) { <div class="notice" role="status">This is a UI prototype. Creating live requests is not enabled yet.<button (click)="showNotice.set(false)" aria-label="Dismiss">×</button></div> }
        <section class="metrics" aria-label="Workspace summary">
          <article class="metric"><div class="metric-top"><span>Open quotations</span><span class="metric-icon blue">▤</span></div><strong>12</strong><small><b>4 new</b> this week</small><div class="mini-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article>
          <article class="metric"><div class="metric-top"><span>Pending approvals</span><span class="metric-icon amber">◷</span></div><strong>05</strong><small><b class="amber-text">2 need attention</b></small><div class="metric-foot"><span class="dot amber-dot"></span> Awaiting your review</div></article>
          <article class="metric"><div class="metric-top"><span>Purchase orders</span><span class="metric-icon violet">▣</span></div><strong>28</strong><small><b>8 active</b> this month</small><div class="metric-foot"><span class="dot violet-dot"></span> Across 9 suppliers</div></article>
          <article class="metric"><div class="metric-top"><span>Invoice exceptions</span><span class="metric-icon red">▧</span></div><strong>03</strong><small><b class="red-text">₹ 18,450</b> under review</small><div class="metric-foot"><span class="dot red-dot"></span> Price or quantity mismatch</div></article>
        </section>
        <section class="content-grid">
          <article class="panel activity-panel"><div class="panel-heading"><div><h2>Needs your attention</h2><p>Items that may need a decision</p></div><button class="text-btn" (click)="filter.set('All')">View all →</button></div>
            <div class="filters"><button [class.selected]="filter() === 'All'" (click)="filter.set('All')">All <span>4</span></button><button [class.selected]="filter() === 'Review'" (click)="filter.set('Review')">Review</button><button [class.selected]="filter() === 'Attention'" (click)="filter.set('Attention')">Attention</button></div>
            <div class="review-list">@for (item of filteredItems(); track item.id) { <div class="review-row"><div class="file-icon">{{ item.document === 'Invoice' ? '▧' : '▤' }}</div><div class="review-info"><strong>{{ item.supplier }}</strong><span>{{ item.id }} · {{ item.document }}</span><small>{{ item.issue }}</small></div><div class="review-right"><strong>{{ item.amount }}</strong><span [class]="'status status-' + item.severity.toLowerCase()">{{ item.severity }}</span></div><button class="row-more" aria-label="More options">···</button></div> }</div>
            <div class="panel-bottom">Showing sample records for demonstration</div>
          </article>
          <article class="panel snapshot-panel"><div class="panel-heading"><div><h2>Procurement snapshot</h2><p>Current month · October 2026</p></div><button class="more-btn" aria-label="More options">···</button></div><div class="spend-total"><span>Total committed spend</span><strong>₹ 8,42,600</strong><small>Illustrative demo figure</small></div><div class="chart" aria-label="Illustrative monthly spend chart"><div class="chart-y"><span>₹3L</span><span>₹2L</span><span>₹1L</span><span>₹0</span></div><div class="chart-bars"><div><i style="height:42%"></i><span>Jul</span></div><div><i style="height:58%"></i><span>Aug</span></div><div><i style="height:48%"></i><span>Sep</span></div><div><i class="current-bar" style="height:78%"></i><span>Oct</span></div></div></div><div class="snapshot-legend"><span><i></i> Purchase orders</span><span>Monthly view</span></div></article>
        </section>
        <section class="panel workflow-panel"><div class="panel-heading"><div><h2>Your purchasing workflow</h2><p>One connected process, from supplier quote to invoice check</p></div><span class="workflow-tag">HOW IT WORKS</span></div><div class="workflow"><div class="workflow-step"><span class="step-icon">▤</span><div><strong>Collect quotes</strong><small>Upload supplier offers</small></div></div><span class="workflow-arrow">→</span><div class="workflow-step"><span class="step-icon">⇄</span><div><strong>Compare terms</strong><small>Review like-for-like costs</small></div></div><span class="workflow-arrow">→</span><div class="workflow-step"><span class="step-icon">▣</span><div><strong>Approve & order</strong><small>Keep a clear decision trail</small></div></div><span class="workflow-arrow">→</span><div class="workflow-step"><span class="step-icon">✓</span><div><strong>Verify invoices</strong><small>Flag differences for review</small></div></div></div></section>
        <footer>ProcureFlow · Product development preview <span>Sample figures only · No live company data</span></footer>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  private readonly authApi = inject(AuthApiService);
  readonly activeWorkspaceName = signal('Loading workspace…');
  readonly accountEmail = signal('');
  readonly showNotice = signal(false);
  readonly filter = signal<'All' | 'Review' | 'Attention'>('All');
  readonly items: ReviewItem[] = [
    { id: 'QT-2026-014', supplier: 'Apex Industrial Supplies', document: 'Quotation', amount: '₹ 1,24,000', issue: 'Quote expires in 2 days', severity: 'Review' },
    { id: 'INV-2026-083', supplier: 'Metro Components Pvt Ltd', document: 'Invoice', amount: '₹ 48,500', issue: 'Unit price differs from approved terms', severity: 'Attention' },
    { id: 'QT-2026-011', supplier: 'Prime Steel Traders', document: 'Quotation', amount: '₹ 2,16,800', issue: 'Delivery timeline needs confirmation', severity: 'Review' },
    { id: 'INV-2026-079', supplier: 'KVR Packaging', document: 'Invoice', amount: '₹ 32,750', issue: 'Quantity variance detected', severity: 'Attention' }
  ];
  readonly filteredItems = computed(() => this.filter() === 'All' ? this.items : this.items.filter(item => item.severity === this.filter()));

  constructor() {
    this.authApi.me().subscribe({
      next: state => {
        this.accountEmail.set(state.user.email);
        const active = state.workspaces.find(workspace => workspace.id === state.activeWorkspaceId);
        this.activeWorkspaceName.set(active?.displayName ?? 'Choose a workspace');
      },
      error: () => { this.activeWorkspaceName.set('Workspace unavailable'); }
    });
  }
}
