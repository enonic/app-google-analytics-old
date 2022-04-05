const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');
const httpLib = require('/lib/http-client');

exports.get = function (req) {
    req.param = req.params ? req.params : {};

    switch (req.params.type) {
        case 'config':
            return getConfig(req.params.contentId);
        case 'jsapi':
            return getJsApi();
        case 'mapsapi':
            return getMapsApi(req.params.key);
    }
}

function getConfig(contentId) {
    const serviceUrl = '/admin/rest/google-analytics/authenticate';
    const mapsApiKey = app.config['ga.mapsApiKey'] || "";
    const widgetId = app.name;

    const embedApiJsUrl = portalLib.serviceUrl({
        service: 'gascript',
        type: 'absolute',
        params: {
            type: 'embed'
        }
    });
    const siteConfig = contentLib.getSiteConfig({ key: contentId, applicationKey: app.name });
    const trackingId = siteConfig && siteConfig.trackingId ? siteConfig.trackingId : "";
    const content = contentLib.get({ key: contentId });
    const site = contentLib.getSite({ key: contentId });

    let pageId = "";

    if (content.type.indexOf(":site") == -1 && !!site) {
        pageId = content._path.replace(site._path, "");
    }
    pageId = siteConfig ? pageId : -1;

    return {
        contentType: 'application/JSON',
        body: JSON.stringify({
            widgetId,
            serviceUrl,
            trackingId,
            pageId,
            mapsApiKey,
            embedApiJsUrl,

        })
    }
}

function getJsApi() {
    return getRemoteScript(
        'https://www.google.com/jsapi',
        'Google Analytics: Could not fetch remote script google js api'
    );
}

function getMapsApi(key) {
    return getRemoteScript(
        `https://maps.googleapis.com/maps/api/js?key=${key}`,
        'Google Analytics: Could not fetch remote script google maps api'
    );
}

function getRemoteScript(url, errorMessage) {
    const jsapi = httpLib.request({
        url,
        method: 'GET',
        connectionTimeout: 5000,
        contentType: 'application/javascript; charset=utf-8',
    });

    if (jsapi.status == 200) {
        return {
            contentType: 'application/javascript; charset=utf-8',
            body: jsapi.body
        }
    } else {
        log.error(errorMessage);
        throw 'error fetching remote script'
    }
}