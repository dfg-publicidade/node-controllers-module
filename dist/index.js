"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusController = exports.RootController = exports.BaseController = void 0;
const baseController_1 = __importDefault(require("./controllers/baseController"));
exports.BaseController = baseController_1.default;
const rootController_1 = __importDefault(require("./controllers/rootController"));
exports.RootController = rootController_1.default;
const statusController_1 = __importDefault(require("./controllers/statusController"));
exports.StatusController = statusController_1.default;
