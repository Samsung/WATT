/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var DefaultDialogs        = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs               = brackets.getModule("widgets/Dialogs"),
        FileSystem            = brackets.getModule("filesystem/FileSystem"),
        FileUtils             = brackets.getModule("file/FileUtils"),
        PreferencesManager    = brackets.getModule("preferences/PreferencesManager"),
        Strings               = brackets.getModule("strings");

    var LocalizedStringControl  = require("scripts/LocalizedStringControl"),
        MetaDataControl       = require("scripts/MetaDataControl"),
        XMLReadManager        = require("scripts/XMLReadManager");

    var AccountPopup          = require("text!htmlContent/add-account-popup.html"),
        ServicePopup          = require("text!htmlContent/add-service-popup.html"),
        WebWidgetPopup        = require("text!htmlContent/web-widget-edit-popup.html");

    function convertProjectPath(path) {
        var newPath = path.split("/");
        newPath.splice(2, 0, PreferencesManager.getViewState("projectId"));

        return newPath.join("/");
    }

    function convertUnixPathToWindowsPath(path) {
        if (brackets.platform === "win") {
            path = path.replace(new RegExp(/\//g), "\\");
        }
        return path;
    }

    function prepareTizenCapabilitySelect(id) {
        let text = "<select id=\"capabilitySelect"+ id +"\" style=\"width: 98%; border: 0; background-color: inherit;\">" +
                   "    <option value=\"http://tizen.org/account/capability/contact\">http://tizen.org/account/capability/contact</option>" +
                   "    <option value=\"http://tizen.org/account/capability/calendar\">http://tizen.org/account/capability/calendar</option>" +
                   "</select>";

        return text;
    }

    function prepareTizenOperationSelect(id) {
        // TODO: is this a complete / valid list for all platforms?
        let text = "<select id=\"operationSelect"+ id +"\" style=\"width: 98%; border: 0; background-color: inherit;\">" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/default\">http://tizen.org/appcontrol/operation/default</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/edit\">http://tizen.org/appcontrol/operation/edit</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/view\">http://tizen.org/appcontrol/operation/view</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/pick\">http://tizen.org/appcontrol/operation/pick</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/create_content\">http://tizen.org/appcontrol/operation/create_content</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/dial\">http://tizen.org/appcontrol/operation/dial</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/send\">http://tizen.org/appcontrol/operation/send</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/search\">http://tizen.org/appcontrol/operation/search</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/empty\">http://tizen.org/appcontrol/operation/nfc/empty</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/wellknown\">http://tizen.org/appcontrol/operation/nfc/wellknown</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/mime\">http://tizen.org/appcontrol/operation/nfc/mime</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/uri\">http://tizen.org/appcontrol/operation/nfc/uri</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/external\">http://tizen.org/appcontrol/operation/nfc/external</option>" +
                   "    <option value=\"http://tizen.org/appcontrol/operation/nfc/transaction\">http://tizen.org/appcontrol/operation/nfc/transaction</option>" +
                   "</select>";

        return text;
    }

    function prepareTizenReloadSelect(id) {
        let text = "<select id=\"reloadSelect" + id + "\" style=\"width: 98%; border: 0; background-color: inherit;\">" +
                   "    <option value=\"none\">none</option>" +
                   "    <option value=\"enable\">enable</option>" +
                   "    <option value=\"disable\">disable</option>" +
                   "</select>";

        return text;
    }

    function fillAccountTable(configPage, accountsStructure) {
        let accountTable = configPage.find(".accountTable")[0];
        let noOfRows = accountTable.rows.length;
        while (noOfRows !== 1) {
            accountTable.deleteRow(1);
            noOfRows--;
        }

        for (let i = 0; i < accountsStructure.length; i++) {
            let multipleAccounts = accountsStructure[i].multipleAccounts;
            let icon = accountsStructure[i].icon;
            let iconSmall = accountsStructure[i].iconSmall;

            // if many names, take first declared (as Tizen Studio does)
            let accountName = XMLReadManager.tryGetField(() => { return accountsStructure[i].names[0].name; }, "");

            let row = accountTable.insertRow(i + 1);
            let selectCell = row.insertCell(0);
            let nameCell = row.insertCell(1);
            let multipleCell = row.insertCell(2);
            let iconCell = row.insertCell(3);
            let smallIconCell = row.insertCell(4);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i + 1) + "\">";
            nameCell.innerHTML = accountName;
            multipleCell.innerHTML = multipleAccounts;
            iconCell.innerHTML = icon;
            smallIconCell.innerHTML = iconSmall;
        }
    }

    function fillWebWidgetTable(configPage, webWidgetStructure) {
        let webWidgetTable = configPage.find(".webWidgetTable")[0];
        let noOfRows = webWidgetTable.rows.length;
        while (noOfRows !== 1) {
            webWidgetTable.deleteRow(1);
            noOfRows--;
        }
        for (let i = 0; i < webWidgetStructure.length; i++) {
            let row = webWidgetTable.insertRow(i + 1);
            let selectCell = row.insertCell(0);
            let idCell = row.insertCell(1);
            let primaryCell = row.insertCell(2);
            let labelCell = row.insertCell(3);
            let contentCell = row.insertCell(4);
            let previewCell = row.insertCell(5);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i + 1) + "\">";
            idCell.innerHTML = webWidgetStructure[i].id;
            primaryCell.innerHTML = webWidgetStructure[i].primary;
            labelCell.innerHTML = webWidgetStructure[i].label;
            contentCell.innerHTML = webWidgetStructure[i].content;
            previewCell.innerHTML = webWidgetStructure[i].preview;
        }
    }

    function fillServicesTable(configPage, servicesStructure) {
        let serviceTable = configPage.find(".serviceTable")[0];
        let noOfRows = serviceTable.rows.length;
        while (noOfRows !== 1) {
            serviceTable.deleteRow(1);
            noOfRows--;
        }
        for (let i = 0; i < servicesStructure.length; i++) {
            // if many names, take first declared (as Tizen Studio does)
            let name = XMLReadManager.tryGetField(() => { return servicesStructure[i].serviceNames[0].name; }, "");
            // if many descriptions, take first declared (as Tizen Studio does)
            let description = XMLReadManager.tryGetField(() => { return servicesStructure[i].serviceDescriptions[0].description; }, "");
            // if many categories, take first declared (as Tizen Studio does)
            let category = XMLReadManager.tryGetField(() => { return servicesStructure[i].categoryNames[0].category; }, "");

            let row = serviceTable.insertRow(i + 1);
            let selectCell = row.insertCell(0);
            let idCell = row.insertCell(1);
            let contentCell = row.insertCell(2);
            let nameCell = row.insertCell(3);
            let descriptionCell = row.insertCell(4);
            let categoryCell = row.insertCell(5);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i + 1) + "\">";
            idCell.innerHTML = servicesStructure[i].id;
            contentCell.innerHTML = servicesStructure[i].content;
            nameCell.innerHTML = name;
            descriptionCell.innerHTML = description;
            categoryCell.innerHTML = category;
        }
    }

    function createAccountDialog(editingElement, message, accountsStructure) {
        let dialogText = AccountPopup;
        let iconError = false;

        let dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            message,
            dialogText,
            [{"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}, {"className": "primary okBtn", "id": "okBtn", "text": "Finish"}, ]
        );

        let $dlg = dialog.getElement();
        let $multipleAccounts = $("#multipleAccounts", $dlg);
        let $iconInput = $("#iconInput", $dlg);
        let $smallIconInput = $("#smallIconInput", $dlg);
        let $iconButton = $("#iconButton", $dlg);
        let $smallIconButton = $("#smallIconButton", $dlg);
        let $addNameButton = $("#addName", $dlg);
        let $editNameButton = $("#editName", $dlg);
        let $removeNameButton = $("#removeName", $dlg);
        let $addCapabilityButton = $("#addCapability", $dlg);
        let $removeCapabilityButton = $("#removeCapability", $dlg);
        let $okButton = $(".okBtn", $dlg)[0];
        let $nameTablePopup =  $(".nameTablePopup", $dlg)[0];
        let $errorIcons = $("#errorIcons", $dlg)[0];

        let allowedExtensions = ["jpg", "gif", "png"];

        $okButton.disabled = true;
        $errorIcons.innerHTML = "Icon path must not be empty!";
        iconError = true;

        let _documentsDir = brackets.app.getUserDocumentsDirectory();
        $iconButton.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $iconInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                        $iconInput.trigger("input");
                    }
                }
            );
        });
        $smallIconButton.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $smallIconInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                        $smallIconInput.trigger("input");
                    }
                }
            );
        });

        function handleIconError(e) {
            if ($iconInput.val() === "") {
                iconError = true;
                $errorIcons.innerHTML = "Icon path must not be empty!";
            } else if ($smallIconInput.val() === "") {
                iconError = true;
                $errorIcons.innerHTML = "Small icon path must not be empty!";
            } else if (!allowedExtensions.includes(FileUtils.getFileExtension($iconInput.val()))) {
                iconError = true;
                $errorIcons.innerHTML = "Icon path must be an image file (jpg, gif or png)!";
            } else if (!allowedExtensions.includes(FileUtils.getFileExtension($smallIconInput.val()))) {
                iconError = true;
                $errorIcons.innerHTML = "Small icon path must be an image file (jpg, gif or png)!";
            } else {
                iconError = false;
                $errorIcons.innerHTML = "";
            }

            if (iconError) {
                $okButton.disabled = true;
            } else {
                $okButton.disabled = false;
            }
        }

        $iconInput.on("input", handleIconError);
        $smallIconInput.on("input", handleIconError);

        LocalizedStringControl.setUpLocalizedAddButton($addNameButton, $nameTablePopup, "Name");
        LocalizedStringControl.setUpLocalizedEditButton($editNameButton, $nameTablePopup, "Name");
        LocalizedStringControl.setUpLocalizedRemoveButton($removeNameButton, $nameTablePopup);

        $addCapabilityButton.click(function(e) {
            let $capabilitiesTablePopup = $(".capabilitiesTablePopup", $dlg)[0];
            let noOfRows = $capabilitiesTablePopup.rows.length;

            let row = $capabilitiesTablePopup.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let capabilityCell = row.insertCell(1);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            capabilityCell.innerHTML = prepareTizenCapabilitySelect(noOfRows);
        });

        $removeCapabilityButton.click(function (e) {
            let capabilitiesTableRows = $(".capabilitiesTablePopup", $dlg)[0].rows;
            let toDelete = [];
            for (let i = 0; i < capabilitiesTableRows.length; i++) {
                if (capabilitiesTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                $(".capabilitiesTablePopup", $dlg)[0].deleteRow(toDelete[i]);
            }
        });

        if (editingElement !== -1) {
            let accountsStructureToEdit = accountsStructure[editingElement - 1];

            $multipleAccounts.val(accountsStructureToEdit.multipleAccounts);
            $iconInput.val(accountsStructureToEdit.icon);
            $smallIconInput.val(accountsStructureToEdit.iconSmall);
            // this will check both inputs, no need to call it twice
            $smallIconInput.trigger("input");

            let $nameTablePopup = $(".nameTablePopup", $dlg)[0];
            for (let i = 0; i < accountsStructureToEdit.names.length; i++) {
                let noOfRows = $nameTablePopup.rows.length;

                let row = $nameTablePopup.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let nameCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                languageCell.innerHTML = accountsStructureToEdit.names[i].language;
                nameCell.innerHTML = accountsStructureToEdit.names[i].name;
            }

            let $capabilitiesTablePopup = $(".capabilitiesTablePopup", $dlg)[0];

            for (let i = 0; i < accountsStructureToEdit.capabilities.length; i++) {
                let noOfRows = $capabilitiesTablePopup.rows.length;
                let row = $capabilitiesTablePopup.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let capabilityCell = row.insertCell(1);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                capabilityCell.innerHTML = prepareTizenCapabilitySelect(noOfRows);

                $("#capabilitySelect"+(noOfRows), $dlg).val(accountsStructureToEdit.capabilities[i].capability);
            }
        }

        return dialog;
    }

    function createWebWidgetDialog(editingElement, webWidgetStructure) {
        let dialogText = WebWidgetPopup;

        let dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            "Edit Web Widget",
            dialogText,
            [{"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}, {"className": "primary okBtn", "id": "okBtn", "text": "Finish"}, ]
        );

        let $dlg = dialog.getElement();
        let $idInput = $("#idInput", $dlg);
        let $primaryWidget = $("#primaryWidget", $dlg);
        let $maxInstance = $("#maxInstance", $dlg);
        let $labelInput = $("#labelInput", $dlg);
        let $contentInput = $("#contentInput", $dlg);
        let $previewInput = $("#previewInput", $dlg);

        let $removeMetaDataButton = $("#removeMetaData", $dlg);
        let $editMetaDataButton = $("#editMetaData", $dlg);
        let $addMetaDataButton = $("#addMetaData", $dlg);
        let $metaDataTable = $("#metaDataTable", $dlg)[0];

        let $contentButton = $("#contentButton", $dlg);
        let $previewButton = $("#previewButton", $dlg);

        $idInput.val(webWidgetStructure[editingElement - 1].id);
        $primaryWidget.val(webWidgetStructure[editingElement - 1].primary);
        $maxInstance.val(webWidgetStructure[editingElement - 1].maxInstance);
        $labelInput.val(webWidgetStructure[editingElement - 1].label);
        $contentInput.val(webWidgetStructure[editingElement - 1].content);
        $previewInput.val(webWidgetStructure[editingElement - 1].preview);

        let _documentsDir = brackets.app.getUserDocumentsDirectory();
        $contentButton.click(function (e) {
            // TODO: FileSystem.showOpenDialog ignores expected extensions ("html" here). Please fix showOpenDialog.
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, ["html"],
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $contentInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                    }
                }
            );
        });
        $previewButton.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, ["png"],
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $previewInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                    }
                }
            );
        });

        for (let i = 0; i < webWidgetStructure[editingElement - 1].metaData.length; i++) {
            let noOfRows = $metaDataTable.rows.length;

            let row = $metaDataTable.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let keyCell = row.insertCell(1);
            let valueCell = row.insertCell(2);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            keyCell.innerHTML = webWidgetStructure[editingElement - 1].metaData[i].key;
            valueCell.innerHTML = webWidgetStructure[editingElement - 1].metaData[i].value;
        }

        MetaDataControl.SetMetaDataRemoveButton($removeMetaDataButton, $metaDataTable);
        MetaDataControl.SetMetaDataEditButton($editMetaDataButton, $metaDataTable);
        MetaDataControl.SetMetaDataAddButton($addMetaDataButton, $metaDataTable);

        return dialog;
    }

    function createServiceDialog(editingElement, message, servicesStructure, usedServices) {
        let dialogText = ServicePopup;
        let fileError = false;

        let dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            message,
            dialogText,
            [{"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}, {"className": "primary okBtn", "id": "okBtn", "text": "Finish"}, ]
        );

        let $dlg = dialog.getElement();
        let $idInput = $("#idInput", $dlg);
        let $onBoot = $("#onBoot", $dlg);
        let $autoRestart = $("#autoRestart", $dlg);
        let $contentInput = $("#contentInput", $dlg);
        let $iconInput = $("#iconInput", $dlg);

        let $contentInputButton = $("#contentButton", $dlg);
        let $iconInputButton = $("#iconButton", $dlg);

        let $addNameButton = $("#addName", $dlg);
        let $editNameButton = $("#editName", $dlg);
        let $removeNameButton = $("#removeName", $dlg);
        let $nameTablePopup = $(".nameTablePopup", $dlg)[0];

        let $addDescriptionButton = $("#addDescription", $dlg);
        let $editDescriptionButton = $("#editDescription", $dlg);
        let $removeDescriptionButton = $("#removeDescription", $dlg);
        let $descriptionTable = $(".descriptionTablePopup", $dlg)[0];

        let $addMetaDataButton = $("#addMetaData", $dlg);
        let $editMetaDataButton = $("#editMetaData", $dlg);
        let $removeMetaDataButton = $("#removeMetaData", $dlg);
        let $metaDataTable = $(".metaDataTablePopup", $dlg)[0];

        let $addCategoryButton = $("#addCategory", $dlg);
        let $removeCategoryButton = $("#removeCategory", $dlg);
        let $categoryTable = $(".categoryTablePopup", $dlg)[0];

        let $okButton = $(".okBtn", $dlg)[0];
        let $error = $("#error", $dlg)[0];

        let _documentsDir = brackets.app.getUserDocumentsDirectory();
        $contentInputButton.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $contentInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                        $contentInput.trigger("input");
                    }
                }
            );
        });
        $iconInputButton.click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        $iconInput.val(convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                        $iconInput.trigger("input");
                    }
                }
            );
        });

        function handleInputError(e) {
            let allowedContentExtensions = ["js"];
            let allowedIconExtensions = ["jpg", "gif", "png"];

            if (usedServices.includes($idInput.val())) {
                fileError = true;
                $error.innerHTML = "Service ID has to be unique!";
            } else if ($idInput.val() === "") {
                fileError = true;
                $error.innerHTML = "Service ID can not be empty!";
            } else if ($iconInput.val() === "") {
                fileError = true;
                $error.innerHTML = "Icon path must not be empty!";
            } else if ($contentInput.val() === "") {
                fileError = true;
                $error.innerHTML = "Content path must not be empty!";
            } else if (!allowedIconExtensions.includes(FileUtils.getFileExtension($iconInput.val()))) {
                fileError = true;
                $error.innerHTML = "Icon path must be an image file (jpg, gif or png)!";
            } else if (!allowedContentExtensions.includes(FileUtils.getFileExtension($contentInput.val()))) {
                fileError = true;
                $error.innerHTML = "Content path must be an JavaScript file (js)!";
            } else {
                fileError = false;
                $error.innerHTML = "";
            }

            if (fileError) {
                $okButton.disabled = true;
            } else {
                $okButton.disabled = false;
            }
        }

        handleInputError(null);

        $idInput.on("input", handleInputError);
        $iconInput.on("input", handleInputError);
        $contentInput.on("input", handleInputError);

        LocalizedStringControl.setUpLocalizedAddButton($addNameButton, $nameTablePopup, "Name");
        LocalizedStringControl.setUpLocalizedEditButton($editNameButton, $nameTablePopup, "Name");
        LocalizedStringControl.setUpLocalizedRemoveButton($removeNameButton, $nameTablePopup);

        LocalizedStringControl.setUpLocalizedAddButton($addDescriptionButton, $descriptionTable, "Description");
        LocalizedStringControl.setUpLocalizedEditButton($editDescriptionButton, $descriptionTable, "Description");
        LocalizedStringControl.setUpLocalizedRemoveButton($removeDescriptionButton, $descriptionTable);

        MetaDataControl.SetMetaDataRemoveButton($removeMetaDataButton, $metaDataTable);
        MetaDataControl.SetMetaDataEditButton($editMetaDataButton, $metaDataTable);
        MetaDataControl.SetMetaDataAddButton($addMetaDataButton, $metaDataTable);

        $removeCategoryButton.click(function (e) {
            let $categoryTablePopup = $(".categoryTablePopup", $dlg)[0];
            let categoryTableRows = $categoryTablePopup.rows;
            let toDelete = [];
            for (let i = 0; i < categoryTableRows.length; i++) {
                if (categoryTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                $(".categoryTablePopup", $dlg)[0].deleteRow(toDelete[i]);
            }
        });

        $addCategoryButton.click(function(e) {
            let $categoryTablePopup = $(".categoryTablePopup", $dlg)[0];
            let noOfRows = $categoryTablePopup.rows.length;

            let row = $categoryTablePopup.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let categoryCell = row.insertCell(1);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            categoryCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" id=\"categoryName" + (noOfRows) + "\"></div>";
        });

        if (editingElement !== -1) {
            let servicesStructureToEdit = servicesStructure[editingElement - 1];

            $idInput.val(servicesStructureToEdit.id);
            $idInput.trigger("input");
            $onBoot.val(servicesStructureToEdit.onBoot);
            $autoRestart.val(servicesStructureToEdit.autoRestart);
            $contentInput.val(servicesStructureToEdit.content);
            $contentInput.trigger("input");
            $iconInput.val(servicesStructureToEdit.icon);
            $iconInput.trigger("input");

            for (let i = 0; i < servicesStructureToEdit.serviceNames.length; i++) {
                let noOfRows = $nameTablePopup.rows.length;

                let row = $nameTablePopup.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let nameCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                languageCell.innerHTML = servicesStructureToEdit.serviceNames[i].language;
                nameCell.innerHTML = servicesStructureToEdit.serviceNames[i].name;
            }

            for (let i = 0; i < servicesStructureToEdit.serviceDescriptions.length; i++) {
                let noOfRows = $descriptionTable.rows.length;

                let row = $descriptionTable.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let nameCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                languageCell.innerHTML = servicesStructureToEdit.serviceDescriptions[i].language;
                nameCell.innerHTML = servicesStructureToEdit.serviceDescriptions[i].description;
            }

            for (let i = 0; i < servicesStructureToEdit.metaDatas.length ; i++) {
                let noOfRows = $metaDataTable.rows.length;
                let row = $metaDataTable.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let keyCell = row.insertCell(1);
                let valueCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                keyCell.innerHTML = servicesStructureToEdit.metaDatas[i].key;
                valueCell.innerHTML = servicesStructureToEdit.metaDatas[i].value;
            }

            for (let i = 0; i < servicesStructureToEdit.categoryNames.length ; i++) {
                let noOfRows = $categoryTable.rows.length;
                let row = $categoryTable.insertRow(noOfRows);
                let selectCell = row.insertCell(0);
                let categoryCell = row.insertCell(1);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                categoryCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" id=\"categoryName" + (noOfRows) +
                    "\" value=\"" + servicesStructureToEdit.categoryNames[i].category + "\"></input>";
            }
        }

        return dialog;
    }

    exports.convertProjectPath = convertProjectPath;
    exports.convertUnixPathToWindowsPath = convertUnixPathToWindowsPath;

    exports.prepareTizenCapabilitySelect = prepareTizenCapabilitySelect;
    exports.prepareTizenOperationSelect = prepareTizenOperationSelect;
    exports.prepareTizenReloadSelect = prepareTizenReloadSelect;

    exports.fillAccountTable = fillAccountTable;
    exports.fillWebWidgetTable = fillWebWidgetTable;
    exports.fillServicesTable = fillServicesTable;

    exports.createAccountDialog = createAccountDialog;
    exports.createWebWidgetDialog = createWebWidgetDialog;
    exports.createServiceDialog = createServiceDialog;
});
