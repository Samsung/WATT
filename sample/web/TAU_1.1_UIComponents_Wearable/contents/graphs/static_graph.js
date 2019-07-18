/*global tau*/
(function () {
	var page = document.getElementById("static-graph-page"),
		garphEl = document.getElementById("graph"),
		graphWidget;

	page.addEventListener("pagebeforeshow", function () {
		graphWidget = tau.widget.Graph(garphEl);
	});

	page.addEventListener("pagebeforehide", function () {
		graphWidget.destroy();
	});
})();