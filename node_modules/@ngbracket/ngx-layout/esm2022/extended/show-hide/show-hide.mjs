/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { isPlatformServer } from '@angular/common';
import { Directive, Inject, Injectable, PLATFORM_ID, } from '@angular/core';
import { BaseDirective2, LAYOUT_CONFIG, SERVER_TOKEN, StyleBuilder, } from '@ngbracket/ngx-layout/core';
import { takeUntil } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
export class ShowHideStyleBuilder extends StyleBuilder {
    buildStyles(show, parent) {
        const shouldShow = show === 'true';
        return {
            display: shouldShow
                ? parent.display || (parent.isServer ? 'initial' : '')
                : 'none',
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ShowHideStyleBuilder, deps: null, target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ShowHideStyleBuilder, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ShowHideStyleBuilder, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
export class ShowHideDirective extends BaseDirective2 {
    constructor(elementRef, styleBuilder, styler, marshal, layoutConfig, platformId, serverModuleLoaded) {
        super(elementRef, styleBuilder, styler, marshal);
        this.layoutConfig = layoutConfig;
        this.platformId = platformId;
        this.serverModuleLoaded = serverModuleLoaded;
        this.DIRECTIVE_KEY = 'show-hide';
        /** Original DOM Element CSS display style */
        this.display = '';
        this.hasLayout = false;
        this.hasFlexChild = false;
    }
    // *********************************************
    // Lifecycle Methods
    // *********************************************
    ngAfterViewInit() {
        this.trackExtraTriggers();
        const children = Array.from(this.nativeElement.children);
        for (let i = 0; i < children.length; i++) {
            if (this.marshal.hasValue(children[i], 'flex')) {
                this.hasFlexChild = true;
                break;
            }
        }
        if (DISPLAY_MAP.has(this.nativeElement)) {
            this.display = DISPLAY_MAP.get(this.nativeElement);
        }
        else {
            this.display = this.getDisplayStyle();
            DISPLAY_MAP.set(this.nativeElement, this.display);
        }
        this.init();
        // set the default to show unless explicitly overridden
        const defaultValue = this.marshal.getValue(this.nativeElement, this.DIRECTIVE_KEY, '');
        if (defaultValue === undefined || defaultValue === '') {
            this.setValue(true, '');
        }
        else {
            this.triggerUpdate();
        }
    }
    /**
     * On changes to any @Input properties...
     * Default to use the non-responsive Input value ('fxShow')
     * Then conditionally override with the mq-activated Input's current value
     */
    ngOnChanges(changes) {
        Object.keys(changes).forEach((key) => {
            if (this.inputs.indexOf(key) !== -1) {
                const inputKey = key.split('.');
                const bp = inputKey.slice(1).join('.');
                const inputValue = changes[key].currentValue;
                let shouldShow = inputValue !== ''
                    ? inputValue !== 0
                        ? coerceBooleanProperty(inputValue)
                        : false
                    : true;
                if (inputKey[0] === 'fxHide') {
                    shouldShow = !shouldShow;
                }
                this.setValue(shouldShow, bp);
            }
        });
    }
    // *********************************************
    // Protected methods
    // *********************************************
    /**
     *  Watch for these extra triggers to update fxShow, fxHide stylings
     */
    trackExtraTriggers() {
        this.hasLayout = this.marshal.hasValue(this.nativeElement, 'layout');
        ['layout', 'layout-align'].forEach((key) => {
            this.marshal
                .trackValue(this.nativeElement, key)
                .pipe(takeUntil(this.destroySubject))
                .subscribe(this.triggerUpdate.bind(this));
        });
    }
    /**
     * Override accessor to the current HTMLElement's `display` style
     * Note: Show/Hide will not change the display to 'flex' but will set it to 'block'
     * unless it was already explicitly specified inline or in a CSS stylesheet.
     */
    getDisplayStyle() {
        return this.hasLayout ||
            (this.hasFlexChild && this.layoutConfig.addFlexToParent)
            ? 'flex'
            : this.styler.lookupStyle(this.nativeElement, 'display', true);
    }
    /** Validate the visibility value and then update the host's inline display style */
    updateWithValue(value = true) {
        if (value === '') {
            return;
        }
        const isServer = isPlatformServer(this.platformId);
        this.addStyles(value ? 'true' : 'false', {
            display: this.display,
            isServer,
        });
        if (isServer && this.serverModuleLoaded) {
            this.nativeElement.style.setProperty('display', '');
        }
        this.marshal.triggerUpdate(this.parentElement, 'layout-gap');
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ShowHideDirective, deps: [{ token: i0.ElementRef }, { token: ShowHideStyleBuilder }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }, { token: LAYOUT_CONFIG }, { token: PLATFORM_ID }, { token: SERVER_TOKEN }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: ShowHideDirective, usesInheritance: true, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: ShowHideDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: ShowHideStyleBuilder }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [SERVER_TOKEN]
                }] }] });
const DISPLAY_MAP = new WeakMap();
const inputs = [
    'fxShow',
    'fxShow.print',
    'fxShow.xs',
    'fxShow.sm',
    'fxShow.md',
    'fxShow.lg',
    'fxShow.xl',
    'fxShow.lt-sm',
    'fxShow.lt-md',
    'fxShow.lt-lg',
    'fxShow.lt-xl',
    'fxShow.gt-xs',
    'fxShow.gt-sm',
    'fxShow.gt-md',
    'fxShow.gt-lg',
    'fxHide',
    'fxHide.print',
    'fxHide.xs',
    'fxHide.sm',
    'fxHide.md',
    'fxHide.lg',
    'fxHide.xl',
    'fxHide.lt-sm',
    'fxHide.lt-md',
    'fxHide.lt-lg',
    'fxHide.lt-xl',
    'fxHide.gt-xs',
    'fxHide.gt-sm',
    'fxHide.gt-md',
    'fxHide.gt-lg',
];
const selector = `
  [fxShow], [fxShow.print],
  [fxShow.xs], [fxShow.sm], [fxShow.md], [fxShow.lg], [fxShow.xl],
  [fxShow.lt-sm], [fxShow.lt-md], [fxShow.lt-lg], [fxShow.lt-xl],
  [fxShow.gt-xs], [fxShow.gt-sm], [fxShow.gt-md], [fxShow.gt-lg],
  [fxHide], [fxHide.print],
  [fxHide.xs], [fxHide.sm], [fxHide.md], [fxHide.lg], [fxHide.xl],
  [fxHide.lt-sm], [fxHide.lt-md], [fxHide.lt-lg], [fxHide.lt-xl],
  [fxHide.gt-xs], [fxHide.gt-sm], [fxHide.gt-md], [fxHide.gt-lg]
`;
/**
 * 'show' Layout API directive
 */
export class DefaultShowHideDirective extends ShowHideDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultShowHideDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultShowHideDirective, selector: "\n  [fxShow], [fxShow.print],\n  [fxShow.xs], [fxShow.sm], [fxShow.md], [fxShow.lg], [fxShow.xl],\n  [fxShow.lt-sm], [fxShow.lt-md], [fxShow.lt-lg], [fxShow.lt-xl],\n  [fxShow.gt-xs], [fxShow.gt-sm], [fxShow.gt-md], [fxShow.gt-lg],\n  [fxHide], [fxHide.print],\n  [fxHide.xs], [fxHide.sm], [fxHide.md], [fxHide.lg], [fxHide.xl],\n  [fxHide.lt-sm], [fxHide.lt-md], [fxHide.lt-lg], [fxHide.lt-xl],\n  [fxHide.gt-xs], [fxHide.gt-sm], [fxHide.gt-md], [fxHide.gt-lg]\n", inputs: { fxShow: "fxShow", "fxShow.print": "fxShow.print", "fxShow.xs": "fxShow.xs", "fxShow.sm": "fxShow.sm", "fxShow.md": "fxShow.md", "fxShow.lg": "fxShow.lg", "fxShow.xl": "fxShow.xl", "fxShow.lt-sm": "fxShow.lt-sm", "fxShow.lt-md": "fxShow.lt-md", "fxShow.lt-lg": "fxShow.lt-lg", "fxShow.lt-xl": "fxShow.lt-xl", "fxShow.gt-xs": "fxShow.gt-xs", "fxShow.gt-sm": "fxShow.gt-sm", "fxShow.gt-md": "fxShow.gt-md", "fxShow.gt-lg": "fxShow.gt-lg", fxHide: "fxHide", "fxHide.print": "fxHide.print", "fxHide.xs": "fxHide.xs", "fxHide.sm": "fxHide.sm", "fxHide.md": "fxHide.md", "fxHide.lg": "fxHide.lg", "fxHide.xl": "fxHide.xl", "fxHide.lt-sm": "fxHide.lt-sm", "fxHide.lt-md": "fxHide.lt-md", "fxHide.lt-lg": "fxHide.lt-lg", "fxHide.lt-xl": "fxHide.lt-xl", "fxHide.gt-xs": "fxHide.gt-xs", "fxHide.gt-sm": "fxHide.gt-sm", "fxHide.gt-md": "fxHide.gt-md", "fxHide.gt-lg": "fxHide.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultShowHideDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvdy1oaWRlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9leHRlbmRlZC9zaG93LWhpZGUvc2hvdy1oaWRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzlELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ25ELE9BQU8sRUFFTCxTQUFTLEVBRVQsTUFBTSxFQUNOLFVBQVUsRUFFVixXQUFXLEdBRVosTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUNMLGNBQWMsRUFFZCxhQUFhLEVBRWIsWUFBWSxFQUNaLFlBQVksR0FFYixNQUFNLDRCQUE0QixDQUFDO0FBQ3BDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQzs7O0FBUTNDLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxZQUFZO0lBQ3BELFdBQVcsQ0FBQyxJQUFZLEVBQUUsTUFBc0I7UUFDOUMsTUFBTSxVQUFVLEdBQUcsSUFBSSxLQUFLLE1BQU0sQ0FBQztRQUNuQyxPQUFPO1lBQ0wsT0FBTyxFQUFFLFVBQVU7Z0JBQ2pCLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3RELENBQUMsQ0FBQyxNQUFNO1NBQ1gsQ0FBQztJQUNKLENBQUM7OEdBUlUsb0JBQW9CO2tIQUFwQixvQkFBb0IsY0FEUCxNQUFNOzsyRkFDbkIsb0JBQW9CO2tCQURoQyxVQUFVO21CQUFDLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRTs7QUFhbEMsTUFBTSxPQUFPLGlCQUNYLFNBQVEsY0FBYztJQVV0QixZQUNFLFVBQXNCLEVBQ3RCLFlBQWtDLEVBQ2xDLE1BQWtCLEVBQ2xCLE9BQXdCLEVBQ1MsWUFBaUMsRUFDbkMsVUFBa0IsRUFDakIsa0JBQTJCO1FBRTNELEtBQUssQ0FBQyxVQUFVLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQUpoQixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDbkMsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUNqQix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQVM7UUFkMUMsa0JBQWEsR0FBRyxXQUFXLENBQUM7UUFFL0MsNkNBQTZDO1FBQ25DLFlBQU8sR0FBVyxFQUFFLENBQUM7UUFDckIsY0FBUyxHQUFHLEtBQUssQ0FBQztRQUNsQixpQkFBWSxHQUFHLEtBQUssQ0FBQztJQVkvQixDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQixnREFBZ0Q7SUFFaEQsZUFBZTtRQUNiLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN6RCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3pDLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBZ0IsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDekIsTUFBTTtZQUNSLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFFLENBQUM7UUFDdEQsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztZQUN0QyxXQUFXLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDWix1REFBdUQ7UUFDdkQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQ3hDLElBQUksQ0FBQyxhQUFhLEVBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQ2xCLEVBQUUsQ0FDSCxDQUFDO1FBQ0YsSUFBSSxZQUFZLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxFQUFFLEVBQUUsQ0FBQztZQUN0RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxQixDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUN2QixDQUFDO0lBQ0gsQ0FBQztJQUVEOzs7O09BSUc7SUFDTSxXQUFXLENBQUMsT0FBc0I7UUFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtZQUNuQyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ3BDLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2QyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDO2dCQUM3QyxJQUFJLFVBQVUsR0FDWixVQUFVLEtBQUssRUFBRTtvQkFDZixDQUFDLENBQUMsVUFBVSxLQUFLLENBQUM7d0JBQ2hCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUM7d0JBQ25DLENBQUMsQ0FBQyxLQUFLO29CQUNULENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQ1gsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFLENBQUM7b0JBQzdCLFVBQVUsR0FBRyxDQUFDLFVBQVUsQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELG9CQUFvQjtJQUNwQixnREFBZ0Q7SUFFaEQ7O09BRUc7SUFDTyxrQkFBa0I7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBRXJFLENBQUMsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ3pDLElBQUksQ0FBQyxPQUFPO2lCQUNULFVBQVUsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQztpQkFDbkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7aUJBQ3BDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQzlDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVEOzs7O09BSUc7SUFDTyxlQUFlO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLFNBQVM7WUFDbkIsQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDO1lBQ3hELENBQUMsQ0FBQyxNQUFNO1lBQ1IsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxvRkFBb0Y7SUFDakUsZUFBZSxDQUFDLFFBQTBCLElBQUk7UUFDL0QsSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDakIsT0FBTztRQUNULENBQUM7UUFDRCxNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFO1lBQ3ZDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTztZQUNyQixRQUFRO1NBQ1QsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN0RCxDQUFDO1FBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLGFBQWMsRUFBRSxZQUFZLENBQUMsQ0FBQztJQUNoRSxDQUFDOzhHQWhJVSxpQkFBaUIsc0lBZ0JsQixhQUFhLGFBQ2IsV0FBVyxhQUNYLFlBQVk7a0dBbEJYLGlCQUFpQjs7MkZBQWpCLGlCQUFpQjtrQkFEN0IsU0FBUzs7MEJBaUJMLE1BQU07MkJBQUMsYUFBYTs7MEJBQ3BCLE1BQU07MkJBQUMsV0FBVzs7MEJBQ2xCLE1BQU07MkJBQUMsWUFBWTs7QUFpSHhCLE1BQU0sV0FBVyxHQUFpQyxJQUFJLE9BQU8sRUFBRSxDQUFDO0FBRWhFLE1BQU0sTUFBTSxHQUFHO0lBQ2IsUUFBUTtJQUNSLGNBQWM7SUFDZCxXQUFXO0lBQ1gsV0FBVztJQUNYLFdBQVc7SUFDWCxXQUFXO0lBQ1gsV0FBVztJQUNYLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsUUFBUTtJQUNSLGNBQWM7SUFDZCxXQUFXO0lBQ1gsV0FBVztJQUNYLFdBQVc7SUFDWCxXQUFXO0lBQ1gsV0FBVztJQUNYLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0lBQ2QsY0FBYztJQUNkLGNBQWM7SUFDZCxjQUFjO0NBQ2YsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUFHOzs7Ozs7Ozs7Q0FTaEIsQ0FBQztBQUVGOztHQUVHO0FBRUgsTUFBTSxPQUFPLHdCQUF5QixTQUFRLGlCQUFpQjtJQUQvRDs7UUFFcUIsV0FBTSxHQUFHLE1BQU0sQ0FBQztLQUNwQzs4R0FGWSx3QkFBd0I7a0dBQXhCLHdCQUF3Qjs7MkZBQXhCLHdCQUF3QjtrQkFEcEMsU0FBUzttQkFBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSB9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQgeyBpc1BsYXRmb3JtU2VydmVyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEFmdGVyVmlld0luaXQsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBPbkNoYW5nZXMsXG4gIFBMQVRGT1JNX0lELFxuICBTaW1wbGVDaGFuZ2VzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7XG4gIEJhc2VEaXJlY3RpdmUyLFxuICBMYXlvdXRDb25maWdPcHRpb25zLFxuICBMQVlPVVRfQ09ORklHLFxuICBNZWRpYU1hcnNoYWxsZXIsXG4gIFNFUlZFUl9UT0tFTixcbiAgU3R5bGVCdWlsZGVyLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5pbXBvcnQgeyB0YWtlVW50aWwgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2hvd0hpZGVQYXJlbnQge1xuICBkaXNwbGF5OiBzdHJpbmc7XG4gIGlzU2VydmVyOiBib29sZWFuO1xufVxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFNob3dIaWRlU3R5bGVCdWlsZGVyIGV4dGVuZHMgU3R5bGVCdWlsZGVyIHtcbiAgYnVpbGRTdHlsZXMoc2hvdzogc3RyaW5nLCBwYXJlbnQ6IFNob3dIaWRlUGFyZW50KSB7XG4gICAgY29uc3Qgc2hvdWxkU2hvdyA9IHNob3cgPT09ICd0cnVlJztcbiAgICByZXR1cm4ge1xuICAgICAgZGlzcGxheTogc2hvdWxkU2hvd1xuICAgICAgICA/IHBhcmVudC5kaXNwbGF5IHx8IChwYXJlbnQuaXNTZXJ2ZXIgPyAnaW5pdGlhbCcgOiAnJylcbiAgICAgICAgOiAnbm9uZScsXG4gICAgfTtcbiAgfVxufVxuXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBTaG93SGlkZURpcmVjdGl2ZVxuICBleHRlbmRzIEJhc2VEaXJlY3RpdmUyXG4gIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25DaGFuZ2VzXG57XG4gIHByb3RlY3RlZCBvdmVycmlkZSBESVJFQ1RJVkVfS0VZID0gJ3Nob3ctaGlkZSc7XG5cbiAgLyoqIE9yaWdpbmFsIERPTSBFbGVtZW50IENTUyBkaXNwbGF5IHN0eWxlICovXG4gIHByb3RlY3RlZCBkaXNwbGF5OiBzdHJpbmcgPSAnJztcbiAgcHJvdGVjdGVkIGhhc0xheW91dCA9IGZhbHNlO1xuICBwcm90ZWN0ZWQgaGFzRmxleENoaWxkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZWxlbWVudFJlZjogRWxlbWVudFJlZixcbiAgICBzdHlsZUJ1aWxkZXI6IFNob3dIaWRlU3R5bGVCdWlsZGVyLFxuICAgIHN0eWxlcjogU3R5bGVVdGlscyxcbiAgICBtYXJzaGFsOiBNZWRpYU1hcnNoYWxsZXIsXG4gICAgQEluamVjdChMQVlPVVRfQ09ORklHKSBwcm90ZWN0ZWQgbGF5b3V0Q29uZmlnOiBMYXlvdXRDb25maWdPcHRpb25zLFxuICAgIEBJbmplY3QoUExBVEZPUk1fSUQpIHByb3RlY3RlZCBwbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgQEluamVjdChTRVJWRVJfVE9LRU4pIHByb3RlY3RlZCBzZXJ2ZXJNb2R1bGVMb2FkZWQ6IGJvb2xlYW5cbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgc3R5bGVCdWlsZGVyLCBzdHlsZXIsIG1hcnNoYWwpO1xuICB9XG5cbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gIC8vIExpZmVjeWNsZSBNZXRob2RzXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4gIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICB0aGlzLnRyYWNrRXh0cmFUcmlnZ2VycygpO1xuXG4gICAgY29uc3QgY2hpbGRyZW4gPSBBcnJheS5mcm9tKHRoaXMubmF0aXZlRWxlbWVudC5jaGlsZHJlbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRoaXMubWFyc2hhbC5oYXNWYWx1ZShjaGlsZHJlbltpXSBhcyBIVE1MRWxlbWVudCwgJ2ZsZXgnKSkge1xuICAgICAgICB0aGlzLmhhc0ZsZXhDaGlsZCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChESVNQTEFZX01BUC5oYXModGhpcy5uYXRpdmVFbGVtZW50KSkge1xuICAgICAgdGhpcy5kaXNwbGF5ID0gRElTUExBWV9NQVAuZ2V0KHRoaXMubmF0aXZlRWxlbWVudCkhO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRpc3BsYXkgPSB0aGlzLmdldERpc3BsYXlTdHlsZSgpO1xuICAgICAgRElTUExBWV9NQVAuc2V0KHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcy5kaXNwbGF5KTtcbiAgICB9XG5cbiAgICB0aGlzLmluaXQoKTtcbiAgICAvLyBzZXQgdGhlIGRlZmF1bHQgdG8gc2hvdyB1bmxlc3MgZXhwbGljaXRseSBvdmVycmlkZGVuXG4gICAgY29uc3QgZGVmYXVsdFZhbHVlID0gdGhpcy5tYXJzaGFsLmdldFZhbHVlKFxuICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LFxuICAgICAgdGhpcy5ESVJFQ1RJVkVfS0VZLFxuICAgICAgJydcbiAgICApO1xuICAgIGlmIChkZWZhdWx0VmFsdWUgPT09IHVuZGVmaW5lZCB8fCBkZWZhdWx0VmFsdWUgPT09ICcnKSB7XG4gICAgICB0aGlzLnNldFZhbHVlKHRydWUsICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50cmlnZ2VyVXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9uIGNoYW5nZXMgdG8gYW55IEBJbnB1dCBwcm9wZXJ0aWVzLi4uXG4gICAqIERlZmF1bHQgdG8gdXNlIHRoZSBub24tcmVzcG9uc2l2ZSBJbnB1dCB2YWx1ZSAoJ2Z4U2hvdycpXG4gICAqIFRoZW4gY29uZGl0aW9uYWxseSBvdmVycmlkZSB3aXRoIHRoZSBtcS1hY3RpdmF0ZWQgSW5wdXQncyBjdXJyZW50IHZhbHVlXG4gICAqL1xuICBvdmVycmlkZSBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAodGhpcy5pbnB1dHMuaW5kZXhPZihrZXkpICE9PSAtMSkge1xuICAgICAgICBjb25zdCBpbnB1dEtleSA9IGtleS5zcGxpdCgnLicpO1xuICAgICAgICBjb25zdCBicCA9IGlucHV0S2V5LnNsaWNlKDEpLmpvaW4oJy4nKTtcbiAgICAgICAgY29uc3QgaW5wdXRWYWx1ZSA9IGNoYW5nZXNba2V5XS5jdXJyZW50VmFsdWU7XG4gICAgICAgIGxldCBzaG91bGRTaG93ID1cbiAgICAgICAgICBpbnB1dFZhbHVlICE9PSAnJ1xuICAgICAgICAgICAgPyBpbnB1dFZhbHVlICE9PSAwXG4gICAgICAgICAgICAgID8gY29lcmNlQm9vbGVhblByb3BlcnR5KGlucHV0VmFsdWUpXG4gICAgICAgICAgICAgIDogZmFsc2VcbiAgICAgICAgICAgIDogdHJ1ZTtcbiAgICAgICAgaWYgKGlucHV0S2V5WzBdID09PSAnZnhIaWRlJykge1xuICAgICAgICAgIHNob3VsZFNob3cgPSAhc2hvdWxkU2hvdztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFZhbHVlKHNob3VsZFNob3csIGJwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAvLyBQcm90ZWN0ZWQgbWV0aG9kc1xuICAvLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuICAvKipcbiAgICogIFdhdGNoIGZvciB0aGVzZSBleHRyYSB0cmlnZ2VycyB0byB1cGRhdGUgZnhTaG93LCBmeEhpZGUgc3R5bGluZ3NcbiAgICovXG4gIHByb3RlY3RlZCB0cmFja0V4dHJhVHJpZ2dlcnMoKSB7XG4gICAgdGhpcy5oYXNMYXlvdXQgPSB0aGlzLm1hcnNoYWwuaGFzVmFsdWUodGhpcy5uYXRpdmVFbGVtZW50LCAnbGF5b3V0Jyk7XG5cbiAgICBbJ2xheW91dCcsICdsYXlvdXQtYWxpZ24nXS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIHRoaXMubWFyc2hhbFxuICAgICAgICAudHJhY2tWYWx1ZSh0aGlzLm5hdGl2ZUVsZW1lbnQsIGtleSlcbiAgICAgICAgLnBpcGUodGFrZVVudGlsKHRoaXMuZGVzdHJveVN1YmplY3QpKVxuICAgICAgICAuc3Vic2NyaWJlKHRoaXMudHJpZ2dlclVwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZSBhY2Nlc3NvciB0byB0aGUgY3VycmVudCBIVE1MRWxlbWVudCdzIGBkaXNwbGF5YCBzdHlsZVxuICAgKiBOb3RlOiBTaG93L0hpZGUgd2lsbCBub3QgY2hhbmdlIHRoZSBkaXNwbGF5IHRvICdmbGV4JyBidXQgd2lsbCBzZXQgaXQgdG8gJ2Jsb2NrJ1xuICAgKiB1bmxlc3MgaXQgd2FzIGFscmVhZHkgZXhwbGljaXRseSBzcGVjaWZpZWQgaW5saW5lIG9yIGluIGEgQ1NTIHN0eWxlc2hlZXQuXG4gICAqL1xuICBwcm90ZWN0ZWQgZ2V0RGlzcGxheVN0eWxlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuaGFzTGF5b3V0IHx8XG4gICAgICAodGhpcy5oYXNGbGV4Q2hpbGQgJiYgdGhpcy5sYXlvdXRDb25maWcuYWRkRmxleFRvUGFyZW50KVxuICAgICAgPyAnZmxleCdcbiAgICAgIDogdGhpcy5zdHlsZXIubG9va3VwU3R5bGUodGhpcy5uYXRpdmVFbGVtZW50LCAnZGlzcGxheScsIHRydWUpO1xuICB9XG5cbiAgLyoqIFZhbGlkYXRlIHRoZSB2aXNpYmlsaXR5IHZhbHVlIGFuZCB0aGVuIHVwZGF0ZSB0aGUgaG9zdCdzIGlubGluZSBkaXNwbGF5IHN0eWxlICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSB1cGRhdGVXaXRoVmFsdWUodmFsdWU6IGJvb2xlYW4gfCBzdHJpbmcgPSB0cnVlKSB7XG4gICAgaWYgKHZhbHVlID09PSAnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIodGhpcy5wbGF0Zm9ybUlkKTtcbiAgICB0aGlzLmFkZFN0eWxlcyh2YWx1ZSA/ICd0cnVlJyA6ICdmYWxzZScsIHtcbiAgICAgIGRpc3BsYXk6IHRoaXMuZGlzcGxheSxcbiAgICAgIGlzU2VydmVyLFxuICAgIH0pO1xuICAgIGlmIChpc1NlcnZlciAmJiB0aGlzLnNlcnZlck1vZHVsZUxvYWRlZCkge1xuICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCdkaXNwbGF5JywgJycpO1xuICAgIH1cbiAgICB0aGlzLm1hcnNoYWwudHJpZ2dlclVwZGF0ZSh0aGlzLnBhcmVudEVsZW1lbnQhLCAnbGF5b3V0LWdhcCcpO1xuICB9XG59XG5cbmNvbnN0IERJU1BMQVlfTUFQOiBXZWFrTWFwPEhUTUxFbGVtZW50LCBzdHJpbmc+ID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3QgaW5wdXRzID0gW1xuICAnZnhTaG93JyxcbiAgJ2Z4U2hvdy5wcmludCcsXG4gICdmeFNob3cueHMnLFxuICAnZnhTaG93LnNtJyxcbiAgJ2Z4U2hvdy5tZCcsXG4gICdmeFNob3cubGcnLFxuICAnZnhTaG93LnhsJyxcbiAgJ2Z4U2hvdy5sdC1zbScsXG4gICdmeFNob3cubHQtbWQnLFxuICAnZnhTaG93Lmx0LWxnJyxcbiAgJ2Z4U2hvdy5sdC14bCcsXG4gICdmeFNob3cuZ3QteHMnLFxuICAnZnhTaG93Lmd0LXNtJyxcbiAgJ2Z4U2hvdy5ndC1tZCcsXG4gICdmeFNob3cuZ3QtbGcnLFxuICAnZnhIaWRlJyxcbiAgJ2Z4SGlkZS5wcmludCcsXG4gICdmeEhpZGUueHMnLFxuICAnZnhIaWRlLnNtJyxcbiAgJ2Z4SGlkZS5tZCcsXG4gICdmeEhpZGUubGcnLFxuICAnZnhIaWRlLnhsJyxcbiAgJ2Z4SGlkZS5sdC1zbScsXG4gICdmeEhpZGUubHQtbWQnLFxuICAnZnhIaWRlLmx0LWxnJyxcbiAgJ2Z4SGlkZS5sdC14bCcsXG4gICdmeEhpZGUuZ3QteHMnLFxuICAnZnhIaWRlLmd0LXNtJyxcbiAgJ2Z4SGlkZS5ndC1tZCcsXG4gICdmeEhpZGUuZ3QtbGcnLFxuXTtcblxuY29uc3Qgc2VsZWN0b3IgPSBgXG4gIFtmeFNob3ddLCBbZnhTaG93LnByaW50XSxcbiAgW2Z4U2hvdy54c10sIFtmeFNob3cuc21dLCBbZnhTaG93Lm1kXSwgW2Z4U2hvdy5sZ10sIFtmeFNob3cueGxdLFxuICBbZnhTaG93Lmx0LXNtXSwgW2Z4U2hvdy5sdC1tZF0sIFtmeFNob3cubHQtbGddLCBbZnhTaG93Lmx0LXhsXSxcbiAgW2Z4U2hvdy5ndC14c10sIFtmeFNob3cuZ3Qtc21dLCBbZnhTaG93Lmd0LW1kXSwgW2Z4U2hvdy5ndC1sZ10sXG4gIFtmeEhpZGVdLCBbZnhIaWRlLnByaW50XSxcbiAgW2Z4SGlkZS54c10sIFtmeEhpZGUuc21dLCBbZnhIaWRlLm1kXSwgW2Z4SGlkZS5sZ10sIFtmeEhpZGUueGxdLFxuICBbZnhIaWRlLmx0LXNtXSwgW2Z4SGlkZS5sdC1tZF0sIFtmeEhpZGUubHQtbGddLCBbZnhIaWRlLmx0LXhsXSxcbiAgW2Z4SGlkZS5ndC14c10sIFtmeEhpZGUuZ3Qtc21dLCBbZnhIaWRlLmd0LW1kXSwgW2Z4SGlkZS5ndC1sZ11cbmA7XG5cbi8qKlxuICogJ3Nob3cnIExheW91dCBBUEkgZGlyZWN0aXZlXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvciwgaW5wdXRzIH0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdFNob3dIaWRlRGlyZWN0aXZlIGV4dGVuZHMgU2hvd0hpZGVEaXJlY3RpdmUge1xuICBwcm90ZWN0ZWQgb3ZlcnJpZGUgaW5wdXRzID0gaW5wdXRzO1xufVxuIl19