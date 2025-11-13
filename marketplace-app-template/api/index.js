const constants = require("./constants");
const utils = require("./utils");
const { makeAPICall, getHeatmapMetrics, getLyticsSegments } = require("./handler");

exports.handler = async ({ queryStringParameters: query, body }) => {
  try {
    console.info(constants.LOGS.QUERY_PARAMS, query);
    console.info(constants.LOGS.REQ_BODY, body);

    if (utils.isEmpty(query)) {
      throw {
        statusCode: constants.HTTP_CODES.BAD_REQ,
        message: constants.HTTP_TEXTS.QUERY_MISSING,
      };
    }

    // Check if this is a heatmap metrics request
    if (query.origin) {
      const heatmapData = await getHeatmapMetrics(query.origin);
      return utils.getResponseObject(
        constants.HTTP_CODES.OK,
        query,
        heatmapData
      );
    }

    // Check if this is a Lytics segments request
    if (query.lytics === "true" || query.action === "lytics") {
      const lyticsData = await getLyticsSegments();
      return utils.getResponseObject(
        constants.HTTP_CODES.OK,
        query,
        lyticsData
      );
    }

    return utils.getResponseObject(
      constants.HTTP_CODES.OK,
      query,
      (await makeAPICall()) || {}
    );
  } catch (e) {
    // log the stack_api_key which you either get it in query params or in the body
    console.error(`Error: api_key - ${query?.stack_apiKey}`);
    return utils.getResponseObject(
      e?.statusCode || constants.HTTP_CODES.SOMETHING_WRONG,
      query,
      e?.message || constants.HTTP_TEXTS.SOMETHING_WENT_WRONG
    );
  }
};
