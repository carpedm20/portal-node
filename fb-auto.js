var url = require('url');
var Browser = require('zombie');
var assert  = require('assert');

exports.FB= function (email, pass, login_url) {
    fb_url = url.parse(login_url);

    Browser.localhost(fb_url.hostname, 3000);

    var browser = Browser.create();
    browser.visit(fb_url.path, function (error) {
        assert.ifError(error);

        browser.
        fill('#email', email).
        fill('#pass', pass).
        pressButton('#login_form input[type=submit]', function(err, browser, status) {
            console.log(err.stack);
        });

        // Form submitted, new page loaded.
        browser.assert.success();
        browser.assert.text('title', 'Welcome To Brains Depot');
    });
};
