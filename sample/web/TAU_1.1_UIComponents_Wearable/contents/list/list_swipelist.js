/*global tau */
(function () {

	var page = document.getElementById("page-swipelist"),
		listElement = page.getElementsByClassName("ui-listview")[0],
		swipeList;

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		// make SwipeList object
		swipeList = tau.widget.SwipeList(listElement, {
			swipeTarget: "li",
			swipeElement: ".ui-swipelist"
		});
	}, true);

	/**
	 * pagebeforehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagebeforehide", function () {
		// release object
		swipeList.destroy();
	});

}());
