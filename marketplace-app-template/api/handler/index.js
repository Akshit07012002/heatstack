const axios = require("axios");
const constants = require("../constants");

const _makeThirdPartyApiCall = async (url, method, data, customHeaders = {}) => {
  try {
    console.log("[API Call] Making request:", {
      url,
      method,
      hasData: !!data,
      headers: Object.keys(customHeaders),
    });

    const res = await axios({
      url,
      method,
      data,
      headers: {
        /* custom headers can be added here */
        ...customHeaders,
      },
    });

    console.log("[API Call] Response received:", {
      status: res?.status,
      statusText: res?.statusText,
      hasData: !!res?.data,
    });

    return res?.data;
  } catch (e) {
    console.error("[API Call] Error occurred:", {
      message: e?.message,
      status: e?.response?.status,
      statusText: e?.response?.statusText,
      url: e?.config?.url,
    });
    console.error(constants.HTTP_TEXTS.SOMETHING_WENT_WRONG);
    console.error(e);
    throw e;
  }
};

const makeAPICall = () =>
  _makeThirdPartyApiCall(constants.EXAMPLE_API_URL, "GET");

// Function to fetch heatmap metrics
const getHeatmapMetrics = async (origin) => {
  console.log("[getHeatmapMetrics] Function called with origin:", origin);

  if (!constants.HEATMAP_METRICS_API_URL) {
    console.error("[getHeatmapMetrics] HEATMAP_METRICS_API_URL is not configured");
    throw new Error("HEATMAP METRICS API URL is not configured");
  }
  if (!constants.STACK_API_KEY) {
    console.error("[getHeatmapMetrics] STACK_API_KEY is not configured");
    throw new Error("STACK API KEY is not configured");
  }

  const heatmapApiUrl = `${constants.HEATMAP_METRICS_API_URL}/${constants.STACK_API_KEY}/events?origin=${origin}`;
  console.log("[getHeatmapMetrics] Constructed API URL:", heatmapApiUrl);

  const response = await _makeThirdPartyApiCall(heatmapApiUrl, "GET");

  console.log("[getHeatmapMetrics] Response received:", {
    hasMetrics: !!response?.metrics,
    hasData: !!response?.data,
    hasUrl: !!response?.url,
    hasHeatmapUrl: !!response?.heatmapUrl,
  });

  // Return the response with metrics and URL
  // Adjust this structure based on your actual API response format
  const result = {
    metrics: response?.metrics || response?.data || response,
    url: response?.url || response?.heatmapUrl || '',
  };

  console.log("[getHeatmapMetrics] Returning result:", {
    hasMetrics: !!result.metrics,
    hasUrl: !!result.url,
  });

  return result;
};

// Function to fetch Lytics segments
const getLyticsSegments = async () => {
  console.log("[getLyticsSegments] Function called");

  if (!constants.LYTICS_API_URL) {
    console.error("[getLyticsSegments] LYTICS_API_URL is not configured");
    throw new Error("LYTICS API URL is not configured");
  }
  if (!constants.LYTICS_AUTHORIZATION_TOKEN) {
    console.error("[getLyticsSegments] LYTICS_AUTHORIZATION_TOKEN is not configured");
    throw new Error("LYTICS AUTHORIZATION TOKEN is not configured");
  }

  console.log("[getLyticsSegments] Making API call to:", constants.LYTICS_API_URL);

  // const response = await _makeThirdPartyApiCall(
  //   constants.LYTICS_API_URL,
  //   "GET",
  //   undefined,
  //   {
  //     Authorization: constants.LYTICS_AUTHORIZATION_TOKEN,
  //     accept: "application/json",
  //   }
  // );

  const response = await fetch(
    'https://apple.contentstackapps.com/api/lytics/getAudiences',
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    }
  );
  const data = await response.json();
  console.log("[getLyticsSegments] Response data:", data);

  console.log("[getLyticsSegments] Response received:", {
    hasData: !!response,
    isArray: Array.isArray(response),
    type: typeof response,
  });

  return response;
};

module.exports = {
  makeAPICall,
  getHeatmapMetrics,
  getLyticsSegments,
};
