"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
class RootController extends baseController_1.default {
    static main() {
        return async (req, res, next) => {
            res.end();
        };
    }
}
exports.default = RootController;
