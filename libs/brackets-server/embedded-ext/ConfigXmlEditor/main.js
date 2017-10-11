/*global define, $, Mustache, URL */
/*eslint no-new: 0 */

define(function (require, exports, module) {
    "use strict";

    var DefaultDialogs          = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                 = brackets.getModule("widgets/Dialogs"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        FileSystem              = brackets.getModule("filesystem/FileSystem"),
        FileUtils               = brackets.getModule("file/FileUtils"),
        MainViewFactory         = brackets.getModule("view/MainViewFactory"),
        PrefrenceManger         = brackets.getModule("preferences/PreferencesManager"),
        ProjectManager          = brackets.getModule("project/ProjectManager"),
        Strings                 = brackets.getModule("strings"),
        _                       = brackets.getModule("thirdparty/lodash");

    var _viewers = {},
        editor, // editor for Source tab
        profileType = ""; // mobile, wearable

    var ConfigXmlViewTemplate   = require("text!htmlContent/edit-config-xml.html"),
        LocalizedStringControl  = require("scripts/LocalizedStringControl"),
        MetaDataControl         = require("scripts/MetaDataControl");

    var GeneralUtils            = require("scripts/GeneralUtils"),
        TabUtils                = require("scripts/TabUtils"),
        XMLUtils                = require("scripts/XMLUtils");

    var FeatureList             = require("scripts/FeatureList"),
        PrivilegeList           = require("scripts/PrivilegeList");

    var CategoriesManager       = require("scripts/CategoriesManager"),
        UpdateManager           = require("scripts/UpdateManager"),
        XMLReadManager          = require("scripts/XMLReadManager");

    var accountsStructure = [],
        webWidgetStructure = [],
        servicesStructure = [];

    // Note: Setting callbacks can not be placed in separate module because they need direct access to
    //       above data structures... When placed in another module, only single copy is accessible there
    //       and all modifications in callbacks are not remembered.
    function setOverviewCallbacks(configPage) {
        let _documentsDir = brackets.app.getUserDocumentsDirectory();
        configPage.find("#contentSelect").click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        configPage.find("#content").val(GeneralUtils.convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                    }
                });
        });
        configPage.find("#iconSelect").click(function (e) {
            FileSystem.showOpenDialog(false, false, Strings.OPEN_FILE, _documentsDir, null,
                function (error, files) {
                    if (!error && files && files.length > 0 && files[0].length > 0) {
                        configPage.find("#icon").val(GeneralUtils.convertUnixPathToWindowsPath(files[0].substr(("/projects/").length)));
                        configPage.find("#iconImage").attr("src", GeneralUtils.convertProjectPath(files[0]));
                    }
                });
        });
    }

    function setFeaturesCallbacks(configPage) {
        configPage.find("#removeFeature").click(function (e) {
            let selectedFeatures = configPage.find("#featureSelector").val();

            if (!selectedFeatures) {
                return;
            }

            for (let i = 0; i < selectedFeatures.length; i++) {
                FeatureList.RemoveFeature(selectedFeatures[i]);
            }
            configPage.find("#featureSelector").html(FeatureList.GetFeatureListText());
        });

        let dialogText = '<input class="filterSearch" placeholder="Search"/><br/></br>' +
                         '<div id="features" style="overflow: auto; height: 280px;">';
        dialogText += FeatureList.GetFeatureSelectText("");
        dialogText += "</div>";

        configPage.find("#addFeature").click(function (e) {
            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Add Feature",
                dialogText
            );

            let $dlg = dialog.getElement();
            let $filterSearch = $(".filterSearch", $dlg);
            let $featuresDiv = $("#features", $dlg);

            $featuresDiv.html(FeatureList.GetFeatureSelectText(""));

            $filterSearch.on("input", function(e) {
                $featuresDiv.html(FeatureList.GetFeatureSelectText($filterSearch.val()));
            });

            dialog.done(function (buttonId) {
                let $filterSearch = $(".featureCheck", $dlg);
                for(let i = 0; i < $filterSearch.length; i++) {
                    if ($filterSearch[i].checked) {
                        FeatureList.AddFeature($filterSearch[i].value);
                    }
                }
                configPage.find("#featureSelector").html(FeatureList.GetFeatureListText());
            });
        });
    }

    function setPrivilegesCallbacks(configPage) {
        configPage.find("#removePrivilege").click(function (e) {
            let selectedPrivileges = configPage.find("#privilegeSelector").val();

            if (!selectedPrivileges) {
                return;
            }

            for (let i = 0; i < selectedPrivileges.length; i++) {
                PrivilegeList.RemovePrivilege(selectedPrivileges[i]);
            }
            configPage.find("#privilegeSelector").html(PrivilegeList.GetPrivilegeListText());
        });

        let dialogText = '<input class="filterSearch" placeholder="Search"/><br/></br>' +
                         '<div id="privileges" style="overflow: auto; height: 210px;">';
        dialogText += PrivilegeList.GetPrivilegeSelectText("");
        dialogText += '</div>Description:<br/><textarea id="description" rows="2" style="width: 98%; resize: none;" readonly></textarea><hr/>' +
                      '<input class="customPrivilege" placeholder="Input custom privilege here"/><br>' +
                      '<div id="customError" style="width: 100%; font-weight: bold; font-size: 10px; color: red;"></div>';

        configPage.find("#addPrivilege").click(function (e) {
            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Add Privilege",
                dialogText,
                [{"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}, {"className": "primary okBtn", "id": "okBtn", "text": "Finish"}, ]
            );

            let $dlg = dialog.getElement();
            $(".modal-body", $dlg).css("overflow-y", "hidden");

            let $filterSearch = $(".filterSearch", $dlg);
            let $customPrivilege = $(".customPrivilege", $dlg);
            let $privilegesDiv = $("#privileges", $dlg);
            let $okButton = $(".okBtn", $dlg)[0];
            let $customError = $("#customError", $dlg)[0];

            $dlg.on("change", ".privilegeCheck", function(e) {
                $("#description", $dlg).val(PrivilegeList.GetPrivilegeDescriptionText(e.currentTarget.value));
            });

            $customPrivilege.on("input", function(e) {
                if ($customPrivilege.val() !== "") {
                    let correctUri = true;

                    try {
                        new URL($customPrivilege.val());
                    } catch (err) {
                        correctUri = false;
                    }

                    if (!correctUri) {
                        $okButton.disabled = true;
                        $customError.innerHTML = "Invalid privilege URI";
                    } else {
                        $okButton.disabled = false;
                        $customError.innerHTML = "";
                    }
                } else {
                    $okButton.disabled = false;
                    $customError.innerHTML = "";
                }
            });

            $privilegesDiv.html(PrivilegeList.GetPrivilegeSelectText(""));

            $filterSearch.on("input", function(e) {
                $privilegesDiv.html(PrivilegeList.GetPrivilegeSelectText($filterSearch.val()));
            });

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let $filterSearch = $(".privilegeCheck", $dlg);
                    for(let i = 0; i < $filterSearch.length; i++) {
                        if ($filterSearch[i].checked) {
                            PrivilegeList.AddPrivilege($filterSearch[i].value);
                        }
                    }

                    if ($customPrivilege.val() !== "") {
                        PrivilegeList.AddPrivilege($customPrivilege.val());
                    }
                    configPage.find("#privilegeSelector").html(PrivilegeList.GetPrivilegeListText());
                }
            });
        });
    }

    function setTizenCallbacks(configPage) {
        // ID generation
        configPage.find("#generateID").click(function (e) {
            let possibleSigns = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let newID = "";

            for (let i = 0; i < 10; i++) {
                newID += possibleSigns.charAt(Math.floor(Math.random() * possibleSigns.length));
            }

            let currentID = configPage.find("#aplicationID").val();
            let idSplit = currentID.split(".");
            idSplit[0] = newID;

            configPage.find("#aplicationID").val(idSplit.join("."));
        });

        // "Background Category" section
        configPage.find("#removeBgCategory").click(function (e) {
            let selectedBgCategories = configPage.find("#bgCategorySelector").val();

            if (!selectedBgCategories) {
                return;
            }

            for (let i = 0; i < selectedBgCategories.length; i++) {
                CategoriesManager.RemoveBgCategory(selectedBgCategories[i]);
            }
            configPage.find("#bgCategorySelector").html(CategoriesManager.GetBgCategoryListText());
        });

        configPage.find("#addBgCategory").click(function (e) {
            let dialogText = '<input class="filterSearch" placeholder="Search"/><br/></br>' +
                             '<div id="bgCategories" style="overflow: auto; height: 280px;">';
            dialogText += CategoriesManager.GetBgCategorySelectText("");
            dialogText += "</div>";

            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Add Background Category",
                dialogText
            );

            let $dlg = dialog.getElement();
            let $filterSearch = $(".filterSearch", $dlg);
            let $bgCategoriesDiv = $("#bgCategories", $dlg);

            $bgCategoriesDiv.html(CategoriesManager.GetBgCategorySelectText(""));

            $filterSearch.on("input", function(e) {
                $bgCategoriesDiv.html(CategoriesManager.GetBgCategorySelectText($filterSearch.val()));
            });

            dialog.done(function (buttonId) {
                let $filterSearch = $(".bgCategoryCheck", $dlg);
                for(let i = 0; i < $filterSearch.length; i++) {
                    if ($filterSearch[i].checked) {
                        CategoriesManager.AddBgCategory($filterSearch[i].value);
                    }
                }
                configPage.find("#bgCategorySelector").html(CategoriesManager.GetBgCategoryListText());
            });
        });

        // "Application Control" section
        configPage.find("#removeAppControl").click(function (e) {
            let appControlTableRows = configPage.find(".appControlTable")[0].rows;
            let toDelete = [];
            for (let i = 0; i < appControlTableRows.length; i++) {
                if (appControlTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                configPage.find(".appControlTable")[0].deleteRow(toDelete[i]);
            }
        });

        configPage.find("#addAppControl").click(function (e) {
            let appControlTable = configPage.find(".appControlTable")[0];
            let noOfRows = appControlTable.rows.length;

            let row = appControlTable.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let sourceCell = row.insertCell(1);
            let operationCell = row.insertCell(2);
            let uriCell = row.insertCell(3);
            let mimeCell = row.insertCell(4);
            let reloadCell = row.insertCell(5);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            sourceCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            operationCell.innerHTML = GeneralUtils.prepareTizenOperationSelect(noOfRows);
            configPage.find("#operationSelect"+noOfRows).val("");
            uriCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            mimeCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            reloadCell.innerHTML = GeneralUtils.prepareTizenReloadSelect(noOfRows);
            configPage.find("#reloadSelect"+noOfRows).val("none");
        });

        configPage.find("#editAppControl").click(function (e) {
            let appControlTableRows = configPage.find(".appControlTable")[0].rows;
            for (let i = 0; i < appControlTableRows.length; i++) {
                if (appControlTableRows[i].cells[0].firstChild.checked) {
                    appControlTableRows[i].cells[1].firstChild.focus();
                    appControlTableRows[i].cells[1].firstChild.select();
                    return;
                }
            }
        });

        // "Meta Data" section
        MetaDataControl.SetMetaDataRemoveButton(configPage.find("#removeMetaData"), configPage.find(".metaDataTable")[0]);
        MetaDataControl.SetMetaDataAddButton(configPage.find("#addMetaData"), configPage.find(".metaDataTable")[0]);
        MetaDataControl.SetMetaDataEditButton(configPage.find("#editMetaData"), configPage.find(".metaDataTable")[0]);

        // "Account" section
        configPage.find("#removeAccount").click(function (e) {
            let accountTableRows = configPage.find(".accountTable")[0].rows;
            let toDelete = [];
            for (let i = 0; i < accountTableRows.length; i++) {
                if (accountTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                accountsStructure.splice(toDelete[i] - 1, 1);
            }

            GeneralUtils.fillAccountTable(configPage, accountsStructure);
        });

        configPage.find("#addAccount").click(function (e) {
            if (accountsStructure.length >= 1) {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_INFO,
                    "Error!",
                    "Only one account can be specified!"
                );
                return;
            }

            let toEdit = -1;
            let dialog = GeneralUtils.createAccountDialog(toEdit, "Add Account", accountsStructure);

            let $dlg = dialog.getElement();
            let $multipleAccounts = $("#multipleAccounts", $dlg);
            let $iconInput = $("#iconInput", $dlg);
            let $smallIconInput = $("#smallIconInput", $dlg);

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let accountNames = [];
                    let nameTablePopupRows = $(".nameTablePopup", $dlg)[0].rows;
                    for (let i = 1; i < nameTablePopupRows.length; i++) {
                        accountNames.push({
                            "language": nameTablePopupRows[i].cells[1].innerHTML,
                            "name": nameTablePopupRows[i].cells[2].innerHTML
                        });
                    }

                    let capabilityNames = [];
                    let capabilitiesTablePopupRows = $(".capabilitiesTablePopup", $dlg)[0].rows;
                    for (let i = 1; i < capabilitiesTablePopupRows.length; i++) {
                        capabilityNames.push({
                            "capability": capabilitiesTablePopupRows[i].cells[1].firstChild.value
                        });
                    }
                    accountsStructure.push({"multipleAccounts": $multipleAccounts.val(), "icon": $iconInput.val(),
                        "iconSmall": $smallIconInput.val(), "names": accountNames, "capabilities": capabilityNames});
                    GeneralUtils.fillAccountTable(configPage, accountsStructure);
                }
            });
        });

        configPage.find("#editAccount").click(function (e) {
            let accountTableRows = configPage.find(".accountTable")[0].rows;
            let toEdit = -1;

            for (let i = 0; i < accountTableRows.length; i++) {
                if (accountTableRows[i].cells[0].firstChild.checked) {
                    toEdit = i;
                    break;
                }
            }

            if (toEdit !== -1) {
                let dialog = GeneralUtils.createAccountDialog(toEdit, "Edit account", accountsStructure);

                let $dlg = dialog.getElement();
                let $multipleAccounts = $("#multipleAccounts", $dlg);
                let $iconInput = $("#iconInput", $dlg);
                let $smallIconInput = $("#smallIconInput", $dlg);

                dialog.done(function (buttonId) {
                    if (buttonId === "okBtn") {
                        let accountNames = [];
                        let nameTablePopupRows = $(".nameTablePopup", $dlg)[0].rows;
                        for (let i = 1; i < nameTablePopupRows.length; i++) {
                            accountNames.push({
                                "language": nameTablePopupRows[i].cells[1].innerHTML,
                                "name": nameTablePopupRows[i].cells[2].innerHTML
                            });
                        }

                        let capabilityNames = [];
                        let capabilitiesTablePopupRows = $(".capabilitiesTablePopup", $dlg)[0].rows;
                        for (let i = 1; i < capabilitiesTablePopupRows.length; i++) {
                            capabilityNames.push({
                                "capability": capabilitiesTablePopupRows[i].cells[1].firstChild.value
                            });
                        }

                        accountsStructure[toEdit - 1] = {"multipleAccounts": $multipleAccounts.val(), "icon": $iconInput.val(),
                            "iconSmall": $smallIconInput.val(), "names": accountNames, "capabilities": capabilityNames};
                        GeneralUtils.fillAccountTable(configPage, accountsStructure);
                    }
                });
            }
        });

        // "Category" section
        configPage.find("#removeCategory").click(function (e) {
            let selectedCategories = configPage.find("#categorySelector").val();

            if (!selectedCategories) {
                return;
            }

            for (let i = 0; i < selectedCategories.length; i++) {
                CategoriesManager.RemoveCategory(selectedCategories[i]);
            }
            configPage.find("#categorySelector").html(CategoriesManager.GetCategoryListText(false));
        });

        configPage.find("#addCategory").click(function (e) {
            let dialogText = '<table class="generalTable"><tr><td style="width: 15%;">Category</td><td>' +
                             '<form><input class="filterSearch" list="category"/><datalist id="category">' +
                             CategoriesManager.GetCategoryListText(true) + "</datalist></form></td></tr></table>" +
                             '<br/><div id="error" style="font-weight: bold;"></div>';

            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Add Category",
                dialogText,
                [{"className": "primary okBtn", "id": "okBtn", "text": "OK"}, {"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}]
            );

            let $dlg = dialog.getElement();
            let $filterSearch = $(".filterSearch", $dlg);
            let $okButton = $(".okBtn", $dlg)[0];
            let $error = $("#error", $dlg)[0];

            $okButton.disabled = true;
            $error.innerHTML = "Category must not be empty!";

            $filterSearch.on("input", function(e) {
                if ($filterSearch.val() === "") {
                    $okButton.disabled = true;
                    $error.innerHTML = "Key must not be empty!";
                } else {
                    $okButton.disabled = false;
                    $error.innerHTML = "";
                }
            });

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    CategoriesManager.AddCategory($filterSearch.val());
                    configPage.find("#categorySelector").html(CategoriesManager.GetCategoryListText(false));
                }
            });
        });

        // "Service" section
        configPage.find("#removeService").click(function (e) {
            let serviceTableRows = configPage.find(".serviceTable")[0].rows;
            let toDelete = [];
            for (let i = 0; i < serviceTableRows.length; i++) {
                if (serviceTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                servicesStructure.splice(toDelete[i] - 1, 1);
            }

            GeneralUtils.fillServicesTable(configPage, servicesStructure);
        });

        configPage.find("#addService").click(function (e) {
            let servicesTableRows = configPage.find(".serviceTable")[0].rows;
            let usedServices = [];
            for (let i = 0; i < servicesTableRows.length; i++) {
                usedServices.push(servicesTableRows[i].cells[1].innerHTML);
            }

            let toEdit = -1;
            let dialog = GeneralUtils.createServiceDialog(toEdit, "Add Service", null, usedServices);

            let $dlg = dialog.getElement();
            let $idInput = $("#idInput", $dlg);
            let $onBoot = $("#onBoot", $dlg);
            let $autoRestart = $("#autoRestart", $dlg);
            let $contentInput = $("#contentInput", $dlg);
            let $iconInput = $("#iconInput", $dlg);
            let $nameTablePopup = $(".nameTablePopup", $dlg);
            let $descriptionTable = $(".descriptionTablePopup", $dlg);
            let $metaDataTable = $(".metaDataTablePopup", $dlg);
            let $categoryTable = $(".categoryTablePopup", $dlg);

            $idInput.val(configPage.find("#aplicationID").val());
            $idInput.trigger("input");

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let serviceNames = [];
                    let nameElements = $nameTablePopup[0].rows;
                    for(let j = 1; j < nameElements.length; j++) {
                        serviceNames.push({
                            "language": nameElements[j].cells[1].firstChild.value,
                            "name": nameElements[j].cells[2].firstChild.innerHTML
                        });
                    }

                    let serviceDescriptions = [];
                    let descriptionElements = $descriptionTable[0].rows;
                    for(let j = 1; j < descriptionElements.length; j++) {
                        serviceDescriptions.push({
                            "language": descriptionElements[j].cells[1].firstChild.value,
                            "description": descriptionElements[j].cells[2].firstChild.innerHTML
                        });
                    }

                    let metaDatas = [];
                    let metaDataElements = $metaDataTable[0].rows;
                    for (let j = 1; j < metaDataElements.length; j++) {
                        let key = metaDataElements[j].cells[1].innerHTML;
                        let value = metaDataElements[j].cells[2].innerHTML;

                        metaDatas.push({"key": key, "value": value});
                    }

                    let categoryNames = [];
                    let categoryElements = $categoryTable[0].rows;
                    for(let j = 1; j < categoryElements.length; j++) {
                        categoryNames.push({
                            "category": categoryElements[j].cells[1].firstChild.value
                        });
                    }

                    servicesStructure.push({"id": $idInput.val(), "onBoot": $onBoot.val(), "autoRestart": $autoRestart.val(), "content": $contentInput.val(), "icon": $iconInput.val(),
                        "serviceNames": serviceNames, "serviceDescriptions": serviceDescriptions, "metaDatas": metaDatas, "categoryNames": categoryNames});
                    GeneralUtils.fillServicesTable(configPage, servicesStructure);
                }
            });
        });

        configPage.find("#editService").click(function (e) {
            let servicesTableRows = configPage.find(".serviceTable")[0].rows;
            let toEdit = -1;
            let usedServices = [];

            for (let i = 0; i < servicesTableRows.length; i++) {
                if (servicesTableRows[i].cells[0].firstChild.checked) {
                    toEdit = i;
                    break;
                }
            }
            for (let i = 0; i < servicesTableRows.length; i++) {
                if (toEdit !== i) {
                    usedServices.push(servicesTableRows[i].cells[1].innerHTML);
                }
            }

            if (toEdit !== -1) {
                let dialog = GeneralUtils.createServiceDialog(toEdit, "Edit Service", servicesStructure, usedServices);

                let $dlg = dialog.getElement();
                let $idInput = $("#idInput", $dlg);
                let $onBoot = $("#onBoot", $dlg);
                let $autoRestart = $("#autoRestart", $dlg);
                let $contentInput = $("#contentInput", $dlg);
                let $iconInput = $("#iconInput", $dlg);
                let $nameTablePopup = $(".nameTablePopup", $dlg);
                let $descriptionTable = $(".descriptionTablePopup", $dlg);
                let $metaDataTable = $(".metaDataTablePopup", $dlg);
                let $categoryTable = $(".categoryTablePopup", $dlg);

                dialog.done(function (buttonId) {
                    if (buttonId === "okBtn") {
                        let serviceNames = [];
                        let nameElements = $nameTablePopup[0].rows;
                        for(let j = 1; j < nameElements.length; j++) {
                            serviceNames.push({
                                "language": nameElements[j].cells[1].innerHTML,
                                "name": nameElements[j].cells[2].innerHTML
                            });
                        }

                        let serviceDescriptions = [];
                        let descriptionElements = $descriptionTable[0].rows;
                        for(let j = 1; j < descriptionElements.length; j++) {
                            serviceDescriptions.push({
                                "language": descriptionElements[j].cells[1].innerHTML,
                                "description": descriptionElements[j].cells[2].innerHTML
                            });
                        }

                        let metaDatas = [];
                        let metaDataElements = $metaDataTable[0].rows;
                        for (let j = 1; j < metaDataElements.length; j++) {
                            let key = metaDataElements[j].cells[1].innerHTML;
                            let value = metaDataElements[j].cells[2].innerHTML;

                            metaDatas.push({"key": key, "value": value});
                        }

                        let categoryNames = [];
                        let categoryElements = $categoryTable[0].rows;
                        for(let j = 1; j < categoryElements.length; j++) {
                            categoryNames.push({
                                "category": categoryElements[j].cells[1].firstChild.value
                            });
                        }

                        servicesStructure[toEdit - 1] = {"id": $idInput.val(), "onBoot": $onBoot.val(), "autoRestart": $autoRestart.val(), "content": $contentInput.val(), "icon": $iconInput.val(),
                            "serviceNames": serviceNames, "serviceDescriptions": serviceDescriptions, "metaDatas": metaDatas, "categoryNames": categoryNames};
                        GeneralUtils.fillServicesTable(configPage, servicesStructure);
                    }
                });
            }
        });


        // "Web Widget" section
        configPage.find("#editWebWidget").click(function (e) {
            let webWidgetTable = configPage.find(".webWidgetTable")[0].rows;
            let toEdit = -1;

            for (let i = 0; i < webWidgetTable.length; i++) {
                if (webWidgetTable[i].cells[0].firstChild.checked) {
                    toEdit = i;
                    break;
                }
            }

            if (toEdit !== -1) {
                let dialog = GeneralUtils.createWebWidgetDialog(toEdit, webWidgetStructure);

                let $dlg = dialog.getElement();
                let $idInput = $("#idInput", $dlg);
                let $primaryWidget = $("#primaryWidget", $dlg);
                let $maxInstance = $("#maxInstance", $dlg);
                let $labelInput = $("#labelInput", $dlg);
                let $contentInput = $("#contentInput", $dlg);
                let $previewInput = $("#previewInput", $dlg);

                let $metaDataTable = $("#metaDataTable", $dlg)[0];

                dialog.done(function (buttonId) {
                    if (buttonId === "okBtn") {
                        let id = $idInput.val();
                        let primary = $primaryWidget.val();
                        let maxInstance = $maxInstance.val();
                        let label = $labelInput.val();
                        let content = $contentInput.val();
                        let preview = $previewInput.val();

                        let metaDatas = $metaDataTable.rows;
                        let metaDataPairs = [];
                        for (let i = 1; i < metaDatas.length; i++) {
                            let key = metaDatas[i].cells[1].firstChild.textContent;
                            let value = metaDatas[i].cells[2].firstChild.textContent;

                            metaDataPairs.push({"key": key, "value": value});
                        }
                        webWidgetStructure[toEdit - 1] = {"id": id, "primary": primary, "maxInstance": maxInstance, "label": label, "content": content, "preview": preview, "metaData": metaDataPairs};
                        GeneralUtils.fillWebWidgetTable(configPage, webWidgetStructure);
                    }
                });
            }
        });
    }

    function setLocalizationCallbacks(configPage) {
        let nameAddButton = configPage.find("#addName");
        let nameEditButton = configPage.find("#editName");
        let nameRemoveButton = configPage.find("#removeName");

        let nameTable = configPage.find(".nameTable")[0];

        LocalizedStringControl.setUpLocalizedAddButton(nameAddButton, nameTable, "Name");
        LocalizedStringControl.setUpLocalizedEditButton(nameEditButton, nameTable, "Name");
        LocalizedStringControl.setUpLocalizedRemoveButton(nameRemoveButton, nameTable);

        let descriptionAddButton = configPage.find("#addDescription");
        let descriptionEditButton = configPage.find("#editDescription");
        let descriptionRemoveButton = configPage.find("#removeDescription");

        let descriptionTable = configPage.find(".descriptionTable")[0];

        LocalizedStringControl.setUpLocalizedAddButton(descriptionAddButton, descriptionTable, "Description");
        LocalizedStringControl.setUpLocalizedEditButton(descriptionEditButton, descriptionTable, "Description");
        LocalizedStringControl.setUpLocalizedRemoveButton(descriptionRemoveButton, descriptionTable);

        let licenseAddButton = configPage.find("#addLicense");
        let licenseEditButton = configPage.find("#editLicense");
        let licenseRemoveButton = configPage.find("#removeLicense");

        let licenseTable = configPage.find(".licenseTable")[0];

        LocalizedStringControl.setUpLocalizedAddButton(licenseAddButton, licenseTable, "License", true);
        LocalizedStringControl.setUpLocalizedEditButton(licenseEditButton, licenseTable, "License", true);
        LocalizedStringControl.setUpLocalizedRemoveButton(licenseRemoveButton, licenseTable);
    }

    function setPolicyCallbacks(configPage) {
        configPage.find("#removeAccess").click(function (e) {
            let accessTableRows = configPage.find(".accessTable")[0].rows;
            let toDelete = [];
            for (let i = 0; i < accessTableRows.length; i++) {
                if (accessTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                configPage.find(".accessTable")[0].deleteRow(toDelete[i]);
            }
        });

        configPage.find("#addAccess").click(function (e) {
            let accessTable = configPage.find(".accessTable")[0];
            let noOfRows = accessTable.rows.length;

            let row = accessTable.insertRow();
            let selectCell = row.insertCell(0);
            let originCell = row.insertCell(1);
            let subdomainsCell = row.insertCell(2);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            originCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            subdomainsCell.innerHTML = "<select id=\"subdomains"+ (noOfRows) +"\" style=\"width: 98%; border: 0; background-color: inherit;\">"+
                "<option value=\"false\">false</option>" +
                "<option value=\"true\">true</option>" +
                "</select>";
        });

        configPage.find("#editAccess").click(function (e) {
            let accessTableRows = configPage.find(".accessTable")[0].rows;
            for (let i = 0; i < accessTableRows.length; i++) {
                if (accessTableRows[i].cells[0].firstChild.checked) {
                    accessTableRows[i].cells[1].firstChild.focus();
                    accessTableRows[i].cells[1].firstChild.select();
                    return;
                }
            }
        });
    }

    function setPreferencesCallbacks(configPage) {
        configPage.find("#removePreference").click(function (e) {
            let preferencesTableRows = configPage.find(".preferencesTable")[0].rows;
            let toDelete = [];
            for (let i = 0; i < preferencesTableRows.length; i++) {
                if (preferencesTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                configPage.find(".preferencesTable")[0].deleteRow(toDelete[i]);
            }
        });

        configPage.find("#addPreference").click(function (e) {
            let preferencesTable = configPage.find(".preferencesTable")[0];
            let noOfRows = preferencesTable.rows.length;

            let row = preferencesTable.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let nameCell = row.insertCell(1);
            let valueCell = row.insertCell(2);
            let readOnlyCell = row.insertCell(3);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            nameCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            valueCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            readOnlyCell.innerHTML = "<select id=\"readOnlyPreference\" style=\"width: 98%; border: 0; background-color: inherit;\">"+
                "<option value=\"false\">false</option>" +
                "<option value=\"true\">true</option>" +
                "</select>";
        });

        configPage.find("#editPreference").click(function (e) {
            let preferencesTableRows = configPage.find(".preferencesTable")[0].rows;
            for (let i = 0; i < preferencesTableRows.length; i++) {
                if (preferencesTableRows[i].cells[0].firstChild.checked) {
                    preferencesTableRows[i].cells[1].firstChild.focus();
                    preferencesTableRows[i].cells[1].firstChild.select();
                    return;
                }
            }
        });
    }

    function propagateChanges(configPage) {
        let activeTab = configPage.find(".active");
        if (activeTab.length > 0) {
            if (activeTab[0].id === "tabSource") {
                // when leaving Source tab, propagate changes to other tabs

                // we have to clear already added elements - user might have deleted
                // some of them manually and we have to react correctly for that
                FeatureList.ClearAddedFeatures();
                PrivilegeList.ClearAddedPrivileges();
                CategoriesManager.ClearAddedBgCategories();
                CategoriesManager.ClearAddedCategories();
                accountsStructure = [];
                webWidgetStructure = [];
                servicesStructure = [];

                XMLReadManager.readOverviewFields(configPage);
                XMLReadManager.readFeaturesFields(configPage, FeatureList);
                XMLReadManager.readPrivilegesFields(configPage, PrivilegeList);
                XMLReadManager.readLocalizationFields(configPage);
                XMLReadManager.readPreferencesFields(configPage);
                XMLReadManager.readPolicyFields(configPage);
                XMLReadManager.readTizenFields(configPage, CategoriesManager, accountsStructure, webWidgetStructure, servicesStructure);

                profileType = XMLReadManager.readTizenProfile();
            } else {
                // when leaving any tab other then Source, modify Source to
                // match any possible changes
                UpdateManager.updateFields(configPage, profileType, accountsStructure, webWidgetStructure, servicesStructure);
            }
        }
    }

    /**
     * ConfigXmlView objects are constructed when an config.xml file is opened
     * @see {@link Pane} for more information about where ConfigXmlView are rendered
     *
     * @constructor
     * @param {!File} file - The config file object to render
     * @param {!jQuery} container - The container to render the config view in
     */
    function ConfigXmlView(file, $container) {
        this.file = file;
        this.$el = $(Mustache.render(ConfigXmlViewTemplate));
        var configPage = this.$el;
        var saveButton = this.$el.find("#saveChanges");

        $container.append(this.$el);

        this._naturalWidth = 0;
        this._naturalHeight = 0;
        this._scale = 100;           // 100%
        this._scaleDivInfo = null;   // coordinates of hidden scale sticker

        this.relPath = ProjectManager.makeProjectRelativeIfPossible(this.file.fullPath);

        var projectProfile = PrefrenceManger.getViewState("projectProfile");
        var projectVersion = PrefrenceManger.getViewState("projectVersion");

        if (projectProfile) {
            CategoriesManager.SetPlatformType(projectProfile);
            FeatureList.SetPlatformType(projectProfile);
            PrivilegeList.SetPlatformType(projectProfile);
        }
        if (projectVersion) {
            CategoriesManager.SetPlatformVersion(projectVersion);
            FeatureList.SetPlatformVersion(projectVersion);
            PrivilegeList.SetPlatformVersion(projectVersion);
        }

        // add config file to working set
        brackets.test.MainViewManager.addToWorkingSet("first-pane", file);

        // read fields for all tabs (add tabs below)
        FileUtils.readAsText(file).done(function (text, readTimestamp) {
            // this has to be first!
            editor = XMLReadManager.readSourceFileds(text, configPage);
            UpdateManager.setEditor(editor);
            XMLReadManager.setEditor(editor);

            // further tabs get data from Sources tab
            XMLReadManager.readOverviewFields(configPage);
            XMLReadManager.readFeaturesFields(configPage, FeatureList);
            XMLReadManager.readPrivilegesFields(configPage, PrivilegeList);
            XMLReadManager.readLocalizationFields(configPage);
            XMLReadManager.readPolicyFields(configPage);
            XMLReadManager.readPreferencesFields(configPage);
            XMLReadManager.readTizenFields(configPage, CategoriesManager, accountsStructure, webWidgetStructure, servicesStructure);

            profileType = XMLReadManager.readTizenProfile();
        });

        // set tab-specific callbacks (add tabs below)
        setOverviewCallbacks(configPage);
        setFeaturesCallbacks(configPage);
        setPrivilegesCallbacks(configPage);
        setLocalizationCallbacks(configPage);
        setPolicyCallbacks(configPage);
        setPreferencesCallbacks(configPage);
        setTizenCallbacks(configPage);

        // add support for tabs
        configPage.find(".tablinks").click(function (e) {
            let backupText = editor ? editor.getValue() : "";

            propagateChanges(configPage);

            if (editor) {
                let parseError = XMLUtils.CheckForXMLParseErrors(editor);

                if (parseError !== "") {
                    editor.setValue(backupText);
                    Dialogs.showModalDialog(
                        DefaultDialogs.DIALOG_ID_INFO,
                        "Malformed XML detected!",
                        "XML processing failed due to parsing error! Please fix your code before switching to other cards!</br></br>" + parseError
                    );
                    return;
                }
            }

            TabUtils.OpenTab(e, configPage, e.currentTarget.id.substr("tab".length));
            if (e.currentTarget.id === "tabSource") {
                editor.refresh();
            }
        });

        // add support for Save button
        saveButton.click(function (e) {
            let backupText = editor.getValue();

            propagateChanges(configPage);
            UpdateManager.updateFields(configPage, profileType, accountsStructure, webWidgetStructure, servicesStructure);

            let parseError = XMLUtils.CheckForXMLParseErrors(editor);

            if (parseError !== "") {
                editor.setValue(backupText);
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_INFO,
                    "Save failed!",
                    "XML processing failed due to parsing error! Please fix your code before saving the file!</br></br>" + parseError
                );
                return;
            }

            FileUtils.writeText(file, editor.getValue());

            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Success!",
                "Config file saved succesfully!"
            );
        });

        // open default tab
        configPage.find("#tabOverview").click();

        _viewers[file.fullPath] = this;

        DocumentManager.on("fileNameChange.ConfigXmlView", _.bind(this._onFilenameChange, this));
    }

    /**
     * DocumentManger.fileNameChange handler - when an config is renamed, we must
     * update the view
     *
     * @param {jQuery.Event} e - event
     * @param {!string} oldPath - the name of the file that's changing changing
     * @param {!string} newPath - the name of the file that's changing changing
     * @private
     */
    ConfigXmlView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        /*
         * File objects are already updated when the event is triggered
         * so we just need to see if the file has the same path as our config
         */
        if (this.file.fullPath === newPath) {
            this.relPath = ProjectManager.makeProjectRelativeIfPossible(newPath);
            this.$configPath.text(this.relPath).attr("title", this.relPath);
        }
    };

    /**
     * View Interface functions
     */

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    ConfigXmlView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    ConfigXmlView.prototype.updateLayout = function () {

        var $container = this.$el.parent();

        var pos = $container.position(),
            iWidth = $container.innerWidth(),
            iHeight = $container.innerHeight(),
            oWidth = $container.outerWidth(),
            oHeight = $container.outerHeight();

        // $view is "position:absolute" so
        //  we have to update the height, width and position
        this.$el.css({
            top: pos.top + ((oHeight - iHeight) / 2),
            left: pos.left + ((oWidth - iWidth) / 2),
            width: iWidth,
            height: iHeight});
    };

    /*
     * Destroys the view
     */
    ConfigXmlView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off(".ConfigXmlView");
        this.$el.remove();
    };

    /*
     * Refreshes the view with what's on disk
     */
    ConfigXmlView.prototype.refresh = function () {
        // Not implemented yet
    };

    /*
     * Creates an view object and adds it to the specified pane
     * @param {!File} file - the file to create the editor for
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function _createConfigXmlView(file, pane) {
        var view = pane.getViewForPath(file.fullPath);

        if (view) {
            pane.showView(view);
        } else {
            view = new ConfigXmlView(file, pane.$content);
            pane.addView(view, true);
        }
        return new $.Deferred().resolve().promise();
    }

    /**
     * Handles file system change events so we can refresh
     *  config viewers for the files that changed on disk due to external editors
     * @param {jQuery.event} event - event object
     * @param {?File} file - file object that changed
     * @param {Array.<FileSystemEntry>=} added If entry is a Directory, contains zero or more added children
     * @param {Array.<FileSystemEntry>=} removed If entry is a Directory, contains zero or more removed children
     */
    function _handleFileSystemChange(event, entry, added, removed) {
        // this may have been called because files were added
        //  or removed to the file system.  We don't care about those
        if (!entry || entry.isDirectory) {
            return;
        }

        // Look for a viewer for the changed file
        var viewer = _viewers[entry.fullPath];

        // viewer found, call its refresh method
        if (viewer) {
            viewer.refresh();
        }
    }

    /*
     * Install an event listener to receive all file system change events
     * so we can refresh the view when changes are made to the config in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    /*
     * Initialization, register our view factory
     */
    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            var name = FileUtils.getBaseName(fullPath);
            return (name.toLowerCase() === "config.xml");
        },
        openFile: function (file, pane) {
            return _createConfigXmlView(file, pane);
        }
    });

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");
});
