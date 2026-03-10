import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  VALIDATION_LIMITS,
  VALIDATION_PATTERNS,
  normalizeText
} from '../../../shared/validation/validation-rules';

type ContactFormControls = {
  name: FormControl<string>;
  phone: FormControl<string>;
  agree: FormControl<boolean>;
};

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  readonly form = new FormGroup<ContactFormControls>({
    name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(VALIDATION_LIMITS.contactNameMin),
        Validators.maxLength(VALIDATION_LIMITS.contactNameMax),
        Validators.pattern(VALIDATION_PATTERNS.contactName)
      ]
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(VALIDATION_PATTERNS.contact)]
    }),
    agree: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue]
    })
  });

  successMessage = '';

  isInvalid(controlName: keyof ContactFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const normalizedName = normalizeText(this.form.controls.name.value);
    const normalizedPhone = normalizeText(this.form.controls.phone.value);
    this.form.patchValue({ name: normalizedName, phone: normalizedPhone });

    this.successMessage = 'Спасибо! Мы свяжемся с вами в ближайшее время.';
    this.form.reset({
      name: '',
      phone: '',
      agree: false
    });
  }
}