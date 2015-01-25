## Planned

v0.4.0
======

* Basic Collection.fetch() implemented
	* You can overwrite this with a function that returns an array of objects that will be model data
	* Uses deferreds
* Basic Collection.save() implemented
	* Collection creates a deferred
	* Once deferred is resolved, the Collection receives a new array and uses .set() 

v0.3.0
======

* Collection.set() now working
* Collection.filter() implemented
* Collection.render() implemented


## Implemented

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
