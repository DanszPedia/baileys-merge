/// <reference types="node" />

export type Jid = string;
export type SendOptions = Record<string, unknown> & { quoted?: unknown };

export interface NativeFlowButton {
  name: string;
  buttonParamsJson: string | Record<string, unknown>;
}

export interface InteractiveMessageInput {
  title?: string;
  footer?: string;
  header?: string;
  text?: string;
  image?: Buffer | { url: string } | string;
  video?: Buffer | { url: string } | string;
  document?: Buffer | { url: string } | string;
  mimetype?: string;
  fileName?: string;
  contextInfo?: Record<string, unknown>;
  buttons?: Array<NativeFlowButton | { id?: string; text?: string; displayText?: string; buttonId?: string; buttonText?: { displayText: string } }>;
  nativeFlowMessage?: {
    buttons?: NativeFlowButton[];
    messageParamsJson?: string | Record<string, unknown>;
    messageVersion?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface DanszSocket {
  ev: any;
  ws: any;
  user?: { id?: Jid; name?: string; lid?: Jid };
  authState: any;
  sendMessage(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendMsg(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendBtn(jid: Jid, content: InteractiveMessageInput | { interactiveMessage: InteractiveMessageInput }, options?: SendOptions): Promise<any>;
  sendBtnV1(jid: Jid, content: InteractiveMessageInput | { interactiveMessage: InteractiveMessageInput }, options?: SendOptions): Promise<any>;
  sendBtnV2(jid: Jid, content: InteractiveMessageInput, options?: SendOptions): Promise<any>;
  sendBtnV3(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendBtnV4(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendButtons(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendButtonsV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendInteractiveV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendInteractiveV2(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendClassicBtnV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendListV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendCarouselV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendCarouselInteractiveV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendRichMenuV1(jid: Jid, content: any, options?: SendOptions): Promise<any>;
  sendWebUIV1(jid: Jid, html: string, title?: string, options?: SendOptions): Promise<any>;
  sendA2UIV1(jid: Jid, options: any): Promise<any>;
  executeMexV1(variables: Record<string, unknown>, queryId: string, dataPath?: string): Promise<any>;
  [key: string]: any;
}

export interface SocketConfig {
  auth?: any;
  logger?: any;
  browser?: any;
  printQRInTerminal?: boolean;
  [key: string]: any;
}

export declare function makeWASocket(config?: SocketConfig): DanszSocket;
export declare const proto: any;
export declare const DisconnectReason: any;
export declare const Browsers: any;
export declare function useMultiFileAuthState(path: string): Promise<any>;
export declare function fetchLatestBaileysVersion(): Promise<any>;
export declare function makeInMemoryStore(config?: any): any;
export declare function generateWAMessage(jid: Jid, content: any, options?: any): Promise<any>;
export declare function generateWAMessageFromContent(jid: Jid, content: any, options?: any): any;
export declare function generateWAMessageContent(content: any, options?: any): Promise<any>;
export declare function prepareWAMessageMedia(content: any, options?: any): Promise<any>;
export declare function downloadMediaMessage(message: any, type: any, options?: any, config?: any): Promise<any>;
export declare function normalizeMessageContent(content: any): any;
export declare function getContentType(content: any): string | undefined;
export declare function jidDecode(jid: Jid): any;
export declare function jidEncode(user: string, server: string, device?: number, agent?: number): Jid;
export declare function jidNormalizedUser(jid: Jid): Jid;
export declare function isJidGroup(jid: Jid): boolean;
export declare function delay(ms: number): Promise<void>;
export declare function delayCancellable(ms: number, signal?: AbortSignal): Promise<void>;
export declare function initAuthCreds(): any;
export declare function makeCacheableSignalKeyStore(store: any, logger?: any): any;

export declare function attachCompatMethods(sock: DanszSocket): DanszSocket;
export declare function normalizeInteractivePayload(content: InteractiveMessageInput | { interactiveMessage: InteractiveMessageInput }): any;
export declare function makeSimpleButtonPayload(content: InteractiveMessageInput): any;
export declare function toNativeFlowButton(button: any, index: number): NativeFlowButton;
export declare function loadVoipV1(): Promise<typeof import('./lib/VoIP/index.js')>;
export declare function sendButtonsV1(sock: DanszSocket, jid: Jid, content: any, options?: SendOptions): Promise<any>;
export declare function sendInteractiveMessageV1(sock: DanszSocket, jid: Jid, content: any, options?: SendOptions): Promise<any>;
export declare function sendInteractiveMessageV2(sock: DanszSocket, jid: Jid, content: any, options?: SendOptions): Promise<any>;
export declare function richClassicV1(): any;
export declare function richCarouselV1(): any;
export declare function richMenuV1(): any;
export declare function richWebUIV1(): any;
export declare function a2uiV1(): any;
export declare function richMessageV1(): any;
export declare function mexV1(): any;

export default makeWASocket;
