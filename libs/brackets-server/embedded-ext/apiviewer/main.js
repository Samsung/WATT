/*jslint vars: true, plusplus: true, devel: true, nomen: true,  regexp: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    // Brackets modules
    var AppInit             = brackets.getModule("utils/AppInit"),
        CommandManager      = brackets.getModule("command/CommandManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        FileSystem          = brackets.getModule("filesystem/FileSystem"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        Menus               = brackets.getModule("command/Menus"),
        ProjectManager      = brackets.getModule("project/ProjectManager");

    // Templates
    var panelHTML           = require("text!templates/panel.html");

    var missingFileMessage = "No WASM.idl file was found in a project or no APIs were picked yet.<br/><br/>Use \"Project -> Pick API\" to choose which APIs you would like to use.";

    var $sidebar = $("#sidebar");
    $sidebar.append(panelHTML);
    var apiList = $("#apiList")[0];

    var $apiPanel = $("#panel-apis-viewer");
    var menuId = "showApiOutline";
    var outlineShown = false;

    function _toggle() {
        if (outlineShown) {
            $apiPanel.hide();
            outlineShown = false;
        } else {
            $apiPanel.show();
            outlineShown = true;
        }
        CommandManager.get(menuId).setChecked(outlineShown);
    }

    function fillApisFromPickAPI(entry) {
        FileUtils.readAsText(entry).done(function(text) {
            let jsonObject = JSON.parse(text);
            let apiText = "<ul>";
            if (jsonObject.interfaces) {
                for (const intface of jsonObject.interfaces) {
                    apiText += "<li id=\"interface\">" + intface.name + ":<ul>";

                    if (intface.methods) {
                        for (const method of intface.methods) {
                            apiText += "<li id=\"method\">" + method.returnType + " " + method.name + "(";

                            if (method.params) {
                                for (const param of method.params) {
                                    apiText += param.type + " " + param.name + ", ";
                                }
                                apiText = apiText.substr(0, apiText.length - 2); // cut last ", "
                            }
                            apiText += ")</li>";
                        }
                    }
                    apiText += "</ul></li>";
                }
            }
            apiList.innerHTML = apiText + "</ul>";
        });
    }

    function fillApisFromWebIDL(entry) {
        let WebIDL2 = require("../../node_modules/webidl2/lib/webidl2");
        FileUtils.readAsText(entry).done(function(text) {
            try {
                let tree = WebIDL2.parse(text);
                let apiText = "<ul>";
                let countInterfaces = 0;
                let countMethods = 0;
                for (const interf of tree) {
                    if (interf.name && interf.members && interf.members.length > 0) {
                        apiText += "<li id=\"interface\"> " + "<div class=\"nav-item\">" + interf.name;
                        countInterfaces++;
                        apiText += "<ul>";
                        for (const method of interf.members) {
                            apiText += "<li id=\"method\" class=\"method\">";
                            // types of class members
                            if ("idlType" in method && method.idlType.idlType) {
                                apiText += method.idlType.idlType + " ";
                            }
                            apiText += method.name;
                            if (method.hasOwnProperty("arguments")) {
                                countMethods++;
                                if (method.arguments.length > 0) {
                                    apiText +=  "(";
                                    let counter = 0;
                                    for (const param of method.arguments) {
                                        if (param.hasOwnProperty("idlType")
                                                && param.idlType.hasOwnProperty("idlType")
                                                && param.idlType.idlType.length > 0) {
                                            apiText += param.idlType.idlType + " ";
                                        }
                                        if (param.hasOwnProperty("name")
                                                && param.name.length > 0) {
                                            apiText += param.name;
                                        }
                                        counter++;
                                        // don't add ", " for last parameter
                                        if (counter < method.arguments.length) {
                                            apiText += ", ";
                                        }
                                    }
                                    apiText +=  ")";
                                }
                                else { // no parameters in method
                                    apiText +=  "()";
                                }
                            }
                            apiText += "</li>";
                        }
                        apiText += "</ul>";
                        apiText += "</div></li>";
                    }
                }
                apiText += "</ul>";
                apiList.innerHTML = apiText + "Interfaces: " + countInterfaces + " with " + countMethods + " methods";

                // hide all fields in interfaces
                $(".method").hide();
                // toggle field in interface on click
                $(".nav-item").click(function () {
                    $(this).parent().find("ul li").slideToggle(100);
                });
                $(".nav-item").children().children(".method").click((event) => {
                    event.stopPropagation();
                });
            }
            catch (e) {
                console.log("Exception during processing WebIDL file: " + e);
            }

        });
    }

    function filterWasmJson(file) {
        return file.name === "WASM.api.json";
    }

    function filterWasmIDL(file) {
        return file.name === "WASM.idl";
    }

    function displayAPIs() {
        //try first to base on description from pick api
        ProjectManager.getAllFiles(filterWasmJson).then(
            function(entry) {
                if (entry.length !== 0) {
                    console.log("displayAPIs - using file: " + entry[0]);
                    fillApisFromPickAPI(entry[0]);
                } else {
                    //try to use webidl file
                    ProjectManager.getAllFiles(filterWasmIDL).then(
                        function(entry) {
                            if (entry.length !== 0) {
                                console.log("displayAPIs - using file: " + entry[0]);
                                fillApisFromWebIDL(entry[0]);
                            } else {
                                apiList.innerHTML = missingFileMessage;
                            }
                        }
                    );
                }
            }
        );
    }

    function _handleFileSystemChange(event, entry) {
        if (!entry) {
            return;
        }
        if (entry.isDirectory) {
            // directory structure has changed, refresh all
            displayAPIs();
            return;
        }
        else if (entry.isFile) {
            if (entry._name === "WASM.api.json") {
                fillApisFromPickAPI(entry);
            } else if (entry._name === "WASM.idl") {
                fillApisFromWebIDL(entry);
            }
        }
    }

    var viewMenu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);

    CommandManager.register("API Outline", menuId, _toggle);
    viewMenu.addMenuItem(menuId);

    ExtensionUtils.loadStyleSheet(module, "styles/LivePreview.css");

    AppInit.appReady(function () {
        displayAPIs();
    });

    // Add a document change handler
    FileSystem.on("change", _handleFileSystemChange);
});
