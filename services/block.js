/*jshint esversion: 6 */
const logic = require('../utils/logic');

module.exports = {
  createContainer: function (container) {
    let blocks = [];

    if (!logic.isNullOrEmpty(container.label)) {
      blocks.push({
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": "*" + container.label + "*"
          }
        ]
      });
    }

    blocks.push({
      "type": "divider"
    });

    return blocks;
  },
  createComponent: function (component, converter) {
    let response = {};

    response.blocks = [];
    response.message = true;
    response.modal = true;
    response.home = true;

    if (logic.isEqual(component.componentType, "presentation")) {
      response.blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": converter.convert('mrkdwn', component.content)
        }
      });
    } else if (logic.isEqual(component.componentType, "input")) {
      response.message = false;
      response.blocks.push({
        "type": "input",
        "block_id": "b_" + component.id,
        "element": {
          "type": "plain_text_input",
          "action_id": "a_" + component.id,
          "placeholder": {
            "type": "plain_text",
            "text": converter.convert('mrkdwn', component.hintValue)
          },
          "initial_value": component.contentValue,
          "max_length": component.maxSize
        },
        "label": {
          "type": "plain_text",
          "text": component.label,
          "emoji": false
        },
        "hint": {
          "type": "plain_text",
          "text": converter.convert('mrkdwn', component.helpInfo)
        },
        "optional": !component.isRequired
      });
    } else {
      throw "Component type is not supported: " + component.componentType;
    }

    return response;
  }
};
