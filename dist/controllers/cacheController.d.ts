import App from '@dfgpublicidade/node-app-module';
import { AxiosResponse } from 'axios';
import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';
declare class CacheController extends BaseController {
    static clean(app: App): (req: Request, res: Response, next: NextFunction) => Promise<void>;
    static requestCleaning(app: App, api: string): Promise<AxiosResponse>;
}
export default CacheController;
