(function () {
	var page = document.getElementById("dimmer-page"),
		dimmer = document.getElementById("dimmer"),
		slider = document.getElementById("slider"),
		inputBound,
		dimmerWidget;

	page.addEventListener("pagebeforeshow", function () {
		inputBound = onInput.bind(null);
		dimmerWidget = tau.widget.Dimmer(dimmer);
		slider.addEventListener("input", inputBound, false);
	});

	function onInput(event) {
		var newVal = parseInt(event.target.value);

		dimmerWidget.value(newVal);
	}

	page.addEventListener("pagebeforehide", function () {
		dimmerWidget.destroy();
	});
})();