(function() {
    const dataCharts = [];
    let config = {};
    let viewId;

    async function getConfig(url) {
        const response = await fetch(url,
            {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    console.error(response.status);
                    showError('Could not fetch the config status code error');
                }
                return response;
            })
            .catch(error => {
                console.error(error);
                showError('Could not fetch the config');
            });

        return response.json();
    }

    const configServiceUrl = document.currentScript.dataset.configurl;

    if (!configServiceUrl) {
        throw 'Missing service url'
    }

    getConfig(configServiceUrl)
        .then(data => {
            config = data;
            initApi();
        });

// GA API BEGIN
    function queryAccounts() {
        gapi.client.analytics.management.accounts.list().then(handleAccounts);
    }

    function getPropertyUrl(accountId, propertyId) {
        gapi.client.analytics.management.webproperties.get({
            'accountId': accountId,
            'webPropertyId': propertyId
        }).then(function (response) {
            setTitle(response.result.name);
        });
    }

    function handleAccounts(response) {
        // Handles the response from the accounts list method.
        if (response.result.items && response.result.items.length) {
            // Get the first Google Analytics account.
            let accountId;
            if (response.result.items.length == 1) {
                accountId = response.result.items[0].id;
            } else {
                let items = response.result.items.filter(item => (config.trackingId.indexOf(item.id) > -1));
                if (items[0]) {
                    accountId = items[0].id;
                }
            }

            // Uncomment if we need to show url for selected tracking Id
            //getPropertyUrl(firstAccountId, config.trackingId);

            if (accountId) {
                // Query for properties.
                queryProfiles(accountId, config.trackingId);
            } else {
                showError('No accounts found for the GA user.');
            }
        } else {
            showError('No accounts found for the GA user.');
        }
    }

    function showRequestError(errorObject) {
        if (errorObject.error && errorObject.error.message) {
            showError(errorObject.error.message);
        }
    }

    function queryProfiles(accountId, propertyId) {
        // Get a list of all Views (Profiles) for the first property
        // of the first Account.
        gapi.client.analytics.management.profiles.list({
            'accountId': accountId,
            'webPropertyId': propertyId
        })
            .then(handleProfiles)
            .then(null, function (err) {
                // Log any errors.
                console.log(err);
                showRequestError(err.result);
            });
    }

    function handleProfiles(response) {
        // Handles the response from the profiles list method.
        if (response.result.items && response.result.items.length) {
            // Get the first View (Profile) ID.
            viewId = "ga:" + response.result.items[0].id;

            initDatePicker();

            // Show statistics for found View ID
            if (config.pageId) {
                showStatisticsForPage();
            } else {
                showStatisticsForSite();
            }
        } else {
            showError('No GA views (profiles) found for the account.');
        }
    }

    function isConfigValid() {
        if (config.pageId == "-1") {
            showError("GA app not added to the site");
            return false;
        }
        if (!config.serviceUrl) {
            showAuthenticationError();
            return false;
        }
        if (!config.trackingId) {
            showAuthenticationError("Tracking Id not found");
            return false;
        }

        return true;
    }

    function getToken() {
        var request = new XMLHttpRequest();
        request.open("GET", config.serviceUrl, true);
        request.onload = function () {
            var responseObject = JSON.parse(request.responseText);
            if (responseObject.errorMessage) {
                showAuthenticationError(responseObject.errorMessage);
            } else if (responseObject.token) {

                cleanupCookies();

                setContainerVisible('ga-authenticated', true);
                setContainerVisible('ga-not-authenticated', false);

                createTitle();

                if (config.pageId) {
                    createContainerDiv("chart-container-1");
                    createContainerDiv("chart-container-2");
                    createContainerDiv("chart-container-3", "ga-kpi-chart");
                } else {
                    createContainerDiv("chart-container-1");
                    createContainerDiv("chart-container-2");
                    createContainerDiv("chart-container-2-1", "ga-vertical-container", "chart-container-2");
                    createContainerDiv("chart-container-2-2", "ga-vertical-container", "chart-container-2");

                    createContainerDiv("chart-container-3", "ga-bycountry-container");
                    createContainerDiv("chart-container-4", "ga-bypage-container");
                    createContainerDiv("chart-container-5", "ga-byreferer-container");
                }

                authorize(responseObject.token);
            }
        };
        request.send(null);
    }

    function authorize(token) {
        /**
         * Authorize the user with a token.
         */
        if (!gapi.analytics.auth.isAuthorized()) {
            gapi.analytics.auth.authorize({
                serverAuth: {
                    access_token: token
                }
            });
        }

        queryAccounts();
    }

// GA API END

// DRAW CHART BEGIN

    function drawChart(containerId, config) {
        var queryCfg = {
            ids: viewId,
            metrics: config.metrics,
            dimensions: config.dimensions
        };

        if (config.filters) {
            queryCfg.filters = config.filters;
        }
        if (config['max-results']) {
            queryCfg['max-results'] = config['max-results'];
        }
        if (config.sort) {
            queryCfg.sort = config.sort;
        }

        var chart = new gapi.analytics.googleCharts.DataChart({
            query: queryCfg,
            chart: {
                container: getContainer(containerId),
                type: config.type,
                options: {
                    title: config.title,
                    width: '100%',
                    is3D: true
                }
            }
        });

        if (config.width) {
            chart.set({chart: {options: {legend: {position: 'none'}, chartArea: {width: config.width}}}});
        }

        dataCharts.push(chart);

        setDateAndDrawChart(chart);
    }

    function setDateAndDrawChart(chart) {
        chart.set(getDateRangeObject()).execute();
    }

    function getDateRangeObject() {
        var startDate = getStartDate(getDateFromCookie('start-date') || '7daysAgo');
        return {
            query: {
                'start-date': startDate,
                'end-date': getDateFromCookie('end-date') || 'today'
            }
        };
    }

    function formatSeconds(seconds) {
        var hours = parseInt(seconds / 3600) % 24;
        var minutes = parseInt(seconds / 60) % 60;
        var seconds = parseInt(seconds % 60);

        return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" +
               (seconds < 10 ? "0" + seconds : seconds);
    }

    function showStatisticsForPage() {

        /**
         * Line chart by sessions
         */
        drawChart("chart-container-1", {
            title: 'Pageviews by Date',
            type: 'LINE',
            metrics: 'ga:pageViews,ga:uniquePageviews',
            dimensions: 'ga:date',
            filters: 'ga:pagePath==' + config.pageId
        });

        /**
         * Pie chart by user type (new vs returning)
         */
        drawChart("chart-container-2", {
            title: "Visitors",
            type: 'PIE',
            metrics: 'ga:sessions',
            dimensions: 'ga:userType',
            filters: 'ga:pagePath==' + config.pageId
        });

        /**
         * Table with avg metrics
         */
        var kpiRequest = new gapi.analytics.report.Data({
            query: {
                ids: viewId,
                metrics: 'ga:avgTimeOnPage,ga:avgPageLoadTime,ga:bounceRate',
                filters: 'ga:pagePath==' + config.pageId
            }
        });

        dataCharts.push(kpiRequest);

        kpiRequest.on("success", onKPILoaded);

        kpiRequest.set(getDateRangeObject()).execute();
    }

    function onKPILoaded(response) {
        if (response.totalsForAllResults) {
            createContainerDiv("kpi-container-data", "ga-kpi-container-data", "chart-container-3");
            var textContainer = createContainerDiv("kpi-container-text", "ga-kpi-container-text", "chart-container-3");

            var container = createContainerDiv("kpi-container-1", "ga-kpi-container", "kpi-container-data");
            container.innerHTML = "<div>" + parseFloat(response.totalsForAllResults["ga:avgPageLoadTime"]).toFixed(2) + "</div>";

            container = createContainerDiv("kpi-container-2", "ga-kpi-container", "kpi-container-data");
            container.innerHTML = "<div>" + formatSeconds(response.totalsForAllResults["ga:avgTimeOnPage"]) + "</div>";

            container = createContainerDiv("kpi-container-3", "ga-kpi-container", "kpi-container-data");
            container.innerHTML = "<div>" + parseFloat(response.totalsForAllResults["ga:bounceRate"]).toFixed(2) + "%</div>";

            textContainer.innerHTML = "<span>Avg.load time (sec)</span><span>Avg.time on page</span><span>Bounce rate</span>";
        }
    }

    function showStatisticsForSite() {
        /**
         * Line chart by sessions
         */
        drawChart("chart-container-1", {
            title: "Site Users",
            type: 'COLUMN',
            metrics: 'ga:Users, ga:newUsers',
            dimensions: 'ga:date'
        });

        /**
         * Pie chart by device
         */
        drawChart("chart-container-2-1", {
            title: "Devices",
            type: 'PIE',
            metrics: 'ga:sessions',
            dimensions: 'ga:deviceCategory',
            width: "90%"
        });

        /**
         * Pie chart by browser
         */
        drawChart("chart-container-2-2", {
            title: "Browsers",
            type: 'PIE',
            metrics: 'ga:sessions',
            dimensions: 'ga:browser',
            width: "90%",
            'sort': '-ga:sessions'
        });

        /**
         * Geo chart by countries
         */
        drawChart("chart-container-3", {
            type: 'GEO',
            metrics: 'ga:users',
            dimensions: 'ga:country'
        });

        /**
         * Table with top 10 pages
         */
        drawChart("chart-container-4", {
            type: 'TABLE',
            metrics: 'ga:uniquePageviews',
            dimensions: 'ga:pagePath',
            'max-results': 10,
            'sort': '-ga:uniquePageviews'
        });

        /**
         * Table with top 10 referers
         */
        drawChart("chart-container-5", {
            type: 'TABLE',
            metrics: 'ga:users',
            dimensions: 'ga:source',
            'max-results': 10,
            'sort': '-ga:users'
        });
    }

// DRAW CHART END

// COOKIES BEGIN

    function createCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }

        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function saveDateInCookie(date) {
        createCookie("ga.start-date", date);
    }

    function getDateFromCookie(name) {
        return getCookie("ga." + name);
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    function cleanupCookies() {
        createCookie("ga.start-date", "", -1);
        createCookie("ga.end-date", "", -1);
    }

// COOKIES END

// DATE PICKER BEGIN

    function dateToString(date) {
        var sDay = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate().toString();
        var sMonth = date.getMonth() + 1;
        sMonth = (sMonth < 10) ? "0" + sMonth : sMonth.toString();

        return date.getFullYear() + "-" + sMonth + "-" + sDay;
    }

    function getFirstDateOfPeriod(delta) {
        var date = new Date;
        date = new Date(date.setDate(date.getDate() - (delta || 7) + 1));

        return dateToString(date);
    }

    function getFirstDateOfYear() {
        var date = new Date;
        return date.getFullYear() + "-01-01";
    }

    function initDatePicker() {
        var container = getContainer("ga-authenticated").querySelector("#date-range-container");
        var select = container.querySelector("select");
        select.hidden = false;
        if (getDateFromCookie('start-date')) {
            select.value = getDateFromCookie('start-date');
        }
        select.onchange = onDateSelected;
    }

    function getStartDate(date) {
        if (date == "thisWeek") {
            return getFirstDateOfPeriod((new Date).getDay());
        }

        if (date == "thisMonth") {
            return getFirstDateOfPeriod((new Date).getDate());
        }

        if (date == "thisYear") {
            return getFirstDateOfYear();
        }

        return date;
    }

    function onDateSelected(e) {
        saveDateInCookie(e.target.value);
        dataCharts.forEach(function (dataChart) {
            setDateAndDrawChart(dataChart);
        });
    }

// DATE PICKER END

// DOM ELEMENTS BEGIN

    function createTitle() {
        var container = getContainer("ga-authenticated").querySelector("#date-range-container");
        var title = container.querySelector("span");
        title.innerHTML = "Statistics for the " + (config.pageId ? "page" : "site");
    }

    function getContainer(containerId) {
        // Since this is used for error messages, the config might not be initialized
        if (config.widgetId) {
            const widgetContainer = document.getElementById(`widget-${config.widgetId}`);
            return widgetContainer.querySelector(`#${containerId}`);
        }
        else {
            return document.querySelector(`#${containerId}`);
        }
    }

    function createContainerDiv(divId, cls, parentId) {
        var container = getContainer(parentId || "ga-authenticated");
        var div = container.querySelector("#" + divId);

        if (!div) {
            div = document.createElement("div");

            div.setAttribute("id", divId);
            if (cls) {
                div.setAttribute("class", cls);
            }
            container.appendChild(div);
        }

        return div;
    }

    function setContainerVisible(containerId, visible) {
        var container = getContainer(containerId);
        if (container) {
            container.hidden = !visible;
        }

        return container;
    }

    function showAuthenticationError(errorMessage) {
        showError("Authentication failed" + (errorMessage ? ": " + errorMessage : ""));
    }

    function showError(errorMessage) {
        setContainerVisible('ga-not-authenticated', true).innerHTML = errorMessage;
        setContainerVisible('ga-authenticated', false);
    }

// DOM ELEMENTS END

    function removeApi() {
        const selectors = [
            `script[id^="${config.widgetId}-script-"]`,
            'link[href^="https://www.gstatic.com"]',
            'script[src^="https://www.gstatic.com"]',
            'script[src^="https://maps.googleapis.com"]'
        ];
        if (window.google) {
            delete window.google;
        }
        const elements = document.querySelectorAll(selectors.join(','));

        [].forEach.call(elements, function(element) {
            // do whatever
            element.parentNode.removeChild(element);
        });

    }

    function appendScript(container, counter, src) {
        const s = document.createElement("script");

        s.id = `${config.widgetId}-script-${counter}`;
        s.type = "text/javascript";
        s.src = src;
        container.append(s);
    }

    function appendApi() {
        const widgetContainer = document.getElementById(`widget-${config.widgetId}`);

        appendScript(widgetContainer, 1, config.embedApiJsUrl);
        if (config.mapsApiKey) {
            appendScript(widgetContainer, 2, 'https://www.google.com/jsapi');
            appendScript(widgetContainer, 3, `https://maps.googleapis.com/maps/api/js?key=${config.mapsApiKey}`);
        }
    }

    function initApi() {
        removeApi();
        if (isConfigValid()) {
            appendApi();

            // Need to wait for google script to load
            setTimeout(() => {
                if (window.gapi) {
                    startWidget();
                } else {
                    console.error('Could not load Google Analytics api');
                }
            }, 100);
        }
    }

    function startWidget() {
        if (gapi.analytics.auth) {
            getToken();
        } else {
            gapi.analytics.ready(function () {
                getToken();
            });
        }
    }
})();
