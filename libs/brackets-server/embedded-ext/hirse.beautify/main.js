define(function (require) {
    "use strict";

    var PREFIX = "hirse.beautify";
    var COMMAND_ID = PREFIX + ".beautify";

    /* beautify preserve:start */
    var CommandManager     = brackets.getModule("command/CommandManager");
    var Menus              = brackets.getModule("command/Menus");
    var DocumentManager    = brackets.getModule("document/DocumentManager");
    var Editor             = brackets.getModule("editor/Editor").Editor;
    var EditorManager      = brackets.getModule("editor/EditorManager");
    var DefaultDialogs     = brackets.getModule("widgets/DefaultDialogs");
    var Dialogs            = brackets.getModule("widgets/Dialogs");
    /* beautify preserve:end */

    var Strings = require("strings");
    var beautifiers = {
        js: require("thirdparty/beautify").js_beautify,
        css: require("thirdparty/beautify-css").css_beautify,
        html: require("thirdparty/beautify-html").html_beautify
    };

    var settings = JSON.parse(require("text!default.jsbeautifyrc"));
    var keyBindings = [
        {
            key: "Ctrl-Shift-L",
            platform: "win"
        }, {
            key: "Ctrl-Alt-B",
            platform: "win"
        }, {
            key: "Cmd-Shift-L",
            platform: "mac"
        }, {
            key: "Ctrl-Alt-B"
        }
    ];

    function batchUpdate(formattedText, isSelection) {
        var editor = EditorManager.getCurrentFullEditor();
        var cursorPos = editor.getCursorPos();
        var scrollPos = editor.getScrollPos();
        var doc = DocumentManager.getCurrentDocument();
        var selection = editor.getSelection();
        doc.batchOperation(function () {
            if (isSelection) {
                doc.replaceRange(formattedText, selection.start, selection.end);
            } else {
                doc.setText(formattedText);
            }
            editor.setCursorPos(cursorPos);
            editor.setScrollPos(scrollPos.x, scrollPos.y);
        });
    }

    function format() {
        var beautifierType;
        var document = DocumentManager.getCurrentDocument();
        switch (document.getLanguage().getId()) {
        case "javascript":
        case "json":
            beautifierType = "js";
            break;
        case "html":
        case "xml":
        case "svg":
        case "php":
        case "ejs":
        case "handlebars":
            beautifierType = "html";
            break;
        case "css":
        case "scss":
        case "less":
            beautifierType = "css";
            break;
        default:
            Dialogs.showModalDialog(DefaultDialogs.DIALOG_ID_ERROR, Strings.UNSUPPORTED_TITLE, Strings.UNSUPPORTED_MESSAGE);
            return;
        }

        var options = $.extend({}, settings[beautifierType] || settings);
        if (Editor.getUseTabChar()) {
            options.indent_with_tabs = true;
        } else {
            options.indent_size = Editor.getSpaceUnits();
            options.indent_char = " ";
        }

        var unformattedText;
        var editor = EditorManager.getCurrentFullEditor();
        if (editor.hasSelection()) {
            options.indentation_level = editor.getSelection().start.ch;
            options.end_with_newline = false;
            unformattedText = editor.getSelectedText();
        } else {
            unformattedText = document.getText();
        }
        var formattedText = beautifiers[beautifierType](unformattedText, options);
        if (formattedText !== unformattedText) {
            batchUpdate(formattedText, editor.hasSelection());
        }
    }

    CommandManager.register(Strings.BEAUTIFY, COMMAND_ID, format);

    var editMenu = Menus.getMenu(Menus.AppMenuBar.EDIT_MENU);
    editMenu.addMenuDivider();
    editMenu.addMenuItem(COMMAND_ID, keyBindings);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(COMMAND_ID);
});
