import axios from "axios";
import { AES, enc } from "crypto-js";
import { useLocation } from "react-router-dom";

// If you're building UI-only app, please uninstall 'crypto-js' along with '@types/crypto-js' npm module
// and remove this interceptor/index.tsx

// In case, if you're building UI+API based app
// please use isCookiesBlocked in containers/App/index.tsx to check & render error message if the cookies are blocked.

const API_BASE_URL = process.env.REACT_APP_API_URL!.toString();

const isCookiesBlocked = () => {
  try {
    const key = `MYKEY_${Math.random()}`;
    sessionStorage.setItem(key, "MY_VALUE");
    sessionStorage.removeItem(key);
    return false;
  } catch (e) {
    return true;
  }
};

const getTokenFromUrl = () =>
  new URLSearchParams(useLocation().search).get("authToken") ?? "";

const getSessionName = (apiKey: string) =>
  `${apiKey}_${process.env.REACT_APP_NAME!.toString()}_authtoken`;

const getTokenFromSession = (apiKey: string) =>
  AES.decrypt(
    sessionStorage.getItem(getSessionName(apiKey)) ?? "",
    process.env.REACT_APP_INTERCEPTOR_KEY!.toString()
  ).toString(enc.Utf8);

const setAppSession = (apiKey: string, authToken: string) =>
  sessionStorage.setItem(
    getSessionName(apiKey),
    AES.encrypt(
      authToken,
      process.env.REACT_APP_INTERCEPTOR_KEY!.toString()
    ).toString()
  );

const setAxiosInterceptors = (authTokenFromUrl: string, apiKey: string) => {
  setAppSession(apiKey, authTokenFromUrl);

  axios.interceptors.request.use((request) => {
    if (request?.url?.startsWith(API_BASE_URL)) {
      request!.headers!.authToken = getTokenFromSession(apiKey);
    }
    return request;
  });

  axios.interceptors.response.use((response) => {
    if (
      response?.status === 200 &&
      response?.config?.url?.startsWith(API_BASE_URL)
    ) {
      setAppSession(apiKey, response?.headers?.authtoken ?? "");
    }
    return response;
  });
  return true;
};

export {
  setAxiosInterceptors,
  getTokenFromUrl,
  getTokenFromSession,
  isCookiesBlocked,
};
