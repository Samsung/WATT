var execute = function () {
    var box = document.getElementById("controlBox");
    var m = new Matrix();
    var intervalID = 1;
    window.addEventListener("keypress", function(e) {
        switch (e.keyCode) {
            case 119: // w, move up
                m.move(0, -10);
                break;
            case 115: // s, move down
                m.move(0, 10);
                break;
            case 97: // a, move left
                m.move(-10, 0);
                break;
            case 100: // d, move right
                m.move(10, 0);
                break;
            case 116: // t, scale up
                m.scale(1.1, 1.1);
                break;
            case 121: // y, scale down
                m.scale(0.9, 0.9);
                break;
            case 105: // i, clear interval
                window.clearInterval(intervalID);
                return;
            case 106: // j, rotate X
                window.clearInterval(intervalID);
                intervalID = setInterval(function() {
                    m.rotateX(15);
                    var styleStr = m.ToString();
                    console.log(styleStr);
                    box.style = "transform:matrix3d("+styleStr+")";
                }, 100);
                return;
            case 107: // k, rotate Y
                window.clearInterval(intervalID);
                intervalID = setInterval(function() {
                    m.rotateY(15);
                    var styleStr = m.ToString();
                    console.log(styleStr);
                    box.style = "transform:matrix3d("+styleStr+")";
                }, 100);
                return;
            case 108: // l, rotate Z
                window.clearInterval(intervalID);
                intervalID = setInterval(function() {
                    m.rotateZ(15);
                    var styleStr = m.ToString();
                    console.log(styleStr);
                    box.style = "transform:matrix3d("+styleStr+")";
                }, 100);
                return;
        };

        var styleStr = m.ToString();
        console.log(styleStr);
        box.style = "transform:matrix3d("+styleStr+")";
    }, false);
};
