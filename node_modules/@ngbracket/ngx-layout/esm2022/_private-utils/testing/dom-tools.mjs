/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Exported DOM accessor utility functions
 */
export const _dom = {
    hasStyle,
    getDistributedNodes,
    getShadowRoot,
    getText,
    getStyle,
    childNodes,
    childNodesAsList,
    hasClass,
    hasAttribute,
    getAttribute,
    hasShadowRoot,
    isCommentNode,
    isElementNode,
    isPresent,
    isShadowRoot,
    tagName,
    lastElementChild
};
// ******************************************************************************************
// These functions are cloned from
//  *  @angular/platform-browser/src/browser/GenericBrowserDomAdapter
// and are to be used ONLY internally in custom-matchers.ts and Unit Tests
// ******************************************************************************************
function getStyle(element, stylename) {
    return element.style[stylename];
}
function hasStyle(element, styleName, styleValue = '', inlineOnly = true) {
    let value = getStyle(element, styleName) || '';
    if (!value && !inlineOnly) {
        // Search stylesheets
        value = typeof getComputedStyle === 'function' &&
            getComputedStyle(element).getPropertyValue(styleName) || '';
    }
    return styleValue ? value == styleValue : value.length > 0;
}
function getDistributedNodes(el) {
    return el.getDistributedNodes();
}
function getShadowRoot(el) {
    return el.shadowRoot;
}
function getText(el) {
    return el.textContent || '';
}
function childNodesAsList(el) {
    const list = el.childNodes;
    const res = new Array(list.length);
    for (let i = 0; i < list.length; i++) {
        res[i] = list[i];
    }
    return res;
}
function hasClass(element, className) {
    return element.classList.contains(className);
}
function hasAttribute(element, attributeName) {
    return element.hasAttribute(attributeName);
}
function getAttribute(element, attributeName) {
    return element.getAttribute(attributeName);
}
function childNodes(el) {
    return el.childNodes;
}
function hasShadowRoot(node) {
    return isPresent(node.shadowRoot) && node instanceof HTMLElement;
}
function isCommentNode(node) {
    return node.nodeType === Node.COMMENT_NODE;
}
function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}
function isShadowRoot(node) {
    return node instanceof DocumentFragment;
}
function isPresent(obj) {
    return obj != null;
}
function tagName(element) {
    return element.tagName;
}
// ******************************************************************************************
// These functions are part of the DOM API
// and are to be used ONLY internally in custom-matchers.ts and Unit Tests
// ******************************************************************************************
function lastElementChild(element) {
    return element.lastElementChild;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tLXRvb2xzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9fcHJpdmF0ZS11dGlscy90ZXN0aW5nL2RvbS10b29scy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLElBQUksR0FBRztJQUNsQixRQUFRO0lBQ1IsbUJBQW1CO0lBQ25CLGFBQWE7SUFDYixPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixnQkFBZ0I7SUFDaEIsUUFBUTtJQUNSLFlBQVk7SUFDWixZQUFZO0lBQ1osYUFBYTtJQUNiLGFBQWE7SUFDYixhQUFhO0lBQ2IsU0FBUztJQUNULFlBQVk7SUFDWixPQUFPO0lBQ1AsZ0JBQWdCO0NBQ2pCLENBQUM7QUFFRiw2RkFBNkY7QUFDN0Ysa0NBQWtDO0FBQ2xDLHFFQUFxRTtBQUNyRSwwRUFBMEU7QUFDMUUsNkZBQTZGO0FBRTdGLFNBQVMsUUFBUSxDQUFDLE9BQVksRUFBRSxTQUFpQjtJQUMvQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEMsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLE9BQVksRUFDWixTQUFpQixFQUNqQixhQUFxQixFQUFFLEVBQ3ZCLFVBQVUsR0FBRyxJQUFJO0lBQ2pDLElBQUksS0FBSyxHQUFHLFFBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9DLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxQixxQkFBcUI7UUFDckIsS0FBSyxHQUFHLE9BQU8sZ0JBQWdCLEtBQUssVUFBVTtZQUM1QyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDaEUsQ0FBQztJQUNELE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztBQUM3RCxDQUFDO0FBRUQsU0FBUyxtQkFBbUIsQ0FBQyxFQUFlO0lBQzFDLE9BQWEsRUFBRyxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDekMsQ0FBQztBQUVELFNBQVMsYUFBYSxDQUFDLEVBQWU7SUFDcEMsT0FBYSxFQUFHLENBQUMsVUFBVSxDQUFDO0FBQzlCLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxFQUFRO0lBQ3ZCLE9BQU8sRUFBRSxDQUFDLFdBQVcsSUFBSSxFQUFFLENBQUM7QUFDOUIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsRUFBUTtJQUNoQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQzNCLE1BQU0sR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3JDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2IsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLE9BQVksRUFBRSxTQUFpQjtJQUMvQyxPQUFPLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxPQUFZLEVBQUUsYUFBcUI7SUFDdkQsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxPQUFZLEVBQUUsYUFBcUI7SUFDdkQsT0FBTyxPQUFPLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQzdDLENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxFQUFPO0lBQ3pCLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQztBQUN2QixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBUztJQUM5QixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxZQUFZLFdBQVcsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBVTtJQUMvQixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUM3QyxDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsSUFBVTtJQUMvQixPQUFPLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQztBQUM3QyxDQUFDO0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBUztJQUM3QixPQUFPLElBQUksWUFBWSxnQkFBZ0IsQ0FBQztBQUMxQyxDQUFDO0FBRUQsU0FBUyxTQUFTLENBQUMsR0FBUTtJQUN6QixPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUM7QUFDckIsQ0FBQztBQUVELFNBQVMsT0FBTyxDQUFDLE9BQVk7SUFDM0IsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3pCLENBQUM7QUFFRCw2RkFBNkY7QUFDN0YsMENBQTBDO0FBQzFDLDBFQUEwRTtBQUMxRSw2RkFBNkY7QUFFN0YsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFZO0lBQ3BDLE9BQU8sT0FBTyxDQUFDLGdCQUFnQixDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLyoqXG4gKiBFeHBvcnRlZCBET00gYWNjZXNzb3IgdXRpbGl0eSBmdW5jdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IF9kb20gPSB7XG4gIGhhc1N0eWxlLFxuICBnZXREaXN0cmlidXRlZE5vZGVzLFxuICBnZXRTaGFkb3dSb290LFxuICBnZXRUZXh0LFxuICBnZXRTdHlsZSxcbiAgY2hpbGROb2RlcyxcbiAgY2hpbGROb2Rlc0FzTGlzdCxcbiAgaGFzQ2xhc3MsXG4gIGhhc0F0dHJpYnV0ZSxcbiAgZ2V0QXR0cmlidXRlLFxuICBoYXNTaGFkb3dSb290LFxuICBpc0NvbW1lbnROb2RlLFxuICBpc0VsZW1lbnROb2RlLFxuICBpc1ByZXNlbnQsXG4gIGlzU2hhZG93Um9vdCxcbiAgdGFnTmFtZSxcbiAgbGFzdEVsZW1lbnRDaGlsZFxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyBUaGVzZSBmdW5jdGlvbnMgYXJlIGNsb25lZCBmcm9tXG4vLyAgKiAgQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlci9zcmMvYnJvd3Nlci9HZW5lcmljQnJvd3NlckRvbUFkYXB0ZXJcbi8vIGFuZCBhcmUgdG8gYmUgdXNlZCBPTkxZIGludGVybmFsbHkgaW4gY3VzdG9tLW1hdGNoZXJzLnRzIGFuZCBVbml0IFRlc3RzXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuZnVuY3Rpb24gZ2V0U3R5bGUoZWxlbWVudDogYW55LCBzdHlsZW5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBlbGVtZW50LnN0eWxlW3N0eWxlbmFtZV07XG59XG5cbmZ1bmN0aW9uIGhhc1N0eWxlKGVsZW1lbnQ6IGFueSxcbiAgICAgICAgICAgICAgICAgIHN0eWxlTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICAgICAgc3R5bGVWYWx1ZTogc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgICBpbmxpbmVPbmx5ID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICBsZXQgdmFsdWUgPSBnZXRTdHlsZShlbGVtZW50LCBzdHlsZU5hbWUpIHx8ICcnO1xuICBpZiAoIXZhbHVlICYmICFpbmxpbmVPbmx5KSB7XG4gICAgLy8gU2VhcmNoIHN0eWxlc2hlZXRzXG4gICAgdmFsdWUgPSB0eXBlb2YgZ2V0Q29tcHV0ZWRTdHlsZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICAgZ2V0Q29tcHV0ZWRTdHlsZShlbGVtZW50KS5nZXRQcm9wZXJ0eVZhbHVlKHN0eWxlTmFtZSkgfHwgJyc7XG4gIH1cbiAgcmV0dXJuIHN0eWxlVmFsdWUgPyB2YWx1ZSA9PSBzdHlsZVZhbHVlIDogdmFsdWUubGVuZ3RoID4gMDtcbn1cblxuZnVuY3Rpb24gZ2V0RGlzdHJpYnV0ZWROb2RlcyhlbDogSFRNTEVsZW1lbnQpOiBOb2RlW10ge1xuICByZXR1cm4gKDxhbnk+ZWwpLmdldERpc3RyaWJ1dGVkTm9kZXMoKTtcbn1cblxuZnVuY3Rpb24gZ2V0U2hhZG93Um9vdChlbDogSFRNTEVsZW1lbnQpOiBEb2N1bWVudEZyYWdtZW50IHtcbiAgcmV0dXJuICg8YW55PmVsKS5zaGFkb3dSb290O1xufVxuXG5mdW5jdGlvbiBnZXRUZXh0KGVsOiBOb2RlKTogc3RyaW5nIHtcbiAgcmV0dXJuIGVsLnRleHRDb250ZW50IHx8ICcnO1xufVxuXG5mdW5jdGlvbiBjaGlsZE5vZGVzQXNMaXN0KGVsOiBOb2RlKTogYW55W10ge1xuICBjb25zdCBsaXN0ID0gZWwuY2hpbGROb2RlcztcbiAgY29uc3QgcmVzID0gbmV3IEFycmF5KGxpc3QubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgcmVzW2ldID0gbGlzdFtpXTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBoYXNDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xufVxuXG5mdW5jdGlvbiBoYXNBdHRyaWJ1dGUoZWxlbWVudDogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIGVsZW1lbnQuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xufVxuXG5mdW5jdGlvbiBnZXRBdHRyaWJ1dGUoZWxlbWVudDogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XG59XG5cbmZ1bmN0aW9uIGNoaWxkTm9kZXMoZWw6IGFueSk6IE5vZGVbXSB7XG4gIHJldHVybiBlbC5jaGlsZE5vZGVzO1xufVxuXG5mdW5jdGlvbiBoYXNTaGFkb3dSb290KG5vZGU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNQcmVzZW50KG5vZGUuc2hhZG93Um9vdCkgJiYgbm9kZSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50O1xufVxuXG5mdW5jdGlvbiBpc0NvbW1lbnROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuQ09NTUVOVF9OT0RFO1xufVxuXG5mdW5jdGlvbiBpc0VsZW1lbnROb2RlKG5vZGU6IE5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IE5vZGUuRUxFTUVOVF9OT0RFO1xufVxuXG5mdW5jdGlvbiBpc1NoYWRvd1Jvb3Qobm9kZTogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudDtcbn1cblxuZnVuY3Rpb24gaXNQcmVzZW50KG9iajogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBvYmogIT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gdGFnTmFtZShlbGVtZW50OiBhbnkpOiBzdHJpbmcge1xuICByZXR1cm4gZWxlbWVudC50YWdOYW1lO1xufVxuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIFRoZXNlIGZ1bmN0aW9ucyBhcmUgcGFydCBvZiB0aGUgRE9NIEFQSVxuLy8gYW5kIGFyZSB0byBiZSB1c2VkIE9OTFkgaW50ZXJuYWxseSBpbiBjdXN0b20tbWF0Y2hlcnMudHMgYW5kIFVuaXQgVGVzdHNcbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG5mdW5jdGlvbiBsYXN0RWxlbWVudENoaWxkKGVsZW1lbnQ6IGFueSk6IE5vZGV8bnVsbCB7XG4gIHJldHVybiBlbGVtZW50Lmxhc3RFbGVtZW50Q2hpbGQ7XG59XG5cbiJdfQ==