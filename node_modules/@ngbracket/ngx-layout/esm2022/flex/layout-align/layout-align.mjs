/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Injectable } from '@angular/core';
import { BaseDirective2, StyleBuilder, } from '@ngbracket/ngx-layout/core';
import { takeUntil } from 'rxjs/operators';
import { extendObject, isFlowHorizontal, LAYOUT_VALUES, } from '@ngbracket/ngx-layout/_private-utils';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
export class LayoutAlignStyleBuilder extends StyleBuilder {
    buildStyles(align, parent) {
        const css = {}, [mainAxis, crossAxis] = align.split(' ');
        // Main axis
        switch (mainAxis) {
            case 'center':
                css['justify-content'] = 'center';
                break;
            case 'space-around':
                css['justify-content'] = 'space-around';
                break;
            case 'space-between':
                css['justify-content'] = 'space-between';
                break;
            case 'space-evenly':
                css['justify-content'] = 'space-evenly';
                break;
            case 'end':
            case 'flex-end':
                css['justify-content'] = 'flex-end';
                break;
            case 'start':
            case 'flex-start':
            default: // default main axis
                css['justify-content'] = 'flex-start';
                break;
        }
        // Cross-axis
        switch (crossAxis) {
            case 'start':
            case 'flex-start':
                css['align-items'] = css['align-content'] = 'flex-start';
                break;
            case 'center':
                css['align-items'] = css['align-content'] = 'center';
                break;
            case 'end':
            case 'flex-end':
                css['align-items'] = css['align-content'] = 'flex-end';
                break;
            case 'space-between':
                css['align-content'] = 'space-between';
                css['align-items'] = 'stretch';
                break;
            case 'space-around':
                css['align-content'] = 'space-around';
                css['align-items'] = 'stretch';
                break;
            case 'baseline':
                css['align-content'] = 'stretch';
                css['align-items'] = 'baseline';
                break;
            case 'stretch':
            default: // 'stretch'
                // default cross axis
                css['align-items'] = css['align-content'] = 'stretch';
                break;
        }
        return extendObject(css, {
            display: parent.inline ? 'inline-flex' : 'flex',
            'flex-direction': parent.layout,
            'box-sizing': 'border-box',
            'max-width': crossAxis === 'stretch'
                ? !isFlowHorizontal(parent.layout)
                    ? '100%'
                    : null
                : null,
            'max-height': crossAxis === 'stretch'
                ? isFlowHorizontal(parent.layout)
                    ? '100%'
                    : null
                : null,
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutAlignStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutAlignStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutAlignStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
const inputs = [
    'fxLayoutAlign',
    'fxLayoutAlign.xs',
    'fxLayoutAlign.sm',
    'fxLayoutAlign.md',
    'fxLayoutAlign.lg',
    'fxLayoutAlign.xl',
    'fxLayoutAlign.lt-sm',
    'fxLayoutAlign.lt-md',
    'fxLayoutAlign.lt-lg',
    'fxLayoutAlign.lt-xl',
    'fxLayoutAlign.gt-xs',
    'fxLayoutAlign.gt-sm',
    'fxLayoutAlign.gt-md',
    'fxLayoutAlign.gt-lg',
];
const selector = `
  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],
  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],
  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],
  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]
`;
/**
 * 'layout-align' flexbox styling directive
 *  Defines positioning of child elements along main and cross axis in a layout container
 *  Optional values: {main-axis} values or {main-axis cross-axis} value pairs
 *
 *  @see https://css-tricks.com/almanac/properties/j/justify-content/
 *  @see https://css-tricks.com/almanac/properties/a/align-items/
 *  @see https://css-tricks.com/almanac/properties/a/align-content/
 */
export class LayoutAlignDirective extends BaseDirective2 {
    constructor(elRef, styleUtils, styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.DIRECTIVE_KEY = 'layout-align';
        this.layout = 'row'; // default flex-direction
        this.inline = false; // default inline value
        this.init();
        this.marshal
            .trackValue(this.nativeElement, 'layout')
            .pipe(takeUntil(this.destroySubject))
            .subscribe(this.onLayoutChange.bind(this));
    }
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     *
     */
    updateWithValue(value) {
        const layout = this.layout || 'row';
        const inline = this.inline;
        if (layout === 'row' && inline) {
            this.styleCache = layoutAlignHorizontalInlineCache;
        }
        else if (layout === 'row' && !inline) {
            this.styleCache = layoutAlignHorizontalCache;
        }
        else if (layout === 'row-reverse' && inline) {
            this.styleCache = layoutAlignHorizontalRevInlineCache;
        }
        else if (layout === 'row-reverse' && !inline) {
            this.styleCache = layoutAlignHorizontalRevCache;
        }
        else if (layout === 'column' && inline) {
            this.styleCache = layoutAlignVerticalInlineCache;
        }
        else if (layout === 'column' && !inline) {
            this.styleCache = layoutAlignVerticalCache;
        }
        else if (layout === 'column-reverse' && inline) {
            this.styleCache = layoutAlignVerticalRevInlineCache;
        }
        else if (layout === 'column-reverse' && !inline) {
            this.styleCache = layoutAlignVerticalRevCache;
        }
        this.addStyles(value, { layout, inline });
    }
    /**
     * Cache the parent container 'flex-direction' and update the 'flex' styles
     */
    onLayoutChange(matcher) {
        const layoutKeys = matcher.value.split(' ');
        this.layout = layoutKeys[0];
        this.inline = matcher.value.includes('inline');
        if (!LAYOUT_VALUES.find((x) => x === this.layout)) {
            this.layout = 'row';
        }
        this.triggerUpdate();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutAlignDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: LayoutAlignStyleBuilder }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: LayoutAlignDirective, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: LayoutAlignDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: LayoutAlignStyleBuilder }, { type: i1.MediaMarshaller }] });
export class DefaultLayoutAlignDirective extends LayoutAlignDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultLayoutAlignDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultLayoutAlignDirective, selector: "\n  [fxLayoutAlign], [fxLayoutAlign.xs], [fxLayoutAlign.sm], [fxLayoutAlign.md],\n  [fxLayoutAlign.lg], [fxLayoutAlign.xl], [fxLayoutAlign.lt-sm], [fxLayoutAlign.lt-md],\n  [fxLayoutAlign.lt-lg], [fxLayoutAlign.lt-xl], [fxLayoutAlign.gt-xs], [fxLayoutAlign.gt-sm],\n  [fxLayoutAlign.gt-md], [fxLayoutAlign.gt-lg]\n", inputs: { fxLayoutAlign: "fxLayoutAlign", "fxLayoutAlign.xs": "fxLayoutAlign.xs", "fxLayoutAlign.sm": "fxLayoutAlign.sm", "fxLayoutAlign.md": "fxLayoutAlign.md", "fxLayoutAlign.lg": "fxLayoutAlign.lg", "fxLayoutAlign.xl": "fxLayoutAlign.xl", "fxLayoutAlign.lt-sm": "fxLayoutAlign.lt-sm", "fxLayoutAlign.lt-md": "fxLayoutAlign.lt-md", "fxLayoutAlign.lt-lg": "fxLayoutAlign.lt-lg", "fxLayoutAlign.lt-xl": "fxLayoutAlign.lt-xl", "fxLayoutAlign.gt-xs": "fxLayoutAlign.gt-xs", "fxLayoutAlign.gt-sm": "fxLayoutAlign.gt-sm", "fxLayoutAlign.gt-md": "fxLayoutAlign.gt-md", "fxLayoutAlign.gt-lg": "fxLayoutAlign.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultLayoutAlignDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
const layoutAlignHorizontalCache = new Map();
const layoutAlignVerticalCache = new Map();
const layoutAlignHorizontalRevCache = new Map();
const layoutAlignVerticalRevCache = new Map();
const layoutAlignHorizontalInlineCache = new Map();
const layoutAlignVerticalInlineCache = new Map();
const layoutAlignHorizontalRevInlineCache = new Map();
const layoutAlignVerticalRevInlineCache = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LWFsaWduLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9mbGV4L2xheW91dC1hbGlnbi9sYXlvdXQtYWxpZ24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFNBQVMsRUFBYyxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbEUsT0FBTyxFQUNMLGNBQWMsRUFHZCxZQUFZLEdBR2IsTUFBTSw0QkFBNEIsQ0FBQztBQUNwQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFM0MsT0FBTyxFQUNMLFlBQVksRUFDWixnQkFBZ0IsRUFDaEIsYUFBYSxHQUNkLE1BQU0sc0NBQXNDLENBQUM7OztBQVE5QyxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsWUFBWTtJQUN2RCxXQUFXLENBQUMsS0FBYSxFQUFFLE1BQXlCO1FBQ2xELE1BQU0sR0FBRyxHQUFvQixFQUFFLEVBQzdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFM0MsWUFBWTtRQUNaLFFBQVEsUUFBUSxFQUFFLENBQUM7WUFDakIsS0FBSyxRQUFRO2dCQUNYLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDbEMsTUFBTTtZQUNSLEtBQUssY0FBYztnQkFDakIsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsY0FBYyxDQUFDO2dCQUN4QyxNQUFNO1lBQ1IsS0FBSyxlQUFlO2dCQUNsQixHQUFHLENBQUMsaUJBQWlCLENBQUMsR0FBRyxlQUFlLENBQUM7Z0JBQ3pDLE1BQU07WUFDUixLQUFLLGNBQWM7Z0JBQ2pCLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLGNBQWMsQ0FBQztnQkFDeEMsTUFBTTtZQUNSLEtBQUssS0FBSyxDQUFD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QUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDbEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDdEIsQ0FBQztRQUNELElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztJQUN2QixDQUFDOzhHQTVEVSxvQkFBb0I7a0dBQXBCLG9CQUFvQjs7MkZBQXBCLG9CQUFvQjtrQkFEaEMsU0FBUzs7QUFpRVYsTUFBTSxPQUFPLDJCQUE0QixTQUFRLG9CQUFvQjtJQURyRTs7UUFFcUIsV0FBTSxHQUFHLE1BQU0sQ0FBQztLQUNwQzs4R0FGWSwyQkFBMkI7a0dBQTNCLDJCQUEyQjs7MkZBQTNCLDJCQUEyQjtrQkFEdkMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUU7O0FBSy9CLE1BQU0sMEJBQTBCLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDM0UsTUFBTSx3QkFBd0IsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN6RSxNQUFNLDZCQUE2QixHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlFLE1BQU0sMkJBQTJCLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDNUUsTUFBTSxnQ0FBZ0MsR0FDcEMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNaLE1BQU0sOEJBQThCLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDL0UsTUFBTSxtQ0FBbUMsR0FDdkMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNaLE1BQU0saUNBQWlDLEdBQ3JDLElBQUksR0FBRyxFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQmFzZURpcmVjdGl2ZTIsXG4gIEVsZW1lbnRNYXRjaGVyLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5pbXBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7XG4gIGV4dGVuZE9iamVjdCxcbiAgaXNGbG93SG9yaXpvbnRhbCxcbiAgTEFZT1VUX1ZBTFVFUyxcbn0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L19wcml2YXRlLXV0aWxzJztcblxuZXhwb3J0IGludGVyZmFjZSBMYXlvdXRBbGlnblBhcmVudCB7XG4gIGxheW91dDogc3RyaW5nO1xuICBpbmxpbmU6IGJvb2xlYW47XG59XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgTGF5b3V0QWxpZ25TdHlsZUJ1aWxkZXIgZXh0ZW5kcyBTdHlsZUJ1aWxkZXIge1xuICBidWlsZFN0eWxlcyhhbGlnbjogc3RyaW5nLCBwYXJlbnQ6IExheW91dEFsaWduUGFyZW50KSB7XG4gICAgY29uc3QgY3NzOiBTdHlsZURlZmluaXRpb24gPSB7fSxcbiAgICAgIFttYWluQXhpcywgY3Jvc3NBeGlzXSA9IGFsaWduLnNwbGl0KCcgJyk7XG5cbiAgICAvLyBNYWluIGF4aXNcbiAgICBzd2l0Y2ggKG1haW5BeGlzKSB7XG4gICAgICBjYXNlICdjZW50ZXInOlxuICAgICAgICBjc3NbJ2p1c3RpZnktY29udGVudCddID0gJ2NlbnRlcic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc3BhY2UtYXJvdW5kJzpcbiAgICAgICAgY3NzWydqdXN0aWZ5LWNvbnRlbnQnXSA9ICdzcGFjZS1hcm91bmQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NwYWNlLWJldHdlZW4nOlxuICAgICAgICBjc3NbJ2p1c3RpZnktY29udGVudCddID0gJ3NwYWNlLWJldHdlZW4nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NwYWNlLWV2ZW5seSc6XG4gICAgICAgIGNzc1snanVzdGlmeS1jb250ZW50J10gPSAnc3BhY2UtZXZlbmx5JztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlbmQnOlxuICAgICAgY2FzZSAnZmxleC1lbmQnOlxuICAgICAgICBjc3NbJ2p1c3RpZnktY29udGVudCddID0gJ2ZsZXgtZW5kJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzdGFydCc6XG4gICAgICBjYXNlICdmbGV4LXN0YXJ0JzpcbiAgICAgIGRlZmF1bHQ6IC8vIGRlZmF1bHQgbWFpbiBheGlzXG4gICAgICAgIGNzc1snanVzdGlmeS1jb250ZW50J10gPSAnZmxleC1zdGFydCc7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vIENyb3NzLWF4aXNcbiAgICBzd2l0Y2ggKGNyb3NzQXhpcykge1xuICAgICAgY2FzZSAnc3RhcnQnOlxuICAgICAgY2FzZSAnZmxleC1zdGFydCc6XG4gICAgICAgIGNzc1snYWxpZ24taXRlbXMnXSA9IGNzc1snYWxpZ24tY29udGVudCddID0gJ2ZsZXgtc3RhcnQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICAgIGNzc1snYWxpZ24taXRlbXMnXSA9IGNzc1snYWxpZ24tY29udGVudCddID0gJ2NlbnRlcic7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZW5kJzpcbiAgICAgIGNhc2UgJ2ZsZXgtZW5kJzpcbiAgICAgICAgY3NzWydhbGlnbi1pdGVtcyddID0gY3NzWydhbGlnbi1jb250ZW50J10gPSAnZmxleC1lbmQnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NwYWNlLWJldHdlZW4nOlxuICAgICAgICBjc3NbJ2FsaWduLWNvbnRlbnQnXSA9ICdzcGFjZS1iZXR3ZWVuJztcbiAgICAgICAgY3NzWydhbGlnbi1pdGVtcyddID0gJ3N0cmV0Y2gnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NwYWNlLWFyb3VuZCc6XG4gICAgICAgIGNzc1snYWxpZ24tY29udGVudCddID0gJ3NwYWNlLWFyb3VuZCc7XG4gICAgICAgIGNzc1snYWxpZ24taXRlbXMnXSA9ICdzdHJldGNoJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdiYXNlbGluZSc6XG4gICAgICAgIGNzc1snYWxpZ24tY29udGVudCddID0gJ3N0cmV0Y2gnO1xuICAgICAgICBjc3NbJ2FsaWduLWl0ZW1zJ10gPSAnYmFzZWxpbmUnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3N0cmV0Y2gnOlxuICAgICAgZGVmYXVsdDogLy8gJ3N0cmV0Y2gnXG4gICAgICAgIC8vIGRlZmF1bHQgY3Jvc3MgYXhpc1xuICAgICAgICBjc3NbJ2FsaWduLWl0ZW1zJ10gPSBjc3NbJ2FsaWduLWNvbnRlbnQnXSA9ICdzdHJldGNoJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGV4dGVuZE9iamVjdChjc3MsIHtcbiAgICAgIGRpc3BsYXk6IHBhcmVudC5pbmxpbmUgPyAnaW5saW5lLWZsZXgnIDogJ2ZsZXgnLFxuICAgICAgJ2ZsZXgtZGlyZWN0aW9uJzogcGFyZW50LmxheW91dCxcbiAgICAgICdib3gtc2l6aW5nJzogJ2JvcmRlci1ib3gnLFxuICAgICAgJ21heC13aWR0aCc6XG4gICAgICAgIGNyb3NzQXhpcyA9PT0gJ3N0cmV0Y2gnXG4gICAgICAgICAgPyAhaXNGbG93SG9yaXpvbnRhbChwYXJlbnQubGF5b3V0KVxuICAgICAgICAgICAgPyAnMTAwJSdcbiAgICAgICAgICAgIDogbnVsbFxuICAgICAgICAgIDogbnVsbCxcbiAgICAgICdtYXgtaGVpZ2h0JzpcbiAgICAgICAgY3Jvc3NBeGlzID09PSAnc3RyZXRjaCdcbiAgICAgICAgICA/IGlzRmxvd0hvcml6b250YWwocGFyZW50LmxheW91dClcbiAgICAgICAgICAgID8gJzEwMCUnXG4gICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICA6IG51bGwsXG4gICAgfSkgYXMgU3R5bGVEZWZpbml0aW9uO1xuICB9XG59XG5cbmNvbnN0IGlucHV0cyA9IFtcbiAgJ2Z4TGF5b3V0QWxpZ24nLFxuICAnZnhMYXlvdXRBbGlnbi54cycsXG4gICdmeExheW91dEFsaWduLnNtJyxcbiAgJ2Z4TGF5b3V0QWxpZ24ubWQnLFxuICAnZnhMYXlvdXRBbGlnbi5sZycsXG4gICdmeExheW91dEFsaWduLnhsJyxcbiAgJ2Z4TGF5b3V0QWxpZ24ubHQtc20nLFxuICAnZnhMYXlvdXRBbGlnbi5sdC1tZCcsXG4gICdmeExheW91dEFsaWduLmx0LWxnJyxcbiAgJ2Z4TGF5b3V0QWxpZ24ubHQteGwnLFxuICAnZnhMYXlvdXRBbGlnbi5ndC14cycsXG4gICdmeExheW91dEFsaWduLmd0LXNtJyxcbiAgJ2Z4TGF5b3V0QWxpZ24uZ3QtbWQnLFxuICAnZnhMYXlvdXRBbGlnbi5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtmeExheW91dEFsaWduXSwgW2Z4TGF5b3V0QWxpZ24ueHNdLCBbZnhMYXlvdXRBbGlnbi5zbV0sIFtmeExheW91dEFsaWduLm1kXSxcbiAgW2Z4TGF5b3V0QWxpZ24ubGddLCBbZnhMYXlvdXRBbGlnbi54bF0sIFtmeExheW91dEFsaWduLmx0LXNtXSwgW2Z4TGF5b3V0QWxpZ24ubHQtbWRdLFxuICBbZnhMYXlvdXRBbGlnbi5sdC1sZ10sIFtmeExheW91dEFsaWduLmx0LXhsXSwgW2Z4TGF5b3V0QWxpZ24uZ3QteHNdLCBbZnhMYXlvdXRBbGlnbi5ndC1zbV0sXG4gIFtmeExheW91dEFsaWduLmd0LW1kXSwgW2Z4TGF5b3V0QWxpZ24uZ3QtbGddXG5gO1xuXG4vKipcbiAqICdsYXlvdXQtYWxpZ24nIGZsZXhib3ggc3R5bGluZyBkaXJlY3RpdmVcbiAqICBEZWZpbmVzIHBvc2l0aW9uaW5nIG9mIGNoaWxkIGVsZW1lbnRzIGFsb25nIG1haW4gYW5kIGNyb3NzIGF4aXMgaW4gYSBsYXlvdXQgY29udGFpbmVyXG4gKiAgT3B0aW9uYWwgdmFsdWVzOiB7bWFpbi1heGlzfSB2YWx1ZXMgb3Ige21haW4tYXhpcyBjcm9zcy1heGlzfSB2YWx1ZSBwYWlyc1xuICpcbiAqICBAc2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vYWxtYW5hYy9wcm9wZXJ0aWVzL2ovanVzdGlmeS1jb250ZW50L1xuICogIEBzZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9hbG1hbmFjL3Byb3BlcnRpZXMvYS9hbGlnbi1pdGVtcy9cbiAqICBAc2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vYWxtYW5hYy9wcm9wZXJ0aWVzL2EvYWxpZ24tY29udGVudC9cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgTGF5b3V0QWxpZ25EaXJlY3RpdmUgZXh0ZW5kcyBCYXNlRGlyZWN0aXZlMiB7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBESVJFQ1RJVkVfS0VZID0gJ2xheW91dC1hbGlnbic7XG4gIHByb3RlY3RlZCBsYXlvdXQgPSAncm93JzsgLy8gZGVmYXVsdCBmbGV4LWRpcmVjdGlvblxuICBwcm90ZWN0ZWQgaW5saW5lID0gZmFsc2U7IC8vIGRlZmF1bHQgaW5saW5lIHZhbHVlXG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgc3R5bGVVdGlsczogU3R5bGVVdGlscyxcbiAgICBzdHlsZUJ1aWxkZXI6IExheW91dEFsaWduU3R5bGVCdWlsZGVyLFxuICAgIG1hcnNoYWw6IE1lZGlhTWFyc2hhbGxlclxuICApIHtcbiAgICBzdXBlcihlbFJlZiwgc3R5bGVCdWlsZGVyLCBzdHlsZVV0aWxzLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgICB0aGlzLm1hcnNoYWxcbiAgICAgIC50cmFja1ZhbHVlKHRoaXMubmF0aXZlRWxlbWVudCwgJ2xheW91dCcpXG4gICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95U3ViamVjdCkpXG4gICAgICAuc3Vic2NyaWJlKHRoaXMub25MYXlvdXRDaGFuZ2UuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgLy8gUHJvdGVjdGVkIG1ldGhvZHNcbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgLyoqXG4gICAqXG4gICAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2l0aFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBsYXlvdXQgPSB0aGlzLmxheW91dCB8fCAncm93JztcbiAgICBjb25zdCBpbmxpbmUgPSB0aGlzLmlubGluZTtcbiAgICBpZiAobGF5b3V0ID09PSAncm93JyAmJiBpbmxpbmUpIHtcbiAgICAgIHRoaXMuc3R5bGVDYWNoZSA9IGxheW91dEFsaWduSG9yaXpvbnRhbElubGluZUNhY2hlO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09PSAncm93JyAmJiAhaW5saW5lKSB7XG4gICAgICB0aGlzLnN0eWxlQ2FjaGUgPSBsYXlvdXRBbGlnbkhvcml6b250YWxDYWNoZTtcbiAgICB9IGVsc2UgaWYgKGxheW91dCA9PT0gJ3Jvdy1yZXZlcnNlJyAmJiBpbmxpbmUpIHtcbiAgICAgIHRoaXMuc3R5bGVDYWNoZSA9IGxheW91dEFsaWduSG9yaXpvbnRhbFJldklubGluZUNhY2hlO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09PSAncm93LXJldmVyc2UnICYmICFpbmxpbmUpIHtcbiAgICAgIHRoaXMuc3R5bGVDYWNoZSA9IGxheW91dEFsaWduSG9yaXpvbnRhbFJldkNhY2hlO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09PSAnY29sdW1uJyAmJiBpbmxpbmUpIHtcbiAgICAgIHRoaXMuc3R5bGVDYWNoZSA9IGxheW91dEFsaWduVmVydGljYWxJbmxpbmVDYWNoZTtcbiAgICB9IGVsc2UgaWYgKGxheW91dCA9PT0gJ2NvbHVtbicgJiYgIWlubGluZSkge1xuICAgICAgdGhpcy5zdHlsZUNhY2hlID0gbGF5b3V0QWxpZ25WZXJ0aWNhbENhY2hlO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09PSAnY29sdW1uLXJldmVyc2UnICYmIGlubGluZSkge1xuICAgICAgdGhpcy5zdHlsZUNhY2hlID0gbGF5b3V0QWxpZ25WZXJ0aWNhbFJldklubGluZUNhY2hlO1xuICAgIH0gZWxzZSBpZiAobGF5b3V0ID09PSAnY29sdW1uLXJldmVyc2UnICYmICFpbmxpbmUpIHtcbiAgICAgIHRoaXMuc3R5bGVDYWNoZSA9IGxheW91dEFsaWduVmVydGljYWxSZXZDYWNoZTtcbiAgICB9XG4gICAgdGhpcy5hZGRTdHlsZXModmFsdWUsIHsgbGF5b3V0LCBpbmxpbmUgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FjaGUgdGhlIHBhcmVudCBjb250YWluZXIgJ2ZsZXgtZGlyZWN0aW9uJyBhbmQgdXBkYXRlIHRoZSAnZmxleCcgc3R5bGVzXG4gICAqL1xuICBwcm90ZWN0ZWQgb25MYXlvdXRDaGFuZ2UobWF0Y2hlcjogRWxlbWVudE1hdGNoZXIpIHtcbiAgICBjb25zdCBsYXlvdXRLZXlzOiBzdHJpbmdbXSA9IG1hdGNoZXIudmFsdWUuc3BsaXQoJyAnKTtcbiAgICB0aGlzLmxheW91dCA9IGxheW91dEtleXNbMF07XG4gICAgdGhpcy5pbmxpbmUgPSBtYXRjaGVyLnZhbHVlLmluY2x1ZGVzKCdpbmxpbmUnKTtcbiAgICBpZiAoIUxBWU9VVF9WQUxVRVMuZmluZCgoeCkgPT4geCA9PT0gdGhpcy5sYXlvdXQpKSB7XG4gICAgICB0aGlzLmxheW91dCA9ICdyb3cnO1xuICAgIH1cbiAgICB0aGlzLnRyaWdnZXJVcGRhdGUoKTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKHsgc2VsZWN0b3IsIGlucHV0cyB9KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRMYXlvdXRBbGlnbkRpcmVjdGl2ZSBleHRlbmRzIExheW91dEFsaWduRGlyZWN0aXZlIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlucHV0cyA9IGlucHV0cztcbn1cblxuY29uc3QgbGF5b3V0QWxpZ25Ib3Jpem9udGFsQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5jb25zdCBsYXlvdXRBbGlnblZlcnRpY2FsQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5jb25zdCBsYXlvdXRBbGlnbkhvcml6b250YWxSZXZDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGxheW91dEFsaWduVmVydGljYWxSZXZDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGxheW91dEFsaWduSG9yaXpvbnRhbElubGluZUNhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID1cbiAgbmV3IE1hcCgpO1xuY29uc3QgbGF5b3V0QWxpZ25WZXJ0aWNhbElubGluZUNhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuY29uc3QgbGF5b3V0QWxpZ25Ib3Jpem9udGFsUmV2SW5saW5lQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPVxuICBuZXcgTWFwKCk7XG5jb25zdCBsYXlvdXRBbGlnblZlcnRpY2FsUmV2SW5saW5lQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPVxuICBuZXcgTWFwKCk7XG4iXX0=