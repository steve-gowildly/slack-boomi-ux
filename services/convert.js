/*jshint esversion: 6 */
const TurndownService = require('turndown');

const logic = require('../utils/logic');

module.exports = {
  start: function () {
    var turndownService = new TurndownService();

    let converter = {};

    converter.turndownService = turndownService;
    converter.convert = function (format, content) {
      if (format == null ||
          format != 'mrkdwn') {
        throw 'Conversion format must be mrkdwn';
      }

      if (!logic.isNullOrEmpty(content)) {
        return this.turndownService.turndown(content);
      }
      return null;
    };

    return converter;
  }
};
