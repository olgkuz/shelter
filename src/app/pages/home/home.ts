import { Component } from '@angular/core';
import { Main } from './main/main';
import { Pets } from './pets/pets/pets';
import { ContactForm } from './contact-form/contact-form';
import { Accordion } from './accordion/accordion';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Main, Pets, Accordion, ContactForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
