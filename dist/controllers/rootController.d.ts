import { NextFunction, Request, Response } from 'express';
import BaseController from './baseController';
declare class RootController extends BaseController {
    static main(): (req: Request, res: Response, next: NextFunction) => void;
}
export default RootController;
