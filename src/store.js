import merge from 'mout/object/merge'
import camelCase from 'mout/string/camelCase'
import Store from 'firebase-store'
import Paginator from 'firebase-store/lib/firebase-paginator'

/**
 * ComponentStore Firebase Service.
 * @extends {Store}
 */
class ComponentStore extends Store {

	/**
	 * Constructor
	 */
	constructor () {
		super()

		/**
		 * Holds paginator instances
		 * @type {Object}
		 */
		this.paginator = {}

		/**
		 * Component relationships
		 */
		this.on('component.added', (componentId, data) => {
			// Package <> Component relationship
			this.setPackageComponent(data.packageId, componentId, true)
		})
		this.on('component.removed', (componentId, data) => {
			// Package <> Component relationship
			this.removePackageComponent(data.packageId, componentId)
			// Component <> Demo relationship
			this.remove(this.componentDemosRef(componentId))
		})

		/**
		 * Page relationships
		 */
		this.on('page.added', (pageId, page) => {
			// Package <> Page relationship
			this.setPackagePage(page.packageId, pageId, true)
		})
		this.on('page.removed', (pageId, page) => {
			// Package <> Page relationship
			this.removePackagePage(page.packageId, pageId)
		})

		/**
		 * Package relationships
		 */
		this.on('package.removed', (packageId, pkg) => {
			// Components
			this.removePackageComponents(packageId)
			// Pages
			this.removePages(packageId)
		})
	}

	/*eslint spaced-comment:0*/
	////////////////
	// PAGINATION //
	////////////////

	/**
	 * Create a paginator.
	 */
	paginate (id, ref, limit = 6) {
		this.paginator[id] = new Paginator(ref, limit)
	}

	/**
	 * Get paginator results.
	 * @param {string} id 		The paginator ID.
	 * @param {string} type 	Page type ('prevPage' or 'nextPage')
	 * @return {Array} 			The results.
	 */
	getPaginatorResults (id, type) {
		this.emit('serviceLoading')
		let page
		try {
			page = this.paginator[id][type]()
		}
		catch (e) {
			this.emit('serviceError', e)
			return Promise.reject(e)
		}
		if (!page) {
			return Promise.resolve([])
		}
		return this.get(page.ref).then((snapshot) => {
			this.emit('serviceLoading')
			return page.cb(snapshot)
		})
	}

	/**
	 * Get paginator results call function.
	 * @param {string} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	getPaginatorResultsCall (id) {
		let inst = this[camelCase(`get-paginator-${ id }`)]
		if (typeof inst !== 'function') {
			return false
		}
		return inst.bind(this)
	}

	/**
	 * Get paginator results for the next page.
	 * @param {string} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	nextPage (id) {
		const inst = this.getPaginatorResultsCall(id)
		if (!inst) {
			return Promise.reject(`invalid paginator results call ${ id }`)
		}
		return inst('nextPage')
	}

	/**
	 * Get paginator results for the previous page.
	 * @param {string} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	prevPage (id) {
		const inst = this.getPaginatorResultsCall(id)
		if (!inst) {
			return Promise.reject(`invalid paginator results call ${ id }`)
		}
		return inst('prevPage')
	}

	//////////////
	// PACKAGES //
	//////////////

	/**
	 * Saves package data to Firebase.
	 * @param {string} packageId 	The package ID.
	 * @param {?} data 				The data (null to remove the package).
	 * @return {Promise} 			A Promise.
	 */
	setPackage (packageId, data) {
		let path = this.getRef('packages')
		if (packageId) {
			path = path.child(packageId)
		}
		else {
			path = path.push()
		}
		if (!data) {
			return this.getPackage(packageId).then((pkg) => {
				return this.set(path, data).then(() => {
					this.emit('package.removed', packageId, pkg)
				})
			})
		}
		return this.set(path, data).then(() => {
			this.emit('package.added', packageId, data)
		})
	}

	/**
	 * Removes a package from Firebase.
	 * @param  {string} packageId 	The package ID.
	 * @return {Promise} 			A Promise.
	 */
	removePackage (packageId) {
		return this.setPackage(packageId, null)
	}

	/**
	 * Get packages from Firebase.
	 * @return {Promise} A Promise which resolves a packages Array.
	 */
	getPackages () {
		return this.get('packages').then((snapshot) => {
			const packages = this.snapshotArray(snapshot)
			let queue = []
			packages.map((pkg) => {
				queue.push(this.getPackageComponentsCount(pkg.objectId).then((count) => {
					pkg.components = count
				}))
			})
			return Promise.all(queue).then(() => packages)
		})
	}

	/**
	 * Get a package from Firebase.
	 * @param {string} packageId 	The package ID.
	 * @return {Promise} 			A Promise which resolves a package Object.
	 */
	getPackage (packageId) {
		return this.get(`packages/${ packageId }`).then((snapshot) => {
			return snapshot.val()
		})
	}

	/**
	 * Package components two-way relationship
	 * @param {string} packageId   		The package ID.
	 * @param {string} componentId 		The component ID.
	 * @param {boolean|null} data 		The data (boolean or null to remove)
	 */
	setPackageComponent (packageId, componentId, data) {
		return this.set(this.getPackageComponentsRef(packageId).child(componentId), data)
	}

	/**
	 * Remove Package <> Component relationship
	 * @param {string} packageId   		The package ID.
	 * @param {string} componentId 		The component ID.
	 */
	removePackageComponent (packageId, componentId) {
		return this.setPackageComponent(packageId, componentId, null)
	}

	onPackageAdded (cb, error) {
		this.getOn('packages', 'child_added', (snapshot) => {
			cb(snapshot.val())
		}, error)
	}

	onPackageRemoved (cb, error) {
		this.getOn('packages', 'child_removed', (snapshot) => {
			cb(snapshot.key())
		}, error)
	}

	////////////////
	// COMPONENTS //
	////////////////

	/**
	 * Get the Firebase path for fetching components.
	 * @param  {boolean} sync 	Use the sync index.
	 * @return {string}			A Firebase path.
	 */
	getComponentsPath (sync) {
		let path = `components`
		if (sync) {
			path = `sync/${ path }`
		}
		return path
	}

	/**
	 * Get a Firebase query reference for fetching components.
	 * @param  {boolean} sync 	Use the sync index.
	 * @return {Firebase}		A Firebase reference.
	 */
	getComponentsRef (sync) {
		return this.ref.child(this.getComponentsPath(sync))
	}

	/**
	 * Get the Firebase path for fetching a component.
	 * @param {string} componentId 	The component ID.
	 * @param  {boolean} sync 		Use the sync index.
	 * @return {string} 			A Firebase path.
	 */
	getComponentPath (componentId, sync) {
		return `${ this.getComponentsPath(sync) }/${ componentId }`
	}

	/**
	 * Get a Firebase query reference for fetching a component.
	 * @param {string} componentId 	The component ID.
	 * @param  {boolean} sync 		Use the sync index.
	 * @return {Firebase} 			A Firebase reference.
	 */
	getComponentRef (componentId, sync) {
		return this.getComponentsRef(sync).child(componentId)
	}

	/**
	 * Saves component data to Firebase.
	 * @param {string} componentId 	The component ID.
	 * @param {?} data 				The data (null to remove the component).
	 * @param {boolean} sync 		Use the sync index.
	 * @return {Promise} 			A Promise.
	 */
	setComponent (componentId, data, sync) {
		if (!componentId) {
			const ref = this.getComponentsRef(sync).push()
			componentId = ref.key()
		}
		const path = this.getComponentPath(componentId, sync)
		if (!data) {
			return this.getComponent(componentId).then(({ component }) => {
				return this.set(path, data).then(() => {
					this.emit('component.removed', componentId, component)
				})
			})
		}
		return this.set(path, data).then((objectId) => {
			this.emit('component.added', componentId, data)
			return objectId
		})
	}

	/**
	 * Removes a component from Firebase.
	 * @param  {string} componentId 	The component ID.
	 * @return {Promise} 				A Promise.
	 */
	removeComponent (componentId) {
		return Promise.all([
			this.setComponent(componentId, null),
			this.setComponent(componentId, null, true)
		])
	}

	/**
	 * Get the number of components for a package from Firebase.
	 * @param {string} packageId 	The package ID.
	 * @return {Promise} 			A Promise which resolves a Number.
	 */
	getPackageComponentsCount (packageId) {
		return this.get(this.getPackageComponentsRef(packageId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve(0)
			}
			const componentIds = Object.keys(snapshot.val())
			return componentIds.length
		})
	}

	/**
	 * Get the components for a package from Firebase.
	 * @param {string} packageId	The package ID.
	 * @return {Promise} 			A Promise which resolves a components Array.
	 */
	getPackageComponents (packageId) {
		return this.get(this.getPackageComponentsRef(packageId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve([])
			}
			const componentIds = Object.keys(snapshot.val())
			const components = componentIds.map((componentId) => this.getComponent(componentId))
			return Promise.all(components)
		})
	}

	/**
	 * Remove the components belonging to a package from Firebase.
	 * @param {string} packageId	The package ID.
	 * @return {Promise} 			A Promise.
	 */
	removePackageComponents (packageId) {
		return this.get(this.getPackageComponentsRef(packageId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve()
			}
			const componentIds = Object.keys(snapshot.val())
			const removeComponents = componentIds.map((componentId) => this.removeComponent(componentId))
			return Promise.all(removeComponents)
		})
	}

	/**
	 * Get a Firebase query reference for fetching components for a specific package.
	 * @param  {string} packageId		The package ID.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackageComponentsRef (packageId) {
		return this.getRef(`package_components/${ packageId }`)
	}

	/**
	 * Get a component.
	 * @param  {Firebase} componentId 	The component ID.
	 * @return {Promise} 				A Promise which resolves an Array of indexes.
	 */
	getComponent (componentId) {
		this.emit('serviceLoading')
		return Promise.all([
			this.getComponentValue(componentId),
			this.getComponentValue(componentId, true)
		])
		.then((values) => {
			return Promise.all(
				values.map((component) => this.syncComponentIndex(component.data, !component.sync))
			)
		})
		.then((indexes) => {
			let componentData = null
			for (let i = 0; i <= indexes.length; i++) {
				if (!indexes[i]) {
					indexes.splice(i, 1)
				}
			}
			indexes.forEach((data) => {
				componentData = data
			})
			this.emit('serviceComplete')
			return componentData
		})
		.catch((e) => this.emit('serviceError', e))
	}

	/**
	 * Get a component data
	 * @param  {string} componentId 	The component ID.
	 * @param  {boolean} sync 			Use the 'sync' index.
	 * @return {Promise}      			A Promise which resolves an Object containing the component data and the 'sync' param value
	 */
	getComponentValue (componentId, sync) {
		return this.get(this.getComponentPath(componentId, sync)).then((snapshot) => {
			return {
				data: snapshot.val(),
				sync: sync
			}
		})
	}

	/**
	 * Get the 'sync' or 'components' index for a component.
	 * @param  {Object} component 	The component.
	 * @param  {boolean} sync 		Enable to get the 'sync' index when the component Object comes from the 'components' index
	 * @return {Promise} 			A Promise which resolves the index Object.
	 */
	syncComponentIndex (component, sync) {
		if (!component) {
			return Promise.resolve()
		}
		return this.get(this.getComponentPath(component.objectId, sync)).then((snapshot) => {
			if (!snapshot.exists()) {
				if (sync) {
					return { 
						component, 
						sync: null,
						merge: component
					}
				}
				return { 
					component: null, 
					sync: component, 
					merge: component 
				}
			}
			let data = snapshot.val()
			if (sync) {
				return { 
					component, 
					sync: data, 
					merge: merge(data, component) 
				}
			}
			return { 
				component: data, 
				sync: component, 
				merge: merge(component, data) 
			}
		})
	}

	onComponentUpdate (eventType, cb, error) {
		this.getOn(this.getComponentsRef(), eventType, (snapshot) => {
			this.syncComponentIndex(snapshot.val(), true).then((index) => {
				cb(index)
			})
			.catch((e) => {
				if (error) {
					error(e)
				}
			})
		}, error)
		this.getOn(this.getComponentsRef(true), eventType, (snapshot) => {
			this.syncComponentIndex(snapshot.val()).then((index) => {
				cb(index)
			})
			.catch((e) => {
				if (error) {
					error(e)
				}
			})
		}, error)
	}

	onComponentAdded (cb, error) {
		this.onComponentUpdate('child_added', cb, error)
	}

	onComponentChanged (cb, error) {
		this.onComponentUpdate('child_changed', cb, error)
	}

	onComponentRemoved (cb, error) {
		this.getOn(this.getComponentsRef(), 'child_removed', (snapshot) => {
			cb(snapshot.key())
		}, error)
	}

	///////////
	// DEMOS //
	///////////
	
	componentDemosRef (componentId) {
		return this.getRef(`component_demos/${ componentId }`)
	}

	getComponentDemos (componentId) {
		return this.get(this.componentDemosRef(componentId)).then((snapshot) => this.snapshotArray(snapshot))
	}

	///////////
	// PAGES //
	///////////
	
	/**
	 * Saves a page to Firebase.
	 * @param {?} data 			The data (null to remove the package).
	 * @param {string} pageId 	The page ID.
	 * @return {Promise} 		A Promise.
	 */
	setPage (pageId, data) {
		let ref = this.getRef('pages')
		if (pageId) {
			ref = ref.child(pageId)
		}
		else {
			ref = ref.push()
			pageId = ref.key()
		}

		if (!data) {
			return this.getPage(pageId).then((page) => {
				return this.set(ref, data).then(() => {
					this.emit('page.removed', pageId, page)
				})
			})
		}
		return this.set(ref, data).then((objectId) => {
			this.emit('page.added', pageId, data)
			return objectId
		})
	}

	/**
	 * Removes a page from Firebase.
	 * @param  {string} pageId 	The page ID.
	 * @return {Promise} 		A Promise.
	 */
	removePage (pageId) {
		return this.setPage(null, pageId)
	}

	/**
	 * Get a page from Firebase.
	 * @param {string} pageId 	The page ID.
	 * @return {Promise} 		A Promise which resolves a page Object.
	 */
	getPage (pageId) {
		return this.get(`pages/${ pageId }`).then((snapshot) => {
			return snapshot.val()
		})
	}

	/**
	 * Get a Firebase query reference for fetching pages for a specific package.
	 * @param  {string} packageId		The package ID.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackagePagesRef (packageId) {
		return this.getRef(`package_pages/${ packageId }`)
	}

	/**
	 * Create a Pages paginator
	 * @param  {string} packageId The package ID.
	 */
	paginatePages (packageId) {
		this.paginate('pages', this.getPackagePagesRef(packageId))
	}

	/**
	 * Get 'Pages' paginator results.
	 * @param {string} type 	Page type ('prevPage' or 'nextPage')
	 * @return {Array} 			The results.
	 */
	getPaginatorPages (type) {
		return this.getPaginatorResults('pages', type).then((pageIds) => {
			pageIds = Object.keys(pageIds)
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId)))
		})
		.then((result) => {
			this.emit('serviceComplete')
			return result
		})
		.catch((e) => {
			this.emit('serviceError', e)
		})
	}

	/**
	 * Get pages from Firebase for a specific package.
	 * @param {string} packageId 	The package ID.
	 * @return {Promise} 			A Promise which resolves a pages Array.
	 */
	getPages (packageId) {
		return this.get(this.getPackagePagesRef(packageId)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId)))
		})
	}

	/**
	 * Remove pages from Firebase for a specific package.
	 * @param {string} packageId 	The package ID.
	 * @return {Promise} 			A Promise.
	 */
	removePages (packageId) {
		return this.get(this.getPackagePagesRef(packageId)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.removePage(pageId)))
		})
	}

	/**
	 * Package pages relationship
	 * @param {string} packageId   	The package ID.
	 * @param {string} pageId 		The page ID.
	 * @param {boolean|null} data 	The data (boolean or null to remove)
	 */
	setPackagePage (packageId, pageId, data) {
		return this.set(`package_pages/${ packageId }/${ pageId }`, data)
	}

	/**
	 * Remove Package <> Page relationship
	 * @param {string} packageId   	The package ID.
	 * @param {string} pageId 		The page ID.
	 */
	removePackagePage (packageId, pageId) {
		return this.setPackagePage(packageId, pageId, null)
	}

	onPageRemoved (cb, error) {
		this.getOn('pages', 'child_removed', (snapshot) => {
			cb(snapshot.key())
		}, error)
	}
}

const store = new ComponentStore()
export default store
module.exports = exports.default