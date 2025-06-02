/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { applyCssPrefixes } from '@ngbracket/ngx-layout/_private-utils';
import { LAYOUT_CONFIG } from '../tokens/library-config';
import { SERVER_TOKEN } from '../tokens/server-token';
import * as i0 from "@angular/core";
import * as i1 from "../stylesheet-map/stylesheet-map";
export class StyleUtils {
    constructor(_serverStylesheet, _serverModuleLoaded, _platformId, layoutConfig) {
        this._serverStylesheet = _serverStylesheet;
        this._serverModuleLoaded = _serverModuleLoaded;
        this._platformId = _platformId;
        this.layoutConfig = layoutConfig;
    }
    /**
     * Applies styles given via string pair or object map to the directive element
     */
    applyStyleToElement(element, style, value = null) {
        let styles = {};
        if (typeof style === 'string') {
            styles[style] = value;
            style = styles;
        }
        styles = this.layoutConfig.disableVendorPrefixes
            ? style
            : applyCssPrefixes(style);
        this._applyMultiValueStyleToElement(styles, element);
    }
    /**
     * Applies styles given via string pair or object map to the directive's element
     */
    applyStyleToElements(style, elements = []) {
        const styles = this.layoutConfig.disableVendorPrefixes
            ? style
            : applyCssPrefixes(style);
        elements.forEach((el) => {
            this._applyMultiValueStyleToElement(styles, el);
        });
    }
    /**
     * Determine the DOM element's Flexbox flow (flex-direction)
     *
     * Check inline style first then check computed (stylesheet) style
     */
    getFlowDirection(target) {
        const query = 'flex-direction';
        let value = this.lookupStyle(target, query);
        const hasInlineValue = this.lookupInlineStyle(target, query) ||
            (isPlatformServer(this._platformId) && this._serverModuleLoaded)
            ? value
            : '';
        return [value || 'row', hasInlineValue];
    }
    hasWrap(target) {
        const query = 'flex-wrap';
        return this.lookupStyle(target, query) === 'wrap';
    }
    /**
     * Find the DOM element's raw attribute value (if any)
     */
    lookupAttributeValue(element, attribute) {
        return element.getAttribute(attribute) ?? '';
    }
    /**
     * Find the DOM element's inline style value (if any)
     */
    lookupInlineStyle(element, styleName) {
        return isPlatformBrowser(this._platformId)
            ? element.style.getPropertyValue(styleName)
            : getServerStyle(element, styleName);
    }
    /**
     * Determine the inline or inherited CSS style
     * NOTE: platform-server has no implementation for getComputedStyle
     */
    lookupStyle(element, styleName, inlineOnly = false) {
        let value = '';
        if (element) {
            let immediateValue = (value = this.lookupInlineStyle(element, styleName));
            if (!immediateValue) {
                if (isPlatformBrowser(this._platformId)) {
                    if (!inlineOnly) {
                        value = getComputedStyle(element).getPropertyValue(styleName);
                    }
                }
                else {
                    if (this._serverModuleLoaded) {
                        value = this._serverStylesheet.getStyleForElement(element, styleName);
                    }
                }
            }
        }
        // Note: 'inline' is the default of all elements, unless UA stylesheet overrides;
        //       in which case getComputedStyle() should determine a valid value.
        return value ? value.trim() : '';
    }
    /**
     * Applies the styles to the element. The styles object map may contain an array of values
     * Each value will be added as element style
     * Keys are sorted to add prefixed styles (like -webkit-x) first, before the standard ones
     */
    _applyMultiValueStyleToElement(styles, element) {
        Object.keys(styles)
            .sort()
            .forEach((key) => {
            const el = styles[key];
            const values = Array.isArray(el)
                ? el
                : [el];
            values.sort();
            for (let value of values) {
                value = value ? value + '' : '';
                if (isPlatformBrowser(this._platformId) ||
                    !this._serverModuleLoaded) {
                    isPlatformBrowser(this._platformId)
                        ? element.style.setProperty(key, value)
                        : setServerStyle(element, key, value);
                }
                else {
                    this._serverStylesheet.addStyleToElement(element, key, value);
                }
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StyleUtils, deps: [{ token: i1.StylesheetMap }, { token: SERVER_TOKEN }, { token: PLATFORM_ID }, { token: LAYOUT_CONFIG }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StyleUtils, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: StyleUtils, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.StylesheetMap }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [SERVER_TOKEN]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }] });
function getServerStyle(element, styleName) {
    const styleMap = readStyleAttribute(element);
    return styleMap[styleName] ?? '';
}
function setServerStyle(element, styleName, styleValue) {
    styleName = styleName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const styleMap = readStyleAttribute(element);
    styleMap[styleName] = styleValue ?? '';
    writeStyleAttribute(element, styleMap);
}
function writeStyleAttribute(element, styleMap) {
    let styleAttrValue = '';
    for (const key in styleMap) {
        const newValue = styleMap[key];
        if (newValue) {
            styleAttrValue += `${key}:${styleMap[key]};`;
        }
    }
    element.setAttribute('style', styleAttrValue);
}
function readStyleAttribute(element) {
    const styleMap = {};
    const styleAttribute = element.getAttribute('style');
    if (styleAttribute) {
        const styleList = styleAttribute.split(/;+/g);
        for (let i = 0; i < styleList.length; i++) {
            const style = styleList[i].trim();
            if (style.length > 0) {
                const colonIndex = style.indexOf(':');
                if (colonIndex === -1) {
                    throw new Error(`Invalid CSS style: ${style}`);
                }
                const name = style.substr(0, colonIndex).trim();
                styleMap[name] = style.substr(colonIndex + 1).trim();
            }
        }
    }
    return styleMap;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGUtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2NvcmUvc3R5bGUtdXRpbHMvc3R5bGUtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGdCQUFnQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdEUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWhFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNDQUFzQyxDQUFDO0FBRXhFLE9BQU8sRUFBdUIsYUFBYSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDOUUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLHdCQUF3QixDQUFDOzs7QUFHdEQsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFDVSxpQkFBZ0MsRUFDVixtQkFBNEIsRUFDN0IsV0FBbUIsRUFDakIsWUFBaUM7UUFIeEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFlO1FBQ1Ysd0JBQW1CLEdBQW5CLG1CQUFtQixDQUFTO1FBQzdCLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ2pCLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtJQUMvRCxDQUFDO0lBRUo7O09BRUc7SUFDSCxtQkFBbUIsQ0FDakIsT0FBb0IsRUFDcEIsS0FBK0IsRUFDL0IsUUFBZ0MsSUFBSTtRQUVwQyxJQUFJLE1BQU0sR0FBb0IsRUFBRSxDQUFDO1FBQ2pDLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDOUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUN0QixLQUFLLEdBQUcsTUFBTSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxxQkFBcUI7WUFDOUMsQ0FB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QUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQgeyBpc1BsYXRmb3JtQnJvd3NlciwgaXNQbGF0Zm9ybVNlcnZlciB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQgeyBJbmplY3QsIEluamVjdGFibGUsIFBMQVRGT1JNX0lEIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFwcGx5Q3NzUHJlZml4ZXMgfSBmcm9tICdAbmdicmFja2V0L25neC1sYXlvdXQvX3ByaXZhdGUtdXRpbHMnO1xuaW1wb3J0IHsgU3R5bGVzaGVldE1hcCB9IGZyb20gJy4uL3N0eWxlc2hlZXQtbWFwL3N0eWxlc2hlZXQtbWFwJztcbmltcG9ydCB7IExheW91dENvbmZpZ09wdGlvbnMsIExBWU9VVF9DT05GSUcgfSBmcm9tICcuLi90b2tlbnMvbGlicmFyeS1jb25maWcnO1xuaW1wb3J0IHsgU0VSVkVSX1RPS0VOIH0gZnJvbSAnLi4vdG9rZW5zL3NlcnZlci10b2tlbic7XG5cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgU3R5bGVVdGlscyB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgX3NlcnZlclN0eWxlc2hlZXQ6IFN0eWxlc2hlZXRNYXAsXG4gICAgQEluamVjdChTRVJWRVJfVE9LRU4pIHByaXZhdGUgX3NlcnZlck1vZHVsZUxvYWRlZDogYm9vbGVhbixcbiAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcml2YXRlIF9wbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgQEluamVjdChMQVlPVVRfQ09ORklHKSBwcml2YXRlIGxheW91dENvbmZpZzogTGF5b3V0Q29uZmlnT3B0aW9uc1xuICApIHt9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgc3R5bGVzIGdpdmVuIHZpYSBzdHJpbmcgcGFpciBvciBvYmplY3QgbWFwIHRvIHRoZSBkaXJlY3RpdmUgZWxlbWVudFxuICAgKi9cbiAgYXBwbHlTdHlsZVRvRWxlbWVudChcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBzdHlsZTogU3R5bGVEZWZpbml0aW9uIHwgc3RyaW5nLFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsID0gbnVsbFxuICApIHtcbiAgICBsZXQgc3R5bGVzOiBTdHlsZURlZmluaXRpb24gPSB7fTtcbiAgICBpZiAodHlwZW9mIHN0eWxlID09PSAnc3RyaW5nJykge1xuICAgICAgc3R5bGVzW3N0eWxlXSA9IHZhbHVlO1xuICAgICAgc3R5bGUgPSBzdHlsZXM7XG4gICAgfVxuICAgIHN0eWxlcyA9IHRoaXMubGF5b3V0Q29uZmlnLmRpc2FibGVWZW5kb3JQcmVmaXhlc1xuICAgICAgPyBzdHlsZVxuICAgICAgOiBhcHBseUNzc1ByZWZpeGVzKHN0eWxlKTtcbiAgICB0aGlzLl9hcHBseU11bHRpVmFsdWVTdHlsZVRvRWxlbWVudChzdHlsZXMsIGVsZW1lbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgc3R5bGVzIGdpdmVuIHZpYSBzdHJpbmcgcGFpciBvciBvYmplY3QgbWFwIHRvIHRoZSBkaXJlY3RpdmUncyBlbGVtZW50XG4gICAqL1xuICBhcHBseVN0eWxlVG9FbGVtZW50cyhzdHlsZTogU3R5bGVEZWZpbml0aW9uLCBlbGVtZW50czogSFRNTEVsZW1lbnRbXSA9IFtdKSB7XG4gICAgY29uc3Qgc3R5bGVzID0gdGhpcy5sYXlvdXRDb25maWcuZGlzYWJsZVZlbmRvclByZWZpeGVzXG4gICAgICA/IHN0eWxlXG4gICAgICA6IGFwcGx5Q3NzUHJlZml4ZXMoc3R5bGUpO1xuICAgIGVsZW1lbnRzLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICB0aGlzLl9hcHBseU11bHRpVmFsdWVTdHlsZVRvRWxlbWVudChzdHlsZXMsIGVsKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmUgdGhlIERPTSBlbGVtZW50J3MgRmxleGJveCBmbG93IChmbGV4LWRpcmVjdGlvbilcbiAgICpcbiAgICogQ2hlY2sgaW5saW5lIHN0eWxlIGZpcnN0IHRoZW4gY2hlY2sgY29tcHV0ZWQgKHN0eWxlc2hlZXQpIHN0eWxlXG4gICAqL1xuICBnZXRGbG93RGlyZWN0aW9uKHRhcmdldDogSFRNTEVsZW1lbnQpOiBbc3RyaW5nLCBzdHJpbmddIHtcbiAgICBjb25zdCBxdWVyeSA9ICdmbGV4LWRpcmVjdGlvbic7XG4gICAgbGV0IHZhbHVlID0gdGhpcy5sb29rdXBTdHlsZSh0YXJnZXQsIHF1ZXJ5KTtcbiAgICBjb25zdCBoYXNJbmxpbmVWYWx1ZSA9XG4gICAgICB0aGlzLmxvb2t1cElubGluZVN0eWxlKHRhcmdldCwgcXVlcnkpIHx8XG4gICAgICAoaXNQbGF0Zm9ybVNlcnZlcih0aGlzLl9wbGF0Zm9ybUlkKSAmJiB0aGlzLl9zZXJ2ZXJNb2R1bGVMb2FkZWQpXG4gICAgICAgID8gdmFsdWVcbiAgICAgICAgOiAnJztcblxuICAgIHJldHVybiBbdmFsdWUgfHwgJ3JvdycsIGhhc0lubGluZVZhbHVlXTtcbiAgfVxuXG4gIGhhc1dyYXAodGFyZ2V0OiBIVE1MRWxlbWVudCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHF1ZXJ5ID0gJ2ZsZXgtd3JhcCc7XG4gICAgcmV0dXJuIHRoaXMubG9va3VwU3R5bGUodGFyZ2V0LCBxdWVyeSkgPT09ICd3cmFwJztcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kIHRoZSBET00gZWxlbWVudCdzIHJhdyBhdHRyaWJ1dGUgdmFsdWUgKGlmIGFueSlcbiAgICovXG4gIGxvb2t1cEF0dHJpYnV0ZVZhbHVlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgPz8gJyc7XG4gIH1cblxuICAvKipcbiAgICogRmluZCB0aGUgRE9NIGVsZW1lbnQncyBpbmxpbmUgc3R5bGUgdmFsdWUgKGlmIGFueSlcbiAgICovXG4gIGxvb2t1cElubGluZVN0eWxlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBzdHlsZU5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMuX3BsYXRmb3JtSWQpXG4gICAgICA/IGVsZW1lbnQuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpXG4gICAgICA6IGdldFNlcnZlclN0eWxlKGVsZW1lbnQsIHN0eWxlTmFtZSk7XG4gIH1cblxuICAvKipcbiAgICogRGV0ZXJtaW5lIHRoZSBpbmxpbmUgb3IgaW5oZXJpdGVkIENTUyBzdHlsZVxuICAgKiBOT1RFOiBwbGF0Zm9ybS1zZXJ2ZXIgaGFzIG5vIGltcGxlbWVudGF0aW9uIGZvciBnZXRDb21wdXRlZFN0eWxlXG4gICAqL1xuICBsb29rdXBTdHlsZShcbiAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICBzdHlsZU5hbWU6IHN0cmluZyxcbiAgICBpbmxpbmVPbmx5ID0gZmFsc2VcbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgdmFsdWUgPSAnJztcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgbGV0IGltbWVkaWF0ZVZhbHVlID0gKHZhbHVlID0gdGhpcy5sb29rdXBJbmxpbmVTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpKTtcbiAgICAgIGlmICghaW1tZWRpYXRlVmFsdWUpIHtcbiAgICAgICAgaWYgKGlzUGxhdGZvcm1Ccm93c2VyKHRoaXMuX3BsYXRmb3JtSWQpKSB7XG4gICAgICAgICAgaWYgKCFpbmxpbmVPbmx5KSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGdldENvbXB1dGVkU3R5bGUoZWxlbWVudCkuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZU5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodGhpcy5fc2VydmVyTW9kdWxlTG9hZGVkKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMuX3NlcnZlclN0eWxlc2hlZXQuZ2V0U3R5bGVGb3JFbGVtZW50KFxuICAgICAgICAgICAgICBlbGVtZW50LFxuICAgICAgICAgICAgICBzdHlsZU5hbWVcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTm90ZTogJ2lubGluZScgaXMgdGhlIGRlZmF1bHQgb2YgYWxsIGVsZW1lbnRzLCB1bmxlc3MgVUEgc3R5bGVzaGVldCBvdmVycmlkZXM7XG4gICAgLy8gICAgICAgaW4gd2hpY2ggY2FzZSBnZXRDb21wdXRlZFN0eWxlKCkgc2hvdWxkIGRldGVybWluZSBhIHZhbGlkIHZhbHVlLlxuICAgIHJldHVybiB2YWx1ZSA/IHZhbHVlLnRyaW0oKSA6ICcnO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgdGhlIHN0eWxlcyB0byB0aGUgZWxlbWVudC4gVGhlIHN0eWxlcyBvYmplY3QgbWFwIG1heSBjb250YWluIGFuIGFycmF5IG9mIHZhbHVlc1xuICAgKiBFYWNoIHZhbHVlIHdpbGwgYmUgYWRkZWQgYXMgZWxlbWVudCBzdHlsZVxuICAgKiBLZXlzIGFyZSBzb3J0ZWQgdG8gYWRkIHByZWZpeGVkIHN0eWxlcyAobGlrZSAtd2Via2l0LXgpIGZpcnN0LCBiZWZvcmUgdGhlIHN0YW5kYXJkIG9uZXNcbiAgICovXG4gIHByaXZhdGUgX2FwcGx5TXVsdGlWYWx1ZVN0eWxlVG9FbGVtZW50KFxuICAgIHN0eWxlczogU3R5bGVEZWZpbml0aW9uLFxuICAgIGVsZW1lbnQ6IEhUTUxFbGVtZW50XG4gICkge1xuICAgIE9iamVjdC5rZXlzKHN0eWxlcylcbiAgICAgIC5zb3J0KClcbiAgICAgIC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSBzdHlsZXNba2V5XTtcbiAgICAgICAgY29uc3QgdmFsdWVzOiAoc3RyaW5nIHwgbnVtYmVyIHwgbnVsbClbXSA9IEFycmF5LmlzQXJyYXkoZWwpXG4gICAgICAgICAgPyBlbFxuICAgICAgICAgIDogW2VsXTtcbiAgICAgICAgdmFsdWVzLnNvcnQoKTtcbiAgICAgICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZSA/IHZhbHVlICsgJycgOiAnJztcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLl9wbGF0Zm9ybUlkKSB8fFxuICAgICAgICAgICAgIXRoaXMuX3NlcnZlck1vZHVsZUxvYWRlZFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5fcGxhdGZvcm1JZClcbiAgICAgICAgICAgICAgPyBlbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KGtleSwgdmFsdWUpXG4gICAgICAgICAgICAgIDogc2V0U2VydmVyU3R5bGUoZWxlbWVudCwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX3NlcnZlclN0eWxlc2hlZXQuYWRkU3R5bGVUb0VsZW1lbnQoZWxlbWVudCwga2V5LCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTZXJ2ZXJTdHlsZShlbGVtZW50OiBhbnksIHN0eWxlTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3Qgc3R5bGVNYXAgPSByZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gIHJldHVybiBzdHlsZU1hcFtzdHlsZU5hbWVdID8/ICcnO1xufVxuXG5mdW5jdGlvbiBzZXRTZXJ2ZXJTdHlsZShcbiAgZWxlbWVudDogYW55LFxuICBzdHlsZU5hbWU6IHN0cmluZyxcbiAgc3R5bGVWYWx1ZT86IHN0cmluZyB8IG51bGxcbikge1xuICBzdHlsZU5hbWUgPSBzdHlsZU5hbWUucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbiAgY29uc3Qgc3R5bGVNYXAgPSByZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudCk7XG4gIHN0eWxlTWFwW3N0eWxlTmFtZV0gPSBzdHlsZVZhbHVlID8/ICcnO1xuICB3cml0ZVN0eWxlQXR0cmlidXRlKGVsZW1lbnQsIHN0eWxlTWFwKTtcbn1cblxuZnVuY3Rpb24gd3JpdGVTdHlsZUF0dHJpYnV0ZShcbiAgZWxlbWVudDogYW55LFxuICBzdHlsZU1hcDogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH1cbikge1xuICBsZXQgc3R5bGVBdHRyVmFsdWUgPSAnJztcbiAgZm9yIChjb25zdCBrZXkgaW4gc3R5bGVNYXApIHtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHN0eWxlTWFwW2tleV07XG4gICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICBzdHlsZUF0dHJWYWx1ZSArPSBgJHtrZXl9OiR7c3R5bGVNYXBba2V5XX07YDtcbiAgICB9XG4gIH1cbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgc3R5bGVBdHRyVmFsdWUpO1xufVxuXG5mdW5jdGlvbiByZWFkU3R5bGVBdHRyaWJ1dGUoZWxlbWVudDogYW55KTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICBjb25zdCBzdHlsZU1hcDogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7fTtcbiAgY29uc3Qgc3R5bGVBdHRyaWJ1dGUgPSBlbGVtZW50LmdldEF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgaWYgKHN0eWxlQXR0cmlidXRlKSB7XG4gICAgY29uc3Qgc3R5bGVMaXN0ID0gc3R5bGVBdHRyaWJ1dGUuc3BsaXQoLzsrL2cpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3R5bGVMaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHN0eWxlTGlzdFtpXS50cmltKCk7XG4gICAgICBpZiAoc3R5bGUubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBjb2xvbkluZGV4ID0gc3R5bGUuaW5kZXhPZignOicpO1xuICAgICAgICBpZiAoY29sb25JbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgQ1NTIHN0eWxlOiAke3N0eWxlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWUgPSBzdHlsZS5zdWJzdHIoMCwgY29sb25JbmRleCkudHJpbSgpO1xuICAgICAgICBzdHlsZU1hcFtuYW1lXSA9IHN0eWxlLnN1YnN0cihjb2xvbkluZGV4ICsgMSkudHJpbSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gc3R5bGVNYXA7XG59XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGNzcyBzdHlsZS4gRWl0aGVyIGEgcHJvcGVydHkgbmFtZSAoZS5nLiBcImZsZXgtYmFzaXNcIikgb3IgYW4gb2JqZWN0XG4gKiBtYXAgb2YgcHJvcGVydHkgbmFtZSBhbmQgdmFsdWUgKGUuZy4ge2Rpc3BsYXk6ICdub25lJywgZmxleC1vcmRlcjogNX0pXG4gKi9cbmV4cG9ydCB0eXBlIFN0eWxlRGVmaW5pdGlvbiA9IHsgW3Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBudWxsIH07XG4iXX0=