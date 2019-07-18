/*global tau */
(function () {

	var page = document.getElementById("addSectionchangerPage"),
		changer = document.getElementById("addSectionchanger"),
		sectionWrap = document.getElementById("addSectionWrap"),
		addBtn = document.getElementById("addBtn"),
		removeBtn = document.getElementById("removeBtn"),
		sectionChanger,
		idx = 1;

	function addSection() {
		var section = document.createElement("DIV");

		section.innerHTML = "<section style='text-align:center'><h3> Section" + (idx++) + " ADDED </h3></section>";

		sectionWrap.appendChild(section.firstChild);
		sectionChanger.refresh();
		sectionChanger.setActiveSection(sectionWrap.children.length - 1);
	}

	function removeSection() {
		var curSection = sectionChanger.getActiveSectionIndex();

		if (sectionWrap.children.length > 1) {
			sectionWrap.removeChild(sectionWrap.children[curSection]);
		}
		sectionChanger.refresh();
	}

	page.addEventListener("pagebeforeshow", function () {
		// make SectionChanger object
		sectionChanger = new tau.SectionChanger(changer, {
			circular: false,
			orientation: "horizontal"
		});

		addBtn.addEventListener("click", addSection);
		removeBtn.addEventListener("click", removeSection);
	});

	page.addEventListener("pagehide", function () {
		// release object
		sectionChanger.destroy();

		addBtn.removeEventListener("click", addSection);
		removeBtn.removeEventListener("click", removeSection);
	});
}());
