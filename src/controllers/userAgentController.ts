import App from '@dfgpublicidade/node-app-module';
import Result, { ResultStatus } from '@dfgpublicidade/node-result-module';
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

            const result: Result = new Result(ResultStatus.SUCCESS, {
                userAgent: req.headers['user-agent']
            });

            res.json(result);
        };
    }
}

export default UserAgentController;
