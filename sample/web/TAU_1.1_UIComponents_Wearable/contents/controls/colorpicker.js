/* global tau */
(function () {
	var page = document.getElementById("colorpickerPage"),
		colorpicker = document.getElementById("colorpicker"),
		colorpickerComponent;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		colorpickerComponent = tau.widget.ColorPicker(colorpicker);
	});

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagebeforehide", function () {
		colorpickerComponent.destroy();
	});
}());