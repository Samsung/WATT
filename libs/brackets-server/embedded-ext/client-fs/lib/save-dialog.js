define(function (require, exports) {
    "use strict";

    var Dialogs             = brackets.getModule("widgets/Dialogs"),
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        FileUtils           = brackets.getModule("file/FileUtils");

    var ConfirmReplace      = require("./confirm-replace"),
        contents            = require("./contents"),
        CreateFolder        = require("./create-folder"),
        dialogTemplate      = require("text!../templates/save-dialog.html"),
        Strings             = require("../strings");

    exports.show = function (title, initialPath, proposedNewFilename, callback) {
        if (initialPath.indexOf("/samples/") === 0) {
            initialPath = null;
        }

        var context = {
                TITLE: title,
                BUTTON_CANCEL: Strings.BUTTON_CANCEL,
                BUTTON_SAVE: Strings.BUTTON_SAVE,
                LABEL_FILE_NAME: Strings.LABEL_FILE_NAME,
                OPEN_FOLDER: Strings.BUTTON_OPEN_FOLDER,
                BUTTON_CREATE_FOLDER: Strings.BUTTON_CREATE_FOLDER,
                proposed: proposedNewFilename
            },
            dialog      = Dialogs.showModalDialogUsingTemplate(Mustache.render(dialogTemplate, context)),
            path        = initialPath || brackets.app.getUserDocumentsDirectory();

        var $dialog     = dialog.getElement(),
            $input      = $dialog.find("#rfs-file-name"),
            $newFolder  = $dialog.find("#rfs-create-folder"),
            $saveName   = $dialog.find("#rfs-save-name"),
            btnOk       = $dialog.find("button[data-button-id='ok']")[0],
            cnts;

        function getFullName() {
            return FileUtils.stripTrailingSlash(path) + "/" + $input.val().trim();
        }

        function handleButton() {
            if (!$input.val().trim()) {
                btnOk.disabled = true;
            } else if (btnOk.disabled) {
                btnOk.disabled = false;
            }
            $saveName.text(getFullName());
        }

        function onSelected(val) {
            if (val.path) {
                path = val.path;
            }

            if (val.fileName) {
                $input.val(val.fileName);
                handleButton();
            }

            $saveName.text(getFullName());
        }

        $input.keyup(handleButton);
        $newFolder.click(function (event) {
            event.stopImmediatePropagation();
            var names = [];
            cnts.files.forEach(function (el) {
                names.push(el.name);
            });
            CreateFolder.show(names, function (name) {
                var fullName    = FileUtils.stripTrailingSlash(path) + "/" + name;
                var dir         = FileSystem.getDirectoryForPath(fullName);

                dir.create(function (err) {
                    if (err) {
                        return callback(err);
                    }

                    path = fullName;
                    cnts = contents($dialog, false, false, title, path, null, null, callback, onSelected);
                });
            });
        });

        cnts = contents($dialog, false, false, title, path, null, null, callback, onSelected);

        dialog.done(function (buttonId) {
            if (buttonId === "ok") {
                var fullName = getFullName();
                var file = FileSystem.getFileForPath(fullName);

                file.exists(function (err, exists) {
                    if (err) {
                        return callback(err);
                    }

                    if (exists) {
                        ConfirmReplace.show(path, $input.val().trim(), function (buttonId) {
                            if (buttonId === "ok") {
                                callback(null, fullName);
                            }
                        });
                    } else {
                        callback(null, fullName);
                    }
                });
            }
        });
    };
});
