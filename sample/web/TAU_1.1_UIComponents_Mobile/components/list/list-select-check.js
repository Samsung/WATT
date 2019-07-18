(function (tau) {
	"use strict";
	// get the page
	var page = document.getElementById("select-all-page");

	// handle 'change' event
	function handleChange(e) {
		var checkbox = e.target,
			checked = e.target.checked,
			currentLi = tau.util.selectors.getClosestByTag(checkbox, "li"), // get parent li element
			next = null,
			previous = null,
			allSelected = checked,
			groupIndexCheckbox = null,
			childCheckbox = null;

		// check if 'change' event originated in a ui-group-index element
		if (currentLi && currentLi.classList.contains("ui-group-index")) {
			next = currentLi.nextElementSibling; // set next sibling as next element
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
		} else if (currentLi) {
			// this branch has reverse flow when all checkbox below group index are selected
			// Find previous list element and check
			previous = currentLi.previousElementSibling;
			while (previous && !previous.classList.contains("ui-group-index")) {
				if (allSelected) {
					// find the input element in li element
					childCheckbox = previous.querySelector("input[type=checkbox]");
					allSelected = childCheckbox.checked;
				}
				// go to previous element
				previous = previous.previousElementSibling;
			}
			if (previous.classList.contains("ui-group-index")) {
				// store group index chekcbox to variable
				groupIndexCheckbox = previous.querySelector("input[type=checkbox]");
			}
			// now check elements below selected checkbox
			if (allSelected && groupIndexCheckbox) {
				next = currentLi.nextElementSibling;
				while (next && !next.classList.contains("ui-group-index")) {
					// find the input element in li element
					if (allSelected) {
						childCheckbox = next.querySelector("input[type=checkbox]");
						allSelected = childCheckbox.checked;
					}
					next = next.nextElementSibling;
				}
			}
			// if all checkbox have the same state then update group index
			if (groupIndexCheckbox) {
				// change checked status according to originating group index input
				// element checked flag
				groupIndexCheckbox.checked = allSelected;
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

