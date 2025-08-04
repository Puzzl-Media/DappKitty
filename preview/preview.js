import dappKitty from '../src/dappKitty.js';


document.addEventListener('DOMContentLoaded', () => {
  dappKitty('debug');

  const showKittyBtn = document.getElementById('showKitty');
  const logDemoBtn = document.getElementById('logDemo');
  if (logDemoBtn) {
    logDemoBtn.addEventListener('click', () => {
      logKitty.info('This is an info message from the preview app!');
      logKitty.warn('This is a warning from the preview app!');
      logKitty.error('This is an error from the preview app!');
      logKitty.debug('This is a debug message from the preview app!');
    });
  }
});
