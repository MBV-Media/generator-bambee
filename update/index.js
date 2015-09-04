/**
 * @name BambeeUpdateGenerator
 * @author R4c00n <marcel.kempf93@gmail.com>
 * @license MIT
 * @since 1.0.6
 * @description
 *   Yeoman generator for  updating the Bambee WordPress Theme.
 * @example
 *   Usage:
 *     yo bambee:update
 */
'use strict';

var yeoman = require('yeoman-generator'),
  updateNotifier = require('update-notifier'),
  pkg = require('../package.json'),
  notifier = updateNotifier({pkg: pkg}),
  util = require('util'),
  fs = require('fs'),
  https = require('https'),
  request = require('request'),
  admzip = require('adm-zip'),
  rmdir = require('rimraf'),
  executeCommand = require('../app/execute-command.js'),
  BambeeUpdateGenerator;

/**
 * Check for updates.
 */
notifier.notify();
if (notifier.update) {
  console.log(notifier.update);
}

/**
 * @class
 * @constructor
 * @augments yeoman.generators.Base
 * @since 1.0.6
 */
BambeeUpdateGenerator = module.exports = function BambeeUpdateGenerator(args, options) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function () {
    // Execute installation commands
    executeCommand('bundle install', function () {
      executeCommand('npm install', function () {
        executeCommand('bower install', function () {
          var execOptions = {
            cwd: 'src'
          };
          executeCommand('composer install', execOptions, function () {
            console.log('Bambee WordPress Theme updated successfully!');
          });
        });
      });
    });
  });
};
util.inherits(BambeeUpdateGenerator, yeoman.generators.Base);

/**
 * Download Bambee WordPress theme.
 *
 * @since 1.0.6
 * @return {void}
 */
BambeeUpdateGenerator.prototype.download = function download() {
  var cb = this.async(),
    localPkg = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
    url;

  // Check local Bambee WordPress Theme version
  if (!localPkg.version < 1.2) {
    console.log('You need Bambee WordPress Theme Version >= 1.2 for automated updates.');
    return;
  }

  // Get version of remote Bambee WordPress Theme to determine if an update is necessary
  url = 'https://raw.githubusercontent.com/MBV-Media/Bambee-WordPress-Theme/master/package.json';
  https.get(url, function (res) {
    res.setEncoding('utf8');
    res.on('data', function (remotePkg) {
      remotePkg = JSON.parse(remotePkg);

      // Compare versions
      if (remotePkg.version > localPkg.version) {
        console.log('Downloading the Bambee WordPress theme...');

        request('https://github.com/MBV-Media/Bambee-WordPress-Theme/archive/master.zip')
          .pipe(fs.createWriteStream('plugin.zip'))
          .on('close', function () {
            var zip = new admzip('./plugin.zip');

            console.log('File downloaded!');
            zip.extractAllTo('theme_temp', true);
            fs.unlink('plugin.zip');
            cb();
          });
      } else {
        console.log('There is no newer version.');
      }
    });
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
  });
};

/**
 * Move new files into local Bambee WordPress theme.
 *
 * @since 1.0.6
 * @return {void}
 */
BambeeUpdateGenerator.prototype.update = function update() {
  console.log('Update in progress...');
  var oldLib = './lib',
    newLib = './theme_temp/Bambee-WordPress-Theme-master/lib',
    rmdirCb = function (error) {
      if (error) {
        console.log(error);
      }
    };

  rmdir(oldLib, function (error) {
    rmdirCb(error);

    // Move new lib directory into local Bambee WordPress Theme
    if (fs.existsSync(newLib)) {
      fs.renameSync(newLib, oldLib);
    }
  });
  rmdir('./node_modules', rmdirCb);
  rmdir('./bower_components', rmdirCb);
  rmdir('./src/composer.lock', rmdirCb);
  rmdir('./src/vendor', rmdirCb);
  rmdir('./theme_temp', rmdirCb);
};