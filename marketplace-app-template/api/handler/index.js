const axios = require("axios");
const constants = require("../constants");

const _makeThirdPartyApiCall = async (url, method, data) => {
  try {
    const res = await axios({
      url,
      method,
      data,
      headers: {
        /* custom headers can be added here */
      },
    });
    return res?.data;
  } catch (e) {
    console.error(constants.HTTP_TEXTS.SOMETHING_WENT_WRONG);
    console.error(e);
    throw e;
  }
};

const makeAPICall = () =>
  _makeThirdPartyApiCall(constants.EXAMPLE_API_URL, "GET");

// Function to fetch heatmap metrics
// TODO: Replace EXAMPLE_HEATMAP_API_URL with your actual heatmap metrics API URL
const getHeatmapMetrics = async (heatmapType) => {
  // You can construct the API URL based on heatmapType
  // For example: `${constants.HEATMAP_API_BASE_URL}/metrics?type=${heatmapType}`
  const heatmapApiUrl = constants.HEATMAP_API_URL
    ? `${constants.HEATMAP_API_URL}?type=${heatmapType}`
    : constants.EXAMPLE_API_URL; // Fallback to example URL

  const response = await _makeThirdPartyApiCall(heatmapApiUrl, "GET");

  // Return the response with metrics and URL
  // Adjust this structure based on your actual API response format
  return {
    metrics: response?.metrics || response?.data || response,
    url: response?.url || response?.heatmapUrl || '',
    heatmapType: heatmapType
  };
};

module.exports = {
  makeAPICall,
  getHeatmapMetrics,
};
