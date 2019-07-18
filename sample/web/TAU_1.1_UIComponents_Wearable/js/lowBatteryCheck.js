(function () {
	var systeminfo = {

		systeminfo: null,

		lowThreshold: 0.04,

		/**
		 * Listener for the battery level changes
		 */
		listenBatteryLowState: function () {
			var self = this;

			try {
				this.systeminfo.addPropertyValueChangeListener(
					"BATTERY",
					function change(battery) {
						if (!battery.isCharging) {
							try {
								tizen.application.getCurrentApplication().exit();
							} catch (ignore) {
							}
						}
					},
					{
						lowThreshold: self.lowThreshold
					},
					function onError(error) {
						console.warn("An error occurred " + error.message);
					}
				);
			} catch (ignore) {
			}
		},

		/**
		 * Check the remaining battery level is low
		 */
		checkBatteryLowState: function () {
			var self = this;

			try {
				this.systeminfo.getPropertyValue(
					"BATTERY",
					function (battery) {
						if (battery.level < self.lowThreshold && !battery.isCharging) {
							try {
								tizen.application.getCurrentApplication().exit();
							} catch (ignore) {
							}
						}
					},
					null);
			} catch (ignore) {
			}

		},

		init: function () {
			if (typeof tizen === "object" && typeof tizen.systeminfo === "object") {
				this.systeminfo = tizen.systeminfo;
				this.checkBatteryLowState();
				this.listenBatteryLowState();
			}			else {
				console.warn("tizen.systeminfo is not available.");
			}
		}
	};

	systeminfo.init();

}());
