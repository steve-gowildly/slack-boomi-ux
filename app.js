/*jshint esversion: 8 */
const { App } = require('@slack/bolt');
const axios = require('axios');

const engine = require('./engine/engine');

const settings = require('./utils/settings');
const logic = require('./utils/logic');

// Initializes your app with your bot token and signing secret
const app = new App({
  token: settings.SLACK_TOKEN,
  signingSecret: settings.SLACK_SIGNING_SECRET
});

// Start the shared services
const runtime = engine.start(app);

const options = {
  headers: { 'ManyWhoTenant': settings.BOOMI_FLOW_TENANT_ID }
};

// Called as a result of a modal outcome being clicked
app.view(/^mod_outcome_*/, async ({ ack, body, view, context, respond }) => {
  // Acknowledge the view_submission event
  await ack();

  let inputs = new Map();

  // Fill up the map of inputs
  for (let [key, value] of Object.entries(view.state.values)) {
    let componentKey = key.substring(2);
    let actionKey = 'a_' + componentKey;

    inputs.set(componentKey, value[actionKey].value);
  }

  // Get the state out of the view
  let data = JSON.parse(view.private_metadata);

  // Apply the inputs to the state
  runtime.applyInputs(data, inputs);

  // Construct the state URL
  let url = settings.BOOMI_FLOW_BASE_URL + settings.BOOMI_FLOW_RUN_PATH + '/' + data.stateId;

  // Make the request out to the flow runtime
  runtime.execute(url, data, options, respond, body, data.channel_id);
});

// Called as a result of an outcome being clicked
app.action(/^mes_outcome_*/, async ({ action, ack, respond, body }) => {
  await ack();

  // Get the state out of the clicked button
  let data = JSON.parse(action.value);

  // Construct the state URL
  let url = settings.BOOMI_FLOW_BASE_URL + settings.BOOMI_FLOW_RUN_PATH  + '/' + data.stateId;

  // Make the request out to the flow runtime
  runtime.execute(url, data, options, respond, body, data.channel_id);
});

app.command('/boomi', async ({ command, ack, say, body, context, respond }) => {
  // Acknowledge command request
  await ack();

  let commandText = command.text;

  // The user has added a command to calling Boomi
  if (!logic.isNullOrEmpty(command.text)) {
    commandText = commandText.toLowerCase();

    if (commandText.startsWith('modal')) {
      commandText = commandText.replace('modal', '').trim();
    } else if (commandText.startsWith('mixed')) {
      commandText = commandText.replace('mixed', '').trim();
    }

    let flow = runtime.getFlowByName(commandText);
    
        // Make the request out to the flow runtime
        runtime.execute(
          settings.BOOMI_FLOW_BASE_URL + settings.BOOMI_FLOW_RUN_PATH,
          { "id": response.data.id.id },
          options,
          respond,
          body,
          command.channel_id);
      })
      .catch(error => {
        console.log(error);
      });
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();
