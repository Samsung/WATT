/*global window, tau*/
(function (window, document) {
	var page = document.getElementById("load-more-contents-page"),
		activityIndicator = page.querySelector(".ui-processing"),
		appContent = document.getElementById("app-content"),
		textContent = "It was a real pleasure for me to finally get to meet you." +
			"My colleagues join me in sending you our holiday...";

	/**
	 * load content (mock-up)
	 */
	function loadContent() {
		activityIndicator.classList.remove("ui-hidden");
		window.setTimeout(function () {
			activityIndicator.classList.add("ui-hidden");
			appContent.innerHTML += textContent;
		}, 1200);
	}

	function onReachScrollEnd(ev) {
		if (ev.detail.bottom) {
			loadContent();
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		tau.event.scrolledtoedge.enable();
		page.addEventListener("scrolledtoedge", onReachScrollEnd, true);
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagebeforehide", function () {
		page.removeEventListener("scrolledtoedge", onReachScrollEnd, true);
		tau.event.scrolledtoedge.disable();
	});

}(window, window.document));
