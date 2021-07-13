import App from '@dfgpublicidade/node-app-module';
import { SuccessHandler } from '@dfgpublicidade/node-handler-module';
import appDebugger from 'debug';
import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:controller-user-agent');

class UserAgentController extends BaseController {
    public static view(app: App): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            debug('Showing user-agent...');

            debug(`User-agent found: ${req.headers['user-agent']}`);

            return SuccessHandler.handle(app, {
                userAgent: req.headers['user-agent']
            })(req, res, next);
        };
    }
}

export default UserAgentController;
