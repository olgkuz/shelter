import { Routes } from '@angular/router';
import { Pets } from './pages/home/pets/pets/pets';
import { Layout } from './layout/layout';
import { Home } from './pages/home/home';

export const routes: Routes = [
    {
        path: '',
        component: Layout,
        children: [
            { path: '', component: Home, pathMatch: 'full' },
            { path: 'pets', component: Pets }
        ]
    },
    { path: '**', redirectTo: '' }
];
