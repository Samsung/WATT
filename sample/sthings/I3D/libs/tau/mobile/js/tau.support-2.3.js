(function(window, document, undefined) {
'use strict';
var ns = window.tau = window.tau || {},
nsConfig = window.tauConfig = window.tauConfig || {};
nsConfig.rootNamespace = 'tau';
nsConfig.fileName = 'tau';
ns.version = '0.13.47';
/*global window, ns, define */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Touch events
 * Reimplementation of jQuery Mobile virtual mouse events.
 * @class ns.event.touch
 */
(function (window, document, ns) {
	"use strict";
				var touch = ns.event.touch || {},
				events = ns.event,
				TAP = {
					TAB_HOLD_THRESHOLD: 750
				},
				EVENT_TYPE = {
					TAP: "tap",
					TAP_HOLD: "taphold"
				};

			events.on(document, "mousedown touchstart mouseup touchend click", touch, true);

			touch.handleEvent = function (event) {
				var self = this;

				switch (event.type) {
					case "mousedown":
					case "touschstart":
						self._onMousedown(event);
						break;
					case "click":
						self._onClick(event);
						break;
					case "mouseup":
					case "touchend":
						self._onMouseup(event);
						break;
				}
			};

			touch._onMousedown = function (event) {
				var self = this,
					target = event.target;

				self._target = target;
				self._timeId = setTimeout(function () {
					events.trigger(target, EVENT_TYPE.TAP_HOLD);
				}, TAP.TAB_HOLD_THRESHOLD);
			};

			touch._onClick = function (event) {
				var self = this,
					target = event.target;

				clearTimeout(self._timeId);
				if (self._target === target) {
					events.trigger(target, EVENT_TYPE.TAP);
				}
			};

			touch._onMouseup = function () {
				clearTimeout(this._timeId);
			};
			}(window, window.document, ns));
/*global window, define, ns */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Router Support
 * Legacy router API support
 *
 * @class ns.router.Router
 * @author Hyeoncheol Choi <hc7.choi@samsung.com>
 */
(function (window, document, ns) {
	"use strict";
				var router = ns.router.Router.getInstance();

			function defineActivePage(router) {
				Object.defineProperty(router, "activePage", {
					get: function () {
						return router.container.activePage;
					}
				});
			}

			if (router) {
				defineActivePage(router);
			} else {
				document.addEventListener("routerinit", function (event) {
					var router = event.detail;

					defineActivePage(router);
				});
			}

			}(window, window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
(function (document, ns) {
	"use strict";
				var BaseWidget = ns.widget.BaseWidget,
				engine = ns.engine,
				Checkboxradio = function () {
					var self = this;

					self._inputtype = null;
				},
				classes = {
					UI_PREFIX: "ui-"
				},
				prototype = new BaseWidget();

			Checkboxradio.prototype = prototype;

			/**
			 * Build Checkboxradio widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Checkboxradio
			 * @instance
			 */
			prototype._build = function (element) {
				var inputtype = element.getAttribute("type"),
					elementClassList = element.classList;

				if (inputtype !== "checkbox" && inputtype !== "radio") {
					//_build should always return element
					return element;
				}

				elementClassList.add(classes.UI_PREFIX + inputtype);

				return element;
			};

			/**
			 * Returns the value of checkbox or radio
			 * @method _getValue
			 * @member ns.widget.mobile.Checkboxradio
			 * @return {?string}
			 * @protected
			 * @instance
			 */
			prototype._getValue = function () {
				return this.element.value;
			};

			/**
			 * Set value to the checkbox or radio
			 * @method _setValue
			 * @param {string} value
			 * @member ns.widget.mobile.Checkboxradio
			 * @return {ns.widget.mobile.Checkboxradio}
			 * @instance
			 * @protected
			 */
			prototype._setValue = function (value) {
				this.element.value = value;
			};

			// definition
			ns.widget.mobile.Checkboxradio = Checkboxradio;
			engine.defineWidget(
				"Checkboxradio",
				"input[type='checkbox']:not(.ui-slider-switch-input):not([data-role='toggleswitch']):not(.ui-toggleswitch), " +
				"input[type='radio'], " +
				"input.ui-checkbox, " +
				"input.ui-radio",
				[],
				Checkboxradio,
				""
			);
			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true */

(function (document, ns) {
	"use strict";
				var ToggleSwitchExtra = function () {
					var self = this;
					/**
					 * All possible widget options
					 * @property {Object} options
					 * @property {boolean} [options.disabled=false] start
					 * widget as enabled / disabled
					 * @property {?boolean} [options.mini=false] size
					 * of toggle switch
					 * @property {boolean} [options.highlight=true] if set
					 * then toggle switch can be highligted
					 * @property {?boolean} [options.inline=false] if value is
					 * "true" then toggle switch has css property
					 * display = "inline"
					 * @member ns.widget.mobile.ToggleSwitchExtra                 *
					 */

					self.options = {
						disabled: false,
						mini: null,
						highlight: true,
						inline: null
					};
					self._ui = {};
				},
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				engine = ns.engine,
				events = ns.event,
				Button = ns.widget.core.Button,
				/**
				 * @property {Object} selectors Alias for class ns.util.selectors
				 * @member ns.widget.mobile.ToggleSwitchExtra
				 * @private
				 * @static
				 */
				selectors = ns.util.selectors,
				DOMutils = ns.util.DOM,

				classes = {
					//slider
					sliderSwitch: "ui-slider-switch",
					toggleInneroffset: "ui-slider-inneroffset",
					sliderInline: "ui-slider-inline",
					sliderMini: "ui-slider-mini",
					sliderHandle: "ui-slider-handle",
					flipHandle: "ui-flip-handle",
					slider: "ui-slider",
					sliderLabel: "ui-slider-label",
					sliderLabelTheme: "ui-slider-label-",
					sliderInneroffset: "ui-slider-inneroffset",
					sliderLabelA: "ui-slider-label-a",
					sliderSnapping: "ui-slider-handle-snapping",
					//sliderBg: "ui-slider-bg",
					sliderContainer: "ui-slider-container",
					sliderStateActive: "ui-state-active"
				},
				keyCode = {
					HOME: 36,
					END: 35,
					PAGE_UP: 33,
					PAGE_DOWN: 34,
					UP: 38,
					RIGHT: 39,
					DOWN: 40,
					LEFT: 37
				};

			ToggleSwitchExtra.prototype = new BaseWidget();

			/**
			 * Dictionary for ToggleSwitchExtra related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 * @static
			 * @readonly
			 */
			ToggleSwitchExtra.classes = classes;

			/**
			 * Dictionary for keyboard codes
			 * @property {Object} keyCode
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 * @static
			 * @readonly
			 */
			ToggleSwitchExtra.keyCode = keyCode;


			//for select
			/**
			 * Returns default position of the slider, if the element is input
			 * @method getInitialValue
			 * @param {string} tag
			 * @param {HTMLElement} element
			 * @return {number}
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function getInitialValue(tag, element) {
				return element.selectedIndex;
			}

			/**
			 * Sets the width for labels which represents a value of widget
			 * @method refreshLabels
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {number} percent
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function refreshLabels(self, percent) {
				var getElementWidth = DOMutils.getElementWidth,
					handlePercent = getElementWidth(self._ui.handle, "outer") /
						getElementWidth(self._ui.slider, "outer") * 100,
					aPercent = percent && handlePercent + (100 - handlePercent) *
						percent / 100,
					bPercent = percent === 100 ? 0 : Math.min(handlePercent +
						100 - aPercent, 100),
					i = self._labels.length,
					label;

				while (i--) {
					label = self._labels[i];
					label.style.width =
						(label.classList.contains(classes.sliderLabelA) ?
							aPercent : bPercent) + "%";
				}
			}


			/**
			 * Simplify creating dom elements
			 * (method stricly for ToggleSwitchExtra based oninput tag)
			 * @method createElement
			 * @param {string} name
			 * @return {HTMLElement}
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function createElement(name) {
				return document.createElement(name);
			}

			/**
			 * Function fires on mouse move event
			 * @method onVmouseMove
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onVmouseMove(self, event) {
				var element = self.element,
					tagName = element.nodeName.toLowerCase(),
					handle = self._ui.handle;
				// NOTE: we don't do this in refresh because we still want to
				//	support programmatic alteration of disabled inputs

				if (self._dragging && !self.options.disabled) {

					// self.mouseMoved must be updated before refresh()
					// because it will be used in the control "change" event
					self._mouseMoved = true;

					if (tagName === "select") {
						// make the handle move in sync with the mouse
						handle.classList.remove(classes.sliderSnapping);
					}

					refresh(self, event);
					// only after refresh() you can calculate self.userModified
					self._userModified = self._beforeStart !==
						element.selectedIndex;
					events.preventDefault(event);
				}
			}

			/**
			 * Function fires on mouse move event
			 * @method sliderMouseUp
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function sliderMouseUp(self) {
				var _beforeStart;

				if (self._dragging) {
					self._dragging = false;
					_beforeStart = self._beforeStart;

					if (self.element.nodeName.toLowerCase() === "select") {
						// make the handle move with a smooth transition
						self._ui.handle.classList.add(classes.sliderSnapping);

						if (self._mouseMoved) {
							// this is a drag, change the value only
							// if user dragged enough
							if (self._userModified) {
								refresh(self, _beforeStart === 0 ? 1 : 0);
							} else {
								refresh(self, _beforeStart);
							}
						} else {
							refresh(self, _beforeStart === 0 ? 1 : 0);
						}
					}
					self._mouseMoved = false;
				}
			}

			/**
			 * Call refresh when state change
			 * @method onFocus
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onChange(self) {
				if (!self._mouseMoved) {
					refresh(self, self._getValue(), true);
				}
			}

			/**
			 * Call refresh when blur event ocur
			 * @method onBlur
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onBlur(self) {
				refresh(self, self._getValue(), true);
			}

			/**
			 * Triggers focus event on the target element
			 * @method onVmousedown
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onVmousedown(event) {
				events.trigger(event.target, "focus");
			}

			/**
			 * Stoping event
			 * @method onVclick
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onVclick(event) {
				event.stopPropagation();
				event.preventDefault();
			}

			/**
			 * Manage interaction of widget with key down events
			 * @method onKeydown
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onKeydown(self, event) {
				var element = self.element,
					tagName = element.nodeName.toLowerCase(),
					index = getInitialValue(tagName, element),
					eventkeyCode = event.keyCode,
					classList = event.target.classList,
					step = parseFloat(self.element.getAttribute("step") ||
						1);

				if (self.options.disabled) {
					return;
				}

				// In all cases prevent the default and mark the handle
				// as active
				switch (eventkeyCode) {
					case keyCode.HOME:
					case keyCode.END:
					case keyCode.PAGE_UP:
					case keyCode.PAGE_DOWN:
					case keyCode.UP:
					case keyCode.RIGHT:
					case keyCode.DOWN:
					case keyCode.LEFT:
						event.preventDefault();
						if (!self._keySliding) {
							self._keySliding = true;
							classList.add(classes.sliderStateActive);
						}
						break;
				}
				// move the slider according to the keypress
				switch (eventkeyCode) {
					case keyCode.HOME:
					case keyCode.PAGE_UP:
					case keyCode.UP:
					case keyCode.RIGHT:
						refresh(self, index + step);
						break;
					case keyCode.END:
					case keyCode.PAGE_DOWN:
					case keyCode.DOWN:
					case keyCode.LEFT:
						refresh(self, index - step);
						break;
				}

			}

			/**
			 * Remove slider state active
			 * @method onKeyup
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onKeyupHandle(self) {
				if (self._keySliding) {
					self._keySliding = false;
					self._ui.handle.classList.remove(classes.sliderStateActive);
				}
			}

			/**
			 * Call refresh when keyUp event ocur
			 * @method onKeyup
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onKeyupElement(self) {
				refresh(self, self._getValue(), true, true);
			}

			/**
			 * Refresh widget and add css class
			 * @method onTouchend
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onTouchend(self) {
				var element = self.element,
					tagName = element.nodeName.toLowerCase();

				self._dragging = false;
				self._ui.handle.classList.add(classes.sliderSnapping);
				refresh(self, getInitialValue(tagName, element),
					true, true);
			}

			/**
			 * Callback responsible for refreshing the widget
			 * @method onVmousedown
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function onVmousedownRefresh(self, event) {
				var element = self.element;

				if (self.options.disabled) {
					return false;
				}

				self._dragging = true;
				self._userModified = false;
				self._mouseMoved = false;
				//element.nodeName.toLowerCase()
				if (element.nodeName.toLowerCase() === "select") {
					self._beforeStart = element.selectedIndex;
				}
				refresh(self, event);
				return false;
			}

			/**
			 * Adding widget object to the callbacks
			 * @method bindCallbacksForSelectTag
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function bindCallbacksForSelectTag(self) {
				self._onKeyupElement = onKeyupElement.bind(null, self);
				self._sliderMouseUp = sliderMouseUp.bind(null, self);
				self._onKeyupHandle = onKeyupHandle.bind(null, self);
				self._onVmouseMove = onVmouseMove.bind(null, self);
				self._onTouchend = onTouchend.bind(null, self);
				self._onKeydown = onKeydown.bind(null, self);
				self._onChange = onChange.bind(null, self);
				self._onBlur = onBlur.bind(null, self);
				self._onVmousedownRefresh =
					onVmousedownRefresh.bind(null, self);
			}

			/**
			 * Sets the width for labels which represents a value of widget
			 * @method addRemoveClassesBasedOnProcentage
			 * @param {number} percent
			 * @param {classList} localClasses
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function addRemoveClassesBasedOnProcentage(percent, localClasses) {
				if (percent === 100 &&
					localClasses.contains(classes.sliderSnapping)) {
					localClasses.remove(classes.toggleOff);
					localClasses.add(classes.toggleOn);
				} else if (percent === 0 &&
					localClasses.contains(classes.sliderSnapping)) {
					localClasses.remove(classes.toggleOn);
					localClasses.add(classes.toggleOff);
				}
			}

			/**
			 * Refresh all the elements of Slider widget
			 * @method refresh
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {Object|number|null} value
			 * @param {boolean} [isFromControl] tells if the refresh was called from callbacks
			 * @param {boolean} [preventInputUpdate] prevents change value for input
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function refresh(self, value, isFromControl, preventInputUpdate) {
				var data,
					percent,
					newValue,
					valModStep,
					alignValue,
					valueChanged,
					touchThreshold,
					newValueOption,
					sliderOffsetLeft,
					min = 0,
					control = self.element,
					handle = self._ui.handle,
					slider = self._ui.slider,
					localClasses = handle.classList,
					tagName = control.nodeName.toLowerCase(),
					max = control.querySelectorAll("option").length - 1,
					stepValue = DOMutils.getNumberFromAttribute(control,
						"step", "float", 0),
					step = (stepValue > 0) ?
						stepValue : 1;

				if (isNaN(step)) {
					step = 0;
				}

				if (self.options.disabled) {
					self._disable();
				}

				// If changes came from event
				if (typeof value === "object") {
					data = value;
					// @TODO take parameter out to config
					touchThreshold = 8;
					sliderOffsetLeft =
						DOMutils.getElementOffset(slider).left;

					// If refreshing while not dragging
					// or movement was within threshold
					if (!self._dragging ||
						data.pageX < sliderOffsetLeft - touchThreshold ||
						data.pageX > sliderOffsetLeft +
						slider.offsetWidth + touchThreshold) {
						return;
					}

					// Calculate new left side percent
					percent = ((data.pageX - sliderOffsetLeft) /
						slider.offsetWidth) * 100;

					// If changes came from input value change
				} else {
					if (value === null) {
						value = getInitialValue(tagName, control);
					}
					if (isNaN(value)) {
						return;
					}
					// While dragging prevent jumping by assigning
					// last percentage value
					if (self._dragging && self._lastPercent) {
						percent = self._lastPercent;
					} else {
						percent = (parseFloat(value) - min) / (max - min) * 100;
					}
				}

				// Make sure percent is a value between 0 - 100;
				percent = Math.max(0, Math.min(percent, 100));
				self._lastPercent = percent;

				newValue = (percent / 100) * (max - min) + min;

				//from jQuery UI slider, the following source will round
				// to the nearest step
				valModStep = (newValue - min) % step;
				alignValue = newValue - valModStep;

				if (Math.abs(valModStep) * 2 >= step) {
					alignValue += (valModStep > 0) ? step : (-step);
				}
				// Since JavaScript has problems with large floats, round
				// the final value to 5 digits after the decimal point
				// (see jQueryUI: #4124)
				newValue = parseFloat(alignValue.toFixed(5));

				newValue = Math.max(min, Math.min(newValue, max));

				handle.style.left = percent + "%";
				newValueOption = control.querySelectorAll("option")[newValue];
				handle.setAttribute("aria-valuenow",
					newValueOption && newValueOption.value);
				handle.setAttribute("aria-valuetext",
					newValueOption.innerText);
				handle.setAttribute("title", newValueOption.innerText);

				addRemoveClassesBasedOnProcentage(percent, localClasses);

				// drag the label widths
				if (self._labels) {
					refreshLabels(self, percent);
				}

				if (!preventInputUpdate) {
					valueChanged = false;
					// update control"s value

					valueChanged = control.selectedIndex !== newValue;
					control.selectedIndex = newValue;

					if (!isFromControl && valueChanged) {
						// Trigger change event on the control element
						events.trigger(control, "change");
					}
				}
			}

			/**
			 * Refresh a slider markup.
			 *
			 * This method will rebuild while DOM structure of widget.
			 *
			 * This method should be called after are manually change in HTML
			 * attributes of widget DOM structure.
			 *
			 * This method is called automatically after change any option
			 * of widget.
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            var slider = document.getElementById("slider"),
			 *                  sliderWidget = tau.widget.Slider(slider),
			 *            sliderWidget.refresh();
			 *        </script>
			 *
			 * ####If jQuery library is loaded, its method can be used:
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            $( "#slider" ).slider( "refresh" );
			 *        </script>
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */

			/**
			 * Refresh slider
			 * @method _refresh
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._refresh = function () {
				var self = this;

				if (self._ui.slider && self.value !== self._getValue()) {
					refresh(self, self._getValue());
				}
			};


			/**
			 * Adding classes for slider
			 * @method addClassesForSlider
			 * @param {HTMLElement} domSlider
			 * @param {Object} btnClasses
			 * @param {Object} options
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function addClassesForSlider(domSlider, btnClasses, options) {
				var domSliderClassList = domSlider.classList;

				domSliderClassList.add(classes.slider);
				domSliderClassList.add(classes.sliderSwitch);
				domSliderClassList.add(btnClasses.uiBtnCornerAll);

				if (options.inline) {
					domSliderClassList.add(classes.sliderInline);
				}
				if (options.mini) {
					domSliderClassList.add(classes.sliderMini);
				}
			}

			/**
			 * Simplify creating dom elements
			 * @method buildOptions
			 * @param {HTMLElement} element
			 * @param {Object} btnClasses
			 * @param {HTMLElement} domSlider
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function buildOptions(element, btnClasses, domSlider) {
				var i,
					side,
					sliderImg,
					sliderImgClassList = null;

				for (i = 0; i < element.length; i++) {
					side = i ? "a" : "b";

					/* TODO - check sliderlabel */
					sliderImg = createElement("span");
					sliderImgClassList = sliderImg.classList;
					sliderImgClassList.add(classes.sliderLabel);
					sliderImgClassList.add(classes.sliderLabelTheme + side);
					if (i) {
						sliderImgClassList.add(btnClasses.uiBtnActive);
					}
					sliderImgClassList.add(btnClasses.uiBtnCornerAll);

					sliderImg.setAttribute("role", "img");
					sliderImg.appendChild(document.createTextNode(element[i].innerHTML));
					domSlider.insertBefore(sliderImg, domSlider.firstChild);
				}
			}

			/**
			 * Creates wrapper for slider
			 * @method createWrapper
			 * @param {HTMLElement} domSlider
			 * @return {HTMLElement}
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function createWrapper(domSlider) {
				var wrapper,
					domSliderChildNode = domSlider.childNodes,
					i,
					length;

				wrapper = createElement("div");
				wrapper.className = classes.sliderInneroffset;

				for (i = 0, length = domSliderChildNode.length; i < length; i++) {
					wrapper.appendChild(domSliderChildNode[i]);
				}
				return wrapper;
			}

			/**
			 * Build Slider based on Select Tag
			 * @method buildSliderBasedOnSelectTag
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {HTMLElement} element
			 * @param {HTMLElement} sliderContainer
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function buildSliderBasedOnSelectTag(self, element, sliderContainer) {
				var domSlider = createElement("div"),
					options = self.options,
					elementId = element.getAttribute("id"),
					btnClasses = Button.classes,
					domHandle = createElement("a");

				ns.warn("Please use input[data-role='toggleswitch'] " +
					"selector in order to define button like " +
					"toggle, or select[data-role='toggleswitch']. " +
					"select[data-role='slider'] is deprecated");

				domSlider.setAttribute("id", elementId + "-slider");

				addClassesForSlider(domSlider, btnClasses, options);

				domHandle.className = classes.sliderHandle;
				domSlider.appendChild(domHandle);
				domHandle.setAttribute("id", elementId + "-handle");

				domSlider.appendChild(createWrapper(domSlider));
				// make the handle move with a smooth transition
				domHandle.classList.add(classes.sliderSnapping);
				buildOptions(element, btnClasses, domSlider);
				// to make a difference between slider and flip type toggle
				domHandle.classList.add(classes.flipHandle);

				sliderContainer = domSlider;
				element.classList.add(classes.sliderSwitch);
				domHandle.style.right = "auto";
				domHandle.style.top = 0;
				element.parentNode.insertBefore(sliderContainer,
					element.nextSibling);
			}

			/**
			 * Build ToggleSwitchExtra
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._build = function (element) {
				var sliderContainer = createElement("div");

				//hide select
				element.className = classes.sliderSwitch;

				buildSliderBasedOnSelectTag(this, element, sliderContainer);

				return element;
			};

			/**
			 * Inits widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 * @instance
			 */
			ToggleSwitchExtra.prototype._init = function (element) {
				var elementId,
					self = this;

				elementId = element.id;
				self._ui.slider = document.getElementById(elementId +
					"-slider");
				self._ui.handle = document.getElementById(elementId +
					"-handle");
				self._ui.container = document.getElementById(elementId +
						"-container") || element;
				self._type = element.tagName.toLowerCase();
				self._labels = selectors.getChildrenByClass(self._ui.slider,
					ToggleSwitchExtra.classes.sliderLabel);
				refresh(self, self._getValue());

			};

			/**
			 * Enable the slider
			 *
			 * Method removes disabled attribute on slider and changes look
			 * of slider to enabled state.
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            var slider = document.getElementById("slider"),
			 *                  sliderWidget = tau.widget.Slider(slider),
			 *            sliderWidget.enable();
			 *        </script>
			 *
			 * ####If jQuery library is loaded, its method can be used:
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            $( "#slider" ).slider( "enable" );
			 *        </script>
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */

			/**
			 * Enable slider
			 * @method _enable
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._enable = function (element) {
				var btnClasses = Button.classes,
					self = this,
					slider = self._ui.slider;

				if (slider) {
					element.removeAttribute("disabled");
					slider.classList.remove(btnClasses.uiDisabled);
					slider.setAttribute("aria-disabled", false);
					self.options.disabled = false;
				}
			};

			/**
			 * Disable the slider
			 *
			 * Method sets disabled attribute on slider and changes look
			 * of slider to disabled state.
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            var slider = document.getElementById("slider"),
			 *                sliderWidget = tau.widget.Slider(slider),
			 *            sliderWidget.disable();
			 *        </script>
			 *
			 * ####If jQuery library is loaded, its method can be used:
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            $( "#slider" ).slider( "disable" );
			 *        </script>
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */

			/**
			 * Disable slider
			 * @method _disable
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._disable = function (element) {
				var self = this,
					btnClasses = Button.classes,
					slider = self._ui.slider;

				if (slider) {
					element.setAttribute("disabled", "disabled");
					slider.classList.add(btnClasses.uiDisabled);
					slider.setAttribute("aria-disabled", true);
					self.options.disabled = true;
				}
			};


			/**
			 * Binds events to widget
			 * @method _bindEvents
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 * @instance
			 */
			ToggleSwitchExtra.prototype._bindEvents = function () {
				var self = this,
					element = self.element,
					handle = self._ui.handle,
					slider = self._ui.slider;

				bindCallbacksForSelectTag(self);

				element.addEventListener("keyup", self._onKeyupElement,
					false);
				element.addEventListener("change", self._onChange, false);
				element.addEventListener("blur", self._onBlur, false);

				handle.addEventListener("keyup", self._onKeyupHandle,
					false);
				handle.addEventListener("keydown", self._onKeydown, false);
				handle.addEventListener("vclick", onVclick, false);
				handle.addEventListener("vmousedown", onVmousedown,
					false);

				slider.addEventListener("vmousedown",
					self._onVmousedownRefresh, false);
				slider.addEventListener("vmousemove", self._onVmouseMove,
					false);
				slider.addEventListener("vmouseup", self._sliderMouseUp,
					false);

			};


			/**
			 * Get or Set value of the widget
			 *
			 * Return element value or set the value
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            var slider = document.getElementById("slider"),
			 *                sliderWidget = tau.widget.Slider(slider),
			 *            // value contains index of select tag
			 *            value = sliderWidget.value();
			 *            //sets the index for the toggle
			 *            sliderWidget.value("1");
			 *        </script>
			 *
			 * ####If jQuery library is loaded, its method can be used:
			 *
			 *        @example
			 *        <select id="slider" name="flip-11" data-role="slider">
			 *            <option value="off"></option>
			 *            <option value="on"></option>
			 *        </select>
			 *        <script>
			 *            // value contains index of select tag
			 *            $( "#slider" ).slider( "value" );
			 *            // sets the index for the toggle
			 *            $( "#slider" ).slider( "value", "1" );
			 *        </script>
			 *
			 * @method value
			 * @return {string} In get mode return element value or element
			 * selected index based on tag name.
			 * @since 2.3
			 * @member ns.widget.mobile.ToggleSwitch
			 */


			/**
			 * Get value of toggle switch. If widget is based on input type
			 * tag otherwise it return index of the element
			 * @method _getValue
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._getValue = function () {
				var self = this,
					element = self.element;

				return element.selectedIndex;
			};

			/**
			 * Set value of toggle switch
			 * @method _setValue
			 * @param {string} value
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._setValue = function (value) {
				var self = this,
					element = self.element;

				element.selectedIndex = value;
			};

			/**
			 * remove attributees when destroyed
			 * @method removeAttributesWhenDestroy
			 * @param {HTMLElement} element
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function removeAttributesWhenDestroy(element) {
				element.removeAttribute("data-tau-name");
				element.removeAttribute("aria-disabled");
				element.removeAttribute("data-tau-bound");
				element.removeAttribute("data-tau-built");
			}

			/**
			 * Remove events from Slider which is based on Select Tag
			 * @method removeEventsFromToggleBasedOnSelect
			 * @param {ns.widget.mobile.ToggleSwitchExtra} self
			 * @param {HTMLElement} element
			 * @param {HTMLElement} handle
			 * @param {HTMLElement} slider
			 * @private
			 * @static
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			function removeEventsFromToggleBasedOnSelect(self, element, handle, slider) {
				element.removeEventListener("change", self._onChange,
					false);
				element.removeEventListener("keyup", self._onKeyupElement, false);
				element.removeEventListener("blur", self._onBlur, false);

				handle.removeEventListener("vmousedown", self._onVmousedown,
					false);
				handle.removeEventListener("vclick", self.onVclick, false);
				handle.removeEventListener("keydown", self._onKeydown, false);
				handle.removeEventListener("keyup", self._onKeyupHandle, false);

				slider.removeEventListener("vmousedown",
					self._onVmousedownRefresh, false);
				slider.removeEventListener("vmousemove", self._onVmouseMove,
					false);
				slider.removeEventListener("vmouseup", self._sliderMouseUp,
					false);
			}

			/**
			 * Destroy widget
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.ToggleSwitchExtra
			 */
			ToggleSwitchExtra.prototype._destroy = function () {
				var self = this,
					element = self.element,
					handle = self._ui.handle,
					slider = self._ui.slider;

				removeEventsFromToggleBasedOnSelect(self, element, handle, slider);

				removeAttributesWhenDestroy(element);
				element.classList.remove(classes.sliderSwitch);
				element.parentElement.removeChild(element.nextElementSibling);

				events.trigger(document, "destroyed", {
					widget: "ToggleSwitchExtra",
					parent: element.parentNode
				});
			};


			ns.widget.mobile.ToggleSwitchExtra = ToggleSwitchExtra;
			engine.defineWidget(
				"ToggleSwitchExtra",
				"select[data-role='slider']",
				[],
				ToggleSwitchExtra,
				"mobile"
			);
			}(window.document, ns));

/*global window, ns, define */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #SelectMenu Alias for DropdownMenu Widget
 *
 * @class ns.widget.mobile.SelectMenu
 * @author Hagun Kim <hagun.kim@samsung.com>
 */
(function (document, ns) {
	"use strict";
				var SelectMenu = ns.widget.mobile.DropdownMenu,
				engine = ns.engine;

			ns.widget.mobile.SelectMenu = SelectMenu;
			engine.defineWidget(
				"SelectMenu",
				"",
				["open", "close"],
				SelectMenu,
				"mobile"
			);

			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */

/**
 * #Progress Widget
 * The progress widget shows that an operation is in progress.
 *
 * ## Default selectors
 * In default elements matches to :
 *
 *  - HTML elements with data-role equal "progress"
 *  - HTML elements with class ui-progress
 *
 * ###HTML Examples
 *
 * ####Create simple text input on INPUT element
 *
 *        @example
 *        <div id="progress" data-role="progress"></div>
 *
 * ## Manual constructor
 * For manual creation of button widget you can use constructor of widget from
 * **tau** namespace:
 *
 *        @example
 *        <div id="progress"></div>
 *        <script>
 *            var element = document.getElementById("progress"),
 *                progress = tau.widget.Progress(element);
 *        </script>
 *
 * Constructor has one required parameter **element** which is base
 * **HTMLElement** to create widget. We recommend get this element by method
 * *document.getElementById*. Second parameter **options** and it is a object
 * with options for widget.
 *
 * If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div id="progress"></div>
 *        <script>
 *            $("#progress").progress();
 *        </script>
 *
 * jQuery Mobile constructor has one optional parameter **options** and it is
 * a object with options for widget.
 *
 * ##Options for widget
 *
 * Options for widget can be defined as _data-..._ attributes or supplied as
 * parameter in constructor.
 *
 * You can change option for widget using method **option**.
 *
 * ##Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        <div id="progress"></div>
 *        <script>
 *            var element = document.getElementById("progress"),
 *                progress = tau.widget.Progress(element);
 *
 *            // progress.methodName(argument1, argument2, ...);
 *            // for example
 *            progress.value(2);
 *        </script>
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        <div id="progress"></div>
 *        <script>
 *            // $(".selector").progress("methodName", argument1, argument2, ...);
 *            // for example
 *            $("#progress").progress("value", 2);
 *        </script>
 *
 * @extends ns.widget.BaseWidget
 * @class ns.widget.mobile.Progress
 */

(function (document, ns) {
	"use strict";

	
			/**
			 * {Object} Widget Alias for {@link ns.widget.BaseWidget}
			 * @member ns.widget.mobile.Progress
			 * @private
			 */
			var ProgressExtra = ns.widget.core.progress.Progress,
				/**
				 * @property {ns.engine} engine Alias for class ns.engine
				 * @member ns.widget.mobile.Progress
				 * @private
				 * @static
				 */
				engine = ns.engine,
				objectUtil = ns.util.object,
				parentConfigure = ProgressExtra.prototype._configure,
				parentBuild = ProgressExtra.prototype._build,
				parentInit = ProgressExtra.prototype._init,

				classes = {
					uiProgressPendingRunning: "ui-progress-pending-running"
				};

			ProgressExtra.prototype._configure = function () {
				if (typeof parentConfigure === "function") {
					parentConfigure.call(this);
				}
				this.options = objectUtil.merge({}, ProgressExtra.defaults, {
					style: null,
					running: true,
					size: "medium"
				});
			};
			/**
			 * Build structure of progress widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype._build = function (element) {
				if (this.options.style === "pending") {
					this.options.type = "activitybar";
				}
				if (this.options.style === "circle") {
					this.options.type = "activitycircle";
				}
				element.classList.add(classes.uiProgressPendingRunning);
				return parentBuild.call(this, element);
			};

			/**
			 * Init widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype._init = function (element) {
				var self = this,
					options = self.options;

				self._setRunning(options.running);

				return parentInit.call(this, element);
			};


			/**
			 * Method starts or stops running the progress.
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        var element = document.getElementById("progress"),
			 *            progressWidget = tau.widget.Progress(element),
			 *            // return current state of running
			 *            value = progressWidget.running();
			 *
			 *        progressWidget.running( true ); // starts running
			 *
			 *        progressWidget.running( fasle ); // stops running
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        // return current state of running
			 *        $( "#progress" ).progress( "running" );
			 *
			 *        // starts running
			 *        $( "#progress" ).progress( "running", true );
			 *
			 *        // stops running
			 *        $( "#progress" ).progress( "running", fasle );
			 *    </script>
			 *
			 * @method running
			 * @param {boolean} flag if thrue then set mode to running if false
			 * the stop running mode
			 * @member ns.widget.mobile.Progress
			 * @return {boolean}
			 */
			ProgressExtra.prototype.running = function (flag) {
				if (typeof flag === "boolean") {
					this._setRunning(flag);
				}
				return this.options.running;
			};

			/**
			 * Set running flag and refresh progress
			 * @method _setRunning
			 * @param {boolean} flag
			 * @protected
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype._setRunning = function (flag) {
				if (typeof flag === "boolean") {
					this.options.running = flag;
					this._refreshRunning();
				}
			};


			/**
			 * Start progress
			 * @method _start
			 * @protected
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype._start = function () {
				this.show();
				this.element.classList.add(classes.uiProgressPendingRunning);
			};

			/**
			 * Stop progress
			 * @method _stop
			 * @protected
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype._stop = function () {
				this.element.classList.remove(classes.uiProgressPendingRunning);
			};

			/**
			 * Method shows progress.
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        var element = document.getElementById("progress"),
			 *            progressWidget = tau.widget.Progress(element);
			 *
			 *        progressWidget.show();
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        $( "#progress" ).progress( "show" );
			 *    </script>
			 *
			 * @method show
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype.show = function () {
				this.element.style.display = "";
			};

			/**
			 * Method hides progress
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        var element = document.getElementById("progress"),
			 *            progressWidget = tau.widget.Progress(element);
			 *        progressWidget.hide();
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        $( "#progress" ).progress( "hide" );
			 *    </script>
			 *
			 * @method hide
			 * @member ns.widget.mobile.Progress
			 */
			ProgressExtra.prototype.hide = function () {
				this.element.style.display = "none";
			};

			/**
			 * Method refreshes a progress.
			 *
			 * This method will rebuild while DOM structure of widget. Method
			 * should be called after all manually change in HTML attributes
			 * of widget DOM structure. Refresh is called automatically after
			 * change any option of widget.
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        var element = document.getElementById("progress"),
			 *            progressWidget = tau.widget.Progress(element);
			 *
			 *        progressWidget.refresh();
			 *
			 *        // also will be called after
			 *        progressWidget.option("running", true);
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress"></div>
			 *    <script>
			 *        $( "#progress" ).progress( "refresh" );
			 *    </script>
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.Progress
			 */

			/**
			 * Refresh progress
			 * @method _refresh
			 * @member ns.widget.mobile.Progress
			 * @protected
			 */
			ProgressExtra.prototype._refreshRunning = function () {
				if (this.options.running) {
					this._start();
				} else {
					this._stop();
				}
			};

			// definition
			ns.widget.mobile.Progress = ProgressExtra;
			engine.defineWidget(
				"Progress",
				"[data-role='progress'], .ui-progress",
				[
					"running",
					"show",
					"hide"
				],
				ProgressExtra,
				"mobile"
			);

			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */

/**
 * #Progress Bar Widget
 * The progress bar widget shows a control that indicates the progress
 * percentage of an on-going operation.
 *
 * ## Default selectors
 * In default elements matches to :
 *
 *  - HTML elements with data-role equal "progressbar"
 *  - HTML elements with class ui-progressbar
 *
 * ###HTML Examples
 *
 * ####Create simple text input on INPUT element
 *
 *        @example
 *        <div id="progress-bar" data-role="progressbar"></div>
 *
 * ## Manual constructor
 * For manual creation of button widget you can use constructor of widget from
 * **tau** namespace:
 *
 *        @example
 *        <div id="progress-bar"></div>
 *        <script>
 *            var element = document.getElementById("progress-bar"),
 *                progressBar = tau.widget.ProgressBar(element);
 *        </script>
 *
 * Constructor has one required parameter **element** which is base
 * **HTMLElement** to create widget. We recommend fetching this element by
 * method *document.getElementById*. Second parameter is **options** and it is a
 * object with options for widget.
 *
 * If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div id="progress-bar"></div>
 *        <script>
 *            $("#progress-bar").progressbar();
 *        </script>
 *
 * jQuery Mobile constructor has one optional parameter **options** and it is
 * a object with options for widget.
 *
 * ##Options for widget
 *
 * Options for widget can be defined as _data-..._ attributes or give as
 * parameter in constructor.
 *
 * You can change option for widget using method **option**.
 *
 * ##Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        <script>
 *            var element = document.getElementById("probress-bar"),
 *                progressBar = tau.widget.ProgressBar(element);
 *
 *            progressBar.methodName(argument1, argument2, ...);
 *        </script>
 *
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        $(".selector").progressbar("methodName", argument1, argument2, ...);
 *
 * @extends ns.widget.BaseWidget
 * @class ns.widget.mobile.ProgressBar
 */

(function (document, ns) {
	"use strict";

	
			var BaseWidget = ns.widget.mobile.BaseWidgetMobile,


				events = ns.event,
				/**
				 * @property {ns.engine} engine Alias for class ns.engine
				 * @member ns.widget.mobile.ProgressBar
				 * @private
				 */
				engine = ns.engine,

				ProgressBar = function () {

					/**
					 * Object with default options
					 * @property {Object} options
					 * @property {number} [options.value=0] value of progress
					 * bar
					 * @property {number} [options.min=0] minimal value of
					 * progress bar
					 * @property {number} [options.max=100] maximal value of
					 * progress bar
					 * @member ns.widget.mobile.ProgressBar
					 */
					this.options = {
						value: 0,
						max: 100,
						min: 0
					};
				};

			/**
			 * Event is triggered when value of widget is changing.
			 * @event change
			 * @member ns.widget.mobile.ProgressBar
			 */

			/**
			 * Event is triggered when value of widget riches maximal value.
			 * @event complete
			 * @member ns.widget.mobile.ProgressBar
			 */

			ProgressBar.prototype = new BaseWidget();

			/**
			 * Dictionary for progress related css class names
			 * @property {Object} classes
			 * @static
			 * @member ns.widget.mobile.ProgressBar
			 * @readonly
			 */
			ProgressBar.classes = {
				uiProgressbar: "ui-progressbar",
				uiProgressbarBg: "ui-progressbar-bg",
				uiProgressbarValue: "ui-progressbar-value"
			};

			/**
			 * Build structure of progress widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.ProgressBar
			 */
			ProgressBar.prototype._build = function (element) {
				/* cached ProgressBar.classes object
				 * type Object
				 */
				var classes = ProgressBar.classes,
					self = this,
					options = self.options,
					progressBarBgElement,
					progressBarValueElement;

				progressBarBgElement = document.createElement("div");
				progressBarValueElement = document.createElement("div");

				element.classList.add(classes.uiProgressbar);
				progressBarBgElement.classList.add(classes.uiProgressbarBg);
				progressBarValueElement.classList.add(classes.uiProgressbarValue);

				progressBarValueElement.style.width = options.value + "%";

				progressBarValueElement.style.display = "none";

				element.setAttribute("role", "ProgressBar");
				element.setAttribute("aria-valuemin", options.min);
				element.setAttribute("aria-valuenow", options.value);
				element.setAttribute("aria-valuemax", options.max);

				progressBarBgElement.appendChild(progressBarValueElement);
				element.appendChild(progressBarBgElement);

				// fix for compare tests
				self.min = options.min;
				self.valueDiv = progressBarValueElement;
				self.oldValue = options.value;

				return element;
			};

			/**
			 * Get or set value
			 *
			 * Return inner text of button or set text on button
			 *
			 *    @example
			 *    <div id="progress-bar"></div>
			 *    <script>
			 *        var element = document.getElementById("progress-bar"),
			 *            progressBarWidget = tau.widget.ProgressBar(element),
			 *            // returns current value
			 *            value = progressBarWidget.value();
			 *
			 *        progressBarWidget.value( 30 ); // sets new value to 30
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress-bar"></div>
			 *    <script>
			 *        // returns current value
			 *        $( "#progress-bar" ).progressbar( "value" );
			 *
			 *        // set new value to 30
			 *        $( "#progress-bar" ).progressbar( "value", 30 );
			 *    </script>
			 * @method value
			 * @param {number} [value] Value to set on progress bar
			 * @return {number} In get mode returns current value of progress
			 * bar
			 * @since 2.3
			 * @member ns.widget.mobile.ProgressBar
			 */

			/**
			 * Method sets ProgressBar value.
			 * @method _setValue
			 * @param {number} value
			 * @return {boolean}
			 * @protected
			 * @member ns.widget.mobile.ProgressBar
			 */
			ProgressBar.prototype._setValue = function (value) {
				var options = this.options;

				if (typeof value === "number") {
					value = Math.min(options.max, Math.max(options.min, value));
					if (value !== options.value) {
						events.trigger(this.element, "change");
						options.value = value;
					}
					if (value === options.max) {
						events.trigger(this.element, "complete");
					}
					this.refresh();
					return true;
				}
				return false;
			};

			/**
			 * Method gets ProgressBar value.
			 * @method _getValue
			 * @return {number}
			 * @protected
			 * @member ns.widget.mobile.ProgressBar
			 */
			ProgressBar.prototype._getValue = function () {
				return this.options.value;
			};

			/**
			 * Refresh a progres bar.
			 *
			 * This method will rebuild while DOM structure of widget. Method
			 * should be called after are manually change in HTML attributes of
			 * widget DOM structure. Refresh is called automatically after
			 * change any option of widget.
			 *
			 *    @example
			 *    <div id="progress-bar"></div>
			 *    <script>
			 *        var element = document.getElementById("progress-bar"),
			 *            progressBarWidget = tau.widget.ProgressBar(element),
			 *
			 *        progressBarWidget.refresh();
			 *    </script>
			 *
			 *    @example
			 *    <div id="progress-bar"></div>
			 *    <script>
			 *        $( "#progress-bar" ).progressbar( "refresh" );
			 *    </script>
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.ProgressBar
			 */

			/**
			 * Method refreshes ProgressBar.
			 * @method _refresh
			 * @member ns.widget.mobile.ProgressBar
			 * @protected
			 */
			ProgressBar.prototype._refresh = function () {
				var element = this.element,
					options = this.options,
					elementChild = element.firstElementChild.firstElementChild;

				element.setAttribute("aria-valuenow", options.value);
				elementChild.style.display = "";
				elementChild.style.width = options.value + "%";
			};

			// definition
			ns.widget.mobile.ProgressBar = ProgressBar;
			engine.defineWidget(
				"ProgressBar",
				"[data-role='progressbar'], .ui-progressbar",
				["value"],
				ProgressBar,
				"tizen"
			);

			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * # ListviewExtra Widget
 * The list widget is used to display, for example, navigation data, results,
 * and data entries.
 *
 * !!!When implementing the list widget:!!!
 *
 *    - A button widget (data-role="button") placed in the *a* tag is
 *     not supported in the list widget. The button must be placed in a *div* tag.
 *    - If you implement the list widget differently than described in
 *     the examples shown below, application customization (set element
 *     positioning) is required.
 *
 *
 * ## Default selectors
 * By default UL or OL elements with _data-role=listview_ are changed to
 * Tizen Web UI Listview.
 *
 * Additionaly all UL or OL elements with class _ui-listview_ are changed to
 *  Tizen Web UI Listview.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *
 * #### Create Listview widget using tau method:
 *
 *        @example
 *        <ul id="list">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *        <script>
 *            tau.widget.Listview(document.getElementById("list"));
 *        </script>
 *
 * #### Create FastScroll widget using jQueryMobile notation:
 *
 *        @example
 *        <ul id="list">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *        <script>
 *            $('#list').listview();
 *        </script>
 *
 * ## Options
 *
 * ### Inset
 * _data-inset_ If this option is set to **true** the listview is wrapped by
 * additionally layer
 *
 *        @example
 *        <ul data-role="listview" data-inset="true">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *
 * ### Theme
 * _data-theme_ Sets the theme of listview
 *
 *        @example
 *        <ul data-role="listview" data-theme="s">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *
 * ### Divider theme
 * _data-divider-theme_ Sets the divider theme of listview
 *
 *        @example
 *        <ul data-role="listview" data-divider-theme="s">
 *            <li>Anton</li>
 *            <li>Arabella</li>
 *            <li data-role="divider">B</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *
 *
 * ## HTML example code
 *
 * ### Basic 1-line list item with anchor.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li><a href="#">Anton</a></li>
 *            <li><a href="#">Barry</a></li>
 *            <li><a href="#">Bill</a></li>
 *        </ul>
 *
 * ### Basic 1-line list item without anchor.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li>Anton</li>
 *            <li>Barry</li>
 *            <li>Bill</li>
 *        </ul>
 *
 * ### 1-line list item with a subtext.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li><a href="#">
 *                Anton
 *                <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                Barry
 *                <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                Bill
 *                <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### List with sub text below the main text.
 *
 * If this attribute is not used, the sub text position is right next to
 * the main text.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-multiline">Anton
 *                <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-multiline">Barry
 *                <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-multiline">Bill
 *                <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *        </ul>
 *
 * ### List with thumbnail
 *
 *        @example
 *        <ul data-role="listview">
 *            <li><img src="a.jpg" class="ui-li-bigicon" />Anton</li>
 *            <li><img src="a.jpg" class="ui-li-bigicon" />Barry</li>
 *            <li><img src="a.jpg" class="ui-li-bigicon" />Bill</li>
 *        </ul>
 *
 * ### List with thumbnail to the right.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-thumbnail-right">
 *                <img src="a.jpg" class="ui-li-bigicon" />
 *                Anton
 *            </li>
 *            <li class="ui-li-thumbnail-right">
 *                <img src="a.jpg" class="ui-li-bigicon" />
 *                Barry
 *            </li>
 *            <li class="ui-li-thumbnail-right">
 *                <img src="a.jpg" class="ui-li-bigicon" />
 *                Bill
 *            </li>
 *        </ul>
 *
 * ### 1-line list item with a text button, or with a circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li><a href="#">
 *                    Anton
 *                    <div data-role="button" data-inline="true">Button</div>
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                    Barry
 *                    <div data-role="button" data-inline="true" data-icon="plus"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 1-line list item with a toggle switch.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li>
 *                Anton
 *                <select name="flip-11" id="flip-11" data-role="slider">
 *                    <option value="off"></option>
 *                    <option value="on"></option>
 *                </select>
 *            </li>
 *            <li>
 *                Barry
 *                <select name="flip-12" id="flip-12" data-role="slider">
 *                    <option value="off"></option>
 *                    <option value="on"></option>
 *                </select>
 *            </li>
 *            <li>
 *                Bill
 *                <select name="flip-13" id="flip-13" data-role="slider">
 *                    <option value="off"></option>
 *                    <option value="on"></option>
 *                </select>
 *            </li>
 *        </ul>
 *
 * ### 1-line list item with thumbnail image
 * #### - and a subtext,
 * #### - and text button,
 * #### - and circle-shaped button
 * #### - and a toggle switch.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li><a href="#">
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Anton
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <div data-role="button" data-inline="true">Button</div>
 *                </a>
 *            </li>
 *            <li><a href="#">
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <div data-role="button" data-inline="true" data-icon="plus"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *            <li>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Barry
 *                <select name="flip-13" id="flip-13" data-role="slider">
 *                    <option value="off"></option>
 *                    <option value="on"></option>
 *                </select>
 *            </li>
 *        </ul>
 *
 * ### 1-line list item with check box,
 * #### - and thumbnail,
 * #### - and thumbnail and circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li>
 *                <form><input type="checkbox" name="c1line-check1" /></form>
 *                Anton
 *            </li>
 *            <li>
 *                <form><input type="checkbox" /></form>
 *                Barry
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *            </li>
 *            <li>
 *                <form><input type="checkbox" name="c1line-check4" /></form>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Barry
 *                <div data-role="button" data-inline="true" data-icon="plus"
 *                    data-style="circle"></div>
 *            </li>
 *        </ul>
 *
 * ### 1-line list item with radio button,
 * #### - and thumbnail,
 * #### - and thumbnail and circle-shaped button.
 *
 *        @example
 *        <form>
 *        <ul data-role="listview">
 *            <li>
 *                <input type="radio" name="radio"/>
 *                Anton
 *            </li>
 *            <li>
 *                <input type="radio" name="radio"/>
 *                Barry
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *            </li>
 *            <li>
 *                <input type="radio" name="radio"/>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Barry
 *                <div data-role="button" data-inline="true" data-icon="plus"
 *                    data-style="circle"></div>
 *            </li>
 *        </ul>
 *        <form>
 *
 * ### Basic 2-line list item.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Bill
 *                    <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with 2 subtexts.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <span class="ui-li-text-sub2">subtext 2</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <span class="ui-li-text-sub2">subtext 2</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Bill
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <span class="ui-li-text-sub2">subtext 2</span>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a text or circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true">button</div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true" data-icon="call"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with 2 subtexts
 * #### - and a star-shaped icon next to the first subtext
 * #### - and 1 subtext and 2 star-shaped icons
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <span style="position:absolute; right:16px; top:80px">
 *                        <img class= "ui-li-icon-sub-right"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <span class="ui-li-text-sub2">subtext 2</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Barry
 *                    <span class="ui-li-text-sub">
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                        subtext
 *                    </span>
 *                    <span>
 *                        <img class="ui-li-icon-sub-right"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line setting list item,
 * #### - with optionally also a toggle switch
 * #### - or circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                Barry
 *                <span class="ui-li-text-sub">subtext</span>
 *                <select name="flip-13" id="flip-13" data-role="slider">
 *                    <option value="off"></option>
 *                    <option value="on"></option>
 *                </select>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Bill
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true" data-icon="call"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a subtext,
 * #### - and also a star-shaped icon and a circle-shaped button,
 * #### - thumbnail and a second subtext,
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">
 *                        subtext
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <div data-role="button" data-inline="true" data-icon="call"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext 1</span>
 *                    <span class="ui-li-text-sub2">subtext 2</span>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a subtext and check box
 * #### - and thumbnail
 * #### - and a circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="check1" /></form>
 *                Anton
 *                <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="check2" /></form>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Barry
 *                <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="check3" /></form>
 *                Bill
 *                <span class="ui-li-text-sub">subtext</span>
 *                <div data-role="button" data-inline="true" data-icon="call"
 *                    data-style="circle"></div>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a subtext and radio button,
 * #### - and thumbnail
 * #### - and a circle-shaped button.
 *
 *        @example
 *        <form>
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                    <input type="radio" name="radio1" />
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                    <input type="radio" name="radio1" />
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                    <input type="radio" name="radio1" />
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true" data-icon="call"
 *                        data-style="circle"></div>
 *            </li>
 *        </ul>
 *        </form>
 *
 * ### 2-line list item with a color bar,
 * #### - subtext, text button and 3 star-shaped icons,
 * #### - thumbnail, subtext, text button, and 1 star-shaped icon,
 * #### - thumbnail, subtext, and circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <span class="ui-li-color-bar"
 *                        style="background-color: red;"></span>
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext
 *                        <img src="00_winset_icon_favorite_on.png" />
 *                        <img src="00_winset_icon_favorite_on.png" />
 *                        <img src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <div data-role="button" data-inline="true">button</div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <span class="ui-li-color-bar"
 *                        style="background-color:rgba(72, 136, 42, 1);"></span>
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                    Barry
 *                    <span>
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true">button</div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <span class="ui-li-color-bar"
 *                        style="background-color: blue;"></span>
 *                    Bill
 *                    <span>
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="button" data-inline="true" data-icon="call"
 *                        data-style="circle"></div>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a subtext and thumbnail at right
 * #### and 2 star-shaped icons
 * #### and a star-shaped icons, subtext, and thumbnail.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline ui-li-thumbnail-right">
 *                <a href="#">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon">
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline ui-li-thumbnail-right">
 *                <a href="#">
 *                    Barry
 *                    <span>
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                    </span>
 *                    <span class="ui-li-text-sub">
 *                        <img class="ui-li-icon-sub"
 *                            src="00_winset_icon_favorite_on.png" />
 *                        subtext
 *                    </span>
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a subtext before the main text and a thumbnail.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline ui-li-thumbnail-right">
 *                <a href="#">
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    Anton
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline ui-li-thumbnail-right">
 *                <a href="#">
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    Barry
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline ui-li-thumbnail-right">
 *                <a href="#">
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    Bill
 *                    <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a thumbnail and a progress bar.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <img scr="thumbnail.jpg" class="ui-li-bigicon">
 *                    Anton
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="progressbar" id="progressbar"></div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <img scr="thumbnail.jpg" class="ui-li-bigicon">
 *                    Barry
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="progressbar" id="progressbar"></div>
 *                </a>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <a href="#">
 *                    <img scr="thumbnail.jpg" class="ui-li-bigicon">
 *                    Bill
 *                    <span class="ui-li-text-sub">subtext</span>
 *                    <div data-role="progressbar" id="progressbar"></div>
 *                </a>
 *            </li>
 *        </ul>
 *
 * ### 2-line list item with a check box, thumbnail, subtext
 * ### and circle-shaped button.
 *
 *        @example
 *        <ul data-role="listview">
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="checkbox" /></form>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Anton
 *                <span class="ui-li-text-sub">subtext</span>
 *                <div data-role="button" data-inline="true" data-icon="call"
 *                    data-style="circle"></div>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="checkbox" /></form>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Barry
 *                <span class="ui-li-text-sub">subtext</span>
 *                <div data-role="button" data-inline="true" data-icon="call"
 *                    data-style="circle"></div>
 *            </li>
 *            <li class="ui-li-has-multiline">
 *                <form><input type="checkbox" name="checkbox" /></form>
 *                <img src="thumbnail.jpg" class="ui-li-bigicon" />
 *                Bill
 *                <span class="ui-li-text-sub">subtext</span>
 *                <div data-role="button" data-inline="true" data-icon="call"
 *                    data-style="circle"></div>
 *            </li>
 *        </ul>
 *
 * @class ns.widget.mobile.ListviewExtra
 * @extends ns.widget.mobile.Listview
 */
(function (window, document, ns) {
	"use strict";
				var ListviewExtra = ns.widget.mobile.Listview,

				/**
				 * Backup of _build methods for replacing it
				 * @method parentBuild
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 */
				parentBuild = ListviewExtra.prototype._build,

				/**
				 * Backup of _configure methods for replacing it
				 * @method parentConfigure
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 */
				parentConfigure = ListviewExtra.prototype._configure,

				/**
				 * Backup of _init methods for replacing it
				 * @method parentInit
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 */
				parentInit = ListviewExtra.prototype._init,

				/**
				 * Alias for class {@link ns.engine}
				 * @property {Object} engine
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 * @static
				 */
				engine = ns.engine,
				/**
				 * Alias for class {@link ns.util.DOM}
				 * @property {Object} DOM
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 * @static
				 */
				DOM = ns.util.DOM,
				/**
				 * Alias for object ns.widget.mobile.ListviewExtra.classes
				 * @property {Object} classes
				 * @member ns.widget.mobile.ListviewExtra
				 * @static
				 * @private
				 * @readonly
				 * @property {string} classes.uiListview Main class of listview
				 * @property {string} classes.uiLinkInherit class inherit link on listview
				 * @property {string} classes.uiLiThumb class of thumb included in li element
				 * @property {string} classes.uiLiHasThumb class of li element which has thumb
				 * @property {string} classes.uiLiIcon class of icon included in li element
				 * @property {string} classes.uiLiHasIcon class of li element which has icon
				 * @property {string} classes.uiLiHasCheckbox class of li element which has checkbox
				 * @property {string} classes.uiLiHasCheckboxDisabled class of li element which has checkbox disabled
				 * @property {string} classes.uiLiHasRadio class of li element which has radio button
				 * @property {string} classes.uiLiHasRadioDisabled class of li element which has radio button disabled
				 * @property {string} classes.uiLiHasRightCircleBtn class of li element which has circle button
				 * @property {string} classes.uiLiHasRightBtn class of li element which has button allign to right
				 * @property {string} classes.uiLiCount class of count included in li element
				 * @property {string} classes.uiLiHasCount class of li element which has count
				 * @property {string} classes.uiLiStatic class of li static element
				 * @property {string} classes.uiLiHeading class of li heading
				 */
				classes = {
					uiListview: "ui-listview",
					uiLinkInherit: "ui-link-inherit",
					uiLiThumb: "ui-li-thumb",
					uiLiHasThumb: "ui-li-has-thumb",
					uiLiIcon: "ui-li-icon",
					uiLiHasIcon: "ui-li-has-icon",
					uiLiHasCheckbox: "ui-li-has-checkbox",
					uiLiHasCheckboxDisabled: "ui-li-has-checkbox-disabled",
					uiLiHasRadio: "ui-li-has-radio",
					uiLiHasRadioDisabled: "ui-li-has-radio-disabled",
					uiLiHasRightCircleBtn: "ui-li-has-right-circle-btn",
					uiLiHasRightBtn: "ui-li-has-right-btn",
					uiLiCount: "ui-li-count",
					uiLiHasCount: "ui-li-has-count",
					uiLiAnchor: "ui-li-anchor",
					uiLiStatic: "ui-li-static",
					uiLiHeading: "ui-li-heading"
				},
				/**
				 * Alias to ns.util.selectors
				 * @property {Object} selectors
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 * @static
				 */
				selectors = ns.util.selectors,
				/**
				 * Alias to ns.event
				 * @property {Object} eventUtils
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 * @static
				 */
				eventUtils = ns.event,
				/**
				 * Alias to Array.slice
				 * @method slice
				 * @member ns.widget.mobile.ListviewExtra
				 * @private
				 */
				slice = [].slice;

			ListviewExtra.classes = classes;

			ListviewExtra.prototype._configure = function () {
				var self = this;

				if (typeof parentConfigure === "function") {
					parentConfigure.call(this);
				}

				self.options = self.options || {};
			};

			/**
			 * Add thumb classes img
			 * @method addThumbClassesToImg
			 * @param {HTMLElement} img
			 * @private
			 * @static
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addThumbClassesToImg(img) {
				var parentNode = selectors.getClosestByTag(img.parentNode, "li");

				img.classList.add(classes.uiLiThumb);
				if (parentNode) {
					parentNode.classList.add(
						img.classList.contains(classes.uiLiIcon) ?
							classes.uiLiHasIcon :
							classes.uiLiHasThumb
					);
				}
			}

			/**
			 * Add thumb classes to first img of container
			 * @method addThumbClasses
			 * @param {HTMLElement} container
			 * @private
			 * @static
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addThumbClasses(container) {
				var img;

				img = selectors.getChildrenByTag(container, "img");
				if (img.length) {
					addThumbClassesToImg(img[0]);
				}
			}

			/**
			 * Add checkbox classes to first input of container
			 * @method addCheckboxRadioClasses
			 * @param {HTMLElement} container HTML LI element.
			 * @private
			 * @static
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addCheckboxRadioClasses(container) {
				var inputAttr = container.querySelector("input"),
					typeOfInput,
					contenerClassList = container.classList,
					disabled = false;

				if (inputAttr) {
					typeOfInput = inputAttr.getAttribute("type");
					disabled = inputAttr.hasAttribute("disabled");
					if (typeOfInput === "checkbox" && inputAttr.getAttribute("data-role") !== "toggleswitch") {
						contenerClassList.add(classes.uiLiHasCheckbox);
						if (disabled) {
							contenerClassList.add(classes.uiLiHasCheckboxDisabled);
						}
					} else if (typeOfInput === "radio") {
						contenerClassList.add(classes.uiLiHasRadio);
						if (disabled) {
							contenerClassList.add(classes.uiLiHasRadioDisabled);
						}
					}
				}
			}

			/**
			 * Function add ui-li-heading class to all headings elemenets in list
			 * @method addHeadingClasses
			 * @param {HTMLElement} container HTML LI element.
			 * @private
			 * @static
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addHeadingClasses(container) {
				var headings = [].slice.call(container.querySelectorAll("h1, h2, h3, h4, h5, h6")),
					i = headings.length - 1;

				while (i >= 0) {
					headings[i].classList.add(classes.uiLiHeading);
					i--;
				}
			}

			/**
			 * Add right button classes to first button of container
			 * @method addRightBtnClasses
			 * @param {HTMLElement} container HTML LI element
			 * @private
			 * @static
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addRightBtnClasses(container) {
				var btnAttr = container.querySelector("[data-role='button'],input[type='button'],select[data-role='slider'],input[type='submit'],input[type='reset'],button");

				if (btnAttr) {
					if (DOM.getNSData(btnAttr, "style") === "circle") {
						container.classList.add(classes.uiLiHasRightCircleBtn);
					} else {
						container.classList.add(classes.uiLiHasRightBtn);
					}
				}
			}

			/**
			 * Build Listview widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype._build = function (element) {
				//@todo check if this is ol list
				this._refreshItems(element, true);
				return parentBuild.call(this, element);
			};

			/**
			 * Initialize Listview widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype._init = function (element) {
				var popup = selectors.getClosestBySelector(element, "[data-role=popup]"),
					drawer = selectors.getClosestBySelector(element, "[data-role=drawer]"),
					elementType = element.tagName.toLowerCase();

				//for everything what is not a list based on ul set the following width
				if (!popup && elementType !== "ul" && !drawer) {
					element.style.width = window.innerWidth + "px";
				}

				return (typeof parentInit === "function") ?
					parentInit.call(this, element) :
					element;
			};

			/**
			 * Change Checkbox/Radio state when list clicked
			 * @method _clickCheckboxRadio
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype._clickCheckboxRadio = function (element) {
				var checkboxRadio = slice.call(element.querySelectorAll(".ui-checkbox, .ui-radio")),
					i = checkboxRadio.length,
					input;

				while (--i >= 0) {
					input = checkboxRadio[i];
					if (input.type === "checkbox") {
						input.checked = !input.checked;
						eventUtils.trigger(input, "change");
					} else {
						if (!input.checked) {
							input.checked = true;
							eventUtils.trigger(input, "change");
						}
					}
				}
			};

			/**
			 * Registers widget's event listeners
			 * @method _bindEvents
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype._bindEvents = function (element) {
				var self = this;

				element.addEventListener("vclick", function (event) {
					var target = event.target;

					if (target.classList.contains(classes.uiLiHasCheckbox) || target.classList.contains(classes.uiLiHasRadio)) {
						self._clickCheckboxRadio(target);
					} else if (target.type === "checkbox" || target.type === "radio") {
						event.stopPropagation();
						event.preventDefault();
					}
				}, false);
			};

			/**
			 * Adds checkboxradio, thumb and right button classes
			 * if it is essential.
			 * @method addItemClasses
			 * @param {HTMLElement} item Element to add classes to
			 * @static
			 * @private
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function addItemClasses(item) {
				addCheckboxRadioClasses(item);
				addThumbClasses(item);
				addRightBtnClasses(item);
			}

			/**
			 * Refreshes item elements with "a" tag
			 * @method refreshLinks
			 * @param {HTMLElement} item HTML LI element
			 * @static
			 * @private
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function refreshLinks(item) {
				var links = selectors.getChildrenByTag(item, "a"),
					itemClassList = item.classList;

				if (links.length) {
					addItemClasses(links[0]);
					itemClassList.add(classes.uiLiAnchor);
				} else {
					itemClassList.add(classes.uiLiStatic);
					item.setAttribute("tabindex", "0");
				}
			}

			/**
			 * Refreshes single item of a list
			 * @method refreshItem
			 * @param {HTMLElement} item HTML LI element
			 * @param {boolean} create True if item is forced to be created
			 * @static
			 * @private
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function refreshItem(item, create) {
				var itemClassList = item.classList;

				if (create || (!item.hasAttribute("tabindex") && DOM.isOccupiedPlace(item))) {

					if (item.querySelector("." + classes.uiLiCount)) {
						itemClassList.add(classes.uiLiHasCount);
					}

					if (item.hasAttribute("tabindex") === false) {
						item.setAttribute("tabindex", 0);
					}

					if (!selectors.matchesSelector(item, engine.getWidgetDefinition("ListDivider").selector)) {
						refreshLinks(item);
						addHeadingClasses(item);
					}
				}
				addItemClasses(item);
			}

			/**
			 * Refreshes list images
			 * @method refreshImages
			 * @param {HTMLElement} ul HTML UL element
			 * @static
			 * @private
			 * @member ns.widget.mobile.ListviewExtra
			 */
			function refreshImages(ul) {
				var imgs = ul.querySelectorAll("." + classes.uiLinkInherit + " > img:first-child"),
					i,
					length = imgs.length;

				for (i = 0; i < length; i++) {
					addThumbClassesToImg(imgs[i]);
				}
			}

			/**
			 * Refreshes items of list
			 * @method _refreshItems
			 * @param {HTMLElement} ul HTML UL element
			 * @param {boolean} create
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype._refreshItems = function (ul, create) {
				var self = this,
					items;

				eventUtils.trigger(ul, "beforerefreshitems");

				items = selectors.getChildrenByTag(ul, "li");

				items.forEach(function (item) {
					refreshItem(item, create);
				}, self);

				refreshImages(ul);
			};

			/**
			 * Refresh ListviewExtra widget
			 * @method refresh
			 * @protected
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype.refresh = function () {
				this._refreshItems(this.element, false);
				eventUtils.trigger(this.element, this.name.toLowerCase() + "afterrefresh");
			};

			/**
			 * Adds item to widget and refreshes layout.
			 * @method addItem
			 * @param {HTMLElement} listItem new LI item
			 * @param {number} position position on list
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype.addItem = function (listItem, position) {
				var element = this.element,
					childNodes = element.children,
					tempDiv,
					liItem,
					liButtons,
					i;

				if (typeof listItem === "string") {
					tempDiv = document.createElement("div");
					tempDiv.innerHTML = listItem;
					liItem = tempDiv.firstChild;
				} else {
					liItem = listItem;
				}

				liButtons = liItem.querySelectorAll("[data-role='button'], button");

				if (position < childNodes.length) {
					element.insertBefore(liItem, childNodes[position]);
				} else {
					element.appendChild(liItem);
				}

				for (i = 0; i < liButtons.length; i++) {
					engine.instanceWidget(liButtons[i], "Button");
				}

				this.refresh();
			};

			/**
			 * Removes item from widget and refreshes layout.
			 * @method removeItem
			 * @param {number} position position on list
			 * @member ns.widget.mobile.ListviewExtra
			 */
			ListviewExtra.prototype.removeItem = function (position) {
				var element = this.element,
					childNodes = element.children;

				if (position < childNodes.length) {
					element.removeChild(childNodes[position]);
				}
				this.refresh();
			};

			engine.defineWidget(
				"Listview",
				"[data-role='listview'], .ui-listview",
				["addItem", "removeItem"],
				ListviewExtra,
				"mobile",
				true
			);

			}(window, window.document, ns));

/*global window, define, ns, $ */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, white: true, plusplus: true*/
/**
 * #Extendable List Widget
 * The Extendable List is used to display a list of data elements that can be extended.
 *
 * ## Default selectors
 * **UL** tags with _data-role=extendablelist_ attribute. However most of required options has to be passed as Java Script object.
 * Widget has to be created manually.
 *
 * ###HTML Examples
 *
 * ####Create basic Extendable List
 *
 *        @example
 *        <ul id="widgetIdSelector" data-role="extendablelist"></ul>
 *
 *        <script>
 *            var config = {
 *				// NOTE: JSON_DATA is an object which holds all records that you want to load
 *				// Declare total number of items
 *				dataLength: JSON_DATA.length,
 *
 *				// Set list item updater
 *				listItemUpdater: function (processedIndex, listItem) {
 *					var data = JSON_DATA[processedIndex];
 *					listItem.textContent = data.NAME;
 *				},
 *
 *				// Set list item loader
 *				listItemLoader: function (loaderContainer, numMoreItems) {
 *					// Get loader element
 *					loaderContainer.textContent= 'Load ' + numMoreItems + ' more items';
 *				}
 *			};
 *
 *            // Create widget using TAU notation ...
 *            tau.widget.ExtendableList(document.getElementById("widgetIdSelector"), config).create();
 *
 *            // ... or using jQM notation
 *            $( "#widgetIdSelector" ).extendablelist( config );
 *        </script>
 *
 * ####Create basic Extendable List with custom loader item
 * To set custom loader element add one **li** element to list markup. If no element will be provided, widget will create it automatically.
 * Loader element is always passed as first (**loaderContainer**) argument while calling **listItemLoader** function.
 *
 *        @example
 *        <ul id="widgetIdSelector" data-role="extendablelist">
 *            <!-- Declaration of custom loader item -->
 *            <li class="custom-class"></li>
 *        </ul>
 *
 *        <script>
 *            var config = {
 *				// NOTE: JSON_DATA is an object which holds all records that you want to load
 *				// Declare total number of items
 *				dataLength: JSON_DATA.length,
 *
 *				// Set list item updater
 *				listItemUpdater: function (processedIndex, listItem) {
 *					var data = JSON_DATA[processedIndex];
 *					listItem.textContent = data.NAME;
 *				},
 *
 *				// Set list item loader
 *				listItemLoader: function (loaderContainer, numMoreItems) {
 *					// Get loader element
 *					loaderContainer.textContent= 'Load ' + numMoreItems + ' more items';
 *				}
 *			};
 *
 *            // Create widget using TAU notation ...
 *            tau.widget.ExtendableList(document.getElementById("widgetIdSelector"), config)
 *                .create();
 *
 *            // ... or using jQM notation
 *            $( "#widgetIdSelector" ).extendablelist( "create", config );
 *        </script>
 *
 * ####Create Extendable List using jQuery Template
 * Extendable List supports jQuery Template, for further information about **jQuery.template plugin** you can find in jQuery documentation for jQuery.template plugin.
 * To switch widget in template mode _data-template_ attribute must be set or template option must be passed.
 * **NOTE:** This feature is available but not recommended due performance issue and abandoned library jQuery Template support. It will be probably replaced by more efficient template system.
 *
 *        @example
 *        <!-- Template for list item -->
 *        <script id="tmp-1line" type="text/x-jquery-tmpl">
 *            <li class="my-custom-class">${NAME}</li>
 *        </script>
 *
 *        <!-- Template for loader -->
 *        <script id="tmp_load_more" type="text/x-jquery-tmpl">
 *            <li class="my-custom-loader-class">
 *                Load ${NUM_MORE_ITEMS} more items
 *            </li>
 *        </script>
 *
 *        <ul id="widgetIdSelector" data-role="extendablelist" data-template="tmp-1line"></ul>
 *        <script>
 *            var config = {
 *				// You can use itemData property, which is equivalent to listItemUpdater,
 *				// but it's deprecated and kept only for compatibility with old Web UI Framework.
 *				// Set list item updater for jQ template
 *				listItemUpdater: function (idx) {
 *					return JSON_DATA[idx];
 *				},
 *				// JSON_DATA is an object which holds all records that you want to load
 *				// You can use numitemdata property, which is equivalent to dataLength,
 *				// but it's deprecated and kept only for compatibility with old Web UI Framework.
 *				// Declare total number of items
 *				dataLength: JSON_DATA.length
 *			};
 *
 *            // Create widget using TAU notation
 *            tau.widget.ExtendableList(document.getElementById("widgetIdSelector"), config)
 *                .create();
 *
 *            // ... or using jQM notation
 *            $( "#widgetIdSelector" ).extendablelist( "create", config );
 *        </script>
 *
 *
 * #### Setting listItemUpdater option
 * List item updater function is called for every processed list element. There are two types of updater function. If there is **not** used jQuery Template mode updater should takes two arguments (processed index, list item element). otherwise function should return object and takes only one argument(processed index). Please check example for details.
 *
 * ##### Setting listItemUpdater in normal mode
 * List item updater function should takes **two parameters** when using non jQuery Template mode:
 * - **processedIndex** {number} Index of processed data set (zero based),
 * - **element** {HTMLElement} Current processed list item.
 *
 *        @example
 *        <script>
 *            var myNewListItemUpdater = function (processedIndex, listItem) {
 *				// JSON_DATA is an object which holds all records that you want to load
 *				var data = JSON_DATA[processedIndex];
 *				// Do some crazy things with listItem
 *				listItem.textContent = data.NAME;
 *				if (Math.round(Math.random()) === 1) {
 *					listItem.classList.add('crazy-class');
 *				}
 *			}
 *            // Create widget using TAU notation ...
 *            tau.widget.ExtendableList(document.getElementById("widgetIdSelector"))
 *                .option("listItemUpdater", myNewListItemUpdater);
 *
 *            // ... or using jQM notation
 *            $( "#widgetIdSelector" ).extendablelist( "option", "listItemUpdater", myNewListItemUpdater );
 *        </script>
 *
 *
 * ##### Setting listItemUpdater in jQuery Template mode
 * Using **jQuery Template** mode list item updater function should takes **one parameter** and returns an Object:
 * - **processedIndex** {number} Index of processed data set (zero based).
 *
 *        @example
 *        <script>
 *            var myTemplateListItemUpdater = function (processedIndex) {
 *				// JSON_DATA is an object which holds all records that you want to load
 *				return JSON_DATA[processedIndex];
 *			}
 *            // Create widget using TAU notation ...
 *            tau.widget.ExtendableList(document.getElementById("templateWidgetIdSelector"))
 *                .option("listItemUpdater", myTemplateListItemUpdater);
 *
 *            // ... or using jQM notation
 *            $( "#templateWidgetIdSelector" ).extendablelist( "option", "listItemUpdater", myTemplateListItemUpdater );
 *        </script>
 *
 *
 * @class ns.widget.mobile.ExtendableList
 * @extends ns.widget.mobile.Listview
 * @author Michał Szepielak <m.szepielak@samsung.com>
 */
(function (document, ns) {
	"use strict";
				/**
			 * @property {ns.widget.mobile.Listview} Listview alias variable
			 * @private
			 * @static
			 */
			var Listview = ns.widget.mobile.Listview,

				/**
				 * @property {Object} parentBuild Shortcut for parent's {@link ns.widget.mobile.Listview#_build}
				 * method from prototype of {@link ns.widget.mobile.Listview}
				 * @private
				 * @static
				 * @member ns.widget.mobile.ExtendableList
				 */
				parentBuild = Listview.prototype._build,

				/**
				 * @property {Object} engine Alias for class {@link ns.engine}
				 * @private
				 * @static
				 * @member ns.widget.mobile.ExtendableList
				 */
				engine = ns.engine,

				/**
				 * @property {Object} util Alias for class {@link ns.util}
				 * @private
				 * @static
				 * @member ns.widget.mobile.ExtendableList
				 */
				util = ns.util,

				ExtendableList = function () {
					var self = this;

					/**
					 * @property {number} _currentIndex Current zero-based index of data set.
					 * @member ns.widget.mobile.ExtendableList
					 * @protected
					 */
					self._currentIndex = 0;

					/**
					 * @property {Object} options ExtendableList widget options.
					 * @property {?number} [options.bufferSize=null] Maximum number of items which will be loaded on widget startup and after each extension.
					 * @property {?number} [options.extenditems=null] Alias for bufferSize to preserve compatibility with Web UI Framework (deprecated)
					 * @property {number} options.dataLength Total number of list items.
					 * @property {number} options.numitemdata Alias for dataLength to preserve compatibility with Web UI Framework (deprecated)
					 * @property {Function} options.listItemUpdater Holds reference to method which modifies list items depended at specified index from database. <br>Method <b>should be overridden</b> by developer using <a href="#_setListItemUpdater">_setListItemUpdater</a> method or defined as a config object. <br>Method takes two parameters:<br>  -  index {number} Index of processed data set (zero based)<br> -  element {HTMLElement} List item to be modified (only non jQuery Template mode)
					 * @property {?Function} [options.itemData=null] Alias for listItemUpdater to preserve compatibility with Web UI Framework (deprecated)
					 * @property {Function} options.listItemLoader Holds reference to method which modifies loader item. <br>Method <b>should be overridden</b> by developer using <a href="#setListItemLoader">setListItemLoader</a> method or defined as a config object. <br>Method takes two parameters:<br>  -  loaderContainer {HTMLElement} Loader container, list element that holds e.g. extend button. If all elements will be loaded, this element will be removed from list.<br>  -  numMoreItems {number} Number of items, that left to load.
					 * @property {string} [options.loadmore="tmp_load_more"] Load more container jQuery Template's ID
					 * @property {string} options.template List item jQuery Template's ID. If this option is not **null** widget will work in jQuery Template mode.
					 * @member ns.widget.mobile.ExtendableList
					 */
					self.options = {
						bufferSize: 50,
						extenditems: null,
						dataLength: 0,
						numitemdata: 0,
						listItemUpdater: null,
						itemData: null,
						listItemLoader: null,
						loadmore: "tmp_load_more",
						template: null
					};

					//@TODO jQuery template, change to better template system
					self._jQueryTmpl = false;
					self.$tmpl = {};

					/**
					 * @property {Object} _listItemLoaderBound Binding for loader item to fire method {ns.widget.mobile.ExtendableList._buildList}.
					 * @member ns.widget.mobile.ExtendableList
					 * @protected
					 */
					self._listItemLoaderBound = null;
				},

				/**
				 * @property {Object} classes Dictionary object containing commonly used widget CSS classes
				 * @static
				 * @member ns.widget.mobile.ExtendableList
				 */
				classes = {
					CONTAINER: "ui-extendable-list-container",
					ACTIVE: "ui-listview-active"
				},
				// Cached prototype for better minification
				prototype = new Listview();

			/**
			 * Copy alias options from old Web UI notation
			 * @param {ns.widget.mobile.ExtendableList} self Widget instance
			 * @param {Object} newOptions
			 * @private
			 * @static
			 * @member ns.widget.mobile.ExtendableList
			 */
			function copyAliases(self, newOptions) {
				var options = self.options;

				if (newOptions === undefined) {
					newOptions = options;
				}

				if (newOptions.extenditems || options.extenditems) {
					options.bufferSize = parseInt(newOptions.extenditems, 10) || parseInt(options.extenditems, 10);
				}

				if (newOptions.numitemdata || options.numitemdata) {
					options.dataLength = parseInt(newOptions.numitemdata, 10) || parseInt(options.numitemdata, 10);
				}

				if (newOptions.itemData || options.itemData) {
					options.listItemUpdater = newOptions.itemData || options.itemData;
				}
			}

			/**
			 * Unbinds vclick event from loader element.
			 * @param {ns.widget.mobile.ExtendableList} self Widget instance
			 * @param {HTMLElement} loaderItem Loader element
			 * @private
			 * @static
			 * @member ns.widget.mobile.ExtendableList
			 */
			function _unbindLoader(self, loaderItem) {
				if (self._listItemLoaderBound !== null) {
					loaderItem.removeEventListener("vclick", self._listItemLoaderBound, false);
				}
				self._listItemLoaderBound = null;
			}

			/**
			 * Binds vclick event to loader element.
			 * @param {ns.widget.mobile.ExtendableList} self Widget instance
			 * @param {HTMLElement} loaderItem Loader element
			 * @private
			 * @static
			 * @member ns.widget.mobile.ExtendableList
			 */
			function _bindLoader(self, loaderItem) {
				if (loaderItem) {
					_unbindLoader(self, loaderItem);
					self._listItemLoaderBound = self._buildList.bind(self);
					loaderItem.addEventListener("vclick", self._listItemLoaderBound, false);
				}
			}

			/**
			 * Updates list item using user defined listItemUpdater function.
			 * @method _updateListItem
			 * @param {HTMLElement} element List element to update
			 * @param {number} index Data row index
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._updateListItem = function (element, index) {
				var self = this,
					listItemUpdater = self.options.listItemUpdater;

				//@TODO jQuery template, change for better template system
				if (self._jQueryTmpl === true) {
					// Call list item updater and set list item content
					element.outerHTML = self.$tmpl.item.tmpl(listItemUpdater(index))[0].outerHTML;
				} else {
					// Call list item updater
					listItemUpdater(index, element);
				}
			};

			/**
			 * Build widget structure
			 * @method _build
			 * @param {HTMLElement} element Widget's element
			 * @return {HTMLElement} Element on which built is widget
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._build = function (element) {
				var self = this;

				//Call parent's method
				parentBuild.call(self, element);

				// Add necessary CSS Classes
				element.classList.add(classes.CONTAINER);

				return element;
			};

			/**
			 * Builds widget list structure. Creates all list items and updates it using updater method.
			 * @method _buildList
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._buildList = function () {
				var listItem,
					self = this,
					list = self.element,
					options = self.options,
					bufferSize = options.bufferSize,
					dataLength = options.dataLength - 1, // Indexes are 0 based
					numberOfItems,
					currentIndex = self._currentIndex,
					loaderItem = null,
					i;

				// Get loader item if exists or create new one
				loaderItem = list.lastElementChild || document.createElement("li");

				// Get number of items to load
				numberOfItems = currentIndex + bufferSize > dataLength ? dataLength - currentIndex : bufferSize;

				// Load additional items
				for (i = 0; i < numberOfItems; ++i) {
					listItem = document.createElement("li");
					// To copy all element's attributes we use outerHTML property,
					// that's why we should not be appended to document fragment,
					// due document fragment is not an element node
					list.appendChild(listItem);
					self._updateListItem(listItem, i + currentIndex);

				}

				// Update current Index
				currentIndex += numberOfItems;

				// Get number of items to load for next time
				numberOfItems = currentIndex + bufferSize > dataLength ? dataLength - currentIndex : bufferSize;

				if (numberOfItems > 0) {
					// Update loader
					//@TODO jQuery template, change for better template system
					if (self._jQueryTmpl === true) {
						// Remove current loader to swap with new one
						if (loaderItem.parentNode) {
							loaderItem.parentNode.removeChild(loaderItem);
						}

						loaderItem = self.$tmpl.more.tmpl({"NUM_MORE_ITEMS": numberOfItems})[0];
					} else {
						options.listItemLoader(loaderItem, numberOfItems);
					}
					_bindLoader(self, loaderItem);

					// Add loader item or move it on end of the list if it's already appended.
					list.appendChild(loaderItem);
				} else {
					// Remove loader item node
					if (loaderItem.parentElement) {
						loaderItem.parentElement.removeChild(loaderItem);
						_unbindLoader(self, loaderItem);
					}
					loaderItem = null;
				}

				self._currentIndex = currentIndex;

				// Refresh widget
				self._refresh();
			};

			/**
			 * Configure widget in normal mode - using user defined method for item update.
			 * @method _configureNormal
			 * @param {Object} config Configuration options {@link ns.widget.mobile.ExtendableList#options}
			 * @protected
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype._configureNormal = function (config) {
				var options = this.options;

				if (util.isNumber(config.dataLength)) {
					options.dataLength = config.dataLength;
				}

				if (util.isNumber(config.bufferSize)) {
					options.bufferSize = config.bufferSize;
				}

				if (typeof config.listItemLoader === "function") {
					options.listItemLoader = config.listItemLoader;
				}

				if (typeof config.listItemUpdater === "function") {
					options.listItemUpdater = config.listItemUpdater;
				}
			};

			//@TODO jQuery template, change for better template system
			/**
			 * Configure widget in jQuery Template mode and grab template.
			 * Probably this method will be deprecated in future
			 * due to change for better template system.
			 * @method _configureTemplate
			 * @param {Object} config Configuration options {@link ns.widget.mobile.ExtendableList#options}
			 * @protected
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype._configureTemplate = function (config) {
				var self = this,
					$tmpl = self.$tmpl,
					options = self.options;

				// Set jQueryTmpl mode
				//@TODO jQuery template, change to better template system
				self._jQueryTmpl = true;

				copyAliases(self, config);

				// Assign templates
				// NOTE: jQuery is used here!
				$tmpl.item = $("#" + options.template);
				$tmpl.more = $("#" + options.loadmore);

				self._configureNormal(config);
			};


			/**
			 * Creates Extendable List with provided options. For more information of usage please check HTML Examples section.
			 *
			 *    @example
			 *    <script>
			 *        var widget = tau.widget.ExtendableList(document.getElementById("widgetIdSelector")),
			 *            config = {
			 *				// Create with custom list item updater
			 *				listItemUpdater: function (processedIndex, listItem) {
			 *					var data = JSON_DATA[processedIndex];
			 *					listItem.textContent = data.NAME;
			 *				},
			 *				bufferSize: 20,
			 *				dataLength: 500
			 *			};
			 *
			 *        widget.create();
			 *
			 *        // or using jQuery Mobile
			 *
			 *        $( "#widgetIdSelector" ).extendablelist( "create", config );
			 *    </script>
			 *
			 * @method create
			 * @param {Object} config Configuration options {@link ns.widget.mobile.ExtendableList#options}
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype.create = function (config) {
				var self = this,
					options = self.options;

				if (!config) {
					config = options;
				}

				self._destroy();

				//@TODO jQuery template, change for better template system
				if (config.template || options.template) {
					self._configureTemplate(config);
				} else {
					copyAliases(self);
					self._configureNormal(config);
				}

				// Make sure, that buffer size is not bigger than number of provided records
				if (options.dataLength < options.bufferSize) {
					options.bufferSize = options.dataLength - 1;
				}

				// Make sure that buffer size has at least one element
				if (options.bufferSize < 1) {
					options.bufferSize = 1;
				}

				// Build first part of list
				self._buildList();
			};

			/**
			 * Initialize widget on an element.
			 * @method _init
			 * @param {HTMLElement} element Widget's element
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._init = function (element) {
				var self = this;

				// Set current index to first element
				self._currentIndex = 0;

				// Assign variables to members
				self.element = element;
			};

			/**
			 * Refresh a ExtendableList list elements.
			 *
			 * This method should be called after are manually change in HTML attributes of widget DOM structure.
			 *
			 * This method is called automatically after extending list with new list positions.
			 *
			 *    @example
			 *    <script>
			 *        var widget = tau.widget.ExtendableList(document.getElementById("widgetIdSelector"));
			 *        widget.refresh();
			 *
			 *        // or
			 *
			 *        $( "#widgetIdSelector" ).extendablelist( "refresh" );
			 *    </script>
			 *
			 * @method refresh
			 * @param {boolean} [create=false] Sets create flag to refresh Listview in create mode. For more
			 * details check {@link ns.widget.mobile.Listview#refresh}.
			 * @chainable
			 * @member ns.widget.mobile.ExtendableList
			 */

			/**
			 * Refresh list
			 * @method _refresh
			 * @param {boolean} [create=false] Sets create flag to refresh Listview in create mode. For more
			 * details check {@link ns.widget.mobile.Listview#refresh}.
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._refresh = function (create) {
				// Create not built widgets
				engine.createWidgets(this.element);
				// Calling NOT overridden parent's method
				this._refreshItems(this.element, !!create);
			};

			/**
			 * Binds ExtendableList events
			 * @method _bindEvents
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._bindEvents = function () {
				var self = this;

				_bindLoader(self, self.element.lastElementChild);
			};

			/**
			 * Cleans widget's resources and removes all child elements.
			 *
			 *    @example
			 *    var widget = tau.widget.ExtendableList(document.getElementById("widgetIdSelector"));
			 *    widget.destroy();
			 *
			 *    // or using jQuery Mobile
			 *
			 *    $( "#widgetIdSelector" ).extendablelist( "destroy" );
			 * @method destroy
			 * @member ns.widget.mobile.ExtendableList
			 */

			/**
			 * @method _destroy
			 * @member ns.widget.mobile.ExtendableList
			 * @protected
			 */
			prototype._destroy = function () {
				var self = this,
					element = self.element,
					listItem,
					loaderItem = element.lastElementChild;

				_unbindLoader(self, loaderItem);

				//Remove li elements.
				while (element.firstElementChild) {
					listItem = element.firstElementChild;
					listItem = element.firstElementChild;
					element.removeChild(listItem);
				}
				self._currentIndex = 0;

			};

			/**
			 * Recreates widget with new data set and resets list item updater. This function is used only in jQuery Template mode.
			 * This function is still available to keep Web UI Framework compatibility and will be removed with new version of TAU
			 *
			 *    @example
			 *    <script>
			 *        var widget = tau.widget.ExtendableList(document.getElementById("widgetIdSelector")),
			 *        // loadData should return an array.
			 *        newDataSource = loadData() || [];
			 *
			 *        widget.recreate(newDataSource);
			 *
			 *        // or using jQuery Mobile
			 *
			 *        $( "#widgetIdSelector" ).extendablelist( "recreate", newDataSource );
			 *    </script>
			 *
			 * @method recreate
			 * @param {Array} newDataSource An array with new records for displayed list.
			 * @deprecated 2.3
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype.recreate = function (newDataSource) {
				return this.create({
					itemData: function (idx) {
						return newDataSource[idx];
					},
					numitemdata: newDataSource.length
				});
			};


			/**
			 * Sets list item updater function. List item updater function is called for every processed list element.
			 * There are two types of updater function. If there is **not** used jQuery Template mode updater should takes
			 * two arguments (processed index, list item element). otherwise function should return object and takes
			 * only one argument(processed index). Please check examples for details.
			 *
			 * @method _setListItemUpdater
			 * @param {HTMLElement} element Widget's HTML element
			 * @param {Function} updateFunction Function reference.
			 * @protected
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype._setListItemUpdater = function (element, updateFunction) {
				this.options.listItemUpdater = updateFunction;
			};

			/**
			 * Sets list item loader function. List item loader is always called after adding items process is finished. Please check examples for details.
			 * @method _setListItemLoader
			 * @param {HTMLElement} element Widget's HTML element
			 * @param {Function} loadFunction Function reference.
			 * @protected
			 * @member ns.widget.mobile.ExtendableList
			 */
			prototype._setListItemLoader = function (element, loadFunction) {
				this.options.listItemLoader = loadFunction;
			};

			ExtendableList.classes = classes;

			// Assign prototype
			ExtendableList.prototype = prototype;

			// definition
			ns.widget.mobile.ExtendableList = ExtendableList;

			engine.defineWidget(
				"ExtendableList",
				"[data-role='extendablelist'], .ui-extendablelist",
				["recreate", "create"],
				ExtendableList,
				"tizen"
			);


			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * #Notification widget
 * The Notification widget shows a popup on the screen to provide notifications.
 *
 * ##Default selectors
 * In all elements with _data-role=notification_ or with _ui-notification_ CSS class. Use _p_ tag for messages and _img_ tag for icon.
 *
 * ##Manual constructor
 * For manual creation of notification widget you can use constructor of widget:
 *
 *        @example
 *        <!-- Widget structure -->
 *        <div data-role="notification" id="notification" data-type="smallpopup">
 *            <p>Line of message</p>
 *        </div>
 *        <script>
 *            var notification = tau.widget.Notification(document.getElementById("notification"));
 *        </script>
 *
 * If jQuery library is loaded, this method can be used:
 *
 *        @example
 *        <!-- Widget structure -->
 *        <div data-role="notification" id="notification" data-type="smallpopup">
 *            <p>Line of message</p>
 *        </div>
 *        <script>
 *            var notification = $("#notification").notification();
 *        </script>
 *
 * ##HTML Examples
 *
 * ###Create notification smallpopup
 * Smallpopup has only one line of message and is positioned to the bottom of the active page. It's default type of notification widget.
 *
 * Running example in pure JavaScript:
 *
 *        @example
 *        <!-- Widget structure -->
 *        <div data-role="notification" id="notification" data-type="smallpopup">
 *            <p>Line of message</p>
 *        </div>
 *        <script>
 *            // Get widget instance or create new instance if widget not exists.
 *            var notification = tau.widget.Notification(document.getElementById("notification"));
 *            // Open notification
 *            notification.open();
 *        </script>
 *
 * If jQuery library is loaded, this method can be used:
 *
 *        @example
 *        <!-- Widget structure -->
 *        <div data-role="notification" id="notification" data-type="smallpopup">
 *            <p>Line of message</p>
 *        </div>
 *        <script>
 *            // Open widget using jQuery notation
 *            $( "#notification" ).notification( "open" )
 *        </script>
 *
 * ###Create notification ticker
 * Notification ticker has maximum two lines of message, other messages will be hidden. Additionally you can set an icon. Notification ticker is default positioned to the top of the page.
 *
 * Running example in pure JavaScript:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker">
 *            <p>First line of message</p>
 *            <p>Second line of message</p>
 *        </div>
 *        <script>
 *            // Get widget instance or create new instance if widget not exists.
 *            var notification = tau.widget.Notification(document.getElementById("notification"));
 *            // Open notification
 *            notification.open();
 *        </script>
 *
 * If jQuery library is loaded, this method can be used:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker">
 *            <p>First line of message</p>
 *            <p>Second line of message</p>
 *        </div>
 *        <script>
 *            // Open widget using jQuery notation
 *            $( "#notification" ).notification( "open" )
 *        </script>
 *
 * ###Create notification wih interval
 * Interval defines time to showing notification widget, after this it will close automatically. Values of _data-interval_ is a positive **number of miliseconds**, e.g. _data-interval="2000"_ (sets to close widget after 2 seconds). Otherwise widget will show infinietely.
 *
 * Running example in pure JavaScript:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker" data-interval="4000">
 *            <img src="icon.png">
 *            <p>I will close in 4* seconds!</p>
 *            <p>* starts counting from widget opening</p>
 *        </div>
 *        <script>
 *            // Get widget instance or create new instance if widget not exists.
 *            var notification = tau.widget.Notification(document.getElementById("notification"));
 *            // Open notification
 *            notification.open();
 *        </script>
 *
 * If jQuery library is loaded, this method can be used:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker" data-interval="4000">
 *            <img src="icon.png">
 *            <p>I will close in 4* seconds!</p>
 *            <p>* starts counting from widget opening</p>
 *        </div>
 *        <script>
 *            // Open widget using jQuery notation
 *            $( "#notification" ).notification( "open" )
 *        </script>
 *
 * ###Create notification ticker with icon
 * !!!Icon is only supported with notification ticker.!!!
 *
 * Running example in pure JavaScript:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker">
 *            <img src="icon.png">
 *            <p>First line of message</p>
 *            <p>Second line of message</p>
 *        </div>
 *        <script>
 *            // Open notification
 *            notification.open();
 *        </script>
 *
 * If jQuery library is loaded, this method can be used:
 *
 *        @example
 *        <div data-role="notification" id="notification" data-type="ticker">
 *            <img src="icon.png">
 *            <p>First line of message</p>
 *            <p>Second line of message</p>
 *        </div>
 *        <script>
 *            // Open widget using jQuery notation
 *            $( "#notification" ).notification( "open" )
 *        </script>
 *
 * @class ns.widget.mobile.Notification
 * @extends ns.widget.mobile.BaseWidgetMobile
 */
(function (document, ns) {
	"use strict";
				/**
			 * {Object} Widget Alias for {@link ns.widget.mobile.BaseWidgetMobile}
			 * @member ns.widget.mobile.Notification
			 * @private
			 */
			var BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * {Object} Widget Alias for {@link ns.widget.core.Page}
				 * @member ns.widget.Notification
				 * @private
				 */
				Page = ns.widget.core.Page,
				/**
				 * @property {Object} engine Alias for class ns.engine
				 * @member ns.widget.mobile.Notification
				 * @private
				 */
				engine = ns.engine,
				/**
				 * @property {Object} selectors Alias for class ns.selectors
				 * @member ns.widget.mobile.Notification
				 * @private
				 */
				selectors = ns.util.selectors,
				doms = ns.util.DOM,

				/**
				 * Alias for class ns.widget.mobile.Notification
				 * @method Notification
				 * @member ns.widget.mobile.Notification
				 * @private
				 */
				Notification = function () {

					/**
					 * @property {boolean} _eventsAdded Flag that the widget was binded with events
					 * @member ns.widget.mobile.Notification
					 * @private
					 */
					this._eventsAdded = false;

					/**
					 * @property {Object} _ui Holds all needed UI HTMLElements
					 * @member ns.widget.mobile.Notification
					 * @protected
					 */
					this._ui = {
						/**
						 * @property {HTMLElement} _ui.wrapper Widgets content wrapper
						 * @member ns.widget.mobile.Notification
						 * @protected
						 */
						wrapper: null,

						/**
						 * @property {NodeList} _ui.iconImg Widgets icons
						 * @member ns.widget.mobile.Notification
						 * @protected
						 */
						iconImg: null,

						/**
						 * @property {NodeList} _ui.texts Widgets texts
						 * @member ns.widget.mobile.Notification
						 * @protected
						 */
						texts: []
					};

					/**
					 * @property {number} interval Widgets interval
					 * @member ns.widget.mobile.Notification
					 * @protected
					 */
					this.interval = null;

					/**
					 * @property {boolean} running Widget running status
					 * @member ns.widget.mobile.Notification
					 * @protected
					 */
					this.running = false;

					/**
					 * Widget options
					 * @property {Object} options
					 * @property {"smallpopup"|"ticker"} [options.type="smallpopup"] type of widget. Allowed types: <b>smallpopup</b> or <b>ticker</b>.
					 * @property {number} [interval=0] interval value in milliseconds of widget. 0 - show widget infinitely
					 * @member ns.widget.mobile.Notification
					 * @protected
					 */
					this.options = {
						type: "smallpopup",
						interval: 0
					};
				};

			Notification.prototype = new BaseWidget();

			/**
			 * Dictionary for notification related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.Notification
			 * @static
			 */
			Notification.classes = {
				uiTicker: "ui-ticker",
				uiTickerText1Bg: "ui-ticker-text1-bg",
				uiTickerText2Bg: "ui-ticker-text2-bg",
				uiTickerIcon: "ui-ticker-icon",
				uiSmallpopup: "ui-smallpopup",
				uiSmallpopupTextBg: "ui-smallpopup-text-bg",
				uiTickerBtn: "ui-ticker-btn",
				uiNotificationFix: "fix",
				uiNotificationShow: "show",
				uiNotificationHide: "hide"
			};

			/**
			 * Build structure of notification widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._build = function (element) {
				var wrapperTag = "div",
					textTag = "p",
					options = this.options,
					classes = Notification.classes,
					uiElements = this._ui,
					notifyBtnWrapper,
					notifyWrapper,
					closeButton,
					nodeList,
					texts,
					i,
					l;

				//Set options
				options.type = element.getAttribute("data-type") || options.type;

				//Wrap it!
				notifyWrapper = document.createElement(wrapperTag);
				uiElements.wrapper = notifyWrapper;

				nodeList = element.childNodes;
				while (nodeList.length > 0) {
					notifyWrapper.appendChild(nodeList[0]);
				}

				//Get texts
				texts = notifyWrapper.getElementsByTagName(textTag);

				//Add elements if is lower than 2
				l = texts.length;
				for (i = l; i < 2; i++) {
					notifyWrapper.appendChild(document.createElement(textTag));
				}

				//Hide not visible elements
				l = texts.length; //Update length
				for (i = 2; i < l; i++) {
					texts[i].style.display = "none";
				}

				if (options.type === "ticker") {
					//Create elements
					notifyBtnWrapper = document.createElement(wrapperTag);
					closeButton = document.createElement(wrapperTag);

					//Create skeleton
					notifyBtnWrapper.appendChild(closeButton);
					notifyWrapper.appendChild(notifyBtnWrapper);

					//Add classes
					notifyWrapper.className = classes.uiTicker;
					notifyBtnWrapper.className = classes.uiTickerBtn;

					//Instance Button widget
					closeButton.textContent = "Close";
					engine.instanceWidget(closeButton, "Button", {
						inline: true
					});

					//Add clases to elements
					texts[0].classList.add(classes.uiTickerText1Bg);
					texts[1].classList.add(classes.uiTickerText2Bg);

				} else {
					//Add classes
					notifyWrapper.className = classes.uiSmallpopup;

					//Add classes to element and hide second element
					texts[0].classList.add(classes.uiSmallpopupTextBg);
					texts[1].style.display = "none";
				}
				element.appendChild(notifyWrapper);
				uiElements.texts = texts;
				return element;
			};

			/**
			 * Init widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._init = function (element) {
				var options = this.options,
					classes = Notification.classes,
					uiElements = this._ui,
					iconImg,
					iconImgLength,
					wrapper,
					i;

				//Set widget wrapper
				uiElements.wrapper = element.firstElementChild;
				wrapper = uiElements.wrapper;

				//Set texts
				uiElements.texts[0] = wrapper.getElementsByClassName(classes.uiTickerText1Bg)[0];
				uiElements.texts[1] = wrapper.getElementsByClassName(classes.uiTickerText2Bg)[0];

				//Get icons
				iconImg = element.getElementsByTagName("img");
				iconImgLength = iconImg.length;
				for (i = 0; i < iconImgLength; i++) {
					iconImg[i].classList.add(classes.uiTickerIcon);
					//Hide unused icons
					if (i > 1) {
						iconImg[i].style.display = "none";
					}
				}
				uiElements.iconImg = iconImg;

				//fix for compare tests
				this.type = options.type;
			};

			/**
			 * Bind events to widget
			 * @method _bindEvents
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._bindEvents = function (element) {
				if (!this._eventsAdded) {
					// Is it needed, that closeButton should has click event binded with self.close() too?
					element.addEventListener("vmouseup", this.close.bind(this), true);
					this._eventsAdded = true;
				}
			};

			/**
			 * Enable to show notification on screen. This method removes __display: none__ style from notification element.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <!-- Widget structure -->
			 *    <div data-role="notification" id="notification" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *
			 *    <script>
			 *        // Get widget instance or create new instance if widget not exists.
			 *        var notification = tau.widget.Notification(document.getElementById("notification"));
			 *
			 *        // Make it enabled
			 *        notification.enable();
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <!-- Widget structure -->
			 *    <div data-role="notification" id="notification" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *
			 *    <script>
			 *        // Make it enabled
			 *        $( "#notification" ).notification( "enable" );
			 *    </script>
			 *
			 * @method enable
			 * @member ns.widget.mobile.Notification
			 */

			/**
			 * @method _enable
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._enable = function () {
				this._ui.wrapper.style.display = "";
			};

			/**
			 * Disable notification. This method adds display:none style to notification element.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <!-- Widget structure -->
			 *    <div data-role="notification" id="notification" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *
			 *    <script>
			 *        // Get widget instance or create new instance if widget not exists.
			 *        var notification = tau.widget.Notification(document.getElementById("notification"));
			 *
			 *        // Make it disabled
			 *        notification.disable();
			 *    </script>
			 *
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <!-- Widget structure -->
			 *    <div data-role="notification" id="notification" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *
			 *    <script>
			 *        // Make it disabled
			 *        $( "#notification" ).notification( "disable" );
			 *    </script>
			 *
			 * @method disable
			 * @member ns.widget.mobile.Notification
			 *
			 */

			/**
			 * @method _disable
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._disable = function () {
				this._ui.wrapper.style.display = "none";
			};

			/**
			 * Refresh a notification widget and resets interval if it was set before.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector"));
			 *        notification.refresh();
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        $("#notificationSelector").notification("refresh");
			 *    </script>
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.Notification
			 */

			/**
			 * Refresh notification
			 * @method _refresh
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._refresh = function () {
				var wrapperClassList = this._ui.wrapper.classList,
					classes = Notification.classes;

				wrapperClassList.add(classes.uiNotificationFix);
				wrapperClassList.remove(classes.uiNotificationHide);
				wrapperClassList.remove(classes.uiNotificationShow);
				this._setCloseInterval();
			};

			/**
			 * Set widget position.
			 * @method _positionWidget
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._positionWidget = function () {
				var pages = document.body.getElementsByClassName(Page.classes.uiPageActive),
					footers,
					footerHeight = 0,
					pageWidth = 0,
					wrapper = this._ui.wrapper,
					wrapperStyle = wrapper.style,
					wrapperWidth = 0;

				if (typeof pages[0] === "object") {
					footers = selectors.getChildrenByClass(pages[0], "ui-footer");
					pageWidth = pages[0].offsetWidth;
					if (typeof footers[0] === "object") {
						footerHeight = footers[0].offsetHeight;
					}
				}
				wrapperWidth = doms.getCSSProperty(wrapper, "width", 0, "float") + doms.getCSSProperty(wrapper, "padding-left", 0, "float") + doms.getCSSProperty(wrapper, "padding-right", 0, "float");
				wrapperStyle.left = (pageWidth - wrapperWidth) / 2 + "px";
				wrapperStyle.bottom = footerHeight + (footerHeight > 0 ? "px" : "");
			};

			/**
			 * Open widget to show notification.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector"));
			 *        notification.open();
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        $("#notificationSelector").notification("open");
			 *    </script>
			 *
			 * @method open
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype.open = function () {
				var wrapperClassList = this._ui.wrapper.classList,
					classes = Notification.classes;

				if (this.running === true) {
					this.refresh();
					return;
				}
				wrapperClassList.add(classes.uiNotificationShow);
				wrapperClassList.remove(classes.uiNotificationHide);
				wrapperClassList.remove(classes.uiNotificationFix);

				if (this.options.type !== "ticker") {
					this._positionWidget();
				}

				this._setCloseInterval();
				this.running = true;
			};

			/**
			 * Close opened widget to hide notification.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector"));
			 *        notification.close();
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        // or using jQuery
			 *        $("#notificationSelector").notification("close");
			 *    </script>
			 *
			 * @method close
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype.close = function () {
				var wrapperClassList = this._ui.wrapper.classList,
					classes = Notification.classes;

				if (this.running !== true) {
					return;
				}

				wrapperClassList.add(classes.uiNotificationHide);
				wrapperClassList.remove(classes.uiNotificationShow);
				wrapperClassList.remove(classes.uiNotificationFix);
				clearInterval(this.interval);
				this.running = false;
			};

			/**
			 * Creates icon or changes existing icon to new one. This method resets CSS classes on image element.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector"));
			 *        notification.icon("some-image.png");
			 *
			 *        // or using jQuery
			 *        $( "#notificationSelector" ).notification( "icon", "some-image.png" );
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="smallpopup">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        $( "#notificationSelector" ).notification( "icon", "some-image.png" );
			 *    </script>
			 *
			 * @method icon
			 * @param {string} src icon source URL
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype.icon = function (src) {
				var uiElements = this._ui,
					iconImg = uiElements.iconImg,
					classes = Notification.classes;

				if (src) {
					//Remove all elements from NodeList
					while (iconImg.length > 0 && iconImg[0].remove) {
						iconImg[0].remove();
					}

					iconImg[0] = document.createElement("img");
					iconImg[0].className = classes.uiTickerIcon;
					iconImg[0].setAttribute("src", src);

					//Append icon
					uiElements.wrapper.appendChild(iconImg[0]);
					uiElements.iconImg = iconImg;
				}
			};

			/**
			 * Set widget texts. If no text is given, method returns notification text as an array.
			 *
			 * Getting current text of notification
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *        <p>Second line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector")),
			 *            widgetText;
			 *        widgetText = notification.text();
			 *
			 *        alert(widgetText);
			 *        // will alert "Line of message,Second line of message"
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *        <p>Second line of message</p>
			 *    </div>
			 *    <script>
			 *        var widgetText;
			 *
			 *        // or using jQuery
			 *        widgetText = $("#notificationSelector").notification("text");
			 *
			 *        alert(widgetText);
			 *        // will alert "Line of message,Second line of message"
			 *    </script>
			 *
			 * Setting text of notification.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *        <p>Second line of message</p>
			 *    </div>
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector"));
			 *
			 *        notification.text("This is a new Notification!", "This is an example");
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <div data-role="notification" id="notificationSelector" data-type="ticker">
			 *        <p>Line of message</p>
			 *    </div>
			 *    <script>
			 *        $( "#notificationSelector" ).notification( "text", "This is new Notification!", "This is an example" );
			 *    </script>
			 *
			 * @method text
			 * @param {string} text0 first line of text
			 * @param {string} text1 second line of text
			 * @member ns.widget.mobile.Notification
			 * @return {?Array} widget text if no param given
			 */
			Notification.prototype.text = function (text0, text1) {

				if (text0 === undefined && text1 === undefined) {
					return this._getText();
				}

				this._setText(text0, text1);
				return null;
			};

			/**
			 * Set widgets texts
			 * @method _setText
			 * @param {string} text0 first line of text
			 * @param {string} text1 second line of text
			 * @private
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._setText = function (text0, text1) {
				if (text0 !== undefined) {
					this._ui.texts[0].textContent = text0;
				}
				if (text1 !== undefined) {
					this._ui.texts[1].textContent = text1;
				}
			};

			/**
			 * Get widget texts
			 * @method _getText
			 * @protected
			 * @member ns.widget.mobile.Notification
			 * @return {Array} widget texts
			 */
			Notification.prototype._getText = function () {
				var ui = this._ui,
					texts = [null, null];

				if (this.options.type === "ticker") {
					texts[0] = ui.texts[0] && ui.texts[0].textContent;
					texts[1] = ui.texts[1] && ui.texts[1].textContent;
				} else {
					texts[0] = ui.texts[0] && ui.texts[0].textContent;
				}

				return texts;
			};

			/**
			 * Sets interval
			 * @method _setCloseInterval
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._setCloseInterval = function () {
				//Clear current interval
				clearInterval(this.interval);

				if (this.options.interval > 0) {
					//Create new interval
					this.interval = setInterval(this.close.bind(this), this.options.interval);
				}
			};

			/**
			 * Removes notification.
			 * This will return the element back to its pre-init state.
			 *
			 * #####Running example in pure JavaScript:
			 *
			 *    @example
			 *    <script>
			 *        var notification = tau.widget.Notification(document.getElementById("notificationSelector")),
			 *        notification.destroy();
			 *    </script>
			 *
			 * #####If jQuery library is loaded, this method can be used:
			 *
			 *    @example
			 *    <script>
			 *        $( "#notificationSelector" ).notification( "destroy" );
			 *    </script>
			 *
			 * @method destroy
			 * @member ns.widget.mobile.Notification
			 */

			/**
			 * Destroy widget
			 * @method _destroy
			 * @param {?HTMLElement} element Base element for destroy widget
			 * @protected
			 * @member ns.widget.mobile.Notification
			 */
			Notification.prototype._destroy = function (element) {
				var wrapper = this._ui.wrapper,
					nodeList;

				if (element) {
					wrapper = element.firstChild;
				} else {
					element = this.element;
				}
				nodeList = wrapper.childNodes;
				while (nodeList.length > 0) {
					element.appendChild(nodeList[0]);
				}
				element.removeChild(wrapper);
			};

			// definition
			ns.widget.mobile.Notification = Notification;
			engine.defineWidget(
				"Notification",
				"[data-role='notification'], .ui-notification",
				["open", "close", "icon", "text"],
				Notification,
				"tizen"
			);
			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * #Autodividers extension for ListView Widget
 * The Autodividers widget extension automatically creates dividers for a ListView Widget.
 *
 * ## Default selectors
 * A list can be configured to automatically generate dividers for its items. This is done by adding the **data-autodividers="true"** attribute to the ListView element. This is similar to jQueryMobile version 1.2.0.
 *
 * ###HTML Examples
 *
 * To add an autodividers widget to the application, use the following code:
 *
 *      @example
 *      <ul data-role="listview" data-autodividers="true" id="listview-with-autodividers">
 *          <li><a href="#">Amy</a></li>
 *          <li><a href="#">Arabella</a></li>
 *          <li><a href="#">Barry</a></li>
 *      </ul>
 *
 * Autodividers is not independent widget, this is extension for [ListView widget](ns_widget_mobile_Listview.htm).
 *
 * ##Methods
 *
 * Listview with autodividers has interface to call methods the same as ListView widget. To call method use:
 *
 *      @example
 *      $("#listview-with-autodividers").listview("methodname", methodArgument1, methodArgument2, ...);
 *
 * @author Tomasz Lukawski <t.lukawski@samsung.com>
 * @class ns.widget.mobile.Listview.Autodividers
 * @since Tizen 2.0
 * @override ns.widget.mobile.Listview
 */
(function (document, ns) {
	"use strict";
				/**
			 * Local alias for ns.util.selectors
			 * @property {Object} selectors Alias for {@link ns.util.selectors}
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @static
			 * @private
			 */
			var selectors = ns.util.selectors,

				/**
				 * Local alias for ns.engine
				 * @property {Object} engine Alias for {@link ns.engine}
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				engine = ns.engine,

				/**
				 * Local alias for ns.util.DOM
				 * @property {Object} doms Alias for {@link ns.util.DOM}
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				doms = ns.util.DOM,

				/**
				 * Object contains handlers for listeners of "beforeRefreshListItems" event,
				 * Keys are [instance].id
				 * @property {Object} onBeforeRefreshListItems description
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				beforeRefreshListItemsHandlers = {},

				/**
				 * Handler method for event "beforerefreshitems"
				 * @method beforeRefreshListItems
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @param {ns.widget.mobile.Listview} listview instance of Listview.
				 * @param {HTMLUListElement|HTMLOListElement} element bound UList or OList HTMLElement
				 * @static
				 * @private
				 */
				beforeRefreshListItems = function beforeRefreshListItems(listview, element) {
					if (listview.options.autodividers) {
						listview._addAutodividers(element);
					}
				},

				/**
				 * Method finding text in list element and return first letter
				 * @method findFirstLetter
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @param {HTMLUListElement|HTMLOListElement} listElement bound UList or OList HTMLElement
				 * @return {null|string} return "null" if doesn't text found
				 * @static
				 * @private
				 */
				findFirstLetter = function (listElement) {
					// look for the text in the given element
					var text = listElement.textContent || null;

					if (!text) {
						return null;
					}
					// create the text for the divider (first uppercased letter)
					text = text.trim().slice(0, 1).toUpperCase();
					return text;
				},

				/**
				 * Method removes list dividers from list.
				 * @method removeDividers
				 * @param {HTMLUListElement|HTMLOListElement} list bound UList or OList HTMLElement
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				removeDividers = function removeDividers(list) {
					var liCollection = selectors.getChildrenBySelector(list, "li[data-role='list-divider']"),
						i,
						len = liCollection.length;

					for (i = 0; i < len; i++) {
						list.removeChild(liCollection[i]);
					}
				},

				/**
				 * Insert list dividers into list.
				 * @method insertAutodividers
				 * @param {ns.widget.mobile.Listview} self
				 * @param {HTMLUListElement|HTMLOListElement} list bound UList or OList HTMLElement
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				insertAutodividers = function insertAutodividers(self, list) {
					/*
					 * @property {NodeList} liCollection collection of HTMLLIElements
					 */
					var liCollection = selectors.getChildrenByTag(list, "li"),
						/*
						 * @property {HTMLLIElement} li HTMLLIElement
						 */
						li,
						/*
						 * @property {string|null} lastDividerText Text in last divider for comparison
						 */
						lastDividerText = null,
						/*
						 * @property {string|null} dividerText Text found in LI element
						 */
						dividerText,
						/*
						 * @property {ns.widget.listdivider} divider Instance of divider widget
						 */
						divider,
						/*
						 * @property {Number} i Counter of loop
						 */
						i,
						/*
						 * @property {Number} len Length of collection of HTMLLIElements
						 */
						len,
						optionFolded = doms.getNSData(list, "folded");

					for (i = 0, len = liCollection.length; i < len; i++) {
						li = liCollection[i];
						dividerText = self.options.autodividersSelector(li);
						if (dividerText && lastDividerText !== dividerText) {
							divider = document.createElement("li");
							divider.appendChild(document.createTextNode(dividerText));
							divider.setAttribute("data-role", "list-divider");
							li.parentNode.insertBefore(divider, li);
							engine.instanceWidget(divider, "ListDivider", {"folded": optionFolded});
						}
						lastDividerText = dividerText;
					}
				},

				/**
				 * Major method of autodividers extension.
				 * It removes old and inserts new dividers.
				 * @method replaceDividers
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @param {ns.widget.mobile.Listview} self
				 * @param {HTMLUListElement|HTMLOListElement} list bound UList or OList HTMLElement.
				 * @static
				 * @private
				 */
				replaceDividers = function replaceDividers(self, list) {
					// remove dividers if exists;
					removeDividers(list);
					// insert new dividers;
					insertAutodividers(self, list);
				},

				/**
				 * @property {Function} Listview Alias for class ns.widget.mobile.Listview
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @static
				 * @private
				 */
				Listview = ns.widget.mobile.Listview,

				/**
				 * Backup of _build methods for replacing it
				 * @method parentBuild
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @private
				 */
				parentBuild = Listview.prototype._build,

				/**
				 * Backup of _configure methods for replacing it
				 * @method parentConfigure
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @private
				 */
				parentConfigure = Listview.prototype._configure,

				/**
				 * Backup of _init methods for replacing it
				 * @method parentInit
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @private
				 */
				parentInit = Listview.prototype._init,

				/**
				 * Backup of _destroy methods for replacing it
				 * @method parentDestroy
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @private
				 */
				parentDestroy = Listview.prototype._destroy,

				/**
				 * Initializing autodividers on Listview instance
				 * @method initializeAutodividers
				 * @member ns.widget.mobile.Listview.Autodividers
				 * @param {ns.widget.mobile.Listview} self listview instance.
				 * @param {HTMLUListElement|HTMLOListElement} element bound UList or OList HTMLElement.
				 * @static
				 * @private
				 */
				initializeAutodividers = function (self, element) {
					var onBeforeRefreshListItems = beforeRefreshListItems.bind(null, self, element);

					beforeRefreshListItemsHandlers[self.id] = onBeforeRefreshListItems;
					/**
					 * Options object
					 * @property {Object} options
					 * @property {boolean} [options.autodividers=false] This option enables creating autodividers on ListView
					 * @member ns.widget.mobile.Listview.Autodividers
					 */
					self.options.autodividers = false;
					self._getCreateOptions(element);
					element.addEventListener("beforerefreshitems",
						onBeforeRefreshListItems);
				};

			/**
			 * Rebuilding html list element
			 * @method _addAutodividers
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @param {HTMLUListElement|HTMLOListElement} list bound UList or OList HTMLElement.
			 * @protected
			 * @instance
			 */
			Listview.prototype._addAutodividers = function (list) {
				replaceDividers.call(null, this, list);
			};

			/**
			 * @method _setAutodividers
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @param {HTMLUListElement|HTMLOListElement} element bound UList or OList HTMLElement.
			 * @param {boolean} enabled
			 * @return {boolean}
			 * @instance
			 * @protected
			 */
			Listview.prototype._setAutodividers = function (element, enabled) {
				var options = this.options;

				if (options.autodividers === enabled) {
					return false;
				}
				// If autodividers option is changing from "true" to "false"
				// we need remove older dividers;
				if (options.autodividers && !enabled) {
					removeDividers(element);
				}
				options.autodividers = enabled;
				element.setAttribute("data-autodividers", enabled);
				if (enabled) {
					this.refresh();
				}
				return true;
			};

			/**
			 * @method _configure
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @instance
			 * @protected
			 */
			Listview.prototype._configure = function () {
				var options;

				if (typeof parentConfigure === "function") {
					parentConfigure.call(this);
				}

				this.options = this.options || {};
				options = this.options;
				/** @expose */
				options.autodividers = false;
				/** @expose */
				options.autodividersSelector = findFirstLetter;
			};

			/**
			 * Initialize autodividers features on Listview
			 * Override method "_build" from Listview & call the protected "_build"
			 * @method _build
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @param {HTMLUListElement|HTMLOListElement} element bound UList or OList HTMLElement.
			 * @return {HTMLUListElement|HTMLOListElement}
			 * @instance
			 * @protected
			 */
			Listview.prototype._build = function (element) {
				initializeAutodividers(this, element);
				return parentBuild.call(this, element);
			};

			/**
			 * Initialize autodividers features on Listview
			 * Override method "_init" from Listview & call the protected "_init" or "init"
			 * @method _init
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @param {HTMLUListElement|HTMLOListElement} element bound UList or OList HTMLElement.
			 * @return {HTMLUListElement|HTMLOListElement}
			 * @instance
			 * @protected
			 */

			Listview.prototype._init = function (element) {
				var autodividers = this.options.autodividers;

				if (autodividers === undefined || autodividers === null) {
					initializeAutodividers(this, element);
				}
				return (typeof parentInit === "function") ?
					parentInit.call(this, element) :
					element;
			};

			/**
			 * Removing and cleaning autodividers extension
			 * Override method "_destroy" from Listview & call the protected "_destroy"
			 * @method _destroy
			 * @member ns.widget.mobile.Listview.Autodividers
			 * @instance
			 * @protected
			 */
			Listview.prototype._destroy = function _destroy() {
				var element = this.element;

				element.removeEventListener("beforerefreshitems",
					beforeRefreshListItemsHandlers[this.id]);
				this.options.autodividers = null;
				// delete attribute
				element.removeAttribute("data-autodividers");
				// recovery previous version of protected methods;
				this._build = parentBuild;
				this._init = parentInit;
				this._destroy = parentDestroy;
				// call protected method from Listview;
				if (typeof parentDestroy === "function") {
					parentDestroy.call(this);
				}
			};
			}(window.document, ns));

/*global window, ns, define */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * ListDivider Widget for Support Backward Compatibility
 *
 * @class ns.widget.mobile.GroupIndex
 * @author Heeju Joo <heeju.joo@samsung.com>
 */
(function (document, ns) {
	"use strict";
				var BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * Alias for class {@link ns.engine}
				 * @property {Object} engine
				 * @member ns.widget.mobile.GroupIndex
				 * @private
				 * @static
				 */
				engine = ns.engine,
				/**
				 * Alias to ns.util.DOM
				 * @property {Object} dom
				 * @private
				 * @member ns.widget.mobile.GroupIndex
				 * @static
				 */
				DOM = ns.util.DOM,

				classes = {
					uiLiDivider: "ui-li-divider",
					uiDividerNormalLine: "ui-divider-normal-line"
				},

				ListDivider = function () {
					return this;
				};

			ListDivider.prototype = new BaseWidget();
			ListDivider.classes = classes;

			ListDivider.prototype._configure = function () {
				this.options = {
					style: "normal",
					folded: false,
					line: true
				};
			};

			ListDivider.prototype._build = function (element) {
				var options = this.options,
					classes = ListDivider.classes,
					classList = element.classList,
					elementWithLine;

				classList.add(classes.uiLiDivider);

				if (!options.style || options.style === "normal" || options.style === "check") {
					DOM.wrapInHTML(
						element.childNodes,
						"<span class='ui-divider-text'></span>"
					);

					if (options.folded === true) {
						DOM.wrapInHTML(
							element.childNodes,
							"<a href='#'></a>"
						);
					}

					if (options.line === true) {
						if (options.folded === true) {
							elementWithLine = element.firstChild;
						} else {
							elementWithLine = element;
						}
						if (elementWithLine) {
							elementWithLine.insertAdjacentHTML(
								"beforeend",
								"<span class='" + classes.uiDividerNormalLine + "'></span>"
							);
						}
					}
				}
				return element;
			};

			ListDivider.prototype._init = function (element) {
				element.setAttribute("role", "heading");
				element.setAttribute("tabindex", "0");

				return element;
			};

			ns.widget.mobile.ListDivider = ListDivider;
			engine.defineWidget(
				"ListDivider",
				"[data-role='list-divider'], .ui-list-divider",
				[],
				ListDivider,
				"mobile",
				true
			);
			}(window.document, ns));

/*global window, ns, define */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Expandable Alias for Collapsible Widget
 *
 * @class ns.widget.mobile.Collapsible
 * @author Hyeoncheol Choi <hc7.choi@samsung.com>
 */
(function (document, ns) {
	"use strict";
				var Expandable = ns.widget.mobile.Expandable,
				engine = ns.engine;

			ns.widget.mobile.Collapsible = Expandable;
			engine.defineWidget(
				"Collapsible",
				"[data-role='collapsible'], .ui-collapsible",
				["open", "close"],
				Expandable,
				"mobile"
			);

			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true */
/**
 * #Collapsible Set Widget
 * Collapsible Set Widget groups many Collapsible Widgets in one container.
 *
 * ##Default selectors
 * In default all elements with _data-role="collapsible-set"_ or class _.ui-collapsible-set_ are changed to collapsibleset widget.
 *
 * ##HTML Examples
 *
 * ###Create collapsibleset by data-role
 *
 *        @example
 *        <div data-role="collapsible-set">
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 1</h6>
 *                <div>Content</div>
 *            </div>
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 2</h6>
 *                <div>Content</div>
 *            </div>
 *        </div>
 *
 * ###Create collapsibleset by class
 *
 *        @example
 *        <div class="ui-collapsible-set">
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 1</h6>
 *                <div>Content</div>
 *            </div>
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 2</h6>
 *                <div>Content</div>
 *            </div>
 *        </div>
 *
 * ## Manual constructor
 * For manual creation of collapsibleset widget you can use constructor of widget:
 *
 *        @example
 *        <div id="collapsibleset">
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 1</h6>
 *                <div>Content</div>
 *            </div>
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 2</h6>
 *                <div>Content</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            var collapsibleset = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
 *        </script>
 *
 * If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div id="collapsibleset">
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 1</h6>
 *                <div>Content</div>
 *            </div>
 *            <div data-role="collapsible" data-inset="false">
 *                <h6>Collapsible head 2</h6>
 *                <div>Content</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            var collapsibleset = $("#collapsibleset").collapsibleset();
 *        </script>
 *
 *
 * @class ns.widget.mobile.CollapsibleSet
 * @extends ns.widget.BaseWidget
 * @author Marcin Jakuszko <m.jakuszko@samsung.com>
 */

(function (document, ns) {
	"use strict";
	
			/**
			 * @property {ns.engine} engine alias variable
			 * @private
			 * @static
			 */
			var engine = ns.engine,
				/**
				 * @property {ns.widget} widget alias variable
				 * @private
				 * @static
				 */
				widget = ns.widget,
				/**
				 * @property {ns.event} events alias variable
				 * @private
				 * @static
				 */
				events = ns.event,
				/**
				 * @property {ns.util.selectors} selectors alias variable
				 * @private
				 * @static
				 */
				selectors = ns.util.selectors,
				/**
				 * @property {ns.util.DOM} domUtils alias variable
				 * @private
				 * @static
				 */
				domUtils = ns.util.DOM,
				/**
				 * @property {Object} BaseWidget alias variable
				 * @private
				 * @static
				 */
				BaseWidget = widget.mobile.BaseWidgetMobile,
				Expandable = widget.mobile.Expandable,
				prototype = new BaseWidget(),

				CollapsibleSet = function () {
					/**
					 * CollapsibleSet widget options
					 * @property {Object} options
					 * @property {boolean} [options.inset=true] Determines if widget should be shown as inset.
					 * @property {boolean} [options.mini=false] Sets the size of the collapsibles to a more compact, mini version.
					 * @property {boolean} [options.collapsed=true] Determines if content should be collapsed on load.
					 * @property {?string} [options.collapsedIcon=null] Sets the icon for the headers of the collapsible containers when in a collapsed state.
					 * @property {?string} [options.expandedIcon=null] Sets the icon for the headers of the collapsible containers when in an expanded state.
					 * @member ns.widget.mobile.CollapsibleSet
					 */
					this.options = {
						inset: null,
						mini: null,
						collapsed: true,
						collapsedIcon: null,
						expandedIcon: null
					};

					this._eventHandlers = {};
				};

			/**
			 * Dictionary object containing commonly used wiget classes
			 * @property {Object} classes
			 * @static
			 * @readonly
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			CollapsibleSet.classes = {
				uiCollapsible: Expandable.classes.uiExpandable,
				uiCollapsibleSet: "ui-collapsible-set",
				uiCollapsibleHeading: Expandable.classes.uiExpandableHeading,
				uiCornerTop: "ui-corner-top",
				uiCornerBottom: "ui-corner-bottom",
				uiCollapsibleContent: Expandable.classes.uiExpandableContent
			};


			/**
			 * Dictionary object containing commonly used wiget attributes
			 * @property {Object} attributes
			 * @static
			 * @readonly
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			CollapsibleSet.attributes = {
				last: "collapsible-last"
			};

			/**
			 * Build widget structure
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			prototype._build = function (element) {
				element.classList.add(CollapsibleSet.classes.uiCollapsibleSet);
				return element;
			};


			// Set proper corners' style for elements inside widget
			// @method roundCollapsibleSetBoundaries
			// @param {Array} collapsiblesInSet
			// @private
			// @member ns.widget.mobile.CollapsibleSet
			function roundCollapsibleSetBoundaries(collapsiblesInSet) {
				var firstCollapsible = null,
					classes = null,
					dataAttributes = null,
					firstCollapsibleHeading = null,
					lastCollapsible = null,
					lastCollapsibleHeading = null,
					heading = null,
					headingClassList = null;

				if (collapsiblesInSet.length > 0) {

					firstCollapsible = collapsiblesInSet[0];
					classes = CollapsibleSet.classes;
					dataAttributes = CollapsibleSet.attributes;
					firstCollapsibleHeading = selectors.getChildrenByClass(firstCollapsible, classes.uiCollapsibleHeading)[0];

					lastCollapsible = collapsiblesInSet[collapsiblesInSet.length - 1];
					lastCollapsibleHeading = selectors.getChildrenByClass(lastCollapsible, classes.uiCollapsibleHeading)[0];

					//clean up borders
					collapsiblesInSet.forEach(function (collapsibleElement) {
						heading = selectors.getChildrenByClass(collapsibleElement, classes.uiCollapsibleHeading)[0],
						headingClassList = heading.classList;

						domUtils.removeNSData(collapsibleElement, dataAttributes.last);
						headingClassList.remove(classes.uiCornerBottom);
						headingClassList.remove(classes.uiCornerTop);
					});

					firstCollapsibleHeading.classList.add(classes.uiCornerTop);

					lastCollapsibleHeading.classList.add(classes.uiCornerBottom);
					domUtils.setNSData(lastCollapsible, dataAttributes.last, true);
				}
				return collapsiblesInSet;
			}

			//Handler function for expanding/collapsing widget
			//@method expandCollapseHandler
			//@param {HTMLElement} element
			//@param {Object} options
			//@param {Event} event
			//@private
			//@member ns.widget.mobile.CollapsibleSet
			function expandCollapseHandler(element, options, event) {
				var collapsible = event.target,
					isCollapse = event.type === "collapse",
					classes = CollapsibleSet.classes,
					dataAttributes = CollapsibleSet.attributes,
					firstCollapsible = element.firstChild,
					collapsibleHeading = selectors.getChildrenByClass(collapsible, classes.uiCollapsibleHeading)[0],
					collapsibleHeadingClassList = collapsibleHeading.classList,
					collapsibleContent = selectors.getChildrenByClass(collapsible, classes.uiCollapsibleContent)[0],
					collapsibleContentClassList = collapsibleContent.classList;

				if (domUtils.hasNSData(collapsible, dataAttributes.last) && !!options.inset) {
					if (isCollapse) {
						collapsibleHeadingClassList.add(classes.uiCornerBottom);
						collapsibleContentClassList.remove(classes.uiCornerBottom);
					} else {
						collapsibleHeadingClassList.remove(classes.uiCornerBottom);
						collapsibleContentClassList.add(classes.uiCornerBottom);
					}
				}

				if (!isCollapse) {
					while (firstCollapsible) {
						if (firstCollapsible.nodeType === 1 && firstCollapsible !== collapsible) {
							events.trigger(firstCollapsible, "collapse");
						}
						firstCollapsible = firstCollapsible.nextSibling;
					}
				}
			}

			/**
			 * Bind widget events
			 * @method _bindEvents
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			prototype._bindEvents = function (element) {
				var eventHandler = this._eventHandlers.expandCollapseHandler = expandCollapseHandler.bind(null, element, this.options);

				element.addEventListener("expand", eventHandler, true);
				element.addEventListener("collapse", eventHandler, true);

				return element;
			};

			/**
			 * Init widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			prototype._init = function (element) {
				var expanded = selectors.getChildrenBySelector(element, "[data-collapsed='false']"),
					expandedLength = expanded.length,
					i;

				this.refresh();

				for (i = 0; i < expandedLength; i++) {
					events.trigger(expanded[i], "expand");
				}

			};

			/**
			 * This method refreshes collapsibleset.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *            collapsiblesetWidget.refresh();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#collapsibleset").collapsibleset("refresh");
			 *        </script>
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Refresh structure
			 * @method _refresh
			 * @protected
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			prototype._refresh = function () {
				var element = this.element,
					collapsiblesInSet = selectors.getChildrenBySelector(element, "[data-role='collapsible']"),
					bareCollapsibles = selectors.getChildrenBySelector(element, ":not(.ui-collapsible)"),
					bareCollapsiblesLength = bareCollapsibles.length,
					i;

				for (i = 0; i < bareCollapsiblesLength; i++) {
					engine.instanceWidget(bareCollapsibles[i], "Collapsible");
				}

				roundCollapsibleSetBoundaries(collapsiblesInSet);

				return this;
			};

			/**
			 * Removes the collapsibleset functionality completely.
			 *
			 * This will return the element back to its pre-init state.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *            collapsiblesetWidget.destroy();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#collapsibleset").collapsibleset("destroy");
			 *        </script>
			 *
			 * @method destroy
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Destroy widget
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.CollapsibleSet
			 */
			prototype._destroy = function () {
				var element = this.element,
					eventHandler = this._eventHandlers.expandCollapseHandler;

				element.removeEventListener("expand", eventHandler, true);
				element.removeEventListener("collapse", eventHandler, true);
			};

			/**
			 * Get/Set options of the widget.
			 *
			 * This method can work in many context.
			 *
			 * If first argument is type of object them, method set values for options given in object. Keys of object are names of options and values from object are values to set.
			 *
			 * If you give only one string argument then method return value for given option.
			 *
			 * If you give two arguments and first argument will be a string then second argument will be intemperate as value to set.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset")),
			 *                value;
			 *
			 *            value = collapsiblesetWidget.option("mini"); // get value
			 *            collapsiblesetWidget.option("mini", true); // set value
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var value;
			 *
			 *            value = $("#collapsibleset").collapsibleset("option", "mini"); // get value
			 *            $("#collapsibleset").collapsibleset("option", "mini", true); // set value
			 *        </script>
			 *
			 * @method option
			 * @param {string|Object} [name] name of option
			 * @param {*} value value to set
			 * @member ns.widget.mobile.CollapsibleSet
			 * @return {*} return value of option or undefined if method is called in setter context
			 */

			/**
			 * The function "value" is not supported in this widget.
			 *
			 * @method value
			 * @chainable
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Disable the collapsibleset
			 *
			 * Method adds disabled attribute on collapsibleset and changes look of collapsibleset to disabled state.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *            collapsiblesetWidget.disable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#collapsibleset").collapsibleset("disable");
			 *        </script>
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Enable the collapsibleset
			 *
			 * Method removes disabled attribute on collapsibleset and changes look of collapsibleset to enabled state.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *            collapsiblesetWidget.enable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#collapsibleset").collapsibleset("enable");
			 *        </script>
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/*
			 * Trigger an event on widget's element.
			 *
			 *		@example
			 *		<div id="collapsibleset" data-role="collapsible-set">
			 *			<div data-role="collapsible" data-inset="false">
			 *				<h6>Collapsible head 1</h6>
			 *				<div>Content</div>
			 *			</div>
			 *			<div data-role="collapsible" data-inset="false">
			 *				<h6>Collapsible head 2</h6>
			 *				<div>Content</div>
			 *			</div>
			 *		</div>
			 *
			 *		<script>
			 *			var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *			collapsiblesetWidget.trigger("eventName");
			 *		</script>
			 *
			 * If jQuery is loaded:
			 *
			 *		@example
			 *		<div id="collapsibleset" data-role="collapsible-set">
			 *			<div data-role="collapsible" data-inset="false">
			 *				<h6>Collapsible head 1</h6>
			 *				<div>Content</div>
			 *			</div>
			 *			<div data-role="collapsible" data-inset="false">
			 *				<h6>Collapsible head 2</h6>
			 *				<div>Content</div>
			 *			</div>
			 *		</div>
			 *
			 *		<script>
			 *			$("#collapsibleset").collapsibleset("trigger", "eventName");
			 *		</script>
			 *
			 * @method trigger
			 * @param {string} eventName the name of event to trigger
			 * @param {?*} [data] additional object to be carried with the event
			 * @param {boolean} [bubbles=true] indicating whether the event bubbles up through the DOM or not
			 * @param {boolean} [cancelable=true] indicating whether the event is cancelable
			 * @return {boolean} false, if any callback invoked preventDefault on event object
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Add event listener to widget's element.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset"));
			 *            collapsiblesetWidget.on("eventName", function () {
			 *				console.log("Event fires");
			 *			});
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#collapsibleset").collapsibleset("on", "eventName", function () {
			 *				console.log("Event fires");
			 *			});
			 *        </script>
			 *
			 * @method on
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param tu addEventListener
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			/**
			 * Remove event listener to widget's element.
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var collapsiblesetWidget = tau.widget.CollapsibleSet(document.getElementById("collapsibleset")),
			 *                callback = function () {
			 *					console.log("Event fires");
			 *				};
			 *            // add callback on event "eventName"
			 *            collapsiblesetWidget.on("eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            collapsiblesetWidget.off("eventName", callback);
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="collapsibleset" data-role="collapsible-set">
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 1</h6>
			 *                <div>Content</div>
			 *            </div>
			 *            <div data-role="collapsible" data-inset="false">
			 *                <h6>Collapsible head 2</h6>
			 *                <div>Content</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var callback = function () {
			 *					console.log("Event fires");
			 *				};
			 *            // add callback on event "eventName"
			 *            $("#collapsibleset").collapsibleset("on", "eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            $("#collapsibleset").collapsibleset("off", "eventName", callback);
			 *        </script>
			 * @method off
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param tu addEventListener
			 * @member ns.widget.mobile.CollapsibleSet
			 */

			CollapsibleSet.prototype = prototype;

			// definition
			widget.mobile.CollapsibleSet = CollapsibleSet;
			engine.defineWidget(
				"CollapsibleSet",
				"[data-role='collapsible-set'], .ui-collapsible-set",
				[],
				CollapsibleSet,
				"mobile"
			);
			}(window.document, ns));

/*global window, ns, define */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */

/**
 * # Dialog Widget
 * Display div as a model dialog page with inset appearance.
 *
 * Any page can be presented as a modal dialog by adding the data-rel="dialog"
 * attribute to the page anchor link. When the "dialog" attribute is applied,
 * the framework adds styles to add rounded corners, margins around the page
 * and a dark background to make the "dialog" appear to be suspended above
 * the page.
 *
 * ## Default selectors
 * By default all elements with _data-role=dialog_ are changed to Tizen Web UI
 * Dialog.
 *
 * In additional all elements with class _ui-dialog_ are changed to Tizen Web UI
 * Dialog.
 *
 * #### Create simple dialog from div using data-role
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * #### Create simple dialog from div using class selector
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * ## Manual constructor
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" id="btn-open" href="#">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *        <script>
 *            var element = document.getElementById("dialogPage"),
 *                dialogOpen = function () {
 *					var dialog = tau.widget.Dialog(element);
 *				};
 *            document.getElementById("btn-open")
 *                .addEventListener("vclick", dialogOpen);
 *        </script>
 *
 * ## Options for Dialog
 * Options for widget can be defined as _data-..._ attributes or given
 * as parameter in constructor.
 *
 * You can change option for widget using method **option**.
 *
 * ### closeBtn
 * _data-close-btn_ Position of the dialog close button
 * in the header
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" data-close-btn="left" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * ### closeBtnText
 * _data-close-btn-text_ Customize text of the close button,
 * by default close button is displayed as an icon-only so the text
 * isn't visible, but is read by screen readers
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" data-close-btn="left"
 *            data-close-btn-text="Click to close" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * ### overlayTheme
 * _data-overlay-theme_ Background under dialog content color
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" data-overlay-theme="s" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * ### corners
 * _data-corners_ Sets if dialog should be drawn with rounded corners
 *
 *        @example
 *        <div data-role="page" id="page1">
 *            <div data-role="header">
 *                <h1>Page</h1>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <a data-role="button" href="#dialogPage"
 *                    data-rel="dialog">Open dialog</a>
 *            </div>
 *        </div>
 *
 *        <div data-role="dialog" data-corners="false" id="dialogPage">
 *            <div data-role="header">
 *                <h2>Dialog</h2>
 *            </div>
 *            <div data-role="content" class="ui-content">
 *                <p>I am a dialog</p>
 *            </div>
 *        </div>
 *
 * @class ns.widget.mobile.Dialog
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				/**
			 * Widget Alias for {@link ns.widget.BaseWidget}
			 * @property {Object}
			 * @member ns.widget.mobile.Dialog
			 * @private
			 * @static
			 */
			var BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * Alias for class {@link ns.engine}
				 * @property {Object} engine
				 * @member ns.widget.mobile.Dialog
				 * @private
				 * @static
				 */
				engine = ns.engine,
				/**
				 * Alias to {@link ns.util.selectors}
				 * @property {Object} selectors
				 * @member ns.widget.mobile.Dialog
				 * @private
				 * @static
				 */
				selectors = ns.util.selectors,
				/**
				 * Alias to {@link ns.util.DOM}
				 * @property {Object} dom
				 * @member ns.widget.mobile.Dialog
				 * @private
				 * @static
				 */
				doms = ns.util.DOM,
				/**
				 * Alias to {@link ns.event}
				 * @property {Object} events
				 * @private
				 * @static
				 */
				events = ns.event,
				/**
				 * Alias to {@link ns.widget.core.Button#classes}
				 * @property {Object} buttonClasses
				 * @member ns.widget.mobile.Dialog
				 * @private
				 * @static
				 */
				buttonClasses = ns.widget.core.Button.classes,

				/**
				 * Dictionary for dialog related css class names
				 * @property {Object} classes
				 * @member ns.widget.mobile.Dialog
				 * @static
				 * @readonly
				 * @property {string} classes.uiDialog Main Dialog class name
				 * @property {string} classes.uiDialogContain
				 * Dialog container class name
				 * @property {string} classes.uiCornerAll
				 * Class for all Dialog corners
				 * @property {string} classes.uiHeader
				 * @property {string} classes.uiContent
				 * @property {string} classes.uiFooter
				 * @property {string} classes.uiBarPrefix
				 * @property {string} classes.uiBodyPrefix
				 * @property {string} classes.uiDialogHidden
				 */
				classes = {
					uiDialog: "ui-dialog",
					uiDialogContain: "ui-dialog-contain",
					uiCornerAll: "ui-corner-all",
					uiHeader: "ui-header",
					uiContent: "ui-content",
					uiFooter: "ui-footer",
					uiBarPrefix: "ui-bar-",
					uiBodyPrefix: "ui-body-",
					uiDialogHidden: "ui-dialog-hidden"
				},

				Dialog = function () {
					var self = this;
					/**

					 * Object with default options
					 * @property {Object} options
					 * @property {"left"|"right"|"none"} [options.closeBtn="left"] Position of the dialog close button in the header, accepts: left, right and none
					 * @property {string} [options.closeBtnText="Close"] Customize text of the close button, by default close button is displayed as an icon-only so the text isn't visible, but is read by screen readers
					 * @property {string} [options.closeLinkSelector="a[data-rel='back']"] Selector for buttons used to closing dialog
					 * @property {string} [options.overlayTheme="c"] Backgroudn under dialog content color
					 * @property {boolean} [options.corners=true] Sets if dialog should be drawn with rounded corners
					 * @property {string} [options.page=""] Sets if of related page
					 * @member ns.widget.mobile.Dialog
					 */

					self.options = {
						closeBtn: "left",
						closeBtnText: "Close",
						closeLinkSelector: "a[data-rel='back']",
						overlayTheme: "c",
						corners: true,
						page: ""
					};

					self._eventHandlers = {};
					self._ui = {
						page: null // page related with this dialog
					};

				},
				prototype = new BaseWidget();

			/**
			 * Dictionary for dialog related css class names
			 * @property {Object} classes
			 * @protected
			 */
			Dialog.classes = classes;

			Dialog.prototype = prototype;


			/**
			 * Create close button.
			 * @method createCloseButton
			 * @param {HTMLElement} element
			 * @param {"none"|"left"|"right"} [location="none"]
			 * @param {string} text
			 * @private
			 * @static
			 * @member ns.widget.mobile.Dialog
			 */
			function createCloseButton(element, location, text) {
				var button,
					header;

				if (location !== "left" && location !== "right") {
					location = "none";
				}

				// if location of closing button is set, button is created
				if (location !== "none") {
					button = document.createElement("a");
					button.setAttribute("data-rel", "back");
					button.className = buttonClasses.uiBtn + "-" + location;
					button.textContent = text || "";

					header = element.getElementsByClassName(classes.uiHeader)[0];
					if (header) {
						header.insertBefore(button, header.firstChild);
					}

					engine.instanceWidget(button, "Button", {
						iconpos: "notext",
						icon: "delete",
						inline: true,
						corners: true
					});
				}
			}

			/**
			 * Set page active / unactive
			 * @method setActive
			 * @param {boolean} value
			 * @member ns.widget.mobile.Dialog
			 * @protected
			 */
			Dialog.prototype.setActive = function (value) {
				var self = this,
					elementClassList = self.element.classList,
					dialogClasses = classes,
					pageClasses = ns.widget.core.Page.classes;

				if (value) {
					elementClassList.remove(dialogClasses.uiDialogHidden);
					elementClassList.add(pageClasses.uiPage);
					elementClassList.add(pageClasses.uiPageActive);
				} else {
					elementClassList.remove(pageClasses.uiPage);
					elementClassList.remove(pageClasses.uiPageActive);
					elementClassList.add(dialogClasses.uiDialogHidden);
				}
			};

			/**
			 * Builds Dialog widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Dialog
			 */
			Dialog.prototype._build = function (element) {
				var self = this,
					container = document.createElement("div"),
					childrenLength = element.children.length,
					getChildrenBySelector = selectors.getChildrenBySelector,
					headers = getChildrenBySelector(element, "[data-role='header']"),
					content = getChildrenBySelector(element, "[data-role='content']"),
					footers = getChildrenBySelector(element, "[data-role='footer']"),
					options = self.options,
					containerClassList = container.classList,
					headersClassList,
					dataTheme,
					elementTheme,
					contentTheme,
					page,
					pageId,
					i,
					l;


				page = selectors.getClosestBySelector(element, "[data-role='page']");
				pageId = page ? page.id : "";
				doms.setNSData(element, "page", pageId);
				options.page = pageId;


				dataTheme = element.getAttribute("data-theme");
				elementTheme = dataTheme ? dataTheme : options.overlayTheme;

				element.classList.add(classes.uiDialog);
				element.classList.add(classes.uiBodyPrefix +
					elementTheme);

				for (i = 0; i < childrenLength; i++) {
					container.appendChild(element.children[0]);
				}

				containerClassList.add(classes.uiDialogContain);

				if (options.corners) {
					containerClassList.add(classes.uiCornerAll);
				}

				for (i = 0, l = headers.length; i < l; i++) {
					headersClassList = headers[i].classList;
					headersClassList.add(classes.uiHeader);
				}

				for (i = 0, l = content.length; i < l; i++) {
					content[i].classList.add(classes.uiContent);
					content[i].classList.add(classes.uiBodyPrefix +
						contentTheme);
				}

				for (i = 0, l = footers.length; i < l; i++) {
					footers[i].classList.add(classes.uiFooter);
				}

				element.appendChild(container);
				element.parentNode.removeChild(element);
				document.body.appendChild(element);

				createCloseButton(element, options.closeBtn, options.closeBtnText);

				return element;
			};

			/**
			 * This method inits Dialog widget.
			 * @method _init
			 * @protected
			 * @member ns.widget.mobile.Dialog
			 */
			Dialog.prototype._init = function () {
				var pageId = this.options.page;

				if (pageId) {
					this._ui.page = document.getElementById(pageId);
				}
			};

			/**
			 * Close dialog.
			 * @method _close
			 * @param {Event} event
			 * @returns {boolean} false
			 * @protected
			 * @member ns.widget.mobile.Dialog
			 */

			Dialog.prototype._close = function (event) {
				event.preventDefault();
				this.close();
				return false;
			};


			/**
			 * Close dialog
			 *
			 *        @example
			 *        <div data-role="page" id="page1">
			 *            <div data-role="header">
			 *                <h1>Page</h1>
			 *            </div>
			 *            <div data-role="content" class="ui-content">
			 *                <a href="#dialogPage" data-role="button"
			 *                    data-rel="dialog">Open dialog</a>
			 *            </div>
			 *        </div>
			 *
			 *        <div data-role="dialog" id="dialogPage">
			 *            <div data-role="header">
			 *                <h2>Dialog</h2>
			 *            </div>
			 *            <div data-role="content" class="ui-content">
			 *                <div data-role="button" id="button-close">
			 *                    Close dialog
			 *                </div>
			 *            </div>
			 *        </div>
			 *        <script>
			 *            var element = document.getElementById("dialogPage"),
			 *                onClose = function () {
			 *					// gets the dialog instance and closes Dialog
			 *					tau.widget.Dialog(element).close();
			 *				};
			 *            document.getElementById("button-close")
			 *                .addEventListener("vclick", onClose, true);
			 *        </script>
			 *
			 *
			 * @method close
			 * @member ns.widget.mobile.Dialog
			 */
			Dialog.prototype.close = function () {
				window.history.back();
			};

			/**
			 * Layouting page structure
			 * @method layout
			 * @member ns.widget.core.Page
			 */
			prototype.layout = function () {
			};

			/**
			 * This method triggers BEFORE_SHOW event.
			 * @method onBeforeShow
			 * @member ns.widget.core.Page
			 */
			prototype.onBeforeShow = function () {
			};

			/**
			 * This method triggers SHOW event.
			 * @method onShow
			 * @member ns.widget.core.Page
			 */
			prototype.onShow = function () {
			};

			/**
			 * This method triggers BEFORE_HIDE event.
			 * @method onBeforeHide
			 * @member ns.widget.core.Page
			 */
			prototype.onBeforeHide = function () {
			};

			/**
			 * This method triggers HIDE event.
			 * @method onHide
			 * @member ns.widget.core.Page
			 */
			prototype.onHide = function () {
			};

			/**
			 * Handler function to close the dialog on click.
			 * @method closeOnClick
			 * @param {ns.widget.mobile.Dialog} self
			 * @param {Event} event
			 * @static
			 * @private
			 */
			function closeOnClick(self, event) {
				var element = event.target;

				if (selectors.getClosestBySelector(element, self.options.closeLinkSelector)) {
					self.close();
				}
			}

			/**
			 * Bind widget events
			 * @method _bindEvents
			 * @protected
			 * @param {HTMLElement} element
			 * @member ns.widget.mobile.Dialog
			 */
			Dialog.prototype._bindEvents = function (element) {
				var self = this,
					eventHandlers = self._eventHandlers;

				eventHandlers.destroyOnEvent = self.destroy.bind(self, element);
				eventHandlers.closeOnClick = closeOnClick.bind(null, self);

				element.addEventListener("vclick", eventHandlers.closeOnClick, true);

				if (self._ui.page) {
					self._ui.page.addEventListener("pagedestroy", eventHandlers.destroyOnEvent, true);
				}
			};

			/**
			 * Destroy Dialog widget
			 *
			 * The method removes event listeners.
			 *
			 *        @example
			 *        <div data-role="page" id="page1">
			 *            <div data-role="header">
			 *                <h1>Page</h1>
			 *            </div>
			 *            <div data-role="content" class="ui-content">
			 *                <a href="#dialogPage" data-role="button"
			 *                    data-rel="dialog">Open dialog</a>
			 *            </div>
			 *        </div>
			 *
			 *        <div data-role="dialog" id="dialogPage">
			 *            <div data-role="header">
			 *                <h2>Dialog</h2>
			 *            </div>
			 *            <div data-role="content" class="ui-content">
			 *                <div data-role="button" id="button-close">
			 *                    Close dialog
			 *                </div>
			 *            </div>
			 *        </div>
			 *        <script>
			 *            var element = document.getElementById("dialogPage"),
			 *                onClose = function () {
			 *					// gets the dialog instance, closes and destroy
			 *					// Dialog widget
			 *					tau.widget.Dialog(element)
			 *						.close()
			 *						.destroy();
			 *				};
			 *            document.getElementById("button-close")
			 *                .addEventListener("vclick", onClose, true);
			 *        </script>
			 *
			 * @method _destroy
			 * @member ns.widget.mobile.Dialog
			 * @protected
			 */
			Dialog.prototype._destroy = function () {
				var self = this,
					element = self.element,
					parentNode = element.parentNode,
					eventHandlers = self._eventHandlers;

				element.removeEventListener("vclick", eventHandlers.closeOnClick, true);

				if (self._ui.page) {
					self._ui.page.removeEventListener("pagedestroy", eventHandlers.destroyOnEvent, true);
				}

				events.trigger(document, "destroyed", {
					widget: "Dialog",
					parent: parentNode
				});
				parentNode.removeChild(element);
			};

			// definition
			ns.widget.mobile.Dialog = Dialog;
			engine.defineWidget(
				"Dialog",
				"[data-role='dialog'], .ui-dialog",
				["close"],
				Dialog,
				"mobile"
			);
			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Route Page
 * Support class for router to control changing pages in profile Wearable.
 * @class ns.router.route.page
 * @author Maciej Urbanski <m.urbanski@samsung.com>
 */
(function (document) {
	"use strict";
				var util = ns.util,
				path = util.path,
				DOM = util.DOM,
				object = util.object,
				utilSelector = util.selectors,
				history = ns.history,
				engine = ns.engine,
				baseElement,
				routeDialog = {},
				head;

			/**
			 * Tries to find a page element matching id and filter (selector).
			 * Adds data url attribute to found page, sets page = null when nothing found
			 * @method findPageAndSetDataUrl
			 * @param {string} dataUrl DataUrl of searching element
			 * @param {string} filter Query selector for searching page
			 * @return {?HTMLElement}
			 * @private
			 * @static
			 * @member ns.router.route.page
			 */
			function findDialogAndSetDataUrl(dataUrl, filter) {
				var id = path.stripQueryParams(dataUrl).replace("#", ""),
					dialog = document.getElementById(id);

				if (dialog && utilSelector.matchesSelector(dialog, filter)) {
					if (dataUrl === id) {
						DOM.setNSData(dialog, "url", "#" + id);
					} else {
						DOM.setNSData(dialog, "url", dataUrl);
					}

				} else {
					// if we matched any element, but it doesn't match our filter
					// reset page to null
					dialog = null;
				}
				// @TODO ... else
				// probably there is a need for running onHashChange while going back to a history entry
				// without state, eg. manually entered #fragment. This may not be a problem on target device
				return dialog;
			}

			/**
			 * Property containing default properties
			 * @property {Object} defaults
			 * @property {string} defaults.transition="none"
			 * @static
			 * @member ns.router.route.page
			 */
			routeDialog.defaults = {
				transition: "none"
			};

			/**
			 * Property defining selector for filtering only page elements
			 * @property {string} filter
			 * @member ns.router.route.page
			 * @static
			 */
			routeDialog.filter = engine.getWidgetDefinition("Dialog").selector;

			/**
			 * Returns default route options used inside Router.
			 * @method option
			 * @static
			 * @member ns.router.route.page
			 * @return {Object} default route options
			 */
			routeDialog.option = function () {
				var defaults = object.merge({}, routeDialog.defaults);

				defaults.transition = ns.getConfig("pageTransition", defaults.transition);
				return defaults;
			};

			routeDialog.init = function () {
				var pages = [].slice.call(document.querySelectorAll(this.filter));

				pages.forEach(function (page) {
					if (!DOM.getNSData(page, "url")) {
						DOM.setNSData(page, "url", (page.id && "#" + page.id) || location.pathname + location.search);
					}
				});
			};

			/**
			 * This method changes page. It sets history and opens page passed as a parameter.
			 * @method open
			 * @param {HTMLElement|string} toPage The page which will be opened.
			 * @param {Object} [options]
			 * @param {boolean} [options.fromHashChange] Sets if call was made on hash change.
			 * @param {string} [options.dataUrl] Sets if page has url attribute.
			 * @member ns.router.route.page
			 */
			routeDialog.open = function (toPage, options) {
				var pageTitle = document.title,
					url,
					state = {},
					router = ns.router.Router.getInstance();

				if (toPage === router.getRoute("page").getFirstElement() && !options.dataUrl) {
					url = path.documentUrl.hrefNoHash;
				} else {
					url = DOM.getNSData(toPage, "url");
				}

				pageTitle = DOM.getNSData(toPage, "title") || utilSelector.getChildrenBySelector(toPage, ".ui-header > .ui-title").textContent || pageTitle;
				if (!DOM.getNSData(toPage, "title")) {
					DOM.setNSData(toPage, "title", pageTitle);
				}

				if (url && !options.fromHashChange) {
					if (!path.isPath(url) && url.indexOf("#") < 0) {
						url = path.makeUrlAbsolute("#" + url, path.documentUrl.hrefNoHash);
					}

					state = object.merge(
						{},
						options,
						{
							url: url
						}
					);

					history.replace(state, pageTitle, url);
				}

				// write base element
				this._setBase(url);

				//set page title
				document.title = pageTitle;

				options.widget = "Dialog";

				this.activeDialog = engine.instanceWidget(toPage, options.widget);

				this.getContainer().change(toPage, options);
			};

			/**
			 * This method determines target page to open.
			 * @method find
			 * @param {string} absUrl Absolute path to opened page
			 * @member ns.router.route.page
			 * @return {?HTMLElement} Element of page to open.
			 */
			routeDialog.find = function (absUrl) {
				var self = this,
					router = ns.router.Router.getInstance(),
					dataUrl = self._createDataUrl(absUrl),
					firstPageElement = router.getFirstPage(),
					pageContainer = router.getContainer(),
					page,
					selector = "[data-url='" + dataUrl + "']",
					filterRegexp = /,/gm;

				if (/#/.test(absUrl) && path.isPath(dataUrl)) {
					return null;
				}

				// Check to see if the page already exists in the DOM.
				// NOTE do _not_ use the :jqmData pseudo selector because parenthesis
				//      are a valid url char and it breaks on the first occurence
				// prepare selector for new page
				selector += self.filter.replace(filterRegexp, ",[data-url='" + dataUrl + "']");
				page = pageContainer.element.querySelector(selector);

				// If we failed to find the page, check to see if the url is a
				// reference to an embedded page. If so, it may have been dynamically
				// injected by a developer, in which case it would be lacking a
				// data-url attribute and in need of enhancement.
				if (!page && dataUrl && !path.isPath(dataUrl)) {
					//Remove search data
					page = findDialogAndSetDataUrl(dataUrl, self.filter);
				}

				// If we failed to find a page in the DOM, check the URL to see if it
				// refers to the first page in the application. Also check to make sure
				// our cached-first-page is actually in the DOM. Some user deployed
				// apps are pruning the first page from the DOM for various reasons.
				// We check for this case here because we don't want a first-page with
				// an id falling through to the non-existent embedded page error case.
				if (!page &&
					firstPageElement &&
					firstPageElement.parentNode &&
					path.isFirstPageUrl(dataUrl, firstPageElement)) {
					page = firstPageElement;
				}

				return page;
			};

			/**
			 * This method handles hash change.
			 * It closes opened popup.
			 * @method onHashChange
			 * @return {boolean}
			 * @member ns.router.route.popup
			 * @static
			 */
			routeDialog.onHashChange = function () {
				return false;
			};

			/**
			 * This method parses HTML and runs scripts from parsed code.
			 * Fetched external scripts if required.
			 * Sets document base to parsed document absolute path.
			 * @method parse
			 * @param {string} html HTML code to parse
			 * @param {string} absUrl Absolute url for parsed page
			 * @member ns.router.route.page
			 * @return {?HTMLElement} Element of page in parsed document.
			 */
			routeDialog.parse = function (html, absUrl) {
				var self = this,
					page,
					dataUrl = self._createDataUrl(absUrl);

				// write base element
				// @TODO shouldn't base be set if a page was found?
				self._setBase(absUrl);

				// Finding matching page inside created element
				page = html.querySelector(self.filter);

				// If a page exists...
				if (page) {
					// TODO tagging a page with external to make sure that embedded pages aren't
					// removed by the various page handling code is bad. Having page handling code
					// in many places is bad. Solutions post 1.0
					DOM.setNSData(page, "url", dataUrl);
					DOM.setNSData(page, "external", true);
				}
				return page;
			};

			/**
			 * This method creates data url from absolute url given as argument.
			 * @method _createDataUrl
			 * @param {string} absoluteUrl
			 * @protected
			 * @static
			 * @member ns.router.route.page
			 * @return {string}
			 */
			routeDialog._createDataUrl = function (absoluteUrl) {
				return path.convertUrlToDataUrl(absoluteUrl, true);
			};

			/**
			 * On open fail, currently never used
			 * @method onOpenFailed
			 * @member ns.router.route.page
			 */
			routeDialog.onOpenFailed = function (/* options */) {
				this._setBase(path.parseLocation().hrefNoSearch);
			};

			/**
			 * This method returns base element from document head.
			 * If no base element is found, one is created based on current location.
			 * @method _getBaseElement
			 * @protected
			 * @static
			 * @member ns.router.route.page
			 * @return {HTMLElement}
			 */
			routeDialog._getBaseElement = function () {
				// Fetch document head if never cached before
				if (!head) {
					head = document.querySelector("head");
				}
				// Find base element
				if (!baseElement) {
					baseElement = document.querySelector("base");
					if (!baseElement) {
						baseElement = document.createElement("base");
						baseElement.href = path.documentBase.hrefNoHash;
						head.appendChild(baseElement);
					}
				}
				return baseElement;
			};

			/**
			 * Sets document base to url given as argument
			 * @method _setBase
			 * @param {string} url
			 * @protected
			 * @member ns.router.route.page
			 */
			routeDialog._setBase = function (url) {
				var base = this._getBaseElement(),
					baseHref = base.href;

				if (path.isPath(url)) {
					url = path.makeUrlAbsolute(url, path.documentBase);
					if (path.parseUrl(baseHref).hrefNoSearch !== path.parseUrl(url).hrefNoSearch) {
						base.href = url;
						path.documentBase = path.parseUrl(path.makeUrlAbsolute(url, path.documentUrl.href));
					}
				}
			};

			/**
			 * Returns container of pages
			 * @method getContainer
			 * @return {?ns.widget.wearable.Page}
			 * @member ns.router.route.page
			 * @static
			 */
			routeDialog.getContainer = function () {
				return ns.router.Router.getInstance().getContainer();
			};

			/**
			 * Returns active page.
			 * @method getActive
			 * @return {?ns.widget.wearable.Page}
			 * @member ns.router.route.page
			 * @static
			 */
			routeDialog.getActive = function () {
				return this.getContainer().getActivePage();
			};

			/**
			 * Returns element of active page.
			 * @method getActiveElement
			 * @return {HTMLElement}
			 * @member ns.router.route.page
			 * @static
			 */
			routeDialog.getActiveElement = function () {
				return this.getActive().element;
			};
			ns.router.route.dialog = routeDialog;

			}(window.document));

/*global window, ns, define */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Legacy slider is provided this extra js file.
 *
 * @class ns.widget.mobile.Slider
 * @author Hyeoncheol Choi <hc7.choi@samsung.com>
 */
(function (document, ns) {
	"use strict";
				var CoreSlider = ns.widget.core.Slider,
				engine = ns.engine,
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				object = ns.util.object,
				SliderExtra = function () {
					var self = this;

					CoreSlider.call(self);
					self.options = object.copy(CoreSlider.prototype.options);
				},
				classes = object.merge({}, CoreSlider.classes, {
					SLIDER: CoreSlider.classes.SLIDER,
					SLIDER_ICON: "ui-slider-icon",
					SLIDER_WITH_ICON: "ui-slider-with-icon",
					SLIDER_TEXT_LEFT: "ui-slider-text-left",
					SLIDER_TEXT_RIGHT: "ui-slider-text-right",
					SLIDER_WITH_TEXT_LEFT: "ui-slider-with-text-left",
					SLIDER_WITH_TEXT_RIGHT: "ui-slider-with-text-right"
				}),
				prototype = new BaseWidget();

			SliderExtra.prototype = prototype;

			prototype._configure = function (element) {
				var self = this,
					options = self.options;

				options.icon = null;
				options.innerLabel = false;
				options.popup = false;
				options.textLeft = null;
				options.textRight = null;
				return element;
			};

			prototype._build = function (element) {
				var self = this,
					slider;

				self._buildIcon(element);
				self._buildText(element);

				slider = ns.widget.Slider(element);
				self.options.popup ? slider.options.expand = true : slider.options.expand = false;

				slider.refresh();
				return element;
			};

			prototype._buildIcon = function (element) {
				var self = this,
					options = self.options,
					parentNode = element.parentNode,
					icon;

				if (options.icon && options.icon !== "text") {
					icon = document.createElement("div");
					icon.classList.add(classes.SLIDER_ICON);
					icon.classList.add("ui-icon-" + options.icon);
					parentNode.classList.add(classes.SLIDER_WITH_ICON);
					parentNode.appendChild(icon);
				}
			};
			prototype._buildText = function (element) {
				var self = this,
					options = self.options,
					parentNode = element.parentNode,
					textLeft,
					textRight;

				if (options.textLeft || options.textRight) {
					if (options.textLeft) {
						textLeft = document.createElement("div");
						textLeft.innerText = element.getAttribute("data-text-left");
						textLeft.classList.add(classes.SLIDER_TEXT_LEFT);
						parentNode.classList.add(classes.SLIDER_WITH_TEXT_LEFT);
						parentNode.appendChild(textLeft);
					}
					if (options.textRight) {
						textRight = document.createElement("div");
						textRight.innerText = element.getAttribute("data-text-right");
						textRight.classList.add(classes.SLIDER_TEXT_RIGHT);
						parentNode.classList.add(classes.SLIDER_WITH_TEXT_RIGHT);
						parentNode.appendChild(textRight);
					}
				}
			};

			ns.widget.mobile.SliderExtra = SliderExtra;
			engine.defineWidget(
				"SliderExtra",
				"input[data-role='slider'], input[type='range'], input[data-type='range']",
				[],
				SliderExtra,
				"mobile"
			);

			}(window.document, ns));

/*global window, ns, define */
/*jslint nomen: true */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * #Legacy TizenSlider is provided this extra js file.
 *
 * @class ns.widget.mobile.Slider
 * @author Hyeoncheol Choi <hc7.choi@samsung.com>
 */
(function (document, ns) {
	"use strict";
				var engine = ns.engine,
				TizenSlider = ns.widget.mobile.SliderExtra;

			ns.widget.mobile.TizenSlider = TizenSlider;
			engine.defineWidget(
				"TizenSlider",
				"",
				[],
				TizenSlider,
				"mobile"
			);

			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * # Search Bar Widget
 * The search filter bar widget is used to search for page content.
 *
 * This widget can be placed in the header or page content.
 *
 * ## Default selectors
 * In default elementch matches to :
 *
 *  - INPUT with type equals "search" or "tizen-search"
 *  - HTML elements with data-type="search" or data-type="tizen-search"
 *  - HTML elements with class ui-searchbar
 *
 * ###HTML Examples
 *
 * ####Create simple searchbar in header
 *
 *        @example
 *        <div data-role="page" id="search-bar-page">
 *            <div data-role="header">
 *                <label for="search-bar">Search Input:</label>
 *                <input type="search" name="search" id="search-bar"/>
 *            </div>
 *            <div data-role="content" id="search-bar-content">
 *                <p>Hairston</p>
 *                <p>Hansbrough</p>
 *                <p>Allred</p>
 *                <p>Hanrahan</p>
 *                <p>Egan</p>
 *                <p>Dare</p>
 *                <p>Edmonson</p>
 *                <p>Calip</p>
 *                <p>Baker</p>
 *                <p>Fazekas</p>
 *                <p>Garrity</p>
 *            </div>
 *        </div>
 *        <script>
 *            (function (document) {
 *				var inputElement = document.getElementById("search-bar"),
 *					contentElement = document.getElementById("search-bar-content"),
 *					contentChildren = contentElement.getElementsByTagName("p"),
 *					contentChildrenLength = contentChildren.length;
 *
 *				function changeHandle(event) {
 *					var i,
 *						child,
 *						childText,
 *						value = inputElement.value;
 *
 *					for (i = 0; i < contentChildrenLength; i++) {
 *						child = contentChildren.item(i);
 *						childText = child.textContent.toLowerCase();
 *						if (!value || ~childText.indexOf(value)) {
 *							child.style.display = "block";
 *						} else {
 *							child.style.display = "none";
 *						}
 *					}
 *				}
 *
 *				inputElement.addEventListener("change", changeHandle);
 *				inputElement.addEventListener("keyup", changeHandle);
 *			}(document));
 *        </script>
 *
 * ## Manual constructor
 * For manual creation of search bar widget you can use constructor of widget from
 * **tau** namespace:
 *
 *        @example
 *        <div data-role="page" id="search-bar-page">
 *            <div data-role="header">
 *                <label for="search-bar">Search Input:</label>
 *                <input name="search" id="search-bar"/>
 *            </div>
 *            <div data-role="content" id="search-bar-content">
 *                <p>Hairston</p>
 *                <p>Hansbrough</p>
 *                <p>Allred</p>
 *                <p>Hanrahan</p>
 *                <p>Egan</p>
 *                <p>Dare</p>
 *                <p>Edmonson</p>
 *                <p>Calip</p>
 *                <p>Baker</p>
 *                <p>Fazekas</p>
 *                <p>Garrity</p>
 *            </div>
 *        </div>
 *        <script>
 *            (function (document) {
 *				var inputElement = document.getElementById("search-bar"),
 *					contentElement = document.getElementById("search-bar-content"),
 *					contentChildren = contentElement.getElementsByTagName("p"),
 *					contentChildrenLength = contentChildren.length,
 *					pageElement = document.getElementById("search-bar-page"),
 *					searchBar;
 *
 *				function changeHandle(event) {
 *					var i,
 *						child,
 *						childText,
 *						value = searchBar.value();
 *
 *					for (i = 0; i < contentChildrenLength; i++) {
 *						child = contentChildren.item(i);
 *						childText = child.textContent.toLowerCase();
 *						if (!value || ~childText.indexOf(value)) {
 *							child.style.display = "block";
 *						} else {
 *							child.style.display = "none";
 *						}
 *					}
 *				}
 *
 *				function createPageHandle() {
 *					searchBar = tau.widget.SearchBar(inputElement, {
 *						icon: "call"
 *					});
 *					searchBar.on("change keyup", changeHandle);
 *				}
 *
 *				pageElement.addEventListener("pagecreate", createPageHandle);
 *			}(document));
 *        </script>
 *
 * Constructor has one require parameter **element** which are base
 * **HTMLElement** to create widget. We recommend get this element by method
 * *document.getElementById*. Second parameter is **options** and it is a object
 * with options for widget.
 *
 * If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div data-role="page" id="search-bar-page">
 *            <div data-role="header">
 *                <label for="search-bar">Search Input:</label>
 *                <input name="search" id="search-bar"/>
 *            </div>
 *            <div data-role="content" id="search-bar-content">
 *                <p>Hairston</p>
 *                <p>Hansbrough</p>
 *                <p>Allred</p>
 *                <p>Hanrahan</p>
 *                <p>Egan</p>
 *                <p>Dare</p>
 *                <p>Edmonson</p>
 *                <p>Calip</p>
 *                <p>Baker</p>
 *                <p>Fazekas</p>
 *                <p>Garrity</p>
 *            </div>
 *        </div>
 *        <script>
 *            (function (document) {
 *				var inputElement = document.getElementById("search-bar"),
 *						contentElement = document.getElementById("search-bar-content"),
 *						contentChildren = contentElement.getElementsByTagName("p"),
 *						contentChildrenLength = contentChildren.length,
 *						pageElement = document.getElementById("search-bar-page");
 *
 *				function changeHandle(event) {
 *					var i,
 *						child,
 *						childText,
 *						value = inputElement.value;
 *
 *					for (i = 0; i < contentChildrenLength; i++) {
 *						child = contentChildren.item(i);
 *						childText = child.textContent.toLowerCase();
 *						if (!value || ~childText.indexOf(value)) {
 *							child.style.display = "block";
 *						} else {
 *							child.style.display = "none";
 *						}
 *					}
 *				}
 *
 *				function createPageHandle() {
 *					$("#search-bar").searchbar(inputElement, {
 *						icon: "call"
 *					}).on("change keyup", changeHandle);
 *				}
 *
 *				$("#search-bar-page").on("pagecreate", createPageHandle);
 *			}(document));
 *        </script>
 *
 * jQuery Mobile constructor has one optional parameter is **options** and it is
 * a object with options for widget.
 *
 * ##Options for search bar widget
 *
 * Options for widget can be defined as _data-..._ attributes or give as
 * parameter in constructor.
 *
 * You can change option for widget using method **option**.
 *
 * ##Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        <script>
 *        var searchBarElement = document.getElementById('search-bar'),
 *            searchBar = tau.widget.SearchBar(searchBarElement);
 *
 *        searchBar.methodName(methodArgument1, methodArgument2, ...);
 *        </script>
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        <script>
 *        $(".selector").searchbar('methodName', methodArgument1, methodArgument2, ...);
 *        </script>
 *
 * #Search Bar Widget
 * @class ns.widget.mobile.SearchBar
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				var SearchBar = function () {
					return this;
				},
				BaseWidget = ns.widget.BaseWidget,
				engine = ns.engine,
				DOM = ns.util.DOM,
				events = ns.event,
				classes = {
					uiInputText: "ui-input-text",
					uiInputSearch: "ui-input-search",
					uiShadowInset: "ui-shadow-inset",
					uiCornerAll: "ui-corner-all",
					uiBtnShadow: "ui-btn-shadow",
					uiInputSearchDefault: "ui-input-search-default",
					uiSearchBarIcon: "ui-search-bar-icon",
					uiInputClear: "ui-input-clear",
					uiInputClearHidden: "ui-input-clear-hidden",
					inputSearchBar: "input-search-bar",
					uiInputCancel: "ui-input-cancel",
					uiInputDefaultText: "ui-input-default-text",
					uiBtnSearchFrontIcon: "ui-btn-search-front-icon",
					uiInputSearchWide: "ui-input-search-wide",
					uiBtnCancelHide: "ui-btn-cancel-hide",
					uiBtnCancelShow: "ui-btn-cancel-show",
					uiFocus: "ui-focus",
					uiHeaderSearchBar: "ui-header-searchbar",
					clearActive: "ui-text-input-clear-active",
					textLine: "ui-text-input-textline",
					uiSearchBarIconPositionLeft: "ui-search-bar-icon-left",
					uiSearchBarIconPositionRight: "ui-search-bar-icon-right"
				};

			SearchBar.prototype = new BaseWidget();

			/**
			 * Dictionary for SearchBar related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.SearchBar
			 * @static
			 */
			SearchBar.classes = classes;

			SearchBar.prototype._configure = function () {
				var self = this,
					options = self.options || {};
				/**
				 * @property {Object} options All possible widget options
				 * @property {boolean} [options.cancelBtn=false] shows or not cancel button
				 * @property {boolean} [options.clearButton=false] shows or not clear  button
				 * @property {?string} [options.icon=null] type of icon on action button, possible values are the same as in button widget. If opition is not set then action button isn't showing
				 * @property {?string} [options.buttonPosition="left"] position of icon
				 * @property {?string} [options.defaultText=""] Default placeholder text
				 * @member ns.widget.mobile.SearchBar
				 */

				options.cancelBtn = false;
				options.clearBtn = true;
				options.icon = null;
				options.buttonPosition = "left";
				options.defaultText = "";
				self.options = options;
			};

			/**
			 * Enable the search bar
			 *
			 * Method removes disabled attribute on search bar and changes look
			 * of search bar to enabled state.
			 *
			 *        @example
			 *        <script>
			 *        var element = document.getElementById("searchbar"),
			 *            searchBarWidget = tau.widget.SearchBar(element);
			 *        searchBarWidget.enable();
			 *
			 *        // or
			 *
			 *        $( "#searchbar" ).searchbar( "enable" );
			 *        </script>
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.SearchBar
			 */
			/**
			 * Enable SearchBar
			 * @method _enable
			 * @param {HTMLElement} element
			 * @member ns.widget.mobile.SearchBar
			 * @protected
			 */
			SearchBar.prototype._enable = function (element) {
				element = element || this.element;
				if (element) {
					element.removeAttribute("disabled");
					element.classList.remove("ui-disabled");
				}
			};

			/**
			 * Disable the search bar
			 *
			 * Method add disabled attribute on search bar and changes look
			 * of search bar to disabled state.
			 *
			 *        @example
			 *        <script>
			 *        var element = document.getElementById("searchbar"),
			 *            searchBarWidget = tau.widget.SearchBar(element);
			 *        searchBarWidget.disable();
			 *
			 *        // or
			 *
			 *        $( "#searchbar" ).searchbar( "disable" );
			 *        </script>
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.SearchBar
			 */
			/**
			 * Disable SearchBar
			 * @method _disable
			 * @param {HTMLElement} element
			 * @member ns.widget.mobile.SearchBar
			 * @protected
			 */
			SearchBar.prototype._disable = function (element) {
				element = element || this.element;
				if (element) {
					element.setAttribute("disabled", "disabled");
					element.classList.add("ui-disabled");
				}
			};

			/**
			 * Finds label for element in parent's element.
			 * @method findLabel
			 * @static
			 * @private
			 * @param {HTMLElement} element base element for finding label
			 * @return {?HTMLElement}
			 * @member ns.widget.mobile.SearchBar
			 */
			function findLabel(element) {
				var elemParent = element.parentNode,
					label = elemParent.querySelector("label[for='" + element.id + "']");

				return label;
			}

			function createDecorationLine(element) {
				var decorationLine = element.nextElementSibling;

				if (!decorationLine || (decorationLine && !decorationLine.classList.contains(classes.textLine))) {

					decorationLine = document.createElement("span");
					decorationLine.classList.add(classes.textLine);

					DOM.insertNodeAfter(element, decorationLine);
				}

				return decorationLine;
			}

			/**
			 * Build button position
			 * @method _buildButtonPosition
			 * @param {HTMLElement} container
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._buildButtonPosition = function (container) {
				var elementClassList = container.classList;

				elementClassList.remove(classes.uiSearchBarIconPositionLeft);
				elementClassList.remove(classes.uiSearchBarIconPositionRight);
				elementClassList.add(this.options.buttonPosition === "left" ? classes.uiSearchBarIconPositionLeft : classes.uiSearchBarIconPositionRight);
			};

			/**
			 * Build widget structure
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._build = function (element) {
				var self = this,
					id = self.id,
					options = self.options,
					searchBox,
					clearButton,
					cancelButton,
					labelDiv,
					frontIcon,
					label = findLabel(element),
					searchBoxClasses,
					inputSearchBar,
					inputClassList = element.classList,
					ui;

				ui = self._ui || {};
				self._ui = ui;

				if (label) {
					label.classList.add(classes.uiInputText);
				}

				if (element.parentNode.classList.contains("ui-header")) {
					// searchbar located header area
					element.parentNode.classList.add(classes.uiHeaderSearchBar);
				}

				element.setAttribute("autocorrect", "off");
				element.setAttribute("autocomplete", "off");

				element.removeAttribute("type");

				inputClassList.add(classes.uiInputText);

				searchBox = document.createElement("div");
				searchBoxClasses = searchBox.classList;
				searchBoxClasses.add(classes.uiInputSearch);
				searchBoxClasses.add(classes.uiShadowInset);
				searchBoxClasses.add(classes.uiCornerAll);
				searchBoxClasses.add(classes.uiBtnShadow);

				element.parentNode.replaceChild(searchBox, element);
				searchBox.appendChild(element);

				// Decoration
				ui.textLine = createDecorationLine(element);

				// @TODO use TextInput widget instead
				if (options.cancelBtn) {
					searchBoxClasses.add(classes.uiInputSearchDefault);
				}

				if (options.clearBtn) {
					clearButton = document.createElement("a");
					clearButton.setAttribute("href", "#");
					clearButton.setAttribute("title", "clear text");
					clearButton.classList.add(classes.uiInputClear);
					if (!element.value) {
						clearButton.classList.add(classes.uiInputClearHidden);
					}
					clearButton.setAttribute("id", id + "-clear-button");
					searchBox.appendChild(clearButton);
					engine.instanceWidget(clearButton, "Button", {
						icon: "deleteSearch",
						iconpos: "notext",
						corners: true,
						shadow: true
					});

					// Give space from right
					element.classList.add(classes.clearActive);
				}

				inputSearchBar = document.createElement("div");
				inputSearchBar.classList.add(classes.inputSearchBar);
				searchBox.parentNode.replaceChild(inputSearchBar, searchBox);
				inputSearchBar.appendChild(searchBox);

				if (options.icon) {
					searchBoxClasses.add(classes.uiSearchBarIcon);
					frontIcon = document.createElement("div");
					DOM.setNSData(frontIcon, "role", "button");
					inputSearchBar.appendChild(frontIcon);
					engine.instanceWidget(frontIcon, "Button", {
						style: "circle",
						iconpos: "notext",
						icon: options.icon,
						shadow: true
					});
					frontIcon.classList.add(classes.uiBtnSearchFrontIcon);
					self._buildButtonPosition(inputSearchBar);
				}

				// @TODO use TextInput widget instead
				if (options.cancelBtn) {
					cancelButton = document.createElement("div");
					DOM.setNSData(cancelButton, "role", "button");
					cancelButton.classList.add(classes.uiInputCancel);
					cancelButton.setAttribute("title", "Clear text");
					cancelButton.textContent = "Cancel";
					cancelButton.setAttribute("id", id + "-cancel-button");

					engine.instanceWidget(cancelButton, "Button");

					inputSearchBar.appendChild(cancelButton);
				}

				element.setAttribute("placeholder", "Search");

				ui.input = element;
				ui.clearButton = clearButton;
				if (cancelButton) {
					ui.cancelButton = cancelButton;
				}
				if (labelDiv) {
					ui.labelDiv = labelDiv;
					labelDiv.setAttribute("id", id + "-label-div");
				}
				ui.searchBox = searchBox;
				searchBox.setAttribute("id", id + "-search-box");

				return element;
			};

			function clearInputAndTriggeerChange(input) {
				input.value = "";
				events.trigger(input, "change");
			}

			/**
			 * Callback for click event on clear button
			 * @method clearButtonClick
			 * @param {ns.widget.mobile.SearchBar} self
			 * @param {Event} event
			 * @static
			 * @private
			 * @member ns.widget.mobile.SearchBar
			 */
			function clearButtonClick(self, event) {
				var input = self._ui.input;

				if (!input.getAttribute("disabled")) {
					clearInputAndTriggeerChange(input);
					input.focus();
					events.preventDefault(event);
				}
			}

			/**
			 * Callback for click event on cancel button
			 * @method cancelButtonClick
			 * @param {ns.widget.mobile.SearchBar} self
			 * @param {Event} event
			 * @static
			 * @private
			 * @member ns.widget.mobile.SearchBar
			 */
			function cancelButtonClick(self, event) {
				var ui = self._ui,
					input = ui.input,
					localClassList;

				if (!input.getAttribute("disabled")) {
					events.preventDefault(event);
					events.stopPropagation(event);

					clearInputAndTriggeerChange(input);
					input.blur();

					if (self.options.cancelBtn) {
						localClassList = ui.searchBox.classList;
						localClassList.add(classes.uiInputSearchWide);
						localClassList.remove(classes.uiInputSearchDefault);

						localClassList = ui.cancelButton.classList;
						localClassList.add(classes.uiBtnCancelHide);
						localClassList.remove(classes.uiBtnCancelShow);
					}
				}
			}

			/**
			 * Callback for focus event on input
			 * @method inputFocus
			 * @param {ns.widget.mobile.SearchBar} self
			 * @static
			 * @private
			 * @member ns.widget.mobile.SearchBar
			 */
			function inputFocus(self) {
				var ui = self._ui,
					input = ui.input,
					localClassList;

				if (!input.getAttribute("disabled")) {
					localClassList = ui.searchBox.classList;
					localClassList.add(classes.uiFocus);
					if (self.options.cancelBtn) {
						localClassList.remove(classes.uiInputSearchWide);
						localClassList.add(classes.uiInputSearchDefault);

						localClassList = ui.cancelButton.classList;
						localClassList.remove(classes.uiBtnCancelHide);
						localClassList.add(classes.uiBtnCancelShow);
					}
				}
				if (ui.labelDiv) {
					ui.labelDiv.classList.add(classes.uiInputDefaultHidden);
				}
			}

			/**
			 * Callback for blur event on input
			 * @method inputBlur
			 * @param {ns.widget.mobile.SearchBar} self
			 * @static
			 * @private
			 * @member ns.widget.mobile.SearchBar
			 */
			function inputBlur(self) {
				var ui = self._ui,
					inputedText = ui.input.value,
					classes = SearchBar.classes,
					labelDiv = ui.labelDiv;

				ui.searchBox.classList.remove(classes.uiFocus);
				if (labelDiv) {
					if (inputedText.length > 0) {
						labelDiv.classList.add(classes.uiInputDefaultHidden);
					} else {
						labelDiv.classList.remove(classes.uiInputDefaultHidden);
					}
				}
			}

			/**
			 * Callback for click event on label
			 * @method labelClick
			 * @param {ns.widget.mobile.SearchBar} self
			 * @static
			 * @private
			 * @member ns.widget.mobile.SearchBar
			 */
			function labelClick(self) {
				var input = self._ui.input;

				input.blur();
				input.focus();
			}

			/**
			 * Init widget on builded structure
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._init = function (element) {
				var self = this,
					ui = self._ui || {},
					id = self.id;

				self._ui = ui;
				ui.input = element;
				ui.clearButton = document.getElementById(id + "-clear-button");
				ui.cancelButton = document.getElementById(id + "-cancel-button");
				ui.labelDiv = document.getElementById(id + "-label-div");
				ui.searchBox = document.getElementById(id + "-search-box");
			};

			/**
			 * Bind events to widget
			 * @method _bindEvents
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._bindEvents = function () {
				var handlers,
					self = this,
					ui = self._ui,
					input = ui.input;

				self._callbacks = self._callbacks || {};
				handlers = self._callbacks;
				handlers.clearClick = clearButtonClick.bind(null, self);
				handlers.cancelClick = cancelButtonClick.bind(null, self);
				handlers.inputFocus = inputFocus.bind(null, self);
				handlers.inputBlur = inputBlur.bind(null, self);
				handlers.labelClick = labelClick.bind(null, self);
				if (ui.clearButton) {
					ui.clearButton.addEventListener("vclick", handlers.clearClick, false);
				}
				if (ui.cancelButton) {
					ui.cancelButton.addEventListener("vclick", handlers.cancelClick, false);
				}
				input.addEventListener("focus", handlers.inputFocus, false);
				input.addEventListener("blur", handlers.inputBlur, false);
				if (ui.labelDiv) {
					ui.labelDiv.addEventListener("vclick", handlers.labelClick, false);
				}
			};

			/**
			 * Destroy widget
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._destroy = function () {
				var handlers,
					ui = this._ui,
					input = ui.input;

				handlers = this._callbacks;
				if (ui.clearButton) {
					ui.clearButton.removeEventListener("vclick", handlers.clearClick, false);
				}
				if (ui.cancelButton) {
					ui.cancelButton.removeEventListener("vclick", handlers.cancelClick, false);
				}
				input.removeEventListener("focus", handlers.inputFocus, false);
				input.removeEventListener("blur", handlers.inputBlur, false);
				if (ui.labelDiv) {
					ui.labelDiv.removeEventListener("vclick", handlers.labelClick, false);
				}
			};

			/**
			 * Gets or sets value of input text.
			 *
			 * If you call with parameter then first argument will be set as new
			 * value of input text. Otherwise method return value of input.
			 *
			 *        @example
			 *        var searchBarElement = document.getElementById("searchbar"),
			 *            searchBarWidget = tau.widget.SearchBar(searchBarElement),
			 *            value = searchBarWidget.value();
			 *            // value contains inner text of button
			 *
			 *        buttonWidget.value( "New text" ); // "New text" will be text of button
			 *
			 *        // or
			 *
			 *        $( "#searchbar" ).searchbar( "value" );
			 *        // value contains inner text of button
			 *
			 *        $( "#searchbar" ).searchbar( "value", "New text" );
			 *        // "New text" will be value of input
			 *
			 * @method value
			 * @param {string} [value] Value to set on widget
			 * @return {string} In get mode return value of widget.
			 * @since 2.3
			 * @member ns.widget.mobile.SearchBar
			 */

			/**
			 * Gets value for widget
			 * @method _getValue
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._getValue = function () {
				return this.element.value;
			};

			/**
			 * Sets value for widget
			 * @param {HTMLElement} element base element of widget
			 * @param {string} value value to set
			 * @protected
			 * @member ns.widget.mobile.SearchBar
			 */
			SearchBar.prototype._setValue = function (element, value) {
				element.value = value;
			};

			/**
			 * Refresh method is not supported in this widget.
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.SearchBar
			 */

			/**
			 * Destroy method is not supported in this widget.
			 *
			 * @method refresh
			 * @chainable
			 * @member ns.widget.mobile.SearchBar
			 */
			ns.widget.mobile.SearchBar = SearchBar;
			engine.defineWidget(
				"SearchBar",
				"input[name='search'], div[data-type='search'], div[data-type='tizen-search'], .ui-searchbar",
				[],
				SearchBar,
				"mobile"
			);
			}(window.document, ns));

/*global window, ns, define */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * # Swipe Widget
 * Widget adds swiped covers to element.
 *
 * ## Default selectors
 * All elements which have a class _.ui-swipe_ or an attribute _data-role=swipe_
 * will become a Swipe widget.
 *
 * ### HTML examples
 *
 * #### Create a swipe widget using the data-role attribute with one covered item
 *
 *        @example
 *        <div id="swipe" data-role="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 * #### Create swipe widget using the class
 *
 *        @example
 *        <div id="swipe" class="ui-swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 * ## Manual constructor
 * For manual creation of swipe widget you can use constructor of widget:
 *
 *        @example
 *        <div id="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            var swipeElement = document.getElementById("swipe"),
 *                swipe = tau.widget.Swipe(swipeElement);
 *        </script>
 *
 *  If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div id="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            var swipe = $("#swipe").swipe();
 *        </script>
 *
 * ## Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        var swipeElement = document.getElementById("swipe"),
 *            swipe = tau.widget.Swipe(swipeElement);
 *
 *        swipe.methodName(methodArgument1, methodArgument2, ...);
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        $(".selector").swipe("methodName", methodArgument1, methodArgument2, ...);
 *
 *
 * ## Opening swipe
 * There are three ways to open swipe widget.
 *
 * ### Opening by swiping
 *
 * To uncover items of widget, you can swipe over an element.
 *
 *        @example
 *        <div id="swipe" data-role="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 * ### Opening manually by using method "open"
 *
 * To uncoer items of widget,the method "open" can be used.
 *
 *        @example
 *        <div id="swipe" data-role="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
 *            swipeWidget.open();
 *        <script>
 *
 * If jQuery is loaded:
 *
 *        @example
 *        <div id="swipe" data-role="swipe">
 *            <div data-role="swipe-item-cover">
 *                Cover - swipe to open
 *            </div>
 *            <div data-role="swipe-item">
 *                <div data-role="button" data-inline="true">First item</div>
 *            </div>
 *        </div>
 *
 *        <script>
 *            $("#swipe").swipe("open");
 *        <script>
 *
 *
 * @class ns.widget.mobile.Swipe
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				var Swipe = function () {
					var self = this;

					/**
					 * Object with default options
					 * @property {Object} options
					 * @property {?string} [options.theme=null] Sets the color
					 * scheme for the swipe contents.
					 * @member ns.widget.mobile.Swipe
					 */
					self.options = {
						theme: null
					};
					self._isOpen = false;
					self.moveAnimation = null;
					self.opacityAnimation = null;
				},
				/**
				 * Alias for {@link ns.widget.BaseWidget}
				 * @property {Object} Widget
				 * @member ns.widget.mobile.Swipe
				 * @private
				 * @static
				 */
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * Alias for class ns.engine
				 * @property {ns.engine} engine
				 * @member ns.widget.mobile.Swipe
				 * @private
				 * @static
				 */
				engine = ns.engine,
				/**
				 * Alias for class ns.event
				 * @property {Object} events
				 * @member ns.widget.mobile.Swipe
				 * @private
				 */
				events = ns.event,
				Animation = ns.util.anim.Animation,
				slice = [].slice,
				prototype,
				classPrefix = "ui-swipe",
				classes = {
					uiBodyPrefix: "ui-body-",
					uiSwipe: classPrefix,
					uiSwipeItem: classPrefix + "-item",
					uiSwipeItemCover: classPrefix + "-item-cover",
					uiSwipeItemCoverInner: classPrefix + "-item-cover-inner"
				},
				selectorRoleSwipe = "[data-role='swipe']",
				selectorRoleSwipeItemCover = "[data-role='swipe-item-cover']" +
					", ." + classes.uiSwipeItemCover,
				selectorRoleSwipeItem = "[data-role='swipe-item']" +
					", ." + classes.uiSwipeItem,
				classUiBtn = ".ui-btn",
				swipeLeftEvent = "swipeleft",
				swipeRightEvent = "swiperight";

			Swipe.prototype = new BaseWidget();

			prototype = Swipe.prototype;

			/**
			 * Dictionary for swipe related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.Swipe
			 * @static
			 * @readonly
			 */
			prototype.classes = classes;

			/**
			 * This method cleans up DOM modification made during building process.
			 * It is called during refreshing and destroying.
			 * @method cleanupDom
			 * @param {ns.widget.mobile.Swipe} self Widget
			 * @param {HTMLElement} element Element of widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function cleanupDom(self, element) {
				var covers,
					item,
					itemHasThemeClass,
					defaultCoverTheme = classes.uiBodyPrefix + self.options.theme,
					coverTheme = defaultCoverTheme,
					wrapper,
					selfUi = self._ui;

				if (selfUi) {
					covers = selfUi.covers;
					item = selfUi.item;

					element.classList.remove(classes.uiSwipe);
					item.classList.remove(classes.uiSwipeItem);

					itemHasThemeClass = element.className.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);
					if (itemHasThemeClass) {
						coverTheme = itemHasThemeClass[0];
					}

					covers.forEach(function (cover) {
						var coverClassList = cover.classList;

						coverClassList.remove(classes.uiSwipeItemCover);
						coverClassList.remove(coverTheme);

						wrapper = cover.querySelector("." + classes.uiSwipeItemCoverInner);
						while (wrapper.firstChild) {
							cover.appendChild(wrapper.firstChild);
						}
						wrapper.parentNode.removeChild(wrapper);
					});
				}
			}

			/**
			 * This is callback for the animation which is triggered
			 * when cover is moved or opacity is changed.
			 * @method handleAnimationEnd
			 * @param {ns.util.anim.Animation} animation Animation
			 * @param {HTMLElement} element Element of widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function handleAnimationEnd(animation, element) {
				var to = animation.options.to;

				if (to.opacity !== undefined) {
					//@TODO implement "preserve" option in ns.util.anim.Animation
					element.style.opacity = animation.options.to.opacity;
					animation.destroy();
				}
				if (to.left !== undefined) {
					//@TODO implement "preserve" option in ns.util.anim.Animation
					element.style.left = animation.options.to.left;
					animation.destroy();
					events.trigger(element, "swipeanimationend");
				}
			}

			/**
			 * This is callback for the animation which is triggered
			 * when cover is moved or opacity is changed.
			 * @method animateCover
			 * @param {ns.widget.mobile.Swipe} self Widget
			 * @param {HTMLElement} cover Cover element
			 * @param {number} leftPercentage Percentage of opening
			 * @param {HTMLElement} item Item of widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function animateCover(self, cover, leftPercentage, item) {
				var coverStyle = cover.style,
					itemStyle = item.style,
					moveAnimation,
					opacityAnimation,
					swipeWidget;

				slice.call(self.element.parentNode.querySelectorAll(selectorRoleSwipe)).forEach(function (swipe) {
					swipeWidget = engine.instanceWidget(swipe, "Swipe");
					if (self !== swipeWidget && swipeWidget.opened()) {
						swipeWidget.close();
					}
				});

				self._isOpen = leftPercentage === 110;

				//To pass tests the animation can be triggered only once.
				//Then I need to have a reference to previous animations,
				//in order to destroy it when new animations appear
				if (self.moveAnimation) {
					self.moveAnimation.destroy();
					self.opacityAnimation.destroy();
				}

				//animations change the left value to uncover/ cover item element
				moveAnimation = new Animation({
					element: cover,
					duration: "400ms",
					from: {
						"left": coverStyle.left
					},
					to: {
						"left": leftPercentage + "%"
					},
					onEnd: handleAnimationEnd
				});
				self.moveAnimation = moveAnimation;
				moveAnimation.play();

				//animations change item opacity in order to show items under cover
				opacityAnimation = new Animation({
					element: item,
					duration: "400ms",
					from: {
						"opacity": itemStyle.opacity
					},
					to: {
						"opacity": (self.opened()) ? "1" : "0"
					},
					onEnd: handleAnimationEnd
				});
				self.opacityAnimation = opacityAnimation;
				opacityAnimation.play();
			}

			/**
			 * This method sets up widget's element.
			 * It is called during building and refreshing process.
			 * @method refresh
			 * @param {ns.widget.mobile.Swipe} self Widget
			 * @param {HTMLElement} element Element of widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function refresh(self, element) {
				var defaultCoverTheme = "",
					covers = null,
					coverTheme = "",
					item = null,
					itemHasThemeClass = null,
					ui = null;

				cleanupDom(self, element);

				defaultCoverTheme = classes.uiBodyPrefix + self.options.theme;
				covers = slice.call(element.querySelectorAll(selectorRoleSwipeItemCover));
				coverTheme = defaultCoverTheme;
				item = element.querySelector(selectorRoleSwipeItem);
				itemHasThemeClass = element.className.match(/ui\-body\-[a-z]|ui\-bar\-[a-z]/);
				ui = self._ui || {};

				/*
				 * @todo good support multicovers
				 */
				ui.covers = covers;
				ui.item = item;
				self._ui = ui;

				element.classList.add(classes.uiSwipe);
				item.classList.add(classes.uiSwipeItem);

				covers.forEach(function (cover) {
					var span,
						coverClassList = cover.classList;

					if (itemHasThemeClass) {
						coverTheme = itemHasThemeClass[0];
					}

					coverClassList.add(classes.uiSwipeItemCover);
					coverClassList.add(coverTheme);

					if (!cover.querySelector("." + classes.uiSwipeItemCoverInner)) {
						span = document.createElement("span");
						span.classList.add(classes.uiSwipeItemCoverInner);
						while (cover.firstChild) {
							span.appendChild(cover.firstChild);
						}
						cover.appendChild(span);
					}
				});
			}

			/**
			 * This method builds structure of swipe widget.
			 * @method _build
			 * @param {HTMLElement} element Element of widget
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Swipe
			 */
			prototype._build = function (element) {
				refresh(this, element);
				return element;
			};

			/**
			 * This method inits structure of swipe widget.
			 * @method _init
			 * @param {HTMLElement} element Element of widget
			 * @protected
			 * @member ns.widget.mobile.Swipe
			 */
			prototype._init = function (element) {
				/* @TODO what is swipeSelectors? */
				var swipeSelectors = {};
				/* @TODO end */

				this._ui = this._ui || {
					covers: slice.call(element.querySelectorAll(selectorRoleSwipeItemCover)),
					item: element.querySelector(swipeSelectors.swipeItem)
				};
			};

			/**
			 * This method binds events to widget.
			 * @method addEvents
			 * @param {ns.widget.mobile.Swipe} self Widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function addEvents(self) {
				var ui = self._ui,
					covers = ui.covers,
					item = ui.item,
					buttonSelector = engine.getWidgetDefinition("Button").selector;

				/*
				 * @todo good support multicovers
				 */

				covers.forEach(function (cover) {
					cover.swipeAnimateLeft = animateCover.bind(null, self, cover, 0, item);
					cover.swipeAnimateRight = animateCover.bind(null, self, cover, 110, item);

					item.addEventListener(swipeLeftEvent, cover.swipeAnimateLeft, false);
					cover.addEventListener(swipeRightEvent, cover.swipeAnimateRight, false);

					[].forEach.call(item.querySelectorAll(buttonSelector), function (button) {
						button.addEventListener("vclick", cover.swipeAnimateLeft, false);
					});
				});
			}

			/**
			 * This method unbinds events to widget.
			 * @method removeEvents
			 * @param {ns.widget.mobile.Swipe} self Widget
			 * @private
			 * @static
			 * @member ns.widget.mobile.Swipe
			 */
			function removeEvents(self) {
				var selfUI = self._ui,
					covers = selfUI.covers,
					item = selfUI.item;

				/*
				 * @todo good support multicovers
				 */

				covers.forEach(function (cover) {
					item.removeEventListener(swipeLeftEvent, cover.swipeAnimateLeft, false);
					cover.removeEventListener(swipeRightEvent, cover.swipeAnimateRight, false);

					slice.call(item.querySelectorAll(classUiBtn)).forEach(function (button) {
						button.removeEventListener("vclick", cover.swipeAnimateLeft, false);
					});
				});
			}

			/**
			 * This method binds events to widget.
			 * @method _bindEvents
			 * @protected
			 * @member ns.widget.mobile.Swipe
			 */
			prototype._bindEvents = function () {
				addEvents(this);
			};

			/**
			 * This method refreshes swipe widget.
			 *
			 * It re-builds the whole widget.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.refresh();
			 *        <script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div  id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("refresh");
			 *        </script>
			 *
			 * @method refresh
			 * @member ns.widget.mobile.Swipe
			 */
			/**
			 * This method refreshes widget.
			 * @method _refresh
			 * @protected
			 * @member ns.widget.mobile.Swipe
			 */
			prototype._refresh = function () {
				refresh(this, this.element);
			};

			/**
			 * Removes the swipe functionality completely.
			 *
			 * This will return the element back to its pre-init state.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.destroy();
			 *        <script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div  id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("destroy");
			 *        </script>
			 *
			 * @method destroy
			 * @member ns.widget.mobile.Swipe
			 */
			/**
			 * This method destroys widget.
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.Swipe
			 */
			prototype._destroy = function () {
				var self = this;

				removeEvents(self);
				cleanupDom(self, self.element);
			};

			/**
			 * This method runs opening animations.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.open();
			 *        <script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div  id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("open");
			 *        </script>
			 *
			 * @method open
			 * @member ns.widget.mobile.Swipe
			 */
			prototype.open = function () {
				var self = this,
					ui = self._ui;

				ui.covers.forEach(function (cover) {
					animateCover(self, cover, 110, ui.item);
				});
			};

			/**
			 * This method checks if swipe element is opened.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *                isOpened = swipeWidget.opened();
			 *        <script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div  id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var isOpened = $("#swipe").swipe("opened");
			 *        </script>
			 *
			 * @method opened
			 * @return {boolean} True, if swipe element is opened.
			 * Otherwise, it returns false.
			 * @member ns.widget.mobile.Swipe
			 */
			prototype.opened = function () {
				return this._isOpen;
			};

			/**
			 * This method runs closing animations.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.close();
			 *        <script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div  id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("close");
			 *        </script>
			 *
			 * @method close
			 * @member ns.widget.mobile.Swipe
			 */
			prototype.close = function () {
				var self = this,
					ui = self._ui;

				ui.covers.forEach(function (cover) {
					animateCover(self, cover, 0, ui.item);
				});
			};


			/**
			 * This method changes state of swipe on enabled and removes CSS classes connected with state.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.enable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("enable");
			 *        </script>
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.Swipe
			 */

			/**
			 * This method changes state of swipe on disabled and adds CSS classes connected with state.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.disable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("disable");
			 *        </script>
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.Swipe
			 */

			/**
			 * The function "value" is not supported in this widget.
			 *
			 * @method value
			 * @chainable
			 * @member ns.widget.mobile.Swipe
			 */

			/**
			 * Get/Set options of the widget.
			 *
			 * This method can work in many context.
			 *
			 * If first argument is type of object them, method set values for options given in object. Keys of object are names of options and values from object are values to set.
			 *
			 * If you give only one string argument then method return value for given option.
			 *
			 * If you give two arguments and first argument will be a string then second argument will be intemperate as value to set.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe")),
			 *                optionValue;
			 *
			 *            optionValue = swipeWidget.option("theme"); // read value of option theme
			 *            swipeWidget.option("theme", "a") // set value
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            optionValue = $("#swipe").swipe("option", "theme");
			 *            $("#swipe").swipe("option", "theme", "a");
			 *        </script>
			 *
			 * @method option
			 * @param {string|Object} [name] name of option
			 * @param {*} value value to set
			 * @member ns.widget.mobile.Swipe
			 * @return {*} return value of option or undefined if method is called in setter context
			 */

			/**
			 * Trigger an event on widget's element.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe"));
			 *            swipeWidget.trigger("eventName");
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            $("#swipe").swipe("trigger", "eventName");
			 *        </script>
			 *
			 * @method trigger
			 * @param {string} eventName the name of event to trigger
			 * @param {?*} [data] additional object to be carried with the event
			 * @param {boolean} [bubbles=true] indicating whether the event bubbles up through the DOM or not
			 * @param {boolean} [cancelable=true] indicating whether the event is cancelable
			 * @return {boolean} false, if any callback invoked preventDefault on event object
			 * @member ns.widget.mobile.Swipe
			 */

			/**
			 * Add event listener to widget's element.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe")),
			 *                callback = function () {
			 *					console.log("event fires");
			 *				});
			 *
			 *            swipeWidget.on("eventName", callback);
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var callback = function () {
			 *					console.log("event fires");
			 *				});
			 *
			 *            $("#swipe").swipe("on", "eventName", callback);
			 *        </script>
			 *
			 * @method on
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param to addEventListener
			 * @member ns.widget.mobile.Swipe
			 */

			/**
			 * Remove event listener to widget's element.
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            var swipeWidget = tau.widget.Swipe(document.getElementById("swipe")),
			 *                callback = function () {
			 *					console.log("event fires");
			 *				});
			 *
			 *            // add callback on event "eventName"
			 *            swipeWidget.on("eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            swipeWidget.off("eventName", callback);
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div id="swipe" data-role="swipe">
			 *            <div data-role="swipe-item-cover">
			 *                Swipe
			 *            </div>
			 *            <div data-role="swipe-item">
			 *                <div data-role="button" data-inline="true">First item</div>
			 *                <div data-role="button" data-inline="true">Second item</div>
			 *            </div>
			 *        </div>
			 *
			 *        <script>
			 *            // add callback on event "eventName"
			 *            $("#swipe").swipe("on", "eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            $("#swipe").swipe("off", "eventName", callback);
			 *        </script>
			 *
			 * @method off
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param to addEventListener
			 * @member ns.widget.mobile.Swipe
			 */

			ns.widget.mobile.Swipe = Swipe;
			engine.defineWidget(
				"Swipe",
				selectorRoleSwipe + ", .ui-swipe",
				["open", "opened", "close"],
				Swipe,
				"tizen"
			);
			}(window.document, ns));

/*global window, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * # TextInput Extra
 *
 * This is support component for deprecated method in TextInput
 *
 * @class ns.widget.mobile.TextInputExtra
 * @extends ns.widget.mobile.TextInput
 */
(function (window, document, ns) {
	"use strict";
				var TextInputExtra = ns.widget.mobile.TextInput,

				/**
				 * Alias for class {@link ns.engine}
				 * @property {Object} engine
				 * @member ns.widget.mobile.TextInputExtra
				 * @private
				 * @static
				 */
				engine = ns.engine,
				objectUtils = ns.util.object,
				/**
				 * Alias for class {@link ns.util.DOM}
				 * @property {Object} DOM
				 * @member ns.widget.mobile.TextInputExtra
				 * @private
				 * @static
				 */
				selector = ".ui-textinput",

				/**
				 * Backup of _configure methods for replacing it
				 * @method parentConfigure
				 * @member ns.widget.mobile.TextInputExtra
				 * @private
				 */
				parentConfigure = TextInputExtra.prototype._configure;


			TextInputExtra.selector = selector;


			TextInputExtra.prototype._configure = function () {
				var self = this;

				if (typeof parentConfigure === "function") {
					parentConfigure.call(this);
				}

				self.options = objectUtils.merge({}, TextInputExtra.defaults, {
					clearSearchButtonText: "clear text",
					disabled: false,
					mini: null
				});
			};

			/**
			 * Finds label tag for element.
			 * @method _findLabel
			 * @param {HTMLElement} element
			 * @member ns.widget.mobile.TextInputExtra
			 * @return {HTMLElement}
			 */
			TextInputExtra.prototype._findLabel = function (element) {
				return element.parentNode.querySelector("label[for='" + element.id + "']");
			};
			/**
			 * Returns label value.
			 * @method getLabel
			 * @return {string} Label value or null
			 * @member ns.widget.mobile.TextInputExtra
			 */
			TextInputExtra.prototype.getLabel = function () {
				var label = this._findLabel(this.element);

				if (label !== null) {
					return label.innerHTML;
				}
				return null;
			};

			/**
			 * Sets label value.
			 * @method setLabel
			 * @param {string} text Label text
			 * @member ns.widget.mobile.TextInputExtra
			 */
			TextInputExtra.prototype.setLabel = function (text) {
				var self = this,
					element = self.element,
					label;

				if (typeof text === "string") {
					label = self._findLabel(element);
					if (label === null) {
						// create new label
						label = document.createElement("label");
						label.setAttribute("for", element.id);
						// add to parent
						element.parentElement.appendChild(label);
					}
					label.innerHTML = text;
				}
			};

			engine.defineWidget(
				"TextInput",
				"input[type='text']:not([data-role])" +
				", input[type='number']:not([data-role])" +
				", input[type='password']:not([data-role])" +
				", input[type='email']:not([data-role])" +
				", input[type='url']:not([data-role])" +
				", input[type='tel']:not([data-role])" +
				", input[type='month']:not([data-role])" +
				", input[type='week']:not([data-role])" +
				", input[type='datetime-local']:not([data-role])" +
				", input[type='color']:not([data-role])" +
				", textarea" +
				", input:not([type]):not([data-role]):not(.ui-checkbox):not(.ui-tizenslider)" +
				", " + selector,
				["getLabel", "setLabel"],
				TextInputExtra,
				"mobile"
			);

			}(window, window.document, ns));

/*global window, ns, define */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */

/* Added to classes:
 *   + ui-tokentextarea display flex
 *   + ui-tokentextarea-input added flex
 *   + ui-tokentextarea-span-block added flex
 *   + ui-tokentextarea-desclabel added padding
 *
 * Delete from class:
 *   + ui-tokentextarea-link-base deleted position
 *
 * Changed classes:
 *   + ui-tokentextarea div to ui-tokentextarea-span-block
 * Added class for hiding element:
 *   + span.ui-tokentextarea-invisible
 *
 * All was made for better responsivity and locations tokens.
 *
 */

/**
 * #TokenTextArea widget
 * The TokenTextArea widget changes a text item to a button. It can be
 * comprised of a number of button widgets. When a user types text and the text
 * gets a specific event to change from a text to a button, the input text is
 * changed to a TokenTextArea widget. A user can add the TokenTextArea widget
 * to a contact list, email list, or another list.
 *
 * The typical use of this
 * widget is composing a number of contacts or phone numbers in a specific area
 * of the screen. The TokenTextArea widget enables the user to enter text and
 * convert it to a button. Each button that is created from entered text as a
 * result of a change event forms a token text area widget. This widget is
 * useful in composing an e-mail or SMS message to a group of addresses,
 * each of which is a clickable item for more actions, such as copying,
 * editing, or removing the address.
 *
 * ##HTML Examples
 * ###Create simple Tokentextarea from div using data-role:
 *
 *        @example
 *            <div data-role="tokentextarea"></div>

 * ###Create simple Tokentextarea from div using class:
 *
 *        @example
 *            <div class="ui-tokentextarea"></div>
 *
 * ##Manual constructor
 * ###For manual creation of progressbar widget you can use constructor
 * of widget:
 *
 *        @example
 *            <div id="ns-tokentextarea"><div>
 *             <script>
 *                var token = tau.widget.Tokentextarea(
 *                    document.getElementById('ns-tokentextarea')
 *                );
 *            </script>
 *
 * If jQuery library is loaded, it's method can be used:
 *
 *        @example
 *            <div id="ns-tokentextarea"><div>
 *             <script>
 *                $("#ns-tokentextarea").tokentextarea();
 *            </script>
 *
 *    ##Options for Tokentextarea Widget
 *
 *    Options for widget can be defined as _data-..._ attributes or give as
 *    parameter in constructor.
 *
 * You can change option for widget using method **option**.
 *
 * ###data-label
 * Label for a user guide
 * Provide custom label for the user guide, for example, while composing
 * an sms message "Send to: " label is a user guide to enter phone number
 * or choose recipient from address book.
 *
 *        @example
 *            <div data-role="tokentextarea" data-label="Send to: "></div>
 *
 * ####data-link
 * Represents the id of the page or the URL of other HTML file.
 * The page contains data for the user, for example, an address book.
 * If the value is null, anchor button doesn't work. (Default : null)
 *
 *        @example
 *            <div data-role="tokentextarea" data-link="bar.html"></div>
 *
 * ###data-description
 * This attribute is managing message format.
 * This message is displayed when widget status was changed to 'focusout'.
 * (Default : '+ {0}')
 *
 *        @example
 *            <div data-role="tokentextarea" data-description="bar + {0}"></div>
 *
 *
 * ##Options for Tokentextarea Widget
 *
 * Options for widget can be get/set .
 *
 * ###You can change option for widget using method **option**.
 * Initialize the widget
 *
 *        @example
 *            <script>
 *                var elementToken = document.getElementById("ns-tokentextarea"),
 *                Tokentextarea = tau.widget.Tokentextarea(elementToken);
 *            </script>
 *
 * ### Custom Label
 * Get or set the label option, after initialization
 *
 *        @example
 *            <script>
 *                //getter
 *                Tokentextarea.option( "label" );
 *
 *                //setter
 *                Tokentextarea.option( "label", "e-mail To:" );
 *            </script>
 *
 * ### Custom Link
 * Get or set the link option, after initialization
 *
 *        @example
 *            <script>
 *                //getter
 *                Tokentextarea.option( "link" );
 *
 *                //setter
 *                Tokentextarea.option( "link", "favorites.html");
 *            </script>
 *
 * ### Custom description
 * Get or set the link option, after initialization
 *
 *        @example
 *            <script>
 *                //getter
 *                Tokentextarea.option( "description" );
 *
 *                //setter
 *                Tokentextarea.option( "description", "bar + {0}");
 *            </script>
 *
 * ##Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        var elementToken = document.getElementById("ns-tokentext"),
 *            tokentextarea = tau.widget.Tokentextarea(elementToken);
 *
 *        tokentextarea.methodName(methodArgument1, methodArgument2, ...);
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        $(".selector").tokentextarea("methodName", methodArgument1, ...);
 *
 * @author Kamil Stepczuk <k.stepczuk@samsung.com>
 * @class ns.widget.mobile.TokenTextarea
 * @extends ns.widget.BaseWidget
 */

(function (window, ns) {
	"use strict";
	
			/**
			 * BaseWidget alias variable
			 * @property {Object} BaseWidget alias variable
			 * @private
			 * @static
			 */
			var BaseWidget = ns.widget.mobile.BaseWidgetMobile,

				/**
				 * Engine alias variable
				 * @property {ns.engine} engine alias variable
				 * @private
				 * @static
				 * @member ns.widget.mobile.Tokentextarea
				 */
				engine = ns.engine,

				/**
				 * Alias for class ns.selectors
				 * @property {Object} selectors
				 * @private
				 * @static
				 * @member ns.widget.mobile.Tokentextarea
				 */
				selectors = ns.util.selectors,

				/**
				 * Dictionary object containing commonly used widget classes
				 * @property {Object} classes
				 * @static
				 * @private
				 * @readonly
				 * @member ns.widget.mobile.TokenTextarea
				 */
				classes = {
					uiTokentextarea: "ui-tokentextarea",
					uiTokentextareaLabel: "ui-tokentextarea-label",
					uiTokentextareaInput: "ui-tokentextarea-input",
					uiTokentextareaInputVisible: "ui-tokentextarea-input-visible",
					uiTokentextareaInputInvisible: "ui-tokentextarea-input-invisible",
					uiinputText: "ui-input-text",
					uiBodyS: "ui-body-s",
					uiTokentextareaLinkBase: "ui-tokentextarea-link-base",
					uiBtnBoxS: "ui-btn-box-s",
					uiTokentextareaSblock: "ui-tokentextarea-sblock",
					uiTokentextareaBlock: "ui-tokentextarea-block",
					uiTokentextareaFocusout: "ui-tokentextarea-focusout",
					uiTokentextareaFocusin: "ui-tokentextarea-focusin",
					uiTokentextareaSpanBlock: "ui-tokentextarea-span-block",
					uiTokentextareaInputArea: "ui-tokentextarea-input-area",
					uiTokentextareaDesclabel: "ui-tokentextarea-desclabel",
					uiTokentextareaInvisible: "ui-tokentextarea-invisible"
				},

				/**
				 * Alias to Page.selector from widget definition
				 * @private
				 * @static
				 * @readonly
				 * @member ns.widget.mobile.Tokentextarea
				 */
				pageSelector = engine.getWidgetDefinition("Page").selector,

				/**
				 * Dictionary for keyboard codes
				 * @property {Object} keyCode
				 * @private
				 * @readonly
				 * @static
				 * @member ns.widget.mobile.Tokentextarea
				 */
				keyCode = {
					BACKSPACE: 8,
					ENTER: 13,
					SEMICOLON: 186,
					COMMA: 188
				},

				/**
				 * Local constructor function
				 * @method Tokentextarea
				 * @private
				 * @member ns.widget.mobile.TokenTextarea
				 */
				Tokentextarea = function () {
					/**
					 * Focus state
					 * @property {boolean} [_focusStatus=true]
					 * @member ns.widget.mobile.TokenTextarea
					 */
					this._focusStatus = true;
					/**
					 * Object with default options
					 * @property {Object} options
					 * @property {string} [options.label="To : "] Sets a label
					 * as a guide for the user
					 * @property {string} [link=""] Sets the ID of the page or
					 * the URL of other HTML file
					 * @property {string} [options.description="+ {0}"] Manages
					 * the message format
					 * @member ns.widget.mobile.TokenTextarea
					 */
					this.options = {
						label: "To : ",
						link: "",
						description: "+ {0}"
					};
					/**
					 *
					 * @property {?Function|null} [inputKeyUp=null]
					 * @private
					 * @member ns.widget.mobile.TokenTextarea
					 */
					this.inputKeyUp = null;
				};

			Tokentextarea.prototype = new BaseWidget();

			Tokentextarea.classes = classes;

			Tokentextarea.keyCode = keyCode;

			/**
			 * Object containing commonly used widget strings
			 * @property {Object} strings
			 * @property {string} strings.doubleTapToEdit Is used to set aria
			 * label for token text area button
			 * @property {string} strings.moreDoubleTapToEdit Is used to set
			 * aria label for grouped hidden tokens
			 * @property {string} strings.addRecipient Is used to add text to
			 * the button linked to external page or URL
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.strings = {
				doubleTapToEdit: "double tap to edit",
				moreDoubleTapToEdit: "more, double tap to edit",
				addRecipient: "Add recipient"
			};

			/**
			 * Function for select block
			 * @method _selectBlock
			 * @param {HTMLElement} block
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _selectBlock(block) {
				var blockClasses = block.classList;

				blockClasses.add(classes.uiTokentextareaSblock);
				blockClasses.remove(classes.uiTokentextareaBlock);
			}

			/**
			 * Function for unselect block
			 * @method _unselectBlock
			 * @param {HTMLElement} block
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _unselectBlock(block) {
				var blockClasses = block.classList;

				blockClasses.remove(classes.uiTokentextareaSblock);
				blockClasses.add(classes.uiTokentextareaBlock);
			}

			/**
			 * Function set max width for block element
			 * Function will be deleted when 'overflow: hidden' and
			 * 'text-overflow: ellipsis' will work with percent value max width.
			 * @method setMaxSizeBlock
			 * @param {HTMLElement} element
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function setMaxSizeBlock(element) {
				var parent = element.parentNode,
					maxWidth;

				maxWidth = parent.offsetWidth / 2;
				element.style.maxWidth = maxWidth + "px";
			}

			/**
			 * Function remove text block from widget
			 * @method _removeTextBlock
			 * @param {HTMLElement} element
			 * @param {number} blockIndex
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _removeTextBlock(element, blockIndex) {
				var blockParent,
					block,
					blockLength,
					i;

				if (arguments.length === 1) {
					element.parentNode.removeChild(element);
				} else {
					block = element.getElementsByClassName(
						classes.uiTokentextareaSpanBlock
					);
					blockLength = block.length;
					if (blockLength === 0) {
						return;
					}
					blockParent = block[0].parentNode;
					if (blockIndex !== null && blockIndex < blockLength) {
						blockParent.removeChild(block[blockIndex]);
					} else {
						for (i = blockLength - 1; i >= 0; i--) {
							blockParent.removeChild(block[i]);
						}
					}
				}
			}

			/**
			 * Handler function for click to block
			 * @method blockClick
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function blockClick(event) {
				var element = event.target,
					parent = element.parentNode,
					widget = ns.engine.instanceWidget(parent),
					lockBlock;

				if (widget._focusStatus) {
					if (element.classList.contains(
						classes.uiTokentextareaSblock)) {
						_removeTextBlock(element);
					} else {
						lockBlock = parent.getElementsByClassName(
							classes.uiTokentextareaSblock)[0];
						if (lockBlock !== undefined) {
							_unselectBlock(lockBlock);
						}
						_selectBlock(element);
					}
				} else {
					widget.focusIn();
				}
			}

			/**
			 * Function bind event vclick for block
			 * @method _bindBlockEvents
			 * @param {HTMLElement} block
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _bindBlockEvents(block) {
				block.addEventListener("vclick", blockClick, false);
			}

			/**
			 * Function add block into widget
			 * @method _addTextBlock
			 * @param {HTMLElement} element
			 * @param {string} messages
			 * @param {number} blockIndex
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _addTextBlock(element, messages, blockIndex) {
				var strings = Tokentextarea.strings,
					textBlock,
					textBlockClasses,
					input,
					blocks;

				blocks = element.getElementsByClassName(
					classes.uiTokentextareaSpanBlock
				);
				textBlock = document.createElement("div");
				textBlock.textContent = messages;
				textBlockClasses = textBlock.classList;
				textBlockClasses.add(classes.uiTokentextareaBlock);
				textBlockClasses.add(classes.uiTokentextareaSpanBlock);
				textBlock.setAttribute("aria-label", strings.doubleTapToEdit);
				textBlock.tabIndex = 0;
				if (blockIndex !== null && blockIndex < blocks.length) {
					element.insertBefore(textBlock, blocks[blockIndex]);
				} else {
					input = element.childNodes[element.childNodes.length - 1];
					element.insertBefore(textBlock, input);
				}
				setMaxSizeBlock(textBlock);
				_bindBlockEvents(textBlock);
			}

			/**
			 * Changes maximum size each token text block
			 * @method setMaxSizeForAllBlocks
			 * @param {HTMLElement} element
			 * @private
			 * @static
			 * @member ns.widget.mobile.Tokentextarea
			 */
			function setMaxSizeForAllBlocks(element) {
				var blocks = element.getElementsByClassName(
					classes.uiTokentextareaSpanBlock
					),
					blocksLength = blocks.length,
					i;

				for (i = 0; i < blocksLength; i++) {
					setMaxSizeBlock(blocks[i]);
				}
			}

			/**
			 * Function validate last block
			 * @method _validateTargetBlock
			 * @param {HTMLElement} container
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _validateTargetBlock(container) {
				var block,
					lastBlock,
					lastBlockClasses;


				block = container.getElementsByClassName(
					classes.uiTokentextareaSpanBlock
				);
				lastBlock = block[block.length - 1];
				lastBlockClasses = lastBlock.classList;

				if (lastBlockClasses.contains(classes.uiTokentextareaSblock)) {
					_removeTextBlock(lastBlock);
				} else {
					_selectBlock(lastBlock);
				}
			}

			/**
			 * Function unselect block in widget
			 * @method _unlockTextBlock
			 * @param {HTMLElement} element
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _unlockTextBlock(element) {
				var selectedBlock = element.getElementsByClassName(
					classes.uiTokentextareaSblock)[0];

				if (selectedBlock !== undefined) {
					_unselectBlock(selectedBlock);
				}
			}

			/**
			 * Handler function for event keyUp
			 * @method inputKeyUp
			 * @param {HTMLElement} element
			 * @param {Event} event
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function inputKeyUp(element, event) {
				var keyValue = event.keyCode,
					input = element.getElementsByTagName("input")[0],
					inputValue = input.value,
					messages = [],
					messagesLength,
					i;

				if (keyValue === keyCode.BACKSPACE) {
					if (inputValue.length === 0) {
						_validateTargetBlock(element);
					}
				} else if (keyValue === keyCode.ENTER ||
					keyValue === keyCode.SEMICOLON ||
					keyValue === keyCode.COMMA) {
					if (inputValue.length !== 0) {
						messages = inputValue.split(/[,;]/);
						messagesLength = messages.length;
						for (i = 0; i < messagesLength; i++) {
							messages[i] = messages[i].trim();
							if (messages[i].length !== 0) {
								_addTextBlock(element, messages[i]);
							}
						}
					}
					input.value = "";
				} else {
					_unlockTextBlock(element);
				}
			}

			/**
			 * Build widget structure
			 * @method _build
			 * @protected
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype._build = function (element) {
				var strings = Tokentextarea.strings,
					option = this.options,
					moreBlockClasses,
					inputBox,
					inputBoxClasses,
					inputArea,
					labelTag,
					moreBlock;

				inputBox = document.createElement("input");
				labelTag = document.createElement("span");
				moreBlock = document.createElement("a");
				inputArea = document.createElement("div");

				inputBoxClasses = inputBox.classList;

				inputArea.classList.add(classes.uiTokentextareaInputArea);
				element.classList.add(classes.uiTokentextarea);

				inputBox.style.minWidth = 3 + "rem";
				inputBox.style.width = 100 + "%";

				labelTag.textContent = option.label;
				labelTag.classList.add(classes.uiTokentextareaLabel);
				labelTag.tabIndex = 0;
				element.appendChild(labelTag);


				inputBoxClasses.add(classes.uiTokentextareaInput);
				inputBoxClasses.add(classes.uiTokentextareaInputVisible);
				inputBoxClasses.add(classes.uiinputText);
				inputBoxClasses.add(classes.uiBodyS);

				inputBox.setAttribute("role", "textbox");
				inputArea.appendChild(inputBox);
				engine.instanceWidget(moreBlock, "Button", {
					inline: true,
					icon: "plus",
					style: "circle"
				});

				moreBlockClasses = moreBlock.classList;

				moreBlock.href = option.link;
				moreBlock.tabIndex = 0;
				moreBlockClasses.add(classes.uiTokentextareaLinkBase);
				moreBlockClasses.add(classes.uiBtnBoxS);
				moreBlock.textContent = strings.addRecipient;
				inputArea.appendChild(moreBlock);
				element.appendChild(inputArea);
				return element;
			};

			/**
			 * Method add block
			 *
			 * Method adds new token text widget button with specified text
			 * in place of the index. If index isn't set the token will
			 * be inserted at the end.
			 *
			 *        @example
			 *            <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *            <script>
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.add("foobar");
			 *
			 *                //or
			 *
			 *                $( "#ns-tokentext" ).tokentextarea("add", "foobar");
			 *            </script>
			 *
			 * @method add
			 * @param {string} messages
			 * @param {number} blockIndex
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.add = function (messages, blockIndex) {
				var focusStatus = this._focusStatus,
					element = this.element;

				if (focusStatus) {
					_addTextBlock(element, messages, blockIndex);
				}
			};

			/**
			 * Method delete token; delete all tokens without parameter
			 *
			 * The remove method is used to remove a token text area widget
			 * button at the specified index position. If the parameter
			 * is not defined, all the widget buttons are removed.
			 *
			 *        @example
			 *            <div    data-role="tokentextarea"
			 *                    data-label="Send to: "
			 *                    id="ns-tokentext">
			 *            </div>
			 *            <script>
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.remove(1);
			 *
			 *                //or
			 *
			 *                $( "#ns-tokentext" ).tokentextarea("remove", "1" );
			 *            </script>
			 *
			 * @method remove
			 * @param {number} blockIndex
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.remove = function (blockIndex) {
				var focusStatus = this._focusStatus,
					element = this.element;

				if (focusStatus) {
					_removeTextBlock(element, blockIndex);
				}
			};

			/**
			 * Function return blocks count
			 *
			 * The length method is used to retrieve the number of buttons
			 * in the token text area widget:
			 *
			 *        @example
			 *            <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *            <script>
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.lenght();
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea( "length" );
			 *            </script>
			 *
			 * @method length
			 * @return {number}
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.length = function () {
				var element = this.element;

				return element.getElementsByClassName(
					classes.uiTokentextareaSpanBlock).length;
			};

			/**
			 * Method is used to manage the widget input box text.
			 *
			 * If no parameter is set, the method gets the input box text.
			 * If a parameter is set, the parameter text is set in
			 * the input box.
			 *
			 *        @example
			 *            <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *            <script>
			 *                // !!!set text in the input box text!!!
			 *
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.inputText("foobar");
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea(
			 *                    "inputText" , "foobar");
			 *
			 *                // !!!get the input box text!!!
			 *
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.inputText();
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea( "inputText" );
			 *            </script>
			 *
			 * @method inputText
			 * @param {string} text
			 * @return {string}
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.inputText = function (text) {
				var element = this.element,
					input = element.getElementsByTagName("input")[0];

				if (text !== undefined) {
					input.value = text;
				}
				return input.value;
			};

			/**
			 * The select method is used to select token text area button on its
			 * index value
			 * If a parameter is set, token text area button will be select
			 * the block which is matched with the argument.
			 * If some token text area button is selected and parameter isn't
			 * set method returns string of the selected button.
			 * If none is selected return null
			 *
			 *        @example
			 *            <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *            <script>
			 *                // !!!select first block!!!
			 *
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.add("text 1");
			 *                tokenWidget.add("text 2");
			 *                tokenWidget.select(0);
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea("select" , "0");
			 *
			 *                // !!!gets string from selected block!!!
			 *
			 *                tokenWidget.select();
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea( "select" );
			 *            </script>
			 *
			 * @method select
			 * @param {number} blockIndex
			 * @return {?string}
			 * @public
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.select = function (blockIndex) {
				var focusStatus = this._focusStatus,
					element = this.element,
					block,
					sBlock;

				if (focusStatus) {
					block = element.getElementsByClassName(
						classes.uiTokentextareaSpanBlock);
					sBlock = element.getElementsByClassName(
						classes.uiTokentextareaSblock);

					if (blockIndex !== undefined && blockIndex < block.length) {
						if (sBlock.length === 1) {
							_unselectBlock(sBlock[0]);
						}
						_selectBlock(block[blockIndex]);
					} else if (block.length !== 0) {
						if (sBlock[0]) {
							return sBlock[0].textContent;
						}
					}
				}
				return null;
			};

			/**
			 * Function ungroup elements and set focus to input
			 *
			 *        @example
			 *            <div    data-role="tokentextarea"
			 *                    data-label="Send to: "
			 *                    id="ns-tokentext">
			 *            </div>
			 *            <script>
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.focusIn(0);
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea( "focusIn" );
			 *            </script>
			 *
			 * @method focusIn
			 * @public
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.focusIn = function () {
				var element = this.element,
					elementClasses,
					label,
					sBlock,
					sBlockClasses,
					input,
					inputClasses,
					button,
					hiddenBlocksCount,
					hiddenBlocks,
					hiddenBlocksLength,
					i;

				if (this._focusStatus) {
					return;
				}

				label = element.getElementsByClassName(
					classes.uiTokentextareaLabel)[0];
				hiddenBlocksCount = element.getElementsByClassName(
					classes.uiTokentextareaDesclabel)[0];
				if (hiddenBlocksCount) {
					element.removeChild(hiddenBlocksCount);
					hiddenBlocks = element.getElementsByClassName(
						classes.uiTokentextareaInvisible);
					hiddenBlocksLength = hiddenBlocks.length;
					for (i = hiddenBlocksLength - 1; i >= 0; i--) {
						hiddenBlocks[i].classList
							.remove(classes.uiTokentextareaInvisible);
					}
				}

				input = element.getElementsByTagName("input")[0];
				inputClasses = input.classList;
				button = element.getElementsByTagName("a")[0];
				elementClasses = element.classList;

				label.tabIndex = 0;
				label.style.display = "";


				sBlock = element
					.getElementsByClassName(classes.uiTokentextareaSblock)[0];
				if (sBlock !== undefined) {
					sBlockClasses = sBlock.classList;
					sBlockClasses.remove(classes.uiTokentextareaSblock);
					sBlockClasses.add(classes.uiTokentextareaBlock);
				}
				inputClasses.remove(classes.uiTokentextareaInputInvisible);
				inputClasses.add(classes.uiTokentextareaInputVisible);
				input.tabIndex = 0;
				button.tabIndex = 0;
				button.style.display = "";

				// change focus state.
				this._focusStatus = true;
				elementClasses.remove(classes.uiTokentextareaFocusout);
				elementClasses.add(classes.uiTokentextareaFocusin);
				element.removeAttribute("tabindex");
				input.focus();
			};

			/**
			 * function get width of element with margins
			 * @method _getElementWidth
			 * @param {HTMLElement} element
			 * @return {number}
			 * @private
			 * @static
			 * @member ns.widget.mobile.TokenTextarea
			 */
			function _getElementWidth(element) {
				var elementView;

				elementView = document.defaultView
					.getComputedStyle(element);
				return parseInt(
					elementView.getPropertyValue("margin-left"), 10) +
					parseInt(elementView.getPropertyValue("margin-right"), 10) +
					element.offsetWidth;
			}

			/**
			 * Function group elements and hide input
			 *
			 *        @example
			 *            <div    data-role="tokentextarea"
			 *                    data-label="Send to: "
			 *                    id="ns-tokentext">
			 *            </div>
			 *            <script>
			 *                var tokenWidget = tau.widget.Tokentextarea(
			 *                        document.getElementById("ns-tokentext")
			 *                );
			 *                tokenWidget.focusOut(0);
			 *
			 *                //if jQuery is loaded
			 *
			 *                $( "#ns-tokentext" ).tokentextarea( "focusOut" );
			 *            </script>
			 *
			 * @method focusOut
			 * @public
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype.focusOut = function () {
				var element = this.element,
					strings = Tokentextarea.strings,
					description = this.options.description,
					elementClasses,
					elementWidth,
					blockWidthSum = 0,
					label,
					input,
					inputClasses,
					button,
					blocks,
					blocksLenght,
					hiddenBlocksCount = 0,
					descLabel,
					descLabel1stChild,
					descLabel2ndChild,
					i;

				if (!this._focusStatus) {
					return;
				}

				blocks = element.getElementsByClassName(
					classes.uiTokentextareaSpanBlock
				);
				blocksLenght = blocks.length;
				label = element
					.getElementsByClassName(classes.uiTokentextareaLabel)[0];
				input = element.getElementsByTagName("input")[0];
				inputClasses = input.classList;
				button = element.getElementsByTagName("a")[0];

				label.removeAttribute("tabindex");
				inputClasses.remove(classes.uiTokentextareaInputVisible);
				inputClasses.add(classes.uiTokentextareaInputInvisible);
				input.removeAttribute("tabindex");
				button.removeAttribute("tabindex");
				button.style.display = "none";

				elementWidth = element.offsetWidth;
				blockWidthSum += _getElementWidth(label);
				for (i = 0; i <= blocksLenght - 1; i++) {
					blockWidthSum += _getElementWidth(blocks[i]);
					if (blockWidthSum >= elementWidth) {
						hiddenBlocksCount++;
						blocks[i].classList
							.add(classes.uiTokentextareaInvisible);
					}
				}

				this._focusStatus = false;
				elementClasses = element.classList;
				elementClasses.remove(classes.uiTokentextareaFocusin);
				elementClasses.add(classes.uiTokentextareaFocusout);
				element.tabIndex = 0;

				if (hiddenBlocksCount !== 0) {
					descLabel = document.createElement("div");
					descLabel1stChild = document.createElement("div");
					descLabel2ndChild = document.createElement("div");

					descLabel.classList.add(classes.uiTokentextareaDesclabel);
					descLabel.setAttribute("aria-label",
						strings.moreDoubleTapToEdit);
					descLabel.tabIndex = -1;

					descLabel1stChild.setAttribute("aria-hidden", "true");
					descLabel1stChild.textContent = description
						.replace("{0}", hiddenBlocksCount);

					descLabel2ndChild.setAttribute("aria-label", "and");
					descLabel2ndChild.style.visibility = "hidden";
					descLabel2ndChild.textContent = hiddenBlocksCount;

					descLabel.appendChild(descLabel1stChild);
					descLabel.appendChild(descLabel2ndChild);
					element.insertBefore(descLabel, input.parentNode);
				}
			};

			/**
			 * Bind widget events
			 * @method _bindEvents
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype._bindEvents = function (element) {
				var self = this,
					parentPage = selectors.getClosestBySelector(
						element, pageSelector);

				self.inputKeyUp = inputKeyUp.bind(null, element);
				element.getElementsByTagName("input")[0]
					.addEventListener("keyup", self.inputKeyUp, false);
				self._setMaxSizeForAllBlocksBound =
					setMaxSizeForAllBlocks.bind(null, element);
				parentPage.addEventListener(
					"pageshow", self._setMaxSizeForAllBlocksBound, false);
			};

			/**
			 * Destroy widget
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.TokenTextarea
			 */
			Tokentextarea.prototype._destroy = function () {
				var element = this.element,
					elementCilds,
					elementCildsLength,
					input,
					block,
					blockLength,
					parentPage = selectors.getClosestBySelector(
						element, pageSelector),
					i;

				input = element.getElementsByTagName("input")[0];
				block = element.getElementsByClassName(
					classes.uiTokentextareaSpanBlock
				);
				blockLength = block.length;
				for (i = blockLength - 1; i >= 0; i--) {
					block[i].removeEventListener("vclick", blockClick, false);
				}
				input.removeEventListener("keyup", this.inputKeyUp, false);
				parentPage.removeEventListener("pageshow",
					this._setMaxSizeForAllBlocksBound, false);
				elementCilds = element.childNodes;
				elementCildsLength = elementCilds.length;
				for (i = elementCildsLength - 1; i >= 0; i--) {
					element.removeChild(elementCilds[i]);
				}
				element.classList.remove(classes.uiTokentextarea);
				element.removeAttribute("data-ns-built");
				element.removeAttribute("data-ns-binding");
				element.removeAttribute("data-ns-name");
				element.removeAttribute("data-ns-selector");
				element.removeAttribute("aria-disabled");
				element.removeAttribute("data-ns-bound");
			};

			/**
			 * The function "value" is not supported in this widget.
			 *
			 * @method value
			 * @chainable
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Disable the Tokentextarea
			 *
			 * Method adds disabled attribute on Tokentextarea widget and
			 * changes look to disabled state.
			 *
			 *        @example
			 *        <div data-role="tokentexarea" id="ns-tokentex"></div>
			 *
			 *        <script>
			 *            var elementToken = tau.widget.Tokentextarea(
			 *                    document.getElementById("ns-tokentext")
			 *                );
			 *            elementToken.disable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            $("#ns-tokentext").tokentextarea("disable");
			 *        </script>
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Enable the Tokentextarea
			 *
			 * Method removes disabled attribute on Tokentextarea widget and
			 * changes look to enabled state.
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            var elementToken = tau.widget.Tokentextarea(
			 *                    document.getElementById("ns-tokentext")
			 *                );
			 *            elementToken.enable();
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            $("#ns-tokentext").tokentextarea("enable");
			 *        </script>
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Trigger an event on widget's element.
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            var elementToken = tau.widget.Tokentextarea(
			 *                    document.getElementById("ns-tokentext")
			 *                );
			 *            elementToken.trigger("eventName");
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            $("#ns-tokentext").tokentextarea("trigger", "eventName");
			 *        </script>
			 *
			 * @method trigger
			 * @param {string} eventName the name of event to trigger
			 * @param {?*} [data] additional object to be carried with the event
			 * @param {boolean} [bubbles=true] indicating whether the event
			 * bubbles up through the DOM or not
			 * @param {boolean} [cancelable=true] indicating whether the event
			 * is cancelable
			 * @return {boolean} false, if any callback invoked preventDefault
			 * on event object
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Add event listener to widget's element.
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            var elementToken = tau.widget.Tokentextarea(
			 *                    document.getElementById("ns-tokentext")
			 *                );
			 *            elementToken.on("eventName", function () {
			 *				console.log("Event fires");
			 *			});
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            $("#ns-tokentext").tokentextarea("on", "eventName",
			 *                function () { console.log("Event fires");
			 *			});
			 *        </script>
			 *
			 * @method on
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be
			 * trigger
			 * @param {boolean} [useCapture=false] useCapture param tu
			 * addEventListener
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Remove event listener to widget's element.
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            var elementToken = tau.widget.Tokentextarea(
			 *                    document.getElementById("ns-tokentext")
			 *                ),
			 *                callback = function () {
			 *					console.log("Event fires");
			 *				};
			 *            // add callback on event "eventName"
			 *            elementToken.on("eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            elementToken.off("eventName", callback);
			 *        </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *        <script>
			 *            var callback = function () {
			 *					console.log("Event fires");
			 *				};
			 *            // add callback on event "eventName"
			 *            $("#ns-tokentext").tokentextarea(
			 *                "on", "eventName", callback);
			 *            // ...
			 *            // remove callback on event "eventName"
			 *            $("#ns-tokentext").tokentextarea(
			 *                "off", "eventName", callback);
			 *        </script>
			 *
			 * @method off
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be
			 * trigger
			 * @param {boolean} [useCapture=false] useCapture param to
			 * addEventListener
			 * @member ns.widget.mobile.TokenTextarea
			 */

			/**
			 * Get/Set options of the widget.
			 *
			 * This method can work in many context.
			 *
			 * If first argument is type of object them, method set values for
			 * options given in object. Keys of object are names of options and
			 * values from object are values to set.
			 *
			 * If you give only one string argument then method return value
			 * for given option.
			 *
			 * If you give two arguments and first argument will be a string
			 * then second argument will be intemperate as value to set.
			 *
			 *        @example
			 *        <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *
			 *            <script>
			 *                var tokenWidet = tau.widget.Tokentextarea(
			 *                document.getElementById("ns-tokentext")),
			 *                    tokenValue;
			 *
			 *                 //getter
			 *                tokentValue = tokenWidget.option("label");
			 *
			 *                //setter
			 *                tokenWidget.option("label","e-mail to: ");
			 *            </script>
			 *
			 * If jQuery is loaded:
			 *
			 *        @example
			 *            <div data-role="tokentextarea" id="ns-tokentext"></div>
			 *            <script>
			 *                var tokenValue;
			 *
			 *                // get value
			 *                tokentValue = $("#ns-tokentext").tokentextarea(
			 *                    "option", "label");
			 *
			 *                // set value
			 *                $("#ns-tokentext").tokentextarea(
			 *                    "option", "label", "e-mail to: "
			 *                );
			 *            </script>
			 *
			 * @method option
			 * @param {string|Object} [name] name of option
			 * @param {*} value value to set
			 * @member ns.widget.mobile.TokenTextarea
			 * @return {*} return value of option or undefined if method is
			 * called in setter context
			 */
			// definition
			ns.widget.mobile.TokenTextarea = Tokentextarea;
			engine.defineWidget(
				"TokenTextarea",
				"[data-role='tokentextarea'], .ui-tokentextarea",
				[
					"add",
					"remove",
					"length",
					"inputText",
					"select",
					"focusIn",
					"focusOut"
				],
				Tokentextarea,
				"tizen"
			);

			}(window.document, ns));

/*global window, ns, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint plusplus: true, nomen: true */
/**
 * #Field's Container Grouping Widget
 * FieldContain widget improves the styling of labels and form elements on wider screens. It aligns the input and associated label side-by-side and breaks to stacked block-level elements below ~480px. Moreover, it adds a thin bottom border to act as a field separator.
 *
 * ##Default selectors
 * In default all div or fieldset elements with _data-role=fieldcontain_ or class _.ui-fieldcontain_ are changed to fieldcontain widget.
 *
 * ##HTML Examples
 *
 * ###Create fieldcontain by data-role
 *
 *        @example
 *        <div data-role="fieldcontain">
 *            <label for="name">Text Input:</label>
 *            <input type="text" name="name" id="name" value="" />
 *        </div>
 *
 * ###Create fieldcontain by class
 *
 *        @example
 *        <div class="ui-fieldcontain">
 *            <label for="name">Text Input:</label>
 *            <input type="text" name="name" id="name" value="" />
 *        </div>
 *
 * ## Manual constructor
 * For manual creation of fieldcontain widget you can use constructor of widget:
 *
 *        @example
 *        <div id="fieldcontain">
 *            <label for="name">Text Input:</label>
 *            <input type="text" name="name" id="name" value="" />
 *        </div>
 *
 *        <script>
 *            var fieldcontain = tau.widget.FieldContain(document.getElementById("fieldcontain"));
 *        </script>
 *
 * If jQuery library is loaded, its method can be used:
 *
 *        @example
 *        <div id="fieldcontain">
 *            <label for="name">Text Input:</label>
 *            <input type="text" name="name" id="name" value="" />
 *        </div>
 *
 *        <script>
 *            var fieldcontain = $("#fieldcontain").fieldcontain();
 *        </script>
 *
 * ##Hiding labels accessibly
 * For the sake of accessibility, the framework requires that all form elements be paired with a meaningful label. To hide labels in a way that leaves them visible to assistive technologies — for example, when letting an element's placeholder attribute serve as a label — apply the helper class ui-hidden-accessible to the label itself:
 *
 *        @example
 *        <div data-role="fieldcontain">
 *            <label for="username" class="ui-hidden-accessible">Username:</label>
 *            <input type="text" name="username" id="username" value="" placeholder="Username"/>
 *        </div>
 *
 * To hide labels within a field container and adjust the layout accordingly, add the class ui-hide-label to the field container as in the following:
 *
 *        @example
 *        <div data-role="fieldcontain" class="ui-hide-label">
 *            <label for="username">Username:</label>
 *            <input type="text" name="username" id="username" value="" placeholder="Username"/>
 *        </div>
 *
 * While the label will no longer be visible, it will be available to assisitive technologies such as screen readers.
 *
 * Because radio and checkbox buttons use the label to display the button text you can't use ui-hidden-accessible in this case. However, the class ui-hide-label can be used to hide the legend element:
 *
 *        @example
 *        <div data-role="fieldcontain" class="ui-hide-label">
 *            <fieldset data-role="controlgroup">
 *                <legend>Agree to the terms:</legend>
 *                <input type="checkbox" name="checkbox-agree" id="checkbox-agree" class="custom" />
 *                <label for="checkbox-agree">I agree</label>
 *            </fieldset>
 *        </div>
 *
 * ##Methods
 *
 * To call method on widget you can use one of existing API:
 *
 * First API is from tau namespace:
 *
 *        @example
 *        var fieldcontainElement = document.getElementById("fieldcontain"),
 *            fieldcontain = tau.widget.FieldContain(fieldcontainElement);
 *
 *        fieldcontain.methodName(methodArgument1, methodArgument2, ...);
 *
 * Second API is jQuery Mobile API and for call _methodName_ you can use:
 *
 *        @example
 *        $("#fieldcontain").fieldcontain("methodName", methodArgument1, methodArgument2, ...);
 *
 *
 * @class ns.widget.mobile.FieldContain
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				var FieldContain = function () {
					return;
				},
				/**
				 * @property {Object} Widget Alias for {@link ns.widget.BaseWidget}
				 * @member ns.widget.mobile.FieldContain
				 * @private
				 * @static
				 */
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * @property {Object} engine Alias for class ns.engine
				 * @member ns.widget.mobile.FieldContain
				 * @private
				 * @static
				 */
				engine = ns.engine;

			/**
			 * Dictionary for fieldcontain related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.FieldContain
			 * @static
			 * @readonly
			 */
			FieldContain.classes = {
				uiFieldContain: "ui-field-contain",
				uiBody: "ui-body",
				uiBr: "ui-br"
			};

			FieldContain.prototype = new BaseWidget();

			/**
			 * Build structure of fieldcontain widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.FieldContain
			 */
			FieldContain.prototype._build = function (element) {
				var childNodes = element.childNodes,
					classList = element.classList,
					i = childNodes.length,
					childNode,
					classes = FieldContain.classes;
				// adding right classes

				classList.add(classes.uiFieldContain);
				classList.add(classes.uiBody);
				classList.add(classes.uiBr);
				// removing whitespace between label and form element
				while (--i >= 0) {
					childNode = childNodes[i];
					if (childNode.nodeType === 3 && !/\S/.test(childNode.nodeValue)) {
						element.removeChild(childNode);
					}
				}
				return element;
			};

			/**
			 * Removes the widget.
			 *
			 * This will return the element's style back to its pre-init state.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain"));
			 *          fieldcontainWidget.destroy();
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          $("#fieldcontain").fieldcontain("destroy");
			 *      </script>
			 *
			 * @method destroy
			 * @inherited
			 * @member ns.widget.mobile.FieldContain
			 */
			/**
			 * Remove structure of fieldcontain widget
			 * @method _destroy
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.FieldContain
			 */
			FieldContain.prototype._destroy = function (element) {
				var classList = element.classList,
					classes = FieldContain.classes;
				// removing classes added during building

				classList.remove(classes.uiFieldContain);
				classList.remove(classes.uiBody);
				classList.remove(classes.uiBr);
			};

			/**
			 * The function "value" is not supported in this widget.
			 *
			 * @method value
			 * @inherited
			 * @chainable
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * Disable the fieldcontain
			 *
			 * Method adds disabled attribute on fieldcontain and changes look of fieldcontain to disabled state.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain"));
			 *          fieldcontainWidget.disable();
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          $("#fieldcontain").fieldcontain("disable");
			 *      </script>
			 *
			 * @method disable
			 * @inherited
			 * @chainable
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * Enable the fieldcontain
			 *
			 * Method removes disabled attribute on fieldcontain and changes look of fieldcontain to enabled state.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain"));
			 *          fieldcontainWidget.enable();
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          $("#fieldcontain").fieldcontain("enable");
			 *      </script>
			 *
			 * @method enable
			 * @inherited
			 * @chainable
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * The function "refresh" is not supported in this widget.
			 *
			 * @method refresh
			 * @inherited
			 * @chainable
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * The function "option" is not supported in this widget.
			 * This widget does not have any options.
			 *
			 * @method option
			 * @inherited
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * Trigger an event on widget's element.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain"));
			 *          fieldcontainWidget.trigger("eventName");
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          $("#fieldcontain").fieldcontain("trigger", "eventName");
			 *      </script>
			 *
			 * @method trigger
			 * @inherited
			 * @param {string} eventName the name of event to trigger
			 * @param {?*} [data] additional object to be carried with the event
			 * @param {boolean} [bubbles=true] indicating whether the event bubbles up through the DOM or not
			 * @param {boolean} [cancelable=true] indicating whether the event is cancelable
			 * @return {boolean} false, if any callback invoked preventDefault on event object
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * Add event listener to widget's element.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain"));
			 *
			 *          fieldcontainWidget.on("eventName", function() {
			 *                console.log("event fires");
			 *          });
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          $("#fieldcontain").fieldcontain("on", "eventName", function() {
			 *                console.log("event fires");
			 *          });
			 *      </script>
			 *
			 * @method on
			 * @inherited
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param tu addEventListener
			 * @member ns.widget.mobile.FieldContain
			 */

			/**
			 * Remove event listener to widget's element.
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          var fieldcontainWidget = tau.widget.FieldContain(document.getElementById("fieldcontain")),
			 *              callback = function () {
			 *                  console.log("event fires");
			 *              });
			 *
			 *          // add callback on event "eventName"
			 *          fieldcontainWidget.on("eventName", callback);
			 *          // ...
			 *          // remove callback on event "eventName"
			 *          fieldcontainWidget.off("eventName", callback);
			 *      </script>
			 *
			 * If jQuery is loaded:
			 *
			 *      @example
			 *      <div id="fieldcontain" data-role="fieldcontain" class="ui-hide-label">
			 *          <label for="username">Username:</label>
			 *          <input type="text" name="username" id="username" value="" placeholder="Username"/>
			 *      </div>
			 *
			 *      <script>
			 *          // add callback on event "eventName"
			 *          $("#fieldcontain").fieldcontain("on", "eventName", callback);
			 *          // ...
			 *          // remove callback on event "eventName"
			 *          $("#fieldcontain").fieldcontain("off", "eventName", callback);
			 *      </script>
			 *
			 * @method off
			 * @inherited
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param tu addEventListener
			 * @member ns.widget.mobile.FieldContain
			 */

			// definition
			ns.widget.mobile.FieldContain = FieldContain;
			engine.defineWidget(
				"FieldContain",
				"[data-role='fieldcontain'], .ui-fieldcontain",
				[],
				FieldContain,
				"mobile"
			);
			}(window.document, ns));

/*global window, ns, define */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*eslint camelcase: off */
/**
 * #Gallery Widget
 * The gallery widget shows images in a gallery on the screen.
 *
 * ##Default selectors
 * In default all elements with _data-role="gallery"_ or class _.ui-gallery_ are changed to gallery widget.
 *
 * @class ns.widget.mobile.Gallery
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				/**
			 * Alias for {@link ns.widget.BaseWidget}
			 * @property {Function} BaseWidget
			 * @member ns.widget.mobile.Gallery
			 * @private
			 */
			var BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * Alias for class {@link ns.engine}
				 * @property {Object} engine
				 * @member ns.widget.mobile.Gallery
				 * @private
				 */
				engine = ns.engine,
				/**
				 * Alias for class {@link ns.util.selectors}
				 * @property {Object} selectors
				 * @member ns.widget.mobile.Gallery
				 * @private
				 */
				selectors = ns.util.selectors,
				/**
				 * Alias for class {@link ns.util.DOM}
				 * @property {Object} doms
				 * @member ns.widget.mobile.Gallery
				 * @private
				 */
				doms = ns.util.DOM,

				Gallery = function () {
					var self = this;

					/**
					 * Object with default options
					 * @property {Object} options All possible widget options
					 * @property {boolean} [options.flicking=false] This property
					 * enables swinging of the first and the last images.
					 * @property {number} [options.duration=500] This property
					 * determines how long the animation of switching images will run.
					 * @property {"top"|"middle"|"bottom"} [options.verticalAlign="top"]
					 * This property sets the vertical alignment of a widget.
					 * The alignment options are top, middle, and bottom.
					 * @property {number} [options.index=0] This property defines
					 * the index number of the first image in the gallery.
					 * @member ns.widget.mobile.Gallery
					 */
					self.options = {
						flicking: false,
						duration: 500,
						verticalAlign: "top",
						index: 0
					};

					self.dragging = false;
					self.moving = false;
					self.maxImageWidth = 0;
					self.maxImageHeight = 0;
					self.orgX = 0;
					self.orgTime = null;
					self.currentImage = null;
					self.previousImage = null;
					self.nextImage = null;
					self.images = [];
					self.imagesHold = [];
					self.direction = 1;
					self.container = null;

					// events' handlers
					self.pageShowHandler = null;
					self.throttledresizeHandler = null;
					self.vmousemoveHandler = null;
					self.vmousedownHandler = null;
					self.vmouseupHandler = null;
					self.vmouseoutHandler = null;
					self.orientationEventFire = false;
				};

			Gallery.prototype = new BaseWidget();

			/**
			 * This method returns the height of element.
			 * @method getHeight
			 * @param {HTMLElement} element Element of widget
			 * @return {number} Height of element
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function getHeight(element) {
				var page = selectors.getClosestBySelectorNS(element, "role=page"),
					content = selectors.getAllByDataNS(page, "role=content")[0],
					header = selectors.getAllByDataNS(page, "role=header"),
					footer = selectors.getAllByDataNS(page, "role=footer"),
					headerHeight = header.length ? doms.getElementHeight(header[0]) : 0,
					footerHeight = footer.length ? doms.getElementHeight(footer[0]) : 0,
					paddings = doms.getCSSProperty(content, "padding-top", 0, "integer") + doms.getCSSProperty(content, "padding-bottom", 0, "integer"),
					contentHeight = window.innerHeight - headerHeight - footerHeight - paddings;

				return contentHeight;
			}

			/**
			 * This method resizes the image.
			 * @method resizeImage
			 * @param {HTMLElement} image Element of image
			 * @param {number} maxHeight Maximum value of height
			 * @param {number} maxWidth Maximum value of width
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function resizeImage(image, maxHeight, maxWidth) {
				var width = image.clientWidth,
					height = image.clientHeight,
					ratio = height / width,
					imageStyle = image.style;

				if (maxWidth === 0 && isNaN(maxHeight)) {
					/*
					 * Exception : When image max width and height has incorrect value.
					 * This exception is occured when this.maxImageWidth value is 0 and this.maxImageHeight value is NaN when page transition like rotation.
					 * This exception affect that image width and height values are 0.
					 */
					imageStyle.width = width;
					imageStyle.height = width * ratio;
				} else {
					if (width > maxWidth) {
						imageStyle.width = maxWidth + "px";
						imageStyle.height = maxWidth * ratio + "px";
					}
					height = image.clientHeight;
					if (height > maxHeight) {
						imageStyle.height = maxHeight + "px";
						imageStyle.width = maxHeight / ratio + "px";
					}
				}
			}

			/**
			 * This method resizes the image and its container.
			 * @method setTranslatePosition
			 * @param {HTMLElement} imageContainer Container of image
			 * @param {number} value The abscissa of the translating vector
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function setTranslatePosition(imageContainer, value) {
				var translate = "translate3d(" + value + ", 0px, 0px)",
					style = imageContainer.style;

				style.webkitTransform = translate;
				style.oTransform = translate;
				style.mozTransform = translate;
				style.msTransform = translate;
				style.transform = translate;

				return imageContainer;
			}

			/**
			 * This method is used as the listener for event "vmousemove".
			 * @method vmousemoveEvent
			 * @param {ns.widget.mobile.Gallery} self Widget
			 * @param {Event} event Event
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function vmousemoveEvent(self, event) {
				event.preventDefault();
				if (self.moving || !self.dragging) {
					event.stopPropagation();
					return;
				}
				self._drag(event.pageX);
			}

			/**
			 * This method is used as the listener for event "vmousedown".
			 * @method vmousedownEvent
			 * @param {ns.widget.mobile.Gallery} self Widget
			 * @param {Event} event Event
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function vmousedownEvent(self, event) {
				event.preventDefault();
				if (self.moving) {
					event.stopPropagation();
					return;
				}
				self.dragging = true;
				self.orgX = event.pageX;
				self.orgTime = Date.now();
			}

			/**
			 * This method is used as the listener for event "vmouseup".
			 * @method vmouseupEvent
			 * @param {ns.widget.mobile.Gallery} self Widget
			 * @param {Event} event Event
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function vmouseupEvent(self, event) {
				if (self.moving) {
					event.stopPropagation();
					return;
				}
				self.dragging = false;
				self._move(event.pageX);
			}

			/**
			 * This method is used as the listener for event "vmouseout".
			 * @method vmouseoutEvent
			 * @param {ns.widget.mobile.Gallery} self Widget
			 * @param {Event} event Event
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function vmouseoutEvent(self, event) {
				if (self.moving || !self.dragging) {
					return;
				}
				if ((event.pageX < 20) || (event.pageX > (self.maxImageWidth - 20))) {
					self._move(event.pageX);
					self.dragging = false;
				}
			}

			/**
			 * This method resizes the image and its container.
			 * @method loading
			 * @param {ns.widget.mobile.Gallery} self Widget
			 * @param {number} index Index of shown image
			 * @param {HTMLElement} container Container of image
			 * @private
			 * @static
			 * @member ns.widget.mobile.Gallery
			 */
			function loading(self, index, container) {
				var loadFunction = loading.bind(null, self, index, container);

				if (self.images[index] === undefined) {
					return;
				}
				if (!self.images[index].clientHeight) {
					setTimeout(loadFunction, 10);
					return;
				}
				resizeImage(self.images[index], self.maxImageHeight, self.maxImageWidth);
				self._align(index, container);
			}

			//function hideImage(image) {
			//	if (image) {
			//		image.style.visibility = "hidden";
			//	}
			//}

			/**
			 * Dictionary for gallery related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.Gallery
			 * @static
			 * @readonly
			 */
			Gallery.classes = {
				uiGallery: "ui-gallery",
				uiGalleryContainer: "ui-gallery-container",
				uiGalleryBg: "ui-gallery-bg",
				uiContent: "ui-content",
				uiHeader: "ui-header",
				uiFooter: "ui-footer"
			};

			/**
			 * Configure gallery widget
			 * @method _configure
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._configure = function () {
				var options = this.options;

				options.flicking = false;
				options.duration = 500;
				options.verticalAlign = "top";
				options.index = 0;
			};

			/**
			 * This method detaches all images from the containers.
			 * @method _detachAll
			 * @param {NodeList} images Images hold by widget
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._detachAll = function (images) {
				var i = 0,
					length = images.length,
					image;

				while (i < length) {
					image = images[0];
					this.images[i] = image.parentNode.removeChild(image);
					i = i + 1;
				}
			};

			/**
			 * This method detaches the image from the container.
			 * @method _detach
			 * @param {number} index Index of widget
			 * @param {HTMLElement} container Container of image
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._detach = function (index, container) {
				var images = this.images,
					image = images[index];

				if (container && index >= 0 && index < images.length && image.parentNode) {
					container.style.display = "none";
					images[index] = image.parentNode.removeChild(image);
				}
			};

			/**
			 * Build structure of gallery widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._build = function (element) {
				var classes = Gallery.classes,
					options = this.options,
					images,
					image,
					index,
					i,
					length;

				element.classList.add(classes.uiGallery);
				images = selectors.getChildrenByTag(element, "img");
				for (i = 0, length = images.length; i < length; i++) {
					image = images[i];
					doms.wrapInHTML(image, "<div class='" + classes.uiGalleryBg + "'></div>");
				}
				if (element.children.length) {
					doms.wrapInHTML(element.children, "<div class='" + classes.uiGalleryContainer + "'></div>");
				} else {
					element.innerHTML = "<div class='" + classes.uiGalleryContainer + "'></div>";
				}
				index = parseInt(options.index, 10);
				if (!index) {
					index = 0;
				}
				if (index < 0) {
					index = 0;
				}
				if (index >= length) {
					index = length - 1;
				}

				this.index = index;

				return element;
			};

			/**
			 * Init widget
			 * @method _init
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._init = function (element) {
				var images = element.getElementsByTagName("img"),
					classes = Gallery.classes;

				this.container = selectors.getChildrenByClass(element, classes.uiGalleryContainer)[0];
				this._detachAll(images);

				// for "compare" test
				this.max_width = this.maxImageWidth;
				this.max_height = this.maxImageHeight;
				this.org_x = this.orgX;
				this.org_time = this.orgTime;
				this.prev_img = this.previousImage;
				this.cur_img = this.currentImage;
				this.next_img = this.nextImage;
				this.images_hold = this.imagesHold;
			};

			/**
			 * Bind events to widget
			 * @method _bindEvents
			 * @param {HTMLElement} element
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._bindEvents = function (element) {
				//todo
				//galleryorientationchanged

				var container = this.container,
					page = selectors.getClosestBySelectorNS(element, "role=page");

				this.vmousemoveHandler = vmousemoveEvent.bind(null, this);
				this.vmousedownHandler = vmousedownEvent.bind(null, this);
				this.vmouseupHandler = vmouseupEvent.bind(null, this);
				this.vmouseoutHandler = vmouseoutEvent.bind(null, this);
				this.pageShowHandler = this.show.bind(this);
				this.throttledresizeHandler = this.refresh.bind(this);

				window.addEventListener("throttledresize", this.throttledresizeHandler, false);
				page.addEventListener("pageshow", this.pageShowHandler, false);

				container.addEventListener("vmousemove", this.vmousemoveHandler, false);
				container.addEventListener("vmousedown", this.vmousedownHandler, false);
				container.addEventListener("vmouseup", this.vmouseupHandler, false);
				container.addEventListener("vmouseout", this.vmouseoutHandler, false);
			};

			/**
			 * This method sets the value of CSS "top" property for container.
			 * @method _align
			 * @param {number} index Index of widget
			 * @param {HTMLElement} container Container of image
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._align = function (index, container) {
				var image = this.images[index],
					imageTop = 0,
					align = this.options.verticalAlign;

				if (container) {
					if (align === "middle") {
						imageTop = (this.maxImageHeight - image.clientHeight) / 2;
					} else if (align === "bottom") {
						imageTop = this.maxImageHeight - image.clientHeight;
					} else {
						imageTop = 0;
					}
					container.style.top = imageTop + "px";
				}
			};

			/**
			 * This method sets the transformation of widget.
			 * @method _moveLeft
			 * @param {HTMLElement} imageContainer Container of image
			 * @param {string} value The abscissa of the translating vector
			 * @param {number} duration Duration of the animation
			 * @return {HTMLElement} Container of image
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._moveLeft = function (imageContainer, value, duration) {
				var style;

				if (imageContainer) {
					if (duration !== undefined) {
						style = imageContainer.style;
						style.webkitTransition = "-webkit-transform " + (duration / 1000) + "s ease";
						style.mozTransition = "-moz-transform " + (duration / 1000) + "s ease";
						style.msTransition = "-ms-transform " + (duration / 1000) + "s ease";
						style.oTransition = "-o-transform " + (duration / 1000) + "s ease";
						style.transition = "transform " + (duration / 1000) + "s ease";
					}
					imageContainer = setTranslatePosition(imageContainer, value);
				}
				return imageContainer;
			};

			/**
			 * This method attaches image to container.
			 * @method _attach
			 * @param {number} index Index of shown image
			 * @param {HTMLElement} container Container of image
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._attach = function (index, container) {
				if (container && index >= 0 && this.images.length && index < this.images.length) {
					container.style.display = "block";
					container.appendChild(this.images[index]);
					loading(this, index, container);
				}
			};

			/**
			 * The show method is used to display the gallery.
			 * This method is called on event "pageshow" and during refreshing.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.show();
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "show" );
			 *
			 * @method show
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.show = function () {
				var classes = Gallery.classes,
					index = this.index,
					element = this.element,
					previousImage,
					nextImage,
					currentImage;
				/* resizing */

				if (this.images.length) {
					this.windowWidth = window.innerWidth;
					this.maxImageWidth = element.clientWidth;
					this.maxImageHeight = getHeight(element);
					this.container.style.height = this.maxImageHeight + "px";

					currentImage = this.currentImage = element.getElementsByClassName(classes.uiGalleryBg)[index];
					previousImage = this.previousImage = currentImage.previousSibling;
					nextImage = this.nextImage = currentImage.nextSibling;

					this._attach(index - 1, previousImage);
					this._attach(index, currentImage);
					this._attach(index + 1, nextImage);

					if (previousImage) {
						setTranslatePosition(previousImage, -this.windowWidth + "px");
					}

					this._moveLeft(currentImage, "0px");
					if (nextImage) {
						setTranslatePosition(nextImage, this.windowWidth + "px");
					}
				}
			};

			/**
			 * This method calculates the new position of gallery during moving.
			 * It is called on event vmousemove.
			 * @method _drag
			 * @param {number} x Position relative to the left edge of the document
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._drag = function (x) {
				var delta,
					coordX,
					previousImage = this.previousImage,
					nextImage = this.nextImage,
					windowWidth = this.windowWidth;

				if (this.dragging) {
					if (this.options.flicking === false) {
						delta = this.orgX - x;

						// first image
						if (delta < 0 && !previousImage) {
							return;
						}
						// last image
						if (delta > 0 && !nextImage) {
							return;
						}
					}

					coordX = x - this.orgX;

					this._moveLeft(this.currentImage, coordX + "px");
					if (nextImage) {
						this._moveLeft(nextImage, coordX + windowWidth + "px");
					}
					if (previousImage) {
						this._moveLeft(previousImage, coordX - windowWidth + "px");
					}
				}
			};

			/**
			 * This method calculates the new position of gallery during moving.
			 * It is called on event vmouseup.
			 * @method _move
			 * @param {number} x Position relative to the left edge of the document
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._move = function (x) {
				var delta = this.orgX - x,
					flip = 0,
					dragTime,
					sec,
					self,
					previousImage = this.previousImage,
					nextImage = this.nextImage;

				if (delta !== 0) {
					if (delta > 0) {
						flip = delta < (this.maxImageWidth * 0.45) ? 0 : 1;
					} else {
						flip = -delta < (this.maxImageWidth * 0.45) ? 0 : 1;
					}

					if (!flip) {
						dragTime = Date.now() - this.orgTime;

						if (Math.abs(delta) / dragTime > 1) {
							flip = 1;
						}
					}

					if (flip) {
						if (delta > 0 && nextImage) {
							/* next */
							this._detach(this.index - 1, previousImage);

							this.previousImage = this.currentImage;
							this.currentImage = nextImage;
							nextImage = this.nextImage = nextImage.nextSibling;

							this.index++;

							if (nextImage) {
								this._moveLeft(nextImage, this.windowWidth + "px");
								this._attach(this.index + 1, nextImage);
							}

							this.direction = 1;

						} else if (delta < 0 && previousImage) {
							/* prev */
							this._detach(this.index + 1, nextImage);

							this.nextImage = this.currentImage;
							this.currentImage = previousImage;
							previousImage = this.previousImage = this.previousImage.previousSibling;

							this.index--;

							if (previousImage) {
								this._moveLeft(previousImage, -this.windowWidth + "px");
								this._attach(this.index - 1, previousImage);
							}

							this.direction = -1;
						}
					}

					sec = this.options.duration;
					self = this;

					this.moving = true;

					setTimeout(function () {
						self.moving = false;
					}, sec - 25);

					this._moveLeft(this.currentImage, "0px", sec);
					if (this.nextImage) {
						this._moveLeft(this.nextImage, this.windowWidth + "px", sec);
					}
					if (this.previousImage) {
						this._moveLeft(this.previousImage, -this.windowWidth + "px", sec);
					}
				}
			};

			/**
			 * This method deletes all "vmouse" events' handlers.
			 * It is called by method "destroy".
			 * @method _deleteEvents
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._deleteEvents = function () {
				var container = this.container;

				container.removeEventListener("vmousemove", this.vmousemoveHandler, false);
				container.removeEventListener("vmousedown", this.vmousedownHandler, false);
				container.removeEventListener("vmouseup", this.vmouseupHandler, false);
				container.removeEventListener("vmouseout", this.vmouseoutHandler, false);
			};

			/**
			 * The _unbind method is used to disable showing gallery on "pageshow" event
			 * and refreshing gallery on "throttledresize" event.
			 * @method _unbind
			 * @member ns.widget.mobile.Gallery
			 * @protected
			 */
			Gallery.prototype._unbind = function () {
				var page = selectors.getClosestBySelectorNS(this.element, "role=page");

				window.removeEventListener("throttledresize", this.throttledresizeHandler, false);
				page.removeEventListener("pageshow", this.pageShowHandler, false);
			};

			/**
			 * Removes the gallery functionality completely.
			 *
			 * This will return the element back to its pre-init state.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *      galleryWidget.destroy();
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "destroy" );
			 *
			 * @method destroy
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * This method destroys gallery.
			 * @method _destroy
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._destroy = function () {
				this._unbind();
				this._deleteEvents();
				//@todo adding returning element back
			};

			/**
			 * The add method is used to add an image to the gallery. As a parameter, the file URL of image should be passed.
			 *
			 * The refresh method must be call after adding. Otherwise, the file will be added, but not displayed.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.add( "./images/01.jpg" ); // image with attribute src="./images/01.jpg" will be added
			 *      galleryWidget.refresh( );
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "add", "./images/01.jpg" );
			 *      $( "#gallery" ).gallery( "add", "./images/02.jpg" );
			 *      $( "#gallery" ).gallery( "refresh" ); // to see changes, method "refresh" must be called
			 *
			 * @method add
			 * @param {string} file the image's file URL
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.add = function (file) {
				this.imagesHold.push(file);
			};

			/**
			 * The remove method is used to delete an image from the gallery.
			 * If parameter is defined, the selected image is deleted. Otherwise, the current image is deleted.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.remove( 0 ); // the first image will be removed
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "remove", 0 );
			 *
			 * @method remove
			 * @param {number} [index] index of image, which should be deleted
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.remove = function (index) {
				var classes = Gallery.classes,
					images = this.images,
					currentIndex = this.index,
					container = this.container,
					previousImage,
					nextImage,
					tempImageContainer;

				if (index === undefined) {
					index = currentIndex;
				}

				if (index >= 0 && index < images.length) {
					if (index === currentIndex) {
						tempImageContainer = this.currentImage;
						if (currentIndex === 0) {
							this.direction = 1;
						} else if (currentIndex === images.length - 1) {
							this.direction = -1;
						}
						if (this.direction < 0) {
							previousImage = this.previousImage;
							this.currentImage = previousImage;
							this.previousImage = previousImage ? previousImage.previousSibling : null;
							if (this.previousImage) {
								this._moveLeft(this.previousImage, -this.windowWidth + "px");
								this._attach(index - 2, this.previousImage);
							}
							this.index--;
						} else {
							nextImage = this.nextImage;
							this.currentImage = nextImage;
							this.nextImage = nextImage ? nextImage.nextSibling : null;
							if (this.nextImage) {
								this._moveLeft(this.nextImage, this.windowWidth + "px");
								this._attach(index + 2, this.nextImage);
							}
						}
						this._moveLeft(this.currentImage, "0px", this.options.duration);
					} else if (index === currentIndex - 1) {
						tempImageContainer = this.previousImage;
						this.previousImage = this.previousImage.previousSibling;
						if (this.previousImage) {
							this._moveLeft(this.previousImage, -this.windowWidth + "px");
							this._attach(index - 1, this.previousImage);
						}
						this.index--;
					} else if (index === currentIndex + 1) {
						tempImageContainer = this.nextImage;
						this.nextImage = this.nextImage.nextSibling;
						if (this.nextImage) {
							this._moveLeft(this.nextImage, this.windowWidth + "px");
							this._attach(index + 1, this.nextImage);
						}
					} else {
						tempImageContainer = container.getElementsByClassName(classes.uiGalleryBg)[index];
					}

					container.removeChild(tempImageContainer);
					images.splice(index, 1);
				}

				return;
			};

			/**
			 * This method hides images.
			 * It is called by method "hide".
			 * @method _hide
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._hide = function () {
				var index = this.index;

				this._detach(index - 1, this.previousImage);
				this._detach(index, this.currentImage);
				this._detach(index + 1, this.nextImage);
			};

			/**
			 * The hide method is used to hide the gallery. It makes all images invisible and also unbinds all touch events.
			 *
			 *       @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.hide( ); // gallery will be hidden
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "hide" );
			 *
			 * @method hide
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.hide = function () {
				this._hide();
				this._deleteEvents();
			};

			/**
			 * This method updates the images hold by wigdet.
			 * It is called by method "refesh".
			 * @method _update
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._update = function () {
				var self = this,
					galleryBgClass = Gallery.classes.uiGalleryBg,
					images = self.images,
					imagesHold = self.imagesHold,
					imagesHoldLen = imagesHold.length,
					container = self.container,
					image,
					wrapped,
					imageFile,
					i;

				for (i = 0; i < imagesHoldLen; i++) {
					imageFile = imagesHold.shift();
					image = document.createElement("img");
					image.src = imageFile;
					wrapped = document.createElement("div");
					wrapped.classList.add(galleryBgClass);
					container.appendChild(wrapped);
					images.push(image);
				}
			};

			/**
			 * The refresh method is used to refresh the gallery.
			 *
			 * This method must be called after adding images to the gallery.
			 *
			 * This method is called automatically after changing any option of widget and calling method value with not empty parameter.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *      galleryWidget.refresh();
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "refresh" );
			 *
			 *      // also will be called automatically in during changing option (method "option") or setting value (method "value")
			 *
			 *      galleryWidget.option("flicking", true);
			 *      galleryWidget.value(0);
			 *
			 *
			 * @method refresh
			 * @param {number} [startIndex] index of the first image
			 * @return {?number} index of the first image, which will be displayed
			 * @member ns.widget.mobile.Gallery
			 */
			/**
			 * This method refreshes wigdet.
			 * It is called by method "refesh".
			 * @method _refresh
			 * @param {?number} startIndex
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._refresh = function (startIndex) {
				this._update();

				this._hide();

				// if startIndex is undefined or it is not possible to convert value to integer, the old index is used
				startIndex = parseInt(startIndex, 10);

				if (isNaN(startIndex)) {
					startIndex = this.index;
				}

				if (startIndex < 0) {
					startIndex = 0;
				}
				if (startIndex >= this.images.length) {
					startIndex = this.images.length - 1;
				}

				this.index = startIndex;

				this.show();

				return this.index;

			};

			/**
			 * The empty method is used to remove all of images from the gallery.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.empty( ); // all images will be deleted
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "empty" );
			 *
			 * @method empty
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.empty = function () {
				this.container.innerHTML = "";
				this.images.length = 0;
			};

			/**
			 * The length method is used to get the number of images.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery")),
			 *          imagesItems;
			 *
			 *      imagesLength = galleryWidget.length( ); // number of images
			 *
			 *      // or
			 *
			 *      imagesLength = $( "#gallery" ).gallery( "length" );
			 *
			 * @method length
			 * @return {number}
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype.length = function () {
				return this.images.length;
			};

			/**
			 * The value method is used to get or set current index of gallery.
			 * If parameter is not defined, the current index is return. Otherwise, the index of the image is set and proper image is displayed. The index of images is counted from 0. If new index is less than 0 or greater than or equal length of images, then the index will not be changed.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery")),
			 *          value = galleryWidget.value(); // value contains the index of current image
			 *
			 *      galleryWidget.value( 0 ); // the first image will be displayed
			 *
			 *      // or
			 *
			 *      value = $( "#gallery" ).gallery( "value" ); // value contains the index of current image
			 *
			 *      $( "#gallery" ).gallery( "value",  0 ); // the first image will be displayed
			 *
			 * @method value
			 * @param {?number} index of image, which should be displayed now
			 * @return {?number}
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * This method sets value of index.
			 * It is called by method "value".
			 * @method _setValue
			 * @param {number} index New value of index
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._setValue = function (index) {
				this.refresh(index);
				return null;
			};

			/**
			 * This method returns the value of index.
			 * It is called by method "value".
			 * @method _getValue
			 * @protected
			 * @member ns.widget.mobile.Gallery
			 */
			Gallery.prototype._getValue = function () {
				return this.index;
			};

			/**
			 * This method changes state of gallery on enabled and removes CSS classes connected with state.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.enable();
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "enable" );
			 *
			 * @method enable
			 * @chainable
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * This method changes state of gallery on disabled and adds CSS classes connected with state.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *
			 *      galleryWidget.disable();
			 *
			 *      // or
			 *
			 *      $( "#gallery" ).gallery( "disable" );
			 *
			 * @method disable
			 * @chainable
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * Get/Set options of the widget.
			 *
			 * This method can work in many context.
			 *
			 * If first argument is type of object them, method set values for options given in object. Keys of object are names of options and values from object are values to set.
			 *
			 * If you give only one string argument then method return value for given option.
			 *
			 * If you give two arguments and first argument will be a string then second argument will be intemperate as value to set.
			 *
			 * @method option
			 * @param {string|Object} [name] name of option
			 * @param {*} value value to set
			 * @member ns.widget.mobile.Gallery
			 * @return {*} return value of option or undefined if method is called in setter context
			 */

			/**
			 * Trigger an event on widget's element.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery"));
			 *      galleryWidget.trigger("eventName");
			 *
			 *      // or
			 *
			 *      $("#gallery").gallery("trigger", "eventName");
			 *
			 * @method trigger
			 * @param {string} eventName the name of event to trigger
			 * @param {?*} [data] additional object to be carried with the event
			 * @param {boolean} [bubbles=true] indicating whether the event bubbles up through the DOM or not
			 * @param {boolean} [cancelable=true] indicating whether the event is cancelable
			 * @return {boolean} false, if any callback invoked preventDefault on event object
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * Add event listener to widget's element.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery")),
			 *          callback = function () {
			 *              console.log("event fires");
			 *          });
			 *
			 *      galleryWidget.on("eventName", callback);
			 *
			 *      // or
			 *
			 *      $("#gallery").gallery("on", callback);
			 *
			 * @method on
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param to addEventListener
			 * @member ns.widget.mobile.Gallery
			 */

			/**
			 * Remove event listener to widget's element.
			 *
			 *      @example
			 *      var galleryWidget = tau.widget.Gallery(document.getElementById("gallery")),
			 *          callback = function () {
			 *              console.log("event fires");
			 *          });
			 *
			 *      // add callback on event "eventName"
			 *      galleryWidget.on("eventName", callback);
			 *      // ...
			 *      // remove callback on event "eventName"
			 *      galleryWidget.off("eventName", callback);
			 *
			 *      // or
			 *
			 *      // add callback on event "eventName"
			 *      $("#gallery").gallery("on", callback);
			 *      // ...
			 *      // remove callback on event "eventName"
			 *      $("#gallery").gallery("off", "eventName", callback);
			 *
			 *
			 * @method off
			 * @param {string} eventName the name of event
			 * @param {Function} listener function call after event will be trigger
			 * @param {boolean} [useCapture=false] useCapture param to addEventListener
			 * @member ns.widget.mobile.Gallery
			 */

			// definition
			ns.widget.mobile.Gallery = Gallery;
			engine.defineWidget(
				"Gallery",
				"[data-role='gallery'], .ui-gallery",
				[
					"add",
					"remove",
					"empty",
					"length",
					"hide",
					"show"
				],
				Gallery,
				"tizen"
			);
			}(window.document, ns));

/*global window, define, Object, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * # Fast Scroll Widget
 * The fast scroll widget shows a shortcut list that is bound to its parent scroll bar and respective list view.
 *
 * The fast scroll is a scroll view controller, which binds a scroll view to a list of shortcuts. It jumps the scroll view to the selected list divider. If you move the mouse on the shortcut column, the scroll view is moved to the list divider matching the text currently under the mouse cursor. A pop-up with the text currently under the cursor is also displayed. To use the fast scroll widget, add the data-fastscroll="true" attribute to a list view. You can also call the shortcutscroll() method on an element. The closest element of the ui-scrollview-clip class is used as the scroll view to be controlled.
 *
 * !!! For the fast scroll widget to be visible, the parent list view must have multiple list dividers.!!!
 *
 * ## Default selectors
 * In default all ListView elements with _data-fastscroll=true_ are changed to Tizen Web UI Fast Scroll.
 *
 * In default all ListView elements with class _.ui-fastscroll_ are changed to Tizen Web UI Fast Scroll
 *
 *        @example
 *        <div data-role="page" id="main">
 *            <div data-role="content">
 *                <ul data-role="listview" data-fastscroll="true">
 *                    <li data-role="list-divider">A</li>
 *                    <li>Anton</li>
 *                    <li>Arabella</li>
 *                    <li data-role="list-divider">B</li>
 *                    <li>Barry</li>
 *                    <li>Bily</li>
 *                </ul>
 *            </div>
 *        </div>
 *
 * #### Create FastScroll widget using tau method:
 *
 *        @example
 *        <div data-role="page" id="main">
 *            <div data-role="content">
 *                <ul id="list" data-fastscroll="true">
 *                    <li data-role="list-divider">A</li>
 *                    <li>Anton</li>
 *                    <li>Arabella</li>
 *                    <li data-role="list-divider">B</li>
 *                    <li>Barry</li>
 *                    <li>Bily</li>
 *                </ul>
 *            </div>
 *        </div>
 *        <script>
 *            var fastscroll = tau.widget.FastScroll(document.getElementById("list"));
 *        </script>
 *
 * #### Create FastScroll widget using jQueryMobile notation:
 *
 *        @example
 *        <div data-role="page" id="main">
 *            <div data-role="content">
 *                <ul id="list" data-fastscroll="true">
 *                    <li data-role="list-divider">A</li>
 *                    <li>Anton</li>
 *                    <li>Arabella</li>
 *                    <li data-role="list-divider">B</li>
 *                    <li>Barry</li>
 *                    <li>Bily</li>
 *                </ul>
 *            </div>
 *        </div>
 *        <script>
 *            var fastscroll = $("#list").fastscroll();
 *        </script>
 *
 * ## Options
 *
 * ### Fastscroll
 * _data-fastscroll_ option set to true, creates a fast scroll using the HTML unordered list (&lt;ul&gt;) element.
 *
 *        @example
 *        <div data-role="page" id="main">
 *            <div data-role="content">
 *                <ul id="contacts" data-role="listview" data-fastscroll="true">
 *                    <li data-role="list-divider">A</li>
 *                    <li>Anton</li>
 *                    <li>Arabella</li>
 *                    <li data-role="list-divider">B</li>
 *                    <li>Barry</li>
 *                    <li>Bily</li>
 *                </ul>
 *            </div>
 *        </div>
 *
 * ## Methods
 *
 * To call method on widget you can use tau API:
 *
 *        @example
 *        <div data-role="page" id="main">
 *            <div data-role="content">
 *                <ul id="contacts">
 *                    <li data-role="list-divider">A</li>F
 *                    <li>Anton</li>
 *                    <li>Arabella</li>
 *                    <li data-role="list-divider">B</li>
 *                    <li>Barry</li>
 *                    <li>Bily</li>
 *                </ul>
 *            </div>
 *        </div>
 *        <script>
 *            var element = document.getElementById("contacts"),
 *                contacts = tau.widget.FastScroll(element, {fastscroll: true});
 *
 *            contacts.methodName(methodArgument1, methodArgument2, ...);
 *
 *            // or JQueryMobile notation:
 *            $(element).contacts("methodName", methodArgument1, methodArgument2, ...);
 *        </script>
 *
 * @class ns.widget.mobile.FastScroll
 * @since 2.0
 */
(function (document, ns) {
	"use strict";
	
			var engine = ns.engine,
				events = ns.event,
				selectors = ns.util.selectors,
				NUMBER_REGEXP = /^[0-9]/,
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				classes = {},
				prototype = new BaseWidget(),
				/*
				 * Event is triggering after _destroy method call
				 * @event destroyed
				 * @member ns.widget.mobile.FastScroll
				 */
				eventType = {
					DESTROYED: "destroyed"
				},
				FastScroll = function () {
					this.eventHandlers = {};
					this._ui = {
						scrollView: null
					};
				};

			// the extension of Listview classes
			classes.uiFastscroll = "ui-fastscroll";
			classes.uiFastscrollTarget = "ui-fastscroll-target";
			classes.uiFastscrollPopup = "ui-fastscroll-popup";
			classes.uiScrollbar = "ui-scrollbar";
			classes.uiFastscrollHover = "ui-fastscroll-hover";
			classes.uiFastscrollHoverFirstItem = "ui-fastscroll-hover-first-item";
			classes.uiFastscrollHoverDown = "ui-fastscroll-hover-down";
			FastScroll.classes = classes;

			/**
			 * @param {string[]} index
			 * @deprecated
			 */
			prototype.indexString = function (index) {
				var self = this;

				ns.warn("Deprecated method: indexString use instead option('index', string)");
				self.indexScrollbar.option({
					"index": index,
					"indexHeight": Math.floor(self._ui.scrollView.clientHeight / index.length)
				});
			};

			/**
			 * Match char to divider
			 * @method matchToDivider
			 * @param {HTMLElement} divider
			 * @param {string} indexChar
			 * @param {Object} map
			 * @private
			 * @static
			 * @member ns.widget.mobile.FastScroll
			 */
			function matchToDivider(divider, indexChar, map) {
				if (indexChar === divider.textContent) {
					map[indexChar] = divider;
				}
			}

			/**
			 * Creates character set for divider
			 * @method makeCharacterSet
			 * @param {HTMLElement} divider
			 * @param {string} primaryCharacterSet
			 * @return {string}
			 * @private
			 * @static
			 * @member ns.widget.mobile.FastScroll
			 */
			function makeCharacterSet(divider, primaryCharacterSet) {
				var content = divider.textContent;

				return primaryCharacterSet + ((NUMBER_REGEXP.test(content)) ? "" : content);
			}

			/**
			 * Creates map of deviders
			 * @method _createDividerMap
			 * @protected
			 * @param {HTMLElement} element
			 * @member ns.widget.mobile.FastScroll
			 */
			prototype._createDividerMap = function (element) {
				var self = this,
					primaryCharacterSet = null,
					secondCharacterSet = null,
					numberSet = "0123456789",
					dividers,
					map = {},
					indexChar,
					i,
					j,
					length,
					dividersLength;

				element = element || self.element;
				dividers = element.querySelectorAll(
					ns.engine.getWidgetDefinition("ListDivider").selector
				);
				dividersLength = dividers.length;

				for (i = 0; i < dividersLength; i++) {
					if (numberSet.search(dividers[i].textContent) !== -1) {
						map["#"] = dividers[i];
						break;
					}
				}

				if (primaryCharacterSet === null) {
					primaryCharacterSet = "";
					for (i = 0; i < dividersLength; i++) {
						primaryCharacterSet = makeCharacterSet(dividers[i], primaryCharacterSet);
					}
				}

				for (i = 0, length = primaryCharacterSet.length; i < length; i++) {
					indexChar = primaryCharacterSet.charAt(i);
					for (j = 0; j < dividersLength; j++) {
						matchToDivider(dividers[j], indexChar, map);
					}
				}

				if (secondCharacterSet !== null) {
					for (i = 0, length = secondCharacterSet.length; i < length; i++) {
						indexChar = secondCharacterSet.charAt(i);
						for (j = 0; j < dividersLength; j++) {
							matchToDivider(dividers[j], indexChar, map);
						}
					}
				}

				self._dividerMap = map;
				self._charSet = primaryCharacterSet + secondCharacterSet;
			};

			prototype._build = function (element) {
				var self = this,
					indexElement = document.createElement("div"),
					page = selectors.getClosestByClass(element, "ui-page"),
					scrollView = selectors.getClosestByClass(element, "ui-scrollview-clip"),
					index;

				ns.warn("Deprecated widget 'FastScroll'. Please use instead 'IndexScrollbar'");

				indexElement.classList.add("ui-indexscrollbar");
				indexElement.style["height"] = scrollView.offsetHeight + "px";
				indexElement.style["top"] = scrollView.offsetTop + "px";
				// @deprecated
				indexElement.classList.add(classes.uiFastscroll);

				self._createDividerMap(element);

				page.appendChild(indexElement);
				index = Object.keys(self._dividerMap).join(",");
				self.indexScrollbar = engine.instanceWidget(
					indexElement,
					"IndexScrollbar", {
						"indexHeight": indexElement.clientHeight / index.length,
						"index": index,
						"delimiter": /[,:]/
					});
				return element;
			};

			prototype._init = function () {
				var self = this;

				self._ui.scrollView = selectors.getClosestByClass(self.element, "ui-scrollview-clip");
				self.scrollView = ns.engine.getBinding(self._ui.scrollView, "Scrollview");
			};

			function findFirstDividerByIndex(self, index) {
				return self._dividerMap[index];
			}

			function onSelectIndexScrollbar(self, ev) {
				var divider,
					element = self.element;

				divider = findFirstDividerByIndex(self, ev.detail.index);
				if (divider) {
					self.scrollView.scrollTo(0, divider.offsetTop - element.offsetTop);
				}
			}

			prototype._bindEvents = function () {
				var self = this;

				self.eventHandlers.onSelectIndexScrollbar =
					onSelectIndexScrollbar.bind(null, self);
				self.indexScrollbar.addEventListener(
					"select", self.eventHandlers.onSelectIndexScrollbar, false
				);
			};

			prototype._unbindEvents = function () {
				var self = this;

				self.indexScrollbar.removeEventListener(
					"select", self.eventHandlers.onSelectIndexScrollbar, false
				);
			};

			prototype._destroy = function () {
				var self = this,
					element = self.element;

				self.indexScrollbar.destroy();
				self.indexScrollbar.element.classList.remove(classes.uiFastscroll);

				self._unbindEvents();

				events.trigger(element, eventType.DESTROYED, {
					widget: "FastScroll",
					parent: element.parentNode
				});
			};

			// definition
			FastScroll.prototype = prototype;
			ns.widget.mobile.FastScroll = FastScroll;

			/**
			 * @deprecated;
			 */
			engine.defineWidget(
				"FastScroll",
				"ul[data-fastscroll='true']",
				["indexString"],
				FastScroll,
				"mobile"
			);

			}(window.document, ns));

/*global window, ns, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true */
/**
 * #Control Group Widget
 * Controlgroup widget improves the styling of a group of buttons by grouping them to form a single block.
 *
 * ##Default selectors
 * In default all divs with _data-role=controlgroup_ are changed to Controlgroup widget.
 *
 * ##HTML Examples
 *
 * ### Create Controlgroup
 *
 *        @example
 *        <div data-role="controlgroup">
 *            <a href="#" data-role="button">Yes</a>
 *            <a href="#" data-role="button">No</a>
 *            <a href="#" data-role="button">Cancel</a>
 *        </div>
 *
 * @class ns.widget.mobile.Controlgroup
 * @extends ns.widget.BaseWidget
 */
(function (document, ns) {
	"use strict";
				/**
			 * Alias for class ns.widget.mobile.Controlgroup
			 * @method Controlgroup
			 * @member ns.widget.mobile.Controlgroup
			 * @private
			 * @static
			 */
			var Controlgroup = function () {
					/**
					 * Object with default options
					 * @property {Object} options
					 * @property {"vertical"|"horizontal"} [options.type="vertical"] Direction of widget
					 * @property {boolean} [options.shadow=false] Shadow of Controlgroup
					 * @property {boolean} [options.excludeInvisible=false] Flag specifying exclusion of invisible elements
					 * @property {boolean} [options.mini=false] Size of Controlgroup
					 * @member ns.widget.mobile.Controlgroup
					 */
					this.options = {
						type: "vertical",
						shadow: false,
						excludeInvisible: false,
						mini: false
					};
				},
				/**
				 * @property {Object} Widget Alias for {@link ns.widget.BaseWidget}
				 * @member ns.widget.mobile.Controlgroup
				 * @private
				 * @static
				 */
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				/**
				 * @property {Object} engine Alias for class ns.engine
				 * @member ns.widget.mobile.Controlgroup
				 * @private
				 * @static
				 */
				engine = ns.engine,
				/**
				 * @property {Object} dom Alias for class ns.util.DOM
				 * @member ns.widget.mobile.Controlgroup
				 * @private
				 * @static
				 */
				dom = ns.util.DOM,
				/**
				 * @property {Object} selectors Alias for class ns.util.selectors
				 * @private
				 * @static
				 */
				selectors = ns.util.selectors,
				/**
				 * @property {Function} slice Alias for function Array.slice
				 * @private
				 * @static
				 */
				slice = [].slice;

			Controlgroup.prototype = new BaseWidget();

			/**
			 * Dictionary for Controlgroup related css class names
			 * @property {Object} classes
			 * @member ns.widget.mobile.Controlgroup
			 * @static
			 */
			Controlgroup.classes = {
				cornerAll: "ui-btn-corner-all",
				cornerTop: "ui-corner-top",
				cornerBottom: "ui-corner-bottom",
				cornerLeft: "ui-corner-left",
				cornerRight: "ui-corner-right",
				controlGroupLast: "ui-controlgroup-last",
				shadow: "ui-shadow",
				mini: "ui-mini",
				controlGroup: "ui-controlgroup",
				typePrefix: "ui-controlgroup-",
				controlGroupLabel: "ui-controlgroup-label",
				controlGroupControls: "ui-controlgroup-controls",
				controlGroupCornerAll: "ui-corner-all"
			};

			/**
			 * Applies css styles to Controlgroup elements
			 * @method flipClasses
			 * @param {Array} elements Array of Controlgroup elements
			 * @param {Array} cornersClasses Array of css styles for first and last element
			 * @private
			 * @static
			 * @member ns.widget.mobile.Controlgroup
			 */
			function flipClasses(elements, cornersClasses) {
				var len = elements.length,
					lastElementClassList,
					classes = Controlgroup.classes;

				if (!len) {
					return;
				}

				elements.forEach(function (element) {
					var classList = element.classList;

					classList.remove(classes.cornerAll);
					classList.remove(classes.cornerTop);
					classList.remove(classes.cornerBottom);
					classList.remove(classes.cornerLeft);
					classList.remove(classes.cornerRight);
					classList.remove(classes.controlgroupLast);
					classList.remove(classes.shadow);
				});

				elements[0].classList.add(cornersClasses[0]);
				lastElementClassList = elements[len - 1].classList;
				lastElementClassList.add(cornersClasses[1]);
				lastElementClassList.add(classes.controlGroupLast);
			}

			/**
			 * Builds structure of Controlgroup widget
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @protected
			 * @member ns.widget.mobile.Controlgroup
			 * @instance
			 */
			Controlgroup.prototype._build = function (element) {
				var classes = Controlgroup.classes,
					elementClassList = element.classList,
					options = this.options,
					groupLegend = selectors.getChildrenByTag(element, "legend"),
					groupHeading = selectors.getChildrenByClass(element, classes.controlGroupLabel),
					groupControls,
					cornersClasses,
					legend,
					content;

				/*
				 * if (groupControls.length) {
				 *   //@todo unwrap content
				 * }
				 */

				//Set options
				options.type = element.getAttribute("data-type") || options.type;

				dom.wrapInHTML(element.childNodes, "<div class='" + classes.controlGroupControls + "'></div>");
				groupControls = selectors.getChildrenByClass(element, classes.controlGroupControls)[0];


				if (groupLegend.length) {
					//existing label is replaced with stylable div
					legend = document.createElement("div");
					legend.classList.add(classes.controlGroupLabel);
					legend.innerHTML = groupLegend[0].innerHTML;
					dom.insertNodesBefore(element.childNodes[0], legend);
					groupLegend.forEach(function (item) {
						item.parentNode.removeChild(item);
					});
				} else if (groupHeading.length) {
					dom.insertNodesBefore(element.childNodes[0], groupHeading);
				}

				cornersClasses = options.type === "horizontal" ?
					[classes.cornerLeft, classes.cornerRight] : [classes.cornerTop, classes.cornerBottom];

				elementClassList.add(classes.controlGroupCornerAll);
				elementClassList.add(classes.controlGroup);
				elementClassList.add(classes.typePrefix + options.type);

				//Make all the control group elements the same width
				if (groupControls) {
					this._setWidthForButtons(groupControls);
				}

				content = slice.call(element.querySelectorAll(".ui-btn")).filter(function (item) {
					//@todo filter visiblity when excludeInvisible option is set
					return !item.classList.contains("ui-slider-handle");
				});

				if (options.shadow) {
					elementClassList.add(classes.shadow);
				}

				if (options.mini) {
					elementClassList.add(classes.mini);
				}

				flipClasses(content, cornersClasses);
				flipClasses(slice.call(element.querySelectorAll(".ui-btn-inner")), cornersClasses);

				return element;
			};

			Controlgroup.prototype._setWidthForButtons = function (groupControls) {
				var controlElements,
					controlElementsLength,
					widthSize,
					i;

				controlElements = selectors.getChildrenByTag(groupControls, "a");
				controlElementsLength = controlElements.length;
				widthSize = 100 / controlElementsLength;
				for (i = 0; i < controlElementsLength; i++) {
					engine.instanceWidget(controlElements[i], "Button");
					controlElements[i].style.width = widthSize + "%";
				}
			};

			// definition
			ns.widget.mobile.Controlgroup = Controlgroup;
			engine.defineWidget(
				"Controlgroup",
				"[data-role='controlgroup'], .ui-controlgroup",
				[],
				Controlgroup,
				"mobile"
			);

			}(window.document, ns));

/*global window, ns, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * #Circular View Widget
 * The circular view widget shows a special scroll box which can be scroll in circle.
 *
 * @class ns.widget.mobile.Circularview
 * @extend ns.widget.mobile.BaseWidgetMobile
 */
(function (document, ns) {
	"use strict";
				var CircularView = function () {
					this.options = {
						"fps": 60,
						"scrollDuration": 2000,
						"moveThreshold": 10,
						"moveIntervalThreshold": 150,
						"startEventName": "scrollstart",
						"updateEventName": "scrollupdate",
						"stopEventName": "scrollstop",
						"eventType": ns.event.vmouse.touchSupport ? "touch" : "mouse",
						"delaydedClickSelector": "a, .ui-btn",
						"delayedClickEnabled": false,
						"list": "> *"
					};
					this._callbacks = {};
					this._view = null;
					this._list = null;
					this._items = null;
					this._listItems = null;
					this._moving = false;
					this._lastMouseX = 0;
					this._lastStepX = 0;
					this._transformation = null;
					this._itemWidth = 0;
					this._width = 0;
					this._lastGapSize = 0;

					this._positionX = 0;
					this._positionXOffset = 0;

					this._centerTo = true;
				},
				slice = [].slice,
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				domutils = ns.util.DOM,
				selectors = ns.util.selectors,
				util = ns.util,
				eventUtils = ns.event,
				engine = ns.engine,
				easingUtils = ns.util.easing,
				dragEvents = {
					"mouse": {
						"start": "mousedown",
						"move": "mousemove",
						"end": "mouseup"
					},
					"touch": {
						"start": "touchstart",
						"move": "touchmove",
						"end": "touchend"
					}
				};

			CircularView.prototype = new BaseWidget();

			function applyLeftItems(circularview, gapSizeDiff) {
				var list = circularview._list,
					items = list.children,
					lastIndex = items.length - 1,
					i;

				for (i = 0; i < gapSizeDiff; i++) {
					list.insertBefore(items[lastIndex], items[0])
					;
				}
			}

			function applyRightItems(circularview, gapSizeDiff) {
				var list = circularview._list,
					items = list.children,
					i;

				for (i = 0; i < gapSizeDiff; i++) {
					list.appendChild(items[0]);
				}
			}

			function updateView(circularview) {
				var viewStyle = circularview._view.style,
					positionX = circularview._positionX,
					positionXOffset = -circularview._positionXOffset,
					lastStepX = circularview._lastStepX,
					translate,
					gapSize = Math.floor((positionX - positionXOffset) / circularview._itemWidth),
					itemWidth = circularview._itemWidth,
					translateX = positionX + positionXOffset - (itemWidth * gapSize),
					gapSizeDiff = Math.abs(gapSize - circularview._lastGapSize);

				if (circularview._centerTo) {
					if (gapSize > 0) { // show more on left side
						applyLeftItems(circularview, gapSizeDiff);
					} else { // show more on right side
						applyRightItems(circularview, gapSizeDiff);
					}
				} else {
					if (gapSizeDiff) {
						if (lastStepX > 0) { // show more on left side
							applyLeftItems(circularview, gapSizeDiff);
						} else { // show more on right side
							applyRightItems(circularview, gapSizeDiff);
						}
					}
				}
				translate = "translate3d(" + translateX + "px, 0px, 0px)";
				viewStyle.transform =
					viewStyle.webkitTransform =
						viewStyle.mozTransform =
							viewStyle.msTransform =
								viewStyle.oTransform = translate;
				circularview._lastGapSize = gapSize;
			}

			function moveTo(circularview, startTime, changeX, endX, duration) {
				var isCentring = circularview._centerTo,
					elapsed = +new Date() - startTime, // timestamp passed to requestAnimationFrame callback is not stable so we create our own
					timestamp = elapsed > duration ? duration : elapsed,
					easingVal = easingUtils.easeOutQuad(timestamp, 0, 1, duration),
					newPositionX = isCentring ? changeX * easingVal : changeX * (1 - easingVal),
					transformation = circularview._transformation,
					options = circularview.options,
					element = circularview.element;

				eventUtils.trigger(element, options.updateEventName);

				if (!duration || +new Date() > startTime + duration) {
					circularview._positionX = isCentring ? endX : circularview._positionX;
					updateView(circularview);
					transformation = null;
					circularview._centerTo = false;
					eventUtils.trigger(element, options.stopEventName);
				} else if (newPositionX !== endX && isNaN(newPositionX) === false && transformation !== null) { // used isNaN to prevent jslint error, hope that closure will change this to val === val for speedup
					circularview._positionX = isCentring ? newPositionX : circularview._positionX + newPositionX;
					updateView(circularview);
					util.requestAnimationFrame.call(window, transformation);
				} else {
					circularview._positionX = isCentring ? newPositionX : circularview._positionX + newPositionX;
					updateView(circularview);
					circularview._transformation = null;
					circularview._centerTo = false;
					eventUtils.trigger(element, options.stopEventName);
				}

			}

			function handleDragStart(circularview, event) {
				var lastMouseX = event.clientX,
					options = circularview.options,
					element = circularview.element;

				//event.preventDefault();
				//event.stopPropagation();

				if (circularview._moving === true || circularview._transformation !== null) {
					eventUtils.trigger(element, options.stopEventName);
				}

				circularview._moving = true;
				circularview._transformation = null;

				if (circularview.options.eventType === "touch") {
					lastMouseX = event.touches[0].clientX;
				}
				circularview._lastMouseX = lastMouseX;

				eventUtils.trigger(element, options.startEventName);
			}

			function handleDragMove(circularview, event) {
				var stepX = 0,
					mouseX = event.clientX;

				circularview._lastMoveTime = Date.now();

				if (circularview.options.eventType === "touch") {
					mouseX = event.touches[0].clientX;
				}

				if (circularview._moving) {
					stepX = mouseX - circularview._lastMouseX;
					if (stepX !== 0) {
						circularview._positionX += stepX;
						util.requestAnimationFrame.call(window, updateView.bind(null, circularview));
					}
					circularview._lastMouseX = mouseX;
					circularview._lastStepX = stepX;
				}
			}

			function handleDragEnd(circularview) {
				var lastStepX = circularview._lastStepX,
					lastMoveTime = circularview._lastMoveTime,
					position = circularview.getScrollPosition(),
					momentum = lastStepX,
					doScroll = lastMoveTime && (Date.now() - lastMoveTime) <= circularview.options.moveIntervalThreshold;

				circularview._moving = false;

				if (doScroll) {
					circularview._transformation = moveTo.bind(
						null,
						circularview,
						+new Date(),
						momentum,
						position.x + momentum,
						circularview.options.scrollDuration
					);
					util.requestAnimationFrame.call(window, circularview._transformation);
				} else {
					circularview._transformation = null;
					eventUtils.trigger(circularview.element, circularview.options.stopEventName);
				}
			}

			function applyViewItems(circularview) {
				var i,
					items = circularview._listItems,
					itemsLength = items.length,
					fragment = document.createDocumentFragment();

				for (i = 0; i < itemsLength; ++i) {
					fragment.appendChild(items[i]);
				}
				circularview._list.appendChild(fragment);
				updateView(circularview);
			}

			CircularView.classes = {
				"clip": "ui-scrollview-clip",
				"view": "ui-scrollview-view",
				"listCurrent": "current"
			};

			CircularView.prototype._build = function (element) {
				var view = document.createElement("div"),
					list = document.createElement("ul"),
					viewStyle = view.style,
					classes = CircularView.classes,
					sourceListSelector = this.options.list,
					sourceRefNodeIsElement = sourceListSelector.charAt(0) === ">",
					sourceRefNode = sourceRefNodeIsElement ? element : document;

				if (sourceRefNodeIsElement) {
					sourceListSelector = sourceListSelector.replace(/^>\s*/, "");
				}

				// rewrite source to our list
				slice.call(sourceRefNode.querySelectorAll(sourceListSelector)).forEach(function (item) {
					list.appendChild(item);
				});

				element.classList.add(classes.clip);
				view.classList.add(classes.view);

				viewStyle.overflow = "hidden";

				view.appendChild(list);
				element.innerHTML = "";
				element.appendChild(view);

				if (domutils.getCSSProperty(element, "position") === "static") {
					element.style.position = "relative";
				}

				return element;
			};

			CircularView.prototype._init = function (element) {
				var self = this,
					classes = CircularView.classes,
					view = selectors.getChildrenByClass(element, classes.view)[0],
					list = selectors.getChildrenByTag(view, "ul")[0],
					listItems = [];

				self._list = list;
				// add to array by copy not through children reference
				slice.call(list.children).forEach(function (child) {
					listItems.push(child);
				});
				self._items = listItems;
				self._view = view;

				self._refresh();
			};

			CircularView.prototype._bindEvents = function (element) {
				var self = this,
					callbacks = self._callbacks,
					eventType = self.options.eventType;

				callbacks.dragstart = handleDragStart.bind(null, this);
				callbacks.dragmove = handleDragMove.bind(null, this);
				callbacks.dragend = handleDragEnd.bind(null, this);

				element.addEventListener(dragEvents[eventType].start, callbacks.dragstart, false);
				element.addEventListener(dragEvents[eventType].move, callbacks.dragmove, false);
				element.addEventListener(dragEvents[eventType].end, callbacks.dragend, false);
			};

			CircularView.prototype.getScrollPosition = function () {
				return {
					"x": -this._positionX,
					"y": 0 // compatibility
				};
			};

			CircularView.prototype.scrollTo = function (x, y, duration) {
				var self = this,
					position = self.getScrollPosition(),
					stepX = Math.round(x), // we have to be sure that integers are supplied so we do Math.round on input
					time = +new Date();

				self._transformation = moveTo.bind(
					null,
					this,
					time,
					stepX - (-position.x),
					stepX,
					duration
				);
				util.requestAnimationFrame.call(window, self._transformation);
			};

			CircularView.prototype.centerTo = function (selector, duration) {
				var self = this,
					searched = self._view.querySelector(selector),
					sibling = null,
					siblings = 0,
					itemWidth = self._itemWidth,
					// We need to add a half of element to make it on the center, and
					// additionaly one more element due to positionXOffset which have
					// exactly one item width - this is why here we have itemWidth
					// multiplication by 1.5
					center = parseInt(self._width / 2 + (itemWidth * 1.5), 10);

				if (searched) {
					self._centerTo = true;
					sibling = searched.previousSibling;
					while (sibling) {
						++siblings;
						sibling = sibling.previousSibling;
					}
					self.scrollTo(-((siblings * itemWidth) - center), 0, duration);
				}
			};

			CircularView.prototype.reflow = function () {
				var self = this,
					position = this.getScrollPosition();

				self._refresh();
				self.scrollTo(position.x, position.y, self.options.scrollDuration);
			};

			CircularView.prototype.add = function (item) {
				this._items.push(item);
			};

			CircularView.prototype._refresh = function () {
				var self = this,
					element = self.element,
					width = domutils.getElementWidth(element),
					items = self._items,
					firstItem = items[0],
					filledList = [],
					viewStyle = self._view.style,
					itemWidth,
					itemHeight,
					itemsPerView,
					list = self._list,
					fill,
					fills,
					i,
					len;

				list.innerHTML = "";
				if (!firstItem) {
					return;
				}
				list.appendChild(firstItem);
				itemWidth = domutils.getElementWidth(items[0]);
				itemHeight = domutils.getElementHeight(items[0]);

				list.removeChild(firstItem);

				itemsPerView = parseInt(width / itemWidth, 10);

				// fill list
				for (fill = 0, fills = Math.ceil(itemsPerView / items.length) + 1; fill < fills; ++fill) {
					for (i = 0, len = items.length; i < len; ++i) {
						filledList.push(items[i].cloneNode(true));
					}
				}
				filledList.unshift(filledList.pop());

				viewStyle.height = itemHeight + "px";
				viewStyle.width = itemWidth * filledList.length + "px";

				self._listItems = filledList;
				self._itemWidth = itemWidth;
				self._width = width;
				self._itemsPerView = itemsPerView;
				self._positionXOffset = itemWidth;

				applyViewItems(self);
			};

			CircularView.prototype._destroy = function () {
				var self = this,
					element = self.element,
					callbacks = self._callbacks,
					eventType = self.options.eventType;

				if (element) {
					element.removeEventListener(dragEvents[eventType].start, callbacks.dragstart, false);
					element.removeEventListener(dragEvents[eventType].move, callbacks.dragmove, false);
					element.removeEventListener(dragEvents[eventType].end, callbacks.dragend, false);
				}
			};

			// definition
			ns.widget.mobile.Circularview = CircularView;
			engine.defineWidget(
				"Circularview",
				"[data-role='circularview'], .ui-circularview", //@TODO ???
				[
					"getScrollPosition",
					"scrollTo",
					"centerTo",
					"reflow",
					"add"
				],
				CircularView,
				"mobile"
			);
			}(window.document, ns));

/*global window, ns, define, ns */
/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd
 *
 * Licensed under the Flora License, Version 1.1 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://floralicense.org/license/
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint nomen: true, plusplus: true */
/**
 * #Date-time Picker Widget
 * The picker widget shows a control that you can use to enter date and time values.
 *
 * @class ns.widget.mobile.Datetimepicker
 * @extends ns.widget.mobile.BaseWidgetMobile
 */
(function (document, ns) {
	"use strict";
				var Datetimepicker = function () {
					this.options = {
						type: null, // date, time, datetime applicable
						format: null,
						date: null
					};
				},
				BaseWidget = ns.widget.mobile.BaseWidgetMobile,
				engine = ns.engine,
				dom = ns.util.DOM,
				globalize = ns.util.globalize,
				eventUtils = ns.event,
				range = ns.util.array.range,
				daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
				parsePatternRegexp = /\/|\s|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|f|gg|g|'[\w\W]*'$|[\w\W]/g,
				fieldRegexp = /ui-datefield-([\w]*)/;

			Datetimepicker.prototype = new BaseWidget();

			Datetimepicker.classes = {
				uiBtnPicker: "ui-btn-picker",
				uiDatefield: "ui-datefield",
				uiDatefieldPrefix: "ui-datefield-",
				uiDatefieldSelected: "ui-datefield-selected",
				uiDatefieldPeriod: "ui-datefield-period",
				uiLink: "ui-link",
				uiDatetimepickerSelector: "ui-datetimepicker-selector",
				uiDatetimepicker: "ui-datetimepicker",
				uiInputText: "ui-input-text",
				uiBodyPrefix: "ui-body-",
				uiDivider1st: "ui-divider-1st",
				uiDivider2nd: "ui-divider-2nd",
				inClass: "in",
				outClass: "out",
				current: "current"
			};

			function getCalendar() {
				return globalize.culture().calendars.standard;
			}

			function isLeapYear(year) {
				return year % 4 ? 0 : (year % 100 ? 1 : (year % 400 ? 0 : 1));
			}

			function makeTwoDigits(val) {
				var ret = val.toString(10);

				if (val < 10) {
					ret = "0" + ret;
				}
				return ret;
			}

			function createDateField(type, pat, container) {
				var span = document.createElement("span"),
					spanClassList = span.classList,
					classes = Datetimepicker.classes;

				if (type !== "seperator" && type !== "tab") {
					spanClassList.add(classes.uiBtnPicker);
					dom.setNSData(span, "type", type);
				}
				spanClassList.add(classes.uiDatefieldPrefix + type);
				dom.setNSData(span, "pat", pat);
				if (type !== "seperator" && type !== "tab") {
					dom.setNSData(span, "role", "button");
					dom.setNSData(span, "inline", "true");
					engine.instanceWidget(span, "Button");
				}
				dom.appendNodes(container, span);
				return span;
			}

			function updateField(self, target, value) {
				var pat,
					hour,
					text,
					targetClassList,
					classes = Datetimepicker.classes;

				if (!target) {
					return;
				}

				if (value === 0) {
					value = "0";
				}

				pat = dom.getNSData(target, "pat");
				targetClassList = target.classList;

				switch (pat) {
					case "H":
					case "HH":
					case "h":
					case "hh":
						hour = value;
						if (pat.charAt(0) === "h") {
							if (hour > 12) {
								hour -= 12;
							} else if (hour === "0") {
								hour = 12;
							}
						}
						hour = makeTwoDigits(hour);
						text = hour;
						break;
					case "m":
					case "M":
					case "d":
					case "s":
						text = value;
						break;
					case "mm":
					case "dd":
					case "MM":
					case "ss":
						text = makeTwoDigits(value);
						break;
					case "MMM":
						text = getCalendar().months.namesAbbr[value - 1];
						break;
					case "MMMM":
						text = getCalendar().months.names[value - 1];
						break;
					case "yy":
						text = makeTwoDigits(value % 100);
						break;
					case "yyyy":
						if (value < 10) {
							value = "000" + value;
						} else if (value < 100) {
							value = "00" + value;
						} else if (value < 1000) {
							value = "0" + value;
						}
						text = value;
						break;
					case "t":
					case "tt":
						text = value;
						target = target.firstChild.firstChild;
						break;
				}

				// to avoid reflow where its value isn't out-dated
				if (target.innerText !== text) {
					if (targetClassList.contains(classes.uiDatefieldSelected)) {
						targetClassList.add(classes.outClass);
						self._newValue = text;
						/*
						 * @todo animation
						 target.animationComplete( function () {
						 target.text( self._newValue);
						 target.addClass("in")
						 removeClass("out");

						 target.animationComplete( function () {
						 target.removeClass("in").
						 removeClass("ui-datefield-selected");
						 });
						 });
						 */
						target.innerText = self._newValue;
						targetClassList.remove(classes.inClass);
						targetClassList.remove(classes.uiDatefieldSelected);
					} else {
						target.innerText = text;
					}
				}
			}

			Datetimepicker.prototype._setType = function (element, type) {
				var options = this.options;

				switch (type) {
					case "datetime":
					case "date":
					case "time":
						options.type = type;
						break;
					default:
						options.type = "datetime";
						break;
				}

				dom.setNSData(element, "type", options.type);
				return this;
			};


			Datetimepicker.prototype._setDate = function (element, newdate) {
				var oldValue = this._getValue(),
					newValue,
					fields,
					type,
					val,
					field,
					i,
					fieldsLength;

				if (typeof newdate === "string") {
					newdate = new Date(newdate);
				}

				if (this._ui) {
					fields = this._ui.querySelectorAll("[data-type]");
					fieldsLength = fields.length;

					for (i = 0; i < fieldsLength; i++) {
						field = fields[i];
						type = dom.getNSData(field, "type");
						if (!type) {
							type = "";
						}
						switch (type) {
							case "hour":
								val = newdate.getHours();
								break;
							case "min":
								val = newdate.getMinutes();
								break;
							case "sec":
								val = newdate.getSeconds();
								break;
							case "year":
								val = newdate.getFullYear();
								break;
							case "month":
								val = newdate.getMonth() + 1;
								break;
							case "day":
								val = newdate.getDate();
								break;
							case "period":
								val = newdate.getHours() < 12 && getCalendar().AM ? getCalendar().AM[0] : getCalendar().PM[0];
								break;
							default:
								val = null;
								break;
						}
						if (val !== null) {
							updateField(this, field, val);
						}
					}
				}

				this.options.date = newdate;
				dom.setNSData(element, "date", newdate);

				newValue = this._getValue();

				eventUtils.trigger(element, "change", {
					oldValue: oldValue,
					newValue: newValue
				});
				eventUtils.trigger(element, "date-changed", newValue);
				return this;
			};

			Datetimepicker.prototype._getDate = function () {
				return new Date(this.options.date);
			};

			function switchAmPm(self, element) {
				var date,
					change;

				if (getCalendar().AM !== null) {
					date = new Date(self.options.date);
					change = 1000 * 60 * 60 * 12;

					if (date.getHours() > 11) {
						change = -change;
					}
					date.setTime(date.getTime() + change);
					self._setDate(element, date);
				}
			}

			function addButton(self, container, element, pat) {
				var button = document.createElement("a");

				dom.setNSData(button, "role", "button");
				dom.setNSData(button, "pat", pat);
				dom.setNSData(button, "type", "period");
				button.innerText = "period";
				button.classList.add(Datetimepicker.classes.uiDatefieldPeriod);

				engine.instanceWidget(button, "Button", {
					inline: true
				});

				button.addEventListener("vclick", function () {
					switchAmPm(self, element);
				});
				dom.appendNodes(container, button);

				return button;
			}

			function parsePattern(pattern) {
				var matches = pattern.match(parsePatternRegexp),
					matchesLength = matches.length,
					i;

				for (i = 0; i < matchesLength; i++) {
					if (matches[i].charAt(0) === "'") {
						matches[i] = matches[i].substr(1, matches[i].length - 2);
					}
				}
				return matches;
			}

			function populateDataSelector(self, field, pat) {
				var date = new Date(self.options.date),
					values,
					numItems,
					current,
					data,
					yearlb,
					yearhb,
					day;

				switch (field) {
					case "hour":
						if (pat === "H" || pat === "HH") {
							// twentyfour
							values = range(0, 23);
							data = range(0, 23);
							current = date.getHours();
						} else {
							values = range(1, 12);
							current = date.getHours() - 1;//11
							if (current >= 11) {
								current = current - 12;
								data = range(13, 23);
								data.push(12); // consider 12:00 am as 00:00
							} else {
								data = range(1, 11);
								data.push(0);
							}
							if (current < 0) {
								current = 11; // 12:00 or 00:00
							}
						}
						if (pat.length === 2) {
							// two digit
							values = values.map(makeTwoDigits);
						}
						numItems = values.length;
						break;
					case "min":
					case "sec":
						values = range(0, 59);
						if (pat.length === 2) {
							values = values.map(makeTwoDigits);
						}
						data = range(0, 59);
						current = (field === "min" ? date.getMinutes() : date.getSeconds());
						numItems = values.length;
						break;
					case "year":
						yearlb = 1900;
						yearhb = 2100;
						data = range(yearlb, yearhb);
						current = date.getFullYear() - yearlb;
						values = range(yearlb, yearhb);
						numItems = values.length;
						break;
					case "month":
						switch (pat.length) {
							case 1:
								values = range(1, 12);
								break;
							case 2:
								values = range(1, 12).map(makeTwoDigits);
								break;
							case 3:
								values = getCalendar().months.namesAbbr.slice();
								break;
							case 4:
								values = getCalendar().months.names.slice();
								break;
						}
						if (values.length === 13) { // @TODO Lunar calendar support
							if (values[12] === "") { // to remove lunar calendar reserved space
								values.pop();
							}
						}
						data = range(1, values.length);
						current = date.getMonth();
						numItems = values.length;
						break;
					case "day":
						day = daysInMonth[date.getMonth()];
						if (day === 28) {
							day += isLeapYear(date.getFullYear());
						}
						values = range(1, day);
						if (pat.length === 2) {
							values = values.map(makeTwoDigits);
						}
						data = range(1, day);
						current = date.getDate() - 1;
						numItems = day;
						break;
				}
				return {
					values: values,
					data: data,
					numItems: numItems,
					current: current
				};
			}

			function dateCalibration(date) {
				date.setDate(1);
				date.setDate(date.getDate() - 1);
			}

			function updateHandler(self, field, val) {
				var date = new Date(self.options.date),
					month;

				switch (field[1]) {
					case "min":
						date.setMinutes(val);
						break;
					case "hour":
						date.setHours(val);
						break;
					case "sec":
						date.setSeconds(val);
						break;
					case "year":
						month = date.getMonth();
						date.setFullYear(val);
						if (date.getMonth() !== month) {
							dateCalibration();
						}
						break;
					case "month":
						date.setMonth(val - 1);
						if (date.getMonth() === val) {
							dateCalibration();
						}
						break;
					case "day":
						date.setDate(val);
						break;
				}
				self._setDate(self.element, date);
			}

			function liClickHandler(self, event) {
				var val,
					target = event.target,
					classes = Datetimepicker.classes;

				if (target.tagName === "A") {
					target.parentNode.parentNode.querySelector("." + classes.current).classList.remove(classes.current);
					target.parentNode.classList.add(classes.current);
					val = dom.getNSData(target, "val");

					updateHandler(self, self._field, val);

					self._ctx.close();
				}
			}

			function closePopupHandler(self) {
				var ctxElement = self._ctx.element,
					targetClassList = self._target.classList,
					classes = Datetimepicker.classes;

				if (self._reflow) {
					window.removeEventListener("resize", self._reflow);
					self._reflow = null;
				}

				if (!(targetClassList.contains(classes.inClass) || targetClassList.contains(classes.outClass))) {
					targetClassList.remove(classes.uiDatefieldSelected);
				}

				ctxElement.removeEventListener("popupafterclose", self._closePopupHandler);
				self._circularview.element.removeEventListener("vclick", self.liClickHandler);
				self._ctx.destroy();
				ctxElement.parentNode.removeChild(ctxElement);
				self._popupOpen = false;
			}

			function scrollEndHandler(self) {
				if (!self._reflow) {
					self._reflow = function () {
						self._circularview.reflow();
					};
					window.addEventListener("resize", self._reflow);
				}
			}

			/**
			 * Method shows data selector.
			 * @method showDataSelector
			 * @param {ns.widget.mobile.Datetimepicker} self
			 * @param {HTMLElement} target
			 * @return {?Object}
			 */
			function showDataSelector(self, target) {
				var className = target.className,
					field = className ? className.match(fieldRegexp) : null,
					pat,
					data,
					values,
					valuesData,
					current,
					datans,
					ul,
					div,
					li,
					a,
					i,
					ctx,
					circularview,
					valuesLength,
					divCircularview,
					divCircularviewContainer,
					ctxElement,
					classes = Datetimepicker.classes;

				if (!field) {
					return null;
				}
				if (self._popupOpen) {
					return null;
				}

				self._target = target;
				self._field = field;
				target.classList.add(classes.uiDatefieldSelected);

				pat = dom.getNSData(target, "pat");
				data = populateDataSelector(self, field[1], pat);

				if (!target.id) {
					target.id = self.elememberOfment.id + "-" + pat;
				}

				values = data.values;
				valuesLength = values.length;
				valuesData = data.data;
				current = data.current;

				if (values) {
					datans = "data-val";
					ul = document.createElement("ul");
					for (i = 0; i < valuesLength; i++) {
						li = document.createElement("li");
						if (i === current) {
							li.classList.add(classes.current);
						}
						a = document.createElement("a");
						a.classList.add(classes.uiLink);
						a.setAttribute(datans, valuesData[i]);
						a.innerText = values[i];
						li.appendChild(a);
						ul.appendChild(li);
					}

					div = document.createElement("div");
					div.classList.add(classes.uiDatetimepickerSelector);
					div.setAttribute("data-transition", "fade");
					div.setAttribute("data-fade", "false");
					div.setAttribute("data-role", "popup");
					div.setAttribute("data-corners", "false");
					divCircularview = document.createElement("div");
					divCircularview.appendChild(ul);

					self._ui.appendChild(div);

					ctx = engine.instanceWidget(div, "Popup");
					self._ctx = ctx;
					divCircularviewContainer = document.createElement("div");
					div.appendChild(divCircularviewContainer);
					divCircularviewContainer.appendChild(divCircularview);
					divCircularviewContainer.style.overflow = "hidden";
					// @TODO quich fix, change to proper width
					divCircularviewContainer.style.width = window.innerWidth + "px";
					ctxElement = ctx.element;
					ctxElement.parentNode.classList.add(classes.uiDatetimepicker);
					divCircularview.setAttribute("data-list", ">li");
					divCircularview.setAttribute("data-role", "circularview");

					circularview = engine.instanceWidget(divCircularview, "Circularview");
					self._circularview = circularview;
					if (!self._reflow) {
						self._reflow = function () {
							circularview.reflow();
							circularview.centerTo("." + classes.current, 0);
						};
						window.addEventListener("resize", self._reflow);
					}
					ctx.open({
						link: target.id,
						popupwindow: true,
						tolerance: "10,0"
					});

					self.contextPopup = ctx;
					self._popupOpen = true;

					self._closePopupHandler = closePopupHandler.bind(null, self);
					self._liClickHandler = liClickHandler.bind(null, self);
					self._scrollEndHandler = scrollEndHandler.bind(null, self);
					ctxElement.addEventListener("popupafterclose", self._closePopupHandler);
					divCircularview.addEventListener("vclick", self._liClickHandler, true);

					circularview.centerTo("." + classes.current, 500);
					ctxElement.addEventListener("scrollend", self._scrollEndHandler);
				}
				return self._ui;
			}

			/**
			 *
			 * @param {ns.widget.mobile.Datetimepicker} self
			 * @return {boolean}
			 */
			function orientationHandler(self) {
				if (self._popupOpen) {
					self._popupOpen = false;
					self.contextPopup.close();
				}
				return false;
			}

			Datetimepicker.prototype._setFormat = function (element, format, create) {
				var options = this.options,
					token,
					div = document.createElement("div"),
					tabulatordiv,
					pat,
					span,
					classes = Datetimepicker.classes;

				if (format) {
					if (options.format === format) {
						return null;
					} else {
						options.format = format;
					}
				} else {
					if (!create) {
						return null;
					}
					format = options.format;
				}

				dom.removeAllChildren(this._ui);

				token = parsePattern(format);

				while (token.length > 0) {
					pat = token.shift();
					switch (pat) {
						case "H": //0 1 2 3 ... 21 22 23
						case "HH": //00 01 02 ... 21 22 23
						case "h": //0 1 2 3 ... 11 12
						case "hh": //00 01 02 ... 11 12
							span = createDateField("hour", pat, div);
							break;
						case "mm": //00 01 ... 59
						case "m": //0 1 2 ... 59
							if (options.type === "date") {
								span = createDateField("month", pat, div);
							} else {
								span = createDateField("min", pat, div);
							}
							break;
						case "ss":
						case "s":
							span = createDateField("sec", pat, div);
							break;
						case "d": // day of month 5
						case "dd": // day of month(leading zero) 05
							span = createDateField("day", pat, div);
							break;
						case "M": // Month of year 9
						case "MM": // Month of year(leading zero) 09
						case "MMM":
						case "MMMM":
							span = createDateField("month", pat, div);
							break;
						case "yy":	// year two digit
						case "yyyy": // year four digit
							span = createDateField("year", pat, div);
							break;
						case "t": //AM / PM indicator(first letter) A, P
						case "tt": //AM / PM indicator AM/PM
							// add button
							span = addButton(this, div, element, pat);
							break;
						case "g":
						case "gg":
							span = createDateField("era", pat, div);
							span.innerText = this._calendar().eras.name;
							break;
						case "\t":
							span = createDateField("tab", pat, div);
							tabulatordiv = document.createElement("div");
							tabulatordiv.classList.add(classes.uiDivider1st);
							tabulatordiv.innerHTML = "&nbsp;";
							span.appendChild(tabulatordiv);
							tabulatordiv = document.createElement("div");
							tabulatordiv.classList.add(classes.uiDivider2nd);
							tabulatordiv.innerHTML = "&nbsp;";
							span.appendChild(tabulatordiv);
							break;
						default: // string or any non-clickable object
							span = createDateField("seperator", pat, div);
							span.innerText = pat.replace(/[\-\/]/gi, "");
							break;
					}
				}

				dom.appendNodes(this._ui, div);
				if (options.date) {
					this._setDate(element, options.date);
				}

				element.setAttribute("data-format", options.format);
				return options.format;
			};

			/**
			 * @method _build
			 * @param {HTMLElement} element
			 * @return {HTMLElement}
			 * @private
			 * @member ns.widget.mobile.Datetimepicker
			 */
			Datetimepicker.prototype._build = function (element) {
				var ui,
					elementClassList = element.classList,
					tagName = element.tagName.toLowerCase(),
					classes = Datetimepicker.classes;

				// INFO: Since 2.3, we decided to use Webkit based date-time picker.
				ns.warn("TAU based Datetimepicker widget will be deprecated. It is decieded to be replaced <input> based date-time picker. Please use <input type='month|week|date|time|datetime-local'> for date-time picker");

				if (tagName === "input") {
					element.style.display = "none";
					/*
					 * @todo change to class object
					 */
					elementClassList.add(classes.uiInputText);
					elementClassList.add(classes.uiBodyPrefix + "s");
				}
				ui = document.createElement("div");
				ui.setAttribute("id", this.id + "-datetimepicker-ui");
				ui.classList.add(classes.uiDatefield);
				this._ui = ui;
				if (tagName === "input") {
					dom.insertNodeAfter(element, ui);
				} else {
					element.appendNode(ui);
				}

				return element;
			};

			function datetimepicerClick(self, event) {
				showDataSelector(self, event.target);
				return false;
			}

			Datetimepicker.prototype._bindEvents = function () {
				this._orientationHandlerBound = orientationHandler.bind(null, this);
				this._datetimepicerClickBound = datetimepicerClick.bind(null, this);
				this._ui.addEventListener("vclick", this._datetimepicerClickBound, true);
				window.addEventListener("orientationchange", this._orientationHandlerBound, false);
			};

			/**
			 * @method _init
			 * @protected
			 * @member ns.widget.mobile.Datetimepicker
			 */
			Datetimepicker.prototype._init = function () {
				var options = this.options,
					element = this.element,
					value,
					tagName = element.tagName.toLowerCase(),
					type;

				if (!this._ui) {
					this._ui = document.getElementById(this.id + "-datetimepicker-ui");
				}
				if (!options.format) {
					switch (options.type) {
						case "datetime":
							this._setFormat(getCalendar().patterns.d + "\t" + getCalendar().patterns.t);
							break;
						case "date":
							this._setFormat(element, getCalendar().patterns.d);
							break;
						case "time":
							this._setFormat(element, getCalendar().patterns.t);
							break;
					}
				}

				if (element && tagName === "input") {
					value = element.getAttribute("value");
					if (value) {
						options.date = new Date(value);
					}
					type = element.getAttribute("type");
					this._setType(element, type);
					if (!options.format) {
						switch (type) {
							case "datetime":
								this._setFormat(element, getCalendar().patterns.d + "\t" + getCalendar().patterns.t);
								break;
							case "date":
								this._setFormat(element, getCalendar().patterns.d);
								break;
							case "time":
								this._setFormat(element, getCalendar().patterns.t);
								break;
						}
					}
				}

				if (!options.date) {
					options.date = new Date();
				}
				this._setFormat(element, null, true);
				this._popupOpen = false;
			};

			Datetimepicker.prototype._destroy = function () {
				this._ui.removeEventListener("vclick", this._datetimepicerClickBound, true);
				window.removeEventListener("orientationchange", this._orientationHandlerBound, false);
			};

			Datetimepicker.prototype._setValue = function (value) {
				return this._setDate(this.element, value);
			};

			function timetoString(time) {
				return makeTwoDigits(time.getHours()) + ":" +
					makeTwoDigits(time.getMinutes()) + ":" +
					makeTwoDigits(time.getSeconds());
			}

			function dateToString(date) {
				return ((date.getFullYear() % 10000) + 10000).toString().substr(1) + "-" +
					makeTwoDigits(date.getMonth() + 1) + "-" +
					makeTwoDigits(date.getDate());
			}

			Datetimepicker.prototype._isLeapYear = function (year) {
				return isLeapYear(year);
			};

			Datetimepicker.prototype._switchAmPm = function () {
				return switchAmPm(this, this.element);
			};

			Datetimepicker.prototype._getValue = function () {
				var date = this._getDate(this.element),
					rvalue;

				switch (this.options.type) {
					case "time":
						rvalue = timetoString(date);
						break;
					case "date":
						rvalue = dateToString(date);
						break;
					default:
						rvalue = dateToString(date) + "T" + timetoString(date);
						break;
				}
				return rvalue;
			};

			// definition
			ns.widget.mobile.Datetimepicker = Datetimepicker;
			engine.defineWidget(
				"Datetimepicker",
				// Datetimepicker UI changed in changeable UX.
				// New UX need to UX whole change so we decide datetimepicker reimplement lately
				//"input[type='date'], input[type='datetime'], input[type='time'], [date-role='datetimepicker'], .ui-datetimepicker",
				"[data-role='datetimepicker']",
				[],
				Datetimepicker,
				"tizen"
			);

			}(window.document, ns));

/*global define, ns */
/**
 * #Tizen Advanced UI Framework Backward compatibility
 *
 * TAU framework Tizen 2.4 version has many changed feature for example component naming, API and structure.
 * But, We need to support previous version so we divide to previous support file and current version support file.
 * This file has previous support files.
 *
 * @class ns.mobile-2-3
 * @title Tizen Advanced UI Framework
 */
			ns.info.profile = "mobile";
			
}(window, window.document));
