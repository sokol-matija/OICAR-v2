import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemRequestFormComponent } from './item-request-form.component';
import { ItemsService } from '../../../core/services/items.service';
import { TestModule } from '../../../../test.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('ItemRequestFormComponent', () => {
  let component: ItemRequestFormComponent;
  let fixture: ComponentFixture<ItemRequestFormComponent>;
  let mockItemsService: jasmine.SpyObj<ItemsService>;

  beforeEach(async () => {
    mockItemsService = jasmine.createSpyObj('ItemsService', ['requestItem']);

    await TestBed.configureTestingModule({
      imports: [
        ItemRequestFormComponent,
        TestModule,
        ToastModule
      ],
      providers: [
        { provide: ItemsService, useValue: mockItemsService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemRequestFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
