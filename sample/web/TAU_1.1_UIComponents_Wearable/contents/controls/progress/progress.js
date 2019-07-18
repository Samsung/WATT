/*global tau */
(function () {
	/**
	 * page - Progress page element
	 * progressBar - Circle progress element
	 * minusBtn - Minus button element
	 * plusBtn - Plus button element
	 * resultDiv - Indicator element for the progress percentage
	 * isCircle - TAU button instance for delete button
	 * progressBarWidget - TAU circle progress instance
	 * resultText - Text value for the progress percentage
	 * pageBeforeShowHandler - pagebeforeshow event handler
	 * pageHideHandler - pagehide event handler
	 */
	var page = document.querySelector(".circle-progress-page"),
		progressBar = null,
		minusBtn = null,
		plusBtn = null,
		resultDiv = null,
		isCircle = tau.support.shape.circle,
		progressBarWidget,
		resultText,
		pageBeforeShowHandler,
		pageHideHandler,
		i;

	/**
	 * Updates the percentage of the progress
	 */
	function printResult() {
		if (resultDiv) {
			resultText = progressBarWidget.value();
			resultDiv.innerHTML = resultText + "%";
		}
	}

	/**
	 * Initializes global variables
	 */
	function clearVariables() {
		page = null;
		progressBar = null;
		minusBtn = null;
		plusBtn = null;
		resultDiv = null;
	}

	/**
	 * Click event handler for minus button
	 */
	function minusBtnClickHandler() {
		i = i - 10;
		if (i < 0) {
			i = 0;
		}
		progressBarWidget.value(i);
		printResult();
	}

	/**
	 * Click event handler for plus button
	 */
	function plusBtnClickHandler() {
		i = i + 10;
		if (i > 100) {
			i = 100;
		}
		progressBarWidget.value(i);
		printResult();
	}

	/**
	 * Rotary event handler
	 */
	function rotaryDetentHandler() {
		// Get rotary direction
		var direction = event.detail.direction,
			value = parseInt(progressBarWidget.value(), 10);

		if (direction === "CW") {
			// Right direction
			if (value < 100) {
				value++;
			} else {
				value = 100;
			}
		} else if (direction === "CCW") {
			// Left direction
			if (value > 0) {
				value--;
			} else {
				value = 0;
			}
		}

		progressBarWidget.value(value);
		printResult();
	}

	/**
	 * Removes event listeners
	 */
	function unbindEvents() {
		page.removeEventListener("pageshow", pageBeforeShowHandler);
		page.removeEventListener("pagehide", pageHideHandler);
		if (isCircle) {
			document.removeEventListener("rotarydetent", rotaryDetentHandler);
		} else {
			minusBtn.removeEventListener("click", minusBtnClickHandler);
			plusBtn.removeEventListener("click", plusBtnClickHandler);
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageBeforeShowHandler = function () {
		progressBar = page.querySelector(".ui-circle-progress");
		minusBtn = page.querySelector(".minus");
		plusBtn = page.querySelector(".plus");
		resultDiv = page.querySelector(".result");

		if (isCircle) {
			// make Circle Progressbar object
			progressBarWidget = new tau.widget.CircleProgressBar(progressBar);
			document.addEventListener("rotarydetent", rotaryDetentHandler);
		} else {
			progressBarWidget = new tau.widget.CircleProgressBar(progressBar);
			minusBtn.addEventListener("click", minusBtnClickHandler);
			plusBtn.addEventListener("click", plusBtnClickHandler);
		}

		i = parseInt(progressBarWidget.value(), 10);

		if (resultDiv) {
			resultDiv.innerHTML = i + "%";
		}
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		unbindEvents();
		clearVariables();
		// release object
		progressBarWidget.destroy();
	};

	page.addEventListener("pagebeforeshow", pageBeforeShowHandler);
	page.addEventListener("pagehide", pageHideHandler);
}());
