/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, $, Mustache */
define(function (require, exports, module) {
    "use strict";

    var DocumentManager     = require("document/DocumentManager"),
        FileSystem          = require("filesystem/FileSystem"),
        LanguageManager     = require("language/LanguageManager"),
        MainViewFactory     = require("view/MainViewFactory"),
        ProjectManager      = require("project/ProjectManager"),
        _                   = require("thirdparty/lodash");

    var BinaryViewTemplate  = require("text!htmlContent/binary-view.html");

    var _viewers = {};

    /**
     * BinarView objects are constructed when an binary file is opened 
     * @see {@link Pane} for more information about where BinaryViews are rendered
     * 
     * @constructor
     * @param {!File} file - The binary file object to render
     * @param {!jQuery} container - The container to render the binary view in
     */
    function BinaryView(file, $container) {
        this.file = file;
        this.$el = $(Mustache.render(BinaryViewTemplate));

        $container.append(this.$el);

        this._naturalWidth = 0;
        this._naturalHeight = 0;
        this._scale = 100;           // 100%
        this._scaleDivInfo = null;   // coordinates of hidden scale sticker

        this.relPath = ProjectManager.makeProjectRelativeIfPossible(this.file.fullPath);

        this.$binaryPath = this.$el.find(".binary-path");

        this.$binaryPath.text(this.relPath).attr("title", this.relPath);

        _viewers[file.fullPath] = this;

        DocumentManager.on("fileNameChange.BinaryView", _.bind(this._onFilenameChange, this));
    }

    /**
     * DocumentManger.fileNameChange handler - when an binary is renamed, we must
     * update the view
     * 
     * @param {jQuery.Event} e - event
     * @param {!string} oldPath - the name of the file that's changing changing
     * @param {!string} newPath - the name of the file that's changing changing
     * @private
     */
    BinaryView.prototype._onFilenameChange = function (e, oldPath, newPath) {
        /*
         * File objects are already updated when the event is triggered
         * so we just need to see if the file has the same path as our binary
         */
        if (this.file.fullPath === newPath) {
            this.relPath = ProjectManager.makeProjectRelativeIfPossible(newPath);
            this.$binaryPath.text(this.relPath).attr("title", this.relPath);
        }
    };

    /**
     * View Interface functions
     */

    /*
     * Retrieves the file object for this view
     * return {!File} the file object for this view
     */
    BinaryView.prototype.getFile = function () {
        return this.file;
    };

    /*
     * Updates the layout of the view
     */
    BinaryView.prototype.updateLayout = function () {

        var $container = this.$el.parent();

        var pos = $container.position(),
            iWidth = $container.innerWidth(),
            iHeight = $container.innerHeight(),
            oWidth = $container.outerWidth(),
            oHeight = $container.outerHeight();

        // $view is "position:absolute" so
        //  we have to update the height, width and position
        this.$el.css({
            top: pos.top + ((oHeight - iHeight) / 2),
            left: pos.left + ((oWidth - iWidth) / 2),
            width: iWidth,
            height: iHeight
        });
    };

    /*
     * Destroys the view
     */
    BinaryView.prototype.destroy = function () {
        delete _viewers[this.file.fullPath];
        DocumentManager.off(".BinaryView");
        this.$el.remove();
    };

    /*
     * Refreshes the binary view with what's on disk
     */
    BinaryView.prototype.refresh = function () {
        // Not implemented yet
    };

    /*
     * Creates an binary view object and adds it to the specified pane
     * @param {!File} file - the file to create an binary of
     * @param {!Pane} pane - the pane in which to host the view
     * @return {jQuery.Promise}
     */
    function _createBinaryView(file, pane) {
        var view = pane.getViewForPath(file.fullPath);

        if (view) {
            pane.showView(view);
        } else {
            view = new BinaryView(file, pane.$content);
            pane.addView(view, true);
        }
        return new $.Deferred().resolve().promise();
    }

    /**
     * Handles file system change events so we can refresh
     *  binary viewers for the files that changed on disk due to external editors
     * @param {jQuery.event} event - event object
     * @param {?File} file - file object that changed
     * @param {Array.<FileSystemEntry>=} added If entry is a Directory, contains zero or more added children
     * @param {Array.<FileSystemEntry>=} removed If entry is a Directory, contains zero or more removed children
     */
    function _handleFileSystemChange(event, entry, added, removed) {
        // this may have been called because files were added
        //  or removed to the file system.  We don't care about those
        if (!entry || entry.isDirectory) {
            return;
        }

        // Look for a viewer for the changed file
        var viewer = _viewers[entry.fullPath];

        // viewer found, call its refresh method
        if (viewer) {
            viewer.refresh();
        }
    }

    /*
     * Install an event listener to receive all file system change events
     * so we can refresh the view when changes are made to the binary in an external editor
     */
    FileSystem.on("change", _handleFileSystemChange);

    /*
     * Initialization, register our view factory
     */
    MainViewFactory.registerViewFactory({
        canOpenFile: function (fullPath) {
            var lang = LanguageManager.getLanguageForPath(fullPath);
            return (lang.getId() === "wasm" || lang.getId() === "binary");
        },
        openFile: function (file, pane) {
            return _createBinaryView(file, pane);
        }
    });

    /*
     * This is for extensions that want to create a
     * view factory based on BinaryView
     */
    exports.BinaryView = BinaryView;
});