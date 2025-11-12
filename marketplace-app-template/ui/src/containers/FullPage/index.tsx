/* Import React modules */
/* eslint-disable */
import React, { useEffect, useState } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { Button, FieldLabel, ButtonGroup, Icon, AsyncLoader, Select } from "@contentstack/venus-components";
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

const HeatmapIframe: React.FC<HeatmapIframeProps> = ({ url, type, metrics }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const buildIframeUrl = () => {
        if (!url) return '';

        try {
            const urlObj = new URL(url);
            urlObj?.searchParams?.set('type', type);

            if (metrics) {
                urlObj?.searchParams?.set('metrics', encodeURIComponent(JSON.stringify(metrics)));
            }

            return urlObj?.toString();
        } catch (e) {
            const separator = url?.includes('?') ? '&' : '?';
            const metricsParam = metrics ? `&metrics=${encodeURIComponent(JSON.stringify(metrics))}` : '';
            return `${url}${separator}type=${type}${metricsParam}`;
        }
    };

    useEffect(() => {
        const iframe = iframeRef?.current;
        if (!iframe || !metrics) return;

        const handleLoad = () => {
            try {
                // Send metrics data via postMessage
                iframe?.contentWindow?.postMessage(
                    {
                        type: 'heatmap-metrics',
                        heatmapType: type,
                        metrics: metrics
                    },
                    '*'
                );
            } catch (error) {
                console.error('Error sending postMessage to iframe:', error);
            }
        };

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
    const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
    const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const heatmapOptions = [
        {
            label: "Visibility",
            value: "visibility",
            icon: "Eye",
            description: "Shows where users look on your page"
        },
        {
            label: "Clicks",
            value: "clicks",
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

                // Convert websites array to Select options format
                const websiteSelectOptions = websites.map((url: string) => ({
                    label: url,
                    value: url,
                }));

                setWebsiteOptions(websiteSelectOptions);

                setState({
                    config,
                    location: appSdk.location,
                    appSdkInitialized: true,
                });

                // Don't auto-fetch heatmap data, wait for user to click "Show Heatmap"
            })
            .catch((error) => {
                console.error("appSdk initialization error", error);
            });
    }, []);

    const fetchHeatmapData = async (heatmapType: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch metrics from API
            const response = await services.getHeatmapMetrics(heatmapType, state.config);

            // Extract metrics and URL from response
            const metrics = response?.metrics || response?.data || response;
            const heatmapUrl = response?.url || response?.heatmapUrl || '';

            setHeatmapData({
                type: heatmapType,
                data: heatmapUrl,
                metrics: metrics,
                url: heatmapUrl
            });
        } catch (err: any) {
            console.error("Error fetching heatmap data:", err);
            setError(err.message || "Failed to load heatmap data");
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

    const handleShowHeatmap = () => {
        if (!showHeatmap && selectedHeatmap) {
            fetchHeatmapData(selectedHeatmap);
        }
        setShowHeatmap(!showHeatmap);
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
                                        width="50%"
                                        version="v2"
                                        isDisabled={websiteOptions.length === 0 || isLoading}
                                    />
                                </div>
                            </div>

                            <div className="fullpage-header-section">
                                <div className="button-wrapper">
                                    <Button
                                        buttonType="primary"
                                        iconAlignment="left"
                                        onClick={handleShowHeatmap}
                                        disabled={isLoading || !selectedHeatmap}
                                        className="show-heatmap-button"
                                        
                                    >
                                        {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showHeatmap && (
                        <div className="heatmap-display">
                            {isLoading ? (
                                <div className="heatmap-loading">
                                    <AsyncLoader />
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
                    )}
                </div>
            )}
            <Chatbot />
        </div>
    );
};

export default FullPage;

