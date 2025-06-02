/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BOOTSTRAP_LISTENER, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
/**
 * Find all of the server-generated stylings, if any, and remove them
 * This will be in the form of inline classes and the style block in the
 * head of the DOM
 */
export function removeStyles(_document, platformId) {
    return () => {
        if (isPlatformBrowser(platformId)) {
            const elements = Array.from(_document.querySelectorAll(`[class*=${CLASS_NAME}]`));
            // RegExp constructor should only be used if passing a variable to the constructor.
            // When using static regular expression it is more performant to use reg exp literal.
            // This is also needed to provide Safari 9 compatibility, please see
            // https://stackoverflow.com/questions/37919802 for more discussion.
            const classRegex = /\bflex-layout-.+?\b/g;
            elements.forEach(el => {
                el.classList.contains(`${CLASS_NAME}ssr`) && el.parentNode ?
                    el.parentNode.removeChild(el) : el.className.replace(classRegex, '');
            });
        }
    };
}
/**
 *  Provider to remove SSR styles on the browser
 */
export const BROWSER_PROVIDER = {
    provide: APP_BOOTSTRAP_LISTENER,
    useFactory: removeStyles,
    deps: [DOCUMENT, PLATFORM_ID],
    multi: true
};
export const CLASS_NAME = 'flex-layout-';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvY29yZS9icm93c2VyLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUNILE9BQU8sRUFBQyxzQkFBc0IsRUFBRSxXQUFXLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ2xGLE9BQU8sRUFBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU1RDs7OztHQUlHO0FBQ0gsTUFBTSxVQUFVLFlBQVksQ0FBQyxTQUFtQixFQUFFLFVBQWtCO0lBQ2xFLE9BQU8sR0FBRyxFQUFFO1FBQ1YsSUFBSSxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1lBQ2xDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxGLG1GQUFtRjtZQUNuRixxRkFBcUY7WUFDckYsb0VBQW9FO1lBQ3BFLG9FQUFvRTtZQUNwRSxNQUFNLFVBQVUsR0FBRyxzQkFBc0IsQ0FBQztZQUMxQyxRQUFRLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNwQixFQUFFLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFVBQVUsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO29CQUMxRCxFQUFFLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ3pFLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztJQUNILENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFHO0lBQzlCLE9BQU8sRUFBa0Msc0JBQXNCO0lBQy9ELFVBQVUsRUFBRSxZQUFZO0lBQ3hCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7SUFDN0IsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBRUYsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuaW1wb3J0IHtBUFBfQk9PVFNUUkFQX0xJU1RFTkVSLCBQTEFURk9STV9JRCwgSW5qZWN0aW9uVG9rZW59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtET0NVTUVOVCwgaXNQbGF0Zm9ybUJyb3dzZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbi8qKlxuICogRmluZCBhbGwgb2YgdGhlIHNlcnZlci1nZW5lcmF0ZWQgc3R5bGluZ3MsIGlmIGFueSwgYW5kIHJlbW92ZSB0aGVtXG4gKiBUaGlzIHdpbGwgYmUgaW4gdGhlIGZvcm0gb2YgaW5saW5lIGNsYXNzZXMgYW5kIHRoZSBzdHlsZSBibG9jayBpbiB0aGVcbiAqIGhlYWQgb2YgdGhlIERPTVxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlU3R5bGVzKF9kb2N1bWVudDogRG9jdW1lbnQsIHBsYXRmb3JtSWQ6IE9iamVjdCkge1xuICByZXR1cm4gKCkgPT4ge1xuICAgIGlmIChpc1BsYXRmb3JtQnJvd3NlcihwbGF0Zm9ybUlkKSkge1xuICAgICAgY29uc3QgZWxlbWVudHMgPSBBcnJheS5mcm9tKF9kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGBbY2xhc3MqPSR7Q0xBU1NfTkFNRX1dYCkpO1xuXG4gICAgICAvLyBSZWdFeHAgY29uc3RydWN0b3Igc2hvdWxkIG9ubHkgYmUgdXNlZCBpZiBwYXNzaW5nIGEgdmFyaWFibGUgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAgLy8gV2hlbiB1c2luZyBzdGF0aWMgcmVndWxhciBleHByZXNzaW9uIGl0IGlzIG1vcmUgcGVyZm9ybWFudCB0byB1c2UgcmVnIGV4cCBsaXRlcmFsLlxuICAgICAgLy8gVGhpcyBpcyBhbHNvIG5lZWRlZCB0byBwcm92aWRlIFNhZmFyaSA5IGNvbXBhdGliaWxpdHksIHBsZWFzZSBzZWVcbiAgICAgIC8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzM3OTE5ODAyIGZvciBtb3JlIGRpc2N1c3Npb24uXG4gICAgICBjb25zdCBjbGFzc1JlZ2V4ID0gL1xcYmZsZXgtbGF5b3V0LS4rP1xcYi9nO1xuICAgICAgZWxlbWVudHMuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5jb250YWlucyhgJHtDTEFTU19OQU1FfXNzcmApICYmIGVsLnBhcmVudE5vZGUgP1xuICAgICAgICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpIDogZWwuY2xhc3NOYW1lLnJlcGxhY2UoY2xhc3NSZWdleCwgJycpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqICBQcm92aWRlciB0byByZW1vdmUgU1NSIHN0eWxlcyBvbiB0aGUgYnJvd3NlclxuICovXG5leHBvcnQgY29uc3QgQlJPV1NFUl9QUk9WSURFUiA9IHtcbiAgcHJvdmlkZTogPEluamVjdGlvblRva2VuPCgoKSA9PiB2b2lkKVtdPj5BUFBfQk9PVFNUUkFQX0xJU1RFTkVSLFxuICB1c2VGYWN0b3J5OiByZW1vdmVTdHlsZXMsXG4gIGRlcHM6IFtET0NVTUVOVCwgUExBVEZPUk1fSURdLFxuICBtdWx0aTogdHJ1ZVxufTtcblxuZXhwb3J0IGNvbnN0IENMQVNTX05BTUUgPSAnZmxleC1sYXlvdXQtJztcbiJdfQ==