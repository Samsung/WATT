/*global tau */
(function () {
	var pageElement = document.getElementById("icon-button-from-js-page"),
		buttonElement = document.getElementById("icon-button-from-js"),
		button;

	function onPageBeforeShow() {
		//creating Button widget with passed options
		button = tau.widget.Button(buttonElement, {
			style: "nobg",
			middle: true,
			icon: "../../../css/images/gallery_more_opt_save.png"
		});
	}

	function onPageHide() {
		button.destroy();
	}

	pageElement.addEventListener("pagebeforeshow", onPageBeforeShow);
	pageElement.addEventListener("pagehide", onPageHide);
}());
