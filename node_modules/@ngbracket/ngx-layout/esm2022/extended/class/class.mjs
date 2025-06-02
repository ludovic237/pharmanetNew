/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgClass } from '@angular/common';
import { Directive, Input, Optional, Self, } from '@angular/core';
import { BaseDirective2, } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
import * as i2 from "@angular/common";
export class ClassDirective extends BaseDirective2 {
    /**
     * Capture class assignments so we cache the default classes
     * which are merged with activated styles and used as fallbacks.
     */
    set klass(val) {
        this.ngClassInstance.klass = val;
        this.setValue(val, '');
    }
    constructor(elementRef, styler, marshal, renderer2, ngClassInstance) {
        super(elementRef, null, styler, marshal);
        this.ngClassInstance = ngClassInstance;
        this.DIRECTIVE_KEY = 'ngClass';
        if (!this.ngClassInstance) {
            // Create an instance NgClass Directive instance only if `ngClass=""` has NOT been defined on
            // the same host element; since the responsive variations may be defined...
            this.ngClassInstance = new NgClass(elementRef, renderer2);
        }
        this.init();
        this.setValue('', '');
    }
    updateWithValue(value) {
        this.ngClassInstance.ngClass = value;
        this.ngClassInstance.ngDoCheck();
    }
    // ******************************************************************
    // Lifecycle Hooks
    // ******************************************************************
    /**
     * For ChangeDetectionStrategy.onPush and ngOnChanges() updates
     */
    ngDoCheck() {
        this.ngClassInstance.ngDoCheck();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ClassDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }, { token: i0.Renderer2 }, { token: i2.NgClass, optional: true, self: true }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: ClassDirective, inputs: { klass: ["class", "klass"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ClassDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }, { type: i0.Renderer2 }, { type: i2.NgClass, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }], propDecorators: { klass: [{
                type: Input,
                args: ['class']
            }] } });
const inputs = [
    'ngClass',
    'ngClass.xs',
    'ngClass.sm',
    'ngClass.md',
    'ngClass.lg',
    'ngClass.xl',
    'ngClass.lt-sm',
    'ngClass.lt-md',
    'ngClass.lt-lg',
    'ngClass.lt-xl',
    'ngClass.gt-xs',
    'ngClass.gt-sm',
    'ngClass.gt-md',
    'ngClass.gt-lg',
];
const selector = `
  [ngClass], [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],
  [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl],
  [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]
`;
/**
 * Directive to add responsive support for ngClass.
 * This maintains the core functionality of 'ngClass' and adds responsive API
 * Note: this class is a no-op when rendered on the server
 */
export class DefaultClassDirective extends ClassDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultClassDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultClassDirective, selector: "\n  [ngClass], [ngClass.xs], [ngClass.sm], [ngClass.md], [ngClass.lg], [ngClass.xl],\n  [ngClass.lt-sm], [ngClass.lt-md], [ngClass.lt-lg], [ngClass.lt-xl],\n  [ngClass.gt-xs], [ngClass.gt-sm], [ngClass.gt-md], [ngClass.gt-lg]\n", inputs: { ngClass: "ngClass", "ngClass.xs": "ngClass.xs", "ngClass.sm": "ngClass.sm", "ngClass.md": "ngClass.md", "ngClass.lg": "ngClass.lg", "ngClass.xl": "ngClass.xl", "ngClass.lt-sm": "ngClass.lt-sm", "ngClass.lt-md": "ngClass.lt-md", "ngClass.lt-lg": "ngClass.lt-lg", "ngClass.lt-xl": "ngClass.lt-xl", "ngClass.gt-xs": "ngClass.gt-xs", "ngClass.gt-sm": "ngClass.gt-sm", "ngClass.gt-md": "ngClass.gt-md", "ngClass.gt-lg": "ngClass.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultClassDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xhc3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2V4dGVuZGVkL2NsYXNzL2NsYXNzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUMxQyxPQUFPLEVBQ0wsU0FBUyxFQUdULEtBQUssRUFDTCxRQUFRLEVBRVIsSUFBSSxHQUNMLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFDTCxjQUFjLEdBR2YsTUFBTSw0QkFBNEIsQ0FBQzs7OztBQUdwQyxNQUFNLE9BQU8sY0FBZSxTQUFRLGNBQWM7SUFHaEQ7OztPQUdHO0lBQ0gsSUFDSSxLQUFLLENBQUMsR0FBVztRQUNuQixJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUVELFlBQ0UsVUFBc0IsRUFDdEIsTUFBa0IsRUFDbEIsT0FBd0IsRUFDeEIsU0FBb0IsRUFDbUIsZUFBd0I7UUFFL0QsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRkgsb0JBQWUsR0FBZixlQUFlLENBQVM7UUFqQjlDLGtCQUFhLEdBQUcsU0FBUyxDQUFDO1FBb0IzQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQzFCLDZGQUE2RjtZQUM3RiwyRUFBMkU7WUFDM0UsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3hCLENBQUM7SUFFa0IsZUFBZSxDQUFDLEtBQVU7UUFDM0MsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVELHFFQUFxRTtJQUNyRSxrQkFBa0I7SUFDbEIscUVBQXFFO0lBRXJFOztPQUVHO0lBQ0gsU0FBUztRQUNQLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDbkMsQ0FBQzs4R0E1Q1UsY0FBYztrR0FBZCxjQUFjOzsyRkFBZCxjQUFjO2tCQUQxQixTQUFTOzswQkFtQkwsUUFBUTs7MEJBQUksSUFBSTt5Q0FWZixLQUFLO3NCQURSLEtBQUs7dUJBQUMsT0FBTzs7QUF3Q2hCLE1BQU0sTUFBTSxHQUFHO0lBQ2IsU0FBUztJQUNULFlBQVk7SUFDWixZQUFZO0lBQ1osWUFBWTtJQUNaLFlBQVk7SUFDWixZQUFZO0lBQ1osZUFBZTtJQUNmLGVBQWU7SUFDZixlQUFlO0lBQ2YsZUFBZTtJQUNmLGVBQWU7SUFDZixlQUFlO0lBQ2YsZUFBZTtJQUNmLGVBQWU7Q0FDaEIsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUFHOzs7O0NBSWhCLENBQUM7QUFFRjs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGNBQWM7SUFEekQ7O1FBRXFCLFdBQU0sR0FBRyxNQUFNLENBQUM7S0FDcEM7OEdBRlkscUJBQXFCO2tHQUFyQixxQkFBcUI7OzJGQUFyQixxQkFBcUI7a0JBRGpDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBOZ0NsYXNzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIERpcmVjdGl2ZSxcbiAgRG9DaGVjayxcbiAgRWxlbWVudFJlZixcbiAgSW5wdXQsXG4gIE9wdGlvbmFsLFxuICBSZW5kZXJlcjIsXG4gIFNlbGYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQmFzZURpcmVjdGl2ZTIsXG4gIE1lZGlhTWFyc2hhbGxlcixcbiAgU3R5bGVVdGlscyxcbn0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L2NvcmUnO1xuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBDbGFzc0RpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBESVJFQ1RJVkVfS0VZID0gJ25nQ2xhc3MnO1xuXG4gIC8qKlxuICAgKiBDYXB0dXJlIGNsYXNzIGFzc2lnbm1lbnRzIHNvIHdlIGNhY2hlIHRoZSBkZWZhdWx0IGNsYXNzZXNcbiAgICogd2hpY2ggYXJlIG1lcmdlZCB3aXRoIGFjdGl2YXRlZCBzdHlsZXMgYW5kIHVzZWQgYXMgZmFsbGJhY2tzLlxuICAgKi9cbiAgQElucHV0KCdjbGFzcycpXG4gIHNldCBrbGFzcyh2YWw6IHN0cmluZykge1xuICAgIHRoaXMubmdDbGFzc0luc3RhbmNlLmtsYXNzID0gdmFsO1xuICAgIHRoaXMuc2V0VmFsdWUodmFsLCAnJyk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHN0eWxlcjogU3R5bGVVdGlscyxcbiAgICBtYXJzaGFsOiBNZWRpYU1hcnNoYWxsZXIsXG4gICAgcmVuZGVyZXIyOiBSZW5kZXJlcjIsXG4gICAgQE9wdGlvbmFsKCkgQFNlbGYoKSBwcm90ZWN0ZWQgcmVhZG9ubHkgbmdDbGFzc0luc3RhbmNlOiBOZ0NsYXNzXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIG51bGwhLCBzdHlsZXIsIG1hcnNoYWwpO1xuICAgIGlmICghdGhpcy5uZ0NsYXNzSW5zdGFuY2UpIHtcbiAgICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBOZ0NsYXNzIERpcmVjdGl2ZSBpbnN0YW5jZSBvbmx5IGlmIGBuZ0NsYXNzPVwiXCJgIGhhcyBOT1QgYmVlbiBkZWZpbmVkIG9uXG4gICAgICAvLyB0aGUgc2FtZSBob3N0IGVsZW1lbnQ7IHNpbmNlIHRoZSByZXNwb25zaXZlIHZhcmlhdGlvbnMgbWF5IGJlIGRlZmluZWQuLi5cbiAgICAgIHRoaXMubmdDbGFzc0luc3RhbmNlID0gbmV3IE5nQ2xhc3MoZWxlbWVudFJlZiwgcmVuZGVyZXIyKTtcbiAgICB9XG4gICAgdGhpcy5pbml0KCk7XG4gICAgdGhpcy5zZXRWYWx1ZSgnJywgJycpO1xuICB9XG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHVwZGF0ZVdpdGhWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgdGhpcy5uZ0NsYXNzSW5zdGFuY2UubmdDbGFzcyA9IHZhbHVlO1xuICAgIHRoaXMubmdDbGFzc0luc3RhbmNlLm5nRG9DaGVjaygpO1xuICB9XG5cbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gIC8vIExpZmVjeWNsZSBIb29rc1xuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAvKipcbiAgICogRm9yIENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lm9uUHVzaCBhbmQgbmdPbkNoYW5nZXMoKSB1cGRhdGVzXG4gICAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgdGhpcy5uZ0NsYXNzSW5zdGFuY2UubmdEb0NoZWNrKCk7XG4gIH1cbn1cblxuY29uc3QgaW5wdXRzID0gW1xuICAnbmdDbGFzcycsXG4gICduZ0NsYXNzLnhzJyxcbiAgJ25nQ2xhc3Muc20nLFxuICAnbmdDbGFzcy5tZCcsXG4gICduZ0NsYXNzLmxnJyxcbiAgJ25nQ2xhc3MueGwnLFxuICAnbmdDbGFzcy5sdC1zbScsXG4gICduZ0NsYXNzLmx0LW1kJyxcbiAgJ25nQ2xhc3MubHQtbGcnLFxuICAnbmdDbGFzcy5sdC14bCcsXG4gICduZ0NsYXNzLmd0LXhzJyxcbiAgJ25nQ2xhc3MuZ3Qtc20nLFxuICAnbmdDbGFzcy5ndC1tZCcsXG4gICduZ0NsYXNzLmd0LWxnJyxcbl07XG5cbmNvbnN0IHNlbGVjdG9yID0gYFxuICBbbmdDbGFzc10sIFtuZ0NsYXNzLnhzXSwgW25nQ2xhc3Muc21dLCBbbmdDbGFzcy5tZF0sIFtuZ0NsYXNzLmxnXSwgW25nQ2xhc3MueGxdLFxuICBbbmdDbGFzcy5sdC1zbV0sIFtuZ0NsYXNzLmx0LW1kXSwgW25nQ2xhc3MubHQtbGddLCBbbmdDbGFzcy5sdC14bF0sXG4gIFtuZ0NsYXNzLmd0LXhzXSwgW25nQ2xhc3MuZ3Qtc21dLCBbbmdDbGFzcy5ndC1tZF0sIFtuZ0NsYXNzLmd0LWxnXVxuYDtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdG8gYWRkIHJlc3BvbnNpdmUgc3VwcG9ydCBmb3IgbmdDbGFzcy5cbiAqIFRoaXMgbWFpbnRhaW5zIHRoZSBjb3JlIGZ1bmN0aW9uYWxpdHkgb2YgJ25nQ2xhc3MnIGFuZCBhZGRzIHJlc3BvbnNpdmUgQVBJXG4gKiBOb3RlOiB0aGlzIGNsYXNzIGlzIGEgbm8tb3Agd2hlbiByZW5kZXJlZCBvbiB0aGUgc2VydmVyXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvciwgaW5wdXRzIH0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdENsYXNzRGlyZWN0aXZlIGV4dGVuZHMgQ2xhc3NEaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuIl19