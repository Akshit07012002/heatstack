const constants = require("../constants");

const isEmpty = (val) =>
  val === undefined ||
  val === null ||
  (typeof val === "object" && !Object.keys(val)?.length) ||
  (typeof val === "string" && !val.trim().length);

const getResponseObject = (statusCode, query, body = {}) => {
  const res = {
    statusCode,
    headers: {
      ...constants.HTTP_RESPONSE_HEADERS,
      authToken: query?.authToken ?? "",
    },
    body: JSON.stringify(body),
  };

  console.info(constants.LOGS.RESPONSE, res);
  return res;
};

module.exports = {
  isEmpty,
  getResponseObject,
};
