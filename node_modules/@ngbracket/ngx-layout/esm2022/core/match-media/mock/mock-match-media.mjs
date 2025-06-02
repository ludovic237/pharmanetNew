/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatchMedia } from '../match-media';
import * as i0 from "@angular/core";
import * as i1 from "../../breakpoints/break-point-registry";
/**
 * MockMatchMedia mocks calls to the Window API matchMedia with a build of a simulated
 * MockMediaQueryListener. Methods are available to simulate an activation of a mediaQuery
 * range and to clearAll mediaQuery listeners.
 */
export class MockMatchMedia extends MatchMedia {
    constructor(_zone, _platformId, _document, _breakpoints) {
        super(_zone, _platformId, _document);
        this._document = _document;
        this._breakpoints = _breakpoints;
        this.autoRegisterQueries = true; // Used for testing BreakPoint registrations
        this.useOverlaps = false; // Allow fallback to overlapping mediaQueries
    }
    /** Easy method to clear all listeners for all mediaQueries */
    clearAll() {
        this.registry.forEach((mql) => {
            mql.destroy();
        });
        this.registry.clear();
        this.useOverlaps = false;
    }
    /** Feature to support manual, simulated activation of a mediaQuery. */
    activate(mediaQuery, useOverlaps = this.useOverlaps) {
        mediaQuery = this._validateQuery(mediaQuery);
        if (useOverlaps || !this.isActive(mediaQuery)) {
            this._deactivateAll();
            this._registerMediaQuery(mediaQuery);
            this._activateWithOverlaps(mediaQuery, useOverlaps);
        }
        return this.hasActivated;
    }
    setNonce(nonce) {
        super._nonce = nonce;
    }
    /** Converts an optional mediaQuery alias to a specific, valid mediaQuery */
    _validateQuery(queryOrAlias) {
        const bp = this._breakpoints.findByAlias(queryOrAlias);
        return bp?.mediaQuery ?? queryOrAlias;
    }
    /**
     * Manually onMediaChange any overlapping mediaQueries to simulate
     * similar functionality in the window.matchMedia()
     */
    _activateWithOverlaps(mediaQuery, useOverlaps) {
        if (useOverlaps) {
            const bp = this._breakpoints.findByQuery(mediaQuery);
            const alias = bp?.alias ?? 'unknown';
            // Simulate activation of overlapping lt-<XXX> ranges
            switch (alias) {
                case 'lg':
                    this._activateByAlias(['lt-xl']);
                    break;
                case 'md':
                    this._activateByAlias(['lt-xl', 'lt-lg']);
                    break;
                case 'sm':
                    this._activateByAlias(['lt-xl', 'lt-lg', 'lt-md']);
                    break;
                case 'xs':
                    this._activateByAlias(['lt-xl', 'lt-lg', 'lt-md', 'lt-sm']);
                    break;
            }
            // Simulate activation of overlapping gt-<xxxx> mediaQuery ranges
            switch (alias) {
                case 'xl':
                    this._activateByAlias(['gt-lg', 'gt-md', 'gt-sm', 'gt-xs']);
                    break;
                case 'lg':
                    this._activateByAlias(['gt-md', 'gt-sm', 'gt-xs']);
                    break;
                case 'md':
                    this._activateByAlias(['gt-sm', 'gt-xs']);
                    break;
                case 'sm':
                    this._activateByAlias(['gt-xs']);
                    break;
            }
        }
        // Activate last since the responsiveActivation is watching *this* mediaQuery
        return this._activateByQuery(mediaQuery);
    }
    /**
     *
     */
    _activateByAlias(aliases) {
        const activate = (alias) => {
            const bp = this._breakpoints.findByAlias(alias);
            this._activateByQuery(bp?.mediaQuery ?? alias);
        };
        aliases.forEach(activate);
    }
    /**
     *
     */
    _activateByQuery(mediaQuery) {
        if (!this.registry.has(mediaQuery) && this.autoRegisterQueries) {
            this._registerMediaQuery(mediaQuery);
        }
        const mql = this.registry.get(mediaQuery);
        if (mql && !this.isActive(mediaQuery)) {
            this.registry.set(mediaQuery, mql.activate());
        }
        return this.hasActivated;
    }
    /** Deactivate all current MQLs and reset the buffer */
    _deactivateAll() {
        this.registry.forEach((it) => {
            it.deactivate();
        });
        return this;
    }
    /** Insure the mediaQuery is registered with MatchMedia */
    _registerMediaQuery(mediaQuery) {
        if (!this.registry.has(mediaQuery) && this.autoRegisterQueries) {
            this.registerQuery(mediaQuery);
        }
    }
    /**
     * Call window.matchMedia() to build a MediaQueryList; which
     * supports 0..n listeners for activation/deactivation
     */
    buildMQL(query) {
        return new MockMediaQueryList(query);
    }
    get hasActivated() {
        return this.activations.length > 0;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MockMatchMedia, deps: [{ token: i0.NgZone }, { token: PLATFORM_ID }, { token: DOCUMENT }, { token: i1.BreakPointRegistry }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MockMatchMedia }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: MockMatchMedia, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i0.NgZone }, { type: Object, decorators: [{
                    type: Inject,
                    args: [PLATFORM_ID]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }, { type: i1.BreakPointRegistry }] });
/**
 * Special internal class to simulate a MediaQueryList and
 * - supports manual activation to simulate mediaQuery matching
 * - manages listeners
 */
export class MockMediaQueryList extends EventTarget {
    get matches() {
        return this._isActive;
    }
    get media() {
        return this._mediaQuery;
    }
    constructor(_mediaQuery) {
        super();
        this._mediaQuery = _mediaQuery;
        this._isActive = false;
        this._listeners = [];
        this.onchange = null;
    }
    /**
     * Destroy the current list by deactivating the
     * listeners and clearing the internal list
     */
    destroy() {
        this.deactivate();
        this._listeners = [];
    }
    /** Notify all listeners that 'matches === TRUE' */
    activate() {
        if (!this._isActive) {
            this._isActive = true;
            this._listeners.forEach((callback) => {
                const cb = callback;
                cb.call(this, { matches: this.matches, media: this.media });
            });
        }
        return this;
    }
    /** Notify all listeners that 'matches === false' */
    deactivate() {
        if (this._isActive) {
            this._isActive = false;
            this._listeners.forEach((callback) => {
                const cb = callback;
                cb.call(this, { matches: this.matches, media: this.media });
            });
        }
        return this;
    }
    /** Add a listener to our internal list to activate later */
    addListener(listener) {
        if (this._listeners.indexOf(listener) === -1) {
            this._listeners.push(listener);
        }
        if (this._isActive) {
            const cb = listener;
            cb.call(this, { matches: this.matches, media: this.media });
        }
    }
    /** Don't need to remove listeners in the testing environment */
    removeListener(_) {
    }
    dispatchEvent(_) {
        return false;
    }
}
/**
 * Pre-configured provider for MockMatchMedia
 */
export const MockMatchMediaProvider = {
    provide: MatchMedia,
    useClass: MockMatchMedia
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9jay1tYXRjaC1tZWRpYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvY29yZS9tYXRjaC1tZWRpYS9tb2NrL21vY2stbWF0Y2gtbWVkaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQVUsV0FBVyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7OztBQUcxQzs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLGNBQWUsU0FBUSxVQUFVO0lBTTVDLFlBQVksS0FBYSxFQUNRLFdBQW1CLEVBQ04sU0FBYyxFQUN4QyxZQUFnQztRQUNsRCxLQUFLLENBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUZPLGNBQVMsR0FBVCxTQUFTLENBQUs7UUFDeEMsaUJBQVksR0FBWixZQUFZLENBQW9CO1FBTnBELHdCQUFtQixHQUFHLElBQUksQ0FBQyxDQUFHLDRDQUE0QztRQUMxRSxnQkFBVyxHQUFHLEtBQUssQ0FBQyxDQUFVLDZDQUE2QztJQU8zRSxDQUFDO0lBRUQsOERBQThEO0lBQzlELFFBQVE7UUFDTixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQW1CLEVBQUUsRUFBRTtZQUMzQyxHQUEwQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3hDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztJQUMzQixDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLFFBQVEsQ0FBQyxVQUFrQixFQUFFLFdBQVcsR0FB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QUM7SUFDSCxDQUFDO0lBRUQsZ0VBQWdFO0lBQ2hFLGNBQWMsQ0FBQyxDQUFnQztJQUMvQyxDQUFDO0lBRVEsYUFBYSxDQUFDLENBQVE7UUFDN0IsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0NBR0Y7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLHNCQUFzQixHQUFHO0lBQ3BDLE9BQU8sRUFBRSxVQUFVO0lBQ25CLFFBQVEsRUFBRSxjQUFjO0NBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBOZ1pvbmUsIFBMQVRGT1JNX0lEfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7TWF0Y2hNZWRpYX0gZnJvbSAnLi4vbWF0Y2gtbWVkaWEnO1xuaW1wb3J0IHtCcmVha1BvaW50UmVnaXN0cnl9IGZyb20gJy4uLy4uL2JyZWFrcG9pbnRzL2JyZWFrLXBvaW50LXJlZ2lzdHJ5JztcblxuLyoqXG4gKiBNb2NrTWF0Y2hNZWRpYSBtb2NrcyBjYWxscyB0byB0aGUgV2luZG93IEFQSSBtYXRjaE1lZGlhIHdpdGggYSBidWlsZCBvZiBhIHNpbXVsYXRlZFxuICogTW9ja01lZGlhUXVlcnlMaXN0ZW5lci4gTWV0aG9kcyBhcmUgYXZhaWxhYmxlIHRvIHNpbXVsYXRlIGFuIGFjdGl2YXRpb24gb2YgYSBtZWRpYVF1ZXJ5XG4gKiByYW5nZSBhbmQgdG8gY2xlYXJBbGwgbWVkaWFRdWVyeSBsaXN0ZW5lcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrTWF0Y2hNZWRpYSBleHRlbmRzIE1hdGNoTWVkaWEge1xuXG5cbiAgYXV0b1JlZ2lzdGVyUXVlcmllcyA9IHRydWU7ICAgLy8gVXNlZCBmb3IgdGVzdGluZyBCcmVha1BvaW50IHJlZ2lzdHJhdGlvbnNcbiAgdXNlT3ZlcmxhcHMgPSBmYWxzZTsgICAgICAgICAgLy8gQWxsb3cgZmFsbGJhY2sgdG8gb3ZlcmxhcHBpbmcgbWVkaWFRdWVyaWVzXG5cbiAgY29uc3RydWN0b3IoX3pvbmU6IE5nWm9uZSxcbiAgICAgICAgICAgICAgQEluamVjdChQTEFURk9STV9JRCkgX3BsYXRmb3JtSWQ6IE9iamVjdCxcbiAgICAgICAgICAgICAgQEluamVjdChET0NVTUVOVCkgcHVibGljIG92ZXJyaWRlIF9kb2N1bWVudDogYW55LFxuICAgICAgICAgICAgICBwcml2YXRlIF9icmVha3BvaW50czogQnJlYWtQb2ludFJlZ2lzdHJ5KSB7XG4gICAgc3VwZXIoX3pvbmUsIF9wbGF0Zm9ybUlkLCBfZG9jdW1lbnQpO1xuICB9XG5cbiAgLyoqIEVhc3kgbWV0aG9kIHRvIGNsZWFyIGFsbCBsaXN0ZW5lcnMgZm9yIGFsbCBtZWRpYVF1ZXJpZXMgKi9cbiAgY2xlYXJBbGwoKSB7XG4gICAgdGhpcy5yZWdpc3RyeS5mb3JFYWNoKChtcWw6IE1lZGlhUXVlcnlMaXN0KSA9PiB7XG4gICAgICAobXFsIGFzIE1vY2tNZWRpYVF1ZXJ5TGlzdCkuZGVzdHJveSgpO1xuICAgIH0pO1xuICAgIHRoaXMucmVnaXN0cnkuY2xlYXIoKTtcbiAgICB0aGlzLnVzZU92ZXJsYXBzID0gZmFsc2U7XG4gIH1cblxuICAvKiogRmVhdHVyZSB0byBzdXBwb3J0IG1hbnVhbCwgc2ltdWxhdGVkIGFjdGl2YXRpb24gb2YgYSBtZWRpYVF1ZXJ5LiAqL1xuICBhY3RpdmF0ZShtZWRpYVF1ZXJ5OiBzdHJpbmcsIHVzZU92ZXJsYXBzID0gdGhpcy51c2VPdmVybGFwcyk6IGJvb2xlYW4ge1xuICAgIG1lZGlhUXVlcnkgPSB0aGlzLl92YWxpZGF0ZVF1ZXJ5KG1lZGlhUXVlcnkpO1xuXG4gICAgaWYgKHVzZU92ZXJsYXBzIHx8ICF0aGlzLmlzQWN0aXZlKG1lZGlhUXVlcnkpKSB7XG4gICAgICB0aGlzLl9kZWFjdGl2YXRlQWxsKCk7XG5cbiAgICAgIHRoaXMuX3JlZ2lzdGVyTWVkaWFRdWVyeShtZWRpYVF1ZXJ5KTtcbiAgICAgIHRoaXMuX2FjdGl2YXRlV2l0aE92ZXJsYXBzKG1lZGlhUXVlcnksIHVzZU92ZXJsYXBzKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5oYXNBY3RpdmF0ZWQ7XG4gIH1cblxuICBzZXROb25jZShub25jZTogc3RyaW5nIHwgbnVsbCkge1xuICAgIHN1cGVyLl9ub25jZSA9IG5vbmNlO1xuICB9XG4gIC8qKiBDb252ZXJ0cyBhbiBvcHRpb25hbCBtZWRpYVF1ZXJ5IGFsaWFzIHRvIGEgc3BlY2lmaWMsIHZhbGlkIG1lZGlhUXVlcnkgKi9cbiAgX3ZhbGlkYXRlUXVlcnkocXVlcnlPckFsaWFzOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IGJwID0gdGhpcy5fYnJlYWtwb2ludHMuZmluZEJ5QWxpYXMocXVlcnlPckFsaWFzKTtcbiAgICByZXR1cm4gYnA/Lm1lZGlhUXVlcnkgPz8gcXVlcnlPckFsaWFzO1xuICB9XG5cbiAgLyoqXG4gICAqIE1hbnVhbGx5IG9uTWVkaWFDaGFuZ2UgYW55IG92ZXJsYXBwaW5nIG1lZGlhUXVlcmllcyB0byBzaW11bGF0ZVxuICAgKiBzaW1pbGFyIGZ1bmN0aW9uYWxpdHkgaW4gdGhlIHdpbmRvdy5tYXRjaE1lZGlhKClcbiAgICovXG4gIHByaXZhdGUgX2FjdGl2YXRlV2l0aE92ZXJsYXBzKG1lZGlhUXVlcnk6IHN0cmluZywgdXNlT3ZlcmxhcHM6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgICBpZiAodXNlT3ZlcmxhcHMpIHtcbiAgICAgIGNvbnN0IGJwID0gdGhpcy5fYnJlYWtwb2ludHMuZmluZEJ5UXVlcnkobWVkaWFRdWVyeSk7XG4gICAgICBjb25zdCBhbGlhcyA9IGJwPy5hbGlhcyA/PyAndW5rbm93bic7XG5cbiAgICAgIC8vIFNpbXVsYXRlIGFjdGl2YXRpb24gb2Ygb3ZlcmxhcHBpbmcgbHQtPFhYWD4gcmFuZ2VzXG4gICAgICBzd2l0Y2ggKGFsaWFzKSB7XG4gICAgICAgIGNhc2UgJ2xnJzpcbiAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUJ5QWxpYXMoWydsdC14bCddKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbWQnOlxuICAgICAgICAgIHRoaXMuX2FjdGl2YXRlQnlBbGlhcyhbJ2x0LXhsJywgJ2x0LWxnJ10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdzbSc6XG4gICAgICAgICAgdGhpcy5fYWN0aXZhdGVCeUFsaWFzKFsnbHQteGwnLCAnbHQtbGcnLCAnbHQtbWQnXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3hzJzpcbiAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUJ5QWxpYXMoWydsdC14bCcsICdsdC1sZycsICdsdC1tZCcsICdsdC1zbSddKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gU2ltdWxhdGUgYWN0aXZhdGlvbiBvZiBvdmVybGFwcGluZyBndC08eHh4eD4gbWVkaWFRdWVyeSByYW5nZXNcbiAgICAgIHN3aXRjaCAoYWxpYXMpIHtcbiAgICAgICAgY2FzZSAneGwnOlxuICAgICAgICAgIHRoaXMuX2FjdGl2YXRlQnlBbGlhcyhbJ2d0LWxnJywgJ2d0LW1kJywgJ2d0LXNtJywgJ2d0LXhzJ10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdsZyc6XG4gICAgICAgICAgdGhpcy5fYWN0aXZhdGVCeUFsaWFzKFsnZ3QtbWQnLCAnZ3Qtc20nLCAnZ3QteHMnXSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21kJzpcbiAgICAgICAgICB0aGlzLl9hY3RpdmF0ZUJ5QWxpYXMoWydndC1zbScsICdndC14cyddKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnc20nOlxuICAgICAgICAgIHRoaXMuX2FjdGl2YXRlQnlBbGlhcyhbJ2d0LXhzJ10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFjdGl2YXRlIGxhc3Qgc2luY2UgdGhlIHJlc3BvbnNpdmVBY3RpdmF0aW9uIGlzIHdhdGNoaW5nICp0aGlzKiBtZWRpYVF1ZXJ5XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2YXRlQnlRdWVyeShtZWRpYVF1ZXJ5KTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfYWN0aXZhdGVCeUFsaWFzKGFsaWFzZXM6IHN0cmluZ1tdKSB7XG4gICAgY29uc3QgYWN0aXZhdGUgPSAoYWxpYXM6IHN0cmluZykgPT4ge1xuICAgICAgY29uc3QgYnAgPSB0aGlzLl9icmVha3BvaW50cy5maW5kQnlBbGlhcyhhbGlhcyk7XG4gICAgICB0aGlzLl9hY3RpdmF0ZUJ5UXVlcnkoYnA/Lm1lZGlhUXVlcnkgPz8gYWxpYXMpO1xuICAgIH07XG4gICAgYWxpYXNlcy5mb3JFYWNoKGFjdGl2YXRlKTtcbiAgfVxuXG4gIC8qKlxuICAgKlxuICAgKi9cbiAgcHJpdmF0ZSBfYWN0aXZhdGVCeVF1ZXJ5KG1lZGlhUXVlcnk6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yZWdpc3RyeS5oYXMobWVkaWFRdWVyeSkgJiYgdGhpcy5hdXRvUmVnaXN0ZXJRdWVyaWVzKSB7XG4gICAgICB0aGlzLl9yZWdpc3Rlck1lZGlhUXVlcnkobWVkaWFRdWVyeSk7XG4gICAgfVxuICAgIGNvbnN0IG1xbDogTW9ja01lZGlhUXVlcnlMaXN0ID0gdGhpcy5yZWdpc3RyeS5nZXQobWVkaWFRdWVyeSkgYXMgTW9ja01lZGlhUXVlcnlMaXN0O1xuXG4gICAgaWYgKG1xbCAmJiAhdGhpcy5pc0FjdGl2ZShtZWRpYVF1ZXJ5KSkge1xuICAgICAgdGhpcy5yZWdpc3RyeS5zZXQobWVkaWFRdWVyeSwgbXFsLmFjdGl2YXRlKCkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5oYXNBY3RpdmF0ZWQ7XG4gIH1cblxuICAvKiogRGVhY3RpdmF0ZSBhbGwgY3VycmVudCBNUUxzIGFuZCByZXNldCB0aGUgYnVmZmVyICovXG4gIHByaXZhdGUgX2RlYWN0aXZhdGVBbGwoKSB7XG4gICAgdGhpcy5yZWdpc3RyeS5mb3JFYWNoKChpdDogTWVkaWFRdWVyeUxpc3QpID0+IHtcbiAgICAgIChpdCBhcyBNb2NrTWVkaWFRdWVyeUxpc3QpLmRlYWN0aXZhdGUoKTtcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBJbnN1cmUgdGhlIG1lZGlhUXVlcnkgaXMgcmVnaXN0ZXJlZCB3aXRoIE1hdGNoTWVkaWEgKi9cbiAgcHJpdmF0ZSBfcmVnaXN0ZXJNZWRpYVF1ZXJ5KG1lZGlhUXVlcnk6IHN0cmluZykge1xuICAgIGlmICghdGhpcy5yZWdpc3RyeS5oYXMobWVkaWFRdWVyeSkgJiYgdGhpcy5hdXRvUmVnaXN0ZXJRdWVyaWVzKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyUXVlcnkobWVkaWFRdWVyeSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgd2luZG93Lm1hdGNoTWVkaWEoKSB0byBidWlsZCBhIE1lZGlhUXVlcnlMaXN0OyB3aGljaFxuICAgKiBzdXBwb3J0cyAwLi5uIGxpc3RlbmVycyBmb3IgYWN0aXZhdGlvbi9kZWFjdGl2YXRpb25cbiAgICovXG4gIHByb3RlY3RlZCBvdmVycmlkZSBidWlsZE1RTChxdWVyeTogc3RyaW5nKTogTWVkaWFRdWVyeUxpc3Qge1xuICAgIHJldHVybiBuZXcgTW9ja01lZGlhUXVlcnlMaXN0KHF1ZXJ5KTtcbiAgfVxuXG4gIHByb3RlY3RlZCBnZXQgaGFzQWN0aXZhdGVkKCkge1xuICAgIHJldHVybiB0aGlzLmFjdGl2YXRpb25zLmxlbmd0aCA+IDA7XG4gIH1cblxufVxuXG4vKipcbiAqIFNwZWNpYWwgaW50ZXJuYWwgY2xhc3MgdG8gc2ltdWxhdGUgYSBNZWRpYVF1ZXJ5TGlzdCBhbmRcbiAqIC0gc3VwcG9ydHMgbWFudWFsIGFjdGl2YXRpb24gdG8gc2ltdWxhdGUgbWVkaWFRdWVyeSBtYXRjaGluZ1xuICogLSBtYW5hZ2VzIGxpc3RlbmVyc1xuICovXG5leHBvcnQgY2xhc3MgTW9ja01lZGlhUXVlcnlMaXN0IGV4dGVuZHMgRXZlbnRUYXJnZXQgaW1wbGVtZW50cyBNZWRpYVF1ZXJ5TGlzdCB7XG4gIHByaXZhdGUgX2lzQWN0aXZlID0gZmFsc2U7XG4gIHByaXZhdGUgX2xpc3RlbmVyczogTWVkaWFRdWVyeUxpc3RMaXN0ZW5lcltdID0gW107XG5cbiAgZ2V0IG1hdGNoZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgZ2V0IG1lZGlhKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX21lZGlhUXVlcnk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9tZWRpYVF1ZXJ5OiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3kgdGhlIGN1cnJlbnQgbGlzdCBieSBkZWFjdGl2YXRpbmcgdGhlXG4gICAqIGxpc3RlbmVycyBhbmQgY2xlYXJpbmcgdGhlIGludGVybmFsIGxpc3RcbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJzID0gW107XG4gIH1cblxuICAvKiogTm90aWZ5IGFsbCBsaXN0ZW5lcnMgdGhhdCAnbWF0Y2hlcyA9PT0gVFJVRScgKi9cbiAgYWN0aXZhdGUoKTogTW9ja01lZGlhUXVlcnlMaXN0IHtcbiAgICBpZiAoIXRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICB0aGlzLl9pc0FjdGl2ZSA9IHRydWU7XG4gICAgICB0aGlzLl9saXN0ZW5lcnMuZm9yRWFjaCgoY2FsbGJhY2spID0+IHtcbiAgICAgICAgY29uc3QgY2I6ICgodGhpczogTWVkaWFRdWVyeUxpc3QsIGV2OiBNZWRpYVF1ZXJ5TGlzdEV2ZW50KSA9PiBhbnkpID0gY2FsbGJhY2shO1xuICAgICAgICBjYi5jYWxsKHRoaXMsIHttYXRjaGVzOiB0aGlzLm1hdGNoZXMsIG1lZGlhOiB0aGlzLm1lZGlhfSBhcyBNZWRpYVF1ZXJ5TGlzdEV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKiBOb3RpZnkgYWxsIGxpc3RlbmVycyB0aGF0ICdtYXRjaGVzID09PSBmYWxzZScgKi9cbiAgZGVhY3RpdmF0ZSgpOiBNb2NrTWVkaWFRdWVyeUxpc3Qge1xuICAgIGlmICh0aGlzLl9pc0FjdGl2ZSkge1xuICAgICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5mb3JFYWNoKChjYWxsYmFjaykgPT4ge1xuICAgICAgICBjb25zdCBjYjogKCh0aGlzOiBNZWRpYVF1ZXJ5TGlzdCwgZXY6IE1lZGlhUXVlcnlMaXN0RXZlbnQpID0+IGFueSkgPSBjYWxsYmFjayE7XG4gICAgICAgIGNiLmNhbGwodGhpcywge21hdGNoZXM6IHRoaXMubWF0Y2hlcywgbWVkaWE6IHRoaXMubWVkaWF9IGFzIE1lZGlhUXVlcnlMaXN0RXZlbnQpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqIEFkZCBhIGxpc3RlbmVyIHRvIG91ciBpbnRlcm5hbCBsaXN0IHRvIGFjdGl2YXRlIGxhdGVyICovXG4gIGFkZExpc3RlbmVyKGxpc3RlbmVyOiBNZWRpYVF1ZXJ5TGlzdExpc3RlbmVyKSB7XG4gICAgaWYgKHRoaXMuX2xpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKSA9PT0gLTEpIHtcbiAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICBjb25zdCBjYjogKCh0aGlzOiBNZWRpYVF1ZXJ5TGlzdCwgZXY6IE1lZGlhUXVlcnlMaXN0RXZlbnQpID0+IGFueSkgPSBsaXN0ZW5lciE7XG4gICAgICBjYi5jYWxsKHRoaXMsIHttYXRjaGVzOiB0aGlzLm1hdGNoZXMsIG1lZGlhOiB0aGlzLm1lZGlhfSBhcyBNZWRpYVF1ZXJ5TGlzdEV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKiogRG9uJ3QgbmVlZCB0byByZW1vdmUgbGlzdGVuZXJzIGluIHRoZSB0ZXN0aW5nIGVudmlyb25tZW50ICovXG4gIHJlbW92ZUxpc3RlbmVyKF86IE1lZGlhUXVlcnlMaXN0TGlzdGVuZXIgfCBudWxsKSB7XG4gIH1cblxuICBvdmVycmlkZSBkaXNwYXRjaEV2ZW50KF86IEV2ZW50KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgb25jaGFuZ2U6IE1lZGlhUXVlcnlMaXN0TGlzdGVuZXIgPSBudWxsO1xufVxuXG4vKipcbiAqIFByZS1jb25maWd1cmVkIHByb3ZpZGVyIGZvciBNb2NrTWF0Y2hNZWRpYVxuICovXG5leHBvcnQgY29uc3QgTW9ja01hdGNoTWVkaWFQcm92aWRlciA9IHsgIC8vIHRzbGludDpkaXNhYmxlLWxpbmU6dmFyaWFibGUtbmFtZVxuICBwcm92aWRlOiBNYXRjaE1lZGlhLFxuICB1c2VDbGFzczogTW9ja01hdGNoTWVkaWFcbn07XG5cbnR5cGUgTWVkaWFRdWVyeUxpc3RMaXN0ZW5lciA9ICgodGhpczogTWVkaWFRdWVyeUxpc3QsIGV2OiBNZWRpYVF1ZXJ5TGlzdEV2ZW50KSA9PiBhbnkpIHwgbnVsbDtcbiJdfQ==