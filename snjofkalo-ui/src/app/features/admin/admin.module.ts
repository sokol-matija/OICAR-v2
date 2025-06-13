import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminLogsComponent } from './admin-logs/admin-logs.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminItemsComponent } from './admin-items/admin-items.component';
import { PendingApprovalsComponent } from './pending-approvals/pending-approvals.component';
import { authGuard } from '../../core/guards/auth.guard';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {
    path: 'logs',
    component: AdminLogsComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'users',
    component: AdminUsersComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'items',
    component: AdminItemsComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'pending-approvals',
    component: PendingApprovalsComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: '',
    redirectTo: 'logs',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    AdminLogsComponent,
    AdminUsersComponent,
    AdminItemsComponent,
    PendingApprovalsComponent
  ]
})
export class AdminModule { } 