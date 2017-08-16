/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var DefaultDialogs        = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs               = brackets.getModule("widgets/Dialogs");

    let metaDataDialogText = '<table class="generalTable"><tr><td>Key</td><td><input id="keyInput" class="filterSearch"/></td></tr>' +
        '<tr><td>Value</td><td><input id="valueInput" class="filterSearch"/></td></tr></table>' +
        '<br/><div id="error" style="font-weight: bold;"></div>';

    function SetMetaDataRemoveButton(removeButton, metaDataTable) {
        removeButton.click(function (e) {
            let metaDataTableRows = metaDataTable.rows;
            let toDelete = [];
            for (let i = 0; i < metaDataTableRows.length; i++) {
                if (metaDataTableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                metaDataTable.deleteRow(toDelete[i]);
            }
        });
    }

    function SetMetaDataAddButton(addButton, metaDataTable) {
        addButton.click(function (e) {
            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Add Meta Data",
                metaDataDialogText,
                [{"className": "primary okBtn", "id": "okBtn", "text": "OK"}, {"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}]
            );

            let metaDataTableRows = metaDataTable.rows;
            let keys = [];
            for (let i = 0; i < metaDataTableRows.length; i++) {
                keys.push(metaDataTableRows[i].cells[1].innerHTML);
            }

            let $dlg = dialog.getElement();
            let $keyInput = $("#keyInput", $dlg);
            let $valueInput = $("#valueInput", $dlg);
            let $error = $("#error", $dlg)[0];

            let $okButton = $(".okBtn", $dlg)[0];
            $okButton.disabled = true;
            $error.innerHTML = "Key must not be empty!";

            $keyInput.on("input", function(e) {
                if ($keyInput.val() === "") {
                    $okButton.disabled = true;
                    $error.innerHTML = "Key must not be empty!";
                } else {
                    if (keys.includes($keyInput.val())) {
                        $okButton.disabled = true;
                        $error.innerHTML = "This key already exists!";
                    } else {
                        $okButton.disabled = false;
                        $error.innerHTML = "";
                    }
                }
            });

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let noOfRows = metaDataTable.rows.length;

                    let row = metaDataTable.insertRow(noOfRows);
                    let selectCell = row.insertCell(0);
                    let keyCell = row.insertCell(1);
                    let valueCell = row.insertCell(2);

                    selectCell.style = "text-align: center;";
                    selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                    keyCell.innerHTML = $keyInput.val();
                    valueCell.innerHTML = $valueInput.val();
                }
            });
        });
    }

    function SetMetaDataEditButton(editButton, metaDataTable) {
        editButton.click(function (e) {
            let metaDataTableRows = metaDataTable.rows;
            let keys = [];
            let editedRow;
            for (let i = 0; i < metaDataTableRows.length; i++) {
                if (!editedRow && metaDataTableRows[i].cells[0].firstChild.checked) {
                    editedRow = metaDataTableRows[i];
                } else {
                    keys.push(metaDataTableRows[i].cells[1].innerHTML);
                }
            }

            if (!editedRow) {
                return;
            }

            let dialog = Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_INFO,
                "Edit Meta Data",
                metaDataDialogText,
                [{"className": "primary okBtn", "id": "okBtn", "text": "OK"}, {"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}]
            );

            let $dlg = dialog.getElement();
            let $keyInput = $("#keyInput", $dlg);
            let $valueInput = $("#valueInput", $dlg);
            let $error = $("#error", $dlg)[0];

            $keyInput.val(editedRow.cells[1].innerHTML);
            $valueInput.val(editedRow.cells[2].innerHTML);

            let $okButton = $(".dialog-button", $dlg)[0];

            $keyInput.on("input", function(e) {
                if ($keyInput.val() === "") {
                    $okButton.disabled = true;
                    $error.innerHTML = "Key must not be empty!";
                } else {
                    if (keys.includes($keyInput.val())) {
                        $okButton.disabled = true;
                        $error.innerHTML = "This key already exists!";
                    } else {
                        $okButton.disabled = false;
                        $error.innerHTML = "";
                    }
                }
            });

            $keyInput.trigger("input");

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let keyCell = editedRow.cells[1];
                    let valueCell = editedRow.cells[2];

                    keyCell.innerHTML = $keyInput.val();
                    valueCell.innerHTML = $valueInput.val();
                }
            });
        });
    }

    exports.SetMetaDataRemoveButton = SetMetaDataRemoveButton;
    exports.SetMetaDataAddButton = SetMetaDataAddButton;
    exports.SetMetaDataEditButton = SetMetaDataEditButton;
});
