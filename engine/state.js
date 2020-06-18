/*jshint esversion: 6 */
const logic = require('../utils/logic');

module.exports = {
  get: function (data, channel_id) {
    if (data == null) {
      throw 'Data cannot be null to create the Flow state';
    }

    let state = {
      "stateId": data.stateId,
      "stateToken": data.stateToken,
      "currentMapElementId": data.currentMapElementId,
      "invokeType": data.invokeType,
      "mapElementInvokeRequest": {
        "selectedOutcomeId": null
      }
    };

    if (!logic.isNullOrEmpty(channel_id)) {
      state.channel_id = channel_id;
    }

    return state;
  }
};
