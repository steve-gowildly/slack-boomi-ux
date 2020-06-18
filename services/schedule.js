/*jshint esversion: 6 */
const schedule = require('node-schedule');
const axios = require('axios');

const settings = require('./utils/settings');

module.exports = {
  start: function (storer) {
    schedule.scheduleJob('* 1 * * *', function(){
      var flows = storer.get(settings.STORER_FLOWS_KEY);

      axios.get(settings.BOOMI_FLOW_BASE_URL + settings.BOOMI_FLOW_ALL_PATH, options)
        .then(response => {
          storer.set(settings.STORER_FLOWS_KEY, flows);
          console.log('Refreshed the list of available flows to execute');
        })
        .catch(error => {
          console.log(error);
        });
    });
  }
};
