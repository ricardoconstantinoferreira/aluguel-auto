import { Component, OnInit } from '@angular/core';
import { RulePayload, RuleService } from '../rule.service';

@Component({
  selector: 'app-rules',
  standalone: false,
  templateUrl: './rules.component.html',
  styleUrl: './rules.component.css'
})
export class RulesComponent implements OnInit {
  formData = {
    id: 0,
    percentageInterest: '',
    qtdeDaysRent: ''
  };

  savedData = {
    id: 0,
    percentageInterest: '',
    qtdeDaysRent: ''
  };

  isViewMode = false;
  dataUnique = false;

  constructor(private ruleService: RuleService) {}

  ngOnInit(): void {
    this.ruleService.get().subscribe({
      next: response => {
        const data = this.extractRuleData(response);
    
        if (!data) {
          return;
        }

        this.savedData = {
          id: Number(data.id ?? ''),
          percentageInterest: String(data.percentageInterest ?? ''),
          qtdeDaysRent: String(data.qtdeDaysRent ?? '')
        };

        if (this.savedData.percentageInterest && this.savedData.qtdeDaysRent) {
          this.isViewMode = true;
          this.dataUnique = true;
        }
      },
      error: err => {
        console.error('Erro ao buscar regras de locacao', err);
      }
    });
  }

  onSave(): void {
    if (!this.formData.percentageInterest || !this.formData.qtdeDaysRent) {
      return;
    }

    const payload: RulePayload = {
      percentageInterest: this.formData.percentageInterest,
      qtdeDaysRent: this.formData.qtdeDaysRent
    };

    this.ruleService.save(payload).subscribe({
      next: (data) => {
        this.savedData = { ...this.formData };
        this.savedData.id = data.id;
        this.isViewMode = true;
        this.dataUnique = true;
      },
      error: err => {
        console.error('Erro ao salvar regras de locacao', err);
      }
    });
  }

  update(): void {
    this.isViewMode = false;
    const payload: RulePayload = {
      percentageInterest: this.formData.percentageInterest,
      qtdeDaysRent: this.formData.qtdeDaysRent
    };
    const id = this.formData.id;

    this.ruleService.update(payload, id).subscribe({
      next: () => {
        this.savedData = { ...this.formData };
        this.isViewMode = true;
        this.dataUnique = true;
      },
      error: err => {
        console.error('Erro ao alterar regras de locacao', err);
      }
    });
  }

  onUpdate(): void {
    this.formData = { ...this.savedData };
    this.isViewMode = false;
    this.dataUnique = true;
  }

  private extractRuleData(response: any): any | null {
    if (!response) {
      return null;
    }

    if (Array.isArray(response)) {
      return response.length ? response[0] : null;
    }

    return response;
  }

}
