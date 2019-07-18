/* global tau */
(function () {
	var page = document.getElementById("rotary-selector-edit-mode-page"),
		selector = document.getElementById("rotary-selector-edit-mode"),
		selectorComponent;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		selectorComponent = tau.widget.Selector(selector);
		selector.addEventListener("add", onAdd);
	});

	function onAdd() {
		var newItem = document.createElement("div");

		newItem.setAttribute("data-title", "New item");
		selectorComponent.addItem(newItem);
	}

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */

	page.addEventListener("pagebeforehide", function () {
		selectorComponent.destroy();
		selector.removeEventListener("add", onAdd);
	});
}());