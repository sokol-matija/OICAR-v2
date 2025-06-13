import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminLogsComponent } from './admin-logs.component';
import { AdminService } from '../../../core/services/admin.service';
import { TestModule } from '../../../../test.module';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

describe('AdminLogsComponent', () => {
  let component: AdminLogsComponent;
  let fixture: ComponentFixture<AdminLogsComponent>;
  let mockAdminService: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    mockAdminService = jasmine.createSpyObj('AdminService', ['getLogs']);

    await TestBed.configureTestingModule({
      imports: [
        AdminLogsComponent,
        TestModule,
        ToastModule
      ],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLogsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
