'use strict';

require('dotenv').config();

var settings = module.exports;

settings.api = process.env.OBA_API;
settings.newAPI = process.env.NEW_OBA_API;
settings.port = process.env.PORT || 3001;
settings.apiKey = process.env.OBA_API_KEY || 'BETA';

if (process.env.KEYS === undefined) {
  settings.keys = [];
}

settings.keys = JSON.parse(process.env.KEYS);
