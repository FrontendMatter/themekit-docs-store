'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _firebaseStore = require('firebase-store');

var _firebaseStore2 = _interopRequireDefault(_firebaseStore);

var _merge = require('mout/object/merge');

var _merge2 = _interopRequireDefault(_merge);

var _forOwn = require('mout/object/forOwn');

var _forOwn2 = _interopRequireDefault(_forOwn);

var _camelCase = require('mout/string/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

var _slugify = require('mout/string/slugify');

var _slugify2 = _interopRequireDefault(_slugify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * ThemeKit Docs App Firebase Store.
 * @extends {FirebaseStore}
 */

var Store = function (_FirebaseStore) {
	_inherits(Store, _FirebaseStore);

	/**
  * Constructor
  */

	function Store() {
		_classCallCheck(this, Store);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));
	}

	/*eslint spaced-comment:0*/
	//////////////
	// PACKAGES //
	//////////////

	/**
  * Slugify version
  * @param  {String} version The version i.e. 0.1.0
  * @return {String}         The slugified version
  */

	_createClass(Store, [{
		key: 'version',
		value: function version(_version) {
			if (_version === undefined) {
				throw new Error('The version is required');
			}
			return (0, _slugify2.default)(_version);
		}

		/**
   * Get a Firebase reference for package IDs, by package name
   * @param  {String} packageName 	The package name
   * @return {Firebase}             	A Firebase reference
   */

	}, {
		key: 'getRefPackageId',
		value: function getRefPackageId(packageName) {
			return this.getRef('package_id/' + packageName);
		}

		/**
   * Get a Firebase reference for package ID data
   * @param  {String} packageId 	The package ID
   * @return {Firebase}           A Firebase reference
   */

	}, {
		key: 'getRefPackageIdData',
		value: function getRefPackageIdData(packageId) {
			return this.getRef('package_id_data/' + packageId);
		}

		/**
   * Get a Firebase reference for package version IDs, by package ID and version
   * @param  {String} packageId 	The package ID
   * @param  {String} version   	The package version (optional)
   * @return {Firebase}           A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionId',
		value: function getRefPackageVersionId(packageId, version) {
			var ref = this.getRef('package_version_id/' + packageId);
			if (version) {
				return ref.child(this.version(version));
			}
			return ref;
		}

		/**
   * Get a Firebase reference for package version ID data
   * @param  {String} packageVersionId 	The package version ID data
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionIdData',
		value: function getRefPackageVersionIdData(packageVersionId) {
			return this.getRef('package_version_id_data/' + packageVersionId);
		}

		/**
   * Get a Firebase reference to package version description data
   * @param  {String} packageVersionId 	The package version ID
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionDescriptionData',
		value: function getRefPackageVersionDescriptionData(packageVersionId) {
			return this.getRef('package_version_description_data/' + packageVersionId);
		}

		/**
   * Get a Firebase reference for package version IDs with description data, by package ID
   * @param  {String} packageId        	The package ID
   * @param  {String} packageVersionId 	The package version ID (optional)
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageDescription',
		value: function getRefPackageDescription(packageId, packageVersionId) {
			var ref = this.getRef('package_description/' + packageId);
			if (packageVersionId) {
				return ref.child(packageVersionId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference to package version readme data
   * @param  {String} packageVersionId 	The package version ID
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionReadmeData',
		value: function getRefPackageVersionReadmeData(packageVersionId) {
			return this.getRef('package_version_readme_data/' + packageVersionId);
		}

		/**
   * Get a Firebase reference for package version IDs with readme data, by package ID
   * @param  {String} packageId        	The package ID
   * @param  {String} packageVersionId 	The package version ID (optional)
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageReadme',
		value: function getRefPackageReadme(packageId, packageVersionId) {
			var ref = this.getRef('package_readme/' + packageId);
			if (packageVersionId) {
				return ref.child(packageVersionId);
			}
			return ref;
		}

		/**
   * Fetch a package ID by package name
   * @param  {String} packageName 	The package name
   * @return {Promise}             	A Promise which resolves the package ID
   */

	}, {
		key: 'getPackageId',
		value: function getPackageId(packageName) {
			return this.get(this.getRefPackageId(packageName)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch a package ID data
   * @param  {String} packageId 	The package ID
   * @return {Promise}           	A Promise
   */

	}, {
		key: 'getPackageIdData',
		value: function getPackageIdData(packageId) {
			return this.get(this.getRefPackageIdData(packageId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a package ID for package name
   * @param  {String} packageName 	The package name
   * @return {Promise} 				A Promise which resolves the package ID
   */

	}, {
		key: 'setPackageId',
		value: function setPackageId(packageName) {
			var ref = this.getRefPackageId(packageName);
			var packageId = ref.push().key();
			var data = {
				packageName: packageName
			};
			return Promise.all([
			// Package ID
			this.set(ref, packageId),
			// Package ID data
			this.set(this.getRefPackageIdData(packageId), data)]).then(function () {
				return packageId;
			});
		}

		/**
   * Remove a package ID
   * @param  {String} packageId 	The package ID
   * @return {Promise}           	A Promise
   */

	}, {
		key: 'removePackageId',
		value: function removePackageId(packageId) {
			var _this2 = this;

			return this.getPackageIdData(packageId).then(function (data) {
				return Promise.all([
				// Package ID
				_this2.remove(_this2.getRefPackageId(data.packageName)),
				// Package ID data
				_this2.remove(_this2.getRefPackageIdData(packageId))]);
			});
		}

		/**
   * Fetch a package version ID, by package ID and version
   * @param  {String} packageId 	The package ID
   * @param  {String} version   	The version
   * @return {Promise}           	A Promise
   */

	}, {
		key: 'getPackageVersionId',
		value: function getPackageVersionId(packageId, version) {
			return this.get(this.getRefPackageVersionId(packageId, version)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch a package version ID data
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getPackageVersionIdData',
		value: function getPackageVersionIdData(packageVersionId) {
			return this.get(this.getRefPackageVersionIdData(packageVersionId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a package version ID, by package ID and version
   * @param {String} packageId The package ID
   * @param {String} version   The version
   */

	}, {
		key: 'setPackageVersionId',
		value: function setPackageVersionId(packageId, version) {
			var ref = this.getRefPackageVersionId(packageId, version);
			var packageVersionId = ref.push().key();
			var data = {
				packageId: packageId,
				version: version
			};
			return Promise.all([
			// Package version ID
			this.set(ref, packageVersionId),
			// Package version ID data
			this.set(this.getRefPackageVersionIdData(packageVersionId), data)]).then(function () {
				return packageVersionId;
			});
		}

		/**
   * Remove a package version ID
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'removePackageVersionId',
		value: function removePackageVersionId(packageVersionId) {
			var _this3 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				return Promise.all([
				// Package version ID
				_this3.remove(_this3.getRefPackageVersionId(data.packageId, data.version)),
				// Package version ID data
				_this3.remove(_this3.getRefPackageVersionIdData(packageVersionId))])
				// Maybe remove package ID
				.then(function () {
					// Fetch package ID versions
					return _this3.get(_this3.getRefPackageVersionId(data.packageId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove package ID
							return _this3.removePackageId(data.packageId);
						}
					});
				});
			});
		}

		/**
   * Fetch all package version IDs for a package ID
   * @param  {String} packageId 		The package ID
   * @return {Promise}           		A Promise
   */

	}, {
		key: 'getPackageVersionIds',
		value: function getPackageVersionIds(packageId) {
			var _this4 = this;

			return this.get(this.getRefPackageVersionId(packageId)).then(function (snapshot) {
				return _this4.snapshotArray(snapshot);
			});
		}

		/**
   * Fetch the latest package version ID for a package ID
   * @param  {String} packageId 		The package ID
   * @return {Promise}           		A Promise
   */

	}, {
		key: 'getLatestPackageVersionId',
		value: function getLatestPackageVersionId(packageId) {
			return this.getPackageVersionIds(packageId).then(function (ids) {
				return ids.pop();
			});
		}

		/**
   * Create or update a package version
   * @param {String} 	packageName 	The package name
   * @param {String} 	version     	The version
   */

	}, {
		key: 'setPackageVersion',
		value: function setPackageVersion(packageName, version) {
			var _this5 = this;

			var description = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			var readme = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				if (!packageId) {
					return _this5.setPackageId(packageName);
				}
				return packageId;
			})
			// Package version ID
			.then(function (packageId) {
				return _this5.getPackageVersionId(packageId, version).then(function (packageVersionId) {
					if (!packageVersionId) {
						return _this5.setPackageVersionId(packageId, version);
					}
					return packageVersionId;
				});
			})
			// Package version description
			.then(function (packageVersionId) {
				return _this5.setPackageVersionDescription(packageVersionId, description).then(function () {
					return packageVersionId;
				});
			})
			// Package version readme
			.then(function (packageVersionId) {
				return _this5.setPackageVersionReadme(packageVersionId, readme).then(function () {
					return packageVersionId;
				});
			});
		}

		/**
   * Remove a package version
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise} 					A Promise
   */

	}, {
		key: 'removePackageVersion',
		value: function removePackageVersion(packageVersionId) {
			return Promise.all([
			// Package version description
			this.setPackageVersionDescription(packageVersionId, null),
			// Package version readme
			this.setPackageVersionReadme(packageVersionId, null),
			// Package version components
			this.removePackageVersionComponents(packageVersionId),
			// Package pages
			this.removePackageVersionPages(packageVersionId),
			// Package version ID
			this.removePackageVersionId(packageVersionId)]);
		}

		/**
   * Create, update or remove a package version description data
   * @param {String} packageVersionId 	The package version ID
   * @param {String} description      	The description data (null to remove)
   */

	}, {
		key: 'setPackageVersionDescription',
		value: function setPackageVersionDescription(packageVersionId, description) {
			var _this6 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				// Package version description data
				var descriptionRef = _this6.getRefPackageVersionDescriptionData(packageVersionId);
				// Package version ID with description data, by package ID
				var packageDescriptionRef = _this6.getRefPackageDescription(data.packageId, packageVersionId);

				// create or update
				if (description) {
					return Promise.all([
					// Package version description data
					_this6.set(descriptionRef, description),
					// Package version ID with description data, by package ID
					_this6.set(packageDescriptionRef, true)]);
				}
				// remove
				return Promise.all([
				// Package version description data
				_this6.remove(descriptionRef),
				// Package version ID with description data, by package ID
				_this6.remove(packageDescriptionRef)]);
			});
		}

		/**
   * Fetch a package version description
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getPackageVersionDescription',
		value: function getPackageVersionDescription(packageVersionId) {
			var _this7 = this;

			// Package version description data
			return this.get(this.getRefPackageVersionDescriptionData(packageVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret = function () {
						var data = {
							data: snapshot.val()
						};
						// Package version ID data
						return {
							v: _this7.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
								return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
							})
							// Package ID data
							.then(function (data) {
								return _this7.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
									return (0, _merge2.default)(data, { packageIdData: packageIdData });
								});
							})
						};
					}();

					if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
				}
				return null;
			});
		}

		/**
   * Fetch the latest package description
   * @param  {String} packageId 	The package ID
   * @return {Promise}           	A Promise
   */

	}, {
		key: 'getLatestPackageDescription',
		value: function getLatestPackageDescription(packageId) {
			var _this8 = this;

			return this.get(this.getRefPackageDescription(packageId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestPackageVersionIdWithDescription = Object.keys(snapshot.val()).pop();
					return _this8.getPackageVersionDescription(latestPackageVersionIdWithDescription);
				}
			});
		}

		/**
   * Create, update or remove a package version readme data
   * @param {String} packageVersionId 	The package version ID
   * @param {String} readme      			The readme data (null to remove)
   */

	}, {
		key: 'setPackageVersionReadme',
		value: function setPackageVersionReadme(packageVersionId, readme) {
			var _this9 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				// Package version readme data
				var readmeRef = _this9.getRefPackageVersionReadmeData(packageVersionId);
				// Package version ID with readme data, by package ID
				var packageReadmeRef = _this9.getRefPackageReadme(data.packageId, packageVersionId);

				// create or update
				if (readme) {
					return Promise.all([
					// Package version readme data
					_this9.set(readmeRef, readme),
					// Package version ID with readme data, by package ID
					_this9.set(packageReadmeRef, true)]);
				}
				// remove
				return Promise.all([
				// Package version readme data
				_this9.remove(readmeRef),
				// Package version ID with readme data, by package ID
				_this9.remove(packageReadmeRef)]);
			});
		}

		/**
   * Fetch a package version readme
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getPackageVersionReadme',
		value: function getPackageVersionReadme(packageVersionId) {
			var _this10 = this;

			// Package version readme data
			return this.get(this.getRefPackageVersionReadmeData(packageVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret2 = function () {
						var data = {
							data: snapshot.val()
						};
						// Package version ID data
						return {
							v: _this10.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
								return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
							})
							// Package ID data
							.then(function (data) {
								return _this10.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
									return (0, _merge2.default)(data, { packageIdData: packageIdData });
								});
							})
						};
					}();

					if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
				}
				return null;
			});
		}

		/**
   * Fetch the latest package readme
   * @param  {String} packageId 	The package ID
   * @return {Promise}           	A Promise
   */

	}, {
		key: 'getLatestPackageReadme',
		value: function getLatestPackageReadme(packageId) {
			var _this11 = this;

			return this.get(this.getRefPackageReadme(packageId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestPackageVersionIdWithReadme = Object.keys(snapshot.val()).pop();
					return _this11.getPackageVersionReadme(latestPackageVersionIdWithReadme);
				}
			});
		}

		/**
   * Fetch all packages with latest version
   * @return {Promise} A Promise which resolves a packages Array.
   */

	}, {
		key: 'getPackages',
		value: function getPackages() {
			var _this12 = this;

			return this.get('package_id').then(function (snapshot) {
				var packageIDs = _this12.snapshotArray(snapshot);
				// fetch latest versions IDs
				return Promise.all(packageIDs.map(function (packageId) {
					return _this12.getLatestPackageVersionId(packageId);
				}))
				// fetch packages
				.then(function (latestPackageIDs) {
					return Promise.all(latestPackageIDs.map(function (packageVersionId) {
						return _this12.getPackageVersion(packageVersionId);
					}));
				});
			});
		}

		/**
   * Fetch a package version
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise} 					A Promise which resolves a package Object
   */

	}, {
		key: 'getPackageVersion',
		value: function getPackageVersion(packageVersionId) {
			var _this13 = this;

			// Package version ID data
			return this.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
				return { packageVersionIdData: packageVersionIdData };
			})
			// Package ID data
			.then(function (data) {
				return _this13.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
					return (0, _merge2.default)(data, { packageIdData: packageIdData });
				});
			})
			// Package version component count
			.then(function (data) {
				return _this13.getPackageVersionComponentCount(packageVersionId).then(function (count) {
					return data.components = count;
				}).then(function () {
					return data;
				});
			})
			// Package description
			.then(function (data) {
				// Package version description
				return _this13.getPackageVersionDescription(packageVersionId).then(function (description) {
					if (!description) {
						return _this13.getLatestPackageDescription(data.packageIdData.objectID);
					}
					return description;
				}).then(function (description) {
					return (0, _merge2.default)(data, { description: description });
				});
			})
			// Package readme
			.then(function (data) {
				// Package version readme
				return _this13.getPackageVersionReadme(packageVersionId).then(function (readme) {
					if (!readme) {
						return _this13.getLatestPackageReadme(data.packageIdData.objectID);
					}
					return readme;
				}).then(function (readme) {
					return (0, _merge2.default)(data, { readme: readme });
				});
			});
		}

		/**
   * Fetch a package version by package name and version
   * @param  {String} packageName 	The package name
   * @param  {String} version     	The version
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'getPackageVersionByName',
		value: function getPackageVersionByName(packageName, version) {
			var _this14 = this;

			return this.getPackageId(packageName).then(function (packageId) {
				return _this14.getPackageVersionId(packageId, version);
			}).then(function (packageVersionId) {
				return _this14.getPackageVersion(packageVersionId);
			});
		}

		/**
   * Fetch all versions for a package ID
   * @param  {String} packageId 	The package ID
   * @return {Promise}           	A Promise which resolves a packages Array
   */

	}, {
		key: 'getPackageVersions',
		value: function getPackageVersions(packageId) {
			var _this15 = this;

			return this.getPackageVersionIds(packageId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this15.getPackageVersionIdData(id);
				}));
			});
		}

		/**
   * Listen for child_added events on package IDs
   * @param  {Function} cb    The complete callback
   * @param  {Function} error The error callback
   */

	}, {
		key: 'onPackageAdded',
		value: function onPackageAdded(cb, error) {
			var _this16 = this;

			this.listen('package_id', 'child_added', function (snapshot) {
				var packageId = snapshot.val();

				// Latest package version ID
				_this16.getLatestPackageVersionId(packageId)
				// Package version
				.then(function (latestPackageVersionId) {
					return _this16.getPackageVersion(latestPackageVersionId);
				})
				// Complete callback
				.then(function (data) {
					return cb(data);
				});
			}, error);
		}
	}, {
		key: 'onPackageVersionRemoved',
		value: function onPackageVersionRemoved(cb, error) {
			this.listen('package_version_id_data', 'child_removed', function (snapshot) {
				return cb(snapshot.key());
			}, error);
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

	}, {
		key: 'getRefComponentId',
		value: function getRefComponentId(packageId, componentName) {
			return this.getRef('component_id/' + packageId + '/' + componentName);
		}

		/**
   * Get a Firebase reference for component ID data
   * @param  {String} componentId 	The component ID
   * @return {Firebase}             	A Firebase reference
   */

	}, {
		key: 'getRefComponentIdData',
		value: function getRefComponentIdData(componentId) {
			return this.getRef('component_id_data/' + componentId);
		}

		/**
   * Get a Firebase reference for component version IDs, by package version ID and component ID
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} componentId      	The component ID
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionId',
		value: function getRefComponentVersionId(packageVersionId, componentId) {
			var ref = this.getRef('component_version_id/' + packageVersionId);
			if (componentId) {
				return ref.child(componentId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference for component version ID data
   * @param  {String} componentVersionId 		The component version ID
   * @return {Firebase}                    	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionIdData',
		value: function getRefComponentVersionIdData(componentVersionId) {
			return this.getRef('component_version_id_data/' + componentVersionId);
		}

		/**
   * Get a Firebase reference for component version data
   * @param  {String} componentVersionId 		The component version ID
   * @return {Firebase}                    	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionData',
		value: function getRefComponentVersionData(componentVersionId) {
			return this.getRef('component_version_data/' + componentVersionId);
		}

		/**
   * Get a Firebase reference to component version description data
   * @param  {String} componentVersionId 	The component version ID
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionDescriptionData',
		value: function getRefComponentVersionDescriptionData(componentVersionId) {
			return this.getRef('component_version_description_data/' + componentVersionId);
		}

		/**
   * Get a Firebase reference for component version IDs with description data, by component ID
   * @param  {String} componentId        	The component ID
   * @param  {String} componentVersionId 	The component version ID (optional)
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefComponentDescription',
		value: function getRefComponentDescription(componentId, componentVersionId) {
			var ref = this.getRef('component_description/' + componentId);
			if (componentVersionId) {
				return ref.child(componentVersionId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference for component version IDs by component ID
   * @param  {String} componentId        		The component ID
   * @param  {String} componentVersionId 		The component version ID (optional)
   * @return {Firebase}                    	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersion',
		value: function getRefComponentVersion(componentId, componentVersionId) {
			var ref = this.getRef('component_version/' + componentId);
			if (componentVersionId) {
				return ref.child(componentVersionId);
			}
			return ref;
		}

		/**
   * Fetch a component ID by package ID and component name
   * @param  {String} packageId     	The package ID
   * @param  {String} componentName 	The component name
   * @return {Promise}               	A Promise
   */

	}, {
		key: 'getComponentId',
		value: function getComponentId(packageId, componentName) {
			return this.get(this.getRefComponentId(packageId, componentName)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch a component ID data
   * @param  {String} componentId 	The component ID
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'getComponentIdData',
		value: function getComponentIdData(componentId) {
			return this.get(this.getRefComponentIdData(componentId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a component ID, by package ID and component name
   * @param {String} packageId     	The package ID
   * @param {String} componentName 	The component name
   */

	}, {
		key: 'setComponentId',
		value: function setComponentId(packageId, componentName) {
			var ref = this.getRefComponentId(packageId, componentName);
			var componentId = ref.push().key();
			var data = {
				packageId: packageId,
				componentName: componentName
			};
			return Promise.all([
			// Component ID
			this.set(ref, componentId),
			// Component ID data
			this.set(this.getRefComponentIdData(componentId), data)]).then(function () {
				return componentId;
			});
		}

		/**
   * Remove a component ID
   * @param  {String} componentId 	The component ID
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'removeComponentId',
		value: function removeComponentId(componentId) {
			var _this17 = this;

			return this.getComponentIdData(componentId).then(function (data) {
				return Promise.all([
				// Component ID
				_this17.remove(_this17.getRefComponentId(data.packageId, data.componentName)),
				// Component ID data
				_this17.remove(_this17.getRefComponentIdData(componentId))]);
			});
		}

		/**
   * Fetch a component version ID
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} componentId      	The component ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getComponentVersionId',
		value: function getComponentVersionId(packageVersionId, componentId) {
			return this.get(this.getRefComponentVersionId(packageVersionId, componentId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Remove a component version ID data
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                    A Promise
   */

	}, {
		key: 'getComponentVersionIdData',
		value: function getComponentVersionIdData(componentVersionId) {
			return this.get(this.getRefComponentVersionIdData(componentVersionId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a component version ID, by package version ID and component ID
   * @param {String} packageVersionId 	The package version ID
   * @param {String} componentId      	The component ID
   */

	}, {
		key: 'setComponentVersionId',
		value: function setComponentVersionId(packageVersionId, componentId) {
			var ref = this.getRefComponentVersionId(packageVersionId, componentId);
			var componentVersionId = ref.push().key();
			var data = {
				packageVersionId: packageVersionId,
				componentId: componentId
			};
			return Promise.all([
			// Component version ID
			this.set(ref, componentVersionId),
			// Component version ID data
			this.set(this.getRefComponentVersionIdData(componentVersionId), data),
			// Component version IDs by component ID (Component <> Component version)
			this.set(this.getRefComponentVersion(componentId, componentVersionId), true)]).then(function () {
				return componentVersionId;
			});
		}

		/**
   * Remove a component version ID
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                    A Promise
   */

	}, {
		key: 'removeComponentVersionId',
		value: function removeComponentVersionId(componentVersionId) {
			var _this18 = this;

			return this.getComponentVersionIdData(componentVersionId).then(function (data) {
				return Promise.all([
				// Component version ID
				_this18.remove(_this18.getRefComponentVersionId(data.packageVersionId, data.componentId)),
				// Component version ID data
				_this18.remove(_this18.getRefComponentVersionIdData(componentVersionId)),
				// Component version IDs by component ID (Component <> Component version)
				_this18.remove(_this18.getRefComponentVersion(data.componentId, componentVersionId))])
				// Maybe remove component ID
				.then(function () {
					// Component <> Component version
					return _this18.get(_this18.getRefComponentVersion(data.componentId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove component ID
							return _this18.removeComponentId(data.componentId);
						}
					});
				});
			});
		}

		/**
   * Create or update a component version
   * @param {String} packageVersionId The package version ID
   * @param {String} componentName    The component name
   * @param {Object} data             The component data
   */

	}, {
		key: 'setComponentVersion',
		value: function setComponentVersion(packageVersionId, componentName, data) {
			var _this19 = this;

			var description = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			// Package version ID data
			return this.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
				var packageId = packageVersionIdData.packageId;
				// Component ID

				return _this19.getComponentId(packageId, componentName).then(function (componentId) {
					if (!componentId) {
						return _this19.setComponentId(packageId, componentName);
					}
					return componentId;
				});
			})
			// Component version ID
			.then(function (componentId) {
				return _this19.getComponentVersionId(packageVersionId, componentId).then(function (componentVersionId) {
					if (!componentVersionId) {
						return _this19.setComponentVersionId(packageVersionId, componentId);
					}
					return componentVersionId;
				});
			})
			// Component version data
			.then(function (componentVersionId) {
				return _this19.set(_this19.getRefComponentVersionData(componentVersionId), data).then(function () {
					return componentVersionId;
				});
			})
			// Package version description
			.then(function (componentVersionId) {
				return _this19.setComponentVersionDescription(componentVersionId, description).then(function () {
					return componentVersionId;
				});
			});
		}

		/**
   * Fetch a component version by component version ID.
   * @param  {Firebase} componentVersionId 	The component version ID.
   * @return {Promise} 						A Promise which resolves an Array of indexes.
   */

	}, {
		key: 'getComponentVersionById',
		value: function getComponentVersionById(componentVersionId) {
			var _this20 = this;

			return Promise.all([
			// Component version data
			this.get(this.getRefComponentVersionData(componentVersionId)).then(function (snapshot) {
				return snapshot.val();
			}),
			// Component version ID data
			this.getComponentVersionIdData(componentVersionId),
			// Component version props
			this.getComponentVersionProps(componentVersionId)]).then(function (_ref) {
				var _ref2 = _slicedToArray(_ref, 3);

				var data = _ref2[0];
				var componentVersionIdData = _ref2[1];
				var props = _ref2[2];
				return (0, _merge2.default)(data, { componentVersionIdData: componentVersionIdData, props: props });
			}).then(function (data) {
				return Promise.all([
				// Component ID data
				_this20.getComponentIdData(data.componentVersionIdData.componentId),
				// Package version ID data
				_this20.getPackageVersionIdData(data.componentVersionIdData.packageVersionId)]).then(function (_ref3) {
					var _ref4 = _slicedToArray(_ref3, 2);

					var componentIdData = _ref4[0];
					var packageVersionIdData = _ref4[1];
					return (0, _merge2.default)(data, { componentIdData: componentIdData, packageVersionIdData: packageVersionIdData });
				});
			}).then(function (data) {
				return Promise.all([
				// Package ID data
				_this20.getPackageIdData(data.packageVersionIdData.packageId),
				// Component version description
				_this20.getComponentVersionDescription(componentVersionId).then(function (description) {
					// Component description
					if (!description) {
						return _this20.getLatestComponentDescription(data.componentIdData.objectID);
					}
					return description;
				}),
				// Component demos
				_this20.getComponentDemos(data.componentIdData.objectID)]).then(function (_ref5) {
					var _ref6 = _slicedToArray(_ref5, 3);

					var packageIdData = _ref6[0];
					var description = _ref6[1];
					var demos = _ref6[2];
					return (0, _merge2.default)(data, { packageIdData: packageIdData, description: description, demos: demos });
				});
			});
		}

		/**
   * Fetch a component version by component name, package name and version
   * @param  {String} componentName 	The component name
   * @param  {String} packageName   	The package name
   * @param  {String} version       	The version
   * @return {Promise}               	A Promise
   */

	}, {
		key: 'getComponentVersionByName',
		value: function getComponentVersionByName(componentName, packageName, version) {
			var _this21 = this;

			var packageId = undefined;

			// Package ID
			return this.getPackageId(packageName).then(function (pkgId) {
				packageId = pkgId;

				// Package Version ID
				return _this21.getPackageVersionId(packageId, version);
			}).then(function (packageVersionId) {
				// Component ID
				return _this21.getComponentId(packageId, componentName).then(function (componentId) {
					// Component version ID
					return _this21.getComponentVersionId(packageVersionId, componentId);
				})
				// Component version by component version ID
				.then(function (componentVersionId) {
					return _this21.getComponentVersionById(componentVersionId);
				});
			});
		}

		/**
   * Removes a component from Firebase.
   * @param  {String} componentVersionId 	The component version ID.
   * @return {Promise} 					A Promise.
   */

	}, {
		key: 'removeComponentVersion',
		value: function removeComponentVersion(componentVersionId) {
			return Promise.all([
			// Component version description
			this.setComponentVersionDescription(componentVersionId, null),
			// Component version props
			this.removeComponentVersionProps(componentVersionId),
			// Component version ID
			this.removeComponentVersionId(componentVersionId),
			// Component version data
			this.remove(this.getRefComponentVersionData(componentVersionId))]);
		}

		/**
   * Create, update or remove a component version description data
   * @param {String} componentVersionId 	The component version ID
   * @param {String} description      	The description data (null to remove)
   */

	}, {
		key: 'setComponentVersionDescription',
		value: function setComponentVersionDescription(componentVersionId, description) {
			var _this22 = this;

			return this.getComponentVersionIdData(componentVersionId).then(function (data) {
				// Component version description data
				var descriptionRef = _this22.getRefComponentVersionDescriptionData(componentVersionId);
				// Component version ID with description data, by component ID
				var componentDescriptionRef = _this22.getRefComponentDescription(data.componentId, componentVersionId);

				// create or update
				if (description) {
					return Promise.all([
					// Component version description data
					_this22.set(descriptionRef, description),
					// Component version ID with description data, by component ID
					_this22.set(componentDescriptionRef, true)]);
				}
				// remove
				return Promise.all([
				// Component version description data
				_this22.remove(descriptionRef),
				// Component version ID with description data, by component ID
				_this22.remove(componentDescriptionRef)]);
			});
		}

		/**
   * Fetch a component version description
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getComponentVersionDescription',
		value: function getComponentVersionDescription(componentVersionId) {
			var _this23 = this;

			// Component version description data
			return this.get(this.getRefComponentVersionDescriptionData(componentVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret3 = function () {
						var data = {
							data: snapshot.val()
						};
						// Component version ID data
						return {
							v: _this23.getComponentVersionIdData(componentVersionId).then(function (componentVersionIdData) {
								return (0, _merge2.default)(data, { componentVersionIdData: componentVersionIdData });
							})
							// Component ID data
							.then(function (data) {
								return _this23.getComponentIdData(data.componentVersionIdData.componentId).then(function (componentIdData) {
									return (0, _merge2.default)(data, { componentIdData: componentIdData });
								});
							})
							// Package version ID data
							.then(function (data) {
								return _this23.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then(function (packageVersionIdData) {
									return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
								});
							})
							// Package ID data
							.then(function (data) {
								return _this23.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
									return (0, _merge2.default)(data, { packageIdData: packageIdData });
								});
							})
						};
					}();

					if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
				}
				return null;
			});
		}

		/**
   * Fetch the latest component description
   * @param  {String} componentId 	The component ID
   * @return {Promise}           		A Promise
   */

	}, {
		key: 'getLatestComponentDescription',
		value: function getLatestComponentDescription(componentId) {
			var _this24 = this;

			return this.get(this.getRefComponentDescription(componentId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestComponentVersionIdWithDescription = Object.keys(snapshot.val()).pop();
					return _this24.getComponentVersionDescription(latestComponentVersionIdWithDescription);
				}
			});
		}

		/**
   * Get the component versions IDs for a package version from Firebase.
   * @param  {String} packageVersionId 	The package version ID.
   * @return {Promise} 					A Promise which resolves an Array.
   */

	}, {
		key: 'getPackageVersionComponentIds',
		value: function getPackageVersionComponentIds(packageVersionId) {
			var _this25 = this;

			return this.get(this.getRefComponentVersionId(packageVersionId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				return _this25.snapshotArray(snapshot);
			});
		}

		/**
   * Get the number of components for a package version.
   * @param  {String} packageVersionId 	The package version ID.
   * @return {Promise} 					A Promise which resolves a Number.
   */

	}, {
		key: 'getPackageVersionComponentCount',
		value: function getPackageVersionComponentCount(packageVersionId) {
			return this.getPackageVersionComponentIds(packageVersionId).then(function (ids) {
				return ids.length;
			});
		}

		/**
   * Get the components for a package version.
   * @param  {String} packageVersionId	The package version ID.
   * @return {Promise} 					A Promise which resolves the components Array.
   */

	}, {
		key: 'getPackageVersionComponents',
		value: function getPackageVersionComponents(packageVersionId) {
			var _this26 = this;

			return this.getPackageVersionComponentIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this26.getComponentVersionById(id);
				}));
			});
		}

		/**
   * Remove the components belonging to a package version.
   * @param  {String} packageVersionId	The package version ID.
   * @return {Promise} 					A Promise.
   */

	}, {
		key: 'removePackageVersionComponents',
		value: function removePackageVersionComponents(packageVersionId) {
			var _this27 = this;

			return this.getPackageVersionComponentIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this27.removeComponentVersion(id);
				}));
			});
		}

		/**
   * Listen for child_added events on package version components
   * @param  {String}   packageVersionId The package version ID
   * @param  {Function} cb               The complete callback
   * @param  {Function} error            The error callback
   */

	}, {
		key: 'onPackageVersionComponentAdded',
		value: function onPackageVersionComponentAdded(packageVersionId, cb, error) {
			var _this28 = this;

			this.listen(this.getRefComponentVersionId(packageVersionId), 'child_added', function (snapshot) {
				_this28.getComponentVersionById(snapshot.val()).then(function (data) {
					return cb(data);
				});
			});
		}

		/**
   * Remove child_added listener on package version components
   * @param  {String} packageVersionId The package version ID
   */

	}, {
		key: 'offPackageVersionComponentAdded',
		value: function offPackageVersionComponentAdded(packageVersionId) {
			this.getRefComponentVersionId(packageVersionId).off('child_added');
		}

		/**
   * Listen for child_removed events on component version IDs
   * @param  {Function} cb    The complete callback
   * @param  {Function} error The error callback
   */

	}, {
		key: 'onComponentVersionRemoved',
		value: function onComponentVersionRemoved(cb, error) {
			this.listen('component_version_id_data', 'child_removed', function (snapshot) {
				return cb(snapshot.key());
			}, error);
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

	}, {
		key: 'getRefComponentPropId',
		value: function getRefComponentPropId(componentId, propName) {
			return this.getRef('component_prop_id/' + componentId + '/' + propName);
		}

		/**
   * Get a Firebase reference for component prop ID data
   * @param  {String} propId 		The component prop ID
   * @return {Firebase}        	A Firebase reference
   */

	}, {
		key: 'getRefComponentPropIdData',
		value: function getRefComponentPropIdData(propId) {
			return this.getRef('component_prop_id_data/' + propId);
		}

		/**
   * Get a Firebase reference for component version prop IDs, by component version ID and prop ID
   * @param  {String} componentVersionId 		The component version ID
   * @param  {String} propId             		The prop ID
   * @return {Firebase}                    	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionPropId',
		value: function getRefComponentVersionPropId(componentVersionId, propId) {
			var ref = this.getRef('component_version_prop_id/' + componentVersionId);
			if (propId) {
				return ref.child(propId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference for component version prop IDs, by prop ID
   * Component prop <> Component version prop relationship
   * 
   * @param  {String} propId                 		The component prop ID
   * @param  {String} componentVersionPropId 		The component version prop ID
   * @return {Firebase}                        	A Firebase reference
   */

	}, {
		key: 'getRefComponentProp',
		value: function getRefComponentProp(propId, componentVersionPropId) {
			var ref = this.getRef('component_prop/' + propId);
			if (componentVersionPropId) {
				return ref.child(componentVersionPropId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference for component version prop ID data
   * @param  {String} componentVersionPropId 		The component version prop ID
   * @return {Firebase}                        	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionPropIdData',
		value: function getRefComponentVersionPropIdData(componentVersionPropId) {
			return this.getRef('component_version_prop_id_data/' + componentVersionPropId);
		}

		/**
   * Get a Firebase reference for component version prop data
   * @param  {String} componentVersionPropId 		The component version prop ID
   * @return {Firebase}                        	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionPropData',
		value: function getRefComponentVersionPropData(componentVersionPropId) {
			return this.getRef('component_version_prop_data/' + componentVersionPropId);
		}

		/**
   * Get a Firebase reference for component version prop description data
   * @param  {String} componentVersionPropId 		The component version prop ID
   * @return {Firebase}                        	A Firebase reference
   */

	}, {
		key: 'getRefComponentVersionPropDescription',
		value: function getRefComponentVersionPropDescription(componentVersionPropId) {
			return this.getRef('component_version_prop_description_data/' + componentVersionPropId);
		}

		/**
   * Get a Firebase reference for component version prop IDs with description data, by prop ID
   * @param  {String} propId 		The prop ID
   * @return {Firebase}        	A Firebase reference
   */

	}, {
		key: 'getRefComponentPropDescription',
		value: function getRefComponentPropDescription(propId) {
			return this.getRef('component_prop_description/' + propId);
		}

		/**
   * Fetch the component prop ID by component ID and prop name
   * @param  {String} componentId 	The component ID
   * @param  {String} propName    	The prop name
   * @return {Promise}             	A Promise which resolves the component prop ID value
   */

	}, {
		key: 'getComponentPropId',
		value: function getComponentPropId(componentId, propName) {
			return this.get(this.getRefComponentPropId(componentId, propName)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch the component prop ID data
   * @param  {String} propId 		The component prop ID
   * @return {Promise}        	A Promise
   */

	}, {
		key: 'getComponentPropIdData',
		value: function getComponentPropIdData(propId) {
			return this.get(this.getRefComponentPropIdData(propId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a component prop ID by component ID and prop name
   * @param {String} componentId 		The component ID
   * @param {String} propName    		The prop name
   * @return {Promise} 				A Promise which resolves the component prop ID
   */

	}, {
		key: 'setComponentPropId',
		value: function setComponentPropId(componentId, propName) {
			var ref = this.getRefComponentPropId(componentId, propName);
			var componentPropId = ref.push().key();
			var data = {
				componentId: componentId,
				propName: propName
			};
			return Promise.all([
			// Component prop ID
			this.set(ref, componentPropId),
			// Component prop ID data
			this.set(this.getRefComponentPropIdData(componentPropId), data)]).then(function () {
				return componentPropId;
			});
		}

		/**
   * Remove component prop ID
   * @param  {String} propId 	The component prop ID
   * @return {Promise}        A Promise
   */

	}, {
		key: 'removeComponentPropId',
		value: function removeComponentPropId(propId) {
			var _this29 = this;

			// Component prop ID data
			return this.getComponentPropIdData(propId).then(function (data) {
				return Promise.all([
				// Remove component prop ID
				_this29.remove(_this29.getRefComponentPropId(data.componentId, data.propName)),
				// Remove component prop ID data
				_this29.remove(_this29.getRefComponentPropIdData(propId))]);
			});
		}

		/**
   * Fetch the component version prop ID data
   * @param  {String} componentVersionPropId 		The component version prop ID
   * @return {Promise}                        	A Promise which resolves the data
   */

	}, {
		key: 'getComponentVersionPropIdData',
		value: function getComponentVersionPropIdData(componentVersionPropId) {
			return this.get(this.getRefComponentVersionPropIdData(componentVersionPropId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch the component version prop ID by component version ID and prop ID
   * @param  {String} componentVersionId 		The component version ID
   * @param  {String} propId             		The prop ID
   * @return {Promise}                    	A Promise which resolves the component version prop ID
   */

	}, {
		key: 'getComponentVersionPropId',
		value: function getComponentVersionPropId(componentVersionId, propId) {
			return this.get(this.getRefComponentVersionPropId(componentVersionId, propId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a component version prop ID by component version ID and prop ID
   * @param {String} componentVersionId 		The component version ID
   * @param {String} propId             		The prop ID
   * @return {Promise} 						A Promise which resolves the component version prop ID
   */

	}, {
		key: 'setComponentVersionPropId',
		value: function setComponentVersionPropId(componentVersionId, propId) {
			var ref = this.getRefComponentVersionPropId(componentVersionId, propId);
			var componentVersionPropId = ref.push().key();
			var data = {
				componentVersionId: componentVersionId,
				propId: propId
			};
			return Promise.all([
			// Component version prop ID
			this.set(ref, componentVersionPropId).then(function () {
				return componentVersionPropId;
			}),
			// Component version prop ID data
			this.set(this.getRefComponentVersionPropIdData(componentVersionPropId), data),
			// Component prop <> Component version prop
			this.set(this.getRefComponentProp(propId, componentVersionPropId), true)]).then(function () {
				return componentVersionPropId;
			});
		}

		/**
   * Remove a component version prop ID
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'removeComponentVersionPropId',
		value: function removeComponentVersionPropId(componentVersionPropId) {
			var _this30 = this;

			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				return Promise.all([
				// Component version prop ID
				_this30.remove(_this30.getRefComponentVersionPropId(data.componentVersionId, data.propId)),
				// Component version prop ID data
				_this30.remove(_this30.getRefComponentVersionPropIdData(componentVersionPropId)),
				// Component prop <> Component version prop
				_this30.remove(_this30.getRefComponentProp(data.propId, componentVersionPropId))])
				// Maybe remove component prop ID
				.then(function () {
					// Component version prop IDs for prop ID
					return _this30.get(_this30.getRefComponentProp(data.propId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove component prop ID
							return _this30.removeComponentPropId(data.propId);
						}
					});
				});
			});
		}

		/**
   * Fetch component version prop IDs by component version ID
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                    A Promise which resolves an Array
   */

	}, {
		key: 'getComponentVersionPropIds',
		value: function getComponentVersionPropIds(componentVersionId) {
			var _this31 = this;

			return this.get(this.getRefComponentVersionPropId(componentVersionId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				return _this31.snapshotArray(snapshot);
			});
		}

		/**
   * Fetch component version prop data
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'getComponentVersionPropData',
		value: function getComponentVersionPropData(componentVersionPropId) {
			return this.get(this.getRefComponentVersionPropData(componentVersionPropId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch the latest component version prop ID with description data
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'getLatestComponentVersionPropIdWithDescription',
		value: function getLatestComponentVersionPropIdWithDescription(componentVersionPropId) {
			var _this32 = this;

			// Component version prop ID data
			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				// Component version prop IDs with description data
				return _this32.get(_this32.getRefComponentPropDescription(data.propId)).then(function (snapshot) {
					var ids = snapshot.exists() ? Object.keys(snapshot.val()) : [];
					return ids.length ? ids.pop() : null;
				});
			});
		}

		/**
   * Fetch description data for the latest component version prop ID with description data
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'getLatestComponentPropDescription',
		value: function getLatestComponentPropDescription(componentVersionPropId) {
			var _this33 = this;

			return this.getLatestComponentVersionPropIdWithDescription(componentVersionPropId).then(function (latestComponentVersionPropId) {
				if (latestComponentVersionPropId) {
					return _this33.getComponentVersionPropDescription(latestComponentVersionPropId);
				}
				return null;
			});
		}

		/**
   * Fetch description data for component version prop ID
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'getComponentVersionPropDescription',
		value: function getComponentVersionPropDescription(componentVersionPropId) {
			var _this34 = this;

			return this.get(this.getRefComponentVersionPropDescription(componentVersionPropId)).then(function (snapshot) {
				// Component version prop description data
				if (snapshot.exists()) {
					var _ret4 = function () {
						var description = snapshot.val();

						// Component version prop ID data
						return {
							v: _this34.getComponentVersionPropIdData(componentVersionPropId).then(function (componentVersionPropIdData) {
								return {
									data: description,
									componentVersionPropIdData: componentVersionPropIdData
								};
							})
							// Component version ID data
							.then(function (data) {
								return _this34.getComponentVersionIdData(data.componentVersionPropIdData.componentVersionId).then(function (componentVersionIdData) {
									return (0, _merge2.default)(data, { componentVersionIdData: componentVersionIdData });
								});
							})
							// Package version ID data
							.then(function (data) {
								return _this34.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then(function (packageVersionIdData) {
									return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
								});
							})
						};
					}();

					if ((typeof _ret4 === 'undefined' ? 'undefined' : _typeof(_ret4)) === "object") return _ret4.v;
				}
			});
		}

		/**
   * Set or remove description data for the component version prop ID
   * @param {String} 		componentVersionPropId 	The component version prop ID
   * @param {String|null} description            	The description data (null to remove)
   */

	}, {
		key: 'setComponentVersionPropDescription',
		value: function setComponentVersionPropDescription(componentVersionPropId, description) {
			var _this35 = this;

			// Component version prop ID data
			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				// Component version prop description
				var ref = _this35.getRefComponentVersionPropDescription(componentVersionPropId);
				// Latest component version prop ID with a description
				var propRef = _this35.getRefComponentPropDescription(data.propId).child(componentVersionPropId);
				// set
				if (description) {
					return Promise.all([
					// Component version prop description
					_this35.set(ref, description),
					// Latest component version prop ID with a description
					_this35.set(propRef, true)]);
				}
				// remove
				return Promise.all([
				// Component version prop description
				_this35.remove(ref),
				// Latest component version prop ID with a description
				_this35.remove(propRef)]);
			});
		}

		/**
   * Fetch a component prop version
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'getComponentVersionProp',
		value: function getComponentVersionProp(componentVersionPropId) {
			var _this36 = this;

			// Component version prop data
			return this.getComponentVersionPropData(componentVersionPropId).then(function (data) {
				// Component version prop description data
				return _this36.getComponentVersionPropDescription(componentVersionPropId).then(function (description) {
					if (!description) {
						// Fetch the description from the latest component version prop ID with description data
						return _this36.getLatestComponentPropDescription(componentVersionPropId);
					}
					return description;
				}).then(function (description) {
					return (0, _merge2.default)(data, { description: description });
				});
			});
		}

		/**
   * Create or update a component version prop
   * @param {String} componentVersionId The component version ID
   * @param {String} propName           The prop name
   * @param {String} data               The component version prop data
   */

	}, {
		key: 'setComponentVersionProp',
		value: function setComponentVersionProp(componentVersionId, propName, data) {
			var _this37 = this;

			data.componentVersionId = componentVersionId;

			// Component ID
			return this.getComponentVersionIdData(componentVersionId).then(function (componentVersionIdData) {
				data.componentId = componentVersionIdData.componentId;
				// Component prop ID
				return _this37.getComponentPropId(data.componentId, propName).then(function (propId) {
					if (!propId) {
						return _this37.setComponentPropId(data.componentId, propName);
					}
					return propId;
				})
				// Component version prop ID
				.then(function (propId) {
					return _this37.getComponentVersionPropId(componentVersionId, propId).then(function (componentVersionPropId) {
						if (!componentVersionPropId) {
							return _this37.setComponentVersionPropId(componentVersionId, propId);
						}
						return componentVersionPropId;
					});
				})
				// Component version prop data
				.then(function (componentVersionPropId) {
					return _this37.set(_this37.getRefComponentVersionPropData(componentVersionPropId), data).then(function () {
						return componentVersionPropId;
					});
				});
			});
		}

		/**
   * Remove a component version prop
   * @param  {String} componentVersionPropId 	The component version prop ID
   * @return {Promise}                        A Promise
   */

	}, {
		key: 'removeComponentVersionProp',
		value: function removeComponentVersionProp(componentVersionPropId) {
			return Promise.all([
			// Component version prop ID
			this.removeComponentVersionPropId(componentVersionPropId),
			// Component version prop data
			this.remove(this.getRefComponentVersionPropData(componentVersionPropId)),
			// Component version prop description
			this.setComponentVersionPropDescription(componentVersionPropId, null)]);
		}

		/**
   * Fetch all component version props
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                    A Promise which resolves an Array
   */

	}, {
		key: 'getComponentVersionProps',
		value: function getComponentVersionProps(componentVersionId) {
			var _this38 = this;

			return this.getComponentVersionPropIds(componentVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this38.getComponentVersionProp(id);
				}));
			});
		}

		/**
   * Remove all component version props
   * @param  {String} componentVersionId 	The component version ID
   * @return {Promise}                    A Promise
   */

	}, {
		key: 'removeComponentVersionProps',
		value: function removeComponentVersionProps(componentVersionId) {
			var _this39 = this;

			return this.getComponentVersionPropIds(componentVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this39.removeComponentVersionProp(id);
				}));
			});
		}

		///////////
		// DEMOS //
		///////////

		/**
   * Get a Firebase reference for component demos
   * @param  {String} componentId 	The component ID
   * @return {Firebase}            	A Firebase reference
   */

	}, {
		key: 'getRefComponentDemo',
		value: function getRefComponentDemo(componentId) {
			return this.getRef('component_demo/' + componentId);
		}

		/**
   * Fetch demos for component ID
   * @param  {String} componentId 	The component ID
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'getComponentDemos',
		value: function getComponentDemos(componentId) {
			var _this40 = this;

			return this.get(this.getRefComponentDemo(componentId)).then(function (snapshot) {
				return _this40.snapshotArray(snapshot);
			});
		}

		///////////
		// PAGES //
		///////////

		/**
   * Get a Firebase reference to page IDs
   * @param  {String} pageId 		The page ID (optional)
   * @return {Firebase}        	A Firebase reference
   */

	}, {
		key: 'getRefPageId',
		value: function getRefPageId(pageId) {
			var ref = this.getRef('page_id');
			if (pageId) {
				return ref.child(pageId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference to page version data
   * @param  {String} pageVersionId 	The page version ID
   * @return {Firebase}               A Firebase reference
   */

	}, {
		key: 'getRefPageVersionData',
		value: function getRefPageVersionData(pageVersionId) {
			return this.getRef('page_version_data/' + pageVersionId);
		}

		/**
   * Get a Firebase reference for package version page IDs, by package version ID and page ID
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} pageId           	The page ID
   * @return {Firebase}                  	A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionPageId',
		value: function getRefPackageVersionPageId(packageVersionId, pageId) {
			var ref = this.getRef('package_version_page_id/' + packageVersionId);
			if (pageId) {
				return ref.child(pageId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference for page IDs by package version ID
   * @param  {String} packageVersionId    The package version ID
   * @param  {String} pageId 				The page ID
   * @return {Firebase}                   A Firebase reference
   */

	}, {
		key: 'getRefPageIdByPackageVersionId',
		value: function getRefPageIdByPackageVersionId(packageVersionId, pageId) {
			return this.getRef('page_id_by_package_version_id/' + packageVersionId + '/' + pageId);
		}

		/**
   * Get a Firebase reference for package version IDs by page ID
   * @param  {String} pageId 				The page ID
   * @param  {String} packageVersionId    The package version ID (optional)
   * @return {Firebase}                   A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionIdbyPageId',
		value: function getRefPackageVersionIdbyPageId(pageId, packageVersionId) {
			var ref = this.getRef('package_version_id_by_page_id/' + pageId);
			if (packageVersionId) {
				return ref.child(packageVersionId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference to package version page ID data
   * @param  {String} packageVersionPageId 	The package version page ID
   * @return {Firebase}                      	A Firebase reference
   */

	}, {
		key: 'getRefPackageVersionPageIdData',
		value: function getRefPackageVersionPageIdData(packageVersionPageId) {
			return this.getRef('package_version_page_id_data/' + packageVersionPageId);
		}

		/**
   * Get a Firebase reference to package page version IDs by page ID
   * @param  {String} pageId               	The page ID
   * @param  {String} packageVersionPageId 	The package version page ID
   * @return {Firebase}                      	A Firebase reference
   */

	}, {
		key: 'getRefPackagePageVersion',
		value: function getRefPackagePageVersion(pageId, packageVersionPageId) {
			var ref = this.getRef('package_page_version/' + pageId);
			if (packageVersionPageId) {
				return ref.child(packageVersionPageId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference to package page version IDs with content data, by page ID
   * @param  {String} pageId               	The page ID
   * @param  {String} packageVersionPageId 	The package version page ID (optional)
   * @return {Firebase}                      	A Firebase reference
   */

	}, {
		key: 'getRefPackagePageVersionContent',
		value: function getRefPackagePageVersionContent(pageId, packageVersionPageId) {
			var ref = this.getRef('package_page_version_content/' + pageId);
			if (packageVersionPageId) {
				return ref.child(packageVersionPageId);
			}
			return ref;
		}

		/**
   * Get a Firebase reference to page IDs, by package ID
   * @param  {String} packageId 	The package ID
   * @param  {String} pageId    	The page ID (optional)
   * @return {Firebase}           A Firebase reference
   */

	}, {
		key: 'getRefPackagePage',
		value: function getRefPackagePage(packageId, pageId) {
			var ref = this.getRef('package_page');
			if (packageId) {
				ref = ref.child(packageId);
			}
			if (pageId) {
				ref = ref.child(pageId);
			}
			return ref;
		}

		/**
   * Create a unique page ID
   * @return {Promise} A Promise
   */

	}, {
		key: 'setPageId',
		value: function setPageId() {
			return this.set(this.getRefPageId().push(), true);
		}

		/**
   * Create or update page version data
   * @param {String} pageVersionId 	The page version ID
   * @param {Promise} data          	A Promise
   */

	}, {
		key: 'setPageVersion',
		value: function setPageVersion(pageVersionId, data) {
			return this.set(this.getRefPageVersionData(pageVersionId), data);
		}

		/**
   * Get page version data
   * @param  {String} pageVersionId 	The page version ID
   * @return {Promise}               	A Promise
   */

	}, {
		key: 'getPageVersion',
		value: function getPageVersion(pageVersionId) {
			return this.get(this.getRefPageVersionData(pageVersionId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Remove page version data
   * @param  {String} pageVersionId 	The page version ID
   * @return {Promise}               	A Promise
   */

	}, {
		key: 'removePageVersion',
		value: function removePageVersion(pageVersionId) {
			return this.remove(this.getRefPageVersionData(pageVersionId));
		}

		/**
   * Fetch package version page ID, by package version ID and page ID
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} pageId           	The page ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getPackageVersionPageId',
		value: function getPackageVersionPageId(packageVersionId, pageId) {
			return this.get(this.getRefPackageVersionPageId(packageVersionId, pageId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Fetch package version page ID data
   * @param  {String} packageVersionPageId 	The package version page ID
   * @return {Promise}                      	A Promise
   */

	}, {
		key: 'getPackageVersionPageIdData',
		value: function getPackageVersionPageIdData(packageVersionPageId) {
			return this.get(this.getRefPackageVersionPageIdData(packageVersionPageId)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Create a unique package version page ID, by package version ID and page ID
   * @param  {String}  packageVersionId 	The package version ID
   * @param  {String}  pageId           	The page ID
   * @return {Promise} 					A Promise
   */

	}, {
		key: 'setPackageVersionPageId',
		value: function setPackageVersionPageId(packageVersionId, pageId) {
			var _this41 = this;

			var ref = this.getRefPackageVersionPageId(packageVersionId, pageId);
			var packageVersionPageId = ref.push().key();
			var data = {
				packageVersionId: packageVersionId,
				pageId: pageId
			};
			return Promise.all([
			// Package version page ID
			this.set(ref, packageVersionPageId),
			// Package version page ID data
			this.set(this.getRefPackageVersionPageIdData(packageVersionPageId), data),
			// Package version page IDs by page ID
			this.set(this.getRefPackagePageVersion(pageId, packageVersionPageId), true),
			// Package version <> Page
			this.setPackageVersionPageRelationship(packageVersionId, pageId),
			// Page IDs by package ID
			this.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
				return _this41.set(_this41.getRefPackagePage(packageVersionIdData.packageId, pageId), true);
			})]).then(function () {
				return packageVersionPageId;
			});
		}

		/**
   * Remove a package version page ID
   * @param  {String} packageVersionPageId 	The package version page ID
   * @return {Promise}                      	A Promise
   */

	}, {
		key: 'removePackageVersionPageId',
		value: function removePackageVersionPageId(packageVersionPageId) {
			var _this42 = this;

			return this.getPackageVersionPageIdData(packageVersionPageId).then(function (packageVersionPageIdData) {
				return Promise.all([
				// Package version page ID
				_this42.remove(_this42.getRefPackageVersionPageId(packageVersionPageIdData.packageVersionId, packageVersionPageIdData.pageId)),
				// Package version page ID data
				_this42.remove(_this42.getRefPackageVersionPageIdData(packageVersionPageId)),
				// Package version page IDs by page ID
				_this42.remove(_this42.getRefPackagePageVersion(packageVersionPageIdData.pageId, packageVersionPageId)),
				// Package version <> Page
				_this42.removePackageVersionPageRelationship(packageVersionPageIdData.packageVersionId, packageVersionPageIdData.pageId)]).then(function () {
					// Package version page IDs by page ID
					return _this42.get(_this42.getRefPackagePageVersion(packageVersionPageIdData.pageId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							return Promise.all([
							// Page ID
							_this42.remove(_this42.getRefPageId(packageVersionPageIdData.pageId)),
							// Page IDs by package ID
							// Package version page IDs by page ID
							_this42.getPackageVersionIdData(packageVersionPageIdData.packageVersionId).then(function (packageVersionIdData) {
								return _this42.remove(_this42.getRefPackagePage(packageVersionIdData.packageId, packageVersionPageIdData.pageId));
							})]);
						}
					});
				});
			});
		}

		/**
   * Create or update a package version page, by package version ID and page ID
   * @param {String} packageVersionId 	The package version ID
   * @param {String} pageId           	The page ID
   * @param {Promise} data             	A Promise
   */

	}, {
		key: 'setPackagePage',
		value: function setPackagePage(packageVersionId, pageId, data) {
			var _this43 = this;

			// Page ID
			return Promise.resolve(pageId).then(function (id) {
				return id ? id : _this43.setPageId();
			}).then(function (id) {
				pageId = id;

				// Package version page ID
				return _this43.getPackageVersionPageId(packageVersionId, pageId).then(function (packageVersionPageId) {
					return !packageVersionPageId ? _this43.setPackageVersionPageId(packageVersionId, pageId) : packageVersionPageId;
				});
			}).then(function (packageVersionPageId) {
				return Promise.all([
				// Package version page data
				_this43.setPageVersion(packageVersionPageId, data),
				// Package version page IDs with content data, by page ID
				_this43.set(_this43.getRefPackagePageVersionContent(pageId, packageVersionPageId), true)]).then(function () {
					return pageId;
				});
			});
		}

		/**
   * Remove a package version page
   * @return {Promise} A Promise
   */

	}, {
		key: 'removePackagePage',
		value: function removePackagePage(packageVersionPageId) {
			var _this44 = this;

			return this.getPackageVersionPageIdData(packageVersionPageId).then(function (data) {
				return Promise.all([
				// Package version page data
				_this44.removePageVersion(packageVersionPageId),
				// Package version page IDs with content data, by page ID
				_this44.remove(_this44.getRefPackagePageVersionContent(data.pageId, packageVersionPageId)),
				// Package version page ID
				_this44.removePackageVersionPageId(packageVersionPageId)]);
			});
		}

		/**
   * Fetch a page by package version ID and page ID
   * @return {Promise} A Promise
   */

	}, {
		key: 'getPackagePage',
		value: function getPackagePage(packageName, version, pageId) {
			var _this45 = this;

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				// Package version ID
				return _this45.getPackageVersionId(packageId, version).then(function (packageVersionId) {
					// Package version page ID
					return _this45.getPackageVersionPageId(packageVersionId, pageId).then(function (id) {
						// Package version page data
						return id ? _this45.getPackagePageVersionById(id) : null;
					});
				});
			}).then(function (data) {
				// Latest package version page ID with content data
				if (!data) {
					return _this45.getLatestPackagePage(pageId);
				}
				return data;
			});
		}

		/**
   * Set package version <> Page two-way relationship
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} pageId           	The page ID
   * @return {Promise} 					A Promise
   */

	}, {
		key: 'setPackageVersionPageRelationship',
		value: function setPackageVersionPageRelationship(packageVersionId, pageId) {
			return Promise.all([
			// Page ID by package version ID
			this.set(this.getRefPageIdByPackageVersionId(packageVersionId, pageId), true),
			// Package version ID by page ID
			this.set(this.getRefPackageVersionIdbyPageId(pageId, packageVersionId), true)]);
		}

		/**
   * Remove package version <> Page two-way relationship
   * @param  {String} packageVersionId 	The package version ID
   * @param  {String} pageId           	The page ID
   * @return {Promise} 					A Promise
   */

	}, {
		key: 'removePackageVersionPageRelationship',
		value: function removePackageVersionPageRelationship(packageVersionId, pageId) {
			return Promise.all([
			// Page ID by package version ID
			this.remove(this.getRefPageIdByPackageVersionId(packageVersionId, pageId)),
			// Package version ID by page ID
			this.remove(this.getRefPackageVersionIdbyPageId(pageId, packageVersionId))]);
		}

		/**
   * Toggle package version <> Page two-way relationship, by package name and version
   * @param  {String} packageName 	The package name
   * @param  {String} version     	The package version
   * @param  {String} pageId      	The page ID
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'togglePackageVersionPage',
		value: function togglePackageVersionPage(packageName, version, pageId) {
			var _this46 = this;

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				// Package version ID
				return _this46.getPackageVersionId(packageId, version).then(function (packageVersionId) {
					// Page ID by package version ID
					return _this46.get(_this46.getRefPageIdByPackageVersionId(packageVersionId, pageId)).then(function (snapshot) {
						// Remove relationship
						if (snapshot.exists()) {
							return _this46.removePackageVersionPageRelationship(packageVersionId, pageId);
						}
						// Set relationship
						return _this46.setPackageVersionPageRelationship(packageVersionId, pageId);
					})
					// Fetch updated page version
					.then(function () {
						return _this46.getPackagePage(packageName, version, pageId);
					});
				});
			});
		}

		/**
   * Fetch the latest package page version by page ID
   * @param  {String} pageId 	The page ID
   * @return {Promise}        A Promise
   */

	}, {
		key: 'getLatestPackagePage',
		value: function getLatestPackagePage(pageId) {
			var _this47 = this;

			return this.get(this.getRefPackagePageVersionContent(pageId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestPackageVersionPageId = Object.keys(snapshot.val()).pop();
					return _this47.getPackagePageVersionById(latestPackageVersionPageId);
				}
				return null;
			});
		}

		/**
   * Fetch a page by package version page ID
   * @return {Promise} A Promise
   */

	}, {
		key: 'getPackagePageVersionById',
		value: function getPackagePageVersionById(packageVersionPageId) {
			var _this48 = this;

			return Promise.all([
			// Page version data
			this.getPageVersion(packageVersionPageId),
			// Package version page ID data
			this.getPackageVersionPageIdData(packageVersionPageId)]).then(function (_ref7) {
				var _ref8 = _slicedToArray(_ref7, 2);

				var data = _ref8[0];
				var packageVersionPageIdData = _ref8[1];

				// Package version ID data
				return _this48.getPackageVersionIdData(packageVersionPageIdData.packageVersionId).then(function (packageVersionIdData) {
					return { data: data, packageVersionPageIdData: packageVersionPageIdData, packageVersionIdData: packageVersionIdData };
				});
			}).then(function (data) {
				return _this48.get(_this48.getRefPackageVersionIdbyPageId(data.packageVersionPageIdData.pageId)).then(function (snapshot) {
					return (0, _merge2.default)(data, { packageVersionId: snapshot.exists() ? Object.keys(snapshot.val()) : [] });
				});
			});
		}

		/**
   * Fetch package version page IDs by package version ID
   * @param  {String} packageVersionId 	The package version ID
   * @return {Promise}                  	A Promise
   */

	}, {
		key: 'getPackageVersionPageIds',
		value: function getPackageVersionPageIds(packageVersionId) {
			var _this49 = this;

			return this.get(this.getRefPackageVersionPageId(packageVersionId)).then(function (snapshot) {
				return _this49.snapshotArray(snapshot);
			});
		}

		/**
   * Fetch package version pages
   * @return {Promise} A Promise which resolves a pages Array
   */

	}, {
		key: 'getPackageVersionPages',
		value: function getPackageVersionPages(packageVersionId) {
			var _this50 = this;

			return this.getPackageVersionPageIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this50.getPackagePageVersionById(id);
				}));
			});
		}

		/**
   * Fetch package version pages, by package name and version
   * @param  {String} packageName 	The package name
   * @param  {String} version     	The package version
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'getPackageVersionPagesByName',
		value: function getPackageVersionPagesByName(packageName, version) {
			var _this51 = this;

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				// Package version ID
				return _this51.getPackageVersionId(packageId, version).then(function (packageVersionId) {
					// Pages
					return _this51.getPackageVersionPages(packageVersionId);
				});
			});
		}

		/**
   * Fetch package pages by package name
   * @param  {String} packageName 	The package name
   * @return {Promise}             	A Promise
   */

	}, {
		key: 'getPackagePagesByName',
		value: function getPackagePagesByName(packageName, version) {
			var _this52 = this;

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				// Page IDs by package ID
				return _this52.get(_this52.getRefPackagePage(packageId)).then(function (snapshot) {
					var pageIds = Object.keys(snapshot.val() || {});
					return Promise.all(pageIds.map(function (pid) {
						return _this52.getPackagePage(packageName, version, pid);
					}));
				});
			});
		}

		/**
   * Remove package version pages
   * @param {String} packageVersionId 	The package version ID
   * @return {Promise} 					A Promise
   */

	}, {
		key: 'removePackageVersionPages',
		value: function removePackageVersionPages(packageVersionId) {
			var _this53 = this;

			return this.getPackageVersionPageIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this53.removePackagePage(id);
				}));
			});
		}

		//////////////////////////////
		// PACKAGE PAGES: LISTENERS //
		//////////////////////////////

	}, {
		key: 'onPackagePageAdded',
		value: function onPackagePageAdded(packageName, version, cb, error) {
			var _this54 = this;

			// Package ID
			this.getPackageId(packageName).then(function (packageId) {
				// Page IDs by package ID
				_this54.listen(_this54.getRefPackagePage(packageId), 'child_added', function (snapshot) {
					_this54.getPackagePage(packageName, version, snapshot.key()).then(function (data) {
						return cb(data);
					});
				}, error);
			});
		}
	}, {
		key: 'offPackagePageAdded',
		value: function offPackagePageAdded() {
			this.getRefPackagePage().off('child_added');
		}
	}, {
		key: 'onPackageVersionPageRemoved',
		value: function onPackageVersionPageRemoved(cb, error) {
			this.listen('package_version_page_id', 'child_removed', function (snapshot) {
				var val = snapshot.val();
				var pageId = Object.keys(val).pop();
				var packageVersionPageId = val[pageId];
				cb(packageVersionPageId);
			}, error);
		}
	}, {
		key: 'offPackageVersionPageRemoved',
		value: function offPackageVersionPageRemoved() {
			this.getRef('package_version_page_id').off('child_removed');
		}
	}]);

	return Store;
}(_firebaseStore2.default);

var store = new Store();
exports.default = store;

module.exports = exports.default;