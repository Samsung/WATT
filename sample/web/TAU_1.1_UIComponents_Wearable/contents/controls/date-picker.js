/*global tau */
(function () {
	var page = document.getElementById("date-picker-page"),
		element = page.querySelector(".ui-date-picker"),
		widget = null;

	function init() {
		widget = tau.widget.DatePicker(element);
	}

	function onPageHide() {
		widget.destroy();
	}

	page.addEventListener("pagebeforeshow", init);
	page.addEventListener("pagehide", onPageHide);
}());
