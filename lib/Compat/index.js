'use strict';

const socketCompat = require('./socket');

const loadVoipV1 = () => import('../VoIP/index.js');
const buttonHelper = (...args) => require('./button-helper-v1').sendButtons(...args);
const sendInteractiveV1 = (...args) => require('./button-helper-v1').sendInteractiveMessage(...args);
const sendInteractiveV2 = (...args) => require('./button-helper-v1').sendInteractiveMessageV2(...args);
const rich = (name) => require(`./rich/${name}`);

module.exports = {
  ...socketCompat,
  loadVoipV1,
  sendButtonsV1: buttonHelper,
  sendInteractiveMessageV1: sendInteractiveV1,
  sendInteractiveMessageV2: sendInteractiveV2,
  richClassicV1: () => rich('rich-classic'),
  richCarouselV1: () => rich('rich-carousel'),
  richMenuV1: () => rich('rich-menu'),
  richWebUIV1: () => rich('rich-webui'),
  a2uiV1: () => rich('a2ui'),
  richMessageV1: () => rich('rich-message'),
  mexV1: () => require('./mex-v1'),
};
