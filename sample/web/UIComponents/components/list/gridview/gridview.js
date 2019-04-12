(function (tau) {
	/**
	 * elPage - Grid view page element
	 * elGrid - Grid view element
	 * modeBtn - Mode toggle button element
	 * gridList - TAU grid view instance
	 */
	var elPage = document.getElementById("grid-page"),
		elGrid = document.getElementById("gridview"),
		modeBtn = document.getElementById("modeBtn"),
		unbindEvents,
		adjustColumns,
		gridList;

	/**
	 * Toggles reorder/edit mode
	 */
	function modeHandler() {
		if (gridList.options.reorder === true) {
			gridList.option("reorder", false);
			modeBtn.textContent = "Edit";
		} else {
			gridList.option("reorder", true);
			modeBtn.textContent = "Done";
		}
	}

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	elPage.addEventListener("pageshow", function () {
		gridList = tau.widget.GridView(elGrid);
		modeBtn.addEventListener("click", modeHandler);
		adjustColumns();
		window.addEventListener("orientationchange", adjustColumns);
		window.addEventListener("pagebeforehide", unbindEvents);
	});

	adjustColumns = function () {
		if (window.screen.orientation.type === "landscape-primary") {
			gridList.option("cols", 7);
			gridList.refresh();
		} else if (window.screen.orientation.type === "portrait-primary") {
			gridList.option("cols", 4);
			gridList.refresh();
		}
	};

	unbindEvents = function () {
		window.removeEventListener("orientationchange", adjustColumns);
		window.removeEventListener("pagebeforehide", unbindEvents);
	};

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	elPage.addEventListener("pagebeforehide", function () {
		modeBtn.removeEventListener("click", modeHandler);
	});
}(window.tau));