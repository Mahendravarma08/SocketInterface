import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatwindowComponent } from './chatwindow/chatwindow.component';

export const routes: Routes = [
    {
        path:'',
        component:LoginComponent
    },
    {
        path:'chatwindow',
        component:ChatwindowComponent
    },
];
