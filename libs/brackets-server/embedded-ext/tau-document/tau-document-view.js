define(function(require, exports, module) {
    var ExtensionUtils   = brackets.getModule("utils/ExtensionUtils"),
        WorkspaceManager = brackets.getModule("view/WorkspaceManager");

    var panelHTML = require("text!templates/panel.html");

    var TauDocumentView;

    module.exports = TauDocumentView = (function() {
        function TauDocumentView() {
            this.$icon = null;
            this.$iframe = null;
            this.$panel = null;
            this.panel = null;
            this.visible = false;

            ExtensionUtils.loadStyleSheet(module, "style/panel.css");

            WorkspaceManager.on("workspaceUpdateLayout", this.resizeIframe.bind(this));
            $("#sidebar").on("panelCollapsed panelExpanded panelResizeUpdate", this.resizeIframe.bind(this));
        }

        TauDocumentView.prototype.resizeIframe = function() {
            if (this.visible && this.$iframe) {
                var iframeWidth = this.panel.$panel.innerWidth();
                this.$iframe.attr("width", iframeWidth + "px");
            }
        };

        TauDocumentView.prototype.loadDocument = function(file) {
            var self = this;
            
            var path = ExtensionUtils.getModulePath(module, file);

            this.$iframe.hide();

            this.$iframe.load(function() {
                self.$iframe.show();
            });

            this.$iframe.attr("src", path);
        };

        TauDocumentView.prototype.toggleVisibility = function() {
            this.setVisibility(!this.visible);
        };

        TauDocumentView.prototype.setVisibility = function(isVisible) {
            var self = this;

            if (this.visible === isVisible) {
                return;
            }

            this.visible = isVisible;

            if (this.visible) {
                if (!this.panel) {
                    this.$panel = $(panelHTML);
                    this.$iframe = this.$panel.find("#panel-document-frame");
                    this.panel = WorkspaceManager.createBottomPanel("tau-document-panel", this.$panel);
                    this.$panel.on("panelResizeUpdate", function (e, newSize) {
                        self.$iframe.attr("height", newSize);
                    });
                    this.$iframe.attr("height", this.$panel.height());

                    window.setTimeout(self.resizeIframe.bind(self));

                    $("#close-toggle").click(self.toggleVisibility.bind(self));

                    this.$iframe.hide();
                }

                this.panel.show();
            } else {
                this.panel.hide();
                this.$iframe.hide();
            }
        };

        return TauDocumentView;
    }());
});
