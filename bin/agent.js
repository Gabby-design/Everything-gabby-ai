#!/usr/bin/env node
/**
 * agent CLI - Alias for gabby
 */

const gabby = require('./gabby.js');

if (require.main === module) {
  gabby.main();
}

module.exports = gabby;
