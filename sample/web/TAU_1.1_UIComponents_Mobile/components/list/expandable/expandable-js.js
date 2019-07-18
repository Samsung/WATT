/* global tau */

(function () {
	/* data for list */
	var listData = [
		{
			title: "title 1",
			items: ["one", "two", "three"]
		},
		{
			title: "title 2",
			items: ["one", "two", "three"]
		},
		{
			title: "title 3",
			items: ["one", "two", "three"]
		},
		{
			title: "title 4",
			items: ["one", "two", "three"]
		},
		{
			title: "title 4",
			items: ["one", "two", "three"]
		}
		],
		counter = 0,
		// list element
		listElement = document.getElementById("expandable-list"),
		// buttons elements
		addButton = document.getElementById("add-btn-expand"),
		deleteButton = document.getElementById("delete-btn-expand"),
		addSmallButton = document.getElementById("add-btn-small-expand"),
		deleteSmallButton = document.getElementById("delete-btn-small-expand"),
		// page widget
		pageWidget = tau.widget.Page(document.getElementById("expandable-page-js")),
		// list widget
		listviewWidget = tau.widget.Listview(listElement);

	function fillcreateLi(html) {
		var fragment = document.createElement("ul");

		fragment.innerHTML = html;
		return fragment.firstElementChild;
	}

	/**
	 * Prepare HTML structure for one item element and add to main list
	 * @param {number} index
	 */
	function prepareLi(index) {
		var expandableElement,
			item = listData[index],
			html = "<li class=\"ui-expandable\">" +
			"<h2>" + item.title + "</h2>" +
			"<ul class=\"ui-listview\">";

		item.items.forEach(function (item) {
			html += "<li class=\"ui-li-static\">" + item + "</li>";
		});
		html += "</ul>" +
		"</li>";
		expandableElement = fillcreateLi(html);
		listElement.appendChild(expandableElement);
		tau.widget.Expandable(expandableElement);
	}


	/**
	 * Remove li element
	 * @param {number} index
	 */
	function removeLi(index) {
		var expandableElement = listElement.children[index];

		listElement.removeChild(expandableElement);
	}

	/**
	 * Callback for button add click
	 */
	function addItem() {
		// -1 because in listview one element is canvas for colored list
		var nextIndex = listElement.children.length - 1;

		if (nextIndex >= 0 && nextIndex < listData.length - 1) {
			prepareLi(nextIndex);
			listviewWidget.refresh();
		}
	}

	/**
	 * Callback for button delete click
	 */
	function deleteItem() {
		var nextIndex = listElement.children.length - 1;

		if (nextIndex > 0) {
			removeLi(nextIndex);
			listviewWidget.refresh();
		}
	}

	/**
	 * Callback for button add click
	 */
	function addSmallItem() {
		var lastExpandableElement = listElement.lastElementChild,
			lastExpandableListviewElement = lastExpandableElement.querySelector(".ui-listview"),
			li = fillcreateLi("<li class=\"ui-li-static\">from JS " + (counter++) + "</li>");

		lastExpandableListviewElement.appendChild(li);
		listviewWidget.refresh();
	}

	/**
	 * Callback for button delete click
	 */
	function deleteSmallItem() {
		var lastExpandableElement = listElement.lastElementChild,
			lastExpandableListviewElement = lastExpandableElement.querySelector(".ui-listview");

		lastExpandableListviewElement.removeChild(lastExpandableListviewElement.lastElementChild);
		listviewWidget.refresh();
	}
	/**
	 * Callback for page before show
	 */
	function pageBeforeShow() {
		tau.event.on(addButton, "click", addItem);
		tau.event.on(deleteButton, "click", deleteItem);
		tau.event.on(addSmallButton, "click", addSmallItem);
		tau.event.on(deleteSmallButton, "click", deleteSmallItem);
		prepareLi(0);
		prepareLi(1);
		listviewWidget.refresh();
	}

	/**
	 * Callback for page hide
	 */
	function pageHide() {
		tau.event.off(addButton, "click", addItem);
		tau.event.off(deleteButton, "click", deleteItem);
		tau.event.off(addSmallButton, "click", addSmallItem);
		tau.event.off(deleteSmallButton, "click", deleteSmallItem);
	}


	pageWidget.on("pagebeforeshow", pageBeforeShow);
	pageWidget.on("pagehide", pageHide);
}());