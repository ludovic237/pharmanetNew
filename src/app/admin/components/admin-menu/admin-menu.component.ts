import { Component, Input, OnInit } from '@angular/core';
import { AdminMenu } from '@models/admin-menu.model';
import { AdminMenuService } from '@services/admin-menu.service';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-admin-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TranslateModule
    ],
    templateUrl: './admin-menu.component.html',
    styleUrl: './admin-menu.component.scss'
})
export class AdminMenuComponent implements OnInit {
  @Input('menuItems') menuItems: AdminMenu[];
  @Input('menuParentId') menuParentId: number;
  parentMenu: Array<any>; 

  constructor(public menuService: AdminMenuService) { }

  ngOnInit() {
    this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
  }

  onClick(menuId: number) {
    this.menuService.toggleMenuItem(menuId);
    this.menuService.closeOtherSubMenus(this.menuItems, menuId);
  }

}
