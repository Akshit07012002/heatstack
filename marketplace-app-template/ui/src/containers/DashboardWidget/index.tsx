/* Import React modules */
/* eslint-disable */
import React, { useEffect, useState } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { FieldLabel, Button, ButtonGroup, Icon, AsyncLoader } from "@contentstack/venus-components";
import { TypeSDKData } from "../../common/types";

/* Import our modules */
// import { getDataFromAPI } from '../../services'; //If no services are required, this can be removed
/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

interface HeatmapData {
  type: string;
  data: any;
}

const DashboardWidget: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });

  const [selectedHeatmap, setSelectedHeatmap] = useState<string>("visibility");
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const frameRef = React.useRef<any>(null);

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

  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        const config = await appSdk.getConfig();
        const frame = appSdk?.location?.DashboardWidget?.frame;
        if (frame) {
          frameRef.current = frame;
          frame.enableAutoResizing?.();
          // Set initial height and maintain minimum
          setTimeout(() => {
            frame.updateHeight?.(600);
          }, 100);
        }
        setState({
          config,
          location: appSdk.location,
          appSdkInitialized: true,
        });
        // Fetch initial heatmap data
        fetchHeatmapData("visibility");
      })
      .catch((error) => {
        console.error("appSdk initialization error", error);
      });
  }, []);

  // Maintain minimum height during state changes
  useEffect(() => {
    if (frameRef.current) {
      // Use a debounced resize to prevent flickering
      const timeoutId = setTimeout(() => {
        frameRef.current?.updateHeight?.(600);
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, heatmapData, error]);

  const fetchHeatmapData = async (heatmapType: string) => {
    setIsLoading(true);
    setError(null);

    try {

      // const response = await getDataFromAPI({ heatmapType });
      // setHeatmapData({ type: heatmapType, data: response });

      await new Promise(resolve => setTimeout(resolve, 500));
      setHeatmapData({
        type: heatmapType,
        data: {}
      });
    } catch (err: any) {
      setError(err.message || "Failed to load heatmap data");
      setHeatmapData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeatmapSelect = (value: string) => {
    if (selectedHeatmap !== value) {
      setSelectedHeatmap(value);
      fetchHeatmapData(value);
    }
  };

  return (
    <div className="layout-container">
      {state.appSdkInitialized && (
        <div className="dashboard-widget-content">
          <div className="heatmap-controls">
            <FieldLabel
              htmlFor="heatmap-type"
              className="Dashboard-field"
            >
              Heatmap Type
            </FieldLabel>
            <div className="button-group-wrapper">
              <ButtonGroup className="heatmap-button-group">
                {heatmapOptions.map((option) => (
                  <Button
                    key={option.value}
                    buttonType="secondary"
                    icon={option.icon}
                    iconProps={{
                      size: "medium",
                      version: "v2",
                      active: selectedHeatmap === option.value,
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
                <iframe
                  src={`${state.config?.heatmapBaseUrl || ''}?type=${heatmapData.type}`}
                  className="heatmap-iframe"
                  title={`Heatmap visualization for ${heatmapData.type}`}
                  frameBorder="0"
                  allowFullScreen
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
  );
};

export default DashboardWidget;
