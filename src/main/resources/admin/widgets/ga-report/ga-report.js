const portalLib = require('/lib/xp/portal');
const thymeleaf = require('/lib/thymeleaf');

function handleGet(req) {
    let contentId = req.params.contentId;

    if (!contentId && portalLib.getContent()) {
        contentId = portalLib.getContent()._id;
    }

    if (!contentId) {
        return {
            contentType: 'text/html',
            body: '<widget class="error">No content selected</widget>'
        };
    }

    const configUrl = portalLib.serviceUrl({
        service: 'gaconfig',
        params: {
            contentId,
        }
     });

    const view = resolve('ga-report.html');

    const params = {
        googleAnalyticsCssUrl: portalLib.assetUrl({path: 'css/google-analytics.css'}),
        googleAnalyticsJsUrl: portalLib.assetUrl({path: 'js/google-analytics.js'}),
        configUrl,
        widgetId: app.name,
    };

    return {
        contentType: 'text/html',
        body: thymeleaf.render(view, params)
    };
}
exports.get = handleGet;
