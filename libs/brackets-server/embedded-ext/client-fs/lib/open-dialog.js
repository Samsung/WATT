define(function (require, exports) {
    "use strict";

    var Dialogs             = brackets.getModule("widgets/Dialogs");

    var contents            = require("./contents"),
        dialogTemplate      = require("text!../templates/open-dialog.html"),
        Strings             = require("../strings");

    exports.show = function (allowMultipleSelection, chooseDirectories, title, initialPath, fileTypes, callback) {
        if (initialPath.indexOf("/samples/") === 0) {
            initialPath = null;
        }

        var context = {
                TITLE: title,
                BUTTON_CANCEL: Strings.BUTTON_CANCEL,
                BUTTON_OPEN: Strings.BUTTON_OPEN
            },
            dialog      = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context)),
            path        = initialPath || brackets.app.getUserDocumentsDirectory();

        var $dialog     = dialog.getElement(),
            cnts        = contents($dialog, allowMultipleSelection, chooseDirectories, title, path, fileTypes, null, callback, null);

        dialog.done(function (buttonId) {
            if (buttonId === "ok") {
                callback(null, cnts.getSelected());
            }
        });
    };
});
