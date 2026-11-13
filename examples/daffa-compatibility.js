// Direct Daffa-compatible smoke test payloads.
// Run inside an Alya command handler after requiring:
// const { tokenizeCode } = require("./lib/Utils/rich-message-utils");
async function daffaCompatibilityExamples(sock, jid, quoted) {
    await sock.sendMessage(jid, {
        interactiveMessage: {
            title: "Test Interactive",
            footer: "Ryuu + Daffa",
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Test",
                        id: "#test"
                    })
                }]
            }
        }
    }, { quoted });

    await sock.sendMessage(jid, {
        disclaimerText: "RAW submessages structure example",
        richResponse: [{
            text: "Example Usage"
        }, {
            language: "javascript",
            code: [{
                highlightType: 0,
                codeContent: 'console.log("Hello, World!")'
            }]
        }, {
            text: "Pretty simple, right?"
        }, {
            title: "Runtime Comparison",
            table: [
                { isHeading: true, items: ["", "Node.js", "Bun", "Deno"] },
                { isHeading: false, items: ["Engine", "V8 (C++)", "JavaScriptCore (C++)", "V8 (C++)"] }
            ]
        }]
    });
}
module.exports = { daffaCompatibilityExamples };
