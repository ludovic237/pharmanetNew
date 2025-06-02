/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer } from '@angular/common';
import { Inject, NgModule, PLATFORM_ID, } from '@angular/core';
import { BREAKPOINT, DEFAULT_CONFIG, LAYOUT_CONFIG, SERVER_TOKEN, } from '@ngbracket/ngx-layout/core';
import { ExtendedModule } from '@ngbracket/ngx-layout/extended';
import { FlexModule } from '@ngbracket/ngx-layout/flex';
import { GridModule } from '@ngbracket/ngx-layout/grid';
import * as i0 from "@angular/core";
/**
 * FlexLayoutModule -- the main import for all utilities in the Angular Layout library
 * * Will automatically provide Flex, Grid, and Extended modules for use in the application
 * * Can be configured using the static withConfig method, options viewable on the Wiki's
 *   Configuration page
 */
export class FlexLayoutModule {
    /**
     * Initialize the FlexLayoutModule with a set of config options,
     * which sets the corresponding tokens accordingly
     */
    static withConfig(configOptions, 
    // tslint:disable-next-line:max-line-length
    breakpoints = []) {
        return {
            ngModule: FlexLayoutModule,
            providers: configOptions.serverLoaded
                ? [
                    {
                        provide: LAYOUT_CONFIG,
                        useValue: { ...DEFAULT_CONFIG, ...configOptions },
                    },
                    { provide: BREAKPOINT, useValue: breakpoints, multi: true },
                    { provide: SERVER_TOKEN, useValue: true },
                ]
                : [
                    {
                        provide: LAYOUT_CONFIG,
                        useValue: { ...DEFAULT_CONFIG, ...configOptions },
                    },
                    { provide: BREAKPOINT, useValue: breakpoints, multi: true },
                ],
        };
    }
    constructor(serverModuleLoaded, platformId) {
        if (isPlatformServer(platformId) && !serverModuleLoaded) {
            console.warn('Warning: Flex Layout loaded on the server without FlexLayoutServerModule');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexLayoutModule, deps: [{ token: SERVER_TOKEN }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.1.0", ngImport: i0, type: FlexLayoutModule, imports: [FlexModule, ExtendedModule, GridModule], exports: [FlexModule, ExtendedModule, GridModule] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexLayoutModule, imports: [FlexModule, ExtendedModule, GridModule, FlexModule, ExtendedModule, GridModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexLayoutModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [FlexModule, ExtendedModule, GridModule],
                    exports: [FlexModule, ExtendedModule, GridModule],
                }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [SERVER_TOKEN]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDbkQsT0FBTyxFQUNMLE1BQU0sRUFFTixRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBRXZCLE9BQU8sRUFFTCxVQUFVLEVBQ1YsY0FBYyxFQUVkLGFBQWEsRUFDYixZQUFZLEdBQ2IsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDaEUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQzs7QUFFeEQ7Ozs7O0dBS0c7QUFLSCxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQ2YsYUFBa0M7SUFDbEMsMkNBQTJDO0lBQzNDLGNBQXlDLEVBQUU7UUFFM0MsT0FBTztZQUNMLFFBQVEsRUFBRSxnQkFBZ0I7WUFDMUIsU0FBUyxFQUFFLGFBQWEsQ0FBQyxZQUFZO2dCQUNuQyxDQUFDLENBQUM7b0JBQ0U7d0JBQ0UsT0FBTyxFQUFFLGFBQWE7d0JBQ3RCLFFBQVEsRUFBRSxFQUFFLEdBQUcsY0FBYyxFQUFFLEdBQUcsYUFBYSxFQUFFO3FCQUNsRDtvQkFDRCxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFO29CQUMzRCxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRTtpQkFDMUM7Z0JBQ0gsQ0FBQyxDQUFDO29CQUNFO3dCQUNFLE9BQU8sRUFBRSxhQUFhO3dCQUN0QixRQUFRLEVBQUUsRUFBRSxHQUFHLGNBQWMsRUFBRSxHQUFHLGFBQWEsRUFBRTtxQkFDbEQ7b0JBQ0QsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRTtpQkFDNUQ7U0FDTixDQUFDO0lBQ0osQ0FBQztJQUVELFlBQ3dCLGtCQUEyQixFQUM1QixVQUFrQjtRQUV2QyxJQUFJLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUN4RCxPQUFPLENBQUMsSUFBSSxDQUNWLDBFQUEwRSxDQUMzRSxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7OEdBeENVLGdCQUFnQixrQkFnQ2pCLFlBQVksYUFDWixXQUFXOytHQWpDVixnQkFBZ0IsWUFIakIsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLGFBQ3RDLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVTsrR0FFckMsZ0JBQWdCLFlBSGpCLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUN0QyxVQUFVLEVBQUUsY0FBYyxFQUFFLFVBQVU7OzJGQUVyQyxnQkFBZ0I7a0JBSjVCLFFBQVE7bUJBQUM7b0JBQ1IsT0FBTyxFQUFFLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxVQUFVLENBQUM7b0JBQ2pELE9BQU8sRUFBRSxDQUFDLFVBQVUsRUFBRSxjQUFjLEVBQUUsVUFBVSxDQUFDO2lCQUNsRDs7MEJBaUNJLE1BQU07MkJBQUMsWUFBWTs7MEJBQ25CLE1BQU07MkJBQUMsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBJbmplY3QsXG4gIE1vZHVsZVdpdGhQcm92aWRlcnMsXG4gIE5nTW9kdWxlLFxuICBQTEFURk9STV9JRCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG4gIEJyZWFrUG9pbnQsXG4gIEJSRUFLUE9JTlQsXG4gIERFRkFVTFRfQ09ORklHLFxuICBMYXlvdXRDb25maWdPcHRpb25zLFxuICBMQVlPVVRfQ09ORklHLFxuICBTRVJWRVJfVE9LRU4sXG59IGZyb20gJ0BuZ2JyYWNrZXQvbmd4LWxheW91dC9jb3JlJztcbmltcG9ydCB7IEV4dGVuZGVkTW9kdWxlIH0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L2V4dGVuZGVkJztcbmltcG9ydCB7IEZsZXhNb2R1bGUgfSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvZmxleCc7XG5pbXBvcnQgeyBHcmlkTW9kdWxlIH0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L2dyaWQnO1xuXG4vKipcbiAqIEZsZXhMYXlvdXRNb2R1bGUgLS0gdGhlIG1haW4gaW1wb3J0IGZvciBhbGwgdXRpbGl0aWVzIGluIHRoZSBBbmd1bGFyIExheW91dCBsaWJyYXJ5XG4gKiAqIFdpbGwgYXV0b21hdGljYWxseSBwcm92aWRlIEZsZXgsIEdyaWQsIGFuZCBFeHRlbmRlZCBtb2R1bGVzIGZvciB1c2UgaW4gdGhlIGFwcGxpY2F0aW9uXG4gKiAqIENhbiBiZSBjb25maWd1cmVkIHVzaW5nIHRoZSBzdGF0aWMgd2l0aENvbmZpZyBtZXRob2QsIG9wdGlvbnMgdmlld2FibGUgb24gdGhlIFdpa2knc1xuICogICBDb25maWd1cmF0aW9uIHBhZ2VcbiAqL1xuQE5nTW9kdWxlKHtcbiAgaW1wb3J0czogW0ZsZXhNb2R1bGUsIEV4dGVuZGVkTW9kdWxlLCBHcmlkTW9kdWxlXSxcbiAgZXhwb3J0czogW0ZsZXhNb2R1bGUsIEV4dGVuZGVkTW9kdWxlLCBHcmlkTW9kdWxlXSxcbn0pXG5leHBvcnQgY2xhc3MgRmxleExheW91dE1vZHVsZSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplIHRoZSBGbGV4TGF5b3V0TW9kdWxlIHdpdGggYSBzZXQgb2YgY29uZmlnIG9wdGlvbnMsXG4gICAqIHdoaWNoIHNldHMgdGhlIGNvcnJlc3BvbmRpbmcgdG9rZW5zIGFjY29yZGluZ2x5XG4gICAqL1xuICBzdGF0aWMgd2l0aENvbmZpZyhcbiAgICBjb25maWdPcHRpb25zOiBMYXlvdXRDb25maWdPcHRpb25zLFxuICAgIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtbGluZS1sZW5ndGhcbiAgICBicmVha3BvaW50czogQnJlYWtQb2ludCB8IEJyZWFrUG9pbnRbXSA9IFtdXG4gICk6IE1vZHVsZVdpdGhQcm92aWRlcnM8RmxleExheW91dE1vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogRmxleExheW91dE1vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogY29uZmlnT3B0aW9ucy5zZXJ2ZXJMb2FkZWRcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHByb3ZpZGU6IExBWU9VVF9DT05GSUcsXG4gICAgICAgICAgICAgIHVzZVZhbHVlOiB7IC4uLkRFRkFVTFRfQ09ORklHLCAuLi5jb25maWdPcHRpb25zIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyBwcm92aWRlOiBCUkVBS1BPSU5ULCB1c2VWYWx1ZTogYnJlYWtwb2ludHMsIG11bHRpOiB0cnVlIH0sXG4gICAgICAgICAgICB7IHByb3ZpZGU6IFNFUlZFUl9UT0tFTiwgdXNlVmFsdWU6IHRydWUgfSxcbiAgICAgICAgICBdXG4gICAgICAgIDogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBwcm92aWRlOiBMQVlPVVRfQ09ORklHLFxuICAgICAgICAgICAgICB1c2VWYWx1ZTogeyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlnT3B0aW9ucyB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgcHJvdmlkZTogQlJFQUtQT0lOVCwgdXNlVmFsdWU6IGJyZWFrcG9pbnRzLCBtdWx0aTogdHJ1ZSB9LFxuICAgICAgICAgIF0sXG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoU0VSVkVSX1RPS0VOKSBzZXJ2ZXJNb2R1bGVMb2FkZWQ6IGJvb2xlYW4sXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcGxhdGZvcm1JZDogT2JqZWN0XG4gICkge1xuICAgIGlmIChpc1BsYXRmb3JtU2VydmVyKHBsYXRmb3JtSWQpICYmICFzZXJ2ZXJNb2R1bGVMb2FkZWQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgJ1dhcm5pbmc6IEZsZXggTGF5b3V0IGxvYWRlZCBvbiB0aGUgc2VydmVyIHdpdGhvdXQgRmxleExheW91dFNlcnZlck1vZHVsZSdcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=