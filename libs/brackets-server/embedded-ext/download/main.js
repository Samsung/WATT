define(function () {
    "use strict";

    // Brackets modules
    var Commands                 = brackets.getModule("command/Commands"),
        CommandManager           = brackets.getModule("command/CommandManager"),
        Menus                    = brackets.getModule("command/Menus"),
        PreferencesManager       = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager           = brackets.getModule("project/ProjectManager");

    var FILE_DOWNLOAD = "file.download";

    function handleDownloadFile() {
        var selected = ProjectManager.getSelectedItem();

        if (selected && selected.isFile) {
            var projectId = PreferencesManager.getViewState("projectId");
            var filePath = brackets.app.convertFilePathToServerPath(selected.fullPath, projectId);
            var anchor = document.createElement("a");
            anchor.href = filePath;
            anchor.download = selected.name;
            anchor.click();
        }
    }

    var command = CommandManager.register("Download", FILE_DOWNLOAD, handleDownloadFile);

    function updateEnabledState() {
        var selected = ProjectManager.getSelectedItem();

        command.setEnabled(selected && selected.isFile);
    }

    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU);
    contextMenu.on("beforeContextMenuOpen", updateEnabledState);
    contextMenu.addMenuItem(FILE_DOWNLOAD, undefined, Menus.AFTER, Commands.FILE_RENAME);
});