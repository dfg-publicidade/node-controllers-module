"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_handler_module_1 = require("@dfgpublicidade/node-handler-module");
const debug_1 = __importDefault(require("debug"));
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
const debug = debug_1.default('module:controller-user-agent');
class UserAgentController extends baseController_1.default {
    static view(app) {
        return async (req, res, next) => {
            debug('Showing user-agent...');
            debug(`User-agent found: ${req.headers['user-agent']}`);
            return node_handler_module_1.SuccessHandler.handle(app, {
                userAgent: req.headers['user-agent']
            })(req, res, next);
        };
    }
}
exports.default = UserAgentController;
