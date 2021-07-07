import App from '@dfgpublicidade/node-app-module';
import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';
declare class CalendarController extends BaseController {
    static generate(app: App): (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export default CalendarController;
