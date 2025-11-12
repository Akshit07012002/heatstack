#### Steps to create and start developing a new marketplace app:
First make sure you have below versions of NodeJS, NPM installed before proceeding with the setup: <br/>
Nodejs - v14.18.2<br/>
NPM - 8.1.4<br/>

1. Copy the contents of this repo to the new repo of your APP. The new app repo source folder will be referred as APP_DIRECTORY from now on.
2. In the APP_DIRECTORY, delete this Readme.md file.
3. In the terminal go to APP_DIRECTORY by executing cd &lt;APP_DIRECTORY&gt; command and execute ```npm i```.
4. In the &lt;APP_DIRECTORY&gt;/ui Create a npm config file .npmrc. Get the contents of that file from the team.
5. If the app does not require any api to be available in lambda, then remove the contents of api directory inside APP_DIRECTORY.
6. If the app requires api, then go to api directory in terminal and run ```npm i```.
7. Open the package.json inside the ui app (&lt;APP_DIRECTORY&gt;/ui/package.json) and update the name attribute to your app name. Open the root html file of app (available at &lt;APP_DIRECTORY&gt;/ui/public/index.html) and update the &lt;title&gt; tag value to the name of your app.
8. Change the favicon.ico as per the requirement of your app. favicon.ico file is available at &lt;APP_DIRECTORY&gt;/ui/public/favicon.ico.
9. Go to ui directory in terminal and run ```npm i```.
10. Go to ui directory in terminal and start the server by running ```npm run start```. The UI server will start at port 4000.
11. Go to api directory in terminal and start the server by running ```npm run dev```. The API server will start at port 8000.
12. Go to developer hub at https://app.contentstack.com/#!/developerhub
13. Create a new app by clicking + New App button at top right and provide a name for your app. This new app name will be referred as NEW_APP from now on.
14. After creating NEW_APP, you will be redirected to the Basic Information page. Copy the App UID listed at the bottom. This will be referred as APP_UID from now on.
15. Go to postman and call the update app API with below details as per requirement:
```
    URL: https://developerhub-api.contentstack.com/apps/{{APP_UID}}

    HTTP Method: PUT

    Headers: {
    	authtoken: <auth_token_of_contentstack_account>,
    	organization_uid: <uid_of_organization>
    }
    To get an authtoken, refer below API Doc: https://www.contentstack.com/docs/developers/apis/content-management-api/#log-in-to-your-account
    organization_uid is the org_uid value in the above login API response.
```
```
    Body: {
        "name": "<NEW_APP>",
        "target_type": "stack",
	    "ui_location": {
	        "locations": [
	            {
	                "type": "cs.cm.stack.config",
	                "meta": [
	                    {
	                        "signed": true,
	                        "path": "/config",
	                        "name": "Configuration"
	                    }
	                ]
	            },
	            {
	                "type": "cs.cm.stack.sidebar",
	                "meta": [
	                    {
	                        "signed": true,
	                        "path": "/sidebar-widget",
	                        "name": "Sidebar Widget",
	                        "data_type": "json"
	                    }
	                ]
	            },
	            {
	                "type": "cs.cm.stack.dashboard",
	                "meta": [
	                    {
	                        "signed": true,
	                        "path": "/dashboard-widget",
	                        "name": "Dashboard Widget",
	                        "data_type": "json"
	                    }
	                ]
	            },
	            {
	                "type": "cs.cm.stack.custom_field",
	                "meta": [
	                    {
	                        "signed": true,
	                        "path": "/custom-field",
	                        "name": "Custom Field",
	                        "data_type": "json"
	                    }
	                ]
	            },
	            {
	                "type": "cs.cm.stack.rte",
	                "meta": [
	                    {
	                        "signed": true,
	                        "path": "/rte",
	                        "name": "RTE",
	                        "data_type": "json"
	                    }
	                ]
	            }
	        ],
	        "signed": true,
	        "base_url": "https://localhost:3000" //This should be the URL where your UI Server is running.
	    }
	}
	Note: If some of the above UI locations is not required, then you can remove it from the request.
```
16. Decide what all are the configuration parameters required by your app and develop the Configuration screen accordingly. The configuration screen page source is available at &lt;APP_DIRECTORY&gt;/ui/src/containers/ConfigScreen/index.tsx
17. Go to the Developer hub in venus-new.contentstack.com and select the NEW_APP. On the top right click on Install App.
18. Select the required stack where the app should get installed. (We use Marketplace Test stack now for our development purposes. The stack is available in Expert Services - Internal - NB organization).
19. After the app is installed, you can refer the pages developed at various UI locations in the stack. Below are the various UI locations and their corresponding page in source code:

| UI Location      | Page Source                                                       |
|------------------|-------------------------------------------------------------------|
| Config Screen    | &lt;APP_DIRECTORY&gt;/ui/src/containers/ConfigScreen/index.tsx    |
| Sidebar Widget   | &lt;APP_DIRECTORY&gt;/ui/src/containers/SidebarWidget/index.tsx   |
| Dashboard Widget | &lt;APP_DIRECTORY&gt;/ui/src/containers/DashboardWidget/index.tsx |
| Custom Field     | &lt;APP_DIRECTORY&gt;/ui/src/containers/CustomField/index.tsx     |
| RTE              | &lt;APP_DIRECTORY&gt;/ui/src/containers/RTE/index.tsx             |


20. You can change the source codes and refer the changes in UI now at corresponding places as mentioned above.
21. Commit the changes to a new branch of the repo and raise PR to the development branch.
