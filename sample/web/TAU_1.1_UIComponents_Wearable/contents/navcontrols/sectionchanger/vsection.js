/*global tau */
(function () {

	var page = document.getElementById("vsectionchangerPage"),
		changer = document.getElementById("vsectionchanger"),
		sectionChanger;

	page.addEventListener("pagebeforeshow", function () {
		// make SectionChanger object
		sectionChanger = tau.widget.SectionChanger(changer, {
			circular: false,
			orientation: "vertical"
		});
	});

	page.addEventListener("pagehide", function () {
		// release object
		sectionChanger.destroy();
	});
}());
