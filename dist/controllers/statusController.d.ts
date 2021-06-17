import App from '@dfgpublicidade/node-app-module';
import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';
declare class StatusController extends BaseController {
    static view(app: App): (req: Request, res: Response, next: NextFunction) => void;
    protected static getAdditionalVariables(app: App, req: Request): Promise<any>;
}
export default StatusController;
