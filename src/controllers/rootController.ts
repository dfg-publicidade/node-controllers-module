import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';

/* Module */
class RootController extends BaseController {
    public static main(): (req: Request, res: Response, next: NextFunction) => void {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            res.end();
        };
    }
}

export default RootController;
