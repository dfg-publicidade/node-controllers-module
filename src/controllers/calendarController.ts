import App from '@dfgpublicidade/node-app-module';
import { InvalidRequestHandler, SuccessHandler } from '@dfgpublicidade/node-handler-module';
import { HttpStatus } from '@dfgpublicidade/node-result-module';
import appDebugger from 'debug';
import { NextFunction, Request, Response } from 'express';
import { createEvent, ReturnObject } from 'ics';
import moment, { Moment } from 'moment-timezone';
import eventValidate from '../validators/eventValidation';
import BaseController from './baseController';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:controller-calendar');

class CalendarController extends BaseController {
    public static generate(app: App): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            debug('Start generating .ics');

            try {
                const start: Date = this.getParam(app, req.query, 'start', 'datetime');
                const end: Date = this.getParam(app, req.query, 'end', 'datetime');
                const title: string = this.getParam(app, req.query, 'title');
                const description: string = this.getParam(app, req.query, 'description');
                const location: string = this.getParam(app, req.query, 'location');
                const url: string = this.getParam(app, req.query, 'url');
                const latitude: number = this.getParam(app, req.query, 'latitude', 'float');
                const longitude: number = this.getParam(app, req.query, 'longitude', 'float');
                const categories: string = this.getParam(app, req.query, 'categories');

                const errors: any[] = eventValidate({
                    start, end,
                    title, description,
                    location, url,
                    latitude, longitude,
                    categories
                });

                if (errors.length > 0) {
                    debug('Invalid data to create file');
                    return InvalidRequestHandler.handle(app, 'invalidData', errors)(req, res, next);
                }
                else {
                    const startCal: Moment = moment(start).tz(process.env.TZ);
                    const endCal: Moment = moment(end).tz(process.env.TZ);

                    const duration: moment.Duration = moment.duration(endCal.diff(startCal));

                    const hours: number = duration.asHours();
                    // eslint-disable-next-line no-magic-numbers
                    const minutes: number = duration.asMinutes() % 60;

                    const event: any = {
                        start: [startCal.year(), startCal.month() + 1, startCal.date(), startCal.hour(), startCal.minute()],
                        duration: { hours, minutes },
                        title,
                        description,
                        location,
                        url,
                        geo: latitude && longitude ? { lat: latitude, lon: longitude } : undefined,
                        categories: categories ? categories.split(',') : []
                    };

                    const icsData: ReturnObject = createEvent(event);

                    if (icsData.error) {
                        debug('An error has ocurred creating .ics file');
                        return InvalidRequestHandler.handle(app, 'invalidData', [icsData.error])(req, res, next);
                    }
                    else {
                        return SuccessHandler.handle(app, icsData.value, HttpStatus.success, {
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

export default CalendarController;
