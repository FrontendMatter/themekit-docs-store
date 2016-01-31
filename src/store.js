import merge from 'mout/object/merge'
import camelCase from 'mout/string/camelCase'
import slugify from 'mout/string/slugify'
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
		this.on('component.added', (objectId, data) => {
			// Package <> Component relationship
			this.setPackageComponent(data.packageId, data.version, objectId, true)
		})
		this.on('component.removed', (objectId, data) => {
			// Package <> Component relationship
			this.removePackageComponent(data.packageId, data.version, objectId)
			// Component <> Demo relationship
			this.remove(this.componentDemosRef(objectId, data.version))
		})

		/**
		 * Page relationships
		 */
		this.on('page.added', (objectId, data) => {
			// Package <> Page relationship
			this.setPackagePage(data.packageId, data.version, objectId, true)
		})
		this.on('page.removed', (objectId, data) => {
			// Package <> Page relationship
			this.removePackagePage(data.packageId, data.version, objectId)
		})

		/**
		 * Package relationships
		 */
		this.on('package.removed', (packageId, data) => {
			// Components
			this.removePackageComponents(packageId, data.version)
			// Pages
			this.removePages(packageId, data.version)
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
		const args = [].slice.call(arguments, 1)
		const inst = this.getPaginatorResultsCall(id)
		if (!inst) {
			return Promise.reject(`invalid paginator results call ${ id }`)
		}
		return inst.apply(inst, ['nextPage'].concat(args))
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
	
	version (version) {
		return slugify(version)
	}
 
	/**
	 * Saves package data to Firebase.
	 * @param {string} packageId 	The package ID.
	 * @param {?} data 				The data (null to remove the package).
	 * @return {Promise} 			A Promise.
	 */
	setPackage (packageId, data, version = 'latest') {
		let path = this.getRef('packages')
		if (packageId) {
			path = path.child(packageId)
		}
		else {
			path = path.push()
			packageId = path.key()
		}
		path = path.child(this.version(version))
		if (!data) {
			return this.getPackage(packageId, version).then((pkg) => {
				return this.set(path, data).then(() => {
					this.emit('package.removed', packageId, pkg)
				})
			})
		}
		return this.set(path, data, packageId).then(() => {
			this.emit('package.added', packageId, data)
			return packageId
		})
	}

	/**
	 * Removes a package from Firebase.
	 * @param  {string} packageId 	The package ID.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePackage (packageId, version = 'latest') {
		return this.setPackage(packageId, null, version)
	}

	/**
	 * Get packages from Firebase.
	 * @param {string} version The version.
	 * @return {Promise} A Promise which resolves a packages Array.
	 */
	getPackages (version = 'latest') {
		version = this.version(version)
		return this.get('packages').then((snapshot) => {
			let packages = this.snapshotArray(snapshot)
			let queue = []
			packages = packages.filter((pkg) => pkg[version] !== undefined)
			packages = packages.map((pkg) => pkg[version])
			packages.map((pkg) => {
				queue.push(this.getPackageComponentsCount(pkg.objectId, version).then((count) => {
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
	getPackage (packageId, version = 'latest') {
		const path = this.getRef(`packages/${ packageId }/${ this.version(version) }`)
		return this.get(path).then((snapshot) => {
			if (version !== 'latest' && !snapshot.exists()) {
				return this.getPackage(packageId)
			}
			return snapshot.val()
		})
	}

	/**
	 * Get all package versions from Firebase.
	 * @param  {String} packageId 	The package ID.
	 * @return {Promise}           	A Promise which resolves a packages Array
	 */
	getPackageVersions (packageId) {
		return this.get(this.getRef(`packages/${ packageId }`)).then((snapshot) => this.snapshotArray(snapshot))
	}

	/**
	 * Package components two-way relationship
	 * @param {string} packageId   		The package ID.
	 * @param {string} componentId 		The component ID.
	 * @param {boolean|null} data 		The data (boolean or null to remove)
	 */
	setPackageComponent (packageId, version = 'latest', componentId, data) {
		return this.set(this.getPackageComponentsRef(packageId).child(`${ componentId }/${ this.version(version) }`), data)
	}

	/**
	 * Remove Package <> Component relationship
	 * @param {string} packageId   		The package ID.
	 * @param {string} componentId 		The component ID.
	 */
	removePackageComponent (packageId, version = 'latest', componentId) {
		return this.setPackageComponent(packageId, version, componentId, null)
	}

	onPackageAdded (cb, error, version = 'latest') {
		this.getOn('packages', 'child_added', (snapshot) => {
			let pkg = snapshot.val()
			if (pkg[version]) {
				cb(pkg[version])
			}
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
	 * @param  {string} componentId 	The component ID.
	 * @param  {string} version 		The package version.
	 * @param  {boolean} sync 			Use the sync index.
	 * @return {string} 				A Firebase path.
	 */
	getComponentPath (componentId, version = 'latest', sync) {
		return `${ this.getComponentsPath(sync) }/${ componentId }/${ this.version(version) }`
	}

	/**
	 * Get a Firebase query reference for fetching a component.
	 * @param  {string} componentId 	The component ID.
	 * @param  {boolean} sync 			Use the sync index.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getComponentRef (componentId, sync) {
		return this.getComponentsRef(sync).child(componentId)
	}

	/**
	 * Saves component data to Firebase.
	 * @param  {string} componentId 	The component ID.
	 * @param  {?} data 				The data (null to remove the component).
	 * @param  {string} version 		The package version.
	 * @param  {boolean} sync 			Use the sync index.
	 * @return {Promise} 				A Promise.
	 */
	setComponent (componentId, data, version = 'latest', sync) {
		version = this.version(version)
		if (!componentId) {
			const ref = this.getComponentsRef(sync).push()
			componentId = ref.key()
		}
		const path = this.getComponentPath(componentId, version, sync)
		if (!data) {
			return this.getComponent(componentId, version).then(({ merge }) => {
				return this.set(path, data).then(() => {
					this.emit('component.removed', componentId, merge)
				})
			})
		}
		return this.set(path, data, componentId).then(() => {
			this.emit('component.added', componentId, data)
			return componentId
		})
	}

	/**
	 * Removes a component from Firebase.
	 * @param  {string} componentId 	The component ID.
	 * @param  {string} version 		The package version.
	 * @return {Promise} 				A Promise.
	 */
	removeComponent (componentId, version = 'latest') {
		return Promise.all([
			this.setComponent(componentId, null, version),
			this.setComponent(componentId, null, version, true)
		])
	}

	/**
	 * Get the component IDs for a package from Firebase.
	 * @param  {string} packageId 	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a Number.
	 */
	getPackageComponentsIds (packageId, version = 'latest') {
		version = this.version(version)
		return this.get(this.getPackageComponentsRef(packageId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve([])
			}
			let componentIds = []
			let components = snapshot.val()
			for (let componentId in components) {
				if (components[componentId].hasOwnProperty(version)) {
					componentIds.push(componentId)
				}
			}
			return componentIds
		})
	}

	/**
	 * Get the number of components for a package from Firebase.
	 * @param  {string} packageId 	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a Number.
	 */
	getPackageComponentsCount (packageId, version = 'latest') {
		version = this.version(version)
		return this.getPackageComponentsIds(packageId, version).then((ids) => {
			return ids.length
		})
	}

	/**
	 * Get the components for a package from Firebase.
	 * @param  {string} packageId	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a components Array.
	 */
	getPackageComponents (packageId, version = 'latest') {
		version = this.version(version)
		return this.getPackageComponentsIds(packageId, version).then((componentIds) => {
			const components = componentIds.map((id) => this.getComponent(id, version))
			return Promise.all(components)
		})
	}

	/**
	 * Remove the components belonging to a package from Firebase.
	 * @param  {string} packageId	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePackageComponents (packageId, version = 'latest') {
		version = this.version(version)
		return this.getPackageComponentsIds(packageId, version).then((componentIds) => {
			const removeComponents = componentIds.map((componentId) => this.removeComponent(componentId, version))
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
	 * @param  {string} version 		The package version.
	 * @return {Promise} 				A Promise which resolves an Array of indexes.
	 */
	getComponent (componentId, version = 'latest') {
		version = this.version(version)
		this.emit('serviceLoading')
		return Promise.all([
			this.getComponentValue(componentId, version),
			this.getComponentValue(componentId, version, true)
		])
		.then((values) => {
			return Promise.all(
				values.filter((component) => component.data).map((component) => {
					return this.syncComponentIndex(component.data, version, !component.sync)
				})
			)
		})
		.then((indexes) => {
			let componentData = null
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
	 * @param  {string} version 		The package version.
	 * @param  {boolean} sync 			Use the 'sync' index.
	 * @return {Promise}      			A Promise which resolves an Object containing the component data and the 'sync' param value
	 */
	getComponentValue (componentId, version = 'latest', sync) {
		version = this.version(version)
		return this.get(this.getComponentPath(componentId, version, sync)).then((snapshot) => {
			if (version !== 'latest' && !snapshot.exists()) {
				return this.getComponentValue(componentId, 'latest', sync)
			}
			return {
				data: snapshot.val(),
				sync: sync
			}
		})
	}

	/**
	 * Get the 'sync' or 'components' index for a component.
	 * @param  {Object} component 	The component.
	 * @param  {string} version 	The package version.
	 * @param  {boolean} sync 		Enable to get the 'sync' index when the component Object comes from the 'components' index
	 * @return {Promise} 			A Promise which resolves the index Object.
	 */
	syncComponentIndex (component, version = 'latest', sync) {
		if (!component) {
			return Promise.resolve()
		}
		return this.get(this.getComponentPath(component.objectId, version, sync)).then((snapshot) => {
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
	
	/**
	 * Compute a Firebase reference for a component demos
	 * @param  {String} componentId 	The component ID.
	 * @param  {String} version     	The package version.
	 * @return {Firebase}            	A Firebase reference.
	 */
	componentDemosRef (componentId, version = 'latest') {
		return this.getRef(`component_demos/${ componentId }/${ this.version(version) }`)
	}

	/**
	 * Get component demos from Firebase.
	 * @param  {String} componentId 	The component ID.
	 * @param  {String} version     	The package version.
	 * @return {Promise}             	A Promise resolving the demos Array
	 */
	getComponentDemos (componentId, version = 'latest') {
		return this.get(this.componentDemosRef(componentId, version)).then((snapshot) => this.snapshotArray(snapshot))
	}

	///////////
	// PAGES //
	///////////
	
	/**
	 * Saves a page to Firebase.
	 * @param  {?} data 			The data (null to remove the package).
	 * @param  {string} pageId 		The page ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	setPage (pageId, data, version = 'latest') {
		let ref = this.getRef('pages')
		if (pageId) {
			ref = ref.child(pageId)
		}
		else {
			ref = ref.push()
			pageId = ref.key()
		}
		version = this.version(version)
		ref = ref.child(version)

		if (!data) {
			return this.getPage(pageId, version).then((page) => {
				return this.set(ref, data).then(() => {
					this.emit('page.removed', pageId, page)
				})
			})
		}
		return this.set(ref, data, pageId).then(() => {
			this.emit('page.added', pageId, data)
			return pageId
		})
	}

	/**
	 * Removes a page from Firebase.
	 * @param  {string} pageId 		The page ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePage (pageId, version = 'latest') {
		return this.setPage(pageId, null, version)
	}

	/**
	 * Get a page from Firebase.
	 * @param  {string} pageId 		The page ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a page Object.
	 */
	getPage (pageId, version = 'latest') {
		version = this.version(version)
		const path = this.getRef(`pages/${ pageId }/${ version }`)
		return this.get(path).then((snapshot) => {
			if (version !== 'latest' && !snapshot.exists()) {
				return this.getPage(pageId)
			}
			return snapshot.val()
		})
	}

	/**
	 * Get a Firebase query reference for fetching pages for a specific package.
	 * @param  {string} packageId		The package ID.
	 * @param  {string} version 		The package version.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackagePagesRef (packageId, version = 'latest') {
		return this.getRef(`package_pages/${ packageId }/${ this.version(version) }`)
	}

	/**
	 * Create a Pages paginator
	 * @param  {string} packageId 	The package ID.
	 * @param  {string} version 	The package version.
	 */
	paginatePages (packageId, version = 'latest') {
		this.paginate('pages', this.getPackagePagesRef(packageId, version))
	}

	/**
	 * Get 'Pages' paginator results.
	 * @param {string} type 	Page type ('prevPage' or 'nextPage')
	 * @return {Array} 			The results.
	 */
	getPaginatorPages (type, version = 'latest') {
		return this.getPaginatorResults('pages', type).then((pageIds) => {
			pageIds = Object.keys(pageIds)
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId, version)))
		})
	}

	/**
	 * Get pages from Firebase for a specific package.
	 * @param {string} packageId 	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a pages Array.
	 */
	getPages (packageId, version = 'latest') {
		return this.get(this.getPackagePagesRef(packageId, version)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId, version)))
		})
	}

	/**
	 * Remove pages from Firebase for a specific package.
	 * @param {string} packageId 	The package ID.
	 * @param  {string} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePages (packageId, version = 'latest') {
		return this.get(this.getPackagePagesRef(packageId, version)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.removePage(pageId, version)))
		})
	}

	/**
	 * Package pages relationship
	 * @param {string} packageId   	The package ID.
	 * @param {string} pageId 		The page ID.
	 * @param {boolean|null} data 	The data (boolean or null to remove)
	 */
	setPackagePage (packageId, version = 'latest', pageId, data) {
		return this.set(this.getPackagePagesRef(packageId, version).child(pageId), data)
	}

	/**
	 * Remove Package <> Page relationship
	 * @param {string} packageId   	The package ID.
	 * @param  {string} version 	The package version.
	 * @param {string} pageId 		The page ID.
	 */
	removePackagePage (packageId, version = 'latest', pageId) {
		return this.setPackagePage(packageId, version, pageId, null)
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