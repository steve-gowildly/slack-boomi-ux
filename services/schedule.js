/*jshint esversion: 6 */
const CronJob = require('cron').CronJob;
const axios = require('axios');
const settings = require('../utils/settings');

module.exports = {
  start: function (storer) {
    let job = new CronJob('5 * * * * *', function() {
      axios.get(settings.BOOMI_FLOW_BASE_URL + settings.BOOMI_FLOW_ALL_PATH, settings.OPTIONS)
        .then(response => {
          if (response.data != null) {
            storer.set(settings.STORER_FLOWS_KEY, JSON.stringify(response.data));
          }
        })
        .catch(error => {
          console.log(error);
        });
    }, null, true, 'America/Los_Angeles');
    job.start();
  }
};
