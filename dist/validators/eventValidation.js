"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = __importDefault(require("validate"));
const validatorCompl = new validate_1.default({
    title: {
        type: String,
        message: {
            type: 'O campo título deve conter um valor textual',
            required: 'É necessário informar o título do evento'
        }
    },
    start: {
        type: Date,
        required: true,
        message: {
            type: 'O campo início deve conter uma data válida',
            required: 'É necessário informar a data de início'
        }
    },
    end: {
        type: Date,
        required: true,
        message: {
            type: 'O campo término deve conter uma data válida',
            required: 'É necessário informar a data de término'
        }
    }
});
exports.default = (evento) => validatorCompl.validate(evento, {
    strip: false
});
