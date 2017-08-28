self.addEventListener('push', (event) => {
    event.waitUntil(
        self.registration.pushManager.getSubscription()
            .then(function(subscription) {
                const endPoint = subscription.endpoint.split('/');
                const regTokens =  endPoint[endPoint.length - 1];

                const HostserverUrl = 'https://pwe.now.im/';
                fetch(new Request(`${HostserverUrl}pushData/get/${regTokens}`, { method: 'GET' }))
                    .then(function(res) {
                        res.text().then(function(data) {
                            const message = JSON.parse(data);
                            self.registration.showNotification(message.title, {
                                body: message.url,
                                tag: 'shub-push-information',
                            });
                        });
                    });

            })
    );
});

self.addEventListener('notificationclick', (event) => {
    var body = event.notification.body;
    event.notification.close();
    event.waitUntil(
        /* eslint-disable no-undef */
        clients.matchAll({ type: "window" })
            .then(function(clientList) {
                for (var i = 0; i < clientList.length; i++) {
                    var client = clientList[i];
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                client.navigate(body);
            })
    );
});
