/*global tau */
(function () {
	var page = document.getElementById("number-picker-page"),
		element = document.getElementById("sample-number-picker"),
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
