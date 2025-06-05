import { createRequire } from 'module';const require = createRequire(import.meta.url);
import {
  BEFORE_APP_SERIALIZED
} from "./chunk-4FOTYIPG.js";
import "./chunk-Z3ZYWZWL.js";
import {
  BREAKPOINTS,
  CLASS_NAME,
  LAYOUT_CONFIG,
  MatchMedia,
  MediaMarshaller,
  SERVER_TOKEN,
  StylesheetMap,
  sortAscendingPriority
} from "./chunk-CHSII6XQ.js";
import "./chunk-IOUHKBJA.js";
import "./chunk-I2EXSWPZ.js";
import "./chunk-S4R4CQMY.js";
import {
  DOCUMENT
} from "./chunk-SJZJMZX3.js";
import {
  CSP_NONCE,
  Inject,
  Injectable,
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  setClassMetadata,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵinject
} from "./chunk-NONX6MLK.js";
import "./chunk-T4XHMJL2.js";
import "./chunk-YHCV7DAQ.js";

// node_modules/@ngbracket/ngx-layout/fesm2022/ngbracket-ngx-layout-server.mjs
var ServerMediaQueryList = class extends EventTarget {
  get matches() {
    return this._isActive;
  }
  get media() {
    return this._mediaQuery;
  }
  constructor(_mediaQuery, _isActive = false) {
    super();
    this._mediaQuery = _mediaQuery;
    this._isActive = _isActive;
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
        cb.call(this, {
          matches: this.matches,
          media: this.media
        });
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
        cb.call(this, {
          matches: this.matches,
          media: this.media
        });
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
      cb.call(this, {
        matches: this.matches,
        media: this.media
      });
    }
  }
  /** Don't need to remove listeners in the server environment */
  removeListener() {
  }
  addEventListener() {
  }
  removeEventListener() {
  }
  dispatchEvent(_) {
    return false;
  }
};
var ServerMatchMedia = class _ServerMatchMedia extends MatchMedia {
  constructor(_zone, _platformId, _document, breakpoints, layoutConfig) {
    super(_zone, _platformId, _document);
    this._zone = _zone;
    this._platformId = _platformId;
    this._document = _document;
    this.breakpoints = breakpoints;
    this.layoutConfig = layoutConfig;
    this._activeBreakpoints = [];
    const serverBps = layoutConfig.ssrObserveBreakpoints;
    if (serverBps) {
      this._activeBreakpoints = serverBps.reduce((acc, serverBp) => {
        const foundBp = breakpoints.find((bp) => serverBp === bp.alias);
        if (!foundBp) {
          console.warn(`FlexLayoutServerModule: unknown breakpoint alias "${serverBp}"`);
        } else {
          acc.push(foundBp);
        }
        return acc;
      }, []);
    }
  }
  /** Activate the specified breakpoint if we're on the server, no-op otherwise */
  activateBreakpoint(bp) {
    const lookupBreakpoint = this.registry.get(bp.mediaQuery);
    if (lookupBreakpoint) {
      lookupBreakpoint.activate();
    }
  }
  /** Deactivate the specified breakpoint if we're on the server, no-op otherwise */
  deactivateBreakpoint(bp) {
    const lookupBreakpoint = this.registry.get(bp.mediaQuery);
    if (lookupBreakpoint) {
      lookupBreakpoint.deactivate();
    }
  }
  /**
   * Call window.matchMedia() to build a MediaQueryList; which
   * supports 0..n listeners for activation/deactivation
   */
  buildMQL(query) {
    const isActive = this._activeBreakpoints.some((ab) => ab.mediaQuery === query);
    return new ServerMediaQueryList(query, isActive);
  }
  static {
    this.ɵfac = function ServerMatchMedia_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ServerMatchMedia)(ɵɵinject(NgZone), ɵɵinject(PLATFORM_ID), ɵɵinject(DOCUMENT), ɵɵinject(BREAKPOINTS), ɵɵinject(LAYOUT_CONFIG));
    };
  }
  static {
    this.ɵprov = ɵɵdefineInjectable({
      token: _ServerMatchMedia,
      factory: _ServerMatchMedia.ɵfac
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerMatchMedia, [{
    type: Injectable
  }], () => [{
    type: NgZone
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [BREAKPOINTS]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Inject,
      args: [LAYOUT_CONFIG]
    }]
  }], null);
})();
function generateStaticFlexLayoutStyles(serverSheet, mediaController, breakpoints, mediaMarshaller) {
  const classMap = /* @__PURE__ */ new Map();
  const defaultStyles = new Map(serverSheet.stylesheet);
  nextId = 0;
  let styleText = generateCss(defaultStyles, "all", classMap);
  mediaMarshaller.useFallbacks = false;
  [...breakpoints].sort(sortAscendingPriority).forEach((bp) => {
    serverSheet.clearStyles();
    mediaController.activateBreakpoint(bp);
    const stylesheet = new Map(serverSheet.stylesheet);
    if (stylesheet.size > 0) {
      styleText += generateCss(stylesheet, bp.mediaQuery, classMap);
    }
    mediaController.deactivateBreakpoint(bp);
  });
  return styleText;
}
function FLEX_SSR_SERIALIZER_FACTORY(serverSheet, mediaController, _document, breakpoints, mediaMarshaller, _nonce) {
  return () => {
    const styleTag = _document.createElement("style");
    if (_nonce) {
      styleTag.setAttribute("nonce", _nonce);
    }
    const styleText = generateStaticFlexLayoutStyles(serverSheet, mediaController, breakpoints, mediaMarshaller);
    styleTag.classList.add(`${CLASS_NAME}ssr`);
    styleTag.textContent = styleText;
    _document.head.appendChild(styleTag);
  };
}
var SERVER_PROVIDERS = [{
  provide: BEFORE_APP_SERIALIZED,
  useFactory: FLEX_SSR_SERIALIZER_FACTORY,
  deps: [StylesheetMap, MatchMedia, DOCUMENT, BREAKPOINTS, MediaMarshaller, [new Optional(), new Inject(CSP_NONCE)]],
  multi: true
}, {
  provide: SERVER_TOKEN,
  useValue: true
}, {
  provide: MatchMedia,
  useClass: ServerMatchMedia
}];
var nextId = 0;
var IS_DEBUG_MODE = false;
function generateCss(stylesheet, mediaQuery, classMap) {
  let css = "";
  stylesheet.forEach((styles, el) => {
    let keyVals = "";
    let className = getClassName(el, classMap);
    styles.forEach((v, k) => {
      keyVals += v ? format(`${k}:${v};`) : "";
    });
    if (keyVals) {
      css += format(`.${className} {`, keyVals, "}");
    }
  });
  return format(`@media ${mediaQuery} {`, css, "}");
}
function format(...list) {
  let result = "";
  list.forEach((css, i) => {
    result += IS_DEBUG_MODE ? formatSegment(css, i !== 0) : css;
  });
  return result;
}
function formatSegment(css, asPrefix = true) {
  return asPrefix ? `
${css}` : `${css}
`;
}
function getClassName(element, classMap) {
  let className = classMap.get(element);
  if (!className) {
    className = `${CLASS_NAME}${nextId++}`;
    classMap.set(element, className);
  }
  element.classList.add(className);
  return className;
}
var FlexLayoutServerModule = class _FlexLayoutServerModule {
  static {
    this.ɵfac = function FlexLayoutServerModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FlexLayoutServerModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _FlexLayoutServerModule
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      providers: [SERVER_PROVIDERS]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FlexLayoutServerModule, [{
    type: NgModule,
    args: [{
      providers: [SERVER_PROVIDERS]
    }]
  }], null, null);
})();
export {
  FLEX_SSR_SERIALIZER_FACTORY,
  FlexLayoutServerModule,
  SERVER_PROVIDERS,
  generateStaticFlexLayoutStyles
};
/*! Bundled license information:

@ngbracket/ngx-layout/fesm2022/ngbracket-ngx-layout-server.mjs:
  (**
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.io/license
   *)
*/
//# sourceMappingURL=@ngbracket_ngx-layout_server.js.map
