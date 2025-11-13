module.exports = {
  REQ_TIMEOUT: 17 * 1000,
  EXAMPLE_API_URL: "https://jsonplaceholder.typicode.com/todos/1",
  // Heatmap metrics API configuration
  HEATMAP_METRICS_API_URL: process.env.HEATMAP_METRICS_API_URL || "",
  STACK_API_KEY: process.env.STACK_API_KEY || "",
  // Lytics API configuration
  LYTICS_API_URL: process.env.LYTICS_API_URL || "",
  LYTICS_AUTHORIZATION_TOKEN: process.env.LYTICS_AUTHORIZATION_TOKEN || "",
  LOGS: {
    QUERY_PARAMS: "Request's query-string params are ",
    REQ_BODY: "Request's body: ",
    RESPONSE: "Final response is ",
  },
  HTTP_CODES: {
    OK: 200,
    BAD_REQ: 400,
    NOT_FOUND: 404,
    SOMETHING_WRONG: 500,
  },
  HTTP_TEXTS: {
    QUERY_MISSING: "Query string parameters are missing.",
    SOMETHING_WENT_WRONG: "Something went wrong, please try again later.",
  },
  HTTP_RESPONSE_HEADERS: {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Expose-Headers": "authToken",
  },
};
