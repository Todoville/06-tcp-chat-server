'use strict';

const uuid = require('uuid/v4');

module.exports = class User {
  constructor(socket) {
    this._id = uuid();
    this.nickname = `User num ${this._id}`;
    this.socket = socket;
  }
};
