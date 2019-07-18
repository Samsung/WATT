/*global pageId, listId, templateId, itemClass, tau, JSON_DATA */
(function (pageId, listId, templateId, itemClass) {
	var page = document.getElementById(pageId),
		vList;

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pageshow", function () {
		/* Get HTML element reference */
		var elList = document.getElementById(listId);

		vList = tau.widget.VirtualListview(elList, {
			dataLength: JSON_DATA.length,
			bufferSize: 40
		});
		/* Update list items */
		vList.setListItemUpdater(function (listElement, newIndex) {
			var data = JSON_DATA[newIndex],
				template = document.getElementById(templateId).innerHTML;

			/*jslint unparam: true*/
			template = template.replace(/\$\{([\w]+)\}/ig, function (pattern, field) {
				return data[field];
			});
			/*jslint unparam: false*/

			listElement.innerHTML = template;
			if (itemClass.length) {
				itemClass.forEach(function (value) {
					listElement.classList.add(value);
				});
			} else {
				listElement.classList.add(itemClass);
			}
		});

		// Draw child elements
		vList.draw();
	});

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	tau.event.one(page, "pagehide", function () {
		// Remove all children in the vList
		vList.destroy();
	});
}(pageId, listId, templateId, itemClass));