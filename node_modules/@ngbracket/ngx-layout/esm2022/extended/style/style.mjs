/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer, NgStyle } from '@angular/common';
import { Directive, Inject, Optional, PLATFORM_ID, SecurityContext, Self, } from '@angular/core';
import { BaseDirective2, SERVER_TOKEN, } from '@ngbracket/ngx-layout/core';
import { buildMapFromSet, buildRawList, getType, keyValuesToMap, stringToKeyValue, } from './style-transforms';
import * as i0 from "@angular/core";
import * as i1 from "@ngbracket/ngx-layout/core";
import * as i2 from "@angular/platform-browser";
import * as i3 from "@angular/common";
export class StyleDirective extends BaseDirective2 {
    constructor(elementRef, styler, marshal, sanitizer, differs, renderer2, ngStyleInstance, serverLoaded, platformId) {
        super(elementRef, null, styler, marshal);
        this.sanitizer = sanitizer;
        this.ngStyleInstance = ngStyleInstance;
        this.DIRECTIVE_KEY = 'ngStyle';
        if (!this.ngStyleInstance) {
            // Create an instance NgStyle Directive instance only if `ngStyle=""` has NOT been
            // defined on the same host element; since the responsive variations may be defined...
            this.ngStyleInstance = new NgStyle(elementRef, differs, renderer2);
        }
        this.init();
        const styles = this.nativeElement.getAttribute('style') ?? '';
        this.fallbackStyles = this.buildStyleMap(styles);
        this.isServer = serverLoaded && isPlatformServer(platformId);
    }
    /** Add generated styles */
    updateWithValue(value) {
        const styles = this.buildStyleMap(value);
        this.ngStyleInstance.ngStyle = { ...this.fallbackStyles, ...styles };
        if (this.isServer) {
            this.applyStyleToElement(styles);
        }
        this.ngStyleInstance.ngDoCheck();
    }
    /** Remove generated styles */
    clearStyles() {
        this.ngStyleInstance.ngStyle = this.fallbackStyles;
        this.ngStyleInstance.ngDoCheck();
    }
    /**
     * Convert raw strings to ngStyleMap; which is required by ngStyle
     * NOTE: Raw string key-value pairs MUST be delimited by `;`
     *       Comma-delimiters are not supported due to complexities of
     *       possible style values such as `rgba(x,x,x,x)` and others
     */
    buildStyleMap(styles) {
        // Always safe-guard (aka sanitize) style property values
        const sanitizer = (val) => this.sanitizer.sanitize(SecurityContext.STYLE, val) ?? '';
        if (styles) {
            switch (getType(styles)) {
                case 'string':
                    return buildMapFromList(buildRawList(styles), sanitizer);
                case 'array':
                    return buildMapFromList(styles, sanitizer);
                case 'set':
                    return buildMapFromSet(styles, sanitizer);
                default:
                    return buildMapFromSet(styles, sanitizer);
            }
        }
        return {};
    }
    // ******************************************************************
    // Lifecycle Hooks
    // ******************************************************************
    /** For ChangeDetectionStrategy.onPush and ngOnChanges() updates */
    ngDoCheck() {
        this.ngStyleInstance.ngDoCheck();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StyleDirective, deps: [{ token: i0.ElementRef }, { token: i1.StyleUtils }, { token: i1.MediaMarshaller }, { token: i2.DomSanitizer }, { token: i0.KeyValueDiffers }, { token: i0.Renderer2 }, { token: i3.NgStyle, optional: true, self: true }, { token: SERVER_TOKEN }, { token: PLATFORM_ID }], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: StyleDirective, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StyleDirective, decorators: [{
            type: Directive
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.StyleUtils }, { type: i1.MediaMarshaller }, { type: i2.DomSanitizer }, { type: i0.KeyValueDiffers }, { type: i0.Renderer2 }, { type: i3.NgStyle, decorators: [{
                    type: Optional
                }, {
                    type: Self
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [SERVER_TOKEN]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }] });
const inputs = [
    'ngStyle',
    'ngStyle.xs',
    'ngStyle.sm',
    'ngStyle.md',
    'ngStyle.lg',
    'ngStyle.xl',
    'ngStyle.lt-sm',
    'ngStyle.lt-md',
    'ngStyle.lt-lg',
    'ngStyle.lt-xl',
    'ngStyle.gt-xs',
    'ngStyle.gt-sm',
    'ngStyle.gt-md',
    'ngStyle.gt-lg',
];
const selector = `
  [ngStyle],
  [ngStyle.xs], [ngStyle.sm], [ngStyle.md], [ngStyle.lg], [ngStyle.xl],
  [ngStyle.lt-sm], [ngStyle.lt-md], [ngStyle.lt-lg], [ngStyle.lt-xl],
  [ngStyle.gt-xs], [ngStyle.gt-sm], [ngStyle.gt-md], [ngStyle.gt-lg]
`;
/**
 * Directive to add responsive support for ngStyle.
 *
 */
export class DefaultStyleDirective extends StyleDirective {
    constructor() {
        super(...arguments);
        this.inputs = inputs;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultStyleDirective, deps: null, target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "18.1.0", type: DefaultStyleDirective, selector: "\n  [ngStyle],\n  [ngStyle.xs], [ngStyle.sm], [ngStyle.md], [ngStyle.lg], [ngStyle.xl],\n  [ngStyle.lt-sm], [ngStyle.lt-md], [ngStyle.lt-lg], [ngStyle.lt-xl],\n  [ngStyle.gt-xs], [ngStyle.gt-sm], [ngStyle.gt-md], [ngStyle.gt-lg]\n", inputs: { ngStyle: "ngStyle", "ngStyle.xs": "ngStyle.xs", "ngStyle.sm": "ngStyle.sm", "ngStyle.md": "ngStyle.md", "ngStyle.lg": "ngStyle.lg", "ngStyle.xl": "ngStyle.xl", "ngStyle.lt-sm": "ngStyle.lt-sm", "ngStyle.lt-md": "ngStyle.lt-md", "ngStyle.lt-lg": "ngStyle.lt-lg", "ngStyle.lt-xl": "ngStyle.lt-xl", "ngStyle.gt-xs": "ngStyle.gt-xs", "ngStyle.gt-sm": "ngStyle.gt-sm", "ngStyle.gt-md": "ngStyle.gt-md", "ngStyle.gt-lg": "ngStyle.gt-lg" }, usesInheritance: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: DefaultStyleDirective, decorators: [{
            type: Directive,
            args: [{ selector, inputs }]
        }] });
/** Build a styles map from a list of styles, while sanitizing bad values first */
function buildMapFromList(styles, sanitize) {
    const sanitizeValue = (it) => {
        if (sanitize) {
            it.value = sanitize(it.value);
        }
        return it;
    };
    return styles
        .map(stringToKeyValue)
        .filter((entry) => !!entry)
        .map(sanitizeValue)
        .reduce(keyValuesToMap, {});
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2V4dGVuZGVkL3N0eWxlL3N0eWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUM1RCxPQUFPLEVBQ0wsU0FBUyxFQUdULE1BQU0sRUFFTixRQUFRLEVBQ1IsV0FBVyxFQUVYLGVBQWUsRUFDZixJQUFJLEdBQ0wsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUNMLGNBQWMsRUFFZCxZQUFZLEdBRWIsTUFBTSw0QkFBNEIsQ0FBQztBQUVwQyxPQUFPLEVBQ0wsZUFBZSxFQUNmLFlBQVksRUFDWixPQUFPLEVBQ1AsY0FBYyxFQU1kLGdCQUFnQixHQUNqQixNQUFNLG9CQUFvQixDQUFDOzs7OztBQUc1QixNQUFNLE9BQU8sY0FBZSxTQUFRLGNBQWM7SUFLaEQsWUFDRSxVQUFzQixFQUN0QixNQUFrQixFQUNsQixPQUF3QixFQUNkLFNBQXVCLEVBQ2pDLE9BQXdCLEVBQ3hCLFNBQW9CLEVBQ2lCLGVBQXdCLEVBQ3ZDLFlBQXFCLEVBQ3RCLFVBQWtCO1FBRXZDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztRQVBoQyxjQUFTLEdBQVQsU0FBUyxDQUFjO1FBR0ksb0JBQWUsR0FBZixlQUFlLENBQVM7UUFYNUMsa0JBQWEsR0FBRyxTQUFTLENBQUM7UUFnQjNDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDMUIsa0ZBQWtGO1lBQ2xGLHNGQUFzRjtZQUN0RixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksT0FBTyxDQUFDLFVBQVUsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDckUsQ0FBQztRQUNELElB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OzJGQUFyQixxQkFBcUI7a0JBRGpDLFNBQVM7bUJBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFOztBQUsvQixrRkFBa0Y7QUFDbEYsU0FBUyxnQkFBZ0IsQ0FDdkIsTUFBc0IsRUFDdEIsUUFBMkI7SUFFM0IsTUFBTSxhQUFhLEdBQUcsQ0FBQyxFQUFtQixFQUFFLEVBQUU7UUFDNUMsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNiLEVBQUUsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDLENBQUM7SUFFRixPQUFPLE1BQU07U0FDVixHQUFHLENBQUMsZ0JBQWdCLENBQUM7U0FDckIsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1NBQzFCLEdBQUcsQ0FBQyxhQUFhLENBQUM7U0FDbEIsTUFBTSxDQUFDLGNBQWMsRUFBRSxFQUFnQixDQUFDLENBQUM7QUFDOUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgaXNQbGF0Zm9ybVNlcnZlciwgTmdTdHlsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBEaXJlY3RpdmUsXG4gIERvQ2hlY2ssXG4gIEVsZW1lbnRSZWYsXG4gIEluamVjdCxcbiAgS2V5VmFsdWVEaWZmZXJzLFxuICBPcHRpb25hbCxcbiAgUExBVEZPUk1fSUQsXG4gIFJlbmRlcmVyMixcbiAgU2VjdXJpdHlDb250ZXh0LFxuICBTZWxmLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IERvbVNhbml0aXplciB9IGZyb20gJ0Bhbmd1bGFyL3BsYXRmb3JtLWJyb3dzZXInO1xuaW1wb3J0IHtcbiAgQmFzZURpcmVjdGl2ZTIsXG4gIE1lZGlhTWFyc2hhbGxlcixcbiAgU0VSVkVSX1RPS0VOLFxuICBTdHlsZVV0aWxzLFxufSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvY29yZSc7XG5cbmltcG9ydCB7XG4gIGJ1aWxkTWFwRnJvbVNldCxcbiAgYnVpbGRSYXdMaXN0LFxuICBnZXRUeXBlLFxuICBrZXlWYWx1ZXNUb01hcCxcbiAgTmdTdHlsZUtleVZhbHVlLFxuICBOZ1N0eWxlTWFwLFxuICBOZ1N0eWxlUmF3TGlzdCxcbiAgTmdTdHlsZVNhbml0aXplcixcbiAgTmdTdHlsZVR5cGUsXG4gIHN0cmluZ1RvS2V5VmFsdWUsXG59IGZyb20gJy4vc3R5bGUtdHJhbnNmb3Jtcyc7XG5cbkBEaXJlY3RpdmUoKVxuZXhwb3J0IGNsYXNzIFN0eWxlRGlyZWN0aXZlIGV4dGVuZHMgQmFzZURpcmVjdGl2ZTIgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIERJUkVDVElWRV9LRVkgPSAnbmdTdHlsZSc7XG4gIHByb3RlY3RlZCBmYWxsYmFja1N0eWxlczogTmdTdHlsZU1hcDtcbiAgcHJvdGVjdGVkIGlzU2VydmVyOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXG4gICAgc3R5bGVyOiBTdHlsZVV0aWxzLFxuICAgIG1hcnNoYWw6IE1lZGlhTWFyc2hhbGxlcixcbiAgICBwcm90ZWN0ZWQgc2FuaXRpemVyOiBEb21TYW5pdGl6ZXIsXG4gICAgZGlmZmVyczogS2V5VmFsdWVEaWZmZXJzLFxuICAgIHJlbmRlcmVyMjogUmVuZGVyZXIyLFxuICAgIEBPcHRpb25hbCgpIEBTZWxmKCkgcHJpdmF0ZSByZWFkb25seSBuZ1N0eWxlSW5zdGFuY2U6IE5nU3R5bGUsXG4gICAgQEluamVjdChTRVJWRVJfVE9LRU4pIHNlcnZlckxvYWRlZDogYm9vbGVhbixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwbGF0Zm9ybUlkOiBPYmplY3RcbiAgKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgbnVsbCEsIHN0eWxlciwgbWFyc2hhbCk7XG4gICAgaWYgKCF0aGlzLm5nU3R5bGVJbnN0YW5jZSkge1xuICAgICAgLy8gQ3JlYXRlIGFuIGluc3RhbmNlIE5nU3R5bGUgRGlyZWN0aXZlIGluc3RhbmNlIG9ubHkgaWYgYG5nU3R5bGU9XCJcImAgaGFzIE5PVCBiZWVuXG4gICAgICAvLyBkZWZpbmVkIG9uIHRoZSBzYW1lIGhvc3QgZWxlbWVudDsgc2luY2UgdGhlIHJlc3BvbnNpdmUgdmFyaWF0aW9ucyBtYXkgYmUgZGVmaW5lZC4uLlxuICAgICAgdGhpcy5uZ1N0eWxlSW5zdGFuY2UgPSBuZXcgTmdTdHlsZShlbGVtZW50UmVmLCBkaWZmZXJzLCByZW5kZXJlcjIpO1xuICAgIH1cbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzdHlsZScpID8/ICcnO1xuICAgIHRoaXMuZmFsbGJhY2tTdHlsZXMgPSB0aGlzLmJ1aWxkU3R5bGVNYXAoc3R5bGVzKTtcbiAgICB0aGlzLmlzU2VydmVyID0gc2VydmVyTG9hZGVkICYmIGlzUGxhdGZvcm1TZXJ2ZXIocGxhdGZvcm1JZCk7XG4gIH1cblxuICAvKiogQWRkIGdlbmVyYXRlZCBzdHlsZXMgKi9cbiAgcHJvdGVjdGVkIG92ZXJyaWRlIHVwZGF0ZVdpdGhWYWx1ZSh2YWx1ZTogYW55KSB7XG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5idWlsZFN0eWxlTWFwKHZhbHVlKTtcbiAgICB0aGlzLm5nU3R5bGVJbnN0YW5jZS5uZ1N0eWxlID0geyAuLi50aGlzLmZhbGxiYWNrU3R5bGVzLCAuLi5zdHlsZXMgfTtcbiAgICBpZiAodGhpcy5pc1NlcnZlcikge1xuICAgICAgdGhpcy5hcHBseVN0eWxlVG9FbGVtZW50KHN0eWxlcyk7XG4gICAgfVxuICAgIHRoaXMubmdTdHlsZUluc3RhbmNlLm5nRG9DaGVjaygpO1xuICB9XG5cbiAgLyoqIFJlbW92ZSBnZW5lcmF0ZWQgc3R5bGVzICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBjbGVhclN0eWxlcygpIHtcbiAgICB0aGlzLm5nU3R5bGVJbnN0YW5jZS5uZ1N0eWxlID0gdGhpcy5mYWxsYmFja1N0eWxlcztcbiAgICB0aGlzLm5nU3R5bGVJbnN0YW5jZS5uZ0RvQ2hlY2soKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHJhdyBzdHJpbmdzIHRvIG5nU3R5bGVNYXA7IHdoaWNoIGlzIHJlcXVpcmVkIGJ5IG5nU3R5bGVcbiAgICogTk9URTogUmF3IHN0cmluZyBrZXktdmFsdWUgcGFpcnMgTVVTVCBiZSBkZWxpbWl0ZWQgYnkgYDtgXG4gICAqICAgICAgIENvbW1hLWRlbGltaXRlcnMgYXJlIG5vdCBzdXBwb3J0ZWQgZHVlIHRvIGNvbXBsZXhpdGllcyBvZlxuICAgKiAgICAgICBwb3NzaWJsZSBzdHlsZSB2YWx1ZXMgc3VjaCBhcyBgcmdiYSh4LHgseCx4KWAgYW5kIG90aGVyc1xuICAgKi9cbiAgcHJvdGVjdGVkIGJ1aWxkU3R5bGVNYXAoc3R5bGVzOiBOZ1N0eWxlVHlwZSk6IE5nU3R5bGVNYXAge1xuICAgIC8vIEFsd2F5cyBzYWZlLWd1YXJkIChha2Egc2FuaXRpemUpIHN0eWxlIHByb3BlcnR5IHZhbHVlc1xuICAgIGNvbnN0IHNhbml0aXplcjogTmdTdHlsZVNhbml0aXplciA9ICh2YWw6IGFueSkgPT5cbiAgICAgIHRoaXMuc2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5TVFlMRSwgdmFsKSA/PyAnJztcbiAgICBpZiAoc3R5bGVzKSB7XG4gICAgICBzd2l0Y2ggKGdldFR5cGUoc3R5bGVzKSkge1xuICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgIHJldHVybiBidWlsZE1hcEZyb21MaXN0KGJ1aWxkUmF3TGlzdChzdHlsZXMpLCBzYW5pdGl6ZXIpO1xuICAgICAgICBjYXNlICdhcnJheSc6XG4gICAgICAgICAgcmV0dXJuIGJ1aWxkTWFwRnJvbUxpc3Qoc3R5bGVzIGFzIE5nU3R5bGVSYXdMaXN0LCBzYW5pdGl6ZXIpO1xuICAgICAgICBjYXNlICdzZXQnOlxuICAgICAgICAgIHJldHVybiBidWlsZE1hcEZyb21TZXQoc3R5bGVzLCBzYW5pdGl6ZXIpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBidWlsZE1hcEZyb21TZXQoc3R5bGVzLCBzYW5pdGl6ZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7fTtcbiAgfVxuXG4gIC8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICAvLyBMaWZlY3ljbGUgSG9va3NcbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgLyoqIEZvciBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5vblB1c2ggYW5kIG5nT25DaGFuZ2VzKCkgdXBkYXRlcyAqL1xuICBuZ0RvQ2hlY2soKSB7XG4gICAgdGhpcy5uZ1N0eWxlSW5zdGFuY2UubmdEb0NoZWNrKCk7XG4gIH1cbn1cblxuY29uc3QgaW5wdXRzID0gW1xuICAnbmdTdHlsZScsXG4gICduZ1N0eWxlLnhzJyxcbiAgJ25nU3R5bGUuc20nLFxuICAnbmdTdHlsZS5tZCcsXG4gICduZ1N0eWxlLmxnJyxcbiAgJ25nU3R5bGUueGwnLFxuICAnbmdTdHlsZS5sdC1zbScsXG4gICduZ1N0eWxlLmx0LW1kJyxcbiAgJ25nU3R5bGUubHQtbGcnLFxuICAnbmdTdHlsZS5sdC14bCcsXG4gICduZ1N0eWxlLmd0LXhzJyxcbiAgJ25nU3R5bGUuZ3Qtc20nLFxuICAnbmdTdHlsZS5ndC1tZCcsXG4gICduZ1N0eWxlLmd0LWxnJyxcbl07XG5cbmNvbnN0IHNlbGVjdG9yID0gYFxuICBbbmdTdHlsZV0sXG4gIFtuZ1N0eWxlLnhzXSwgW25nU3R5bGUuc21dLCBbbmdTdHlsZS5tZF0sIFtuZ1N0eWxlLmxnXSwgW25nU3R5bGUueGxdLFxuICBbbmdTdHlsZS5sdC1zbV0sIFtuZ1N0eWxlLmx0LW1kXSwgW25nU3R5bGUubHQtbGddLCBbbmdTdHlsZS5sdC14bF0sXG4gIFtuZ1N0eWxlLmd0LXhzXSwgW25nU3R5bGUuZ3Qtc21dLCBbbmdTdHlsZS5ndC1tZF0sIFtuZ1N0eWxlLmd0LWxnXVxuYDtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdG8gYWRkIHJlc3BvbnNpdmUgc3VwcG9ydCBmb3IgbmdTdHlsZS5cbiAqXG4gKi9cbkBEaXJlY3RpdmUoeyBzZWxlY3RvciwgaW5wdXRzIH0pXG5leHBvcnQgY2xhc3MgRGVmYXVsdFN0eWxlRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGVEaXJlY3RpdmUgaW1wbGVtZW50cyBEb0NoZWNrIHtcbiAgcHJvdGVjdGVkIG92ZXJyaWRlIGlucHV0cyA9IGlucHV0cztcbn1cblxuLyoqIEJ1aWxkIGEgc3R5bGVzIG1hcCBmcm9tIGEgbGlzdCBvZiBzdHlsZXMsIHdoaWxlIHNhbml0aXppbmcgYmFkIHZhbHVlcyBmaXJzdCAqL1xuZnVuY3Rpb24gYnVpbGRNYXBGcm9tTGlzdChcbiAgc3R5bGVzOiBOZ1N0eWxlUmF3TGlzdCxcbiAgc2FuaXRpemU/OiBOZ1N0eWxlU2FuaXRpemVyXG4pOiBOZ1N0eWxlTWFwIHtcbiAgY29uc3Qgc2FuaXRpemVWYWx1ZSA9IChpdDogTmdTdHlsZUtleVZhbHVlKSA9PiB7XG4gICAgaWYgKHNhbml0aXplKSB7XG4gICAgICBpdC52YWx1ZSA9IHNhbml0aXplKGl0LnZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIGl0O1xuICB9O1xuXG4gIHJldHVybiBzdHlsZXNcbiAgICAubWFwKHN0cmluZ1RvS2V5VmFsdWUpXG4gICAgLmZpbHRlcigoZW50cnkpID0+ICEhZW50cnkpXG4gICAgLm1hcChzYW5pdGl6ZVZhbHVlKVxuICAgIC5yZWR1Y2Uoa2V5VmFsdWVzVG9NYXAsIHt9IGFzIE5nU3R5bGVNYXApO1xufVxuIl19