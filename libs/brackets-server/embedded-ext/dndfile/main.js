/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, window, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit           = brackets.getModule("utils/AppInit"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        Commands          = brackets.getModule("command/Commands"),
        DefaultDialogs    = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs           = brackets.getModule("widgets/Dialogs"),
        DragnDropTemplate = require("text!htmlContent/dragndrop.html"),
        ExtensionStrings  = require("strings"),
        ExtensionUtils    = brackets.getModule("utils/ExtensionUtils"),
        FileSystem        = brackets.getModule("filesystem/FileSystem"),
        Menus             = brackets.getModule("command/Menus"),
        ProjectManager    = brackets.getModule("project/ProjectManager"),
        Strings           = brackets.getModule("strings");

    function fileOnLoaded(file, directoryPath, resolve) {
        return function(event) {
            if (event.target.readyState === window.FileReader.DONE) {
                var filePath = directoryPath + file.name;
                var generatedFile = FileSystem.getFileForPath(filePath);
                generatedFile.write(event.target.result);
                ProjectManager.refreshFileTree();
                resolve({ path: filePath });
            }
        };
    }

    function  handleFileReadSuccessCallback(directoryPath, resolve) {
        return function(file) {
            var reader = new window.FileReader();
            reader.onloadend = fileOnLoaded(file, directoryPath, resolve);
            reader.onerror = err => {
                resolve({ err, path: directoryPath + file.path + file.name });
                console.log(err);
            };
            reader.readAsArrayBuffer(file);
        };
    }

    function handleFileReadFailureCallback(path, resolve) {
        return function(err) {
            let errorMessage = "";
            switch (err.code) {
            case window.FileError.QUOTA_EXCEEDED_ERR:
                errorMessage = "QUOTA_EXCEEDED_ERR";
                break;
            case window.FileError.NOT_FOUND_ERR:
                errorMessage = "NOT_FOUND_ERR";
                break;
            case window.FileError.SECURITY_ERR:
                errorMessage = "SECURITY_ERR";
                break;
            case window.FileError.INVALID_MODIFICATION_ERR:
                errorMessage = "INVALID_MODIFICATION_ERR";
                break;
            case window.FileError.INVALID_STATE_ERR:
                errorMessage = "INVALID_STATE_ERR";
                break;
            default:
                errorMessage = "Unknown Error";
                break;
            }
            resolve({
                err: new Error(errorMessage),
                path
            });
        };
    }

    function handleFileReadPromise(dirpath, fileEntry) {
        return new Promise(resolve =>
            fileEntry.file(
                handleFileReadSuccessCallback(dirpath, resolve),
                handleFileReadFailureCallback(dirpath + fileEntry.fullPath, resolve)));
    }

    function visitDirectory(directory) {
        var dirReader = directory.createReader();
        var baseDirEntry = ProjectManager.getProjectRoot();
        var directoryPath = baseDirEntry.fullPath + directory.fullPath;
        var newDirectory = FileSystem.getDirectoryForPath(directoryPath);

        newDirectory.create(function directoryCreated(){
            // Not implemented yet
        });

        return new Promise(resolve => {
            dirReader.readEntries(function(entries) {
                const promises = [];
                for (var i=0; i<entries.length; i++) {
                    var fileEntry = entries[i];
                    if (fileEntry.isFile) {
                        promises.push(handleFileReadPromise(newDirectory.fullPath, fileEntry));
                    }
                    else {
                        promises.push(visitDirectory(fileEntry));
                    }
                }
                resolve(Promise.all(promises));
            });
        });
    }

    function handleFileLoadPromise(file) {
        return new Promise(resolve => {
            const reader = new window.FileReader();
            const baseDirEntry = ProjectManager.getProjectRoot();
            reader.onloadend = fileOnLoaded(file, baseDirEntry.fullPath, resolve);
            reader.onerror = err => {
                resolve({ err, path: baseDirEntry.fullPath + file.name });
                console.log(err);
            };
            reader.readAsText(file);
        });
    }

    function handleFileUpload(items) {
        const promises = [];
        for (var i = 0; i < items.length; i++) {
            console.log(items.length);
            var item = items[i];
            var fileEntry;
            if (item.getAsEntry) {
                fileEntry = item.getAsEntry();
            }
            else {
                fileEntry = item.webkitGetAsEntry();
            }
            if (fileEntry.isFile) {
                const file = item.getAsFile();
                promises.push(handleFileLoadPromise(file));
            }
            else {
                promises.push(visitDirectory(fileEntry));
            }
        }
        Promise.all(promises).then(results => {
            const flatten = arr =>
                arr.reduce(
                    (flat, toFlatten) =>
                        flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten),
                    []);
            const loadArray = flatten(results);
            if (loadArray.length !== 0) {
                const loadSuccesses = [];
                const loadFailures = [];
                loadArray.forEach(load =>
                    load.err
                        ? loadFailures.push(`${load.path}<br><div style=\"text-indent: 2px\">${load.err.message}</div>`)
                        : loadSuccesses.push(load.path));
                const loadSuccessesText = loadSuccesses.length !== 0
                    ? `Files added:<br>${loadSuccesses.sort().join("<br>")}`
                    : "";
                const loadFailuresText = loadFailures.length !== 0
                    ? `Files failed to load:<br>${loadFailures.sort().join("<br>")}`
                    : "";
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_INFO,
                    loadSuccessesText + (loadFailuresText ? `<br><br>${loadFailuresText}` : ""));
            }
        });
    }

    // Function to run when the menu item is clicked
    function handleImportFolder() {
        var context = {
            Strings: Strings,
            ExtensionStrings: ExtensionStrings
        };

        var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(DragnDropTemplate, context));
        var dndHandler = $(".dndhandler");

        dndHandler.on("dragenter", function (dragEnterEvent) {
            dragEnterEvent.stopPropagation();
            dragEnterEvent.preventDefault();
            $(this).css("border", "2px solid #0B85A1");
        });

        dndHandler.on("dragover", function (dragOverEvent) {
            dragOverEvent.stopPropagation();
            dragOverEvent.preventDefault();
        });

        dndHandler.on("drop", function (dropEvent) {
            $(this).css("border", "2px dotted #0B85A1");
            dropEvent.preventDefault();
            var droppedItems = dropEvent.originalEvent.dataTransfer.items;

            // We need to send dropped files to Server
            handleFileUpload(droppedItems);
        });

        $(document).on("dragover", function (dragOverEvent) {
            dragOverEvent.stopPropagation();
            dragOverEvent.preventDefault();
            var dndHandler = $(".dndhandler");
            dndHandler.css("border", "2px dotted #0B85A1");
        });

        $(document).on("drop", function (dropEvent) {
            dropEvent.stopPropagation();
            dropEvent.preventDefault();
        });

        dialog.done(function () {
            // Do nothing
        });
    }

    AppInit.htmlReady(function () {
        // First, register a command - a UI-less object associating an id to a handler
        var FILE_IMPORT_FOLDER = "importfolder.draganddrop";
        CommandManager.register(ExtensionStrings.MENU_TITLE, FILE_IMPORT_FOLDER, handleImportFolder);

        var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
        contextMenu.addMenuItem(FILE_IMPORT_FOLDER, undefined, Menus.BEFORE, Commands.FILE_RENAME);

        // Then create a menu item bound to the command
        // The label of the menu item is the name we gave the command (see above)
        var menu = Menus.getMenu(Menus.AppMenuBar.FILE_MENU);
        menu.addMenuItem(FILE_IMPORT_FOLDER, undefined, Menus.BEFORE, Commands.FILE_CLOSE);
    });

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
});
