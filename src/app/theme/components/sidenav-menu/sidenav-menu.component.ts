import { Component, OnInit, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { TranslateModule } from '@ngx-translate/core';
import { SidenavMenuService } from '@services/sidenav-menu.service';

@Component({
    selector: 'app-sidenav-menu',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatButtonModule,
        MatIconModule,
        TranslateModule
    ],
    templateUrl: './sidenav-menu.component.html',
    styleUrls: ['./sidenav-menu.component.scss'],
    providers: [SidenavMenuService]
})
export class SidenavMenuComponent implements OnInit {
  @Input('menuItems') menuItems: any[];
  @Input('menuParentId') menuParentId: any;
  parentMenu: Array<any>;

  // private excludedIds: number[] = [200, 144]; // Example list of IDs to exclude

  constructor(
   private sidenavMenuService: SidenavMenuService) { }

  ngOnInit() {
    // this.parentMenu = this.menuItems.filter(item => item.parentId == this.menuParentId);
    this.parentMenu = this.menuItems
      .filter((item:any) => item.parentId == this.menuParentId);

  }

  onClick(menuId: any) {
    this.sidenavMenuService.toggleMenuItem(menuId);
    this.sidenavMenuService.closeOtherSubMenus(this.menuItems, menuId);
  }

}
