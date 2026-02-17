import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { PetService } from '../../../servises/pet';

type AdoptionFormControls = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  age: FormControl<number | null>;
  petsAtHome: FormControl<string>;
  hasSmallChildren: FormControl<string>;
  sterilizationAttitude: FormControl<string>;
  plannedFood: FormControl<string>;
  illnessActions: FormControl<string>;
  phone: FormControl<string>;
  consent: FormControl<boolean>;
};

@Component({
  selector: 'app-adoption-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './adoption-form.html',
  styleUrl: './adoption-form.scss',
})
export class AdoptionForm implements OnInit {
  readonly petId = this.route.snapshot.paramMap.get('id') ?? '';
  petName = '';

  readonly form = new FormGroup<AdoptionFormControls>({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    age: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(18)] }),
    petsAtHome: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    hasSmallChildren: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    sterilizationAttitude: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    plannedFood: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    illnessActions: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+?[0-9()\-\s]{7,20}$/)]
    }),
    consent: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (!this.petId) return;

    this.petService.getPetById(this.petId).subscribe((pet) => {
      this.petName = pet?.name ?? '';
    });
  }

  get title(): string {
    return this.petName ? `Хочу забрать домой ${this.petName}` : 'Хочу забрать домой';
  }

  isInvalid(controlName: keyof AdoptionFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Анкета отправлена',
      detail: 'Спасибо! Мы свяжемся с вами по телефону.'
    });

    this.form.reset();
  }
}
