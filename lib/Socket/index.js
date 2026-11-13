"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const Defaults_1 = require("../Defaults");
const business_1 = require("./business");
const communities_1 = require("./communities");
const compat_1 = require("../Compat");

// export the last socket layer
const makeWASocket = (config) => {
    const sock = (0, business_1.makeBusinessSocket)({
        ...Defaults_1.DEFAULT_CONNECTION_CONFIG,
        ...config
    });

    const communitySock =
        (0, communities_1.makeCommunitiesSocket)(sock);

    return (0, compat_1.attachCompatMethods)(communitySock);
};

exports.default = makeWASocket;
