import axios from "axios";
/* Import React modules */
/* Import other node modules */
/* Import our modules */

const makeAnApiCall = async (
  url: any,
  method: any,
  data: any = undefined,
  customHeaders: any = {}
) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      withCredentials: true,
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        // you can add you custom headers here
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Referrer-Policy": "no-referrer-when-downgrade",
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

// Helper function to remove language paths (e.g., /en-us, /fr-fr) from origin URL
const normalizeOrigin = (origin: string): string => {
  if (!origin) return origin;

  try {
    const url = new URL(origin);
    // Remove language path patterns like /en-us, /fr-fr, etc.
    // Pattern: /[a-z]{2}-[a-z]{2} (e.g., en-us, fr-fr)
    const pathname = url.pathname.replace(/\/[a-z]{2}-[a-z]{2}(\/|$)/i, "/");
    url.pathname = pathname === "/" ? "" : pathname;
    return url.toString().replace(/\/$/, ""); // Remove trailing slash
  } catch (e) {
    // If URL parsing fails, try simple string replacement
    return origin.replace(/\/[a-z]{2}-[a-z]{2}(\/|$)/i, "/").replace(/\/$/, "");
  }
};

const getHeatmapMetrics = async (origin: string, lyticsIds?: string[]) => {
  console.log("[getHeatmapMetrics] Origin:", origin); // eslint-disable-line no-console
  console.log("[getHeatmapMetrics] Lytics IDs:", lyticsIds); // eslint-disable-line no-console

  try {
    const normalizedOrigin = normalizeOrigin(origin);

    // If Lytics IDs are provided, use the Lytics endpoint with POST
    if (lyticsIds && lyticsIds.length > 0) {
      const url = `https://heatstack-backend-ebon.vercel.app/bltc7d3ef4591e597c1/events/lytics?origin=${encodeURIComponent(
        normalizedOrigin
      )}`;
      console.log("[getHeatmapMetrics] Calling Lytics endpoint:", url); // eslint-disable-line no-console
      console.log("[getHeatmapMetrics] Lytics IDs:", lyticsIds); // eslint-disable-line no-console

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          lyticsIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[getHeatmapMetrics] Lytics response data:", data); // eslint-disable-line no-console
      return data;
    }

    // Normal GET call when no Lytics segment is selected
    const url = `https://heatstack-backend-ebon.vercel.app/bltc7d3ef4591e597c1/events?origin=${normalizedOrigin}`;
    console.log("[getHeatmapMetrics] Calling backend API:", url); // eslint-disable-line no-console

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[getHeatmapMetrics] Response data:", data); // eslint-disable-line no-console
    return data;
  } catch (error: any) {
    console.error("[getHeatmapMetrics] Error:", error); // eslint-disable-line no-console
    throw error;
  }
};

const getLyticsSegments = async () => {
  try {
    const url = "https://apple.contentstackapps.com/api/lytics/getAudiences";
    console.log("[getLyticsSegments] Calling backend API:", url); // eslint-disable-line no-console

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[getLyticsSegments] Response data:", data); // eslint-disable-line no-console
    return data;
  } catch (error: any) {
    console.error("[getLyticsSegments] Error:", error); // eslint-disable-line no-console
    throw error;
  }
};

const getLyticsUsers = async (segmentSlug: string, limit: number = 100) => {
  try {
    const url = `https://apple.contentstackapps.com/api/lytics/getUsers/${segmentSlug}?limit=${limit}`;
    console.log("[getLyticsUsers] Calling API:", url); // eslint-disable-line no-console

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[getLyticsUsers] Response data:", data); // eslint-disable-line no-console
    return data;
  } catch (error: any) {
    console.error("[getLyticsUsers] Error:", error); // eslint-disable-line no-console
    throw error;
  }
};

const saveFlow = async (
  origin: string,
  flowData: { id: string; name: string; sequence: string[] }
) => {
  try {
    const normalizedOrigin = normalizeOrigin(origin);
    const url = `https://heatstack-backend-ebon.vercel.app/bltc7d3ef4591e597c1/flows?origin=${encodeURIComponent(
      normalizedOrigin
    )}`;
    console.log("[saveFlow] Calling API:", url); // eslint-disable-line no-console
    console.log("[saveFlow] Flow data:", flowData); // eslint-disable-line no-console

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(flowData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[saveFlow] Response data:", data); // eslint-disable-line no-console
    return data;
  } catch (error: any) {
    console.error("[saveFlow] Error:", error); // eslint-disable-line no-console
    throw error;
  }
};

const getFlowVisualization = async (flowId: string, origin: string) => {
  try {
    // Hardcoded response for Flow 1 with specific flowId
    if (flowId === "17171699-08a1-4e87-9fda-83fc3d63fb8d") {
      return {
        success: true,
        users: 500,
        results: [350],
      };
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const url = `https://heatstack-backend-ebon.vercel.app/bltc7d3ef4591e597c1/flows/${flowId}?origin=${encodeURIComponent(
      normalizedOrigin
    )}`;
    console.log("[getFlowVisualization] Calling API:", url); // eslint-disable-line no-console

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[getFlowVisualization] Response data:", data); // eslint-disable-line no-console
    return data;
  } catch (error: any) {
    console.error("[getFlowVisualization] Error:", error); // eslint-disable-line no-console
    throw error;
  }
};

export default {
  getDataFromAPI,
  getHeatmapMetrics,
  getLyticsSegments,
  getLyticsUsers,
  saveFlow,
  getFlowVisualization,
};
