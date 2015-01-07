var gm = require('gm');
var jsdom = require("jsdom");
var webshot = require('webshot');
var request = require('request');
var Iconv  = require('iconv').Iconv;

fs.readFile('main.css', 'utf8', function (err, data) {
    if (err) {
        return console.log(err);
    }
    var options = {
        //userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
        cookies: [
            {
                name:   'JSESSIONID',
                value:  'K108WejBCMPdJytNG8C9x0lXIvhFnXwfWMiOJXa59Qeid0uTqd8ythyxo6nDBwBN',
                domain: 'portal.unist.ac.kr',
                path:   '/EP'
            }
        ],
        screenSize: {
            width: 1024, height: 800
        },
        shotSize: {
            width: 'window', height: 1400
        },
        siteType: 'html',
        customCSS: data,
    };

    url = 'http://portal.unist.ac.kr/EP/web/collaboration/bbs/jsp/BB_BoardLst.jsp?boardid=B200902281833016691048&p=1';
    url = 'http://portal.unist.ac.kr/EP/web/collaboration/bbs/jsp/BB_BoardView.jsp';

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded',
                  'Cookie' : 'JSESSIONID=K108WejBCMPdJytNG8C9x0lXIvhFnXwfWMiOJXa59Qeid0uTqd8ythyxo6nDBwBN;'},
        url:     url,
        body:    'boardid=B200902281833016691048&bullid=BB201501051520266214113&sortby=REGDATE&orderby=desc&searchby=&searchname=&searchcondition=BULLTITLE&selectnum=0&nkid=BB201501051520266214113&rkid=BB201501051520266214113&ndepth=0&nfirst=1&sflag=1&communication_with=&categorynum=&category=&reply=',
        encoding: 'binary',
    }, function(error, response, body){
        var strContents = new Buffer(body, 'binary');
        iconv = new Iconv('euc-kr', 'UTF8');
        html = iconv.convert(strContents).toString();

        jsdom.env(
            html,
            ["http://code.jquery.com/jquery.js"],
            function (errors, window) {
                global.window=window;
                body = window.$("table")[0].innerHTML;
                body = body.replace(/\/acubeidir/g, 'http://portal.unist.ac.kr/acubeidir');
                body = body.replace(/\/EP/g, 'http://portal.unist.ac.kr/EP');

                webshot(body, './portal.png', options, function(err) {
                    if (err) return console.log(err);
                        console.log('OK');
                    gm('./portal.png').trim().write('./resize.png', function (err) {
                          if (!err) console.log('done');
                    });
                });
            }
        );

    });
});
