(function (tau) {
	/**
	 * page - More menu page element
	 * morePopup - More menu popup element
	 * pageShowHandler - pageshow event handler
	 * pageHideHandler - pagehide event handler
	 * menukeyHandler - menu key event handler
	 */
	var page = document.getElementById("moremenuheader-page"),
		morePopup = document.getElementById("moremenu-header"),
		pageShowHandler,
		pageHideHandler,
		menukeyHandler;

	/**
	 * tizenhwkey event handler
	 * @param {Event} event
	 */
	menukeyHandler = function (event) {
		if (event.keyName === "menu") {
			if (morePopup.classList.contains("ui-popup-active")) {
				tau.closePopup();
			} else {
				tau.openPopup("#moremenu-header");
			}
		}
	};

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageShowHandler = function () {
		window.addEventListener("tizenhwkey", menukeyHandler);
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		window.removeEventListener("tizenhwkey", menukeyHandler);
	};

	page.addEventListener("pageshow", pageShowHandler, false);
	page.addEventListener("pagehide", pageHideHandler, false);
}(window.tau));
