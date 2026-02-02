import { Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { RegisterComponent } from './register/register.component';
import { NotepadComponent } from './notepad/notepad.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LandingComponent },
    { path: 'app', component: NotepadComponent },
    { path: '**', redirectTo: '' }
];
