define(function(require, exports, module) {
    "use strict";

    const AppInit            = brackets.getModule("utils/AppInit");
    const ExtensionUtils     = brackets.getModule("utils/ExtensionUtils");
    const NodeDomain         = brackets.getModule("utils/NodeDomain");
    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    const DownloaderEditorTemplate  = require("text!i3d/html/downloaderEditorTemplate.html");
    const DownloaderUIBuilder       = require("i3d/DownloaderUIBuilder");

    const ModelEditorTemplate   = require("text!i3d/html/modelEditorTemplate.html");
    const ModelEditorUIBuilder  = require("i3d/ModelEditorUIBuilder");

    const domainPath = ExtensionUtils.getModulePath(module, "node/interactiveDomain");
    const nodeDomain = new NodeDomain("interactiveDomain", domainPath);

    let lastSelectedElement;

    $(document).on("click", "#downloader-editor-close", function(event) {
        $("#downloader-editor").toggleClass("toolboxCollapsed");
        $(this).toggleClass("collapsed");
        event.preventDefault();
        event.stopPropagation();
    });

    $(document).on("element.selected", "#html-design-editor", (event, element) => {
        lastSelectedElement = element;

        const projectId = PreferencesManager.getViewState("projectId");
        nodeDomain.exec("installSeedModel", projectId).done(() => {
            ModelEditorUIBuilder.buildUI(nodeDomain, lastSelectedElement);
        });
    });

    $(document).on("deselect.all", "#html-design-editor", (event) => {
        lastSelectedElement = null;
    });

    $(document).on("click", "#interactive-editor-close", function(event) {
        $("#interactive-editor").toggleClass("toolboxCollapsed");
        $(this).toggleClass("collapsed");
        event.preventDefault();
        event.stopPropagation();
    });

    AppInit.appReady(() => {
        $("#docked-toolbox").append(DownloaderEditorTemplate);
        DownloaderUIBuilder.buildUI(nodeDomain);
        $("#docked-toolbox").append(ModelEditorTemplate);
    });
});
