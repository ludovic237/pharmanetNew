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
export class GridAlignColumnsStyleBuilder extends StyleBuilder {
    buildStyles(input, parent) {
        return buildCss(input || `${DEFAULT_MAIN} ${DEFAULT_CROSS}`, parent.inline);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignColumnsStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignColumnsStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignColumnsStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class GridAlignColumnsDirective extends BaseDirective2 {
    get inline() {
        return this._inline;
    }
    set inline(val) {
        this._inline = coerceBooleanProperty(val);
    }
    constructor(elementRef, styleBuilder, styler, marshal) {
        super(elementRef, styleBuilder, styler, marshal);
        this.DIRECTIVE_KEY = 'grid-align-columns';
        this._inline = false;
        this.init();
    }
    // *********************************************
    // Protected methods
    // *********************************************
    updateWithValue(value) {
        this.styleCache = this.inline ? alignColumnsInlineCache : alignColumnsCache;
        this.addStyles(value, { inline: this.inline });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignColumnsDirective, deps: [{ token: i0.ElementRef }, { token: GridAlignColumnsStyleBuilder }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: GridAlignColumnsDirective, inputs: { inline: ["gdInline", "inline"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: GridAlignColumnsDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: GridAlignColumnsStyleBuilder }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }], propDecorators: { inline: [{
                type: Input,
                args: ['gdInline']
            }] } });
const alignColumnsCache = new Map();
const alignColumnsInlineCache = new Map();
const inputs = [
    'gdAlignColumns',
    'gdAlignColumns.xs',
    'gdAlignColumns.sm',
    'gdAlignColumns.md',
    'gdAlignColumns.lg',
    'gdAlignColumns.xl',
    'gdAlignColumns.lt-sm',
    'gdAlignColumns.lt-md',
    'gdAlignColumns.lt-lg',
    'gdAlignColumns.lt-xl',
    'gdAlignColumns.gt-xs',
    'gdAlignColumns.gt-sm',
    'gdAlignColumns.gt-md',
    'gdAlignColumns.gt-lg',
];
const selector = `
  [gdAlignColumns],
  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],
  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],
  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],
  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],
  [gdAlignColumns.gt-lg]
`;
/**
 * 'column alignment' CSS Grid styling directive
 * Configures the alignment in the column direction
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-19
 * @see https://css-tricks.com/snippets/css/complete-guide-grid/#article-header-id-21
 */
export class DefaultGridAlignColumnsDirective extends GridAlignColumnsDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridAlignColumnsDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultGridAlignColumnsDirective, selector: "\n  [gdAlignColumns],\n  [gdAlignColumns.xs], [gdAlignColumns.sm], [gdAlignColumns.md],\n  [gdAlignColumns.lg], [gdAlignColumns.xl], [gdAlignColumns.lt-sm],\n  [gdAlignColumns.lt-md], [gdAlignColumns.lt-lg], [gdAlignColumns.lt-xl],\n  [gdAlignColumns.gt-xs], [gdAlignColumns.gt-sm], [gdAlignColumns.gt-md],\n  [gdAlignColumns.gt-lg]\n", inputs: { gdAlignColumns: "gdAlignColumns", "gdAlignColumns.xs": "gdAlignColumns.xs", "gdAlignColumns.sm": "gdAlignColumns.sm", "gdAlignColumns.md": "gdAlignColumns.md", "gdAlignColumns.lg": "gdAlignColumns.lg", "gdAlignColumns.xl": "gdAlignColumns.xl", "gdAlignColumns.lt-sm": "gdAlignColumns.lt-sm", "gdAlignColumns.lt-md": "gdAlignColumns.lt-md", "gdAlignColumns.lt-lg": "gdAlignColumns.lt-lg", "gdAlignColumns.lt-xl": "gdAlignColumns.lt-xl", "gdAlignColumns.gt-xs": "gdAlignColumns.gt-xs", "gdAlignColumns.gt-sm": "gdAlignColumns.gt-sm", "gdAlignColumns.gt-md": "gdAlignColumns.gt-md", "gdAlignColumns.gt-lg": "gdAlignColumns.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultGridAlignColumnsDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
function buildCss(align, inline) {
    const css = {}, [mainAxis, crossAxis] = align.split(' ');
    // Main axis
    switch (mainAxis) {
        case 'center':
            css['align-content'] = 'center';
            break;
        case 'space-around':
            css['align-content'] = 'space-around';
            break;
        case 'space-between':
            css['align-content'] = 'space-between';
            break;
        case 'space-evenly':
            css['align-content'] = 'space-evenly';
            break;
        case 'end':
            css['align-content'] = 'end';
            break;
        case 'start':
            css['align-content'] = 'start';
            break;
        case 'stretch':
            css['align-content'] = 'stretch';
            break;
        default: // default main axis
            css['align-content'] = DEFAULT_MAIN;
            break;
    }
    // Cross-axis
    switch (crossAxis) {
        case 'start':
            css['align-items'] = 'start';
            break;
        case 'center':
            css['align-items'] = 'center';
            break;
        case 'end':
            css['align-items'] = 'end';
            break;
        case 'stretch':
            css['align-items'] = 'stretch';
            break;
        default: // 'stretch'
            // default cross axis
            css['align-items'] = DEFAULT_CROSS;
            break;
    }
    css['display'] = inline ? 'inline-grid' : 'grid';
    return css;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxpZ24tY29sdW1ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZ3JpZC9hbGlnbi1jb2x1bW5zL2FsaWduLWNvbHVtbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFDTCxjQUFjLEVBRWQsWUFBWSxHQUdiLE1BQU0sNEJBQTRCLENBQUM7OztBQUVwQyxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDN0IsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0FBT2hDLE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxZQUFZO0lBQzVELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBOEI7UUFDdkQsT0FBTyxRQUFRLENBQUMsS0FBSyxJQUFJLEdBQUcsWUFBWSxJQUFJLGFBQWEsRUFBRSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM5RSxDQUFDOzhHQUhVLDRCQUE0QjtrSEFBNUIsNEJBQTRCLGNBRGYsTUFBTTs7MkZBQ25CLDRCQUE0QjtrQkFEeEMsVUFBVTttQkFBQyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7O0FBUWxDLE1BQU0sT0FBTyx5QkFBMEIsU0FBUSxjQUFjO0lBRzNELElBQ0ksTUFBTTtRQUNSLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN0QixDQUFDO0lBQ0QsSUFBSSxNQUFNLENBQUMsR0FBWTtRQUNyQixJQUFJLENBQUMsT0FBTyxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFHRCxZQUNFLFVBQXNCLEVBQ3RCLFlBQTBDLEVBQzFDLE1BQWtCLEVBQ2xCLE9BQXdCO1FB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QUFDO1lBQzdCLE1BQU07UUFDUixLQUFLLFFBQVE7WUFDWCxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQzlCLE1BQU07UUFDUixLQUFLLEtBQUs7WUFDUixHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBQzNCLE1BQU07UUFDUixLQUFLLFNBQVM7WUFDWixHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsU0FBUyxDQUFDO1lBQy9CLE1BQU07UUFDUixTQUFTLFlBQVk7WUFDbkIscUJBQXFCO1lBQ3JCLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxhQUFhLENBQUM7WUFDbkMsTUFBTTtJQUNWLENBQUM7SUFFRCxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVqRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdGFibGUsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge1xuICBCYXNlRGlyZWN0aXZlMixcbiAgTWVkaWFNYXJzaGFsbGVyLFxuICBTdHlsZUJ1aWxkZXIsXG4gIFN0eWxlRGVmaW5pdGlvbixcbiAgU3R5bGVVdGlscyxcbn0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L2NvcmUnO1xuXG5jb25zdCBERUZBVUxUX01BSU4gPSAnc3RhcnQnO1xuY29uc3QgREVGQVVMVF9DUk9TUyA9ICdzdHJldGNoJztcblxuZXhwb3J0IGludGVyZmFjZSBHcmlkQWxpZ25Db2x1bW5zUGFyZW50IHtcbiAgaW5saW5lOiBib29sZWFuO1xufVxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIEdyaWRBbGlnbkNvbHVtbnNTdHlsZUJ1aWxkZXIgZXh0ZW5kcyBTdHlsZUJ1aWxkZXIge1xuICBidWlsZFN0eWxlcyhpbnB1dDogc3RyaW5nLCBwYXJlbnQ6IEdyaWRBbGlnbkNvbHVtbnNQYXJlbnQpIHtcbiAgICByZXR1cm4gYnVpbGRDc3MoaW5wdXQgfHwgYCR7REVGQVVMVF9NQUlOfSAke0RFRkFVTFRfQ1JPU1N9YCwgcGFyZW50LmlubGluZSk7XG4gIH1cbn1cblxuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgR3JpZEFsaWduQ29sdW1uc0RpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnZ3JpZC1hbGlnbi1jb2x1bW5zJztcblxuICBASW5wdXQoJ2dkSW5saW5lJylcbiAgZ2V0IGlubGluZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faW5saW5lO1xuICB9XG4gIHNldCBpbmxpbmUodmFsOiBib29sZWFuKSB7XG4gICAgdGhpcy5faW5saW5lID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbCk7XG4gIH1cbiAgcHJvdGVjdGVkIF9pbmxpbmUgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxuICAgIHN0eWxlQnVpbGRlcjogR3JpZEFsaWduQ29sdW1uc1N0eWxlQnVpbGRlcixcbiAgICBzdHlsZXI6IFN0eWxlVXRpbHMsXG4gICAgbWFyc2hhbDogTWVkaWFNYXJzaGFsbGVyXG4gICkge1xuICAgIHN1cGVyKGVsZW1lbnRSZWYsIHN0eWxlQnVpbGRlciwgc3R5bGVyLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAvLyBQcm90ZWN0ZWQgbWV0aG9kc1xuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2l0aFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLnN0eWxlQ2FjaGUgPSB0aGlzLmlubGluZSA/IGFsaWduQ29sdW1uc0lubGluZUNhY2hlIDogYWxpZ25Db2x1bW5zQ2FjaGU7XG4gICAgdGhpcy5hZGRTdHlsZXModmFsdWUsIHsgaW5saW5lOiB0aGlzLmlubGluZSB9KTtcbiAgfVxufVxuXG5jb25zdCBhbGlnbkNvbHVtbnNDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGFsaWduQ29sdW1uc0lubGluZUNhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBpbnB1dHMgPSBbXG4gICdnZEFsaWduQ29sdW1ucycsXG4gICdnZEFsaWduQ29sdW1ucy54cycsXG4gICdnZEFsaWduQ29sdW1ucy5zbScsXG4gICdnZEFsaWduQ29sdW1ucy5tZCcsXG4gICdnZEFsaWduQ29sdW1ucy5sZycsXG4gICdnZEFsaWduQ29sdW1ucy54bCcsXG4gICdnZEFsaWduQ29sdW1ucy5sdC1zbScsXG4gICdnZEFsaWduQ29sdW1ucy5sdC1tZCcsXG4gICdnZEFsaWduQ29sdW1ucy5sdC1sZycsXG4gICdnZEFsaWduQ29sdW1ucy5sdC14bCcsXG4gICdnZEFsaWduQ29sdW1ucy5ndC14cycsXG4gICdnZEFsaWduQ29sdW1ucy5ndC1zbScsXG4gICdnZEFsaWduQ29sdW1ucy5ndC1tZCcsXG4gICdnZEFsaWduQ29sdW1ucy5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtnZEFsaWduQ29sdW1uc10sXG4gIFtnZEFsaWduQ29sdW1ucy54c10sIFtnZEFsaWduQ29sdW1ucy5zbV0sIFtnZEFsaWduQ29sdW1ucy5tZF0sXG4gIFtnZEFsaWduQ29sdW1ucy5sZ10sIFtnZEFsaWduQ29sdW1ucy54bF0sIFtnZEFsaWduQ29sdW1ucy5sdC1zbV0sXG4gIFtnZEFsaWduQ29sdW1ucy5sdC1tZF0sIFtnZEFsaWduQ29sdW1ucy5sdC1sZ10sIFtnZEFsaWduQ29sdW1ucy5sdC14bF0sXG4gIFtnZEFsaWduQ29sdW1ucy5ndC14c10sIFtnZEFsaWduQ29sdW1ucy5ndC1zbV0sIFtnZEFsaWduQ29sdW1ucy5ndC1tZF0sXG4gIFtnZEFsaWduQ29sdW1ucy5ndC1sZ11cbmA7XG5cbi8qKlxuICogJ2NvbHVtbiBhbGlnbm1lbnQnIENTUyBHcmlkIHN0eWxpbmcgZGlyZWN0aXZlXG4gKiBDb25maWd1cmVzIHRoZSBhbGlnbm1lbnQgaW4gdGhlIGNvbHVtbiBkaXJlY3Rpb25cbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9jc3MvY29tcGxldGUtZ3VpZGUtZ3JpZC8jYXJ0aWNsZS1oZWFkZXItaWQtMTlcbiAqIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9jc3MvY29tcGxldGUtZ3VpZGUtZ3JpZC8jYXJ0aWNsZS1oZWFkZXItaWQtMjFcbiAqL1xuQERpcmVjdGl2ZSh7IHNlbGVjdG9yLCBpbnB1dHMgfSlcbmV4cG9ydCBjbGFzcyBEZWZhdWx0R3JpZEFsaWduQ29sdW1uc0RpcmVjdGl2ZSBleHRlbmRzIEdyaWRBbGlnbkNvbHVtbnNEaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuXG5mdW5jdGlvbiBidWlsZENzcyhhbGlnbjogc3RyaW5nLCBpbmxpbmU6IGJvb2xlYW4pOiBTdHlsZURlZmluaXRpb24ge1xuICBjb25zdCBjc3M6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fSxcbiAgICBbbWFpbkF4aXMsIGNyb3NzQXhpc10gPSBhbGlnbi5zcGxpdCgnICcpO1xuXG4gIC8vIE1haW4gYXhpc1xuICBzd2l0Y2ggKG1haW5BeGlzKSB7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIGNzc1snYWxpZ24tY29udGVudCddID0gJ2NlbnRlcic7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzcGFjZS1hcm91bmQnOlxuICAgICAgY3NzWydhbGlnbi1jb250ZW50J10gPSAnc3BhY2UtYXJvdW5kJztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3NwYWNlLWJldHdlZW4nOlxuICAgICAgY3NzWydhbGlnbi1jb250ZW50J10gPSAnc3BhY2UtYmV0d2Vlbic7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzcGFjZS1ldmVubHknOlxuICAgICAgY3NzWydhbGlnbi1jb250ZW50J10gPSAnc3BhY2UtZXZlbmx5JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2VuZCc6XG4gICAgICBjc3NbJ2FsaWduLWNvbnRlbnQnXSA9ICdlbmQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RhcnQnOlxuICAgICAgY3NzWydhbGlnbi1jb250ZW50J10gPSAnc3RhcnQnO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3RyZXRjaCc6XG4gICAgICBjc3NbJ2FsaWduLWNvbnRlbnQnXSA9ICdzdHJldGNoJztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vIGRlZmF1bHQgbWFpbiBheGlzXG4gICAgICBjc3NbJ2FsaWduLWNvbnRlbnQnXSA9IERFRkFVTFRfTUFJTjtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gQ3Jvc3MtYXhpc1xuICBzd2l0Y2ggKGNyb3NzQXhpcykge1xuICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgIGNzc1snYWxpZ24taXRlbXMnXSA9ICdzdGFydCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgY3NzWydhbGlnbi1pdGVtcyddID0gJ2NlbnRlcic7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdlbmQnOlxuICAgICAgY3NzWydhbGlnbi1pdGVtcyddID0gJ2VuZCc7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdHJldGNoJzpcbiAgICAgIGNzc1snYWxpZ24taXRlbXMnXSA9ICdzdHJldGNoJztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6IC8vICdzdHJldGNoJ1xuICAgICAgLy8gZGVmYXVsdCBjcm9zcyBheGlzXG4gICAgICBjc3NbJ2FsaWduLWl0ZW1zJ10gPSBERUZBVUxUX0NST1NTO1xuICAgICAgYnJlYWs7XG4gIH1cblxuICBjc3NbJ2Rpc3BsYXknXSA9IGlubGluZSA/ICdpbmxpbmUtZ3JpZCcgOiAnZ3JpZCc7XG5cbiAgcmV0dXJuIGNzcztcbn1cbiJdfQ==