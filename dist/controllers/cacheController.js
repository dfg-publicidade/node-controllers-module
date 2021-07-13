"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cache_module_1 = __importStar(require("@dfgpublicidade/node-cache-module"));
const node_handler_module_1 = require("@dfgpublicidade/node-handler-module");
const axios_1 = __importDefault(require("axios"));
const debug_1 = __importDefault(require("debug"));
const tedis_1 = require("tedis");
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
const debug = debug_1.default('module:controller-cache');
class CacheController extends baseController_1.default {
    static clean(app) {
        return async (req, res, next) => {
            debug('Starting cache cleaning');
            try {
                const local = this.getParam(app, req.query, 'local', 'boolean');
                if (local) {
                    debug('Emptying local cache');
                    await node_cache_module_1.default.flush(node_cache_module_1.CacheLevel.L2);
                    await node_cache_module_1.default.flush(node_cache_module_1.CacheLevel.L1);
                }
                else {
                    debug('Emptying global cache');
                    const tedis = new tedis_1.Tedis(app.config.redis);
                    const keys = await tedis.keys('*');
                    for (const key of keys) {
                        await tedis.del(key);
                    }
                }
                debug('Cache successful cleaned');
                return node_handler_module_1.SuccessHandler.handle(app, {
                    message: res.lang ? res.lang('cacheCleaned') : 'Cache successful cleaned'
                })(req, res, next);
            }
            catch (error) {
                debug('An error has occurred when tried to clear cache');
                next(error);
            }
        };
    }
    static async requestCleaning(app, api) {
        return axios_1.default({
            method: 'DELETE',
            url: app.config.api.url + app.config.api[api].uri + app.config.api[api].endpoints.cache,
            headers: {
                client_id: app.config.api.clientId
            },
            params: {
                local: true
            }
        });
    }
}
exports.default = CacheController;
