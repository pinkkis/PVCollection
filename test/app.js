/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true  */
/* globals Handlebars, JST, PVCollection */

var List = new PVCollection({
	// collection options
	name: 'Test list',
	debug: true,
	template: JST['test/templates/collection.hbs'],
	functions: {
		initialize: function(_options) {
			this.log(['user init init'], 'info');
		}
	}
}, {
	// model options/template
	debug: true,
	foo: 'bar',
	template: JST['test/templates/item.hbs'],
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
			id: Math.floor(Math.random() * 9999),
			foo: 'bar',
			bar: Math.random(),
			title: 'Random thing ' + Math.floor(Math.random() * 100),
			baz: {
				thing: 'stuff'
			}
		});
	});

	$("#set-list").on('click', function(){
		var items = [{
			id: Math.floor(Math.random() * 9999),
			foo: 'bar',
			bar: Math.random(),
			title: 'Random thing ' + Math.floor(Math.random() * 100),
			baz: {
				thing: 'stuff'
			}
		}];

		items.push( List.get( Math.floor(Math.random() * List.length) ).get() );

		List.set(items);
	});

	// draw the first item
	$("#draw-model").on('click', function(){
		$("#model-wrapper").html( List.get( Math.floor(Math.random() * List.length) ).render() );
	});

	// render json
	$("#draw-list").on('click', function(){
		$("#list-wrapper").html( List.render({}) );
	});

	// list JSON
	$("#draw-list-json").on('click', function(){
		$("#list-wrapper").html( List.toJSON(true) );
	});

	// draw JSON
	$("#reset").on('click', function(){
		List.clear();
	});	

});
