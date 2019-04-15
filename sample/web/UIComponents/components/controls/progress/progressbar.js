(function (tau) {
	/**
	 * page - Progress bar page element
	 * progressBar - Progress bar #1 element
	 * progressBar2 - Progress bar #2 element
	 * progressBar3 - Progress bar #3 element
	 * progressBarWidget - TAU progress instance
	 * progressBarWidget2 - TAU progress instance
	 * progressBarWidget3 - TAU progress instance
	 * pageBeforeShowHandler - pagebeforeshow event handler
	 */
	var page = document.getElementById("progressbar-demo"),
		progressBar = document.getElementById("progressbar"),
		progressBar2 = document.getElementById("progressbar2"),
		progressBar3 = document.getElementById("progressbar3"),
		progressBarWidget,
		progressBarWidget2,
		progressBarWidget3,
		pageBeforeShowHandler,
		pageBeforeHideHandler,
		timers = [];

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageBeforeShowHandler = function () {
		progressBarWidget = new tau.widget.Progress(progressBar);
		progressBarWidget2 = new tau.widget.Progress(progressBar2);
		progressBarWidget3 = new tau.widget.Progress(progressBar3);

		timers[1] = setTimeout(function () {
			progressBarWidget.value(100);
		}, 1000);
		timers[2] = setTimeout(function () {
			progressBarWidget2.value(50);
			progressBarWidget3.value(70);
		}, 2000);
		timers[3] = setTimeout(function () {
			progressBarWidget2.value(70);
			progressBarWidget3.value(30);
		}, 300);
		timers[4] = setTimeout(function () {
			progressBarWidget2.value(100);
			progressBarWidget3.value(100);
		}, 4000);
	};

	/**
	 * pagebeforehide event handler
	 * Stop timers before destroy page
	 */
	pageBeforeHideHandler = function () {
		clearTimeout(timers[1]);
		clearTimeout(timers[2]);
		clearTimeout(timers[3]);
		clearTimeout(timers[4]);
	};

	page.addEventListener("pagebeforeshow", pageBeforeShowHandler);
	page.addEventListener("pagebeforehide", pageBeforeHideHandler);
}(window.tau));
