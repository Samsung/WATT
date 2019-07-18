(function (tau) {
	/**
	 * page - Gallery page element
	 * addBtn - Add button element
	 * deleteBtn - Delete button element
	 * sectionChangerElement - Section changer element
	 * sectionChangerWidget - TAU section changer instance
	 * deleteBtnWidget - TAU button instance for delete button
	 * pageShowHandler - pageshow event handler
	 * pageHideHandler - pagehide event handler
	 * sections - NodeList object for all sections in the section changer element
	 * sectionsLength - The number of sections
	 */
	var page = document.getElementById("gallery-page"),
		addBtn = document.getElementById("add"),
		deleteBtn = document.getElementById("delete"),
		sectionChangerElement = document.getElementById("gallerySection"),
		sectionChangerWidget,
		deleteBtnWidget,
		pageShowHandler,
		pageHideHandler,
		sections,
		sectionsLength,
		sectionsParentNode,
		indexAddImage = 0;

	/**
	 * Stores information of the sections
	 */
	function resetChildSectionInfo() {
		sections = sectionChangerElement.querySelectorAll(".gallery-section");
		sectionsLength = sections.length;
	}

	/**
	 * Adds an image to gallery
	 * click event handler for add button
	 */
	function addImage() {
		var newSectionElement = document.createElement("section");

		newSectionElement.className = "gallery-section";
		newSectionElement.innerHTML = "<img src='images/add" + indexAddImage + ".jpg'>";

		sectionsParentNode.appendChild(newSectionElement);
		sectionChangerWidget.refresh();
		sectionChangerWidget.setActiveSection(sections.length);

		resetChildSectionInfo();
		deleteBtnWidget.enable();

		indexAddImage = (indexAddImage + 1) % 4;
	}

	/**
	 * Removes an image to gallery
	 * click event handler for delete button
	 */
	function deleteImage() {
		var activeIndex = sectionChangerWidget.getActiveSectionIndex();

		sectionsParentNode.removeChild(sections[activeIndex]);

		resetChildSectionInfo();
		if (sectionsLength > 0) {
			sectionChangerWidget.setActiveSection((activeIndex - 1) >= 0 ? activeIndex - 1 : 0);
		}
		sectionChangerWidget.refresh();

		if (sectionsLength === 1) {
			deleteBtnWidget.disable();
		}
	}

	/**
	 * Removes event listeners
	 */
	function unbindEvents() {
		page.removeEventListener("pageshow", pageShowHandler);
		page.removeEventListener("pagehide", pageHideHandler);
		addBtn.removeEventListener("vclick", addImage);
		deleteBtn.removeEventListener("vclick", deleteImage);
	}

	/**
	 * Attaches event listeners
	 */
	function bindEvents() {
		addBtn.addEventListener("vclick", addImage);
		deleteBtn.addEventListener("vclick", deleteImage);
	}

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	pageShowHandler = function () {
		bindEvents();
		sectionChangerWidget = tau.widget.SectionChanger(sectionChangerElement);
		deleteBtnWidget = tau.widget.Button(deleteBtn);
		resetChildSectionInfo();
		sectionsParentNode = sections[0].parentNode;
	};

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	pageHideHandler = function () {
		unbindEvents();
		sectionChangerWidget.destroy();
		deleteBtnWidget.destroy();
	};
	page.addEventListener("pageshow", pageShowHandler, false);
	page.addEventListener("pagehide", pageHideHandler, false);
}(window.tau));
