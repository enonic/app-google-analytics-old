const  contentLib = require('/lib/xp/content');
const  portalLib = require('/lib/xp/portal');
const  thymeleaf = require('/lib/thymeleaf');

function handleGet(req) {

    let  contentId = req.params.contentId;

    if (!contentId && portalLib.getContent()) {
        contentId = portalLib.getContent()._id;
    }

    if (!contentId) {
        return {
            contentType: 'text/html',
            body: '<widget class="error">No content selected</widget>'
        };
    }

    const  content = contentLib.get({key: contentId});
    const  site = contentLib.getSite({key: contentId});
    const  siteConfig = contentLib.getSiteConfig({key: contentId, applicationKey: app.name});
    const  pageId = "";

    if (content.type.indexOf(":site") == -1 && !!site) {
        pageId = content._path.replace(site._path, "");
    }

    const  view = resolve('ga-report.html');
    const  params = {
        googleAnalyticsCssUrl: portalLib.assetUrl({path: 'css/google-analytics.css'}),
        embedApiJsUrl: portalLib.assetUrl({path: 'js/embed-api.js'}),
        googleAnalyticsJsUrl: portalLib.assetUrl({path: 'js/google-analytics.js'}),
        serviceUrl: '/admin/rest/google-analytics/authenticate',
        trackingId: siteConfig && siteConfig.trackingId ? siteConfig.trackingId : "",
        mapsApiKey: app.config['ga.mapsApiKey'] || "",
        pageId: siteConfig ? pageId : -1,
        widgetId: app.name
    };

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, params)
    };
}
exports.get = handleGet;
