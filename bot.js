var fs = require('fs');
var gm = require('gm');
var jsdom = require("jsdom");
var webshot = require('webshot');
var request = require('request');
var Iconv  = require('iconv').Iconv;
var redis = require('redis'),
    client = redis.createClient();

var FB = require('./fb-auto').FB;

var DATA_DIR = './img/'
var WEBSHOT_OPTION = {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
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
    defaultWhiteBackground: true,
};

REQUEST_OPTION = {
    headers: {'content-type' : 'application/x-www-form-urlencoded',},
    body:    'boardid=B200902281833016691048&bullid=BB201501061119027194708',
    encoding: 'binary',
};

FACEBOOK_OPTION = {};

BOARD_IDS = {'B200902281833016691048': '전체공지',
             'B201309091034272615665': '학사공지',
             'B201309090952407345581': '학생지원공지',
             'B200912141432112623720': '취업 인턴쉽 리더쉽',
             'B201003111719010571299': '대학원 공지',
             'B200905061207126011324': '보안 공지',
};

BASE_URL  = 'http://portal.unist.ac.kr/EP/web/collaboration/bbs/jsp/'
BOARD_URL = BASE_URL + 'BB_BoardLst.jsp?p=1&boardid=';
BULL_URL  = BASE_URL + 'BB_BoardView.jsp';

var check_new = function () {
    for (var board_id in BOARD_IDS) {
        
    }
};

var process_html = function (html) {
    jsdom.env(
        html,
        ["http://code.jquery.com/jquery.js"],
        function (errors, window) {
            global.window=window;
            body = window.$("table")[0].innerHTML;
            body = body.replace(/\/acubeidir/g, 'http://portal.unist.ac.kr/acubeidir');
            body = body.replace(/\/EP/g, 'http://portal.unist.ac.kr/EP');

            webshot(body, './portal.png', WEBSHOT_OPTION, function(err) {
                if (err) return console.log(err);
                    console.log('OK');
                gm('./portal.png').trim().write('./resize.png', function (err) {
                        if (!err) console.log('done');
                });
            });
        }
    );
};

var start = function (err, data) {
    if (err) {
        return console.log(err);
    } else {
        WEBSHOT_OPTION['customCSS'] = data;
    }

    request.post({
        headers: {'content-type' : 'application/x-www-form-urlencoded',
                  'Cookie' : 'JSESSIONID=K108WejBCMPdJytNG8C9x0lXIvhFnXwfWMiOJXa59Qeid0uTqd8ythyxo6nDBwBN;'},
        url:     url,
        body:    'boardid=B200902281833016691048&bullid=BB201501061119027194708',
        encoding: 'binary',
    }, function(error, response, body){
        var strContents = new Buffer(body, 'binary');
        iconv = new Iconv('euc-kr', 'UTF8');
        html = iconv.convert(strContents).toString();

        process_html(html);
    });
};

client.on("error", function (err) {
    console.log("Error " + err);
});

client.get("cs-long-token", function(err, token) {
    if(err || token === null) {
        console.log("[!] Error redis: cs-long-token not exist");
        process.exit(1);
    } else {
        FACEBOOK_OPTION['token'] = token;

        client.get("portal-session", function(err, token) {
            if(err || token === null) {
                console.log("[!] Error redis: portal-session not exist");
                process.exit(1);
            } else {
                REQUEST_OPTION.headers['Cookie'] = 'JSESSIONID=' + token + ';';
                fs.readFile('main.css', 'utf8', start);
            }
        });
    }
});

