(function (document, tau) {
	var page = document.getElementById("searchInputPage"),
		search = document.getElementById("demo-page-search-input"),
		list = document.getElementById("searchList"),
		listItems = list.querySelectorAll("[data-filtertext]"),
		listItemsArray = [].slice.call(listItems),
		searchHandlerBound,
		searchClearBound,
		listview;

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
		listview.refresh();
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
		listview = tau.widget.Listview(list);
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		search.removeEventListener("keyup", searchHandlerBound, false);
		search.removeEventListener("search", searchClearBound, false);
	});

}(window.document, window.tau));

