import dappKitty from '../src/dappKitty.js';

describe('dappkitty', () => {
  describe('prod mode (no query param)', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      // No query param, should be prod
      window.history.pushState({}, '', '/');
    });
    it('should NOT inject LogKitty panel into the DOM', () => {
      dappKitty('debug');
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).toBeNull();
    });
  });

  describe('prod mode (origin matches productionUrl)', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      window.history.pushState({}, '', 'prod.example/');
    });
    it('should NOT inject LogKitty panel if origin matches productionUrl', () => {
      dappKitty('debug', { productionUrl: 'prod.example' });
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).toBeNull();
    });
  });

  describe('dev mode (kittyenv=dev)', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      window.history.pushState({}, '', '/?kittyenv=dev');
    });
    it('should inject LogKitty panel into the DOM', () => {
      dappKitty('debug');
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).not.toBeNull();
      expect(logKittyEl.classList.contains('puzzl-light') || logKittyEl.classList.contains('puzzl-dark')).toBe(true);
    });
  });

  describe('local mode (kittyenv=local)', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
      window.history.pushState({}, '', '/?kittyenv=local');
    });
    it('should inject LogKitty panel into the DOM', () => {
      dappKitty('debug');
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).not.toBeNull();
      expect(logKittyEl.classList.contains('puzzl-light') || logKittyEl.classList.contains('puzzl-dark')).toBe(true);
    });
  });

  describe('logLevel override per env', () => {
    it('should use logLevel from dev override when env is dev', () => {
      document.body.innerHTML = '';
      window.history.pushState({}, '', '/?kittyenv=dev');
      dappKitty('debug', { dev: { logKitty: { logLevel: 'info' } } });
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).not.toBeNull();
      // Log a debug message (should NOT appear in info mode)
      console.debug('should not show');
      // Log an info message (should appear)
      console.info('should show');
      const content = logKittyEl.querySelector('.logKitty-content').textContent;
      expect(content).toContain('should show');
      expect(content).not.toContain('should not show');
    });
    it('should use logLevel from main arg when env is local', () => {
      document.body.innerHTML = '';
      window.history.pushState({}, '', '/?kittyenv=local');
      dappKitty('debug', { dev: { logKitty: { logLevel: 'info' } } });
      const logKittyEl = document.getElementById('logKitty');
      expect(logKittyEl).not.toBeNull();
      // Log a debug message (should appear in debug mode)
      console.debug('should show debug');
      // Log an info message (should also appear)
      console.info('should show info');
      const content = logKittyEl.querySelector('.logKitty-content').textContent;
      expect(content).toContain('should show debug');
      expect(content).toContain('should show info');
    });
  });
});