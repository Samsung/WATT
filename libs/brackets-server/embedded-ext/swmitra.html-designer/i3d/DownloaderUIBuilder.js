define(function (require, exports, module) {
    "use strict";

    const DefaultDialogs      = brackets.getModule("widgets/DefaultDialogs");
    const Dialogs             = brackets.getModule("widgets/Dialogs");
    const ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");
    const PreferencesManager  = brackets.getModule("preferences/PreferencesManager");

    const DownloaderContainerTemplate = require("text!i3d/html/downloaderContainerTemplate.html");
    const DownloaderModelTemplate     = require("text!i3d/html/downloaderModelTemplate.html");

    let installState = false;
    let _nodeDomain;

    function showModalDialog(title, message) {
        Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_ERROR,
            title,
            message
        );
    }

    function addModel(model) {
        const entry = $(DownloaderModelTemplate).appendTo("#downloader-model-container");

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
            $("#download-progress").show();

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
                $("#download-progress").hide();
            });
        });
    }

    function buildDownloaderUI(nodeDomain) {
        _nodeDomain = nodeDomain;

        $("#downloader-editor").show();
        const entry = $(DownloaderContainerTemplate).appendTo("#downloader-editor");

        const searchBtn = entry.find("#search-btn");
        searchBtn.click(() => {
            $("#downloader-model-container").children().remove();
            $("#download-progress").show();

            const value = entry.find("#search-value").val();
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

                    $("#download-progress").hide();
                });
            }
        });
    }

    exports.buildUI = buildDownloaderUI;
});