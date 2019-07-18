/*global tau */
(function () {
	var page = document.getElementById("accelerated-number-picker-page"),
		element = document.getElementById("accelerated-number-picker"),
		widget = null;

	function init() {
		widget = tau.widget.NumberPicker(element);
	}

	function onPageHide() {
		widget.destroy();
	}

	page.addEventListener("pagebeforeshow", init);
	page.addEventListener("pagehide", onPageHide);
}());
