/* global tau */
(function () {
	/**
	 * page - Index scroll bar page element
	 * isbElement - Index scroll bar element
	 * dividers - NodeList object for group index elements
	 * isb - TAU index scroll bar instance
	 * scroller - Scrollable element
	 */
	var page = document.getElementById("indexscrollbarPage"),
		isbElement = document.getElementById("indexscrollbar"),
		dividers = page.getElementsByClassName("ui-group-index"),
		isb,
		scroller,
		dividerIndexObject = {},
		selectBound;

	/**
	 * Moves the scroll to selected index
	 * @param {Event} event
	 */
	function onSelect(event) {
		var divider = dividerIndexObject[event.detail.index];

		if (divider && scroller) {
			scroller.scrollTop = divider.offsetTop;
		}
	}

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		var i,
			len,
			idx;

		scroller = tau.util.selectors.getScrollableParent(document.getElementById("isbList"));
		len = dividers.length;
		for (i = 0; i < len; i++) {
			idx = dividers[i].textContent;
			dividerIndexObject[idx] = dividers[i];
		}
		isb = new tau.widget.IndexScrollbar(isbElement);
		selectBound = onSelect.bind();
		isb.addEventListener("select", selectBound);
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		isb.removeEventListener("select", selectBound);
		isb.destroy();
	});
}());
