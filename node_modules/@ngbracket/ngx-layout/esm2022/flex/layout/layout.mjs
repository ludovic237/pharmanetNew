/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, Injectable, } from '@angular/core';
import { BaseDirective2, LAYOUT_CONFIG, StyleBuilder, } from '@ngbracket/ngx-layout/core';
import { buildLayoutCSS } from '@ngbracket/ngx-layout/_private-utils';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
export class LayoutStyleBuilder extends StyleBuilder {
    buildStyles(input, { display }) {
        const css = buildLayoutCSS(input);
        return {
            ...css,
            display: display === 'none' ? display : css.display,
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
const inputs = [
    'fxLayout',
    'fxLayout.xs',
    'fxLayout.sm',
    'fxLayout.md',
    'fxLayout.lg',
    'fxLayout.xl',
    'fxLayout.lt-sm',
    'fxLayout.lt-md',
    'fxLayout.lt-lg',
    'fxLayout.lt-xl',
    'fxLayout.gt-xs',
    'fxLayout.gt-sm',
    'fxLayout.gt-md',
    'fxLayout.gt-lg',
];
const selector = `
  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],
  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],
  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],
  [fxLayout.gt-md], [fxLayout.gt-lg]
`;
/**
 * 'layout' flexbox styling directive
 * Defines the positioning flow direction for the child elements: row or column
 * Optional values: column or row (default)
 * @see https://css-tricks.com/almanac/properties/f/flex-direction/
 *
 */
export class LayoutDirective extends BaseDirective2 {
    constructor(elRef, styleUtils, styleBuilder, marshal, _config) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this._config = _config;
        this.DIRECTIVE_KEY = 'layout';
        this.init();
    }
    updateWithValue(input) {
        const detectLayoutDisplay = this._config.detectLayoutDisplay;
        const display = detectLayoutDisplay
            ? this.styler.lookupStyle(this.nativeElement, 'display')
            : '';
        this.styleCache = cacheMap.get(display) ?? new Map();
        cacheMap.set(display, this.styleCache);
        if (this.currentValue !== input) {
            this.addStyles(input, { display });
            this.currentValue = input;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: LayoutStyleBuilder }, { token: i1.MediaMarshaller }, { token: LAYOUT_CONFIG }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: LayoutDirective, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: LayoutStyleBuilder }, { type: i1.MediaMarshaller }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }] });
export class DefaultLayoutDirective extends LayoutDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultLayoutDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultLayoutDirective, selector: "\n  [fxLayout], [fxLayout.xs], [fxLayout.sm], [fxLayout.md],\n  [fxLayout.lg], [fxLayout.xl], [fxLayout.lt-sm], [fxLayout.lt-md],\n  [fxLayout.lt-lg], [fxLayout.lt-xl], [fxLayout.gt-xs], [fxLayout.gt-sm],\n  [fxLayout.gt-md], [fxLayout.gt-lg]\n", inputs: { fxLayout: "fxLayout", "fxLayout.xs": "fxLayout.xs", "fxLayout.sm": "fxLayout.sm", "fxLayout.md": "fxLayout.md", "fxLayout.lg": "fxLayout.lg", "fxLayout.xl": "fxLayout.xl", "fxLayout.lt-sm": "fxLayout.lt-sm", "fxLayout.lt-md": "fxLayout.lt-md", "fxLayout.lt-lg": "fxLayout.lt-lg", "fxLayout.lt-xl": "fxLayout.lt-xl", "fxLayout.gt-xs": "fxLayout.gt-xs", "fxLayout.gt-sm": "fxLayout.gt-sm", "fxLayout.gt-md": "fxLayout.gt-md", "fxLayout.gt-lg": "fxLayout.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultLayoutDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
const cacheMap = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9mbGV4L2xheW91dC9sYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUNMLFNBQVMsRUFFVCxNQUFNLEVBQ04sVUFBVSxHQUVYLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxjQUFjLEVBRWQsYUFBYSxFQUViLFlBQVksR0FHYixNQUFNLDRCQUE0QixDQUFDO0FBRXBDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxzQ0FBc0MsQ0FBQzs7O0FBT3RFLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxZQUFZO0lBQ2xELFdBQVcsQ0FBQyxLQUFhLEVBQUUsRUFBRSxPQUFPLEVBQXNCO1FBQ3hELE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxPQUFPO1lBQ0wsR0FBRyxHQUFHO1lBQ04sT0FBTyxFQUFFLE9BQU8sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU87U0FDcEQsQ0FBQztJQUNKLENBQUM7OEdBUFUsa0JBQWtCO2tIQUFsQixrQkFBa0IsY0FETCxNQUFNOzsyRkFDbkIsa0JBQWtCO2tCQUQ5QixVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7QUFXbEMsTUFBTSxNQUFNLEdBQUc7SUFDYixVQUFVO0lBQ1YsYUFBYTtJQUNiLGFBQWE7SUFDYixhQUFhO0lBQ2IsYUFBYTtJQUNiLGFBQWE7SUFDYixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0NBQ2pCLENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRzs7Ozs7Q0FLaEIsQ0FBQztBQUVGOzs7Ozs7R0FNRztBQUVILE1BQU0sT0FBTyxlQUFnQixTQUFRLGNBQWM7SUFHakQsWUFDRSxLQUFpQixFQUNqQixVQUFzQixFQUN0QixZQUFnQyxFQUNoQyxPQUF3QixFQUNPLE9BQTRCO1FBRTNELEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUZqQixZQUFPLEdBQVAsT0FBTyxDQUFxQjtRQVAxQyxrQkFBYSxHQUFHLFFBQVEsQ0FBQztRQVUxQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRWtCLGVBQWUsQ0FBQyxLQUFhO1FBQzlDLE1BQU0sbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztRQUM3RCxNQUFNLE9BQU8sR0FBRyxtQkFBbUI7WUFDakMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDO1lBQ3hELENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDUCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNyRCxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdkMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQzs4R0ExQlUsZUFBZSxvSUFRaEIsYUFBYTtrR0FSWixlQUFlOzsyRkFBZixlQUFlO2tCQUQzQixTQUFTOzswQkFTTCxNQUFNOzJCQUFDLGFBQWE7O0FBc0J6QixNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZUFBZTtJQUQzRDs7UUFFcUIsV0FBTSxHQUFHLE1BQU0sQ0FBQztLQUNwQzs4R0FGWSxzQkFBc0I7a0dBQXRCLHNCQUFzQjs7MkZBQXRCLHNCQUFzQjtrQkFEbEMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7O0FBTS9CLE1BQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgT25DaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJhc2VEaXJlY3RpdmUyLFxuICBMYXlvdXRDb25maWdPcHRpb25zLFxuICBMQVlPVVRfQ09ORklHLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5cbmltcG9ydCB7IGJ1aWxkTGF5b3V0Q1NTIH0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L19wcml2YXRlLXV0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBMYXlvdXRTdHlsZURpc3BsYXkge1xuICByZWFkb25seSBkaXNwbGF5OiBzdHJpbmc7XG59XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgTGF5b3V0U3R5bGVCdWlsZGVyIGV4dGVuZHMgU3R5bGVCdWlsZGVyIHtcbiAgYnVpbGRTdHlsZXMoaW5wdXQ6IHN0cmluZywgeyBkaXNwbGF5IH06IExheW91dFN0eWxlRGlzcGxheSkge1xuICAgIGNvbnN0IGNzcyA9IGJ1aWxkTGF5b3V0Q1NTKGlucHV0KTtcbiAgICByZXR1cm4ge1xuICAgICAgLi4uY3NzLFxuICAgICAgZGlzcGxheTogZGlzcGxheSA9PT0gJ25vbmUnID8gZGlzcGxheSA6IGNzcy5kaXNwbGF5LFxuICAgIH07XG4gIH1cbn1cblxuY29uc3QgaW5wdXRzID0gW1xuICAnZnhMYXlvdXQnLFxuICAnZnhMYXlvdXQueHMnLFxuICAnZnhMYXlvdXQuc20nLFxuICAnZnhMYXlvdXQubWQnLFxuICAnZnhMYXlvdXQubGcnLFxuICAnZnhMYXlvdXQueGwnLFxuICAnZnhMYXlvdXQubHQtc20nLFxuICAnZnhMYXlvdXQubHQtbWQnLFxuICAnZnhMYXlvdXQubHQtbGcnLFxuICAnZnhMYXlvdXQubHQteGwnLFxuICAnZnhMYXlvdXQuZ3QteHMnLFxuICAnZnhMYXlvdXQuZ3Qtc20nLFxuICAnZnhMYXlvdXQuZ3QtbWQnLFxuICAnZnhMYXlvdXQuZ3QtbGcnLFxuXTtcbmNvbnN0IHNlbGVjdG9yID0gYFxuICBbZnhMYXlvdXRdLCBbZnhMYXlvdXQueHNdLCBbZnhMYXlvdXQuc21dLCBbZnhMYXlvdXQubWRdLFxuICBbZnhMYXlvdXQubGddLCBbZnhMYXlvdXQueGxdLCBbZnhMYXlvdXQubHQtc21dLCBbZnhMYXlvdXQubHQtbWRdLFxuICBbZnhMYXlvdXQubHQtbGddLCBbZnhMYXlvdXQubHQteGxdLCBbZnhMYXlvdXQuZ3QteHNdLCBbZnhMYXlvdXQuZ3Qtc21dLFxuICBbZnhMYXlvdXQuZ3QtbWRdLCBbZnhMYXlvdXQuZ3QtbGddXG5gO1xuXG4vKipcbiAqICdsYXlvdXQnIGZsZXhib3ggc3R5bGluZyBkaXJlY3RpdmVcbiAqIERlZmluZXMgdGhlIHBvc2l0aW9uaW5nIGZsb3cgZGlyZWN0aW9uIGZvciB0aGUgY2hpbGQgZWxlbWVudHM6IHJvdyBvciBjb2x1bW5cbiAqIE9wdGlvbmFsIHZhbHVlczogY29sdW1uIG9yIHJvdyAoZGVmYXVsdClcbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9hbG1hbmFjL3Byb3BlcnRpZXMvZi9mbGV4LWRpcmVjdGlvbi9cbiAqXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIExheW91dERpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnbGF5b3V0JztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbFJlZjogRWxlbWVudFJlZixcbiAgICBzdHlsZVV0aWxzOiBTdHlsZVV0aWxzLFxuICAgIHN0eWxlQnVpbGRlcjogTGF5b3V0U3R5bGVCdWlsZGVyLFxuICAgIG1hcnNoYWw6IE1lZGlhTWFyc2hhbGxlcixcbiAgICBASW5qZWN0KExBWU9VVF9DT05GSUcpIHByaXZhdGUgX2NvbmZpZzogTGF5b3V0Q29uZmlnT3B0aW9uc1xuICApIHtcbiAgICBzdXBlcihlbFJlZiwgc3R5bGVCdWlsZGVyLCBzdHlsZVV0aWxzLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIHByb3RlY3RlZCBvdmVycmlkZSB1cGRhdGVXaXRoVmFsdWUoaW5wdXQ6IHN0cmluZykge1xuICAgIGNvbnN0IGRldGVjdExheW91dERpc3BsYXkgPSB0aGlzLl9jb25maWcuZGV0ZWN0TGF5b3V0RGlzcGxheTtcbiAgICBjb25zdCBkaXNwbGF5ID0gZGV0ZWN0TGF5b3V0RGlzcGxheVxuICAgICAgPyB0aGlzLnN0eWxlci5sb29rdXBTdHlsZSh0aGlzLm5hdGl2ZUVsZW1lbnQsICdkaXNwbGF5JylcbiAgICAgIDogJyc7XG4gICAgdGhpcy5zdHlsZUNhY2hlID0gY2FjaGVNYXAuZ2V0KGRpc3BsYXkpID8/IG5ldyBNYXAoKTtcbiAgICBjYWNoZU1hcC5zZXQoZGlzcGxheSwgdGhpcy5zdHlsZUNhY2hlKTtcblxuICAgIGlmICh0aGlzLmN1cnJlbnRWYWx1ZSAhPT0gaW5wdXQpIHtcbiAgICAgIHRoaXMuYWRkU3R5bGVzKGlucHV0LCB7IGRpc3BsYXkgfSk7XG4gICAgICB0aGlzLmN1cnJlbnRWYWx1ZSA9IGlucHV0O1xuICAgIH1cbiAgfVxufVxuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3IsIGlucHV0cyB9KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRMYXlvdXREaXJlY3RpdmUgZXh0ZW5kcyBMYXlvdXREaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuXG50eXBlIENhY2hlTWFwID0gTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPjtcbmNvbnN0IGNhY2hlTWFwID0gbmV3IE1hcDxzdHJpbmcsIENhY2hlTWFwPigpO1xuIl19