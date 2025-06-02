import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { Settings, SettingsService } from '@services/settings.service';

@Component({
    selector: 'app-options',
    imports: [
        NgClass,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule
    ],
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss']
})
export class OptionsComponent {
  public showOptions: boolean = false;
  public settings: Settings;
  constructor(public appSettings: SettingsService) {
    this.settings = this.appSettings.settings;
  }

  public changeTheme(theme: string) {
    this.settings.theme = theme;
  }
}