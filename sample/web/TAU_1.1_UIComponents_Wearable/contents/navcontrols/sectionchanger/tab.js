/*global tau */
(function () {

	var page = document.getElementById("tabsectionchangerPage"),
		changer = document.getElementById("tabsectionchanger"),
		sectionChanger;

	page.addEventListener("pagebeforeshow", function () {
		// make SectionChanger object
		sectionChanger = tau.widget.SectionChanger(changer, {
			circular: true,
			orientation: "horizontal",
			scrollbar: "tab"
		});
	});

	page.addEventListener("pagehide", function () {
		// release object
		sectionChanger.destroy();
	});
}());
