import { jest } from '@jest/globals';
import { DappKitty } from '../src/DappKitty.js';

// Helper to mock window.location
const originalLocation = window.location;
function setLocation(search, hostname, href) {
  delete window.location;
  const url = new URL(href || `https://${hostname}${search}`);
  window.location = {
    search: url.search,
    hostname: url.hostname,
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    toString: () => url.href,
    assign: () => {},
    reload: () => {},
    replace: () => {},
    hash: url.hash,
    port: url.port,
  };
}

describe('DappKitty', () => {
  afterEach(() => {
    delete window.location;
    window.location = originalLocation;
  });

  it('should not allow env config to override root-only keys', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    const kitty = new DappKitty({
      expandIcon: 'ROOT',
      collapseIcon: 'ROOT',
      productionUrl: 'ROOT',
      targets: { window: 'ROOT' },
      dev: {
        expandIcon: 'ENV',
        collapseIcon: 'ENV',
        productionUrl: 'ENV',
        targets: { window: 'ENV' }
      }
    });
    expect(kitty.config.expandIcon).toBe('ROOT');
    expect(kitty.config.collapseIcon).toBe('ROOT');
    expect(kitty.config.productionUrl).toBe('ROOT');
    expect(kitty.config.targets.window).toBe('ROOT');
  });

  it('should resolve logLevel precedence: env > root > env default > root default > fallback', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    // env override
    let kitty = new DappKitty({ logLevel: 'ROOT', dev: { logLevel: 'ENV' } }, window);
    expect(kitty.config.logLevel).toBe('ENV');
    // root override
    kitty = new DappKitty({ logLevel: 'ROOT' }, window);
    expect(kitty.config.logLevel).toBe('ROOT');
    // env default
    kitty = new DappKitty({}, window);
    expect(kitty.config.logLevel).toBe('kitty');
    // fallback
    setLocation('', 'prod.com', 'https://prod.com');
    kitty = new DappKitty(undefined, window);
    expect(kitty.config.logLevel).toBe('debug');
  });

  it('should always provide window, theme, dapp as objects', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    const kitty = new DappKitty({}, window);
    expect(typeof kitty.config.window).toBe('object');
    expect(typeof kitty.config.theme).toBe('object');
    expect(typeof kitty.config.dapp).toBe('object');
  });

  it('should ignore unknown keys in config', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    const kitty = new DappKitty({ foo: 'bar', dev: { bar: 'baz' } }, window);
    expect(kitty.config.foo).toBeUndefined();
    expect(kitty.config.bar).toBeUndefined();
  });

  it('should not call start on production domain', () => {
    setLocation('', 'example.com', 'https://example.com');
    const kitty = new DappKitty({ productionUrl: 'https://example.com' }, window);
    const spy = jest.spyOn(kitty, 'start');
    kitty.start();
    expect(kitty.shouldActivate()).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('should not call start if productionUrl matches, even with ?envkitty=dev', () => {
    setLocation('?envkitty=dev', 'example.com', 'https://example.com?envkitty=dev');
    const kitty = new DappKitty({ productionUrl: 'https://example.com', dev: { dapp: { logLevel: 'debug' } } }, window);
    const spy = jest.spyOn(kitty, 'start');
    kitty.start();
    expect(kitty.shouldActivate()).toBe(false);
    expect(spy).toHaveBeenCalled();
  });

  it('should activate in dev mode with envkitty param', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    const kitty = new DappKitty({ productionUrl: 'https://example.com' }, window);
    expect(kitty.shouldActivate()).toBe(true);
  });

  it('should merge config correctly for dev env', () => {
    setLocation('?envkitty=dev', 'dev.local', 'https://dev.local?envkitty=dev');
    const kitty = new DappKitty({ dev: { dapp: { logLevel: 'debug' } } }, window);
    expect(kitty.config.env).toBe('dev');
    expect(kitty.config.dapp.logLevel).toBe('debug');
  });

  it('should merge config correctly for local env', () => {
    setLocation('?envkitty=local', 'localhost', 'https://localhost?envkitty=local');
    const kitty = new DappKitty({ local: { dapp: { logLevel: 'debug' } } }, window);
    expect(kitty.config.env).toBe('local');
    expect(kitty.config.dapp.logLevel).toBe('debug');
  });

  it('should use prod as default env if none specified', () => {
    setLocation('', 'prod.com', 'https://prod.com');
    const kitty = new DappKitty(undefined, window);
    expect(kitty.config.env).toBe('prod');
  });
});

