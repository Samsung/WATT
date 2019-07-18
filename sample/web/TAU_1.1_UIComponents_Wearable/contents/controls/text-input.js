/*global tau */
(function () {
	var page = document.getElementById("page-text-input"),
		inputName = page.querySelector("input[name=\"name\"]"),
		inputPhone = page.querySelector("input[name=\"phonenumber\"]"),
		inputPhone2 = page.querySelector("input[name=\"phonenumber2\"]"),
		nameWidget,
		phoneWidget,
		phone2Widget;

	function init() {
		nameWidget = tau.widget.TextInput(inputName);
		phoneWidget = tau.widget.TextInput(inputPhone);
		phone2Widget = tau.widget.TextInput(inputPhone2);
	}

	function destroy() {
		nameWidget.destroy();
		phoneWidget.destroy();
		phone2Widget.destroy();
	}

	page.addEventListener("pagebeforeshow", init);
	page.addEventListener("pagehide", destroy);
}());
