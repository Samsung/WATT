define(function (require, exports, module) {
    "use strict";

    const PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    const ProjectManager     = brackets.getModule("project/ProjectManager");
    
    const IDGen = require("widgetprofiles/UIDGenerator");

    // Templates for the i3d menu
    const EventRuleTemplate             = require("text!i3d/html/eventRuleTemplate.html");
    const InteractiveContainerTemplate  = require("text!i3d/html/interactiveContainerTemplate.html");
    const InteractiveModelTemplate      = require("text!i3d/html/interactiveModelTemplate.html");

    // Templates for the the 3d object model
    const DefaultActionTemplate         = require("text!i3d/template/defaultActionTemplate.html");
    const FBXActionTemplate             = require("text!i3d/template/fbxActionTemplate.html");
    const FBXHeaderTemplate             = require("text!i3d/template/fbxHeaderTemplate.html");
    const FBXModelTemplate              = require("text!i3d/template/fbxModelTemplate.html");
    const ObjHeaderTemplate             = require("text!i3d/template/objHeaderTemplate.html");
    const ObjModelTemplate              = require("text!i3d/template/objModelTemplate.html");
    
    const defaultActions = JSON.parse(require("text!i3d/defaultActions.json"));    
    const defaultEvents = JSON.parse(require("text!i3d/defaultEvents.json"));

    let THREE;
    // Load three.js and loader to parse fbx file
    require(["i3d/libs/three", "i3d/libs/FBXLoader", "i3d/libs/inflate.min"], (three) => {
        THREE = three;
    });

    let _nodeDomain, newElement, newElementID;

    function createNewEventRule(targetID, modelID, model, i3dID, i3dEvent, i3dAction) {
        const entry = $(EventRuleTemplate).appendTo("#event-editor");
        const eventNames = [];
        const actionNames = [];

        let inputAction, inputEvent;

        for (const event of defaultEvents) {
            eventNames.push(event);
        }

        entry.find(".event-key").autocomplete({
            source: eventNames,
            minLength: 0
        });

        entry.find(".event-key").focus();

        entry.find(".event-key").on("change", function() {
            inputEvent = this.value;
        });

        for (const action of defaultActions) {
            actionNames.push(action);
        }

        // Add custom actions from fbx file
        if (model.type === "fbx") {
            const loader = new THREE.FBXLoader();
            let filePath = window.location.href+"/i3d/models/"+modelID+"/"+model.id+"/"+model.files[0].file;
            // Change file path to get model file from correct path
            filePath = filePath.split("/");
            filePath.splice(3, 1, "projects");
            filePath = filePath.join("/");
            loader.load(filePath, function(object) {
                for (const animation of object.animations) {
                    actionNames.push(animation.name);
                }
            });
        }

        if (i3dEvent !== undefined) {
            entry.find(".event-key").val(i3dEvent);
        }

        if (i3dAction !== undefined) {
            entry.find(".event-value").val(i3dAction);
        }

        // Add click event listener for action delete button
        entry.find(".apply-event-key").on("click", function() {
            const key = $(this).parent().find(".event-key")[0].value;
            const value = $(this).parent().find(".event-value")[0].value;

            const scripts = $(document.getElementById("htmldesignerIframe").contentWindow.document).find("script");
            scripts.map((pos, script) => {
                if (script.getAttribute("i3d-event") === key && script.getAttribute("i3d-action") === value) {
                    $("#html-design-editor")
                        .trigger("design.editor.event",
                            [
                                "delete.element",
                                { element: script },
                                "html"
                            ]
                        );
                }
            });

            $(this).parent().remove();
        });

        entry.find(".event-value").autocomplete({
            source: actionNames,
            minLength: 0
        });

        entry.find(".event-value").on("change", function() {
            inputAction = this.value;

            if ((eventNames.indexOf(inputEvent) !== -1) && (actionNames.indexOf(inputAction) !== -1)) {
                let template = (defaultActions.indexOf(inputAction)!== -1) ? DefaultActionTemplate: FBXActionTemplate;
                template = template.replace(/{{TARGET}}/g, targetID);
                template = template.replace(/{{CONTAINER_ID}}/g, i3dID);
                template = template.replace(/{{EVENT}}/g, inputEvent);
                template = template.replace(/{{ACTION}}/g, inputAction);

                const rootBodyElement = document.getElementById("htmldesignerIframe").contentWindow.document.body;
                $("#html-design-editor")
                    .trigger("design.editor.event",
                        [
                            "create.new.script",
                            { template: template, containerElement: rootBodyElement },
                            "html"
                        ]
                    );
            }
        });

        return entry;
    }

    function copyLibrary(projectId, selectedFormat, targetID) {
        _nodeDomain.exec("copyLibrary", projectId, selectedFormat).done(() => {
            let headerTemplate;
            if (selectedFormat === "obj") {
                headerTemplate = ObjHeaderTemplate.replace(/{{TARGET}}/g, targetID);
            } else if (selectedFormat === "fbx") {
                headerTemplate = FBXHeaderTemplate.replace(/{{TARGET}}/g, targetID);
            } else {
                // Unsupported model type
                return;
            }

            const rootHeadElement = $(document.getElementById("htmldesignerIframe").contentWindow.document.head);
            $("#html-design-editor")
                .trigger("design.editor.event",
                    [
                        "create.new.script",
                        { template: headerTemplate, containerElement: rootHeadElement },
                        "html"
                    ]
                );

            ProjectManager.refreshFileTree();
        });
    }

    function copyModel(projectId, modelID, object, targetID, i3dID) {
        _nodeDomain.exec("copyModel", projectId, modelID).done(() => {
            let template;

            if (object.type === "obj") {
                template = ObjModelTemplate;

                for (const file of object.files) {
                    if (file.type === "mtl") {
                        template = template.replace(/{{MTL_PATH}}/g, "i3d/models/"+modelID+"/"+object.id+"/"+file.file);
                        template = template.replace(/{{MTL_FILE}}/g, file.file);
                    } else if (file.type === "obj") {
                        template = template.replace(/{{OBJ_PATH}}/g, "i3d/models/"+modelID+"/"+object.id+"/"+file.file);
                    }
                }
            } else if (object.type === "fbx") {
                template = FBXModelTemplate;

                for (const file of object.files) {
                    if (file.type === "fbx") {
                        template = template.replace(/{{FBX_PATH}}/g, "i3d/models/"+modelID+"/"+object.id+"/"+file.file);
                    }
                }
            }

            template = template.replace(/{{TARGET}}/g, targetID);
            template = template.replace(/{{MODEL}}/g, modelID);
            template = template.replace(/{{CONTAINER_ID}}/g, "div#"+i3dID);
            template = template.replace(/{{FORMAT}}/g, object.type);

            const rootBodyElement = $(document.getElementById("htmldesignerIframe").contentWindow.document.body);
            $("#html-design-editor")
                .trigger("design.editor.event",
                    [
                        "create.new.script",
                        { template: template, containerElement: rootBodyElement },
                        "html"
                    ]
                );

            ProjectManager.refreshFileTree();
        });
    }

    function getModelID(models, targetID) {
        const rootBodyElement = $(document.getElementById("htmldesignerIframe").contentWindow.document.body);

        const i3dModels = rootBodyElement.find("[i3d-target='"+targetID+"']");
        for (let i=0; i<i3dModels.length; i++) {
            if (i3dModels[i].getAttribute("i3d-model")) {
                return i3dModels[i].getAttribute("i3d-model");
            }
        }

        return null;
    }

    function getModelObject(models, targetID) {
        var modelID = getModelID(models, targetID);

        let object;
        for (const model of models) {
            if (model.id === modelID) {
                object = model.objects[0];
                return object;
            }
        }

        return null;
    }
    
    function buildEditorUI(nodeDomain, selectedElement) {
        _nodeDomain = nodeDomain;

        $("#interactive-editor").show();
        $("#interactive-editor > .interactiveContainer").remove();

        const tagName = selectedElement.tagName.toLowerCase();
        const entry = $(InteractiveContainerTemplate).appendTo("#interactive-editor");

        let targetID = $(selectedElement).attr("id");
        if (targetID === undefined) {
            targetID = tagName + "_" + IDGen.getID();
            selectedElement.setAttribute("id", targetID);
        }
        entry.find(".attr-value").val(targetID);

        const rootDocumentElement = $(document.getElementById("htmldesignerIframe").contentWindow.document);
        const rootBodyElement = $(rootDocumentElement[0].body);

        const projectId = PreferencesManager.getViewState("projectId");
        _nodeDomain.exec("getModel", projectId).done(data => {
            const models = JSON.parse(data);

            if (selectedElement.getAttribute("i3d-target") !== null) {
                targetID = selectedElement.getAttribute("i3d-target");

                $("#model-selector-container").hide();
                $("#model-editor-container").show();
                $("#model-editor-container > .modelInformation").remove();

                const modelEntry = $(InteractiveModelTemplate).appendTo("#model-editor-container");
                const modelFormatSelector = modelEntry.find("#model-format-selector");

                const modelID = selectedElement.getAttribute("i3d-model");
                for (let model of models) {
                    if (model.id === modelID) {
                        modelEntry.find("#model-image").attr("src", model.imgSrc);
                        modelEntry.find("#model-name").text(model.title);

                        for (let object of model.objects) {
                            const option = document.createElement("option");
                            option.text = object.type;
                            option.setAttribute("value", model.id);

                            modelFormatSelector.append(option);
                        }

                        break;
                    }
                }

                // Find and add exisiting actions
                const targets = rootBodyElement.find("[i3d-target='"+targetID+"']");
                for (let i=0; i<targets.length; i++) {
                    if (targets[i].getAttribute("i3d-event") !== null) {
                        const origin = rootBodyElement.find("#" + targetID);
                        createNewEventRule(targetID, getModelID(models, targetID), getModelObject(models, targetID), origin[0].getAttribute("i3d-tag") + "#" + origin[0].getAttribute("id"), targets[i].getAttribute("i3d-event"), targets[i].getAttribute("i3d-action"));
                    }
                }

                modelFormatSelector.change(function() {
                    let i3dID, modelID;
                    const selectedIndex = this.options.selectedIndex;
                    // Remove all previously selected models
                    const i3dModels = rootDocumentElement.find("[i3d-target='"+targetID+"']");
                    for (let i=0; i<i3dModels.length; i++) {
                        if (i3dModels[i].tagName === "DIV") {
                            i3dID = i3dModels[i].getAttribute("id");
                            modelID = i3dModels[i].getAttribute("i3d-model");
                        } else {
                            $("#html-design-editor")
                                .trigger("design.editor.event",
                                    [
                                        "delete.element",
                                        { element: i3dModels[i] },
                                        "html"
                                    ]
                                );
                        }
                    }

                    const selectedOption = this.options.item(selectedIndex);
                    const selectedFormat = selectedOption.text;

                    let object;
                    for (const model of models) {
                        if (model.id === modelID) {
                            object = model.objects[selectedIndex];
                            break;
                        }
                    }

                    copyLibrary(projectId, selectedFormat, targetID);

                    copyModel(projectId, modelID, object, targetID, i3dID);
                });

                modelEntry.find("#event-add-button").click(function() {
                    const origin = rootBodyElement.find("#" + targetID);
                    createNewEventRule(targetID, getModelID(models, targetID), getModelObject(models, targetID), origin[0].getAttribute("i3d-tag") + "#" + origin[0].getAttribute("id"));
                });
            } else {
                $("#model-editor-container").hide();
                $("#model-selector-container").show();

                const select = entry.find("#model-selector");

                let i3dID = selectedElement.getAttribute("i3d-id");
                let i3dModelID;
                if (i3dID !== null) {
                    var i3dModel = rootBodyElement.find("#"+i3dID);
                    i3dModelID = i3dModel[0].getAttribute("i3d-model");
                }

                for (const model of models) {
                    const option = document.createElement("option");
                    option.text = model.title;
                    option.setAttribute("value", model.title);
                    option.setAttribute("i3d-model", model.id);

                    select.append(option);

                    if (i3dModelID !== "") {
                        if (model.id === i3dModelID) {
                            select.val(model.title).prop("selected", true);
                        }
                    }
                }

                select.change(function() {
                    const selectedIndex = this.options.selectedIndex;
                    if (selectedIndex !== 0) {
                        // Remove all previously selected models
                        const i3dModels = rootDocumentElement.find("[i3d-target='"+targetID+"']");
                        for (let i=0; i<i3dModels.length; i++) {
                            if (i3dModels[i].tagName === "DIV") {
                                $("#html-design-editor")
                                    .trigger("design.editor.event",
                                        [
                                            "delete.element",
                                            { element: i3dModels[i] },
                                            "html"
                                        ]
                                    );
                            }
                        }
                        i3dModels.remove();

                        const selectedOption = this.options.item(selectedIndex);
                        const modelID = selectedOption.getAttribute("i3d-model");

                        let object;
                        for (const model of models) {
                            if (model.id === modelID) {
                                object = model.objects[0];
                                break;
                            }
                        }

                        copyLibrary(projectId, object.type, targetID);

                        const tagName = selectedElement.tagName.toLowerCase();
                        const i3dID = tagName + "_" + IDGen.getID();

                        // Add new container for the selected element
                        const newElement = document.createElement("div");
                        newElement.setAttribute("id", i3dID);
                        newElement.setAttribute("i3d-target", targetID);

                        const offset = $(selectedElement).offset();
                        newElement.style.top = offset.top + "px";
                        newElement.style.left = offset.left + "px";
                        newElement.style.width = "300px";
                        newElement.style.height = "300px";

                        selectedElement.setAttribute("i3d-id", i3dID);
                        selectedElement.setAttribute("i3d-tag", tagName);

                        newElement.setAttribute("i3d-model", modelID);
                        newElement.style.background = "url(\'./i3d/models/"+modelID+"/model.png\') 0% 0% / 100% 100% no-repeat";

                        $("#html-design-editor")
                            .trigger("design.editor.event",
                                [
                                    "create.new.element",
                                    { template: newElement.outerHTML, containerElement: rootBodyElement },
                                    "html"
                                ]
                            );

                        copyModel(projectId, modelID, object, targetID, i3dID);
                    }
                });
            }
        });
    }

    exports.buildUI = buildEditorUI;
});