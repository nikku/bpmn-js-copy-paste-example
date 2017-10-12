'use strict';

// be able to specify test browsers via CLI
var testBrowsers = (process.env.TEST_BROWSERS || 'Chrome').split('\s*,\s*');

if (process.env.CI) {
  testBrowsers = [ 'ChromeHeadless' ];
}

// workaround https://github.com/GoogleChrome/puppeteer/issues/290
testBrowsers = testBrowsers.map(function(browser) {

  if (browser === 'ChromeHeadless') {
    process.env.CHROME_BIN = require('puppeteer').executablePath();

    if (process.platform === 'linux') {
      return 'ChromeHeadless_Linux';
    }
  }

  return browser;
});


module.exports = function(karma) {
  karma.set({

    frameworks: [
      'browserify',
      'mocha',
      'chai'
    ],

    files: [
      'test/*.js'
    ],

    preprocessors: {
      'test/*.js': [ 'browserify' ]
    },

    browsers: testBrowsers,

    customLaunchers: {
      ChromeHeadless_Linux: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox'
        ],
        debug: true
      }
    },

    singleRun: false,
    autoWatch: true,

    // browserify configuration
    browserify: {
      debug: true,
      transform: [
        [ 'stringify', { extensions: [ '.bpmn' ] } ]
      ]
    }
  });

};
