(function (tau) {
	var pageElement = document.querySelector(".grid-page"),
		gridElement = pageElement.querySelector(".ui-grid"),
		grid;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageElement.addEventListener("pagebeforeshow", function () {
		grid = tau.widget.Grid(gridElement);
	});

	/**
	 * pagebeforehide event handler
	 * Destroys widget
	 */
	pageElement.addEventListener("pagebeforehide", function () {
		grid.destroy();
	});
}(window.tau));