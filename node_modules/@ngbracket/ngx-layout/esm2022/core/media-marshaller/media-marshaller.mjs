/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { sortDescendingPriority } from '../utils/sort';
import { mergeAlias } from '../add-alias';
import * as i0 from "@angular/core";
import * as i1 from "../match-media/match-media";
import * as i2 from "../breakpoints/break-point-registry";
import * as i3 from "./print-hook";
/**
 * MediaMarshaller - register responsive values from directives and
 *                   trigger them based on media query events
 */
export class MediaMarshaller {
    get activatedAlias() {
        return this.activatedBreakpoints[0]?.alias ?? '';
    }
    set activatedBreakpoints(bps) {
        this._activatedBreakpoints = [...bps];
    }
    get activatedBreakpoints() {
        return [...this._activatedBreakpoints];
    }
    set useFallbacks(value) {
        this._useFallbacks = value;
    }
    constructor(matchMedia, breakpoints, hook) {
        this.matchMedia = matchMedia;
        this.breakpoints = breakpoints;
        this.hook = hook;
        this._useFallbacks = true;
        this._activatedBreakpoints = [];
        this.elementMap = new Map();
        this.elementKeyMap = new WeakMap();
        this.watcherMap = new WeakMap(); // special triggers to update elements
        this.updateMap = new WeakMap(); // callback functions to update styles
        this.clearMap = new WeakMap(); // callback functions to clear styles
        this.subject = new Subject();
        this.observeActivations();
    }
    /**
     * Update styles on breakpoint activates or deactivates
     * @param mc
     */
    onMediaChange(mc) {
        const bp = this.findByQuery(mc.mediaQuery);
        if (bp) {
            mc = mergeAlias(mc, bp);
            const bpIndex = this.activatedBreakpoints.indexOf(bp);
            if (mc.matches && bpIndex === -1) {
                this._activatedBreakpoints.push(bp);
                this._activatedBreakpoints.sort(sortDescendingPriority);
                this.updateStyles();
            }
            else if (!mc.matches && bpIndex !== -1) {
                // Remove the breakpoint when it's deactivated
                this._activatedBreakpoints.splice(bpIndex, 1);
                this._activatedBreakpoints.sort(sortDescendingPriority);
                this.updateStyles();
            }
        }
    }
    /**
     * initialize the marshaller with necessary elements for delegation on an element
     * @param element
     * @param key
     * @param updateFn optional callback so that custom bp directives don't have to re-provide this
     * @param clearFn optional callback so that custom bp directives don't have to re-provide this
     * @param extraTriggers other triggers to force style updates (e.g. layout, directionality, etc)
     */
    init(element, key, updateFn, clearFn, extraTriggers = []) {
        initBuilderMap(this.updateMap, element, key, updateFn);
        initBuilderMap(this.clearMap, element, key, clearFn);
        this.buildElementKeyMap(element, key);
        this.watchExtraTriggers(element, key, extraTriggers);
    }
    /**
     * get the value for an element and key and optionally a given breakpoint
     * @param element
     * @param key
     * @param bp
     */
    getValue(element, key, bp) {
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            const values = bp !== undefined ? bpMap.get(bp) : this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key);
            }
        }
        return undefined;
    }
    /**
     * whether the element has values for a given key
     * @param element
     * @param key
     */
    hasValue(element, key) {
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            const values = this.getActivatedValues(bpMap, key);
            if (values) {
                return values.get(key) !== undefined || false;
            }
        }
        return false;
    }
    /**
     * Set the value for an input on a directive
     * @param element the element in question
     * @param key the type of the directive (e.g. flex, layout-gap, etc)
     * @param bp the breakpoint suffix (empty string = default)
     * @param val the value for the breakpoint
     */
    setValue(element, key, val, bp) {
        let bpMap = this.elementMap.get(element);
        if (!bpMap) {
            bpMap = new Map().set(bp, new Map().set(key, val));
            this.elementMap.set(element, bpMap);
        }
        else {
            const values = (bpMap.get(bp) ?? new Map()).set(key, val);
            bpMap.set(bp, values);
            this.elementMap.set(element, bpMap);
        }
        const value = this.getValue(element, key);
        if (value !== undefined) {
            this.updateElement(element, key, value);
        }
    }
    /** Track element value changes for a specific key */
    trackValue(element, key) {
        return this.subject
            .asObservable()
            .pipe(filter(v => v.element === element && v.key === key));
    }
    /** update all styles for all elements on the current breakpoint */
    updateStyles() {
        this.elementMap.forEach((bpMap, el) => {
            const keyMap = new Set(this.elementKeyMap.get(el));
            let valueMap = this.getActivatedValues(bpMap);
            if (valueMap) {
                valueMap.forEach((v, k) => {
                    this.updateElement(el, k, v);
                    keyMap.delete(k);
                });
            }
            keyMap.forEach(k => {
                valueMap = this.getActivatedValues(bpMap, k);
                if (valueMap) {
                    const value = valueMap.get(k);
                    this.updateElement(el, k, value);
                }
                else {
                    this.clearElement(el, k);
                }
            });
        });
    }
    /**
     * clear the styles for a given element
     * @param element
     * @param key
     */
    clearElement(element, key) {
        const builders = this.clearMap.get(element);
        if (builders) {
            const clearFn = builders.get(key);
            if (!!clearFn) {
                clearFn();
                this.subject.next({ element, key, value: '' });
            }
        }
    }
    /**
     * update a given element with the activated values for a given key
     * @param element
     * @param key
     * @param value
     */
    updateElement(element, key, value) {
        const builders = this.updateMap.get(element);
        if (builders) {
            const updateFn = builders.get(key);
            if (!!updateFn) {
                updateFn(value);
                this.subject.next({ element, key, value });
            }
        }
    }
    /**
     * release all references to a given element
     * @param element
     */
    releaseElement(element) {
        const watcherMap = this.watcherMap.get(element);
        if (watcherMap) {
            watcherMap.forEach(s => s.unsubscribe());
            this.watcherMap.delete(element);
        }
        const elementMap = this.elementMap.get(element);
        if (elementMap) {
            elementMap.forEach((_, s) => elementMap.delete(s));
            this.elementMap.delete(element);
        }
    }
    /**
     * trigger an update for a given element and key (e.g. layout)
     * @param element
     * @param key
     */
    triggerUpdate(element, key) {
        const bpMap = this.elementMap.get(element);
        if (bpMap) {
            const valueMap = this.getActivatedValues(bpMap, key);
            if (valueMap) {
                if (key) {
                    this.updateElement(element, key, valueMap.get(key));
                }
                else {
                    valueMap.forEach((v, k) => this.updateElement(element, k, v));
                }
            }
        }
    }
    /** Cross-reference for HTMLElement with directive key */
    buildElementKeyMap(element, key) {
        let keyMap = this.elementKeyMap.get(element);
        if (!keyMap) {
            keyMap = new Set();
            this.elementKeyMap.set(element, keyMap);
        }
        keyMap.add(key);
    }
    /**
     * Other triggers that should force style updates:
     * - directionality
     * - layout changes
     * - mutationobserver updates
     */
    watchExtraTriggers(element, key, triggers) {
        if (triggers && triggers.length) {
            let watchers = this.watcherMap.get(element);
            if (!watchers) {
                watchers = new Map();
                this.watcherMap.set(element, watchers);
            }
            const subscription = watchers.get(key);
            if (!subscription) {
                const newSubscription = merge(...triggers).subscribe(() => {
                    const currentValue = this.getValue(element, key);
                    this.updateElement(element, key, currentValue);
                });
                watchers.set(key, newSubscription);
            }
        }
    }
    /** Breakpoint locator by mediaQuery */
    findByQuery(query) {
        return this.breakpoints.findByQuery(query);
    }
    /**
     * get the fallback breakpoint for a given element, starting with the current breakpoint
     * @param bpMap
     * @param key
     */
    getActivatedValues(bpMap, key) {
        for (let i = 0; i < this.activatedBreakpoints.length; i++) {
            const activatedBp = this.activatedBreakpoints[i];
            const valueMap = bpMap.get(activatedBp.alias);
            if (valueMap) {
                if (key === undefined || (valueMap.has(key) && valueMap.get(key) != null)) {
                    return valueMap;
                }
            }
        }
        // On the server, we explicitly have an "all" section filled in to begin with.
        // So we don't need to aggressively find a fallback if no explicit value exists.
        if (!this._useFallbacks) {
            return undefined;
        }
        const lastHope = bpMap.get('');
        return (key === undefined || lastHope && lastHope.has(key)) ? lastHope : undefined;
    }
    /**
     * Watch for mediaQuery breakpoint activations
     */
    observeActivations() {
        const queries = this.breakpoints.items.map(bp => bp.mediaQuery);
        this.hook.registerBeforeAfterPrintHooks(this);
        this.matchMedia
            .observe(this.hook.withPrintQuery(queries))
            .pipe(tap(this.hook.interceptEvents(this)), filter(this.hook.blockPropagation()))
            .subscribe(this.onMediaChange.bind(this));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaMarshaller, deps: [{ token: i1.MatchMedia }, { token: i2.BreakPointRegistry }, { token: i3.PrintHook }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaMarshaller, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaMarshaller, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.MatchMedia }, { type: i2.BreakPointRegistry }, { type: i3.PrintHook }] });
function initBuilderMap(map, element, key, input) {
    if (input !== undefined) {
        const oldMap = map.get(element) ?? new Map();
        oldMap.set(key, input);
        map.set(element, oldMap);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbWFyc2hhbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvY29yZS9tZWRpYS1tYXJzaGFsbGVyL21lZGlhLW1hcnNoYWxsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUV6QyxPQUFPLEVBQUMsS0FBSyxFQUFjLE9BQU8sRUFBZSxNQUFNLE1BQU0sQ0FBQztBQUM5RCxPQUFPLEVBQUMsTUFBTSxFQUFFLEdBQUcsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRzNDLE9BQU8sRUFBQyxzQkFBc0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQU1yRCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sY0FBYyxDQUFDOzs7OztBQW9CeEM7OztHQUdHO0FBRUgsTUFBTSxPQUFPLGVBQWU7SUFXMUIsSUFBSSxjQUFjO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVELElBQUksb0JBQW9CLENBQUMsR0FBaUI7UUFDeEMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsSUFBSSxvQkFBb0I7UUFDdEIsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVELElBQUksWUFBWSxDQUFDLEtBQWM7UUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUM7SUFDN0IsQ0FBQztJQUVELFlBQXNCLFVBQXNCLEVBQ3RCLFdBQStCLEVBQy9CLElBQWU7UUFGZixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ3RCLGdCQUFXLEdBQVgsV0FBVyxDQUFvQjtRQUMvQixTQUFJ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Q0FBQyxDQUN2QzthQUNBLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ2hELENBQUM7OEdBalVVLGVBQWU7a0hBQWYsZUFBZSxjQURILE1BQU07OzJGQUNsQixlQUFlO2tCQUQzQixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7QUFzVWhDLFNBQVMsY0FBYyxDQUFDLEdBQWUsRUFDZixPQUFvQixFQUNwQixHQUFXLEVBQ1gsS0FBZTtJQUNyQyxJQUFJLEtBQUssS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUN4QixNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDN0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0IsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7bWVyZ2UsIE9ic2VydmFibGUsIFN1YmplY3QsIFN1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbHRlciwgdGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7QnJlYWtQb2ludH0gZnJvbSAnLi4vYnJlYWtwb2ludHMvYnJlYWstcG9pbnQnO1xuaW1wb3J0IHtzb3J0RGVzY2VuZGluZ1ByaW9yaXR5fSBmcm9tICcuLi91dGlscy9zb3J0JztcbmltcG9ydCB7QnJlYWtQb2ludFJlZ2lzdHJ5fSBmcm9tICcuLi9icmVha3BvaW50cy9icmVhay1wb2ludC1yZWdpc3RyeSc7XG5pbXBvcnQge01hdGNoTWVkaWF9IGZyb20gJy4uL21hdGNoLW1lZGlhL21hdGNoLW1lZGlhJztcbmltcG9ydCB7TWVkaWFDaGFuZ2V9IGZyb20gJy4uL21lZGlhLWNoYW5nZSc7XG5cbmltcG9ydCB7UHJpbnRIb29rLCBIb29rVGFyZ2V0fSBmcm9tICcuL3ByaW50LWhvb2snO1xuaW1wb3J0IHttZXJnZUFsaWFzfSBmcm9tICcuLi9hZGQtYWxpYXMnO1xuXG50eXBlIENsZWFyQ2FsbGJhY2sgPSAoKSA9PiB2b2lkO1xudHlwZSBVcGRhdGVDYWxsYmFjayA9ICh2YWw6IGFueSkgPT4gdm9pZDtcbnR5cGUgQnVpbGRlciA9IFVwZGF0ZUNhbGxiYWNrIHwgQ2xlYXJDYWxsYmFjaztcblxudHlwZSBWYWx1ZU1hcCA9IE1hcDxzdHJpbmcsIHN0cmluZz47XG50eXBlIEJyZWFrcG9pbnRNYXAgPSBNYXA8c3RyaW5nLCBWYWx1ZU1hcD47XG50eXBlIEVsZW1lbnRNYXAgPSBNYXA8SFRNTEVsZW1lbnQsIEJyZWFrcG9pbnRNYXA+O1xudHlwZSBFbGVtZW50S2V5TWFwID0gV2Vha01hcDxIVE1MRWxlbWVudCwgU2V0PHN0cmluZz4+O1xudHlwZSBTdWJzY3JpcHRpb25NYXAgPSBNYXA8c3RyaW5nLCBTdWJzY3JpcHRpb24+O1xudHlwZSBXYXRjaGVyTWFwID0gV2Vha01hcDxIVE1MRWxlbWVudCwgU3Vic2NyaXB0aW9uTWFwPjtcbnR5cGUgQnVpbGRlck1hcCA9IFdlYWtNYXA8SFRNTEVsZW1lbnQsIE1hcDxzdHJpbmcsIEJ1aWxkZXI+PjtcblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50TWF0Y2hlciB7XG4gIGVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBrZXk6IHN0cmluZztcbiAgdmFsdWU6IGFueTtcbn1cblxuLyoqXG4gKiBNZWRpYU1hcnNoYWxsZXIgLSByZWdpc3RlciByZXNwb25zaXZlIHZhbHVlcyBmcm9tIGRpcmVjdGl2ZXMgYW5kXG4gKiAgICAgICAgICAgICAgICAgICB0cmlnZ2VyIHRoZW0gYmFzZWQgb24gbWVkaWEgcXVlcnkgZXZlbnRzXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIE1lZGlhTWFyc2hhbGxlciB7XG4gIHByaXZhdGUgX3VzZUZhbGxiYWNrcyA9IHRydWU7XG4gIHByaXZhdGUgX2FjdGl2YXRlZEJyZWFrcG9pbnRzOiBCcmVha1BvaW50W10gPSBbXTtcbiAgcHJpdmF0ZSBlbGVtZW50TWFwOiBFbGVtZW50TWFwID0gbmV3IE1hcCgpO1xuICBwcml2YXRlIGVsZW1lbnRLZXlNYXA6IEVsZW1lbnRLZXlNYXAgPSBuZXcgV2Vha01hcCgpO1xuICBwcml2YXRlIHdhdGNoZXJNYXA6IFdhdGNoZXJNYXAgPSBuZXcgV2Vha01hcCgpOyAgICAgLy8gc3BlY2lhbCB0cmlnZ2VycyB0byB1cGRhdGUgZWxlbWVudHNcbiAgcHJpdmF0ZSB1cGRhdGVNYXA6IEJ1aWxkZXJNYXAgPSBuZXcgV2Vha01hcCgpOyAgICAgIC8vIGNhbGxiYWNrIGZ1bmN0aW9ucyB0byB1cGRhdGUgc3R5bGVzXG4gIHByaXZhdGUgY2xlYXJNYXA6IEJ1aWxkZXJNYXAgPSBuZXcgV2Vha01hcCgpOyAgICAgICAvLyBjYWxsYmFjayBmdW5jdGlvbnMgdG8gY2xlYXIgc3R5bGVzXG5cbiAgcHJpdmF0ZSBzdWJqZWN0OiBTdWJqZWN0PEVsZW1lbnRNYXRjaGVyPiA9IG5ldyBTdWJqZWN0KCk7XG5cbiAgZ2V0IGFjdGl2YXRlZEFsaWFzKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuYWN0aXZhdGVkQnJlYWtwb2ludHNbMF0/LmFsaWFzID8/ICcnO1xuICB9XG5cbiAgc2V0IGFjdGl2YXRlZEJyZWFrcG9pbnRzKGJwczogQnJlYWtQb2ludFtdKSB7XG4gICAgdGhpcy5fYWN0aXZhdGVkQnJlYWtwb2ludHMgPSBbLi4uYnBzXTtcbiAgfVxuXG4gIGdldCBhY3RpdmF0ZWRCcmVha3BvaW50cygpOiBCcmVha1BvaW50W10ge1xuICAgIHJldHVybiBbLi4udGhpcy5fYWN0aXZhdGVkQnJlYWtwb2ludHNdO1xuICB9XG5cbiAgc2V0IHVzZUZhbGxiYWNrcyh2YWx1ZTogYm9vbGVhbikge1xuICAgIHRoaXMuX3VzZUZhbGxiYWNrcyA9IHZhbHVlO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvdGVjdGVkIG1hdGNoTWVkaWE6IE1hdGNoTWVkaWEsXG4gICAgICAgICAgICAgIHByb3RlY3RlZCBicmVha3BvaW50czogQnJlYWtQb2ludFJlZ2lzdHJ5LFxuICAgICAgICAgICAgICBwcm90ZWN0ZWQgaG9vazogUHJpbnRIb29rKSB7XG4gICAgdGhpcy5vYnNlcnZlQWN0aXZhdGlvbnMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgc3R5bGVzIG9uIGJyZWFrcG9pbnQgYWN0aXZhdGVzIG9yIGRlYWN0aXZhdGVzXG4gICAqIEBwYXJhbSBtY1xuICAgKi9cbiAgb25NZWRpYUNoYW5nZShtYzogTWVkaWFDaGFuZ2UpIHtcbiAgICBjb25zdCBicDogQnJlYWtQb2ludCB8IG51bGwgPSB0aGlzLmZpbmRCeVF1ZXJ5KG1jLm1lZGlhUXVlcnkpO1xuXG4gICAgaWYgKGJwKSB7XG4gICAgICBtYyA9IG1lcmdlQWxpYXMobWMsIGJwKTtcblxuICAgICAgY29uc3QgYnBJbmRleCA9IHRoaXMuYWN0aXZhdGVkQnJlYWtwb2ludHMuaW5kZXhPZihicCk7XG5cbiAgICAgIGlmIChtYy5tYXRjaGVzICYmIGJwSW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRoaXMuX2FjdGl2YXRlZEJyZWFrcG9pbnRzLnB1c2goYnApO1xuICAgICAgICB0aGlzLl9hY3RpdmF0ZWRCcmVha3BvaW50cy5zb3J0KHNvcnREZXNjZW5kaW5nUHJpb3JpdHkpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKCk7XG4gICAgICB9IGVsc2UgaWYgKCFtYy5tYXRjaGVzICYmIGJwSW5kZXggIT09IC0xKSB7XG4gICAgICAgIC8vIFJlbW92ZSB0aGUgYnJlYWtwb2ludCB3aGVuIGl0J3MgZGVhY3RpdmF0ZWRcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVkQnJlYWtwb2ludHMuc3BsaWNlKGJwSW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl9hY3RpdmF0ZWRCcmVha3BvaW50cy5zb3J0KHNvcnREZXNjZW5kaW5nUHJpb3JpdHkpO1xuXG4gICAgICAgIHRoaXMudXBkYXRlU3R5bGVzKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGluaXRpYWxpemUgdGhlIG1hcnNoYWxsZXIgd2l0aCBuZWNlc3NhcnkgZWxlbWVudHMgZm9yIGRlbGVnYXRpb24gb24gYW4gZWxlbWVudFxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKiBAcGFyYW0ga2V5XG4gICAqIEBwYXJhbSB1cGRhdGVGbiBvcHRpb25hbCBjYWxsYmFjayBzbyB0aGF0IGN1c3RvbSBicCBkaXJlY3RpdmVzIGRvbid0IGhhdmUgdG8gcmUtcHJvdmlkZSB0aGlzXG4gICAqIEBwYXJhbSBjbGVhckZuIG9wdGlvbmFsIGNhbGxiYWNrIHNvIHRoYXQgY3VzdG9tIGJwIGRpcmVjdGl2ZXMgZG9uJ3QgaGF2ZSB0byByZS1wcm92aWRlIHRoaXNcbiAgICogQHBhcmFtIGV4dHJhVHJpZ2dlcnMgb3RoZXIgdHJpZ2dlcnMgdG8gZm9yY2Ugc3R5bGUgdXBkYXRlcyAoZS5nLiBsYXlvdXQsIGRpcmVjdGlvbmFsaXR5LCBldGMpXG4gICAqL1xuICBpbml0KGVsZW1lbnQ6IEhUTUxFbGVtZW50LFxuICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgIHVwZGF0ZUZuPzogVXBkYXRlQ2FsbGJhY2ssXG4gICAgICAgY2xlYXJGbj86IENsZWFyQ2FsbGJhY2ssXG4gICAgICAgZXh0cmFUcmlnZ2VyczogT2JzZXJ2YWJsZTxhbnk+W10gPSBbXSk6IHZvaWQge1xuXG4gICAgaW5pdEJ1aWxkZXJNYXAodGhpcy51cGRhdGVNYXAsIGVsZW1lbnQsIGtleSwgdXBkYXRlRm4pO1xuICAgIGluaXRCdWlsZGVyTWFwKHRoaXMuY2xlYXJNYXAsIGVsZW1lbnQsIGtleSwgY2xlYXJGbik7XG5cbiAgICB0aGlzLmJ1aWxkRWxlbWVudEtleU1hcChlbGVtZW50LCBrZXkpO1xuICAgIHRoaXMud2F0Y2hFeHRyYVRyaWdnZXJzKGVsZW1lbnQsIGtleSwgZXh0cmFUcmlnZ2Vycyk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0IHRoZSB2YWx1ZSBmb3IgYW4gZWxlbWVudCBhbmQga2V5IGFuZCBvcHRpb25hbGx5IGEgZ2l2ZW4gYnJlYWtwb2ludFxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKiBAcGFyYW0ga2V5XG4gICAqIEBwYXJhbSBicFxuICAgKi9cbiAgZ2V0VmFsdWUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCBicD86IHN0cmluZyk6IGFueSB7XG4gICAgY29uc3QgYnBNYXAgPSB0aGlzLmVsZW1lbnRNYXAuZ2V0KGVsZW1lbnQpO1xuICAgIGlmIChicE1hcCkge1xuICAgICAgY29uc3QgdmFsdWVzID0gYnAgIT09IHVuZGVmaW5lZCA/IGJwTWFwLmdldChicCkgOiB0aGlzLmdldEFjdGl2YXRlZFZhbHVlcyhicE1hcCwga2V5KTtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5nZXQoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuXG4gIC8qKlxuICAgKiB3aGV0aGVyIHRoZSBlbGVtZW50IGhhcyB2YWx1ZXMgZm9yIGEgZ2l2ZW4ga2V5XG4gICAqIEBwYXJhbSBlbGVtZW50XG4gICAqIEBwYXJhbSBrZXlcbiAgICovXG4gIGhhc1ZhbHVlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGJwTWFwID0gdGhpcy5lbGVtZW50TWFwLmdldChlbGVtZW50KTtcbiAgICBpZiAoYnBNYXApIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IHRoaXMuZ2V0QWN0aXZhdGVkVmFsdWVzKGJwTWFwLCBrZXkpO1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXR1cm4gdmFsdWVzLmdldChrZXkpICE9PSB1bmRlZmluZWQgfHwgZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIHZhbHVlIGZvciBhbiBpbnB1dCBvbiBhIGRpcmVjdGl2ZVxuICAgKiBAcGFyYW0gZWxlbWVudCB0aGUgZWxlbWVudCBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ga2V5IHRoZSB0eXBlIG9mIHRoZSBkaXJlY3RpdmUgKGUuZy4gZmxleCwgbGF5b3V0LWdhcCwgZXRjKVxuICAgKiBAcGFyYW0gYnAgdGhlIGJyZWFrcG9pbnQgc3VmZml4IChlbXB0eSBzdHJpbmcgPSBkZWZhdWx0KVxuICAgKiBAcGFyYW0gdmFsIHRoZSB2YWx1ZSBmb3IgdGhlIGJyZWFrcG9pbnRcbiAgICovXG4gIHNldFZhbHVlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk6IHN0cmluZywgdmFsOiBhbnksIGJwOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgYnBNYXA6IEJyZWFrcG9pbnRNYXAgfCB1bmRlZmluZWQgPSB0aGlzLmVsZW1lbnRNYXAuZ2V0KGVsZW1lbnQpO1xuICAgIGlmICghYnBNYXApIHtcbiAgICAgIGJwTWFwID0gbmV3IE1hcCgpLnNldChicCwgbmV3IE1hcCgpLnNldChrZXksIHZhbCkpO1xuICAgICAgdGhpcy5lbGVtZW50TWFwLnNldChlbGVtZW50LCBicE1hcCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHZhbHVlcyA9IChicE1hcC5nZXQoYnApID8/IG5ldyBNYXAoKSkuc2V0KGtleSwgdmFsKTtcbiAgICAgIGJwTWFwLnNldChicCwgdmFsdWVzKTtcbiAgICAgIHRoaXMuZWxlbWVudE1hcC5zZXQoZWxlbWVudCwgYnBNYXApO1xuICAgIH1cbiAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoZWxlbWVudCwga2V5KTtcbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy51cGRhdGVFbGVtZW50KGVsZW1lbnQsIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBUcmFjayBlbGVtZW50IHZhbHVlIGNoYW5nZXMgZm9yIGEgc3BlY2lmaWMga2V5ICovXG4gIHRyYWNrVmFsdWUoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nKTogT2JzZXJ2YWJsZTxFbGVtZW50TWF0Y2hlcj4ge1xuICAgIHJldHVybiB0aGlzLnN1YmplY3RcbiAgICAgICAgLmFzT2JzZXJ2YWJsZSgpXG4gICAgICAgIC5waXBlKGZpbHRlcih2ID0+IHYuZWxlbWVudCA9PT0gZWxlbWVudCAmJiB2LmtleSA9PT0ga2V5KSk7XG4gIH1cblxuICAvKiogdXBkYXRlIGFsbCBzdHlsZXMgZm9yIGFsbCBlbGVtZW50cyBvbiB0aGUgY3VycmVudCBicmVha3BvaW50ICovXG4gIHVwZGF0ZVN0eWxlcygpOiB2b2lkIHtcbiAgICB0aGlzLmVsZW1lbnRNYXAuZm9yRWFjaCgoYnBNYXAsIGVsKSA9PiB7XG4gICAgICBjb25zdCBrZXlNYXAgPSBuZXcgU2V0KHRoaXMuZWxlbWVudEtleU1hcC5nZXQoZWwpISk7XG4gICAgICBsZXQgdmFsdWVNYXAgPSB0aGlzLmdldEFjdGl2YXRlZFZhbHVlcyhicE1hcCk7XG5cbiAgICAgIGlmICh2YWx1ZU1hcCkge1xuICAgICAgICB2YWx1ZU1hcC5mb3JFYWNoKCh2LCBrKSA9PiB7XG4gICAgICAgICAgdGhpcy51cGRhdGVFbGVtZW50KGVsLCBrLCB2KTtcbiAgICAgICAgICBrZXlNYXAuZGVsZXRlKGspO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAga2V5TWFwLmZvckVhY2goayA9PiB7XG4gICAgICAgIHZhbHVlTWFwID0gdGhpcy5nZXRBY3RpdmF0ZWRWYWx1ZXMoYnBNYXAsIGspO1xuICAgICAgICBpZiAodmFsdWVNYXApIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHZhbHVlTWFwLmdldChrKTtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnQoZWwsIGssIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLmNsZWFyRWxlbWVudChlbCwgayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIGNsZWFyIHRoZSBzdHlsZXMgZm9yIGEgZ2l2ZW4gZWxlbWVudFxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKiBAcGFyYW0ga2V5XG4gICAqL1xuICBjbGVhckVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgYnVpbGRlcnMgPSB0aGlzLmNsZWFyTWFwLmdldChlbGVtZW50KTtcblxuICAgIGlmIChidWlsZGVycykge1xuICAgICAgY29uc3QgY2xlYXJGbjogQ2xlYXJDYWxsYmFjayA9IGJ1aWxkZXJzLmdldChrZXkpIGFzIENsZWFyQ2FsbGJhY2s7XG4gICAgICBpZiAoISFjbGVhckZuKSB7XG4gICAgICAgIGNsZWFyRm4oKTtcbiAgICAgICAgdGhpcy5zdWJqZWN0Lm5leHQoe2VsZW1lbnQsIGtleSwgdmFsdWU6ICcnfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHVwZGF0ZSBhIGdpdmVuIGVsZW1lbnQgd2l0aCB0aGUgYWN0aXZhdGVkIHZhbHVlcyBmb3IgYSBnaXZlbiBrZXlcbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICogQHBhcmFtIGtleVxuICAgKiBAcGFyYW0gdmFsdWVcbiAgICovXG4gIHVwZGF0ZUVsZW1lbnQoZWxlbWVudDogSFRNTEVsZW1lbnQsIGtleTogc3RyaW5nLCB2YWx1ZTogYW55KTogdm9pZCB7XG4gICAgY29uc3QgYnVpbGRlcnMgPSB0aGlzLnVwZGF0ZU1hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGJ1aWxkZXJzKSB7XG4gICAgICBjb25zdCB1cGRhdGVGbjogVXBkYXRlQ2FsbGJhY2sgPSBidWlsZGVycy5nZXQoa2V5KSBhcyBVcGRhdGVDYWxsYmFjaztcbiAgICAgIGlmICghIXVwZGF0ZUZuKSB7XG4gICAgICAgIHVwZGF0ZUZuKHZhbHVlKTtcbiAgICAgICAgdGhpcy5zdWJqZWN0Lm5leHQoe2VsZW1lbnQsIGtleSwgdmFsdWV9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmVsZWFzZSBhbGwgcmVmZXJlbmNlcyB0byBhIGdpdmVuIGVsZW1lbnRcbiAgICogQHBhcmFtIGVsZW1lbnRcbiAgICovXG4gIHJlbGVhc2VFbGVtZW50KGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3Qgd2F0Y2hlck1hcCA9IHRoaXMud2F0Y2hlck1hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKHdhdGNoZXJNYXApIHtcbiAgICAgIHdhdGNoZXJNYXAuZm9yRWFjaChzID0+IHMudW5zdWJzY3JpYmUoKSk7XG4gICAgICB0aGlzLndhdGNoZXJNYXAuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgICBjb25zdCBlbGVtZW50TWFwID0gdGhpcy5lbGVtZW50TWFwLmdldChlbGVtZW50KTtcbiAgICBpZiAoZWxlbWVudE1hcCkge1xuICAgICAgZWxlbWVudE1hcC5mb3JFYWNoKChfLCBzKSA9PiBlbGVtZW50TWFwLmRlbGV0ZShzKSk7XG4gICAgICB0aGlzLmVsZW1lbnRNYXAuZGVsZXRlKGVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiB0cmlnZ2VyIGFuIHVwZGF0ZSBmb3IgYSBnaXZlbiBlbGVtZW50IGFuZCBrZXkgKGUuZy4gbGF5b3V0KVxuICAgKiBAcGFyYW0gZWxlbWVudFxuICAgKiBAcGFyYW0ga2V5XG4gICAqL1xuICB0cmlnZ2VyVXBkYXRlKGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBrZXk/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBicE1hcCA9IHRoaXMuZWxlbWVudE1hcC5nZXQoZWxlbWVudCk7XG4gICAgaWYgKGJwTWFwKSB7XG4gICAgICBjb25zdCB2YWx1ZU1hcCA9IHRoaXMuZ2V0QWN0aXZhdGVkVmFsdWVzKGJwTWFwLCBrZXkpO1xuICAgICAgaWYgKHZhbHVlTWFwKSB7XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnQoZWxlbWVudCwga2V5LCB2YWx1ZU1hcC5nZXQoa2V5KSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWVNYXAuZm9yRWFjaCgodiwgaykgPT4gdGhpcy51cGRhdGVFbGVtZW50KGVsZW1lbnQsIGssIHYpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBDcm9zcy1yZWZlcmVuY2UgZm9yIEhUTUxFbGVtZW50IHdpdGggZGlyZWN0aXZlIGtleSAqL1xuICBwcml2YXRlIGJ1aWxkRWxlbWVudEtleU1hcChlbGVtZW50OiBIVE1MRWxlbWVudCwga2V5OiBzdHJpbmcpIHtcbiAgICBsZXQga2V5TWFwID0gdGhpcy5lbGVtZW50S2V5TWFwLmdldChlbGVtZW50KTtcbiAgICBpZiAoIWtleU1hcCkge1xuICAgICAga2V5TWFwID0gbmV3IFNldCgpO1xuICAgICAgdGhpcy5lbGVtZW50S2V5TWFwLnNldChlbGVtZW50LCBrZXlNYXApO1xuICAgIH1cbiAgICBrZXlNYXAuYWRkKGtleSk7XG4gIH1cblxuICAvKipcbiAgICogT3RoZXIgdHJpZ2dlcnMgdGhhdCBzaG91bGQgZm9yY2Ugc3R5bGUgdXBkYXRlczpcbiAgICogLSBkaXJlY3Rpb25hbGl0eVxuICAgKiAtIGxheW91dCBjaGFuZ2VzXG4gICAqIC0gbXV0YXRpb25vYnNlcnZlciB1cGRhdGVzXG4gICAqL1xuICBwcml2YXRlIHdhdGNoRXh0cmFUcmlnZ2VycyhlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBzdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWdnZXJzOiBPYnNlcnZhYmxlPGFueT5bXSkge1xuICAgIGlmICh0cmlnZ2VycyAmJiB0cmlnZ2Vycy5sZW5ndGgpIHtcbiAgICAgIGxldCB3YXRjaGVycyA9IHRoaXMud2F0Y2hlck1hcC5nZXQoZWxlbWVudCk7XG4gICAgICBpZiAoIXdhdGNoZXJzKSB7XG4gICAgICAgIHdhdGNoZXJzID0gbmV3IE1hcCgpO1xuICAgICAgICB0aGlzLndhdGNoZXJNYXAuc2V0KGVsZW1lbnQsIHdhdGNoZXJzKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHdhdGNoZXJzLmdldChrZXkpO1xuICAgICAgaWYgKCFzdWJzY3JpcHRpb24pIHtcbiAgICAgICAgY29uc3QgbmV3U3Vic2NyaXB0aW9uID0gbWVyZ2UoLi4udHJpZ2dlcnMpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY3VycmVudFZhbHVlID0gdGhpcy5nZXRWYWx1ZShlbGVtZW50LCBrZXkpO1xuICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudChlbGVtZW50LCBrZXksIGN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICB3YXRjaGVycy5zZXQoa2V5LCBuZXdTdWJzY3JpcHRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBCcmVha3BvaW50IGxvY2F0b3IgYnkgbWVkaWFRdWVyeSAqL1xuICBwcml2YXRlIGZpbmRCeVF1ZXJ5KHF1ZXJ5OiBzdHJpbmcpIHtcbiAgICByZXR1cm4gdGhpcy5icmVha3BvaW50cy5maW5kQnlRdWVyeShxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogZ2V0IHRoZSBmYWxsYmFjayBicmVha3BvaW50IGZvciBhIGdpdmVuIGVsZW1lbnQsIHN0YXJ0aW5nIHdpdGggdGhlIGN1cnJlbnQgYnJlYWtwb2ludFxuICAgKiBAcGFyYW0gYnBNYXBcbiAgICogQHBhcmFtIGtleVxuICAgKi9cbiAgcHJpdmF0ZSBnZXRBY3RpdmF0ZWRWYWx1ZXMoYnBNYXA6IEJyZWFrcG9pbnRNYXAsIGtleT86IHN0cmluZyk6IFZhbHVlTWFwIHwgdW5kZWZpbmVkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYWN0aXZhdGVkQnJlYWtwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGFjdGl2YXRlZEJwID0gdGhpcy5hY3RpdmF0ZWRCcmVha3BvaW50c1tpXTtcbiAgICAgIGNvbnN0IHZhbHVlTWFwID0gYnBNYXAuZ2V0KGFjdGl2YXRlZEJwLmFsaWFzKTtcblxuICAgICAgaWYgKHZhbHVlTWFwKSB7XG4gICAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCB8fCAodmFsdWVNYXAuaGFzKGtleSkgJiYgdmFsdWVNYXAuZ2V0KGtleSkgIT0gbnVsbCkpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWVNYXA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbiB0aGUgc2VydmVyLCB3ZSBleHBsaWNpdGx5IGhhdmUgYW4gXCJhbGxcIiBzZWN0aW9uIGZpbGxlZCBpbiB0byBiZWdpbiB3aXRoLlxuICAgIC8vIFNvIHdlIGRvbid0IG5lZWQgdG8gYWdncmVzc2l2ZWx5IGZpbmQgYSBmYWxsYmFjayBpZiBubyBleHBsaWNpdCB2YWx1ZSBleGlzdHMuXG4gICAgaWYgKCF0aGlzLl91c2VGYWxsYmFja3MpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdEhvcGUgPSBicE1hcC5nZXQoJycpO1xuICAgIHJldHVybiAoa2V5ID09PSB1bmRlZmluZWQgfHwgbGFzdEhvcGUgJiYgbGFzdEhvcGUuaGFzKGtleSkpID8gbGFzdEhvcGUgOiB1bmRlZmluZWQ7XG4gIH1cblxuICAvKipcbiAgICogV2F0Y2ggZm9yIG1lZGlhUXVlcnkgYnJlYWtwb2ludCBhY3RpdmF0aW9uc1xuICAgKi9cbiAgcHJpdmF0ZSBvYnNlcnZlQWN0aXZhdGlvbnMoKSB7XG4gICAgY29uc3QgcXVlcmllcyA9IHRoaXMuYnJlYWtwb2ludHMuaXRlbXMubWFwKGJwID0+IGJwLm1lZGlhUXVlcnkpO1xuXG4gICAgdGhpcy5ob29rLnJlZ2lzdGVyQmVmb3JlQWZ0ZXJQcmludEhvb2tzKHRoaXMpO1xuICAgIHRoaXMubWF0Y2hNZWRpYVxuICAgICAgICAub2JzZXJ2ZSh0aGlzLmhvb2sud2l0aFByaW50UXVlcnkocXVlcmllcykpXG4gICAgICAgIC5waXBlKFxuICAgICAgICAgICAgdGFwKHRoaXMuaG9vay5pbnRlcmNlcHRFdmVudHModGhpcykpLFxuICAgICAgICAgICAgZmlsdGVyKHRoaXMuaG9vay5ibG9ja1Byb3BhZ2F0aW9uKCkpXG4gICAgICAgIClcbiAgICAgICAgLnN1YnNjcmliZSh0aGlzLm9uTWVkaWFDaGFuZ2UuYmluZCh0aGlzKSk7XG4gIH1cblxufVxuXG5mdW5jdGlvbiBpbml0QnVpbGRlck1hcChtYXA6IEJ1aWxkZXJNYXAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBIVE1MRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5wdXQ/OiBCdWlsZGVyKTogdm9pZCB7XG4gIGlmIChpbnB1dCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgY29uc3Qgb2xkTWFwID0gbWFwLmdldChlbGVtZW50KSA/PyBuZXcgTWFwKCk7XG4gICAgb2xkTWFwLnNldChrZXksIGlucHV0KTtcbiAgICBtYXAuc2V0KGVsZW1lbnQsIG9sZE1hcCk7XG4gIH1cbn1cblxuIl19