export declare class InteractiveValidationError extends Error {
  context?: string;
  errors: string[];
  warnings: string[];
  example?: unknown;
  toJSON(): Record<string, unknown>;
  formatDetailed(): string;
}
export declare function sendButtons(sock: any, jid: string, data?: any, options?: any): Promise<any>;
export declare function sendInteractiveMessage(sock: any, jid: string, data?: any, options?: any): Promise<any>;
export declare function sendInteractiveMessageV2(sock: any, jid: string, data?: any, options?: any): Promise<any>;
export declare function getButtonType(message: any): string | undefined;
export declare function getButtonArgs(message: any): any;
export declare function validateAuthoringButtons(buttons: any[]): any;
export declare function validateInteractiveMessageContent(content: any): any;
export declare function validateSendButtonsPayload(content: any): any;
export declare function validateSendInteractiveMessagePayload(content: any): any;
