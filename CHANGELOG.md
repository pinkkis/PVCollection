## Planned

* Basic Collection.fetch() implemented
	* You can overwrite this with a function that returns an array of objects that will be model data
	* Uses deferreds
* Basic Collection.save() implemented
	* Collection creates a deferred
	* Once deferred is resolved, the Collection receives a new array and uses .set() - if there's no return value, just clear dirty and changedAttributes
* Basic Model.save() and .fetch()
* Give collection an element and it'll draw itself to that
	* Models in collection can update themselves and cause whole collection to redraw

## Implemented

v0.3.5
======

* Added onError and error event to Collection
* Fixed issue where collection.set's changed items didn't correctly find the matching old item
* jQuery is passed to the iife
* Collection.set doesn't emit a change if there were no changes
* Collection now has a dirty event and state, which is set on add, set and remove
* Collection defaultComparator added, and collectio.setComparator() added to set it during runtime
* Model.set localProp nulling done on every loop
* Model.set uses 'model' and not 'this' in it, to clarify what is changing
* Collection.remove returns false if model was not found
* Added collection.$container as the dom container
* Wrapped the whole thing in an IIFE, still assigning a global PVCollection object
* Fixed issue in model.set() where attributes were merged before comparison was done, making it impossible to tell what changed
* Collection.add can now return the array of models that was added
* Collection.set change event now has an array of models, not input items for added

v0.3.1
======

* Renamed test folder to examples, as it's not for unit test or anything
* Added and tweaked examples
* Added an incremental id counter to models
* If on creation a model is missing a value in the _uniqueField specified property, or it's falsy, add a unique id into it
* Renamed event handler functions to camelcase
* Added very basic collection fetch and save, that depend on external resolving of their deferreds

v0.3.0
======

* Collection.set() now working
* Model.set() now adds changed attributes to this.changedAttributes to get them later and outside of the event
	* Now uses deep property comparison to figure out what changed
	* If nothing changed, item is not listed in changedItems
* Model.clean() clears _dirty and empties changedAttributes
* Collection.render() implemented
	* Only basic support in place. Model.render() is called. Need to add hooks to allow rendering be customized
	* this._hasBeenRendered is set to false on change and sort events, so that new models get rendered

v0.2.4
======

* Collection.first() and .last() added
* Collection.filter() implemented
* Collection.map() implemented


v0.2.3
======

* Collection.toJSON() implemented - you cannot recreate the collection from this, this is just a helper/visual item
* Added placeholdern methods for Collection .fetch() and .save()
* Added Collection .isDirty(), .isSaving(), .isSorted() and .length methods and props
* Model.render() now returns .toJSON() if it doesn't have a template


v0.2.2
======

* Added silent option to more events
* Changed prototype._log to log
* Collection.where() can now also accept a function as the first argument


v0.2.1
======

* Events now triggered with .fireWith() so that context is passed correctly
* Added to github


v0.2.0
======

* Creating collections with models functional
* Collection
	* .add() .remove() .sort() .where() .clear() .get() - methods working
* Model
	* .set() .get() .toJSON() .render()
* Events: adding, removing and triggering
