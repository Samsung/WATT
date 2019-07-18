/*global tau */
(function () {
	/**
	 * page - Multiple button page element
	 * handler - Element for opening selector popup
	 * popup - Selector popup element
	 * elSelector - Selector element in the popup
	 * selector - TAU selector instance
	 */
	var page = document.querySelector("#bottomButtonWithMorePage"),
		popup = page.querySelector("#moreButtonPopup"),
		elSelector = page.querySelector("#selector"),
		selector;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		var radius = window.innerHeight / 2 * 0.8;

		if (tau.support.shape.circle) {
			selector = tau.widget.Selector(elSelector, {itemRadius: radius});
		}
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		if (tau.support.shape.circle) {
			selector.destroy();
		}
	});

	/**
	 * click event handler for the selector
	 * When user click the indicator of Selector, the selector will be closed.
	 */
	elSelector.addEventListener("click", function (event) {
		var target = event.target;

		if (tau.support.shape.circle) {
			// 'ui-selector-indicator' is default indicator class name of Selector component
			if (target.classList.contains("ui-selector-indicator")) {
				tau.closePopup(popup);
			}
		}
	});
}());
