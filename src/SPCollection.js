/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true, devel:true */
/* globals Handlebars, JST, moment */
/* exported SPCollection */
'use strict';

var SPCollection = (function(){

	// Collection Class
	// ----------------
	var Collection = function(opt, model) {
		if (!opt) { throw new Error('No options provided for Collection!'); }
		if (!model) { throw new Error('No model provided for Collection!'); }

		// basic props
		this.id = guid();
		this.name = opt.name || this.id;
		this.options = opt;
		this.debug = opt.debug || false;
		this.initialized = false;
		this.template = opt.template ? this.initTemplate(opt.template) : null;
		this.created = moment();

		// function overwrite
		$.extend(true, this, opt.functions);

		// model
		this.model = model;

		// collection
		this.items = [];

		// events
		this._events = {};

		// do anything that needs to get initialized
		this.initialize.apply(this, this.options);
	};

	// init the list, set items, events and stuff
	Collection.prototype.initialize = function() {};

	// get the array of items
	Collection.prototype.get = function(index) {
		this._log(['collection get', index]);

		if (!isNaN(index) && index > -1) {
			return this.items[index];
		} else {
			return this.items;
		}
	};

	// set a new array of items in to the list, and report the change
	Collection.prototype.set = function(items, _options) {
		this._log(['collection set', items, _options]);

		var addedItems = [],
			removedItems = [],
			changedItems = [];

		// TODO
		// compare new items and their _uniqueField to existing items
		// remove items from current list that are not in the new list
		// add items from the new list that are not in the current list
		// update items that exist in both

		this.trigger('change', { 
			added: addedItems,
			removed: removedItems,
			changed: changedItems
		});

		return this;
	};

	// add an array of items, with options
	Collection.prototype.add = function(items, _options) {
		this._log(['collection add', items, _options]);

		items = items || [];
		if (!$.isArray(items)) { items = [items]; }

		var collection = this,
			addedItems = [];

		items.forEach(function(itemData, idx, arr){
			var newModel = $.extend(true, {}, collection.model, {collection: collection}, _options);
			var newItem = new Model( newModel, itemData );

			collection.items.push( newItem );
			addedItems.push(newItem);
		});

		this.trigger('change', { added: addedItems.slice(0), removed: [], changed: []});

		return this;
	};

	// remove an item
	Collection.prototype.remove = function(_id) {
		this._log(['collection remove', _id]);
		var id = -1,
			itemIndex,
			removedModel;

		// parse what the request item is
		// support either string/number for id or passing in a model to remove it
		if ( !isNaN(parseInt(_id, 10)) ) {
			id = parseInt(_id, 10);
		} else if ( _id instanceof Model) {
			// use the model's "unique field"
			// id = _id.id;
			id = _id[_id._uniqueField];
		} else {
			return false;
		}

		// get the array index of the item
		itemIndex = this.items.map(function(i){ return i[i._uniqueField]; }).indexOf(id);

		// save the model for the event
		removedModel = this.items.splice(itemIndex, 1);

		this.trigger('change', { added: [], removed: [removedModel], changed: []});

		return this;
	};

	// get an array of items where attributes[key] === value.
	// if internal is true, then "private" properties can be compared
	Collection.prototype.where = function(key, value, internal) {
		this._log(['collection where', key, value]);

		return $.grep( this.items, function(item, idx) { 
			if (internal) {
				return item[key] === value; 
			} else {
				return item.attributes[key] === value; 
			}
		});
	};

	// sort the item list
	Collection.prototype.sort = function(fn) {
		this._log(['collection sort', fn]);

		this.items.sort(fn || function(a, b) {
			return a[a._uniqueField] < b[b._uniqueField];
		});

		// TODO 
		// return info on how items are sorted
		this.trigger('sort', {});

		return this;
	};

	// filter the list with custom filter
	Collection.prototype.filter = function(fn) {
		this._log(['collection filter', fn]);

		var filteredItems = [];

		// TODO
		// filter items

		return filteredItems;
	};

	// returns boolean if an item in collection matches comparator fn
	// fn example: function(element, index, array) { return elem > 10; }
	Collection.prototype.contains = function(fn) {
		this._log(['collection contains', fn]);

		return this.items.some(fn);
	};

	// clear the whole list
	Collection.prototype.clear = function(_options) {
		this._log(['collection clear', _options]);

		this.trigger('clear', {items: this.items.slice(0)});

		// clear all items
		this.items = [];

		return this;
	};

	// render the list
	Collection.prototype.render = function(_options) {
		this._log(['collection render', _options]);

		// TODO
		// get each item's render result
		// create hooks for rendering to modify result
		// output html
		// add $el?

		this.trigger('render', {});

		return this;
	};

	// event handlers
	Collection.prototype.onsort = function(evt) {
		this._log(['collection sort event handler', evt]);
	};

	Collection.prototype.onchange = function(evt) {
		this._log(['collection change event handler', evt]);
	};

	Collection.prototype.onrender = function(evt) {
		this._log(['collection render event handler', evt]);
	};
	// -- end Collection Class


	// Model Class
	// -----------
	var Model = function(opt, attributes) {
		opt = opt || {};
		attributes = attributes || {};

		// basic props
		this.uid = guid();
		this.options = opt;
		this.debug = opt.debug || false;
		this._dirty = true;
		// this._synced = true;
		// this.validate = false;
		this.collection = opt.collection || null;
		this._uniqueField = 'id';
		this.created = moment();

		// merge functions into this class
		$.extend(true, this, opt.functions);


		// template/dom
		this._hasBeenRendered = false;
		this.$el = null;
		this.template = opt.template ? this.initTemplate(opt.template) : null;
		this.templateRender = '';

		// TODO
		// link the $el to a dom element or query

		// main model values are held here
		this.attributes = attributes;

		// events
		this._events = {};

		// do anything that needs to get initialized
		this.initialize.apply(this, this.options);
	};

	Model.prototype.initialize = function(_options) {
		this._log(['model init', _options]);

		// render template
		if (this.template) {
			this.render();
		}

		this._dirty = false;

		// set the basic events
		this.on('dirty', this.ondirty);
		this.on('change', this.onchange);

	};

	// return single value or object of values from array of keys
	Model.prototype.get = function(key) {
		this._log(['model get', key]);

		if (!key) {
			return this.getAttributes();
		} else if ($.isArray(key)) {
			var result = {},
				model = this;

			// go through each key, extend objects or assign values
			key.forEach(function(k, i, a){
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
		this._log(['model set', key, value, internal, silent]);

		var changedAttributes = [],
			model = this,
			change = {};

		// if the key is an object, we shift the arguments, as we don't have a value
		if (typeof key === "object") {
			internal = value;
			silent = internal;
			value = null;

			if (internal) {
				model = $.extend(true, {}, model, key);
			} else {
				model.attributes = $.extend(true, {}, model.attributes, key);
			}

			// push items into the array
			for (var k in key) {
				change = {};
				change[k] = key[k];
				changedAttributes.push(change);
			}

		} else {
			if (internal) {
				model[key] = value;
			} else {
				model.attributes[key] = value;
			}

			change[key] = value;
			changedAttributes.push(change);
		}

		if (!silent) {
			this.trigger('change', {changed: changedAttributes });
		}

		// set to dirty
		this._dirty = true;
		this.trigger('dirty', {});

		return this;
	};

	// render item from template, or if item is clean, just return the already rendered html
	Model.prototype.render = function(_options) {
		this._log(['model render', _options]);

		// if we either don't have it at all, or the model has changed since last render
		if (!this._hasBeenRendered) {
			// add the guid of the model in the template for use
			this.templateRender = this.template($.extend(true, {guid: this.uid}, this.attributes) );
			this._hasBeenRendered = true;
		}

		// trigger event
		this.trigger('render', {});

		return this.templateRender;
	};

	// just return all attributes
	Model.prototype.getAttributes = function() {
		this._log(['model getAttributes']);

		return this.attributes;
	};

	// just return all attributes
	Model.prototype.parser = function(input) {
		this._log(['model parser'], input);

		var output = {};

		return output;
	};

	// return only attributes
	Model.prototype.toJSON = function() {
		return $.extend(true, {}, this.attributes);
	};

	// event handlers
	Model.prototype.onchange = function(evt) {
		this._log(['model change event handler', evt]);
	};

	Model.prototype.onrender = function(evt) {
		this._log(['model render event handler', evt]);
	};

	Model.prototype.ondirty = function(evt) {
		this._log(['model dirty event handler', evt]);

		this._hasBeenRendered = false;
	};
	// -- end Model Class


	// Methods for both

	// logger
	Model.prototype._log = Collection.prototype._log = function(message, type) {
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
		if (typeof _template == 'function' ) { return _template; }

		// if it's a string, compile it with Handlebars
		if (typeof _template === 'string') { return Handlebars.compile(_template); }

		// else return null
		return null;
	};

	// // check what the template is and deal with it
	// Model.prototype.extend = Collection.prototype.extend = function(_template) {
	// 	for (key in obj) {
	// 		if (obj.hasOwnProperty(key)) {
	// 			// We are sure that obj[key] belongs to the object and was not inherited.
	// 		}
	// 	}

	// 	return this;
	// };

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


	return Collection;

})();

