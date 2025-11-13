/* Import React modules */
/* eslint-disable */
import React, { useEffect, useState } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { Button, FieldLabel, ButtonGroup, Icon, Select, TextInput, Notification } from "@contentstack/venus-components";
import { v4 as uuidv4 } from 'uuid';
import { TypeSDKData } from "../../common/types";
/* Import our modules */
import services from '../../services';
import Chatbot from '../../components/Chatbot';
/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

interface HeatmapData {
    type: string;
    data: any;
    metrics?: any;
    url?: string;
}

interface HeatmapIframeProps {
    url: string;
    type: string;
    metrics?: any;
}

interface FlowFunnelProps {
    data: {
        success: boolean;
        users: number;
        results: number[];
    };
    flowSequence: string[];
}

const FlowFunnelVisualization: React.FC<FlowFunnelProps> = ({ data, flowSequence }) => {
    const { users, results } = data;

    // users = how many started at A
    // results[0] = how many came from A to B
    // results[1] = how many came from B to C
    // results[2] = how many came from C to D, etc.

    // Build funnel data: A -> B -> C -> D -> ...
    const funnelData = [users, ...results]; // A (users), B (results[0]), C (results[1]), etc.
    const maxValue = Math.max(...funnelData);

    // Generate step labels: A, B, C, D, etc.
    const stepLabels = flowSequence.map((step: string, idx: number) =>
        String.fromCharCode(65 + idx)
    );

    // Calculate percentages and drop-off rates
    const getPercentage = (value: number) => ((value / users) * 100).toFixed(1);
    const getDropOff = (current: number, previous: number) => {
        if (previous === 0) return '0%';
        return `${(((previous - current) / previous) * 100).toFixed(1)}%`;
    };

    // Calculate conversion rate from start to end
    const finalValue = results.length > 0 ? results[results.length - 1] : users;
    const conversionRate = getPercentage(finalValue);
    const totalDropOff = users - finalValue;
    const totalDropOffPercentage = getDropOff(finalValue, users);

    return (
        <div className="flow-funnel-container">
            <div className="flow-funnel-header">
                <FieldLabel htmlFor="flow-funnel" className="fullpage-field">
                    User Flow Funnel
                </FieldLabel>
                <div className="flow-funnel-total">
                    <span className="total-label">Starting Users:</span>
                    <span className="total-value">{users.toLocaleString()}</span>
                </div>
            </div>

            <div className="flow-funnel-chart">
                {funnelData.map((value, index) => {
                    const width = (value / maxValue) * 100;
                    const percentage = getPercentage(value);
                    const dropOff = index > 0 ? getDropOff(value, funnelData[index - 1]) : null;
                    const stepLabel = stepLabels[index] || `Step ${index + 1}`;
                    const stepName = flowSequence[index] || stepLabel;

                    return (
                        <div key={index} className="funnel-segment">
                            <div className="funnel-segment-header">
                                <div className="funnel-step-info">
                                    <span className="funnel-step-label">{stepLabel}</span>
                                    <span className="funnel-step-name" title={stepName}>
                                        {stepName.length > 40 ? `${stepName.substring(0, 40)}...` : stepName}
                                    </span>
                                </div>
                                <div className="funnel-step-stats">
                                    <span className="funnel-value">{value.toLocaleString()}</span>
                                    <span className="funnel-percentage">({percentage}%)</span>
                                    {dropOff && (
                                        <span className="funnel-dropoff">↓ {dropOff}</span>
                                    )}
                                </div>
                            </div>
                            <div className="funnel-bar-container">
                                <div
                                    className="funnel-bar"
                                    style={{ width: `${width}%` }}
                                >
                                    <div className="funnel-bar-fill" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flow-funnel-summary">
                <div className="summary-item">
                    <span className="summary-label">Conversion Rate:</span>
                    <span className="summary-value">{conversionRate}%</span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Total Drop-off:</span>
                    <span className="summary-value">
                        {totalDropOff.toLocaleString()} users ({totalDropOffPercentage})
                    </span>
                </div>
                <div className="summary-item">
                    <span className="summary-label">Final Step Users:</span>
                    <span className="summary-value">{finalValue.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

const HeatmapIframe: React.FC<HeatmapIframeProps> = ({ url, type, metrics }) => {

    console.log("FullPage - Heatmap iframe url:", url);
    console.log("FullPage - Heatmap iframe type:", type);
    console.log("FullPage - Heatmap iframe metrics:", metrics);

    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const buildIframeUrl = () => {
        if (!url) return '';

        try {
            const urlObj = new URL(`https://apple.contentstackapps.com`);
            urlObj?.searchParams?.set('heatmapMode', 'true');

            return urlObj?.toString();
        } catch (e) {

        }
    };

    useEffect(() => {
        const iframe = iframeRef?.current;
        if (!iframe || !metrics) return;

        const sendFormattedMetrics = () => {
            try {
                // Format metrics - use formatted metrics if available, otherwise format from aggregated
                let formattedMetrics = metrics?.formatted;

                // If formatted metrics don't exist, format from aggregated metrics
                if (!formattedMetrics && metrics?.aggregated) {
                    const eventTypeMap: Record<string, string> = {
                        "visibility": "view",
                        "view": "view",
                        "clicks": "click",
                        "click": "click",
                        "hover": "hover"
                    };
                    const eventType = eventTypeMap[type] || type;

                    formattedMetrics = Object.keys(metrics.aggregated)?.map((cslp) => {
                        const metricData = metrics.aggregated?.[cslp];
                        const value = (eventType === "view" ? metricData?.view :
                            eventType === "click" ? metricData?.click :
                                eventType === "hover" ? metricData?.hover : 0);

                        return {
                            cslp: cslp,
                            eventType: eventType,
                            value: value
                        };
                    });
                }

                // Fallback to full metrics if formatting fails
                const metricsToSend = formattedMetrics || metrics;

                if (iframe?.contentWindow) {
                    iframe.contentWindow.postMessage(
                        {
                            type: 'heatmap-metrics',
                            heatmapType: type,
                            metrics: metricsToSend
                        },
                        '*'
                    );
                    console.log('FullPage - Formatted metrics sent to iframe:', { type, metricsToSend }); // eslint-disable-line no-console
                }
            } catch (error) {
                console.error('Error sending postMessage to iframe:', error);
            }
        };

        const handleLoad = () => {
            // Send metrics after iframe is fully loaded
            sendFormattedMetrics();
        };

        // If iframe is already loaded, send immediately
        if (iframe.contentDocument?.readyState === 'complete' || iframe.contentWindow) {
            // Small delay to ensure iframe is ready
            setTimeout(() => {
                sendFormattedMetrics();
            }, 100);
        }

        iframe?.addEventListener('load', handleLoad);
        return () => {
            iframe?.removeEventListener('load', handleLoad);
        };
    }, [metrics, type]);

    const iframeUrl = buildIframeUrl();

    if (!iframeUrl) {
        return (
            <div className="heatmap-error">
                <Icon icon="AlertCircle" size="large" />
                <p>Invalid heatmap URL</p>
            </div>
        );
    }

    return (
        <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="heatmap-iframe"
            title={`Heatmap visualization for ${type}`}
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
    );
};

const FullPage: React.FC = function () {
    const [state, setState] = useState<TypeSDKData>({
        config: {},
        location: {},
        appSdkInitialized: false,
    });

    const [selectedHeatmap, setSelectedHeatmap] = useState<string>("visibility");
    const [selectedWebsite, setSelectedWebsite] = useState<{ label: string; value: string } | null>(null);
    const [lyticsSegments, setLyticsSegments] = useState<Array<{ label: string; value: string }>>([]);
    const [selectedLyticsSegment, setSelectedLyticsSegment] = useState<{ label: string; value: string } | null>(null);
    const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [flows, setFlows] = useState<Array<{ sequence: string[]; isSaved: boolean; id?: string; name?: string }>>([{ sequence: [], isSaved: false }]);
    const [expandedFlowIndex, setExpandedFlowIndex] = useState<number | null>(null);
    const [flowVisualizationData, setFlowVisualizationData] = useState<Record<number, any>>({});
    const [lyticsUserIds, setLyticsUserIds] = useState<string[]>([]);
    const [isFlowsSectionExpanded, setIsFlowsSectionExpanded] = useState<boolean>(true);

    const heatmapOptions = [
        {
            label: "View",
            value: "view",
            icon: "Eye",
            description: "Shows where users look on your page"
        },
        {
            label: "Click",
            value: "click",
            icon: "Select",
            description: "Tracks user click interactions"
        },
        {
            label: "Hover",
            value: "hover",
            icon: "FormSubmit",
            description: "Displays mouse hover patterns"
        },
    ];

    const [websiteOptions, setWebsiteOptions] = useState<Array<{ label: string; value: string }>>([]);

    useEffect(() => {
        ContentstackAppSdk.init()
            .then(async (appSdk) => {
                const config = await appSdk.getConfig();



                const environmentsResponse = await appSdk?.stack?.getEnvironments();
                console.log("FullPage - environmentsResponse:", environmentsResponse);

                const environmentsData = environmentsResponse?.environments || environmentsResponse?.value?.environments || [];
                const websites = environmentsData
                    ?.flatMap((env: any) => env.urls?.map((urlObj: any) => urlObj.url) || [])
                    || [];
                console.log("FullPage - websites:", websites);

                const websiteSelectOptions = websites.map((url: string) => ({
                    label: url,
                    value: url,
                }));

                setWebsiteOptions(websiteSelectOptions);

                setState({
                    config,
                    location: appSdk?.location,
                    appSdkInitialized: true,
                });

                try {
                    const lyticsResponse = await services.getLyticsSegments();
                    console.log("FullPage - Lytics segments response:", lyticsResponse);

                    // Transform lytics segments data into Select component format
                    const segmentsData = lyticsResponse?.segments || lyticsResponse?.data || lyticsResponse || [];
                    const segmentOptions = Array.isArray(segmentsData)
                        ? segmentsData.map((segment: any) => ({
                            label: segment?.name || segment?.label || segment?.id || String(segment),
                            value: segment?.slug_name,
                        }))
                        : [];

                    setLyticsSegments(segmentOptions);
                    console.log("FullPage - Transformed Lytics segments:", segmentOptions);
                } catch (error) {
                    console.error("Error fetching Lytics segments:", error);
                    setLyticsSegments([]);
                }

            })
            .catch((error) => {
                console.error("appSdk initialization error", error);
            });
    }, []);

    useEffect(() => {
        console.log("FullPage - Heatmap data:", heatmapData);
    }, [heatmapData]);

    // Load saved flows from localStorage on mount
    useEffect(() => {
        try {
            if (typeof Storage !== 'undefined') {
                const savedFlows: Array<{ sequence: string[]; isSaved: boolean; id?: string; name?: string }> = [];

                // Check for all possible flow keys (Flow 1, Flow 2, etc.)
                for (let i = 1; i <= 100; i++) { // Check up to 100 flows
                    const key = `Flow ${i}`;
                    const savedFlowData = localStorage.getItem(key);

                    if (savedFlowData) {
                        try {
                            const parsed = JSON.parse(savedFlowData);
                            if (parsed && parsed.sequence && Array.isArray(parsed.sequence)) {
                                savedFlows.push({
                                    sequence: parsed.sequence,
                                    isSaved: true,
                                    id: parsed.id,
                                    name: parsed.name || `Flow ${i}`
                                });
                            }
                        } catch (parseError) {
                            console.warn(`FullPage - Failed to parse flow from localStorage key "${key}":`, parseError);
                        }
                    }
                }

                if (savedFlows.length > 0) {
                    console.log("FullPage - Loaded saved flows from localStorage:", savedFlows);
                    setFlows(savedFlows);
                }
            }
        } catch (error: any) {
            console.warn("FullPage - Failed to load flows from localStorage:", error);
        }
    }, []);

    const fetchHeatmapData = async (heatmapType: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Pass Lytics user IDs if a segment is selected
            const lyticsIds = selectedLyticsSegment && lyticsUserIds.length > 0 ? lyticsUserIds : undefined;
            const response = await services.getHeatmapMetrics(selectedWebsite?.value || '', lyticsIds);
            console.log("FullPage - Heatmap metrics response:", response?.userData);

            // Aggregate metrics for all data-cslp elements across all users
            const aggregatedMetrics: Record<string, { view: number; click: number; hover: number }> = {};

            if (response?.userData && Array.isArray(response?.userData)) {
                response?.userData?.forEach((user: any) => {
                    if (user?.points && typeof user?.points === 'object') {
                        Object.keys(user?.points)?.forEach((dataCslpKey: string) => {
                            const pointData = user?.points?.[dataCslpKey];

                            // Initialize if not exists
                            if (!aggregatedMetrics?.[dataCslpKey]) {
                                aggregatedMetrics[dataCslpKey] = {
                                    view: 0,
                                    click: 0,
                                    hover: 0
                                };
                            }

                            // Aggregate view (sum)
                            aggregatedMetrics[dataCslpKey].view += pointData?.view || 0;

                            // Aggregate click (sum all values in the array)
                            if (Array.isArray(pointData?.click)) {
                                aggregatedMetrics[dataCslpKey].click += pointData.click.reduce((sum: number, val: number) => sum + (val || 0), 0);
                            } else if (typeof pointData?.click === 'number') {
                                aggregatedMetrics[dataCslpKey].click += pointData.click;
                            }

                            // Aggregate hover (sum)
                            aggregatedMetrics[dataCslpKey].hover += pointData?.hover || 0;
                        });
                    }
                });
            }

            console.log("FullPage - Aggregated metrics:", aggregatedMetrics);

            // Create formatted data structure based on selected heatmap type
            // Map heatmapType to eventType: "visibility" -> "view", "clicks" -> "click", "hover" -> "hover"
            const eventTypeMap: Record<string, string> = {
                "visibility": "view",
                "view": "view",
                "clicks": "click",
                "click": "click",
                "hover": "hover"
            };

            const eventType = eventTypeMap?.[heatmapType] || heatmapType;

            // Create array of metrics for the selected event type
            const formattedMetrics = Object.keys(aggregatedMetrics)?.map((cslp) => {
                const metricData = aggregatedMetrics?.[cslp];
                const value = (eventType === "view" ? metricData?.view :
                    eventType === "click" ? metricData?.click :
                        eventType === "hover" ? metricData?.hover : 0);

                return {
                    cslp: cslp,
                    eventType: eventType,
                    value: value
                };
            });

            console.log("FullPage - Formatted metrics for", eventType, ":", formattedMetrics);

            const heatmapUrl = response?.url || response?.heatmapUrl || '';

            setHeatmapData({
                type: heatmapType,
                data: heatmapUrl,
                metrics: {
                    aggregated: aggregatedMetrics,
                    formatted: formattedMetrics,
                    eventType: eventType
                },
                url: websiteOptions?.find((option: any) => option.value === selectedWebsite?.value)?.label || ''
            });
        } catch (err: any) {
            console.error("Error fetching heatmap data:", err);
            const errorMessage = err?.message || "Failed to load heatmap data";

            // Provide more specific error messages
            if (errorMessage.includes("Failed to fetch") || errorMessage.includes("NetworkError")) {
                setError("Unable to connect to the server. Please ensure the backend server is running on localhost:8080");
            } else {
                setError(errorMessage);
            }

            setHeatmapData(null);
        } finally {
            setIsLoading(false);
        }
    };

    /* Handle your UI as per requirement. State variable will hold
    the configuration details from the appSdk. */

    const handleHeatmapSelect = (value: string) => {
        if (selectedHeatmap !== value) {
            setSelectedHeatmap(value);
            // Reset heatmap data when changing type, user needs to click "Show Heatmap" again
            if (showHeatmap) {
                setShowHeatmap(false);
                setHeatmapData(null);
            }
        }
    };

    const handleWebsiteChange = (option: any) => {
        setSelectedWebsite(option || null);
        // You can add logic here to fetch data based on selected website
    };

    const handleLyticsSegmentChange = async (option: any) => {
        setSelectedLyticsSegment(option || null);

        if (!option?.value) {
            console.warn("FullPage - No segment slug provided");
            setLyticsUserIds([]);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const response = await services.getLyticsUsers(option.value, 100);
            console.log("FullPage - Lytics users response:", response);

            // Extract user IDs from the response
            // Response structure: { userIds: string[], total: number }
            let userIds: string[] = [];
            if (response?.userIds && Array.isArray(response.userIds)) {
                userIds = response.userIds;
            } else if (Array.isArray(response)) {
                userIds = response.map((user: any) => user?.id || user?.userId || user?._id || String(user)).filter(Boolean);
            } else if (response?.users && Array.isArray(response.users)) {
                userIds = response.users.map((user: any) => user?.id || user?.userId || user?._id || String(user)).filter(Boolean);
            } else if (response?.data && Array.isArray(response.data)) {
                userIds = response.data.map((user: any) => user?.id || user?.userId || user?._id || String(user)).filter(Boolean);
            } else if (response?.ids && Array.isArray(response.ids)) {
                userIds = response.ids;
            }

            console.log("FullPage - Extracted Lytics user IDs:", userIds);
            console.log("FullPage - Total users:", response?.total);
            setLyticsUserIds(userIds);

            // If heatmap is already shown, refetch with Lytics filter
            if (showHeatmap && selectedHeatmap) {
                fetchHeatmapData(selectedHeatmap);
            }
        } catch (error: any) {
            console.error("FullPage - Error fetching Lytics users:", error);
            setError(error?.message || "Failed to load users for selected segment");
            setLyticsUserIds([]);

            Notification({
                notificationContent: {
                    text: "Failed to load users for selected segment",
                },
                notificationProps: {
                    hideProgressBar: true,
                },
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Flow management functions
    const addFlow = () => {
        setFlows([...flows, { sequence: [], isSaved: false }]);
    };

    const deleteFlow = (flowIndex: number) => {
        const flowToDelete = flows[flowIndex];
        // If it's a saved flow, also remove from localStorage
        if (flowToDelete.isSaved && flowToDelete.name) {
            try {
                if (typeof Storage !== 'undefined') {
                    localStorage.removeItem(flowToDelete.name);
                }
            } catch (error) {
                console.warn("FullPage - Failed to remove flow from localStorage:", error);
            }
        }
        setFlows(flows.filter((_, index) => index !== flowIndex));
    };

    const addStepToFlow = (flowIndex: number) => {
        const maxSteps = getMaxStepsAllowed();
        const currentFlow = flows[flowIndex];

        // Don't allow editing saved flows
        if (currentFlow?.isSaved) return;

        // Only allow adding if we haven't reached the maximum
        if (currentFlow && currentFlow.sequence.length < maxSteps) {
            const updatedFlows = [...flows];
            updatedFlows[flowIndex] = {
                ...updatedFlows[flowIndex],
                sequence: [...updatedFlows[flowIndex].sequence, '']
            };
            setFlows(updatedFlows);
        }
    };

    const removeStepFromFlow = (flowIndex: number, stepIndex: number) => {
        const currentFlow = flows[flowIndex];

        // Don't allow editing saved flows
        if (currentFlow?.isSaved) return;

        const updatedFlows = [...flows];
        updatedFlows[flowIndex] = {
            ...updatedFlows[flowIndex],
            sequence: updatedFlows[flowIndex].sequence.filter((_, index) => index !== stepIndex)
        };
        setFlows(updatedFlows);
    };

    const updateStepInFlow = (flowIndex: number, stepIndex: number, value: string) => {
        const currentFlow = flows[flowIndex];

        // Don't allow editing saved flows
        if (currentFlow?.isSaved) return;

        const updatedFlows = [...flows];
        updatedFlows[flowIndex] = {
            ...updatedFlows[flowIndex],
            sequence: updatedFlows[flowIndex].sequence.map((step, idx) => idx === stepIndex ? value : step)
        };
        setFlows(updatedFlows);
    };

    // Get available data-cslp options from aggregated metrics
    const getAvailableCslpOptions = () => {
        if (!heatmapData?.metrics?.aggregated) return [];
        return Object.keys(heatmapData.metrics.aggregated).map((cslp) => ({
            label: cslp,
            value: cslp,
        }));
    };

    // Get available options for a specific flow step (excluding already selected values in that flow)
    const getAvailableOptionsForStep = (flowIndex: number, stepIndex: number) => {
        const allOptions = getAvailableCslpOptions();
        const currentFlow = flows[flowIndex];
        if (!currentFlow) return allOptions;
        const selectedValues = currentFlow.sequence.filter((_, idx) => idx !== stepIndex && _);
        return allOptions.filter(option => !selectedValues.includes(option.value));
    };

    // Get maximum number of steps allowed (based on available data-cslp values)
    const getMaxStepsAllowed = () => {
        return getAvailableCslpOptions().length;
    };

    const handleShowHeatmap = () => {
        if (!showHeatmap && selectedHeatmap) {
            fetchHeatmapData(selectedHeatmap);
        }
        setShowHeatmap(!showHeatmap);
    };

    const handleSaveFlow = async (flowIndex: number) => {
        const flowToSave = flows[flowIndex];
        const origin = selectedWebsite?.value || '';

        if (!origin) {
            console.error("FullPage - No website selected for saving flow");
            setError("Please select a website before saving the flow");
            return;
        }

        // Don't allow saving already saved flows
        if (flowToSave.isSaved) {
            console.warn("FullPage - Flow is already saved and cannot be modified");
            return;
        }

        // Create data structure
        const flowData = {
            id: uuidv4(),
            name: `Flow ${flowIndex + 1}`,
            sequence: flowToSave.sequence.filter(step => step) // Filter out empty steps
        };

        console.log("FullPage - Saving flow data:", flowData);

        // save the flow to the backend
        try {
            setIsLoading(true);
            const response = await services.saveFlow(origin, flowData);
            console.log("FullPage - Flow saved successfully:", response);

            Notification({
                notificationContent: {
                    text: "Flow saved successfully",
                },
                notificationProps: {
                    hideProgressBar: true,
                },
                type: "success"
            });

            // save the flow to the local storage (only if API call succeeds)
            try {
                if (typeof Storage !== 'undefined') {
                    localStorage.setItem(flowData.name, JSON.stringify(flowData));
                    console.log("FullPage - Flow saved to localStorage:", flowData);

                    // Update the flow state to mark it as saved
                    const updatedFlows = [...flows];
                    updatedFlows[flowIndex] = {
                        sequence: flowData.sequence,
                        isSaved: true,
                        id: flowData.id,
                        name: flowData.name
                    };
                    setFlows(updatedFlows);
                } else {
                    console.warn("FullPage - localStorage is not available");
                }
            } catch (storageError: any) {
                // localStorage might fail in cross-origin iframes or if storage is disabled
                console.warn("FullPage - Failed to save to localStorage:", storageError);
                // Don't throw - this is a non-critical operation
            }

        } catch (error: any) {
            console.error("FullPage - Error saving flow:", error);
            setError(error?.message || "Failed to save flow");

            Notification({
                notificationContent: {
                    text: "Failed to save flow",
                },
                notificationProps: {
                    hideProgressBar: true,
                    className: "modal_toast_message",
                },
                type: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVisualizeFlow = async (flowIndex: number) => {
        const flow = flows[flowIndex];
        const origin = selectedWebsite?.value || '';

        if (!flow?.id || !flow?.isSaved) {
            console.error("FullPage - Flow is not saved or missing ID");
            return;
        }

        if (!origin) {
            console.error("FullPage - No website selected for visualizing flow");
            setError("Please select a website before visualizing the flow");
            return;
        }

        // Toggle expansion
        if (expandedFlowIndex === flowIndex) {
            setExpandedFlowIndex(null);
            return;
        }

        // If data already loaded, just expand
        if (flowVisualizationData[flowIndex]) {
            setExpandedFlowIndex(flowIndex);
            return;
        }

        // Fetch visualization data
        try {
            setIsLoading(true);
            setError(null);
            const response = await services.getFlowVisualization(flow.id, origin);
            console.log("FullPage - Flow visualization data:", response);

            setFlowVisualizationData({
                ...flowVisualizationData,
                [flowIndex]: response
            });
            setExpandedFlowIndex(flowIndex);
        } catch (error: any) {
            console.error("FullPage - Error fetching flow visualization:", error);
            setError(error?.message || "Failed to load flow visualization");

            Notification({
                notificationContent: {
                    text: "Failed to load flow visualization",
                },
                notificationProps: {
                    hideProgressBar: true,
                },
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="layout-container">
            {state.appSdkInitialized && (
                <div className="fullpage-content">
                    <div className="fullpage-header">
                        <div className="fullpage-header-row">
                            <div className="fullpage-header-section">
                                <FieldLabel
                                    htmlFor="heatmap-type"
                                    className="fullpage-field"
                                >
                                    Heatmap Type
                                </FieldLabel>
                                <div className="button-group-wrapper">
                                    <ButtonGroup className="heatmap-button-group">
                                        {heatmapOptions?.map((option) => (
                                            <Button
                                                key={option.value}
                                                buttonType="secondary"
                                                icon={option.icon}
                                                iconProps={{
                                                    size: "medium",
                                                    version: "v2",
                                                }}
                                                iconAlignment="left"
                                                onClick={() => handleHeatmapSelect(option.value)}
                                                disabled={isLoading}
                                                className={`heatmap-button ${selectedHeatmap === option.value ? "selected" : ""}`}
                                                title={option.description}
                                            >
                                                {option.label}
                                            </Button>
                                        ))}
                                    </ButtonGroup>
                                </div>
                            </div>

                            <div className="fullpage-header-section">
                                <FieldLabel
                                    htmlFor="website-select"
                                    className="fullpage-field"
                                >
                                    Website
                                </FieldLabel>
                                <div className="select-wrapper">
                                    <Select
                                        options={websiteOptions}
                                        placeholder="Select a website"
                                        value={selectedWebsite}
                                        onChange={handleWebsiteChange}
                                        width="100%"
                                        version="v2"
                                        isDisabled={websiteOptions.length === 0 || isLoading}
                                    />
                                </div>
                            </div>

                            <div className="fullpage-header-section">
                                <FieldLabel
                                    htmlFor="lytics-segment-select"
                                    className="fullpage-field"
                                >
                                    Lytics Segment
                                </FieldLabel>
                                <div className="select-wrapper">
                                    <Select
                                        options={lyticsSegments}
                                        placeholder="Select a lytics segment"
                                        value={selectedLyticsSegment}
                                        onChange={handleLyticsSegmentChange}
                                        width="100%"
                                        version="v2"
                                        isDisabled={lyticsSegments.length === 0 || isLoading}
                                    />
                                </div>
                            </div>

                            <div className="fullpage-header-section">
                                <div className="button-wrapper">
                                    <Button
                                        buttonType="primary"
                                        iconAlignment="left"
                                        onClick={handleShowHeatmap}
                                        disabled={isLoading || !selectedHeatmap || !selectedWebsite}
                                        className="show-heatmap-button"

                                    >
                                        {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                                    </Button>
                                    <Button
                                        buttonType="secondary"
                                        size="small"
                                        onClick={() => {
                                            console.log("FullPage - Posting message to iframe");
                                            window.postMessage({
                                                type: "heatmap",
                                                data: [
                                                    {
                                                        cslp: "homepage.blt795804b207b863f2.en-us.fields.0.banner.title",
                                                        eventType: "visible",
                                                        value: 88
                                                    },
                                                    {
                                                        cslp: "homepage.blt795804b207b863f2.en-us.fields.1.banner.buynow.link.href",
                                                        eventType: "visible",
                                                        value: 42
                                                    },
                                                    {
                                                        cslp: "homepage.blt795804b207b863f2.en-us.fields.2.banner.learnmorebutton.link.href",
                                                        eventType: "visible",
                                                        value: 67
                                                    },
                                                    {
                                                        cslp: "homepage.blt795804b207b863f2.en-us.fields.3.grid.tile.0.title",
                                                        eventType: "visible",
                                                        value: 95
                                                    },
                                                    {
                                                        cslp: "homepage.blt795804b207b863f2.en-us.fields.3.grid.tile.1.background.url",
                                                        eventType: "visible",
                                                        value: 23
                                                    }
                                                ]
                                            }, "*"); // Remember to use a specific target origin in a production environment
                                        }}
                                    >
                                        MAGIC
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Flow Management Section */}
                    <div className={`flows-section ${!heatmapData?.metrics?.aggregated ? 'flows-disabled' : ''}`}>
                        <div className="flows-header">
                            <div className="flows-header-left">
                                <Button
                                    buttonType="secondary"
                                    size="small"
                                    icon={isFlowsSectionExpanded ? "ChevronDown" : "ChevronRight"}
                                    iconOnly
                                    onClick={() => setIsFlowsSectionExpanded(!isFlowsSectionExpanded)}
                                    className="flows-toggle-button"
                                />
                                <FieldLabel htmlFor="flows" className="fullpage-field">
                                    User Flows
                                </FieldLabel>
                            </div>
                            <Button
                                buttonType="secondary"
                                size="small"
                                icon="Plus"
                                iconAlignment="left"
                                onClick={addFlow}
                                disabled={!heatmapData?.metrics?.aggregated}
                            >
                                Add Flow
                            </Button>
                        </div>

                        {isFlowsSectionExpanded && (
                            <div className="flows-container">
                                {flows.map((flow, flowIndex) => (
                                    <div key={flowIndex} className={`flow-item ${flow.isSaved ? 'flow-saved' : ''}`}>
                                        <div className="flow-header">
                                            <FieldLabel htmlFor={`flow-${flowIndex}`} className="flow-label">
                                                {flow.name || `Flow ${flowIndex + 1}`}
                                                {flow.isSaved && (
                                                    <Icon icon="CheckCircle" size="small" className="flow-saved-icon" />
                                                )}
                                            </FieldLabel>
                                            <div className="flow-header-actions">
                                                {flow.isSaved && (
                                                    <Button
                                                        buttonType="secondary"
                                                        size="small"
                                                        icon="Eye"
                                                        iconAlignment="left"
                                                        onClick={() => handleVisualizeFlow(flowIndex)}
                                                        disabled={isLoading}
                                                        className="visualize-flow-button"
                                                    >
                                                        Visualize
                                                    </Button>
                                                )}
                                                <Button
                                                    buttonType="primary"
                                                    size="small"
                                                    icon="Save"
                                                    iconOnly
                                                    iconProps={{
                                                        size: "small",
                                                        version: "v2",
                                                    }}
                                                    iconAlignment="left"
                                                    onClick={() => handleSaveFlow(flowIndex)}
                                                    disabled={
                                                        flow.isSaved ||
                                                        !heatmapData?.metrics?.aggregated ||
                                                        !flow.sequence.some((step: string) => step)
                                                    }
                                                    className="save-flow-button"
                                                />
                                                <Button
                                                    buttonType="danger"
                                                    size="small"
                                                    icon="Trash"
                                                    iconOnly
                                                    onClick={() => deleteFlow(flowIndex)}
                                                />
                                            </div>
                                        </div>

                                        {/* Flow Title Row - Shows A->B->C format */}
                                        {flow.sequence.some((step: string) => step) && (
                                            <div className="flow-title-row">
                                                <span className="flow-title-text">
                                                    {flow.sequence
                                                        .filter((step: string) => step)
                                                        .map((step: string, idx: number) => String.fromCharCode(65 + idx))
                                                        .join(' → ')}
                                                </span>
                                                <span className="flow-title-values">
                                                    {flow.sequence
                                                        .filter((step: string) => step)
                                                        .join(' → ')}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flow-steps">
                                            {flow.sequence.map((step: string, stepIndex: number) => (
                                                <div key={stepIndex} className="flow-step">
                                                    {stepIndex > 0 && (
                                                        <Icon icon="ArrowRight" size="small" className="flow-arrow" />
                                                    )}
                                                    <div className="flow-step-input">
                                                        {getAvailableCslpOptions().length > 0 ? (
                                                            <Select
                                                                options={getAvailableOptionsForStep(flowIndex, stepIndex)}
                                                                placeholder="Select data-cslp"
                                                                value={step ? { label: step, value: step } : null}
                                                                onChange={(option: any) =>
                                                                    updateStepInFlow(flowIndex, stepIndex, option?.value || '')
                                                                }
                                                                width="100%"
                                                                minWidth="250px"
                                                                maxWidth="400px"
                                                                version="v2"
                                                                isSearchable={true}
                                                                isDisabled={flow.isSaved || !heatmapData?.metrics?.aggregated}
                                                            />
                                                        ) : (
                                                            <TextInput
                                                                placeholder="Enter data-cslp (e.g., data-cslp-1)"
                                                                value={step || ''}
                                                                onChange={(e: any) =>
                                                                    updateStepInFlow(flowIndex, stepIndex, e.target.value)
                                                                }
                                                                width="medium"
                                                                disabled={flow.isSaved || !heatmapData?.metrics?.aggregated}
                                                            />
                                                        )}
                                                        {flow.sequence.length > 1 && !flow.isSaved && (
                                                            <Button
                                                                buttonType="danger"
                                                                size="small"
                                                                icon="Close"
                                                                iconOnly
                                                                onClick={() => removeStepFromFlow(flowIndex, stepIndex)}
                                                                className="remove-step-btn"
                                                                disabled={!heatmapData?.metrics?.aggregated}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {!flow.isSaved && (
                                                <Button
                                                    buttonType="secondary"
                                                    size="small"
                                                    icon="Plus"
                                                    iconAlignment="left"
                                                    onClick={() => addStepToFlow(flowIndex)}
                                                    disabled={
                                                        !heatmapData?.metrics?.aggregated ||
                                                        (flow.sequence.length >= getMaxStepsAllowed())
                                                    }
                                                >
                                                    Add Step
                                                </Button>
                                            )}
                                        </div>

                                        {/* Flow Visualization Accordion */}
                                        {expandedFlowIndex === flowIndex && flowVisualizationData[flowIndex] && (
                                            <div className="flow-visualization-accordion">
                                                <div className="flow-visualization-content">
                                                    {isLoading ? (
                                                        <div className="flow-visualization-loading">
                                                            <p>Loading visualization data...</p>
                                                        </div>
                                                    ) : flowVisualizationData[flowIndex]?.success ? (
                                                        <FlowFunnelVisualization
                                                            data={flowVisualizationData[flowIndex]}
                                                            flowSequence={flow.sequence.filter((step: string) => step)}
                                                        />
                                                    ) : flowVisualizationData[flowIndex] ? (
                                                        <div className="flow-visualization-data">
                                                            <pre>{JSON.stringify(flowVisualizationData[flowIndex], null, 2)}</pre>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {showHeatmap && (
                        <div className="heatmap-preview-section">
                            <div className="heatmap-preview-header">
                                <FieldLabel htmlFor="heatmap-preview" className="fullpage-field">
                                    Website Heatmap Preview
                                </FieldLabel>
                            </div>
                            <div className="heatmap-display">
                                {isLoading ? (
                                    <div className="heatmap-loading">
                                        <p>Loading heatmap data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="heatmap-error">
                                        <Icon icon="AlertCircle" size="large" />
                                        <p>{error}</p>
                                        <Button
                                            buttonType="secondary"
                                            size="small"
                                            onClick={() => fetchHeatmapData(selectedHeatmap)}
                                        >
                                            Retry
                                        </Button>
                                    </div>
                                ) : heatmapData ? (
                                    <div className="heatmap-visualization">
                                        <HeatmapIframe
                                            url={heatmapData.url || heatmapData.data}
                                            type={heatmapData.type}
                                            metrics={heatmapData.metrics}
                                        />
                                    </div>
                                ) : (
                                    <div className="heatmap-empty">
                                        <Icon icon="Info" size="large" />
                                        <p>Select a heatmap type to view data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <Chatbot />
        </div>
    );
};

export default FullPage;

