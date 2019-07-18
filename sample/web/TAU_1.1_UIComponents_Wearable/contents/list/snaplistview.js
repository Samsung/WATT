/* global tau */
(function () {
	var page = document.getElementById("page-snaplistview"),
		listHelper,
		elScroller;

	page.addEventListener("pagebeforeshow", function () {
		var list;

		elScroller = page.querySelector(".ui-scroller");
		if (elScroller) {
			list = elScroller.querySelector(".ui-listview");
		}

		if (elScroller && list) {
			listHelper = tau.helper.SnapListStyle.create(list, {animate: "scale"});
		}
	});

	page.addEventListener("pagebeforehide", function () {
		if (listHelper) {
			listHelper.destroy();

			listHelper = null;
		}
	});
}());