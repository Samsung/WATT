(function (document, tau) {
	/**
	 * page - Activity page element
	 * popupElement - Activity popup element
	 * popup - Activity widget
	 * onPageShow - On page show handler
	 */
	var page = document.getElementById("activity-page"),
		popupElement = document.getElementById("activity-popup"),
		popup = tau.widget.Popup(popupElement),
		onPageShow = function () {
			popup.open();
		};

	page.addEventListener("pageshow", onPageShow);

}(window.document, window.tau));

