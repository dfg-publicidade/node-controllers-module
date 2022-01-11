"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_handler_module_1 = require("@dfgpublicidade/node-handler-module");
const debug_1 = __importDefault(require("debug"));
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
const debug = (0, debug_1.default)('module:controller-status');
class StatusController extends baseController_1.default {
    static view(app) {
        return async (req, res, next) => {
            debug('Showing server status');
            try {
                return node_handler_module_1.SuccessHandler.handle(app, Object.assign({ api: app.info.name, version: app.info.version, situation: 'online', uptime: process.uptime(), cpuUsage: process.cpuUsage(), memoryUsage: process.memoryUsage(), environment: process.env.NODE_ENV, variables: process.env }, (await this.getAdditionalVariables(app, req))))(req, res, next);
            }
            catch (error) {
                debug('An error has occurred showing server status');
                next(error);
            }
        };
    }
    static async getAdditionalVariables(app, req) {
        return Promise.resolve({});
    }
}
exports.default = StatusController;
