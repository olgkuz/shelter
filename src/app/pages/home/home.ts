import { Component } from '@angular/core';
import { Main } from './main/main';
import { Pets } from './pets/pets/pets';
import { ContactForm } from './contact-form/contact-form';

@Component({
  selector: 'app-home',
  imports: [Main, Pets, ContactForm],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
