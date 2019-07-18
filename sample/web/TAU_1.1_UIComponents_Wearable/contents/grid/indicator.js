(function (tau) {
	var page = document.getElementById("grid-page-indicator"),
		element = document.getElementById("grid-grid-indicator"),
		elPageIndicator = document.getElementById("grid-indicator"),
		images = document.querySelectorAll(".ui-grid img"),
		pageIndicator,
		mode = "3x3",
		grid;

	/**
	 * sectionchange event handler
	 * @param {Event} e
	 */
	function pageIndicatorHandler(e) {
		if (mode === "thumbnail") {
			pageIndicator.setActive(e.detail.active);
		}
	}

	function modeChangeHandler(event) {
		mode = event.detail.mode;
		if (mode === "thumbnail") {
			elPageIndicator.style.visibility = "visible";
		} else {
			elPageIndicator.style.visibility = "hidden";
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		grid = tau.widget.Grid(element, {
			scrollbar: false
		});
		pageIndicator = tau.widget.PageIndicator(elPageIndicator, {
			numberOfPages: images.length,
			maxPage: images.length,
			layout: "circular"
		});
		pageIndicator.setActive(0);

		element.addEventListener("change", pageIndicatorHandler, false);
		element.addEventListener("modechange", modeChangeHandler, false);
	});

	/**
	 * pagebeforehide event handler
	 * Destroys widget
	 */
	page.addEventListener("pagebeforehide", function () {
		grid.destroy();
		element.removeEventListener("change", pageIndicatorHandler, false);
		element.removeEventListener("modechange", modeChangeHandler, false);
	});
}(window.tau));