define(function(require, exports, module) {
    var AppInit        = brackets.getModule("utils/AppInit"),
        CommandManager = brackets.getModule("command/CommandManager"),
        EditorManager  = brackets.getModule("editor/EditorManager"),
        Menus          = brackets.getModule("command/Menus");

    var ExtensionStrings = require("strings"),
        TauDocumentParser = require("tau-document-parser"),
        TauDocumentView = require("tau-document-view");

    var TAU_DOCUMENT = "tau.document";

    var TauDocument = null;
    var tauDocumentParser = null;
    var tauDocumentView = null;

    function openDocumentView() {
        var ref = tauDocumentParser.parse();
        var editor = EditorManager.getFocusedEditor();

        var href = ref.href;
        if (!href) {
            editor.displayErrorMessageAtCursor(ExtensionStrings.NO_MATCHING);
            return;
        } 

        if (!tauDocumentView) {
            tauDocumentView = new TauDocumentView();
        }


        tauDocumentView.setVisibility(true);
        tauDocumentView.loadDocument(href);
    }

    module.exports = TauDocument = {
        initialize: function () {
            tauDocumentParser = new TauDocumentParser();
        },
        initializeMenus: function () {
            AppInit.appReady(function () {
                var viewMenu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
                var toggleCmd = CommandManager.register(ExtensionStrings.DOCUMENT, TAU_DOCUMENT, openDocumentView);
                viewMenu.addMenuItem(toggleCmd);

                var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
                contextMenu.addMenuItem(TAU_DOCUMENT);
            });
        }
    };
});