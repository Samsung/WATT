define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    if (PreferencesManager.getViewState("projectType") !== "sthings") {
        return;
    }

    const CommandManager = brackets.getModule("command/CommandManager"),
        Dialogs          = brackets.getModule("widgets/Dialogs"),
        FileSystem       = brackets.getModule("filesystem/FileSystem"),
        Menus            = brackets.getModule("command/Menus"),
        ProjectManager   = brackets.getModule("project/ProjectManager");

    const AddIotDeviceTemplate = require("text!htmlContent/Add-IoT-Device.html");

    const STHINGS_MENU = "sthings-menu";
    const STHINGS_ADD_IOT_DEVICE = "sthings.addIoTDevice";

    function handleAddIoTDevice() {
        let deviceName;
        const dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(AddIotDeviceTemplate));
        const $dlg = dialog.getElement();
        const $OkBtn = $dlg.find(".dialog-button[data-button-id='ok']");
        $OkBtn[0].disabled = true;

        const $deviceName = $("#input-device-name", $dlg);
        $deviceName.on("change keyup paste", function() {
            if (this.value.trim().length !== 0) {
                $OkBtn[0].disabled = false;
            } else {
                $OkBtn[0].disabled = true;
            }

            deviceName = this.value;
        });

        const $variableAddBtn = $("#addVariable", $dlg);
        $variableAddBtn.click(() => {
            let variableTable = $dlg.find("#IoTVariables")[0];
            let noOfRows = variableTable.rows.length;

            let row = variableTable.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let nameCell = row.insertCell(1);
            let conditionCell = row.insertCell(2);
            let conditiontrueCell = row.insertCell(3);
            let conditionfalseCell = row.insertCell(4);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            nameCell.innerHTML = "<input type=\"text\" style=\"width: 100%;\"></input>";
            conditionCell.innerHTML = "<input type=\"text\" placeholder=\"ex:) Variable > 100\" style=\"width: 100%;\"></input>";
            conditiontrueCell.innerHTML = "<input type=\"text\" placeholder=\"ex:) On\" style=\"width: 100%;\"></input>";
            conditionfalseCell.innerHTML = "<input type=\"text\" placeholder=\"ex:) Off\"style=\"width: 100%;\"></input>";
        });

        const $variableRemoveBtn = $("#removeVariable", $dlg);
        $variableRemoveBtn.click(() => {
            let variableTableRows = $dlg.find("#IoTVariables")[0].rows;
            let toDelete = [];
            for (let i = 0; i < variableTableRows.length; i++) {
                if (variableTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                $dlg.find("#IoTVariables")[0].deleteRow(toDelete[i]);
            }
        });

        // Add default APIs
        function addDefaultAPI() {
            let apiTable = $dlg.find("#IoTAPIs")[0];
            let noOfRows = apiTable.rows.length;

            let APIs = ["initialize", "open", "close" , "read" , "write"];

            for (let i=1; i<=5; i++) {
                let row = apiTable.insertRow(i);
                let selectCell = row.insertCell(0);
                let nameCell = row.insertCell(1);

                selectCell.style = "text-align: center;";
                selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (i) + "\">";
                nameCell.innerHTML = "<input type=\"text\" class=\"name\" style=\"width: 100%;\" value=\""+APIs[i-1]+"\"></input>";
            }
        }

        addDefaultAPI();

        const $apiAddBtn = $("#addAPI", $dlg);
        $apiAddBtn.click(() => {
            let variableTable = $dlg.find("#IoTAPIs")[0];
            let noOfRows = variableTable.rows.length;

            let row = variableTable.insertRow(noOfRows);
            let selectCell = row.insertCell(0);
            let nameCell = row.insertCell(1);

            selectCell.style = "text-align: center;";
            selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
            nameCell.innerHTML = "<input type=\"text\" class=\"name\" style=\"width: 100%;\"></input>";
        });

        const $apiRemoveBtn = $("#removeAPI", $dlg);
        $apiRemoveBtn.click(() => {
            let apiTableRows = $dlg.find("#IoTAPIs")[0].rows;
            let toDelete = [];
            for (let i = 0; i < apiTableRows.length; i++) {
                if (apiTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                $dlg.find("#IoTAPIs")[0].deleteRow(toDelete[i]);
            }
        });

        const basePath = ProjectManager.getProjectRoot().fullPath;
        dialog.done((buttonId) => {
            if (buttonId === "ok") {
                let script = "\"use strict\";\n\n";
                script += "// Import Common Model Interface\n";
                script += "var $oT = require('../../lib/sthings/sthings').SThings();\n\n";

                let variableTable = $dlg.find("#IoTVariables")[0];
                let noOfRows = variableTable.rows.length;

                if (noOfRows !== 1) {
                    for (let i=1; i<noOfRows; i++) {
                        const variable = variableTable.rows[i];
                        const variableValue = variable.cells[1].getElementsByTagName("input")[0].value;
                        
                        script += "$oT.status.{{VALUE}} = 0.0;\n";
                        script = script.replace(/{{VALUE}}/g, variableValue);
                    }
                }

                script += "\n";
                script += "var {{DEVICE}} = function() {\n";
                script += "  this.initialize();\n";
                script += "}\n\n";

                let apiTable = $dlg.find("#IoTAPIs")[0];
                noOfRows = apiTable.rows.length;

                if (noOfRows !== 1) {
                    for (let i=1; i<noOfRows; i++) {
                        const api = apiTable.rows[i];
                        const apiValue = api.cells[1].getElementsByTagName("input")[0].value;
                        if (apiValue !== "") {
                            if (apiValue === "initialize") {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function() {\n";
                                script += "    // Add the codes for developer\n\n";
                                script += "    /*\n";
                                script += "     * For Example,\n";
                                script += "     *\n";
                                script += "     * Initialize the all variables and functions for IoT Device\n";
                                script += "     * $oT.{IOT_MODULE}_initialize();\n";
                                script += "     *\n";
                                script += "     */\n\n";
                                script += "    $oT.i2c_initialize();\n";
                                script += "    $oT.led_initialize();\n";
                                script += "}\n\n";
                            } else if (apiValue === "open") {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function() {\n";
                                script += "    // Add the codes for developer\n\n";
                                script += "    /*\n";
                                script += "     * For Example,\n";
                                script += "     *\n";
                                script += "     * Open the all variables and functions for IoT Device\n";
                                script += "     * $oT.{IOT_MODULE}_open();\n";
                                script += "     *\n";
                                script += "     */\n\n";
                                script += "    $oT.i2c_open();\n";
                                script += "    $oT.led_open();\n";
                                script += "}\n\n";
                            } else if (apiValue === "close") {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function() {\n";
                                script += "    // Add the codes for developer\n\n";
                                script += "    /*\n";
                                script += "     * For Example,\n";
                                script += "     *\n";
                                script += "     * Close the all variables and functions for IoT Device\n";
                                script += "     * $oT.{IOT_MODULE}_close();\n";
                                script += "     *\n";
                                script += "     */\n\n";
                                script += "    $oT.i2c_close();\n";
                                script += "    $oT.led_close();\n";
                                script += "}\n\n";
                            } else if (apiValue === "read") {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function(status) {\n";
                                script += "    // Add the codes for developer\n\n";
                                script += "    /*\n";
                                script += "     * For Example,\n";
                                script += "     *\n";
                                script += "     * Read the value about IoT Device\n";
                                script += "     * return $oT.{IOT_MODULE}_read(status);\n";
                                script += "     *\n";
                                script += "     */\n\n";
                                script += "    return $oT.i2c_read(status);\n";
                                script += "}\n\n";
                            } else if (apiValue === "write") {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function(status) {\n";
                                script += "    // Add the codes for developer\n\n";
                                script += "    /*\n";
                                script += "     * For Example,\n";
                                script += "     *\n";
                                script += "     * Write the value about IoT Device\n";
                                script += "     * {{DEVICE}}.prototype.read(value);\n";
                                script += "     * {{DEVICE}}.prototype.writeCondition();\n";
                                script += "     * setTimeout({{DEVICE}}.prototype.write, 3000);\n";
                                script += "     *\n";
                                script += "     */\n\n";
                                script += "    // Need the codes for getting IoT Device Data\n\n";
                                script += "    // Set Condition by dialog\n";
                                script += "    {{DEVICE}}.prototype.writeCondition();\n\n";
                                script += "    // Need the codes for setting timer\n";
                                script += "    setTimeout({{DEVICE}}.prototype.write, 3000);\n";
                                script += "}\n\n";
                            } else {
                                script += "{{DEVICE}}.prototype.{{APIVALUE}} = function() {\n}\n\n";
                            }
                            script = script.replace(/{{APIVALUE}}/g, apiValue);
                        }
                    }
                }
                
                // Add variable condition function
                let variableconTable = $dlg.find("#IoTVariables")[0];
                let noOfRowsval = variableconTable.rows.length;

                if (noOfRowsval !== 1) {
                    for (let i=1; i<noOfRowsval; i++) {
                        const variable = variableconTable.rows[i];
                        const variableValue = variable.cells[1].getElementsByTagName("input")[0].value;
                        const conditionValue = variable.cells[2].getElementsByTagName("input")[0].value;
                        const conditiontrueValue = variable.cells[3].getElementsByTagName("input")[0].value;
                        const conditionfalseValue = variable.cells[4].getElementsByTagName("input")[0].value;
                        if (conditionValue !== "") {
                            script += "{{DEVICE}}.prototype." + "writeCondition = function() { \n";
                            script += "  if ($oT.status." + conditionValue +") {\n";
                            script += "    $oT.status.{{VALUE}} = " + conditiontrueValue + ";\n";
                            script += "  }\n";
                            script += "  else {\n";
                            script += "    $oT.status.{{VALUE}} = " + conditionfalseValue + ";\n";
                            script += "  }\n";
                            script += "}\n\n";
                        }
                        script = script.replace(/{{VALUE}}/g, variableValue);
                    }
                }

                script += "var test = new {{DEVICE}}();\n\n";
                script += "test.open();\n";
                script += "test.write();\n";
                
                script = script.replace(/{{DEVICE}}/g, deviceName);

                const providerPath = basePath + "/SThings_Provider/js/provider_"+deviceName+".js";
                const newFile = FileSystem.getFileForPath(providerPath);
                newFile.write(script);

                ProjectManager.refreshFileTree();
            }
        });
    }

    CommandManager.register("Add IoT Device", STHINGS_ADD_IOT_DEVICE, handleAddIoTDevice);

    const menu = Menus.addMenu("S-Things", STHINGS_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    menu.addMenuItem(STHINGS_ADD_IOT_DEVICE);
});
