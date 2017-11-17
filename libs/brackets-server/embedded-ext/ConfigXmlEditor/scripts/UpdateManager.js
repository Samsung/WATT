/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define, XMLSerializer, DOMParser */

define(function (require, exports, module) {
    "use strict";

    var html            = require("node/html/html"),
        XMLUtils        = require("scripts/XMLUtils");

    var editor;

    function setEditor(editorElement) {
        editor = editorElement;
    }

    function updateOverviewFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");
        let authorElement, contentElement, descriptionElement, iconElement,
            licenseElement, nameElement, widgetElement;

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        widgetElement = functionOutput.widgetElement;

        if (configPage.find("#identifier").val() !== "") {
            widgetElement.setAttribute("id", configPage.find("#identifier").val());
        } else {
            widgetElement.removeAttribute("id");
        }
        if (configPage.find("#version").val() !== "") {
            widgetElement.setAttribute("version", configPage.find("#version").val());
        } else {
            widgetElement.removeAttribute("version");
        }
        if (configPage.find("#height").val() !== "" && configPage.find("#height").val() !== "0") {
            widgetElement.setAttribute("height", configPage.find("#height").val());
        } else {
            widgetElement.removeAttribute("height");
        }
        if (configPage.find("#width").val() !== "" && configPage.find("#width").val() !== "0") {
            widgetElement.setAttribute("width", configPage.find("#width").val());
        } else {
            widgetElement.removeAttribute("width");
        }
        widgetElement.setAttribute("viewmodes", configPage.find("#viewModes").val());

        authorElement = XMLUtils.GetOrCreateElement(xmlDoc, "author", widgetElement);
        if (configPage.find("#email").val() !== "" || configPage.find("#website").val() !== "" || configPage.find("#author").val() !== "") {
            if (configPage.find("#email").val() !== "") {
                authorElement.setAttribute("email", configPage.find("#email").val());
            } else {
                authorElement.removeAttribute("email");
            }
            if (configPage.find("#website").val() !== "") {
                authorElement.setAttribute("href", configPage.find("#website").val());
            } else {
                authorElement.removeAttribute("href");
            }
            authorElement.innerHTML = configPage.find("#author").val();
        } else {
            widgetElement.removeChild(authorElement);
        }

        contentElement = XMLUtils.GetOrCreateElement(xmlDoc, "content", widgetElement);
        if (configPage.find("#content").val() !== "") {
            contentElement.setAttribute("src", configPage.find("#content").val());
        } else {
            widgetElement.removeChild(contentElement);
        }

        iconElement = XMLUtils.GetOrCreateElement(xmlDoc, "icon", widgetElement);
        if (configPage.find("#icon").val() !== "") {
            iconElement.setAttribute("src", configPage.find("#icon").val());
        } else {
            widgetElement.removeChild(iconElement);
        }

        nameElement = XMLUtils.GetOrCreateElement(xmlDoc, "name", widgetElement);
        if (configPage.find("#name").val() !== "") {
            nameElement.innerHTML = configPage.find("#name").val();
        } else {
            widgetElement.removeChild(nameElement);
        }

        descriptionElement = XMLUtils.GetOrCreateElement(xmlDoc, "description", widgetElement);
        if (configPage.find("#description").val() !== "") {
            descriptionElement.innerHTML = configPage.find("#description").val();
        } else {
            widgetElement.removeChild(descriptionElement);
        }

        licenseElement = XMLUtils.GetOrCreateElement(xmlDoc, "license", widgetElement);
        if (configPage.find("#licenseURL").val() !== "" || configPage.find("#license").val() !== "") {
            if (configPage.find("#licenseURL").val() !== "") {
                licenseElement.setAttribute("href", configPage.find("#licenseURL").val());
            } else {
                licenseElement.removeAttribute("href");
            }
            licenseElement.innerHTML = configPage.find("#license").val();
        } else {
            widgetElement.removeChild(licenseElement);
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updateFeaturesFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");
        let featureElement, widgetElement;

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        widgetElement = functionOutput.widgetElement;

        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://www.w3.org/ns/widgets", "feature");

        let selectedFeatures = configPage.find("#featureSelector")[0].options;
        for (let i = 0; i < selectedFeatures.length; i++) {
            featureElement = xmlDoc.createElement("feature");
            featureElement.setAttribute("name", selectedFeatures[i].value);
            widgetElement.appendChild(featureElement);
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updatePrivilegesFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");
        let privilegeElement, widgetElement;

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        widgetElement = functionOutput.widgetElement;

        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "privilege");

        let selectedPrivileges = configPage.find("#privilegeSelector")[0].options;
        for (let i = 0; i < selectedPrivileges.length; i++) {
            privilegeElement = xmlDoc.createElement("tizen:privilege");
            privilegeElement.setAttribute("name", selectedPrivileges[i].value);
            widgetElement.appendChild(privilegeElement);
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }


    function updateTizenFields(configPage, accountsStructure, webWidgetStructure, servicesStructure) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");
        let applicationElement, contentElement, settingElement, widgetElement;

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        widgetElement = functionOutput.widgetElement;

        // "Managing the Tizen" section
        applicationElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "application", widgetElement);
        if (configPage.find("#aplicationID").val() !== "") {
            applicationElement.setAttribute("id", configPage.find("#aplicationID").val());
        } else {
            applicationElement.removeAttribute("id");
        }
        if (configPage.find("#aplicationID").val() !== "") {
            applicationElement.setAttribute("package", configPage.find("#aplicationID").val().split(".")[0]);
        } else {
            applicationElement.removeAttribute("package");
        }
        if (configPage.find("#requiredVersion").val() !== "") {
            applicationElement.setAttribute("required_version", configPage.find("#requiredVersion").val());
        } else {
            applicationElement.removeAttribute("required_version");
        }
        if (configPage.find("#launchMode").val() !== "none") {
            applicationElement.setAttribute("launch_mode", configPage.find("#launchMode").val());
        } else {
            applicationElement.removeAttribute("launch_mode");
        }

        contentElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "content", widgetElement);
        if (configPage.find("#contentTizen").val() !== "") {
            contentElement.setAttribute("src", configPage.find("#contentTizen").val());
        } else {
            if (contentElement.parentNode.nodeName === "widget") {
                widgetElement.removeChild(contentElement);
            }
        }

        settingElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "setting", widgetElement);
        if (configPage.find("#screenOrientation").val() !== "") {
            settingElement.setAttribute("screen-orientation", configPage.find("#screenOrientation").val());
        } else {
            settingElement.removeAttribute("screen-orientation");
        }
        if (configPage.find("#contextMenu").val() !== "") {
            settingElement.setAttribute("context-menu", configPage.find("#contextMenu").val());
        } else {
            settingElement.removeAttribute("context-menu");
        }
        if (configPage.find("#backgroundSupport").val() !== "") {
            settingElement.setAttribute("background-support", configPage.find("#backgroundSupport").val());
        } else {
            settingElement.removeAttribute("background-support");
        }
        if (configPage.find("#encryption").val() !== "") {
            settingElement.setAttribute("encryption", configPage.find("#encryption").val());
        } else {
            settingElement.removeAttribute("encryption");
        }
        if (configPage.find("#installLocation").val() !== "auto") {
            settingElement.setAttribute("install-location", configPage.find("#installLocation").val());
        } else {
            settingElement.removeAttribute("install-location");
        }
        if (configPage.find("#hwKeyEvent").val() !== "") {
            settingElement.setAttribute("hwkey-event", configPage.find("#hwKeyEvent").val());
        } else {
            settingElement.removeAttribute("hwkey-event");
        }

        if (settingElement.attributes.length !== 0) {
            widgetElement.removeChild(settingElement);
        }

        // "Background Category" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "background-category");
        let selectedBgCategories = configPage.find("#bgCategorySelector")[0].options;
        for (let i = 0; i < selectedBgCategories.length; i++) {
            let bgCategoryElement = xmlDoc.createElement("tizen:background-category");
            bgCategoryElement.setAttribute("value", selectedBgCategories[i].value);
            widgetElement.appendChild(bgCategoryElement);
        }

        // "Application Control" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "app-control");
        let applicationControlTable = configPage.find(".appControlTable")[0];
        for (let i = 1; i < applicationControlTable.rows.length; i++) {
            let appControlElement = xmlDoc.createElement("tizen:app-control");
            let appControlSrcElement = xmlDoc.createElement("tizen:src");
            appControlSrcElement.setAttribute("name", applicationControlTable.rows[i].cells[1].firstChild.value);
            appControlSrcElement.setAttribute("reload", applicationControlTable.rows[i].cells[5].firstChild.value);

            let appControlOperationElement = xmlDoc.createElement("tizen:operation");
            appControlOperationElement.setAttribute("name", applicationControlTable.rows[i].cells[2].firstChild.value);

            let appControlUriElement = xmlDoc.createElement("tizen:uri");
            appControlUriElement.setAttribute("name", applicationControlTable.rows[i].cells[3].firstChild.value);

            let appControlMimeElement = xmlDoc.createElement("tizen:mime");
            appControlMimeElement.setAttribute("name", applicationControlTable.rows[i].cells[4].firstChild.value);

            appControlElement.appendChild(appControlSrcElement);
            appControlElement.appendChild(appControlOperationElement);
            appControlElement.appendChild(appControlUriElement);
            appControlElement.appendChild(appControlMimeElement);

            widgetElement.appendChild(appControlElement);
        }

        //  "Meta Data" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "metadata");
        let metaDataTable = configPage.find(".metaDataTable")[0];
        for (let i = 1; i < metaDataTable.rows.length; i++) {
            let metaDataElement = xmlDoc.createElement("tizen:metadata");
            metaDataElement.setAttribute("key", metaDataTable.rows[i].cells[1].innerHTML);
            metaDataElement.setAttribute("value", metaDataTable.rows[i].cells[2].innerHTML);
            widgetElement.appendChild(metaDataElement);
        }

        // "Account" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "account");
        for (let i = 0; i < accountsStructure.length; i++) {
            let accountElement = xmlDoc.createElement("tizen:account");
            accountElement.setAttribute("multiple-account-support", accountsStructure[i].multipleAccounts);

            let iconElement = xmlDoc.createElement("tizen:icon");
            iconElement.setAttribute("section", "Account");
            iconElement.innerHTML = accountsStructure[i].icon;
            accountElement.appendChild(iconElement);

            let smallIconElement = xmlDoc.createElement("tizen:icon");
            smallIconElement.setAttribute("section", "AccountSmall");
            smallIconElement.innerHTML = accountsStructure[i].iconSmall;
            accountElement.appendChild(smallIconElement);

            for (let j = 0; j < accountsStructure[i].names.length; j++) {
                let displayNameElement = xmlDoc.createElement("tizen:display-name");
                displayNameElement.setAttribute("xml:lang", accountsStructure[i].names[j].language);
                displayNameElement.innerHTML = accountsStructure[i].names[j].name;

                accountElement.appendChild(displayNameElement);
            }

            for (let j = 0; j < accountsStructure[i].capabilities.length; j++) {
                let capabilityElement = xmlDoc.createElement("tizen:capability");
                capabilityElement.innerHTML = accountsStructure[i].capabilities[j].capability;

                accountElement.appendChild(capabilityElement);
            }

            widgetElement.appendChild(accountElement);
        }

        //  "Category" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "category");
        let selectedCategories = configPage.find("#categorySelector")[0].options;
        for (let i = 0; i < selectedCategories.length; i++) {
            let categoryElement = xmlDoc.createElement("tizen:category");
            categoryElement.setAttribute("name", selectedCategories[i].value);
            widgetElement.appendChild(categoryElement);
        }

        // "Service" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "service");
        for (let i = 0; i < servicesStructure.length; i++) {
            let serviceElement = xmlDoc.createElement("tizen:service");
            serviceElement.setAttribute("id", servicesStructure[i].id);
            serviceElement.setAttribute("on-boot", servicesStructure[i].onBoot);
            serviceElement.setAttribute("auto-restart", servicesStructure[i].autoRestart);

            let contentElement = xmlDoc.createElement("tizen:content");
            contentElement.setAttribute("src", servicesStructure[i].content);
            serviceElement.appendChild(contentElement);

            let iconElement = xmlDoc.createElement("tizen:icon");
            iconElement.setAttribute("src", servicesStructure[i].icon);
            serviceElement.appendChild(iconElement);

            for (let j = 0; j < servicesStructure[i].serviceNames.length; j++) {
                let nameElement = xmlDoc.createElement("tizen:name");
                nameElement.setAttribute("xml:lang", servicesStructure[i].serviceNames[j].language);
                nameElement.innerHTML = servicesStructure[i].serviceNames[j].name;

                serviceElement.appendChild(nameElement);
            }

            for (let j = 0; j < servicesStructure[i].serviceDescriptions.length; j++) {
                let descriptionElement = xmlDoc.createElement("tizen:description");
                descriptionElement.setAttribute("xml:lang", servicesStructure[i].serviceDescriptions[j].language);
                descriptionElement.innerHTML = servicesStructure[i].serviceDescriptions[j].description;

                serviceElement.appendChild(descriptionElement);
            }

            for (let j = 0; j < servicesStructure[i].metaDatas.length; j++) {
                let metaDataElement = xmlDoc.createElement("tizen:metadata");
                metaDataElement.setAttribute("key", servicesStructure[i].metaDatas[j].key);
                metaDataElement.setAttribute("value", servicesStructure[i].metaDatas[j].value);

                serviceElement.appendChild(metaDataElement);
            }

            for (let j = 0; j < servicesStructure[i].categoryNames.length; j++) {
                let categoryElement = xmlDoc.createElement("tizen:category");
                categoryElement.setAttribute("name", servicesStructure[i].categoryNames[j].category);

                serviceElement.appendChild(categoryElement);
            }

            widgetElement.appendChild(serviceElement);
        }

        // "Web Widget" section
        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://tizen.org/ns/widgets", "app-widget");
        for (let i = 0; i < webWidgetStructure.length; i++) {
            let webWidgetElement = xmlDoc.createElement("tizen:app-widget");
            webWidgetElement.setAttribute("id", webWidgetStructure[i].id);
            webWidgetElement.setAttribute("primary", webWidgetStructure[i].primary);
            webWidgetElement.setAttribute("max-instance", webWidgetStructure[i].maxInstance);

            let webWidgetLabelElement = xmlDoc.createElement("tizen:widget-label");
            webWidgetLabelElement.innerHTML = webWidgetStructure[i].label;

            let webWidgetContentElement = xmlDoc.createElement("tizen:widget-content");
            webWidgetContentElement.setAttribute("src", webWidgetStructure[i].content);

            let webWidgetSizeElement = xmlDoc.createElement("tizen:widget-size");
            webWidgetSizeElement.setAttribute("preview", webWidgetStructure[i].preview);
            // TODO: is 2x2 a valid data for all apps?
            webWidgetSizeElement.innerHTML = "2x2";
            webWidgetContentElement.appendChild(webWidgetSizeElement);

            for (let j = 0; j < webWidgetStructure[i].metaData.length; j++) {
                let metaDataElement = xmlDoc.createElement("tizen:widget-metadata");
                metaDataElement.setAttribute("key", webWidgetStructure[i].metaData[j].key);
                metaDataElement.setAttribute("value", webWidgetStructure[i].metaData[j].value);

                webWidgetElement.appendChild(metaDataElement);
            }

            webWidgetElement.appendChild(webWidgetLabelElement);
            webWidgetElement.appendChild(webWidgetContentElement);
            widgetElement.appendChild(webWidgetElement);
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updateLocalizationFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        let widgetElement = functionOutput.widgetElement;

        let toDelete = [];

        let names = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "name");
        for (let i = 0; i < names.length; i++) {
            let nameElem = names[i];

            if (nameElem.hasAttribute("xml:lang") && nameElem.parentNode.nodeName === "widget") {
                toDelete.push(nameElem);
            }
        }
        let descriptions = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "description");
        for (let i = 0; i < descriptions.length; i++) {
            let descriptionElem = descriptions[i];

            if (descriptionElem.hasAttribute("xml:lang") && descriptionElem.parentNode.nodeName === "widget") {
                toDelete.push(descriptionElem);
            }
        }
        let licenses = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", "license");
        for (let i = 0; i < licenses.length; i++) {
            let licenseElem = licenses[i];

            if (licenseElem.hasAttribute("xml:lang") && licenseElem.parentNode.nodeName === "widget") {
                toDelete.push(licenseElem);
            }
        }

        for (let i = 0; i < toDelete.length; i++) {
            widgetElement.removeChild(toDelete[i]);
        }

        let licenseTable = configPage.find(".licenseTable")[0];
        let descriptionTable = configPage.find(".descriptionTable")[0];
        let nameTable = configPage.find(".nameTable")[0];

        for (let i = 1; i < nameTable.rows.length; i++) {
            let nameElement = xmlDoc.createElement("name");
            nameElement.setAttribute("xml:lang", nameTable.rows[i].cells[1].innerHTML);
            nameElement.innerHTML = nameTable.rows[i].cells[2].innerHTML;

            widgetElement.appendChild(nameElement);
        }

        for (let i = 1; i < descriptionTable.rows.length; i++) {
            let descriptionElement = xmlDoc.createElement("description");
            descriptionElement.setAttribute("xml:lang", descriptionTable.rows[i].cells[1].innerHTML);
            descriptionElement.innerHTML = descriptionTable.rows[i].cells[2].innerHTML;

            widgetElement.appendChild(descriptionElement);
        }

        for (let i = 1; i < licenseTable.rows.length; i++) {
            let licenseElement = xmlDoc.createElement("license");
            licenseElement.setAttribute("xml:lang", licenseTable.rows[i].cells[1].innerHTML);
            licenseElement.innerHTML = licenseTable.rows[i].cells[2].innerHTML;
            licenseElement.setAttribute("href", licenseTable.rows[i].cells[3].innerHTML);

            widgetElement.appendChild(licenseElement);
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }


    function updatePolicyFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        let widgetElement = functionOutput.widgetElement;

        if (configPage.find("#contentSecurityPolicy").val() !== "") {
            let contentSecurityPolicyElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "content-security-policy", widgetElement);
            contentSecurityPolicyElement.innerHTML = configPage.find("#contentSecurityPolicy").val();
        } else {
            try {
                widgetElement.removeChild(xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content-security-policy")[0]);
            } catch (err) {}
        }

        if (configPage.find("#contentSecurityPolicyReportOnly").val() !== "") {
            let contentSecurityPolicyReportOnlyElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "content-security-policy-report-only", widgetElement);
            contentSecurityPolicyReportOnlyElement.innerHTML = configPage.find("#contentSecurityPolicyReportOnly").val();
        } else {
            try {
                widgetElement.removeChild(xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "content-security-policy-report-only")[0]);
            } catch (err) {}
        }

        if (configPage.find("#allowNavigation").val() !== "") {
            let allowNavigationElement = XMLUtils.GetOrCreateTizenElement(xmlDoc, "allow-navigation", widgetElement);
            allowNavigationElement.innerHTML = configPage.find("#allowNavigation").val();
        } else {
            try {
                widgetElement.removeChild(xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "allow-navigation")[0]);
            } catch (err) {}
        }

        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://www.w3.org/ns/widgets", "access");
        let accessTable = configPage.find(".accessTable")[0];
        for (let i = 1; i < accessTable.rows.length; i++) {
            let networkURL = accessTable.rows[i].cells[1].firstChild.value;

            if (networkURL !== "") {
                let accessElement = xmlDoc.createElement("access");

                accessElement.setAttribute("origin", networkURL);
                accessElement.setAttribute("subdomains", accessTable.rows[i].cells[2].firstChild.value);
                widgetElement.appendChild(accessElement);
            }
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updatePreferencesFields(configPage) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        let widgetElement = functionOutput.widgetElement;

        XMLUtils.RemoveAllChildren(xmlDoc, widgetElement, "http://www.w3.org/ns/widgets", "preference");
        let preferencesTable = configPage.find(".preferencesTable")[0];
        for (let i = 1; i < preferencesTable.rows.length; i++) {
            let name = preferencesTable.rows[i].cells[1].firstChild.value;
            let value = preferencesTable.rows[i].cells[2].firstChild.value;

            if (name !== "" || value !== "") {
                let metaDataElement = xmlDoc.createElement("preference");

                metaDataElement.setAttribute("name", preferencesTable.rows[i].cells[1].firstChild.value);
                metaDataElement.setAttribute("value", preferencesTable.rows[i].cells[2].firstChild.value);
                metaDataElement.setAttribute("readonly", preferencesTable.rows[i].cells[3].firstChild.value);
                widgetElement.appendChild(metaDataElement);
            }
        }

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updateTizenProfile(profileType) {
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");
        let profileElement, widgetElement;

        if (XMLUtils.CheckForXMLParseErrors(editor) !== "") {
            return;
        }

        let functionOutput = XMLUtils.TryGetWidgetElement(xmlDoc);
        xmlDoc = functionOutput.xmlDoc;
        widgetElement = functionOutput.widgetElement;

        if (xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "profile").length === 0) {
            profileElement = xmlDoc.createElement("tizen:profile");
            widgetElement.appendChild(profileElement);
        } else {
            profileElement = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", "profile")[0];
        }

        profileElement.setAttribute("name", profileType);

        let serializer = new XMLSerializer();
        let text = serializer.serializeToString(xmlDoc);

        editor.setValue(html.prettyPrint(text));
    }

    function updateFields(configPage, profileType, accountsStructure, webWidgetStructure, servicesStructure) {
        // add tab update functions here
        updateOverviewFields(configPage);
        updateFeaturesFields(configPage);
        updatePrivilegesFields(configPage);
        updateLocalizationFields(configPage);
        updatePolicyFields(configPage);
        updatePreferencesFields(configPage);
        updateTizenFields(configPage, accountsStructure, webWidgetStructure, servicesStructure);
        updateTizenProfile(profileType);
    }

    exports.setEditor = setEditor;
    exports.updateFields = updateFields;
});
