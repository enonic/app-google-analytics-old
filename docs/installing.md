# Installing the app

*This guide assumes that you already have an account with Google Analytics. [Guidelines to setup google analytics](https://www.google.com/analytics/) 

Navigate to the admin console (button in the bottom left).

* [Open Google Developers Console](https://console.developers.google.com/project) and click Create Project button.

![](images/ga_01.png)

## Create a analytics account:

![](images/ga-01-1.png)

Give your account the name of the organization or another name that represents all sites pages that will be included.

On the property tab add a new property. Name is to the current page or site that will be analysed. (eks: enonic.com, )

![](images/ga-02-1.png)

Then we need to open the advanced options:

![](images/ga-02-2.png)

This app uses the Universal Analytics property. So turn this on: 

![](images/ga-02-3.png)

//TODO create a property with the UA-ID

## Downloud the analytics app from the market

* After login into the your Enonic system go the application tool: 

![](images/applications.png)

* Press install button to open up all application available:

* When you have found the application you press the green install to add it.

![](images/app-install.png)

This text should popup at the bottom:

![](images/installed-app.png)

And the application should say installed.

## Add to site
Now we have it installed on the system, but not added to a specific site yet.  
* Navigate to content studio where our have your site, and **edit** it.  
Under the applications dropdown find Google Analytics app and check for it to be used:

![](images/site-install.png)

## Configure the app

We need to add some configurations to the app. 
* Open the app configuration:

![](images/app-config.png)

* Add the tracking id (UA-XXXXX) id to the tracking id field inside the configuration:

![](images/app-tracking-id.png)

Press apply to send page data to google analytics (tracking data might be delayed when first activated)

## Setup the google analytics widget

* Fill in project name (for example, “Google Analytics”) and click "Create" button to create your new project.

![](images/ga_02.png)

You will be redirected to the list of projects linked to your account.

![](images/ga_03.png)

*  Click the new project in the list. You will be redirected to the project dashboard. Note that the new project is selected in the top left corner.

![](images/ga_04.png)

Next step is to enable Google Analytics API for the project. 

* Click the burger icon in the top left corner and select "APIs & Services" from the dropdown menu.

![](images/ga_06.png)

You will see the list of APIs linked to the project (there are none yet)

![](images/ga_07.png)

* Click “Enable APIs & Services” button. You will be redirected to the API library.

![](images/ga_08.png)

* Write "Google Analytics" in the search field

![](images/ga_09.png)

* Select “Google Analytics Reporting API” from the list of results

![](images/ga_10.png)

* Click "Enable" button. The API will be enabled for the project and you'll be redirected to the API dashboard. 
If the API is already enabled, the button will say "Manage" and you don't need to do anything.

![](images/ga_11.png)

* Return to the list of APIs and enter "Maps Javascript" into the search field.
Select "Maps Javascript API" in the list and enable it in the same way as described in the previous step.

![](images/ga_12.png)

![](images/ga_13.png)

* In the "Maps Javascript API" dashboard select "Credentials" tab and click
"Create credentials" button. Select "API key".

![](images/ga_14.png)

* When the API key is created, save it somewhere - you'll need it later on.

![](images/ga_15.png)

* Go back to the "APIs & Services" page and select "Credentials" from the menu on the left-hand side.

![](images/ga_16.png)

* Click “Create Credentials” button and select “Service account” from the dropdown.

![](images/ga_17.png)

* Fill out the fields in the next screen as shown below (feel free to give your service account any name you like).

![](images/ga_18.png)

After you click the "Create" button, the file with extension .p12 will be downloaded to your PC. Rename this file to “ga_key.p12” and move it to config folder of your XP installation (xp_home/config).

* Click "Manage service accounts" link above the list of accounts

![](images/ga_19.png)

* Select email address of the service account and copy it to clipboard. You can either
copy it directly from the list or click it and copy it from the account details page.

![](images/ga_20.png)

* In the Google Analytics administration console click “User Management” under the account you want to add integration with.

![](images/ga_21.png)

This will open the list of users linked to the account. 
* Click the "+" button in the top right corner

![](images/ga_22.png)

* Paste the service account email into the textbox and uncheck all the boxes except for "Read & Analyze". Click "Add" button.

![](images/ga_23.png)

* In the config folder of your XP installation (xp_home/config) create a text file called “com.enonic.app.ga.cfg”. This file should contain the following properties:
```
    ga.serviceAccount = <service-account>
    ga.p12KeyPath = ${xp.home}/config/ga_key.p12
    ga.mapsApiKey = <maps-api-key>
```

where `ga.serviceAccount` is the service account email and `ga.mapsApiKey` is Maps Javascript API key you created earlier:

* At this point you should have two files in xp_home/config related to integration with GoogleAnalytics: ga_key.p12 and com.enonic.app.ga.cfg.

![](images/ga_24.png)

This concludes external part of the integration.
