(function(window) {
(!window.tau) && (window.tau = {});
var ns = window.tau.animation = {}; 
(function(window, ns) {
    ( function () {

        var lastTime = 0;
        var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

        for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {

            window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
            window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

        }

        if ( window.requestAnimationFrame === undefined ) {

            window.requestAnimationFrame = function ( callback ) {

                var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
                var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
                lastTime = currTime + timeToCall;
                return id;

            };

        }

        window.cancelAnimationFrame = window.cancelAnimationFrame || function ( id ) { window.clearTimeout( id ) };

    }() );

    (function init(window, ns) {
        window.Uint8Array.prototype.setValue = function() {
            for (var i = 0, len = this.length; i < len; i++) {
                if (arguments[i] === undefined) {
                    return;
                } else {
                    this[i] = arguments[i];
                }
            }

        };

        /**
         * Gets time based on window time system
         * @method getTime
         * @return {Object}
         * @member ns
         * @static
         */
        ns.getTime = (function() {
            if (window.performance) {
                if (window.performance.now) {
                    return function() {
                        return window.performance.now()
                    };
                } else {
                    if (window.performance.webkitNow) {
                        return function() {
                            return window.performance.webkitNow()
                        };
                    } else {
                        return function() {
                            return new Date().getTime()
                        };
                    }
                }
            } else {
                return function() {
                    return new Date().getTime()
                };
            }
        })();



    })(window, ns);


    var base = {

        /**
         * Enum value for type of animation
         * @variable ENUM
         * @member ns.base
         * @private
         */
        ENUM: {
            NODETYPE: {
                GROUP: 1,
                ANIMATION: 2
            },
            GROUPTYPE: {
                SEQUENCE: 4,
                PARALLEL: 8
            }
        },

        /**
         * Calls given function every element of array
         * @method forEach
         * @param {Object} a
         * @param {Function} f
         * @return {Object}
         * @member ns.base
         * @public
         */
        forEach: function(a, f) {
            for (var i = 0, il = (a && a.length); i < il; i++) {
                var o = a[i];
                f(o, i);
            }
        },

        /**
         * Returns copied object from the source
         * @method copy
         * @param {Object} src
         * @param {Object} dst
         * @return {Object}
         * @member ns.base
         * @private
         */
        copy: function(src, dst) {
            dst = dst || {};

            for (var key in src) {
                if (src.hasOwnProperty(key) && key.substr(0, 2) !== '$$') {
                    dst[key] = src[key];
//                    if(typeof(src.length) !== 'undefined') {
//                        this.copy(src[key], dst[key]);
//                    } else {
//                        dst[key] = src[key];
//                    }
                }
            }

            return dst;
        },

        /**
         * Returns copied array from the source
         * @method arrayCopy
         * @param {Object} src
         * @param {Object} dst
         * @return {Object}
         * @member ns.base
         * @private
         */
        arrayCopy: function(src, dst) {
            var i, l = src.length;

            if (l !== undefined) {
                if (dst === undefined) {
                    if (src instanceof Uint8Array) {
                        dst = new Uint8Array(l)
                    } else {
                        dst = [];
                    }
                }

                for (i = 0; i < l; i++) {
                    if(typeof src[i] !== 'string' && src[i].length !== undefined) {
                        dst[i] = ns.base.arrayCopy(src[i]);
                    } else {
                        dst[i] = src[i];
                    }
                }

            } else {
                dst = src;
            }

            return dst;
        },

        /**
         * Returns copied object from the source. DeepCopy checks all type of property in source such as object, string, number, and so on.
         * @method deepCopy
         * @param {Object} src
         * @param {Object} dst
         * @return {Object}
         * @member ns.base
         * @private
         */
        deepCopy: function(src, dst, filter) {
            if (typeof(src) == 'object') {
                dst = dst || {};
                if (typeof(src.length) != 'undefined') {
                    if (src instanceof Array) {
                        dst = new Array();
                    } else if (src instanceof Uint8Array) {
                        dst = new Uint8Array(src.length);
                    }
                }

                for (var objInd in src) {
                    if (typeof(src[objInd]) == 'object') {
                        dst[objInd] = this.deepCopy(src[objInd]);
                    } else if (typeof(src[objInd]) == 'string') {
                        dst[objInd] = src[objInd];
                    } else if (typeof(src[objInd]) == 'number') {
                        dst[objInd] = src[objInd];
                    } else if (typeof(src[objInd]) == 'boolean') {
                        ((src[objInd] == true) ? dst[objInd] = true : dst[objInd] = false);
                    }
                }
            } else {
                dst = src;
            }
            return dst;
        },

        /**
         * Returns SingleTon object. This function provide usage of SingleTon pattern.
         * @method singleTon
         * @param {Object} SingletonObject
         * @return {Object}
         * @member ns.base
         * @private
         */
        singleTon: function(SingletonObject) {
            var _singleton = {};

            _singleton.getInstance = function() {
                if (this._singleton === undefined) {
                    this._singleton = new SingletonObject;
                }
                return this._singleton;
            };

            return _singleton;
        },

        /**
         * Returns true or false based on whether the type of parameter is number or not.
         * @method isNumber
         * @param {Number} n
         * @return {Boolean}
         * @member ns.base
         * @public
         */
        isNumber: function(n) {
            return (typeof n === 'number')
        },

        /**
         * Returns true or false based on whether the type of parameter is function or not.
         * @method isFunction
         * @param {Number} value
         * @return {Boolean}
         * @member ns.base
         * @public
         */
        isFunction: function(value) {
            return (typeof value === 'function');
        },

        /**
         * Returns true or false based on whether the parameter is object or not.
         * @method isObject
         * @param {Number} value
         * @return {Boolean}
         * @member ns.base
         * @public
         */
        isObject: function(value) {
            return (value instanceof Object);
        },

        /**
         * Returns true or false based on whether the parameter is array or not.
         * @method isArray
         * @param {Number} value
         * @return {Boolean}
         * @member ns.base
         * @public
         */
        isArray: function(value) {
            return (value instanceof Array);
        },

        // TODO: deprecated - use ns.$
        selector: function(str) {
            var s = str.slice(0, 1),
                c = str.slice(1), result;

            if(s === '.') {
                result = document.getElementsByClassName(c);
            } else if(s === '#') {
                result = document.getElementById(c);
            }
            return result;
        }
    };

    base.WeakMap = function() {
        // private references holders
        this.keys = [];
        this.values = [];
        this.i = 0;
    };

    // WeakMap#delete(key:void*):void
    base.WeakMap.prototype.del = function(key) {
        if (this.has(key)) {
            this.keys.splice(this.i, 1);
            this.values.splice(this.i, 1);
        }
        return -1 < this.i;
    };

    base.WeakMap.prototype.get = function(key, d3fault) {
        return this.has(key) ? this.values[this.i] : d3fault;
    };

    base.WeakMap.prototype.has = function(key) {
        if (key !== Object(key))
            throw new TypeError("not a non-null object");
        this.i = Array.prototype.indexOf.call(this.keys, key);
        return -1 < this.i;
    };

    base.WeakMap.prototype.set = function(key, value) {
        this.has(key) ? this.values[this.i] = value : this.values[this.keys.push(key) - 1] = value;
    };

    base.WeakMap.prototype.getKey = function() {
        return this.keys;
    };

    var initializing = false, fnTest = /xyz/.test(function() {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    base.Class = function() {
    };

    // Create a new Class that inherits from this class
    base.Class.extend = function(prop) {
        var _super = this.prototype;
        var _static = prop.static;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {
            if (name !== 'static') {
                // Check if we're overwriting an existing function
                prototype[name] = typeof prop[name] == "function" &&
                    typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                    (function(name, fn) {
                        return function() {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we're done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                    })(name, prop[name]) :
                    prop[name];
            }

        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this._init)
                return this._init.apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        if (_static) {
            for (var p in _static) {
                if (_static.hasOwnProperty(p)) {
                    Class[p] = _static[p];
                }
            }
        }

        return Class;
    };

    ns.base = base;

})(window, ns);








(function(window, ns) {
    'use strict';

    var Ticker = ns.base.Class.extend({
        _init: function() {

            this.now = ns.getTime;
            this._frameId = null; // requeatAnimatoinFrame ID

            this.animators = [];
            this.animatorIdx = 0;
        },

        /**
         * On requestAnimationFrame with tick.
         * @method tickOn
         * @member ns.Ticker
         * @private
         */
        tickOn: function() {
            var self = this;

            (function loop() {
                self._frameId = window.requestAnimationFrame(loop);
                var i,
                    time = ns.getTime();

                for(i = 0; i < self.animatorIdx; i++) {
                    self.animators[i].tick(time);
                }
            })();
        },

        /**
         * Off requestAnimationFrame by cancelAnimationFrame.
         * @method tickOn
         * @member ns.Ticker
         * @private
         */
        tickOff: function() {
            if(this._frameId) {
                window.cancelAnimationFrame(this._frameId);
                this._frameId = null;
            }
        },

        /**
         * Triggers Ticker's status by on
         * @event __on
         * @member ns.Ticker
         * @private
         */
        __on : function(e) {
            if(this.animators.indexOf(e) < 0) {  // TODO : change map ?
                //this.animators.push(e);
                this.animators[this.animatorIdx] = e;
                this.animatorIdx++;

                if(this._frameId === null) {
                    this.tickOn();
                }
            }
        },

        /**
         * Triggers Ticker's status by off
         * @event __off
         * @member ns.Ticker
         * @private
         */
        __off : function(e) {
            var idx = this.animators.indexOf(e);
            if(idx >= 0) {

                this.animators.splice(idx, 1);
                this.animatorIdx--;

                if(this.animatorIdx === 0) {
                    this.tickOff();
                }
            }
        }
    });

    /*
    * Ticks with requestAnimationFrame
    */
    ns.Ticker = ns.base.singleTon(Ticker);
})(window, ns);

(function(window, ns) {
    'use strict';      // jshint ignore:line

    var p;
    function Ease() {
        this.regExpCubicBezier = /cubic-bezier\s*\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/;
    }

    function cubicBezier(x1, y1, x2, y2) {
        return function(t) {
            var rp = 1 - t, rp3 = 3 * rp, p2 = t * t, p3 = p2 * t, a1 = rp3 * t * rp, a2 = rp3 * p2;
            return a1 * y1 + a2 * y2 + p3;
        };
    }

    function calcBounceOut(t) {
        if (t < 1 / 2.75) {
            return (7.5625 * t * t);
        } else if (t < 2 / 2.75) {
            return (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
        } else if (t < 2.5 / 2.75) {
            return (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
        } else {
            return (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
        }
    }

    p = Ease.prototype;
    p.ease = cubicBezier(0.25, 0.1, 0.25, 1);

    p.easeOut = cubicBezier(0, 0, 0.58, 1);

    p.easeInOut = cubicBezier(0.42, 0, 0.58, 1);

    p.easeIn = cubicBezier(0.42, 0, 1, 1);

    p.sineIn = cubicBezier(0.47, 0, 0.745, 0.715);

    p.sineOut = cubicBezier(0.39, 0.575, 0.565, 1);

    p.sineInOut = cubicBezier(0.445, 0.05, 0.55, 0.95);

    p.expoIn = cubicBezier(0.95, 0.05, 0.795, 0.035);

    p.expoOut = cubicBezier(0.19, 1, 0.22, 1);

    p.expoInOut = cubicBezier(1, 0, 0, 1);

    p.circIn = cubicBezier(0.6, 0.04, 0.98, 0.335);

    p.circOut = cubicBezier(0.075, 0.82, 0.165, 1);

    p.circInOut = cubicBezier(0.785, 0.135, 0.15, 0.86);

    p.backIn = cubicBezier(0.6, -0.28, 0.735, 0.045);

    p.backOut = cubicBezier(0.175, 0.885, 0.32, 1.275);

    p.backInOut = cubicBezier(0.68, -0.55, 0.265, 1.55);

    p.zoomInDown = cubicBezier(0.55, 0.055, 0.675, 0.19);

    p.bounce1 = cubicBezier(0.215, 0.610, 0.355, 1.000);
    p.bounce2 = cubicBezier(0.755, 0.050, 0.855, 0.060);

    // http://gizma.com/easing/
    p.linear = function(t) {
        return t;
    };

    p.cubicIn = function(t) {
        return t * t * t;
    };

    p.cubicOut = function(t) {
        return (--t) * t * t + 1;
    };

    p.cubicInOut = function(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    p.quadIn = function(t) {
        return t * t;
    };

    p.quadOut = function(t) {
        return t * (2 - t);
    };

    p.quadInOut = function(t) {
        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    p.quartIn = function(t) {
        return t * t * t * t;
    };

    p.quartOut = function(t) {
        return  1 - (--t) * t * t * t;
    };

    p.quartInOut = function(t) {
        return t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    };

    p.quintIn = function(t) {
        return  t * t * t * t * t;
    };

    p.quintOut = function(t) {
        return  1 + (--t) * t * t * t * t;
    };

    p.quintInOut = function(t) {
        return  t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    };

    p.bounceOut = function(t) {
        return calcBounceOut(t);
    };

    p.bounceIn = function(t) {
        return 1 - Ease.prototype.bounceOut(1 - t);
    };

    p.bounceInOut = function(t) {
        if (t < 0.5) {
            return Ease.prototype.bounceIn(t * 2) * 0.5;
        }
        return Ease.prototype.bounceOut(t * 2 - 1) * 0.5 + 0.5;
    };

    var pi2 = Math.PI * 2;
    var defaultS = 0.3 / pi2 * Math.asin(1);

    p.elasticIn = function(t) {
        if (t === 0 || t === 1) {
            return t;
        }
        return -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - defaultS) * pi2 / 0.3));
    };

    p.elasticOut = function(t) {
        if (t === 0 || t === 1) {
            return t;
        }
        return (Math.pow(2, -10 * t) * Math.sin((t - defaultS) * pi2 / 0.3) + 1);
    };

    p.elasticInOut = function(t) {
        if ((t *= 2) < 1) {
            return -0.5 * (Math.pow(2, 10 * (t -= 1)) * Math.sin((t - defaultS) * pi2 / 0.3));
        }
        return Math.pow(2, -10 * (t -= 1)) * Math.sin((t - defaultS) * pi2 / 0.3) * 0.5 + 1;
    };
    /*
     * Provides ease functions
     */
    ns.Ease = ns.base.singleTon(Ease);
})(window, ns);
/*
 * # Tween Animator
 *
 * Provides Tween and animate javascript properties.
 *
 * @example
 * var box = document.getElementById('box');
 * var tween = new ns.Tween({width: 100, height:100}, {width: 200, height: 250}, {
 *                          duration: 1000,
 *                          onUpdate: function() {
 *                              box.style.width = this.width + 'px';
 *                              box.style.height = this.height + 'px';
 *                          }
 *                      });
 * tween.play()
 *
 * @class ns.TweenAnimator
 */
(function(window, ns) {
    'use strict';

    var Ticker = ns.Ticker.getInstance(),
        Ease = ns.Ease.getInstance(),
    // enum
        STATE = {
            STOP: 'stop',
            PAUSE: 'pause',
            RUN: 'running'
        },
        DIRECTION = {
            FORWARD: true,
            REVERSE: false
        };

    var createTweens = function() {
        var idx = 0,
            length = 0,
            tweens = [];

        return {
            add: function(tween) {
                tweens[length] = tween;
                length++;
            },

            next: function() {

                if (idx < length) {
                    idx++;
                    return tweens[idx - 1];
                } else {
                    return false;
                }
            },

            cur: function() {
                return idx;
            },

            rewind: function() {
                idx = 0;
            },

            get: function(i) {
                return (i === undefined ? tweens : tweens[i]);
            },

            length: function() {
                return length;
            },

            hasNext: function() {
                return idx < length;
            },

            clear: function() {
                if (length !== 0 && idx <= length) {
                    tweens.splice(0, idx)
                }
                idx = 0;
                length = tweens.length;
            },

            allClear: function() {
                tweens = [];
                idx = length = 0;
            }

        }
    };

    var createEvent = function() {
        var listeners = [],
            length = 0;

        return {
            on: function(f) {
                listeners[length] = f;
                length++;
            },

            onFront: function(f) {
                listeners.unshift(f);
                length++;
            },

            emit: function() {
                for (var i = 0; i < length; i++) {
                    listeners[i].apply(null, arguments);
                }
            },

            remove: function(f) {
                for (var i = 0; i < length; i++) {
                    if (listeners[i] === f) {
                        listeners[i].splice(i, 1);
                        length--;
                    }
                }
            },

            getLength: function() {
                return length;
            },

            removeAll: function() {
                listeners = [];
                length = 0;
            }
        }
    };

    var TweenAnimator = ns.base.Class.extend({
        _init: function(fromTo, option) {

            this.tweenQueue = createTweens();
            this.tweenInfo = null;

            // state
            this._direction = DIRECTION.FORWARD;
            this._state = STATE.STOP;
            this._isTick = false;
            this.isTweenInfo = false;

            fromTo && this.add(fromTo, option);

            // time value
            this._startTime = this._lastTime = this._playTime = this._previousTime = 0;
            this._totalTime = this._duration + this._delay;
            //this._progress = 0;

            // check to change direction
            this._changedDirection = false;

            // tween queue cache
            this._isCache = false;  // don't save tween object
        },

        /**
         * Called by Ticker every frame
         * @method tick
         * @param {number} tick time
         * @member ns.TweenAnimator
         * @private
         */
        tick: function(delta) {

            if (this._state === STATE.RUN) {
                var now = delta,
                    runTime = now - this._playTime;

                this._previousTime = now;

                if (runTime < 0) {
                    return;
                } else if (runTime <= this._duration) {
                    this.tweenInfo.progress = runTime / (this._duration || 1);

                    this._update();
                } else {

                    if (this.tweenInfo.progress !== 1) {
                        this.tweenInfo.progress = 1;
                        this._update();
                    }
                    if (now >= this._lastTime) {
                        this._complete();
                    }
                }
            }
        },

        /**
         * Start tween animation
         * @method play
         * @member ns.TweenAnimator
         * @public
         */
        play: function() {
            if (this._state === STATE.RUN) {
                return;
            }

            if (this._state === STATE.PAUSE) {
                if (this._direction !== DIRECTION.FORWARD) {
                    this._direction = DIRECTION.FORWARD;
                    this._changedDirection = true;
                }
                this.resume();

            } else {
                this._direction = DIRECTION.FORWARD;
                this._play();
            }
        },

        /**
         * Start tween animation to the reverse direction.
         * @method reverse
         * @member ns.TweenAnimator
         * @public
         */
        reverse: function() {
            if (this._state === STATE.RUN) {
                return;
            }

            if (this._state === STATE.PAUSE) {
                if (this._direction !== DIRECTION.REVERSE) {
                    this._direction = DIRECTION.REVERSE;
                    this._changedDirection = true;
                }
                this.resume();

            } else {
                this._direction = DIRECTION.REVERSE;
                this._play();
            }
        },

        /**
         * Stop tween animation.
         * @method stop
         * @member ns.TweenAnimator
         * @public
         */
        stop: function() {
            if (this._state !== STATE.STOP) {
                this._stopTween();
                this.tweenQueue.allClear();
                // TODO : call complete callback?
            }
        },

        /**
         * Pause tween animation.
         * @method pause
         * @member ns.TweenAnimator
         * @public
         */
        pause: function() {
            if (this._state === STATE.RUN) {
                this._state = STATE.PAUSE;
            }

        },

        /**
         * Resume tween animation if it is paused.
         * @method resume
         * @param {string} direction
         * @member ns.TweenAnimator
         * @public
         */
        resume: function(direction) {
            var cur = ns.getTime();

            if (this._state === STATE.PAUSE) {

                if (this._changedDirection || (direction !== undefined && direction !== this._direction)) {
                    if (direction !== undefined) {
                        this._direction = direction;
                    }
                    this._lastTime = cur + this._previousTime - this._playTime;
                    this._playTime = this._lastTime - this._duration;
                    this._startTime = this._playTime - this._delay;

                    this._changedDirection = false;
                } else {
                    var elapsedTime = cur - this._previousTime;
                    this._startTime += elapsedTime;
                    this._playTime += elapsedTime;
                    this._lastTime += elapsedTime;
                }

                this._state = STATE.RUN;
            }

        },

        /**
         * Jump to a specific time
         * @method seek
         * @param {number} specific time
         * @member ns.TweenAnimator
         * @public
         */
        seek: function(n) {
            var seekTime = n * this._totalTime - this._delay;
            if (seekTime >= 0) {
                this._update(seekTime / this._duration);
            }
        },

        /**
         * Get value of seek time
         * @method getSeek
         * @param {number} seek time
         * @return {number} value
         * @member ns.TweenAnimator
         * @private
         */
        getSeek: function(p, type) {
            var i, name, l, p,
                n = this.tweenInfo.name,
                t = this.tweenInfo.to,
                f = this.tweenInfo.from;

            if (type) {
                p = p * this._totalTime - this._delay
            }

            for (i = 0; name = n[i]; i++) {

                if (this.cur[name] && (l = this.cur[name].length)) {
                    (this.cur[name] === undefined) && (this.cur[name] = []);
                    this._calculateTween(this.cur[name], t[name], f[name], p);

                } else {
                    this.cur[name] = (t[name] - f[name]) * this._ease(p) + f[name];
                }

            }

            return this.cur;
        },

        /**
         * Set start time of tween
         * @method setStartTime
         * @param {number} start time
         * @member ns.TweenAnimator
         * @private
         */
        setStartTime: function(time) {
            this._startTime = time;
            //this._playTime = this._startTime + (this._direction ? this._delay : 0);
            //this._lastTime = this._playTime + this._duration + (this._direction ? 0 : this._delay);
        },

        /**
         * Replay tween animation
         * @method replay
         * @member ns.TweenAnimator
         * @private
         */
        replay: function() {
            this._update(0);
            this._start();
        },

        /**
         * Set duration of tween
         * @method duration
         * @param {number}
         * @member ns.TweenAnimator
         * @private
         */
        duration: function(n) {
            this._duration = ns.base.isNumber(n) ? n : 1000;
        },

        /**
         * Set delay of tween
         * @method delay
         * @param {number}
         * @member ns.TweenAnimator
         * @private
         */
        delay: function(n) {
            this._delay = ns.base.isNumber(n) ? n : 0;
        },

        /**
         * Set ease of tween
         * @method ease
         * @param {string}
         * @member ns.TweenAnimator
         * @private
         */
        ease: function(f) {
            this._ease = ns.base.isFunction(Ease[f]) ? Ease[f] : Ease.linear;
        },

        /**
         * Set loop of tween
         * @method loop
         * @param {number}
         * @member ns.TweenAnimator
         * @private
         */
        loop: function(n) {
            this._loop = ns.base.isNumber(n) ? n : 1;
        },

        /**
         * Add tween object
         * @method add
         * @param {object} fromTo from and to value object
         * @param {object} option value object including duration, delay, ease ans so on.
         * @member ns.TweenAnimator
         * @public
         */
        add: function(fromTo, option) {
            var tween;

            if (option === undefined) {
                tween = fromTo;
                tween.startCallback = createEvent();
                tween.completeCallback = createEvent();
                tween.progress = 0;
            } else {
                tween = {
                    fromTo: {},
                    name: [],
                    progress: 0,
                    startCallback: createEvent(),
                    completeCallback: createEvent()
                };

                tween.option = option;
            }

            tween.option.onStart && tween.startCallback.on(tween.option.onStart);
            tween.option.onComplete && tween.completeCallback.on(tween.option.onComplete);

            this.tweenQueue.add(tween);

            if (this.tweenQueue.length() === 1) {
                this.tweenQueue.next();
                this.initTween(tween);
                this.isTweenInfo = true;
            }

            return tween;
        },

        /**
         * Shift to next tween object.
         * @method nextTween
         * @return {object | boolean} tween object or false if not.
         * @member ns.TweenAnimator
         * @private
         */

        setRender: function(f) {
            this.render = f;
        },

        setUpdateTarget: function(target) {
            this.cur = target;
        },

        getState: function() {
            return this._state;
        },

        getCurrentTweenInfo: function() {
            return this.tweenInfo;
        },

        nextTweenInfo: function() {
            return this.tweenQueue.next();
        },

        getLastTweenInfo: function() {
            return this.tweenQueue.get(this.tweenQueue.length() - 1);
        },

        getFirstTweenInfo: function() {
            return this.tweenQueue.get(0);
        },
        /**
         * Initialize cur tween object.
         * @method initTween
         * @param {object} tweenInfo object
         * @member ns.TweenAnimator
         * @private
         */
        initTween: function(tweenInfo) {
            var option = tweenInfo.option;

            this.tweenInfo = tweenInfo;
            this.cur = (this.cur !== undefined) ? this.cur : (option._cur !== undefined) ? option._cur : {};

            this.option = option;

            // user event
            this._onUpdate = option.onUpdate;  // only one update callback exists because it affect performance.

            // tween option value
            if (ns.base.isObject(option)) {
                this.duration(option.duration);
                this.ease(option.ease);
                this.delay(option.delay);
                this.loop(option.loop);

                this._reverseDelay = option.reverseDelay || 0;

            } else {
                this._duration = 1000;
                this._delay = 0;
                this._loop = 1;
                this._ease = Ease.linear;
                this._reverseDelay = 0;
            }
            this._loopCnt = this._loop;

        },

        tweenQueueCache: function(flag) {
            (typeof flag === 'boolean') && (this._isCache = flag);
        },

        /**
         * If state is stop, start tween. or If it is pause, resume tween.
         * @method _play
         * @member ns.TweenAnimator
         * @private
         */
        _play: function() {
            if (this._state === STATE.PAUSE) {
                this.resume();
            } else if (this._state === STATE.STOP) {
                this._start();
            }
        },

        /**
         * Calculate start, play and last time. And start tick.
         * @method _start
         * @member ns.TweenAnimator
         * @private
         */
        _start: function() {
            this._state = STATE.RUN;

            this._startTime = this._startTime || ns.getTime();
            this._playTime = this._startTime + (this._direction ? this._delay : 0);
            this._lastTime = this._playTime + this._duration + (this._direction ? 0 : this._delay) + this._reverseDelay;

            //this._onStart && this._onStart();
            this.tweenInfo.startCallback.emit();

            if (!this._isTick) {
                Ticker.__on(this);
                this._isTick = true;
            }
        },

        /**
         * Update tween value every frame.
         * @method _update
         * @param {number} progress
         * @member ns.TweenAnimator
         * @private
         */
        _update: function(e) {
            var i, name, l,
                n = this.tweenInfo.name,
                ft = this.tweenInfo.fromTo;

            this.tweenInfo.progress = (e !== undefined) ?
                e : (this._direction === DIRECTION.REVERSE ? 1 - this.tweenInfo.progress : this.tweenInfo.progress);

            // render
            for (i = 0; name = n[i]; i++) {
                if (ft[name][0] && (l = ft[name][0].length)) {
                    (this.cur[name] === undefined) && (this.cur[name] = []);
                    this._calculateTween(this.cur[name], ft[name][0], ft[name][1]);

                } else {
                    this.cur[name] = (ft[name][1] - ft[name][0]) * this._ease(this.tweenInfo.progress) + ft[name][0];
                }
            }

            this.render && this.render.call(this.cur, this.tweenInfo);
            this._onUpdate && this._onUpdate.call(this.cur, this.tweenInfo);
        },

        /**
         * Calculate tween value.
         * @method _calculateTween
         * @param {number} current value
         * @param {number} from value
         * @param {number} to value
         * @param {number} progress
         * @member ns.TweenAnimator
         * @private
         */
        _calculateTween: function(c, f, t, p) {
            var i, l;
            (p === undefined) && (p = this.tweenInfo.progress);

            for (i = 0, l = t.length; i < l; i++) {
                if (typeof t[i] === 'number') {
                    c[i] = (t[i] - f[i]) * this._ease(p) + f[i];
                } else if (typeof t[i] === 'string') {
                    c[i] = t[i];
                } else {
                    (c[i] === undefined) && (c[i] = []);
                    this._calculateTween(c[i], f[i], t[i]);
                }
            }
        },

        /**
         * If tween completed, call this function.
         * @method _complete
         * @member ns.TweenAnimator
         * @private
         */
        _complete: function() {
            var nextTween;
            this.setStartTime(null);
            this.isTweenInfo = false;
            this.tweenInfo.completeCallback.emit();

            // loop check
            if (--this._loopCnt > 0) {
                this.replay();
            } else {
                // search next tweenInfo
                if (!this.isTweenInfo && (nextTween = this.tweenQueue.next())) {
                    this.initTween(nextTween);

                    if (!this._isCache) {
                        this.tweenQueue.clear();
                    }

                    this._start();
                } else {
                    if (this.isTweenInfo) {
                        this._start();
                    } else {
                        // finish tween
                        this._stopTween();

                        if (this.option._stackTweensFlag) {
                            this.tweenQueue.rewind();
                            nextTween = this.tweenQueue.next();
                            this.initTween(nextTween);
                        } else {
                            this.tweenQueue.allClear();
                        }
                    }

                }
            }

        },

        /**
         * Stop tween object and stop tick.
         * @method _stopTween
         * @member ns.TweenAnimator
         * @private
         */
        _stopTween: function() {
            this._state = STATE.STOP;
            this._startTime = null;
            Ticker.__off(this);
            this._isTick = false;
        }

    });

    ns.TweenAnimator = ns.Tween = TweenAnimator;
})(window, ns);
(function(window, ns, base) {
    'use strict';

    var Transform = ns.base.Class.extend({
        _init: function() {
            this.init();
        },

        /**
         * Initialize transform values
         * @method init
         * @member ns.Transform.init
         * @private
         */
        init: function() {
            this.translateX = 0;
            this.translateY = 0;
            this.translateZ = 0;

            this.rotateX = 0;
            this.rotateY = 0;
            this.rotateZ = 0;

            this.skewX = 0;
            this.skewY = 0;

            this.scaleX = 1;
            this.scaleY = 1;
        },

        /**
         * Copy transform values
         * @method copy
         * @param {object} source transform value
         * @member ns.Transform.copy
         * @private
         */
        copy: function(t) {
            this.translateX = t.translateX;
            this.translateY = t.translateY;
            this.translateZ = t.translateZ;

            this.rotateX = t.rotateX;
            this.rotateY = t.rotateY;
            this.rotateZ = t.rotateZ;

            this.skewX = t.skewX;
            this.skewY = t.skewY;

            this.scaleX = t.scaleX;
            this.scaleY = t.scaleY;
        },

        /**
         * Set transform array values
         * @method set
         * @param {array} source transform array value
         * @member ns.Transform.set
         * @private
         */
        set: function(t) {
            if(t instanceof Array) {
                // translate, rotate, scale, skew
                this.translateX = base.isNumber(t[0]) ? t[0] : 0;
                this.translateY = base.isNumber(t[1]) ? t[1] : 0;
                this.translateZ = base.isNumber(t[2]) ? t[2] : 0;

                this.rotateX = base.isNumber(t[3]) ? t[3] : 0;
                this.rotateY = base.isNumber(t[4]) ? t[4] : 0;
                this.rotateZ = base.isNumber(t[5]) ? t[5] : 0;

                this.scaleX = base.isNumber(t[6]) ? t[6] : 1;
                this.scaleY = base.isNumber(t[7]) ? t[7] : 1;

                this.skewX = base.isNumber(t[8]) ? t[8] : 0;
                this.skewY = base.isNumber(t[9]) ? t[9] : 0;
            }
        }
    });

    /*
     * Sets or Initialize webkitTransform property
     */
    ns.Transform = Transform;

})(window, ns, ns.base);

(function(window, ns, base) {
    'use strict';

    var colorTable = {
        aqua: new Uint8Array([0, 255, 255]),
        lime: new Uint8Array([0, 255, 0]),
        silver: new Uint8Array([192, 192, 192]),
        black: new Uint8Array([0, 0, 0]),
        maroon: new Uint8Array([128, 0, 0]),
        teal: new Uint8Array([0, 128, 128]),
        blue: new Uint8Array([0, 0, 255]),
        navy: new Uint8Array([0, 0, 128]),
        white: new Uint8Array([255, 255, 255]),
        fuchsia: new Uint8Array([255, 0, 255]),
        olive: new Uint8Array([128, 128, 0]),
        yellow: new Uint8Array([255, 255, 0]),
        orange: new Uint8Array([255, 165, 0]),
        gray: new Uint8Array([128, 128, 128]),
        purple: new Uint8Array([128, 0, 128]),
        green: new Uint8Array([0, 128, 0]),
        red: new Uint8Array([255, 0, 0]),
        pink: new Uint8Array([255, 192, 203]),
        cyan: new Uint8Array([0, 255, 255]),
        transparent: new Uint8Array([255, 255, 255, 0])
    };

    var CSSPropertyParser = base.Class.extend({

        _init: function() {
            var self = this;

            // px & unit
            var pxType = ['borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
                'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'width', 'height', 'top', 'left',
                'clipTop', 'clipBottom', 'clipRight', 'clipLeft',
                'fontSize', 'lineHeight'];
            pxType.forEach(function(type) {
                self[type] = self._unit.bind(self);
            });

            var backgroundType = ['backgroundPosition', 'backgroundSize'];
            backgroundType.forEach(function(type) {
                self[type] = self._arrayUnit.bind(self);

            });

            // border
            var borderType = ['border', 'borderTop', 'borderRight', 'borderLeft', 'borderBottom'];
            borderType.forEach(function(type) {
                self[type] = function _border(str) {
                    var result = {}, temp;

                    temp = self._blank(str);

                    result[type + 'Width'] = temp[0];
                    result[type + 'Style'] = temp[1] === 'none' ? 'solid' : temp[1];   // TODO: 유효성 체크
                    result[type + 'Color'] = temp[2];

                    return result;
                };
            });

            // color
            var colorType = ['backgroundColor', 'color',
                'borderColor', 'borderTopColor', 'borderRightColor', 'borderLeftColor', 'borderBottomColor'];

            colorType.forEach(function(type) {
                self[type] = self._color;
            });

            //margin & padding
            var blankType = ['margin', 'padding'];
            blankType.forEach(function(type) {
                self[type] = function _blank(str) {
                    var temp = self._blank(str), result = {};

                    if (temp.length === 4) {
                        result[type + 'Top'] = temp[0];
                        result[type + 'Right'] = temp[1];
                        result[type + 'Bottom'] = temp[2];
                        result[type + 'Left'] = temp[3];
                    } else if (temp.length === 3) {
                        result[type + 'Top'] = temp[0];
                        result[type + 'Right'] = temp[1];
                        result[type + 'Bottom'] = temp[2];
                        result[type + 'Left'] = temp[1];
                    } else if (temp.length === 2) {
                        result[type + 'Top'] = temp[0];
                        result[type + 'Right'] = temp[1];
                        result[type + 'Bottom'] = temp[0];
                        result[type + 'Left'] = temp[1];
                    } else if (temp.length === 1) {
                        result[type + 'Top'] = temp[0];
                        result[type + 'Right'] = temp[0];
                        result[type + 'Bottom'] = temp[0];
                        result[type + 'Left'] = temp[0];
                    }

                    return result;
                }
            });

            //var unitWithString = ['lineHeight', 'fontSize'];
            //unitWithString.forEach(function(type){
            //    self[type] = function _unitString(str){
            //        var result;
            //
            //        result = self._unit(str);
            //
            //        if(isNaN(result.value)) {
            //            result = str;
            //        }
            //
            //        return result;
            //    }
            //});

            var shadowType = ['boxShadow', 'textShadow'];
            shadowType.forEach(function(type) {
                self[type] = function _shadowString(str) {

                    var i, j, length, string, result = [], color, rgbArray = [], len, rgbIdx = 0,
                        rgbExp = /rgb\([0-9]+[\, |\s]+[0-9]+[\, |\s]+[0-9]+\)/g, shadowLength;

                    rgbArray = str.match(rgbExp) || [];
                    str = str.replace(rgbExp, 'rgb');

                    str = str.split(',');

                    for (i = 0, length = str.length; i < length; i++) {


                        if (str[i].match('rgb') && rgbArray[rgbIdx]) {
                            str[i] = str[i].replace('rgb', rgbArray[rgbIdx]);
                            rgbIdx++;
                        }


                        str[i] = self._blank(str[i]);
                        shadowLength = str[i].length - 1;
                        // search color

                        if ((color = self._color(str[i][0]))) {
                            str[i].splice(0, 1);
                            str[i].push(color);
                        } else {
                            color = self._color(str[i][shadowLength]);
                        }

                        for (j = 0; j < shadowLength; j++) {
                            str[i][j] = self._unit(str[i][j]);
                        }
                        str[i][j] = color;
                    }


                    return str;
                }
            });

        },

        opacity: function(v) {
            return parseFloat(v);
        },

        clip: function(v) {
            var text = v.replace(/\(|\)|,/g, ' ').trim().split(/\s+/g);

            var result = [];
            result[0] = text[0];

            for (var i = 1; i <= 4; i++) {
                result[i] = this._unit(text[i]);
            }
            return result;
        },

        webkitClipPath: function(v) {
            var result = [], i, len,
                text = v.replace(/\(|\)|,/g, ' ').trim().split(/\s+/g);

            result.push(text[0]);
            for (i = 1, len = text.length; i < len; i++) {
                result.push(this._unit(text[i]));
            }

            return result;
        },

        backgroundImage: function(v) {
            return v.replace(/url\(|\)$/ig, "");
        },

        _arrayUnit: function(v) {
            var i, l, result = v.trim().split(' ');

            for (i = 0, l = result.length; i < l; i++) {
                result[i] = this._unit(result[i]);
            }
            return result;
        },

        _unit: function(str) {
            if (typeof str === 'string') {
                return {
                    number: this._getFloat(str),
                    unit: (this._getChar(str) || 'px')
                }
            } else {
                return {
                    number: str,
                    unit: 'px'
                };
            }
        },

        _color: function(colorValue) {
            //console.log(colorValue);
            var first, second, third, rgb, length, i, string, result;
            if (colorValue === undefined || colorValue === null) {
                console.log('invalid color');
                return false;
            }

            if (colorTable[colorValue]) {                //for string color value such as 'red'
                result = colorTable[colorValue];
            } else if (colorValue instanceof Array || colorValue instanceof Uint8Array) {
                result = new Uint8Array(colorValue);
            } else {
                string = colorValue.toLowerCase();
                string = string.trim();
                if (string.charAt(0) === 'r' && string.charAt(1) === 'g' && string.charAt(2) === 'b') {
                    if (string.charAt(3) === 'a') {
                        rgb = string.replace(/rgba\(/g, '').replace(/\)/g, '').replace(/(\s*)/g, '').replace(/\,/g, ' ').split(' ');
                        for (i = 0, length = rgb.length - 1; i < length; i++) {
                            rgb[i] = parseInt(rgb[i]);
                        }
                        rgb[length] = parseFloat(rgb[length]);
                    } else {
                        rgb = string.replace(/rgb\(/g, '').replace(/\)/g, '').replace(/(\s*)/g, '').replace(/\,/g, ' ').split(' ');
                        for (i = 0, length = rgb.length; i < length; i++) {
                            rgb[i] = parseInt(rgb[i]);
                        }
                    }
                    result = new Uint8Array(rgb);

                } else if (string.charAt(0) === '#') {        //for '#XXX' or '#XXXXXX'
                    if (string.length === 4) {
                        first = string.charAt(1);
                        second = string.charAt(2);
                        third = string.charAt(3);
                        string = "#" + first + first + second + second + third + third;
                    }

                    string = parseInt(string.substr(1), 16);  // remove '#'
                    result = new Uint8Array(3);
                    result.setValue(string >> 16, (string >> 8) & 255, string & 255);
                } else {
                    return false;
//                    console.log(colorValue);
                }
            }
            return result;
        },

        _getChar: function(arg) {
            var charArr = arg.match(/[^0-9.-]/g);
            var string = '';

            if (charArr !== null) {
                string = charArr.join('');
            }

            string.replace(/\, /g, '');

            return string;
        },

        _getNum: function(arg) {
            return parseInt(arg.match(/^[-]?\d+/g), 10);
        },

        _getFloat: function(arg) {
            return parseFloat(arg.match(/^[+-]?\d*(\.?\d*)/g));
        },

        _blank: function(str) {
            return str.trim().replace(/\, /g, ',').split(' ');
        }
    });

    /*
     * Parses css properties.
     */
    ns.CSSPropertyParser = base.singleTon(CSSPropertyParser);

})(window, ns, ns.base);
(function(window, ns, base) {
    'use strict';

    var CssStringCreator = base.Class.extend({

        _init: function() {
            this.createColor();
            this.createBorderStyle();
            this.createBlankFunction();
            this.createUnit();
            //this.createUnitWithString();
            this.createShadow();
        },


        opacity: function(value) {
            return value.opacity;
        },

        WebkitTransform: function(value) {
            var string = '';
            string += value.perspective ? ('perspective(' + value.perspective + 'px) ') : '';
            string += 'translate3d(' + value.translateX + 'px, ' + value.translateY + 'px, ' + value.translateZ + 'px) ';

            string += value.rotateX ? ('rotateX(' + value.rotateX + 'deg) ') : '';
            string += value.rotateY ? ('rotateY(' + value.rotateY + 'deg) ') : '';
            string += value.rotateZ ? ('rotateZ(' + value.rotateZ + 'deg) ') : '';

            string += (value.scaleX !== 1) ? ('scaleX(' + value.scaleX + ') ') : '';
            string += (value.scaleY !== 1) ? ('scaleY(' + value.scaleY + ') ') : '';

            string += value.skewX ? ('skewX(' + value.skewX + 'deg) ') : '';
            string += value.skewY ? ('skewY(' + value.skewY + 'deg) ') : '';

            return string;
        },

        createUnit: function() {
            var self = this,
                type = ['width', 'height', 'top', 'left'],
                backgroundType = ['backgroundPosition', 'backgroundSize'];

            function _unit(v, u) {
                if (u[this] === 'px') {
                    return Math.round(v[this]) + u[this];
                }
                return v[this] + u[this];
            }

            type.forEach(function(f) {
                self[f] = _unit.bind(f)
            });

            backgroundType.forEach(function(f) {
                self[f] = _background.bind(f)
            });

            function _background(v, u) {
                return v[this][0] + u[this][0] + ' ' + v[this][1] + u[this][1];
            }
        },

        createColor: function() {
            var self = this;
            var type = ['borderColor', 'borderTopColor', 'borderRightColor', 'borderLeftColor', 'borderBottomColor',
                'backgroundColor', 'color'];
            type.forEach(function(f) {
                self[f] = self._rgbColor(f);
            });
        },

        createBorderStyle: function() {
            var self = this;

            var borderType = ['border', 'borderTop', 'borderRight', 'borderLeft', 'borderBottom'];
            var borderWidthType = ['borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderLeftWidth', 'borderBottomWidth'];
            var borderStyleType = ['borderStyle', 'borderTopStyle', 'borderRightStyle', 'borderLeftStyle', 'borderBottomStyle'];

            function _border(v, u) {

                var width = this + 'Width',
                    color = this + 'Color',
                    style = this + 'Style';
                //console.log(v[color]);
                return v[width] + u[width] + ' ' + u[style] + ' rgb(' +
                    v[color][0] + ', ' + v[color][1] + ', ' + v[color][2] + ')';
            }

            function _borderWidth(v, u) {
                return v[this].toFixed(2) + u[this];
            }

            borderType.forEach(function(f) {
                self[f] = _border.bind(f)
            });

            borderStyleType.forEach(function(f) {
                self[f] = self._direct(f);
            });

            borderWidthType.forEach(function(f) {
                self[f] = _borderWidth.bind(f)
            });
        },

        createBlankFunction: function() {
            var self = this;
            var blank = ['margin', 'padding'];
            var blankType = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft',
                'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
                'lineHeight', 'fontSize'];

            blank.forEach(function(f) {
                self[f] = _blank.bind(f)
            });

            function _blank(v, u) {
                var top = this + 'Top',
                    right = this + 'Right',
                    bottom = this + 'Bottom',
                    left = this + 'Left';
//                console.log(v[top], u[top]);
                return v[top] + u[top] + ' ' + v[right] + u[right] + ' ' + v[bottom] + u[bottom] + ' ' + v[left] + u[left];
            }

            blankType.forEach(function(f) {
                self[f] = _blanktype.bind(f);
            });

            function _blanktype(v, u) {
//                console.log(v[this], u[this]);
                return v[this] + u[this];
            }
        },

//        createUnitWithString: function(){
//            var self = this,
//                unitType = [];
//
//            unitType.forEach(function(f){
//                self[f] = _unit.bind(f)
//            });
//
//            function _unit(f) {
//                return f[this][0] + f[this][1];
//            }
//        },

        createShadow: function() {
            var self = this,
                shadowType = ['boxShadow', 'textShadow'];

            shadowType.forEach(function(name) {
                self[name] = function(v, u) {
                    var value = v[name], unit = u[name], i, j, shadowLen, len, str = '';
                    for (i = 0, shadowLen = value.length; i < shadowLen; i++) {

                        (i !== 0) && (str += ', ');

                        for (j = 0, len = value[i].length - 1; j < len; j++) {
                            str += value[i][j] + unit[i][j] + ' ';
                        }

                        str += 'rgb(' + value[i][j][0] + ',' + value[i][j][1] + ',' + value[i][j][2] + ') ';

                    }
                    //console.log(str);
                    return str;
                }
            });
        },

        //createShadow: function(){
        //    var self = this,
        //        shadowType = ['boxShadow', 'textShadow'];
        //
        //    shadowType.forEach(function(f){
        //        self[f] = _shadow.bind(f);
        //    });
        //
        //    function _shadow(v){
        //        var result = '', i = 0, j = 0, length = 0, len = 0;
        //        for(j = 0, length = v[this].length; j < length; j++){
        //            for(i = 0, len = v[this][j].length; i < len; i++) {
        //                if(v[this][j][i].length === 2) {
        //                    if(v[this][j][i][1] !== '') {
        //                        result += (v[this][j][i][0] + v[this][j][i][1] + ' ');
        //                    }
        //
        //                } else if(v[this][j][i].length === 3){
        //                    result += 'rgb(' + (v[this][j][i][0] + ',' + v[this][j][i][1] + ',' + v[this][j][i][2] + ')');
        //                } else if(v[this][j][i] === 'inset') {
        //                    result += ' inset';
        //                }
        //            }
        //            if( (length-1) > j){
        //                result += ', ';
        //            }
        //        }
        //        return result;
        //    }
        //},


        clip: function(v) {
            return v.clip[0] + '(' + v.clip[1][0] + v.clip[1][1] + ' ' + v.clip[2][0] + v.clip[2][1] +
                ' ' + v.clip[3][0] + v.clip[3][1] + ' ' + v.clip[4][0] + v.clip[4][1] + ')';

        },

//        clip: function(value, unit) {
//            var v = value.clip,
//                u = unit.clip;
//
//            return 'rect(' + v[0] + u[0]  + ' ' + v[1] + u[1] +
//                ' ' + v[2] + u[2] + ' ' + v[3] + u[3] + ')';
//
//        },

        webkitClipPath: function(value, unit) {
            var v = value.webkitClipPath,
                u = unit.webkitClipPath,
                s = unit.webkitClipPathStyle,
                i, l, style;

            if (s === 'circle') {
                // circle(0% at 50% 50%)
                return u[0] + '(' + v[0] + u[1] + ' at ' + v[1] + u[2] + ' ' + v[2] + u[3] + ')';
            } else if (s === 'polygon') {
                // 'polygon(0 0, 0% 100%, 100% 0)'
                style = s + '(';
                for (i = 0, l = v.length; i < l; i += 2) {
                    style += (v[i] + u[i] + ' ' + v[i + 1] + u[i + 1]);
                    style += (i + 1 !== l - 1) ? ', ' : ')';
                }
                return style;
            }
        },

        _direct: function(type) {
            return function(v) {
                return v[type];
            }
        },
        _rgbColor: function(type) {
            return function(v) {
                //console.log(' rgb(' + v[type][0] + ', ' + v[type][1] + ', ' + v[type][2] + ')');
                return 'rgb(' + v[type][0] + ', ' + v[type][1] + ', ' + v[type][2] + ')';
            }
        }
    });

    /*
     * Creates string based on CSS properties
     */
    ns.CssStringCreator = base.singleTon(CssStringCreator);

})(window, ns, ns.base);
(function(window, ns, base) {
    'use strict';

    var CssParser = ns.CSSPropertyParser.getInstance();

    var CssAnimationUtil = base.Class.extend({

        _init: function() {

            // width unit
            var self = this, color,
                widthUnit, heightUnit, background, marginPadding, border, shadow;

            color = ['backgroundColor', 'color',
                'borderColor', 'borderTopColor', 'borderRightColor', 'borderLeftColor', 'borderBottomColor'];

            color.forEach(function(name) {
                self[name] = function(animation) {
                    self.settingCssAnimation(name, animation, '_colorType');
                }
            });

            widthUnit = ['width', 'left', 'marginRight', 'marginLeft', 'paddingRight', 'paddingLeft',
                'marginTop', 'marginBottom', 'paddingBottom', 'paddingTop',
                'clipTop', 'clipBottom', 'clipRight', 'clipLeft',
                'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderLeftWidth', 'borderBottomWidth',
                'clipTop', 'clipBottom', 'clipRight', 'clipLeft'];
            widthUnit.forEach(function(name) {
                self[name] = function(animation) {
                    self.settingCssAnimation(name, animation, '_unitType', 'width');
                }
            });

            heightUnit = ['height', 'top'];
            heightUnit.forEach(function(name) {
                self[name] = function(animation) {
                    self.settingCssAnimation(name, animation, '_unitType', 'height');
                }
            });

            background = ['backgroundPosition', 'backgroundSize'];
            background.forEach(function(name) {
                self[name] = function(animation) {
                    self.settingCssAnimation(name, animation, '_backgroundType');
                }
            });

            marginPadding = ['margin', 'padding'];
            marginPadding.forEach(function(name) {
                self[name] = function(animation) {
                    var from, to, i;

                    if (animation.animationFromTo[name].length === 2) {
                        from = CssParser[name](animation.animationFromTo[name][0]);
                        to = CssParser[name](animation.animationFromTo[name][1]);

                        for (i in to) {
                            animation.animationFromTo[i] = [from[i], to[i]];
                            self[i](animation);
                        }

                    } else {
                        to = CssParser[name](animation.animationFromTo[name]);

                        for (i in to) {
                            animation.animationFromTo[i] = to[i];
                            self[i](animation);
                        }
                    }
                }
            });

            border = ['border', 'borderTop', 'borderRight', 'borderLeft', 'borderBottom'];
            border.forEach(function(name) {
                self[name] = function(animation) {
                    var from, to;

                    if (animation.animationFromTo[name].length === 2) {
                        from = CssParser[name](animation.animationFromTo[name][0]);
                        to = CssParser[name](animation.animationFromTo[name][1]);

                        animation.animationFromTo[name + 'Width'] = [from[name + 'Width'], to[name + 'Width']];
                        animation.animationFromTo[name + 'Color'] = [from[name + 'Color'], to[name + 'Color']];
                    } else {
                        to = CssParser[name](animation.animationFromTo[name]);

                        animation.animationFromTo[name + 'Width'] = to[name + 'Width'];
                        animation.animationFromTo[name + 'Color'] = to[name + 'Color'];
                    }

                    animation.unit[name + 'Style'] = to[name + 'Style'];

                    self[name + 'Width'](animation);
                    self[name + 'Color'](animation);
                }
            });

            border = ['border', 'borderTop', 'borderRight', 'borderLeft', 'borderBottom'];
            border.forEach(function(name) {
                self[name] = function(animation) {
                    var from, to;

                    if (animation.animationFromTo[name].length === 2) {
                        from = CssParser[name](animation.animationFromTo[name][0]);
                        to = CssParser[name](animation.animationFromTo[name][1]);

                        animation.animationFromTo[name + 'Width'] = [from[name + 'Width'], to[name + 'Width']];
                        animation.animationFromTo[name + 'Color'] = [from[name + 'Color'], to[name + 'Color']];
                    } else {
                        to = CssParser[name](animation.animationFromTo[name]);

                        animation.animationFromTo[name + 'Width'] = to[name + 'Width'];
                        animation.animationFromTo[name + 'Color'] = to[name + 'Color'];
                    }

                    animation.unit[name + 'Style'] = to[name + 'Style'];

                    self[name + 'Width'](animation);
                    self[name + 'Color'](animation);
                }
            });

            shadow = ['boxShadow', 'textShadow'];
            shadow.forEach(function(name) {
                self[name] = function(animation) {
                    self.settingCssAnimation(name, animation, '_shadowType');
                }
            });

            this.webkitClipPath = function(animation) {
                this.settingCssAnimation('webkitClipPath', animation, '_webkitClipPathType');
            };

            this.fontSize = function(animation) {
                this.settingCssAnimation('fontSize', animation, '_fontSizeType');
            };

            this.lineHeight = function(animation) {
                this.settingCssAnimation('lineHeight', animation, '_unitType', 'lineHeight');
            };

            this.opacity = function(animation) {
                this.settingCssAnimation('opacity', animation);
            };

            this.WebkitTransform = function(name, animation) {

                var from, to, i, self = this;

                if (typeof animation.animationFromTo[name] === 'object' && animation.animationFromTo[name].length === 2) {
                    from = animation.animationFromTo[name][0];
                    to = animation.animationFromTo[name][1];

                } else {
                    from = animation.target.cur[name];
                    to = animation.animationFromTo[name];
                }

                if (name === 'translateX' || name === 'translateY' || name === 'translateZ') {
                    (typeof from === 'string') && (from = this._getTranslateValue(name, animation, from));
                    (typeof to === 'string') && (to = this._getTranslateValue(name, animation, to));
                }

                animation.fromTo[name] = [from, to];
                animation.target.from[name] = to;
                animation.name.push(name);
            };
        },

        settingCssAnimation: function(name, animation, type, percentCriterion) {
            var fromTo;

            // 1. animation parser
            fromTo = animation.fromTo[name] = [];

            if (typeof animation.animationFromTo[name] === 'object' &&
                animation.animationFromTo[name].length === 2) {
                fromTo[0] = animation.animationFromTo[name][0];
                fromTo[1] = animation.animationFromTo[name][1];
            } else {
                fromTo[0] = window.getComputedStyle(animation.target.dom)[name];
                if (fromTo[0] === '' || fromTo[0] === 'auto' || fromTo[0] === 'none' || fromTo[0] === undefined) {
                    fromTo[0] = this._exceptGetStyle(animation.target.dom, name);
                }
                fromTo[1] = animation.animationFromTo[name];
            }

            fromTo[0] = CssParser[name](fromTo[0]);
            fromTo[1] = CssParser[name](fromTo[1]);

            // type check
            if (type) {
                this[type] && this[type](name, animation, percentCriterion);
            }
            animation.name.push(name);

            //console.log(animation.fromTo[name]);
        },

        unitArray: function(name, animation, percentCriterion) {
            var from = [], to = [], unit = [], i, len, f, t, cri,
                fromTo = animation.fromTo[name];

            for (i = 0, len = fromTo[0].length; i < len; i++) {
                f = fromTo[0][i];
                t = fromTo[1][i];

                if (f.unit !== t.unit) {
                    cri = (typeof percentCriterion === 'object' && percentCriterion[i] ? percentCriterion[i] : percentCriterion);
                    this._convertUnit(animation.target.dom, f, t, cri, name);
                }

                from.push(f.number);
                to.push(t.number);
                unit.push(t.unit);
            }

            animation.fromTo[name] = [from, to];
            animation.unit[name] = unit;
        },

//      TYPE Function
        _colorType: function(name, animation) {
            animation.target.cur[name] = new Uint8Array(3);
        },

        _fontSizeType: function(name, animation) {
            var fromTo = animation.fromTo[name];

            if (isNaN(fromTo[0].number)) {
                this._getStringFontNumber(fromTo[0], animation.target.dom)
            }

            if (isNaN(fromTo[1].number)) {
                this._getStringFontNumber(fromTo[1], animation.target.dom)
            }

            this._unitType(name, animation, 'fontSize');
        },

        _backgroundType: function(name, animation) {

            if (animation.fromTo[name][0].length === 1) {
                animation.fromTo[name][0].push({
                    number: 50,
                    unit: '%'
                });
            }

            if (animation.fromTo[name][1].length === 1) {
                animation.fromTo[name][1].push({
                    number: 50,
                    unit: '%'
                });
            }

            this.unitArray(name, animation, ['width', 'height']);
        },

        _unitType: function(name, animation, criterion) {
            var from = animation.fromTo[name][0],
                to = animation.fromTo[name][1];

            if (from.unit !== to.unit) {
                this._convertUnit(animation.target.dom, from, to, criterion, name);
            }

            animation.unit[name] = to.unit;
            animation.target.unit[name] = to.unit;
            animation.fromTo[name][0] = from.number;
            animation.fromTo[name][1] = to.number;

            //animation.target.from[name] = to[0];

            return false;
        },

        _webkitClipPathType: function(name, animation) {
            var fromTo = animation.fromTo[name];

            // todo: exception
            animation.unit[name + 'Style'] = fromTo[1][0];
            fromTo[0].splice(0, 1);
            fromTo[1].splice(0, 1);

            this.unitArray(name, animation, 'width');
        },

        _shadowType: function(name, animation) {
            var from = animation.fromTo[name][0], to = animation.fromTo[name][1],
                animationFrom = [], animationTo = [], animationUnit = [],
                shadowFrom, shadowTo,
                unit, i, j, shadow, len, shadowLen;

            animation.unit[name] = animationUnit;

            for (i = 0, shadowLen = to.length; i < shadowLen; i++) {

                (!from[i]) && (from[i] = []);
                shadowFrom = from[i];
                shadowTo = to[i];
                unit = [];
                animationUnit.push(unit);

                for (j = 0, len = shadowTo.length - 1; j < len; j++) {

                    unit.push(shadowTo[j].unit);

                    if (shadowFrom[j] && shadowTo[j].unit !== (shadowFrom[j].unit)) {
                        this._convertUnit(animation.target.dom, shadowFrom[j], shadowTo[j], 'width', name);
                    }

                    shadowTo[j] = shadowTo[j].number;

                    shadowFrom[j] = (shadowFrom[j] ? shadowFrom[j].number : 0);
                }

                shadowFrom[len] || (shadowFrom[len] = new Uint8Array(3));

            }

            animation.cur[name] = base.deepCopy(to);
        },

        //TODO : not parser
        _exceptGetStyle: function(dom, style) {
            var result, imageUrl, img;

            if (style === 'left') {
                result = dom.offsetLeft + 'px';
            } else if (style === 'top') {
                result = dom.offsetTop + 'px';
            } else if (style === 'clip') {
                result = 'rect(0px 0px 0px 0px)';
            } else if (style === 'boxShadow') {
                result = '0px 0px 0px 0px black';
            } else if (style === 'textShadow') {
                result = '0px 0px 0px black';
            } else if (style === 'backgroundPosition') {
                result = '0px 0px';
            } else if (style === 'backgroundSize') {
                imageUrl = this._getStyle(dom, 'backgroundImage');
                window.aa = img = new Image();
                img.src = imageUrl;

                if (img.width && img.height) {
                    result = img.width + 'px ' + img.height + 'px';
                } else {
                    result = '0px 0px';
                }
            }

            if (result === undefined) {
                result = '0px';
            }

            return result;
        },

        // get Style
        _getCriterionEm: function(dom, criterion) {
            return criterion === 'fontSize' ? 16 : (this._getStyle(dom, 'fontSize').number || 16);
        },

        _getCriterionPercent: function(dom, criterion, style) {
            var parent = dom.parentNode,
                parentValue, string, size, imgSize;

            if (style === 'lineHeight') {
                return (this._getStyle(dom, 'fontSize').number || 16);
            } else if (style === 'backgroundPosition') {

                size = this._getStyle(dom, criterion).number;
                imgSize = this._getBackgroundImageSize(dom, criterion);

                return size - imgSize + 1;
            } else if (style === 'backgroundSize') {
                return this._getStyle(dom, criterion).number;
            }

            parentValue = CssParser._getFloat(window.getComputedStyle(parent)[criterion]);
            while (parentValue === '' && parent !== document.body) {
                parent = parent.parentNode;
                parentValue = CssParser._getFloat(window.getComputedStyle(parent)[criterion]);
            }

            if (parentValue === 0 && (criterion === 'width' || criterion === 'height')) {
                string = criterion.substring(0, 1).toUpperCase() + criterion.substring(1);
                parentValue = window['inner' + string];
            }

            return parentValue;
        },

        _getStyle: function(dom, style) {
            var s = window.getComputedStyle(dom)[style];
            s = CssParser[style](s);
            return s;
        },

        _getBackgroundImageSize: function(dom, style) {
            var imageUrl, img,
                size = this._getStyle(dom, 'backgroundSize');

            if (size[0].unit === 'auto') {
                imageUrl = this._getStyle(dom, 'backgroundImage');
                img = new Image();
                img.src = imageUrl;

                if (style === undefined) {
                    return [img.width, img.height];
                }
                return img[style];
            } else {
                return size[(style === 'width' ? 0 : 1)].number;
            }

        },

        _getStringFontNumber: function(value, dom) {
            var string = value.unit;

            if (string === 'normal' || string === 'initial') {
                value.number = (this._getStyle(dom, 'fontSize').number || 16);
                value.unit = 'px';
            } else if (string === 'xx-small') {
                value.number = 0.5625;
                value.unit = 'em';
            } else if (string === 'x-small') {
                value.number = 0.625;
                value.unit = 'em';
            } else if (string === 'small') {
                value.number = 0.8125;
                value.unit = 'em';
            } else if (string === 'medium') {
                value.number = 1;
                value.unit = 'em';
            } else if (string === 'large') {
                value.number = 1.125;
                value.unit = 'em';
            } else if (string === 'x-large') {
                value.number = 1.5;
                value.unit = 'em';
            } else if (string === 'xx-large') {
                value.number = 2;
                value.unit = 'em';
            }
        },

        _getTranslateValue: function(name, animation, value) {
            var translate, result;

            translate = CssParser._unit(value);
            if (translate.unit !== 'px') {
                if (name === 'translateX' || name === 'translateZ') {
                    result = this._convertPx(animation.target.dom, translate.number, translate.unit, 'width');

                } else if (name === 'translateY') {
                    result = this._convertPx(animation.target.dom, translate.number, translate.unit, 'height');
                }
            } else {
                result = translate.number;
            }

            return result;
        },


        // Unit Convert  //TODO: refactoring
        _convertUnit: function(dom, from, to, criterion, style) {
            if (to.unit === 'em') {
                from.number = this._convertEm(dom, from.number, from.unit, criterion, style);
            } else if (to.unit === '%') {
                from.number = this._convertPer(dom, from.number, from.unit, criterion, style);
            } else if (to.unit === 'px') {
                from.number = this._convertPx(dom, from.number, from.unit, criterion, style);
            } else if (to.unit === 'cm') {
                from.number = this._convertCm(dom, from.number, from.unit, criterion, style);
            } else if (to.unit === 'pt') {
                from.number = this._convertPt(dom, from.number, from.unit, criterion, style);
            }
        },

        _convertEm: function(dom, value, unit, criterion, style) {
            var fontSize = this._getCriterionEm(dom, criterion, style);
            if (value === 0) {
                return 0;
            }

            if (unit === 'px') {
                return value / fontSize;
            } else if (unit === '%') {
                return (value / 100 * this._getCriterionPercent(dom, criterion, style)) / fontSize;
            } else if (unit === 'cm' || unit === 'pt') {
                return this._convertPx(dom, value, unit, criterion, style) / fontSize;
            }

            return false;
        },

        _convertPer: function(dom, value, unit, criterion, style) {
            var parentValue = this._getCriterionPercent(dom, criterion, style);

            if (value === 0) {
                return 0;
            }

            if (unit === 'px') {
                return value / parentValue * 100;
            } else if (unit === 'em') {
                return (value * this._getCriterionEm(dom, criterion, style)) / parentValue * 100;
            } else if (unit === 'cm' || unit === 'pt') {
                return this._convertPx(dom, value, unit, criterion, style) / parentValue * 100;
            }

            return false;
        },

        _convertPx: function(dom, value, unit, criterion, style) {
            if (value === 0) {
                return 0;
            }

            if (unit === '%') {
                return value / 100 * this._getCriterionPercent(dom, criterion, style);
            } else if (unit === 'em') {
                return value * (value * this._getCriterionEm(dom, criterion, style));
            } else if (unit === 'cm') {
                return value * 37.795;
            } else if (unit === 'pt') {
                return value * 1.3;
            }

            return false;
        },

        _convertCm: function(dom, value, unit, criterion, style) {
            var pxValue;

            if (value === 0) {
                return 0;
            }

            if (unit !== 'px') {
                pxValue = this._convertPx(dom, value, unit, criterion, style);
            } else {
                pxValue = value;
            }

            return pxValue * 0.02646;
        },

        _convertPt: function(dom, value, unit, criterion, style) {
            var ptValue;

            if (value === 0) {
                return 0;
            }

            if (unit !== 'px') {
                ptValue = this._convertPx(dom, value, unit, criterion, style);
            } else {
                ptValue = value;
            }

            return ptValue * 0.75;
        }

    });

    /*
     * Makes CSS properties for animation. If user uses CSS property, the animation is going to make it's properties.
     */
    ns.CssAnimationUtil = ns.base.singleTon(CssAnimationUtil);

})(window, ns, ns.base);
/*
 * # Animation Util
 *
 * Makes utilities for animation such as stagger, option, pre-defined effect, and keyframe.
 * This module provide additional feature to help SimpleAnimation.
 * Animation Util convert pre-defined effect, keyframe, option. Simple Animation will use based on this information.
 * Also, Animation Util check whether stagger is on or not.
 *
 * @class ns.AnimationUtil
 */
(function(window, ns, base) {
    var AnimationUtil = {

        /**
         * Returns option for animation. Because option value can be various type, this function make unified expression.
         * @method optionAnalyzer
         * @param {Object|Number} arg1
         * The arg1 can be option Object as {duration: 1000, ease: 'bounceOut', delay: 100} OR number value that indicate duration
         * @param {Object|undefined} arg2
         * The arg2 can be Object as {ease: 'bounceOut', delay: 100} OR undefined
         * @return {Object}
         * @member ns.AnimationUtil
         * @static
         */
        optionAnalyzer: function(arg1, arg2) {
            var option;

            if (arg1 !== undefined) {
                if (typeof arg1 === 'number') {
                    if (arg2 && typeof arg2 === 'object') {
                        option = arg2;
                    } else {
                        option = {};
                    }
                    option.duration = arg1;
                } else if (typeof arg1 === 'object') {
                    option = arg1;
                }
            } else {
                option = {};
                option.duration = 1000;
            }
            return option;
        },

        /**
         * Checks stagger option that included option of animation. If stagger is set, delay values of all targets are set in serial order automatically.
         * @method checkStagger
         * @param {Object} targets
         * If stagger option is exists, this targets will be applied delay in serial order.
         * @param {Object} option
         * the option include stagger, drag, ease, and so on.
         * @param {Function} callback
         * The callback function will be called after this function. Actually, callback handle option value about targets.
         * @member ns.AnimationUtil
         * @static
         */
        checkStagger: function(targets, option, callback) {
            var i, len, o;
            this.animations = [];

            // stagger
            for (i = 0, len = targets.length; i < len; i++) {
                o = ns.base.deepCopy(option);

                if (option.stagger) {
                    o.delay = option.stagger * i + (option.delay || 0);
                    o.reverseDelay = option.stagger * (len - i);
                }

                if (i !== 0 && option.drag) {
                    o.duration += (option.drag * i);
                }

                if (i === 0 && option.onStart) {
                    o.onStart = option.onStart;
                }
                /*  else if (i === len - 1 && option.onComplete) {
                 o.onComplete = option.onComplete;
                 }*/

                callback(targets[i], o, i);
            }
        },

        /**
         * Creates Keyframe for animation. If user make keyframe, this function will be called and make appropriate value for animation.
         * @method createKeyFrame
         * @param {Object} frame
         * The frame has keyframe information. Keyframe animation based on frame.
         * @param {Object} option
         * The Option has ease, delay, duration, and so on.
         * @param {Function} callback
         * After handling based on frame and option, callback will invoked with result of handling.
         * @member ns.AnimationUtil
         * @static
         */
        createKeyFrame: function(frame, option, callback) {
            var i, j, l, preDuration, ft, o, offset = [], frames = [];

            for (i in frame) {
                offset.push(parseFloat(i));
            }

            offset.sort(function(a, b) {
                return a - b;
            });
            preDuration = offset[0];

            for (i = 0, l = offset.length - 1; i < l; i++) {
                o = ns.base.deepCopy(option);
                ft = {};

                for (j in frame[offset[i + 1]]) {
                    if (frame[offset[i]][j] !== undefined) {
                        ft[j] = [frame[offset[i]][j], frame[offset[i + 1]][j]]
                    } else {
                        ft[j] = frame[offset[i + 1]][j];
                    }
                }

                o.duration = option.duration * (offset[i + 1] - preDuration);
                preDuration = offset[i + 1];

                if (i === 0) {

                    option.onStart && (o.onStart = option.onStart);
                    option.delay && (o.delay = option.delay);
                    o.reverseDelay = 0;

                } else {

                    option.delay && (o.delay = 0);
                    option.stagger && (o.delay = 0);

                    if (i === l - 1) {

                        option.onComplete && (o.onComplete = option.onComplete);


                    } else {
                        o.reverseDelay = 0;
                    }
                }

//                if(option.stagger) {
//                    if(i !== 0) {
//                        o.delay = 0;
//                    }
//                    if(i !== l-1) {
//                        o.reverseDelay = 0;
//                    }
//                }
//                console.log(o.delay);
                callback(ft, o, i);
            }
        },

        /**
         * Analyzes effect as pre-defined. This function make keyframe based frame, cubic-bezier based ease, transformOrigin value, visibility.
         * @method effectAnalyzer
         * @param {Object} target
         * @param {String} animation
         * The animation is a effect as a String.
         * @return {Array}
         * @member ns.AnimationUtil
         * @static
         */
        effectAnalyzer: function(target, animation) {
            var predefined, frame, ease, transformOrigin, visibility,
                width = ns.CssAnimationUtil.getInstance()._getCriterionPercent(target.dom, 'width'),
                height = ns.CssAnimationUtil.getInstance()._getCriterionPercent(target.dom, 'height');
            predefined = animation;

            target.dom.style.opacity = target.dom.style.opacity ? target.dom.style.opacity : 1;

            if (predefined === 'pulse') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY},
                    0.5: {scaleX: 1.05 * target.cur.scaleX, scaleY: 1.05 * target.cur.scaleY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY}
                };
            } else if (predefined === 'rollIn') {
                frame = {
                    0: {translateX: -100 + target.cur.translateX, rotateZ: -120 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {translateX: 0 + target.cur.translateX, rotateZ: 0 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };

            } else if (predefined === 'rollOut') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {translateX: 200 + target.cur.translateX, rotateZ: 120 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'bounce') {
                frame = {
                    0: {translateY: 0 + target.cur.translateY},
                    0.2: {translateY: 0 + target.cur.translateY},
                    0.4: {translateY: -30 + target.cur.translateY},
                    0.5: {translateY: 0 + target.cur.translateY},
                    0.7: {translateY: -15 + target.cur.translateY},
                    0.8: {translateY: 0 + target.cur.translateY},
                    0.9: {translateY: -4 + target.cur.translateY},
                    1: {translateY: 0 + target.cur.translateY}
                };
                ease = ['bounce1', 'bounce1', 'bounce2', 'bounce1', 'bounce2', 'bounce1', '', 'bounce1'];
                transformOrigin = 'center bottom';
            } else if (predefined === 'bounceIn') {
                frame = {
                    0: {scaleX: 0.3 * target.cur.scaleX, scaleY: 0.3 * target.cur.scaleY},
                    0.2: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY},
                    0.4: {scaleX: 0.9 * target.cur.scaleX, scaleY: 0.9 * target.cur.scaleY},
                    0.6: {scaleX: 1.03 * target.cur.scaleX, scaleY: 1.03 * target.cur.scaleY},
                    0.8: {scaleX: 0.97 * target.cur.scaleX, scaleY: 0.97 * target.cur.scaleY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY}
                };
                ease = ['bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1'];
            } else if (predefined === 'bounceInDown') {
                frame = {
                    0: {translateY: -3000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity},
                    0.6: {translateY: 25 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.75: {translateY: -10 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.9: {translateY: 5 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1'];
            } else if (predefined === 'bounceInLeft') {
                frame = {
                    0: {translateX: -3000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity},
                    0.6: {translateX: 25 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.75: {translateX: -10 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.9: {translateX: 5 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1'];
            } else if (predefined === 'bounceInRight') {
                frame = {
                    0: {translateX: 3000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity},
                    0.6: {translateX: -25 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.75: {translateX: 10 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.9: {translateX: -5 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1'];
            } else if (predefined === 'bounceInUp') {
                frame = {
                    0: {translateY: 3000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity},
                    0.6: {translateY: -25 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.75: {translateY: 10 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.9: {translateY: -5 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['bounce1', 'bounce1', 'bounce1', 'bounce1', 'bounce1'];
            } else if (predefined === 'bounceOut') {
                frame = {
                    0.2: {opacity: 0 * target.dom.style.opacity, scaleX: 0.9 * target.cur.scaleX, scaleY: 0.9 * target.cur.scaleY},
                    0.5: {opacity: 1 * target.dom.style.opacity, scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY},
                    1: {opacity: 0 * target.dom.style.opacity, scaleX: 0.3 * target.cur.scaleX, scaleY: 0.3 * target.cur.scaleY}
                };
            } else if (predefined === 'bounceOutDown') {
                frame = {
                    0: {translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.1: {translateY: 10 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.45: {translateY: -20 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {translateY: 2000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'bounceOutLeft') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.2: {translateX: 20 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {translateX: -2000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'bounceOutRight') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.2: {translateX: -20 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {translateX: 2000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'bounceOutUp') {
                frame = {
                    0: {translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.2: {translateY: -10 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.45: {translateY: 20 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {translateY: -2000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'zoomIn') {
                frame = {
                    0: {scaleX: 0.3 * target.cur.scaleX, scaleY: 0.3 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity},
                    0.5: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity}
                };
            } else if (predefined === 'zoomInDown') {
                frame = {
                    0: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity, translateX: 0 + target.cur.translateX, translateY: -1000 + target.cur.translateY},
                    0.6: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX, translateY: 60 + target.cur.translateY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX, translateY: 0 + target.cur.translateY}
                };
                ease = ['zoomInDown', 'backOut'];
            } else if (predefined === 'zoomInLeft') {
                frame = {
                    0: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity, translateX: -1000 + target.cur.translateX},
                    0.6: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateX: 10 + target.cur.translateX},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateX}
                };
                ease = ['zoomInDown', 'backOut'];
            } else if (predefined === 'zoomInRight') {
                frame = {
                    0: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity, translateX: 1000 + target.cur.translateX, translateY: target.cur.translateY},
                    0.6: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateX: -10 + target.cur.translateX, translateY: target.cur.translateY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateY: target.cur.translateY}
                };
                ease = ['zoomInDown', 'backOut'];
            } else if (predefined === 'zoomInUp') {
                frame = {
                    0: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity, translateY: 1000 + target.cur.translateY},
                    0.6: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateY: -60 + target.cur.translateY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY}
                };
                ease = ['zoomInDown', 'backOut'];
            } else if (predefined === 'zoomOut') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    0.6: {scaleX: 0.3 * target.cur.scaleX, scaleY: 0.3 * target.cur.scaleY, opacity: 0 * target.dom.style.opacity},
                    1: {opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'zoomOutDown') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.4: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, translateY: -60 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, translateY: 2000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity}
                };
                ease = ['zoomInDown', 'backOut'];
                transformOrigin = 'center bottom';
            } else if (predefined === 'zoomOutLeft') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.4: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, translateX: 42 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, translateX: -2000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'left center';
            } else if (predefined === 'zoomOutRight') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, translateX: 0 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    0.4: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, translateX: -42 + target.cur.translateX, opacity: 1 * target.dom.style.opacity},
                    1: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, translateX: 2000 + target.cur.translateX, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'right center';
            } else if (predefined === 'zoomOutUp') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    0.4: {scaleX: 0.475 * target.cur.scaleX, scaleY: 0.475 * target.cur.scaleY, translateY: 60 + target.cur.translateY, opacity: 1 * target.dom.style.opacity},
                    1: {scaleX: 0.1 * target.cur.scaleX, scaleY: 0.1 * target.cur.scaleY, translateY: -2000 + target.cur.translateY, opacity: 0 * target.dom.style.opacity}
                };
                ease = ['zoomInDown', 'backOut'];
                transformOrigin = 'center bottom';
            } else if (predefined === 'slideInDown') {
                frame = {
                    0: {translateY: (height * -1) + target.cur.translateY},
                    1: {translateY: 0 + target.cur.translateY}
                };
                visibility = 'visible';
            } else if (predefined === 'slideInLeft') {
                frame = {
                    0: {translateX: (width * -1) + target.cur.translateX},
                    1: {translateX: 0 + target.cur.translateX}
                };
                visibility = 'visible';
            } else if (predefined === 'slideInRight') {
                frame = {
                    0: {translateX: (width * 1) + target.cur.translateX},
                    1: {translateX: 0 + target.cur.translateX}
                };
                visibility = 'visible';
            } else if (predefined === 'slideInUp') {
                frame = {
                    0: {translateY: (height * 1) + target.cur.translateY},
                    1: {translateY: 0 + target.cur.translateY}
                };
                visibility = 'visible';
            } else if (predefined === 'slideOutDown') {
                frame = {
                    0: {translateY: 0 + target.cur.translateY},
                    1: {translateY: (height * 1) + target.cur.translateY}
                };
                visibility = 'hidden';
            } else if (predefined === 'slideOutLeft') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX},
                    1: {translateX: (width * -1) + target.cur.translateX}
                };
                visibility = 'hidden';
            } else if (predefined === 'slideOutRight') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX},
                    1: {translateX: (width * 1) + target.cur.translateX}
                };
                visibility = 'hidden';
            } else if (predefined === 'slideOutUp') {
                frame = {
                    0: {translateY: 0 + target.cur.translateY},
                    1: {translateY: (height * -1) + target.cur.translateY}
                };
                visibility = 'hidden';
            } else if (predefined === 'flash') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    0.25: {opacity: 0 * target.dom.style.opacity},
                    0.5: {opacity: 1 * target.dom.style.opacity},
                    0.75: {opacity: 0 * target.dom.style.opacity},
                    1: {opacity: 1 * target.dom.style.opacity}
                };
            } else if (predefined === 'rubberBand') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY},
                    0.3: {scaleX: 1.25 * target.cur.scaleX, scaleY: 0.75 * target.cur.scaleY},
                    0.4: {scaleX: 0.75 * target.cur.scaleX, scaleY: 1.25 * target.cur.scaleY},
                    0.5: {scaleX: 1.15 * target.cur.scaleX, scaleY: 0.85 * target.cur.scaleY},
                    0.65: {scaleX: 0.95 * target.cur.scaleX, scaleY: 1.05 * target.cur.scaleY},
                    0.75: {scaleX: 1.05 * target.cur.scaleX, scaleY: 0.95 * target.cur.scaleY},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY}
                };
            } else if (predefined === 'shake') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX},
                    0.1: {translateX: -10 + target.cur.translateX},
                    0.2: {translateX: 10 + target.cur.translateX},
                    0.3: {translateX: -10 + target.cur.translateX},
                    0.4: {translateX: 10 + target.cur.translateX},
                    0.5: {translateX: -10 + target.cur.translateX},
                    0.6: {translateX: 10 + target.cur.translateX},
                    0.7: {translateX: -10 + target.cur.translateX},
                    0.8: {translateX: 10 + target.cur.translateX},
                    0.9: {translateX: -10 + target.cur.translateX},
                    1: {translateX: 0 + target.cur.translateX}
                };
            } else if (predefined === 'swing') {
                frame = {
                    0: {rotateZ: 0 + target.cur.rotateZ},
                    0.2: {rotateZ: 15 + target.cur.rotateZ},
                    0.4: {rotateZ: -10 + target.cur.rotateZ},
                    0.6: {rotateZ: 5 + target.cur.rotateZ},
                    0.8: {rotateZ: -5 + target.cur.rotateZ},
                    1: {rotateZ: 0 + target.cur.rotateZ}
                };
                transformOrigin = 'top center';
            } else if (predefined === 'tada') {
                frame = {
                    0: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, rotateZ: 0 + target.cur.rotateZ},
                    0.15: {scaleX: 0.9 * target.cur.scaleX, scaleY: 0.9 * target.cur.scaleY, rotateZ: -3 + target.cur.rotateZ},
                    0.3: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: 3 + target.cur.rotateZ},
                    0.4: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: -3 + target.cur.rotateZ},
                    0.5: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: 3 + target.cur.rotateZ},
                    0.6: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: -3 + target.cur.rotateZ},
                    0.7: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: 3 + target.cur.rotateZ},
                    0.8: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: -3 + target.cur.rotateZ},
                    0.9: {scaleX: 1.1 * target.cur.scaleX, scaleY: 1.1 * target.cur.scaleY, rotateZ: 3 + target.cur.rotateZ},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, rotateZ: 0 + target.cur.rotateZ}
                };
            } else if (predefined === 'wobble') {
                frame = {
                    0: {translateX: 0 + target.cur.translateX, rotateZ: 0 + target.cur.rotateZ},
                    0.15: {translateX: (width * -0.25) + target.cur.translateX, rotateZ: -5 + target.cur.rotateZ},
                    0.3: {translateX: (width * 0.2) + target.cur.translateX, rotateZ: 3 + target.cur.rotateZ},
                    0.45: {translateX: (width * -0.15) + target.cur.translateX, rotateZ: -3 + target.cur.rotateZ},
                    0.6: {translateX: (width * 0.1) + target.cur.translateX, rotateZ: 2 + target.cur.rotateZ},
                    0.75: {translateX: (width * -0.05) + target.cur.translateX, rotateZ: -1 + target.cur.rotateZ},
                    1: {translateX: 0 + target.cur.translateX, rotateZ: 0 + target.cur.rotateZ}
                };
            } else if (predefined === 'jello') {
                frame = {
                    0: {skewX: 0 + target.cur.skewX, skewY: 0 + target.cur.skewY},
                    0.22: {skewX: -12.5 + target.cur.skewX, skewY: -12.5 + target.cur.skewY},
                    0.33: {skewX: 6.25 + target.cur.skewX, skewY: 6.25 + target.cur.skewY},
                    0.44: {skewX: -3.125 + target.cur.skewX, skewY: -3.125 + target.cur.skewY},
                    0.55: {skewX: 1.5625 + target.cur.skewX, skewY: 1.5625 + target.cur.skewY},
                    0.66: {skewX: -0.78125 + target.cur.skewX, skewY: -0.78125 + target.cur.skewY},
                    0.77: {skewX: 0.390625 + target.cur.skewX, skewY: 0.390625 + target.cur.skewY},
                    0.88: {skewX: -0.1953125 + target.cur.skewX, skewY: -0.1953125 + target.cur.skewY},
                    1: {skewX: 0 + target.cur.skewX, skewY: 0 + target.cur.skewY}
                };
                transformOrigin = 'center';
            } else if (predefined === 'fadeIn') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity},
                    1: {opacity: 1 * target.dom.style.opacity}
                };
            } else if (predefined === 'fadeInDown') {
                frame = {
                    0: {translateY: (height * -1) + target.cur.translateY, opacity: 0 * target.dom.style.opacity},
                    1: {translateY: 0 + target.cur.translateY, opacity: 1 * target.dom.style.opacity}
                };
            } else if (predefined === 'fadeInDownBig') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateY: -2000 + target.cur.translateY},
                    1: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY}
                };
            } else if (predefined === 'fadeInLeft') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateX: (width * -1) + target.cur.translateX},
                    1: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX}
                };
            } else if (predefined === 'fadeInLeftBig') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateX: -2000 + target.cur.translateX},
                    1: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX}
                };
            } else if (predefined === 'fadeInRight') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateX: (width * 1) + target.cur.translateX},
                    1: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX}
                };
            } else if (predefined === 'fadeInRightBig') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateX: 2000 + target.cur.translateX},
                    1: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX}
                };
            } else if (predefined === 'fadeInUp') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateY: (height * 1) + target.cur.translateY},
                    1: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY}
                };

            } else if (predefined === 'fadeInUpBig') {
                frame = {
                    0: {opacity: 0 * target.dom.style.opacity, translateY: 2000 + target.cur.translateY},
                    1: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY}
                };
            } else if (predefined === 'fadeOut') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'fadeOutDown') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY},
                    1: {opacity: 0 * target.dom.style.opacity, translateY: (height * 1) + target.cur.translateY}
                };
            } else if (predefined === 'fadeOutDownBig') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY},
                    1: {opacity: 0 * target.dom.style.opacity, translateY: 2000 + target.cur.translateY}
                };
            } else if (predefined === 'fadeOutLeft') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX},
                    1: {opacity: 0 * target.dom.style.opacity, translateX: (width * -1) + target.cur.translateX}
                };
            } else if (predefined === 'fadeOutLeftBig') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX},
                    1: {opacity: 0 * target.dom.style.opacity, translateX: -2000 + target.cur.translateX}
                };
            } else if (predefined === 'fadeOutRight') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX},
                    1: {opacity: 0 * target.dom.style.opacity, translateX: (width * 1) + target.cur.translateX}
                };
            } else if (predefined === 'fadeOutRightBig') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateX: 0 + target.cur.translateX},
                    1: {opacity: 0 * target.dom.style.opacity, translateX: 2000 + target.cur.translateX}
                };
            } else if (predefined === 'fadeOutUp') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY},
                    1: {opacity: 0 * target.dom.style.opacity, translateY: (height * -1) + target.cur.translateY}
                };
            } else if (predefined === 'fadeOutUpBig') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity, translateY: 0 + target.cur.translateY},
                    1: {opacity: 0 * target.dom.style.opacity, translateY: -2000 + target.cur.translateY}
                };
            } else if (predefined === 'flip') {
                frame = {
                    0: {rotateY: -360 + target.cur.rotateY, perspective: 400},
                    0.4: {rotateY: -190 + target.cur.rotateY, translateZ: 150 + target.cur.translateZ, perspective: 400},
                    0.5: {rotateY: -170 + target.cur.rotateY, translateZ: 150 + target.cur.translateZ, perspective: 400},
                    0.8: {scaleX: 0.95 * target.cur.scaleX, scaleY: 0.95 * target.cur.scaleY, perspective: 400},
                    1: {scaleX: 1 * target.cur.scaleX, scaleY: 1 * target.cur.scaleY, rotateY: 0 + target.cur.rotateY, translateZ: 0 + target.cur.translateZ, perspective: 400}
                };
                ease = ['easeIn', 'easeIn', 'easeIn', 'easeIn', 'easeIn'];
            } else if (predefined === 'flipInX') {
                frame = {
                    0: {rotateX: 90 + target.cur.rotateX, perspective: 400, opacity: 0 * target.dom.style.opacity},
                    0.4: {rotateX: -20 + target.cur.rotateX, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    0.6: {rotateX: 10 + target.cur.rotateX, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    0.8: {rotateX: -5 + target.cur.rotateX, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    1: {rotateX: 0 + target.cur.rotateX, perspective: 400, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['easeIn', 'easeIn', 'easeIn', 'easeIn', 'easeIn'];
            } else if (predefined === 'flipInY') {
                frame = {
                    0: {rotateY: 90 + target.cur.rotateY, perspective: 400, opacity: 0 * target.dom.style.opacity},
                    0.4: {rotateY: -20 + target.cur.rotateY, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    0.6: {rotateY: 10 + target.cur.rotateY, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    0.8: {rotateY: -5 + target.cur.rotateY, perspective: 400, opacity: 1 * target.dom.style.opacity},
                    1: {rotateY: 0 + target.cur.rotateY, perspective: 400, opacity: 1 * target.dom.style.opacity}
                };
                ease = ['easeIn', 'easeIn', 'easeIn', 'easeIn', 'easeIn'];
            } else if (predefined === 'flipOutX') {
                frame = {
                    0: {perspective: 400},
                    0.3: {perspective: 400, rotateX: -20 + target.cur.rotateX, opacity: 1 * target.dom.style.opacity},
                    1: {perspective: 400, rotateX: 90 + target.cur.rotateX, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'flipOutY') {
                frame = {
                    0: {perspective: 400},
                    0.3: {perspective: 400, rotateY: -15 + target.cur.rotateY, opacity: 1 * target.dom.style.opacity},
                    1: {perspective: 400, rotateY: 90 + target.cur.rotateY, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'lightSpeedIn') {
                frame = {
                    0: {translateX: (width * 1) + target.cur.translateX, skewX: -30 + target.cur.skewX, opacity: 0 * target.dom.style.opacity},
                    0.6: {translateX: 0 + target.cur.translateX, skewX: 20 + target.cur.skewX, opacity: 1 * target.dom.style.opacity},
                    0.8: {translateX: 0 + target.cur.translateX, skewX: -5 + target.cur.skewX, opacity: 1 * target.dom.style.opacity},
                    1: {translateX: 0 + target.cur.translateX, skewX: 0 + target.cur.skewX, opacity: 1 * target.dom.style.opacity}
                };
            } else if (predefined === 'lightSpeedOut') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {translateX: (width * 1) + target.cur.translateX, skewX: 30 + target.cur.skewX, opacity: 0 * target.dom.style.opacity}
                };
            } else if (predefined === 'rotateIn') {
                frame = {
                    0: {rotateZ: -200 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {rotateZ: 0 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };
                transformOrigin = 'center';
            } else if (predefined === 'rotateInDownLeft') {
                frame = {
                    0: {rotateZ: -45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {rotateZ: 0 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };

                transformOrigin = 'left bottom';
            } else if (predefined === 'rotateInDownRight') {
                frame = {
                    0: {rotateZ: 45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {rotateZ: 0 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };
                transformOrigin = 'right bottom';
            } else if (predefined === 'rotateInUpLeft') {
                frame = {
                    0: {rotateZ: 45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {rotateZ: +target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };
                transformOrigin = 'left bottom';
            } else if (predefined === 'rotateInUpRight') {
                frame = {
                    0: {rotateZ: -90 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity},
                    1: {rotateZ: 0 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity}
                };
                transformOrigin = 'right bottom';
            } else if (predefined === 'rotateOut') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {rotateZ: 200 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'center';
            } else if (predefined === 'rotateOutDownLeft') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {rotateZ: 45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'left bottom';
            } else if (predefined === 'rotateOutDownRight') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {rotateZ: -45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'right bottom';
            } else if (predefined === 'rotateOutUpLeft') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {rotateZ: -45 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'left bottom';
            } else if (predefined === 'rotateOutUpRight') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    1: {rotateZ: 90 + target.cur.rotateZ, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'right bottom';
            } else if (predefined === 'hinge') {
                frame = {
                    0: {opacity: 1 * target.dom.style.opacity},
                    0.2: {rotateZ: 80 + target.cur.rotateZ},
                    0.4: {rotateZ: 60 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity},
                    0.6: {rotateZ: 80 + target.cur.rotateZ},
                    0.8: {rotateZ: 60 + target.cur.rotateZ, opacity: 1 * target.dom.style.opacity},
                    1: {translateY: 700 + target.cur.translateY, opacity: 0 * target.dom.style.opacity}
                };
                transformOrigin = 'top left';
                ease = ['easeInOut', 'easeInOut', 'easeInOut', 'easeInOut', 'easeInOut', 'easeInOut'];
            } else {
                throw new Error('the name of animation is not exists');
            }

            return [frame, ease, transformOrigin, visibility];
        }
    };

    ns.AnimationUtil = AnimationUtil;
})(window, ns, ns.base);
// TODO

(function(window, ns, base) {
    var _singleton;

    var ObjectManager = base.Class.extend({

        _init: function() {
            if (_singleton !== undefined) {
                _singleton = new this();
                return _singleton;
            }
            this.targetObjects = [];

            return this;
        },

        /**
         * Add animation object to manager.
         * @method addTarget
         * @param {target} animation object
         * @member ns.ObjectManager.addTarget
         * @private
         */
        addTarget: function(target) {
            this.targetObjects.push(target);
            target.map = new ns.base.WeakMap();
        },

        /**
         * Create animation object.
         * @method getObject
         * @param {target} animation object
         * @member ns.ObjectManager.getObject
         * @private
         */
        getObject: function(obj) {

            if (obj instanceof ns.AnimationObject) {
                return obj;
            }

            for (var i = 0, len = this.targetObjects.length; i < len; i++) {
                if(obj instanceof this.targetObjects[i].$type) {

                    var object = this.targetObjects[i].map.get(obj);

                    if(object === undefined) {
                        object = new ns[this.targetObjects[i].$namespace](obj);
                        this.targetObjects[i].map.set(obj, object);
                    }
                    return object;
                }
            }

            throw 'CannotCreateObject';

            return;
        },


        static: {
            /**
             * Return ObjectManger object
             * @method getInstance
             * @return {object}
             * @member ns.ObjectManager.getInstance
             * @static
             */
            getInstance: function() {
                if (_singleton === undefined) {
                    _singleton = new ObjectManager();
                }
                return _singleton;
            },

            /**
             * Create Animation Object by using plugin
             * @method plugin
             * @param {object}
             * @member ns.ObjectManager.plugin
             * @static
             */
            plugin: function(definition) {
                var keywordTest = /^\$(?:namespace|constructor|type)$/;

                if( (!definition.$constructor) ) {
                    return;
                }
                // TODO : $namespace, type 예외 처리
                function Class() {
                    ns.AnimationObject.call(this);
                    definition.$constructor.apply(this, arguments);
                }

                Class.prototype = new ns.AnimationObject();
                Class.prototype.constructor = Class;

                for(var name in definition) {
                    if(keywordTest.test(name)) {
                        continue;
                    }

                    Class.prototype[name] = typeof definition[name] === 'function' && definition[name];
                }

                ns[definition.$namespace] = Class;

                this.getInstance().addTarget(definition);

                return Class;
            }
        }
    });

    /*
     * Manages objects that will be animated.
     */
    ns.ObjectManager = ObjectManager;

})(window, ns, ns.base);



(function(window) {
    'use strict';

    (function(window, ns, base) {
        var AnimationObject = ns.base.Class.extend({
            _init: function() {
                this.from = new ns.Transform();
                this.cur = base.copy(this.from);

                this.updateSeek = false;
                this.updateSeekProperty = [];
            },

            getFrom: function(to) {
                var v = {};
                var to = to.animation;
                for(var i in to){
                    v[i] = this.from[i];
                    this.from[i] = to[i];
                }
                return v;
            },

            setFrom: function(v) {
                this.from.set(v);
            },
            translate: function() {

            },
            rotate: function() {

            }
        });

        /*
         * Manages animationObject.
         */
        ns.AnimationObject = AnimationObject;

    })(window, ns, ns.base);

})(window);
(function(window, ns, base) {
    'use strict';
    var CssAnimationUtil = ns.CssAnimationUtil.getInstance(),
        CssStringCreator = ns.CssStringCreator.getInstance();

    /*
     * Constructs and Sets based on DOMObject. DOM Object is the one of target for animation.
     */

    ns.ObjectManager.plugin({
        $namespace: 'DomObject',
        $type: window.HTMLElement,
        $constructor: function(dom) {
            this.dom = dom;
            //this.style = dom.style;
            this.unit = {};
            this._perspective = false;
        },

        /**
         * Render dom object on screen.
         * @method render
         * @param {value} update target value
         * @param {unit} unix
         * @member ns.DomObject
         * @private
         */
        render: function(tweenInfo) {
            var i, u = tweenInfo.updateProperty, l;
            for (i = 0; l = u[i]; i++) {
                tweenInfo.targetStyle[l] = CssStringCreator[l](this, tweenInfo.unit);
            }
            //var isUpdateTransform = false;
            //
            //for(var i in updateValue) {
            //    if(!this.isTransform(i) && this.dom.style[i] !== undefined) {
            //        this.dom.style[i] = CssStringCreator[i](updateValue, unit);
            //    } else {
            //        if(!isUpdateTransform) {
            //            this.dom.style.WebkitTransform = CssStringCreator.WebkitTransform(updateValue);
            //            isUpdateTransform = true;
            //        }
            //    }
            //}
        },

        objectRender: function(updateValue) {
            var isUpdateTransform = false;

            for (var i in updateValue) {
                if (!this.isTransform(i) && this.dom.style[i] !== undefined) {
                    this.dom.style[i] = CssStringCreator[i](updateValue, unit);
                } else {
                    if (!isUpdateTransform) {
                        this.dom.style.WebkitTransform = CssStringCreator.WebkitTransform(updateValue);
                        isUpdateTransform = true;
                    }
                }
            }
        },

        /**
         * Create tween object in order to animate dom object.
         * @method createTweenObject
         * @param {value} animation from value
         * @param {value} animation to value
         * @param {value} animation option including duration, delay, ease ans so on.
         * @member ns.DomObject
         * @private
         */
        createTweenInfo: function(fromTo, option, needFromTo) {
            var info = {
                fromTo: {},
                animationFromTo: fromTo,
                cur: this.cur,
                option: option,
                name: [],
                unit: {},
                target: this,
                targetStyle: this.dom.style,
                updateProperty: []
            };

            if (needFromTo) {
                this.setAnimationFromTo(info);
            }

            return info;
        },

        setAnimationFromTo: function(obj) {
            var isTransform = false,
                fromTo = obj.animationFromTo,
                i;

            for (i in fromTo) {
                if (this.isTransform(i)) {
                    CssAnimationUtil.WebkitTransform(i, obj);
                    if (!isTransform) {
                        obj.updateProperty.push('WebkitTransform');
                        isTransform = true;
                    }
                } else if (i === 'perspective') {
                    this._perspective = base.isNumber(fromTo[i]) ? fromTo[i] : (base.isNumber(fromTo[i][1]) ? fromTo[i][1] : 0);
                    this.cur.perspective = this._perspective;
                } else {
                    if (CssAnimationUtil[i]) {
                        CssAnimationUtil[i](obj);
                        obj.updateProperty.push(i);
                    }
                }

            }
        },
        /**
         * Check if it is transform or not.
         * @method isTransform
         * @param {string}
         * @return {boolean}
         * @member ns.DomObject
         * @private
         */
        isTransform: function(i) {
            if (i === undefined || i === null) {
                return;
            }
            if (i === 'translateX' || i === 'translateY' || i === 'translateZ' ||
                i === 'rotateX' || i === 'rotateY' || i === 'rotateZ' ||
                i === 'scaleX' || i === 'scaleY' || i === 'skewX' || i === 'skewY' /*|| i === 'perspective'*/) {
                return true;

            }
            return false;
        },

        /**
         * Set perspective of dom object.
         * @method perspective
         * @param {number} perspective value
         * @member ns.DomObject
         * @private
         */
        perspective: function(n) {
            if (n === undefined || n === null) {
                return;
            }
            if (!ns.base.isNumber(n)) {
                return;
            }
            this._perspective = n;
            this.cur.perspective = n;
        },

        /**
         * Set animation value of dom object
         * @method set
         * @param {value} animation value
         * @member ns.DomObject
         * @private
         */
        set: function(v) {
            if (v === undefined || v === null) {
                return;
            }
            for (var i in v) {
                if (this.isTransform(i)) {
                    this.from[i] = v[i];
                    this.cur[i] = v[i];
                } else if (i === 'perspective') {
                    this.perspective(v[i]);
                } else {
                    this.dom.style[i] = v[i];
                }
            }
            this.objectRender(base.deepCopy(this.from));
        }
    });
})(window, ns, ns.base);

/**
 * # TAU Animation
 *
 * Provides features that make and control animation.
 * Simple Animation has relevance to Tween Animator.
 * As you can see below APIs, almost APIs make Tween-able object and control animation.
 *
 * @example
 * #### using tween and tween from ~ to
 *
 * $('#box').tween({left: 200}, {duration: 1000, ease: 'bounceInOut', onComplete: function() {
 *                           console.log('animation complete');
 *                         }
 * });
 * $('#box').tween({left: [200, 300]} {duration: 1000, ease: 'bounceInOut', onComplete: function() {
 *                                               console.log('animation complete');
 *                                           }
 *     });
 *
 *
 * #### using tween and tween from ~ to as chaining
 *
 * var box = document.createElement('div');
 * box.tween({rotateZ: 120}, 1000)
 * .tween({left: 200}, 1000)
 * .tween({left: [200, 400], top: 100}, 1000);
 *
 * #### effect animation with stagger
 *
 * $('.box').animate('bounce', {duration: 1000, stagger: 200});
 *
 *
 * @class tau.animation.SimpleAnimationMixinObject
 */
(function(window, ns, base) {
    'use strict';

    var ObjectManager = ns.ObjectManager.getInstance();

    var SimpleAnimationMixinObject = {
        /**
         * Adds tween animation with animation information and target is animated.
         * @method tween
         * @member tau.animation.SimpleAnimationMixinObject
         * @public
         */
        tween: function(fromTo, arg1, arg2) {
            var option;

            if (!this.simpleAnimation) {
                if (this.length) {
                    this.simpleAnimation = new ns.SimpleAnimationGroup(this);
                } else {
                    this.simpleAnimation = new ns.SimpleAnimation(this);
                }
            }

            option = ns.AnimationUtil.optionAnalyzer(arg1, arg2);
            this.simpleAnimation.add(fromTo, option);
            this.simpleAnimation.play();

            return this;
        },

        /**
         * Stops animation or group animations.
         * @method stop
         * @member tau.animation.SimpleAnimationMixinObject
         * @public
         */
        stop: function() {
            if (!this.simpleAnimation) {

                if (!this.simpleAnimation) {
                    if (this.length) {
                        this.simpleAnimation = new ns.SimpleAnimationGroup(this);
                    } else {
                        this.simpleAnimation = new ns.SimpleAnimation(this);
                    }
                }

            }
            this.simpleAnimation.stop();

        },

        /**
         * Sets transform property of target.
         * @method transform
         * @member tau.animation.SimpleAnimationMixinObject
         * @public
         */
        transform: function(v) {
            if (!this.simpleAnimation) {
                if (this.length) {
                    this.simpleAnimation = new ns.SimpleAnimationGroup(this);
                } else {
                    this.simpleAnimation = new ns.SimpleAnimation(this);
                }
            }

            this.simpleAnimation.target.set(v);
        }
    };

    /**
     * Makes simpleAnimation for playing animation.
     * @constructor SimpleAnimation
     * @param {Object} target
     * The target is animated by tween animator.
     * @member tau.animation.SimpleAnimation
     * @private
     */
    var SimpleAnimation = function(target) {

        this.tweenAnimator = new ns.TweenAnimator();
        this.target = ObjectManager.getObject(target); // get animation object
        this.target.simpleAnimation = this;

        this.target.render && this.tweenAnimator.setRender(this.target.render);
        this.target.cur && this.tweenAnimator.setUpdateTarget(this.target.cur);
    };

    /**
     * Adds tween information object in animator.
     * @method add
     * @param {Object} fromTo
     * @param {Object} option
     * @param {Object} secondTweenAnimator
     * @member tau.animation.SimpleAnimation.prototype
     * @private
     */
    SimpleAnimation.prototype.add = function(fromTo, option, secondTweenAnimator) {
        var frame, tweenObject, lastTween, st,
            tweenAnimator = secondTweenAnimator || this.tweenAnimator,
            self = this;

        if (typeof fromTo === 'string') {
            frame = ns.AnimationUtil.effectAnalyzer(this.target, fromTo);

            ns.AnimationUtil.createKeyFrame(frame[0], option, function(ft, o, i) {
                if (frame[1] !== undefined) {
                    o.ease = frame[1][i];
                }

                tweenObject = self.target.createTweenInfo(ft, o, true);
                tweenAnimator.add(tweenObject);

                if (frame[2] !== undefined) {
                    if (i === 0) {
                        tweenObject.startCallback.on(function() {
                            self.target.dom.style.webkitTransformOrigin = frame[2];
                        });
                    } else if (i === frame.length) {
                        tweenObject.completeCallback.on(function() {
                            self.target.dom.style.webkitTransformOrigin = '';
                        });
                    }
                }

                if (frame[3] !== undefined) {
                    tweenObject.completeCallback.on(function() {
                        self.target.dom.style.visibility = frame[3];
                    });
                }
            });

            return;
        }

        if (fromTo.effect) {
            if (this.parTweensGroup === undefined) {
                this.parTweensGroup = [];
                st = new ns.TweenAnimator();
                this.parTweensGroup.push(st);
            } else {
                st = this.parTweensGroup[0];
            }

            this.target.render && st.setRender(this.target.render);
            this.target.cur && st.setUpdateTarget(this.target.cur);

            this.add(fromTo.effect, base.deepCopy(option), st);
        }

        if (tweenAnimator.getState() === 'running') {
            tweenObject = self.target.createTweenInfo(fromTo, option, false);

            if (lastTween = tweenAnimator.getLastTweenInfo()) {
                lastTween.completeCallback.on(function() {
                    self.target.setAnimationFromTo(tweenObject);
                });
            }

        } else {
            tweenObject = this.target.createTweenInfo(fromTo, option, true);
        }

        tweenAnimator.add(tweenObject);

    };

    /**
     * Plays tween animation.
     * @method play
     * @member tau.animation.SimpleAnimation.prototype
     * @private
     */
    SimpleAnimation.prototype.play = function() {
        var i , len;
        this.tweenAnimator.play();
        if (this.parTweensGroup) {
            for (i = 0, len = this.parTweensGroup.length; i < len; i++) {
                this.parTweensGroup[i].play();
            }
        }
    };

    /**
     * Stops tween animation.
     * @method stop
     * @member tau.animation.SimpleAnimation.prototype
     * @private
     */
    SimpleAnimation.prototype.stop = function() {
        var i , len;
        this.tweenAnimator.stop();
        if (this.parTweensGroup) {
            for (i = 0, len = this.parTweensGroup.length; i < len; i++) {
                this.parTweensGroup[i].stop();
            }
        }
    };

    /**
     * Makes group of simpleAnimation.
     * @constructor SimpleGroup
     * @param {Array} t
     * The target will be added Simple group.
     * @member tau.animation.SimpleAnimationGroup
     * @private
     */
    function SimpleAnimationGroup(t) {
        var i, simple;

        this.target = [];
        this.len = t.length;

        for (i = 0; i < this.len; i++) {
            if (!(simple = ObjectManager.getObject(t[i]).simpleAnimation)) {
                this.target[i] = new ns.SimpleAnimation(t[i]);
            } else {
                this.target[i] = simple;
            }

        }
    }

    /**
     * Adds animation to TweenObject
     * @method add
     * @param {Object} fromTo
     * @param {Object} option
     * The target will be added simple group
     * @member tau.animation.SimpleGroup.prototype
     * @private
     */
    SimpleAnimationGroup.prototype.add = function(fromTo, option) {
        var completedCnt = 0,
            self = this;

        ns.AnimationUtil.checkStagger(this.target, option, function(t, o, idx) {

            if (option.onComplete) {
                o.onComplete = function() {
                    completedCnt++;
                    if (completedCnt === self.len) {
                        t.tweenAnimator.getCurrentTweenInfo().completeCallback.on(option.onComplete);
                    }
                };
            }

//            t.simpleAnimation.add(fromTo, o);
            t.add(fromTo, o);

        });
    };

    /**
     * Plays animation.
     * @method play
     * The target will be added simple group
     * @member tau.animation.SimpleAnimationGroup.prototype
     * @private
     */
    SimpleAnimationGroup.prototype.play = function() {
        var i;

        for (i = 0; i < this.len; i++) {
            this.target[i].play();
        }
    };

    /**
     * Stop animation.
     * @method play
     * The target will be added simple group
     * @member tau.animation.SimpleAnimationGroup.prototype
     * @private
     */
    SimpleAnimationGroup.prototype.stop = function() {
        var i;

        for (i = 0; i < this.len; i++) {
            this.target[i].stop();
        }
    };

    ns.SimpleAnimation = SimpleAnimation;
    ns.SimpleAnimationGroup = SimpleAnimationGroup;
    ns.SimpleAnimationMixinObject = SimpleAnimationMixinObject;

})(window, ns, ns.base);

/*
 * # SimpleMixin
 *
 * Creates mixin object.
 * If user animate pure DOM such as div, SimpleMixin is going to make appropriate target object.
 *
 * @class ns.SimpleMixin
 */
(function(window, ns) {
    'use strict';
    var SimpleAnimationMixinObject = ns.SimpleAnimationMixinObject;

    /**
     * Returns target after mixin APIs.
     * @method extendAnimation
     * @param {Object} target
     * @param {Object|undefined} getElementFn
     * @return {Object}
     * @member ns.SimpleMixin
     * @static
     */
    var mixin = function(target, getElementFn) {
        var p;

        if (target.prototype !== undefined) {
            (p = isProperty(target.prototype)) && throwMixinException(p);

            for (var i in SimpleAnimationMixinObject) {
                target.prototype[i] = SimpleAnimationMixinObject[i];

            }
        } else if (target instanceof Object) {
            (p = isProperty(target)) && throwMixinException(p);

            for (var i in SimpleAnimationMixinObject) {
                if (SimpleAnimationMixinObject.hasOwnProperty(i)) {
                    target[i] = SimpleAnimationMixinObject[i];
                }
            }
        } else {
            throwMixinException();
        }
        return target;
    };

    function isProperty(t) {
        var propertyTest = ['tween', 'stop', 'transform', 'simpleAnimation'],
            i, len;

        for (i = 0, len = propertyTest.length; i < len; i++) {
            if (t.hasOwnProperty(propertyTest[i])) {
                return propertyTest[i];
            }
        }

        return false;

    }

    function throwMixinException(p) {
        var message = 'Function or Object can apply Mixin';
        (p !== undefined) ? (message += ': \"' + p + '\" is overrided.') : (message += '.');

        console.warn(message);

        //throw "CannotTauAnimationMixinException";
    }

    ns.SimpleMixin = mixin;
})(window, ns);

(function(window, ns) {
    'use strict';

    var ObjectManager = ns.ObjectManager.getInstance();

    /**
     * Returns animation target object
     * @method target
     * @param {String} str
     * The str indicate ID or class name for selecting HTML element
     * @member ns.Target
     * @return {Target} Target Object
     * @public
     * @class ns.Target
     */

    ns.SimpleMixin(ns.DomObject);

    ns.target = function(str) {
        if (typeof str === 'string') {
            var s = str.slice(0, 1), c = str.slice(1),
                result;

            if (s === '.') {
                result = document.getElementsByClassName(c);
                if (!result.tween) {  // TODO: not mixin
                    ns.SimpleMixin(result, function() {
                        return result
                    });
                }
            } else if (s === '#') {
                result = document.getElementById(c);
                result = ObjectManager.getObject(result);
            } else {

            }
        } else {
            if (str instanceof window.HTMLElement) {
                result = ObjectManager.getObject(str);
            } else {

            }
        }

        return result;
    };

    //checking whether jQuery is loaded or not.
    //if (window.jQuery && window.$) {
    //    ns.SimpleMixin($, $.get);
    //} else {
    //    window.$ = ns.$;
    //}

})(window, ns);

})(window);