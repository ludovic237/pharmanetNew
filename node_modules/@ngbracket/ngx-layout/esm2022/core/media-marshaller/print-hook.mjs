/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable } from '@angular/core';
import { mergeAlias } from '../add-alias';
import { MediaChange } from '../media-change';
import { LAYOUT_CONFIG } from '../tokens/library-config';
import { sortDescendingPriority } from '../utils/sort';
import { DOCUMENT } from '@angular/common';
import * as i0 from "@angular/core";
import * as i1 from "../breakpoints/break-point-registry";
const PRINT = 'print';
export const BREAKPOINT_PRINT = {
    alias: PRINT,
    mediaQuery: PRINT,
    priority: 1000
};
/**
 * PrintHook - Use to intercept print MediaQuery activations and force
 *             layouts to render with the specified print alias/breakpoint
 *
 * Used in MediaMarshaller and MediaObserver
 */
export class PrintHook {
    constructor(breakpoints, layoutConfig, _document) {
        this.breakpoints = breakpoints;
        this.layoutConfig = layoutConfig;
        this._document = _document;
        // registeredBeforeAfterPrintHooks tracks if we registered the `beforeprint`
        //  and `afterprint` event listeners.
        this.registeredBeforeAfterPrintHooks = false;
        // isPrintingBeforeAfterEvent is used to track if we are printing from within
        // a `beforeprint` event handler. This prevents the typical `stopPrinting`
        // form `interceptEvents` so that printing is not stopped while the dialog
        // is still open. This is an extension of the `isPrinting` property on
        // browsers which support `beforeprint` and `afterprint` events.
        this.isPrintingBeforeAfterEvent = false;
        this.beforePrintEventListeners = [];
        this.afterPrintEventListeners = [];
        this.formerActivations = null;
        // Is this service currently in print mode
        this.isPrinting = false;
        this.queue = new PrintQueue();
        this.deactivations = [];
    }
    /** Add 'print' mediaQuery: to listen for matchMedia activations */
    withPrintQuery(queries) {
        return [...queries, PRINT];
    }
    /** Is the MediaChange event for any 'print' @media */
    isPrintEvent(e) {
        return e.mediaQuery.startsWith(PRINT);
    }
    /** What is the desired mqAlias to use while printing? */
    get printAlias() {
        return [...(this.layoutConfig.printWithBreakpoints ?? [])];
    }
    /** Lookup breakpoints associated with print aliases. */
    get printBreakPoints() {
        return this.printAlias
            .map(alias => this.breakpoints.findByAlias(alias))
            .filter(bp => bp !== null);
    }
    /** Lookup breakpoint associated with mediaQuery */
    getEventBreakpoints({ mediaQuery }) {
        const bp = this.breakpoints.findByQuery(mediaQuery);
        const list = bp ? [...this.printBreakPoints, bp] : this.printBreakPoints;
        return list.sort(sortDescendingPriority);
    }
    /** Update event with printAlias mediaQuery information */
    updateEvent(event) {
        let bp = this.breakpoints.findByQuery(event.mediaQuery);
        if (this.isPrintEvent(event)) {
            // Reset from 'print' to first (highest priority) print breakpoint
            bp = this.getEventBreakpoints(event)[0];
            event.mediaQuery = bp?.mediaQuery ?? '';
        }
        return mergeAlias(event, bp);
    }
    // registerBeforeAfterPrintHooks registers a `beforeprint` event hook so we can
    // trigger print styles synchronously and apply proper layout styles.
    // It is a noop if the hooks have already been registered or if the document's
    // `defaultView` is not available.
    registerBeforeAfterPrintHooks(target) {
        // `defaultView` may be null when rendering on the server or in other contexts.
        if (!this._document.defaultView || this.registeredBeforeAfterPrintHooks) {
            return;
        }
        this.registeredBeforeAfterPrintHooks = true;
        const beforePrintListener = () => {
            // If we aren't already printing, start printing and update the styles as
            // if there was a regular print `MediaChange`(from matchMedia).
            if (!this.isPrinting) {
                this.isPrintingBeforeAfterEvent = true;
                this.startPrinting(target, this.getEventBreakpoints(new MediaChange(true, PRINT)));
                target.updateStyles();
            }
        };
        const afterPrintListener = () => {
            // If we aren't already printing, start printing and update the styles as
            // if there was a regular print `MediaChange`(from matchMedia).
            this.isPrintingBeforeAfterEvent = false;
            if (this.isPrinting) {
                this.stopPrinting(target);
                target.updateStyles();
            }
        };
        // Could we have teardown logic to remove if there are no print listeners being used?
        this._document.defaultView.addEventListener('beforeprint', beforePrintListener);
        this._document.defaultView.addEventListener('afterprint', afterPrintListener);
        this.beforePrintEventListeners.push(beforePrintListener);
        this.afterPrintEventListeners.push(afterPrintListener);
    }
    /**
     * Prepare RxJS tap operator with partial application
     * @return pipeable tap predicate
     */
    interceptEvents(target) {
        return (event) => {
            if (this.isPrintEvent(event)) {
                if (event.matches && !this.isPrinting) {
                    this.startPrinting(target, this.getEventBreakpoints(event));
                    target.updateStyles();
                }
                else if (!event.matches && this.isPrinting && !this.isPrintingBeforeAfterEvent) {
                    this.stopPrinting(target);
                    target.updateStyles();
                }
                return;
            }
            this.collectActivations(target, event);
        };
    }
    /** Stop mediaChange event propagation in event streams */
    blockPropagation() {
        return (event) => {
            return !(this.isPrinting || this.isPrintEvent(event));
        };
    }
    /**
     * Save current activateBreakpoints (for later restore)
     * and substitute only the printAlias breakpoint
     */
    startPrinting(target, bpList) {
        this.isPrinting = true;
        this.formerActivations = target.activatedBreakpoints;
        target.activatedBreakpoints = this.queue.addPrintBreakpoints(bpList);
    }
    /** For any print de-activations, reset the entire print queue */
    stopPrinting(target) {
        target.activatedBreakpoints = this.deactivations;
        this.deactivations = [];
        this.formerActivations = null;
        this.queue.clear();
        this.isPrinting = false;
    }
    /**
     * To restore pre-Print Activations, we must capture the proper
     * list of breakpoint activations BEFORE print starts. OnBeforePrint()
     * is supported; so 'print' mediaQuery activations are used as a fallback
     * in browsers without `beforeprint` support.
     *
     * >  But activated breakpoints are deactivated BEFORE 'print' activation.
     *
     * Let's capture all de-activations using the following logic:
     *
     *  When not printing:
     *    - clear cache when activating non-print breakpoint
     *    - update cache (and sort) when deactivating
     *
     *  When printing:
     *    - sort and save when starting print
     *    - restore as activatedTargets and clear when stop printing
     */
    collectActivations(target, event) {
        if (!this.isPrinting || this.isPrintingBeforeAfterEvent) {
            if (!this.isPrintingBeforeAfterEvent) {
                // Only clear deactivations if we aren't printing from a `beforeprint` event.
                // Otherwise, this will clear before `stopPrinting()` is called to restore
                // the pre-Print Activations.
                this.deactivations = [];
                return;
            }
            if (!event.matches) {
                const bp = this.breakpoints.findByQuery(event.mediaQuery);
                // Deactivating a breakpoint
                if (bp) {
                    const hasFormerBp = this.formerActivations && this.formerActivations.includes(bp);
                    const wasActivated = !this.formerActivations && target.activatedBreakpoints.includes(bp);
                    const shouldDeactivate = hasFormerBp || wasActivated;
                    if (shouldDeactivate) {
                        this.deactivations.push(bp);
                        this.deactivations.sort(sortDescendingPriority);
                    }
                }
            }
        }
    }
    /** Teardown logic for the service. */
    ngOnDestroy() {
        if (this._document.defaultView) {
            this.beforePrintEventListeners.forEach(l => this._document.defaultView.removeEventListener('beforeprint', l));
            this.afterPrintEventListeners.forEach(l => this._document.defaultView.removeEventListener('afterprint', l));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: PrintHook, deps: [{ token: i1.BreakPointRegistry }, { token: LAYOUT_CONFIG }, { token: DOCUMENT }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: PrintHook, providedIn: 'root' }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0", ngImport: i0, type: PrintHook, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }], ctorParameters: () => [{ type: i1.BreakPointRegistry }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [LAYOUT_CONFIG]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [DOCUMENT]
                }] }] });
// ************************************************************************
// Internal Utility class 'PrintQueue'
// ************************************************************************
/**
 * Utility class to manage print breakpoints + activatedBreakpoints
 * with correct sorting WHILE printing
 */
class PrintQueue {
    constructor() {
        /** Sorted queue with prioritized print breakpoints */
        this.printBreakpoints = [];
    }
    addPrintBreakpoints(bpList) {
        bpList.push(BREAKPOINT_PRINT);
        bpList.sort(sortDescendingPriority);
        bpList.forEach(bp => this.addBreakpoint(bp));
        return this.printBreakpoints;
    }
    /** Add Print breakpoint to queue */
    addBreakpoint(bp) {
        if (!!bp) {
            const bpInList = this.printBreakpoints.find(it => it.mediaQuery === bp.mediaQuery);
            if (bpInList === undefined) {
                // If this is a `printAlias` breakpoint, then append. If a true 'print' breakpoint,
                // register as highest priority in the queue
                this.printBreakpoints = isPrintBreakPoint(bp) ? [bp, ...this.printBreakpoints]
                    : [...this.printBreakpoints, bp];
            }
        }
    }
    /** Restore original activated breakpoints and clear internal caches */
    clear() {
        this.printBreakpoints = [];
    }
}
// ************************************************************************
// Internal Utility methods
// ************************************************************************
/** Only support intercept queueing if the Breakpoint is a print @media query */
function isPrintBreakPoint(bp) {
    return bp?.mediaQuery.startsWith(PRINT) ?? false;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbnQtaG9vay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvY29yZS9tZWRpYS1tYXJzaGFsbGVyL3ByaW50LWhvb2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBQ0gsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQVksTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN4QyxPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFNUMsT0FBTyxFQUFDLGFBQWEsRUFBc0IsTUFBTSwwQkFBMEIsQ0FBQztBQUU1RSxPQUFPLEVBQUMsc0JBQXNCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDckQsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGlCQUFpQixDQUFDOzs7QUFVekMsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLEtBQUssRUFBRSxLQUFLO0lBQ1osVUFBVSxFQUFFLEtBQUs7SUFDakIsUUFBUSxFQUFFLElBQUk7Q0FDZixDQUFDO0FBRUY7Ozs7O0dBS0c7QUFFSCxNQUFNLE9BQU8sU0FBUztJQUNwQixZQUNjLFdBQStCLEVBQ1IsWUFBaUMsRUFDdEMsU0FBYztRQUZoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBb0I7UUFDUixpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFDdEMsY0FBUyxHQUFULFNBQVMsQ0FBSztRQStDOUMsNEVBQTRFO1FBQzVFLHFDQUFxQztRQUM3QixvQ0FBK0IsR0FBRyxLQUFLLENBQUM7UUFFaEQsNkVBQTZFO1FBQzdFLDBFQUEwRTtRQUMxRSwwRUFBMEU7UUFDMUUsc0VBQXNFO1FBQ3RFLGdFQUFnRTtRQUN4RCwrQkFBMEIsR0FBRyxLQUFLLENBQUM7UUFFbkMsOEJBQXlC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QUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEtBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBRW5GLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dCQUMzQixtRkFBbUY7Z0JBQ25GLDRDQUE0QztnQkFDNUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztvQkFDMUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkMsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsdUVBQXVFO0lBQ3ZFLEtBQUs7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7Q0FDRjtBQUVELDJFQUEyRTtBQUMzRSwyQkFBMkI7QUFDM0IsMkVBQTJFO0FBRTNFLGdGQUFnRjtBQUNoRixTQUFTLGlCQUFpQixDQUFDLEVBQXNCO0lBQy9DLE9BQU8sRUFBRSxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDO0FBQ25ELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBPbkRlc3Ryb3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge21lcmdlQWxpYXN9IGZyb20gJy4uL2FkZC1hbGlhcyc7XG5pbXBvcnQge01lZGlhQ2hhbmdlfSBmcm9tICcuLi9tZWRpYS1jaGFuZ2UnO1xuaW1wb3J0IHtCcmVha1BvaW50fSBmcm9tICcuLi9icmVha3BvaW50cy9icmVhay1wb2ludCc7XG5pbXBvcnQge0xBWU9VVF9DT05GSUcsIExheW91dENvbmZpZ09wdGlvbnN9IGZyb20gJy4uL3Rva2Vucy9saWJyYXJ5LWNvbmZpZyc7XG5pbXBvcnQge0JyZWFrUG9pbnRSZWdpc3RyeSwgT3B0aW9uYWxCcmVha1BvaW50fSBmcm9tICcuLi9icmVha3BvaW50cy9icmVhay1wb2ludC1yZWdpc3RyeSc7XG5pbXBvcnQge3NvcnREZXNjZW5kaW5nUHJpb3JpdHl9IGZyb20gJy4uL3V0aWxzL3NvcnQnO1xuaW1wb3J0IHtET0NVTUVOVH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuLyoqXG4gKiBJbnRlcmZhY2UgdG8gYXBwbHkgUHJpbnRIb29rIHRvIGNhbGwgYW5vbnltb3VzIGB0YXJnZXQudXBkYXRlU3R5bGVzKClgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9va1RhcmdldCB7XG4gIGFjdGl2YXRlZEJyZWFrcG9pbnRzOiBCcmVha1BvaW50W107XG4gIHVwZGF0ZVN0eWxlcygpOiB2b2lkO1xufVxuXG5jb25zdCBQUklOVCA9ICdwcmludCc7XG5leHBvcnQgY29uc3QgQlJFQUtQT0lOVF9QUklOVCA9IHtcbiAgYWxpYXM6IFBSSU5ULFxuICBtZWRpYVF1ZXJ5OiBQUklOVCxcbiAgcHJpb3JpdHk6IDEwMDBcbn07XG5cbi8qKlxuICogUHJpbnRIb29rIC0gVXNlIHRvIGludGVyY2VwdCBwcmludCBNZWRpYVF1ZXJ5IGFjdGl2YXRpb25zIGFuZCBmb3JjZVxuICogICAgICAgICAgICAgbGF5b3V0cyB0byByZW5kZXIgd2l0aCB0aGUgc3BlY2lmaWVkIHByaW50IGFsaWFzL2JyZWFrcG9pbnRcbiAqXG4gKiBVc2VkIGluIE1lZGlhTWFyc2hhbGxlciBhbmQgTWVkaWFPYnNlcnZlclxuICovXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBQcmludEhvb2sgaW1wbGVtZW50cyBPbkRlc3Ryb3kge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByb3RlY3RlZCBicmVha3BvaW50czogQnJlYWtQb2ludFJlZ2lzdHJ5LFxuICAgICAgQEluamVjdChMQVlPVVRfQ09ORklHKSBwcm90ZWN0ZWQgbGF5b3V0Q29uZmlnOiBMYXlvdXRDb25maWdPcHRpb25zLFxuICAgICAgQEluamVjdChET0NVTUVOVCkgcHJvdGVjdGVkIF9kb2N1bWVudDogYW55KSB7XG4gIH1cblxuICAvKiogQWRkICdwcmludCcgbWVkaWFRdWVyeTogdG8gbGlzdGVuIGZvciBtYXRjaE1lZGlhIGFjdGl2YXRpb25zICovXG4gIHdpdGhQcmludFF1ZXJ5KHF1ZXJpZXM6IHN0cmluZ1tdKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbLi4ucXVlcmllcywgUFJJTlRdO1xuICB9XG5cbiAgLyoqIElzIHRoZSBNZWRpYUNoYW5nZSBldmVudCBmb3IgYW55ICdwcmludCcgQG1lZGlhICovXG4gIGlzUHJpbnRFdmVudChlOiBNZWRpYUNoYW5nZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBlLm1lZGlhUXVlcnkuc3RhcnRzV2l0aChQUklOVCk7XG4gIH1cblxuICAvKiogV2hhdCBpcyB0aGUgZGVzaXJlZCBtcUFsaWFzIHRvIHVzZSB3aGlsZSBwcmludGluZz8gKi9cbiAgZ2V0IHByaW50QWxpYXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBbLi4uKHRoaXMubGF5b3V0Q29uZmlnLnByaW50V2l0aEJyZWFrcG9pbnRzID8/IFtdKV07XG4gIH1cblxuICAvKiogTG9va3VwIGJyZWFrcG9pbnRzIGFzc29jaWF0ZWQgd2l0aCBwcmludCBhbGlhc2VzLiAqL1xuICBnZXQgcHJpbnRCcmVha1BvaW50cygpOiBCcmVha1BvaW50W10ge1xuICAgIHJldHVybiB0aGlzLnByaW50QWxpYXNcbiAgICAgICAgLm1hcChhbGlhcyA9PiB0aGlzLmJyZWFrcG9pbnRzLmZpbmRCeUFsaWFzKGFsaWFzKSlcbiAgICAgICAgLmZpbHRlcihicCA9PiBicCAhPT0gbnVsbCkgYXMgQnJlYWtQb2ludFtdO1xuICB9XG5cbiAgLyoqIExvb2t1cCBicmVha3BvaW50IGFzc29jaWF0ZWQgd2l0aCBtZWRpYVF1ZXJ5ICovXG4gIGdldEV2ZW50QnJlYWtwb2ludHMoe21lZGlhUXVlcnl9OiBNZWRpYUNoYW5nZSk6IEJyZWFrUG9pbnRbXSB7XG4gICAgY29uc3QgYnAgPSB0aGlzLmJyZWFrcG9pbnRzLmZpbmRCeVF1ZXJ5KG1lZGlhUXVlcnkpO1xuICAgIGNvbnN0IGxpc3QgPSBicCA/IFsuLi50aGlzLnByaW50QnJlYWtQb2ludHMsIGJwXSA6IHRoaXMucHJpbnRCcmVha1BvaW50cztcblxuICAgIHJldHVybiBsaXN0LnNvcnQoc29ydERlc2NlbmRpbmdQcmlvcml0eSk7XG4gIH1cblxuICAvKiogVXBkYXRlIGV2ZW50IHdpdGggcHJpbnRBbGlhcyBtZWRpYVF1ZXJ5IGluZm9ybWF0aW9uICovXG4gIHVwZGF0ZUV2ZW50KGV2ZW50OiBNZWRpYUNoYW5nZSk6IE1lZGlhQ2hhbmdlIHtcbiAgICBsZXQgYnA6IE9wdGlvbmFsQnJlYWtQb2ludCA9IHRoaXMuYnJlYWtwb2ludHMuZmluZEJ5UXVlcnkoZXZlbnQubWVkaWFRdWVyeSk7XG5cbiAgICBpZiAodGhpcy5pc1ByaW50RXZlbnQoZXZlbnQpKSB7XG4gICAgICAvLyBSZXNldCBmcm9tICdwcmludCcgdG8gZmlyc3QgKGhpZ2hlc3QgcHJpb3JpdHkpIHByaW50IGJyZWFrcG9pbnRcbiAgICAgIGJwID0gdGhpcy5nZXRFdmVudEJyZWFrcG9pbnRzKGV2ZW50KVswXTtcbiAgICAgIGV2ZW50Lm1lZGlhUXVlcnkgPSBicD8ubWVkaWFRdWVyeSA/PyAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gbWVyZ2VBbGlhcyhldmVudCwgYnApO1xuICB9XG5cblxuICAvLyByZWdpc3RlcmVkQmVmb3JlQWZ0ZXJQcmludEhvb2tzIHRyYWNrcyBpZiB3ZSByZWdpc3RlcmVkIHRoZSBgYmVmb3JlcHJpbnRgXG4gIC8vICBhbmQgYGFmdGVycHJpbnRgIGV2ZW50IGxpc3RlbmVycy5cbiAgcHJpdmF0ZSByZWdpc3RlcmVkQmVmb3JlQWZ0ZXJQcmludEhvb2tzID0gZmFsc2U7XG5cbiAgLy8gaXNQcmludGluZ0JlZm9yZUFmdGVyRXZlbnQgaXMgdXNlZCB0byB0cmFjayBpZiB3ZSBhcmUgcHJpbnRpbmcgZnJvbSB3aXRoaW5cbiAgLy8gYSBgYmVmb3JlcHJpbnRgIGV2ZW50IGhhbmRsZXIuIFRoaXMgcHJldmVudHMgdGhlIHR5cGljYWwgYHN0b3BQcmludGluZ2BcbiAgLy8gZm9ybSBgaW50ZXJjZXB0RXZlbnRzYCBzbyB0aGF0IHByaW50aW5nIGlzIG5vdCBzdG9wcGVkIHdoaWxlIHRoZSBkaWFsb2dcbiAgLy8gaXMgc3RpbGwgb3Blbi4gVGhpcyBpcyBhbiBleHRlbnNpb24gb2YgdGhlIGBpc1ByaW50aW5nYCBwcm9wZXJ0eSBvblxuICAvLyBicm93c2VycyB3aGljaCBzdXBwb3J0IGBiZWZvcmVwcmludGAgYW5kIGBhZnRlcnByaW50YCBldmVudHMuXG4gIHByaXZhdGUgaXNQcmludGluZ0JlZm9yZUFmdGVyRXZlbnQgPSBmYWxzZTtcblxuICBwcml2YXRlIGJlZm9yZVByaW50RXZlbnRMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcbiAgcHJpdmF0ZSBhZnRlclByaW50RXZlbnRMaXN0ZW5lcnM6IEZ1bmN0aW9uW10gPSBbXTtcblxuICBwcml2YXRlIGZvcm1lckFjdGl2YXRpb25zOiBBcnJheTxCcmVha1BvaW50PiB8IG51bGwgPSBudWxsO1xuXG4gIC8vIHJlZ2lzdGVyQmVmb3JlQWZ0ZXJQcmludEhvb2tzIHJlZ2lzdGVycyBhIGBiZWZvcmVwcmludGAgZXZlbnQgaG9vayBzbyB3ZSBjYW5cbiAgLy8gdHJpZ2dlciBwcmludCBzdHlsZXMgc3luY2hyb25vdXNseSBhbmQgYXBwbHkgcHJvcGVyIGxheW91dCBzdHlsZXMuXG4gIC8vIEl0IGlzIGEgbm9vcCBpZiB0aGUgaG9va3MgaGF2ZSBhbHJlYWR5IGJlZW4gcmVnaXN0ZXJlZCBvciBpZiB0aGUgZG9jdW1lbnQnc1xuICAvLyBgZGVmYXVsdFZpZXdgIGlzIG5vdCBhdmFpbGFibGUuXG4gIHJlZ2lzdGVyQmVmb3JlQWZ0ZXJQcmludEhvb2tzKHRhcmdldDogSG9va1RhcmdldCkge1xuICAgIC8vIGBkZWZhdWx0Vmlld2AgbWF5IGJlIG51bGwgd2hlbiByZW5kZXJpbmcgb24gdGhlIHNlcnZlciBvciBpbiBvdGhlciBjb250ZXh0cy5cbiAgICBpZiAoIXRoaXMuX2RvY3VtZW50LmRlZmF1bHRWaWV3IHx8IHRoaXMucmVnaXN0ZXJlZEJlZm9yZUFmdGVyUHJpbnRIb29rcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmVnaXN0ZXJlZEJlZm9yZUFmdGVyUHJpbnRIb29rcyA9IHRydWU7XG5cbiAgICBjb25zdCBiZWZvcmVQcmludExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgLy8gSWYgd2UgYXJlbid0IGFscmVhZHkgcHJpbnRpbmcsIHN0YXJ0IHByaW50aW5nIGFuZCB1cGRhdGUgdGhlIHN0eWxlcyBhc1xuICAgICAgLy8gaWYgdGhlcmUgd2FzIGEgcmVndWxhciBwcmludCBgTWVkaWFDaGFuZ2VgKGZyb20gbWF0Y2hNZWRpYSkuXG4gICAgICBpZiAoIXRoaXMuaXNQcmludGluZykge1xuICAgICAgICB0aGlzLmlzUHJpbnRpbmdCZWZvcmVBZnRlckV2ZW50ID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdGFydFByaW50aW5nKHRhcmdldCwgdGhpcy5nZXRFdmVudEJyZWFrcG9pbnRzKG5ldyBNZWRpYUNoYW5nZSh0cnVlLCBQUklOVCkpKTtcbiAgICAgICAgdGFyZ2V0LnVwZGF0ZVN0eWxlcygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBhZnRlclByaW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICAvLyBJZiB3ZSBhcmVuJ3QgYWxyZWFkeSBwcmludGluZywgc3RhcnQgcHJpbnRpbmcgYW5kIHVwZGF0ZSB0aGUgc3R5bGVzIGFzXG4gICAgICAvLyBpZiB0aGVyZSB3YXMgYSByZWd1bGFyIHByaW50IGBNZWRpYUNoYW5nZWAoZnJvbSBtYXRjaE1lZGlhKS5cbiAgICAgIHRoaXMuaXNQcmludGluZ0JlZm9yZUFmdGVyRXZlbnQgPSBmYWxzZTtcbiAgICAgIGlmICh0aGlzLmlzUHJpbnRpbmcpIHtcbiAgICAgICAgdGhpcy5zdG9wUHJpbnRpbmcodGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0LnVwZGF0ZVN0eWxlcygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDb3VsZCB3ZSBoYXZlIHRlYXJkb3duIGxvZ2ljIHRvIHJlbW92ZSBpZiB0aGVyZSBhcmUgbm8gcHJpbnQgbGlzdGVuZXJzIGJlaW5nIHVzZWQ/XG4gICAgdGhpcy5fZG9jdW1lbnQuZGVmYXVsdFZpZXcuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JlcHJpbnQnLCBiZWZvcmVQcmludExpc3RlbmVyKTtcbiAgICB0aGlzLl9kb2N1bWVudC5kZWZhdWx0Vmlldy5hZGRFdmVudExpc3RlbmVyKCdhZnRlcnByaW50JywgYWZ0ZXJQcmludExpc3RlbmVyKTtcblxuICAgIHRoaXMuYmVmb3JlUHJpbnRFdmVudExpc3RlbmVycy5wdXNoKGJlZm9yZVByaW50TGlzdGVuZXIpO1xuICAgIHRoaXMuYWZ0ZXJQcmludEV2ZW50TGlzdGVuZXJzLnB1c2goYWZ0ZXJQcmludExpc3RlbmVyKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwYXJlIFJ4SlMgdGFwIG9wZXJhdG9yIHdpdGggcGFydGlhbCBhcHBsaWNhdGlvblxuICAgKiBAcmV0dXJuIHBpcGVhYmxlIHRhcCBwcmVkaWNhdGVcbiAgICovXG4gIGludGVyY2VwdEV2ZW50cyh0YXJnZXQ6IEhvb2tUYXJnZXQpIHtcbiAgICByZXR1cm4gKGV2ZW50OiBNZWRpYUNoYW5nZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuaXNQcmludEV2ZW50KGV2ZW50KSkge1xuICAgICAgICBpZiAoZXZlbnQubWF0Y2hlcyAmJiAhdGhpcy5pc1ByaW50aW5nKSB7XG4gICAgICAgICAgdGhpcy5zdGFydFByaW50aW5nKHRhcmdldCwgdGhpcy5nZXRFdmVudEJyZWFrcG9pbnRzKGV2ZW50KSk7XG4gICAgICAgICAgdGFyZ2V0LnVwZGF0ZVN0eWxlcygpO1xuICAgICAgICB9IGVsc2UgaWYgKCFldmVudC5tYXRjaGVzICYmIHRoaXMuaXNQcmludGluZyAmJiAhdGhpcy5pc1ByaW50aW5nQmVmb3JlQWZ0ZXJFdmVudCkge1xuICAgICAgICAgIHRoaXMuc3RvcFByaW50aW5nKHRhcmdldCk7XG4gICAgICAgICAgdGFyZ2V0LnVwZGF0ZVN0eWxlcygpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNvbGxlY3RBY3RpdmF0aW9ucyh0YXJnZXQsIGV2ZW50KTtcbiAgICB9O1xuICB9XG5cbiAgLyoqIFN0b3AgbWVkaWFDaGFuZ2UgZXZlbnQgcHJvcGFnYXRpb24gaW4gZXZlbnQgc3RyZWFtcyAqL1xuICBibG9ja1Byb3BhZ2F0aW9uKCkge1xuICAgIHJldHVybiAoZXZlbnQ6IE1lZGlhQ2hhbmdlKTogYm9vbGVhbiA9PiB7XG4gICAgICByZXR1cm4gISh0aGlzLmlzUHJpbnRpbmcgfHwgdGhpcy5pc1ByaW50RXZlbnQoZXZlbnQpKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgY3VycmVudCBhY3RpdmF0ZUJyZWFrcG9pbnRzIChmb3IgbGF0ZXIgcmVzdG9yZSlcbiAgICogYW5kIHN1YnN0aXR1dGUgb25seSB0aGUgcHJpbnRBbGlhcyBicmVha3BvaW50XG4gICAqL1xuICBwcm90ZWN0ZWQgc3RhcnRQcmludGluZyh0YXJnZXQ6IEhvb2tUYXJnZXQsIGJwTGlzdDogT3B0aW9uYWxCcmVha1BvaW50W10pIHtcbiAgICB0aGlzLmlzUHJpbnRpbmcgPSB0cnVlO1xuICAgIHRoaXMuZm9ybWVyQWN0aXZhdGlvbnMgPSB0YXJnZXQuYWN0aXZhdGVkQnJlYWtwb2ludHM7XG4gICAgdGFyZ2V0LmFjdGl2YXRlZEJyZWFrcG9pbnRzID0gdGhpcy5xdWV1ZS5hZGRQcmludEJyZWFrcG9pbnRzKGJwTGlzdCk7XG4gIH1cblxuICAvKiogRm9yIGFueSBwcmludCBkZS1hY3RpdmF0aW9ucywgcmVzZXQgdGhlIGVudGlyZSBwcmludCBxdWV1ZSAqL1xuICBwcm90ZWN0ZWQgc3RvcFByaW50aW5nKHRhcmdldDogSG9va1RhcmdldCkge1xuICAgIHRhcmdldC5hY3RpdmF0ZWRCcmVha3BvaW50cyA9IHRoaXMuZGVhY3RpdmF0aW9ucztcbiAgICB0aGlzLmRlYWN0aXZhdGlvbnMgPSBbXTtcbiAgICB0aGlzLmZvcm1lckFjdGl2YXRpb25zID0gbnVsbDtcbiAgICB0aGlzLnF1ZXVlLmNsZWFyKCk7XG4gICAgdGhpcy5pc1ByaW50aW5nID0gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogVG8gcmVzdG9yZSBwcmUtUHJpbnQgQWN0aXZhdGlvbnMsIHdlIG11c3QgY2FwdHVyZSB0aGUgcHJvcGVyXG4gICAqIGxpc3Qgb2YgYnJlYWtwb2ludCBhY3RpdmF0aW9ucyBCRUZPUkUgcHJpbnQgc3RhcnRzLiBPbkJlZm9yZVByaW50KClcbiAgICogaXMgc3VwcG9ydGVkOyBzbyAncHJpbnQnIG1lZGlhUXVlcnkgYWN0aXZhdGlvbnMgYXJlIHVzZWQgYXMgYSBmYWxsYmFja1xuICAgKiBpbiBicm93c2VycyB3aXRob3V0IGBiZWZvcmVwcmludGAgc3VwcG9ydC5cbiAgICpcbiAgICogPiAgQnV0IGFjdGl2YXRlZCBicmVha3BvaW50cyBhcmUgZGVhY3RpdmF0ZWQgQkVGT1JFICdwcmludCcgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogTGV0J3MgY2FwdHVyZSBhbGwgZGUtYWN0aXZhdGlvbnMgdXNpbmcgdGhlIGZvbGxvd2luZyBsb2dpYzpcbiAgICpcbiAgICogIFdoZW4gbm90IHByaW50aW5nOlxuICAgKiAgICAtIGNsZWFyIGNhY2hlIHdoZW4gYWN0aXZhdGluZyBub24tcHJpbnQgYnJlYWtwb2ludFxuICAgKiAgICAtIHVwZGF0ZSBjYWNoZSAoYW5kIHNvcnQpIHdoZW4gZGVhY3RpdmF0aW5nXG4gICAqXG4gICAqICBXaGVuIHByaW50aW5nOlxuICAgKiAgICAtIHNvcnQgYW5kIHNhdmUgd2hlbiBzdGFydGluZyBwcmludFxuICAgKiAgICAtIHJlc3RvcmUgYXMgYWN0aXZhdGVkVGFyZ2V0cyBhbmQgY2xlYXIgd2hlbiBzdG9wIHByaW50aW5nXG4gICAqL1xuICBjb2xsZWN0QWN0aXZhdGlvbnModGFyZ2V0OiBIb29rVGFyZ2V0LCBldmVudDogTWVkaWFDaGFuZ2UpIHtcbiAgICBpZiAoIXRoaXMuaXNQcmludGluZyB8fCB0aGlzLmlzUHJpbnRpbmdCZWZvcmVBZnRlckV2ZW50KSB7XG4gICAgICBpZiAoIXRoaXMuaXNQcmludGluZ0JlZm9yZUFmdGVyRXZlbnQpIHtcbiAgICAgICAgLy8gT25seSBjbGVhciBkZWFjdGl2YXRpb25zIGlmIHdlIGFyZW4ndCBwcmludGluZyBmcm9tIGEgYGJlZm9yZXByaW50YCBldmVudC5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB0aGlzIHdpbGwgY2xlYXIgYmVmb3JlIGBzdG9wUHJpbnRpbmcoKWAgaXMgY2FsbGVkIHRvIHJlc3RvcmVcbiAgICAgICAgLy8gdGhlIHByZS1QcmludCBBY3RpdmF0aW9ucy5cbiAgICAgICAgdGhpcy5kZWFjdGl2YXRpb25zID0gW107XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoIWV2ZW50Lm1hdGNoZXMpIHtcbiAgICAgICAgY29uc3QgYnAgPSB0aGlzLmJyZWFrcG9pbnRzLmZpbmRCeVF1ZXJ5KGV2ZW50Lm1lZGlhUXVlcnkpO1xuICAgICAgICAvLyBEZWFjdGl2YXRpbmcgYSBicmVha3BvaW50XG4gICAgICAgIGlmIChicCkge1xuICAgICAgICAgIGNvbnN0IGhhc0Zvcm1lckJwID0gdGhpcy5mb3JtZXJBY3RpdmF0aW9ucyAmJiB0aGlzLmZvcm1lckFjdGl2YXRpb25zLmluY2x1ZGVzKGJwKTtcbiAgICAgICAgICBjb25zdCB3YXNBY3RpdmF0ZWQgPSAhdGhpcy5mb3JtZXJBY3RpdmF0aW9ucyAmJiB0YXJnZXQuYWN0aXZhdGVkQnJlYWtwb2ludHMuaW5jbHVkZXMoYnApO1xuICAgICAgICAgIGNvbnN0IHNob3VsZERlYWN0aXZhdGUgPSBoYXNGb3JtZXJCcCB8fCB3YXNBY3RpdmF0ZWQ7XG4gICAgICAgICAgaWYgKHNob3VsZERlYWN0aXZhdGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0aW9ucy5wdXNoKGJwKTtcbiAgICAgICAgICAgIHRoaXMuZGVhY3RpdmF0aW9ucy5zb3J0KHNvcnREZXNjZW5kaW5nUHJpb3JpdHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBUZWFyZG93biBsb2dpYyBmb3IgdGhlIHNlcnZpY2UuICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmICh0aGlzLl9kb2N1bWVudC5kZWZhdWx0Vmlldykge1xuICAgICAgdGhpcy5iZWZvcmVQcmludEV2ZW50TGlzdGVuZXJzLmZvckVhY2gobCA9PiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0Vmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdiZWZvcmVwcmludCcsIGwpKTtcbiAgICAgIHRoaXMuYWZ0ZXJQcmludEV2ZW50TGlzdGVuZXJzLmZvckVhY2gobCA9PiB0aGlzLl9kb2N1bWVudC5kZWZhdWx0Vmlldy5yZW1vdmVFdmVudExpc3RlbmVyKCdhZnRlcnByaW50JywgbCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIElzIHRoaXMgc2VydmljZSBjdXJyZW50bHkgaW4gcHJpbnQgbW9kZVxuICBwcml2YXRlIGlzUHJpbnRpbmcgPSBmYWxzZTtcbiAgcHJpdmF0ZSBxdWV1ZSA9IG5ldyBQcmludFF1ZXVlKCk7XG4gIHByaXZhdGUgZGVhY3RpdmF0aW9uczogQnJlYWtQb2ludFtdID0gW107XG59XG5cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gSW50ZXJuYWwgVXRpbGl0eSBjbGFzcyAnUHJpbnRRdWV1ZSdcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKipcbiAqIFV0aWxpdHkgY2xhc3MgdG8gbWFuYWdlIHByaW50IGJyZWFrcG9pbnRzICsgYWN0aXZhdGVkQnJlYWtwb2ludHNcbiAqIHdpdGggY29ycmVjdCBzb3J0aW5nIFdISUxFIHByaW50aW5nXG4gKi9cbmNsYXNzIFByaW50UXVldWUge1xuICAvKiogU29ydGVkIHF1ZXVlIHdpdGggcHJpb3JpdGl6ZWQgcHJpbnQgYnJlYWtwb2ludHMgKi9cbiAgcHJpbnRCcmVha3BvaW50czogQnJlYWtQb2ludFtdID0gW107XG5cbiAgYWRkUHJpbnRCcmVha3BvaW50cyhicExpc3Q6IE9wdGlvbmFsQnJlYWtQb2ludFtdKTogQnJlYWtQb2ludFtdIHtcbiAgICBicExpc3QucHVzaChCUkVBS1BPSU5UX1BSSU5UKTtcbiAgICBicExpc3Quc29ydChzb3J0RGVzY2VuZGluZ1ByaW9yaXR5KTtcbiAgICBicExpc3QuZm9yRWFjaChicCA9PiB0aGlzLmFkZEJyZWFrcG9pbnQoYnApKTtcblxuICAgIHJldHVybiB0aGlzLnByaW50QnJlYWtwb2ludHM7XG4gIH1cblxuICAvKiogQWRkIFByaW50IGJyZWFrcG9pbnQgdG8gcXVldWUgKi9cbiAgYWRkQnJlYWtwb2ludChicDogT3B0aW9uYWxCcmVha1BvaW50KSB7XG4gICAgaWYgKCEhYnApIHtcbiAgICAgIGNvbnN0IGJwSW5MaXN0ID0gdGhpcy5wcmludEJyZWFrcG9pbnRzLmZpbmQoaXQgPT4gaXQubWVkaWFRdWVyeSA9PT0gYnAubWVkaWFRdWVyeSk7XG5cbiAgICAgIGlmIChicEluTGlzdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYSBgcHJpbnRBbGlhc2AgYnJlYWtwb2ludCwgdGhlbiBhcHBlbmQuIElmIGEgdHJ1ZSAncHJpbnQnIGJyZWFrcG9pbnQsXG4gICAgICAgIC8vIHJlZ2lzdGVyIGFzIGhpZ2hlc3QgcHJpb3JpdHkgaW4gdGhlIHF1ZXVlXG4gICAgICAgIHRoaXMucHJpbnRCcmVha3BvaW50cyA9IGlzUHJpbnRCcmVha1BvaW50KGJwKSA/IFticCwgLi4udGhpcy5wcmludEJyZWFrcG9pbnRzXVxuICAgICAgICAgICAgOiBbLi4udGhpcy5wcmludEJyZWFrcG9pbnRzLCBicF07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqIFJlc3RvcmUgb3JpZ2luYWwgYWN0aXZhdGVkIGJyZWFrcG9pbnRzIGFuZCBjbGVhciBpbnRlcm5hbCBjYWNoZXMgKi9cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5wcmludEJyZWFrcG9pbnRzID0gW107XG4gIH1cbn1cblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBJbnRlcm5hbCBVdGlsaXR5IG1ldGhvZHNcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiogT25seSBzdXBwb3J0IGludGVyY2VwdCBxdWV1ZWluZyBpZiB0aGUgQnJlYWtwb2ludCBpcyBhIHByaW50IEBtZWRpYSBxdWVyeSAqL1xuZnVuY3Rpb24gaXNQcmludEJyZWFrUG9pbnQoYnA6IE9wdGlvbmFsQnJlYWtQb2ludCk6IGJvb2xlYW4ge1xuICByZXR1cm4gYnA/Lm1lZGlhUXVlcnkuc3RhcnRzV2l0aChQUklOVCkgPz8gZmFsc2U7XG59XG4iXX0=