(function (tau) {
	var page = document.getElementById("page-empty-state-search"),
		search = document.getElementById("search-input"),
		list = document.querySelector(".ui-section-active .ui-listview"),
		listview = null,
		listItems = list.querySelectorAll("[data-filtertext]"),
		listItemsArray = [].slice.call(listItems),
		searchHandlerBound,
		searchClearBound;

	function updateEmptyState() {
		var list = document.querySelector(".ui-section-active .ui-listview"),
			itemsCount;

		if (list) {
			listview = tau.widget.Listview(list);
			itemsCount = list.querySelectorAll("li[data-filtertext]").length;
			// show empty state if no results found
			if (itemsCount > 0 &&
				list.querySelectorAll(".li-search-hidden").length === itemsCount) {
				list.classList.add("ui-listview-empty-state-show");
			} else {
				list.classList.remove("ui-listview-empty-state-show");
			}
		}
	}

	/**
	 * Shows items that match the entered value
	 * keyup event handler
	 */
	function searchHandler() {
		listItemsArray.forEach(function (item) {
			var itemText = item.getAttribute("data-filtertext");

			if (itemText.toString().toLowerCase().indexOf(search.value.toLowerCase()) === -1) {
				item.classList.add("li-search-hidden");
			} else {
				item.classList.remove("li-search-hidden");
			}
		});

		updateEmptyState();

		// update colored listview
		listview.refresh();
	}

	/**
	 * Initializes search result
	 */
	function searchClear() {
		if (search.value === "") {
			listItemsArray.forEach(function (item) {
				item.classList.remove("li-search-hidden");
			});
		}

		updateEmptyState();
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		searchHandlerBound = searchHandler.bind(this);
		searchClearBound = searchClear.bind(this);
		search.addEventListener("keyup", searchHandlerBound, false);
		search.addEventListener("search", searchClearBound, false);
	});

	page.addEventListener("pageshow", function () {
		// get listview widget instance
		listview = tau.widget.Listview(list);
		search.focus();
		tau.event.trigger(search, "keyup");
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		search.removeEventListener("keyup", searchHandlerBound, false);
		search.removeEventListener("search", searchClearBound, false);
	});

}(window.tau));
