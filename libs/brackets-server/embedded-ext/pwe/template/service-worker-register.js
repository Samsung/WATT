if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
        .then(function() {
            console.log("Service worker is registered.");
            navigator.serviceWorker.register("./service-worker-push.js")
                .then(function() {
                    navigator.serviceWorker.ready
                        .then(function(registration) {
                            registration.pushManager.subscribe({ userVisibleOnly: true })
                                .then(function(subscription) {
                                    console.log("Service worker Subscribe successful.");
                                    const endPoint = subscription.endpoint.split("/");
                                    const regTokens = endPoint[endPoint.length - 1];

                                    const HostserverUrl = "https://pwe.now.im/";
                                    const decoder = new TextDecoder("utf-8");
                                    /* eslint-disable no-undef */
                                    const senderId = decoder.decode(new Uint8Array(subscription.options.applicationServerKey));
                                    const request = new Request(`${HostserverUrl}register/${regTokens}/${senderId}`, {
                                        method: "POST",
                                        mode: "no-cors",
                                    });
                                    fetch(request)
                                        .catch(function(error) {
                                            console.error("Request error: ",  error);
                                        });

                                });
                        })
                        .catch(function (error) {
                            console.error("Service worker not ready: ", error);
                        });
                })
                .catch(function (error) {
                    console.error("Service worker register failed: ", error);
                });
        });
};
