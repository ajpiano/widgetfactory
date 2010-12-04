(function($) {
	// The jQuery.aj namespace will automatically be created if it doesn't exist
	$.widget("aj.filterable", {
		options: {
			delay: 250,
			"className": ""
		},
		_create: function() {
			// The _create method is called the first time the plugin is invoked on an element
			// This is where most of your setup will happen
			// Two things are already available:
			// this.element -- a jQuery object of the element the widget was invoked on.
			// this.options --  the merged options hash
			this.filterElems = this.element.children()
							   .addClass("ui-widget-content " + this.options.className)
							   .bind("mouseenter.filterable mouseleave.filterable", $.proxy(this, "_hover"));

			this.filterInput = $("<input>", {type: "text"})
							   .insertBefore(this.element)
							   .bind("keyup.filterable", $.proxy(this, "filter"))
							   .wrap("<div class='ui-widget-header " + this.options.className + "'>");
			this.timeout = false;

			this._trigger("ready");

		},
		filter: function(e) {
			// Keep various pieces of logic in separate methods
			this.timeout && clearTimeout(this.timeout);
			this.timeout = setTimeout($.proxy(function() {
				var re = new RegExp(this.filterInput.val(), "ig"),
				visible = this.filterElems.filter(function() {
					var $t = $(this),
					matches = re.test($t.text()),
					method = (matches ? "remove": "add") + "Class";
					$t[method]("ui-helper-hidden");
					return matches;
				});
				this._trigger("filtered", e, {
					visible: visible
				});

			},
			this), this.options.delay);

		},
		_hover: function(e) {
			$(e.target)[(e.type == "mouseenter" ? "add": "remove") + "Class"]("ui-state-active");
			this._trigger("hover", e, {
				hovered: $(e.target)
			});

		},
		_setOption: function(key, value) {
			var oldValue = this.options[key];
			// Check for a particular option being set
			if (key == "className") {
				// Gather all the elements we applied the className to
				this.filterInput.parent().add(this.filterElems)
				// Wwitch the new className in for the old
				.toggleClass(this.options.className + " " + value);
			}
			// Call the base _setOption method
			$.Widget.prototype._setOption.apply(this, arguments);

			// The widget factory doesn't fire an callback for options changes by default
			// In order to allow the user to respond, fire our own callback
			this._trigger("setOption", {
				type: "setOption"
			},
			{
				option: key,
				original: oldValue,
				current: value
			});

		},
		destroy: function() {
			// Use the destroy method to reverse everything your plugin has applied
			this.filterInput.parent().remove();
			this.filterElems.removeClass("ui-widget-content ui-helper-hidden " + this.options.className).unbind(".filterable");
			// After you do that, you still need to invoke the "base" destroy method
			// Does nice things like unbind all namespaced events
			$.Widget.prototype.destroy.call(this);
		}
	});
})(jQuery);
