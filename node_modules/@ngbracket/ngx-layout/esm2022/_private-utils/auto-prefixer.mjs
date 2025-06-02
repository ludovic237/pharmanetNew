/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Applies CSS prefixes to appropriate style keys.
 *
 * Note: `-ms-`, `-moz` and `-webkit-box` are no longer supported. e.g.
 *    {
 *      display: -webkit-flex;     NEW - Safari 6.1+. iOS 7.1+, BB10
 *      display: flex;             NEW, Spec - Firefox, Chrome, Opera
 *      // display: -webkit-box;   OLD - iOS 6-, Safari 3.1-6, BB7
 *      // display: -ms-flexbox;   TWEENER - IE 10
 *      // display: -moz-flexbox;  OLD - Firefox
 *    }
 */
export function applyCssPrefixes(target) {
    for (let key in target) {
        let value = target[key] ?? '';
        switch (key) {
            case 'display':
                if (value === 'flex') {
                    target['display'] = [
                        '-webkit-flex',
                        'flex'
                    ];
                }
                else if (value === 'inline-flex') {
                    target['display'] = [
                        '-webkit-inline-flex',
                        'inline-flex'
                    ];
                }
                else {
                    target['display'] = value;
                }
                break;
            case 'align-items':
            case 'align-self':
            case 'align-content':
            case 'flex':
            case 'flex-basis':
            case 'flex-flow':
            case 'flex-grow':
            case 'flex-shrink':
            case 'flex-wrap':
            case 'justify-content':
                target['-webkit-' + key] = value;
                break;
            case 'flex-direction':
                target['-webkit-flex-direction'] = value;
                target['flex-direction'] = value;
                break;
            case 'order':
                target['order'] = target['-webkit-' + key] = isNaN(+value) ? '0' : value;
                break;
        }
    }
    return target;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0by1wcmVmaXhlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL2xpYnMvZmxleC1sYXlvdXQvX3ByaXZhdGUtdXRpbHMvYXV0by1wcmVmaXhlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFDSDs7Ozs7Ozs7Ozs7R0FXRztBQUNILE1BQU0sVUFBVSxnQkFBZ0IsQ0FBQyxNQUFtQztJQUNsRSxLQUFLLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFOUIsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNaLEtBQUssU0FBUztnQkFDWixJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUUsQ0FBQztvQkFDckIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHO3dCQUNsQixjQUFjO3dCQUNkLE1BQU07cUJBQ1AsQ0FBQztnQkFDSixDQUFDO3FCQUFNLElBQUksS0FBSyxLQUFLLGFBQWEsRUFBRSxDQUFDO29CQUNuQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUc7d0JBQ2xCLHFCQUFxQjt3QkFDckIsYUFBYTtxQkFDZCxDQUFDO2dCQUNKLENBQUM7cUJBQU0sQ0FBQztvQkFDTixNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsS0FBSyxDQUFDO2dCQUM1QixDQUFDO2dCQUNELE1BQU07WUFFUixLQUFLLGFBQWEsQ0FBQztZQUNuQixLQUFLLFlBQVksQ0FBQztZQUNsQixLQUFLLGVBQWUsQ0FBQztZQUNyQixLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssWUFBWSxDQUFDO1lBQ2xCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssYUFBYSxDQUFDO1lBQ25CLEtBQUssV0FBVyxDQUFDO1lBQ2pCLEtBQUssaUJBQWlCO2dCQUNwQixNQUFNLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDakMsTUFBTTtZQUVSLEtBQUssZ0JBQWdCO2dCQUNuQixNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBRyxLQUFLLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEtBQUssQ0FBQztnQkFDakMsTUFBTTtZQUVSLEtBQUssT0FBTztnQkFDVixNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3pFLE1BQU07UUFDVixDQUFDO0lBQ0gsQ0FBQztJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2hCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbi8qKlxuICogQXBwbGllcyBDU1MgcHJlZml4ZXMgdG8gYXBwcm9wcmlhdGUgc3R5bGUga2V5cy5cbiAqXG4gKiBOb3RlOiBgLW1zLWAsIGAtbW96YCBhbmQgYC13ZWJraXQtYm94YCBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZC4gZS5nLlxuICogICAge1xuICogICAgICBkaXNwbGF5OiAtd2Via2l0LWZsZXg7ICAgICBORVcgLSBTYWZhcmkgNi4xKy4gaU9TIDcuMSssIEJCMTBcbiAqICAgICAgZGlzcGxheTogZmxleDsgICAgICAgICAgICAgTkVXLCBTcGVjIC0gRmlyZWZveCwgQ2hyb21lLCBPcGVyYVxuICogICAgICAvLyBkaXNwbGF5OiAtd2Via2l0LWJveDsgICBPTEQgLSBpT1MgNi0sIFNhZmFyaSAzLjEtNiwgQkI3XG4gKiAgICAgIC8vIGRpc3BsYXk6IC1tcy1mbGV4Ym94OyAgIFRXRUVORVIgLSBJRSAxMFxuICogICAgICAvLyBkaXNwbGF5OiAtbW96LWZsZXhib3g7ICBPTEQgLSBGaXJlZm94XG4gKiAgICB9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUNzc1ByZWZpeGVzKHRhcmdldDoge1trZXk6IHN0cmluZ106IGFueSB8IG51bGx9KSB7XG4gIGZvciAobGV0IGtleSBpbiB0YXJnZXQpIHtcbiAgICBsZXQgdmFsdWUgPSB0YXJnZXRba2V5XSA/PyAnJztcblxuICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICBjYXNlICdkaXNwbGF5JzpcbiAgICAgICAgaWYgKHZhbHVlID09PSAnZmxleCcpIHtcbiAgICAgICAgICB0YXJnZXRbJ2Rpc3BsYXknXSA9IFtcbiAgICAgICAgICAgICctd2Via2l0LWZsZXgnLFxuICAgICAgICAgICAgJ2ZsZXgnXG4gICAgICAgICAgXTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gJ2lubGluZS1mbGV4Jykge1xuICAgICAgICAgIHRhcmdldFsnZGlzcGxheSddID0gW1xuICAgICAgICAgICAgJy13ZWJraXQtaW5saW5lLWZsZXgnLFxuICAgICAgICAgICAgJ2lubGluZS1mbGV4J1xuICAgICAgICAgIF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGFyZ2V0WydkaXNwbGF5J10gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnYWxpZ24taXRlbXMnOlxuICAgICAgY2FzZSAnYWxpZ24tc2VsZic6XG4gICAgICBjYXNlICdhbGlnbi1jb250ZW50JzpcbiAgICAgIGNhc2UgJ2ZsZXgnOlxuICAgICAgY2FzZSAnZmxleC1iYXNpcyc6XG4gICAgICBjYXNlICdmbGV4LWZsb3cnOlxuICAgICAgY2FzZSAnZmxleC1ncm93JzpcbiAgICAgIGNhc2UgJ2ZsZXgtc2hyaW5rJzpcbiAgICAgIGNhc2UgJ2ZsZXgtd3JhcCc6XG4gICAgICBjYXNlICdqdXN0aWZ5LWNvbnRlbnQnOlxuICAgICAgICB0YXJnZXRbJy13ZWJraXQtJyArIGtleV0gPSB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ2ZsZXgtZGlyZWN0aW9uJzpcbiAgICAgICAgdGFyZ2V0Wyctd2Via2l0LWZsZXgtZGlyZWN0aW9uJ10gPSB2YWx1ZTtcbiAgICAgICAgdGFyZ2V0WydmbGV4LWRpcmVjdGlvbiddID0gdmFsdWU7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdvcmRlcic6XG4gICAgICAgIHRhcmdldFsnb3JkZXInXSA9IHRhcmdldFsnLXdlYmtpdC0nICsga2V5XSA9IGlzTmFOKCt2YWx1ZSkgPyAnMCcgOiB2YWx1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0YXJnZXQ7XG59XG4iXX0=