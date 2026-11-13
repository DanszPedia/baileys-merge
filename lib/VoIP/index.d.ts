import type { EventEmitter } from 'node:events';

export type CallOptions = {
  /** Automatically end the call after this many milliseconds. Defaults to 120000. */
  durationMs?: number;
  /** Audio file path, `silence`, or `lavfi:<expression>`. Requires ffmpeg for non-silent audio. */
  audioSource?: string;
};

export type VoipClientConfig = {
  /** Optional PN-to-LID resolver. Required when the connected socket has no LID mapping. */
  resolveLid?: (pnJid: string, sock: any) => Promise<string | undefined> | string | undefined;
  /** Optional own LID JID override when credentials do not include `creds.me.lid`. */
  selfLidJid?: string;
  /** Optional path to the bundled or custom WASM runtime assets. */
  resourcesPath?: string;
};

export declare const CallState: Readonly<{
  Idle: 0;
  Calling: 1;
  PreacceptReceived: 2;
  ReceivedCall: 3;
  AcceptSent: 4;
  AcceptReceived: 5;
  Active: 6;
  ActiveElsewhere: 7;
  Ending: 13;
}>;
export type CallState = (typeof CallState)[keyof typeof CallState];

export declare class ActiveCall extends EventEmitter {
  readonly callId: string;
  readonly state: CallState;
  end(): void;
  mute(muted: boolean): void;
  waitForEnd(): Promise<string | undefined>;
  on(event: 'ringing' | 'connected', listener: () => void): this;
  on(event: 'audio', listener: (pcm: Float32Array) => void): this;
  on(event: 'ended', listener: (reason: string) => void): this;
}

export declare class VoipClient {
  constructor(config?: VoipClientConfig);
  connectWithSocket(sock: any): Promise<void>;
  call(phoneNumber: string, options?: CallOptions): Promise<ActiveCall>;
  disconnect(): void;
}
