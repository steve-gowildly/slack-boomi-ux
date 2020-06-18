/*jshint esversion: 6 */
const redis = require("redis");

module.exports = {
  start: function () {
    var client = redis.createClient();

    let store = {};

    store.client = client;
    store.get = function (key) {
      return this.client.get(key);
    };
    store.set = function(key, value) {
      return this.client.set(key, value);
    };
  }
};
