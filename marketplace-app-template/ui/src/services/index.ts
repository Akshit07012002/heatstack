import axios from "axios";
/* Import React modules */
/* Import other node modules */
/* Import our modules */

const makeAnApiCall = async (url: any, method: any, data: any = undefined, customHeaders: any = {}) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        // you can add you custom headers here
        "Access-Control-Allow-Origin": "*",
        ...customHeaders,
      },
    });
    return response?.data;
  } catch (e: any) {
    console.error(e);
    const { status, data: resData } = e?.response || {};

    // Error handling can be done here
    // return appropriate data for each case accoring to the app's needs
    if (status === 500) {
      return resData;
    }
    if (status === 429) {
      return "Rate-limiting error";
    }
    return "something went wrong...";
  }
};

/* Below is just an example function which can be called
from any of the app container pages to make an API call. */
const getDataFromAPI = (data: any = undefined) =>
  makeAnApiCall("https://jsonplaceholder.typicode.com/todos/1", "GET", data);

/* Function to fetch heatmap metrics from the API */
const getHeatmapMetrics = async (heatmapType: string, config: any = {}) => {
  const { HEATMAP_METRICS_API_URL } = process.env;
  if (!HEATMAP_METRICS_API_URL) {
    throw new Error("HEATMAP METRICS API URL is not configured");
  }

  const url = `${HEATMAP_METRICS_API_URL}?heatmapType=${heatmapType}&stack_apiKey=${config.stack_apiKey || ''}`;
  return makeAnApiCall(url, "GET");
};

const getLyticsSegments = async () => {
  const { REACT_APP_LYTICS_API_URL } = process.env;
  console.log("REACT_APP_LYTICS_API_URL:", REACT_APP_LYTICS_API_URL); // eslint-disable-line no-console
  if (!REACT_APP_LYTICS_API_URL) {
    throw new Error("LYTICS API URL is not configured");
  }

  return makeAnApiCall(
    REACT_APP_LYTICS_API_URL,
    "GET"
  );
};

export default {
  getDataFromAPI,
  getHeatmapMetrics,
  getLyticsSegments,
};
