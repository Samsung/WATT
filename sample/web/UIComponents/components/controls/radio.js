(function () {
	/**
	 * page - Radio page element
	 * radios - NodeList object for radios
	 * radioresult - Indicator for active radio
	 */
	var page = document.getElementById("radio-demo"),
		radios = document.querySelectorAll("input[name='radio-choice']"),
		radioresult = document.querySelector((".radio-result")),
		idx;

	/**
	 * Updates text for an selected radio
	 * @param {Event} e
	 */
	function onChangeHandler(e) {
		var target = e.target;

		if (target.checked) {
			radioresult.innerHTML = "The Active Radio is " + target.id;
		}
	}

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pageshow", function () {
		for (idx = 0; idx < radios.length; idx++) {
			radios[idx].addEventListener("change", onChangeHandler);
		}
	});
}());
