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
const node_result_module_1 = __importStar(require("@dfgpublicidade/node-result-module"));
const axios_1 = __importDefault(require("axios"));
const debug_1 = __importDefault(require("debug"));
const redis_1 = __importDefault(require("redis"));
const util_1 = require("util");
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
                    node_cache_module_1.default.flush(node_cache_module_1.CacheLevel.L2);
                    node_cache_module_1.default.flush(node_cache_module_1.CacheLevel.L1);
                }
                else {
                    debug('Emptying global cache');
                    const client = redis_1.default.createClient(app.config.redis);
                    const getKeys = util_1.promisify(client.keys).bind(client);
                    const delKeys = util_1.promisify(client.del).bind(client);
                    for (const cacheKeys of await getKeys('*')) {
                        await delKeys(cacheKeys);
                    }
                }
                debug('Cache successful cleaned');
                const result = new node_result_module_1.default(node_result_module_1.ResultStatus.SUCCESS, {
                    message: res.lang ? res.lang('cacheCleaned') : 'Cache successful cleaned'
                });
                res.status(node_result_module_1.HttpStatus.success);
                res.json(result);
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
