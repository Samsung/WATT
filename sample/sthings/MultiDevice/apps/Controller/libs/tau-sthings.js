/*global tau, sthingsMock*/
document.addEventListener("DOMContentLoaded", function () {
    var timer = null,
        DELAY = 250,
        widgets = Array.prototype.slice.call(document.querySelectorAll("[data-st-device]"));

    function onSubscribe(result, deviceHandle, uri, rcs) {
        var listeners = [],
            capabilityMatches,
            capability = "";

        capabilityMatches = uri.match(/\/capability\/([^\/]+)\/main\/0/);
        if (capabilityMatches.length > 0) {
            capabilityMatches = uri.match(/\/[^\/]+\/([^\/]+)/);
        }
        capability = capabilityMatches[1];

        listeners = widgets.filter(function (widgetElement) {
            return widgetElement.getAttribute("data-st-device") === capability;
        });

        if (result === "OCF_OK") {
            listeners.forEach(function (listener) {
                var property = listener.getAttribute("data-st-property");
			    var properties = property.split(/[ ,]/);

				properties.forEach(function (property) {
					if (rcs[property]) {
						updateWidgetValue(listener, property, uri, rcs);
					}
                });
            });
        }
    }

    widgets.forEach(function (item) {
        var device = item.getAttribute("data-st-device");
        var property = item.getAttribute("data-st-property");

        addListener(item, device, property);
    });

    sthingsMock.ocfDevice.subscribe(onSubscribe);

    function addListener(element, device, property) {
        var elementType = element.getAttribute("type");

        switch (elementType) {
            case "range":
                element.addEventListener("input", function (event) {
                    var newVal = parseInt(event.target.getAttribute('value'));
                    var obj = {};
                    obj[property] = newVal;

                    window.clearTimeout(timer);
                    timer = window.setTimeout(function () {
                        // calling this method with timeout reduce unnecessary requests during widget change value
                        sthingsMock.ocfDevice.setRemoteRepresentation('/capability/' + device + '/main/0',
                            obj,
                            function sthingsCallback(result, deviceHandle, uri, rcsJsonString) {
                                if (result == 'OCF_OK' || result == 'OCF_RESOURCE_CHANGED' ||
                                    result == 'OCF_RES_ALREADY_SUBSCRIBED') {
                                    /*
                                    * disabled
                                    * this widget update causes looping
                                    */
                                    //updateWidgetValue(element, property, uri, rcsJsonString);
                                }
                            });
                    }, DELAY);
                });
                break;
            case "checkbox":
                element.addEventListener("click", function () {
                    var obj = {};
                    obj[property] = element.checked ? 'on' : 'off';
                    sthingsMock.ocfDevice.setRemoteRepresentation('/capability/' + device + '/main/0',
                        obj,
                        function sthingsCallback(result, deviceHandle, uri, rcsJsonString) {
                            if (result == 'OCF_OK' || result == 'OCF_RESOURCE_CHANGED' ||
                                result == 'OCF_RES_ALREADY_SUBSCRIBED') {
                                updateWidgetValue(element, property, uri, rcsJsonString);
                            }
                        });
                });
                break;
            default :
				element.addEventListener("click", function () {
					var obj = {};
					var widget = tau.engine.getBinding(element);
					if (widget) {
						obj[property] = widget.value();
					}
					sthingsMock.ocfDevice.setRemoteRepresentation('/capability/' + device + '/main/0',
						obj,
						function () {} );
				});
                break;
        }
    }

    function updateWidgetValue(element, property, uri, rcs) {
        var elementType = element.getAttribute("type");
        var properties;

        if (elementType === "checkbox") {
            element.checked = rcs[property] === 'on';
            tau.engine.getBinding(element).refresh();
        } else {
            widget = tau.engine.getBinding(element);
            if (widget) {
				properties = element.getAttribute("data-st-property").split(/[ ,]/);
				if (properties.length > 1) {
					widget.value(rcs)
                } else {
					widget.value(rcs[property]);
                }
            }
        }
    }

    // Initialize S-Things.js
    sthingsMock.init();
});