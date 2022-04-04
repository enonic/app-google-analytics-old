const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');
const httpLib = require('/lib/http-client');

exports.get = function (req) {
    req.param = req.params ? req.params : {};

    switch (req.params.type) {
        case 'config': {
            const serviceUrl = '/admin/rest/google-analytics/authenticate';
            const mapsApiKey = app.config['ga.mapsApiKey'] || "";
            const widgetId = app.name;

            let contentId = req.params.contentId;

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
        case 'jsapi': {
            const jsapi = httpLib.request({
                url: 'https://www.google.com/jsapi',
                method: 'GET',
                connectionTimeout: 5000,
                contentType: req.contentType,
            });

            if (jsapi.status == 200) {
                return {
                    contentType: 'application/javascript; charset=utf-8',
                    body: jsapi.body
                }
            } else {
                log.error('Google Analytics: Could not fetch remote script google js api');
            }
            break;
        }
        case 'mapsapi': {
            const key = req.param.key || '';
            const mapsapi = httpLib.request({
                url: `https://maps.googleapis.com/maps/api/js?key=${key}`,
                method: 'GET',
                connectionTimeout: 5000,
                contentType: req.contentType,
            });

            if (mapsapi.status == 200) {
                return {
                    contentType: 'application/javascript; charset=utf-8',
                    body: mapsapi.body
                }
            } else {
                log.error('Google Analytics: Could not fetch remote script google maps api');
            }
            break;
        }
    }
}