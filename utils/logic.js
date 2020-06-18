/*jshint esversion: 6 */
module.exports = {
  isNullOrEmpty: function (value) {
    if (Array.isArray(value)) {
      if (value == null || value.length == 0) {
        return true;
      }
    } else if (value == null || value.trim().length == 0) {
      return true;
    }
    return false;
  },
  isEqual: function (value1, value2) {
    // Both are null or empty
    if (module.exports.isNullOrEmpty(value1) && module.exports.isNullOrEmpty(value2)) {
      return true;
    }

    // Either one is null or empty, but not both
    if ((module.exports.isNullOrEmpty(value1) && !module.exports.isNullOrEmpty(value2)) ||
        (!module.exports.isNullOrEmpty(value1) && module.exports.isNullOrEmpty(value2))) {
      return false;
    }

    if (value1.toUpperCase() == value2.toUpperCase()) {
      return true;
    }

    return false;
  },
  compareByOrder: function (a, b) {
    const orderA = a.order;
    const orderB = b.order;

    let comparison = 0;
    if (orderA > orderB) {
      comparison = 1;
    } else if (orderA < orderB) {
      comparison = -1;
    }
    return comparison;
  }
};
