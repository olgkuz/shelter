import { Routes } from '@angular/router';
import { Pets } from './pages/pets/pets/pets';

export const routes: Routes = [
    {path:'pets', component: Pets},
    {path:'', redirectTo: '/pets',component: Pets},
    {path:'pets', redirectTo: '/pets',component: Pets}
];
