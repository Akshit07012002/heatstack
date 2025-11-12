/* Import React modules */
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
/* Import other node modules */
/* Import our modules */
import ErrorBoundary from "../../components/ErrorBoundary";
import ConfigScreen from "../ConfigScreen";
import SidebarWidget from "../SidebarWidget";
import DashboardWidget from "../DashboardWidget";
import CustomField from "../CustomField";
import RTE from "../RTE";
import FullPage from "../FullPage";
/* Import node module CSS */
import "@contentstack/venus-components/build/main.css";
/* Import our CSS */
import "./styles.scss";

const App: React.FC = function () {
  return (
    <div className="app">
      <ErrorBoundary>
        <BrowserRouter>
          {/* If the path is changed here,
              be sure to update the path for corresponding UI location
              in Update App API */
          /* Below list has all the possible UI paths\.
              Keep only the paths that are required for your app and
              remove the remaining paths and their source code also. */}
          <Routes>
            <Route path="/config" element={<ConfigScreen />} />
            <Route path="/sidebar-widget" element={<SidebarWidget />} />
            <Route path="/dashboard-widget" element={<DashboardWidget />} />
            <Route path="/custom-field" element={<CustomField />} />
            <Route path="/rte" element={<RTE />} />
            <Route path="/full-page" element={<FullPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
