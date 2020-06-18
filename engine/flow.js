/*jshint esversion: 6 */
const component = require('../services/component');
const block = require('../services/block');

const logic = require('../utils/logic');
const settings = require('../utils/settings');

module.exports = {
  getResponse: function(data, state, converter) {
    let flowResponse = {};

    componentResponse = component.getBlocks(data, converter);

    if (componentResponse.message == true) {
      flowResponse.type = 'message';

      let actions = module.exports.getActions(data, state);
      if (!logic.isNullOrEmpty(actions)) {
        // We add the actions into the blocks as this is a message
        componentResponse.blocks = componentResponse.blocks.concat(actions);
      }

      flowResponse.json = {
        blocks: componentResponse.blocks,
        response_type: 'ephemeral'
      };
    } else if (componentResponse.modal == true) {
      flowResponse.type = 'modal';

      // Get the outcome out for the submit
      let outcome = module.exports.getSubmitOutcome(data);

      // Assign the outcome identifier to this button state
      state.mapElementInvokeRequest.selectedOutcomeId = outcome.id;

      flowResponse.json = {
        view: {
          type: 'modal',
          callback_id: 'mod_outcome_one',
          title: {
            type: 'plain_text',
            text: componentResponse.title
          },
          private_metadata: JSON.stringify(state),
          blocks: componentResponse.blocks,
          submit: {
            type: 'plain_text',
            text: outcome.label
          }
        }
      };
    }

    return flowResponse;
  },
  getActions: function(data, state) {
    let blocks = null;

    if (data == null) {
      throw 'Data cannot be null to create the Flow outcomes';
    }

    if (logic.isNullOrEmpty(data.mapElementInvokeResponses)) {
      throw 'The Flow does not have any Map Elements to visualize';
    }

    let outcomes = data.mapElementInvokeResponses[0].outcomeResponses;
    let elements = [];

    if (!logic.isNullOrEmpty(outcomes)) {
        outcomes.forEach((outcome) => {
        // Assign the outcome identifier to this button state
        state.mapElementInvokeRequest.selectedOutcomeId = outcome.id;

        // Push the button into the blocks
        elements.push(
          {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": outcome.label
            },
            "value": JSON.stringify(state),
            "action_id": "mes_outcome_" + outcome.id
          }
        );
      });
    }

    if (!logic.isNullOrEmpty(elements)) {
      blocks = [{
        "type": "actions",
        "elements": elements
      }];
    }

    return blocks;
  },
  getSubmitOutcome: function(data) {
    if (data == null) {
      throw 'Data cannot be null to create the Flow outcomes';
    }

    if (logic.isNullOrEmpty(data.mapElementInvokeResponses)) {
      throw 'The Flow does not have any Map Elements to visualize';
    }

    let outcomes = data.mapElementInvokeResponses[0].outcomeResponses;

    if (logic.isNullOrEmpty(outcomes)) {
      throw 'At least one Outcome must be provided for pages with input';
    }

    if (outcomes.length > 1) {
      throw 'Only one Outcome can be provided for pages with input';
    }

    return outcomes[0];
  }
};
