# PVCollection

PVCollection is a Model/Collection library for quick and rough models and collections with events.

## Usage

Create a new PVCollection instance, and pass it two objects. First is the options for the collection, the second is the base Model that each item in the collection will be instantiated from.

```javascript
var List = new PVCollection({
	// collection options
	name: 'Test list',
	debug: true,
	functions: {
		initialize: function(_options) {
			this.log('collection user init');
		}
	}
}, {
	// model options/template
	debug: true,
	foo: 'bar',
	template: JST['test/templates/item.hbs'],
	functions: {
		onchange: function(evt) {
			this.render();
		}
	}
});
```

### Dependencies

PVCollection has a hard dependency on jQuery, and currently uses Handlebars for DOM Templates, though you can easily change that in the .render method. Additionally moment.js is used for time manipulation.

## License

Copyright (c) 2015 Kristian Koivisto-Kokko. See the LICENSE file for license rights and
limitations (MIT).