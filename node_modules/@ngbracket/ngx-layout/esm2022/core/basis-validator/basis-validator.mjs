/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
* The flex API permits 3 or 1 parts of the value:
*    - `flex-grow flex-shrink flex-basis`, or
*    - `flex-basis`
*/
export function validateBasis(basis, grow = '1', shrink = '1') {
    let parts = [grow, shrink, basis];
    let j = basis.indexOf('calc');
    if (j > 0) {
        parts[2] = _validateCalcValue(basis.substring(j).trim());
        let matches = basis.substr(0, j).trim().split(' ');
        if (matches.length == 2) {
            parts[0] = matches[0];
            parts[1] = matches[1];
        }
    }
    else if (j == 0) {
        parts[2] = _validateCalcValue(basis.trim());
    }
    else {
        let matches = basis.split(' ');
        parts = (matches.length === 3) ? matches : [
            grow, shrink, basis
        ];
    }
    return parts;
}
/**
 * Calc expressions require whitespace before & after any expression operators
 * This is a simple, crude whitespace padding solution.
 *   - '3 3 calc(15em + 20px)'
 *   - calc(100% / 7 * 2)
 *   - 'calc(15em + 20px)'
 *   - 'calc(15em+20px)'
 *   - '37px'
 *   = '43%'
 */
function _validateCalcValue(calc) {
    return calc.replace(/[\s]/g, '').replace(/[\/\*\+\-]/g, ' $& ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaXMtdmFsaWRhdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvbGlicy9mbGV4LWxheW91dC9jb3JlL2Jhc2lzLXZhbGlkYXRvci9iYXNpcy12YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUY7Ozs7RUFJRTtBQUNILE1BQU0sVUFBVSxhQUFhLENBQUMsS0FBYSxFQUFFLElBQUksR0FBRyxHQUFHLEVBQUUsTUFBTSxHQUFHLEdBQUc7SUFDbkUsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBRWxDLElBQUksQ0FBQyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDVixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3pELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRCxJQUFJLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDeEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QixLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7SUFDSCxDQUFDO1NBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDbEIsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzlDLENBQUM7U0FBTSxDQUFDO1FBQ04sSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMvQixLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSztTQUNwQixDQUFDO0lBQ1IsQ0FBQztJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2YsQ0FBQztBQUdEOzs7Ozs7Ozs7R0FTRztBQUNILFNBQVMsa0JBQWtCLENBQUMsSUFBWTtJQUN0QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDbEUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4gLyoqXG4gKiBUaGUgZmxleCBBUEkgcGVybWl0cyAzIG9yIDEgcGFydHMgb2YgdGhlIHZhbHVlOlxuICogICAgLSBgZmxleC1ncm93IGZsZXgtc2hyaW5rIGZsZXgtYmFzaXNgLCBvclxuICogICAgLSBgZmxleC1iYXNpc2BcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlQmFzaXMoYmFzaXM6IHN0cmluZywgZ3JvdyA9ICcxJywgc2hyaW5rID0gJzEnKTogc3RyaW5nW10ge1xuICBsZXQgcGFydHMgPSBbZ3Jvdywgc2hyaW5rLCBiYXNpc107XG5cbiAgbGV0IGogPSBiYXNpcy5pbmRleE9mKCdjYWxjJyk7XG4gIGlmIChqID4gMCkge1xuICAgIHBhcnRzWzJdID0gX3ZhbGlkYXRlQ2FsY1ZhbHVlKGJhc2lzLnN1YnN0cmluZyhqKS50cmltKCkpO1xuICAgIGxldCBtYXRjaGVzID0gYmFzaXMuc3Vic3RyKDAsIGopLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PSAyKSB7XG4gICAgICBwYXJ0c1swXSA9IG1hdGNoZXNbMF07XG4gICAgICBwYXJ0c1sxXSA9IG1hdGNoZXNbMV07XG4gICAgfVxuICB9IGVsc2UgaWYgKGogPT0gMCkge1xuICAgIHBhcnRzWzJdID0gX3ZhbGlkYXRlQ2FsY1ZhbHVlKGJhc2lzLnRyaW0oKSk7XG4gIH0gZWxzZSB7XG4gICAgbGV0IG1hdGNoZXMgPSBiYXNpcy5zcGxpdCgnICcpO1xuICAgIHBhcnRzID0gKG1hdGNoZXMubGVuZ3RoID09PSAzKSA/IG1hdGNoZXMgOiBbXG4gICAgICAgICAgZ3Jvdywgc2hyaW5rLCBiYXNpc1xuICAgICAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzO1xufVxuXG5cbi8qKlxuICogQ2FsYyBleHByZXNzaW9ucyByZXF1aXJlIHdoaXRlc3BhY2UgYmVmb3JlICYgYWZ0ZXIgYW55IGV4cHJlc3Npb24gb3BlcmF0b3JzXG4gKiBUaGlzIGlzIGEgc2ltcGxlLCBjcnVkZSB3aGl0ZXNwYWNlIHBhZGRpbmcgc29sdXRpb24uXG4gKiAgIC0gJzMgMyBjYWxjKDE1ZW0gKyAyMHB4KSdcbiAqICAgLSBjYWxjKDEwMCUgLyA3ICogMilcbiAqICAgLSAnY2FsYygxNWVtICsgMjBweCknXG4gKiAgIC0gJ2NhbGMoMTVlbSsyMHB4KSdcbiAqICAgLSAnMzdweCdcbiAqICAgPSAnNDMlJ1xuICovXG5mdW5jdGlvbiBfdmFsaWRhdGVDYWxjVmFsdWUoY2FsYzogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNhbGMucmVwbGFjZSgvW1xcc10vZywgJycpLnJlcGxhY2UoL1tcXC9cXCpcXCtcXC1dL2csICcgJCYgJyk7XG59XG4iXX0=