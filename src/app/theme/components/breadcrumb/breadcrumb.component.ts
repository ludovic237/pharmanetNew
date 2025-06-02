import { Component } from '@angular/core';
import { ActivatedRoute, Router, ActivatedRouteSnapshot, UrlSegment, NavigationEnd, RouterModule } from "@angular/router";
import { Title } from '@angular/platform-browser';
import { SidenavMenuService } from '@services/sidenav-menu.service';
import { Settings, SettingsService } from '@services/settings.service';
import { DomHandlerService } from '@services/dom-handler.service';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-breadcrumb',
    imports: [
        RouterModule,
        FlexLayoutModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './breadcrumb.component.html',
    styleUrls: ['./breadcrumb.component.scss'],
    providers: [SidenavMenuService]
})
export class BreadcrumbComponent {

    public pageTitle: string;
    public breadcrumbs: {
        name: string;
        url: string
    }[] = [];

    public settings: Settings;
    constructor(public settingsService: SettingsService,
                public router: Router,
                public activatedRoute: ActivatedRoute,
                public title: Title,
                public sidenavMenuService: SidenavMenuService,
                public domHandlerService: DomHandlerService) {
        this.settings = this.settingsService.settings;
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.breadcrumbs = [];
                this.parseRoute(this.router.routerState.snapshot.root);
                this.pageTitle = "";
                this.breadcrumbs.forEach(breadcrumb => {
                    this.pageTitle += ' > ' + breadcrumb.name;
                })
                this.title.setTitle(this.settings.name + this.pageTitle);
            }
        })
    }

    private parseRoute(node: ActivatedRouteSnapshot) {
        if (node.data['breadcrumb']) {
            if (node.url.length) {
                let urlSegments: UrlSegment[] = [];
                node.pathFromRoot.forEach(routerState => {
                    urlSegments = urlSegments.concat(routerState.url);
                });
                let url = urlSegments.map(urlSegment => {
                    return urlSegment.path;
                }).join('/');

                if (node.params.name) {
                    this.breadcrumbs.push({
                        name: node.params.name,
                        url: '/' + url
                    })
                } else {
                    this.breadcrumbs.push({
                        name: node.data['breadcrumb'],
                        url: '/' + url
                    })
                }
            }
        }
        if (node.firstChild) {
            this.parseRoute(node.firstChild);
        }
    }

    public closeSubMenus() {
        if (this.domHandlerService.window?.innerWidth < 960) {
            this.sidenavMenuService.closeAllSubMenus();
        }
    }

}