/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    function OpenTab(evt, configPage, tabName) {
        let tabcontent = configPage.find(".tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        let tablinks = configPage.find(".tablinks");
        for (let i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("active");
        }
        configPage.find("#"+tabName)[0].style.display = "block";
        evt.currentTarget.classList.add("active");
    }

    exports.OpenTab = OpenTab;
});
