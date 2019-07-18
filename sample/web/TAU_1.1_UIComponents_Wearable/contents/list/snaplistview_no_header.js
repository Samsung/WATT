/* global tau */
(function () {
	var page = document.getElementById("page-snaplistview-no-header"),
		listHelper;

	page.addEventListener("pagebeforeshow", function () {
		var list = page.querySelector(".ui-listview");

		listHelper = tau.helper.SnapListStyle.create(list, {
			animate: "scale"
		});
	});

	page.addEventListener("pagebeforehide", function () {
		if (listHelper) {
			listHelper.destroy();
			listHelper = null;
		}
	});
}());