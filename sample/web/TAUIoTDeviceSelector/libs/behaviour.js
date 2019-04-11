(function () {
    var behaviorDefinitionElement = document.querySelector('script[data-closet-behavior]'),
        behaviorDefinitions = {},
        eventNames = {};

    if (behaviorDefinitionElement) {
        try {
            behaviorDefinitions = JSON.parse(behaviorDefinitionElement.textContent);
        } catch (e) {
            console.warn(e);
        }
    }

    if (Object.keys(behaviorDefinitions).length) {
        Object.keys(behaviorDefinitions).forEach((i) => {
            behaviorDefinitions[i].forEach(function (behaviorDefinition) {
                eventNames[behaviorDefinition.event] = true;
            });
        });
        Object.keys(eventNames).forEach(function (eventName) {
            document.body.addEventListener(eventName, function (event) {
                var eventDefinition = (event.target.id && behaviorDefinitions[event.target.id]) || [];
                eventDefinition.filter(function (definition) {
                    return definition.event === event.type;
                }).forEach(function (definition) {
                    switch (definition.type) {
                      case 'animation':
                        document.body.classList.remove(definition.options['animation-name']);
                        requestAnimationFrame(function () {
                          document.body.classList.add(definition.options['animation-name']);
                        });
                        break;
                      case 'page':
                        tau.changePage(definition.options['page-name']);
                        break;
                      default:
                        console.error('Behavior type is unknown');
                    }
                });
            });
        });
    }
}());
