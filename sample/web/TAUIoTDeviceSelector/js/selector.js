window.addEventListener('deviceready', e => {
  const selectorWidget = tau.widget.Selector(
    document.getElementById("iot-selector")
  );

  e.detail.devices.forEach(d => {
    const deviceElement = document.createElement("div");
    deviceElement.setAttribute("class", "ui-item ui-show-icon");
    deviceElement.setAttribute("data-title", d.deviceName);
    selectorWidget.addItem(deviceElement);
  });

  // Remove this stub element since it's no longer needed.
  selectorWidget.removeItem(0);
});
