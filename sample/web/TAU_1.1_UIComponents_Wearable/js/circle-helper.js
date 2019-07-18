/*global tau */
/*jslint unparam: true */
document.addEventListener("tauinit", function () {

	// This logic works only on circular device.
	if (tau.support.shape.circle) {
		/**
		 * pagebeforeshow event handler
		 * Do preparatory works and adds event listeners
		 */
		document.addEventListener("pagebeforeshow", function (event) {
			/**
			 * page - Active page element
			 * list - NodeList object for lists in the page
			 */
			var page = event.target,
				pageId = page.id,
				list;

			if (!page.classList.contains("page-snaplistview") &&
				pageId !== "page-snaplistview" &&
				pageId !== "page-swipelist" &&
				pageId !== "page-marquee-list" &&
				pageId !== "page-multiline-list") {
				list = page.querySelector(".ui-listview");
				if (list) {
					tau.widget.Listview(list);
				}
			}
		});
	}
});
