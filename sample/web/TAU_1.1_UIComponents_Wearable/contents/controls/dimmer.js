(function () {
	var page = document.getElementById("dimmer-page"),
		elSlider = document.getElementById("slider"),
		elDimmer = document.getElementById("dimmer"),
		dimmer,
		slider,
		pageBeforeShowHandler,
		pageHideHandler;

	pageBeforeShowHandler = function () {
		slider = tau.widget.Slider(elSlider);
		dimmer = tau.widget.Dimmer(elDimmer);
		elSlider.addEventListener("change", onInput, false);
	};

	function onInput(event) {
		var newVal = parseInt(event.target.value);

		dimmer.value(newVal);
	}

	pageHideHandler = function () {
		slider.destroy();
		dimmer.destroy();
	};

	page.addEventListener("pagebeforeshow", pageBeforeShowHandler);
	page.addEventListener("pagehide", pageHideHandler);
}());
