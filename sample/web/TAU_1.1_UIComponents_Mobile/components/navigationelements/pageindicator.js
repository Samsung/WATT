/* global tau */
(function () {
	var page = document.querySelector(".page-indicator-page"),
		changer = page.querySelector(".ui-section-changer"),
		elPageIndicator = page.querySelector(".ui-page-indicator"),
		pageIndicator,
		pageIndicatorHandler;

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pageshow", function () {
		pageIndicator = tau.widget.PageIndicator(elPageIndicator);
		pageIndicator.setActive(0);
	});

	/**
	 * sectionchange event handler
	 * @param {Event} e
	 */
	pageIndicatorHandler = function (e) {
		pageIndicator.setActive(e.detail.active);
	};
	/**
	 * Add listener on section change
	 */
	changer.addEventListener("sectionchange", pageIndicatorHandler, false);

}());
