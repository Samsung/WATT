/*global tau */
(function (window) {

	var page = document.getElementById("page-marquee-list"),
		elScroller,
		listHelper;

		/**
		 * pagebeforeshow event handler
		 * Do preparatory works and adds event listeners
		 */
	page.addEventListener("pagebeforeshow", function () {
		var list;

		elScroller = page.querySelector(".ui-scroller");
		if (elScroller) {
			list = elScroller.querySelector(".ui-listview");
		}

		if (elScroller && list || !window.tau.support.shape.circle) {
			listHelper = tau.helper.SnapListMarqueeStyle.create(list, {
				marqueeDelay: 1000,
				marqueeStyle: "endToEnd",
				animate: "scale"
			});
		}
	});
	/**
		 * pagehide event handler
		 * Destroys and removes event listeners
		 */
	page.addEventListener("pagebeforehide", function () {
		if (listHelper) {
			listHelper.destroy();
			listHelper = null;
		}
	});

}(window));