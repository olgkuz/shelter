import { Component } from '@angular/core';
import { ContactForm } from '../home/contact-form/contact-form';

@Component({
  selector: 'app-sos',
  standalone: true,
  imports: [ContactForm],
  templateUrl: './sos.html',
  styleUrl: './sos.scss',
})
export class Sos {}
