import { DappKitty } from '../src/dappKitty.js';


let kitty;
document.addEventListener('DOMContentLoaded', () => {
  kitty = new DappKitty();
  kitty.start();

  const showKittyBtn = document.getElementById('showKitty');
  const logDemoBtn = document.getElementById('logDemo');
  if (showKittyBtn) {
    showKittyBtn.addEventListener('click', () => {
      // Re-show or re-initialize if needed
      if (!document.getElementById('logKitty')) {
        kitty = new DappKitty();
        kitty.start();
      }
    });
  }
  if (logDemoBtn) {
    logDemoBtn.addEventListener('click', () => {
      if (kitty) {
        kitty.logKitty.info('This is an info message from the preview app!');
        kitty.logKitty.warn('This is a warning from the preview app!');
        kitty.logKitty.error('This is an error from the preview app!');
        kitty.logKitty.debug('This is a debug message from the preview app!');
      }
    });
  }
});
