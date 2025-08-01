import { Routes } from '@angular/router';
import {ClientComponent} from "./client/client.component";
import {EmployeComponent} from "./employe/employe.component";
import {SettingComponent} from "./setting/setting.component";
import {DepenseComponent} from "./depense/depense.component";
import {ActiviteComponent} from "./activite/activite.component";


export const routes: Routes = [
    { path: '', redirectTo: 'setting', pathMatch: 'full' },
    { path: 'setting', component: SettingComponent, data: { breadcrumb: 'Setting' } },
    { path: 'employe', component: EmployeComponent, data: { breadcrumb: 'Employe' } },
    { path: 'client', component: ClientComponent, data: { breadcrumb: 'Client' } },
    { path: 'activite', component: ActiviteComponent, data: { breadcrumb: 'Activite' } },
    { path: 'depense', component: DepenseComponent, data: { breadcrumb: 'Depense' } },
];
