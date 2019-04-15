define(function (require, exports, module) {
    "use strict";
    const slice = Array.prototype.slice;

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    if (PreferencesManager.getViewState("projectType") !== "sthings") {
        return;
    }

    const CommandManager = brackets.getModule("command/CommandManager"),
        Dialogs = brackets.getModule("widgets/Dialogs"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        Menus = brackets.getModule("command/Menus"),
        ProjectManager = brackets.getModule("project/ProjectManager");

    const AddAppDeviceTemplate = require("text!htmlContent/Add-Application-Device.html");

    const STHINGS_MENU = "sthings-menu";
    const STHINGS_ADD_APP_DEVICE = "sthings.addAppDevice";

    function handleAddAppDevice() {
        let appName;
        const dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(AddAppDeviceTemplate));
        const $dlg = dialog.getElement();
        const $OkBtn = $dlg.find(".dialog-button[data-button-id='ok']");
        $OkBtn[0].disabled = true;

        const appNameElement = $("#input-app-name", $dlg);
        appNameElement.on("change keyup paste", function () {
            if (this.value.trim().length !== 0) {
                $OkBtn[0].disabled = false;
            } else {
                $OkBtn[0].disabled = true;
            }

            appName = this.value;
        });

        // Add default APIs
        function addDefaultAPI() {
            let apiTable = $dlg.find("#AppProfiles")[0];
            let noOfRows = apiTable.rows.length;

            let APIs = ["Mobile", "TV", "Wearable", "Aircondition", "Light"];

            APIs.forEach((value, key) => {
                let row = apiTable.insertRow(key);
                let selectCell = row.insertCell(0);
                let nameCell = row.insertCell(1);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + value.toLowerCase() + "\">";
                nameCell.innerHTML = "<input type=\"text\" class=\"name\" style=\"width: 100%;\" value=\"" + value + "\"></input>";
            });
        }

        addDefaultAPI();

        const basePath = ProjectManager.getProjectRoot().fullPath;
        dialog.done((buttonId) => {
            let profiles = slice.call($dlg.get(0).querySelectorAll("#AppProfiles input[type='checkbox']:checked")).map((el) => {
                return el.value;
            });
            console.log(profiles);

            if (buttonId === "ok") {
                console.log("Add application to project");
                $.ajax({
                    url: "/project/appadd",
                    type: "post",
                    data: {
                        projectId: PreferencesManager.getViewState("projectId"),
                        name: appName,
                        profiles: profiles,
                        format: "sample",
                        type: "sthings",
                        templateName: "TAU-Base",
                        requiredVersion: "2.3.2"
                    }
                }).done(function () {
                    console.log("Add application to project: done");
                    ProjectManager.refreshFileTree();
                }).fail(function (err) {
                    console.error(err);
                });
            }
        });
    }

    CommandManager.register("Add Application Device", STHINGS_ADD_APP_DEVICE, handleAddAppDevice);

    var menu = Menus.getMenu(STHINGS_MENU);
    if (!menu) {
        menu = Menus.addMenu("S-Things", STHINGS_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    }

    menu.addMenuItem(STHINGS_ADD_APP_DEVICE);
});
