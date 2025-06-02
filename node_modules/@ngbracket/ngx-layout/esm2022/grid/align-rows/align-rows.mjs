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
const DEFAULT_MAIN = 'start';
const DEFAULT_CROSS = 'stretch';
export class GridAlignRowsStyleBuilder extends StyleBuilder {
    buildStyles(input, parent) {
        return buildCss(input || `${DEFAULT_MAIN} ${DEFAULT_CROSS}`, parent.inline);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignRowsStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignRowsStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignRowsStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class GridAlignRowsDirective extends BaseDirective2 {
    get inline() {
        return this._inline;
    }
    set inline(val) {
        this._inline = coerceBooleanProperty(val);
    }
    constructor(elementRef, styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.DIRECTIVE_KEY = 'grid-align-rows';
        this._inline = false;
        this.init();
    }
    // *********************************************
    // Protected methods
    // *********************************************
    updateWithValue(value) {
        this.styleCache = this.inline ? alignRowsInlineCache : alignRowsCache;
        this.addStyles(value, { inline: this.inline });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignRowsDirective, deps: [{ token: i0.ElementRef }, { token: GridAlignRowsStyleBuilder }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: GridAlignRowsDirective, inputs: { inline: ["gdInline", "inline"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignRowsDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: GridAlignRowsStyleBuilder }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }], propDecorators: { inline: [{
                type: Input,
                args: ['gdInline']
            }] } });
const alignRowsCache = new Map();
const alignRowsInlineCache = new Map();
const inputs = [
    'gdAlignRows',
    'gdAlignRows.xs',
    'gdAlignRows.sm',
    'gdAlignRows.md',
    'gdAlignRows.lg',
    'gdAlignRows.xl',
    'gdAlignRows.lt-sm',
    'gdAlignRows.lt-md',
    'gdAlignRows.lt-lg',
    'gdAlignRows.lt-xl',
    'gdAlignRows.gt-xs',
    'gdAlignRows.gt-sm',
    'gdAlignRows.gt-md',
    'gdAlignRows.gt-lg',
];
const selector = `
  [gdAlignRows],
  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],
  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],
  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],
  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],
  [gdAlignRows.gt-lg]
`;
/**
 * 'row alignment' CSS Grid styling directive
 * Configures the alignment in the row direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-18
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-20
 */
export class DefaultGridAlignRowsDirective extends GridAlignRowsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridAlignRowsDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultGridAlignRowsDirective, selector: "\n  [gdAlignRows],\n  [gdAlignRows.xs], [gdAlignRows.sm], [gdAlignRows.md],\n  [gdAlignRows.lg], [gdAlignRows.xl], [gdAlignRows.lt-sm],\n  [gdAlignRows.lt-md], [gdAlignRows.lt-lg], [gdAlignRows.lt-xl],\n  [gdAlignRows.gt-xs], [gdAlignRows.gt-sm], [gdAlignRows.gt-md],\n  [gdAlignRows.gt-lg]\n", inputs: { gdAlignRows: "gdAlignRows", "gdAlignRows.xs": "gdAlignRows.xs", "gdAlignRows.sm": "gdAlignRows.sm", "gdAlignRows.md": "gdAlignRows.md", "gdAlignRows.lg": "gdAlignRows.lg", "gdAlignRows.xl": "gdAlignRows.xl", "gdAlignRows.lt-sm": "gdAlignRows.lt-sm", "gdAlignRows.lt-md": "gdAlignRows.lt-md", "gdAlignRows.lt-lg": "gdAlignRows.lt-lg", "gdAlignRows.lt-xl": "gdAlignRows.lt-xl", "gdAlignRows.gt-xs": "gdAlignRows.gt-xs", "gdAlignRows.gt-sm": "gdAlignRows.gt-sm", "gdAlignRows.gt-md": "gdAlignRows.gt-md", "gdAlignRows.gt-lg": "gdAlignRows.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridAlignRowsDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
function buildCss(align, inline) {
    const css = {}, [mainAxis, crossAxis] = align.split(' ');
    // Main axis
    switch (mainAxis) {
        case 'center':
        case 'space-around':
        case 'space-between':
        case 'space-evenly':
        case 'end':
        case 'start':
        case 'stretch':
            css['justify-content'] = mainAxis;
            break;
        default: // default main axis
            css['justify-content'] = DEFAULT_MAIN;
            break;
    }
    // Cross-axis
    switch (crossAxis) {
        case 'start':
        case 'center':
        case 'end':
        case 'stretch':
            css['justify-items'] = crossAxis;
            break;
        default: // 'stretch'
            // default cross axis
            css['justify-items'] = DEFAULT_CROSS;
            break;
    }
    css['display'] = inline ? 'inline-grid' : 'grid';
    return css;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ24tcm93cy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZ3JpZC9hbGlnbi1yb3dzL2FsaWduLXJvd3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFDTCxjQUFjLEVBRWQsWUFBWSxHQUdiLE1BQU0sNEJBQTRCLENBQUM7OztBQUVwQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBT2hDLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxZQUFZO0lBQ3pELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBMkI7UUFDcEQsT0FBTyxRQUFRLENBQUMsS0FBSyxJQUFJLEdBQUcsWUFBWSxJQUFJLGFBQWEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RSxDQUFDOzhHQUhVLHlCQUF5QjtrSEFBekIseUJBQXlCLGNBRFosTUFBTTs7MkZBQ25CLHlCQUF5QjtrQkFEckMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7O0FBUWxDLE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxjQUFjO0lBR3hELElBQ0ksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsR0FBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxZQUNFLFVBQXNCLEVBQ3RCLFlBQXVDLEVBQ3ZDLE1BQWtCLEVBQ2xCLE9BQXdCO1FBRXhCLEtBQUss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dGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdGFibGUsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBCYXNlRGlyZWN0aXZlMixcbiAgTWVkaWFNYXJzaGFsbGVyLFxuICBTdHlsZUJ1aWxkZXIsXG4gIFN0eWxlRGVmaW5pdGlvbixcbiAgU3R5bGVVdGlscyxcbn0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L2NvcmUnO1xuXG5jb25zdCBERUZBVUxUX01BSU4gPSAnc3RhcnQnO1xuY29uc3QgREVGQVVMVF9DUk9TUyA9ICdzdHJldGNoJztcblxuZXhwb3J0IGludGVyZmFjZSBHcmlkQWxpZ25Sb3dzUGFyZW50IHtcbiAgaW5saW5lOiBib29sZWFuO1xufVxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIEdyaWRBbGlnblJvd3NTdHlsZUJ1aWxkZXIgZXh0ZW5kcyBTdHlsZUJ1aWxkZXIge1xuICBidWlsZFN0eWxlcyhpbnB1dDogc3RyaW5nLCBwYXJlbnQ6IEdyaWRBbGlnblJvd3NQYXJlbnQpIHtcbiAgICByZXR1cm4gYnVpbGRDc3MoaW5wdXQgfHwgYCR7REVGQVVMVF9NQUlOfSAke0RFRkFVTFRfQ1JPU1N9YCwgcGFyZW50LmlubGluZSk7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgR3JpZEFsaWduUm93c0RpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnZ3JpZC1hbGlnbi1yb3dzJztcblxuICBASW5wdXQoJ2dkSW5saW5lJylcbiAgZ2V0IGlubGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5saW5lO1xuICB9XG4gIHNldCBpbmxpbmUodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5saW5lID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbCk7XG4gIH1cbiAgcHJvdGVjdGVkIF9pbmxpbmUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHN0eWxlQnVpbGRlcjogR3JpZEFsaWduUm93c1N0eWxlQnVpbGRlcixcbiAgICBzdHlsZXI6IFN0eWxlVXRpbHMsXG4gICAgbWFyc2hhbDogTWVkaWFNYXJzaGFsbGVyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIHN0eWxlQnVpbGRlciwgc3R5bGVyLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAvLyBQcm90ZWN0ZWQgbWV0aG9kc1xuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2l0aFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnN0eWxlQ2FjaGUgPSB0aGlzLmlubGluZSA/IGFsaWduUm93c0lubGluZUNhY2hlIDogYWxpZ25Sb3dzQ2FjaGU7XG4gICAgdGhpcy5hZGRTdHlsZXModmFsdWUsIHsgaW5saW5lOiB0aGlzLmlubGluZSB9KTtcbiAgfVxufVxuXG5jb25zdCBhbGlnblJvd3NDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGFsaWduUm93c0lubGluZUNhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBpbnB1dHMgPSBbXG4gICdnZEFsaWduUm93cycsXG4gICdnZEFsaWduUm93cy54cycsXG4gICdnZEFsaWduUm93cy5zbScsXG4gICdnZEFsaWduUm93cy5tZCcsXG4gICdnZEFsaWduUm93cy5sZycsXG4gICdnZEFsaWduUm93cy54bCcsXG4gICdnZEFsaWduUm93cy5sdC1zbScsXG4gICdnZEFsaWduUm93cy5sdC1tZCcsXG4gICdnZEFsaWduUm93cy5sdC1sZycsXG4gICdnZEFsaWduUm93cy5sdC14bCcsXG4gICdnZEFsaWduUm93cy5ndC14cycsXG4gICdnZEFsaWduUm93cy5ndC1zbScsXG4gICdnZEFsaWduUm93cy5ndC1tZCcsXG4gICdnZEFsaWduUm93cy5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtnZEFsaWduUm93c10sXG4gIFtnZEFsaWduUm93cy54c10sIFtnZEFsaWduUm93cy5zbV0sIFtnZEFsaWduUm93cy5tZF0sXG4gIFtnZEFsaWduUm93cy5sZ10sIFtnZEFsaWduUm93cy54bF0sIFtnZEFsaWduUm93cy5sdC1zbV0sXG4gIFtnZEFsaWduUm93cy5sdC1tZF0sIFtnZEFsaWduUm93cy5sdC1sZ10sIFtnZEFsaWduUm93cy5sdC14bF0sXG4gIFtnZEFsaWduUm93cy5ndC14c10sIFtnZEFsaWduUm93cy5ndC1zbV0sIFtnZEFsaWduUm93cy5ndC1tZF0sXG4gIFtnZEFsaWduUm93cy5ndC1sZ11cbmA7XG5cbi8qKlxuICogJ3JvdyBhbGlnbm1lbnQnIENTUyBHcmlkIHN0eWxpbmcgZGlyZWN0aXZlXG4gKiBDb25maWd1cmVzIHRoZSBhbGlnbm1lbnQgaW4gdGhlIHJvdyBkaXJlY3Rpb25cbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9jc3MvY29tcGxldGUtZ3VpZGUtZ3JpZC8jYXJ0aWNsZS1oZWFkZXItaWQtMThcbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9jc3MvY29tcGxldGUtZ3VpZGUtZ3JpZC8jYXJ0aWNsZS1oZWFkZXItaWQtMjBcbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yLCBpbnB1dHMgfSlcbmV4cG9ydCBjbGFzcyBEZWZhdWx0R3JpZEFsaWduUm93c0RpcmVjdGl2ZSBleHRlbmRzIEdyaWRBbGlnblJvd3NEaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuXG5mdW5jdGlvbiBidWlsZENzcyhhbGlnbjogc3RyaW5nLCBpbmxpbmU6IGJvb2xlYW4pOiBTdHlsZURlZmluaXRpb24ge1xuICBjb25zdCBjc3M6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fSxcbiAgICBbbWFpbkF4aXMsIGNyb3NzQXhpc10gPSBhbGlnbi5zcGxpdCgnICcpO1xuXG4gIC8vIE1haW4gYXhpc1xuICBzd2l0Y2ggKG1haW5BeGlzKSB7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICBjYXNlICdzcGFjZS1hcm91bmQnOlxuICAgIGNhc2UgJ3NwYWNlLWJldHdlZW4nOlxuICAgIGNhc2UgJ3NwYWNlLWV2ZW5seSc6XG4gICAgY2FzZSAnZW5kJzpcbiAgICBjYXNlICdzdGFydCc6XG4gICAgY2FzZSAnc3RyZXRjaCc6XG4gICAgICBjc3NbJ2p1c3RpZnktY29udGVudCddID0gbWFpbkF4aXM7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OiAvLyBkZWZhdWx0IG1haW4gYXhpc1xuICAgICAgY3NzWydqdXN0aWZ5LWNvbnRlbnQnXSA9IERFRkFVTFRfTUFJTjtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gQ3Jvc3MtYXhpc1xuICBzd2l0Y2ggKGNyb3NzQXhpcykge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICBjYXNlICdjZW50ZXInOlxuICAgIGNhc2UgJ2VuZCc6XG4gICAgY2FzZSAnc3RyZXRjaCc6XG4gICAgICBjc3NbJ2p1c3RpZnktaXRlbXMnXSA9IGNyb3NzQXhpcztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vICdzdHJldGNoJ1xuICAgICAgLy8gZGVmYXVsdCBjcm9zcyBheGlzXG4gICAgICBjc3NbJ2p1c3RpZnktaXRlbXMnXSA9IERFRkFVTFRfQ1JPU1M7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIGNzc1snZGlzcGxheSddID0gaW5saW5lID8gJ2lubGluZS1ncmlkJyA6ICdncmlkJztcblxuICByZXR1cm4gY3NzO1xufVxuIl19