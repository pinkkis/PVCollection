/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true, devel:true */
/* globals Handlebars, JST, moment */
/* exported PVCollection */

var PVCollection = (function() {

	/**
	 * Collection Class
	 *
	 * @constructor
	 * @param {object} opt Object of options
	 * @param {object} model The model object base
	 */
	var Collection = function(opt, model) {
		if (!opt) {
			throw new Error('No options provided for Collection!');
		}
		if (!model) {
			throw new Error('No model provided for Collection!');
		}

		// basic props
		this.id = guid();
		this.name = opt.name || this.id;
		this.options = opt;
		this.debug = opt.debug || false;
		this.initialized = false;
		this.created = moment();

		// template
		this.template = opt.template ? this.initTemplate(opt.template) : null;
		this._hasBeenRendered = false;
		this.templateRender = null;

		// status props
		this._isSorted = true;
		this._dirty = false;
		this._isSaving = false;
		this.length = 0;

		// function overwrite
		$.extend(true, this, opt.functions);

		// model
		this.model = model;

		// collection
		this.items = [];

		// events
		this._events = {};

		// do anything that needs to get initialized
		this._initialize.apply(this, this.options);
	};

	// initialize is for user content, set some basic stuff first
	/**
	 * Internal Initialization method
	 * @param {object} options The options from the constructors are passed to this method
	 */
	Collection.prototype._initialize = function(options) {
		this.log(['collection init', this.name]);

		// set basic events
		this.on('sort', this.onSort);
		this.on('beforeRender', this.onBeforeRender);
		this.on('render', this.onRender);
		this.on('change', this.onChange);
		this.on('clear', this.onClear);

		// init incremented id
		initIncrementId();

		// call user init function here
		this.initialize.apply(this, this.options);

		this.initialized = true;
		this.trigger('initialized', {
			options: options
		});
	};

	// init the list, set items, events and stuff
	Collection.prototype.initialize = function() {};

	// return props
	Collection.prototype.isDirty = function() {
		return this._isDirty;
	};
	Collection.prototype.isSaving = function() {
		return this._isSaving;
	};
	Collection.prototype.isSorted = function() {
		return this._isSorted;
	};

	// toJSON
	Collection.prototype.toJSON = function(stringified) {
		var result = {
			name: this.name,
			id: this.id,
			created: this.created.format(),
			length: this.items.length,
			items: (function(items) {
				return items.map(function(x) {
					return x.toJSON();
				});
			})(this.items)
		};

		if (stringified) {
			return JSON.stringify(result);
		} else {
			return result;
		}
	};

	// get the array of items
	Collection.prototype.clean = function(deep) {
		this.log(['collection clean']);

		this._dirty = false;

		if (deep) {
			this.items.forEach(function(item, idx, arr) {
				item.clean();
			});
		}
	};

	// get an item with index or the array of items
	Collection.prototype.get = function(index) {
		this.log(['collection get', index]);

		if (!isNaN(index) && index > -1) {
			return this.items[index];
		} else {
			return this.items;
		}
	};

	// get the array of items
	Collection.prototype.first = function() {
		this.log(['collection first']);

		if (this.length) {
			return this.items[0];
		} else {
			return null;
		}
	};

	// get the array of items
	Collection.prototype.last = function() {
		this.log(['collection last']);

		if (this.length) {
			return this.items[this.length - 1];
		} else {
			return null;
		}
	};

	// set a new array of items in to the list, and report the change
	Collection.prototype.set = function(items, options) {
		options = options || {};

		var self = this,
			addedItems = [],
			removedItems = [],
			changedItems = [],
			toBeRemoved = [],
			toBeChanged = [];

		this.log(['collection set', items, options]);

		// list is not sorted
		this._isSorted = false;

		// find items that change or get removed
		this.items.forEach(function(oldItem, idx, arr) {
			// if we cannot find this unique item in the new list, add it to the to be removed list
			// otherwise add it to the to be changed list
			var itemIdx = items.map(function(x) {
				return x[oldItem._uniqueField];
			}).indexOf(oldItem.attributes[oldItem._uniqueField]);

			if (itemIdx === -1) {
				toBeRemoved.push(oldItem);
			} else {
				toBeChanged.push(oldItem);
			}
		});

		// process toBeRemoved
		toBeRemoved.forEach(function(item, idx, arr) {
			// if we need processing done on items before they are removed, do that here
			// TODO remove hook

			// otherwise proceed to remove item, silently
			removedItems.push(self.remove(item, {
				silent: true,
				returnItem: true
			}));
		});

		// process to be changed
		toBeChanged.forEach(function(oldItem, idx, arr) {
			// TODO - provide the attributes that changed as well
			var newIdx = items.indexOf(oldItem.attributes[oldItem._uniqueField]),
				newItem = items.splice(newIdx, 1)[0];

			var changedItem = oldItem.set(newItem, false, true);

			if (Object.keys(changedItem.changedAttributes).length) {
				changedItems.push(oldItem);
			}
		});

		// new we only have remaining new items in the items list
		addedItems = items.slice(0);
		this.add(items, {
			silent: true,
			noSort: true
		});

		// sort list
		// TODO when sorting is remembered, do that here
		this.sort();

		// set length
		this.length = this.items.length;

		this._hasBeenRendered = false;

		if (!options.silent) {
			this.trigger('change', {
				added: addedItems,
				removed: removedItems,
				changed: changedItems
			});
		}

		return this;
	};

	// add an array of items, with options
	Collection.prototype.add = function(items, options) {
		this.log(['collection add', items, options]);

		options = options || {};

		items = items || [];
		if (!$.isArray(items)) {
			items = [items];
		}

		var collection = this,
			addedItems = [];

		items.forEach(function(itemData, idx, arr) {
			var newModel = $.extend(true, {}, collection.model, {
				collection: collection
			}, options);
			var newItem = new Model(newModel, $.extend(true, {}, collection.model.attributes, itemData));

			collection.items.push(newItem);
			addedItems.push(newItem);
		});

		this._hasBeenRendered = false;

		// set length
		this.length = this.items.length;

		// sort if requested
		if (!options.noSort) {
			// TODO
			// add list sort func here
			this.sort();
		}

		if (!options.silent) {
			this.trigger('change', {
				added: addedItems.slice(0),
				removed: [],
				changed: []
			});
		}

		return this;
	};

	// remove an item
	Collection.prototype.remove = function(_id, options) {
		this.log(['collection remove', _id, options]);

		options = options || {};

		var id = -1,
			itemIndex,
			removedModel;

		// parse what the request item is
		// support either string/number for id or passing in a model to remove it
		if (!isNaN(parseInt(_id, 10))) {
			id = parseInt(_id, 10);
		} else if (_id instanceof Model) {
			// use the model's "unique field"
			// id = _id.attributes.id;
			id = _id.attributes[_id._uniqueField];
		} else {
			return false;
		}

		// get the array index of the item
		itemIndex = this.items.map(function(i) {
			return i.attributes[i._uniqueField];
		}).indexOf(id);

		// save the model for the event
		removedModel = this.items.splice(itemIndex, 1);

		// set length
		this.length = this.items.length;

		this._hasBeenRendered = false;

		if (!options.silent) {
			this.trigger('change', {
				added: [],
				removed: [removedModel],
				changed: []
			});
		}

		if (options.returnItem) {
			return removedModel;
		} else {
			return this;
		}
	};

	// get an array of items where attributes[key] === value.
	// first argument can also be a function that will be used for the grep instead
	// if internal is true, then "private" properties can be compared
	Collection.prototype.where = function(key, value, internal) {
		this.log(['collection where', key, value, internal]);

		// if the first argument was a function
		if (typeof key === "function") {
			internal = value;

			// key gets item, index passed to it
			return $.grep(this.items, key);

		} else {
			return $.grep(this.items, function(item, idx) {
				if (internal) {
					return item[key] === value;
				} else {
					return item.attributes[key] === value;
				}
			});
		}
	};

	// sort the item list
	Collection.prototype.sort = function(options, fn) {
		this.log(['collection sort', options, fn]);

		if (typeof options === "function") {
			fn = options;
			options = {};
		}

		this.items.sort(fn || function(a, b) {
			return a.attributes[a._uniqueField] < b.attributes[b._uniqueField];
		});

		if (!options || !options.silent) {
			this.trigger('sort', {});
		}

		this._isSorted = true;

		return this;
	};

	// filter the list with custom filter
	// fn is function(item, index, array)
	Collection.prototype.filter = function(fn) {
		this.log(['collection filter', fn]);

		if (typeof fn !== "function") {
			throw new Error("Argument must be a function");
		}

		return this.items.filter(fn);
	};

	// run Array.map on the items array
	// fn is function(item)
	Collection.prototype.map = function(fn) {
		this.log(['collection map', fn]);

		if (typeof fn !== "function") {
			throw new Error("Argument must be a function");
		}

		return this.items.map(fn);
	};

	// returns boolean if an item in collection matches comparator fn
	// fn example: function(element, index, array) { return elem > 10; }
	Collection.prototype.contains = function(fn) {
		this.log(['collection contains', fn]);

		return this.items.some(fn);
	};

	// clear the whole list
	Collection.prototype.clear = function(options) {
		this.log(['collection clear', options]);

		this.trigger('clear', {
			items: this.items.slice(0)
		});

		// clear all items
		this.items = [];

		return this;
	};

	// render the list
	Collection.prototype.render = function(options) {
		options = options || {};

		var listItems = [];

		this.log(['collection render', options]);

		// TODO
		// add $el?

		// if we don't have a template, return json
		if (!this.template) {
			return this.toJSON();
		}

		// if we either don't have it at all, or the model has changed since last render
		if (!this._hasBeenRendered || options.force) {

			this.trigger('beforeRender', {
				options: options
			});

			this.templateRender = this.template({
				id: this.id,
				name: this.name,
				created: this.created.format(),
				items: this.map(function(item) {
					return item.render();
				})
			});

			this._hasBeenRendered = true;
		}

		// trigger event
		this.trigger('render', {
			options: options
		});

		return this.templateRender;
	};

	// built in quick fetch, overwrite this method to change functionality
	Collection.prototype.fetch = function(url, options) {
		this.log(['collection fetch', url, options]);

		var fetch = $.Deferred,
			errorMessage = '',
			data = {},
			fetchStatus = 'pending',
			collection = this;

		fetch
			.done(function(result) {
				if (!result.items || !$.isArray(result.items)) {
					collection.log(['Fetch result was not an array of items'], 'warn');
				} else {
					data = result.data ? result.data : {};
					collection.set(result.items, {});
				}
			})
			.fail(function(result) {
				errorMessage = result.errorMessage;
				data = result.data ? result.data : {};
			})
			.always(function(result) {
				this.trigger('load', {
					result: this.status(),
					error: errorMessage,
					data: data
				});
			});

		return fetch;
	};

	// hand the items over to a third party method that saves them and lets us know
	Collection.prototype.save = function(options) {
		this.log(['collection save', options]);


		var saveObject = {
				deferred: $.Deferred,
				items: this.get()
			},
			collection = this;

		// TODO
		// crate deferred and attach callbacks to it
		// attach deferred and changed models to outputObect
		// external saving call will resolve deferred once it's done

		saveObject.deferred.always(function(result) {

			if (result.status === 'success') {
				if (!result.items || !result.items.length) {
					// deeply mark as clean
					collection.clean(true);
				} else {
					// TODO
					// this shouldn't trigger anything else, it's a set to update possible serverside changes to client
					collection.set(result.items, {
						silent: true
					});
				}
			}

			this.trigger('save', {
				status: result.status,
				errorMessage: result.errorMessage,
				result: result
			});
		});

		return saveObject;
	};

	// event handlers
	Collection.prototype.onSort = function(evt) {
		this.log(['collection sort event handler', evt]);
	};

	Collection.prototype.onClear = function(evt) {
		this.log(['collection clear event handler', evt]);

		this.length = 0;
	};

	Collection.prototype.onChange = function(evt) {
		this.log(['collection change event handler', evt]);
	};

	Collection.prototype.onRender = function(evt) {
		this.log(['collection render event handler', evt]);
	};

	Collection.prototype.onBeforeRender = function(evt) {
		this.log(['collection before render event handler', evt]);
	};
	// -- end Collection Class


	/**
	 * Model Class
	 * @constructor
	 * @param {object} opt Options object
	 * @param {object} attributes Object of attributes that the new model will have
	 */
	var Model = function(opt, attributes) {
		opt = opt || {};

		// basic props
		this.guid = guid();
		this.options = opt;
		this.debug = opt.debug || false;
		this._dirty = false;

		// tracks changed attributes
		this.changedAttributes = {};

		// this._synced = true;
		// this.validate = false;

		this.collection = opt.collection || null;
		this._uniqueField = 'id';
		this.created = moment();
		this.modified = moment();

		// attributes
		this.attributes = attributes || {};

		// if there's no value for the unique field, add one
		if (Object.keys(this.attributes).indexOf(this._uniqueField) === -1 || !this.attributes[this._uniqueField]) {
			this.attributes[this._uniqueField] = uid();
		}

		// merge functions into this class
		$.extend(true, this, opt.functions);

		// template/dom
		this._hasBeenRendered = false;
		this.$el = null;
		this.template = opt.template ? this.initTemplate(opt.template) : null;
		this.templateRender = '';

		// TODO
		// link the $el to a dom element or query

		// events
		this._events = {};

		// do anything that needs to get initialized
		this._initialize.apply(this, this.options);
	};

	// internal init
	Model.prototype._initialize = function(options) {
		this.log(['model init', options]);

		this.initialize.apply(this, this.options);

		// render template
		if (this.template) {
			this.render();
		}

		this._dirty = false;

		// set the basic events
		this.on('dirty', this.onDirty);
		this.on('change', this.onChange);
		this.on('render', this.onRender);

	};

	// user init
	Model.prototype.initialize = function(options) {};

	// mark model as clean
	Model.prototype.clean = function(opt) {
		this.changedAttributes = {};
		this._dirty = false;
	};

	// return single value or object of values from array of keys
	Model.prototype.get = function(key) {
		this.log(['model get', key]);

		if (!key) {
			return this.getAttributes();
		} else if ($.isArray(key)) {
			var result = {},
				model = this;

			// go through each key, extend objects or assign values
			key.forEach(function(k, i, a) {
				if (typeof model[k] === "object") {
					result[k] = $.extend(true, {}, model.attributes[k]);
				} else {
					result[k] = model.attributes[k];
				}
			});

			return result;

		} else {
			return this.attributes[key];
		}
	};

	Model.prototype.set = function(key, value, internal, silent) {
		this.log(['model set', key, value, internal, silent]);

		var changedAttributes = [],
			model = this,
			localProp = null;

		// if the key is an object, we shift the arguments, as we don't have a value
		if (typeof key === "object") {
			silent = internal;
			internal = value;
			value = null;

			if (internal) {
				model = $.extend(true, {}, model, key);
			} else {
				model.attributes = $.extend(true, {}, model.attributes, key);
			}

			// add the changed attributes into the model for tracking
			for (var k in key) {
				if (key.hasOwnProperty(k)) {
					localProp = internal ? this[k] : this.attributes[k];

					if (!isEqual(localProp, key[k])) {
						this.changedAttributes[k] = key[k];
						localProp = null;
					}
				}
			}

		} else {
			if (internal) {
				model[key] = value;
			} else {
				model.attributes[key] = value;
			}

			this.changedAttributes[key] = value;
		}

		// check if anything actually changed and change timestamp
		if (Object.keys(this.changedAttributes).length) {
			this.modified = moment();
		}

		if (!silent) {
			this.trigger('change', {
				changed: changedAttributes,
				timestamp: this.modified
			});
		}

		// set to dirty
		this._dirty = true;
		this.trigger('dirty', {});

		return this;
	};

	// render item from template, or if item is clean, just return the already rendered html
	Model.prototype.render = function(options) {
		this.log(['model render', options]);

		// if we don't have a template, return json
		if (!this.template) {
			return this.toJSON();
		}

		// if we either don't have it at all, or the model has changed since last render
		if (!this._hasBeenRendered) {
			// add the guid of the model in the template for use
			this.templateRender = this.template($.extend(true, {
				guid: this.guid
			}, this.attributes));
			this._hasBeenRendered = true;
		}

		// trigger event
		this.trigger('render', {
			options: options
		});

		return this.templateRender;
	};

	// just return all attributes
	Model.prototype.getAttributes = function() {
		this.log(['model getAttributes']);

		return this.attributes;
	};

	// just return all attributes
	Model.prototype.parser = function(input) {
		this.log(['model parser'], input);

		var output = {};

		return output;
	};

	// return only attributes
	Model.prototype.toJSON = function() {
		return $.extend(true, {}, this.attributes);
	};

	// event handlers
	Model.prototype.onChange = function(evt) {
		this.log(['model change event handler', evt]);
	};

	Model.prototype.onRender = function(evt) {
		this.log(['model render event handler', evt]);
	};

	Model.prototype.onDirty = function(evt) {
		this.log(['model dirty event handler', evt]);

		this._hasBeenRendered = false;
	};
	// -- end Model Class


	// Methods for both

	// logger
	Model.prototype.log = Collection.prototype.log = function(message, type) {
		type = type || 'log';

		if (this.debug) {
			if (typeof message === 'string') {
				console[type](message);
			} else {
				console[type](Array.prototype.slice.apply(message));
			}
		}
	};

	// check what the template is and deal with it
	Model.prototype.initTemplate = Collection.prototype.initTemplate = function(_template) {
		// if it's a function, then we've already compiled the template
		if (typeof _template == 'function') {
			return _template;
		}

		// if it's a string, compile it with Handlebars
		if (typeof _template === 'string') {
			return Handlebars.compile(_template);
		}

		// else return null
		return null;
	};

	// event handling
	// thanks to http://stackoverflow.com/a/9101404
	Model.prototype.on = Collection.prototype.on = function(eventName, callback) {
		if (!this._events[eventName]) {
			this._events[eventName] = $.Callbacks('unique');
		}
		this._events[eventName].add(callback);
	};

	Model.prototype.off = Collection.prototype.off = function(eventName, callback) {
		if (!this._events[eventName]) {
			return;
		} else {
			this._events[eventName].remove(callback);
		}
	};

	Model.prototype.trigger = Collection.prototype.trigger = function(eventName, opt) {
		if (this._events[eventName]) {
			this._events[eventName].fireWith(this, [opt]);
		}
	};

	// Helpers

	// Generate GUIDv4 (random generation)
	// http://stackoverflow.com/a/105074
	var guid = (function() {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		}
		return function() {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
				s4() + '-' + s4() + s4() + s4();
		};
	})();

	// running id
	var uid;
	var initIncrementId = function() {
		var id = 0;
		uid = function() {
			return id++;
		};
	};

	// deep object comparison based on underscore
	// https://github.com/jashkenas/underscore
	var isEqual = function(a, b) {
		return eq(a, b);
	};

	// Internal recursive comparison function for 'isEqual'.
	var eq = function(a, b, aStack, bStack) {
		/* jshint ignore:start */
		// Identical objects are equal. `0 === -0`, but they aren't identical.
		// See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
		if (a === b) return a !== 0 || 1 / a === 1 / b;
		// A strict comparison is necessary because `null == undefined`.
		if (a == null || b == null) return a === b;

		// Compare `[[Class]]` names.
		var className = toString.call(a);
		if (className !== toString.call(b)) return false;
		switch (className) {
			// Strings, numbers, regular expressions, dates, and booleans are compared by value.
			case '[object RegExp]':
				// RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
			case '[object String]':
				// Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
				// equivalent to `new String("5")`.
				return '' + a === '' + b;
			case '[object Number]':
				// `NaN`s are equivalent, but non-reflexive.
				// Object(NaN) is equivalent to NaN
				if (+a !== +a) return +b !== +b;
				// An `egal` comparison is performed for other numeric values.
				return +a === 0 ? 1 / +a === 1 / b : +a === +b;
			case '[object Date]':
			case '[object Boolean]':
				// Coerce dates and booleans to numeric primitive values. Dates are compared by their
				// millisecond representations. Note that invalid dates with millisecond representations
				// of `NaN` are not equivalent.
				return +a === +b;
		}

		var areArrays = className === '[object Array]';
		if (!areArrays) {
			if (typeof a != 'object' || typeof b != 'object') return false;

			// Objects with different constructors are not equivalent, but `Object`s or `Array`s
			// from different frames are.
			var aCtor = a.constructor,
				bCtor = b.constructor;
			if (aCtor !== bCtor && !($.isFunction(aCtor) && aCtor instanceof aCtor &&
					$.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
				return false;
			}
		}
		// Assume equality for cyclic structures. The algorithm for detecting cyclic
		// structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

		// Initializing stack of traversed objects.
		// It's done here since we only need them for objects and arrays comparison.
		aStack = aStack || [];
		bStack = bStack || [];
		var length = aStack.length;
		while (length--) {
			// Linear search. Performance is inversely proportional to the number of
			// unique nested structures.
			if (aStack[length] === a) return bStack[length] === b;
		}

		// Add the first object to the stack of traversed objects.
		aStack.push(a);
		bStack.push(b);

		// Recursively compare objects and arrays.
		if (areArrays) {
			// Compare array lengths to determine if a deep comparison is necessary.
			length = a.length;
			if (length !== b.length) return false;
			// Deep compare the contents, ignoring non-numeric properties.
			while (length--) {
				if (!eq(a[length], b[length], aStack, bStack)) return false;
			}
		} else {
			// Deep compare objects.
			var keys = Object.keys(a),
				key;
			length = keys.length;
			// Ensure that both objects contain the same number of properties before comparing deep equality.
			if (Object.keys(b).length !== length) return false;
			while (length--) {
				// Deep compare each member
				key = keys[length];
				if (!((function(obj, key) {
							return obj != null && hasOwnProperty.call(obj, key);
						})(b, key) &&
						eq(a[key], b[key], aStack, bStack))) {
					return false;
				}
			}
		}
		// Remove the first object from the stack of traversed objects.
		aStack.pop();
		bStack.pop();

		/* jshint ignore:end */
		return true;
	};

	// return
	return Collection;

})();