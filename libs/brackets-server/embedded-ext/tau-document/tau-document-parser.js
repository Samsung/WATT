define(function(require, exports, module) {
    var EditorManager      = brackets.getModule("editor/EditorManager");
    var ExtensionUtils     = brackets.getModule("utils/ExtensionUtils");
    var HTMLUtils          = brackets.getModule("language/HTMLUtils");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    function wrapBrackets(str) {
        if (typeof str !== "string") {
            return null;
        }

        var result = str;

        if (!result.startsWith("<")) {
            result = "<" + result;
        }

        if (!result.endsWith(">")) {
            result = result + ">";
        }

        return result;
    }

    var TauDocumentParser;

    module.exports = TauDocumentParser = (function() {
        function TauDocumentParser() {
            this.tauAPIs = {};
            this.tauHTML = {};
            this.tauGuideData = {};
            this.tauGuidePaths = {};
            this.readJson();
        }

        TauDocumentParser.prototype.readJson = function() {
            var self = this;

            ExtensionUtils.loadFile(module, "tau-document-config.json").done(
                function (data) {
                    self.tauGuideData = data;
                    self.setTauGuideData();
                }
            );
        };

        TauDocumentParser.prototype.setTauGuideData = function() {
            var profile, version;

            profile = PreferencesManager.getViewState("projectProfile");
            version = PreferencesManager.getViewState("projectVersion");

            this.tauGuidePaths = this.tauGuideData[version][profile].doc;
            this.tauAPIs = this.tauGuideData[version][profile].api;
            this.tauHTML = this.tauGuideData[version][profile].html;

            return this.tauAPIs;
        };

        TauDocumentParser.prototype.parse = function() {
            var api = this.tauAPIs;
            var html = this.tauHTML;
            var href = null;
            var name = null;

            var editor = EditorManager.getFocusedEditor();
            var language = editor.getLanguageForSelection();
            var langId = language.getId();

            var pos = editor.getSelection();
            var line = editor.document.getLine(pos.start.line);

            if (langId === "html") {
                var tagInfo = HTMLUtils.getTagInfo(editor, editor.getCursorPos());
                if (tagInfo.position.tokenType === HTMLUtils.TAG_NAME || tagInfo.position.tokenType === HTMLUtils.ATTR_VALUE) {
                    var start = 0;
                    var end = 0;

                    // Find a start tag
                    for (var cur = pos.start.ch; cur >= 0; cur--) {
                        if (line[cur] === "<") {
                            start = cur;
                            break;
                        }
                    }

                    // Find a end tag
                    for (var cur = pos.start.ch; cur < line.length; cur++) {
                        if (line[cur] === ">" || line[cur] === "/") {
                            end = cur;
                            break;
                        }
                    }

                    var result = line.slice(start, end);
                    result = wrapBrackets(result);
                    var element = $.parseHTML(result);

                    if (element && element.length > 0) {
                        Object.keys(html).forEach((value) => {
                            if (element[0].matches(value)) {
                                if (html[value].href) {
                                    href = this.tauGuidePaths.local + html[value].href;
                                    name = html[value].name;
                                }
                            }
                        });
                    }
                }                
            } else if (langId === "javascript") {
                var start = line.lastIndexOf("tau.");
                var end = 0;

                if (start === -1) {
                    return null;
                }

                for (var cur = pos.start.ch; cur < line.length; cur++) {
                    if (line[cur] === " " || line[cur] === "(" || line[cur] === ".") {
                        end = cur;
                        break;
                    }
                }

                var data = line.slice(start, end);

                if (data) {
                    data = data.split(".");
                    
                    for (var i=0; i<data.length; i++) {
                        api = api[data[i]];
                        if (!api) {
                            break;
                        }
                    }
    
                    if (api && api.href) {
                        // TODO: Should change the href to use the network
                        // href = this.tauGuidePaths.network + api.href;
                        href = this.tauGuidePaths.local + api.href;
                        name = api.name;
                    }
                }
            }

            return {
                href: href,
                name: name
            };
        };

        return TauDocumentParser;
    }());
});
