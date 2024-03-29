const contentLib = require('/lib/xp/content');
const portalLib = require('/lib/xp/portal');

exports.get = function(req) {
    const serviceUrl = '/admin/rest/google-analytics/authenticate';
    const mapsApiKey = app.config['ga.mapsApiKey'] || "";
    const widgetId = app.name;

    let contentId = req.params.contentId;

    const embedApiJsUrl = portalLib.assetUrl({path: 'js/embed-api.js'});
    const siteConfig = contentLib.getSiteConfig({key: contentId, applicationKey: app.name});
    const trackingId = siteConfig && siteConfig.trackingId ? siteConfig.trackingId : "";
    const content = contentLib.get({key: contentId});
    const site = contentLib.getSite({key: contentId});

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