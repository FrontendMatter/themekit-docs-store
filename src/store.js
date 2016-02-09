import FirebaseStore from 'firebase-store'
import Paginator from 'firebase-store/lib/firebase-paginator'
import merge from 'mout/object/merge'
import forOwn from 'mout/object/forOwn'
import camelCase from 'mout/string/camelCase'
import slugify from 'mout/string/slugify'

/**
 * ThemeKit Docs App Firebase Store.
 * @extends {FirebaseStore}
 */
class Store extends FirebaseStore {

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
	 * @param {String} id 		The paginator ID.
	 * @param {String} type 	Page type ('prevPage' or 'nextPage')
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
	 * @param {String} id 	The paginator ID.
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
	 * @param {String} id 	The paginator ID.
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
	 * @param {String} id 	The paginator ID.
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
	 * Slugify version
	 * @param  {String} version The version i.e. 0.1.0
	 * @return {String}         The slugified version
	 */
	version (version) {
		if (version === undefined) {
			throw new Error('The version is required')
		}
		return slugify(version)
	}

	/**
	 * Get a Firebase reference for package IDs, by package name
	 * @param  {String} packageName 	The package name
	 * @return {Firebase}             	A Firebase reference
	 */	
	getRefPackageId (packageName) {
		return this.getRef(`package_id/${ packageName }`)
	}

	/**
	 * Get a Firebase reference for package ID data
	 * @param  {String} packageId 	The package ID
	 * @return {Firebase}           A Firebase reference
	 */
	getRefPackageIdData (packageId) {
		return this.getRef(`package_id_data/${ packageId }`)
	}

	/**
	 * Get a Firebase reference for package version IDs, by package ID and version
	 * @param  {String} packageId 	The package ID
	 * @param  {String} version   	The package version (optional)
	 * @return {Firebase}           A Firebase reference
	 */
	getRefPackageVersionId (packageId, version) {
		const ref = this.getRef(`package_version_id/${ packageId }`)
		if (version) {
			return ref.child(this.version(version))
		}
		return ref
	}

	/**
	 * Get a Firebase reference for package version ID data
	 * @param  {String} packageVersionId 	The package version ID data
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefPackageVersionIdData (packageVersionId) {
		return this.getRef(`package_version_id_data/${ packageVersionId }`)
	}

	/**
	 * Get a Firebase reference to package version description data
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefPackageVersionDescriptionData (packageVersionId) {
		return this.getRef(`package_version_description_data/${ packageVersionId }`)
	}

	/**
	 * Get a Firebase reference for package version IDs with description data, by package ID
	 * @param  {String} packageId        	The package ID
	 * @param  {String} packageVersionId 	The package version ID (optional)
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefPackageDescription (packageId, packageVersionId) {
		const ref = this.getRef(`package_description/${ packageId }`)
		if (packageVersionId) {
			return ref.child(packageVersionId)
		}
		return ref
	}

	/**
	 * Get a Firebase reference to package version readme data
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefPackageVersionReadmeData (packageVersionId) {
		return this.getRef(`package_version_readme_data/${ packageVersionId }`)
	}

	/**
	 * Get a Firebase reference for package version IDs with readme data, by package ID
	 * @param  {String} packageId        	The package ID
	 * @param  {String} packageVersionId 	The package version ID (optional)
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefPackageReadme (packageId, packageVersionId) {
		const ref = this.getRef(`package_readme/${ packageId }`)
		if (packageVersionId) {
			return ref.child(packageVersionId)
		}
		return ref
	}

	/**
	 * Fetch a package ID by package name
	 * @param  {String} packageName 	The package name
	 * @return {Promise}             	A Promise which resolves the package ID
	 */
	getPackageId (packageName) {
		return this.get(this.getRefPackageId(packageName)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch a package ID data
	 * @param  {String} packageId 	The package ID
	 * @return {Promise}           	A Promise
	 */
	getPackageIdData (packageId) {
		return this.get(this.getRefPackageIdData(packageId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a package ID for package name
	 * @param  {String} packageName 	The package name
	 * @return {Promise} 				A Promise which resolves the package ID
	 */
	setPackageId (packageName) {
		const ref = this.getRefPackageId(packageName)
		const packageId = ref.push().key()
		const data = {
			packageName
		}
		return Promise.all([
			// Package ID
			this.set(ref, packageId),
			// Package ID data
			this.set(this.getRefPackageIdData(packageId), data)
		])
		.then(() => packageId)
	}

	/**
	 * Remove a package ID
	 * @param  {String} packageId 	The package ID
	 * @return {Promise}           	A Promise
	 */
	removePackageId (packageId) {
		return this.getPackageIdData(packageId).then((data) => {
			return Promise.all([
				// Package ID
				this.remove(this.getRefPackageId(data.packageName)),
				// Package ID data
				this.remove(this.getRefPackageIdData(packageId))
			])
		})
	}

	/**
	 * Fetch a package version ID, by package ID and version
	 * @param  {String} packageId 	The package ID
	 * @param  {String} version   	The version
	 * @return {Promise}           	A Promise
	 */
	getPackageVersionId (packageId, version) {
		return this.get(this.getRefPackageVersionId(packageId, version)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch a package version ID data
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise}                  	A Promise
	 */
	getPackageVersionIdData (packageVersionId) {
		return this.get(this.getRefPackageVersionIdData(packageVersionId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a package version ID, by package ID and version
	 * @param {String} packageId The package ID
	 * @param {String} version   The version
	 */
	setPackageVersionId (packageId, version) {
		const ref = this.getRefPackageVersionId(packageId, version)
		const packageVersionId = ref.push().key()
		const data = {
			packageId,
			version
		}
		return Promise.all([
			// Package version ID
			this.set(ref, packageVersionId),
			// Package version ID data
			this.set(this.getRefPackageVersionIdData(packageVersionId), data)
		])
		.then(() => packageVersionId)
	}

	/**
	 * Remove a package version ID
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise}                  	A Promise
	 */
	removePackageVersionId (packageVersionId) {
		return this.getPackageVersionIdData(packageVersionId).then((data) => {
			return Promise.all([
				// Package version ID
				this.remove(this.getRefPackageVersionId(data.packageId, data.version)),
				// Package version ID data
				this.remove(this.getRefPackageVersionIdData(packageVersionId))
			])
			// Maybe remove package ID
			.then(() => {
				// Fetch package ID versions
				return this.get(this.getRefPackageVersionId(data.packageId)).then((snapshot) => {
					if (!snapshot.exists()) {
						// Remove package ID
						return this.removePackageId(data.packageId)
					}
				})
			})
		})
	}

	/**
	 * Fetch all package version IDs for a package ID
	 * @param  {String} packageId 		The package ID
	 * @return {Promise}           		A Promise
	 */
	getPackageVersionIds (packageId) {
		return this.get(this.getRefPackageVersionId(packageId)).then((snapshot) => this.snapshotArray(snapshot))
	}

	/**
	 * Fetch the latest package version ID for a package ID
	 * @param  {String} packageId 		The package ID
	 * @return {Promise}           		A Promise
	 */
	getLatestPackageVersionId (packageId) {
		return this.getPackageVersionIds(packageId).then((ids) => ids.pop())
	}

	/**
	 * Create or update a package version
	 * @param {String} 	packageName 	The package name
	 * @param {String} 	version     	The version
	 */
	setPackageVersion (packageName, version, description = null, readme = null) {
		// Package ID
		return this.getPackageId(packageName).then((packageId) => {
			if (!packageId) {
				return this.setPackageId(packageName)
			}
			return packageId
		})
		// Package version ID
		.then((packageId) => {
			return this.getPackageVersionId(packageId, version).then((packageVersionId) => {
				if (!packageVersionId) {
					return this.setPackageVersionId(packageId, version)
				}
				return packageVersionId
			})
		})
		// Package version description
		.then((packageVersionId) => {
			return this.setPackageVersionDescription(packageVersionId, description).then(() => packageVersionId)
		})
		// Package version readme
		.then((packageVersionId) => {
			return this.setPackageVersionReadme(packageVersionId, readme).then(() => packageVersionId)
		})
	}

	/**
	 * Remove a package version
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise} 					A Promise
	 */
	removePackageVersion (packageVersionId) {
		return Promise.all([
			// Package version description
			this.setPackageVersionDescription(packageVersionId, null),
			// Package version readme
			this.setPackageVersionReadme(packageVersionId, null),
			// Package version components
			this.removePackageVersionComponents(packageVersionId),
			// Package version ID
			this.removePackageVersionId(packageVersionId)
		])
	}

	/**
	 * Create, update or remove a package version description data
	 * @param {String} packageVersionId 	The package version ID
	 * @param {String} description      	The description data (null to remove)
	 */
	setPackageVersionDescription (packageVersionId, description) {
		return this.getPackageVersionIdData(packageVersionId).then((data) => {
			// Package version description data
			const descriptionRef = this.getRefPackageVersionDescriptionData(packageVersionId)
			// Package version ID with description data, by package ID
			const packageDescriptionRef = this.getRefPackageDescription(data.packageId, packageVersionId)

			// create or update
			if (description) {
				return Promise.all([
					// Package version description data
					this.set(descriptionRef, description),
					// Package version ID with description data, by package ID
					this.set(packageDescriptionRef, true)
				])
			}
			// remove
			return Promise.all([
				// Package version description data
				this.remove(descriptionRef),
				// Package version ID with description data, by package ID
				this.remove(packageDescriptionRef)
			])
		})
	}

	/**
	 * Fetch a package version description
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise}                  	A Promise
	 */
	getPackageVersionDescription (packageVersionId) {
		// Package version description data
		return this.get(this.getRefPackageVersionDescriptionData(packageVersionId)).then((snapshot) => {
			if (snapshot.exists()) {
				let data = {
					data: snapshot.val()
				}
				// Package version ID data
				return this.getPackageVersionIdData(packageVersionId).then((packageVersionIdData) => merge(data, { packageVersionIdData }))
				// Package ID data
				.then((data) => {
					return this.getPackageIdData(data.packageVersionIdData.packageId).then((packageIdData) => merge(data, { packageIdData }))
				})
			}
			return null
		})
	}

	/**
	 * Fetch the latest package description
	 * @param  {String} packageId 	The package ID
	 * @return {Promise}           	A Promise
	 */
	getLatestPackageDescription (packageId) {
		return this.get(this.getRefPackageDescription(packageId)).then((snapshot) => {
			if (snapshot.exists()) {
				const latestPackageVersionIdWithDescription = Object.keys(snapshot.val()).pop()
				return this.getPackageVersionDescription(latestPackageVersionIdWithDescription)
			}
		})
	}

	/**
	 * Create, update or remove a package version readme data
	 * @param {String} packageVersionId 	The package version ID
	 * @param {String} readme      			The readme data (null to remove)
	 */
	setPackageVersionReadme (packageVersionId, readme) {
		return this.getPackageVersionIdData(packageVersionId).then((data) => {
			// Package version readme data
			const readmeRef = this.getRefPackageVersionReadmeData(packageVersionId)
			// Package version ID with readme data, by package ID
			const packageReadmeRef = this.getRefPackageReadme(data.packageId, packageVersionId)

			// create or update
			if (readme) {
				return Promise.all([
					// Package version readme data
					this.set(readmeRef, readme),
					// Package version ID with readme data, by package ID
					this.set(packageReadmeRef, true)
				])
			}
			// remove
			return Promise.all([
				// Package version readme data
				this.remove(readmeRef),
				// Package version ID with readme data, by package ID
				this.remove(packageReadmeRef)
			])
		})
	}

	/**
	 * Fetch a package version readme
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise}                  	A Promise
	 */
	getPackageVersionReadme (packageVersionId) {
		// Package version readme data
		return this.get(this.getRefPackageVersionReadmeData(packageVersionId)).then((snapshot) => {
			if (snapshot.exists()) {
				let data = {
					data: snapshot.val()
				}
				// Package version ID data
				return this.getPackageVersionIdData(packageVersionId).then((packageVersionIdData) => merge(data, { packageVersionIdData }))
				// Package ID data
				.then((data) => {
					return this.getPackageIdData(data.packageVersionIdData.packageId).then((packageIdData) => merge(data, { packageIdData }))
				})
			}
			return null
		})
	}

	/**
	 * Fetch the latest package readme
	 * @param  {String} packageId 	The package ID
	 * @return {Promise}           	A Promise
	 */
	getLatestPackageReadme (packageId) {
		return this.get(this.getRefPackageReadme(packageId)).then((snapshot) => {
			if (snapshot.exists()) {
				const latestPackageVersionIdWithReadme = Object.keys(snapshot.val()).pop()
				return this.getPackageVersionReadme(latestPackageVersionIdWithReadme)
			}
		})
	}

	/**
	 * Fetch all packages with latest version
	 * @return {Promise} A Promise which resolves a packages Array.
	 */
	getPackages () {
		return this.get('package_id').then((snapshot) => {
			const packageIDs = this.snapshotArray(snapshot)
			// fetch latest versions IDs
			return Promise.all(
				packageIDs.map((packageId) => this.getLatestPackageVersionId(packageId))
			)
			// fetch packages
			.then((latestPackageIDs) => {
				return Promise.all(
					latestPackageIDs.map((packageVersionId) => this.getPackageVersion(packageVersionId))
				)
			})
		})
	}

	/**
	 * Fetch a package version
	 * @param  {String} packageVersionId 	The package version ID
	 * @return {Promise} 					A Promise which resolves a package Object
	 */
	getPackageVersion (packageVersionId) {
		// Package version ID data
		return this.getPackageVersionIdData(packageVersionId).then((packageVersionIdData) => {
			return { packageVersionIdData }
		})
		// Package ID data
		.then((data) => {
			return this.getPackageIdData(data.packageVersionIdData.packageId).then((packageIdData) => merge(data, { packageIdData }))
		})
		// Package version component count
		.then((data) => {
			return this.getPackageVersionComponentCount(packageVersionId)
				.then((count) => data.components = count)
				.then(() => data)
		})
		// Package description
		.then((data) => {
			// Package version description
			return this.getPackageVersionDescription(packageVersionId).then((description) => {
				if (!description) {
					return this.getLatestPackageDescription(data.packageIdData.objectID)
				}
				return description
			})
			.then((description) => merge(data, { description }))
		})
		// Package readme
		.then((data) => {
			// Package version readme
			return this.getPackageVersionReadme(packageVersionId).then((readme) => {
				if (!readme) {
					return this.getLatestPackageReadme(data.packageIdData.objectID)
				}
				return readme
			})
			.then((readme) => merge(data, { readme }))
		})
	}

	/**
	 * Fetch a package version by package name and version
	 * @param  {String} packageName 	The package name
	 * @param  {String} version     	The version
	 * @return {Promise}             	A Promise
	 */
	getPackageVersionByName (packageName, version) {
		return this.getPackageId(packageName).then((packageId) => {
			return this.getPackageVersionId(packageId, version)
		})
		.then((packageVersionId) => {
			return this.getPackageVersion(packageVersionId)
		})
	}

	/**
	 * Fetch all versions for a package ID
	 * @param  {String} packageId 	The package ID
	 * @return {Promise}           	A Promise which resolves a packages Array
	 */
	getPackageVersions (packageId) {
		return this.getPackageVersionIds(packageId).then((ids) => Promise.all(ids.map((id) => this.getPackageVersionIdData(id))))
	}

	/**
	 * Listen for child_added events on package IDs
	 * @param  {Function} cb    The complete callback
	 * @param  {Function} error The error callback
	 */
	onPackageAdded (cb, error) {
		this.listen('package_id', 'child_added', (snapshot) => {
			const packageId = snapshot.val()

			// Latest package version ID
			this.getLatestPackageVersionId(packageId)
			// Package version
			.then((latestPackageVersionId) => this.getPackageVersion(latestPackageVersionId))
			// Complete callback
			.then((data) => cb(data))
		}, error)
	}

	onPackageVersionRemoved (cb, error) {
		this.listen('package_version_id_data', 'child_removed', (snapshot) => cb(snapshot.key()), error)
	}

	////////////////
	// COMPONENTS //
	////////////////
	
	/**
	 * Get a Firebase reference for component IDs, by package ID and component name
	 * @param  {String} packageId     	The package ID
	 * @param  {String} componentName 	The component name
	 * @return {Firebase}               A Firebase reference
	 */
	getRefComponentId (packageId, componentName) {
		return this.getRef(`component_id/${ packageId }/${ componentName }`)
	}

	/**
	 * Get a Firebase reference for component ID data
	 * @param  {String} componentId 	The component ID
	 * @return {Firebase}             	A Firebase reference
	 */
	getRefComponentIdData (componentId) {
		return this.getRef(`component_id_data/${ componentId }`)
	}

	/**
	 * Get a Firebase reference for component version IDs, by package version ID and component ID
	 * @param  {String} packageVersionId 	The package version ID
	 * @param  {String} componentId      	The component ID
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefComponentVersionId (packageVersionId, componentId) {
		const ref = this.getRef(`component_version_id/${ packageVersionId }`)
		if (componentId) {
			return ref.child(componentId)
		}
		return ref
	}

	/**
	 * Get a Firebase reference for component version ID data
	 * @param  {String} componentVersionId 		The component version ID
	 * @return {Firebase}                    	A Firebase reference
	 */
	getRefComponentVersionIdData (componentVersionId) {
		return this.getRef(`component_version_id_data/${ componentVersionId }`)
	}

	/**
	 * Get a Firebase reference for component version data
	 * @param  {String} componentVersionId 		The component version ID
	 * @return {Firebase}                    	A Firebase reference
	 */
	getRefComponentVersionData (componentVersionId) {
		return this.getRef(`component_version_data/${ componentVersionId }`)
	}

	/**
	 * Get a Firebase reference to component version description data
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefComponentVersionDescriptionData (componentVersionId) {
		return this.getRef(`component_version_description_data/${ componentVersionId }`)
	}

	/**
	 * Get a Firebase reference for component version IDs with description data, by component ID
	 * @param  {String} componentId        	The component ID
	 * @param  {String} componentVersionId 	The component version ID (optional)
	 * @return {Firebase}                  	A Firebase reference
	 */
	getRefComponentDescription (componentId, componentVersionId) {
		const ref = this.getRef(`component_description/${ componentId }`)
		if (componentVersionId) {
			return ref.child(componentVersionId)
		}
		return ref
	}

	/**
	 * Get a Firebase reference for component version IDs by component ID
	 * @param  {String} componentId        		The component ID
	 * @param  {String} componentVersionId 		The component version ID (optional)
	 * @return {Firebase}                    	A Firebase reference
	 */
	getRefComponentVersion (componentId, componentVersionId) {
		const ref = this.getRef(`component_version/${ componentId }`)
		if (componentVersionId) {
			return ref.child(componentVersionId)
		}
		return ref
	}

	/**
	 * Fetch a component ID by package ID and component name
	 * @param  {String} packageId     	The package ID
	 * @param  {String} componentName 	The component name
	 * @return {Promise}               	A Promise
	 */
	getComponentId (packageId, componentName) {
		return this.get(this.getRefComponentId(packageId, componentName)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch a component ID data
	 * @param  {String} componentId 	The component ID
	 * @return {Promise}             	A Promise
	 */
	getComponentIdData (componentId) {
		return this.get(this.getRefComponentIdData(componentId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a component ID, by package ID and component name
	 * @param {String} packageId     	The package ID
	 * @param {String} componentName 	The component name
	 */
	setComponentId (packageId, componentName) {
		const ref = this.getRefComponentId(packageId, componentName)
		const componentId = ref.push().key()
		const data = {
			packageId,
			componentName
		}
		return Promise.all([
			// Component ID
			this.set(ref, componentId),
			// Component ID data
			this.set(this.getRefComponentIdData(componentId), data)
		])
		.then(() => componentId)
	}

	/**
	 * Remove a component ID
	 * @param  {String} componentId 	The component ID
	 * @return {Promise}             	A Promise
	 */
	removeComponentId (componentId) {
		return this.getComponentIdData(componentId).then((data) => {
			return Promise.all([
				// Component ID
				this.remove(this.getRefComponentId(data.packageId, data.componentName)),
				// Component ID data
				this.remove(this.getRefComponentIdData(componentId))
			])
		})
	}

	/**
	 * Fetch a component version ID
	 * @param  {String} packageVersionId 	The package version ID
	 * @param  {String} componentId      	The component ID
	 * @return {Promise}                  	A Promise
	 */
	getComponentVersionId (packageVersionId, componentId) {
		return this.get(this.getRefComponentVersionId(packageVersionId, componentId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Remove a component version ID data
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                    A Promise
	 */
	getComponentVersionIdData (componentVersionId) {
		return this.get(this.getRefComponentVersionIdData(componentVersionId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a component version ID, by package version ID and component ID
	 * @param {String} packageVersionId 	The package version ID
	 * @param {String} componentId      	The component ID
	 */
	setComponentVersionId (packageVersionId, componentId) {
		const ref = this.getRefComponentVersionId(packageVersionId, componentId)
		const componentVersionId = ref.push().key()
		const data = {
			packageVersionId,
			componentId
		}
		return Promise.all([
			// Component version ID
			this.set(ref, componentVersionId),
			// Component version ID data
			this.set(this.getRefComponentVersionIdData(componentVersionId), data),
			// Component version IDs by component ID (Component <> Component version)
			this.set(this.getRefComponentVersion(componentId, componentVersionId), true)
		])
		.then(() => componentVersionId)
	}

	/**
	 * Remove a component version ID
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                    A Promise
	 */
	removeComponentVersionId (componentVersionId) {
		return this.getComponentVersionIdData(componentVersionId).then((data) => {
			return Promise.all([
				// Component version ID
				this.remove(this.getRefComponentVersionId(data.packageVersionId, data.componentId)),
				// Component version ID data
				this.remove(this.getRefComponentVersionIdData(componentVersionId)),
				// Component version IDs by component ID (Component <> Component version)
				this.remove(this.getRefComponentVersion(data.componentId, componentVersionId))
			])
			// Maybe remove component ID
			.then(() => {
				// Component <> Component version
				return this.get(this.getRefComponentVersion(data.componentId)).then((snapshot) => {
					if (!snapshot.exists()) {
						// Remove component ID
						return this.removeComponentId(data.componentId)
					}
				})
			})
		})
	}

	/**
	 * Create or update a component version
	 * @param {String} packageVersionId The package version ID
	 * @param {String} componentName    The component name
	 * @param {Object} data             The component data
	 */
	setComponentVersion (packageVersionId, componentName, data, description = null) {
		// Package version ID data
		return this.getPackageVersionIdData(packageVersionId).then((packageVersionIdData) => {
			let { packageId } = packageVersionIdData
			// Component ID
			return this.getComponentId(packageId, componentName).then((componentId) => {
				if (!componentId) {
					return this.setComponentId(packageId, componentName)
				}
				return componentId
			})
		})
		// Component version ID
		.then((componentId) => {
			return this.getComponentVersionId(packageVersionId, componentId).then((componentVersionId) => {
				if (!componentVersionId) {
					return this.setComponentVersionId(packageVersionId, componentId)
				}
				return componentVersionId
			})
		})
		// Component version data
		.then((componentVersionId) => {
			return this.set(this.getRefComponentVersionData(componentVersionId), data).then(() => componentVersionId)
		})
		// Package version description
		.then((componentVersionId) => {
			return this.setComponentVersionDescription(componentVersionId, description).then(() => componentVersionId)
		})
	}

	/**
	 * Fetch a component version by component version ID.
	 * @param  {Firebase} componentVersionId 	The component version ID.
	 * @return {Promise} 						A Promise which resolves an Array of indexes.
	 */
	getComponentVersionById (componentVersionId) {
		return Promise.all([
			// Component version data
			this.get(this.getRefComponentVersionData(componentVersionId)).then((snapshot) => snapshot.val()),
			// Component version ID data
			this.getComponentVersionIdData(componentVersionId),
			// Component version props
			this.getComponentVersionProps(componentVersionId)
		])
		.then(([data, componentVersionIdData, props]) => merge(data, { componentVersionIdData, props }))
		.then((data) => {
			return Promise.all([
				// Component ID data
				this.getComponentIdData(data.componentVersionIdData.componentId),
				// Package version ID data
				this.getPackageVersionIdData(data.componentVersionIdData.packageVersionId)
			])
			.then(([componentIdData, packageVersionIdData]) => merge(data, { componentIdData, packageVersionIdData }))
		})
		.then((data) => {
			return Promise.all([
				// Package ID data
				this.getPackageIdData(data.packageVersionIdData.packageId),
				// Component version description
				this.getComponentVersionDescription(componentVersionId).then((description) => {
					// Component description
					if (!description) {
						return this.getLatestComponentDescription(data.componentIdData.objectID)
					}
					return description
				}),
				// Component demos
				this.getComponentDemos(data.componentIdData.objectID)
			])
			.then(([packageIdData, description, demos]) => merge(data, { packageIdData, description, demos }))
		})
	}

	/**
	 * Fetch a component version by component name, package name and version
	 * @param  {String} componentName 	The component name
	 * @param  {String} packageName   	The package name
	 * @param  {String} version       	The version
	 * @return {Promise}               	A Promise
	 */
	getComponentVersionByName (componentName, packageName, version) {
		let packageId

		// Package ID
		return this.getPackageId(packageName).then((pkgId) => {
			packageId = pkgId

			// Package Version ID
			return this.getPackageVersionId(packageId, version)
		})
		.then((packageVersionId) => {
			// Component ID
			return this.getComponentId(packageId, componentName).then((componentId) => {
				// Component version ID
				return this.getComponentVersionId(packageVersionId, componentId)
			})
			// Component version by component version ID
			.then((componentVersionId) => this.getComponentVersionById(componentVersionId))
		})
	}

	/**
	 * Removes a component from Firebase.
	 * @param  {String} componentVersionId 	The component version ID.
	 * @return {Promise} 					A Promise.
	 */
	removeComponentVersion (componentVersionId) {
		return Promise.all([
			// Component version description
			this.setComponentVersionDescription(componentVersionId, null),
			// Component version props
			this.removeComponentVersionProps(componentVersionId),
			// Component version ID
			this.removeComponentVersionId(componentVersionId),
			// Component version data
			this.remove(this.getRefComponentVersionData(componentVersionId))
		])
	}

	/**
	 * Create, update or remove a component version description data
	 * @param {String} componentVersionId 	The component version ID
	 * @param {String} description      	The description data (null to remove)
	 */
	setComponentVersionDescription (componentVersionId, description) {
		return this.getComponentVersionIdData(componentVersionId).then((data) => {
			// Component version description data
			const descriptionRef = this.getRefComponentVersionDescriptionData(componentVersionId)
			// Component version ID with description data, by component ID
			const componentDescriptionRef = this.getRefComponentDescription(data.componentId, componentVersionId)

			// create or update
			if (description) {
				return Promise.all([
					// Component version description data
					this.set(descriptionRef, description),
					// Component version ID with description data, by component ID
					this.set(componentDescriptionRef, true)
				])
			}
			// remove
			return Promise.all([
				// Component version description data
				this.remove(descriptionRef),
				// Component version ID with description data, by component ID
				this.remove(componentDescriptionRef)
			])
		})
	}

	/**
	 * Fetch a component version description
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                  	A Promise
	 */
	getComponentVersionDescription (componentVersionId) {
		// Component version description data
		return this.get(this.getRefComponentVersionDescriptionData(componentVersionId)).then((snapshot) => {
			if (snapshot.exists()) {
				let data = {
					data: snapshot.val()
				}
				// Component version ID data
				return this.getComponentVersionIdData(componentVersionId).then((componentVersionIdData) => merge(data, { componentVersionIdData }))
				// Component ID data
				.then((data) => {
					return this.getComponentIdData(data.componentVersionIdData.componentId).then((componentIdData) => merge(data, { componentIdData }))
				})
				// Package version ID data
				.then((data) => {
					return this.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then((packageVersionIdData) => merge(data, { packageVersionIdData }))
				})
				// Package ID data
				.then((data) => {
					return this.getPackageIdData(data.packageVersionIdData.packageId).then((packageIdData) => merge(data, { packageIdData }))
				})
			}
			return null
		})
	}

	/**
	 * Fetch the latest component description
	 * @param  {String} componentId 	The component ID
	 * @return {Promise}           		A Promise
	 */
	getLatestComponentDescription (componentId) {
		return this.get(this.getRefComponentDescription(componentId)).then((snapshot) => {
			if (snapshot.exists()) {
				const latestComponentVersionIdWithDescription = Object.keys(snapshot.val()).pop()
				return this.getComponentVersionDescription(latestComponentVersionIdWithDescription)
			}
		})
	}

	/**
	 * Get the component versions IDs for a package version from Firebase.
	 * @param  {String} packageVersionId 	The package version ID.
	 * @return {Promise} 					A Promise which resolves an Array.
	 */
	getPackageVersionComponentIds (packageVersionId) {
		return this.get(this.getRefComponentVersionId(packageVersionId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve([])
			}
			return this.snapshotArray(snapshot)
		})
	}

	/**
	 * Get the number of components for a package version.
	 * @param  {String} packageVersionId 	The package version ID.
	 * @return {Promise} 					A Promise which resolves a Number.
	 */
	getPackageVersionComponentCount (packageVersionId) {
		return this.getPackageVersionComponentIds(packageVersionId).then((ids) => ids.length)
	}

	/**
	 * Get the components for a package version.
	 * @param  {String} packageVersionId	The package version ID.
	 * @return {Promise} 					A Promise which resolves the components Array.
	 */
	getPackageVersionComponents (packageVersionId) {
		return this.getPackageVersionComponentIds(packageVersionId).then((ids) => Promise.all(ids.map((id) => this.getComponentVersionById(id))))
	}

	/**
	 * Remove the components belonging to a package version.
	 * @param  {String} packageVersionId	The package version ID.
	 * @return {Promise} 					A Promise.
	 */
	removePackageVersionComponents (packageVersionId) {
		return this.getPackageVersionComponentIds(packageVersionId).then((ids) => Promise.all(ids.map((id) => this.removeComponentVersion(id))))
	}

	/**
	 * Listen for child_added events on package version components
	 * @param  {String}   packageVersionId The package version ID
	 * @param  {Function} cb               The complete callback
	 * @param  {Function} error            The error callback
	 */
	onPackageVersionComponentAdded (packageVersionId, cb, error) {
		this.listen(this.getRefComponentVersionId(packageVersionId), 'child_added', (snapshot) => {
			this.getComponentVersionById(snapshot.val()).then((data) => cb(data))
		})
	}

	/**
	 * Remove child_added listener on package version components
	 * @param  {String} packageVersionId The package version ID
	 */
	offPackageVersionComponentAdded (packageVersionId) {
		this.getRefComponentVersionId(packageVersionId).off('child_added')
	}

	/**
	 * Listen for child_removed events on component version IDs
	 * @param  {Function} cb    The complete callback
	 * @param  {Function} error The error callback
	 */
	onComponentVersionRemoved (cb, error) {
		this.listen('component_version_id_data', 'child_removed', (snapshot) => cb(snapshot.key()), error)
	}

	/////////////////////
	// COMPONENT PROPS //
	/////////////////////

	/**
	 * Get a Firebase reference for component prop IDs, by component ID and prop name
	 * @param  {String} componentId 	The component ID
	 * @param  {String} propName    	The prop name
	 * @return {Firebase}             	A Firebase reference
	 */
	getRefComponentPropId (componentId, propName) {
		return this.getRef(`component_prop_id/${ componentId }/${ propName }`)
	}

	/**
	 * Get a Firebase reference for component prop ID data
	 * @param  {String} propId 		The component prop ID
	 * @return {Firebase}        	A Firebase reference
	 */
	getRefComponentPropIdData (propId) {
		return this.getRef(`component_prop_id_data/${ propId }`)
	}

	/**
	 * Get a Firebase reference for component version prop IDs, by component version ID and prop ID
	 * @param  {String} componentVersionId 		The component version ID
	 * @param  {String} propId             		The prop ID
	 * @return {Firebase}                    	A Firebase reference
	 */
	getRefComponentVersionPropId (componentVersionId, propId) {
		const ref = this.getRef(`component_version_prop_id/${ componentVersionId }`)
		if (propId) {
			return ref.child(propId)
		}
		return ref
	}

	/**
	 * Get a Firebase reference for component version prop IDs, by prop ID
	 * Component prop <> Component version prop relationship
	 * 
	 * @param  {String} propId                 		The component prop ID
	 * @param  {String} componentVersionPropId 		The component version prop ID
	 * @return {Firebase}                        	A Firebase reference
	 */
	getRefComponentProp (propId, componentVersionPropId) {
		const ref = this.getRef(`component_prop/${ propId }`)
		if (componentVersionPropId) {
			return ref.child(componentVersionPropId)
		}
		return ref
	}

	/**
	 * Get a Firebase reference for component version prop ID data
	 * @param  {String} componentVersionPropId 		The component version prop ID
	 * @return {Firebase}                        	A Firebase reference
	 */
	getRefComponentVersionPropIdData (componentVersionPropId) {
		return this.getRef(`component_version_prop_id_data/${ componentVersionPropId }`)
	}

	/**
	 * Get a Firebase reference for component version prop data
	 * @param  {String} componentVersionPropId 		The component version prop ID
	 * @return {Firebase}                        	A Firebase reference
	 */
	getRefComponentVersionPropData (componentVersionPropId) {
		return this.getRef(`component_version_prop_data/${ componentVersionPropId }`)
	}

	/**
	 * Get a Firebase reference for component version prop description data
	 * @param  {String} componentVersionPropId 		The component version prop ID
	 * @return {Firebase}                        	A Firebase reference
	 */
	getRefComponentVersionPropDescription (componentVersionPropId) {
		return this.getRef(`component_version_prop_description_data/${ componentVersionPropId }`)
	}

	/**
	 * Get a Firebase reference for component version prop IDs with description data, by prop ID
	 * @param  {String} propId 		The prop ID
	 * @return {Firebase}        	A Firebase reference
	 */
	getRefComponentPropDescription (propId) {
		return this.getRef(`component_prop_description/${ propId }`)
	}

	/**
	 * Fetch the component prop ID by component ID and prop name
	 * @param  {String} componentId 	The component ID
	 * @param  {String} propName    	The prop name
	 * @return {Promise}             	A Promise which resolves the component prop ID value
	 */
	getComponentPropId (componentId, propName) {
		return this.get(this.getRefComponentPropId(componentId, propName)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch the component prop ID data
	 * @param  {String} propId 		The component prop ID
	 * @return {Promise}        	A Promise
	 */
	getComponentPropIdData (propId) {
		return this.get(this.getRefComponentPropIdData(propId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a component prop ID by component ID and prop name
	 * @param {String} componentId 		The component ID
	 * @param {String} propName    		The prop name
	 * @return {Promise} 				A Promise which resolves the component prop ID
	 */
	setComponentPropId (componentId, propName) {
		const ref = this.getRefComponentPropId(componentId, propName)
		const componentPropId = ref.push().key()
		const data = {
			componentId,
			propName
		}
		return Promise.all([
			// Component prop ID
			this.set(ref, componentPropId),
			// Component prop ID data
			this.set(this.getRefComponentPropIdData(componentPropId), data)
		])
		.then(() => componentPropId)
	}

	/**
	 * Remove component prop ID
	 * @param  {String} propId 	The component prop ID
	 * @return {Promise}        A Promise
	 */
	removeComponentPropId (propId) {
		// Component prop ID data
		return this.getComponentPropIdData(propId).then((data) => {
			return Promise.all([
				// Remove component prop ID
				this.remove(this.getRefComponentPropId(data.componentId, data.propName)),
				// Remove component prop ID data
				this.remove(this.getRefComponentPropIdData(propId))
			])
		})
	}

	/**
	 * Fetch the component version prop ID data
	 * @param  {String} componentVersionPropId 		The component version prop ID
	 * @return {Promise}                        	A Promise which resolves the data
	 */
	getComponentVersionPropIdData (componentVersionPropId) {
		return this.get(this.getRefComponentVersionPropIdData(componentVersionPropId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch the component version prop ID by component version ID and prop ID
	 * @param  {String} componentVersionId 		The component version ID
	 * @param  {String} propId             		The prop ID
	 * @return {Promise}                    	A Promise which resolves the component version prop ID
	 */
	getComponentVersionPropId (componentVersionId, propId) {
		return this.get(this.getRefComponentVersionPropId(componentVersionId, propId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Create a component version prop ID by component version ID and prop ID
	 * @param {String} componentVersionId 		The component version ID
	 * @param {String} propId             		The prop ID
	 * @return {Promise} 						A Promise which resolves the component version prop ID
	 */
	setComponentVersionPropId (componentVersionId, propId) {
		const ref = this.getRefComponentVersionPropId(componentVersionId, propId)
		const componentVersionPropId = ref.push().key()
		const data = {
			componentVersionId,
			propId
		}
		return Promise.all([
			// Component version prop ID
			this.set(ref, componentVersionPropId).then(() => componentVersionPropId),
			// Component version prop ID data
			this.set(this.getRefComponentVersionPropIdData(componentVersionPropId), data),
			// Component prop <> Component version prop
			this.set(this.getRefComponentProp(propId, componentVersionPropId), true)
		])
		.then(() => componentVersionPropId)
	}

	/**
	 * Remove a component version prop ID
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	removeComponentVersionPropId (componentVersionPropId) {
		return this.getComponentVersionPropIdData(componentVersionPropId).then((data) => {
			return Promise.all([
				// Component version prop ID
				this.remove(this.getRefComponentVersionPropId(data.componentVersionId, data.propId)),
				// Component version prop ID data
				this.remove(this.getRefComponentVersionPropIdData(componentVersionPropId)),
				// Component prop <> Component version prop
				this.remove(this.getRefComponentProp(data.propId, componentVersionPropId))
			])
			// Maybe remove component prop ID
			.then(() => {
				// Component version prop IDs for prop ID
				return this.get(this.getRefComponentProp(data.propId)).then((snapshot) => {
					if (!snapshot.exists()) {
						// Remove component prop ID
						return this.removeComponentPropId(data.propId)
					}
				})
			})
		})
	}

	/**
	 * Fetch component version prop IDs by component version ID
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                    A Promise which resolves an Array
	 */
	getComponentVersionPropIds (componentVersionId) {
		return this.get(this.getRefComponentVersionPropId(componentVersionId)).then((snapshot) => {
			if (!snapshot.exists()) {
				return Promise.resolve([])
			}
			return this.snapshotArray(snapshot)
		})
	}

	/**
	 * Fetch component version prop data
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	getComponentVersionPropData (componentVersionPropId) {
		return this.get(this.getRefComponentVersionPropData(componentVersionPropId)).then((snapshot) => snapshot.val())
	}

	/**
	 * Fetch the latest component version prop ID with description data
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	getLatestComponentVersionPropIdWithDescription (componentVersionPropId) {
		// Component version prop ID data
		return this.getComponentVersionPropIdData(componentVersionPropId).then((data) => {
			// Component version prop IDs with description data
			return this.get(this.getRefComponentPropDescription(data.propId)).then((snapshot) => {
				const ids = snapshot.exists() ? Object.keys(snapshot.val()) : []
				return ids.length ? ids.pop() : null
			})
		})
	}

	/**
	 * Fetch description data for the latest component version prop ID with description data
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	getLatestComponentPropDescription (componentVersionPropId) {
		return this.getLatestComponentVersionPropIdWithDescription(componentVersionPropId).then((latestComponentVersionPropId) => {
			if (latestComponentVersionPropId) {
				return this.getComponentVersionPropDescription(latestComponentVersionPropId)
			}
			return null
		})
	}

	/**
	 * Fetch description data for component version prop ID
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	getComponentVersionPropDescription (componentVersionPropId) {
		return this.get(this.getRefComponentVersionPropDescription(componentVersionPropId)).then((snapshot) => {
			// Component version prop description data
			if (snapshot.exists()) {
				const description = snapshot.val()

				// Component version prop ID data
				return this.getComponentVersionPropIdData(componentVersionPropId).then((componentVersionPropIdData) => {
					return {
						data: description,
						componentVersionPropIdData
					}
				})
				// Component version ID data
				.then((data) => {
					return this.getComponentVersionIdData(data.componentVersionPropIdData.componentVersionId).then((componentVersionIdData) => merge(data, { componentVersionIdData }))
				})
				// Package version ID data
				.then((data) => {
					return this.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then((packageVersionIdData) => merge(data, { packageVersionIdData }))
				})
			}
		})
	}

	/**
	 * Set or remove description data for the component version prop ID
	 * @param {String} 		componentVersionPropId 	The component version prop ID
	 * @param {String|null} description            	The description data (null to remove)
	 */
	setComponentVersionPropDescription (componentVersionPropId, description) {
		// Component version prop ID data
		return this.getComponentVersionPropIdData(componentVersionPropId).then((data) => {
			// Component version prop description
			const ref = this.getRefComponentVersionPropDescription(componentVersionPropId)
			// Latest component version prop ID with a description
			const propRef = this.getRefComponentPropDescription(data.propId).child(componentVersionPropId)
			// set
			if (description) {
				return Promise.all([
					// Component version prop description
					this.set(ref, description),
					// Latest component version prop ID with a description
					this.set(propRef, true)
				])
			}
			// remove
			return Promise.all([
				// Component version prop description
				this.remove(ref),
				// Latest component version prop ID with a description
				this.remove(propRef)
			])
		})
	}

	/**
	 * Fetch a component prop version
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	getComponentVersionProp (componentVersionPropId) {
		// Component version prop data
		return this.getComponentVersionPropData(componentVersionPropId).then((data) => {
			// Component version prop description data
			return this.getComponentVersionPropDescription(componentVersionPropId).then((description) => {
				if (!description) {
					// Fetch the description from the latest component version prop ID with description data
					return this.getLatestComponentPropDescription(componentVersionPropId)
				}
				return description
			})
			.then((description) => merge(data, { description }))
		})
	}

	/**
	 * Create or update a component version prop
	 * @param {String} componentVersionId The component version ID
	 * @param {String} propName           The prop name
	 * @param {String} data               The component version prop data
	 */
	setComponentVersionProp (componentVersionId, propName, data) {
		data.componentVersionId = componentVersionId

		// Component ID
		return this.getComponentVersionIdData(componentVersionId).then((componentVersionIdData) => {
			data.componentId = componentVersionIdData.componentId
			// Component prop ID
			return this.getComponentPropId(data.componentId, propName).then((propId) => {
				if (!propId) {
					return this.setComponentPropId(data.componentId, propName)
				}
				return propId
			})
			// Component version prop ID
			.then((propId) => {
				return this.getComponentVersionPropId(componentVersionId, propId).then((componentVersionPropId) => {
					if (!componentVersionPropId) {
						return this.setComponentVersionPropId(componentVersionId, propId)
					}
					return componentVersionPropId
				})
			})
			// Component version prop data
			.then((componentVersionPropId) => {
				return this.set(this.getRefComponentVersionPropData(componentVersionPropId), data).then(() => componentVersionPropId)
			})
		})
	}

	/**
	 * Remove a component version prop
	 * @param  {String} componentVersionPropId 	The component version prop ID
	 * @return {Promise}                        A Promise
	 */
	removeComponentVersionProp (componentVersionPropId) {
		return Promise.all([
			// Component version prop ID
			this.removeComponentVersionPropId(componentVersionPropId),
			// Component version prop data
			this.remove(this.getRefComponentVersionPropData(componentVersionPropId)),
			// Component version prop description
			this.setComponentVersionPropDescription(componentVersionPropId, null)
		])
	}

	/**
	 * Fetch all component version props
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                    A Promise which resolves an Array
	 */
	getComponentVersionProps (componentVersionId) {
		return this.getComponentVersionPropIds(componentVersionId).then((ids) => Promise.all(ids.map((id) => this.getComponentVersionProp(id))))
	}

	/**
	 * Remove all component version props
	 * @param  {String} componentVersionId 	The component version ID
	 * @return {Promise}                    A Promise
	 */
	removeComponentVersionProps (componentVersionId) {
		return this.getComponentVersionPropIds(componentVersionId).then((ids) => Promise.all(ids.map((id) => this.removeComponentVersionProp(id))))
	}

	///////////
	// DEMOS //
	///////////
	
	/**
	 * Get a Firebase reference for component demos
	 * @param  {String} componentId 	The component ID
	 * @return {Firebase}            	A Firebase reference
	 */
	getRefComponentDemo (componentId) {
		return this.getRef(`component_demo/${ componentId }`)
	}

	/**
	 * Fetch demos for component ID
	 * @param  {String} componentId 	The component ID
	 * @return {Promise}             	A Promise
	 */
	getComponentDemos (componentId) {
		return this.get(this.getRefComponentDemo(componentId)).then((snapshot) => this.snapshotArray(snapshot))
	}

	///////////
	// PAGES //
	///////////
	
	getPageRef (pageId, version) {
		return this.getRef(`pages/${ pageId }/${ this.version(version) }`)
	}
	
	/**
	 * Saves a page to Firebase.
	 * @param  {String} pageId 		The page ID.
	 * @param  {?} data 			The page data.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	setPage (pageId, data, version) {
		version = this.version(version)
		let ref = this.getRef('pages')
		if (pageId) {
			ref = ref.child(pageId)
		}
		else {
			ref = ref.push()
			pageId = ref.key()
		}
		ref = ref.child(version)
		return this.set(ref, data, pageId)
	}

	/**
	 * Removes a page from Firebase.
	 * @param  {String} pageId 		The page ID.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePage (pageId, version) {
		return this.remove(this.getPageRef(pageId, version), pageId)
	}

	/**
	 * Get a page from Firebase.
	 * @param  {String} pageId 		The page ID.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a page Object.
	 */
	getPage (pageId, version) {
		return this.get(this.getPageRef(pageId, version)).then((snapshot) => {
			return snapshot.val()
		})
	}

	/**
	 * Get a Firebase query reference for fetching pages for a specific package.
	 * @param  {String} packageId		The package ID.
	 * @param  {String} version 		The package version.
	 * @return {Firebase} 				A Firebase reference.
	 */
	getPackagePagesRef (packageId, version) {
		return this.getRef(`package_pages/${ packageId }/${ this.version(version) }`)
	}

	/**
	 * Create a Pages paginator
	 * @param  {String} packageId 	The package ID.
	 * @param  {String} version 	The package version.
	 */
	paginatePages (packageId, version) {
		this.paginate('pages', this.getPackagePagesRef(packageId, version))
	}

	/**
	 * Get 'Pages' paginator results.
	 * @param {String} type 	Page type ('prevPage' or 'nextPage')
	 * @return {Array} 			The results.
	 */
	getPaginatorPages (type, version) {
		return this.getPaginatorResults('pages', type).then((pageIds) => {
			pageIds = Object.keys(pageIds)
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId, version)))
		})
	}

	/**
	 * Get pages from Firebase for a specific package.
	 * @param {String} packageId 	The package ID.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise which resolves a pages Array.
	 */
	getPages (packageId, version) {
		return this.get(this.getPackagePagesRef(packageId, version)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.getPage(pageId, version)))
		})
	}

	/**
	 * Remove pages from Firebase for a specific package.
	 * @param {String} packageId 	The package ID.
	 * @param  {String} version 	The package version.
	 * @return {Promise} 			A Promise.
	 */
	removePages (packageId, version) {
		return this.get(this.getPackagePagesRef(packageId, version)).then((snapshot) => {
			let pageIds = Object.keys(snapshot.val())
			return Promise.all(pageIds.map((pageId) => this.removePage(pageId, version)))
		})
	}

	/**
	 * Package pages relationship
	 * @param {String} packageId   	The package ID.
	 * @param {String} pageId 		The page ID.
	 * @param {Boolean|null} data 	The data (Boolean or null to remove)
	 */
	setPackagePage (packageId, version, pageId, data) {
		return this.set(this.getPackagePagesRef(packageId, version).child(pageId), data)
	}

	/**
	 * Remove Package <> Page relationship
	 * @param {String} packageId   	The package ID.
	 * @param  {String} version 	The package version.
	 * @param {String} pageId 		The page ID.
	 */
	removePackagePage (packageId, version, pageId) {
		return this.remove(this.getPackagePagesRef(packageId, version).child(pageId))
	}

	onPageRemoved (cb, error) {
		this.listen('pages', 'child_removed', (snapshot) => {
			cb(snapshot.key())
		}, error)
	}
}

const store = new Store()
export default store
module.exports = exports.default