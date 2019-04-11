function onShow(event) {
  var target = event.target,
      pageIndicators = target.querySelectorAll('.ui-page-indicator'),
      listViews = target.querySelectorAll('.ui-listview'),
      selectors = target.querySelectorAll('.ui-selector'),
      sliders = target.querySelectorAll('input[type=range], .ui-slider'),
      toggleSwitches = target.querySelectorAll('input[data-appearance]'),
      dimmers = target.querySelectorAll('.ui-dimmer');

  pageIndicators.forEach(function(pageIndicatorEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(pageIndicatorEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.PageIndicator(pageIndicatorEl);
    }
  });

  listViews.forEach(function(listViewEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(listViewEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.Listview(listViewEl);
    }
  });

  selectors.forEach(function(selectorEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(selectorEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.Selector(selectorEl);
    }
  });

  sliders.forEach(function(sliderEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(sliderEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.Slider(sliderEl);
    }
  });

  toggleSwitches.forEach(function(toggleSwitchEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(toggleSwitchEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.ToggleSwitch(toggleSwitchEl);
    }
  });

  dimmers.forEach(function(dimmerEl) {
    var closestPopup = tau.util.selectors.getClosestBySelector(dimmerEl, '.ui-popup');
    if (closestPopup && event.type === 'popupshow' || !closestPopup) {
      tau.widget.Dimmer(dimmerEl);
    }
  });
}

document.addEventListener('pageshow', onShow, true);
document.addEventListener('popupshow', onShow, true);