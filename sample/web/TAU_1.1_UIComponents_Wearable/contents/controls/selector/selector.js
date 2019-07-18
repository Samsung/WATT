/* global tau */
(function () {
	var page = document.getElementById("selector-page"),
		selector = document.getElementById("selector"),
		selectorComponent,
		clickBound;

	/**
	 * click event handler for the selector
	 * @param {Event} event
	 */
	function onClick(event) {
		var target = event.target;

		//console.log(activeItem.getAttribute("data-title"));
		/*
		 * Default indicator class selector is "ui-selector-indicator".
		 * If you want to show custom indicator sample code,
		 * check the 'customIndicator.js' please.
		 */
		if (target.classList.contains("ui-selector-indicator")) {
			//console.log("Indicator clicked");
			return;
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		clickBound = onClick.bind(null);
		selectorComponent = tau.widget.Selector(selector);
		selector.addEventListener("click", clickBound, false);
	});

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagebeforehide", function () {
		selector.removeEventListener("click", clickBound, false);
		selectorComponent.destroy();
	});
}());