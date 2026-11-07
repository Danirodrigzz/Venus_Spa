import React from 'react';
import ReactDOMServer from 'react-dom/server';

// Mock browser globals for SSR test
globalThis.window = {
  location: { hash: '', pathname: '/', search: '' },
  addEventListener: () => {},
  removeEventListener: () => {},
  matchMedia: () => ({ matches: false }),
  scrollTo: () => {},
  scrollY: 0,
};
globalThis.document = {
  hidden: false,
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: () => null,
};
globalThis.sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
globalThis.Audio = class {
  constructor() {
    this.volume = 1;
    this.paused = true;
  }
  play() { return Promise.resolve(); }
  pause() {}
};

try {
  const App = (await import('../src/App.jsx')).default;
  const html = ReactDOMServer.renderToString(React.createElement(App));
  console.log('SUCCESS! Rendered HTML length:', html.length);
} catch (err) {
  console.error('CRASH DETECTED IN APP.JSX:', err);
}

