/*global tau */
(function () {

	var page = document.getElementById("bouncingsectionchangerPage"),
		changer = document.getElementById("bouncingsectionchanger"),
		sectionChanger;

	page.addEventListener("pagebeforeshow", function () {
		// make SectionChanger object
		sectionChanger = tau.widget.SectionChanger(changer, {
			circular: false,
			orientation: "horizontal",
			scrollbar: "bar",
			useBouncingEffect: true
		});
	});

	page.addEventListener("pagehide", function () {
		// release object
		sectionChanger.destroy();
	});
}());
