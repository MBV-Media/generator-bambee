/**
 * @name BambeeInitGenerator
 * @author MBV Media <info@mbv-media.com>
 * @license MIT
 * @since 0.2.0
 * @description
 *   Yeoman generator for initializing bambee.
 * @example
 *   Usage:
 *     yo bambee:init
 */
'use strict';

const Generator = require('yeoman-generator');
const ExecuteCommand = require('../app/execute-command.js');

/**
 * @since 0.2.0
 */
class GeneratorBase extends Generator {

  /**
   * @since 0.2.0
   * @param args
   * @param opts
   */
  constructor(args, opts) {

    super(args, opts);

  }

}

/**
 * @since 0.2.0
 */
class GeneratorInit extends GeneratorBase {

  /**
   * @since 0.2.0
   * @param args
   * @param opts
   */
  constructor(args, opts) {

    super(args, opts);

  }

  /**
   * The init task.
   *
   * @since 0.2.0
   */
  init() {

    (new ExecuteCommand('npm install')).exec();
    (new ExecuteCommand('bower install')).exec();
    (new ExecuteCommand('composer install', {cwd: 'src'})).exec();

  }

}

/**
 *
 * @type {GeneratorInit}
 */
module.exports = GeneratorInit;
