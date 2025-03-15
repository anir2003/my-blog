// Polyfills for Node.js environments
console.log('Applying Node.js polyfills for browser globals...');

// Polyfill global objects that might be used in scripts
if (typeof globalThis.Request === 'undefined') {
  class NodeRequest {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.headers = options.headers || {};
      this.body = options.body || null;
    }
    
    json() {
      return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
    }
    
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
    }
  }
  
  // Set polyfills to global scope
  globalThis.Request = NodeRequest;
  console.log('Polyfilled Request object');
}

if (typeof globalThis.Response === 'undefined') {
  class NodeResponse {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.statusText = options.statusText || 'OK';
      this.headers = options.headers || {};
      this.ok = this.status >= 200 && this.status < 300;
    }
    
    json() {
      return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
    }
    
    text() {
      return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body));
    }
  }
  
  globalThis.Response = NodeResponse;
  console.log('Polyfilled Response object');
}

if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = require('url').URL;
  console.log('Polyfilled URL object');
}

console.log('Polyfills applied successfully!');

module.exports = {}; 