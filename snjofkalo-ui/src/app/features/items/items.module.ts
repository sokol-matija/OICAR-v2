import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemListComponent } from './item-list/item-list.component';
import { ItemRequestFormComponent } from './item-request-form/item-request-form.component';
import { SharedModule } from '../../shared/shared.module';
import { ItemsRoutingModule } from './items-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ItemsRoutingModule,
    SharedModule,
    ItemListComponent,
    ItemRequestFormComponent
  ]
})
export class ItemsModule { } 