(function (tau) {
	"use strict";
	// get the page
	var page = document.getElementById("select-all-page");

	// handle 'change' event
	function handleChange(e) {
		var checkbox = e.target,
			checked = e.target.checked,
			parent = tau.util.selectors.getClosestByTag(checkbox, "li"), // get parent li element
			next = null,
			childCheckbox = null;

		// check if 'change' event originated in a ui-group-index element
		if (parent && parent.classList.contains("ui-group-index")) {
			next = parent.nextElementSibling; // set next sibling as next element
			// iterate over next li elements and stop when a second group index
			// element is found
			while (next && next.classList.contains("ui-group-index") === false) {
				// find the input element in li element
				childCheckbox = next.querySelector("input[type=checkbox]");
				if (childCheckbox) {
					// change checked status according to originating group index input
					// element checked flag
					childCheckbox.checked = checked;
				}
				// mark next element for iteration
				next = next.nextElementSibling;
			}
		}
	}

	// initialize the script
	function init(event) {
		// watch for 'change' events only in current page
		tau.event.on(event.target, "change", handleChange);
	}

	if (page) {
		// run init only once
		tau.event.one(page, "pageshow", init);
	}
}(window.tau));

