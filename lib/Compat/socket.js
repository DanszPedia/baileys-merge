'use strict';

const normalizeInteractivePayload = (content) => {
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    throw new TypeError('sendBtn expects an interactive message object');
  }
  return Object.prototype.hasOwnProperty.call(content, 'interactiveMessage')
    ? content
    : { interactiveMessage: content };
};

const toNativeFlowButton = (button, index) => {
  if (!button || typeof button !== 'object') {
    throw new TypeError(`buttons[${index}] must be an object`);
  }
  if (button.name && button.buttonParamsJson !== undefined) {
    return {
      ...button,
      buttonParamsJson: typeof button.buttonParamsJson === 'string'
        ? button.buttonParamsJson
        : JSON.stringify(button.buttonParamsJson),
    };
  }
  if (button.buttonId || button.buttonText?.displayText) {
    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: button.buttonText?.displayText || button.displayText || `Button ${index + 1}`,
        id: button.buttonId || button.id || `quick_${index + 1}`,
      }),
    };
  }
  if (button.id || button.text || button.displayText) {
    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: button.text || button.displayText || `Button ${index + 1}`,
        id: button.id || `quick_${index + 1}`,
      }),
    };
  }
  return button;
};

const makeSimpleButtonPayload = (data = {}) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError('sendBtnV2 expects an object');
  }
  const buttons = data.buttons || data.interactiveButtons || data.nativeFlowMessage?.buttons || [];
  if (!Array.isArray(buttons)) throw new TypeError('buttons must be an array');
  const nativeFlowMessage = {
    ...(data.nativeFlowMessage || {}),
    buttons: buttons.map(toNativeFlowButton),
  };
  if (nativeFlowMessage.messageParamsJson !== undefined && typeof nativeFlowMessage.messageParamsJson !== 'string') {
    nativeFlowMessage.messageParamsJson = JSON.stringify(nativeFlowMessage.messageParamsJson);
  }
  const interactiveMessage = { ...data };
  delete interactiveMessage.interactiveButtons;
  delete interactiveMessage.buttons;
  delete interactiveMessage.text;
  delete interactiveMessage.body;
  interactiveMessage.title = data.title || data.text || data.body?.text || '';
  interactiveMessage.footer = data.footer || '';
  interactiveMessage.nativeFlowMessage = nativeFlowMessage;
  return { interactiveMessage };
};

const lazyButtonHelper = () => require('./button-helper-v1');
const lazyRich = (name) => require(`./rich/${name}`);

/** Attach additive aliases and optional message builders to an initialized Dansz socket. */
const attachCompatMethods = (sock) => {
  if (!sock || typeof sock.sendMessage !== 'function') {
    throw new TypeError('attachCompatMethods expects an initialized Baileys socket');
  }
  if (sock.__danszCompatAttached) return sock;

  const sendMsg = (jid, content, options = {}) => sock.sendMessage(jid, content, options);
  const sendBtnV1 = (jid, content, options = {}) =>
    sock.sendMessage(jid, normalizeInteractivePayload(content), options);
  const sendBtnV2 = (jid, data = {}, options = {}) =>
    sock.sendMessage(jid, makeSimpleButtonPayload(data), options);
  const sendBtnV3 = (jid, data = {}, options = {}) =>
    lazyButtonHelper().sendInteractiveMessage(sock, jid, data, options);
  const sendBtnV4 = (jid, data = {}, options = {}) =>
    lazyButtonHelper().sendInteractiveMessageV2(sock, jid, data, options);

  Object.assign(sock, {
    // Familiar aliases requested by Dansz consumers.
    sendMsg,
    sendBtn: sendBtnV1,
    sendBtnV1,
    sendBtnV2,
    sendBtnV3,
    sendBtnV4,
    sendButtons: (jid, data = {}, options = {}) =>
      lazyButtonHelper().sendButtons(sock, jid, data, options),
    sendButtonsV1: (jid, data = {}, options = {}) =>
      lazyButtonHelper().sendButtons(sock, jid, data, options),
    sendInteractiveV1: (jid, data = {}, options = {}) =>
      lazyButtonHelper().sendInteractiveMessage(sock, jid, data, options),
    sendInteractiveV2: (jid, data = {}, options = {}) =>
      lazyButtonHelper().sendInteractiveMessageV2(sock, jid, data, options),

    // Classic template messages (separate from native-flow interactive messages).
    sendClassicBtnV1: (jid, data = {}, options = {}) => {
      const helper = lazyRich('rich-classic');
      const payload = helper.buildButtonsMessage(data);
      return helper.sendClassicMessage(sock, jid, payload, options);
    },
    sendListV1: (jid, data = {}, options = {}) => {
      const helper = lazyRich('rich-classic');
      const payload = helper.buildListMessage(data);
      return helper.sendClassicMessage(sock, jid, payload, options);
    },
    sendCarouselV1: (jid, data = {}, options = {}) =>
      lazyRich('rich-carousel').sendCarouselMessage(sock, jid, data, options),
    sendCarouselInteractiveV1: (jid, data = {}, options = {}) =>
      lazyRich('rich-carousel').sendInteractiveMessage(sock, jid, data, options),
    sendRichMenuV1: (jid, data = {}, options = {}) =>
      lazyRich('rich-menu').sendRichMenu(sock, jid, data, options),
    sendWebUIV1: (jid, html, title, options = {}) =>
      lazyRich('rich-webui').sendInlineWebUI(sock, jid, html, title, options),
    sendA2UIV1: (jid, options = {}) =>
      lazyRich('a2ui').sendA2UIWidget(sock, jid, options),
    executeMexV1: (variables, queryId, dataPath) => {
      const { executeWMexQuery } = require('./mex-v1');
      return executeWMexQuery(variables, queryId, dataPath, sock.query, sock.generateMessageTag);
    },
  });

  Object.defineProperty(sock, '__danszCompatAttached', {
    value: true,
    enumerable: false,
    configurable: false,
  });
  return sock;
};

module.exports = {
  attachCompatMethods,
  normalizeInteractivePayload,
  makeSimpleButtonPayload,
  toNativeFlowButton,
};
