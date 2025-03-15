// Universal polyfills for browser globals in Node.js
console.log('🌐 Setting up browser globals for Node.js environment...');

// Define global browser objects if they don't exist
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = new Map(Object.entries(options.headers || {}));
      this.body = options.body || null;
      this._bodyInit = options.body || null;
    }
    
    json() {
      try {
        const body = typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
        return Promise.resolve(body);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
    }
  };
  console.log('✅ Added global.Request polyfill');
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    constructor(body, options = {}) {
      this.body = body;
      this._bodyInit = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || 'OK';
      this.headers = new Map(Object.entries(options.headers || {}));
      this.type = 'default';
      this.url = '';
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    json() {
      try {
        const body = typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
        return Promise.resolve(body);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
    }
  };
  console.log('✅ Added global.Response polyfill');
}

if (typeof global.URL === 'undefined') {
  try {
    global.URL = require('url').URL;
    console.log('✅ Added global.URL using Node.js url module');
  } catch (e) {
    // Simple URL implementation if Node.js URL is not available
    global.URL = class URL {
      constructor(url, base) {
        if (!url) throw new Error('Invalid URL');
        
        // Simple URL parsing
        let fullUrl = url;
        if (base) {
          if (!url.startsWith('http') && !url.startsWith('/')) {
            url = '/' + url;
          }
          
          if (base.endsWith('/') && url.startsWith('/')) {
            base = base.slice(0, -1);
          }
          
          fullUrl = base + url;
        }
        
        this.href = fullUrl;
        
        // Extract search params if any
        const searchIndex = fullUrl.indexOf('?');
        if (searchIndex !== -1) {
          this.search = fullUrl.slice(searchIndex);
          this.pathname = fullUrl.slice(0, searchIndex);
        } else {
          this.search = '';
          this.pathname = fullUrl;
        }
        
        // Create searchParams
        this.searchParams = {
          get: (key) => {
            if (!this.search) return null;
            const params = new URLSearchParams(this.search);
            return params.get(key);
          }
        };
      }
    };
    console.log('✅ Added custom global.URL implementation');
  }
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    constructor(init = {}) {
      this._headers = new Map();
      
      if (init) {
        if (typeof init[Symbol.iterator] === 'function') {
          // It's an iterable like array of key-value pairs
          for (const [name, value] of init) {
            this.append(name, value);
          }
        } else {
          // It's an object
          Object.getOwnPropertyNames(init).forEach(name => {
            this.append(name, init[name]);
          });
        }
      }
    }
    
    append(name, value) {
      const key = name.toLowerCase();
      this._headers.set(key, value.toString());
    }
    
    delete(name) {
      const key = name.toLowerCase();
      this._headers.delete(key);
    }
    
    get(name) {
      const key = name.toLowerCase();
      return this._headers.get(key) || null;
    }
    
    has(name) {
      const key = name.toLowerCase();
      return this._headers.has(key);
    }
    
    set(name, value) {
      const key = name.toLowerCase();
      this._headers.set(key, value.toString());
    }
  };
  console.log('✅ Added global.Headers polyfill');
}

if (typeof global.fetch === 'undefined') {
  global.fetch = function fetch(url, options = {}) {
    console.warn('❗ Using polyfilled fetch - this is only for build-time and will not make actual network requests');
    return Promise.resolve(new Response(JSON.stringify({ message: 'Fetch polyfill - no actual request made' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
  };
  console.log('✅ Added global.fetch stub (non-functional)');
}

// Expose URLSearchParams if needed
if (typeof global.URLSearchParams === 'undefined') {
  global.URLSearchParams = class URLSearchParams {
    constructor(init) {
      this._params = new Map();
      
      if (typeof init === 'string') {
        // Remove leading ? if present
        if (init.startsWith('?')) {
          init = init.substring(1);
        }
        
        // Parse query string
        const pairs = init.split('&');
        for (const pair of pairs) {
          if (pair === '') continue;
          const [key, value = ''] = pair.split('=').map(decodeURIComponent);
          this.append(key, value);
        }
      } else if (init && typeof init === 'object') {
        // Handle object initialization
        for (const key of Object.keys(init)) {
          this.append(key, init[key]);
        }
      }
    }
    
    append(name, value) {
      this._params.set(name, value.toString());
    }
    
    delete(name) {
      this._params.delete(name);
    }
    
    get(name) {
      return this._params.get(name) || null;
    }
    
    getAll(name) {
      return this._params.has(name) ? [this._params.get(name)] : [];
    }
    
    has(name) {
      return this._params.has(name);
    }
    
    set(name, value) {
      this._params.set(name, value.toString());
    }
    
    toString() {
      const pairs = [];
      this._params.forEach((value, key) => {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      });
      return pairs.join('&');
    }
  };
  console.log('✅ Added global.URLSearchParams polyfill');
}

console.log('🚀 All browser globals polyfilled successfully!');

// Make sure these are available when this file is imported as a module
module.exports = {
  Request: global.Request,
  Response: global.Response,
  URL: global.URL,
  Headers: global.Headers,
  fetch: global.fetch,
  URLSearchParams: global.URLSearchParams
}; 