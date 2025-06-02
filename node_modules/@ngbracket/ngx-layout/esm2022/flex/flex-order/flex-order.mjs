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
export class FlexOrderStyleBuilder extends StyleBuilder {
    buildStyles(value) {
        return { order: (value && parseInt(value, 10)) || '' };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexOrderStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexOrderStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexOrderStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
const inputs = [
    'fxFlexOrder',
    'fxFlexOrder.xs',
    'fxFlexOrder.sm',
    'fxFlexOrder.md',
    'fxFlexOrder.lg',
    'fxFlexOrder.xl',
    'fxFlexOrder.lt-sm',
    'fxFlexOrder.lt-md',
    'fxFlexOrder.lt-lg',
    'fxFlexOrder.lt-xl',
    'fxFlexOrder.gt-xs',
    'fxFlexOrder.gt-sm',
    'fxFlexOrder.gt-md',
    'fxFlexOrder.gt-lg',
];
const selector = `
  [fxFlexOrder], [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md],
  [fxFlexOrder.lg], [fxFlexOrder.xl], [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md],
  [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl], [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm],
  [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]
`;
/**
 * 'flex-order' flexbox styling directive
 * Configures the positional ordering of the element in a sorted layout container
 * @see https://css-tricks.com/almanac/properties/o/order/
 */
export class FlexOrderDirective extends BaseDirective2 {
    constructor(elRef, styleUtils, styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.DIRECTIVE_KEY = 'flex-order';
        this.styleCache = flexOrderCache;
        this.init();
    }
    updateWithValue(input) {
        super.updateWithValue(input);
        if (this.parentElement) {
            this.marshal.triggerUpdate(this.parentElement, 'layout-gap');
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexOrderDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: FlexOrderStyleBuilder }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FlexOrderDirective, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexOrderDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: FlexOrderStyleBuilder }, { type: i1.MediaMarshaller }] });
const flexOrderCache = new Map();
export class DefaultFlexOrderDirective extends FlexOrderDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexOrderDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultFlexOrderDirective, selector: "\n  [fxFlexOrder], [fxFlexOrder.xs], [fxFlexOrder.sm], [fxFlexOrder.md],\n  [fxFlexOrder.lg], [fxFlexOrder.xl], [fxFlexOrder.lt-sm], [fxFlexOrder.lt-md],\n  [fxFlexOrder.lt-lg], [fxFlexOrder.lt-xl], [fxFlexOrder.gt-xs], [fxFlexOrder.gt-sm],\n  [fxFlexOrder.gt-md], [fxFlexOrder.gt-lg]\n", inputs: { fxFlexOrder: "fxFlexOrder", "fxFlexOrder.xs": "fxFlexOrder.xs", "fxFlexOrder.sm": "fxFlexOrder.sm", "fxFlexOrder.md": "fxFlexOrder.md", "fxFlexOrder.lg": "fxFlexOrder.lg", "fxFlexOrder.xl": "fxFlexOrder.xl", "fxFlexOrder.lt-sm": "fxFlexOrder.lt-sm", "fxFlexOrder.lt-md": "fxFlexOrder.lt-md", "fxFlexOrder.lt-lg": "fxFlexOrder.lt-lg", "fxFlexOrder.lt-xl": "fxFlexOrder.lt-xl", "fxFlexOrder.gt-xs": "fxFlexOrder.gt-xs", "fxFlexOrder.gt-sm": "fxFlexOrder.gt-sm", "fxFlexOrder.gt-md": "fxFlexOrder.gt-md", "fxFlexOrder.gt-lg": "fxFlexOrder.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexOrderDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC1vcmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZmxleC9mbGV4LW9yZGVyL2ZsZXgtb3JkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFDN0UsT0FBTyxFQUNMLGNBQWMsRUFFZCxZQUFZLEdBR2IsTUFBTSw0QkFBNEIsQ0FBQzs7O0FBR3BDLE1BQU0sT0FBTyxxQkFBc0IsU0FBUSxZQUFZO0lBQ3JELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxLQUFLLElBQUksUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDO0lBQ3pELENBQUM7OEdBSFUscUJBQXFCO2tIQUFyQixxQkFBcUIsY0FEUixNQUFNOzsyRkFDbkIscUJBQXFCO2tCQURqQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7QUFPbEMsTUFBTSxNQUFNLEdBQUc7SUFDYixhQUFhO0lBQ2IsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLGdCQUFnQjtJQUNoQixtQkFBbUI7SUFDbkIsbUJBQW1CO0lBQ25CLG1CQUFtQjtJQUNuQixtQkFBbUI7SUFDbkIsbUJBQW1CO0lBQ25CLG1CQUFtQjtJQUNuQixtQkFBbUI7SUFDbkIsbUJBQW1CO0NBQ3BCLENBQUM7QUFDRixNQUFNLFFBQVEsR0FBRzs7Ozs7Q0FLaEIsQ0FBQztBQUVGOzs7O0dBSUc7QUFFSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsY0FBYztJQUdwRCxZQUNFLEtBQWlCLEVBQ2pCLFVBQXNCLEVBQ3RCLFlBQW1DLEVBQ25DLE9BQXdCO1FBRXhCLEtBQUssQ0FBQyxLQUFLLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztRQVIvQixrQkFBYSxHQUFHLFlBQVksQ0FBQztRQVk3QixlQUFVLEdBQUcsY0FBYyxDQUFDO1FBSDdDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFJUSxlQUFlLENBQUMsS0FBYTtRQUNwQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTdCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDL0QsQ0FBQztJQUNILENBQUM7OEdBckJVLGtCQUFrQjtrR0FBbEIsa0JBQWtCOzsyRkFBbEIsa0JBQWtCO2tCQUQ5QixTQUFTOztBQXlCVixNQUFNLGNBQWMsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUcvRCxNQUFNLE9BQU8seUJBQTBCLFNBQVEsa0JBQWtCO0lBRGpFOztRQUVxQixXQUFNLEdBQUcsTUFBTSxDQUFDO0tBQ3BDOzhHQUZZLHlCQUF5QjtrR0FBekIseUJBQXlCOzsyRkFBekIseUJBQXlCO2tCQURyQyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBPbkNoYW5nZXMgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJhc2VEaXJlY3RpdmUyLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgRmxleE9yZGVyU3R5bGVCdWlsZGVyIGV4dGVuZHMgU3R5bGVCdWlsZGVyIHtcbiAgYnVpbGRTdHlsZXModmFsdWU6IHN0cmluZykge1xuICAgIHJldHVybiB7IG9yZGVyOiAodmFsdWUgJiYgcGFyc2VJbnQodmFsdWUsIDEwKSkgfHwgJycgfTtcbiAgfVxufVxuXG5jb25zdCBpbnB1dHMgPSBbXG4gICdmeEZsZXhPcmRlcicsXG4gICdmeEZsZXhPcmRlci54cycsXG4gICdmeEZsZXhPcmRlci5zbScsXG4gICdmeEZsZXhPcmRlci5tZCcsXG4gICdmeEZsZXhPcmRlci5sZycsXG4gICdmeEZsZXhPcmRlci54bCcsXG4gICdmeEZsZXhPcmRlci5sdC1zbScsXG4gICdmeEZsZXhPcmRlci5sdC1tZCcsXG4gICdmeEZsZXhPcmRlci5sdC1sZycsXG4gICdmeEZsZXhPcmRlci5sdC14bCcsXG4gICdmeEZsZXhPcmRlci5ndC14cycsXG4gICdmeEZsZXhPcmRlci5ndC1zbScsXG4gICdmeEZsZXhPcmRlci5ndC1tZCcsXG4gICdmeEZsZXhPcmRlci5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtmeEZsZXhPcmRlcl0sIFtmeEZsZXhPcmRlci54c10sIFtmeEZsZXhPcmRlci5zbV0sIFtmeEZsZXhPcmRlci5tZF0sXG4gIFtmeEZsZXhPcmRlci5sZ10sIFtmeEZsZXhPcmRlci54bF0sIFtmeEZsZXhPcmRlci5sdC1zbV0sIFtmeEZsZXhPcmRlci5sdC1tZF0sXG4gIFtmeEZsZXhPcmRlci5sdC1sZ10sIFtmeEZsZXhPcmRlci5sdC14bF0sIFtmeEZsZXhPcmRlci5ndC14c10sIFtmeEZsZXhPcmRlci5ndC1zbV0sXG4gIFtmeEZsZXhPcmRlci5ndC1tZF0sIFtmeEZsZXhPcmRlci5ndC1sZ11cbmA7XG5cbi8qKlxuICogJ2ZsZXgtb3JkZXInIGZsZXhib3ggc3R5bGluZyBkaXJlY3RpdmVcbiAqIENvbmZpZ3VyZXMgdGhlIHBvc2l0aW9uYWwgb3JkZXJpbmcgb2YgdGhlIGVsZW1lbnQgaW4gYSBzb3J0ZWQgbGF5b3V0IGNvbnRhaW5lclxuICogQHNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL2FsbWFuYWMvcHJvcGVydGllcy9vL29yZGVyL1xuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBGbGV4T3JkZXJEaXJlY3RpdmUgZXh0ZW5kcyBCYXNlRGlyZWN0aXZlMiBpbXBsZW1lbnRzIE9uQ2hhbmdlcyB7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBESVJFQ1RJVkVfS0VZID0gJ2ZsZXgtb3JkZXInO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgIHN0eWxlVXRpbHM6IFN0eWxlVXRpbHMsXG4gICAgc3R5bGVCdWlsZGVyOiBGbGV4T3JkZXJTdHlsZUJ1aWxkZXIsXG4gICAgbWFyc2hhbDogTWVkaWFNYXJzaGFsbGVyXG4gICkge1xuICAgIHN1cGVyKGVsUmVmLCBzdHlsZUJ1aWxkZXIsIHN0eWxlVXRpbHMsIG1hcnNoYWwpO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHN0eWxlQ2FjaGUgPSBmbGV4T3JkZXJDYWNoZTtcblxuICBvdmVycmlkZSB1cGRhdGVXaXRoVmFsdWUoaW5wdXQ6IHN0cmluZykge1xuICAgIHN1cGVyLnVwZGF0ZVdpdGhWYWx1ZShpbnB1dCk7XG5cbiAgICBpZiAodGhpcy5wYXJlbnRFbGVtZW50KSB7XG4gICAgICB0aGlzLm1hcnNoYWwudHJpZ2dlclVwZGF0ZSh0aGlzLnBhcmVudEVsZW1lbnQsICdsYXlvdXQtZ2FwJyk7XG4gICAgfVxuICB9XG59XG5cbmNvbnN0IGZsZXhPcmRlckNhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3IsIGlucHV0cyB9KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRGbGV4T3JkZXJEaXJlY3RpdmUgZXh0ZW5kcyBGbGV4T3JkZXJEaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuIl19