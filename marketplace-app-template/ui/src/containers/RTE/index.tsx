/* Import React modules */
import React, { useEffect, useState } from "react";
/* Import other node modules */
import ContentstackAppSdk from "@contentstack/app-sdk";
import { TypeSDKData } from "../../common/types";
/* Import our modules */
/* Import node module CSS */
/* Import our CSS */
import "./styles.scss";

/* To add any labels / captions for fields or any inputs, use common/local/en-us/index.ts */

const RTE: React.FC = function () {
  const [state, setState] = useState<TypeSDKData>({
    config: {},
    location: {},
    appSdkInitialized: false,
  });

  useEffect(() => {
    ContentstackAppSdk.init()
      .then(async (appSdk) => {
        const config = await appSdk?.getConfig();
        // const entryData = appSdk?.location?.RTEPlugin?.get(); //get the RTE plugin data
        // setEntryData(entryData); //entryData is the whole entry object from CMS that contains all the data in the current entry for which sidebar is opened.
        setState({
          config,
          location: appSdk.location,
          appSdkInitialized: true,
        });
      })
      .catch((error) => {
        console.error("appSdk initialization error", error);
      });
  }, []);

  /* Handle your UI as per requirement. State variable will hold
  the configuration details from the appSdk. */

  return (
    <div className="layout-container">
      {state.appSdkInitialized && (
        <>
          Your sidebar UI must be developed here based on the state variable
          {`Your current state is ${JSON.stringify(state)}`}
        </>
      )}
    </div>
  );
};

export default RTE;
