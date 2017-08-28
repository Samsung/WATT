define(function (require, exports, module) {
    "use strict";

    var CommandManager     = brackets.getModule("command/CommandManager"),
        DefaultDialogs     = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs            = brackets.getModule("widgets/Dialogs"),
        ExtensionUtils     = brackets.getModule("utils/ExtensionUtils"),
        Menus              = brackets.getModule("command/Menus"),
        NodeDomain         = brackets.getModule("utils/NodeDomain"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager     = brackets.getModule("project/ProjectManager"),
        Strings            = brackets.getModule("strings");

    var ExtensionStrings               = require("strings"),
        GenerateManifestDialogTemplate = require("text!htmlContent/Generate-Manifest-Dialog.html");

    const type = PreferencesManager.getViewState("projectType");

    // Return module when WATT isn't pwe mode.
    if (type !== "pwe") {
        return;
    }

    var _domainPath = ExtensionUtils.getModulePath(module, "node/PWEDomain"),
        _nodeDomain = new NodeDomain("pwe", _domainPath);

    var PROJECT_MENU = "project-menu";
    var PROJECT_ENABLE_PUSH = "project.enablePush";
    var PROJECT_GENERATE_SERVICEWORKER = "project.generateServiceWorker";
    var PROJECT_PUBLISH_PROJECT = "project.publishProject";
    var PROJECT_VALIDATE_MANIFEST = "project.validateManifest";
    var TOOLS_MENU = "tool-menu";

    var buttons = [
        {
            className: Dialogs.DIALOG_BTN_CLASS_LEFT,
            id:        Dialogs.DIALOG_BTN_CANCEL,
            text:      Strings.CANCEL
        },
        {
            className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
            id:        Dialogs.DIALOG_BTN_OK,
            text:      Strings.OK
        }
    ];

    function generateServiceWorker(list, projectManager) {
        var projectId = PreferencesManager.getViewState("projectId");
        let fileList = [];
        $.each(list, function(index) {
            fileList.push(list[index].value);
        });
        _nodeDomain.exec("generateServiceWorker", projectId, fileList, "/projects/")
            .done(function(error) {
                if (error) {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_ERROR,
                        "Error",
                        "<div style=\"padding: 10px;\" align=\"center\">error message: " + error + "</idv>"
                    );
                } else {
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        "Success",
                        "<div style=\"padding: 10px;\" align=\"center\">" +
                        "<b style=\"font-size: 16px;\">Successfully generated service-worker.js</b></div>"
                    );
                    projectManager.refreshFileTree();
                }
            });
    }

    function handleServiceWorker () {
        var projectManager = brackets.test.ProjectManager;
        var dialogText = "<form id=\"fileSelect\" style=\"width: 550px; height: 150px; overflow-y: auto; background: white; padding: 10px;\">";
        var isServiceWorker = false;
        projectManager.getAllFiles(true).then(function(files) {
            files.forEach(function(file) {
                dialogText += "<input type=\"checkbox\" value='" + file._path.substr(10) + "' checked>" + file._path.substr(10) + "<br/>";
                if (file.name === "service-worker.js") {
                    isServiceWorker = true;
                }
            });
            dialogText += "</form>";

            var fileSelectDialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Select Pre-cache List",
                dialogText,
                buttons
            );

            var $dlg = fileSelectDialog.getElement();
            var $select = $("#fileSelect", $dlg);

            fileSelectDialog.done(function (buttonId) {
                if (buttonId === "ok") {
                    const selectedFiles = $select.find("input[type=checkbox]:checked");
                    if (isServiceWorker === true) {
                        var progressDialog = Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            "Confirm",
                            "<div style=\"padding: 10px;\" align=\"center\"><b style=\"font-size: 30px; color: red;\">&#9888;</b>" +
                                "<b style=\"font-size: 16px;\"> service-worker.js already exists. Do you want to overwrite it?</b></div>",
                            buttons
                        );
                        progressDialog.done(function (buttonId) {
                            if (buttonId === "ok") {
                                generateServiceWorker(selectedFiles, projectManager);
                            }
                        });
                    } else {
                        generateServiceWorker(selectedFiles, projectManager);
                    }
                }
            });
        });
    }

    function validateManifest () {
        ProjectManager.getAllFiles((file) => {
            let fileName = file.name;
            let lowerCaseName = fileName.toLowerCase();
            let fileNameArr = lowerCaseName.split(".");
            return fileNameArr[0] === "manifest";
        }).done((files) => {
            var projectId = PreferencesManager.getViewState("projectId");
            if (files.length === 0) {
                var context = {
                    Strings: Strings,
                    ExtensionStrings: ExtensionStrings
                };
                var dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(GenerateManifestDialogTemplate, context));

                dialog.done(function (buttonId) {
                    if (buttonId === "ok") {
                        var projectName = PreferencesManager.getViewState("projectName");
                        _nodeDomain.exec("generate", projectId, projectName, "/projects/").done(function(data) {
                            if (data) {
                                Dialogs.showModalDialog(
                                    DefaultDialogs.DIALOG_ID_INFO,
                                    ExtensionStrings.COMPILATION_SUCCESS,
                                    "A new manifest file is generated under your project. " +
                                    "Please edit manifest.json if you want to add more information. " +
                                    "If you need more information about manifest, please refer to the manifest standard on https://w3c.github.io/manifest/."
                                );
                                ProjectManager.refreshFileTree();
                            } else {
                                Dialogs.showModalDialog(
                                    DefaultDialogs.DIALOG_ID_ERROR,
                                    ExtensionStrings.COMPILATION_FAILED,
                                    "An error occurred while generating a manifest file. " +
                                    "Please try it later or create manifest.json by yourself. " +
                                    "If you need more information about manifest, please refer to the manifest standard on https://w3c.github.io/manifest/"
                                );
                            }
                        });
                    }
                });
            } else {
                var filePath = files[0].parentPath + files[0].name;
                _nodeDomain.exec("validate", projectId, filePath).done(function(data) {
                    if (data.length === 0) {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_INFO,
                            ExtensionStrings.COMPILATION_SUCCESS,
                            "Your manifest file conforms to the W3C recommendations. To modifiy your manifest in the future, please refer to https://w3c.github.io/manifest/."
                        );
                    } else {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_ERROR,
                            ExtensionStrings.COMPILATION_FAILED,
                            data + " The PWA manifest file should conform to the W3C spec. " +
                                "Please refer to https://w3c.github.io/manifest/ and modify your manifest file."
                        );
                    }
                });
            }
        });
    }

    function handlePublishProject() {
        var projectId = PreferencesManager.getViewState("projectId");
        var userId = PreferencesManager.getViewState("projectUser");
        window.location.href = "https://pwe.now.im/watt/" + userId + "/" + projectId;
        return;
    }

    function handlePushEvnet() {
        var projectManager = brackets.test.ProjectManager;
        var enabledPush = false;
        var hasServiceWorker = false;
        projectManager.getAllFiles(true).then(function(files) {
            files.forEach(function(file) {
                if (file.name === "service-worker-push.js") {
                    enabledPush = true;
                } else if (file.name === "service-worker.js") {
                    hasServiceWorker = true;
                }
            });

            if (!hasServiceWorker) {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    "error",
                    "<div style=\"padding: 10px;\" align=\"center\">Push service requires service-worker</div>"
                );
                return;
            }
            if (!enabledPush) {
                var progressDialog = Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_INFO,
                    "confirm",
                    "Are you sure want to enable push service?",
                    buttons
                );
                var projectId = PreferencesManager.getViewState("projectId");
                progressDialog.done(function (buttonId) {
                    if (buttonId === "ok") {
                        _nodeDomain.exec("enablePush", projectId, "/projects/")
                            .done(function(error) {
                                if (error) {
                                    Dialogs.showModalDialog(
                                        DefaultDialogs.DIALOG_ID_ERROR,
                                        "error",
                                        "<div style=\"padding: 10px;\" align=\"center\">error message: " + error + "</idv>"
                                    );
                                } else {
                                    Dialogs.showModalDialog(
                                        DefaultDialogs.DIALOG_ID_INFO,
                                        "success",
                                        "<div style=\"padding: 10px;\" align=\"center\">Insert service-worker-register.js on your code</div>"
                                    );
                                    projectManager.refreshFileTree();
                                }
                            });
                    }
                });
            } else {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    "error",
                    "<div style=\"padding: 10px;\" align=\"center\">Already enabled push service</idv>"
                );
            }
        });
    }

    CommandManager.register(ExtensionStrings.MENU_TITLE_GENERATE_SERVICEWORKER, PROJECT_GENERATE_SERVICEWORKER, handleServiceWorker);
    CommandManager.register(ExtensionStrings.MANIFEST_VALIDATE_TITLE, PROJECT_VALIDATE_MANIFEST, validateManifest);
    CommandManager.register(ExtensionStrings.MENU_TITLE_ENABLE_PUSH, PROJECT_ENABLE_PUSH, handlePushEvnet);
    CommandManager.register(ExtensionStrings.MENU_TITLE_PUBLISH, PROJECT_PUBLISH_PROJECT, handlePublishProject);

    var menu = Menus.getMenu(PROJECT_MENU);
    if (!menu) {
        menu = Menus.addMenu(ExtensionStrings.PROJECT_MENU, PROJECT_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }
    menu.addMenuItem(PROJECT_PUBLISH_PROJECT);

    menu = Menus.getMenu(TOOLS_MENU);
    if (!menu) {
        menu = Menus.addMenu(ExtensionStrings.TOOLS_MENU, TOOLS_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }
    menu.addMenuItem(PROJECT_GENERATE_SERVICEWORKER);
    menu.addMenuItem(PROJECT_VALIDATE_MANIFEST);
    menu.addMenuItem(PROJECT_ENABLE_PUSH);
});
