const portalLib = require('/lib/xp/portal');

exports.responseProcessor = function (req, res) {
    if (req.mode !== 'live') {
        return res;
    }

    const siteConfig = portalLib.getSiteConfig();
    if (!siteConfig) {
        return res;
    }

    const trackingID = siteConfig['trackingId'] || '';
    const enableTracking = siteConfig['enableTracking'] || false;

    if (!trackingID || !enableTracking) {
        return res;
    }

    const headEnd = res.pageContributions.headEnd;
    if (!headEnd) {
        res.pageContributions.headEnd = [];
    }
    else if (typeof(headEnd) == 'string') {
        res.pageContributions.headEnd = [headEnd];
    }

    const serviceUrl = portalLib.serviceUrl({
        service: 'gascript',
        params: {
            type: 'tracking'
        }
    });

    res.pageContributions.headEnd.push(`<script src='${serviceUrl}'></script>`);

    return res;
};
