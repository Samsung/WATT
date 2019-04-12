/*global tau */
(function () {
	/**
	 * page - Circle progress page element
	 * progressBar - Circle progress element
	 * minusBtn - Minus button element
	 * plusBtn - Plus button element
	 * resultDiv - Indicator element for the progress percentage
	 * progressBarWidget - TAU progress instance
	 * resultText - Text value for the progress percentage
	 * pageBeforeShowHandler - pagebeforeshow event handler
	 * pageHideHandler - pagehide event handler
	 */
	var page = document.getElementById("progresscircle-demo"),
		progressBar = document.getElementById("circle"),
		minusBtn = document.getElementById("minus"),
		plusBtn = document.getElementById("plus"),
		resultDiv = document.getElementById("result"),
		progressBarWidget,
		resultText,
		pageBeforeShowHandler,
		pageHideHandler,
		i;

	/**
	 * Updates the percentage of the progress
	 */
	function printResult() {
		resultText = progressBarWidget.value();
		resultDiv.innerHTML = resultText + "%";
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
	 * Removes event listeners
	 */
	function unbindEvents() {
		page.removeEventListener("pageshow", pageBeforeShowHandler);
		page.removeEventListener("pagehide", pageHideHandler);
		minusBtn.removeEventListener("click", minusBtnClickHandler);
		plusBtn.removeEventListener("click", plusBtnClickHandler);
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageBeforeShowHandler = function () {
		progressBarWidget = new tau.widget.Progress(progressBar);
		minusBtn.addEventListener("click", minusBtnClickHandler);
		plusBtn.addEventListener("click", plusBtnClickHandler);
		i = parseInt(progressBarWidget.value(), 10);
		resultDiv.innerHTML = i + "%";
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		unbindEvents();
		clearVariables();
	};

	page.addEventListener("pagebeforeshow", pageBeforeShowHandler);
	page.addEventListener("pagehide", pageHideHandler);
}());