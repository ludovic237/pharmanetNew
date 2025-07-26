import { Routes } from '@angular/router';
import {ClientComponent} from "./client/client.component";
import {EmployeComponent} from "./employe/employe.component";
import {SettingComponent} from "./setting/setting.component";


export const routes: Routes = [
    { path: '', redirectTo: 'setting', pathMatch: 'full' },
    { path: 'setting', component: SettingComponent, data: { breadcrumb: 'Setting' } },
    { path: 'employe', component: EmployeComponent, data: { breadcrumb: 'Employe' } },
    { path: 'client', component: ClientComponent, data: { breadcrumb: 'Client' } },
];
