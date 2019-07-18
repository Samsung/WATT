/*global tau */
(function () {

	var page = document.getElementById("nestedsectionchangerPage"),
		vChanger = document.getElementById("vsectionchanger"),
		hChanger = document.getElementById("hsectionchanger"),
		hsectionChanger,
		vsectionChanger;

	page.addEventListener("pagebeforeshow", function () {
		// make SectionChanger object
		hsectionChanger = tau.widget.SectionChanger(hChanger, {
			circular: false,
			orientation: "horizontal",
			useBouncingEffect: true,
			items: "section.h"
		});
		// make SectionChanger object
		vsectionChanger = tau.widget.SectionChanger(vChanger, {
			circular: false,
			orientation: "vertical",
			useBouncingEffect: true
		});
	});

	page.addEventListener("pagehide", function () {
		// release object
		hsectionChanger.destroy();
		vsectionChanger.destroy();
	});

}());
