const portalLib = require('/lib/xp/portal');

exports.get = function(req) {
    const siteConfig = portalLib.getSiteConfig();
    const trackingID = siteConfig['trackingId'] || '';
    const enableTracking = siteConfig['enableTracking'] || false;
    const enableAnonymization = siteConfig['enableAnonymization'] || false;

    if (!trackingID || !enableTracking) {
        return res;
    }

    let snippet = `
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', '${trackingID}', 'auto');
    ga('send', 'pageview'${enableAnonymization ? ', {\'anonymizeIp\': true}' : ''});
    `;

    return {
        contentType: 'application/javascript; charset=utf-8',
        body: snippet,
    }
}