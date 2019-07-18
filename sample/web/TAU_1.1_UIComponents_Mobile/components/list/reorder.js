/* global tau */
(function () {
	var dragButton = document.getElementById("drag"),
		listElement = document.getElementById("drag-list"),
		listviewWidget = null,
		pageWidget = tau.widget.Page(document.getElementById("list-drag-page"));

	function dragElements() {
		listviewWidget.toggleDragMode();
	}

	// Callback for page before show
	function pageBeforeShow() {
		listviewWidget = tau.widget.Listview(listElement),
		tau.event.on(dragButton, "click", dragElements);
		listviewWidget.refresh();
	}

	//Callback for page hide
	function pageHide() {
		tau.event.off(dragButton, "click", dragElements);
	}

	pageWidget.on("pagebeforeshow", pageBeforeShow);
	pageWidget.on("pagehide", pageHide);
}());
