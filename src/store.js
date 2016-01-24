import merge from 'mout/object/merge'
import camelCase from 'mout/string/camelCase'
import Store from './firebase-store'
import Paginator from './firebase-paginator'

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
		 * Package <> Component relationship
		 */
		this.on('component.added', (componentName, data) => {
			this.setPackageComponent(data.packageId, componentName, true)
		})
		this.on('component.removed', (componentName, data) => {
			this.setPackageComponent(data.packageId, componentName, null)
		})

		/**
		 * Package <> Page relationship
		 */
		this.on('page.added', (pageId, page) => {
			this.setPackagePage(page.packageId, pageId, true)
		})
		this.on('page.removed', (pageId, page) => {
			this.setPackagePage(page.packageId, pageId, null)
		})
	}

	/*eslint spaced-comment:0*/
	//////////////
	// PACKAGES //
	//////////////

	/**
	 * Saves package data to Firebase.
	 * @param {string} name 	The package name.
	 * @param {?} data 			The data (null to remove the package).
	 * @return {Promise} 		A Promise.
	 */
	setPackage (name, data) {
		return this.set(`packages/${ name }`, data)
	}

	/**
	 * Removes a package from Firebase.
	 * @param  {string} name 	The package name.
	 * @return {Promise} 		A Promise.
	 */
	removePackage (name) {
		return this.setPackage(name, null)
	}

	/**
	 * Get packages from Firebase.
	 * @return {Promise} A Promise which resolves a packages Array.
	 */
	getPackages () {
		return this.get('packages').then((snapshot) => {
			const packages = snapshot.val()
			const packagesArray = []
			for (let name in packages) {
				packagesArray.push(packages[name])
			}
			return packagesArray
		})
		.then((packages) => {
			let queue = []
			packages.map((pkg) => {
				queue.push(this.getPackageComponents(pkg.name).then((components) => {
					pkg.components = components.length
				}))
			})
			return Promise.all(queue).then(() => packages)
		})
	}

	/**
	 * Get a package from Firebase.
	 * @param {string} packageName 	The package name.
	 * @return {Promise} 			A Promise which resolves a package Object.
	 */
	getPackage (packageName) {
		return this.get(`packages/${ packageName }`).then((snapshot) => {
			return snapshot.val()
		})
	}

	/**
	 * Package components two-way relationship
	 * @param {string} packageName   	The package name.
	 * @param {string} componentName 	The component name.
	 * @param {boolean|null} data 		The data (boolean or null to remove)
	 */
	setPackageComponent (packageName, componentName, data) {
		return this.set(`package_components/${ packageName }/${ componentName }`, data)
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
	 * @param {string} name 	The component name.
	 * @param  {boolean} sync 	Use the sync index.
	 * @return {string} 		A Firebase path.
	 */
	getComponentPath (name, sync) {
		return `${ this.getComponentsPath(sync) }/${ name }`
	}

	/**
	 * Get a Firebase query reference for fetching a component.
	 * @param {string} name 	The component name.
	 * @param  {boolean} sync 	Use the sync index.
	 * @return {Firebase} 		A Firebase reference.
	 */
	getComponentRef (name, sync) {
		return this.getComponentsRef(sync).child(name)
	}

	/**
	 * Saves component data to Firebase.
	 * @param {string} name 	The component name.
	 * @param {?} data 			The data (null to remove the component).
	 * @param {boolean} sync 	Use the sync index.
	 * @return {Promise} 		A Promise.
	 */
	setComponent (name, data, sync) {
		const path = this.getComponentPath(name, sync)
		if (!data) {
			return this.getComponent(name).then(({ component }) => {
				return this.set(path, data).then(() => {
					this.emit('component.removed', name, component)
				})
			})
		}
		return this.set(path, data).then(() => {
			this.emit('component.added', name, data)
		})
	}

	/**
	 * Removes a component from Firebase.
	 * @param  {string} name 	The component name.
	 * @param {boolean} sync 	Use the sync index.
	 * @return {Promise} 		A Promise.
	 */
	removeComponent (name, sync) {
		return this.setComponent(name, null, sync)
	}

	/**
	 * Get the components for a package from Firebase.
	 * @return {Promise} A Promise which resolves a components Array.
	 */
	getPackageComponents (packageName) {
		return this.get(this.getPackageComponentsRef(packageName)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve([])
			}
			const componentIds = Object.keys(snapshot.val())
			const components = componentIds.map((componentId) => this.getComponent(componentId))
			this.emit('serviceLoading')
			return Promise.all(components)
		})
		.then((results) => {
			this.emit('serviceComplete')
			return results
		})
		.catch((e) => {
			this.emit('serviceError', e)
		})
	}

	/**
	 * Get a Firebase query reference for fetching components for a specific package.
	 * @param  {string} packageName		The package name.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackageComponentsRef (packageName) {
		return this.getRef(`package_components/${ packageName }`)
	}

	/**
	 * Get a component.
	 * @param  {Firebase} name 	The component name.
	 * @return {Promise} 		A Promise which resolves an Array of indexes.
	 */
	getComponent (name) {
		this.emit('serviceLoading')
		return Promise.all([
			this.getComponentValue(name),
			this.getComponentValue(name, true)
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
	 * @param  {string} name The component name
	 * @param  {boolean} sync Use the 'sync' index
	 * @return {Promise}      A Promise which resolves an Object containing the
	 * component data and the 'sync' param value
	 */
	getComponentValue (name, sync) {
		return this.get(this.getComponentPath(name, sync)).then((snapshot) => {
			return {
				data: snapshot.val(),
				sync: sync
			}
		})
	}

	/**
	 * Get the 'sync' or 'components' index for a component.
	 * @param  {Object} component 	The component.
	 * @param  {boolean} sync 		Enable to get the 'sync' index when the component
	 * Object comes from the 'components' index
	 * @return {Promise} 			A Promise which resolves the index Object.
	 */
	syncComponentIndex (component, sync) {
		if (!component) {
			return Promise.resolve()
		}
		return this.get(this.getComponentPath(component.name, sync)).then((snapshot) => {
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
	// PAGES //
	///////////
	
	/**
	 * Saves a page to Firebase.
	 * @param {?} data 			The data (null to remove the package).
	 * @param {string} pageId 	The page ID.
	 * @return {Promise} 		A Promise.
	 */
	setPage (data, pageId) {
		let ref = this.getRef('pages')
		if (pageId) {
			ref = ref.child(pageId)
		}
		else {
			ref = ref.push()
			pageId = ref.key()
			data.pageId = pageId
		}

		if (!data) {
			return this.getPage(pageId).then((page) => {
				return this.set(ref, data).then(() => {
					this.emit('page.removed', pageId, page)
				})
			})
		}
		return this.set(ref, data).then(() => {
			this.emit('page.added', pageId, data)
			return pageId
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
	 * @param  {string} packageName		The package name.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackagePagesRef (packageName) {
		return this.getRef(`package_pages/${ packageName }`)
	}

	/**
	 * Create a paginator.
	 */
	paginate (id, ref, limit = 6) {
		this.paginator[id] = new Paginator(ref, limit)
	}

	/**
	 * Create a Pages paginator
	 * @param  {string} packageName The package name.
	 */
	paginatePages (packageName) {
		this.paginate('pages', this.getPackagePagesRef(packageName))
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

	/**
	 * Get pages from Firebase for a specific package.
	 * @return {Promise} A Promise which resolves a pages Array.
	 */
	getPages (packageName) {
		return this.get(this.getPackagePagesRef(packageName)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId)))
		})
	}

	/**
	 * Package pages relationship
	 * @param {string} packageName   	The package name.
	 * @param {string} pageId 			The page ID.
	 * @param {boolean|null} data 		The data (boolean or null to remove)
	 */
	setPackagePage (packageName, pageId, data) {
		return this.set(`package_pages/${ packageName }/${ pageId }`, data)
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