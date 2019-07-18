/*global tau */
/*jslint unparam: true */
(function (window) {
	var page = document.getElementById("selectModePage"),
		listview = document.querySelector("#selectModePage .ui-selectmode-list"),
		list = page.querySelectorAll(".ui-selectmode-item"),
		listLength = list.length,
		selectWrapper = document.querySelector(".select-mode"),
		selectBtn = document.getElementById("select-btn"),
		selectBtnText = document.getElementById("select-btn-text"),
		selectAll = document.getElementById("select-all"),
		deselectAll = document.getElementById("deselect-all"),
		elPopup = page.querySelector("#moreoptionsPopupCircle"),
		handler = page.querySelector(".ui-more"),
		selector = page.querySelector("#selector"),
		liPopupSelect = document.querySelector("#select-all").parentElement,
		liPopupDeselect = document.querySelector("#deselect-all").parentElement,
		selectorComponent,
		snapList,
		selectCount = 0,
		popupHandler,
		addFunction,
		fnSelectAll,
		fnDeselectAll,
		fnPopup,
		fnPopupClose;

	/**
	 * Updates the number of the selected list items
	 */
	function textRefresh() {
		selectBtnText.innerHTML = selectCount;
		selectBtn.classList.toggle("select-btn-disabled", selectCount === 0);
	}

	/**
	 * Shows select mode
	 */
	function modeShow() {
		selectWrapper.classList.remove("open");
		handler.style.display = "block";
		selectWrapper.classList.add("show-btn");
		textRefresh();
	}

	/**
	 * Hides select mode
	 */
	function modeHide() {
		selectWrapper.classList.remove("open");
		handler.style.display = "none";
		selectWrapper.classList.remove("show-btn");
		selectCount = 0;
	}

	popupHandler = function () {
		tau.openPopup(elPopup);
	};

	/**
	 * Select particular item
	 * @param {HTMLLIElement} li element to select
	 */
	function selectItem(li) {
		var selected = document.createElement("span");

		selected.classList.add("tag-selected");
		li.classList.add("select");
		li.appendChild(selected);
		selectCount++;
		modeShow();
	}

	/**
	 * Deselect particular item
	 * @param {HTMLLIElement} li element to deselect
	 */
	function deselectItem(li) {
		li.classList.remove("select");
		if (li.querySelector(".tag-selected")) {
			li.removeChild(li.querySelector(".tag-selected"));
		}
		selectCount--;
		if (selectCount < 0) {
			selectCount = 0;
		}
		textRefresh();
	}

	/**
	 * Toggle select state on particular item
	 * @param {HTMLLIElement} li element to toggle
	 */
	function toggleSelectedItem(li) {
		if (!li.classList.contains("select")) {
			selectItem(li);
		} else {
			deselectItem(li);
		}
	}

	/**
	 * Select/Deselects a list item
	 * click event handler for list item
	 * @param {Event} event
	 */
	addFunction = function (event) {
		var li = tau.util.selectors.getClosestByTag(event.target, "li");

		toggleSelectedItem(li);
	};

	/**
	 * Select all list items
	 * click event handler for 'select all' button
	 */
	fnSelectAll = function () {
		var i = 0;

		for (; i < listLength; i++) {
			selectItem(list[i]);
		}
		selectCount = listLength;
		modeShow();
	};

	/**
	 * Deselect all list items
	 * click event handler for 'deselect all' button
	 */
	fnDeselectAll = function () {
		var i = 0;

		for (; i < listLength; i++) {
			deselectItem(list[i]);
		}
	};

	/**
	 * Depending on how many items are on popup select
	 * list only suitable options are displayed.
	 **/
	function handlePopupSelectOptions() {
		if (selectCount === 0) {
			displaySelectAll();
		} else if (selectCount === listLength) {
			displayDeselectAll();
		} else {
			displayBoth();
		}

	}

	/**
	 * Display only "Deselect All" option
	 **/
	function displayDeselectAll() {
		var SelectClassList = liPopupSelect.classList,
			DeselectClassList = liPopupDeselect.classList;

		SelectClassList.remove("show-popup-li");
		DeselectClassList.remove("hide-popup-li");
		selectAll.classList.remove("show");

		SelectClassList.add("hide-popup-li");
		DeselectClassList.add("show-popup-li");
		deselectAll.classList.add("show");
	}

	/**
	 * Display only "Select All" option
	 **/
	function displaySelectAll() {
		var SelectClassList = liPopupSelect.classList,
			DeselectClassList = liPopupDeselect.classList;

		SelectClassList.remove("hide-popup-li");
		DeselectClassList.remove("show-popup-li");
		deselectAll.classList.remove("show");

		DeselectClassList.add("hide-popup-li");
		SelectClassList.add("show-popup-li");
		selectAll.classList.add("show");
	}

	/**
	 * Display "Select All" and "DeselectAll" option
	 **/
	function displayBoth() {
		liPopupSelect.classList.remove("show-popup-li");
		liPopupSelect.classList.remove("hide-popup-li");
		liPopupDeselect.classList.remove("hide-popup-li");
		liPopupDeselect.classList.remove("show-popup-li");
		selectAll.classList.remove("show");
		deselectAll.classList.remove("show");
	}

	/**
	 * Shows a context popup that has select/deselect buttons
	 * click event handler for button that displays the number of selected list items
	 */
	fnPopup = function () {
		selectWrapper.classList.add("open");
		handlePopupSelectOptions();
		event.preventDefault();
		event.stopPropagation();
	};

	/**
	 * Closes a context popup that has select/deselect buttons
	 * click event handler for closing the popup
	 */

	fnPopupClose = function () {
		selectWrapper.classList.remove("open");
	};

	/**
	 * pageshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pageshow", function () {

		if (tau.support.shape.circle) {
			document.querySelector("#selectModePage .ui-arc-listview-carousel").addEventListener("click",
				addFunction,
				false);
		} else {
			listview.addEventListener("click", addFunction, false);
		}
		selectAll.addEventListener("click", fnSelectAll, false);
		deselectAll.addEventListener("click", fnDeselectAll, false);
		selectBtn.addEventListener("click", fnPopup, false);
		selectWrapper.addEventListener("click", fnPopupClose, false);
		modeShow();
		textRefresh();
	}, false);

	/**
	 * pagehide event handler
	 * Destroys and removes event listeners
	 */
	page.addEventListener("pagehide", function () {
		listview.removeEventListener("click", addFunction, false);
		selectAll.removeEventListener("click", fnSelectAll, false);
		deselectAll.removeEventListener("click", fnDeselectAll, false);
		handler.removeEventListener("click", popupHandler, false);
		modeHide();
	}, false);

	/**
	 * pagebeforeshow event handler
	 * Do preparatory works and adds event listeners
	 */
	page.addEventListener("pagebeforeshow", function () {
		var radius = window.innerHeight / 2 * 0.8;

		selectorComponent = tau.widget.Selector(selector, {itemRadius: radius});
		selectorComponent.disable();
		handler.addEventListener("click", popupHandler, false);
		listview.addEventListener("click", addFunction, false);
	});

	/*
	 * If you want to use Selector with Snaplistview, you should control to Selector enable status
	 * because 'rotarydetent' event has been used in both Selector and Snaplistview.
	 */
	elPopup.addEventListener("popupshow", function () {
		snapList = tau.widget.SnapListview(listview);
		selectorComponent.enable();
		snapList.disable();
	});

	elPopup.addEventListener("popuphide", function () {
		selectorComponent.disable();
		snapList.enable();
	});
	/*
	 * When user click the indicator of Selector, popup will close.
	 */
	selector.addEventListener("click", function (event) {
		var target = event.target;

		// 'ui-selector-indicator' is default indicator class name of Selector component
		if (target.classList.contains("ui-selector-indicator")) {
			tau.closePopup(elPopup);
		}
	});
}(window));
