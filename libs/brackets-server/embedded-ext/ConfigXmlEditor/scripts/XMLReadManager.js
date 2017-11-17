/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define, DOMParser */

define(function (require, exports, module) {
    "use strict";

    var CodeMirror            = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror");

    var GeneralUtils          = require("scripts/GeneralUtils"),
        XMLUtils              = require("scripts/XMLUtils");

    var editor;

    function setEditor(editorElement) {
        editor = editorElement;
    }

    // local helper function
    function tryGetField(field, defaultValue) {
        try {
            return field();
        } catch(err) {
            return defaultValue;
        }
    }

    function readOverviewFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let author, content, description, email, height, icon, id,
            license, licenseURL, name, version, viewModes, website, width;

        // get fields from XML file (use default value if specific field is not set)
        id = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "widget")[0].attributes["id"].nodeValue; }, "");
        name = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "name")[0].childNodes[0].nodeValue; }, "");
        version = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "widget")[0].attributes["version"].nodeValue; }, "");
        content = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "content")[0].attributes["src"].nodeValue; }, "");
        icon = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "icon")[0].attributes["src"].nodeValue; }, "");
        author = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "author")[0].childNodes[0].nodeValue; }, "");
        email = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "author")[0].attributes["email"].nodeValue; }, "");
        website = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "author")[0].attributes["href"].nodeValue; }, "");
        width = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "widget")[0].attributes["width"].nodeValue; }, 0);
        height = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "widget")[0].attributes["height"].nodeValue; }, 0);
        viewModes = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "widget")[0].attributes["viewmodes"].nodeValue; }, "maximized");

        name = "";
        let names = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "name");
        for (let i = 0; i < names.length; i++) {
            let nameElem = names[i];

            if (!nameElem.hasAttribute("xml:lang")) {
                name = tryGetField(() => { return nameElem.childNodes[0].nodeValue; }, "");
            }
        }

        license = "";
        licenseURL = "";
        let licenses = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "license");
        for (let i = 0; i < licenses.length; i++) {
            let licenseElem = licenses[i];

            if (!licenseElem.hasAttribute("xml:lang")) {
                license = tryGetField(() => { return licenseElem.childNodes[0].nodeValue; }, "");
                licenseURL = tryGetField(() => { return licenseElem.attributes["href"].nodeValue; }, "");
            }
        }

        description = "";
        let descriptions = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "description");
        for (let i = 0; i < descriptions.length; i++) {
            let descriptionsElem = descriptions[i];

            if (!descriptionsElem.hasAttribute("xml:lang")) {
                description = tryGetField(() => { return descriptionsElem.childNodes[0].nodeValue; }, "");
            }
        }

        // fill fields in the Overview page
        configPage.find("#identifier").val(id);
        configPage.find("#name").val(name);
        configPage.find("#version").val(version);
        configPage.find("#content").val(content);
        configPage.find("#icon").val(icon);
        configPage.find("#iconImage").attr("src", GeneralUtils.convertProjectPath("/projects/" + icon));
        configPage.find("#author").val(author);
        configPage.find("#email").val(email);
        configPage.find("#website").val(website);
        configPage.find("#license").val(license);
        configPage.find("#licenseURL").val(licenseURL);
        configPage.find("#description").val(description);
        configPage.find("#width").val(width);
        configPage.find("#height").val(height);
        configPage.find("#viewModes").val(viewModes);
    }

    function readFeaturesFields(configPage, FeatureList) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let features = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "feature");
        for (let i = 0; i < features.length; i++) {
            let feature;
            try {
                feature = features[i].attributes["name"].nodeValue;
            } catch (err) {
                feature = "";
            }

            FeatureList.AddFeature(feature);
        }

        configPage.find("#featureSelector").html(FeatureList.GetFeatureListText());
    }

    function readPrivilegesFields(configPage, PrivilegeList) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let privileges = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "privilege");
        for (let i = 0; i < privileges.length; i++) {
            let privilege;
            try {
                privilege = privileges[i].attributes["name"].nodeValue;
            } catch (err) {
                privilege = "";
            }

            PrivilegeList.AddPrivilege(privilege);
        }

        configPage.find("#privilegeSelector").html(PrivilegeList.GetPrivilegeListText());
    }

    function readTizenFields(configPage, CategoriesManager, accountsStructure, webWidgetStructure, servicesStructure) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        //  "Application" section
        let applicationID = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "application")[0].attributes["id"].nodeValue; }, "");
        let requiredVersion = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "application")[0].attributes["required_version"].nodeValue; }, "3.0");
        let launchMode = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "application")[0].attributes["launch_mode"].nodeValue; }, "none");
        configPage.find("#aplicationID").val(applicationID);
        configPage.find("#requiredVersion").val(requiredVersion);
        configPage.find("#launchMode").val(launchMode);

        //  "Content" section
        let contents = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content");
        for (let i = 0; i < contents.length; i++) {
            if (contents[i].parentNode.nodeName === "widget") {
                configPage.find("#contentTizen").val(tryGetField(() => { return contents[i].attributes["src"].nodeValue; }, ""));
                break;
            }
        }

        //  "Setting" section
        let screenOrientation = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["screen-orientation"].nodeValue; }, "portrait");
        let contextMenu = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["context-menu"].nodeValue; }, "enable");
        let backgroundSupport = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["background-support"].nodeValue; }, "disable");
        let encryption = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["encryption"].nodeValue; }, "disable");
        let installLocation = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["install-location"].nodeValue; }, "auto");
        let hwKeyEvent = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "setting")[0].attributes["hwkey-event"].nodeValue; }, "enable");
        configPage.find("#screenOrientation").val(screenOrientation);
        configPage.find("#contextMenu").val(contextMenu);
        configPage.find("#backgroundSupport").val(backgroundSupport);
        configPage.find("#encryption").val(encryption);
        configPage.find("#installLocation").val(installLocation);
        configPage.find("#hwKeyEvent").val(hwKeyEvent);

        //  "Background Category" section
        let backgroundCategories = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "background-category");
        for (let i = 0; i < backgroundCategories.length; i++) {
            let backgroundCategory;
            try {
                backgroundCategory = backgroundCategories[i].attributes["value"].nodeValue;
            } catch (err) {
                backgroundCategory = "";
            }
            CategoriesManager.AddBgCategory(backgroundCategory);
        }
        configPage.find("#bgCategorySelector").html(CategoriesManager.GetBgCategoryListText());

        //  "Application Control" section
        let appControlTable = configPage.find(".appControlTable")[0];
        let noOfRows = appControlTable.rows.length;
        while (noOfRows !== 1) {
            appControlTable.deleteRow(1);
            noOfRows--;
        }
        let appControls = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "app-control");
        for (let i = 0; i < appControls.length; i++) {
            let appControl = appControls[i];

            let controlSource = tryGetField(() => { return appControl.getElementsByTagNameNS("http://tizen.org/ns/widgets", "src")[0].attributes["name"].nodeValue; }, "");
            let controlOperation = tryGetField(() => { return appControl.getElementsByTagNameNS("http://tizen.org/ns/widgets", "operation")[0].attributes["name"].nodeValue; }, "");
            let controlURI = tryGetField(() => { return appControl.getElementsByTagNameNS("http://tizen.org/ns/widgets", "uri")[0].attributes["name"].nodeValue; }, "");
            let controlMIME = tryGetField(() => { return appControl.getElementsByTagNameNS("http://tizen.org/ns/widgets", "mime")[0].attributes["name"].nodeValue; }, "");
            let controlReload = tryGetField(() => { return appControl.getElementsByTagNameNS("http://tizen.org/ns/widgets", "src")[0].attributes["reload"].nodeValue; }, "none");

            let row = appControlTable.insertRow();
            let selectCell = row.insertCell(0);
            let sourceCell = row.insertCell(1);
            let operationCell = row.insertCell(2);
            let uriCell = row.insertCell(3);
            let mimeCell = row.insertCell(4);
            let reloadCell = row.insertCell(5);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i + 1) + "\">";
            sourceCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + controlSource + "\"></input>";
            operationCell.innerHTML = GeneralUtils.prepareTizenOperationSelect(i);
            configPage.find("#operationSelect"+i).val(controlOperation);
            uriCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + controlURI + "\"></input>";
            mimeCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + controlMIME + "\"></input>";
            reloadCell.innerHTML = GeneralUtils.prepareTizenReloadSelect(i);
            configPage.find("#reloadSelect"+i).val(controlReload);
        }

        //  "Meta Data" section
        let mataDataTable = configPage.find(".metaDataTable")[0];
        noOfRows = mataDataTable.rows.length;
        while (noOfRows !== 1) {
            mataDataTable.deleteRow(1);
            noOfRows--;
        }
        let mataDatas = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "metadata");
        for (let i = 0; i < mataDatas.length; i++) {
            let mataData = mataDatas[i];
            if (mataData.parentNode.nodeName === "widget") {
                let key = tryGetField(() => { return mataData.attributes["key"].nodeValue; }, "");
                let value = tryGetField(() => { return mataData.attributes["value"].nodeValue; }, "");

                let row = mataDataTable.insertRow();
                let selectCell = row.insertCell(0);
                let keyCell = row.insertCell(1);
                let valueCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i + 1) + "\">";
                keyCell.innerHTML = key;
                valueCell.innerHTML = value;
            }
        }

        //  "Account" section
        let accounts = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "account");
        for (let i = 0; i < accounts.length; i++) {
            let account = accounts[i];

            let multipleAccounts = tryGetField(() => { return account.attributes["multiple-account-support"].nodeValue; }, "false");

            let icons = account.getElementsByTagNameNS("http://tizen.org/ns/widgets", "icon");
            let icon, iconSmall;
            for( let j = 0; j < icons.length; j++) {
                if (icons[j].attributes["section"] && icons[j].attributes["section"].nodeValue === "Account") {
                    icon = icons[j].childNodes[0].nodeValue;
                }
                if (icons[j].attributes["section"] && icons[j].attributes["section"].nodeValue === "AccountSmall") {
                    iconSmall = icons[j].childNodes[0].nodeValue;
                }
            }

            let accountNames = [];
            let nameElements = account.getElementsByTagNameNS("http://tizen.org/ns/widgets", "display-name");
            for(let j = 0; j < nameElements.length; j++) {
                accountNames.push({
                    "language": tryGetField(() => { return nameElements[j].attributes["xml:lang"].nodeValue; }, ""),
                    "name": tryGetField(() => { return nameElements[j].childNodes[0].nodeValue; }, "")
                });
            }

            let capabilityNames = [];
            let capabilityElements = account.getElementsByTagNameNS("http://tizen.org/ns/widgets", "capability");
            for(let j = 0; j < capabilityElements.length; j++) {
                capabilityNames.push({
                    "capability": tryGetField(() => { return capabilityElements[j].childNodes[0].nodeValue; }, "")
                });
            }

            accountsStructure.push({"multipleAccounts": multipleAccounts, "icon": icon, "iconSmall": iconSmall, "names": accountNames, "capabilities": capabilityNames});
        }
        GeneralUtils.fillAccountTable(configPage, accountsStructure);

        //  "Category" section
        let categories = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "category");
        for (let i = 0; i < categories.length; i++) {
            if (categories[i].parentNode.nodeName === "widget") {
                let category;
                try {
                    category = categories[i].attributes["name"].nodeValue;
                } catch (err) {
                    category = "";
                }
                CategoriesManager.AddCategory(category);
            }
        }
        configPage.find("#categorySelector").html(CategoriesManager.GetCategoryListText(false));

        //  "Service" section
        let services = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "service");
        for (let i = 0; i < services.length; i++) {
            let service = services[i];

            let id = tryGetField(() => { return service.attributes["id"].nodeValue; }, "");
            let onBoot = tryGetField(() => { return service.attributes["on-boot"].nodeValue; }, "false");
            let autoRestart = tryGetField(() => { return service.attributes["auto-restart"].nodeValue; }, "false");
            let content = tryGetField(() => { return service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content")[0].attributes["src"].nodeValue; }, "");
            let icon = tryGetField(() => { return service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "icon")[0].attributes["src"].nodeValue; }, "");

            let serviceNames = [];
            let nameElements = service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "name");
            for(let j = 0; j < nameElements.length; j++) {
                serviceNames.push({
                    "language": tryGetField(() => { return nameElements[j].attributes["xml:lang"].nodeValue; }, ""),
                    "name": tryGetField(() => { return nameElements[j].childNodes[0].nodeValue; }, "")
                });
            }

            let serviceDescriptions = [];
            let descriptionElements = service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "description");
            for(let j = 0; j < descriptionElements.length; j++) {
                serviceDescriptions.push({
                    "language": tryGetField(() => { return descriptionElements[j].attributes["xml:lang"].nodeValue; }, ""),
                    "description": tryGetField(() => { return descriptionElements[j].childNodes[0].nodeValue; }, "")
                });
            }

            let metaDatas = [];
            let metaDataElements = service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "metadata");
            for (let j = 0; j < metaDataElements.length; j++) {
                let key = tryGetField(() => { return metaDataElements[j].attributes["key"].nodeValue; }, "");
                let value = tryGetField(() => { return metaDataElements[j].attributes["value"].nodeValue; }, "");

                metaDatas.push({"key": key, "value": value});
            }

            let categoryNames = [];
            let categoryElements = service.getElementsByTagNameNS("http://tizen.org/ns/widgets", "category");
            for(let j = 0; j < categoryElements.length; j++) {
                categoryNames.push({
                    "category": tryGetField(() => { return categoryElements[j].attributes["name"].nodeValue; }, "")
                });
            }

            servicesStructure.push({"id": id, "onBoot": onBoot, "autoRestart": autoRestart, "content": content, "icon": icon,
                "serviceNames": serviceNames, "serviceDescriptions": serviceDescriptions, "metaDatas": metaDatas, "categoryNames": categoryNames});
        }
        GeneralUtils.fillServicesTable(configPage, servicesStructure);

        //  "Web Widget" section
        let webWidgets = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "app-widget");
        for (let i = 0; i < webWidgets.length; i++) {
            let webWidget = webWidgets[i];

            let id = tryGetField(() => { return webWidget.attributes["id"].nodeValue; }, "");
            let primary = tryGetField(() => { return webWidget.attributes["primary"].nodeValue; }, "false");
            let maxInstance = tryGetField(() => { return webWidget.attributes["max-instance"].nodeValue; }, 0);
            let label = tryGetField(() => { return webWidget.getElementsByTagNameNS("http://tizen.org/ns/widgets", "widget-label")[0].childNodes[0].nodeValue; }, "");
            let widgetContentElement = webWidget.getElementsByTagNameNS("http://tizen.org/ns/widgets", "widget-content");
            let content = tryGetField(() => { return widgetContentElement[0].attributes["src"].nodeValue; }, "");
            let preview = tryGetField(() => { return widgetContentElement[0].getElementsByTagNameNS("http://tizen.org/ns/widgets", "widget-size")[0].attributes["preview"].nodeValue; }, "");

            let metaDatas = webWidget.getElementsByTagNameNS("http://tizen.org/ns/widgets", "widget-metadata");
            let metaDataPairs = [];
            for (let j = 0; j < metaDatas.length; j++) {
                let key = tryGetField(() => { return metaDatas[j].attributes["key"].nodeValue; }, "");
                let value = tryGetField(() => { return metaDatas[j].attributes["value"].nodeValue; }, "");

                metaDataPairs.push({"key": key, "value": value});
            }
            webWidgetStructure.push({"id": id, "primary": primary, "maxInstance": maxInstance, "label": label, "content": content, "preview": preview, "metaData": metaDataPairs});
        }
        GeneralUtils.fillWebWidgetTable(configPage, webWidgetStructure);
    }

    function readLocalizationFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let nameTable = configPage.find(".nameTable")[0];
        let noOfRows = nameTable.rows.length;
        while (noOfRows !== 1) {
            nameTable.deleteRow(1);
            noOfRows--;
        }
        let names = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "name");
        for (let i = 0; i < names.length; i++) {
            let nameElem = names[i];

            if (nameElem.hasAttribute("xml:lang")) {
                let row = nameTable.insertRow();
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let nameCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
                languageCell.innerHTML = tryGetField(() => { return nameElem.attributes["xml:lang"].nodeValue; }, "");
                nameCell.innerHTML = tryGetField(() => { return nameElem.childNodes[0].nodeValue; }, "");
            }
        }

        let descriptionTable = configPage.find(".descriptionTable")[0];
        noOfRows = descriptionTable.rows.length;
        while (noOfRows !== 1) {
            descriptionTable.deleteRow(1);
            noOfRows--;
        }
        let descriptions = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "description");
        for (let i = 0; i < descriptions.length; i++) {
            let descriptionElem = descriptions[i];

            if (descriptionElem.hasAttribute("xml:lang")) {
                let row = descriptionTable.insertRow();
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let nameCell = row.insertCell(2);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
                languageCell.innerHTML = tryGetField(() => { return descriptionElem.attributes["xml:lang"].nodeValue; }, "");
                nameCell.innerHTML = tryGetField(() => { return descriptionElem.childNodes[0].nodeValue; }, "");
            }
        }

        let licenseTable = configPage.find(".licenseTable")[0];
        noOfRows = licenseTable.rows.length;
        while (noOfRows !== 1) {
            licenseTable.deleteRow(1);
            noOfRows--;
        }
        let licenses = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "license");
        for (let i = 0; i < licenses.length; i++) {
            let licenseElem = licenses[i];

            if (licenseElem.hasAttribute("xml:lang")) {
                let row = licenseTable.insertRow();
                let selectCell = row.insertCell(0);
                let languageCell = row.insertCell(1);
                let licenseCell = row.insertCell(2);
                let licenseUrlCell = row.insertCell(3);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
                languageCell.innerHTML = tryGetField(() => { return licenseElem.attributes["xml:lang"].nodeValue; }, "");
                licenseCell.innerHTML = tryGetField(() => { return licenseElem.childNodes[0].nodeValue; }, "");
                licenseUrlCell.innerHTML = tryGetField(() => { return licenseElem.attributes["href"].nodeValue; }, "");
            }
        }
    }

    function readPolicyFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let contentSecurityPolicy = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content-security-policy")[0].childNodes[0].nodeValue; }, "");
        let contentSecurityPolicyReportOnly = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content-security-policy-report-only")[0].childNodes[0].nodeValue; }, "");
        let allowNavigation = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "allow-navigation")[0].childNodes[0].nodeValue; }, "");
        configPage.find("#contentSecurityPolicy").val(contentSecurityPolicy);
        configPage.find("#contentSecurityPolicyReportOnly").val(contentSecurityPolicyReportOnly);
        configPage.find("#allowNavigation").val(allowNavigation);

        let accessTable = configPage.find(".accessTable")[0];
        let noOfRows = accessTable.rows.length;
        while (noOfRows !== 1) {
            accessTable.deleteRow(1);
            noOfRows--;
        }
        let accesses = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "access");
        for (let i = 0; i < accesses.length; i++) {
            let access = accesses[i];

            let origin = tryGetField(() => { return access.attributes["origin"].nodeValue; }, "");
            let subdomains = tryGetField(() => { return access.attributes["subdomains"].nodeValue; }, "false");

            let row = accessTable.insertRow();
            let selectCell = row.insertCell(0);
            let originCell = row.insertCell(1);
            let subdomainsCell = row.insertCell(2);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
            originCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + origin + "\"></input>";
            subdomainsCell.innerHTML = "<select id=\"subdomains"+ (i) +"\" style=\"width: 98%; border: 0; background-color: inherit;\">"+
                "<option value=\"false\">false</option>" +
                "<option value=\"true\">true</option>" +
                "</select>";
            configPage.find("#subdomains"+i).val(subdomains);
        }
    }

    function readPreferencesFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        let preferencesTable = configPage.find(".preferencesTable")[0];
        let noOfRows = preferencesTable.rows.length;
        while (noOfRows !== 1) {
            preferencesTable.deleteRow(1);
            noOfRows--;
        }
        let preferences = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "preference");
        for (let i = 0; i < preferences.length; i++) {
            let preference = preferences[i];
            let name = tryGetField(() => { return preference.attributes["name"].nodeValue; }, "");
            let value = tryGetField(() => { return preference.attributes["value"].nodeValue; }, "");
            let readonly = tryGetField(() => { return preference.attributes["readonly"].nodeValue; }, "");

            let row = preferencesTable.insertRow();
            let selectCell = row.insertCell(0);
            let nameCell = row.insertCell(1);
            let valueCell = row.insertCell(2);
            let readOnlyCell = row.insertCell(3);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
            nameCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + name + "\"></input>";
            valueCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\" value=\"" + value + "\"></input>";
            readOnlyCell.innerHTML = "<select id=\"readOnlyPreference"+ (i) +"\" style=\"width: 98%; border: 0; background-color: inherit;\">"+
                "<option value=\"false\">false</option>" +
                "<option value=\"true\">true</option>" +
                "</select>";
            configPage.find("#readOnlyPreference"+i).val(readonly);
        }
    }

    function readTizenProfile() {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        // if tizen:profile is defined then use defined value. If not, then use "mobile"
        let profileType = tryGetField(() => { return xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "profile")[0].attributes["name"].nodeValue; }, "mobile");

        return profileType;
    }

    function readSourceFileds(text, configPage) {
        configPage.find("#source").val(text);

        let editor = CodeMirror.fromTextArea(configPage.find("#source")[0], {
            value: text,
            lineNumbers: true,
            mode: "xml"
        });

        return editor;
    }

    exports.setEditor = setEditor;

    exports.tryGetField = tryGetField;

    exports.readOverviewFields = readOverviewFields;
    exports.readFeaturesFields = readFeaturesFields;
    exports.readPrivilegesFields = readPrivilegesFields;
    exports.readLocalizationFields = readLocalizationFields;
    exports.readPreferencesFields = readPreferencesFields;
    exports.readPolicyFields = readPolicyFields;
    exports.readTizenFields = readTizenFields;
    exports.readTizenProfile = readTizenProfile;
    exports.readSourceFileds = readSourceFileds;
});
