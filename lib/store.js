'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _merge = require('mout/object/merge');

var _merge2 = _interopRequireDefault(_merge);

var _camelCase = require('mout/string/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

var _firebaseStore = require('./firebase-store');

var _firebaseStore2 = _interopRequireDefault(_firebaseStore);

var _firebasePaginator = require('./firebase-paginator');

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
   * Package <> Component relationship
   */
		_this.on('component.added', function (componentName, data) {
			_this.setPackageComponent(data.packageId, componentName, true);
		});
		_this.on('component.removed', function (componentName, data) {
			_this.setPackageComponent(data.packageId, componentName, null);
		});

		/**
   * Package <> Page relationship
   */
		_this.on('page.added', function (pageId, page) {
			_this.setPackagePage(page.packageId, pageId, true);
		});
		_this.on('page.removed', function (pageId, page) {
			_this.setPackagePage(page.packageId, pageId, null);
		});
		return _this;
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

	_createClass(ComponentStore, [{
		key: 'setPackage',
		value: function setPackage(name, data) {
			return this.set('packages/' + name, data);
		}

		/**
   * Removes a package from Firebase.
   * @param  {string} name 	The package name.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'removePackage',
		value: function removePackage(name) {
			return this.setPackage(name, null);
		}

		/**
   * Get packages from Firebase.
   * @return {Promise} A Promise which resolves a packages Array.
   */

	}, {
		key: 'getPackages',
		value: function getPackages() {
			var _this2 = this;

			return this.get('packages').then(function (snapshot) {
				var packages = snapshot.val();
				var packagesArray = [];
				for (var name in packages) {
					packagesArray.push(packages[name]);
				}
				return packagesArray;
			}).then(function (packages) {
				var queue = [];
				packages.map(function (pkg) {
					queue.push(_this2.getPackageComponents(pkg.name).then(function (components) {
						pkg.components = components.length;
					}));
				});
				return Promise.all(queue).then(function () {
					return packages;
				});
			});
		}

		/**
   * Get a package from Firebase.
   * @param {string} packageName 	The package name.
   * @return {Promise} 			A Promise which resolves a package Object.
   */

	}, {
		key: 'getPackage',
		value: function getPackage(packageName) {
			return this.get('packages/' + packageName).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Package components two-way relationship
   * @param {string} packageName   	The package name.
   * @param {string} componentName 	The component name.
   * @param {boolean|null} data 		The data (boolean or null to remove)
   */

	}, {
		key: 'setPackageComponent',
		value: function setPackageComponent(packageName, componentName, data) {
			return this.set('package_components/' + packageName + '/' + componentName, data);
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
   * @param {string} name 	The component name.
   * @param  {boolean} sync 	Use the sync index.
   * @return {string} 		A Firebase path.
   */

	}, {
		key: 'getComponentPath',
		value: function getComponentPath(name, sync) {
			return this.getComponentsPath(sync) + '/' + name;
		}

		/**
   * Get a Firebase query reference for fetching a component.
   * @param {string} name 	The component name.
   * @param  {boolean} sync 	Use the sync index.
   * @return {Firebase} 		A Firebase reference.
   */

	}, {
		key: 'getComponentRef',
		value: function getComponentRef(name, sync) {
			return this.getComponentsRef(sync).child(name);
		}

		/**
   * Saves component data to Firebase.
   * @param {string} name 	The component name.
   * @param {?} data 			The data (null to remove the component).
   * @param {boolean} sync 	Use the sync index.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'setComponent',
		value: function setComponent(name, data, sync) {
			var _this3 = this;

			var path = this.getComponentPath(name, sync);
			if (!data) {
				return this.getComponent(name).then(function (_ref) {
					var component = _ref.component;

					return _this3.set(path, data).then(function () {
						_this3.emit('component.removed', name, component);
					});
				});
			}
			return this.set(path, data).then(function () {
				_this3.emit('component.added', name, data);
			});
		}

		/**
   * Removes a component from Firebase.
   * @param  {string} name 	The component name.
   * @param {boolean} sync 	Use the sync index.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'removeComponent',
		value: function removeComponent(name, sync) {
			return this.setComponent(name, null, sync);
		}

		/**
   * Get the components for a package from Firebase.
   * @return {Promise} A Promise which resolves a components Array.
   */

	}, {
		key: 'getPackageComponents',
		value: function getPackageComponents(packageName) {
			var _this4 = this;

			return this.get(this.getPackageComponentsRef(packageName)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				var componentIds = Object.keys(snapshot.val());
				var components = componentIds.map(function (componentId) {
					return _this4.getComponent(componentId);
				});
				_this4.emit('serviceLoading');
				return Promise.all(components);
			}).then(function (results) {
				_this4.emit('serviceComplete');
				return results;
			}).catch(function (e) {
				_this4.emit('serviceError', e);
			});
		}

		/**
   * Get a Firebase query reference for fetching components for a specific package.
   * @param  {string} packageName		The package name.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackageComponentsRef',
		value: function getPackageComponentsRef(packageName) {
			return this.getRef('package_components/' + packageName);
		}

		/**
   * Get a component.
   * @param  {Firebase} name 	The component name.
   * @return {Promise} 		A Promise which resolves an Array of indexes.
   */

	}, {
		key: 'getComponent',
		value: function getComponent(name) {
			var _this5 = this;

			this.emit('serviceLoading');
			return Promise.all([this.getComponentValue(name), this.getComponentValue(name, true)]).then(function (values) {
				return Promise.all(values.map(function (component) {
					return _this5.syncComponentIndex(component.data, !component.sync);
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
				_this5.emit('serviceComplete');
				return componentData;
			}).catch(function (e) {
				return _this5.emit('serviceError', e);
			});
		}

		/**
   * Get a component data
   * @param  {string} name The component name
   * @param  {boolean} sync Use the 'sync' index
   * @return {Promise}      A Promise which resolves an Object containing the
   * component data and the 'sync' param value
   */

	}, {
		key: 'getComponentValue',
		value: function getComponentValue(name, sync) {
			return this.get(this.getComponentPath(name, sync)).then(function (snapshot) {
				return {
					data: snapshot.val(),
					sync: sync
				};
			});
		}

		/**
   * Get the 'sync' or 'components' index for a component.
   * @param  {Object} component 	The component.
   * @param  {boolean} sync 		Enable to get the 'sync' index when the component
   * Object comes from the 'components' index
   * @return {Promise} 			A Promise which resolves the index Object.
   */

	}, {
		key: 'syncComponentIndex',
		value: function syncComponentIndex(component, sync) {
			if (!component) {
				return Promise.resolve();
			}
			return this.get(this.getComponentPath(component.name, sync)).then(function (snapshot) {
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
			var _this6 = this;

			this.getOn(this.getComponentsRef(), eventType, function (snapshot) {
				_this6.syncComponentIndex(snapshot.val(), true).then(function (index) {
					cb(index);
				}).catch(function (e) {
					if (error) {
						error(e);
					}
				});
			}, error);
			this.getOn(this.getComponentsRef(true), eventType, function (snapshot) {
				_this6.syncComponentIndex(snapshot.val()).then(function (index) {
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
		value: function setPage(data, pageId) {
			var _this7 = this;

			var ref = this.getRef('pages');
			if (pageId) {
				ref = ref.child(pageId);
			} else {
				ref = ref.push();
				pageId = ref.key();
				data.pageId = pageId;
			}

			if (!data) {
				return this.getPage(pageId).then(function (page) {
					return _this7.set(ref, data).then(function () {
						_this7.emit('page.removed', pageId, page);
					});
				});
			}
			return this.set(ref, data).then(function () {
				_this7.emit('page.added', pageId, data);
				return pageId;
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
   * @param  {string} packageName		The package name.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackagePagesRef',
		value: function getPackagePagesRef(packageName) {
			return this.getRef('package_pages/' + packageName);
		}

		/**
   * Create a paginator.
   */

	}, {
		key: 'paginate',
		value: function paginate(id, ref) {
			var limit = arguments.length <= 2 || arguments[2] === undefined ? 6 : arguments[2];

			this.paginator[id] = new _firebasePaginator2.default(ref, limit);
		}

		/**
   * Create a Pages paginator
   * @param  {string} packageName The package name.
   */

	}, {
		key: 'paginatePages',
		value: function paginatePages(packageName) {
			this.paginate('pages', this.getPackagePagesRef(packageName));
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
			var _this8 = this;

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
				_this8.emit('serviceLoading');
				return page.cb(snapshot);
			});
		}

		/**
   * Get 'Pages' paginator results.
   * @param {string} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorPages',
		value: function getPaginatorPages(type) {
			var _this9 = this;

			return this.getPaginatorResults('pages', type).then(function (pageIds) {
				pageIds = Object.keys(pageIds);
				return Promise.all(pageIds.map(function (pageId) {
					return _this9.getPage(pageId);
				}));
			}).then(function (result) {
				_this9.emit('serviceComplete');
				return result;
			}).catch(function (e) {
				_this9.emit('serviceError', e);
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

		/**
   * Get pages from Firebase for a specific package.
   * @return {Promise} A Promise which resolves a pages Array.
   */

	}, {
		key: 'getPages',
		value: function getPages(packageName) {
			var _this10 = this;

			return this.get(this.getPackagePagesRef(packageName)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this10.getPage(pageId);
				}));
			});
		}

		/**
   * Package pages relationship
   * @param {string} packageName   	The package name.
   * @param {string} pageId 			The page ID.
   * @param {boolean|null} data 		The data (boolean or null to remove)
   */

	}, {
		key: 'setPackagePage',
		value: function setPackagePage(packageName, pageId, data) {
			return this.set('package_pages/' + packageName + '/' + pageId, data);
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