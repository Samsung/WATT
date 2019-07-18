/*global tau*/
(function () {
	var page = document.getElementById("bar-graph-page"),
		graphEl = document.getElementById("graph"),
		graphWidget,
		data,
		i,
		numberOfBars = 7,
		x,
		y,
		label;

	page.addEventListener("pagebeforeshow", function () {
		graphWidget = tau.widget.Graph(graphEl);
		data = [];

		label = "Series 1";
		for (i = 0; i < numberOfBars; i++) {
			x = i + 1;
			y = Math.round(Math.random() * 20);
			data.push({x: x, y: y, label: label});
		}

		label = "Series 2";
		for (i = 0; i < numberOfBars; i++) {
			x = i + 1;
			y = Math.round(Math.random() * 20);
			data.push({x: x, y: y, label: label});
		}

		graphWidget.value(data);
	});
})();