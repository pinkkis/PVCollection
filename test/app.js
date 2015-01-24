/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true  */
/* globals Handlebars, JST, SPCollection */
'use strict';

var List = new SPCollection({
	// collection options
	name: 'Test list',
	debug: true,
	functions: {
		initialize: function(_options) {
			this._log('collection init');

			// set basic events
			this.on('sort', this.onsort);
			this.on('render', this.onrender);
			this.on('change', this.onchange);

			this.initialized = true;
			this.trigger('initialized', {});
		}
	}
}, {
	// model options/template
	debug: true,
	foo: 'bar',
	template: JST['templates/item.hbs'],
	functions: {
		onchange: function(evt) {
			// this was added in model setup
			this.render();
		}
	}
});


$(document).ready(function(){
	// bind buttons
	$("#add-model").on('click', function(){
		List.add({
			foo: 'bar',
			bar: Math.random(),
			title: 'Random thing ' + Math.floor(Math.random() * 100),
			baz: {
				thing: 'stuff'
			}
		});
	});

});
