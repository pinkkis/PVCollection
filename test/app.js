/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true  */
/* globals Handlebars, JST, PVCollection */

var List = new PVCollection({
	// collection options
	name: 'Test list',
	debug: true,
	functions: {
		initialize: function(_options) {
			this.log('user init init');
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
			foo: 'bar',
			bar: Math.random(),
			title: 'Random thing ' + Math.floor(Math.random() * 100),
			baz: {
				thing: 'stuff'
			}
		});
	});

	// draw the first item
	$("#draw-model").on('click', function(){
		$("#model-wrapper").html( List.get(0).render() );
	});

	// draw JSON
	$("#draw-list").on('click', function(){
		$("#list-wrapper").html( List.toJSON(true) );
	});

	// draw JSON
	$("#reset").on('click', function(){
		List.clear();
	});	

});
