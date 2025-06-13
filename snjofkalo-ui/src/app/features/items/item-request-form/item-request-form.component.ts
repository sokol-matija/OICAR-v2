import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemsService } from '../../../core/services/items.service';
import { ItemWithDetails } from '../../../core/models/item.model';

interface ItemRequestFormData extends Partial<ItemWithDetails> {
  agreeToTerms: boolean;
}

@Component({
  selector: 'app-item-request-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './item-request-form.component.html',
  styleUrls: ['./item-request-form.component.css']
})
export class ItemRequestFormComponent implements OnInit {
  @Input() showForm: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  item: ItemRequestFormData = {
    title: '',
    description: '',
    price: undefined,
    stockQuantity: undefined,
    itemCategoryID: 0,
    isActive: true,
    isApproved: false,
    itemStatus: 'Pending',
    isUserGenerated: true,
    needsApproval: true,
    agreeToTerms: false,
    images: []
  };

  categories: { idItemCategory: number; categoryName: string; }[] = [];
  successMessage = '';
  errorMessage = '';
  selectedFileNames: string[] = [];

  constructor(
    private itemsService: ItemsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.itemsService.getCategories().subscribe(
      (categories: { idItemCategory: number; categoryName: string; }[]) => {
        this.categories = categories;
      },
      (error: any) => {
        console.error('Error loading categories:', error);
        this.errorMessage = 'Failed to load categories. Please try again.';
      }
    );
  }

  triggerImageInput(): void {
    const fileInput = document.getElementById('image') as HTMLInputElement;
    fileInput?.click();
  }

  onFilesSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput.files;
    
    if (files && files.length > 0) {
      this.selectedFileNames = [];
      this.item.images = [];

      Array.from(files).forEach((file, index) => {
        this.selectedFileNames.push(file.name);
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const base64String = e.target?.result as string;
          const base64Data = base64String.split(',')[1];
          
          this.item.images?.push({
            imageData: base64Data,
            fileName: file.name,
            contentType: file.type,
            imageOrder: index,
            createdAt: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onSubmit(): void {
    if (!this.item.title || !this.item.description || !this.item.price || 
        !this.item.stockQuantity || !this.item.itemCategoryID || !this.item.images || this.item.images.length === 0) {
      this.errorMessage = 'Please fill in all required fields and select at least one image.';
      return;
    }

    const itemToSubmit: Partial<ItemWithDetails> = {
      title: this.item.title,
      description: this.item.description,
      price: this.item.price,
      stockQuantity: this.item.stockQuantity,
      itemCategoryID: Number(this.item.itemCategoryID),
      isActive: this.item.isActive,
      isApproved: this.item.isApproved,
      itemStatus: this.item.itemStatus,
      isUserGenerated: this.item.isUserGenerated,
      needsApproval: this.item.needsApproval,
      images: this.item.images
    };


    this.itemsService.createItemRequest(itemToSubmit).subscribe(
      response => {
        this.successMessage = 'Item request submitted successfully!';
        setTimeout(() => {
          this.submitted.emit();
        }, 1500);
      },
      error => {
        console.error('Error submitting item request:', error);
        this.errorMessage = error.error?.message || 'Failed to submit item request. Please try again.';
      }
    );
  }

  onDiscard(): void {
    this.close.emit();
  }
}
