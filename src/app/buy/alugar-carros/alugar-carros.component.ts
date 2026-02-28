import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ModelService } from 'src/app/model/model.service';

@Component({
  selector: 'app-alugar-carros',
  imports: [CommonModule, ReactiveFormsModule, MatPaginator],
  templateUrl: './alugar-carros.component.html',
  styleUrl: './alugar-carros.component.css'
})
export class AlugarCarrosComponent implements AfterViewInit {

  allData: any[] = [];
  pagedDate: any[] = [];
  pageSize = 10;
  currentPage = 0;
  totalItems: number = 0; 
  editingId: number | null = null;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showDeleteConfirmModal = false;
  pendingDeleteItem: any | null = null;

  constructor(
    private service: ModelService, private router: Router
  ){}

  ngAfterViewInit(): void {
    this.updatePagedData();
  }

  updatePagedData() {
    const offset = this.currentPage * this.pageSize;
    const limit = offset + this.pageSize;

    this.service.list().subscribe(data => {
      this.allData = data;
      this.totalItems = this.allData.length;
      this.pagedDate = this.allData.slice(offset, limit);
    });
  }

   onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedData();
  }
}
