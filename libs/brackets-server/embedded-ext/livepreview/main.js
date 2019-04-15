/*jslint vars: true, plusplus: true, devel: true, nomen: true,  regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window, _hideSettings */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var _                   = brackets.getModule("thirdparty/lodash"),
        AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        MainViewManager     = brackets.getModule("view/MainViewManager"),
        Menus               = brackets.getModule("command/Menus"),
        NativeApp           = brackets.getModule("utils/NativeApp"),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager");

    // Templates
    var panelHTML       = require("text!templates/panel.html");

    // jQuery objects
    var $icon,
        $iframe,
        $panel;

    // Other vars
    var currentDoc,
        currentEditor,
        panel,
        panelVisibility = false,
        toggleCmd,
        viewMenu,
        visible = false;

    // Prefs
    var _prefs = PreferencesManager.getExtensionPrefs("live-preview");
    _prefs.definePreference("useGFM", "boolean", false);
    _prefs.definePreference("theme", "string", "clean");

    // (based on code in brackets.js)
    function _handleLinkClick(e) {
        // Check parents too, in case link has inline formatting tags
        var node = e.target, url;
        while (node) {
            if (node.tagName === "A") {
                url = node.getAttribute("href");
                if (url && !url.match(/^#/)) {
                    NativeApp.openURLInDefaultBrowser(url);
                }
                e.preventDefault();
                break;
            }
            node = node.parentElement;
        }
    }

    function _loadDoc(doc, isReload) {
        if (doc && visible && $iframe) {
            // Make <base> tag for relative URLS
            var projectId = PreferencesManager.getViewState("projectId");
            var filePath = brackets.app.convertFilePathToServerPath(doc.file.fullPath, projectId);

            $iframe.attr("src", filePath);

            // Remove any existing load handlers
            $iframe.off("load");
            $iframe.load(function () {
                // Open external browser when links are clicked
                // (similar to what brackets.js does - but attached to the iframe's document)
                $iframe[0].contentDocument.body.addEventListener("click", _handleLinkClick, true);

                // Make sure iframe is showing
                $iframe.show();
            });
        }
    }

    function _documentChange(e) {
        _loadDoc(e.target.getCurrentDocument(), true);
    }

    function _resizeIframe() {
        if (visible && $iframe) {
            var iframeWidth = panel.$panel.innerWidth();
            $iframe.attr("width", iframeWidth + "px");
        }
    }

    function _setPanelVisibility(isVisible) {
        if (isVisible === panelVisibility) {
            return;
        }

        panelVisibility = isVisible;
        if (isVisible) {
            if (!panel) {
                $panel = $(panelHTML);
                $iframe = $panel.find("#panel-live-preview-frame");

                panel = WorkspaceManager.createBottomPanel("live-preview-panel", $panel);
                $panel.on("panelResizeUpdate", function (e, newSize) {
                    $iframe.attr("height", newSize);
                });
                $iframe.attr("height", $panel.height());

                window.setTimeout(_resizeIframe);

                function _reloadIframe() {
                    var url = $iframe.attr("src");
                    $iframe.attr("src", url);
                }

                var pfx = ["webkit", "moz", "ms", ""];
                function _runPrefixMethod(obj, method) {
                    var m, p = 0, t;
                    while (p < pfx.length && !obj[m]) {
                        m = method;
                        if (pfx[p] === "") {
                            m = m.substr(0,1).toLowerCase() + m.substr(1);
                        }
                        m = pfx[p] + m;
                        t = typeof obj[m];
                        if (t !== "undefined") {
                            pfx = [pfx[p]];
                            return (t === "function" ? obj[m]() : obj[m]);
                        }
                        p++;
                    }
                }

                $("#fullscreen-toggle").click(function(e) {
                    _runPrefixMethod($iframe[0], "RequestFullScreen");
                    $($iframe[0]).on("fullscreenchange webkitfullscreenchange mozfullscreenchange msfullscreenchange", _reloadIframe);
                });

                $iframe.hide();
            }
            _loadDoc(DocumentManager.getCurrentDocument());
            $icon.toggleClass("active");
            panel.show();
        } else {
            $icon.toggleClass("active");
            panel.hide();
            $iframe.hide();
        }
    }

    function _currentDocChangedHandler() {
        var doc = DocumentManager.getCurrentDocument(),
            ext = doc ? FileUtils.getFileExtension(doc.file.fullPath).toLowerCase() : "";

        if (currentDoc) {
            DocumentManager.off("documentSaved", _documentChange);
            currentDoc = null;
        }

        if (doc && /html|htm/.test(ext)) {
            currentDoc = doc;
            // currentDoc.on("change", _documentChange);
            DocumentManager.on("documentSaved", _documentChange);

            currentEditor = EditorManager.getCurrentFullEditor();
            $icon.css({display: "block"});
            _setPanelVisibility(visible);
            toggleCmd.setEnabled(true);
            _loadDoc(doc);
        } else {
            $icon.css({display: "none"});
            toggleCmd.setEnabled(false);
            _setPanelVisibility(false);
        }
    }

    function _toggleVisibility() {
        visible = !visible;
        _setPanelVisibility(visible);

        toggleCmd.setChecked(visible);
    }

    // Debounce event callback to avoid excess overhead
    // Update preview 300 ms ofter document change
    _documentChange = _.debounce(_documentChange, 300);

    // Insert CSS for this extension
    ExtensionUtils.loadStyleSheet(module, "styles/LivePreview.css");

    // Add toolbar icon
    $icon = $("<a>")
        .attr({
            id: "live-preview-icon",
            href: "#"
        })
        .css({
            display: "none"
        })
        .click(_toggleVisibility)
        .appendTo($("#main-toolbar .buttons"));

    // Add a document change handler
    MainViewManager.on("currentFileChange", _currentDocChangedHandler);

    viewMenu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
    toggleCmd = CommandManager.register("Live Preview", "toggleLivePreview", _toggleVisibility);

    viewMenu.addMenuItem(toggleCmd);

    toggleCmd.setChecked(panelVisibility);
    toggleCmd.setEnabled(panelVisibility);

    // currentDocumentChange is *not* called for the initial document. Use
    // appReady() to set initial state.
    AppInit.appReady(function () {
        _currentDocChangedHandler();
    });

    // Listen for resize events
    WorkspaceManager.on("workspaceUpdateLayout", _resizeIframe);
    $("#sidebar").on("panelCollapsed panelExpanded panelResizeUpdate", _resizeIframe);
});
