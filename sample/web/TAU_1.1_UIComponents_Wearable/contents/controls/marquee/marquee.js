/*global tau */
(function () {
	var page = document.getElementById("marqueeTest"),
		marqueeEl = document.getElementById("marquee"),
		marqueeEl2 = document.getElementById("marquee2"),
		marqueeEl3 = document.getElementById("marquee3"),
		marqueeEl4 = document.getElementById("marquee4"),
		startBtn = document.getElementById("start"),
		startFlag = true,
		marqueeWidget,
		marqueeWidget2,
		marqueeWidget3,
		marqueeWidget4,
		pageShowHandler,
		pageHideHandler;

	/**
	 * Initializes global variables
	 */
	function clearVariables() {
		page = null;
		marqueeEl = null;
		startBtn = null;
		marqueeWidget = null;
	}

	/**
	 * click event handler for start button
	 */
	function marqueeStartandStop() {
		if (startFlag) {
			startBtn.textContent = "START";
			marqueeWidget.stop();
			marqueeWidget2.stop();
			marqueeWidget3.stop();
			marqueeWidget4.stop();
		} else {
			startBtn.textContent = "STOP";
			marqueeWidget.start();
			marqueeWidget2.start();
			marqueeWidget3.start();
			marqueeWidget4.start();
		}
		startFlag = !startFlag;
	}

	/**
	 * Adds event listeners
	 */
	function bindEvents() {
		startBtn.addEventListener("vclick", marqueeStartandStop);
	}

	/**
	 * Removes event listeners
	 */
	function unbindEvents() {
		page.removeEventListener("pageshow", pageShowHandler);
		page.removeEventListener("pagehide", pageHideHandler);
		startBtn.removeEventListener("vclick", marqueeStartandStop);
	}

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageShowHandler = function () {
		bindEvents();
		marqueeWidget = new tau.widget.Marquee(marqueeEl);
		marqueeWidget2 = new tau.widget.Marquee(marqueeEl2);
		marqueeWidget3 = new tau.widget.Marquee(marqueeEl3);
		marqueeWidget4 = new tau.widget.Marquee(marqueeEl4);

		marqueeWidget.start();
		marqueeWidget2.start();
		marqueeWidget3.start();
		marqueeWidget4.start();
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		marqueeWidget.destroy();
		unbindEvents();
		clearVariables();
	};

	page.addEventListener("pageshow", pageShowHandler, false);
	page.addEventListener("pagehide", pageHideHandler, false);
}());

