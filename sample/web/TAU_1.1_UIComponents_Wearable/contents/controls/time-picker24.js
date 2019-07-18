/*global tau */
(function () {
	var page = document.getElementById("number-picker-page"),
		element = page.querySelector(".ui-time-picker"),
		widget = null;

	function init() {
		widget = tau.widget.TimePicker(element);
	}

	function onPageHide() {
		widget.destroy();
	}

	page.addEventListener("pagebeforeshow", init);
	page.addEventListener("pagehide", onPageHide);
}());
