"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_params_module_1 = __importDefault(require("@dfgpublicidade/node-params-module"));
const node_security_module_1 = __importDefault(require("@dfgpublicidade/node-security-module"));
const mongodb_1 = require("mongodb");
class BaseController {
    static options(app, methods) {
        return async (req, res, next) => {
            res.header('Access-Control-Allow-Methods', methods);
            res.header('Access-Control-Allow-Headers', app.config.api.allowedHeaders);
            res.end();
        };
    }
    static getParam(app, from, name, type) {
        type = type ? type : 'string';
        const params = new node_params_module_1.default(from);
        switch (type) {
            case 'objectId': {
                const param = params.getString(name);
                return param && mongodb_1.ObjectId.isValid(param.value) ? new mongodb_1.ObjectId(param.value) : undefined;
            }
            case 'id': {
                const param = params.getString(name);
                return param && node_security_module_1.default.isId(app.config.security, param.value) ? node_security_module_1.default.decodeId(app.config.security, param.value) : undefined;
            }
            case 'integer': {
                const param = params.getInt(name);
                return param ? param.value : undefined;
            }
            case 'float': {
                const param = params.getFloat(name);
                return param ? param.value : undefined;
            }
            case 'date': {
                const param = params.getDate(name);
                return param ? param.value : undefined;
            }
            case 'datetime': {
                const param = params.getDateTime(name);
                return param ? param.value : undefined;
            }
            case 'boolean': {
                const param = params.getBoolean(name);
                return param ? param.value : undefined;
            }
            default: {
                const param = params.getString(name);
                return param ? param.value : undefined;
            }
        }
    }
}
exports.default = BaseController;
