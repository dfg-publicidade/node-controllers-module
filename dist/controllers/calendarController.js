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
const node_result_module_1 = __importStar(require("@dfgpublicidade/node-result-module"));
const node_strings_module_1 = __importDefault(require("@dfgpublicidade/node-strings-module"));
const debug_1 = __importDefault(require("debug"));
const ics_1 = require("ics");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const eventValidation_1 = __importDefault(require("../validators/eventValidation"));
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
const debug = debug_1.default('module:controller-calendar');
class CalendarController extends baseController_1.default {
    static generate(app) {
        return async (req, res, next) => {
            debug('Start generating .ics');
            try {
                const start = this.getParam(app, req.query, 'start', 'datetime');
                const end = this.getParam(app, req.query, 'end', 'datetime');
                const title = this.getParam(app, req.query, 'title');
                const description = this.getParam(app, req.query, 'description');
                const location = this.getParam(app, req.query, 'location');
                const url = this.getParam(app, req.query, 'url');
                const latitude = this.getParam(app, req.query, 'latitude', 'float');
                const longitude = this.getParam(app, req.query, 'longitude', 'float');
                const categories = this.getParam(app, req.query, 'categories');
                const errors = eventValidation_1.default({
                    start, end,
                    title, description,
                    location, url,
                    latitude, longitude,
                    categories
                });
                if (errors.length > 0) {
                    debug('Invalid data to create file');
                    const result = new node_result_module_1.default(node_result_module_1.ResultStatus.WARNING, {
                        message: res.lang ? res.lang('invalidData') : 'The data provided is invalid',
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        errors_validation: errors.map((error) => error.message)
                    });
                    res.status(node_result_module_1.HttpStatus.badRequest);
                    res.json(result);
                }
                else {
                    const startCal = moment_timezone_1.default(start).tz(process.env.TZ);
                    const endCal = moment_timezone_1.default(end).tz(process.env.TZ);
                    const duration = moment_timezone_1.default.duration(endCal.diff(startCal));
                    const hours = duration.asHours();
                    // eslint-disable-next-line no-magic-numbers
                    const minutes = duration.asMinutes() % 60;
                    const event = {
                        start: [startCal.year(), startCal.month() + 1, startCal.date(), startCal.hour(), startCal.minute()],
                        duration: { hours, minutes },
                        title,
                        description,
                        location,
                        url,
                        geo: latitude && longitude ? { lat: latitude, lon: longitude } : undefined,
                        categories: categories ? categories.split(',') : []
                    };
                    const icsData = ics_1.createEvent(event);
                    if (icsData.error) {
                        debug('An error has ocurred creating .ics file');
                        const result = new node_result_module_1.default(node_result_module_1.ResultStatus.WARNING, {
                            message: res.lang ? res.lang('invalidData') : 'The data provided is invalid',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            errors_validation: [
                                icsData.error
                            ]
                        });
                        res.status(node_result_module_1.HttpStatus.badRequest);
                        res.json(result);
                    }
                    else {
                        res.header('Content-Type', 'text/calendar');
                        res.header('Content-Disposition', `attachment; filename="${node_strings_module_1.default.toUrl(title)}.ics"`);
                        res.write(icsData.value);
                        res.end();
                    }
                }
            }
            catch (error) {
                debug('There was an error inserting the record.');
                next(error);
            }
        };
    }
}
exports.default = CalendarController;
