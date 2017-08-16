define(function (require, exports, module) {
    "use strict";
    
    var fileInfo = {};

    function addIcon(extension, icon, color, size) {
        fileInfo[extension] = {
            icon: icon,
            color: color,
            size: size
        };
    }

    function addAlias(extension, other) {
        fileInfo[extension] = fileInfo[other];
    }

    // Folder
    addIcon("folder", "\ue000", "#ADB9BD", 20);

    // Ruby
    addIcon("rb", "\ue003", "#ba4a32", 15);
    addAlias("erb", "rb");
    addAlias("rdoc", "rb");

    // JavaScript
    addIcon("js", "\ue004", "#f4bf75");
    addIcon("ejs", "\ue011", "#f4bf75");
    addIcon("jsx", "\ue904", "#00D8FF");
    addIcon("ts", "\ue011", "#228ed6");
    addIcon("coffee", "\ue009", "#c9905e");
    addIcon("json", "\ue015", "#F4BF75");
    addIcon("ls", "\uf269", "#369bd7");

    // XML
    addIcon("xml", "\ue011", "#ff6600");
    addIcon("plist", "\ue011", "#5883f9");
    addIcon("html", "\ue018", "#d28445");
    addAlias("htm", "html");

    // Stylesheets
    addIcon("css", "\ue019", "#6a9fb5");
    addIcon("scss", "\ue019", "#c6538c");
    addAlias("sass", "scss");
    addIcon("less", "\ue019", "#3b6bb2");
    addIcon("styl", "\ue019", "#b3d107");

    addIcon("ino", "\ue902", "#dedede");
    addIcon("pde", "\ue902", "#dedede");
    addIcon("elm", "\ue906", "#3a95f0");
    addAlias("elm-package.json", "elm");
    addIcon("go", "\ue907", "#74CDDD");
    addIcon("elixir", "\ue903", "#9b8ff7");
    addIcon("dart", "\ue900", "#00D2B8");
    addIcon("c", "\ue022", "#3e87ad");
    addIcon("cpp", "\ue023", "#9d4296");
    addIcon("hpp", "\ue901", "#984C93");

    // Server side
    addIcon("php", "\ue006", "#6976c3");
    addIcon("sql", "\ue015", "#c67f07");

    // Java
    addIcon("java", "\ue005", "#75b4de");
    addAlias("class", "java");

    // Python
    addIcon("py", "\ue007", "#75b4de");
    addAlias("pyc", "py");
    addAlias("pyo", "py");
    addAlias("pyd", "py");

    // Shell and friends
    addIcon("sh", "\ue016");
    addIcon("bat", "\ue016");
    addIcon("command", "\ue016");

    // Templating
    addIcon("jade", "\ue018", "#01dfa5");
    addIcon("dust", "\ue018", "#b2270b");
    addIcon("haml", "\ue018", "#eaeae1");
    addIcon("latte", "\ue01d", "#9cc2c9");

    // Images
    addIcon("png", "\ue01a", "#dbb1a9");
    addIcon("jpg", "\ue01a", "#dedfa3");
    addAlias("jpeg", "jpg");
    addIcon("tiff", "\ue01a", "#f88b66");
    addIcon("ico", "\ue01a", "#b6d2d1");
    addIcon("svg", "\ue01a", "#c0c5eb");
    addIcon("bmp", "\ue01a", "#c2ebc0");

    addIcon("gif", "\ue00c", "#aaecc0");

    // Videos
    addIcon("mp4", "\ue01c");
    addAlias("webm", "mp4");
    addAlias("ogg", "mp4");

    // Audio
    addIcon("mp3", "\ue01b");//changed to note icon
    addAlias("wav", "mp3");

    // Fonts
    addIcon("ttf", "\ue01e", "#fa5656"); //changed
    addIcon("eot", "\ue01e", "#fca82b");
    addIcon("woff", "\ue01e", "#fd9be5");
    addAlias("woff2", "woff");

    // Readme
    addIcon("md", "\ue017", "#c36b35");
    addAlias("markdown", "md");

    // Git
    addIcon("gitignore", "\ue013", "#a0422e", 18);
    addIcon("gitmodules", "\ue00e");
    addIcon("gitattributes", "\ue00e");

    // Webservers
    addIcon("htaccess", "\ue010");
    addIcon("htpasswd", "\ue010");
    addIcon("conf", "\ue010");

    // Archive
    addIcon("zip", "\ue00d");
    addIcon("rar", "\ue00d");
    addIcon("7z", "\ue00d");
    addIcon("tgz", "\ue00d");
    addIcon("tar", "\ue00d");
    addIcon("gz", "\ue00d");
    addIcon("bzip", "\ue00d");

    // Settings
    addIcon("project", "\ue00d");
    addAlias("jscsrc", "project");
    addAlias("jshintrc", "project");
    addAlias("csslintrc", "project");
    addAlias("todo", "project");
    addAlias("classpath", "project");

    // Other text files
    addIcon("txt", "\ue00b");
    addIcon("log", "\ue00b");
    addIcon("npmignore", "\ue013", "#a0422e", 18);
    addIcon("yml", "\ue00b");
    addIcon("ls", "\ue00b");
    addIcon("org", "\ue00b");

    // Other Files
    addIcon("map", "\ue020");
    addIcon("pdf", "\ue00f", "#dd7d7d");
    addIcon("todo", "\ue012");

    var WorkingSetView = brackets.getModule("project/WorkingSetView");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");
    var FileTreeView = brackets.getModule("project/FileTreeView");

    ExtensionUtils.loadStyleSheet(module, "styles/style.css");

    var provider = function (entry) {
        var data = null;

        if (!entry.isFile) {
            data = fileInfo.folder;
            data.margin = {
                right: "5 px",
                left: "-5px"
            };
        } else {
            var ext = entry.fullPath.substring(entry.fullPath.lastIndexOf(".") + 1) || entry.name.substr(1);
            if (fileInfo.hasOwnProperty(ext)) {
                data = fileInfo[ext];
            } else {
                data = fileInfo.txt;
            }
        }

        var $new = $("<ins>");
        $new.attr("data-icon", data.icon);
        $new.addClass("file-icon");
        $new.css({
            color: data.color,
            fontSize: (data.size || 16) + "px"
        });
        //folder css
        if (data.margin) {
            $new.css({
                top: "-2px",
                position: "relative",
                marginLeft: data.margin.left,
                marginRight: data.margin.right
            });
        }
        return $new;
    };

    FileTreeView.addIconProvider(provider);
    WorkingSetView.addIconProvider(provider);
});
