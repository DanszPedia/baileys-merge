/* Daffa-compatible rich-response API for dansz. */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapToBotForwardedMessage = exports.botMetadataCertificate = exports.botMetadataSignature = exports.prepareRichResponseMessage = exports.toUnified = exports.tokenizeCode = void 0;
const { getRandomValues, randomUUID } = require("crypto");
const WAProto_1 = require("../../WAProto");

const TYPE = Object.freeze({
    DEFAULT: 0, COMMENT: 1, STRING: 2, KEYWORD: 3,
    METHOD: 4, NUMBER: 5
});
const KEYWORDS = new Set((
    "break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return super switch this throw try typeof var void while with yield async await of static get set constructor true false null undefined " +
    "def elif except from global lambda nonlocal pass raise and as assert del is not or not with yield None True False " +
    "func package defer go map range struct interface select chan type fallthrough switch " +
    "fn pub impl trait match mod use crate self Self let mut enum struct const static ref " +
    "using namespace template typename public private protected virtual override class struct union auto constexpr nullptr " +
    "fn echo then fi done in case esac function export local readonly declare source alias unalias"
).split(/\s+/));

const LEXER_REGEX = /(\/\/.*|\/\*[\s\S]*?\*\/|#.*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[\s\S]*?`)|(\b[a-zA-Z_]\w*\b)(?=\s*\()|(\b[a-zA-Z_]\w*\b)|(\b\d+(?:\.\d+)?\b)|(\s+|[^\w\s]+)/g;

const tokenizeCode = (code, language = "javascript") => {
    const blocks = [];
    LEXER_REGEX.lastIndex = 0;
    let match;
    while ((match = LEXER_REGEX.exec(String(code))) !== null) {
        if (match[1]) blocks.push({ highlightType: TYPE.COMMENT, codeContent: match[1] });
        else if (match[2]) blocks.push({ highlightType: TYPE.STRING, codeContent: match[2] });
        else if (match[3]) blocks.push({ highlightType: KEYWORDS.has(match[3]) ? TYPE.KEYWORD : TYPE.METHOD, codeContent: match[3] });
        else if (match[4]) blocks.push({ highlightType: KEYWORDS.has(match[4]) ? TYPE.KEYWORD : TYPE.DEFAULT, codeContent: match[4] });
        else if (match[5]) blocks.push({ highlightType: TYPE.NUMBER, codeContent: match[5] });
        else blocks.push({ highlightType: TYPE.DEFAULT, codeContent: match[6] });
    }
    return blocks;
};
exports.tokenizeCode = tokenizeCode;

const toUnified = (submessages) => ({
    response_id: randomUUID(),
    sections: submessages.map((submessage) => {
        switch (submessage.messageType) {
            case 1:
                return { view_model: { primitive: { language: submessage.codeMetadata.codeLanguage, code_blocks: submessage.codeMetadata.codeBlocks.map((block) => ({ content: block.codeContent, type: ["DEFAULT","COMMENT","STRING","KEYWORD","METHOD","NUMBER"][block.highlightType] || "DEFAULT" })), __typename: "GenAICodeUXPrimitive" }, __typename: "GenAISingleLayoutViewModel" } };
            case 2:
                return { view_model: { primitive: { title: submessage.tableMetadata.title, rows: submessage.tableMetadata.rows.map((row) => ({ is_header: !!row.isHeading, cells: row.items, markdown_cells: row.items.map((item) => ({ text: item })) })), __typename: "GenATableUXPrimitive" }, __typename: "GenAISingleLayoutViewModel" } };
            default:
                return { view_model: { primitive: { text: submessage.messageText || "", inline_entities: submessage.inlineEntities || [], __typename: "GenAIMarkdownTextUXPrimitive" }, __typename: "GenAISingleLayoutViewModel" } };
        }
    })
});
exports.toUnified = toUnified;

const prepareRichResponseMessage = (content) => {
    const { code, contentText, disclaimerText, footerText, headerText, language, links, noHeading, richResponse, table, title } = content;
    let submessages = [];

    if (Array.isArray(richResponse)) {
        submessages = richResponse.map((s) => {
            if (s && s.text !== undefined) return { messageType: 0, messageText: s.text, inlineEntities: s.inlineEntities };
            if (s && s.code !== undefined) return { messageType: 1, codeMetadata: { codeLanguage: s.language || "javascript", codeBlocks: s.code } };
            if (s && s.table) return { messageType: 2, tableMetadata: { title: s.title, rows: s.table } };
            return s;
        });
    } else {
        if (headerText) submessages.push({ messageType: 0, messageText: headerText });
        if (contentText) submessages.push({ messageType: 0, messageText: contentText });
        if (code) {
            const lang = language || "javascript";
            submessages.push({ messageType: 1, codeMetadata: { codeLanguage: lang, codeBlocks: exports.tokenizeCode(code, lang) } });
        } else if (links) {
            links.forEach((link, i) => {
                const key = "SS_" + i;
                const url = link.url || "https://google.com";
                submessages.push({
                    messageType: 0,
                    messageText: `${link.text || ""} {{${key}}}¹{{/${key}}} `,
                    inlineEntities: [{
                        key,
                        metadata: {
                            reference_id: i + 1, reference_url: url,
                            reference_title: link.title || "",
                            reference_display_name: link.displayName || link.text || "",
                            sources: (link.sources || []).map(s => ({
                                source_type: "THIRD_PARTY",
                                source_display_name: s.displayName || "",
                                source_subtitle: s.subtitle || "",
                                source_url: s.url || url
                            })),
                            __typename: "GenAISearchCitationItem"
                        }
                    }]
                });
            });
        } else if (table) {
            submessages.push({
                messageType: 2,
                tableMetadata: {
                    title,
                    rows: table.map((items, i) => ({ isHeading: !noHeading && i === 0, items }))
                }
            });
        }
        if (footerText) submessages.push({ messageType: 0, messageText: footerText });
    }

    const unified = exports.toUnified(submessages);
    const richResponseMessage = WAProto_1.proto.AIRichResponseMessage.create({
        submessages,
        messageType: WAProto_1.proto.AIRichResponseMessage.AIRichResponseMessageType.AI_RICH_RESPONSE_TYPE_STANDARD,
        unifiedResponse: { data: Buffer.from(JSON.stringify(unified), "utf8") },
        contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
            forwardOrigin: 4
        }
    });
    const message = exports.wrapToBotForwardedMessage(richResponseMessage);
    const botMetadata = message.messageContextInfo.botMetadata;
    if (disclaimerText) botMetadata.messageDisclaimerText = disclaimerText;
    botMetadata.botResponseId = unified.response_id;
    return message;
};
exports.prepareRichResponseMessage = prepareRichResponseMessage;

const botMetadataSignature = () => {
    const signature = new Uint8Array(64);
    getRandomValues(signature);
    return signature;
};
exports.botMetadataSignature = botMetadataSignature;

const botMetadataCertificate = (length = 685) => {
    const certificate = new Uint8Array(length);
    certificate[0] = 48;
    certificate[1] = 130;
    getRandomValues(certificate.subarray(2));
    return certificate;
};
exports.botMetadataCertificate = botMetadataCertificate;

const wrapToBotForwardedMessage = (richResponseMessage) => ({
    messageContextInfo: {
        botMetadata: {
            verificationMetadata: {
                proofs: [{
                    certificateChain: [exports.botMetadataCertificate(), exports.botMetadataCertificate(892)],
                    version: 1, useCase: 1, signature: exports.botMetadataSignature()
                }]
            }
        }
    },
    botForwardedMessage: { message: { richResponseMessage } }
});
exports.wrapToBotForwardedMessage = wrapToBotForwardedMessage;
