const portalLib = require('/lib/xp/portal');
const httpLib = require('/lib/http-client');

exports.get = function (req) {
    const type = req.params.type;

    switch (type) {
        case 'tracking': {
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

        case 'embed': {
            let platformUrl = portalLib.serviceUrl({
                service: 'gascript',
                type: 'absolute',
                params: {
                    type: 'platform'
                }
            });

            let snippet = `(function(w,d,s,g,js,fs){
                if (w.gapi) {return;} //Prevent duplicate load of the GAPI
                g=w.gapi={};g.analytics={q:[],ready:function(f){this.q.push(f);}};
                js=d.createElement(s);fs=d.getElementsByTagName(s)[0];
                js.src='${platformUrl}';
                fs.parentNode.insertBefore(js,fs);js.onload=function(){g.load('analytics');};
            }(window,document,'script'));`;

            return {
                contentType: 'application/javascript; charset=utf-8',
                body: snippet,
            }

        }

        case 'platform': {
            return getRemoteScript(
                "https://apis.google.com/js/platform.js",
                'Could not fetch the google api platform.js'
            );
        }
    }
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
