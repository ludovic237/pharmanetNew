/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Utility to emulate a CSS stylesheet
 *
 * This utility class stores all of the styles for a given HTML element
 * as a readonly `stylesheet` map.
 */
export class StylesheetMap {
    constructor() {
        this.stylesheet = new Map();
    }
    /**
     * Add an individual style to an HTML element
     */
    addStyleToElement(element, style, value) {
        const stylesheet = this.stylesheet.get(element);
        if (stylesheet) {
            stylesheet.set(style, value);
        }
        else {
            this.stylesheet.set(element, new Map([[style, value]]));
        }
    }
    /**
     * Clear the virtual stylesheet
     */
    clearStyles() {
        this.stylesheet.clear();
    }
    /**
     * Retrieve a given style for an HTML element
     */
    getStyleForElement(el, styleName) {
        const styles = this.stylesheet.get(el);
        let value = '';
        if (styles) {
            const style = styles.get(styleName);
            if (typeof style === 'number' || typeof style === 'string') {
                value = style + '';
            }
        }
        return value;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StylesheetMap, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StylesheetMap, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StylesheetMap, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVzaGVldC1tYXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2NvcmUvc3R5bGVzaGVldC1tYXAvc3R5bGVzaGVldC1tYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFFekM7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sYUFBYTtJQUQxQjtRQUdXLGVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBMkMsQ0FBQztLQW1DMUU7SUFqQ0M7O09BRUc7SUFDSCxpQkFBaUIsQ0FBQyxPQUFvQixFQUFFLEtBQWEsRUFBRSxLQUFvQjtRQUN6RSxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2YsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0IsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMxRCxDQUFDO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVztRQUNULElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVEOztPQUVHO0lBQ0gsa0JBQWtCLENBQUMsRUFBZSxFQUFFLFNBQWlCO1FBQ25ELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO2dCQUMzRCxLQUFLLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQztZQUNyQixDQUFDO1FBQ0gsQ0FBQztRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQzs4R0FwQ1UsYUFBYTtrSEFBYixhQUFhLGNBREQsTUFBTTs7MkZBQ2xCLGFBQWE7a0JBRHpCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG4vKipcbiAqIFV0aWxpdHkgdG8gZW11bGF0ZSBhIENTUyBzdHlsZXNoZWV0XG4gKlxuICogVGhpcyB1dGlsaXR5IGNsYXNzIHN0b3JlcyBhbGwgb2YgdGhlIHN0eWxlcyBmb3IgYSBnaXZlbiBIVE1MIGVsZW1lbnRcbiAqIGFzIGEgcmVhZG9ubHkgYHN0eWxlc2hlZXRgIG1hcC5cbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgU3R5bGVzaGVldE1hcCB7XG5cbiAgcmVhZG9ubHkgc3R5bGVzaGVldCA9IG5ldyBNYXA8SFRNTEVsZW1lbnQsIE1hcDxzdHJpbmcsIHN0cmluZ3xudW1iZXI+PigpO1xuXG4gIC8qKlxuICAgKiBBZGQgYW4gaW5kaXZpZHVhbCBzdHlsZSB0byBhbiBIVE1MIGVsZW1lbnRcbiAgICovXG4gIGFkZFN0eWxlVG9FbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzdHlsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfG51bWJlcikge1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSB0aGlzLnN0eWxlc2hlZXQuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChzdHlsZXNoZWV0KSB7XG4gICAgICBzdHlsZXNoZWV0LnNldChzdHlsZSwgdmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0eWxlc2hlZXQuc2V0KGVsZW1lbnQsIG5ldyBNYXAoW1tzdHlsZSwgdmFsdWVdXSkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDbGVhciB0aGUgdmlydHVhbCBzdHlsZXNoZWV0XG4gICAqL1xuICBjbGVhclN0eWxlcygpIHtcbiAgICB0aGlzLnN0eWxlc2hlZXQuY2xlYXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSBhIGdpdmVuIHN0eWxlIGZvciBhbiBIVE1MIGVsZW1lbnRcbiAgICovXG4gIGdldFN0eWxlRm9yRWxlbWVudChlbDogSFRNTEVsZW1lbnQsIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBzdHlsZXMgPSB0aGlzLnN0eWxlc2hlZXQuZ2V0KGVsKTtcbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBpZiAoc3R5bGVzKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHN0eWxlcy5nZXQoc3R5bGVOYW1lKTtcbiAgICAgIGlmICh0eXBlb2Ygc3R5bGUgPT09ICdudW1iZXInIHx8IHR5cGVvZiBzdHlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdmFsdWUgPSBzdHlsZSArICcnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbn1cbiJdfQ==