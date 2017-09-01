/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, camelcase: false*/
/*global define, brackets, Mustache*/

define(function (require, exports, module) {
    "use strict";

    var AboutDialogTemplate = require("text!htmlContent/about-watt-dialog.html"),
        AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        Commands            = brackets.getModule("command/Commands"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        Menus               = brackets.getModule("command/Menus"),
        Strings             = require("strings");

    function handleAboutWatt() {
        var templateVars = {
            ABOUT_ICON      : ExtensionUtils.getModuleUrl(module, "images/watt.png"),
            APP_NAME        : "WATT",
            BUILD_TIMESTAMP : brackets.config.build_timestamp,
            BUILD_INFO      : "",
            Strings         : Strings
        };

        Dialogs.showModalDialogUsingTemplate(Mustache.render(AboutDialogTemplate, templateVars));
    }

    AppInit.htmlReady(function () {
        // First, register a command - a UI-less object associating an id to a handler
        var HELP_ABOUT_WATT = "help.about.watt";
        CommandManager.register(Strings.MENU_TITLE, HELP_ABOUT_WATT, handleAboutWatt);

        // Then create a menu item bound to the command
        // The label of the menu item is the name we gave the command (see above)
        var menu = Menus.getMenu(Menus.AppMenuBar.HELP_MENU);
        menu.addMenuItem(HELP_ABOUT_WATT);
    });
});
