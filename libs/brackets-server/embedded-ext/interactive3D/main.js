/*global define, brackets, window, Mustache*/

define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    const type = PreferencesManager.getViewState("projectType");
    if (type !== "sthings") {
        return;
    }

    var CommandManager = brackets.getModule("command/CommandManager");
    var DefaultDialogs = brackets.getModule("widgets/DefaultDialogs");    
    var Dialogs = brackets.getModule("widgets/Dialogs");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var Menus = brackets.getModule("command/Menus");
    var NodeDomain = brackets.getModule("utils/NodeDomain");
   
    var DownloadDialogTemplate = require("text!htmlContent/Download-Dialog.html");
    var DownloadModelTemplate = require("text!htmlContent/Download-Model.html");

    var _domainPath = ExtensionUtils.getModulePath(module, "node/InteractiveDomain");
    var _nodeDomain = new NodeDomain("interactiveNodeDomain", _domainPath);

    var STHINGS_MENU = "sthings-menu";
    var I3D_DOWNLOAD = "sthings.download";

    var $dlg, $downloadProgress;
    var installState = false;

    function showModalDialog(title, message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            title,
            message
        );
    }

    function addModel(model) {
        const entry = $(DownloadModelTemplate).appendTo("#model-list");

        entry.find("#model-image").attr("src", model.imgSrc);
        entry.find("#model-title").text(model.title);

        if (model.installed) {
            entry.find("#model-download-btn").hide();
            entry.find("#model-delete-btn").show();
        }

        entry.find("#model-delete-btn").click(() => {
            // TODO: Need to implement delete feature
        });

        entry.find("#model-download-btn").click(() => {
            if (installState) {
                showModalDialog("ERROR", "Downloading is not finished!");
                return;
            }

            if (model.installed) {
                showModalDialog("ERROR", "Already installed!");
                return;
            }

            installState = true;
            $downloadProgress.show();

            const projectId = PreferencesManager.getViewState("projectId");
            _nodeDomain.exec("install", projectId, JSON.stringify(model)).done(success => {
                if (success) {
                    showModalDialog("DONE", "Download Finished");
                    model.installed = true;
                    entry.find("#model-download-btn").hide();
                    entry.find("#model-delete-btn").show();
                } else {
                    showModalDialog("ERROR", "This model does not provide 3d model data!");
                }

                installState = false;
                $downloadProgress.hide();
            });
        });
    }

    function handleModelDownload() {
        var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(DownloadDialogTemplate, {}));

        $dlg = dialog.getElement();
        $downloadProgress = $("#download-progress", $dlg);

        var $searchBtn = $("#search-model", $dlg);
        var $closeBtn = $(".dialog-button[data-button-id='cancel']", $dlg);
        var $modelList = $("#file-list", $dlg);

        $searchBtn.click(function(e) {
            const value = $dlg.find("#model-name").val();

            $modelList.children().remove();
            $downloadProgress.show();

            if (value.length !== 0) {
                const projectId = PreferencesManager.getViewState("projectId");
                _nodeDomain.exec("search", projectId, value).done(data => {
                    const models = JSON.parse(data);

                    if (models.length !== 0) {
                        models.forEach(model => {
                            addModel(model);
                        });
                    } else {
                        showModalDialog("ERROR", "Not found model");
                    }

                    $downloadProgress.hide();
                });
            }

            e.preventDefault();
            e.stopPropagation();
        });
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
    
    CommandManager.register("Download I3D Model", I3D_DOWNLOAD, handleModelDownload);
    
    var menu = Menus.getMenu(STHINGS_MENU);
    if (!menu) {
        menu = Menus.addMenu("Interactive 3D", STHINGS_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }

    menu.addMenuItem(I3D_DOWNLOAD, null, Menus.FIRST);
});
