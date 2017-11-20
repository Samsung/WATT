/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define, DOMParser */

define(function (require, exports, module) {
    "use strict";

    function CheckForXMLParseErrors(editor) {
        // let's check if there are any XML errors
        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(editor.getValue(),"text/xml");

        if (xmlDoc.getElementsByTagName("parsererror").length !== 0) {
            return xmlDoc.getElementsByTagName("parsererror")[0].getElementsByTagName("div")[0].outerHTML;
        } else {
            return "";
        }
    }

    function TryGetWidgetElement(xmlDoc) {
        let toReturn = {
            "xmlDoc" : xmlDoc,
            "widgetElement" : xmlDoc.getElementsByTagName("widget")[0]
        };

        if (xmlDoc.getElementsByTagName("widget").length === 0) {
            let parser = new DOMParser();
            toReturn.xmlDoc = parser.parseFromString('<?xml version="1.0" encoding="UTF-8"?><widget></widget>', "text/xml");
            toReturn.widgetElement = toReturn.xmlDoc.getElementsByTagName("widget")[0];
            toReturn.widgetElement.setAttribute("xmlns", "http://www.w3.org/ns/widgets");
            toReturn.widgetElement.setAttribute("xmlns:tizen", "http://tizen.org/ns/widgets");
        }

        return toReturn;
    }

    function GetOrCreateElement(xmlDoc, name, widgetElement) {
        let toReturnElement = {};
        let elements = xmlDoc.getElementsByTagNameNS("http://www.w3.org/ns/widgets", name);
        let elementsToReturn = [];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].parentNode.nodeName === "widget" && !elements[i].getAttribute("xml:lang")) {
                elementsToReturn.push(elements[i]);
            }
        }

        if (elementsToReturn.length === 0) {
            toReturnElement = xmlDoc.createElementNS("http://www.w3.org/ns/widgets", name);
            widgetElement.appendChild(toReturnElement);
        } else {
            toReturnElement = elementsToReturn[0];
        }

        return toReturnElement;
    }

    function GetOrCreateTizenElement(xmlDoc, name, widgetElement) {
        let toReturnElement = {};
        let elements = xmlDoc.getElementsByTagNameNS("http://tizen.org/ns/widgets", name);
        let elementsToReturn = [];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].parentNode.nodeName === "widget") {
                elementsToReturn.push(elements[i]);
            }
        }

        if (elementsToReturn.length === 0) {
            toReturnElement = xmlDoc.createElementNS("http://tizen.org/ns/widgets", "tizen:"+name);
            widgetElement.appendChild(toReturnElement);
        } else {
            toReturnElement = elementsToReturn[0];
        }

        return toReturnElement;
    }

    function RemoveAllChildren(xmlDoc, widgetElement, namespace, name) {
        let allElements = xmlDoc.getElementsByTagNameNS(namespace, name);
        let elementsToDelete = [];
        for (let i = 0; i < allElements.length; i++) {
            if (allElements[i].parentNode.nodeName === "widget") {
                elementsToDelete.push(allElements[i]);
            }
        }
        for (let i = 0; i < elementsToDelete.length; i++) {
            widgetElement.removeChild(elementsToDelete[i]);
        }
    }

    exports.CheckForXMLParseErrors = CheckForXMLParseErrors;
    exports.TryGetWidgetElement = TryGetWidgetElement;
    exports.GetOrCreateElement = GetOrCreateElement;
    exports.GetOrCreateTizenElement = GetOrCreateTizenElement;
    exports.RemoveAllChildren = RemoveAllChildren;
});
