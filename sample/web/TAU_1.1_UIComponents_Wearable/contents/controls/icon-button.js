/*global tau */
(function () {
	var page = document.getElementById("icon-button-page"),
		element = page.querySelector("button"),
		widget;

	function onPageBeforeShow() {
		//creating Button widget with passed options
		widget = tau.widget.Button(element, {
			style: "icon-middle",
			size: "97px",
			icon: "../../css/images/gallery_more_opt_save.png"});
	}

	function onPageHide() {
		widget.destroy();
	}

	page.addEventListener("pagebeforeshow", onPageBeforeShow);
	page.addEventListener("pagehide", onPageHide);
}());
