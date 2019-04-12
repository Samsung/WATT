/* global Promise */
define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    const projectType = PreferencesManager.getViewState("projectType");

    const allowProjectType = ["sthings", "web", "wasm"];
    // Return extension when project type is not equal to web or sthings
    if (allowProjectType.indexOf(projectType) === -1) {
        return;
    }

    const CommandManager              = brackets.getModule("command/CommandManager");
    const DefaultDialogs              = brackets.getModule("widgets/DefaultDialogs");
    const Dialogs                     = brackets.getModule("widgets/Dialogs");
    const ExtensionUtils              = brackets.getModule("utils/ExtensionUtils");
    const Menus                       = brackets.getModule("command/Menus");
    const NodeDomain                  = brackets.getModule("utils/NodeDomain");
    const Strings                     = brackets.getModule("strings");

    const CertificateTemplate         = require("text!htmlContent/certificateDialog.html");
    const ExtensionStrings            = require("strings");

    const domainPath = ExtensionUtils.getModulePath(module, "node/ProfileDomain");
    const profileNodeDomain = new NodeDomain("profileNodeDomain", domainPath);

    const PROFILE_MENU = "profile-menu";
    const PROFILE_CERTIFICATE = "profile.certificate";

    function fetchCertInfo() {
        return new Promise((fulfill, reject) => {
            var projectId = PreferencesManager.getViewState("projectId");
            const result = profileNodeDomain.exec("getCurrentCertData", projectId);
            result.done((value) => {
                fulfill(JSON.parse(value));
            }).fail((error) => {
                reject(error);
            });
        });
    }

    function handleCertificate() {
        fetchCertInfo().then((certData) => {
            const fields = [
                {
                    "id": "cert_author_name",
                    "description": ExtensionStrings.CERTIFICATE_AUTHOR_NAME_LABEL,
                    "type": "text",
                    "required": true,
                    "value": certData.alias,
                    "optionName": "--alias",
                    "fieldName": "alias"
                },
                {
                    "id": "cert_password",
                    "description": ExtensionStrings.CERTIFICATE_PASSWORD_LABEL,
                    "type": "password",
                    "required": true,
                    "value": certData.password,
                    "optionName": "--password",
                    "fieldName": "password"
                },
                {
                    "id": "cert_confirm_password",
                    "description": ExtensionStrings.CERTIFICATE_CONFIRM_PASSWORD_LABEL,
                    "type": "password",
                    "required": true,
                    "value": certData.password,
                    "optionName": null,
                    "fieldName": null
                },
                {
                    "id": "cert_country",
                    "description": ExtensionStrings.CERTIFICATE_COUNTRY_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.country,
                    "optionName": "--country",
                    "fieldName": "country"
                },
                {
                    "id": "cert_state",
                    "description": ExtensionStrings.CERTIFICATE_STATE_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.state,
                    "optionName": "--state",
                    "fieldName": "state"
                },
                {
                    "id": "cert_city",
                    "description": ExtensionStrings.CERTIFICATE_CITY_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.city,
                    "optionName": "--city",
                    "fieldName": "city"
                },
                {
                    "id": "cert_organization",
                    "description": ExtensionStrings.CERTIFICATE_ORGANIZATION_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.organization,
                    "optionName": "--organization",
                    "fieldName": "organization"
                },
                {
                    "id": "cert_department",
                    "description": ExtensionStrings.CERTIFICATE_DEPARTMENT_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.unit,
                    "optionName": "--unit",
                    "fieldName": "unit"
                },
                {
                    "id": "cert_email",
                    "description": ExtensionStrings.CERTIFICATE_EMAIL_LABEL,
                    "type": "text",
                    "required": false,
                    "value": certData.email,
                    "optionName": "--email",
                    "fieldName": "email"
                },
            ];
            const okButtonId = "cert_okButtonId";
            const context = {
                "fields": fields,
                "okButtonId": okButtonId,
                "Strings": Strings,
                "ExtensionStrings": ExtensionStrings,
            };

            const dialog = Dialogs.showModalDialogUsingTemplate(Mustache.render(CertificateTemplate, context));
            const $dlg = dialog.getElement();

            const $authorName = $("#cert_author_name", $dlg);
            const $password = $("#cert_password", $dlg);
            const $confirmPassword = $("#cert_confirm_password", $dlg);
            const $country = $("#cert_country", $dlg);
            const $email = $("#cert_email", $dlg);
            const $okButton = $("#" + okButtonId, $dlg);

            function validateFields() {
                let anyFieldModified = false;
                for (const field of fields) {
                    if (field.value !== field.$element.val()) {
                        anyFieldModified = true;
                    }
                }
                const requiredFieldsFilled = $authorName.val() && $password.val() && $confirmPassword.val();
                const passwordsEqual = $password.val() === $confirmPassword.val();
                const countryCodeLength = $country.val().length;
                // country empty or at least two characters
                const correctCountryCode = countryCodeLength === 0 || countryCodeLength >= 2;
                // validate email just like "tizen" CLI does it (which isn't correct)
                const tizenEmailRegex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
                const correctEmail = $email.val().length === 0 || tizenEmailRegex.test($email.val());
                if (!anyFieldModified || !requiredFieldsFilled || !passwordsEqual ||
                    !correctCountryCode || !correctEmail) {
                    $okButton.prop("disabled", true);
                } else {
                    $okButton.prop("disabled", false);
                }
            }

            for (const field of fields) {
                const $element = $("#"+field.id, $dlg);
                field.$element = $element;
                $element.on("input", validateFields);
            }

            dialog.done((buttonId) => {
                if (buttonId === "ok") {
                    let options = [];
                    for (const field of fields) {
                        const newValue = field.$element.val();
                        if (newValue && field.optionName) {
                            options.push([field.optionName, field.fieldName, newValue]);
                        }
                    }
                    var projectId = PreferencesManager.getViewState("projectId");
                    const result = profileNodeDomain.exec("generateCertForProfile", projectId, JSON.stringify(options));
                    result.done(() => {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_OK,
                            ExtensionStrings.CERTIFICATE_DIALOG_TITLE,
                            ExtensionStrings.CERTIFICATE_SUCCESS
                        );
                    }).fail(() => {
                        Dialogs.showModalDialog(
                            DefaultDialogs.DIALOG_ID_OK,
                            ExtensionStrings.CERTIFICATE_DIALOG_TITLE,
                            ExtensionStrings.CERTIFICATE_FAIL_GENERATE
                        );
                    });
                }
            });
        }).catch(() => {
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_OK,
                ExtensionStrings.CERTIFICATE_DIALOG_TITLE,
                ExtensionStrings.CERTIFICATE_FAIL_READ
            );
        });
    }

    ExtensionUtils.loadStyleSheet(module, "styles/styles.css");

    CommandManager.register(ExtensionStrings.USER_CERTIFICATE_LABEL, PROFILE_CERTIFICATE, handleCertificate);

    const menu = Menus.addMenu(ExtensionStrings.PROFILE_MENU_LABEL, PROFILE_MENU, Menus.AFTER, Menus.AppMenuBar.NAVIGATE_MENU);
    menu.addMenuItem(PROFILE_CERTIFICATE);
});
