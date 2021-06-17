import App from '@dfgpublicidade/node-app-module';
import { NextFunction, Request, Response } from 'express';
declare type AcceptedTypes = 'objectId' | 'id' | 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean';
declare abstract class BaseController {
    static options(app: App, methods: string): (req: Request, res: Response, next: NextFunction) => void;
    protected static getParam(app: App, from: any, name: string, type?: AcceptedTypes): any;
}
export default BaseController;
