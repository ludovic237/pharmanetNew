/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export const INLINE = 'inline';
export const LAYOUT_VALUES = ['row', 'column', 'row-reverse', 'column-reverse'];
/**
 * Validate the direction|'direction wrap' value and then update the host's inline flexbox styles
 */
export function buildLayoutCSS(value) {
    let [direction, wrap, isInline] = validateValue(value);
    return buildCSS(direction, wrap, isInline);
}
/**
  * Validate the value to be one of the acceptable value options
  * Use default fallback of 'row'
  */
export function validateValue(value) {
    value = value?.toLowerCase() ?? '';
    let [direction, wrap, inline] = value.split(' ');
    // First value must be the `flex-direction`
    if (!LAYOUT_VALUES.find(x => x === direction)) {
        direction = LAYOUT_VALUES[0];
    }
    if (wrap === INLINE) {
        wrap = (inline !== INLINE) ? inline : '';
        inline = INLINE;
    }
    return [direction, validateWrapValue(wrap), !!inline];
}
/**
 * Determine if the validated, flex-direction value specifies
 * a horizontal/row flow.
 */
export function isFlowHorizontal(value) {
    let [flow,] = validateValue(value);
    return flow.indexOf('row') > -1;
}
/**
 * Convert layout-wrap='<value>' to expected flex-wrap style
 */
export function validateWrapValue(value) {
    if (!!value) {
        switch (value.toLowerCase()) {
            case 'reverse':
            case 'wrap-reverse':
            case 'reverse-wrap':
                value = 'wrap-reverse';
                break;
            case 'no':
            case 'none':
            case 'nowrap':
                value = 'nowrap';
                break;
            // All other values fallback to 'wrap'
            default:
                value = 'wrap';
                break;
        }
    }
    return value;
}
/**
 * Build the CSS that should be assigned to the element instance
 * BUG:
 *   1) min-height on a column flex container won’t apply to its flex item children in IE 10-11.
 *      Use height instead if possible; height : <xxx>vh;
 *
 *  This way any padding or border specified on the child elements are
 *  laid out and drawn inside that element's specified width and height.
 */
function buildCSS(direction, wrap = null, inline = false) {
    return {
        display: inline ? 'inline-flex' : 'flex',
        'box-sizing': 'border-box',
        'flex-direction': direction,
        'flex-wrap': wrap || null,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LXZhbGlkYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvX3ByaXZhdGUtdXRpbHMvbGF5b3V0LXZhbGlkYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQy9CLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFFaEY7O0dBRUc7QUFDSCxNQUFNLFVBQVUsY0FBYyxDQUFDLEtBQWE7SUFDMUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZELE9BQU8sUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDN0MsQ0FBQztBQUVEOzs7SUFHSTtBQUNKLE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBYTtJQUN6QyxLQUFLLEdBQUcsS0FBSyxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNuQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRWpELDJDQUEyQztJQUMzQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsRUFBRSxDQUFDO1FBQzlDLFNBQVMsR0FBRyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVELElBQUksSUFBSSxLQUFLLE1BQU0sRUFBRSxDQUFDO1FBQ3BCLElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDekMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTyxDQUFDLFNBQVMsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEQsQ0FBQztBQUVEOzs7R0FHRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxLQUFhO0lBQzVDLElBQUksQ0FBQyxJQUFJLEVBQUcsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxLQUFhO0lBQzdDLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ1osUUFBUSxLQUFLLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQztZQUM1QixLQUFLLFNBQVMsQ0FBQztZQUNmLEtBQUssY0FBYyxDQUFDO1lBQ3BCLEtBQUssY0FBYztnQkFDakIsS0FBSyxHQUFHLGNBQWMsQ0FBQztnQkFDdkIsTUFBTTtZQUVSLEtBQUssSUFBSSxDQUFDO1lBQ1YsS0FBSyxNQUFNLENBQUM7WUFDWixLQUFLLFFBQVE7Z0JBQ1gsS0FBSyxHQUFHLFFBQVEsQ0FBQztnQkFDakIsTUFBTTtZQUVSLHNDQUFzQztZQUN0QztnQkFDRSxLQUFLLEdBQUcsTUFBTSxDQUFDO2dCQUNmLE1BQU07UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUVEOzs7Ozs7OztHQVFHO0FBQ0gsU0FBUyxRQUFRLENBQUMsU0FBaUIsRUFBRSxPQUFzQixJQUFJLEVBQUUsTUFBTSxHQUFHLEtBQUs7SUFDN0UsT0FBTztRQUNMLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsTUFBTTtRQUN4QyxZQUFZLEVBQUUsWUFBWTtRQUMxQixnQkFBZ0IsRUFBRSxTQUFTO1FBQzNCLFdBQVcsRUFBRSxJQUFJLElBQUksSUFBSTtLQUMxQixDQUFDO0FBQ0osQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZXhwb3J0IGNvbnN0IElOTElORSA9ICdpbmxpbmUnO1xuZXhwb3J0IGNvbnN0IExBWU9VVF9WQUxVRVMgPSBbJ3JvdycsICdjb2x1bW4nLCAncm93LXJldmVyc2UnLCAnY29sdW1uLXJldmVyc2UnXTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGUgZGlyZWN0aW9ufCdkaXJlY3Rpb24gd3JhcCcgdmFsdWUgYW5kIHRoZW4gdXBkYXRlIHRoZSBob3N0J3MgaW5saW5lIGZsZXhib3ggc3R5bGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBidWlsZExheW91dENTUyh2YWx1ZTogc3RyaW5nKSB7XG4gIGxldCBbZGlyZWN0aW9uLCB3cmFwLCBpc0lubGluZV0gPSB2YWxpZGF0ZVZhbHVlKHZhbHVlKTtcbiAgcmV0dXJuIGJ1aWxkQ1NTKGRpcmVjdGlvbiwgd3JhcCwgaXNJbmxpbmUpO1xufVxuXG4vKipcbiAgKiBWYWxpZGF0ZSB0aGUgdmFsdWUgdG8gYmUgb25lIG9mIHRoZSBhY2NlcHRhYmxlIHZhbHVlIG9wdGlvbnNcbiAgKiBVc2UgZGVmYXVsdCBmYWxsYmFjayBvZiAncm93J1xuICAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlVmFsdWUodmFsdWU6IHN0cmluZyk6IFtzdHJpbmcsIHN0cmluZywgYm9vbGVhbl0ge1xuICB2YWx1ZSA9IHZhbHVlPy50b0xvd2VyQ2FzZSgpID8/ICcnO1xuICBsZXQgW2RpcmVjdGlvbiwgd3JhcCwgaW5saW5lXSA9IHZhbHVlLnNwbGl0KCcgJyk7XG5cbiAgLy8gRmlyc3QgdmFsdWUgbXVzdCBiZSB0aGUgYGZsZXgtZGlyZWN0aW9uYFxuICBpZiAoIUxBWU9VVF9WQUxVRVMuZmluZCh4ID0+IHggPT09IGRpcmVjdGlvbikpIHtcbiAgICBkaXJlY3Rpb24gPSBMQVlPVVRfVkFMVUVTWzBdO1xuICB9XG5cbiAgaWYgKHdyYXAgPT09IElOTElORSkge1xuICAgIHdyYXAgPSAoaW5saW5lICE9PSBJTkxJTkUpID8gaW5saW5lIDogJyc7XG4gICAgaW5saW5lID0gSU5MSU5FO1xuICB9XG5cbiAgcmV0dXJuIFtkaXJlY3Rpb24sIHZhbGlkYXRlV3JhcFZhbHVlKHdyYXApLCAhIWlubGluZV07XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lIGlmIHRoZSB2YWxpZGF0ZWQsIGZsZXgtZGlyZWN0aW9uIHZhbHVlIHNwZWNpZmllc1xuICogYSBob3Jpem9udGFsL3JvdyBmbG93LlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNGbG93SG9yaXpvbnRhbCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGxldCBbZmxvdywgXSA9IHZhbGlkYXRlVmFsdWUodmFsdWUpO1xuICByZXR1cm4gZmxvdy5pbmRleE9mKCdyb3cnKSA+IC0xO1xufVxuXG4vKipcbiAqIENvbnZlcnQgbGF5b3V0LXdyYXA9Jzx2YWx1ZT4nIHRvIGV4cGVjdGVkIGZsZXgtd3JhcCBzdHlsZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVXcmFwVmFsdWUodmFsdWU6IHN0cmluZykge1xuICBpZiAoISF2YWx1ZSkge1xuICAgIHN3aXRjaCAodmFsdWUudG9Mb3dlckNhc2UoKSkge1xuICAgICAgY2FzZSAncmV2ZXJzZSc6XG4gICAgICBjYXNlICd3cmFwLXJldmVyc2UnOlxuICAgICAgY2FzZSAncmV2ZXJzZS13cmFwJzpcbiAgICAgICAgdmFsdWUgPSAnd3JhcC1yZXZlcnNlJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ25vJzpcbiAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgY2FzZSAnbm93cmFwJzpcbiAgICAgICAgdmFsdWUgPSAnbm93cmFwJztcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIC8vIEFsbCBvdGhlciB2YWx1ZXMgZmFsbGJhY2sgdG8gJ3dyYXAnXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YWx1ZSA9ICd3cmFwJztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyoqXG4gKiBCdWlsZCB0aGUgQ1NTIHRoYXQgc2hvdWxkIGJlIGFzc2lnbmVkIHRvIHRoZSBlbGVtZW50IGluc3RhbmNlXG4gKiBCVUc6XG4gKiAgIDEpIG1pbi1oZWlnaHQgb24gYSBjb2x1bW4gZmxleCBjb250YWluZXIgd29u4oCZdCBhcHBseSB0byBpdHMgZmxleCBpdGVtIGNoaWxkcmVuIGluIElFIDEwLTExLlxuICogICAgICBVc2UgaGVpZ2h0IGluc3RlYWQgaWYgcG9zc2libGU7IGhlaWdodCA6IDx4eHg+dmg7XG4gKlxuICogIFRoaXMgd2F5IGFueSBwYWRkaW5nIG9yIGJvcmRlciBzcGVjaWZpZWQgb24gdGhlIGNoaWxkIGVsZW1lbnRzIGFyZVxuICogIGxhaWQgb3V0IGFuZCBkcmF3biBpbnNpZGUgdGhhdCBlbGVtZW50J3Mgc3BlY2lmaWVkIHdpZHRoIGFuZCBoZWlnaHQuXG4gKi9cbmZ1bmN0aW9uIGJ1aWxkQ1NTKGRpcmVjdGlvbjogc3RyaW5nLCB3cmFwOiBzdHJpbmcgfCBudWxsID0gbnVsbCwgaW5saW5lID0gZmFsc2UpIHtcbiAgcmV0dXJuIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUgPyAnaW5saW5lLWZsZXgnIDogJ2ZsZXgnLFxuICAgICdib3gtc2l6aW5nJzogJ2JvcmRlci1ib3gnLFxuICAgICdmbGV4LWRpcmVjdGlvbic6IGRpcmVjdGlvbixcbiAgICAnZmxleC13cmFwJzogd3JhcCB8fCBudWxsLFxuICB9O1xufVxuIl19