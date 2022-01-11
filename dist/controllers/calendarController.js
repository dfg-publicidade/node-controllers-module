"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_handler_module_1 = require("@dfgpublicidade/node-handler-module");
const debug_1 = __importDefault(require("debug"));
const ics_1 = require("ics");
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const eventValidation_1 = __importDefault(require("../validators/eventValidation"));
const baseController_1 = __importDefault(require("./baseController"));
/* Module */
const debug = (0, debug_1.default)('module:controller-calendar');
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
                const errors = (0, eventValidation_1.default)({
                    start, end,
                    title, description,
                    location, url,
                    latitude, longitude,
                    categories
                });
                if (errors.length > 0) {
                    debug('Invalid data to create file');
                    return node_handler_module_1.InvalidRequestHandler.handle(app, 'invalidData', errors)(req, res, next);
                }
                else {
                    const startCal = (0, moment_timezone_1.default)(start).tz(process.env.TZ);
                    const endCal = (0, moment_timezone_1.default)(end).tz(process.env.TZ);
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
                    const icsData = (0, ics_1.createEvent)(event);
                    if (icsData.error) {
                        debug('An error has ocurred creating .ics file');
                        return node_handler_module_1.InvalidRequestHandler.handle(app, 'invalidData', [icsData.error])(req, res, next);
                    }
                    else {
                        return node_handler_module_1.SuccessHandler.handle(app, icsData.value, {
                            contentType: 'text/calendar',
                            contentDisposition: 'attachment',
                            filename: title,
                            ext: '.ics'
                        })(req, res, next);
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
