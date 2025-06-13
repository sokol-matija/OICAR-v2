import { Routes } from '@angular/router';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./item-list/item-list.component').then(m => m.ItemListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./item-details/item-details.component').then(m => m.ItemDetailsComponent)
  }
]; 