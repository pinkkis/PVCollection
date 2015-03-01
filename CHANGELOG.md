## Planned

v0.4.0
======

* Basic Collection.fetch() implemented
	* You can overwrite this with a function that returns an array of objects that will be model data
	* Uses deferreds
* Basic Collection.save() implemented
	* Collection creates a deferred
	* Once deferred is resolved, the Collection receives a new array and uses .set() 

## Implemented

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
	* .set() .get() .toJSON .render()
* Events: adding, removing and triggering
