/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, Inject } from '@angular/core';
import { BREAKPOINTS } from './break-points-token';
import { sortAscendingPriority } from '../utils/sort';
import * as i0 from "@angular/core";
/**
 * Registry of 1..n MediaQuery breakpoint ranges
 * This is published as a provider and may be overridden from custom, application-specific ranges
 *
 */
export class BreakPointRegistry {
    constructor(list) {
        /**
         * Memoized BreakPoint Lookups
         */
        this.findByMap = new Map();
        this.items = [...list].sort(sortAscendingPriority);
    }
    /**
     * Search breakpoints by alias (e.g. gt-xs)
     */
    findByAlias(alias) {
        return !alias ? null : this.findWithPredicate(alias, (bp) => bp.alias === alias);
    }
    findByQuery(query) {
        return this.findWithPredicate(query, (bp) => bp.mediaQuery === query);
    }
    /**
     * Get all the breakpoints whose ranges could overlapping `normal` ranges;
     * e.g. gt-sm overlaps md, lg, and xl
     */
    get overlappings() {
        return this.items.filter(it => it.overlapping);
    }
    /**
     * Get list of all registered (non-empty) breakpoint aliases
     */
    get aliases() {
        return this.items.map(it => it.alias);
    }
    /**
     * Aliases are mapped to properties using suffixes
     * e.g.  'gt-sm' for property 'layout'  uses suffix 'GtSm'
     * for property layoutGtSM.
     */
    get suffixes() {
        return this.items.map(it => it?.suffix ?? '');
    }
    /**
     * Memoized lookup using custom predicate function
     */
    findWithPredicate(key, searchFn) {
        let response = this.findByMap.get(key);
        if (!response) {
            response = this.items.find(searchFn) ?? null;
            this.findByMap.set(key, response);
        }
        return response ?? null;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BreakPointRegistry, deps: [{ token: BREAKPOINTS }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BreakPointRegistry, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: BreakPointRegistry, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [BREAKPOINTS]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWstcG9pbnQtcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2NvcmUvYnJlYWtwb2ludHMvYnJlYWstcG9pbnQtcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHakQsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pELE9BQU8sRUFBQyxxQkFBcUIsRUFBQyxNQUFNLGVBQWUsQ0FBQzs7QUFJcEQ7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxrQkFBa0I7SUFHN0IsWUFBaUMsSUFBa0I7UUFxRG5EOztXQUVHO1FBQ2MsY0FBUyxHQUFHLElBQUksR0FBRyxFQUE4QixDQUFDO1FBdkRqRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxXQUFXLENBQUMsS0FBYTtRQUN2QixPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLEtBQUssS0FBSyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFhO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLFVBQVUsS0FBSyxLQUFLLENBQUMsQ0FBQztJQUN4RSxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsSUFBSSxZQUFZO1FBQ2QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxJQUFJLE9BQU87UUFDVCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxNQUFNLElBQUksRUFBRSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVEOztPQUVHO0lBQ0ssaUJBQWlCLENBQUMsR0FBVyxFQUNqQyxRQUFxQztRQUN2QyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksSUFBSSxDQUFDO1lBQzdDLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsT0FBTyxRQUFRLElBQUksSUFBSSxDQUFDO0lBRTFCLENBQUM7OEdBdERVLGtCQUFrQixrQkFHVCxXQUFXO2tIQUhwQixrQkFBa0IsY0FETixNQUFNOzsyRkFDbEIsa0JBQWtCO2tCQUQ5QixVQUFVO21CQUFDLEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBQzs7MEJBSWpCLE1BQU07MkJBQUMsV0FBVyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge0JyZWFrUG9pbnR9IGZyb20gJy4vYnJlYWstcG9pbnQnO1xuaW1wb3J0IHtCUkVBS1BPSU5UU30gZnJvbSAnLi9icmVhay1wb2ludHMtdG9rZW4nO1xuaW1wb3J0IHtzb3J0QXNjZW5kaW5nUHJpb3JpdHl9IGZyb20gJy4uL3V0aWxzL3NvcnQnO1xuXG5leHBvcnQgdHlwZSBPcHRpb25hbEJyZWFrUG9pbnQgPSBCcmVha1BvaW50IHwgbnVsbDtcblxuLyoqXG4gKiBSZWdpc3RyeSBvZiAxLi5uIE1lZGlhUXVlcnkgYnJlYWtwb2ludCByYW5nZXNcbiAqIFRoaXMgaXMgcHVibGlzaGVkIGFzIGEgcHJvdmlkZXIgYW5kIG1heSBiZSBvdmVycmlkZGVuIGZyb20gY3VzdG9tLCBhcHBsaWNhdGlvbi1zcGVjaWZpYyByYW5nZXNcbiAqXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIEJyZWFrUG9pbnRSZWdpc3RyeSB7XG4gIHJlYWRvbmx5IGl0ZW1zOiBCcmVha1BvaW50W107XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChCUkVBS1BPSU5UUykgbGlzdDogQnJlYWtQb2ludFtdKSB7XG4gICAgdGhpcy5pdGVtcyA9IFsuLi5saXN0XS5zb3J0KHNvcnRBc2NlbmRpbmdQcmlvcml0eSk7XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGJyZWFrcG9pbnRzIGJ5IGFsaWFzIChlLmcuIGd0LXhzKVxuICAgKi9cbiAgZmluZEJ5QWxpYXMoYWxpYXM6IHN0cmluZyk6IE9wdGlvbmFsQnJlYWtQb2ludCB7XG4gICAgcmV0dXJuICFhbGlhcyA/IG51bGwgOiB0aGlzLmZpbmRXaXRoUHJlZGljYXRlKGFsaWFzLCAoYnApID0+IGJwLmFsaWFzID09PSBhbGlhcyk7XG4gIH1cblxuICBmaW5kQnlRdWVyeShxdWVyeTogc3RyaW5nKTogT3B0aW9uYWxCcmVha1BvaW50IHtcbiAgICByZXR1cm4gdGhpcy5maW5kV2l0aFByZWRpY2F0ZShxdWVyeSwgKGJwKSA9PiBicC5tZWRpYVF1ZXJ5ID09PSBxdWVyeSk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCB0aGUgYnJlYWtwb2ludHMgd2hvc2UgcmFuZ2VzIGNvdWxkIG92ZXJsYXBwaW5nIGBub3JtYWxgIHJhbmdlcztcbiAgICogZS5nLiBndC1zbSBvdmVybGFwcyBtZCwgbGcsIGFuZCB4bFxuICAgKi9cbiAgZ2V0IG92ZXJsYXBwaW5ncygpOiBCcmVha1BvaW50W10ge1xuICAgIHJldHVybiB0aGlzLml0ZW1zLmZpbHRlcihpdCA9PiBpdC5vdmVybGFwcGluZyk7XG4gIH1cblxuICAvKipcbiAgICogR2V0IGxpc3Qgb2YgYWxsIHJlZ2lzdGVyZWQgKG5vbi1lbXB0eSkgYnJlYWtwb2ludCBhbGlhc2VzXG4gICAqL1xuICBnZXQgYWxpYXNlcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaXRlbXMubWFwKGl0ID0+IGl0LmFsaWFzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhc2VzIGFyZSBtYXBwZWQgdG8gcHJvcGVydGllcyB1c2luZyBzdWZmaXhlc1xuICAgKiBlLmcuICAnZ3Qtc20nIGZvciBwcm9wZXJ0eSAnbGF5b3V0JyAgdXNlcyBzdWZmaXggJ0d0U20nXG4gICAqIGZvciBwcm9wZXJ0eSBsYXlvdXRHdFNNLlxuICAgKi9cbiAgZ2V0IHN1ZmZpeGVzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5pdGVtcy5tYXAoaXQgPT4gaXQ/LnN1ZmZpeCA/PyAnJyk7XG4gIH1cblxuICAvKipcbiAgICogTWVtb2l6ZWQgbG9va3VwIHVzaW5nIGN1c3RvbSBwcmVkaWNhdGUgZnVuY3Rpb25cbiAgICovXG4gIHByaXZhdGUgZmluZFdpdGhQcmVkaWNhdGUoa2V5OiBzdHJpbmcsXG4gICAgICBzZWFyY2hGbjogKGJwOiBCcmVha1BvaW50KSA9PiBib29sZWFuKTogT3B0aW9uYWxCcmVha1BvaW50IHtcbiAgICBsZXQgcmVzcG9uc2UgPSB0aGlzLmZpbmRCeU1hcC5nZXQoa2V5KTtcbiAgICBpZiAoIXJlc3BvbnNlKSB7XG4gICAgICByZXNwb25zZSA9IHRoaXMuaXRlbXMuZmluZChzZWFyY2hGbikgPz8gbnVsbDtcbiAgICAgIHRoaXMuZmluZEJ5TWFwLnNldChrZXksIHJlc3BvbnNlKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlID8/IG51bGw7XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBNZW1vaXplZCBCcmVha1BvaW50IExvb2t1cHNcbiAgICovXG4gIHByaXZhdGUgcmVhZG9ubHkgZmluZEJ5TWFwID0gbmV3IE1hcDxTdHJpbmcsIE9wdGlvbmFsQnJlYWtQb2ludD4oKTtcbn1cblxuIl19