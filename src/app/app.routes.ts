import { Routes } from '@angular/router';

import { Pets } from './pages/home/pets/pets/pets';
import { Pet } from './pages/pet/pet';

import { VetAdvice } from './pages/vet-advice/vet-advice';
import { Board } from './pages/board/board';
import { Sos } from './pages/sos/sos';

import { Layout } from './layout/layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [

      // Главная
      {
        path: '',
        component: Home,
        pathMatch: 'full'
      },

      // Каталог животных
      {
        path: 'pets',
        component: Pets
      },

      // Карточка животного
      {
        path: 'pets/:id',
        component: Pet
      },

      // Советы ветеринара
      {
        path: 'vet-advice',
        component: VetAdvice
      },

      // Доска объявлений
      {
        path: 'board',
        component: Board
      },

      // SOS
      {
        path: 'sos',
        component: Sos
      }

    ]
  },

  // fallback
  {
    path: '**',
    redirectTo: ''
  }
];