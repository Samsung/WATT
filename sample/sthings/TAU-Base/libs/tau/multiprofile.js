/*global define, ns, window */
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
/*
 * Hacky way of resolving the problem of one tau for all profiles
 *
 * @author Krzysztof Antoszek <k.antoszek@samsung.com>
 */
(function (window, document) {
			"use strict";
		var profileData = {
				mobile: {
					js: ["js/tau"],
					themes: ["default"],
					css: {
						default: ["tau"]
					}
				},
				wearable: {
					js: ["js/tau"],
					themes: ["default"],
					css: {
						default: ["tau", "tau.circle"]
					}
				}
			},
			availableProfiles = Object.keys(profileData),
			profile = "mobile",
			theme = "default",
			tauLocation = "libs/tau",
			isMin = false,
			scripts = document.querySelectorAll("script");

		function makePath(parts) {
			return parts.join("/").replace(/([^:])\/+/gi, "$1/");
		}

		function setProfile(requested) {
			if (requested && availableProfiles.indexOf(requested) > -1) {
				profile = requested;
			}
		}

		function setTheme(requested) {
			if (requested && profileData[profile].themes.indexOf(requested) > -1) {
				theme = requested;
			}
		}

		function createScript(url) {
			return "<script type=\"text/javascript\" src=\"" + url + "\"></script>";
		}

		function createLinkStylesheet(url) {
			return "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + url + "\">";
		}

		// check for window existance special vars for usage when
		// not overriding user configuration is needed
		if (window.tauProfile !== undefined) {
			setProfile(window.tauProfile);
		}

		if (window.tauTheme !== undefined) {
			setProfile(window.tauTheme);
		}

		if (window.tauMin !== undefined) {
			isMin = !!window.tauMin;
		}

		if (window.tauLocation !== undefined) {
			tauLocation = window.tauLocation;
		}

		// check for tauConfig
		if (window.tauConfig !== undefined) {
			if (window.tauConfig.profile !== undefined) {
				setProfile(window.tauConfig.profile);
			}

			if (window.tauConfig.theme !== undefined) {
				setTheme(window.tauConfig.theme);
			}

			if (window.tauConfig.min !== undefined) {
				isMin = !!window.tauConfig.min;
			}

			if (window.tauConfig.location !== undefined) {
				tauLocation = window.tauConfig.location;
			}
		}

		// script attr higher priority
		scripts.forEach(function (script) {
			var attrProfile,
				attrTheme,
				src = script.src;

			if (src.match(/multiprofile/gi)) {
				attrProfile = script.getAttribute("data-tau-profile");
				attrTheme = script.getAttribute("data-tau-theme");
				if (attrProfile && attrProfile.length) {
					setProfile(attrProfile);
				}

				if (attrTheme && attrTheme.length) {
					setTheme(attrTheme);
				}

				if (!isMin && src.match(/.*\.min\.js.*/gi)) {
					isMin = true;
				}

				tauLocation = src.replace(/multiprofile.*/, "");
			}
		});

		profileData[profile].js.forEach(function (js) {
			document.write(
				createScript(
					makePath([tauLocation, profile, js + (isMin ? ".min.js" : ".js")])
				)
			);
		});

		profileData[profile].css[theme].forEach(function (css) {
			document.write(
				createLinkStylesheet(
					makePath([tauLocation, profile, "theme", theme, css + (isMin ? ".min.css" : ".css")])
				)
			);
		});

		}(window, document));



