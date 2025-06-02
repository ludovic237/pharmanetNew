/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { CSP_NONCE, Inject, Injectable, Optional, PLATFORM_ID, } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MediaChange } from '../media-change';
import * as i0 from "@angular/core";
/**
 * MediaMonitor configures listeners to mediaQuery changes and publishes an Observable facade to
 * convert mediaQuery change callbacks to subscriber notifications. These notifications will be
 * performed within the ng Zone to trigger change detections and component updates.
 *
 * NOTE: both mediaQuery activations and de-activations are announced in notifications
 */
export class MatchMedia {
    constructor(_zone, _platformId, _document, _nonce) {
        this._zone = _zone;
        this._platformId = _platformId;
        this._document = _document;
        this._nonce = _nonce;
        /** Initialize source with 'all' so all non-responsive APIs trigger style updates */
        this.source = new BehaviorSubject(new MediaChange(true));
        this.registry = new Map();
        this.pendingRemoveListenerFns = [];
        this._observable$ = this.source.asObservable();
    }
    /**
     * Publish list of all current activations
     */
    get activations() {
        const results = [];
        this.registry.forEach((mql, key) => {
            if (mql.matches) {
                results.push(key);
            }
        });
        return results;
    }
    /**
     * For the specified mediaQuery?
     */
    isActive(mediaQuery) {
        const mql = this.registry.get(mediaQuery);
        return (mql?.matches ?? this.registerQuery(mediaQuery).some((m) => m.matches));
    }
    /**
     * External observers can watch for all (or a specific) mql changes.
     * Typically used by the MediaQueryAdaptor; optionally available to components
     * who wish to use the MediaMonitor as mediaMonitor$ observable service.
     *
     * Use deferred registration process to register breakpoints only on subscription
     * This logic also enforces logic to register all mediaQueries BEFORE notify
     * subscribers of notifications.
     */
    observe(mqList, filterOthers = false) {
        if (mqList && mqList.length) {
            const matchMedia$ = this._observable$.pipe(filter((change) => !filterOthers ? true : mqList.indexOf(change.mediaQuery) > -1));
            const registration$ = new Observable((observer) => {
                // tslint:disable-line:max-line-length
                const matches = this.registerQuery(mqList);
                if (matches.length) {
                    const lastChange = matches.pop();
                    matches.forEach((e) => {
                        observer.next(e);
                    });
                    this.source.next(lastChange); // last match is cached
                }
                observer.complete();
            });
            return merge(registration$, matchMedia$);
        }
        return this._observable$;
    }
    /**
     * Based on the BreakPointRegistry provider, register internal listeners for each unique
     * mediaQuery. Each listener emits specific MediaChange data to observers
     */
    registerQuery(mediaQuery) {
        const list = Array.isArray(mediaQuery) ? mediaQuery : [mediaQuery];
        const matches = [];
        buildQueryCss(list, this._document, this._nonce);
        list.forEach((query) => {
            const onMQLEvent = (e) => {
                this._zone.run(() => this.source.next(new MediaChange(e.matches, query)));
            };
            let mql = this.registry.get(query);
            if (!mql) {
                mql = this.buildMQL(query);
                mql.addListener(onMQLEvent);
                this.pendingRemoveListenerFns.push(() => mql.removeListener(onMQLEvent));
                this.registry.set(query, mql);
            }
            if (mql.matches) {
                matches.push(new MediaChange(true, query));
            }
        });
        return matches;
    }
    ngOnDestroy() {
        let fn;
        while ((fn = this.pendingRemoveListenerFns.pop())) {
            fn();
        }
    }
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     */
    buildMQL(query) {
        return constructMql(query, isPlatformBrowser(this._platformId));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MatchMedia, deps: [{ token: i0.NgZone }, { token: PLATFORM_ID }, { token: DOCUMENT }, { token: CSP_NONCE, optional: true }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MatchMedia, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MatchMedia, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [CSP_NONCE]
                }] }] });
/**
 * Private global registry for all dynamically-created, injected style tags
 * @see prepare(query)
 */
const ALL_STYLES = {};
/**
 * For Webkit engines that only trigger the MediaQueryList Listener
 * when there is at least one CSS selector for the respective media query.
 *
 * @param mediaQueries
 * @param _document
 */
function buildQueryCss(mediaQueries, _document, _nonce) {
    const list = mediaQueries.filter((it) => !ALL_STYLES[it]);
    if (list.length > 0) {
        const query = list.join(', ');
        try {
            const styleEl = _document.createElement('style');
            styleEl.setAttribute('type', 'text/css');
            if (_nonce) {
                styleEl.setAttribute('nonce', _nonce);
            }
            if (!styleEl.styleSheet) {
                const cssText = `
/*
  @ngbracket/ngx-layout - workaround for possible browser quirk with mediaQuery listeners
  see http://bit.ly/2sd4HMP
*/
@media ${query} {.fx-query-test{ }}
`;
                styleEl.appendChild(_document.createTextNode(cssText));
            }
            _document.head.appendChild(styleEl);
            // Store in private global registry
            list.forEach((mq) => (ALL_STYLES[mq] = styleEl));
        }
        catch (e) {
            console.error(e);
        }
    }
}
function buildMockMql(query) {
    const et = new EventTarget();
    et.matches = query === 'all' || query === '';
    et.media = query;
    et.addListener = () => { };
    et.removeListener = () => { };
    et.addEventListener = () => { };
    et.dispatchEvent = () => false;
    et.onchange = null;
    return et;
}
function constructMql(query, isBrowser) {
    const canListen = isBrowser && !!window.matchMedia('all').addListener;
    return canListen ? window.matchMedia(query) : buildMockMql(query);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0Y2gtbWVkaWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy9saWJzL2ZsZXgtbGF5b3V0L2NvcmUvbWF0Y2gtbWVkaWEvbWF0Y2gtbWVkaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFFLFFBQVEsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQzlELE9BQU8sRUFDTCxTQUFTLEVBQ1QsTUFBTSxFQUNOLFVBQVUsRUFHVixRQUFRLEVBQ1IsV0FBVyxHQUNaLE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxlQUFlLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBWSxNQUFNLE1BQU0sQ0FBQztBQUNwRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGlCQUFpQixDQUFDOztBQUU5Qzs7Ozs7O0dBTUc7QUFFSCxNQUFNLE9BQU8sVUFBVTtJQU1yQixZQUNZLEtBQWEsRUFDUSxXQUFtQixFQUN0QixTQUFjLEVBQ0QsTUFBc0I7UUFIckQsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNRLGdCQUFXLEdBQVgsV0FBVyxDQUFRO1FBQ3RCLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFDRCxXQUFNLEdBQU4sTUFBTSxDQUFnQjtRQVRqRSxvRkFBb0Y7UUFDM0UsV0FBTSxHQUFHLElBQUksZUFBZSxDQUFjLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDMUUsYUFBUSxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO1FBQzVCLDZCQUF3QixHQUFzQixFQUFFLENBQUM7UUFtSXhELGlCQUFZLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQTVIakQsQ0FBQztJQUVKOztPQUVHO0lBQ0gsSUFBSSxXQUFXO1FBQ2IsTUFBTSxP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bGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHsgRE9DVU1FTlQsIGlzUGxhdGZvcm1Ccm93c2VyIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIENTUF9OT05DRSxcbiAgSW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBOZ1pvbmUsXG4gIE9uRGVzdHJveSxcbiAgT3B0aW9uYWwsXG4gIFBMQVRGT1JNX0lELFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgbWVyZ2UsIE9ic2VydmFibGUsIE9ic2VydmVyIH0gZnJvbSAncnhqcyc7XG5pbXBvcnQgeyBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IE1lZGlhQ2hhbmdlIH0gZnJvbSAnLi4vbWVkaWEtY2hhbmdlJztcblxuLyoqXG4gKiBNZWRpYU1vbml0b3IgY29uZmlndXJlcyBsaXN0ZW5lcnMgdG8gbWVkaWFRdWVyeSBjaGFuZ2VzIGFuZCBwdWJsaXNoZXMgYW4gT2JzZXJ2YWJsZSBmYWNhZGUgdG9cbiAqIGNvbnZlcnQgbWVkaWFRdWVyeSBjaGFuZ2UgY2FsbGJhY2tzIHRvIHN1YnNjcmliZXIgbm90aWZpY2F0aW9ucy4gVGhlc2Ugbm90aWZpY2F0aW9ucyB3aWxsIGJlXG4gKiBwZXJmb3JtZWQgd2l0aGluIHRoZSBuZyBab25lIHRvIHRyaWdnZXIgY2hhbmdlIGRldGVjdGlvbnMgYW5kIGNvbXBvbmVudCB1cGRhdGVzLlxuICpcbiAqIE5PVEU6IGJvdGggbWVkaWFRdWVyeSBhY3RpdmF0aW9ucyBhbmQgZGUtYWN0aXZhdGlvbnMgYXJlIGFubm91bmNlZCBpbiBub3RpZmljYXRpb25zXG4gKi9cbkBJbmplY3RhYmxlKHsgcHJvdmlkZWRJbjogJ3Jvb3QnIH0pXG5leHBvcnQgY2xhc3MgTWF0Y2hNZWRpYSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gIC8qKiBJbml0aWFsaXplIHNvdXJjZSB3aXRoICdhbGwnIHNvIGFsbCBub24tcmVzcG9uc2l2ZSBBUElzIHRyaWdnZXIgc3R5bGUgdXBkYXRlcyAqL1xuICByZWFkb25seSBzb3VyY2UgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PE1lZGlhQ2hhbmdlPihuZXcgTWVkaWFDaGFuZ2UodHJ1ZSkpO1xuICByZWdpc3RyeSA9IG5ldyBNYXA8c3RyaW5nLCBNZWRpYVF1ZXJ5TGlzdD4oKTtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nUmVtb3ZlTGlzdGVuZXJGbnM6IEFycmF5PCgpID0+IHZvaWQ+ID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJvdGVjdGVkIF96b25lOiBOZ1pvbmUsXG4gICAgQEluamVjdChQTEFURk9STV9JRCkgcHJvdGVjdGVkIF9wbGF0Zm9ybUlkOiBPYmplY3QsXG4gICAgQEluamVjdChET0NVTUVOVCkgcHJvdGVjdGVkIF9kb2N1bWVudDogYW55LFxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQ1NQX05PTkNFKSBwcm90ZWN0ZWQgX25vbmNlPzogc3RyaW5nIHwgbnVsbFxuICApIHt9XG5cbiAgLyoqXG4gICAqIFB1Ymxpc2ggbGlzdCBvZiBhbGwgY3VycmVudCBhY3RpdmF0aW9uc1xuICAgKi9cbiAgZ2V0IGFjdGl2YXRpb25zKCk6IHN0cmluZ1tdIHtcbiAgICBjb25zdCByZXN1bHRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHRoaXMucmVnaXN0cnkuZm9yRWFjaCgobXFsOiBNZWRpYVF1ZXJ5TGlzdCwga2V5OiBzdHJpbmcpID0+IHtcbiAgICAgIGlmIChtcWwubWF0Y2hlcykge1xuICAgICAgICByZXN1bHRzLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3IgdGhlIHNwZWNpZmllZCBtZWRpYVF1ZXJ5P1xuICAgKi9cbiAgaXNBY3RpdmUobWVkaWFRdWVyeTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbXFsID0gdGhpcy5yZWdpc3RyeS5nZXQobWVkaWFRdWVyeSk7XG4gICAgcmV0dXJuIChcbiAgICAgIG1xbD8ubWF0Y2hlcyA/PyB0aGlzLnJlZ2lzdGVyUXVlcnkobWVkaWFRdWVyeSkuc29tZSgobSkgPT4gbS5tYXRjaGVzKVxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogRXh0ZXJuYWwgb2JzZXJ2ZXJzIGNhbiB3YXRjaCBmb3IgYWxsIChvciBhIHNwZWNpZmljKSBtcWwgY2hhbmdlcy5cbiAgICpcbiAgICogSWYgYSBtZWRpYVF1ZXJ5IGlzIG5vdCBzcGVjaWZpZWQsIHRoZW4gQUxMIG1lZGlhUXVlcnkgYWN0aXZhdGlvbnMgd2lsbFxuICAgKiBiZSBhbm5vdW5jZWQuXG4gICAqL1xuICBvYnNlcnZlKCk6IE9ic2VydmFibGU8TWVkaWFDaGFuZ2U+O1xuICBvYnNlcnZlKG1lZGlhUXVlcmllczogc3RyaW5nW10pOiBPYnNlcnZhYmxlPE1lZGlhQ2hhbmdlPjtcbiAgb2JzZXJ2ZShcbiAgICBtZWRpYVF1ZXJpZXM6IHN0cmluZ1tdLFxuICAgIGZpbHRlck90aGVyczogYm9vbGVhblxuICApOiBPYnNlcnZhYmxlPE1lZGlhQ2hhbmdlPjtcblxuICAvKipcbiAgICogRXh0ZXJuYWwgb2JzZXJ2ZXJzIGNhbiB3YXRjaCBmb3IgYWxsIChvciBhIHNwZWNpZmljKSBtcWwgY2hhbmdlcy5cbiAgICogVHlwaWNhbGx5IHVzZWQgYnkgdGhlIE1lZGlhUXVlcnlBZGFwdG9yOyBvcHRpb25hbGx5IGF2YWlsYWJsZSB0byBjb21wb25lbnRzXG4gICAqIHdobyB3aXNoIHRvIHVzZSB0aGUgTWVkaWFNb25pdG9yIGFzIG1lZGlhTW9uaXRvciQgb2JzZXJ2YWJsZSBzZXJ2aWNlLlxuICAgKlxuICAgKiBVc2UgZGVmZXJyZWQgcmVnaXN0cmF0aW9uIHByb2Nlc3MgdG8gcmVnaXN0ZXIgYnJlYWtwb2ludHMgb25seSBvbiBzdWJzY3JpcHRpb25cbiAgICogVGhpcyBsb2dpYyBhbHNvIGVuZm9yY2VzIGxvZ2ljIHRvIHJlZ2lzdGVyIGFsbCBtZWRpYVF1ZXJpZXMgQkVGT1JFIG5vdGlmeVxuICAgKiBzdWJzY3JpYmVycyBvZiBub3RpZmljYXRpb25zLlxuICAgKi9cbiAgb2JzZXJ2ZShtcUxpc3Q/OiBzdHJpbmdbXSwgZmlsdGVyT3RoZXJzID0gZmFsc2UpOiBPYnNlcnZhYmxlPE1lZGlhQ2hhbmdlPiB7XG4gICAgaWYgKG1xTGlzdCAmJiBtcUxpc3QubGVuZ3RoKSB7XG4gICAgICBjb25zdCBtYXRjaE1lZGlhJDogT2JzZXJ2YWJsZTxNZWRpYUNoYW5nZT4gPSB0aGlzLl9vYnNlcnZhYmxlJC5waXBlKFxuICAgICAgICBmaWx0ZXIoKGNoYW5nZTogTWVkaWFDaGFuZ2UpID0+XG4gICAgICAgICAgIWZpbHRlck90aGVycyA/IHRydWUgOiBtcUxpc3QuaW5kZXhPZihjaGFuZ2UubWVkaWFRdWVyeSkgPiAtMVxuICAgICAgICApXG4gICAgICApO1xuICAgICAgY29uc3QgcmVnaXN0cmF0aW9uJDogT2JzZXJ2YWJsZTxNZWRpYUNoYW5nZT4gPSBuZXcgT2JzZXJ2YWJsZShcbiAgICAgICAgKG9ic2VydmVyOiBPYnNlcnZlcjxNZWRpYUNoYW5nZT4pID0+IHtcbiAgICAgICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm1heC1saW5lLWxlbmd0aFxuICAgICAgICAgIGNvbnN0IG1hdGNoZXM6IEFycmF5PE1lZGlhQ2hhbmdlPiA9IHRoaXMucmVnaXN0ZXJRdWVyeShtcUxpc3QpO1xuICAgICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc3QgbGFzdENoYW5nZSA9IG1hdGNoZXMucG9wKCkhO1xuICAgICAgICAgICAgbWF0Y2hlcy5mb3JFYWNoKChlOiBNZWRpYUNoYW5nZSkgPT4ge1xuICAgICAgICAgICAgICBvYnNlcnZlci5uZXh0KGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnNvdXJjZS5uZXh0KGxhc3RDaGFuZ2UpOyAvLyBsYXN0IG1hdGNoIGlzIGNhY2hlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgICAgcmV0dXJuIG1lcmdlKHJlZ2lzdHJhdGlvbiQsIG1hdGNoTWVkaWEkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fb2JzZXJ2YWJsZSQ7XG4gIH1cblxuICAvKipcbiAgICogQmFzZWQgb24gdGhlIEJyZWFrUG9pbnRSZWdpc3RyeSBwcm92aWRlciwgcmVnaXN0ZXIgaW50ZXJuYWwgbGlzdGVuZXJzIGZvciBlYWNoIHVuaXF1ZVxuICAgKiBtZWRpYVF1ZXJ5LiBFYWNoIGxpc3RlbmVyIGVtaXRzIHNwZWNpZmljIE1lZGlhQ2hhbmdlIGRhdGEgdG8gb2JzZXJ2ZXJzXG4gICAqL1xuICByZWdpc3RlclF1ZXJ5KG1lZGlhUXVlcnk6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgbGlzdCA9IEFycmF5LmlzQXJyYXkobWVkaWFRdWVyeSkgPyBtZWRpYVF1ZXJ5IDogW21lZGlhUXVlcnldO1xuICAgIGNvbnN0IG1hdGNoZXM6IE1lZGlhQ2hhbmdlW10gPSBbXTtcblxuICAgIGJ1aWxkUXVlcnlDc3MobGlzdCwgdGhpcy5fZG9jdW1lbnQsIHRoaXMuX25vbmNlKTtcblxuICAgIGxpc3QuZm9yRWFjaCgocXVlcnk6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3Qgb25NUUxFdmVudCA9IChlOiBNZWRpYVF1ZXJ5TGlzdEV2ZW50KSA9PiB7XG4gICAgICAgIHRoaXMuX3pvbmUucnVuKCgpID0+XG4gICAgICAgICAgdGhpcy5zb3VyY2UubmV4dChuZXcgTWVkaWFDaGFuZ2UoZS5tYXRjaGVzLCBxdWVyeSkpXG4gICAgICAgICk7XG4gICAgICB9O1xuXG4gICAgICBsZXQgbXFsID0gdGhpcy5yZWdpc3RyeS5nZXQocXVlcnkpO1xuICAgICAgaWYgKCFtcWwpIHtcbiAgICAgICAgbXFsID0gdGhpcy5idWlsZE1RTChxdWVyeSk7XG4gICAgICAgIG1xbC5hZGRMaXN0ZW5lcihvbk1RTEV2ZW50KTtcbiAgICAgICAgdGhpcy5wZW5kaW5nUmVtb3ZlTGlzdGVuZXJGbnMucHVzaCgoKSA9PlxuICAgICAgICAgIG1xbCEucmVtb3ZlTGlzdGVuZXIob25NUUxFdmVudClcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5yZWdpc3RyeS5zZXQocXVlcnksIG1xbCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChtcWwubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVzLnB1c2gobmV3IE1lZGlhQ2hhbmdlKHRydWUsIHF1ZXJ5KSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbWF0Y2hlcztcbiAgfVxuXG4gIG5nT25EZXN0cm95KCk6IHZvaWQge1xuICAgIGxldCBmbjtcbiAgICB3aGlsZSAoKGZuID0gdGhpcy5wZW5kaW5nUmVtb3ZlTGlzdGVuZXJGbnMucG9wKCkpKSB7XG4gICAgICBmbigpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxsIHdpbmRvdy5tYXRjaE1lZGlhKCkgdG8gYnVpbGQgYSBNZWRpYVF1ZXJ5TGlzdDsgd2hpY2hcbiAgICogc3VwcG9ydHMgMC4ubiBsaXN0ZW5lcnMgZm9yIGFjdGl2YXRpb24vZGVhY3RpdmF0aW9uXG4gICAqL1xuICBwcm90ZWN0ZWQgYnVpbGRNUUwocXVlcnk6IHN0cmluZyk6IE1lZGlhUXVlcnlMaXN0IHtcbiAgICByZXR1cm4gY29uc3RydWN0TXFsKHF1ZXJ5LCBpc1BsYXRmb3JtQnJvd3Nlcih0aGlzLl9wbGF0Zm9ybUlkKSk7XG4gIH1cblxuICBwcm90ZWN0ZWQgX29ic2VydmFibGUkID0gdGhpcy5zb3VyY2UuYXNPYnNlcnZhYmxlKCk7XG59XG5cbi8qKlxuICogUHJpdmF0ZSBnbG9iYWwgcmVnaXN0cnkgZm9yIGFsbCBkeW5hbWljYWxseS1jcmVhdGVkLCBpbmplY3RlZCBzdHlsZSB0YWdzXG4gKiBAc2VlIHByZXBhcmUocXVlcnkpXG4gKi9cbmNvbnN0IEFMTF9TVFlMRVM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fTtcblxuLyoqXG4gKiBGb3IgV2Via2l0IGVuZ2luZXMgdGhhdCBvbmx5IHRyaWdnZXIgdGhlIE1lZGlhUXVlcnlMaXN0IExpc3RlbmVyXG4gKiB3aGVuIHRoZXJlIGlzIGF0IGxlYXN0IG9uZSBDU1Mgc2VsZWN0b3IgZm9yIHRoZSByZXNwZWN0aXZlIG1lZGlhIHF1ZXJ5LlxuICpcbiAqIEBwYXJhbSBtZWRpYVF1ZXJpZXNcbiAqIEBwYXJhbSBfZG9jdW1lbnRcbiAqL1xuZnVuY3Rpb24gYnVpbGRRdWVyeUNzcyhcbiAgbWVkaWFRdWVyaWVzOiBzdHJpbmdbXSxcbiAgX2RvY3VtZW50OiBEb2N1bWVudCxcbiAgX25vbmNlPzogc3RyaW5nIHwgbnVsbFxuKSB7XG4gIGNvbnN0IGxpc3QgPSBtZWRpYVF1ZXJpZXMuZmlsdGVyKChpdCkgPT4gIUFMTF9TVFlMRVNbaXRdKTtcbiAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IHF1ZXJ5ID0gbGlzdC5qb2luKCcsICcpO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHN0eWxlRWwgPSBfZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcblxuICAgICAgc3R5bGVFbC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgIGlmIChfbm9uY2UpIHtcbiAgICAgICAgc3R5bGVFbC5zZXRBdHRyaWJ1dGUoJ25vbmNlJywgX25vbmNlKTtcbiAgICAgIH1cbiAgICAgIGlmICghKHN0eWxlRWwgYXMgYW55KS5zdHlsZVNoZWV0KSB7XG4gICAgICAgIGNvbnN0IGNzc1RleHQgPSBgXG4vKlxuICBAbmdicmFja2V0L25neC1sYXlvdXQgLSB3b3JrYXJvdW5kIGZvciBwb3NzaWJsZSBicm93c2VyIHF1aXJrIHdpdGggbWVkaWFRdWVyeSBsaXN0ZW5lcnNcbiAgc2VlIGh0dHA6Ly9iaXQubHkvMnNkNEhNUFxuKi9cbkBtZWRpYSAke3F1ZXJ5fSB7LmZ4LXF1ZXJ5LXRlc3R7IH19XG5gO1xuICAgICAgICBzdHlsZUVsLmFwcGVuZENoaWxkKF9kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShjc3NUZXh0KSk7XG4gICAgICB9XG5cbiAgICAgIF9kb2N1bWVudC5oZWFkIS5hcHBlbmRDaGlsZChzdHlsZUVsKTtcblxuICAgICAgLy8gU3RvcmUgaW4gcHJpdmF0ZSBnbG9iYWwgcmVnaXN0cnlcbiAgICAgIGxpc3QuZm9yRWFjaCgobXEpID0+IChBTExfU1RZTEVTW21xXSA9IHN0eWxlRWwpKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBidWlsZE1vY2tNcWwocXVlcnk6IHN0cmluZykge1xuICBjb25zdCBldDogYW55ID0gbmV3IEV2ZW50VGFyZ2V0KCk7XG4gIGV0Lm1hdGNoZXMgPSBxdWVyeSA9PT0gJ2FsbCcgfHwgcXVlcnkgPT09ICcnO1xuICBldC5tZWRpYSA9IHF1ZXJ5O1xuICBldC5hZGRMaXN0ZW5lciA9ICgpID0+IHt9O1xuICBldC5yZW1vdmVMaXN0ZW5lciA9ICgpID0+IHt9O1xuICBldC5hZGRFdmVudExpc3RlbmVyID0gKCkgPT4ge307XG4gIGV0LmRpc3BhdGNoRXZlbnQgPSAoKSA9PiBmYWxzZTtcbiAgZXQub25jaGFuZ2UgPSBudWxsO1xuXG4gIHJldHVybiBldCBhcyBNZWRpYVF1ZXJ5TGlzdDtcbn1cblxuZnVuY3Rpb24gY29uc3RydWN0TXFsKHF1ZXJ5OiBzdHJpbmcsIGlzQnJvd3NlcjogYm9vbGVhbik6IE1lZGlhUXVlcnlMaXN0IHtcbiAgY29uc3QgY2FuTGlzdGVuID1cbiAgICBpc0Jyb3dzZXIgJiYgISEoPFdpbmRvdz53aW5kb3cpLm1hdGNoTWVkaWEoJ2FsbCcpLmFkZExpc3RlbmVyO1xuXG4gIHJldHVybiBjYW5MaXN0ZW4gPyAoPFdpbmRvdz53aW5kb3cpLm1hdGNoTWVkaWEocXVlcnkpIDogYnVpbGRNb2NrTXFsKHF1ZXJ5KTtcbn1cbiJdfQ==