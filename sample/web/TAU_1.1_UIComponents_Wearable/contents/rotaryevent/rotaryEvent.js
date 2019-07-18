/*global tau */
(function () {
	/**
	 * page - Rotary event page element
	 */
	var page = document.getElementById("pageRotaryEvent");

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function (event) {
		tau.util.rotaryScrolling.enable(event.target.firstElementChild);
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		tau.util.rotaryScrolling.disable();
	});
}());
