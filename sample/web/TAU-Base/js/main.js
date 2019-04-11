/* global tau */
(function (baseURI) {
  function joinWidget(widget1Element, widgets) {
    widget1Element.addEventListener(
      'input',
      function (event) {
        widgets.forEach(function (targetWidgetElement) {
          var widget = tau.engine.getBinding(targetWidgetElement),
              valueInt = parseInt(event.target.value)

          if (widget) {
            widget.value(valueInt);
          } else {
            targetWidgetElement.innerText = valueInt;
          }
        });
      }
    );
  }

  /**
   * Returns file at URL as a string
   * @param {string} url
   * @return {string}
   */
  function fetchFile(url) {
    var xhr = new XMLHttpRequest();
    var fileURL = baseURI + '/' + url;

    xhr.open('get', fileURL, false);
    xhr.send();

    if (xhr.readyState === 4) {
      if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
        return xhr.responseText;
      }
    }

    return null;
  }

  /**
   * Searches for <scipt type="text/tau-javascript"> in document
   * and evaluates them for specified page
   * @param {HTMLElement} page
   */
  function evaluateScripts(page) {
    var scripts = page.querySelectorAll('script[type="text/tau-javascript"]');
    var scriptElement;
    var scriptBody;
    var i;
    var l;
    var src;

    for (i = 0, l = scripts.length; i < l; ++i) {
      src = scripts[i].src;
      if (src) {
        scriptBody = fetchFile(scripts[i].getAttribute('src'));
      } else {
        scriptBody = scripts[i].textContent;
      }

      if (scriptBody) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'text/javascript');
        scriptElement.src =
            window.URL.createObjectURL(
              new Blob(
                [scriptBody],
                {type: 'text/javascript'}
              )
            );
        scriptElement.textContent = scriptBody;
        scripts[i].parentNode.replaceChild(scriptElement, scripts[i]);
      }
    }
  }


  function pageshowHandler(event) {
    var page = event.target && event.target.classList.contains('ui-page')
          ? event.target
          : null;
    var connections = {};
    var dKeys;
    var pKeys;
    var device;
    var property;

    if (!page) {
      return;
    }

    evaluateScripts(page);

    page.querySelectorAll('[data-st-device]').forEach(function (widget) {
      device = widget.getAttribute('data-st-device');
      property = widget.getAttribute('data-st-property');

      if (!connections[device]) {
        connections[device] = {};
      }
      if (!connections[device][property]) {
        connections[device][property] = [];
      }
      connections[device][property].push(widget);
    });

    dKeys = Object.keys(connections);
    dKeys.forEach(function (dkey) {
      device = connections[dkey];
      pKeys = Object.keys(device);
      pKeys.forEach(function (pKey) {
        property = device[pKey];
        if (property.length > 1) {
          property.forEach(function (p) {
            joinWidget(p, property.filter(function (widget) {
              return widget !== p;
            }));
          });
        }
      });
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.ui-page').forEach(function (page) {
      page.addEventListener('pageshow', pageshowHandler, false);
    });
  });
}(document.baseURI)); // this is needed before TAU loads
