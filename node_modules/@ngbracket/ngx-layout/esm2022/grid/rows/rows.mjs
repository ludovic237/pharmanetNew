/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Directive, Injectable, Input } from '@angular/core';
import { BaseDirective2, StyleBuilder, } from '@ngbracket/ngx-layout/core';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
const DEFAULT_VALUE = 'none';
const AUTO_SPECIFIER = '!';
export class GridRowsStyleBuilder extends StyleBuilder {
    buildStyles(input, parent) {
        input = input || DEFAULT_VALUE;
        let auto = false;
        if (input.endsWith(AUTO_SPECIFIER)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        const css = {
            display: parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-rows': '',
            'grid-template-rows': '',
        };
        const key = auto ? 'grid-auto-rows' : 'grid-template-rows';
        css[key] = input;
        return css;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridRowsStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridRowsStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridRowsStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class GridRowsDirective extends BaseDirective2 {
    get inline() {
        return this._inline;
    }
    set inline(val) {
        this._inline = coerceBooleanProperty(val);
    }
    constructor(elementRef, styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.DIRECTIVE_KEY = 'grid-rows';
        this._inline = false;
        this.init();
    }
    // *********************************************
    // Protected methods
    // *********************************************
    updateWithValue(value) {
        this.styleCache = this.inline ? rowsInlineCache : rowsCache;
        this.addStyles(value, { inline: this.inline });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridRowsDirective, deps: [{ token: i0.ElementRef }, { token: GridRowsStyleBuilder }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: GridRowsDirective, inputs: { inline: ["gdInline", "inline"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridRowsDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: GridRowsStyleBuilder }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }], propDecorators: { inline: [{
                type: Input,
                args: ['gdInline']
            }] } });
const rowsCache = new Map();
const rowsInlineCache = new Map();
const inputs = [
    'gdRows',
    'gdRows.xs',
    'gdRows.sm',
    'gdRows.md',
    'gdRows.lg',
    'gdRows.xl',
    'gdRows.lt-sm',
    'gdRows.lt-md',
    'gdRows.lt-lg',
    'gdRows.lt-xl',
    'gdRows.gt-xs',
    'gdRows.gt-sm',
    'gdRows.gt-md',
    'gdRows.gt-lg',
];
const selector = `
  [gdRows],
  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],
  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],
  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]
`;
/**
 * 'grid-template-rows' CSS Grid styling directive
 * Configures the sizing for the rows in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export class DefaultGridRowsDirective extends GridRowsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridRowsDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultGridRowsDirective, selector: "\n  [gdRows],\n  [gdRows.xs], [gdRows.sm], [gdRows.md], [gdRows.lg], [gdRows.xl],\n  [gdRows.lt-sm], [gdRows.lt-md], [gdRows.lt-lg], [gdRows.lt-xl],\n  [gdRows.gt-xs], [gdRows.gt-sm], [gdRows.gt-md], [gdRows.gt-lg]\n", inputs: { gdRows: "gdRows", "gdRows.xs": "gdRows.xs", "gdRows.sm": "gdRows.sm", "gdRows.md": "gdRows.md", "gdRows.lg": "gdRows.lg", "gdRows.xl": "gdRows.xl", "gdRows.lt-sm": "gdRows.lt-sm", "gdRows.lt-md": "gdRows.lt-md", "gdRows.lt-lg": "gdRows.lt-lg", "gdRows.lt-xl": "gdRows.lt-xl", "gdRows.gt-xs": "gdRows.gt-xs", "gdRows.gt-sm": "gdRows.gt-sm", "gdRows.gt-md": "gdRows.gt-md", "gdRows.gt-lg": "gdRows.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridRowsDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm93cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZ3JpZC9yb3dzL3Jvd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFDTCxjQUFjLEVBRWQsWUFBWSxHQUdiLE1BQU0sNEJBQTRCLENBQUM7OztBQUVwQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUM7QUFDN0IsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBTzNCLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxZQUFZO0lBQ3BELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBc0I7UUFDL0MsS0FBSyxHQUFHLEtBQUssSUFBSSxhQUFhLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ25DLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLEdBQUcsR0FBRztZQUNWLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDL0MsZ0JBQWdCLEVBQUUsRUFBRTtZQUNwQixvQkFBb0IsRUFBRSxFQUFFO1NBQ3pCLENBQUM7UUFDRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQztRQUMzRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWpCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQzs4R0FsQlUsb0JBQW9CO2tIQUFwQixvQkFBb0IsY0FEUCxNQUFNOzsyRkFDbkIsb0JBQW9CO2tCQURoQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7QUF1QmxDLE1BQU0sT0FBTyxpQkFBa0IsU0FBUSxjQUFjO0lBR25ELElBQ0ksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsR0FBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxZQUNFLFVBQXNCLEVBQ3RCLFlBQWtDLEVBQ2xDLE1BQWtCLEVBQ2xCLE9BQXdCO1FBRXhCLEtBQUssQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQWpCaEMsa0JBQWEsR0FBRyxXQUFXLENBQUM7UUFTckMsWUFBTyxHQUFHLEtBQUssQ0FBQztRQVN4QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQixnREFBZ0Q7SUFFN0IsZUFBZSxDQUFDLEtBQWE7UUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUM1RCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNqRCxDQUFDOzhHQTdCVSxpQkFBaUI7a0dBQWpCLGlCQUFpQjs7MkZBQWpCLGlCQUFpQjtrQkFEN0IsU0FBUztzS0FLSixNQUFNO3NCQURULEtBQUs7dUJBQUMsVUFBVTs7QUE2Qm5CLE1BQU0sU0FBUyxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzFELE1BQU0sZUFBZSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBRWhFLE1BQU0sTUFBTSxHQUFHO0lBQ2IsUUFBUTtJQUNSLFdBQVc7SUFDWCxXQUFXO0lBQ1gsV0FBVztJQUNYLFdBQVc7SUFDWCxXQUFXO0lBQ1gsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7Q0FDZixDQUFDO0FBRUYsTUFBTSxRQUFRLEdBQUc7Ozs7O0NBS2hCLENBQUM7QUFFRjs7Ozs7R0FLRztBQUVILE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxpQkFBaUI7SUFEL0Q7O1FBRXFCLFdBQU0sR0FBRyxNQUFNLENBQUM7S0FDcEM7OEdBRlksd0JBQXdCO2tHQUF4Qix3QkFBd0I7OzJGQUF4Qix3QkFBd0I7a0JBRHBDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBjb2VyY2VCb29sZWFuUHJvcGVydHkgfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3RhYmxlLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQmFzZURpcmVjdGl2ZTIsXG4gIE1lZGlhTWFyc2hhbGxlcixcbiAgU3R5bGVCdWlsZGVyLFxuICBTdHlsZURlZmluaXRpb24sXG4gIFN0eWxlVXRpbHMsXG59IGZyb20gJ0BuZ2JyYWNrZXQvbmd4LWxheW91dC9jb3JlJztcblxuY29uc3QgREVGQVVMVF9WQUxVRSA9ICdub25lJztcbmNvbnN0IEFVVE9fU1BFQ0lGSUVSID0gJyEnO1xuXG5leHBvcnQgaW50ZXJmYWNlIEdyaWRSb3dzUGFyZW50IHtcbiAgaW5saW5lOiBib29sZWFuO1xufVxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIEdyaWRSb3dzU3R5bGVCdWlsZGVyIGV4dGVuZHMgU3R5bGVCdWlsZGVyIHtcbiAgYnVpbGRTdHlsZXMoaW5wdXQ6IHN0cmluZywgcGFyZW50OiBHcmlkUm93c1BhcmVudCkge1xuICAgIGlucHV0ID0gaW5wdXQgfHwgREVGQVVMVF9WQUxVRTtcbiAgICBsZXQgYXV0byA9IGZhbHNlO1xuICAgIGlmIChpbnB1dC5lbmRzV2l0aChBVVRPX1NQRUNJRklFUikpIHtcbiAgICAgIGlucHV0ID0gaW5wdXQuc3Vic3RyaW5nKDAsIGlucHV0LmluZGV4T2YoQVVUT19TUEVDSUZJRVIpKTtcbiAgICAgIGF1dG8gPSB0cnVlO1xuICAgIH1cblxuICAgIGNvbnN0IGNzcyA9IHtcbiAgICAgIGRpc3BsYXk6IHBhcmVudC5pbmxpbmUgPyAnaW5saW5lLWdyaWQnIDogJ2dyaWQnLFxuICAgICAgJ2dyaWQtYXV0by1yb3dzJzogJycsXG4gICAgICAnZ3JpZC10ZW1wbGF0ZS1yb3dzJzogJycsXG4gICAgfTtcbiAgICBjb25zdCBrZXkgPSBhdXRvID8gJ2dyaWQtYXV0by1yb3dzJyA6ICdncmlkLXRlbXBsYXRlLXJvd3MnO1xuICAgIGNzc1trZXldID0gaW5wdXQ7XG5cbiAgICByZXR1cm4gY3NzO1xuICB9XG59XG5cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIEdyaWRSb3dzRGlyZWN0aXZlIGV4dGVuZHMgQmFzZURpcmVjdGl2ZTIge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgRElSRUNUSVZFX0tFWSA9ICdncmlkLXJvd3MnO1xuXG4gIEBJbnB1dCgnZ2RJbmxpbmUnKVxuICBnZXQgaW5saW5lKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pbmxpbmU7XG4gIH1cbiAgc2V0IGlubGluZSh2YWw6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9pbmxpbmUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsKTtcbiAgfVxuICBwcm90ZWN0ZWQgX2lubGluZSA9IGZhbHNlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgc3R5bGVCdWlsZGVyOiBHcmlkUm93c1N0eWxlQnVpbGRlcixcbiAgICBzdHlsZXI6IFN0eWxlVXRpbHMsXG4gICAgbWFyc2hhbDogTWVkaWFNYXJzaGFsbGVyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIHN0eWxlQnVpbGRlciwgc3R5bGVyLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAvLyBQcm90ZWN0ZWQgbWV0aG9kc1xuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2l0aFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnN0eWxlQ2FjaGUgPSB0aGlzLmlubGluZSA/IHJvd3NJbmxpbmVDYWNoZSA6IHJvd3NDYWNoZTtcbiAgICB0aGlzLmFkZFN0eWxlcyh2YWx1ZSwgeyBpbmxpbmU6IHRoaXMuaW5saW5lIH0pO1xuICB9XG59XG5cbmNvbnN0IHJvd3NDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IHJvd3NJbmxpbmVDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcblxuY29uc3QgaW5wdXRzID0gW1xuICAnZ2RSb3dzJyxcbiAgJ2dkUm93cy54cycsXG4gICdnZFJvd3Muc20nLFxuICAnZ2RSb3dzLm1kJyxcbiAgJ2dkUm93cy5sZycsXG4gICdnZFJvd3MueGwnLFxuICAnZ2RSb3dzLmx0LXNtJyxcbiAgJ2dkUm93cy5sdC1tZCcsXG4gICdnZFJvd3MubHQtbGcnLFxuICAnZ2RSb3dzLmx0LXhsJyxcbiAgJ2dkUm93cy5ndC14cycsXG4gICdnZFJvd3MuZ3Qtc20nLFxuICAnZ2RSb3dzLmd0LW1kJyxcbiAgJ2dkUm93cy5ndC1sZycsXG5dO1xuXG5jb25zdCBzZWxlY3RvciA9IGBcbiAgW2dkUm93c10sXG4gIFtnZFJvd3MueHNdLCBbZ2RSb3dzLnNtXSwgW2dkUm93cy5tZF0sIFtnZFJvd3MubGddLCBbZ2RSb3dzLnhsXSxcbiAgW2dkUm93cy5sdC1zbV0sIFtnZFJvd3MubHQtbWRdLCBbZ2RSb3dzLmx0LWxnXSwgW2dkUm93cy5sdC14bF0sXG4gIFtnZFJvd3MuZ3QteHNdLCBbZ2RSb3dzLmd0LXNtXSwgW2dkUm93cy5ndC1tZF0sIFtnZFJvd3MuZ3QtbGddXG5gO1xuXG4vKipcbiAqICdncmlkLXRlbXBsYXRlLXJvd3MnIENTUyBHcmlkIHN0eWxpbmcgZGlyZWN0aXZlXG4gKiBDb25maWd1cmVzIHRoZSBzaXppbmcgZm9yIHRoZSByb3dzIGluIHRoZSBncmlkXG4gKiBTeW50YXg6IDxjb2x1bW4gdmFsdWU+IFthdXRvXVxuICogQHNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2Nzcy9jb21wbGV0ZS1ndWlkZS1ncmlkLyNhcnRpY2xlLWhlYWRlci1pZC0xM1xuICovXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3IsIGlucHV0cyB9KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRHcmlkUm93c0RpcmVjdGl2ZSBleHRlbmRzIEdyaWRSb3dzRGlyZWN0aXZlIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlucHV0cyA9IGlucHV0cztcbn1cbiJdfQ==