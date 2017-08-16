/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, sub: true, esnext: true */
/*global define */

define(function (require, exports, module) {
    "use strict";

    var DefaultDialogs          = brackets.getModule("widgets/DefaultDialogs"),
        Dialogs                 = brackets.getModule("widgets/Dialogs");

    var LocalizationPopup       = require("text!htmlContent/localization-edit-popup.html");

    var defaultLanguage = "en-gb";

    function prepareTizenNameLanuguageSelect(id, idName, usedElements) {
        // TODO: is this a complete / valid list?
        let locales = [
            "ar", "ar-sa", "ar-ae", "ar-bh", "ar-dz", "ar-eg", "ar-iq", "ar-jo", "ar-kw", "ar-lb", "ar-ly", "ar-ma", "ar-om", "ar-qa", "ar-sy", "ar-tn", "ar-ye",
            "af", "af-za",  "am", "am-et", "as", "as-in", "az", "az-arab", "az-arab-az", "az-cyrl", "az-cyrl-az", "az-latn", "az-latn-az", "be", "be-by", "bg", "bg-bg",
            "bn", "bn-bd", "bn-in", "bs", "bs-cyrl", "bs-cyrl-ba", "bs-latn", "bs-latn-ba", "ca", "ca-es", "ca-es-valencia", "chr-cher", "chr-cher-us", "chr-latn",
            "cs", "cs-cz", "cy", "cy-gb",  "da", "da-dk", "de", "de-at", "de-ch", "de-de", "de-lu", "de-li", "el", "el-gr", "en", "en-au", "en-ca", "en-gb", "en-ie",
            "en-in", "en-nz", "en-sg", "en-us", "en-za", "en-bz", "en-hk", "en-id", "en-jm", "en-kz", "en-mt", "en-my", "en-ph", "en-pk", "en-tt", "en-vn", "en-zw",
            "en-053", "en-021", "en-029", "en-011", "en-018", "en-014", "es", "es-cl", "es-co", "es-es", "es-mx", "es-ar", "es-bo", "es-cr", "es-do", "es-ec", "es-gt",
            "es-hn", "es-ni", "es-pa", "es-pe", "es-pr", "es-py", "es-sv", "es-us", "es-uy", "es-ve", "es-019", "es-419", "et", "et-ee", "eu", "eu-es", "fa", "fa-ir",
            "fi", "fi-fi", "fil", "fil-latn", "fil-ph", "fr", "fr-be", "fr-ca", "fr-ch", "fr-fr", "fr-lu", "fr-015", "fr-cd", "fr-ci", "fr-cm", "fr-ht", "fr-ma", "fr-mc",
            "fr-ml", "fr-re", "frc-latn", "frp-latn", "fr-155", "fr-029", "fr-021", "fr-011", "ga", "ga-ie", "gd-gb", "gd-latn", "gl", "gl-es", "gu", "gu-in", "ha", "ha-latn",
            "ha-latn-ng", "he", "he-il", "hi", "hi-in", "hr", "hr-hr", "hr-ba", "hu", "hu-hu", "hy", "hy-am", "id", "id-id", "ig-latn", "ig-ng", "is", "is-is", "it", "it-it", "it-ch",
            "iu-cans", "iu-latn", "iu-latn-ca", "ja", "ja-jp", "ka", "ka-ge", "kk", "kk-kz", "km", "km-kh", "kn", "kn-in", "ko", "ko-kr", "kok", "kok-in", "ku-arab", "ku-arab-iq",
            "ky-kg", "ky-cyrl", "lb", "lb-lu", "lo", "lo-la", "lt", "lt-lt", "lv", "lv-lv", "mk", "mk-mk", "mi", "mi-latn", "mi-nz", "ml", "ml-in", "mn-cyrl", "mn-mong", "mn-mn",
            "mn-phag", "mr", "mr-in", "ms", "ms-bn", "ms-my", "mt", "mt-mt", "nb", "nb-no", "nn", "nn-no", "no", "no-no", "ne", "ne-np", "nl", "nl-nl", "nl-be", "nso", "nso-za",
            "or", "or-in", "pa", "pa-arab", "pa-arab-pk", "pa-deva", "pa-in", "pl", "pl-pl", "prs", "prs-af", "prs-arab", "pt", "pt-pt", "pt-br", "quc-latn", "qut-gt", "qut-latn",
            "quz", "quz-bo", "quz-ec", "quz-pe", "ro", "ro-ro", "ru" , "ru-ru", "rw", "rw-rw", "sd-arab", "sd-arab-pk", "sd-deva", "si", "si-lk", "sl", "sl-si", "sk", "sk-sk",
            "sq", "sq-al", "sr-cyrl", "sr-cyrl-ba", "sr-cyrl-cs", "sr-cyrl-me", "sr-cyrl-rs", "sr-Latn", "sr-latn-cs", "sr", "sr-latn-ba", "sr-latn-me", "sr-latn-rs", "sv", "sv-se",
            "sv-fi", "sw", "sw-ke", "ta", "ta-in", "te", "te-in", "tg-arab", "tg-cyrl", "tg-cyrl-tj", "tg-latn", "th", "th-th", "ti", "ti-et", "tk-cyrl", "tk-latn", "tk-tm",
            "tk-latn-tr", "tk-cyrl-tr", "tn", "tn-bw", "tn-za", "tr", "tr-tr", "tt-arab", "tt-cyrl", "tt-latn", "tt-ru", "ug-arab", "ug-cn", "ug-cyrl", "ug-latn", "uk", "uk-ua",
            "ur", "ur-pk", "uz", "uz-cyrl", "uz-latn", "uz-latn-uz", "vi", "vi-vn", "wo", "wo-sn", "xh", "xh-za", "yo-latn", "yo-ng", "zh", "zh-Hans", "zh-cn", "zh-hans-cn",
            "zh-sg", "zh-hans-sg", "zh-Hant", "zh-hk", "zh-mo", "zh-tw", "zh-hant-hk", "zh-hant-mo", "zh-hant-tw", "zu", "zu-za"
        ];

        let text = "<select id=\"" + idName + id +"\" style=\"width: 98%; border: 0; background-color: inherit; margin-left: 0px;\">";
        for (let i = 0; i < locales.length; i++) {
            if (!usedElements.includes(locales[i])) {
                text += "<option value=\"" + locales[i] + "\">" + locales[i];
                if (locales[i] === defaultLanguage) {
                    text += " (default)</option>";
                } else {
                    text += "</option>";
                }
            }
        }
        text += "</select>";

        return text;
    }


    function createLocalizationEditDialog(table, editingElement, usedElements, elementName, extendedVersion) {
        if (!usedElements) {
            usedElements = [];
        }

        let dialogText = LocalizationPopup;

        let dialog = Dialogs.showModalDialog(
            DefaultDialogs.DIALOG_ID_INFO,
            "Edit " + elementName,
            dialogText,
            [{"className": "cancelBtn", "id": "cancelBtn", "text": "Cancel"}, {"className": "primary okBtn", "id": "okBtn", "text": "Finish"}, ]
        );

        let $dlg = dialog.getElement();
        let $table = $(".generalTable", $dlg)[0];

        let $okButton = $(".okBtn", $dlg)[0];
        let $error = $("#error", $dlg)[0];

        let row1 = $table.insertRow();
        let title1Cell = row1.insertCell(0);
        let languageSelectCell = row1.insertCell(1);

        let row2 = $table.insertRow();
        let title2Cell = row2.insertCell(0);
        let nameCell = row2.insertCell(1);

        title1Cell.innerHTML = "Language";
        languageSelectCell.innerHTML = prepareTizenNameLanuguageSelect(1, "languageSelect", usedElements);
        languageSelectCell.firstChild.style = "width: 100%; margin-left: 0px; background-color: white;";

        let $languegeSelect = $("#languageSelect1", $dlg);
        if (!usedElements.includes(defaultLanguage)) {
            $languegeSelect.val(defaultLanguage);
        }

        title2Cell.innerHTML = elementName;
        nameCell.innerHTML = "<input type=\"text\" class=\"input\" id=\"valueInput\" value=\"\" style=\"width: 100%;\"/>";

        let $valueInput = $("#valueInput", $dlg);

        if (extendedVersion) {
            let row3 = $table.insertRow();
            let title3Cell = row3.insertCell(0);
            let licenceUrlCell = row3.insertCell(1);

            title3Cell.innerHTML = elementName + " URL";
            licenceUrlCell.innerHTML = "<input type=\"text\" class=\"input\" id=\"valueUrlInput\" value=\"\" style=\"width: 100%;\"/>";

            let $valueUrlInput = $("#valueUrlInput", $dlg);

            let handleErrors = function(e) {
                if ($valueInput.val() === "") {
                    $error.innerHTML = elementName + " cannot be empty!";
                    $okButton.disabled = true;
                } else if ($valueUrlInput.val() !== "" && !$valueUrlInput.val().startsWith("http://") && !$valueUrlInput.val().startsWith("https://")) {
                    $error.innerHTML = "Malformed URL";
                    $okButton.disabled = true;
                } else {
                    $error.innerHTML = "";
                    $okButton.disabled = false;
                }
            };

            if (editingElement !== -1) {
                $valueUrlInput.val(table.rows[editingElement].cells[3].innerHTML);
            }

            $valueInput.on("input", handleErrors);
            $valueUrlInput.on("input", handleErrors);
        } else {
            $valueInput.on("input", function(e) {
                if ($valueInput.val() === "") {
                    $error.innerHTML = elementName + " cannot be empty!";
                    $okButton.disabled = true;
                } else {
                    $error.innerHTML = "";
                    $okButton.disabled = false;
                }
            });
        }

        if (editingElement !== -1) {
            $languegeSelect.val(table.rows[editingElement].cells[1].innerHTML);
            $valueInput.val(table.rows[editingElement].cells[2].innerHTML);
        }

        $valueInput.trigger("input");

        return dialog;
    }

    function setUpLocalizedAddButton(button, table, elementName, extendedVersion) {
        button.click(function(e) {
            let usedLanguages = [];
            for (let i = 1; i < table.rows.length; i++) {
                usedLanguages.push(table.rows[i].cells[1].innerHTML);
            }

            let toEdit = -1;
            let dialog = createLocalizationEditDialog(table, toEdit, usedLanguages, elementName, extendedVersion);

            let $dlg = dialog.getElement();
            let $languageSelect = $("#languageSelect1", $dlg)[0];
            let $languageValue = $("#valueInput", $dlg)[0];
            let $languageValueUrl = $("#valueUrlInput", $dlg)[0];

            dialog.done(function (buttonId) {
                if (buttonId === "okBtn") {
                    let noOfRows = table.rows.length;

                    let row = table.insertRow();
                    let selectCell = row.insertCell(0);
                    let languageCell = row.insertCell(1);
                    let nameCell = row.insertCell(2);
                    if (extendedVersion) {
                        let urlCell = row.insertCell(3);
                        urlCell.innerHTML = $languageValueUrl.value;
                    }

                    selectCell.style = "text-align: center;";
                    selectCell.innerHTML = "<input type=\"checkbox\" value=\"" + (noOfRows) + "\">";
                    languageCell.innerHTML = $languageSelect.value;
                    nameCell.innerHTML = $languageValue.value;

                }
            });
        });
    }

    function setUpLocalizedEditButton(button, table, elementName, extendedVersion) {
        button.click(function(e) {
            let tableRows = table.rows;
            let toEdit = -1;
            let usedLanguages = [];

            for (let i = 0; i < tableRows.length; i++) {
                if (tableRows[i].cells[0].firstChild.checked) {
                    toEdit = i;
                    break;
                }
            }
            for (let i = 0; i < tableRows.length; i++) {
                if (toEdit !== i) {
                    usedLanguages.push(tableRows[i].cells[1].innerHTML);
                }
            }

            if (toEdit !== -1) {
                let dialog = createLocalizationEditDialog(table, toEdit, usedLanguages, elementName, extendedVersion);

                let $dlg = dialog.getElement();
                let $languageSelect = $("#languageSelect1", $dlg)[0];
                let $languageValue = $("#valueInput", $dlg)[0];
                let $languageValueUrl = $("#valueUrlInput", $dlg)[0];

                dialog.done(function (buttonId) {
                    if (buttonId === "okBtn") {
                        let row = table.rows[toEdit];
                        let languageCell = row.cells[1];
                        let nameCell = row.cells[2];
                        if (extendedVersion) {
                            let urlCell = row.cells[3];
                            urlCell.innerHTML = $languageValueUrl.value;
                        }

                        languageCell.innerHTML = $languageSelect.value;
                        nameCell.innerHTML = $languageValue.value;
                    }
                });
            }
        });
    }

    function setUpLocalizedRemoveButton(button, table) {
        button.click(function (e) {
            let tableRows = table.rows;
            let toDelete = [];
            for (let i = 0; i < tableRows.length; i++) {
                if (tableRows[i].cells[0].firstChild.checked) {
                    toDelete.push(i);
                }
            }
            for (let i = toDelete.length - 1; i >= 0; i--) {
                table.deleteRow(toDelete[i]);
            }
        });
    }

    exports.setUpLocalizedAddButton = setUpLocalizedAddButton;
    exports.setUpLocalizedEditButton = setUpLocalizedEditButton;
    exports.setUpLocalizedRemoveButton = setUpLocalizedRemoveButton;
});
