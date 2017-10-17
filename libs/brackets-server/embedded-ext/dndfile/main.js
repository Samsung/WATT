/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, window, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var AppInit           = brackets.getModule("utils/AppInit"),
        CommandManager    = brackets.getModule("command/CommandManager"),
        Commands          = brackets.getModule("command/Commands"),
        Dialogs           = brackets.getModule("widgets/Dialogs"),
        DragnDropTemplate = require("text!htmlContent/dragndrop.html"),
        ExtensionStrings  = require("strings"),
        ExtensionUtils    = brackets.getModule("utils/ExtensionUtils"),
        FileSystem        = brackets.getModule("filesystem/FileSystem"),
        Menus             = brackets.getModule("command/Menus"),
        ProjectManager    = brackets.getModule("project/ProjectManager"),
        Strings           = brackets.getModule("strings");

    function fileOnLoaded(file, directoryPath) {
        return function(event) {
            if (event.target.readyState === window.FileReader.DONE) {
                var filePath = directoryPath + file.name;
                var generatedFile = FileSystem.getFileForPath(filePath);
                generatedFile.write(event.target.result,function(){
                    // Not implemented yet.
                });
            }
        };
    }

    function  handleFileReadSuccessCallback(directoryPath) {
        return function(file) {
            var reader = new window.FileReader();
            reader.onloadend = fileOnLoaded(file, directoryPath);
            reader.readAsText(file);
            // reader.readAsBinaryString(file);
        };
    }

    function errorHandler(error) {
        var errorMessage = "";
        switch (error.code) {
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

        console.err("Error: " + errorMessage);
    }

    function visitDirectory(directory) {
        var dirReader = directory.createReader();
        var baseDirEntry = ProjectManager.getProjectRoot();
        var directoryPath = baseDirEntry.fullPath + directory.fullPath;
        var newDirectory = FileSystem.getDirectoryForPath(directoryPath);

        newDirectory.create(function directoryCreated(){
            // Not implemented yet
        });

        dirReader.readEntries(function(entries) {
            for (var i=0; i<entries.length; i++) {
                var fileEntry = entries[i];
                if (fileEntry.isFile) {
                    fileEntry.file(handleFileReadSuccessCallback(newDirectory.fullPath), errorHandler);
                }
                else {
                    visitDirectory(fileEntry);
                }
            }
        });
    }

    function handleFileUpload(items) {
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var fileEntry;
            if (item.getAsEntry) {
                fileEntry = item.getAsEntry();
            }
            else {
                fileEntry = item.webkitGetAsEntry();
            }
            if (fileEntry.isFile) {
                var baseDirEntry = ProjectManager.getProjectRoot();
                var file = item.getAsFile();
                var reader = new window.FileReader();
                reader.onloadend = fileOnLoaded(file, baseDirEntry.fullPath);
                reader.readAsText(file); 
            }
            else {
                visitDirectory(fileEntry);
            }
        }
    }
    
    // Function to run when the menu item is clicked
    function handleImportFolder() {
        var context = {
            Strings: Strings,
            ExtensionStrings: ExtensionStrings
        };

        var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(DragnDropTemplate, context));

        $(document).on("dragenter", function (event) {
            event.stopPropagation();
            event.preventDefault();

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
