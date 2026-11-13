import cjs from './index.js';

// Default import always exposes the complete CommonJS export surface.
export default cjs.default ?? cjs.makeWASocket;

// Commonly used Baileys exports are statically re-exported for native ESM.
export const makeWASocket = cjs.makeWASocket;
export const proto = cjs.proto;
export const useMultiFileAuthState = cjs.useMultiFileAuthState;
export const fetchLatestBaileysVersion = cjs.fetchLatestBaileysVersion;
export const Browsers = cjs.Browsers;
export const DisconnectReason = cjs.DisconnectReason;
export const makeInMemoryStore = cjs.makeInMemoryStore;
export const generateWAMessage = cjs.generateWAMessage;
export const generateWAMessageFromContent = cjs.generateWAMessageFromContent;
export const generateWAMessageContent = cjs.generateWAMessageContent;
export const prepareWAMessageMedia = cjs.prepareWAMessageMedia;
export const downloadMediaMessage = cjs.downloadMediaMessage;
export const normalizeMessageContent = cjs.normalizeMessageContent;
export const getContentType = cjs.getContentType;
export const jidDecode = cjs.jidDecode;
export const jidEncode = cjs.jidEncode;
export const jidNormalizedUser = cjs.jidNormalizedUser;
export const isJidGroup = cjs.isJidGroup;
export const delay = cjs.delay;
export const delayCancellable = cjs.delayCancellable;
export const initAuthCreds = cjs.initAuthCreds;
export const makeCacheableSignalKeyStore = cjs.makeCacheableSignalKeyStore;

// Dansz convenience APIs and opt-in helper families.
export const attachCompatMethods = cjs.attachCompatMethods;
export const normalizeInteractivePayload = cjs.normalizeInteractivePayload;
export const makeSimpleButtonPayload = cjs.makeSimpleButtonPayload;
export const toNativeFlowButton = cjs.toNativeFlowButton;
export const loadVoipV1 = cjs.loadVoipV1;
export const sendButtonsV1 = cjs.sendButtonsV1;
export const sendInteractiveMessageV1 = cjs.sendInteractiveMessageV1;
export const sendInteractiveMessageV2 = cjs.sendInteractiveMessageV2;
export const richClassicV1 = cjs.richClassicV1;
export const richCarouselV1 = cjs.richCarouselV1;
export const richMenuV1 = cjs.richMenuV1;
export const richWebUIV1 = cjs.richWebUIV1;
export const a2uiV1 = cjs.a2uiV1;
export const richMessageV1 = cjs.richMessageV1;
export const mexV1 = cjs.mexV1;
