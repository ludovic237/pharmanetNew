/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { mergeAlias } from '../add-alias';
import { MediaChange } from '../media-change';
import { sortDescendingPriority } from '../utils/sort';
import { LAYOUT_CONFIG } from '../tokens/library-config';
import * as i0 from "@angular/core";
import * as i1 from "../breakpoints/break-point-registry";
import * as i2 from "../match-media/match-media";
/**
 * Class
 */
export class MediaTrigger {
    constructor(breakpoints, matchMedia, layoutConfig, _platformId, _document) {
        this.breakpoints = breakpoints;
        this.matchMedia = matchMedia;
        this.layoutConfig = layoutConfig;
        this._platformId = _platformId;
        this._document = _document;
        this.hasCachedRegistryMatches = false;
        this.originalActivations = [];
        this.originalRegistry = new Map();
    }
    /**
     * Manually activate range of breakpoints
     * @param list array of mediaQuery or alias strings
     */
    activate(list) {
        list = list.map(it => it.trim()); // trim queries
        this.saveActivations();
        this.deactivateAll();
        this.setActivations(list);
        this.prepareAutoRestore();
    }
    /**
     * Restore original, 'real' breakpoints and emit events
     * to trigger stream notification
     */
    restore() {
        if (this.hasCachedRegistryMatches) {
            const extractQuery = (change) => change.mediaQuery;
            const list = this.originalActivations.map(extractQuery);
            try {
                this.deactivateAll();
                this.restoreRegistryMatches();
                this.setActivations(list);
            }
            finally {
                this.originalActivations = [];
                if (this.resizeSubscription) {
                    this.resizeSubscription.unsubscribe();
                }
            }
        }
    }
    // ************************************************
    // Internal Methods
    // ************************************************
    /**
     * Whenever window resizes, immediately auto-restore original
     * activations (if we are simulating activations)
     */
    prepareAutoRestore() {
        const isBrowser = isPlatformBrowser(this._platformId) && this._document;
        const enableAutoRestore = isBrowser && this.layoutConfig.mediaTriggerAutoRestore;
        if (enableAutoRestore) {
            const resize$ = fromEvent(window, 'resize').pipe(take(1));
            this.resizeSubscription = resize$.subscribe(this.restore.bind(this));
        }
    }
    /**
     * Notify all matchMedia subscribers of de-activations
     *
     * Note: we must force 'matches' updates for
     *       future matchMedia::activation lookups
     */
    deactivateAll() {
        const list = this.currentActivations;
        this.forceRegistryMatches(list, false);
        this.simulateMediaChanges(list, false);
    }
    /**
     * Cache current activations as sorted, prioritized list of MediaChanges
     */
    saveActivations() {
        if (!this.hasCachedRegistryMatches) {
            const toMediaChange = (query) => new MediaChange(true, query);
            const mergeMQAlias = (change) => {
                const bp = this.breakpoints.findByQuery(change.mediaQuery);
                return mergeAlias(change, bp);
            };
            this.originalActivations = this.currentActivations
                .map(toMediaChange)
                .map(mergeMQAlias)
                .sort(sortDescendingPriority);
            this.cacheRegistryMatches();
        }
    }
    /**
     * Force set manual activations for specified mediaQuery list
     */
    setActivations(list) {
        if (!!this.originalRegistry) {
            this.forceRegistryMatches(list, true);
        }
        this.simulateMediaChanges(list);
    }
    /**
     * For specified mediaQuery list manually simulate activations or deactivations
     */
    simulateMediaChanges(queries, matches = true) {
        const toMediaQuery = (query) => {
            const locator = this.breakpoints;
            const bp = locator.findByAlias(query) || locator.findByQuery(query);
            return bp ? bp.mediaQuery : query;
        };
        const emitChangeEvent = (query) => this.emitChangeEvent(matches, query);
        queries.map(toMediaQuery).forEach(emitChangeEvent);
    }
    /**
     * Replace current registry with simulated registry...
     * Note: this is required since MediaQueryList::matches is 'readOnly'
     */
    forceRegistryMatches(queries, matches) {
        const registry = new Map();
        queries.forEach(query => {
            registry.set(query, { matches });
        });
        this.matchMedia.registry = registry;
    }
    /**
     * Save current MatchMedia::registry items.
     */
    cacheRegistryMatches() {
        const target = this.originalRegistry;
        target.clear();
        this.matchMedia.registry.forEach((value, key) => {
            target.set(key, value);
        });
        this.hasCachedRegistryMatches = true;
    }
    /**
     * Restore original, 'true' registry
     */
    restoreRegistryMatches() {
        const target = this.matchMedia.registry;
        target.clear();
        this.originalRegistry.forEach((value, key) => {
            target.set(key, value);
        });
        this.originalRegistry.clear();
        this.hasCachedRegistryMatches = false;
    }
    /**
     * Manually emit a MediaChange event via the MatchMedia to MediaMarshaller and MediaObserver
     */
    emitChangeEvent(matches, query) {
        this.matchMedia.source.next(new MediaChange(matches, query));
    }
    get currentActivations() {
        return this.matchMedia.activations;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaTrigger, deps: [{ token: i1.BreakPointRegistry }, { token: i2.MatchMedia }, { token: LAYOUT_CONFIG }, { token: PLATFORM_ID }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaTrigger, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MediaTrigger, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.BreakPointRegistry }, { type: i2.MatchMedia }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtdHJpZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvY29yZS9tZWRpYS10cmlnZ2VyL21lZGlhLXRyaWdnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzlELE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU1RCxPQUFPLEVBQUMsU0FBUyxFQUFlLE1BQU0sTUFBTSxDQUFDO0FBQzdDLE9BQU8sRUFBQyxJQUFJLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUc1QyxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxFQUFDLGFBQWEsRUFBc0IsTUFBTSwwQkFBMEIsQ0FBQzs7OztBQUU1RTs7R0FFRztBQUVILE1BQU0sT0FBTyxZQUFZO0lBRXZCLFlBQ2MsV0FBK0IsRUFDL0IsVUFBc0IsRUFDQyxZQUFpQyxFQUNuQyxXQUFtQixFQUN0QixTQUFjO1FBSmhDLGdCQUFXLEdBQVgsV0FBVyxDQUFvQjtRQUMvQixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ0MsaUJBQVksR0FBWixZQUFZLENBQXFCO1FBQ25DLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFxS3RDLDZCQUF3QixHQUFHLEtBQUssQ0FBQztRQUNqQyx3QkFBbUIsR0FBa0IsRUFBRSxDQUFDO1FBQ3hDLHFCQUFnQixHQUFnQyxJQUFJLEdBQUcsRUFBMEIsQ0FBQztJQXRLMUYsQ0FBQztJ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Q0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsSUFBWSxrQkFBa0I7UUFDNUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQztJQUNyQyxDQUFDOzhHQTFLVSxZQUFZLDhFQUtYLGFBQWEsYUFDYixXQUFXLGFBQ1gsUUFBUTtrSEFQVCxZQUFZLGNBREEsTUFBTTs7MkZBQ2xCLFlBQVk7a0JBRHhCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzswQkFNekIsTUFBTTsyQkFBQyxhQUFhOzswQkFDcEIsTUFBTTsyQkFBQyxXQUFXOzswQkFDbEIsTUFBTTsyQkFBQyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgUExBVEZPUk1fSUR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVCwgaXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7ZnJvbUV2ZW50LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHt0YWtlfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7bWVyZ2VBbGlhc30gZnJvbSAnLi4vYWRkLWFsaWFzJztcbmltcG9ydCB7TWVkaWFDaGFuZ2V9IGZyb20gJy4uL21lZGlhLWNoYW5nZSc7XG5pbXBvcnQge01hdGNoTWVkaWF9IGZyb20gJy4uL21hdGNoLW1lZGlhL21hdGNoLW1lZGlhJztcbmltcG9ydCB7QnJlYWtQb2ludFJlZ2lzdHJ5LCBPcHRpb25hbEJyZWFrUG9pbnR9IGZyb20gJy4uL2JyZWFrcG9pbnRzL2JyZWFrLXBvaW50LXJlZ2lzdHJ5JztcbmltcG9ydCB7c29ydERlc2NlbmRpbmdQcmlvcml0eX0gZnJvbSAnLi4vdXRpbHMvc29ydCc7XG5pbXBvcnQge0xBWU9VVF9DT05GSUcsIExheW91dENvbmZpZ09wdGlvbnN9IGZyb20gJy4uL3Rva2Vucy9saWJyYXJ5LWNvbmZpZyc7XG5cbi8qKlxuICogQ2xhc3NcbiAqL1xuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTWVkaWFUcmlnZ2VyIHtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBicmVha3BvaW50czogQnJlYWtQb2ludFJlZ2lzdHJ5LFxuICAgICAgcHJvdGVjdGVkIG1hdGNoTWVkaWE6IE1hdGNoTWVkaWEsXG4gICAgICBASW5qZWN0KExBWU9VVF9DT05GSUcpIHByb3RlY3RlZCBsYXlvdXRDb25maWc6IExheW91dENvbmZpZ09wdGlvbnMsXG4gICAgICBASW5qZWN0KFBMQVRGT1JNX0lEKSBwcm90ZWN0ZWQgX3BsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICAgIEBJbmplY3QoRE9DVU1FTlQpIHByb3RlY3RlZCBfZG9jdW1lbnQ6IGFueSkge1xuICB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbGx5IGFjdGl2YXRlIHJhbmdlIG9mIGJyZWFrcG9pbnRzXG4gICAqIEBwYXJhbSBsaXN0IGFycmF5IG9mIG1lZGlhUXVlcnkgb3IgYWxpYXMgc3RyaW5nc1xuICAgKi9cbiAgYWN0aXZhdGUobGlzdDogc3RyaW5nW10pIHtcbiAgICBsaXN0ID0gbGlzdC5tYXAoaXQgPT4gaXQudHJpbSgpKTsgLy8gdHJpbSBxdWVyaWVzXG5cbiAgICB0aGlzLnNhdmVBY3RpdmF0aW9ucygpO1xuICAgIHRoaXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgIHRoaXMuc2V0QWN0aXZhdGlvbnMobGlzdCk7XG5cbiAgICB0aGlzLnByZXBhcmVBdXRvUmVzdG9yZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3RvcmUgb3JpZ2luYWwsICdyZWFsJyBicmVha3BvaW50cyBhbmQgZW1pdCBldmVudHNcbiAgICogdG8gdHJpZ2dlciBzdHJlYW0gbm90aWZpY2F0aW9uXG4gICAqL1xuICByZXN0b3JlKCkge1xuICAgIGlmICh0aGlzLmhhc0NhY2hlZFJlZ2lzdHJ5TWF0Y2hlcykge1xuICAgICAgY29uc3QgZXh0cmFjdFF1ZXJ5ID0gKGNoYW5nZTogTWVkaWFDaGFuZ2UpID0+IGNoYW5nZS5tZWRpYVF1ZXJ5O1xuICAgICAgY29uc3QgbGlzdCA9IHRoaXMub3JpZ2luYWxBY3RpdmF0aW9ucy5tYXAoZXh0cmFjdFF1ZXJ5KTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuZGVhY3RpdmF0ZUFsbCgpO1xuICAgICAgICB0aGlzLnJlc3RvcmVSZWdpc3RyeU1hdGNoZXMoKTtcbiAgICAgICAgdGhpcy5zZXRBY3RpdmF0aW9ucyhsaXN0KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHRoaXMub3JpZ2luYWxBY3RpdmF0aW9ucyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5yZXNpemVTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICB0aGlzLnJlc2l6ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gIC8vIEludGVybmFsIE1ldGhvZHNcbiAgLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbiAgLyoqXG4gICAqIFdoZW5ldmVyIHdpbmRvdyByZXNpemVzLCBpbW1lZGlhdGVseSBhdXRvLXJlc3RvcmUgb3JpZ2luYWxcbiAgICogYWN0aXZhdGlvbnMgKGlmIHdlIGFyZSBzaW11bGF0aW5nIGFjdGl2YXRpb25zKVxuICAgKi9cbiAgcHJpdmF0ZSBwcmVwYXJlQXV0b1Jlc3RvcmUoKSB7XG4gICAgY29uc3QgaXNCcm93c2VyID0gaXNQbGF0Zm9ybUJyb3dzZXIodGhpcy5fcGxhdGZvcm1JZCkgJiYgdGhpcy5fZG9jdW1lbnQ7XG4gICAgY29uc3QgZW5hYmxlQXV0b1Jlc3RvcmUgPSBpc0Jyb3dzZXIgJiYgdGhpcy5sYXlvdXRDb25maWcubWVkaWFUcmlnZ2VyQXV0b1Jlc3RvcmU7XG5cbiAgICBpZiAoZW5hYmxlQXV0b1Jlc3RvcmUpIHtcbiAgICAgIGNvbnN0IHJlc2l6ZSQgPSBmcm9tRXZlbnQod2luZG93LCAncmVzaXplJykucGlwZSh0YWtlKDEpKTtcbiAgICAgIHRoaXMucmVzaXplU3Vic2NyaXB0aW9uID0gcmVzaXplJC5zdWJzY3JpYmUodGhpcy5yZXN0b3JlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RpZnkgYWxsIG1hdGNoTWVkaWEgc3Vic2NyaWJlcnMgb2YgZGUtYWN0aXZhdGlvbnNcbiAgICpcbiAgICogTm90ZTogd2UgbXVzdCBmb3JjZSAnbWF0Y2hlcycgdXBkYXRlcyBmb3JcbiAgICogICAgICAgZnV0dXJlIG1hdGNoTWVkaWE6OmFjdGl2YXRpb24gbG9va3Vwc1xuICAgKi9cbiAgcHJpdmF0ZSBkZWFjdGl2YXRlQWxsKCkge1xuICAgIGNvbnN0IGxpc3QgPSB0aGlzLmN1cnJlbnRBY3RpdmF0aW9ucztcblxuICAgIHRoaXMuZm9yY2VSZWdpc3RyeU1hdGNoZXMobGlzdCwgZmFsc2UpO1xuICAgIHRoaXMuc2ltdWxhdGVNZWRpYUNoYW5nZXMobGlzdCwgZmFsc2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIENhY2hlIGN1cnJlbnQgYWN0aXZhdGlvbnMgYXMgc29ydGVkLCBwcmlvcml0aXplZCBsaXN0IG9mIE1lZGlhQ2hhbmdlc1xuICAgKi9cbiAgcHJpdmF0ZSBzYXZlQWN0aXZhdGlvbnMoKSB7XG4gICAgaWYgKCF0aGlzLmhhc0NhY2hlZFJlZ2lzdHJ5TWF0Y2hlcykge1xuICAgICAgY29uc3QgdG9NZWRpYUNoYW5nZSA9IChxdWVyeTogc3RyaW5nKSA9PiBuZXcgTWVkaWFDaGFuZ2UodHJ1ZSwgcXVlcnkpO1xuICAgICAgY29uc3QgbWVyZ2VNUUFsaWFzID0gKGNoYW5nZTogTWVkaWFDaGFuZ2UpID0+IHtcbiAgICAgICAgY29uc3QgYnA6IE9wdGlvbmFsQnJlYWtQb2ludCA9IHRoaXMuYnJlYWtwb2ludHMuZmluZEJ5UXVlcnkoY2hhbmdlLm1lZGlhUXVlcnkpO1xuICAgICAgICByZXR1cm4gbWVyZ2VBbGlhcyhjaGFuZ2UsIGJwKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMub3JpZ2luYWxBY3RpdmF0aW9ucyA9IHRoaXMuY3VycmVudEFjdGl2YXRpb25zXG4gICAgICAgICAgLm1hcCh0b01lZGlhQ2hhbmdlKVxuICAgICAgICAgIC5tYXAobWVyZ2VNUUFsaWFzKVxuICAgICAgICAgIC5zb3J0KHNvcnREZXNjZW5kaW5nUHJpb3JpdHkpO1xuXG4gICAgICB0aGlzLmNhY2hlUmVnaXN0cnlNYXRjaGVzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZvcmNlIHNldCBtYW51YWwgYWN0aXZhdGlvbnMgZm9yIHNwZWNpZmllZCBtZWRpYVF1ZXJ5IGxpc3RcbiAgICovXG4gIHByaXZhdGUgc2V0QWN0aXZhdGlvbnMobGlzdDogc3RyaW5nW10pIHtcbiAgICBpZiAoISF0aGlzLm9yaWdpbmFsUmVnaXN0cnkpIHtcbiAgICAgIHRoaXMuZm9yY2VSZWdpc3RyeU1hdGNoZXMobGlzdCwgdHJ1ZSk7XG4gICAgfVxuICAgIHRoaXMuc2ltdWxhdGVNZWRpYUNoYW5nZXMobGlzdCk7XG4gIH1cblxuICAvKipcbiAgICogRm9yIHNwZWNpZmllZCBtZWRpYVF1ZXJ5IGxpc3QgbWFudWFsbHkgc2ltdWxhdGUgYWN0aXZhdGlvbnMgb3IgZGVhY3RpdmF0aW9uc1xuICAgKi9cbiAgcHJpdmF0ZSBzaW11bGF0ZU1lZGlhQ2hhbmdlcyhxdWVyaWVzOiBzdHJpbmdbXSwgbWF0Y2hlcyA9IHRydWUpIHtcbiAgICBjb25zdCB0b01lZGlhUXVlcnkgPSAocXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgbG9jYXRvciA9IHRoaXMuYnJlYWtwb2ludHM7XG4gICAgICBjb25zdCBicCA9IGxvY2F0b3IuZmluZEJ5QWxpYXMocXVlcnkpIHx8IGxvY2F0b3IuZmluZEJ5UXVlcnkocXVlcnkpO1xuICAgICAgcmV0dXJuIGJwID8gYnAubWVkaWFRdWVyeSA6IHF1ZXJ5O1xuICAgIH07XG4gICAgY29uc3QgZW1pdENoYW5nZUV2ZW50ID0gKHF1ZXJ5OiBzdHJpbmcpID0+IHRoaXMuZW1pdENoYW5nZUV2ZW50KG1hdGNoZXMsIHF1ZXJ5KTtcblxuICAgIHF1ZXJpZXMubWFwKHRvTWVkaWFRdWVyeSkuZm9yRWFjaChlbWl0Q2hhbmdlRXZlbnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2UgY3VycmVudCByZWdpc3RyeSB3aXRoIHNpbXVsYXRlZCByZWdpc3RyeS4uLlxuICAgKiBOb3RlOiB0aGlzIGlzIHJlcXVpcmVkIHNpbmNlIE1lZGlhUXVlcnlMaXN0OjptYXRjaGVzIGlzICdyZWFkT25seSdcbiAgICovXG4gIHByaXZhdGUgZm9yY2VSZWdpc3RyeU1hdGNoZXMocXVlcmllczogc3RyaW5nW10sIG1hdGNoZXM6IGJvb2xlYW4pIHtcbiAgICBjb25zdCByZWdpc3RyeSA9IG5ldyBNYXA8c3RyaW5nLCBNZWRpYVF1ZXJ5TGlzdD4oKTtcbiAgICBxdWVyaWVzLmZvckVhY2gocXVlcnkgPT4ge1xuICAgICAgcmVnaXN0cnkuc2V0KHF1ZXJ5LCB7bWF0Y2hlc30gYXMgTWVkaWFRdWVyeUxpc3QpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5tYXRjaE1lZGlhLnJlZ2lzdHJ5ID0gcmVnaXN0cnk7XG4gIH1cblxuICAvKipcbiAgICogU2F2ZSBjdXJyZW50IE1hdGNoTWVkaWE6OnJlZ2lzdHJ5IGl0ZW1zLlxuICAgKi9cbiAgcHJpdmF0ZSBjYWNoZVJlZ2lzdHJ5TWF0Y2hlcygpIHtcbiAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm9yaWdpbmFsUmVnaXN0cnk7XG5cbiAgICB0YXJnZXQuY2xlYXIoKTtcbiAgICB0aGlzLm1hdGNoTWVkaWEucmVnaXN0cnkuZm9yRWFjaCgodmFsdWU6IE1lZGlhUXVlcnlMaXN0LCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgdGFyZ2V0LnNldChrZXksIHZhbHVlKTtcbiAgICB9KTtcbiAgICB0aGlzLmhhc0NhY2hlZFJlZ2lzdHJ5TWF0Y2hlcyA9IHRydWU7XG4gIH1cblxuICAvKipcbiAgICogUmVzdG9yZSBvcmlnaW5hbCwgJ3RydWUnIHJlZ2lzdHJ5XG4gICAqL1xuICBwcml2YXRlIHJlc3RvcmVSZWdpc3RyeU1hdGNoZXMoKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5tYXRjaE1lZGlhLnJlZ2lzdHJ5O1xuXG4gICAgdGFyZ2V0LmNsZWFyKCk7XG4gICAgdGhpcy5vcmlnaW5hbFJlZ2lzdHJ5LmZvckVhY2goKHZhbHVlOiBNZWRpYVF1ZXJ5TGlzdCwga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIHRhcmdldC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9yaWdpbmFsUmVnaXN0cnkuY2xlYXIoKTtcbiAgICB0aGlzLmhhc0NhY2hlZFJlZ2lzdHJ5TWF0Y2hlcyA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbGx5IGVtaXQgYSBNZWRpYUNoYW5nZSBldmVudCB2aWEgdGhlIE1hdGNoTWVkaWEgdG8gTWVkaWFNYXJzaGFsbGVyIGFuZCBNZWRpYU9ic2VydmVyXG4gICAqL1xuICBwcml2YXRlIGVtaXRDaGFuZ2VFdmVudChtYXRjaGVzOiBib29sZWFuLCBxdWVyeTogc3RyaW5nKSB7XG4gICAgdGhpcy5tYXRjaE1lZGlhLnNvdXJjZS5uZXh0KG5ldyBNZWRpYUNoYW5nZShtYXRjaGVzLCBxdWVyeSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXQgY3VycmVudEFjdGl2YXRpb25zKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gdGhpcy5tYXRjaE1lZGlhLmFjdGl2YXRpb25zO1xuICB9XG5cbiAgcHJpdmF0ZSBoYXNDYWNoZWRSZWdpc3RyeU1hdGNoZXMgPSBmYWxzZTtcbiAgcHJpdmF0ZSBvcmlnaW5hbEFjdGl2YXRpb25zOiBNZWRpYUNoYW5nZVtdID0gW107XG4gIHByaXZhdGUgb3JpZ2luYWxSZWdpc3RyeTogTWFwPHN0cmluZywgTWVkaWFRdWVyeUxpc3Q+ID0gbmV3IE1hcDxzdHJpbmcsIE1lZGlhUXVlcnlMaXN0PigpO1xuXG4gIHByaXZhdGUgcmVzaXplU3Vic2NyaXB0aW9uITogU3Vic2NyaXB0aW9uO1xufVxuXG4iXX0=