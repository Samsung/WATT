define(function (require, exports, module) {
    "use strict";

    var CommandManager      = brackets.getModule("command/CommandManager"),
        Commands            = brackets.getModule("command/Commands"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        fsImpl              = brackets.getModule("fileSystemImpl"),
        Menus               = brackets.getModule("command/Menus");

    var Strings             = require("./strings");

    var OPEN_CMD_ID         = "remoteFS.open",
        OPEN_FLDR_CMD_ID    = "remoteFS.openFolder",
        SAVE_AS_CMD_ID      = "remoteFS.saveAs";

    ExtensionUtils.loadStyleSheet(module, "styles/dialog.less");

    if (fsImpl._setDialogs) {
        // This means we are running in hosted Brackets and remote-fs is already bound.
        // We still have to set the dialogs.
        fsImpl._setDialogs(require("./lib/open-dialog"), require("./lib/save-dialog"));
    } else {
        // We are running on native OS shell.
        var FileSystem  = brackets.getModule("filesystem/FileSystem"),
            handler     = function () {},
            menu        = Menus.getMenu(Menus.AppMenuBar.FILE_MENU),
            wrapper     = require("./lib/fs-wrapper");

        FileSystem.init(wrapper);

        CommandManager.register(Strings.MENU_OPEN, OPEN_CMD_ID, handler);
        CommandManager.register(Strings.MENU_OPEN_FOLDER, OPEN_FLDR_CMD_ID, handler);
        CommandManager.register(Strings.MENU_SAVE_AS, SAVE_AS_CMD_ID, handler);

        menu.addMenuItem(SAVE_AS_CMD_ID, "", Menus.AFTER, Commands.FILE_SAVE_AS);
        menu.addMenuItem(OPEN_FLDR_CMD_ID, "", Menus.AFTER, Commands.FILE_SAVE_AS);
        menu.addMenuItem(OPEN_CMD_ID, "", Menus.AFTER, Commands.FILE_SAVE_AS);
        menu.addMenuDivider(Menus.AFTER, Commands.FILE_SAVE_AS);
    }
});
