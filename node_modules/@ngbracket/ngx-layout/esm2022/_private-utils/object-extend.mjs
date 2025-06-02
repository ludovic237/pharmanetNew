/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Extends an object with the *enumerable* and *own* properties of one or more source objects,
 * similar to Object.assign.
 *
 * @param dest The object which will have properties copied to it.
 * @param sources The source objects from which properties will be copied.
 */
export function extendObject(dest, ...sources) {
    if (dest == null) {
        throw TypeError('Cannot convert undefined or null to object');
    }
    for (let source of sources) {
        if (source != null) {
            for (let key in source) {
                if (source.hasOwnProperty(key)) {
                    dest[key] = source[key];
                }
            }
        }
    }
    return dest;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0LWV4dGVuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvX3ByaXZhdGUtdXRpbHMvb2JqZWN0LWV4dGVuZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSDs7Ozs7O0dBTUc7QUFDSCxNQUFNLFVBQVUsWUFBWSxDQUFDLElBQVMsRUFBRSxHQUFHLE9BQWM7SUFDdkQsSUFBSSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7UUFDakIsTUFBTSxTQUFTLENBQUMsNENBQTRDLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsS0FBSyxJQUFJLE1BQU0sSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUMzQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNuQixLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO2dCQUN2QixJQUFJLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztvQkFDL0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztnQkFDMUIsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLyoqXG4gKiBFeHRlbmRzIGFuIG9iamVjdCB3aXRoIHRoZSAqZW51bWVyYWJsZSogYW5kICpvd24qIHByb3BlcnRpZXMgb2Ygb25lIG9yIG1vcmUgc291cmNlIG9iamVjdHMsXG4gKiBzaW1pbGFyIHRvIE9iamVjdC5hc3NpZ24uXG4gKlxuICogQHBhcmFtIGRlc3QgVGhlIG9iamVjdCB3aGljaCB3aWxsIGhhdmUgcHJvcGVydGllcyBjb3BpZWQgdG8gaXQuXG4gKiBAcGFyYW0gc291cmNlcyBUaGUgc291cmNlIG9iamVjdHMgZnJvbSB3aGljaCBwcm9wZXJ0aWVzIHdpbGwgYmUgY29waWVkLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kT2JqZWN0KGRlc3Q6IGFueSwgLi4uc291cmNlczogYW55W10pOiBhbnkge1xuICBpZiAoZGVzdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgfVxuXG4gIGZvciAobGV0IHNvdXJjZSBvZiBzb3VyY2VzKSB7XG4gICAgaWYgKHNvdXJjZSAhPSBudWxsKSB7XG4gICAgICBmb3IgKGxldCBrZXkgaW4gc291cmNlKSB7XG4gICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGRlc3Rba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlc3Q7XG59XG4iXX0=