define((require, exports, module) => {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    // Return extension when project type is not equal with iotjs
    if (PreferencesManager.getViewState("projectType") !== "iotjs") {
        return;
    }

    const CommandManager    = brackets.getModule("command/CommandManager"),
        DefaultDialogs      = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs             = brackets.getModule("widgets/Dialogs"),
        DocumentManager     = brackets.getModule("document/DocumentManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        Menus               = brackets.getModule("command/Menus"),
        NodeDomain          = brackets.getModule("utils/NodeDomain"),
        ProjectManager      = brackets.getModule("project/ProjectManager"),
        WorkspaceManager    = brackets.getModule("view/WorkspaceManager");

    const ExtensionStrings  = require("strings"),
        prefs               = require("./preferences");

    const DOMAIN_NAME            = "brackets-iotjs",
        IOTJS_EXEC_DIALOG_ID     = "node-exec-dialog",
        IOTJS_MenuID             = "iotjs-menu",
        IOTJS_SETTINGS_DIALOG_ID = "node-settings-dialog",
        PROJECT_MENU             = "project-menu";

    let scrollEnabled = prefs.get("autoscroll");

    const domain = new NodeDomain(DOMAIN_NAME, ExtensionUtils.getModulePath(module, "node/processDomain"));

    function convertRelativePath(path) {
        const newPath = path.split("/");
        newPath.splice(0, 2);
        return newPath.join("/");
    }

    const ConnectionManager = {
        last: {
            filePath: null,
            flags: null
        },

        create: function (filePath, flags) {
            const doc = DocumentManager.getCurrentDocument();

            ConnectionManager.exit();
            Panel.show(filePath);
            Panel.clear();

            const projectId = PreferencesManager.getViewState("projectId");
            domain.exec("startProcess", projectId, filePath, flags)
                .done(function(exitCode) {
                    Panel.write("Program exited with status code of " + exitCode + ".");
                }).fail(function(err) {
                    Panel.write("Error inside brackets-iotjs' processes occured: \n" + err);
                });

            // Store the last filePath and flags
            this.last.filePath = filePath;
            this.last.flags = flags;
        },

        runIOTJS: function () {
            const doc = DocumentManager.getCurrentDocument();
            if (doc === null || !doc.file.isFile) {
                return Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    ExtensionStrings.ERROR_DIALOG_TITLE,
                    ExtensionStrings.ERROR_MSG_NO_FILE
                );
            }

            const flags = prefs.get("iotjs-flags");
            this.create(convertRelativePath(doc.file.fullPath), flags);
        },

        rerun: function () {
            const last = this.last;

            this.create(last.filePath, last.flags);
        },

        exit: () => {
            domain.exec("stopProcess");
        }
    };


    $(".content").append(require("text!htmlContent/panel.html"));
    var Panel = {
        id: "brackets-iotjs-terminal",
        panel: null,
        commandTitle: null,
        height: 201,
        y: 0,

        get: function (qs) {
            return this.panel.querySelector(qs);
        },

        show: function (command) {
            this.panel.style.display = "block";
            this.commandTitle.textContent = command;
            WorkspaceManager.recomputeLayout();
        },

        hide: function () {
            this.panel.style.display = "none";
            WorkspaceManager.recomputeLayout();
        },

        clear: function () {
            this.pre.innerHTML = null;
        },

        write: function (str) {
            const e = document.createElement("span");
            e.innerHTML = str;

            let scroll = false;
            if (this.pre.parentNode.scrollTop === 0 || this.pre.parentNode.scrollTop === this.pre.parentNode.scrollHeight || this.pre.parentNode.scrollHeight - this.pre.parentNode.scrollTop === this.pre.parentNode.clientHeight) {
                scroll = true;
            }

            this.pre.appendChild(e);

            if (scroll && scrollEnabled) {
                this.pre.parentNode.scrollTop = this.pre.parentNode.scrollHeight;
            }
        },

        mousemove: (e) => {
            const h = Panel.height + (Panel.y - e.pageY);
            Panel.panel.style.height = h + "px";
            WorkspaceManager.recomputeLayout();
        },

        mouseup: (e) => {
            document.removeEventListener("mousemove", Panel.mousemove);
            document.removeEventListener("mouseup", Panel.mouseup);

            Panel.height = Panel.height + (Panel.y - e.pageY);
        }
    };

    Panel.panel = document.getElementById(Panel.id);
    Panel.commandTitle = Panel.get(".cmd");
    Panel.pre = Panel.get(".table-container pre");
    Panel.get(".resize").addEventListener("mousedown", (e) => {
        Panel.y = e.pageY;

        document.addEventListener("mousemove", Panel.mousemove);
        document.addEventListener("mouseup", Panel.mouseup);
    });

    Panel.get(".action-close").addEventListener("click", () => {
        ConnectionManager.exit();
        Panel.hide();
    });

    Panel.get(".action-terminate").addEventListener("click", () => {
        ConnectionManager.exit();
    });

    Panel.get(".action-rerun").addEventListener("click", () => {
        ConnectionManager.rerun();
    });

    var Dialog = {
        settings: {
            html: require("text!htmlContent/modal-settings.html"),

            show: function () {
                Dialogs.showModalDialog(
                    IOTJS_SETTINGS_DIALOG_ID,
                    ExtensionStrings.CONFIGURATION,
                    this.html,
                    [
                        {
                            className: Dialogs.DIALOG_BTN_CLASS_PRIMARY,
                            id: Dialogs.DIALOG_BTN_OK,
                            text: "Save"
                        }, {
                            className: Dialogs.DIALOG_BTN_CLASS_NORMAL,
                            id: Dialogs.DIALOG_BTN_CANCEL,
                            text: "Cancel"
                        }
                    ]
                ).done((id) => {
                    if (id !== "ok") {
                        return;
                    }

                    var flags = flagsInput.value;

                    // Store autoscroll config
                    scrollEnabled = scrollInput.checked;

                    prefs.set("iot.js-flags", flags.trim());
                    prefs.set("autoscroll", scrollEnabled);
                    prefs.save();

                });

                // It's important to get the elements after the modal is rendered but before the done event
                const flagsInput = document.querySelector("." + IOTJS_SETTINGS_DIALOG_ID + " .flags"),
                    scrollInput = document.querySelector("." + IOTJS_SETTINGS_DIALOG_ID + " .autoscroll");

                flagsInput.value = prefs.get("iotjs-flags");
                scrollInput.checked = prefs.get("autoscroll");
            }
        }
    };

    domain.on("output", (info, data) => {
        Panel.write(data);
    });

    const CONFIG_CMD_ID = "brackets-iotjs.config",
        RUN_CMD_ID = "brackets-iotjs.run";

    CommandManager.register(ExtensionStrings.RUN, RUN_CMD_ID, () => {
        ConnectionManager.runIOTJS();
    });

    CommandManager.register(ExtensionStrings.CONFIGURATION, CONFIG_CMD_ID, () => {
        Dialog.settings.show();
    });

    let menu = Menus.getMenu(PROJECT_MENU);
    if (!menu) {
        menu = Menus.addMenu(ExtensionStrings.PROJECT_MENU, PROJECT_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }

    menu.addMenuItem(RUN_CMD_ID);
    menu.addMenuItem(CONFIG_CMD_ID);
});
