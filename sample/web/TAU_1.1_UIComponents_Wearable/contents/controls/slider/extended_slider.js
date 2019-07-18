/*global tau */
(function () {
	/**
	 * page - Slider page element
	 * elSlider - Slider element
	 * slider - Slider component
	 * pageBeforeShowHandler - pagebeforeshow event handler
	 * pageHideHandler - pagehide event handler
	 */
	var page = document.getElementById("pageSlider"),
		elSlider = document.getElementById("slider"),
		iconSlider = document.getElementById("slider-icon"),
		slider,
		pageBeforeShowHandler,
		pageHideHandler;


	function changeOpacity(event) {
		iconSlider.style.opacity = event.target.value / 10;
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageBeforeShowHandler = function () {
		slider = tau.widget.Slider(elSlider);
		elSlider.addEventListener("change", changeOpacity, false);
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		slider.destroy();
		elSlider.removeEventListener("change", changeOpacity, false);
	};

	page.addEventListener("pagebeforeshow", pageBeforeShowHandler, false);
	page.addEventListener("pagehide", pageHideHandler, false);
}());
