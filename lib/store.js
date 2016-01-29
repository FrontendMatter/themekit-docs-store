'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _merge = require('mout/object/merge');

var _merge2 = _interopRequireDefault(_merge);

var _camelCase = require('mout/string/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

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
		_this.on('component.added', function (componentId, data) {
			// Package <> Component relationship
			_this.setPackageComponent(data.packageId, componentId, true);
		});
		_this.on('component.removed', function (componentId, data) {
			// Package <> Component relationship
			_this.removePackageComponent(data.packageId, componentId);
			// Component <> Demo relationship
			_this.remove(_this.componentDemosRef(componentId));
		});

		/**
   * Page relationships
   */
		_this.on('page.added', function (pageId, page) {
			// Package <> Page relationship
			_this.setPackagePage(page.packageId, pageId, true);
		});
		_this.on('page.removed', function (pageId, page) {
			// Package <> Page relationship
			_this.removePackagePage(page.packageId, pageId);
		});

		/**
   * Package relationships
   */
		_this.on('package.removed', function (packageId, pkg) {
			// Components
			_this.removePackageComponents(packageId);
			// Pages
			_this.removePages(packageId);
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
			var inst = this.getPaginatorResultsCall(id);
			if (!inst) {
				return Promise.reject('invalid paginator results call ' + id);
			}
			return inst('nextPage');
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

			var path = this.getRef('packages');
			if (packageId) {
				path = path.child(packageId);
			} else {
				path = path.push();
			}
			if (!data) {
				return this.getPackage(packageId).then(function (pkg) {
					return _this3.set(path, data).then(function () {
						_this3.emit('package.removed', packageId, pkg);
					});
				});
			}
			return this.set(path, data).then(function () {
				_this3.emit('package.added', packageId, data);
			});
		}

		/**
   * Removes a package from Firebase.
   * @param  {string} packageId 	The package ID.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePackage',
		value: function removePackage(packageId) {
			return this.setPackage(packageId, null);
		}

		/**
   * Get packages from Firebase.
   * @return {Promise} A Promise which resolves a packages Array.
   */

	}, {
		key: 'getPackages',
		value: function getPackages() {
			var _this4 = this;

			return this.get('packages').then(function (snapshot) {
				var packages = _this4.snapshotArray(snapshot);
				var queue = [];
				packages.map(function (pkg) {
					queue.push(_this4.getPackageComponentsCount(pkg.objectId).then(function (count) {
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
			return this.get('packages/' + packageId).then(function (snapshot) {
				return snapshot.val();
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
		value: function setPackageComponent(packageId, componentId, data) {
			return this.set(this.getPackageComponentsRef(packageId).child(componentId), data);
		}

		/**
   * Remove Package <> Component relationship
   * @param {string} packageId   		The package ID.
   * @param {string} componentId 		The component ID.
   */

	}, {
		key: 'removePackageComponent',
		value: function removePackageComponent(packageId, componentId) {
			return this.setPackageComponent(packageId, componentId, null);
		}
	}, {
		key: 'onPackageAdded',
		value: function onPackageAdded(cb, error) {
			this.getOn('packages', 'child_added', function (snapshot) {
				cb(snapshot.val());
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
   * @param {string} componentId 	The component ID.
   * @param  {boolean} sync 		Use the sync index.
   * @return {string} 			A Firebase path.
   */

	}, {
		key: 'getComponentPath',
		value: function getComponentPath(componentId, sync) {
			return this.getComponentsPath(sync) + '/' + componentId;
		}

		/**
   * Get a Firebase query reference for fetching a component.
   * @param {string} componentId 	The component ID.
   * @param  {boolean} sync 		Use the sync index.
   * @return {Firebase} 			A Firebase reference.
   */

	}, {
		key: 'getComponentRef',
		value: function getComponentRef(componentId, sync) {
			return this.getComponentsRef(sync).child(componentId);
		}

		/**
   * Saves component data to Firebase.
   * @param {string} componentId 	The component ID.
   * @param {?} data 				The data (null to remove the component).
   * @param {boolean} sync 		Use the sync index.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'setComponent',
		value: function setComponent(componentId, data, sync) {
			var _this5 = this;

			if (!componentId) {
				var ref = this.getComponentsRef(sync).push();
				componentId = ref.key();
			}
			var path = this.getComponentPath(componentId, sync);
			if (!data) {
				return this.getComponent(componentId).then(function (_ref) {
					var component = _ref.component;

					return _this5.set(path, data).then(function () {
						_this5.emit('component.removed', componentId, component);
					});
				});
			}
			return this.set(path, data).then(function (objectId) {
				_this5.emit('component.added', componentId, data);
				return objectId;
			});
		}

		/**
   * Removes a component from Firebase.
   * @param  {string} componentId 	The component ID.
   * @return {Promise} 				A Promise.
   */

	}, {
		key: 'removeComponent',
		value: function removeComponent(componentId) {
			return Promise.all([this.setComponent(componentId, null), this.setComponent(componentId, null, true)]);
		}

		/**
   * Get the number of components for a package from Firebase.
   * @param {string} packageId 	The package ID.
   * @return {Promise} 			A Promise which resolves a Number.
   */

	}, {
		key: 'getPackageComponentsCount',
		value: function getPackageComponentsCount(packageId) {
			return this.get(this.getPackageComponentsRef(packageId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve(0);
				}
				var componentIds = Object.keys(snapshot.val());
				return componentIds.length;
			});
		}

		/**
   * Get the components for a package from Firebase.
   * @param {string} packageId	The package ID.
   * @return {Promise} 			A Promise which resolves a components Array.
   */

	}, {
		key: 'getPackageComponents',
		value: function getPackageComponents(packageId) {
			var _this6 = this;

			return this.get(this.getPackageComponentsRef(packageId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				var componentIds = Object.keys(snapshot.val());
				var components = componentIds.map(function (componentId) {
					return _this6.getComponent(componentId);
				});
				return Promise.all(components);
			});
		}

		/**
   * Remove the components belonging to a package from Firebase.
   * @param {string} packageId	The package ID.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePackageComponents',
		value: function removePackageComponents(packageId) {
			var _this7 = this;

			return this.get(this.getPackageComponentsRef(packageId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve();
				}
				var componentIds = Object.keys(snapshot.val());
				var removeComponents = componentIds.map(function (componentId) {
					return _this7.removeComponent(componentId);
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
   * @return {Promise} 				A Promise which resolves an Array of indexes.
   */

	}, {
		key: 'getComponent',
		value: function getComponent(componentId) {
			var _this8 = this;

			this.emit('serviceLoading');
			return Promise.all([this.getComponentValue(componentId), this.getComponentValue(componentId, true)]).then(function (values) {
				return Promise.all(values.map(function (component) {
					return _this8.syncComponentIndex(component.data, !component.sync);
				}));
			}).then(function (indexes) {
				var componentData = null;
				for (var i = 0; i <= indexes.length; i++) {
					if (!indexes[i]) {
						indexes.splice(i, 1);
					}
				}
				indexes.forEach(function (data) {
					componentData = data;
				});
				_this8.emit('serviceComplete');
				return componentData;
			}).catch(function (e) {
				return _this8.emit('serviceError', e);
			});
		}

		/**
   * Get a component data
   * @param  {string} componentId 	The component ID.
   * @param  {boolean} sync 			Use the 'sync' index.
   * @return {Promise}      			A Promise which resolves an Object containing the component data and the 'sync' param value
   */

	}, {
		key: 'getComponentValue',
		value: function getComponentValue(componentId, sync) {
			return this.get(this.getComponentPath(componentId, sync)).then(function (snapshot) {
				return {
					data: snapshot.val(),
					sync: sync
				};
			});
		}

		/**
   * Get the 'sync' or 'components' index for a component.
   * @param  {Object} component 	The component.
   * @param  {boolean} sync 		Enable to get the 'sync' index when the component Object comes from the 'components' index
   * @return {Promise} 			A Promise which resolves the index Object.
   */

	}, {
		key: 'syncComponentIndex',
		value: function syncComponentIndex(component, sync) {
			if (!component) {
				return Promise.resolve();
			}
			return this.get(this.getComponentPath(component.objectId, sync)).then(function (snapshot) {
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
			var _this9 = this;

			this.getOn(this.getComponentsRef(), eventType, function (snapshot) {
				_this9.syncComponentIndex(snapshot.val(), true).then(function (index) {
					cb(index);
				}).catch(function (e) {
					if (error) {
						error(e);
					}
				});
			}, error);
			this.getOn(this.getComponentsRef(true), eventType, function (snapshot) {
				_this9.syncComponentIndex(snapshot.val()).then(function (index) {
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

	}, {
		key: 'componentDemosRef',
		value: function componentDemosRef(componentId) {
			return this.getRef('component_demos/' + componentId);
		}
	}, {
		key: 'getComponentDemos',
		value: function getComponentDemos(componentId) {
			var _this10 = this;

			return this.get(this.componentDemosRef(componentId)).then(function (snapshot) {
				return _this10.snapshotArray(snapshot);
			});
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

	}, {
		key: 'setPage',
		value: function setPage(pageId, data) {
			var _this11 = this;

			var ref = this.getRef('pages');
			if (pageId) {
				ref = ref.child(pageId);
			} else {
				ref = ref.push();
				pageId = ref.key();
			}

			if (!data) {
				return this.getPage(pageId).then(function (page) {
					return _this11.set(ref, data).then(function () {
						_this11.emit('page.removed', pageId, page);
					});
				});
			}
			return this.set(ref, data).then(function (objectId) {
				_this11.emit('page.added', pageId, data);
				return objectId;
			});
		}

		/**
   * Removes a page from Firebase.
   * @param  {string} pageId 	The page ID.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'removePage',
		value: function removePage(pageId) {
			return this.setPage(null, pageId);
		}

		/**
   * Get a page from Firebase.
   * @param {string} pageId 	The page ID.
   * @return {Promise} 		A Promise which resolves a page Object.
   */

	}, {
		key: 'getPage',
		value: function getPage(pageId) {
			return this.get('pages/' + pageId).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Get a Firebase query reference for fetching pages for a specific package.
   * @param  {string} packageId		The package ID.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackagePagesRef',
		value: function getPackagePagesRef(packageId) {
			return this.getRef('package_pages/' + packageId);
		}

		/**
   * Create a Pages paginator
   * @param  {string} packageId The package ID.
   */

	}, {
		key: 'paginatePages',
		value: function paginatePages(packageId) {
			this.paginate('pages', this.getPackagePagesRef(packageId));
		}

		/**
   * Get 'Pages' paginator results.
   * @param {string} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorPages',
		value: function getPaginatorPages(type) {
			var _this12 = this;

			return this.getPaginatorResults('pages', type).then(function (pageIds) {
				pageIds = Object.keys(pageIds);
				return Promise.all(pageIds.map(function (pageId) {
					return _this12.getPage(pageId);
				}));
			}).then(function (result) {
				_this12.emit('serviceComplete');
				return result;
			}).catch(function (e) {
				_this12.emit('serviceError', e);
			});
		}

		/**
   * Get pages from Firebase for a specific package.
   * @param {string} packageId 	The package ID.
   * @return {Promise} 			A Promise which resolves a pages Array.
   */

	}, {
		key: 'getPages',
		value: function getPages(packageId) {
			var _this13 = this;

			return this.get(this.getPackagePagesRef(packageId)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this13.getPage(pageId);
				}));
			});
		}

		/**
   * Remove pages from Firebase for a specific package.
   * @param {string} packageId 	The package ID.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePages',
		value: function removePages(packageId) {
			var _this14 = this;

			return this.get(this.getPackagePagesRef(packageId)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this14.removePage(pageId);
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
		value: function setPackagePage(packageId, pageId, data) {
			return this.set('package_pages/' + packageId + '/' + pageId, data);
		}

		/**
   * Remove Package <> Page relationship
   * @param {string} packageId   	The package ID.
   * @param {string} pageId 		The page ID.
   */

	}, {
		key: 'removePackagePage',
		value: function removePackagePage(packageId, pageId) {
			return this.setPackagePage(packageId, pageId, null);
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