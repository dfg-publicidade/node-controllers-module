import App from '@dfgpublicidade/node-app-module';
import { SuccessHandler } from '@dfgpublicidade/node-handler-module';
import appDebugger from 'debug';
import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:controller-status');

class StatusController extends BaseController {
    public static view(app: App): (req: Request, res: Response, next: NextFunction) => void {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            debug('Showing server status');

            try {
                return SuccessHandler.handle(app, {
                    api: app.info.name,
                    version: app.info.version,
                    situation: 'online',
                    uptime: process.uptime(),
                    cpuUsage: process.cpuUsage(),
                    memoryUsage: process.memoryUsage(),
                    environment: process.env.NODE_ENV,
                    variables: process.env,
                    ...(await this.getAdditionalVariables(app, req))
                })(req, res, next);
            }
            catch (error) {
                debug('An error has occurred showing server status');
                next(error);
            }
        };
    }

    protected static async getAdditionalVariables(app: App, req: Request): Promise<any> {
        return Promise.resolve({});
    }
}

export default StatusController;
