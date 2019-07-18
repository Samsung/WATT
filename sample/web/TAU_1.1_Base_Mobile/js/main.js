(function () {
	/**
	 * Back key event handler
	 */
	window.addEventListener("tizenhwkey", function (ev) {
		var activePopup = null,
			page = null,
			pageid = "";

		if (ev.keyName === "back") {
			activePopup = document.querySelector(".ui-popup-active");
			page = document.getElementsByClassName("ui-page-active")[0];
			pageid = page ? page.id : "";

			if (pageid === "main" && !activePopup) {
				try {
					/**
					 * Exit application
					 */
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				/**
				 * Go to previous browser window
				 */
				window.history.back();
			}
		}
	});
}());