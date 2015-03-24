/* jshint jquery:true, browser:true, eqeqeq:false, undef:true, unused:false, quotmark:false, expr:true  */
/* globals Handlebars, JST, PVCollection, moment, toastr */


$(document).ready(function() {
	toastr.options = {
		"closeButton": false,
		"debug": false,
		"newestOnTop": true,
		"progressBar": true,
		"positionClass": "toast-top-right",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};

	var newsList = new PVCollection({
		// collection options
		name: 'News list',
		debug: true,
		template: JST['examples/templates/newslist.hbs'],
		functions: {
			initialize: function(_options) {
				this.log(['user init init'], 'info');
			},
			onChange: function(evt) {
				var changes = 'Added:' + evt.added.length + ' - Changed:' +evt.changed.length + ' - Removed:' +evt.removed.length;

				toastr.info('Change <br>' + changes);

				console.info('change event', evt);

				$("#news-wrapper").html( this.render() );

				$("#debug")
					.text(moment().format() + '\n\n')
					.append(this.toJSON(true));

			}
		}
	}, {
		// model options/template
		debug: true,
		template: JST['examples/templates/newsitem.hbs'],
		attributes: {
			id: null,
			title: '',
			deck: '',
			body: '',
			check: false,
			created: null
		},
		functions: {
			initialize: function(options) {

			},
			onChange: function(evt) {
				// this was added in model setup
				this.render();
			}
		}
	});


	// bind buttons
	$(".btn-submit").on('click', function() {
		if ( !$("#title").val().length && !$("#deck").val().length && !$("#body").val().length) {
			return false;
		}

		newsList.add({
			title: $("#title").val(),
			deck: $("#deck").val(),
			body: $("#body").val(),
			check: $("#check").prop('checked')
		});

		$("#title").val('');
		$("#deck").val('');
		$("#body").val('');
		$("#check").prop('checked', false);
	});

	$(".btn-set").on('click', function(){
		newsList.set(newsitems2);
	});

	var newsitems = [{
			id: -5,
			title: 'Bacon ipsum dolor amet turkey pork belly pig',
			deck: 'bresaola filet mignon turducken frankfurter sirloin pastrami tenderloin kevin drumstick',
			body: 'T-bone beef ribs turkey porchetta andouille. Tri-tip turducken chuck swine, tongue t-bone ham hock. Tri-tip venison kevin beef pastrami flank. Rump sausage tail boudin, pork ham pork belly short ribs kevin hamburger. Picanha ribeye chicken, strip steak drumstick corned beef ham kielbasa landjaeger pastrami fatback doner boudin filet mignon ball tip. Pork beef ribs strip steak, chuck ball tip corned beef filet mignon meatloaf fatback sirloin kielbasa cow bresaola boudin short ribs.',
			check: false,
			created: moment([2015, 2, 5])
		}, {
			id: -3,
			title: 'Ground round pork belly salami venison ham',
			deck: 'Sausage shankle sirloin doner pig shoulder,',
			body: 'Ground round pork belly salami venison ham, chuck pork chicken picanha alcatra pig cupim prosciutto swine meatball. Corned beef pork belly shankle biltong ground round. Prosciutto shank pork hamburger flank pancetta. Pastrami pork belly turducken rump turkey, tongue picanha chicken pig shankle frankfurter. Ribeye landjaeger flank turkey beef sausage bacon kevin pork chop. Tongue bresaola short ribs, picanha chicken prosciutto capicola. Cupim doner tenderloin pork chop swine sausage brisket shank ham hock landjaeger alcatra.',
			check: false,
			created: moment([2015, 2, 11])
		}, {
			id: -2,
			title: 'Corned beef pork belly shankle biltong ground round',
			deck: 'kielbasa tenderloin turducken picanha. T-bone turducken pig frankfurter.',
			body: 'Prosciutto hamburger ham hock, tail t-bone short ribs corned beef landjaeger ball tip bacon shank meatball jerky swine. Meatball shoulder ribeye doner fatback, swine leberkas t-bone pork chop kielbasa chicken landjaeger filet mignon salami. Short ribs t-bone hamburger prosciutto short loin tongue. Spare ribs picanha ham hock, frankfurter rump brisket shoulder ribeye porchetta drumstick chicken shank.',
			check: false,
			created: moment([2015, 2, 15])
		}];

	var newsitems2 = [{
			id: 3345,
			title: 'Bacon ipsum dolor amet turkey pork belly pig',
			deck: 'bresaola filet mignon turducken frankfurter sirloin pastrami tenderloin kevin drumstick',
			body: 'T-bone beef ribs turkey porchetta andouille. Tri-tip turducken chuck swine, tongue t-bone ham hock. Tri-tip venison kevin beef pastrami flank. Rump sausage tail boudin, pork ham pork belly short ribs kevin hamburger. Picanha ribeye chicken, strip steak drumstick corned beef ham kielbasa landjaeger pastrami fatback doner boudin filet mignon ball tip. Pork beef ribs strip steak, chuck ball tip corned beef filet mignon meatloaf fatback sirloin kielbasa cow bresaola boudin short ribs.',
			check: false,
			created: moment([2015, 2, 2])
		}, {
			id: -2,
			title: 'Corned beef pork belly shankle biltong ground round',
			deck: 'kielbasa tenderloin turducken picanha. T-bone turducken pig frankfurter.',
			body: 'Prosciutto hamburger ham hock, tail t-bone short ribs corned beef landjaeger ball tip bacon shank meatball jerky swine. Meatball shoulder ribeye doner fatback, swine leberkas t-bone pork chop kielbasa chicken landjaeger filet mignon salami. Short ribs t-bone hamburger prosciutto short loin tongue. Spare ribs picanha ham hock, frankfurter rump brisket shoulder ribeye porchetta drumstick chicken shank.',
			check: false,
			created: moment([2015, 2, 15])
		}, {
			id: -5,
			title: 'Bacon ipsum asd asd asd asd asd',
			deck: 'bresaola filet mignon turducken frankfurter sirloin pastrami tenderloin kevin drumstick',
			body: 'T-bone beef ribs turkey porchetta andouille. Tri-tip turducken chuck swine, tongue t-bone ham hock. Tri-tip venison kevin beef pastrami flank. Rump sausage tail boudin, pork ham pork belly short ribs kevin hamburger. Picanha ribeye chicken, strip steak drumstick corned beef ham kielbasa landjaeger pastrami fatback doner boudin filet mignon ball tip. Pork beef ribs strip steak, chuck ball tip corned beef filet mignon meatloaf fatback sirloin kielbasa cow bresaola boudin short ribs.',
			check: true,
			created: moment([2015, 2, 5])
		}];

	newsList.add(newsitems);


	window.newsList = newsList;

});

