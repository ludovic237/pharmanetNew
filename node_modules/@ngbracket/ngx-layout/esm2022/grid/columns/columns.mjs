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
export class GridColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input, parent) {
        input = input || DEFAULT_VALUE;
        let auto = false;
        if (input.endsWith(AUTO_SPECIFIER)) {
            input = input.substring(0, input.indexOf(AUTO_SPECIFIER));
            auto = true;
        }
        const css = {
            display: parent.inline ? 'inline-grid' : 'grid',
            'grid-auto-columns': '',
            'grid-template-columns': '',
        };
        const key = auto ? 'grid-auto-columns' : 'grid-template-columns';
        css[key] = input;
        return css;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridColumnsStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridColumnsStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridColumnsStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class GridColumnsDirective extends BaseDirective2 {
    get inline() {
        return this._inline;
    }
    set inline(val) {
        this._inline = coerceBooleanProperty(val);
    }
    constructor(elementRef, styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.DIRECTIVE_KEY = 'grid-columns';
        this._inline = false;
        this.init();
    }
    // *********************************************
    // Protected methods
    // *********************************************
    updateWithValue(value) {
        this.styleCache = this.inline ? columnsInlineCache : columnsCache;
        this.addStyles(value, { inline: this.inline });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridColumnsDirective, deps: [{ token: i0.ElementRef }, { token: GridColumnsStyleBuilder }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: GridColumnsDirective, inputs: { inline: ["gdInline", "inline"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridColumnsDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: GridColumnsStyleBuilder }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }], propDecorators: { inline: [{
                type: Input,
                args: ['gdInline']
            }] } });
const columnsCache = new Map();
const columnsInlineCache = new Map();
const inputs = [
    'gdColumns',
    'gdColumns.xs',
    'gdColumns.sm',
    'gdColumns.md',
    'gdColumns.lg',
    'gdColumns.xl',
    'gdColumns.lt-sm',
    'gdColumns.lt-md',
    'gdColumns.lt-lg',
    'gdColumns.lt-xl',
    'gdColumns.gt-xs',
    'gdColumns.gt-sm',
    'gdColumns.gt-md',
    'gdColumns.gt-lg',
];
const selector = `
  [gdColumns],
  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],
  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],
  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]
`;
/**
 * 'grid-template-columns' CSS Grid styling directive
 * Configures the sizing for the columns in the grid
 * Syntax: <column value> [auto]
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-13
 */
export class DefaultGridColumnsDirective extends GridColumnsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridColumnsDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultGridColumnsDirective, selector: "\n  [gdColumns],\n  [gdColumns.xs], [gdColumns.sm], [gdColumns.md], [gdColumns.lg], [gdColumns.xl],\n  [gdColumns.lt-sm], [gdColumns.lt-md], [gdColumns.lt-lg], [gdColumns.lt-xl],\n  [gdColumns.gt-xs], [gdColumns.gt-sm], [gdColumns.gt-md], [gdColumns.gt-lg]\n", inputs: { gdColumns: "gdColumns", "gdColumns.xs": "gdColumns.xs", "gdColumns.sm": "gdColumns.sm", "gdColumns.md": "gdColumns.md", "gdColumns.lg": "gdColumns.lg", "gdColumns.xl": "gdColumns.xl", "gdColumns.lt-sm": "gdColumns.lt-sm", "gdColumns.lt-md": "gdColumns.lt-md", "gdColumns.lt-lg": "gdColumns.lt-lg", "gdColumns.lt-xl": "gdColumns.lt-xl", "gdColumns.gt-xs": "gdColumns.gt-xs", "gdColumns.gt-sm": "gdColumns.gt-sm", "gdColumns.gt-md": "gdColumns.gt-md", "gdColumns.gt-lg": "gdColumns.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridColumnsDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZ3JpZC9jb2x1bW5zL2NvbHVtbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFDTCxjQUFjLEVBRWQsWUFBWSxHQUdiLE1BQU0sNEJBQTRCLENBQUM7OztBQUVwQyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUM7QUFDN0IsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDO0FBTzNCLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxZQUFZO0lBQ3ZELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBeUI7UUFDbEQsS0FBSyxHQUFHLEtBQUssSUFBSSxhQUFhLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ2pCLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxDQUFDO1lBQ25DLEtBQUssR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxHQUFHLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxNQUFNLEdBQUcsR0FBRztZQUNWLE9BQU8sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU07WUFDL0MsbUJBQW1CLEVBQUUsRUFBRTtZQUN2Qix1QkFBdUIsRUFBRSxFQUFFO1NBQzVCLENBQUM7UUFDRixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztRQUNqRSxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWpCLE9BQU8sR0FBRyxDQUFDO0lBQ2IsQ0FBQzs4R0FsQlUsdUJBQXVCO2tIQUF2Qix1QkFBdUIsY0FEVixNQUFNOzsyRkFDbkIsdUJBQXVCO2tCQURuQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7QUF1QmxDLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxjQUFjO0lBR3RELElBQ0ksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsR0FBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxZQUNFLFVBQXNCLEVBQ3RCLFlBQXFDLEVBQ3JDLE1BQWtCLEVBQ2xCLE9BQXdCO1FBRXhCLEtBQUssQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQWpCaEMsa0JBQWEsR0FBRyxjQUFjLENBQUM7UUFTeEMsWUFBTyxHQUFHLEtBQUssQ0FBQztRQVN4QixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDZCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQixnREFBZ0Q7SUFFN0IsZUFBZSxDQUFDLEtBQWE7UUFDOUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDO1FBQ2xFLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELENBQUM7OEdBN0JVLG9CQUFvQjtrR0FBcEIsb0JBQW9COzsyRkFBcEIsb0JBQW9CO2tCQURoQyxTQUFTO3lLQUtKLE1BQU07c0JBRFQsS0FBSzt1QkFBQyxVQUFVOztBQTZCbkIsTUFBTSxZQUFZLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDN0QsTUFBTSxrQkFBa0IsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUVuRSxNQUFNLE1BQU0sR0FBRztJQUNiLFdBQVc7SUFDWCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGlCQUFpQjtJQUNqQixpQkFBaUI7SUFDakIsaUJBQWlCO0lBQ2pCLGlCQUFpQjtJQUNqQixpQkFBaUI7SUFDakIsaUJBQWlCO0lBQ2pCLGlCQUFpQjtJQUNqQixpQkFBaUI7Q0FDbEIsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUFHOzs7OztDQUtoQixDQUFDO0FBRUY7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sMkJBQTRCLFNBQVEsb0JBQW9CO0lBRHJFOztRQUVxQixXQUFNLEdBQUcsTUFBTSxDQUFDO0tBQ3BDOzhHQUZZLDJCQUEyQjtrR0FBM0IsMkJBQTJCOzsyRkFBM0IsMkJBQTJCO2tCQUR2QyxTQUFTO21CQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgY29lcmNlQm9vbGVhblByb3BlcnR5IH0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0YWJsZSwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJhc2VEaXJlY3RpdmUyLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5cbmNvbnN0IERFRkFVTFRfVkFMVUUgPSAnbm9uZSc7XG5jb25zdCBBVVRPX1NQRUNJRklFUiA9ICchJztcblxuZXhwb3J0IGludGVyZmFjZSBHcmlkQ29sdW1uc1BhcmVudCB7XG4gIGlubGluZTogYm9vbGVhbjtcbn1cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBHcmlkQ29sdW1uc1N0eWxlQnVpbGRlciBleHRlbmRzIFN0eWxlQnVpbGRlciB7XG4gIGJ1aWxkU3R5bGVzKGlucHV0OiBzdHJpbmcsIHBhcmVudDogR3JpZENvbHVtbnNQYXJlbnQpIHtcbiAgICBpbnB1dCA9IGlucHV0IHx8IERFRkFVTFRfVkFMVUU7XG4gICAgbGV0IGF1dG8gPSBmYWxzZTtcbiAgICBpZiAoaW5wdXQuZW5kc1dpdGgoQVVUT19TUEVDSUZJRVIpKSB7XG4gICAgICBpbnB1dCA9IGlucHV0LnN1YnN0cmluZygwLCBpbnB1dC5pbmRleE9mKEFVVE9fU1BFQ0lGSUVSKSk7XG4gICAgICBhdXRvID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjc3MgPSB7XG4gICAgICBkaXNwbGF5OiBwYXJlbnQuaW5saW5lID8gJ2lubGluZS1ncmlkJyA6ICdncmlkJyxcbiAgICAgICdncmlkLWF1dG8tY29sdW1ucyc6ICcnLFxuICAgICAgJ2dyaWQtdGVtcGxhdGUtY29sdW1ucyc6ICcnLFxuICAgIH07XG4gICAgY29uc3Qga2V5ID0gYXV0byA/ICdncmlkLWF1dG8tY29sdW1ucycgOiAnZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zJztcbiAgICBjc3Nba2V5XSA9IGlucHV0O1xuXG4gICAgcmV0dXJuIGNzcztcbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBHcmlkQ29sdW1uc0RpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnZ3JpZC1jb2x1bW5zJztcblxuICBASW5wdXQoJ2dkSW5saW5lJylcbiAgZ2V0IGlubGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5saW5lO1xuICB9XG4gIHNldCBpbmxpbmUodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5saW5lID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbCk7XG4gIH1cbiAgcHJvdGVjdGVkIF9pbmxpbmUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHN0eWxlQnVpbGRlcjogR3JpZENvbHVtbnNTdHlsZUJ1aWxkZXIsXG4gICAgc3R5bGVyOiBTdHlsZVV0aWxzLFxuICAgIG1hcnNoYWw6IE1lZGlhTWFyc2hhbGxlclxuICApIHtcbiAgICBzdXBlcihlbGVtZW50UmVmLCBzdHlsZUJ1aWxkZXIsIHN0eWxlciwgbWFyc2hhbCk7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgLy8gUHJvdGVjdGVkIG1ldGhvZHNcbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHVwZGF0ZVdpdGhWYWx1ZSh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5zdHlsZUNhY2hlID0gdGhpcy5pbmxpbmUgPyBjb2x1bW5zSW5saW5lQ2FjaGUgOiBjb2x1bW5zQ2FjaGU7XG4gICAgdGhpcy5hZGRTdHlsZXModmFsdWUsIHsgaW5saW5lOiB0aGlzLmlubGluZSB9KTtcbiAgfVxufVxuXG5jb25zdCBjb2x1bW5zQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5jb25zdCBjb2x1bW5zSW5saW5lQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5cbmNvbnN0IGlucHV0cyA9IFtcbiAgJ2dkQ29sdW1ucycsXG4gICdnZENvbHVtbnMueHMnLFxuICAnZ2RDb2x1bW5zLnNtJyxcbiAgJ2dkQ29sdW1ucy5tZCcsXG4gICdnZENvbHVtbnMubGcnLFxuICAnZ2RDb2x1bW5zLnhsJyxcbiAgJ2dkQ29sdW1ucy5sdC1zbScsXG4gICdnZENvbHVtbnMubHQtbWQnLFxuICAnZ2RDb2x1bW5zLmx0LWxnJyxcbiAgJ2dkQ29sdW1ucy5sdC14bCcsXG4gICdnZENvbHVtbnMuZ3QteHMnLFxuICAnZ2RDb2x1bW5zLmd0LXNtJyxcbiAgJ2dkQ29sdW1ucy5ndC1tZCcsXG4gICdnZENvbHVtbnMuZ3QtbGcnLFxuXTtcblxuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtnZENvbHVtbnNdLFxuICBbZ2RDb2x1bW5zLnhzXSwgW2dkQ29sdW1ucy5zbV0sIFtnZENvbHVtbnMubWRdLCBbZ2RDb2x1bW5zLmxnXSwgW2dkQ29sdW1ucy54bF0sXG4gIFtnZENvbHVtbnMubHQtc21dLCBbZ2RDb2x1bW5zLmx0LW1kXSwgW2dkQ29sdW1ucy5sdC1sZ10sIFtnZENvbHVtbnMubHQteGxdLFxuICBbZ2RDb2x1bW5zLmd0LXhzXSwgW2dkQ29sdW1ucy5ndC1zbV0sIFtnZENvbHVtbnMuZ3QtbWRdLCBbZ2RDb2x1bW5zLmd0LWxnXVxuYDtcblxuLyoqXG4gKiAnZ3JpZC10ZW1wbGF0ZS1jb2x1bW5zJyBDU1MgR3JpZCBzdHlsaW5nIGRpcmVjdGl2ZVxuICogQ29uZmlndXJlcyB0aGUgc2l6aW5nIGZvciB0aGUgY29sdW1ucyBpbiB0aGUgZ3JpZFxuICogU3ludGF4OiA8Y29sdW1uIHZhbHVlPiBbYXV0b11cbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9jc3MvY29tcGxldGUtZ3VpZGUtZ3JpZC8jYXJ0aWNsZS1oZWFkZXItaWQtMTNcbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yLCBpbnB1dHMgfSlcbmV4cG9ydCBjbGFzcyBEZWZhdWx0R3JpZENvbHVtbnNEaXJlY3RpdmUgZXh0ZW5kcyBHcmlkQ29sdW1uc0RpcmVjdGl2ZSB7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBpbnB1dHMgPSBpbnB1dHM7XG59XG4iXX0=