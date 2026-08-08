/* public/js/wompi.js */
(function (window) {
  'use strict';

  function Wompi(config) {
    this.config = config || {};
  }

  Wompi.prototype.open = function (callback) {
    var self = this;
    var iframe = document.createElement('iframe');
    var container = document.createElement('div');

    container.id = 'wompi-widget-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.zIndex = '999999';
    container.style.backgroundColor = 'rgba(0,0,0,0.65)';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';

    var checkoutUrl = 'https://id.wompi.sv/Comercio/Pago/' + encodeURIComponent(self.config.identificadorEnlaceComercio || '');
    
    iframe.src = checkoutUrl;
    iframe.style.width = '100%';
    iframe.style.maxWidth = '500px';
    iframe.style.height = '650px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '12px';

    container.appendChild(iframe);
    document.body.appendChild(container);

    var messageHandler = function (event) {
      if (event.origin.indexOf('wompi.sv') !== -1) {
        if (callback && typeof callback === 'function') {
          callback(event.data);
        }
        if (event.data && (event.data.close || event.data.transaccion)) {
          window.removeEventListener('message', messageHandler);
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }
      }
    };

    window.addEventListener('message', messageHandler);

    container.onclick = function (e) {
      if (e.target === container) {
        window.removeEventListener('message', messageHandler);
        document.body.removeChild(container);
        if (callback) callback({ close: true });
      }
    };
  };

  window.Wompi = Wompi;
})(window);