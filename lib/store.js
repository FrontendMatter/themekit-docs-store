'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _merge = require('mout/object/merge');

var _merge2 = _interopRequireDefault(_merge);

var _camelCase = require('mout/string/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

var _slugify = require('mout/string/slugify');

var _slugify2 = _interopRequireDefault(_slugify);

var _firebaseStore = require('firebase-store');

var _firebaseStore2 = _interopRequireDefault(_firebaseStore);

var _firebasePaginator = require('firebase-store/lib/firebase-paginator');

var _firebasePaginator2 = _interopRequireDefault(_firebasePaginator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ComponentStore Firebase Service.
 * @extends {Store}
 */

var ComponentStore = function (_Store) {
	_inherits(ComponentStore, _Store);

	/**
  * Constructor
  */

	function ComponentStore() {
		_classCallCheck(this, ComponentStore);

		/**
   * Holds paginator instances
   * @type {Object}
   */

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ComponentStore).call(this));

		_this.paginator = {};

		/**
   * Component relationships
   */
		_this.on('component.added', function (objectId, data) {
			// Package <> Component relationship
			_this.setPackageComponent(data.packageId, data.version, objectId, true);
		});
		_this.on('component.removed', function (objectId, data) {
			// Package <> Component relationship
			_this.removePackageComponent(data.packageId, data.version, objectId);
			// Component <> Demo relationship
			_this.remove(_this.componentDemosRef(objectId, data.version));
		});

		/**
   * Page relationships
   */
		_this.on('page.added', function (objectId, data) {
			// Package <> Page relationship
			_this.setPackagePage(data.packageId, data.version, objectId, true);
		});
		_this.on('page.removed', function (objectId, data) {
			// Package <> Page relationship
			_this.removePackagePage(data.packageId, data.version, objectId);
		});

		/**
   * Package relationships
   */
		_this.on('package.removed', function (packageId, data) {
			// Components
			_this.removePackageComponents(packageId, data.version);
			// Pages
			_this.removePages(packageId, data.version);
		});
		return _this;
	}

	/*eslint spaced-comment:0*/
	////////////////
	// PAGINATION //
	////////////////

	/**
  * Create a paginator.
  */

	_createClass(ComponentStore, [{
		key: 'paginate',
		value: function paginate(id, ref) {
			var limit = arguments.length <= 2 || arguments[2] === undefined ? 6 : arguments[2];

			this.paginator[id] = new _firebasePaginator2.default(ref, limit);
		}

		/**
   * Get paginator results.
   * @param {string} id 		The paginator ID.
   * @param {string} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorResults',
		value: function getPaginatorResults(id, type) {
			var _this2 = this;

			this.emit('serviceLoading');
			var page = undefined;
			try {
				page = this.paginator[id][type]();
			} catch (e) {
				this.emit('serviceError', e);
				return Promise.reject(e);
			}
			if (!page) {
				return Promise.resolve([]);
			}
			return this.get(page.ref).then(function (snapshot) {
				_this2.emit('serviceLoading');
				return page.cb(snapshot);
			});
		}

		/**
   * Get paginator results call function.
   * @param {string} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'getPaginatorResultsCall',
		value: function getPaginatorResultsCall(id) {
			var inst = this[(0, _camelCase2.default)('get-paginator-' + id)];
			if (typeof inst !== 'function') {
				return false;
			}
			return inst.bind(this);
		}

		/**
   * Get paginator results for the next page.
   * @param {string} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'nextPage',
		value: function nextPage(id) {
			var args = [].slice.call(arguments, 1);
			var inst = this.getPaginatorResultsCall(id);
			if (!inst) {
				return Promise.reject('invalid paginator results call ' + id);
			}
			return inst.apply(inst, ['nextPage'].concat(args));
		}

		/**
   * Get paginator results for the previous page.
   * @param {string} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'prevPage',
		value: function prevPage(id) {
			var inst = this.getPaginatorResultsCall(id);
			if (!inst) {
				return Promise.reject('invalid paginator results call ' + id);
			}
			return inst('prevPage');
		}

		//////////////
		// PACKAGES //
		//////////////

	}, {
		key: 'version',
		value: function version(_version) {
			return (0, _slugify2.default)(_version);
		}

		/**
   * Saves package data to Firebase.
   * @param {string} packageId 	The package ID.
   * @param {?} data 				The data (null to remove the package).
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'setPackage',
		value: function setPackage(packageId, data) {
			var _this3 = this;

			var version = arguments.length <= 2 || arguments[2] === undefined ? 'latest' : arguments[2];

			var path = this.getRef('packages');
			if (packageId) {
				path = path.child(packageId);
			} else {
				path = path.push();
				packageId = path.key();
			}
			path = path.child(this.version(version));
			if (!data) {
				return this.getPackage(packageId, version).then(function (pkg) {
					return _this3.set(path, data).then(function () {
						_this3.emit('package.removed', packageId, pkg);
					});
				});
			}
			return this.set(path, data, packageId).then(function () {
				_this3.emit('package.added', packageId, data);
				return packageId;
			});
		}

		/**
   * Removes a package from Firebase.
   * @param  {string} packageId 	The package ID.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePackage',
		value: function removePackage(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.setPackage(packageId, null, version);
		}

		/**
   * Get packages from Firebase.
   * @param {string} version The version.
   * @return {Promise} A Promise which resolves a packages Array.
   */

	}, {
		key: 'getPackages',
		value: function getPackages() {
			var _this4 = this;

			var version = arguments.length <= 0 || arguments[0] === undefined ? 'latest' : arguments[0];

			version = this.version(version);
			return this.get('packages').then(function (snapshot) {
				var packages = _this4.snapshotArray(snapshot);
				var queue = [];
				packages = packages.filter(function (pkg) {
					return pkg[version] !== undefined;
				});
				packages = packages.map(function (pkg) {
					return pkg[version];
				});
				packages.map(function (pkg) {
					queue.push(_this4.getPackageComponentsCount(pkg.objectId, version).then(function (count) {
						pkg.components = count;
					}));
				});
				return Promise.all(queue).then(function () {
					return packages;
				});
			});
		}

		/**
   * Get a package from Firebase.
   * @param {string} packageId 	The package ID.
   * @return {Promise} 			A Promise which resolves a package Object.
   */

	}, {
		key: 'getPackage',
		value: function getPackage(packageId) {
			var _this5 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			var path = this.getRef('packages/' + packageId + '/' + this.version(version));
			return this.get(path).then(function (snapshot) {
				if (version !== 'latest' && !snapshot.exists()) {
					return _this5.getPackage(packageId);
				}
				return snapshot.val();
			});
		}

		/**
   * Get all package versions from Firebase.
   * @param  {String} packageId 	The package ID.
   * @return {Promise}           	A Promise which resolves a packages Array
   */

	}, {
		key: 'getPackageVersions',
		value: function getPackageVersions(packageId) {
			var _this6 = this;

			return this.get(this.getRef('packages/' + packageId)).then(function (snapshot) {
				return _this6.snapshotArray(snapshot);
			});
		}

		/**
   * Package components two-way relationship
   * @param {string} packageId   		The package ID.
   * @param {string} componentId 		The component ID.
   * @param {boolean|null} data 		The data (boolean or null to remove)
   */

	}, {
		key: 'setPackageComponent',
		value: function setPackageComponent(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var componentId = arguments[2];
			var data = arguments[3];

			return this.set(this.getPackageComponentsRef(packageId).child(componentId + '/' + this.version(version)), data);
		}

		/**
   * Remove Package <> Component relationship
   * @param {string} packageId   		The package ID.
   * @param {string} componentId 		The component ID.
   */

	}, {
		key: 'removePackageComponent',
		value: function removePackageComponent(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var componentId = arguments[2];

			return this.setPackageComponent(packageId, version, componentId, null);
		}
	}, {
		key: 'onPackageAdded',
		value: function onPackageAdded(cb, error) {
			var version = arguments.length <= 2 || arguments[2] === undefined ? 'latest' : arguments[2];

			this.getOn('packages', 'child_added', function (snapshot) {
				var pkg = snapshot.val();
				if (pkg[version]) {
					cb(pkg[version]);
				}
			}, error);
		}
	}, {
		key: 'onPackageRemoved',
		value: function onPackageRemoved(cb, error) {
			this.getOn('packages', 'child_removed', function (snapshot) {
				cb(snapshot.key());
			}, error);
		}

		////////////////
		// COMPONENTS //
		////////////////

		/**
   * Get the Firebase path for fetching components.
   * @param  {boolean} sync 	Use the sync index.
   * @return {string}			A Firebase path.
   */

	}, {
		key: 'getComponentsPath',
		value: function getComponentsPath(sync) {
			var path = 'components';
			if (sync) {
				path = 'sync/' + path;
			}
			return path;
		}

		/**
   * Get a Firebase query reference for fetching components.
   * @param  {boolean} sync 	Use the sync index.
   * @return {Firebase}		A Firebase reference.
   */

	}, {
		key: 'getComponentsRef',
		value: function getComponentsRef(sync) {
			return this.ref.child(this.getComponentsPath(sync));
		}

		/**
   * Get the Firebase path for fetching a component.
   * @param  {string} componentId 	The component ID.
   * @param  {string} version 		The package version.
   * @param  {boolean} sync 			Use the sync index.
   * @return {string} 				A Firebase path.
   */

	}, {
		key: 'getComponentPath',
		value: function getComponentPath(componentId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var sync = arguments[2];

			return this.getComponentsPath(sync) + '/' + componentId + '/' + this.version(version);
		}

		/**
   * Get a Firebase query reference for fetching a component.
   * @param  {string} componentId 	The component ID.
   * @param  {boolean} sync 			Use the sync index.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getComponentRef',
		value: function getComponentRef(componentId, sync) {
			return this.getComponentsRef(sync).child(componentId);
		}

		/**
   * Saves component data to Firebase.
   * @param  {string} componentId 	The component ID.
   * @param  {?} data 				The data (null to remove the component).
   * @param  {string} version 		The package version.
   * @param  {boolean} sync 			Use the sync index.
   * @return {Promise} 				A Promise.
   */

	}, {
		key: 'setComponent',
		value: function setComponent(componentId, data) {
			var _this7 = this;

			var version = arguments.length <= 2 || arguments[2] === undefined ? 'latest' : arguments[2];
			var sync = arguments[3];

			version = this.version(version);
			if (!componentId) {
				var ref = this.getComponentsRef(sync).push();
				componentId = ref.key();
			}
			var path = this.getComponentPath(componentId, version, sync);
			if (!data) {
				return this.getComponent(componentId, version).then(function (_ref) {
					var merge = _ref.merge;

					return _this7.set(path, data).then(function () {
						_this7.emit('component.removed', componentId, merge);
					});
				});
			}
			return this.set(path, data, componentId).then(function () {
				_this7.emit('component.added', componentId, data);
				return componentId;
			});
		}

		/**
   * Removes a component from Firebase.
   * @param  {string} componentId 	The component ID.
   * @param  {string} version 		The package version.
   * @return {Promise} 				A Promise.
   */

	}, {
		key: 'removeComponent',
		value: function removeComponent(componentId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return Promise.all([this.setComponent(componentId, null, version), this.setComponent(componentId, null, version, true)]);
		}

		/**
   * Get the component IDs for a package from Firebase.
   * @param  {string} packageId 	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise which resolves a Number.
   */

	}, {
		key: 'getPackageComponentsIds',
		value: function getPackageComponentsIds(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			return this.get(this.getPackageComponentsRef(packageId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				var componentIds = [];
				var components = snapshot.val();
				for (var componentId in components) {
					if (components[componentId].hasOwnProperty(version)) {
						componentIds.push(componentId);
					}
				}
				return componentIds;
			});
		}

		/**
   * Get the number of components for a package from Firebase.
   * @param  {string} packageId 	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise which resolves a Number.
   */

	}, {
		key: 'getPackageComponentsCount',
		value: function getPackageComponentsCount(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			return this.getPackageComponentsIds(packageId, version).then(function (ids) {
				return ids.length;
			});
		}

		/**
   * Get the components for a package from Firebase.
   * @param  {string} packageId	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise which resolves a components Array.
   */

	}, {
		key: 'getPackageComponents',
		value: function getPackageComponents(packageId) {
			var _this8 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			return this.getPackageComponentsIds(packageId, version).then(function (componentIds) {
				var components = componentIds.map(function (id) {
					return _this8.getComponent(id, version);
				});
				return Promise.all(components);
			});
		}

		/**
   * Remove the components belonging to a package from Firebase.
   * @param  {string} packageId	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePackageComponents',
		value: function removePackageComponents(packageId) {
			var _this9 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			return this.getPackageComponentsIds(packageId, version).then(function (componentIds) {
				var removeComponents = componentIds.map(function (componentId) {
					return _this9.removeComponent(componentId, version);
				});
				return Promise.all(removeComponents);
			});
		}

		/**
   * Get a Firebase query reference for fetching components for a specific package.
   * @param  {string} packageId		The package ID.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackageComponentsRef',
		value: function getPackageComponentsRef(packageId) {
			return this.getRef('package_components/' + packageId);
		}

		/**
   * Get a component.
   * @param  {Firebase} componentId 	The component ID.
   * @param  {string} version 		The package version.
   * @return {Promise} 				A Promise which resolves an Array of indexes.
   */

	}, {
		key: 'getComponent',
		value: function getComponent(componentId) {
			var _this10 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			this.emit('serviceLoading');
			return Promise.all([this.getComponentValue(componentId, version), this.getComponentValue(componentId, version, true)]).then(function (values) {
				return Promise.all(values.filter(function (component) {
					return component.data;
				}).map(function (component) {
					return _this10.syncComponentIndex(component.data, version, !component.sync);
				}));
			}).then(function (indexes) {
				var componentData = null;
				indexes.forEach(function (data) {
					componentData = data;
				});
				_this10.emit('serviceComplete');
				return componentData;
			}).catch(function (e) {
				return _this10.emit('serviceError', e);
			});
		}

		/**
   * Get a component data
   * @param  {string} componentId 	The component ID.
   * @param  {string} version 		The package version.
   * @param  {boolean} sync 			Use the 'sync' index.
   * @return {Promise}      			A Promise which resolves an Object containing the component data and the 'sync' param value
   */

	}, {
		key: 'getComponentValue',
		value: function getComponentValue(componentId) {
			var _this11 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var sync = arguments[2];

			version = this.version(version);
			return this.get(this.getComponentPath(componentId, version, sync)).then(function (snapshot) {
				if (version !== 'latest' && !snapshot.exists()) {
					return _this11.getComponentValue(componentId, 'latest', sync);
				}
				return {
					data: snapshot.val(),
					sync: sync
				};
			});
		}

		/**
   * Get the 'sync' or 'components' index for a component.
   * @param  {Object} component 	The component.
   * @param  {string} version 	The package version.
   * @param  {boolean} sync 		Enable to get the 'sync' index when the component Object comes from the 'components' index
   * @return {Promise} 			A Promise which resolves the index Object.
   */

	}, {
		key: 'syncComponentIndex',
		value: function syncComponentIndex(component) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var sync = arguments[2];

			if (!component) {
				return Promise.resolve();
			}
			return this.get(this.getComponentPath(component.objectId, version, sync)).then(function (snapshot) {
				if (!snapshot.exists()) {
					if (sync) {
						return {
							component: component,
							sync: null,
							merge: component
						};
					}
					return {
						component: null,
						sync: component,
						merge: component
					};
				}
				var data = snapshot.val();
				if (sync) {
					return {
						component: component,
						sync: data,
						merge: (0, _merge2.default)(data, component)
					};
				}
				return {
					component: data,
					sync: component,
					merge: (0, _merge2.default)(component, data)
				};
			});
		}
	}, {
		key: 'onComponentUpdate',
		value: function onComponentUpdate(eventType, cb, error) {
			var _this12 = this;

			this.getOn(this.getComponentsRef(), eventType, function (snapshot) {
				_this12.syncComponentIndex(snapshot.val(), true).then(function (index) {
					cb(index);
				}).catch(function (e) {
					if (error) {
						error(e);
					}
				});
			}, error);
			this.getOn(this.getComponentsRef(true), eventType, function (snapshot) {
				_this12.syncComponentIndex(snapshot.val()).then(function (index) {
					cb(index);
				}).catch(function (e) {
					if (error) {
						error(e);
					}
				});
			}, error);
		}
	}, {
		key: 'onComponentAdded',
		value: function onComponentAdded(cb, error) {
			this.onComponentUpdate('child_added', cb, error);
		}
	}, {
		key: 'onComponentChanged',
		value: function onComponentChanged(cb, error) {
			this.onComponentUpdate('child_changed', cb, error);
		}
	}, {
		key: 'onComponentRemoved',
		value: function onComponentRemoved(cb, error) {
			this.getOn(this.getComponentsRef(), 'child_removed', function (snapshot) {
				cb(snapshot.key());
			}, error);
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

	}, {
		key: 'componentDemosRef',
		value: function componentDemosRef(componentId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.getRef('component_demos/' + componentId + '/' + this.version(version));
		}

		/**
   * Get component demos from Firebase.
   * @param  {String} componentId 	The component ID.
   * @param  {String} version     	The package version.
   * @return {Promise}             	A Promise resolving the demos Array
   */

	}, {
		key: 'getComponentDemos',
		value: function getComponentDemos(componentId) {
			var _this13 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.get(this.componentDemosRef(componentId, version)).then(function (snapshot) {
				return _this13.snapshotArray(snapshot);
			});
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

	}, {
		key: 'setPage',
		value: function setPage(pageId, data) {
			var _this14 = this;

			var version = arguments.length <= 2 || arguments[2] === undefined ? 'latest' : arguments[2];

			var ref = this.getRef('pages');
			if (pageId) {
				ref = ref.child(pageId);
			} else {
				ref = ref.push();
				pageId = ref.key();
			}
			version = this.version(version);
			ref = ref.child(version);

			if (!data) {
				return this.getPage(pageId, version).then(function (page) {
					return _this14.set(ref, data).then(function () {
						_this14.emit('page.removed', pageId, page);
					});
				});
			}
			return this.set(ref, data, pageId).then(function () {
				_this14.emit('page.added', pageId, data);
				return pageId;
			});
		}

		/**
   * Removes a page from Firebase.
   * @param  {string} pageId 		The page ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePage',
		value: function removePage(pageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.setPage(pageId, null, version);
		}

		/**
   * Get a page from Firebase.
   * @param  {string} pageId 		The page ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise which resolves a page Object.
   */

	}, {
		key: 'getPage',
		value: function getPage(pageId) {
			var _this15 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			version = this.version(version);
			var path = this.getRef('pages/' + pageId + '/' + version);
			return this.get(path).then(function (snapshot) {
				if (version !== 'latest' && !snapshot.exists()) {
					return _this15.getPage(pageId);
				}
				return snapshot.val();
			});
		}

		/**
   * Get a Firebase query reference for fetching pages for a specific package.
   * @param  {string} packageId		The package ID.
   * @param  {string} version 		The package version.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackagePagesRef',
		value: function getPackagePagesRef(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.getRef('package_pages/' + packageId + '/' + this.version(version));
		}

		/**
   * Create a Pages paginator
   * @param  {string} packageId 	The package ID.
   * @param  {string} version 	The package version.
   */

	}, {
		key: 'paginatePages',
		value: function paginatePages(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			this.paginate('pages', this.getPackagePagesRef(packageId, version));
		}

		/**
   * Get 'Pages' paginator results.
   * @param {string} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorPages',
		value: function getPaginatorPages(type) {
			var _this16 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.getPaginatorResults('pages', type).then(function (pageIds) {
				pageIds = Object.keys(pageIds);
				return Promise.all(pageIds.map(function (pageId) {
					return _this16.getPage(pageId, version);
				}));
			});
		}

		/**
   * Get pages from Firebase for a specific package.
   * @param {string} packageId 	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise which resolves a pages Array.
   */

	}, {
		key: 'getPages',
		value: function getPages(packageId) {
			var _this17 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.get(this.getPackagePagesRef(packageId, version)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this17.getPage(pageId, version);
				}));
			});
		}

		/**
   * Remove pages from Firebase for a specific package.
   * @param {string} packageId 	The package ID.
   * @param  {string} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePages',
		value: function removePages(packageId) {
			var _this18 = this;

			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];

			return this.get(this.getPackagePagesRef(packageId, version)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this18.removePage(pageId, version);
				}));
			});
		}

		/**
   * Package pages relationship
   * @param {string} packageId   	The package ID.
   * @param {string} pageId 		The page ID.
   * @param {boolean|null} data 	The data (boolean or null to remove)
   */

	}, {
		key: 'setPackagePage',
		value: function setPackagePage(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var pageId = arguments[2];
			var data = arguments[3];

			return this.set(this.getPackagePagesRef(packageId, version).child(pageId), data);
		}

		/**
   * Remove Package <> Page relationship
   * @param {string} packageId   	The package ID.
   * @param  {string} version 	The package version.
   * @param {string} pageId 		The page ID.
   */

	}, {
		key: 'removePackagePage',
		value: function removePackagePage(packageId) {
			var version = arguments.length <= 1 || arguments[1] === undefined ? 'latest' : arguments[1];
			var pageId = arguments[2];

			return this.setPackagePage(packageId, version, pageId, null);
		}
	}, {
		key: 'onPageRemoved',
		value: function onPageRemoved(cb, error) {
			this.getOn('pages', 'child_removed', function (snapshot) {
				cb(snapshot.key());
			}, error);
		}
	}]);

	return ComponentStore;
}(_firebaseStore2.default);

var store = new ComponentStore();
exports.default = store;

module.exports = exports.default;