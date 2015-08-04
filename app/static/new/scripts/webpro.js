/*

 Copyright (c) 2012. Adobe Systems Incorporated.
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.
 Redistributions in binary form must reproduce the above copyright notice,
 this list of conditions and the following disclaimer in the documentation
 and/or other materials provided with the distribution.
 Neither the name of Adobe Systems Incorporated nor the names of its
 contributors may be used to endorse or promote products derived from this
 software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
*/
(function(a, b) {
	function c() {}
	var d = {
		version: 0.1,
		inherit: function(a, b) {
			var c = function() {};
			c.prototype = b.prototype;
			a.prototype = new c;
			a.prototype.constructor = a;
			a.prototype._super = b
		},
		ensureArray: function() {
			var b = [],
				c = arguments.length;
			c > 0 && (b = c > 1 || !a.isArray(arguments[0]) ? a.makeArray(arguments) : arguments[0]);
			return b
		},
		scopedFind: function(b, c, d, h) {
			for (var d = " " + d + " ", l = [], b = a(b).find(c), c = b.length, h = a(h)[0], j = 0; j < c; j++) for (var i = b[j], n = i; n;) {
				if (n.className && (" " + n.className + " ").indexOf(d) !== -1) {
					n === h && l.push(i);
					break
				}
				n = n.parentNode
			}
			return a(l)
		}
	};
	a.extend(c.prototype, {
		bind: function(b, c, d) {
			return a(this).bind(b, c, d)
		},
		unbind: function(b, c) {
			return a(this).unbind(b, c)
		},
		trigger: function(b, c) {
			var d = a.Event(b);
			a(this).trigger(d, c);
			return d
		}
	});
	d.EventDispatcher = c;
	b.WebPro = d
})(jQuery, window, document);
(function(a, b) {
	var c = 1;
	b.ImageLoader = function(c) {
		b.EventDispatcher.call();
		var f = this;
		this.options = a.extend({}, this.defaultOptions, c);
		this._currentEntry = null;
		this._queue = [];
		this._isRunning = this._needsSort = !1;
		this._loader = new Image;
		this._loadFunc = function() {
			f._handleLoad()
		};
		this._loadErrorFunc = function() {
			f._handleError()
		};
		this._timeoutFunc = function() {
			f.trigger("wp-image-loader-timeout", this._currentEntry);
			f._loadNext()
		}
	};
	b.inherit(b.ImageLoader, b.EventDispatcher);
	a.extend(b.ImageLoader.prototype, {
		defaultOptions: {
			timeoutInterval: 1E3
		},
		add: function(d, f) {
			if (d) {
				urls = b.ensureArray(d);
				for (var g = 0; g < urls.length; g++) {
					var k = a.extend({
						reqId: c++,
						src: urls[g],
						width: 0,
						height: 0,
						priority: 50,
						callback: null,
						data: null
					}, f);
					this._queue.push(k);
					this._needsSort = !0;
					this.trigger("wp-image-loader-add", k)
				}
				this._isRunning && !this._currentEntry && this._loadNext()
			}
		},
		reprioritize: function(a, b) {
			if (!(this._currentEntry && this._currentEntry.src == a)) {
				var c;
				for (c = 0; c < this._queue.length; ++c) if (this._queue[c].src == a) break;
				if (c != 0 && c < this._queue.length) this._queue = this._queue.splice(c, b ? this._queue.length - c : 1).concat(this._queue)
			}
		},
		start: function() {
			if (!this._isRunning) this._isRunning = !0, this._loadNext(), this.trigger("wp-image-loader-start")
		},
		stop: function() {
			if (this._isRunning) this._currentEntry && this._queue.unshift(this._currentEntry), this._resetLoader(), this._isRunning = !1, this.trigger("wp-image-loader-stop")
		},
		clearQueue: function() {
			var a = this._isRunning;
			this.stop();
			this._queue.length = 0;
			a && this.start()
		},
		isQueueEmpty: function() {
			return this._queue.length == 0
		},
		_loadNext: function() {
			var d;
			this._resetLoader();
			var a = this._queue;
			if (a.length) {
				if (this._needsSort) d = this._queue = a.sort(function(a, b) {
					var c = a.priority - b.priority;
					return c ? c : a.reqId - b.reqId
				}), a = d, this._needsSort = !1;
				this._currentEntry = a = a.shift();
				var b = this._loader;
				b.onload = this._loadFunc;
				b.onerror = this._loadErrorFunc;
				b.src = a.src
			}
		},
		_resetLoader: function() {
			var a = this._loader;
			a.onload = null;
			a.onerror = null;
			this._currentEntry = a.src = null;
			if (this._timeoutTimerId) clearTimeout(this._timeoutTimerId), this._timeoutTimerId = 0
		},
		_handleLoad: function() {
			var a = this._loader,
				b = this._currentEntry;
			b.width = a.width;
			b.height = a.height;
			b.callback && b.callback(b.src, b.width, b.height, b.data);
			this.trigger("wp-image-loader-load-success", b);
			this._loadNext()
		},
		_handleError: function() {
			this.trigger("wp-image-loader-load-error", this._currentEntry);
			this._loadNext()
		}
	})
})(jQuery, WebPro, window, document);
(function(a, b) {
	function c() {
		b.EventDispatcher.call(this);
		this._initialize.apply(this, arguments)
	}
	b.inherit(c, b.EventDispatcher);
	a.extend(c.prototype, {
		defaultOptions: {},
		_widgetName: "Widget",
		_initialize: function() {
			var b;
			this.plugins = [];
			var c = this.trigger("before-setup");
			c.isDefaultPrevented() || (b = this._setUp.apply(this, arguments), this.trigger("setup"));
			c = this.trigger("before-init-plugins");
			c.isDefaultPrevented() || (this._initializePlugins(b), this.trigger("init-plugins"));
			this.options = a.extend({}, this.defaultOptions, b);
			c = this.trigger("before-extract-data");
			c.isDefaultPrevented() || (this._extractData(), this.trigger("extract-data"));
			c = this.trigger("before-transform-markup");
			c.isDefaultPrevented() || (this._transformMarkup(), this.trigger("transform-markup"));
			c = this.trigger("before-attach-behavior");
			c.isDefaultPrevented() || (this._attachBehavior(), this.trigger("attach-behavior"));
			c = this.trigger("before-ready");
			c.isDefaultPrevented() || (this._ready(), this.trigger("ready"))
		},
		_setUp: function(b, c) {
			this.$element = a(b);
			return c
		},
		_initializePlugins: function(a) {
			for (var a = a || {}, b = ((typeof a.useDefaultPlugins === "undefined" || a.useDefaultPlugins) && this.defaultPlugins ? this.defaultPlugins : []).concat(a.plugins || []), b = b.sort(function(a, b) {
				a = typeof a.priority === "number" ? a.priority : 50;
				b = typeof b.priority === "number" ? b.priority : 50;
				return a - b
			}), c = 0; c < b.length; c++) {
				var k = b[c];
				k && k.initialize && k.initialize(this, a)
			}
			this.plugins = b
		},
		_extractData: function() {},
		_transformMarkup: function() {},
		_attachBehavior: function() {},
		_ready: function() {}
	});
	b.Widget = c;
	b.widget = function(c, f, g) {
		var k = g && f || b.Widget,
			g = g || f || {},
			f = function() {
				k.apply(this, arguments);
				this._widgetName = c
			};
		b.inherit(f, k);
		a.extend(f.prototype, g);
		f.prototype.defaultOptions = a.extend({}, k.prototype.defaultOptions, g.defaultOptions);
		var g = c.split("."),
			h = g.length;
		namespace = h > 1 && g[0] || "Widget";
		c = g[h - 1];
		b[namespace][c] = f
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.Button", b.Widget, {
		defaultOptions: {
			hoverClass: "wp-button-hover",
			activeClass: "wp-button-down",
			disabledClass: "wp-button-disabled",
			disabled: !1,
			callback: null
		},
		_attachBehavior: function() {
			var b = this,
				d = function(f) {
					b.$element.removeClass(b.options.activeClass);
					!b.options.disabled && b.options.callback && b.mouseDown && b.options.callback.call(this, f);
					a(b.$element).off("mouseup pointerup", d);
					b.mouseDown = !1
				};
			this.mouseDown = !1;
			this.$element.on("mouseover", function() {
				b.options.disabled || b.$element.addClass(b.options.hoverClass + (b.mouseDown ? " " + b.options.activeClass : ""))
			}).on("mouseleave", function() {
				b.$element.removeClass(b.options.hoverClass + " " + b.options.activeClass);
				a(b.$element).off("mouseup", d)
			}).on("mousedown pointerdown", function() {
				if (!b.options.disabled) b.mouseDown = !0, b.$element.addClass(b.options.activeClass), a(b.$element).on("mouseup pointerup", d)
			});
			this.disabled(this.options.disabled)
		},
		disabled: function(a) {
			if (typeof a === "boolean") this.options.disabled = a, this.$element[a ? "addClass" : "removeClass"](this.options.disabledClass);
			return this.options.disabled
		}
	});
	a.fn.wpButton = function(a) {
		this.each(function() {
			new b.Widget.Button(this, a)
		});
		return this
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.RadioGroup", b.Widget, {
		_widgetName: "radio-group",
		defaultOptions: {
			defaultIndex: 0,
			hoverClass: "wp-radio-hover",
			downClass: "wp-radio-down",
			disabledClass: "wp-radio-disabled",
			checkedClass: "wp-radio-checked",
			disabled: !1,
			toggleStateEnabled: !1
		},
		_attachBehavior: function() {
			var a = this;
			this.buttons = [];
			this.activeElement = null;
			this.activeIndex = -1;
			this.$element.each(function() {
				a.buttons.push(a._addButtonBehavior(this))
			});
			this.disabled(this.options.disabled)
		},
		_addButtonBehavior: function(a) {
			var d = this,
				f = new b.Widget.Button(a, {
					hoverClass: this.options.hoverClass,
					downClass: this.options.downClass,
					disabledClass: this.options.disabledClass,
					callback: function(b) {
						return d._handleClick(b, f, a)
					}
				});
			return f
		},
		_handleClick: function(a, b, f) {
			this.options.disabled || this.checkButton(f)
		},
		_getElementIndex: function(b) {
			return b ? a.inArray(b, this.$element.get()) : -1
		},
		_getElementByIndex: function(a) {
			return a >= 0 ? this.$element.eq(a)[0] : null
		},
		_getElement: function(a) {
			return typeof a === "number" ? this._getElementByIndex(a) : a
		},
		checkButton: function(b) {
			var b = this._getElement(b),
				d = this.activeElement,
				f = this.options.checkedClass;
			b !== d ? (d && a(d).removeClass(f), b && a(b).addClass(f)) : this.options.toggleStateEnabled && b && (a(b).removeClass(f), b = null);
			this.activeElement = b;
			this.activeIndex = this._getElementIndex(b)
		},
		disabled: function(b) {
			if (typeof b === "boolean") this.disabled = b, a.each(this.buttons, function() {
				this.disabled(b)
			});
			return this.options.disabled
		}
	});
	a.fn.wpRadioGroup = function(a) {
		new b.Widget.RadioGroup(this, a);
		return this
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.TabGroup", b.Widget.RadioGroup, {
		defaultOptions: {
			defaultIndex: 0,
			hoverClass: "wp-tab-hover",
			downClass: "wp-tab-down",
			disabledClass: "wp-tab-disabled",
			checkedClass: "wp-tab-active",
			disabled: !1,
			toggleStateEnabled: !1
		},
		selectTab: function(a) {
			this.checkButton(a)
		},
		checkButton: function(a) {
			var b = this._getElement(a),
				f = this._getElementIndex(b),
				b = {
					tab: b,
					tabIndex: f
				};
			this.trigger("wp-tab-before-select", b);
			this._super.prototype.checkButton.apply(this, arguments);
			this.trigger("wp-tab-select", b)
		}
	});
	a.fn.wpTabGroup = function(a) {
		new b.Widget.TabGroup(this, a);
		return this
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.PanelGroup", b.Widget, {
		_widgetName: "panel-group",
		defaultOptions: {
			defaultIndex: 0,
			panelClass: "wp-panel",
			activeClass: "wp-panel-active",
			toggleStateEnabled: !1,
			tabGroups: null
		},
		_setUp: function() {
			var a = this;
			this.tabGroups = [];
			this._tabCallback = function(b, f) {
				a._handleTabSelect(b, f)
			};
			this.showLock = 0;
			this.tabDriver = null;
			return this._super.prototype._setUp.apply(this, arguments)
		},
		_attachBehavior: function() {
			this.activeElement = null;
			this.activeIndex = -1;
			this.$element.addClass(this.options.panelClass);
			var a = this.options.defaultIndex;
			typeof a === "number" && a >= 0 && this.showPanel(a);
			this.addTabGroup(this.options.tabGroups)
		},
		_getElementIndex: function(b) {
			return b ? a.inArray(b, this.$element.get()) : -1
		},
		_getElementByIndex: function(a) {
			return this.$element.eq(a)[0]
		},
		_getElement: function(a) {
			return typeof a === "number" ? this._getElementByIndex(a) : a
		},
		showPanel: function(b) {
			if (!this.showLock) {
				++this.showLock;
				var d = this._getElement(b),
					f = this.activeElement,
					g = this.options.activeClass;
				if (d) if (d !== f) {
					b = {
						panel: d,
						panelIndex: this._getElementIndex(d)
					};
					this.trigger("wp-panel-before-show", b);
					f && this.hidePanel(f);
					a(d).addClass(g);
					this.activeElement = d;
					this.activeIndex = this._getElementIndex(d);
					d = this.tabGroups;
					for (f = 0; f < d.length; f++) g = d[f], g !== this.tabDriver && g.selectTab(this.activeIndex);
					this.trigger("wp-panel-show", b)
				} else this.options.toggleStateEnabled && this.hidePanel(d);
				--this.showLock
			}
		},
		hidePanel: function(b) {
			if (b = typeof b === "number" ? this.$element.eq(b)[0] : b) {
				var d = {
					panel: b,
					panelIndex: this._getElementIndex(b)
				};
				this.trigger("wp-panel-before-hide", d);
				a(b).removeClass(this.options.activeClass);
				if (b === this.activeElement) this.activeElement = null, this.activeIndex = -1;
				this.trigger("wp-panel-hide", d)
			}
		},
		_handleTabSelect: function(a, b) {
			if (!this.showLock) this.tabDriver = a.target, this.showPanel(b.tabIndex), this.tabDriver = null
		},
		addTabGroup: function(c) {
			if (c) for (var c = b.ensureArray(c), d = c.length, f = 0; f < d; f++) {
				var g = c[f];
				a.inArray(this.tabGroups, g) === -1 && (this.tabGroups.push(g), g.selectTab(this.activeIndex), g.bind("wp-tab-select", this._tabCallback))
			}
		},
		removeTabGroup: function(c) {
			for (var c = b.ensureArray(c), d = c.length, f = 0; f < d; f++) {
				var g = c[f];
				sets = this.tabGroups;
				loc = a.inArray(sets, g);
				loc !== -1 && sets.splice(loc, 1)
			}
		}
	});
	a.fn.wpPanelGroup = function(a) {
		new b.Widget.PanelGroup(this, a);
		return this
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.Disclosure", b.Widget, {
		defaultOptions: {
			widgetClassName: "wp-disclosure-panels",
			tabClassName: "wp-disclosure-panels-tab",
			tabHoverClassName: "wp-disclosure-panels-tab-hover",
			tabDownClassName: "wp-disclosure-panels-tab-down",
			panelClassName: "wp-disclosure-panels-panel",
			tabActiveClassName: "wp-disclosure-panels-tab-active",
			panelActiveClassName: "wp-disclosure-panels-panel-active",
			defaultIndex: 0,
			toggleStateEnabled: !1
		},
		_attachBehavior: function() {
			var a = this.$element[0],
				d = this.options.widgetClassName,
				f = b.scopedFind(a, "." + this.options.tabClassName, d, a),
				a = b.scopedFind(a, "." + this.options.panelClassName, d, a);
			this.tabs = new b.Widget.TabGroup(f, {
				hoverClass: this.options.tabHoverClassName,
				downClass: this.options.tabDownClassName,
				checkedClass: this.options.tabActiveClassName,
				toggleStateEnabled: this.options.toggleStateEnabled
			});
			this.panels = new b.Widget.PanelGroup(a, {
				panelClass: this.options.panelClassName,
				activeClass: this.options.panelActiveClassName,
				defaultIndex: this.options.defaultIndex,
				toggleStateEnabled: this.options.toggleStateEnabled
			});
			this.panels.addTabGroup(this.tabs)
		}
	});
	b.widget("Widget.TabbedPanels", b.Widget.Disclosure, {
		defaultOptions: {
			widgetClassName: "wp-tabbed-panels-panels",
			tabClassName: "wp-tabbed-panels-panels-tab",
			tabHoverClassName: "wp-tabbed-panels-panels-tab-hover",
			tabDownClassName: "wp-tabbed-panels-panels-tab-down",
			tabActiveClassName: "wp-tabbed-panels-panels-tab-active",
			panelClassName: "wp-tabbed-panels-panels-panel",
			panelActiveClassName: "wp-tabbed-panels-panels-panel-active",
			toggleStateEnabled: !1
		}
	});
	b.widget("Widget.Accordion", b.Widget.Disclosure, {
		defaultOptions: {
			widgetClassName: "wp-accordion",
			tabClassName: "wp-accordion-tab",
			tabHoverClassName: "wp-accordion-tab-hover",
			tabDownClassName: "wp-accordion-tab-down",
			tabActiveClassName: "wp-accordion-tab-active",
			panelClassName: "wp-accordion-panel",
			panelActiveClassName: "wp-accordion-panel-active",
			toggleStateEnabled: !1
		}
	})
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.Widget.Disclosure.DisplayPropertyTransitionPlugin = {
		defaultOptions: {},
		initialize: function(b, d) {
			var f = this;
			a.extend(d, a.extend({}, f.defaultOptions, d));
			b.bind("attach-behavior", function() {
				f._attachBehavior(b)
			})
		},
		_attachBehavior: function(a) {
			var a = a.panels,
				b = a.$element,
				f = a.activeIndex;
			a.bind("wp-panel-show", function(a, b) {
				b.panel.style.display = "block"
			});
			a.bind("wp-panel-hide", function(a, b) {
				b.panel.style.display = "none"
			});
			b.each(function(a) {
				this.style.display = a !== f ? "none" : "block"
			})
		}
	};
	b.Widget.Disclosure.AccordionTransitionPlugin = {
		defaultOptions: {
			transitionDirection: "vertical",
			transitionDuration: 500,
			dispatchTransitionEvents: !0
		},
		initialize: function(b, d) {
			var f = this;
			a.extend(d, a.extend({}, f.defaultOptions, d));
			b.bind("attach-behavior", function() {
				f._attachBehavior(b)
			})
		},
		_attachBehavior: function(b) {
			var d = this,
				f = b.panels,
				g = f.$element,
				k = f.activeIndex,
				h = b.options.transitionDirection,
				l = b.options.widgetClassName === "AccordionWidget" ? a(g[0]).closest("*[data-rotate]") : null;
			if (l && l.length > 0) b.options.marginBottom = Muse.Utils.getCSSIntValue(l, "margin-bottom"), b.options.originalHeight = l[0].scrollHeight;
			b.options.rotatedAccordion = l;
			f.bind("wp-panel-show", function(a, g) {
				d._showPanel(b, g)
			});
			f.bind("wp-panel-hide", function(a, g) {
				d._hidePanel(b, g)
			});
			g.each(function(b) {
				if (b !== k) {
					a(this).css("overflow", "hidden");
					if (h === "vertical" || h === "both") this.style.height = "0";
					if (h === "horizontal" || h === "both") this.style.width = "0"
				}
			})
		},
		_updateMarginBottomForRotatedAccordion: function(a) {
			a.options.rotatedAccordion.css("margin-bottom", Math.round(a.options.marginBottom - (a.options.rotatedAccordion[0].scrollHeight - a.options.originalHeight)) + "px")
		},
		_transitionPanel: function(b, d, f) {
			a("body").trigger("wp-page-height-change", d - b);
			if ((b = f.options.rotatedAccordion) && b.length > 0) {
				if (f.options.originalHeight == 0 && "undefined" !== typeof d) f.options.marginBottom = Muse.Utils.getCSSIntValue(b, "margin-bottom"), f.options.originalHeight = b[0].scrollHeight;
				this._updateMarginBottomForRotatedAccordion(f)
			}
		},
		_showPanel: function(b, d) {
			var f = b.options,
				g = f.transitionDirection,
				k = a(d.panel),
				h = {},
				l = f.dispatchTransitionEvents,
				j = this,
				i = k.height(),
				n = function(a) {
					a = parseInt(a.elem.style.height);
					j._transitionPanel(i, a, b);
					i = a
				};
			if (g === "vertical" || g === "both") h.height = k[0].scrollHeight + "px";
			if (g === "horizontal" || g === "both") h.width = k[0].scrollWidth + "px";
			k.stop(!0, !0).queue("animationFrameFx", a.animationFrameFx).animate(h, {
				duration: f.transitionDuration,
				progress: l ? n : null,
				queue: "animationFrameFx",
				complete: function() {
					var a = {
						overflow: ""
					};
					if (g === "vertical" || g === "both") a.height = "auto";
					if (g === "horizontal" || g === "both") a.width = "auto";
					k.css(a);
					(a = b.options.rotatedAccordion) && a.length > 0 && j._updateMarginBottomForRotatedAccordion(b)
				}
			}).dequeue("animationFrameFx")
		},
		_hidePanel: function(b, d) {
			var f = b.options,
				g = f.transitionDirection,
				k = a(d.panel),
				h = {},
				l = f.dispatchTransitionEvents,
				j = this,
				i = k.height(),
				n = function(a) {
					a = parseInt(a.elem.style.height);
					j._transitionPanel(i, a, b);
					i = a
				};
			if (g === "vertical" || g === "both") h.height = "0";
			if (g === "horizontal" || g === "both") h.width = "0";
			k.stop(!0, !0).queue("animationFrameFx", a.animationFrameFx).animate(h, {
				duration: f.transitionDuration,
				queue: "animationFrameFx",
				progress: l ? n : null,
				complete: function() {
					k.css("overflow", "hidden");
					var a = b.options.rotatedAccordion;
					a && a.length > 0 && j._updateMarginBottomForRotatedAccordion(b)
				}
			}).dequeue("animationFrameFx")
		}
	}
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.SlideShowBase", b.Widget, {
		_widgetName: "slideshow-base",
		defaultOptions: {
			displayInterval: 6E3,
			autoPlay: !1,
			loop: !0,
			playOnce: !1
		},
		_setUp: function() {
			var a = this;
			this._ssTimer = 0;
			this._ssTimerTriggered = !1;
			this._ssTimerCallback = function() {
				a._ssTimerTriggered = !0;
				a.next();
				a._ssTimerTriggered = !1
			};
			return b.Widget.prototype._setUp.apply(this, arguments)
		},
		_ready: function() {
			this.options.autoPlay && this.play()
		},
		play: function(a) {
			e = this.trigger("wp-slideshow-before-play");
			e.isDefaultPrevented() || (this._startTimer(!1, a), this.trigger("wp-slideshow-play"))
		},
		stop: function() {
			e = this.trigger("wp-slideshow-before-stop");
			e.isDefaultPrevented() || (this._stopTimer(), this.trigger("wp-slideshow-stop"))
		},
		isPlaying: function() {
			return this._ssTimer !== 0
		},
		_startTimer: function(a, b) {
			this._stopTimer();
			var f = b ? 0 : this.options.displayInterval;
			a && (f += this.options.transitionDuration);
			this._ssTimer = setTimeout(this._ssTimerCallback, f)
		},
		_stopTimer: function() {
			this._ssTimer && clearTimeout(this._ssTimer);
			this._ssTimer = 0
		},
		_executeCall: function(a, b) {
			e = this.trigger("wp-slideshow-before-" + a);
			e.isDefaultPrevented() || (this["_" + a].apply(this, b) && this.stop(), this.isPlaying() && this._startTimer(!0), this.trigger("wp-slideshow-" + a))
		},
		first: function() {
			return this._executeCall("first", arguments)
		},
		last: function() {
			return this._executeCall("last", arguments)
		},
		previous: function() {
			return this._executeCall("previous", arguments)
		},
		next: function() {
			return this._executeCall("next", arguments)
		},
		goTo: function() {
			return this._executeCall("goTo", arguments)
		},
		close: function() {
			return this._executeCall("close", arguments)
		},
		_first: function() {},
		_last: function() {},
		_previous: function() {},
		_next: function() {},
		_goTo: function() {},
		_close: function() {}
	})
})(jQuery, WebPro, window, document);
(function(a, b) {
	b.widget("Widget.ContentSlideShow", b.Widget.SlideShowBase, {
		_widgetName: "content-slideshow",
		defaultOptions: {
			slideshowClassName: "wp-slideshow",
			clipClassName: "wp-slideshow-clip",
			viewClassName: "wp-slideshow-view",
			slideClassName: "wp-slideshow-slide",
			slideLinkClassName: "wp-slideshow-slide-link",
			firstBtnClassName: "wp-slideshow-first-btn",
			lastBtnClassName: "wp-slideshow-last-btn",
			prevBtnClassName: "wp-slideshow-prev-btn",
			nextBtnClassName: "wp-slideshow-next-btn",
			playBtnClassName: "wp-slideshow-play-btn",
			stopBtnClassName: "wp-slideshow-stop-btn",
			closeBtnClassName: "wp-slideshow-close-btn",
			playingClassName: "wp-slideshow-playing"
		},
		_findWidgetElements: function(a) {
			var d = this.$element[0];
			return b.scopedFind(d, a, this.options.slideshowClassName, d)
		},
		_attachBtnHandler: function(a, b) {
			var f = this;
			this["$" + b + "Btn"] = this._findWidgetElements("." + a).bind("click", function(a) {
				f[b]();
				a.preventDefault()
			})
		},
		_getAjaxSrcForImage: function(a) {
			return a.data("src")
		},
		_reprioritizeImageLoadingIfRequired: function(b) {
			!this._isLoaded(b) && this._cssilLoader && !this._cssilLoader.isQueueEmpty() && (b = a(this.slides.$element[b]), this._cssilLoader.reprioritize(this._getAjaxSrcForImage(b.is("img") ? b : b.find("img")), this.isPlaying()))
		},
		_attachBehavior: function() {
			var a = this,
				d = this.options;
			this._super.prototype._attachBehavior.call(this);
			this._panelShowCallback = function() {
				a._ssTimerTriggered || a.isPlaying() && a._startTimer(!1)
			};
			this.$element.addClass(d.slideshowClassName);
			var f = this._findWidgetElements("." + d.slideClassName),
				g = this._findWidgetElements("." + d.slideLinkClassName),
				k = d.event === "click" && d.deactivationEvent === "mouseout_click";
			this.slides = new b.Widget.PanelGroup(f, {
				defaultIndex: d.defaultIndex || 0,
				toggleStateEnabled: k
			});
			this.slides.bind("wp-panel-show", this._panelShowCallback);
			this.tabs = null;
			if (g.length) this.tabs = new b.Widget.TabGroup(g, {
				defaultIndex: d.defaultIndex || 0,
				toggleStateEnabled: k
			}), this.slides.addTabGroup(this.tabs);
			this.slides.bind("wp-panel-before-show", function(b, g) {
				a._reprioritizeImageLoadingIfRequired(g.panelIndex)
			});
			this._attachBtnHandler(d.firstBtnClassName, "first");
			this._attachBtnHandler(d.lastBtnClassName, "last");
			this._attachBtnHandler(d.prevBtnClassName, "previous");
			this._attachBtnHandler(d.nextBtnClassName, "next");
			this._attachBtnHandler(d.playBtnClassName, "play");
			this._attachBtnHandler(d.stopBtnClassName, "stop");
			this._attachBtnHandler(d.closeBtnClassName, "close");
			this.bind("wp-slideshow-play", function() {
				this.$element.addClass(d.playingClassName)
			});
			this.bind("wp-slideshow-stop", function() {
				this.$element.removeClass(d.playingClassName)
			})
		},
		_first: function() {
			this.slides.showPanel(0)
		},
		_last: function() {
			var a = this.slides;
			a.showPanel(a.$element.length - 1)
		},
		_previous: function() {
			var a = this.slides,
				b = a.$element.length,
				f = a.activeIndex,
				b = (f < 1 ? b : f) - 1;
			!this.options.loop && 0 == f ? this.isPlaying() && this.stop() : a.showPanel(b)
		},
		_next: function() {
			var a = this.slides,
				b = a.activeIndex,
				f = (b + 1) % a.$element.length;
			!this.options.loop && 0 == f ? this.isPlaying() && this.stop() : this.options.playOnce && 0 == f && this.isPlaying() ? this.stop() : (!this.isPlaying() || this._isLoaded(b) && this._isLoaded(f)) && a.showPanel(f)
		},
		_goTo: function() {
			var a = this.slides;
			a.showPanel.apply(a, arguments)
		},
		_close: function() {
			var a = this.slides;
			a.hidePanel(a.activeElement)
		},
		_isLoaded: function(b) {
			if (this._csspIsImageSlideShow && (b = a(this.slides.$element[b]), b = b.is("img") ? b : b.find("img"), b.length > 0 && (b.hasClass(this.options.imageIncludeClassName) || !b[0].complete))) return !1;
			return !0
		}
	})
})(jQuery, WebPro, window, document);
(function(a, b, c, d, f) {
	b.Widget.ContentSlideShow.fadingTransitionPlugin = {
		defaultOptions: {
			transitionDuration: 500
		},
		initialize: function(b, c) {
			var d = this;
			a.extend(c, a.extend({}, d.defaultOptions, c));
			b.bind("attach-behavior", function() {
				d.attachBehavior(b)
			})
		},
		attachBehavior: function(b) {
			var k = this,
				h = b.slides,
				l = h.$element,
				j = h.activeIndex,
				i = b._findWidgetElements("." + b.options.viewClassName);
			h.bind("wp-panel-show", function(c, d) {
				k._showElement(b, a(d.panel));
				b.options.contentLayout_runtime === "stack" && k._showElement(b, b.$closeBtn)
			}).bind("wp-panel-hide", function(c, d) {
				k._hideElement(b, a(d.panel))
			});
			b.options.contentLayout_runtime === "stack" && b.bind("wp-slideshow-close", function() {
				k._hideElement(b, b.$closeBtn)
			});
			for (var n = 0; n < l.length; n++) if (n !== j) l[n].style.display = "none";
			if (b.options.elastic === "fullWidth") {
				var o = a(c),
					p = a(d.body),
					q = function(c) {
						c === f && (c = Math.max(o.width(), parseInt(p.css("min-width"))));
						b.options.contentLayout_runtime !== "lightbox" && i.css("left", i.position().left - i.offset().left);
						i.width(c);
						k._showElement(b, a(h.activeElement))
					};
				q();
				for (n = 0; n < l.length; n++) {
					var m = a(l[n]);
					m.width("100%");
					m.addClass("borderbox")
				}
				if (b.options.contentLayout_runtime === "lightbox") b._fstpPositionSlides = q;
				else o.on("orientationchange resize", function() {
					q()
				})
			}
			j === -1 && b.options.contentLayout_runtime === "stack" && b.$closeBtn.hide();
			if (Muse.Browser.Features.Touch && b.options.enableSwipe === !0) {
				var r = b.options.transitionDuration;
				b._ftpSwipeNoInterrupt = !1;
				l.each(function() {
					var c = a(this);
					c.data("opacity", c.css("opacity"));
					var d = Muse.Utils.getCanvasDirection(c, "horizontal"),
						h = d.dir === "horizontal",
						f = d.reverse;
					if (d = c.swipe.defaults.excludedElements) {
						var d = d.split(/\s*,\s*/),
							j = d.indexOf("a");
						if (0 <= j) d.splice(j, 1), c.swipe.defaults.excludedElements = d.join(", ")
					}
					c.swipe({
						triggerOnTouchEnd: !0,
						allowPageScroll: h ? "vertical" : "horizontal",
						threshold: 75,
						swipeStatus: function(a, c, d, j) {
							b.stop();
							if (c == "move" && (h && (d == "left" || d == "right") || !h && (d == "up" || d == "down"))) k._scrollTo(b, -1, j * (!f && (d == "left" || d == "up") || f && (d == "right" || d == "down") ? 1 : -1), 0);
							else if (c == "cancel") k._scrollTo(b, b.slides.activeIndex, 0, r);
							else if (c == "end") {
								a = b.slides.activeIndex;
								c = -1;
								if (h && (d == "right" && !f || d == "left" && f) || !h && (d == "down" && !f || d == "up" && f)) c = a - 1 < 0 ? l.length - 1 : a - 1;
								else if (h && (d == "left" && !f || d == "right" && f) || !h && (d == "up" && !f || d == "down" && f)) c = a + 1 > l.length - 1 ? 0 : a + 1;
								c != -1 && k._scrollTo(b, c, 0, r)
							}
						}
					})
				})
			}
		},
		_showElement: function(a, b) {
			var c = !1,
				d = function() {
					c || (c = !0, b.show().css("opacity", ""))
				},
				f = setTimeout(d, a.options.transitionDuration + 10);
			b.stop(!1, !0).fadeIn(a.options.transitionDuration, function() {
				clearTimeout(f);
				d()
			})
		},
		_hideElement: function(a, b) {
			var c = !1,
				d = function() {
					c || (c = !0, b.hide().css("opacity", ""))
				},
				f = setTimeout(d, a.options.transitionDuration + 10);
			b.stop(!1, !0).fadeOut(a.options.transitionDuration, function() {
				clearTimeout(f);
				d()
			})
		},
		_scrollTo: function(b, c, d, f) {
			if (!b._ftpSwipeNoInterrupt) {
				var j = b.slides.$element,
					i = b.slides.activeIndex,
					n = c == -1;
				c == -1 && (c = d < 0 ? i - 1 < 0 ? j.length - 1 : i - 1 : i + 1 > j.length - 1 ? 0 : i + 1);
				var o = a(j[i]),
					p = a(j[c]);
				if (!n && d == 0 || i == c) {
					b._ftpSwipeNoInterrupt = !0;
					var q = 0,
						m = !1,
						r = function() {
							if (!m && (m = !0, p.show().css("opacity", ""), c != i && b.slides.showPanel(c), ++q == j.length)) b._ftpSwipeNoInterrupt = !1
						};
					if (p.css("opacity") != p.data("opacity")) {
						var t = setTimeout(r, f + 10);
						p.stop(!1, !0).animate({
							opacity: p.data("opacity")
						}, f, function() {
							clearTimeout(t);
							r()
						})
					} else r();
					j.each(function(d) {
						var h = a(this),
							o = !1,
							i = function() {
								if (!o && (o = !0, h.hide().css("opacity", ""), ++q == j.length)) b._ftpSwipeNoInterrupt = !1
							},
							p;
						d != c && (h.css("display") != "none" && h.css("opacity") != 0 ? (p = setTimeout(i, f + 10), h.stop(!1, !0).animate({
							opacity: 0
						}, f, function() {
							clearTimeout(p);
							i()
						})) : i())
					})
				} else d = Math.abs(d), n = o.width(), d > n && (d = n), d = p.data("opacity") * (d / n), n = o.data("opacity") * (1 - d), o.stop(!1, !0).animate({
					opacity: n
				}, f), p.stop(!1, !0).show().animate({
					opacity: d
				}, f)
			}
		}
	};
	b.Widget.ContentSlideShow.filmstripTransitionPlugin = {
		defaultOptions: {
			transitionDuration: 500,
			transitionStyle: "horizontal"
		},
		initialize: function(b, c) {
			var d = this;
			a.extend(c, a.extend({}, d.defaultOptions, c));
			b.bind("attach-behavior", function() {
				d.attachBehavior(b)
			})
		},
		attachBehavior: function(b) {
			var k = this,
				h = a(c),
				l = a(d.body),
				j = function() {
					return i.elastic === "fullWidth" ? Math.max(h.width(), parseInt(l.css("min-width"))) : q.width()
				},
				i = b.options,
				n = i.transitionStyle === "horizontal",
				o = b.slides,
				p = o.$element,
				q = b._findWidgetElements("." + i.clipClassName),
				m = b._findWidgetElements("." + i.viewClassName),
				r = j(),
				t = q.height(),
				x = {
					top: "0",
					left: "0"
				},
				y = q.css("position");
			y !== "absolute" && y !== "fixed" && i.elastic !== "fullScreen" && q.css("position", "relative");
			m.css("position") !== "absolute" && (x.position = "relative");
			b._fstp$Clip = q;
			b._fstp$View = m;
			b._fstpStyleProp = n ? "left" : "top";
			b._fstpStylePropZero = n ? "top" : "left";
			o.bind("wp-panel-show", function(a, c) {
				k._goToSlide(b, c.panel, i.transitionDuration);
				b.options.contentLayout_runtime === "stack" && b.$closeBtn.stop(!0).fadeIn(i.transitionDuration)
			});
			b.options.contentLayout_runtime === "stack" && b.bind("wp-slideshow-close", function() {
				q.css({
					opacity: 0.99
				}).stop(!0).animate({
					opacity: 0
				}, {
					queue: !1,
					duration: i.transitionDuration,
					complete: function() {
						x[b._fstpStyleProp] = (n ? q.width() : q.height()) + "px";
						x[b._fstpStylePropZero] = "0";
						m.css(x);
						q.css({
							opacity: ""
						})
					}
				});
				b.$closeBtn.stop(!0).fadeOut(i.transitionDuration)
			});
			b._fstpRequestType = null;
			b.bind("wp-slideshow-before-previous wp-slideshow-before-next", function(a) {
				b._fstpRequestType = a.type.replace(/.*-/, "");
				b._fstpOldActiveIndex = b.slides.activeIndex
			}).bind("wp-slideshow-previous wp-slideshow-next", function() {
				b._fstpRequestType = null;
				b._fstpOldActiveIndex = -1
			});
			var F = function(a, c) {
					if (a === f || c === f) a = j(), c = q.height();
					i.elastic === "fullWidth" && (c = q.height(), q.width(a), i.contentLayout_runtime !== "lightbox" && q.css("left", q.position().left - q.offset().left), m.width(a));
					for (var d = 0, h = n ? a : c, l = b._fstpStyleProp, r = b._fstpStylePropZero, t = 0; t < p.length; t++) {
						var v = p[t].style;
						v[r] = "0";
						v[l] = d + "px";
						v.margin = "0";
						v.position = "absolute";
						d += h
					}
					k._goToSlide(b, o.activeElement, 0);
					return d
				},
				y = F();
			if (i.elastic === "fullWidth") for (var v = 0; v < p.length; v++) {
				var C = a(p[v]);
				C.width("100%");
				C.addClass("borderbox")
			}
			if (i.elastic !== "off") if (i.contentLayout_runtime === "lightbox") b._fstpPositionSlides = F;
			else h.on("orientationchange resize", function() {
				F()
			});
			else x[n ? "width" : "height"] = y + "px", x[n ? "height" : "width"] = (n ? t : r) + "px";
			o.activeElement || (x[b._fstpStyleProp] = (n ? r : t) + "px", x[b._fstpStylePropZero] = "0", b.options.contentLayout_runtime === "stack" && b.$closeBtn.hide());
			x.overflow = "visible";
			m.css(x);
			k._goToSlide(b, o.activeElement, i.transitionDuration)
		},
		_goToSlide: function(b, c, d) {
			if (b) {
				var f = a(c),
					j = b._fstp$View,
					i = b._fstpStyleProp,
					n = i === "left" ? "offsetLeft" : "offsetTop",
					o = i === "left" ? "offsetWidth" : "offsetHeight",
					p = c ? -c[n] : b._fstp$Clip[0][o],
					q = {};
				q[i] = p + "px";
				var m = b._fstpRequestType,
					r = b._fstpOldActiveIndex;
				if (m && r !== -1) {
					var t = b.slides.activeIndex,
						x = b.slides.$element.length - 1;
					if (t !== r) {
						var y = 0;
						m === "previous" && r === 0 && t === x ? y = -c[o] : m === "next" && r === x && t === 0 && (b = b.slides.$element[r], y = b[n] + b[o]);
						y && (q[i] = -y + "px", f.css(i, y + "px"))
					}
				}
				j.stop(!1, !0).animate(q, d, function() {
					y && (f.css(i, -p + "px"), j.css(i, p + "px"))
				})
			}
		}
	};
	b.Widget.ContentSlideShow.alignPartsToPagePlugin = {
		defaultOptions: {
			alignPartToPageClassName: "wp-slideshow-align-part-to-page"
		},
		initialize: function(b, c) {
			var d = this;
			a.extend(c, a.extend({}, d.defaultOptions, c));
			b.bind("attach-behavior", function() {
				d.attachBehavior(b)
			})
		},
		attachBehavior: function(b) {
			if (!("fullWidth" !== b.options.elastic || !b.$element.hasClass("align_parts_to_page") || "fixed" !== b.$element.css("position") || b.options.contentLayout_runtime === "lightbox")) {
				var d = a(c),
					f = a("#page"),
					l = b.options,
					j = function() {
						var c = f.offset().left + "px";
						a("." + l.alignPartToPageClassName, b.$element).each(function() {
							a(this).css("margin-left", c)
						})
					};
				b.$element.children().each(function() {
					var b = a(this);
					0 < a("." + l.viewClassName, b).length || b.addClass(l.alignPartToPageClassName)
				});
				j();
				d.on("orientationchange resize", function() {
					j()
				})
			}
		}
	};
	b.Widget.ContentSlideShow.swipeTransitionPlugin = {
		defaultOptions: {
			transitionDuration: 500,
			transitionStyle: "horizontal"
		},
		initialize: function(b, c) {
			var d = this;
			a.extend(c, a.extend({}, d.defaultOptions, c));
			b.bind("attach-behavior", function() {
				d.attachBehavior(b)
			})
		},
		attachBehavior: function(b) {
			var k = this,
				h = a(c),
				l = a(d.body),
				j = function() {
					return i.elastic === "fullWidth" ? Math.max(h.width(), parseInt(l.css("min-width"))) : q.width()
				},
				i = b.options,
				n = i.transitionStyle === "horizontal",
				o = b.slides,
				p = o.$element,
				q = b._findWidgetElements("." + i.clipClassName),
				m = b._findWidgetElements("." + i.viewClassName),
				r = j(),
				t = q.height(),
				x = function(a, b) {
					if (a === f || b === f) a = j(), b = q.height();
					return n ? a : b
				},
				y = x();
			viewProps = {
				top: "0",
				left: "0"
			};
			q.css("position") !== "absolute" && i.elastic !== "fullScreen" && q.css("position", "relative");
			m.css("position") !== "absolute" && (viewProps.position = "relative");
			b._fstp$Clip = q;
			b._fstp$View = m;
			b._fstpStyleProp = n ? "left" : "top";
			b._fstpStylePropZero = n ? "top" : "left";
			o.bind("wp-panel-show", function() {
				var a = b.slides.activeIndex * x(),
					c = b.options.transitionDuration;
				a == 0 && b.slides.activeIndex == 0 && !i.shuffle && b.isPlaying() && (c = 0);
				k._scrollTo(b, a, c);
				b.options.contentLayout_runtime === "stack" && b.$closeBtn.stop(!0).fadeIn(c)
			});
			b.options.contentLayout_runtime === "stack" && b.bind("wp-slideshow-close", function() {
				q.css({
					opacity: 0.99
				}).stop(!0).animate({
					opacity: 0
				}, {
					queue: !1,
					duration: i.transitionDuration,
					complete: function() {
						k._scrollTo(b, -x(), 0);
						q.css({
							opacity: ""
						})
					}
				});
				b.$closeBtn.stop(!0).fadeOut(b.options.transitionDuration)
			});
			b._fstpRequestType = null;
			b.bind("wp-slideshow-before-previous wp-slideshow-before-next", function(a) {
				b._fstpRequestType = a.type.replace(/.*-/, "");
				b._fstpOldActiveIndex = b.slides.activeIndex
			}).bind("wp-slideshow-previous wp-slideshow-next", function() {
				b._fstpRequestType = null;
				b._fstpOldActiveIndex = -1
			});
			var F = function(a, c) {
					if (a === f || c === f) a = j(), c = q.height();
					i.elastic === "fullWidth" && (c = q.height(), q.width(a), i.contentLayout_runtime !== "lightbox" && q.css("left", q.position().left - q.offset().left), m.width(a));
					for (var d = 0, h = n ? a : c, l = b._fstpStyleProp, r = b._fstpStylePropZero, t = 0; t < p.length; t++) {
						var s = p[t].style;
						s[r] = "0";
						s[l] = d + "px";
						s.margin = "0";
						s.position = "absolute";
						d += h
					}
					m.css(n ? "width" : "height", d);
					k._scrollTo(b, o.activeIndex * h, 0);
					return d
				},
				v = F();
			if (i.elastic === "fullWidth") for (var C = 0; C < p.length; C++) {
				var z = a(p[C]);
				z.width("100%");
				z.addClass("borderbox")
			}
			if (i.elastic !== "off") if (i.lightboxEnabled_runtime) b._fstpPositionSlides = F;
			else h.on("orientationchange resize", function() {
				F()
			});
			else viewProps[n ? "width" : "height"] = v + "px", viewProps[n ? "height" : "width"] = (n ? t : r) + "px";
			viewProps.overflow = "visible";
			m.css(viewProps);
			var r = Muse.Utils.getCanvasDirection(m, i.transitionStyle),
				s = r.dir === "horizontal",
				E = r.reverse,
				M = b.options.transitionDuration;
			if (r = m.swipe.defaults.excludedElements) if (r = r.split(/\s*,\s*/), t = r.indexOf("a"), 0 <= t) r.splice(t, 1), m.swipe.defaults.excludedElements = r.join(", ");
			m.swipe({
				triggerOnTouchEnd: !0,
				allowPageScroll: s ? "vertical" : "horizontal",
				threshold: 75,
				swipeStatus: function(a, c, d, f) {
					b.stop();
					y = x();
					if (c == "move" && (s && (d == "left" || d == "right") || !s && (d == "up" || d == "down"))) d = y * b.slides.activeIndex + f * (!E && (d == "left" || d == "up") || E && (d == "right" || d == "down") ? 1 : -1), k._scrollTo(b, d, 0);
					else if (c == "cancel") d = y * b.slides.activeIndex, k._scrollTo(b, d, M);
					else if (c == "end") {
						a = -1;
						if (s && (d == "right" && !E || d == "left" && E) || !s && (d == "down" && !E || d == "up" && E)) a = Math.max(b.slides.activeIndex - 1, 0);
						else if (s && (d == "left" && !E || d == "right" && E) || !s && (d == "up" && !E || d == "down" && E)) a = Math.min(b.slides.activeIndex + 1, m.children().length - 1);
						a != -1 && (d = y * a, k._scrollTo(b, d, M), a != b.slides.activeIndex && b.slides.showPanel(a))
					}
				}
			});
			o.activeElement ? (r = o.activeIndex * y, k._scrollTo(b, r, 0)) : (k._scrollTo(b, -y, 0), b.options.contentLayout_runtime === "stack" && b.$closeBtn.hide())
		},
		_scrollTo: function(a, b, c) {
			var g;
			var d = Muse.Browser.Features.checkCSSFeature("transition-duration"),
				f = Muse.Browser.Features.checkCSSFeature("transform");
			if (!(d === !1 || f === !1)) {
				var i = a._fstp$View.get(0);
				i.style[(d === !0 ? "" : "-" + d.toLowerCase() + "-") + "transition-duration"] = (c / 1E3).toFixed(1) + "s";
				b = -b;
				g = (c = a.options.transitionStyle === "horizontal") ? b : 0, a = g;
				b = c ? 0 : b;
				f = (f === !0 ? "" : "-" + f.toLowerCase() + "-") + "transform";
				c = "translate3d(" + a + "px, " + b + "px, 0px)";
				d = i.style[f];
				i.style[f] = c;
				i.style[f] === d && d !== c && (i.style[f] = "translate(" + a + "px, " + b + "px)")
			}
		}
	};
	b.Widget.ContentSlideShow.slideImageIncludePlugin = {
		defaultOptions: {
			imageIncludeClassName: "wp-slideshow-slide-image-include",
			slideLoadingClassName: "wp-slideshow-slide-loading"
		},
		initialize: function(c, d) {
			var f = this;
			a.extend(d, a.extend({}, f.defaultOptions, d));
			c._cssilLoader = new b.ImageLoader;
			c.bind("attach-behavior", function() {
				f._attachBehavior(c)
			})
		},
		_attachBehavior: function(a) {
			for (var b = this, c = a._cssilLoader, d = a._findWidgetElements("." + a.options.slideClassName), f = d.length, i = "." + a.options.imageIncludeClassName, n = a.options.slideLoadingClassName, o = function(c, d, f, h) {
					b._handleImageLoad(a, c, d, f, h)
				}, p = 0; p < f; p++) {
				var q = d.eq(a._shuffleArray ? a._shuffleArray[p] : p),
					m = q.is("img") ? q : q.find(i),
					r = m[0];
				if (r) {
					var t = a._getAjaxSrcForImage(m) || r.href;
					if (t) m = {
						width: m.data("width"),
						height: m.data("height"),
						$ele: m,
						$slide: q
					}, r.style.visibility = "hidden", c.add(t, {
						callback: o,
						data: m
					}), q.addClass(n)
				}
			}
			a._cssilLoader.start()
		},
		_handleImageLoad: function(a, b, c, d, f) {
			var i = f.$ele,
				n = i[0];
			n.src = b;
			a.options.elastic !== "off" ? (i.data("imageWidth", c), i.data("imageHeight", d), a._csspPositionImage(n, a.options.heroFitting, a.options.elastic, c, d)) : (n.width = f.width || c, n.height = f.height || d);
			n.style.visibility = "";
			i.removeClass(a.options.imageIncludeClassName);
			f.$slide.removeClass(a.options.slideLoadingClassName);
			a.isPlaying() && a.slides.$element[a.slides.activeIndex] == f.$slide[0] && a._startTimer(!1)
		}
	};
	b.Widget.ContentSlideShow.shufflePlayPlugin = {
		defaultOptions: {
			randomDefaultIndex: !0
		},
		initialize: function(b, c) {
			var d = this;
			a.extend(c, a.extend({}, d.defaultOptions, c));
			b._shuffleArray = [];
			b._shuffleNextDict = {};
			b._realNext = b._next;
			b._next = function() {
				d._handleNext(b)
			};
			b._shufflePlayCount = 1;
			b.bind("before-attach-behavior", function() {
				d._reshuffle(b);
				if (c.randomDefaultIndex && typeof c.defaultIndex === "undefined") b.options.defaultIndex = b._shuffleArray[0]
			})
		},
		_fisherYatesArrayShuffle: function(a) {
			if (a && a.length) for (var b = a.length; --b;) {
				var c = Math.floor(Math.random() * (b + 1)),
					d = a[c];
				a[c] = a[b];
				a[b] = d
			}
		},
		_reshuffle: function(a) {
			var b = a._shuffleArray,
				c = {},
				d = a.slides ? a.slides.$element.length : a._findWidgetElements("." + a.options.slideClassName).length;
			if (b.length !== d) for (var f = b.length = 0; f < d; f++) b[f] = f;
			this._fisherYatesArrayShuffle(b);
			for (f = 0; f < d; f++) c[b[f]] = b[(f + 1) % d];
			a._shuffleNextDict = c;
			a._shufflePlayCount = 1
		},
		_handleNext: function(a) {
			if (a.isPlaying()) {
				var b = a.slides.activeIndex,
					c = a._shuffleNextDict[b] || 0;
				a._isLoaded(b) && a._isLoaded(c) && (a._goTo(c), ++a._shufflePlayCount >= a.slides.$element.length && (this._reshuffle(a), (!a.options.loop || a.options.playOnce) && a.stop()))
			} else a._realNext()
		}
	}
})(jQuery, WebPro, window, document);
(function(a, b, c) {
	b.widget("Widget.Form", b.Widget, {
		_widgetName: "form",
		defaultOptions: {
			validationEvent: "blur",
			errorStateSensitivity: "low",
			ajaxSubmit: !0,
			fieldWrapperClass: "field",
			formErrorClass: "form-error",
			formSubmittedClass: "form-submitted",
			formDeliveredClass: "form-delivered",
			focusClass: "focus",
			notEmptyClass: "not-empty",
			emptyClass: "empty",
			validClass: "valid",
			invalidClass: "invalid",
			requiredClass: "required"
		},
		validationTypes: {
			"always-valid": /.*/,
			email: /^[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
			alpha: /^[A-z\s]+$/,
			numeric: /^[0-9]+$/,
			phone: /^([0-9])?(\s)?(\([0-9]{3}\)|[0-9]{3}(\-)?)(\s)?[0-9]{3}(\s|\-)?[0-9]{4}(\s|\sext|\sx)?(\s)?[0-9]*$/,
			captcha: function(a) {
				return a.data("captchaValid")
			},
			recaptcha: function() {
				if ("undefined" == typeof Recaptcha) return !1;
				var a = Recaptcha.get_response();
				return a && 0 < a.length
			},
			checkbox: function() {
				return !0
			},
			time: function(a) {
				var a = a.find("input, textarea"),
					b = a.val().replace(/[^0-9:APM]/g, "");
				if (b.indexOf(":") != -1 && b.match(/:/).length == 1) {
					var c = b.split(":"),
						k = parseInt(c[0]),
						c = parseInt(c[1]);
					if (k < 0 || k > 24) return !0;
					if (c < 0 || c > 59) return !0
				} else return !1;
				a.val(b);
				return !0
			}
		},
		_transformMarkup: function() {
			var b = this;
			b.hasCAPTCHA = !1;
			b.hasReCAPTCHA = !1;
			this.$element.find("." + this.options.fieldWrapperClass).each(function() {
				var c = a(this);
				switch (c.attr("data-type")) {
				case "captcha":
					b.hasCAPTCHA = !0;
					c.find('input[name="CaptchaV2"]').remove();
					c.find('input[name="muse_CaptchaV2"]').attr("name", "CaptchaV2");
					break;
				case "recaptcha":
					b.hasReCAPTCHA = !0
				}
			})
		},
		_extractData: function() {
			this.event = this.options.validationEvent;
			this.errorSensitivity = this.options.errorStateSensitivity;
			this.classNames = {
				focus: this.options.focusClass,
				blur: this.options.emptyClass,
				keydown: this.options.notEmptyClass
			}
		},
		_attachBehavior: function() {
			var b = this;
			this.$element.find("input, textarea").each(function() {
				var c = a(this);
				c.val() != "" && c.removeClass(b.options.emptyClass)
			});
			this.$element.find("." + this.options.fieldWrapperClass).each(function() {
				var c = a(this);
				c.attr("data-type") == "captcha" && (c.data("captchaValid", !1), c.find('input[name="CaptchaV2"]').keyup(function() {
					var g = a(this).val(),
						k = c.find('input[name="CaptchaHV2"]').val();
					b._validateCaptcha(k, g, function(a) {
						c.data("captchaValid", a);
						c.data("error-state") && b.errorSensitivity == "high" && b._validate(c)
					})
				}));
				c.find("input, textarea").val() != "" && c.addClass(b.classNames.keydown)
			});
			this.$element.find("input, textarea").bind("focus blur keydown change propertychange", function(c) {
				var g = b.classNames[c.type],
					k = b.classNames.focus,
					h = b.classNames.keydown,
					l = b.classNames.blur,
					j = a(this),
					i = j.closest("." + b.options.fieldWrapperClass);
				switch (c.type) {
				case "focus":
					i.addClass(g).removeClass(l);
					break;
				case "blur":
					i.removeClass(k);
					j.val() == "" && i.addClass(g).removeClass(h);
					break;
				case "keydown":
					i.addClass(g).removeClass(l);
					break;
				case "change":
				case "propertychange":
					j.val() != "" ? i.addClass(h).removeClass(l) : i.addClass(l).removeClass(h)
				}
			});
			switch (this.event) {
			case "blur":
			case "keyup":
				this.$element.find("." + this.options.fieldWrapperClass + " input, ." + this.options.fieldWrapperClass + " textarea").bind(this.event, function() {
					b._validate(a(this).closest("." + b.options.fieldWrapperClass))
				});
			case "submit":
				this.$element.submit(function(c) {
					var g = !0,
						k = b.$element.find("." + b.options.fieldWrapperClass).length - 1;
					b.$element.find("." + b.options.fieldWrapperClass).each(function(h) {
						if ((g = b._validate(a(this)) ? g : !1) && h == k && b.options.ajaxSubmit) c.preventDefault(), b._submitForm();
						g || c.preventDefault()
					})
				})
			}
		},
		_validateCaptcha: function(b, c, g) {
			c.length != 6 ? g(!1) : a.get("/ValidateCaptcha.ashx", {
				key: b,
				answer: c
			}, function(a) {
				g(a == "true")
			})
		},
		_validateReCaptcha: function(b, c) {
			a.get("/ValidateCaptcha.ashx", {
				key: Recaptcha.get_challenge(),
				answer: Recaptcha.get_response(),
				imageVerificationType: "recaptcha"
			}, function(a) {
				a == "true" ? b() : c()
			})
		},
		_submitForm: function() {
			var b = this,
				c = a("#ReCaptchaAnswer", b.$element),
				g = a("#ReCaptchaChallenge", b.$element);
			b.hasReCAPTCHA && 1 == c.length && 1 == g.length ? (c.val(Recaptcha.get_response()), g.val(Recaptcha.get_challenge()), b._validateReCaptcha(function() {
				b._submitFormInternal()
			}, function() {
				a("." + b.options.fieldWrapperClass, b.$element).each(function() {
					var c = a(this);
					c.attr("data-type") == "recaptcha" && b._switchState("invalid", c)
				});
				Recaptcha.reload()
			})) : b._submitFormInternal()
		},
		_submitFormInternal: function() {
			var b = this,
				f = this.options.formSubmittedClass,
				g = this.options.formDeliveredClass,
				k = this.options.formErrorClass,
				h = f + " " + g + " " + k,
				l = this.$element.find("input[type=submit], button");
			a.ajax({
				url: this.$element.attr("action"),
				type: "post",
				data: this.$element.serialize(),
				beforeSend: function() {
					b.$element.removeClass(h);
					b.$element.addClass(f);
					b.$element.find("." + b.options.fieldWrapperClass).removeClass(b.options.focusClass);
					l.attr("disabled", "disabled")
				},
				complete: function(h) {
					/*
					h && (h.status >= 400 || h.responseText && h.responseText.indexOf("<?php") >= 0) && alert("Form PHP script is missing from web server, or PHP is not configured correctly on your web hosting provider. Check if the form PHP script has been uploaded correctly, then contact your hosting provider about PHP configuration.");
					b.$element.removeClass(f);
					var i = null;
					if (h && h.responseText) try {
						i = jQuery.parseJSON(h.responseText), i = i.FormProcessV2Response || i.FormResponse || i.MusePHPFormResponse || i
					} catch (n) {}
					if (i && i.success) {
						b.$element.addClass(g);
						if (i.redirect) {
							c.location.href = i.redirect;
							return
						}
						b.$element[0].reset();
						b.hasCAPTCHA && b.$element.find("input:not([type=submit]), textarea").each(function() {
							a(this).attr("disabled", "disabled")
						})
					} else if (h = b._getFieldsWithError(i)) for (i = 0; i < h.length; i++) b._switchState("invalid", h[i]);
					else b.$element.addClass(k);
					b.hasCAPTCHA || l.removeAttr("disabled");
					b.hasReCAPTCHA && Recaptcha.reload()
					*/
					h && (h.status >= 400 || h.responseText && h.responseText.indexOf("<?php") >= 0) && alert("Form PHP script is missing from web server, or PHP is not configured correctly on your web hosting provider. Check if the form PHP script has been uploaded correctly, then contact your hosting provider about PHP configuration.");
					b.$element.removeClass(f);
					var i = null;
					if (h && h.responseText) try {
						i = jQuery.parseJSON(h.responseText), i = i.FormProcessV2Response || i.FormResponse || i.MusePHPFormResponse || i
					} catch (n) {}
					if (i) {
						if(i.status=='y')
						{
							alert(i.info)
							c.location.href = '/';
						}
						else
						{
							alert(i.info)
						}
					} else if (h = b._getFieldsWithError(i)) for (i = 0; i < h.length; i++) b._switchState("invalid", h[i]);
					else b.$element.addClass(k);
					b.hasCAPTCHA || l.removeAttr("disabled");
					b.hasReCAPTCHA && Recaptcha.reload()
				}
			})
		},
		_getFieldsWithError: function(b) {
			if (!b || !b.error || !b.error.fields || !b.error.fields.length) return null;
			for (var c = [], g = 0; g < b.error.fields.length; g++) {
				var k = a('[name="' + b.error.fields[g].field + '"]', this.$element).parents("." + this.options.fieldWrapperClass);
				1 == k.length && c.push(k)
			}
			return c
		},
		_validate: function(a) {
			var b = a.attr("data-type") || "always-valid",
				c = a.find("input, textarea"),
				k = this.validationTypes[b],
				b = a.attr("data-required") === "true",
				h = "checkbox" == c.attr("type") ? typeof c.attr("checked") === "undefined" : c.val() == "",
				c = k instanceof RegExp ? Boolean(c.val().match(k)) : k(a);
			if (b && h) return this._switchState("required", a);
			if (!c) return this._switchState("invalid", a);
			return this._switchState("valid", a)
		},
		_switchState: function(a, b) {
			function c() {
				i._validate(b)
			}
			var k = b.attr("data-type"),
				h = this.options.validClass,
				l = this.options.invalidClass,
				j = this.options.requiredClass;
			b.removeClass(h + " " + l + " " + j);
			if (a == "required" || a == "invalid") {
				a == "invalid" ? b.addClass(l) : b.addClass(j);
				if ("recaptcha" != k && this.errorSensitivity != "low") {
					var i = this,
						k = this.errorSensitivity == "high" ? "keyup" : "blur";
					b.data("error-state") || (b.data("error-state", !0), b.find("input, textarea").bind(k, c))
				}
				return !1
			}
			b.data("error-state") && (this.errorSensitivity == "high" ? this.event != "keyup" && b.data("error-state", !1).find("input, textarea").unbind("keyup", c) : this.errorSensitivity == "medium" && this.event != "blur" && b.data("error-state", !1).find("input, textarea").unbind("blur", c));
			b.addClass(h);
			return !0
		}
	});
	a.fn.wpForm = function(a) {
		new b.Widget.Form(this, a);
		return this
	}
})(jQuery, WebPro, window, document);;
(function() {
	if (!("undefined" == typeof Muse || "undefined" == typeof Muse.assets)) {
		var a = function(a, b) {
				for (var c = 0, d = a.length; c < d; c++) if (a[c] == b) return c;
				return -1
			}(Muse.assets.required, "webpro.js");
		if (-1 != a) {
			Muse.assets.required.splice(a, 1);
			for (var a = document.getElementsByTagName("meta"), b = 0, c = a.length; b < c; b++) {
				var d = a[b];
				if ("generator" == d.getAttribute("name")) {
					"2014.3.2.295" != d.getAttribute("content") && Muse.assets.outOfDate.push("webpro.js");
					break
				}
			}
		}
	}
})();