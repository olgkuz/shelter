import { Routes } from '@angular/router';

import { Pets } from './pages/home/pets/pets/pets';

import { VetAdvice } from './pages/vet-advice/vet-advice';
import { Board } from './pages/board/board';
import { Sos } from './pages/sos/sos';
import { PrivacyPolicy } from './pages/privacy-policy/privacy-policy';

import { Layout } from './layout/layout';
import { Home } from './pages/home/home';
import { adminAuthGuard } from './shared/guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      {
        path: '',
        component: Home,
        pathMatch: 'full'
      },
      {
        path: 'pets',
        component: Pets
      },
      {
        path: 'pets/:id',
        loadComponent: () => import('./pages/pet/pet').then((m) => m.Pet),
        data: { showAside: true }
      },
      {
        path: 'pets/:id/adopt',
        loadComponent: () => import('./pages/pet/adoption-form/adoption-form').then((m) => m.AdoptionForm)
      },
      {
        path: 'vet-advice',
        component: VetAdvice
      },
      {
        path: 'board',
        component: Board
      },
      {
        path: 'sos',
        component: Sos
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicy
      },
      {
        path: 'admin/login',
        loadComponent: () => import('./pages/admin/admin-login/admin-login').then((m) => m.AdminLogin)
      },
      {
        path: 'admin',
        canActivate: [adminAuthGuard],
        loadComponent: () => import('./pages/admin/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
