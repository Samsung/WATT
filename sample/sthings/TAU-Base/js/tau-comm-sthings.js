(function (window, tau, TComm) {
    "use strict";
    var tcom = new TComm();
    var tries = 0;
    var deviceHandle = Date.now() + Math.round(Math.random() * 1000000);

    var onTCommMessage = function (callback, data) {
        var result = data.result;
        var deviceHandle = data.deviceHandle;
        var uri = data.uri;
        var rcs = data.rcs;

        callback(result, deviceHandle, uri, rcs);
    };

    var sthingsMock = {
        ocfDevice: {
            subscribe: function (onSubscribe) {
                tcom.on('smartthings', onTCommMessage.bind(null, onSubscribe));
            },
            setRemoteRepresentation: function (capability, data, callback) {
                tcom.send('smartthings', {
                    result: "OCF_OK", // 'OCF_RESOURCE_CHANGED', 'OCF_RES_ALREADY_SUBSCRIBED'
                    deviceHandle: deviceHandle,
                    uri: capability,
                    rcs: data
                });
                if (typeof callback === "function") {
                    callback();
                }
            }
        },
        init: function () {
            if (tries === 0) {
                console.log('connecting to network');
            } else {
                console.log('trying again');
            }

            tcom.start().then(function () {
                console.log('connected');
            }).catch(function (err) {
                console.error(err);
                if (++tries <= 3) {
                    window.setTimeout(sthingsMock.init, 3000);
                } else {
                    console.log('connection failed');
                }
            });
        }
    };

    // Overide current sthings API by mock;
    window.sthingsMock = sthingsMock;

}(window, window.tau, window.TComm && window.TComm.default));

