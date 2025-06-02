/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Injectable } from '@angular/core';
import { BaseDirective2, StyleBuilder, } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
export class FlexAlignStyleBuilder extends StyleBuilder {
    buildStyles(input) {
        input = input || 'stretch';
        const styles = {};
        // Cross-axis
        switch (input) {
            case 'start':
                styles['align-self'] = 'flex-start';
                break;
            case 'end':
                styles['align-self'] = 'flex-end';
                break;
            default:
                styles['align-self'] = input;
                break;
        }
        return styles;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexAlignStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexAlignStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexAlignStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
const inputs = [
    'fxFlexAlign',
    'fxFlexAlign.xs',
    'fxFlexAlign.sm',
    'fxFlexAlign.md',
    'fxFlexAlign.lg',
    'fxFlexAlign.xl',
    'fxFlexAlign.lt-sm',
    'fxFlexAlign.lt-md',
    'fxFlexAlign.lt-lg',
    'fxFlexAlign.lt-xl',
    'fxFlexAlign.gt-xs',
    'fxFlexAlign.gt-sm',
    'fxFlexAlign.gt-md',
    'fxFlexAlign.gt-lg',
];
const selector = `
  [fxFlexAlign], [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md],
  [fxFlexAlign.lg], [fxFlexAlign.xl], [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md],
  [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl], [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm],
  [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]
`;
/**
 * 'flex-align' flexbox styling directive
 * Allows element-specific overrides for cross-axis alignments in a layout container
 * @see https://css-tricks.com/almanac/properties/a/align-self/
 */
export class FlexAlignDirective extends BaseDirective2 {
    constructor(elRef, styleUtils, styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.DIRECTIVE_KEY = 'flex-align';
        this.styleCache = flexAlignCache;
        this.init();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexAlignDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: FlexAlignStyleBuilder }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FlexAlignDirective, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexAlignDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: FlexAlignStyleBuilder }, { type: i1.MediaMarshaller }] });
const flexAlignCache = new Map();
export class DefaultFlexAlignDirective extends FlexAlignDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexAlignDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultFlexAlignDirective, selector: "\n  [fxFlexAlign], [fxFlexAlign.xs], [fxFlexAlign.sm], [fxFlexAlign.md],\n  [fxFlexAlign.lg], [fxFlexAlign.xl], [fxFlexAlign.lt-sm], [fxFlexAlign.lt-md],\n  [fxFlexAlign.lt-lg], [fxFlexAlign.lt-xl], [fxFlexAlign.gt-xs], [fxFlexAlign.gt-sm],\n  [fxFlexAlign.gt-md], [fxFlexAlign.gt-lg]\n", inputs: { fxFlexAlign: "fxFlexAlign", "fxFlexAlign.xs": "fxFlexAlign.xs", "fxFlexAlign.sm": "fxFlexAlign.sm", "fxFlexAlign.md": "fxFlexAlign.md", "fxFlexAlign.lg": "fxFlexAlign.lg", "fxFlexAlign.xl": "fxFlexAlign.xl", "fxFlexAlign.lt-sm": "fxFlexAlign.lt-sm", "fxFlexAlign.lt-md": "fxFlexAlign.lt-md", "fxFlexAlign.lt-lg": "fxFlexAlign.lt-lg", "fxFlexAlign.lt-xl": "fxFlexAlign.lt-xl", "fxFlexAlign.gt-xs": "fxFlexAlign.gt-xs", "fxFlexAlign.gt-sm": "fxFlexAlign.gt-sm", "fxFlexAlign.gt-md": "fxFlexAlign.gt-md", "fxFlexAlign.gt-lg": "fxFlexAlign.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexAlignDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1hbGlnbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZmxleC9mbGV4LWFsaWduL2ZsZXgtYWxpZ24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEUsT0FBTyxFQUNMLGNBQWMsRUFFZCxZQUFZLEdBR2IsTUFBTSw0QkFBNEIsQ0FBQzs7O0FBR3BDLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxZQUFZO0lBQ3JELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLEtBQUssR0FBRyxLQUFLLElBQUksU0FBUyxDQUFDO1FBQzNCLE1BQU0sTUFBTSxHQUFvQixFQUFFLENBQUM7UUFFbkMsYUFBYTtRQUNiLFFBQVEsS0FBSyxFQUFFLENBQUM7WUFDZCxLQUFLLE9BQU87Z0JBQ1YsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLFlBQVksQ0FBQztnQkFDcEMsTUFBTTtZQUNSLEtBQUssS0FBSztnQkFDUixNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUNsQyxNQUFNO1lBQ1I7Z0JBQ0UsTUFBTSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDN0IsTUFBTTtRQUNWLENBQUM7UUFFRCxPQUFPLE1BQU0sQ0FBQztJQUNoQixDQUFDOzhHQW5CVSxxQkFBcUI7a0hBQXJCLHFCQUFxQixjQURSLE1BQU07OzJGQUNuQixxQkFBcUI7a0JBRGpDLFVBQVU7bUJBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFOztBQXVCbEMsTUFBTSxNQUFNLEdBQUc7SUFDYixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsbUJBQW1CO0lBQ25CLG1CQUFtQjtJQUNuQixtQkFBbUI7SUFDbkIsbUJBQW1CO0lBQ25CLG1CQUFtQjtJQUNuQixtQkFBbUI7SUFDbkIsbUJBQW1CO0NBQ3BCLENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRzs7Ozs7Q0FLaEIsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsY0FBYztJQUdwRCxZQUNFLEtBQWlCLEVBQ2pCLFVBQXNCLEVBQ3RCLFlBQW1DLEVBQ25DLE9BQXdCO1FBRXhCLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQVIvQixrQkFBYSxHQUFHLFlBQVksQ0FBQztRQVk3QixlQUFVLEdBQUcsY0FBYyxDQUFDO1FBSDdDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7OEdBWFUsa0JBQWtCO2tHQUFsQixrQkFBa0I7OzJGQUFsQixrQkFBa0I7a0JBRDlCLFNBQVM7O0FBaUJWLE1BQU0sY0FBYyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRy9ELE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxrQkFBa0I7SUFEakU7O1FBRXFCLFdBQU0sR0FBRyxNQUFNLENBQUM7S0FDcEM7OEdBRlkseUJBQXlCO2tHQUF6Qix5QkFBeUI7OzJGQUF6Qix5QkFBeUI7a0JBRHJDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJhc2VEaXJlY3RpdmUyLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgRmxleEFsaWduU3R5bGVCdWlsZGVyIGV4dGVuZHMgU3R5bGVCdWlsZGVyIHtcbiAgYnVpbGRTdHlsZXMoaW5wdXQ6IHN0cmluZykge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgJ3N0cmV0Y2gnO1xuICAgIGNvbnN0IHN0eWxlczogU3R5bGVEZWZpbml0aW9uID0ge307XG5cbiAgICAvLyBDcm9zcy1heGlzXG4gICAgc3dpdGNoIChpbnB1dCkge1xuICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgICBzdHlsZXNbJ2FsaWduLXNlbGYnXSA9ICdmbGV4LXN0YXJ0JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgICBzdHlsZXNbJ2FsaWduLXNlbGYnXSA9ICdmbGV4LWVuZCc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3R5bGVzWydhbGlnbi1zZWxmJ10gPSBpbnB1dDtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0eWxlcztcbiAgfVxufVxuXG5jb25zdCBpbnB1dHMgPSBbXG4gICdmeEZsZXhBbGlnbicsXG4gICdmeEZsZXhBbGlnbi54cycsXG4gICdmeEZsZXhBbGlnbi5zbScsXG4gICdmeEZsZXhBbGlnbi5tZCcsXG4gICdmeEZsZXhBbGlnbi5sZycsXG4gICdmeEZsZXhBbGlnbi54bCcsXG4gICdmeEZsZXhBbGlnbi5sdC1zbScsXG4gICdmeEZsZXhBbGlnbi5sdC1tZCcsXG4gICdmeEZsZXhBbGlnbi5sdC1sZycsXG4gICdmeEZsZXhBbGlnbi5sdC14bCcsXG4gICdmeEZsZXhBbGlnbi5ndC14cycsXG4gICdmeEZsZXhBbGlnbi5ndC1zbScsXG4gICdmeEZsZXhBbGlnbi5ndC1tZCcsXG4gICdmeEZsZXhBbGlnbi5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtmeEZsZXhBbGlnbl0sIFtmeEZsZXhBbGlnbi54c10sIFtmeEZsZXhBbGlnbi5zbV0sIFtmeEZsZXhBbGlnbi5tZF0sXG4gIFtmeEZsZXhBbGlnbi5sZ10sIFtmeEZsZXhBbGlnbi54bF0sIFtmeEZsZXhBbGlnbi5sdC1zbV0sIFtmeEZsZXhBbGlnbi5sdC1tZF0sXG4gIFtmeEZsZXhBbGlnbi5sdC1sZ10sIFtmeEZsZXhBbGlnbi5sdC14bF0sIFtmeEZsZXhBbGlnbi5ndC14c10sIFtmeEZsZXhBbGlnbi5ndC1zbV0sXG4gIFtmeEZsZXhBbGlnbi5ndC1tZF0sIFtmeEZsZXhBbGlnbi5ndC1sZ11cbmA7XG5cbi8qKlxuICogJ2ZsZXgtYWxpZ24nIGZsZXhib3ggc3R5bGluZyBkaXJlY3RpdmVcbiAqIEFsbG93cyBlbGVtZW50LXNwZWNpZmljIG92ZXJyaWRlcyBmb3IgY3Jvc3MtYXhpcyBhbGlnbm1lbnRzIGluIGEgbGF5b3V0IGNvbnRhaW5lclxuICogQHNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL2FsbWFuYWMvcHJvcGVydGllcy9hL2FsaWduLXNlbGYvXG4gKi9cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIEZsZXhBbGlnbkRpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnZmxleC1hbGlnbic7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgc3R5bGVVdGlsczogU3R5bGVVdGlscyxcbiAgICBzdHlsZUJ1aWxkZXI6IEZsZXhBbGlnblN0eWxlQnVpbGRlcixcbiAgICBtYXJzaGFsOiBNZWRpYU1hcnNoYWxsZXJcbiAgKSB7XG4gICAgc3VwZXIoZWxSZWYsIHN0eWxlQnVpbGRlciwgc3R5bGVVdGlscywgbWFyc2hhbCk7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgc3R5bGVDYWNoZSA9IGZsZXhBbGlnbkNhY2hlO1xufVxuXG5jb25zdCBmbGV4QWxpZ25DYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcblxuQERpcmVjdGl2ZSh7IHNlbGVjdG9yLCBpbnB1dHMgfSlcbmV4cG9ydCBjbGFzcyBEZWZhdWx0RmxleEFsaWduRGlyZWN0aXZlIGV4dGVuZHMgRmxleEFsaWduRGlyZWN0aXZlIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlucHV0cyA9IGlucHV0cztcbn1cbiJdfQ==