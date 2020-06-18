/*jshint esversion: 6 */
const redis = require("redis");

module.exports = {
  start: function () {
    var client = redis.createClient();

    let store = {};

    store.client = client;
    store.get = function (key, responseFunction) {
      this.client.get(key, responseFunction);
    };
    store.set = function(key, value) {
      return this.client.set(key, value);
    };

    return store;
  }
};
