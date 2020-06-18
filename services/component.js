/*jshint esversion: 6 */
const logic = require('../utils/logic');
const block = require('./block');

function compareByOrder(a, b) {
  const orderA = a.order;
  const orderB = b.order;

  let comparison = 0;
  if (orderA > orderB) {
    comparison = 1;
  } else if (orderA < orderB) {
    comparison = -1;
  }
  return comparison;
}

function orderContainers(pageContainerResponses, pageContainerDataResponses) {
  if (logic.isNullOrEmpty(pageContainerResponses)) {
    return null;
  }

  var containers = [];

  orderMergeAndFlattenContainers(
    pageContainerResponses,
    pageContainerDataResponses,
    containers);

  return containers;
}

function orderMergeAndFlattenContainers(
  pageContainerResponses,
  pageContainerDataResponses,
  containers) {
  // First sort the page containers at this level in the heirarchy
  pageContainerResponses.sort(compareByOrder);

  // Add the ordered containers into a merged and flattened array
  pageContainerResponses.forEach((pageContainerResponse) => {
    // Filter the page container data responses to find the matching data for
    // this container
    let filteredPageContainerDataResponse = pageContainerDataResponses.filter(
      pageContainerDataResponse =>
      pageContainerDataResponse.pageContainerId == pageContainerResponse.id)[0];

    // Merge the objects to simplify block construction
    let mergedPageContainerResponse = Object.assign(
      pageContainerResponse,
      filteredPageContainerDataResponse);

    // Add the merged object to the ordered list
    containers.push(mergedPageContainerResponse);

    // Check to see if this container has children, as they should appear next
    if (!logic.isNullOrEmpty(pageContainerResponse.pageContainerResponses)) {
      orderMergeAndFlattenContainers(
        pageContainerResponse.pageContainerResponses,
        pageContainerDataResponses,
        containers);
    }
  });
}

function orderComponents(pageComponentResponses, pageComponentDataResponses) {
  if (pageComponentResponses == null) {
    return null;
  }

  var components = [];

  // First sort the page components (when we filter, same orders will resolve)
  pageComponentResponses.sort(compareByOrder);

  // Add the ordered containers into a merged and flattened array
  pageComponentResponses.forEach((pageComponentResponse) => {
    // Filter the page component data responses to find the matching data for
    // this component
    let filteredPageComponentDataResponse = pageComponentDataResponses.filter(
      pageComponentDataResponse =>
      pageComponentDataResponse.pageComponentId == pageComponentResponse.id)[0];

    // Merge the objects to simplify block construction
    let mergedPageComponentResponse = Object.assign(
      pageComponentResponse,
      filteredPageComponentDataResponse);

    // Add the merged object to the ordered list
    components.push(mergedPageComponentResponse);
  });

  return components;
}

module.exports = {
  getBlocks: function (data, converter) {
    var response = {};

    response.blocks = [];
    response.message = true;
    response.modal = true;
    response.home = true;

    // Assign the title from the page response
    response.title = data.mapElementInvokeResponses[0].pageResponse.label;
    if (logic.isNullOrEmpty(response.title)) {
      response.title = "Boomi";
    }

    // Order, flatten and merge the containers
    let orderedContainers = orderContainers(
      data.mapElementInvokeResponses[0].pageResponse.pageContainerResponses,
      data.mapElementInvokeResponses[0].pageResponse.pageContainerDataResponses);

    // Order and merge the components
    let orderedComponents = orderComponents(
      data.mapElementInvokeResponses[0].pageResponse.pageComponentResponses,
      data.mapElementInvokeResponses[0].pageResponse.pageComponentDataResponses);

    // Got through each of the containers and merge the components
    orderedContainers.forEach((orderedContainer) => {
      // Generate the block for the container
      response.blocks = response.blocks.concat(block.createContainer(orderedContainer));

      // Filter the components for this container
      let filteredComponents = orderedComponents.filter(
        orderedComponent =>
        orderedComponent.pageContainerId == orderedContainer.id);

      // Got through each of the filtered components and generate the blocks
      filteredComponents.forEach((filteredComponent) => {
        componentResponse = block.createComponent(filteredComponent, converter);
        response.blocks = response.blocks.concat(componentResponse.blocks);

        // Make sure we're telling the engine how to render this correctly
        if (componentResponse.message == false) {
          response.message = false;
        } else if (componentResponse.modal == false) {
          response.modal = false;
        } else if (componentResponse.home == false) {
          response.home = false;
        }
      });
    });

    return response;
  }
};
