'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _firebaseStore = require('firebase-store');

var _firebaseStore2 = _interopRequireDefault(_firebaseStore);

var _firebasePaginator = require('firebase-store/lib/firebase-paginator');

var _firebasePaginator2 = _interopRequireDefault(_firebasePaginator);

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

		/**
   * Holds paginator instances
   * @type {Object}
   */

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));

		_this.paginator = {};
		return _this;
	}

	/*eslint spaced-comment:0*/
	////////////////
	// PAGINATION //
	////////////////

	/**
  * Create a paginator.
  */

	_createClass(Store, [{
		key: 'paginate',
		value: function paginate(id, ref) {
			var limit = arguments.length <= 2 || arguments[2] === undefined ? 6 : arguments[2];

			this.paginator[id] = new _firebasePaginator2.default(ref, limit);
		}

		/**
   * Get paginator results.
   * @param {String} id 		The paginator ID.
   * @param {String} type 	Page type ('prevPage' or 'nextPage')
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
   * @param {String} id 	The paginator ID.
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
   * @param {String} id 	The paginator ID.
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
   * @param {String} id 	The paginator ID.
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
   * Slugify version
   * @param  {String} version The version i.e. 0.1.0
   * @return {String}         The slugified version
   */

	}, {
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
			var _this3 = this;

			return this.getPackageIdData(packageId).then(function (data) {
				return Promise.all([
				// Package ID
				_this3.remove(_this3.getRefPackageId(data.packageName)),
				// Package ID data
				_this3.remove(_this3.getRefPackageIdData(packageId))]);
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
			var _this4 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				return Promise.all([
				// Package version ID
				_this4.remove(_this4.getRefPackageVersionId(data.packageId, data.version)),
				// Package version ID data
				_this4.remove(_this4.getRefPackageVersionIdData(packageVersionId))])
				// Maybe remove package ID
				.then(function () {
					// Fetch package ID versions
					return _this4.get(_this4.getRefPackageVersionId(data.packageId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove package ID
							return _this4.removePackageId(data.packageId);
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
			var _this5 = this;

			return this.get(this.getRefPackageVersionId(packageId)).then(function (snapshot) {
				return _this5.snapshotArray(snapshot);
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
			var _this6 = this;

			var description = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
			var readme = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			// Package ID
			return this.getPackageId(packageName).then(function (packageId) {
				if (!packageId) {
					return _this6.setPackageId(packageName);
				}
				return packageId;
			})
			// Package version ID
			.then(function (packageId) {
				return _this6.getPackageVersionId(packageId, version).then(function (packageVersionId) {
					if (!packageVersionId) {
						return _this6.setPackageVersionId(packageId, version);
					}
					return packageVersionId;
				});
			})
			// Package version description
			.then(function (packageVersionId) {
				return _this6.setPackageVersionDescription(packageVersionId, description).then(function () {
					return packageVersionId;
				});
			})
			// Package version readme
			.then(function (packageVersionId) {
				return _this6.setPackageVersionReadme(packageVersionId, readme).then(function () {
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
			var _this7 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				// Package version description data
				var descriptionRef = _this7.getRefPackageVersionDescriptionData(packageVersionId);
				// Package version ID with description data, by package ID
				var packageDescriptionRef = _this7.getRefPackageDescription(data.packageId, packageVersionId);

				// create or update
				if (description) {
					return Promise.all([
					// Package version description data
					_this7.set(descriptionRef, description),
					// Package version ID with description data, by package ID
					_this7.set(packageDescriptionRef, true)]);
				}
				// remove
				return Promise.all([
				// Package version description data
				_this7.remove(descriptionRef),
				// Package version ID with description data, by package ID
				_this7.remove(packageDescriptionRef)]);
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
			var _this8 = this;

			// Package version description data
			return this.get(this.getRefPackageVersionDescriptionData(packageVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret = function () {
						var data = {
							data: snapshot.val()
						};
						// Package version ID data
						return {
							v: _this8.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
								return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
							})
							// Package ID data
							.then(function (data) {
								return _this8.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
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
			var _this9 = this;

			return this.get(this.getRefPackageDescription(packageId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestPackageVersionIdWithDescription = Object.keys(snapshot.val()).pop();
					return _this9.getPackageVersionDescription(latestPackageVersionIdWithDescription);
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
			var _this10 = this;

			return this.getPackageVersionIdData(packageVersionId).then(function (data) {
				// Package version readme data
				var readmeRef = _this10.getRefPackageVersionReadmeData(packageVersionId);
				// Package version ID with readme data, by package ID
				var packageReadmeRef = _this10.getRefPackageReadme(data.packageId, packageVersionId);

				// create or update
				if (readme) {
					return Promise.all([
					// Package version readme data
					_this10.set(readmeRef, readme),
					// Package version ID with readme data, by package ID
					_this10.set(packageReadmeRef, true)]);
				}
				// remove
				return Promise.all([
				// Package version readme data
				_this10.remove(readmeRef),
				// Package version ID with readme data, by package ID
				_this10.remove(packageReadmeRef)]);
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
			var _this11 = this;

			// Package version readme data
			return this.get(this.getRefPackageVersionReadmeData(packageVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret2 = function () {
						var data = {
							data: snapshot.val()
						};
						// Package version ID data
						return {
							v: _this11.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
								return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
							})
							// Package ID data
							.then(function (data) {
								return _this11.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
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
			var _this12 = this;

			return this.get(this.getRefPackageReadme(packageId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestPackageVersionIdWithReadme = Object.keys(snapshot.val()).pop();
					return _this12.getPackageVersionReadme(latestPackageVersionIdWithReadme);
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
			var _this13 = this;

			return this.get('package_id').then(function (snapshot) {
				var packageIDs = _this13.snapshotArray(snapshot);
				// fetch latest versions IDs
				return Promise.all(packageIDs.map(function (packageId) {
					return _this13.getLatestPackageVersionId(packageId);
				}))
				// fetch packages
				.then(function (latestPackageIDs) {
					return Promise.all(latestPackageIDs.map(function (packageVersionId) {
						return _this13.getPackageVersion(packageVersionId);
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
			var _this14 = this;

			// Package version ID data
			return this.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
				return { packageVersionIdData: packageVersionIdData };
			})
			// Package ID data
			.then(function (data) {
				return _this14.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
					return (0, _merge2.default)(data, { packageIdData: packageIdData });
				});
			})
			// Package version component count
			.then(function (data) {
				return _this14.getPackageVersionComponentCount(packageVersionId).then(function (count) {
					return data.components = count;
				}).then(function () {
					return data;
				});
			})
			// Package description
			.then(function (data) {
				// Package version description
				return _this14.getPackageVersionDescription(packageVersionId).then(function (description) {
					if (!description) {
						return _this14.getLatestPackageDescription(data.packageIdData.objectID);
					}
					return description;
				}).then(function (description) {
					return (0, _merge2.default)(data, { description: description });
				});
			})
			// Package readme
			.then(function (data) {
				// Package version readme
				return _this14.getPackageVersionReadme(packageVersionId).then(function (readme) {
					if (!readme) {
						return _this14.getLatestPackageReadme(data.packageIdData.objectID);
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
			var _this15 = this;

			return this.getPackageId(packageName).then(function (packageId) {
				return _this15.getPackageVersionId(packageId, version);
			}).then(function (packageVersionId) {
				return _this15.getPackageVersion(packageVersionId);
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
			var _this16 = this;

			return this.getPackageVersionIds(packageId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this16.getPackageVersionIdData(id);
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
			var _this17 = this;

			this.listen('package_id', 'child_added', function (snapshot) {
				var packageId = snapshot.val();

				// Latest package version ID
				_this17.getLatestPackageVersionId(packageId)
				// Package version
				.then(function (latestPackageVersionId) {
					return _this17.getPackageVersion(latestPackageVersionId);
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
			var _this18 = this;

			return this.getComponentIdData(componentId).then(function (data) {
				return Promise.all([
				// Component ID
				_this18.remove(_this18.getRefComponentId(data.packageId, data.componentName)),
				// Component ID data
				_this18.remove(_this18.getRefComponentIdData(componentId))]);
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
			var _this19 = this;

			return this.getComponentVersionIdData(componentVersionId).then(function (data) {
				return Promise.all([
				// Component version ID
				_this19.remove(_this19.getRefComponentVersionId(data.packageVersionId, data.componentId)),
				// Component version ID data
				_this19.remove(_this19.getRefComponentVersionIdData(componentVersionId)),
				// Component version IDs by component ID (Component <> Component version)
				_this19.remove(_this19.getRefComponentVersion(data.componentId, componentVersionId))])
				// Maybe remove component ID
				.then(function () {
					// Component <> Component version
					return _this19.get(_this19.getRefComponentVersion(data.componentId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove component ID
							return _this19.removeComponentId(data.componentId);
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
			var _this20 = this;

			var description = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

			// Package version ID data
			return this.getPackageVersionIdData(packageVersionId).then(function (packageVersionIdData) {
				var packageId = packageVersionIdData.packageId;
				// Component ID

				return _this20.getComponentId(packageId, componentName).then(function (componentId) {
					if (!componentId) {
						return _this20.setComponentId(packageId, componentName);
					}
					return componentId;
				});
			})
			// Component version ID
			.then(function (componentId) {
				return _this20.getComponentVersionId(packageVersionId, componentId).then(function (componentVersionId) {
					if (!componentVersionId) {
						return _this20.setComponentVersionId(packageVersionId, componentId);
					}
					return componentVersionId;
				});
			})
			// Component version data
			.then(function (componentVersionId) {
				return _this20.set(_this20.getRefComponentVersionData(componentVersionId), data).then(function () {
					return componentVersionId;
				});
			})
			// Package version description
			.then(function (componentVersionId) {
				return _this20.setComponentVersionDescription(componentVersionId, description).then(function () {
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
			var _this21 = this;

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
				_this21.getComponentIdData(data.componentVersionIdData.componentId),
				// Package version ID data
				_this21.getPackageVersionIdData(data.componentVersionIdData.packageVersionId)]).then(function (_ref3) {
					var _ref4 = _slicedToArray(_ref3, 2);

					var componentIdData = _ref4[0];
					var packageVersionIdData = _ref4[1];
					return (0, _merge2.default)(data, { componentIdData: componentIdData, packageVersionIdData: packageVersionIdData });
				});
			}).then(function (data) {
				return Promise.all([
				// Package ID data
				_this21.getPackageIdData(data.packageVersionIdData.packageId),
				// Component version description
				_this21.getComponentVersionDescription(componentVersionId).then(function (description) {
					// Component description
					if (!description) {
						return _this21.getLatestComponentDescription(data.componentIdData.objectID);
					}
					return description;
				}),
				// Component demos
				_this21.getComponentDemos(data.componentIdData.objectID)]).then(function (_ref5) {
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
			var _this22 = this;

			var packageId = undefined;

			// Package ID
			return this.getPackageId(packageName).then(function (pkgId) {
				packageId = pkgId;

				// Package Version ID
				return _this22.getPackageVersionId(packageId, version);
			}).then(function (packageVersionId) {
				// Component ID
				return _this22.getComponentId(packageId, componentName).then(function (componentId) {
					// Component version ID
					return _this22.getComponentVersionId(packageVersionId, componentId);
				})
				// Component version by component version ID
				.then(function (componentVersionId) {
					return _this22.getComponentVersionById(componentVersionId);
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
			var _this23 = this;

			return this.getComponentVersionIdData(componentVersionId).then(function (data) {
				// Component version description data
				var descriptionRef = _this23.getRefComponentVersionDescriptionData(componentVersionId);
				// Component version ID with description data, by component ID
				var componentDescriptionRef = _this23.getRefComponentDescription(data.componentId, componentVersionId);

				// create or update
				if (description) {
					return Promise.all([
					// Component version description data
					_this23.set(descriptionRef, description),
					// Component version ID with description data, by component ID
					_this23.set(componentDescriptionRef, true)]);
				}
				// remove
				return Promise.all([
				// Component version description data
				_this23.remove(descriptionRef),
				// Component version ID with description data, by component ID
				_this23.remove(componentDescriptionRef)]);
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
			var _this24 = this;

			// Component version description data
			return this.get(this.getRefComponentVersionDescriptionData(componentVersionId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var _ret3 = function () {
						var data = {
							data: snapshot.val()
						};
						// Component version ID data
						return {
							v: _this24.getComponentVersionIdData(componentVersionId).then(function (componentVersionIdData) {
								return (0, _merge2.default)(data, { componentVersionIdData: componentVersionIdData });
							})
							// Component ID data
							.then(function (data) {
								return _this24.getComponentIdData(data.componentVersionIdData.componentId).then(function (componentIdData) {
									return (0, _merge2.default)(data, { componentIdData: componentIdData });
								});
							})
							// Package version ID data
							.then(function (data) {
								return _this24.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then(function (packageVersionIdData) {
									return (0, _merge2.default)(data, { packageVersionIdData: packageVersionIdData });
								});
							})
							// Package ID data
							.then(function (data) {
								return _this24.getPackageIdData(data.packageVersionIdData.packageId).then(function (packageIdData) {
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
			var _this25 = this;

			return this.get(this.getRefComponentDescription(componentId)).then(function (snapshot) {
				if (snapshot.exists()) {
					var latestComponentVersionIdWithDescription = Object.keys(snapshot.val()).pop();
					return _this25.getComponentVersionDescription(latestComponentVersionIdWithDescription);
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
			var _this26 = this;

			return this.get(this.getRefComponentVersionId(packageVersionId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				return _this26.snapshotArray(snapshot);
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
			var _this27 = this;

			return this.getPackageVersionComponentIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this27.getComponentVersionById(id);
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
			var _this28 = this;

			return this.getPackageVersionComponentIds(packageVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this28.removeComponentVersion(id);
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
			var _this29 = this;

			this.listen(this.getRefComponentVersionId(packageVersionId), 'child_added', function (snapshot) {
				_this29.getComponentVersionById(snapshot.val()).then(function (data) {
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
			var _this30 = this;

			// Component prop ID data
			return this.getComponentPropIdData(propId).then(function (data) {
				return Promise.all([
				// Remove component prop ID
				_this30.remove(_this30.getRefComponentPropId(data.componentId, data.propName)),
				// Remove component prop ID data
				_this30.remove(_this30.getRefComponentPropIdData(propId))]);
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
			var _this31 = this;

			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				return Promise.all([
				// Component version prop ID
				_this31.remove(_this31.getRefComponentVersionPropId(data.componentVersionId, data.propId)),
				// Component version prop ID data
				_this31.remove(_this31.getRefComponentVersionPropIdData(componentVersionPropId)),
				// Component prop <> Component version prop
				_this31.remove(_this31.getRefComponentProp(data.propId, componentVersionPropId))])
				// Maybe remove component prop ID
				.then(function () {
					// Component version prop IDs for prop ID
					return _this31.get(_this31.getRefComponentProp(data.propId)).then(function (snapshot) {
						if (!snapshot.exists()) {
							// Remove component prop ID
							return _this31.removeComponentPropId(data.propId);
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
			var _this32 = this;

			return this.get(this.getRefComponentVersionPropId(componentVersionId)).then(function (snapshot) {
				if (!snapshot.exists()) {
					return Promise.resolve([]);
				}
				return _this32.snapshotArray(snapshot);
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
			var _this33 = this;

			// Component version prop ID data
			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				// Component version prop IDs with description data
				return _this33.get(_this33.getRefComponentPropDescription(data.propId)).then(function (snapshot) {
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
			var _this34 = this;

			return this.getLatestComponentVersionPropIdWithDescription(componentVersionPropId).then(function (latestComponentVersionPropId) {
				if (latestComponentVersionPropId) {
					return _this34.getComponentVersionPropDescription(latestComponentVersionPropId);
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
			var _this35 = this;

			return this.get(this.getRefComponentVersionPropDescription(componentVersionPropId)).then(function (snapshot) {
				// Component version prop description data
				if (snapshot.exists()) {
					var _ret4 = function () {
						var description = snapshot.val();

						// Component version prop ID data
						return {
							v: _this35.getComponentVersionPropIdData(componentVersionPropId).then(function (componentVersionPropIdData) {
								return {
									data: description,
									componentVersionPropIdData: componentVersionPropIdData
								};
							})
							// Component version ID data
							.then(function (data) {
								return _this35.getComponentVersionIdData(data.componentVersionPropIdData.componentVersionId).then(function (componentVersionIdData) {
									return (0, _merge2.default)(data, { componentVersionIdData: componentVersionIdData });
								});
							})
							// Package version ID data
							.then(function (data) {
								return _this35.getPackageVersionIdData(data.componentVersionIdData.packageVersionId).then(function (packageVersionIdData) {
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
			var _this36 = this;

			// Component version prop ID data
			return this.getComponentVersionPropIdData(componentVersionPropId).then(function (data) {
				// Component version prop description
				var ref = _this36.getRefComponentVersionPropDescription(componentVersionPropId);
				// Latest component version prop ID with a description
				var propRef = _this36.getRefComponentPropDescription(data.propId).child(componentVersionPropId);
				// set
				if (description) {
					return Promise.all([
					// Component version prop description
					_this36.set(ref, description),
					// Latest component version prop ID with a description
					_this36.set(propRef, true)]);
				}
				// remove
				return Promise.all([
				// Component version prop description
				_this36.remove(ref),
				// Latest component version prop ID with a description
				_this36.remove(propRef)]);
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
			var _this37 = this;

			// Component version prop data
			return this.getComponentVersionPropData(componentVersionPropId).then(function (data) {
				// Component version prop description data
				return _this37.getComponentVersionPropDescription(componentVersionPropId).then(function (description) {
					if (!description) {
						// Fetch the description from the latest component version prop ID with description data
						return _this37.getLatestComponentPropDescription(componentVersionPropId);
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
			var _this38 = this;

			data.componentVersionId = componentVersionId;

			// Component ID
			return this.getComponentVersionIdData(componentVersionId).then(function (componentVersionIdData) {
				data.componentId = componentVersionIdData.componentId;
				// Component prop ID
				return _this38.getComponentPropId(data.componentId, propName).then(function (propId) {
					if (!propId) {
						return _this38.setComponentPropId(data.componentId, propName);
					}
					return propId;
				})
				// Component version prop ID
				.then(function (propId) {
					return _this38.getComponentVersionPropId(componentVersionId, propId).then(function (componentVersionPropId) {
						if (!componentVersionPropId) {
							return _this38.setComponentVersionPropId(componentVersionId, propId);
						}
						return componentVersionPropId;
					});
				})
				// Component version prop data
				.then(function (componentVersionPropId) {
					return _this38.set(_this38.getRefComponentVersionPropData(componentVersionPropId), data).then(function () {
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
			var _this39 = this;

			return this.getComponentVersionPropIds(componentVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this39.getComponentVersionProp(id);
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
			var _this40 = this;

			return this.getComponentVersionPropIds(componentVersionId).then(function (ids) {
				return Promise.all(ids.map(function (id) {
					return _this40.removeComponentVersionProp(id);
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
			var _this41 = this;

			return this.get(this.getRefComponentDemo(componentId)).then(function (snapshot) {
				return _this41.snapshotArray(snapshot);
			});
		}

		///////////
		// PAGES //
		///////////

	}, {
		key: 'getPageRef',
		value: function getPageRef(pageId, version) {
			return this.getRef('pages/' + pageId + '/' + this.version(version));
		}

		/**
   * Saves a page to Firebase.
   * @param  {String} pageId 		The page ID.
   * @param  {?} data 			The page data.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'setPage',
		value: function setPage(pageId, data, version) {
			version = this.version(version);
			var ref = this.getRef('pages');
			if (pageId) {
				ref = ref.child(pageId);
			} else {
				ref = ref.push();
				pageId = ref.key();
			}
			ref = ref.child(version);
			return this.set(ref, data, pageId);
		}

		/**
   * Removes a page from Firebase.
   * @param  {String} pageId 		The page ID.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePage',
		value: function removePage(pageId, version) {
			return this.remove(this.getPageRef(pageId, version), pageId);
		}

		/**
   * Get a page from Firebase.
   * @param  {String} pageId 		The page ID.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise which resolves a page Object.
   */

	}, {
		key: 'getPage',
		value: function getPage(pageId, version) {
			return this.get(this.getPageRef(pageId, version)).then(function (snapshot) {
				return snapshot.val();
			});
		}

		/**
   * Get a Firebase query reference for fetching pages for a specific package.
   * @param  {String} packageId		The package ID.
   * @param  {String} version 		The package version.
   * @return {Firebase} 				A Firebase reference.
   */

	}, {
		key: 'getPackagePagesRef',
		value: function getPackagePagesRef(packageId, version) {
			return this.getRef('package_pages/' + packageId + '/' + this.version(version));
		}

		/**
   * Create a Pages paginator
   * @param  {String} packageId 	The package ID.
   * @param  {String} version 	The package version.
   */

	}, {
		key: 'paginatePages',
		value: function paginatePages(packageId, version) {
			this.paginate('pages', this.getPackagePagesRef(packageId, version));
		}

		/**
   * Get 'Pages' paginator results.
   * @param {String} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorPages',
		value: function getPaginatorPages(type, version) {
			var _this42 = this;

			return this.getPaginatorResults('pages', type).then(function (pageIds) {
				pageIds = Object.keys(pageIds);
				return Promise.all(pageIds.map(function (pageId) {
					return _this42.getPage(pageId, version);
				}));
			});
		}

		/**
   * Get pages from Firebase for a specific package.
   * @param {String} packageId 	The package ID.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise which resolves a pages Array.
   */

	}, {
		key: 'getPages',
		value: function getPages(packageId, version) {
			var _this43 = this;

			return this.get(this.getPackagePagesRef(packageId, version)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this43.getPage(pageId, version);
				}));
			});
		}

		/**
   * Remove pages from Firebase for a specific package.
   * @param {String} packageId 	The package ID.
   * @param  {String} version 	The package version.
   * @return {Promise} 			A Promise.
   */

	}, {
		key: 'removePages',
		value: function removePages(packageId, version) {
			var _this44 = this;

			return this.get(this.getPackagePagesRef(packageId, version)).then(function (snapshot) {
				var pageIds = Object.keys(snapshot.val());
				return Promise.all(pageIds.map(function (pageId) {
					return _this44.removePage(pageId, version);
				}));
			});
		}

		/**
   * Package pages relationship
   * @param {String} packageId   	The package ID.
   * @param {String} pageId 		The page ID.
   * @param {Boolean|null} data 	The data (Boolean or null to remove)
   */

	}, {
		key: 'setPackagePage',
		value: function setPackagePage(packageId, version, pageId, data) {
			return this.set(this.getPackagePagesRef(packageId, version).child(pageId), data);
		}

		/**
   * Remove Package <> Page relationship
   * @param {String} packageId   	The package ID.
   * @param  {String} version 	The package version.
   * @param {String} pageId 		The page ID.
   */

	}, {
		key: 'removePackagePage',
		value: function removePackagePage(packageId, version, pageId) {
			return this.remove(this.getPackagePagesRef(packageId, version).child(pageId));
		}
	}, {
		key: 'onPageRemoved',
		value: function onPageRemoved(cb, error) {
			this.listen('pages', 'child_removed', function (snapshot) {
				cb(snapshot.key());
			}, error);
		}
	}]);

	return Store;
}(_firebaseStore2.default);

var store = new Store();
exports.default = store;

module.exports = exports.default;