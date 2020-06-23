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
  createPlaceholder: function (value, converter) {
    if (!logic.isNullOrEmpty(value)) {
      return {
        "type": "plain_text",
        "text": converter.convert('mrkdwn', value)
      };
    }
    return null;
  },
  createComponent: function (component, converter) {
    let response = {};
    let block = {};

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
    } else if (logic.isEqual(component.componentType, "input") ||
               logic.isEqual(component.componentType, "textarea")) {
      let elementType = "plain_text_input";
      let multiline = false;
      if (logic.isEqual(component.componentType, "textarea")) {
        multiline = true;
      }

      if (logic.isEqual(component.contentType, "ContentDateTime")) {
        elementType = "datepicker";
      }

      response.message = false;

      block = {
        "type": "input",
        "block_id": "b_" + component.id,
        "element": {
          "type": elementType,
          "action_id": "a_" + component.id
        },
        "label": {
          "type": "plain_text",
          "text": component.label,
          "emoji": false
        },
        "optional": !component.isRequired
      };

      // Assign the initial value
      if (logic.isEqual(component.contentType, "ContentDateTime")) {
        if (!logic.isNullOrEmpty(component.contentValue)) {
          block.element.initial_date = component.contentValue;
        }
      } else {
        if (!logic.isNullOrEmpty(component.contentValue)) {
          block.element.initial_value = component.contentValue;
        }
        block.element.max_length = component.maxSize;
        block.element.multiline = multiline;
      }

      // Add placeholder if it exists
      if (!logic.isNullOrEmpty(component.hintValue)) {
        block.element.placeholder = module.exports.createPlaceholder(component.hintValue, converter);
      }

      // Add hint if it exists
      if (!logic.isNullOrEmpty(component.helpInfo)) {
        block.hint = module.exports.createPlaceholder(component.helpInfo, converter);
      }

      response.blocks.push(block);
    } else if (logic.isEqual(component.componentType, "radio") ||
               logic.isEqual(component.componentType, "select")) {
      let options = [];
      let blockType = "";

      if (logic.isEqual(component.componentType, "radio")) {
        if (component.isMultiSelect) {
          blockType = "checkboxes";
        } else {
          blockType = "radio_buttons";
        }
      } else {
        if (component.isMultiSelect) {
          blockType = "multi_static_select";
        } else {
          blockType = "static_select";
        }
      }

      if (!logic.isNullOrEmpty(component.objectData)) {
        let displayColumn = component.columns.filter(
          column =>
          column.isDisplayValue == true)[0];

        component.objectData.forEach((objectDataEntry) => {
          // Find the actual column in the object data
          let columnToDisplay = objectDataEntry.properties.filter(
            property =>
            property.typeElementPropertyId == displayColumn.typeElementPropertyId)[0];

          // Serialize the object data into the option
          options.push({
            "text": {
              "type": "plain_text",
              "text": converter.convert('mrkdwn', columnToDisplay.contentValue)
            },
            "value": objectDataEntry.externalId
          });
        });
      }

      block = {
        "type": "input",
        "block_id": "b_" + component.id,
        "element": {
          "type": blockType,
          "action_id": "a_" + component.id,
          "options": options
        },
        "label": {
          "type": "plain_text",
          "text": converter.convert('mrkdwn', component.label),
          "emoji": false
        },
        "optional": !component.isRequired
      };

      // Add placeholder if it exists
      if (!logic.isNullOrEmpty(component.hintValue)) {
        block.accessory.placeholder = module.exports.createPlaceholder(component.hintValue, converter);
      }

      response.blocks.push(block);
    } else if (logic.isEqual(component.componentType, "image")) {
      response.blocks.push({
        "type": "image",
        "title": {
          "type": "plain_text",
          "text": component.label,
          "emoji": true
        },
        "image_url": component.imageUri,
        "alt_text": component.label
      });
    } else {
      throw "Component type is not supported: " + component.componentType;
    }

    return response;
  }
};
