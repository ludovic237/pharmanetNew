/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Inject, Injectable, Input, } from '@angular/core';
import { BaseDirective2, LAYOUT_CONFIG, StyleBuilder, validateBasis, } from '@ngbracket/ngx-layout/core';
import { takeUntil } from 'rxjs/operators';
import { extendObject, isFlowHorizontal, } from '@ngbracket/ngx-layout/_private-utils';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
export class FlexStyleBuilder extends StyleBuilder {
    constructor(layoutConfig) {
        super();
        this.layoutConfig = layoutConfig;
    }
    buildStyles(input, parent) {
        let [grow, shrink, ...basisParts] = input.split(' ');
        let basis = basisParts.join(' ');
        // The flex-direction of this element's flex container. Defaults to 'row'.
        const direction = parent.direction.indexOf('column') > -1 ? 'column' : 'row';
        const max = isFlowHorizontal(direction) ? 'max-width' : 'max-height';
        const min = isFlowHorizontal(direction) ? 'min-width' : 'min-height';
        const hasCalc = String(basis).indexOf('calc') > -1;
        const usingCalc = hasCalc || basis === 'auto';
        const isPercent = String(basis).indexOf('%') > -1 && !hasCalc;
        const hasUnits = String(basis).indexOf('px') > -1 ||
            String(basis).indexOf('rem') > -1 ||
            String(basis).indexOf('em') > -1 ||
            String(basis).indexOf('vw') > -1 ||
            String(basis).indexOf('vh') > -1;
        let isValue = hasCalc || hasUnits;
        grow = grow == '0' ? 0 : grow;
        shrink = shrink == '0' ? 0 : shrink;
        // make box inflexible when shrink and grow are both zero
        // should not set a min when the grow is zero
        // should not set a max when the shrink is zero
        const isFixed = !grow && !shrink;
        let css = {};
        // flex-basis allows you to specify the initial/starting main-axis size of the element,
        // before anything else is computed. It can either be a percentage or an absolute value.
        // It is, however, not the breaking point for flex-grow/shrink properties
        //
        // flex-grow can be seen as this:
        //   0: Do not stretch. Either size to element's content width, or obey 'flex-basis'.
        //   1: (Default value). Stretch; will be the same size to all other flex items on
        //       the same row since they have a default value of 1.
        //   ≥2 (integer n): Stretch. Will be n times the size of other elements
        //      with 'flex-grow: 1' on the same row.
        // Use `null` to clear existing styles.
        const clearStyles = {
            'max-width': null,
            'max-height': null,
            'min-width': null,
            'min-height': null,
        };
        switch (basis || '') {
            case '':
                const useColumnBasisZero = this.layoutConfig.useColumnBasisZero !== false;
                basis =
                    direction === 'row'
                        ? '0%'
                        : useColumnBasisZero
                            ? '0.000000001px'
                            : 'auto';
                break;
            case 'initial': // default
            case 'nogrow':
                grow = 0;
                basis = 'auto';
                break;
            case 'grow':
                basis = '100%';
                break;
            case 'noshrink':
                shrink = 0;
                basis = 'auto';
                break;
            case 'auto':
                break;
            case 'none':
                grow = 0;
                shrink = 0;
                basis = 'auto';
                break;
            default:
                // Defaults to percentage sizing unless `px` is explicitly set
                if (!isValue && !isPercent && !isNaN(basis)) {
                    basis = basis + '%';
                }
                // Fix for issue 280
                if (basis === '0%') {
                    isValue = true;
                }
                if (basis === '0px') {
                    basis = '0%';
                }
                // fix issue #5345
                if (hasCalc) {
                    css = extendObject(clearStyles, {
                        'flex-grow': grow,
                        'flex-shrink': shrink,
                        'flex-basis': isValue ? basis : '100%',
                    });
                }
                else {
                    css = extendObject(clearStyles, {
                        flex: `${grow} ${shrink} ${isValue ? basis : '100%'}`,
                    });
                }
                break;
        }
        if (!(css['flex'] || css['flex-grow'])) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis,
                });
            }
            else {
                css = extendObject(clearStyles, {
                    flex: `${grow} ${shrink} ${basis}`,
                });
            }
        }
        // Fix for issues 277, 534, and 728
        if (basis !== '0%' &&
            basis !== '0px' &&
            basis !== '0.000000001px' &&
            basis !== 'auto') {
            css[min] = isFixed || (isValue && grow) ? basis : null;
            css[max] = isFixed || (!usingCalc && shrink) ? basis : null;
        }
        // Fix for issue 528
        if (!css[min] && !css[max]) {
            if (hasCalc) {
                css = extendObject(clearStyles, {
                    'flex-grow': grow,
                    'flex-shrink': shrink,
                    'flex-basis': basis,
                });
            }
            else {
                css = extendObject(clearStyles, {
                    flex: `${grow} ${shrink} ${basis}`,
                });
            }
        }
        else {
            // Fix for issue 660
            if (parent.hasWrap) {
                css[hasCalc ? 'flex-basis' : 'flex'] = css[max]
                    ? hasCalc
                        ? css[max]
                        : `${grow} ${shrink} ${css[max]}`
                    : hasCalc
                        ? css[min]
                        : `${grow} ${shrink} ${css[min]}`;
            }
        }
        return extendObject(css, { 'box-sizing': 'border-box' });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexStyleBuilder, deps: [{ token: LAYOUT_CONFIG }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }] });
const inputs = [
    'fxFlex',
    'fxFlex.xs',
    'fxFlex.sm',
    'fxFlex.md',
    'fxFlex.lg',
    'fxFlex.xl',
    'fxFlex.lt-sm',
    'fxFlex.lt-md',
    'fxFlex.lt-lg',
    'fxFlex.lt-xl',
    'fxFlex.gt-xs',
    'fxFlex.gt-sm',
    'fxFlex.gt-md',
    'fxFlex.gt-lg',
];
const selector = `
  [fxFlex], [fxFlex.xs], [fxFlex.sm], [fxFlex.md],
  [fxFlex.lg], [fxFlex.xl], [fxFlex.lt-sm], [fxFlex.lt-md],
  [fxFlex.lt-lg], [fxFlex.lt-xl], [fxFlex.gt-xs], [fxFlex.gt-sm],
  [fxFlex.gt-md], [fxFlex.gt-lg]
`;
/**
 * Directive to control the size of a flex item using flex-basis, flex-grow, and flex-shrink.
 * Corresponds to the css `flex` shorthand property.
 *
 * @see https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */
export class FlexDirective extends BaseDirective2 {
    get shrink() {
        return this.flexShrink;
    }
    set shrink(value) {
        this.flexShrink = value || '1';
        this.triggerReflow();
    }
    get grow() {
        return this.flexGrow;
    }
    set grow(value) {
        this.flexGrow = value || '1';
        this.triggerReflow();
    }
    constructor(elRef, styleUtils, layoutConfig, styleBuilder, marshal) {
        super(elRef, styleBuilder, styleUtils, marshal);
        this.layoutConfig = layoutConfig;
        this.marshal = marshal;
        this.DIRECTIVE_KEY = 'flex';
        this.direction = undefined;
        this.wrap = undefined;
        this.flexGrow = '1';
        this.flexShrink = '1';
        this.init();
    }
    ngOnInit() {
        if (this.parentElement) {
            this.marshal
                .trackValue(this.parentElement, 'layout')
                .pipe(takeUntil(this.destroySubject))
                .subscribe(this.onLayoutChange.bind(this));
            this.marshal
                .trackValue(this.nativeElement, 'layout-align')
                .pipe(takeUntil(this.destroySubject))
                .subscribe(this.triggerReflow.bind(this));
        }
    }
    /**
     * Caches the parent container's 'flex-direction' and updates the element's style.
     * Used as a handler for layout change events from the parent flex container.
     */
    onLayoutChange(matcher) {
        const layout = matcher.value;
        const layoutParts = layout.split(' ');
        this.direction = layoutParts[0];
        this.wrap = layoutParts[1] !== undefined && layoutParts[1] === 'wrap';
        this.triggerUpdate();
    }
    /** Input to this is exclusively the basis input value */
    updateWithValue(value) {
        const addFlexToParent = this.layoutConfig.addFlexToParent !== false;
        if (this.direction === undefined) {
            this.direction = this.getFlexFlowDirection(this.parentElement, addFlexToParent);
        }
        if (this.wrap === undefined) {
            this.wrap = this.hasWrap(this.parentElement);
        }
        const direction = this.direction;
        const isHorizontal = direction.startsWith('row');
        const hasWrap = this.wrap;
        if (isHorizontal && hasWrap) {
            this.styleCache = flexRowWrapCache;
        }
        else if (isHorizontal && !hasWrap) {
            this.styleCache = flexRowCache;
        }
        else if (!isHorizontal && hasWrap) {
            this.styleCache = flexColumnWrapCache;
        }
        else if (!isHorizontal && !hasWrap) {
            this.styleCache = flexColumnCache;
        }
        const basis = String(value).replace(';', '');
        const parts = validateBasis(basis, this.flexGrow, this.flexShrink);
        this.addStyles(parts.join(' '), { direction, hasWrap });
    }
    /** Trigger a style reflow, usually based on a shrink/grow input event */
    triggerReflow() {
        const activatedValue = this.activatedValue;
        if (activatedValue !== undefined) {
            const parts = validateBasis(activatedValue + '', this.flexGrow, this.flexShrink);
            this.marshal.updateElement(this.nativeElement, this.DIRECTIVE_KEY, parts.join(' '));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: LAYOUT_CONFIG }, { token: FlexStyleBuilder }, { token: i1.MediaMarshaller }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: FlexDirective, inputs: { shrink: ["fxShrink", "shrink"], grow: ["fxGrow", "grow"] }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: FlexDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }, { type: FlexStyleBuilder }, { type: i1.MediaMarshaller }], propDecorators: { shrink: [{
                type: Input,
                args: ['fxShrink']
            }], grow: [{
                type: Input,
                args: ['fxGrow']
            }] } });
export class DefaultFlexDirective extends FlexDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultFlexDirective, selector: "\n  [fxFlex], [fxFlex.xs], [fxFlex.sm], [fxFlex.md],\n  [fxFlex.lg], [fxFlex.xl], [fxFlex.lt-sm], [fxFlex.lt-md],\n  [fxFlex.lt-lg], [fxFlex.lt-xl], [fxFlex.gt-xs], [fxFlex.gt-sm],\n  [fxFlex.gt-md], [fxFlex.gt-lg]\n", inputs: { fxFlex: "fxFlex", "fxFlex.xs": "fxFlex.xs", "fxFlex.sm": "fxFlex.sm", "fxFlex.md": "fxFlex.md", "fxFlex.lg": "fxFlex.lg", "fxFlex.xl": "fxFlex.xl", "fxFlex.lt-sm": "fxFlex.lt-sm", "fxFlex.lt-md": "fxFlex.lt-md", "fxFlex.lt-lg": "fxFlex.lt-lg", "fxFlex.lt-xl": "fxFlex.lt-xl", "fxFlex.gt-xs": "fxFlex.gt-xs", "fxFlex.gt-sm": "fxFlex.gt-sm", "fxFlex.gt-md": "fxFlex.gt-md", "fxFlex.gt-lg": "fxFlex.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultFlexDirective, decorators: [{
            type: Directive,
            args: [{ inputs, selector }]
        }] });
const flexRowCache = new Map();
const flexColumnCache = new Map();
const flexRowWrapCache = new Map();
const flexColumnWrapCache = new Map();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxleC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvZmxleC9mbGV4L2ZsZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUNMLFNBQVMsRUFFVCxNQUFNLEVBQ04sVUFBVSxFQUNWLEtBQUssR0FFTixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQ0wsY0FBYyxFQUdkLGFBQWEsRUFFYixZQUFZLEVBR1osYUFBYSxHQUNkLE1BQU0sNEJBQTRCLENBQUM7QUFDcEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFDTCxZQUFZLEVBQ1osZ0JBQWdCLEdBQ2pCLE1BQU0sc0NBQXNDLENBQUM7OztBQVE5QyxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsWUFBWTtJQUNoRCxZQUNtQyxZQUFpQztRQUVsRSxLQUFLLEVBQUUsQ0FBQztRQUZ5QixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7SUFHcEUsQ0FBQztJQUNELFdBQVcsQ0FBQyxLQUFhLEVBQUUsTUFBeUI7UUFDbEQsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBd0IsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxRSxJQUFJLEtBQUssR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWpDLDBFQUEwRTtRQUMxRSxNQUFNLFNBQVMsR0FDYixNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFN0QsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFD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QUFjLENBQUM7UUFDM0MsSUFBSSxjQUFjLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDakMsTUFBTSxLQUFLLEdBQUcsYUFBYSxDQUN6QixjQUFjLEdBQUcsRUFBRSxFQUNuQixJQUFJLENBQUMsUUFBUSxFQUNiLElBQUksQ0FBQyxVQUFVLENBQ2hCLENBQUM7WUFDRixJQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FDeEIsSUFBSSxDQUFDLGFBQWEsRUFDbEIsSUFBSSxDQUFDLGFBQWEsRUFDbEIsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FDaEIsQ0FBQztRQUNKLENBQUM7SUFDSCxDQUFDOzhHQTFHVSxhQUFhLHNFQTZCZCxhQUFhO2tHQTdCWixhQUFhOzsyRkFBYixhQUFhO2tCQUR6QixTQUFTOzswQkE4QkwsTUFBTTsyQkFBQyxhQUFhO21HQXZCbkIsTUFBTTtzQkFEVCxLQUFLO3VCQUFDLFVBQVU7Z0JBVWIsSUFBSTtzQkFEUCxLQUFLO3VCQUFDLFFBQVE7O0FBZ0dqQixNQUFNLE9BQU8sb0JBQXFCLFNBQVEsYUFBYTtJQUR2RDs7UUFFcUIsV0FBTSxHQUFHLE1BQU0sQ0FBQztLQUNwQzs4R0FGWSxvQkFBb0I7a0dBQXBCLG9CQUFvQjs7MkZBQXBCLG9CQUFvQjtrQkFEaEMsU0FBUzttQkFBQyxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUU7O0FBSy9CLE1BQU0sWUFBWSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzdELE1BQU0sZUFBZSxHQUFpQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2hFLE1BQU0sZ0JBQWdCLEdBQWlDLElBQUksR0FBRyxFQUFFLENBQUM7QUFDakUsTUFBTSxtQkFBbUIsR0FBaUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtcbiAgRGlyZWN0aXZlLFxuICBFbGVtZW50UmVmLFxuICBJbmplY3QsXG4gIEluamVjdGFibGUsXG4gIElucHV0LFxuICBPbkluaXQsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtcbiAgQmFzZURpcmVjdGl2ZTIsXG4gIEVsZW1lbnRNYXRjaGVyLFxuICBMYXlvdXRDb25maWdPcHRpb25zLFxuICBMQVlPVVRfQ09ORklHLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFN0eWxlQnVpbGRlcixcbiAgU3R5bGVEZWZpbml0aW9uLFxuICBTdHlsZVV0aWxzLFxuICB2YWxpZGF0ZUJhc2lzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5pbXBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7XG4gIGV4dGVuZE9iamVjdCxcbiAgaXNGbG93SG9yaXpvbnRhbCxcbn0gZnJvbSAnQG5nYnJhY2tldC9uZ3gtbGF5b3V0L19wcml2YXRlLXV0aWxzJztcblxuaW50ZXJmYWNlIEZsZXhCdWlsZGVyUGFyZW50IHtcbiAgZGlyZWN0aW9uOiBzdHJpbmc7XG4gIGhhc1dyYXA6IGJvb2xlYW47XG59XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgRmxleFN0eWxlQnVpbGRlciBleHRlbmRzIFN0eWxlQnVpbGRlciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIEBJbmplY3QoTEFZT1VUX0NPTkZJRykgcHJvdGVjdGVkIGxheW91dENvbmZpZzogTGF5b3V0Q29uZmlnT3B0aW9uc1xuICApIHtcbiAgICBzdXBlcigpO1xuICB9XG4gIGJ1aWxkU3R5bGVzKGlucHV0OiBzdHJpbmcsIHBhcmVudDogRmxleEJ1aWxkZXJQYXJlbnQpIHtcbiAgICBsZXQgW2dyb3csIHNocmluaywgLi4uYmFzaXNQYXJ0c106IChzdHJpbmcgfCBudW1iZXIpW10gPSBpbnB1dC5zcGxpdCgnICcpO1xuICAgIGxldCBiYXNpcyA9IGJhc2lzUGFydHMuam9pbignICcpO1xuXG4gICAgLy8gVGhlIGZsZXgtZGlyZWN0aW9uIG9mIHRoaXMgZWxlbWVudCdzIGZsZXggY29udGFpbmVyLiBEZWZhdWx0cyB0byAncm93Jy5cbiAgICBjb25zdCBkaXJlY3Rpb24gPVxuICAgICAgcGFyZW50LmRpcmVjdGlvbi5pbmRleE9mKCdjb2x1bW4nKSA+IC0xID8gJ2NvbHVtbicgOiAncm93JztcblxuICAgIGNvbnN0IG1heCA9IGlzRmxvd0hvcml6b250YWwoZGlyZWN0aW9uKSA/ICdtYXgtd2lkdGgnIDogJ21heC1oZWlnaHQnO1xuICAgIGNvbnN0IG1pbiA9IGlzRmxvd0hvcml6b250YWwoZGlyZWN0aW9uKSA/ICdtaW4td2lkdGgnIDogJ21pbi1oZWlnaHQnO1xuXG4gICAgY29uc3QgaGFzQ2FsYyA9IFN0cmluZyhiYXNpcykuaW5kZXhPZignY2FsYycpID4gLTE7XG4gICAgY29uc3QgdXNpbmdDYWxjID0gaGFzQ2FsYyB8fCBiYXNpcyA9PT0gJ2F1dG8nO1xuICAgIGNvbnN0IGlzUGVyY2VudCA9IFN0cmluZyhiYXNpcykuaW5kZXhPZignJScpID4gLTEgJiYgIWhhc0NhbGM7XG4gICAgY29uc3QgaGFzVW5pdHMgPVxuICAgICAgU3RyaW5nKGJhc2lzKS5pbmRleE9mKCdweCcpID4gLTEgfHxcbiAgICAgIFN0cmluZyhiYXNpcykuaW5kZXhPZigncmVtJykgPiAtMSB8fFxuICAgICAgU3RyaW5nKGJhc2lzKS5pbmRleE9mKCdlbScpID4gLTEgfHxcbiAgICAgIFN0cmluZyhiYXNpcykuaW5kZXhPZigndncnKSA+IC0xIHx8XG4gICAgICBTdHJpbmcoYmFzaXMpLmluZGV4T2YoJ3ZoJykgPiAtMTtcblxuICAgIGxldCBpc1ZhbHVlID0gaGFzQ2FsYyB8fCBoYXNVbml0cztcblxuICAgIGdyb3cgPSBncm93ID09ICcwJyA/IDAgOiBncm93O1xuICAgIHNocmluayA9IHNocmluayA9PSAnMCcgPyAwIDogc2hyaW5rO1xuXG4gICAgLy8gbWFrZSBib3ggaW5mbGV4aWJsZSB3aGVuIHNocmluayBhbmQgZ3JvdyBhcmUgYm90aCB6ZXJvXG4gICAgLy8gc2hvdWxkIG5vdCBzZXQgYSBtaW4gd2hlbiB0aGUgZ3JvdyBpcyB6ZXJvXG4gICAgLy8gc2hvdWxkIG5vdCBzZXQgYSBtYXggd2hlbiB0aGUgc2hyaW5rIGlzIHplcm9cbiAgICBjb25zdCBpc0ZpeGVkID0gIWdyb3cgJiYgIXNocmluaztcblxuICAgIGxldCBjc3M6IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgbnVsbCB9ID0ge307XG5cbiAgICAvLyBmbGV4LWJhc2lzIGFsbG93cyB5b3UgdG8gc3BlY2lmeSB0aGUgaW5pdGlhbC9zdGFydGluZyBtYWluLWF4aXMgc2l6ZSBvZiB0aGUgZWxlbWVudCxcbiAgICAvLyBiZWZvcmUgYW55dGhpbmcgZWxzZSBpcyBjb21wdXRlZC4gSXQgY2FuIGVpdGhlciBiZSBhIHBlcmNlbnRhZ2Ugb3IgYW4gYWJzb2x1dGUgdmFsdWUuXG4gICAgLy8gSXQgaXMsIGhvd2V2ZXIsIG5vdCB0aGUgYnJlYWtpbmcgcG9pbnQgZm9yIGZsZXgtZ3Jvdy9zaHJpbmsgcHJvcGVydGllc1xuICAgIC8vXG4gICAgLy8gZmxleC1ncm93IGNhbiBiZSBzZWVuIGFzIHRoaXM6XG4gICAgLy8gICAwOiBEbyBub3Qgc3RyZXRjaC4gRWl0aGVyIHNpemUgdG8gZWxlbWVudCdzIGNvbnRlbnQgd2lkdGgsIG9yIG9iZXkgJ2ZsZXgtYmFzaXMnLlxuICAgIC8vICAgMTogKERlZmF1bHQgdmFsdWUpLiBTdHJldGNoOyB3aWxsIGJlIHRoZSBzYW1lIHNpemUgdG8gYWxsIG90aGVyIGZsZXggaXRlbXMgb25cbiAgICAvLyAgICAgICB0aGUgc2FtZSByb3cgc2luY2UgdGhleSBoYXZlIGEgZGVmYXVsdCB2YWx1ZSBvZiAxLlxuICAgIC8vICAg4omlMiAoaW50ZWdlciBuKTogU3RyZXRjaC4gV2lsbCBiZSBuIHRpbWVzIHRoZSBzaXplIG9mIG90aGVyIGVsZW1lbnRzXG4gICAgLy8gICAgICB3aXRoICdmbGV4LWdyb3c6IDEnIG9uIHRoZSBzYW1lIHJvdy5cblxuICAgIC8vIFVzZSBgbnVsbGAgdG8gY2xlYXIgZXhpc3Rpbmcgc3R5bGVzLlxuICAgIGNvbnN0IGNsZWFyU3R5bGVzID0ge1xuICAgICAgJ21heC13aWR0aCc6IG51bGwsXG4gICAgICAnbWF4LWhlaWdodCc6IG51bGwsXG4gICAgICAnbWluLXdpZHRoJzogbnVsbCxcbiAgICAgICdtaW4taGVpZ2h0JzogbnVsbCxcbiAgICB9O1xuICAgIHN3aXRjaCAoYmFzaXMgfHwgJycpIHtcbiAgICAgIGNhc2UgJyc6XG4gICAgICAgIGNvbnN0IHVzZUNvbHVtbkJhc2lzWmVybyA9XG4gICAgICAgICAgdGhpcy5sYXlvdXRDb25maWcudXNlQ29sdW1uQmFzaXNaZXJvICE9PSBmYWxzZTtcbiAgICAgICAgYmFzaXMgPVxuICAgICAgICAgIGRpcmVjdGlvbiA9PT0gJ3JvdydcbiAgICAgICAgICAgID8gJzAlJ1xuICAgICAgICAgICAgOiB1c2VDb2x1bW5CYXNpc1plcm9cbiAgICAgICAgICAgID8gJzAuMDAwMDAwMDAxcHgnXG4gICAgICAgICAgICA6ICdhdXRvJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdpbml0aWFsJzogLy8gZGVmYXVsdFxuICAgICAgY2FzZSAnbm9ncm93JzpcbiAgICAgICAgZ3JvdyA9IDA7XG4gICAgICAgIGJhc2lzID0gJ2F1dG8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2dyb3cnOlxuICAgICAgICBiYXNpcyA9ICcxMDAlJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdub3Nocmluayc6XG4gICAgICAgIHNocmluayA9IDA7XG4gICAgICAgIGJhc2lzID0gJ2F1dG8nO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2F1dG8nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICBncm93ID0gMDtcbiAgICAgICAgc2hyaW5rID0gMDtcbiAgICAgICAgYmFzaXMgPSAnYXV0byc7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLy8gRGVmYXVsdHMgdG8gcGVyY2VudGFnZSBzaXppbmcgdW5sZXNzIGBweGAgaXMgZXhwbGljaXRseSBzZXRcbiAgICAgICAgaWYgKCFpc1ZhbHVlICYmICFpc1BlcmNlbnQgJiYgIWlzTmFOKGJhc2lzIGFzIGFueSkpIHtcbiAgICAgICAgICBiYXNpcyA9IGJhc2lzICsgJyUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRml4IGZvciBpc3N1ZSAyODBcbiAgICAgICAgaWYgKGJhc2lzID09PSAnMCUnKSB7XG4gICAgICAgICAgaXNWYWx1ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmFzaXMgPT09ICcwcHgnKSB7XG4gICAgICAgICAgYmFzaXMgPSAnMCUnO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZml4IGlzc3VlICM1MzQ1XG4gICAgICAgIGlmIChoYXNDYWxjKSB7XG4gICAgICAgICAgY3NzID0gZXh0ZW5kT2JqZWN0KGNsZWFyU3R5bGVzLCB7XG4gICAgICAgICAgICAnZmxleC1ncm93JzogZ3JvdyxcbiAgICAgICAgICAgICdmbGV4LXNocmluayc6IHNocmluayxcbiAgICAgICAgICAgICdmbGV4LWJhc2lzJzogaXNWYWx1ZSA/IGJhc2lzIDogJzEwMCUnLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNzcyA9IGV4dGVuZE9iamVjdChjbGVhclN0eWxlcywge1xuICAgICAgICAgICAgZmxleDogYCR7Z3Jvd30gJHtzaHJpbmt9ICR7aXNWYWx1ZSA/IGJhc2lzIDogJzEwMCUnfWAsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoIShjc3NbJ2ZsZXgnXSB8fCBjc3NbJ2ZsZXgtZ3JvdyddKSkge1xuICAgICAgaWYgKGhhc0NhbGMpIHtcbiAgICAgICAgY3NzID0gZXh0ZW5kT2JqZWN0KGNsZWFyU3R5bGVzLCB7XG4gICAgICAgICAgJ2ZsZXgtZ3Jvdyc6IGdyb3csXG4gICAgICAgICAgJ2ZsZXgtc2hyaW5rJzogc2hyaW5rLFxuICAgICAgICAgICdmbGV4LWJhc2lzJzogYmFzaXMsXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY3NzID0gZXh0ZW5kT2JqZWN0KGNsZWFyU3R5bGVzLCB7XG4gICAgICAgICAgZmxleDogYCR7Z3Jvd30gJHtzaHJpbmt9ICR7YmFzaXN9YCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRml4IGZvciBpc3N1ZXMgMjc3LCA1MzQsIGFuZCA3MjhcbiAgICBpZiAoXG4gICAgICBiYXNpcyAhPT0gJzAlJyAmJlxuICAgICAgYmFzaXMgIT09ICcwcHgnICYmXG4gICAgICBiYXNpcyAhPT0gJzAuMDAwMDAwMDAxcHgnICYmXG4gICAgICBiYXNpcyAhPT0gJ2F1dG8nXG4gICAgKSB7XG4gICAgICBjc3NbbWluXSA9IGlzRml4ZWQgfHwgKGlzVmFsdWUgJiYgZ3JvdykgPyBiYXNpcyA6IG51bGw7XG4gICAgICBjc3NbbWF4XSA9IGlzRml4ZWQgfHwgKCF1c2luZ0NhbGMgJiYgc2hyaW5rKSA/IGJhc2lzIDogbnVsbDtcbiAgICB9XG5cbiAgICAvLyBGaXggZm9yIGlzc3VlIDUyOFxuICAgIGlmICghY3NzW21pbl0gJiYgIWNzc1ttYXhdKSB7XG4gICAgICBpZiAoaGFzQ2FsYykge1xuICAgICAgICBjc3MgPSBleHRlbmRPYmplY3QoY2xlYXJTdHlsZXMsIHtcbiAgICAgICAgICAnZmxleC1ncm93JzogZ3JvdyxcbiAgICAgICAgICAnZmxleC1zaHJpbmsnOiBzaHJpbmssXG4gICAgICAgICAgJ2ZsZXgtYmFzaXMnOiBiYXNpcyxcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjc3MgPSBleHRlbmRPYmplY3QoY2xlYXJTdHlsZXMsIHtcbiAgICAgICAgICBmbGV4OiBgJHtncm93fSAke3Nocmlua30gJHtiYXNpc31gLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRml4IGZvciBpc3N1ZSA2NjBcbiAgICAgIGlmIChwYXJlbnQuaGFzV3JhcCkge1xuICAgICAgICBjc3NbaGFzQ2FsYyA/ICdmbGV4LWJhc2lzJyA6ICdmbGV4J10gPSBjc3NbbWF4XVxuICAgICAgICAgID8gaGFzQ2FsY1xuICAgICAgICAgICAgPyBjc3NbbWF4XVxuICAgICAgICAgICAgOiBgJHtncm93fSAke3Nocmlua30gJHtjc3NbbWF4XX1gXG4gICAgICAgICAgOiBoYXNDYWxjXG4gICAgICAgICAgPyBjc3NbbWluXVxuICAgICAgICAgIDogYCR7Z3Jvd30gJHtzaHJpbmt9ICR7Y3NzW21pbl19YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZXh0ZW5kT2JqZWN0KGNzcywgeyAnYm94LXNpemluZyc6ICdib3JkZXItYm94JyB9KSBhcyBTdHlsZURlZmluaXRpb247XG4gIH1cbn1cblxuY29uc3QgaW5wdXRzID0gW1xuICAnZnhGbGV4JyxcbiAgJ2Z4RmxleC54cycsXG4gICdmeEZsZXguc20nLFxuICAnZnhGbGV4Lm1kJyxcbiAgJ2Z4RmxleC5sZycsXG4gICdmeEZsZXgueGwnLFxuICAnZnhGbGV4Lmx0LXNtJyxcbiAgJ2Z4RmxleC5sdC1tZCcsXG4gICdmeEZsZXgubHQtbGcnLFxuICAnZnhGbGV4Lmx0LXhsJyxcbiAgJ2Z4RmxleC5ndC14cycsXG4gICdmeEZsZXguZ3Qtc20nLFxuICAnZnhGbGV4Lmd0LW1kJyxcbiAgJ2Z4RmxleC5ndC1sZycsXG5dO1xuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtmeEZsZXhdLCBbZnhGbGV4LnhzXSwgW2Z4RmxleC5zbV0sIFtmeEZsZXgubWRdLFxuICBbZnhGbGV4LmxnXSwgW2Z4RmxleC54bF0sIFtmeEZsZXgubHQtc21dLCBbZnhGbGV4Lmx0LW1kXSxcbiAgW2Z4RmxleC5sdC1sZ10sIFtmeEZsZXgubHQteGxdLCBbZnhGbGV4Lmd0LXhzXSwgW2Z4RmxleC5ndC1zbV0sXG4gIFtmeEZsZXguZ3QtbWRdLCBbZnhGbGV4Lmd0LWxnXVxuYDtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdG8gY29udHJvbCB0aGUgc2l6ZSBvZiBhIGZsZXggaXRlbSB1c2luZyBmbGV4LWJhc2lzLCBmbGV4LWdyb3csIGFuZCBmbGV4LXNocmluay5cbiAqIENvcnJlc3BvbmRzIHRvIHRoZSBjc3MgYGZsZXhgIHNob3J0aGFuZCBwcm9wZXJ0eS5cbiAqXG4gKiBAc2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvY3NzL2EtZ3VpZGUtdG8tZmxleGJveC9cbiAqL1xuQERpcmVjdGl2ZSgpXG5leHBvcnQgY2xhc3MgRmxleERpcmVjdGl2ZSBleHRlbmRzIEJhc2VEaXJlY3RpdmUyIGltcGxlbWVudHMgT25Jbml0IHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnZmxleCc7XG4gIHByb3RlY3RlZCBkaXJlY3Rpb24/OiBzdHJpbmcgPSB1bmRlZmluZWQ7XG4gIHByb3RlY3RlZCB3cmFwPzogYm9vbGVhbiA9IHVuZGVmaW5lZDtcblxuICBASW5wdXQoJ2Z4U2hyaW5rJylcbiAgZ2V0IHNocmluaygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmZsZXhTaHJpbms7XG4gIH1cbiAgc2V0IHNocmluayh2YWx1ZTogc3RyaW5nKSB7XG4gICAgdGhpcy5mbGV4U2hyaW5rID0gdmFsdWUgfHwgJzEnO1xuICAgIHRoaXMudHJpZ2dlclJlZmxvdygpO1xuICB9XG5cbiAgQElucHV0KCdmeEdyb3cnKVxuICBnZXQgZ3JvdygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmZsZXhHcm93O1xuICB9XG4gIHNldCBncm93KHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLmZsZXhHcm93ID0gdmFsdWUgfHwgJzEnO1xuICAgIHRoaXMudHJpZ2dlclJlZmxvdygpO1xuICB9XG5cbiAgcHJvdGVjdGVkIGZsZXhHcm93ID0gJzEnO1xuICBwcm90ZWN0ZWQgZmxleFNocmluayA9ICcxJztcblxuICBjb25zdHJ1Y3RvcihcbiAgICBlbFJlZjogRWxlbWVudFJlZixcbiAgICBzdHlsZVV0aWxzOiBTdHlsZVV0aWxzLFxuICAgIEBJbmplY3QoTEFZT1VUX0NPTkZJRykgcHJvdGVjdGVkIGxheW91dENvbmZpZzogTGF5b3V0Q29uZmlnT3B0aW9ucyxcbiAgICBzdHlsZUJ1aWxkZXI6IEZsZXhTdHlsZUJ1aWxkZXIsXG4gICAgcHJvdGVjdGVkIG92ZXJyaWRlIG1hcnNoYWw6IE1lZGlhTWFyc2hhbGxlclxuICApIHtcbiAgICBzdXBlcihlbFJlZiwgc3R5bGVCdWlsZGVyLCBzdHlsZVV0aWxzLCBtYXJzaGFsKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIGlmICh0aGlzLnBhcmVudEVsZW1lbnQpIHtcbiAgICAgIHRoaXMubWFyc2hhbFxuICAgICAgICAudHJhY2tWYWx1ZSh0aGlzLnBhcmVudEVsZW1lbnQsICdsYXlvdXQnKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95U3ViamVjdCkpXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy5vbkxheW91dENoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgIHRoaXMubWFyc2hhbFxuICAgICAgICAudHJhY2tWYWx1ZSh0aGlzLm5hdGl2ZUVsZW1lbnQsICdsYXlvdXQtYWxpZ24nKVxuICAgICAgICAucGlwZSh0YWtlVW50aWwodGhpcy5kZXN0cm95U3ViamVjdCkpXG4gICAgICAgIC5zdWJzY3JpYmUodGhpcy50cmlnZ2VyUmVmbG93LmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWNoZXMgdGhlIHBhcmVudCBjb250YWluZXIncyAnZmxleC1kaXJlY3Rpb24nIGFuZCB1cGRhdGVzIHRoZSBlbGVtZW50J3Mgc3R5bGUuXG4gICAqIFVzZWQgYXMgYSBoYW5kbGVyIGZvciBsYXlvdXQgY2hhbmdlIGV2ZW50cyBmcm9tIHRoZSBwYXJlbnQgZmxleCBjb250YWluZXIuXG4gICAqL1xuICBwcm90ZWN0ZWQgb25MYXlvdXRDaGFuZ2UobWF0Y2hlcjogRWxlbWVudE1hdGNoZXIpIHtcbiAgICBjb25zdCBsYXlvdXQ6IHN0cmluZyA9IG1hdGNoZXIudmFsdWU7XG4gICAgY29uc3QgbGF5b3V0UGFydHMgPSBsYXlvdXQuc3BsaXQoJyAnKTtcbiAgICB0aGlzLmRpcmVjdGlvbiA9IGxheW91dFBhcnRzWzBdO1xuICAgIHRoaXMud3JhcCA9IGxheW91dFBhcnRzWzFdICE9PSB1bmRlZmluZWQgJiYgbGF5b3V0UGFydHNbMV0gPT09ICd3cmFwJztcbiAgICB0aGlzLnRyaWdnZXJVcGRhdGUoKTtcbiAgfVxuXG4gIC8qKiBJbnB1dCB0byB0aGlzIGlzIGV4Y2x1c2l2ZWx5IHRoZSBiYXNpcyBpbnB1dCB2YWx1ZSAqL1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgdXBkYXRlV2l0aFZhbHVlKHZhbHVlOiBzdHJpbmcpIHtcbiAgICBjb25zdCBhZGRGbGV4VG9QYXJlbnQgPSB0aGlzLmxheW91dENvbmZpZy5hZGRGbGV4VG9QYXJlbnQgIT09IGZhbHNlO1xuICAgIGlmICh0aGlzLmRpcmVjdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLmRpcmVjdGlvbiA9IHRoaXMuZ2V0RmxleEZsb3dEaXJlY3Rpb24oXG4gICAgICAgIHRoaXMucGFyZW50RWxlbWVudCEsXG4gICAgICAgIGFkZEZsZXhUb1BhcmVudFxuICAgICAgKTtcbiAgICB9XG4gICAgaWYgKHRoaXMud3JhcCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLndyYXAgPSB0aGlzLmhhc1dyYXAodGhpcy5wYXJlbnRFbGVtZW50ISk7XG4gICAgfVxuICAgIGNvbnN0IGRpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uO1xuICAgIGNvbnN0IGlzSG9yaXpvbnRhbCA9IGRpcmVjdGlvbi5zdGFydHNXaXRoKCdyb3cnKTtcbiAgICBjb25zdCBoYXNXcmFwID0gdGhpcy53cmFwO1xuICAgIGlmIChpc0hvcml6b250YWwgJiYgaGFzV3JhcCkge1xuICAgICAgdGhpcy5zdHlsZUNhY2hlID0gZmxleFJvd1dyYXBDYWNoZTtcbiAgICB9IGVsc2UgaWYgKGlzSG9yaXpvbnRhbCAmJiAhaGFzV3JhcCkge1xuICAgICAgdGhpcy5zdHlsZUNhY2hlID0gZmxleFJvd0NhY2hlO1xuICAgIH0gZWxzZSBpZiAoIWlzSG9yaXpvbnRhbCAmJiBoYXNXcmFwKSB7XG4gICAgICB0aGlzLnN0eWxlQ2FjaGUgPSBmbGV4Q29sdW1uV3JhcENhY2hlO1xuICAgIH0gZWxzZSBpZiAoIWlzSG9yaXpvbnRhbCAmJiAhaGFzV3JhcCkge1xuICAgICAgdGhpcy5zdHlsZUNhY2hlID0gZmxleENvbHVtbkNhY2hlO1xuICAgIH1cbiAgICBjb25zdCBiYXNpcyA9IFN0cmluZyh2YWx1ZSkucmVwbGFjZSgnOycsICcnKTtcbiAgICBjb25zdCBwYXJ0cyA9IHZhbGlkYXRlQmFzaXMoYmFzaXMsIHRoaXMuZmxleEdyb3csIHRoaXMuZmxleFNocmluayk7XG4gICAgdGhpcy5hZGRTdHlsZXMocGFydHMuam9pbignICcpLCB7IGRpcmVjdGlvbiwgaGFzV3JhcCB9KTtcbiAgfVxuXG4gIC8qKiBUcmlnZ2VyIGEgc3R5bGUgcmVmbG93LCB1c3VhbGx5IGJhc2VkIG9uIGEgc2hyaW5rL2dyb3cgaW5wdXQgZXZlbnQgKi9cbiAgcHJvdGVjdGVkIHRyaWdnZXJSZWZsb3coKSB7XG4gICAgY29uc3QgYWN0aXZhdGVkVmFsdWUgPSB0aGlzLmFjdGl2YXRlZFZhbHVlO1xuICAgIGlmIChhY3RpdmF0ZWRWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IHZhbGlkYXRlQmFzaXMoXG4gICAgICAgIGFjdGl2YXRlZFZhbHVlICsgJycsXG4gICAgICAgIHRoaXMuZmxleEdyb3csXG4gICAgICAgIHRoaXMuZmxleFNocmlua1xuICAgICAgKTtcbiAgICAgIHRoaXMubWFyc2hhbC51cGRhdGVFbGVtZW50KFxuICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQsXG4gICAgICAgIHRoaXMuRElSRUNUSVZFX0tFWSxcbiAgICAgICAgcGFydHMuam9pbignICcpXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5ARGlyZWN0aXZlKHsgaW5wdXRzLCBzZWxlY3RvciB9KVxuZXhwb3J0IGNsYXNzIERlZmF1bHRGbGV4RGlyZWN0aXZlIGV4dGVuZHMgRmxleERpcmVjdGl2ZSB7XG4gIHByb3RlY3RlZCBvdmVycmlkZSBpbnB1dHMgPSBpbnB1dHM7XG59XG5cbmNvbnN0IGZsZXhSb3dDYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGZsZXhDb2x1bW5DYWNoZTogTWFwPHN0cmluZywgU3R5bGVEZWZpbml0aW9uPiA9IG5ldyBNYXAoKTtcbmNvbnN0IGZsZXhSb3dXcmFwQ2FjaGU6IE1hcDxzdHJpbmcsIFN0eWxlRGVmaW5pdGlvbj4gPSBuZXcgTWFwKCk7XG5jb25zdCBmbGV4Q29sdW1uV3JhcENhY2hlOiBNYXA8c3RyaW5nLCBTdHlsZURlZmluaXRpb24+ID0gbmV3IE1hcCgpO1xuIl19