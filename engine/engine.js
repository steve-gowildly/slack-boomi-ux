/*jshint esversion: 6 */
const axios = require('axios');

const flow = require('./flow');
const state = require('./state');

const store = require('../services/store');
const convert = require('../services/convert');

const settings = require('../utils/settings');
const logic = require('../utils/logic');

module.exports = {
  start: function (app) {
    // Start the shared services
    const storer = store.start();
    const converter = convert.start();

    let engine = {};
    engine.storer = storer;
    engine.converter = converter;
    engine.app = app;
    engine.getFlowByName = function(name) {
      let flows = storer.get(settings.STORER_FLOWS_KEY);

      if (!logic.isNullOrEmpty(flows)) {
        let filteredFlows = flows.filter(
          flow =>
          flow.developerName.toLowerCase() == name.toLowerCase());

        if (!logic.isNullOrEmpty(filteredFlows)) {
          return flow;
        }
      }

      return null;
    };
    engine.applyInputs = function(state, inputs) {
      state.mapElementInvokeRequest.pageRequest = {};
      state.mapElementInvokeRequest.pageRequest.pageComponentInputResponses = [];

      if (inputs != null) {
        for (const [key, value] of inputs.entries()) {
          state.mapElementInvokeRequest.pageRequest.pageComponentInputResponses.push({
            'pageComponentId': key,
            'contentValue': value
          });
        }
      }
    };
    engine.execute = function(url, data, options, respond, body, channel_id) {
      // Make the request out to the flow runtime
      axios.post(url, data, options)
        .then(response => {
          let stateData = state.get(response.data, channel_id);
          let flowResponse = flow.getResponse(response.data, stateData, converter);

          // Slack doesn't clean up ephemeral messages when you go from messages
          // into modals, so we add the clean-up here
          if (body.message &&
              body.message.ts &&
              !logic.isNullOrEmpty(body.message.ts)) {
            try {
              app.client.chat.delete({
                token: settings.SLACK_TOKEN,
                channel: body.channel.id,
                ts: body.message.ts
              });
            }
            catch (error) {
              console.error(error);
            }
          }

          if (logic.isEqual(flowResponse.type, 'message')) {
              // Assign the channel and post the message
              flowResponse.json.channel = channel_id;
              flowResponse.json.token = settings.SLACK_TOKEN;

              try {
                app.client.chat.postMessage(flowResponse.json)
                  .then(messageResponse => {
                    //console.log(messageResponse.message.ts);
                  });
              }
              catch (error) {
                console.error(error);
              }
            //}
          } else if (logic.isEqual(flowResponse.type, 'modal')) {
            try {
              // Add the trigger identifier here so Slack can track the submission
              flowResponse.json.trigger_id = body.trigger_id;
              flowResponse.json.token = settings.SLACK_TOKEN;

              const result = app.client.views.open(flowResponse.json);
            }
            catch (error) {
              console.error(error);
            }
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    return engine;
  }
};
