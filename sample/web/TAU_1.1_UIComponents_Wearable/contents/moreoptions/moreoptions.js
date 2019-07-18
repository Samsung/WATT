/*global tau */
/*jslint unparam: true */
(function () {
	/**
	 * page - More option page element
	 * popup - More option popup element for rectangular devices
	 * handler - Element for opening more option popup
	 * popupCircle - More option popup element for circular devices
	 * elSelector - Selector element in the circular popup
	 * selector - TAU selector instance
	 */
	var page = document.querySelector("#moreoptionsPage"),
		popup = page.querySelector("#moreoptionsPopup"),
		handler = page.querySelector(".ui-more"),
		popupCircle = page.querySelector("#moreoptionsPopupCircle"),
		elSelector = page.querySelector("#selector"),
		selector,
		clickHandlerBound;

	/**
	 * Click event handler for opening more option popup
	 */
	function clickHandler() {
		if (tau.support.shape.circle) {
			tau.openPopup(popupCircle);
		} else {
			tau.openPopup(popup);
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		var radius = window.innerHeight / 2 * 0.8;

		clickHandlerBound = clickHandler.bind(null);
		handler.addEventListener("click", clickHandlerBound);
		if (tau.support.shape.circle) {
			selector = tau.widget.Selector(elSelector, {itemRadius: radius});
		}
	});

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagebeforehide", function () {
		handler.removeEventListener("click", clickHandlerBound);
		if (tau.support.shape.circle) {
			selector.destroy();
		}
	});

	/**
	 * When user click the indicator of Selector, drawer will close.
	 */
	elSelector.addEventListener("click", function (event) {
		var target = event.target;

		if (tau.support.shape.circle) {
			// 'ui-selector-indicator' is default indicator class name of Selector component
			if (target.classList.contains("ui-selector-indicator")) {
				tau.closePopup(popupCircle);
			}
		}
	});
}());
