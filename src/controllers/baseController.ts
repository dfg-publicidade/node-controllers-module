import App from '@dfgpublicidade/node-app-module';
import Params, { Param } from '@dfgpublicidade/node-params-module';
import Security from '@dfgpublicidade/node-security-module';
import { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';

/* Module */
type AcceptedTypes = 'objectId' | 'id' | 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean';

abstract class BaseController {
    public static options(app: App, methods: string): (req: Request, res: Response, next: NextFunction) => void {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            res.header('Access-Control-Allow-Methods', methods);
            res.header('Access-Control-Allow-Headers', app.config.api.allowedHeaders);

            res.end();
        };
    }

    protected static getParam(app: App, from: any, name: string, type?: AcceptedTypes): any {
        type = type ? type : 'string';

        const params: Params = new Params(from);

        switch (type) {
            case 'objectId': {
                const param: Param = params.getString(name);
                return param && ObjectId.isValid(param.value) ? new ObjectId(param.value) : undefined;
            }
            case 'id': {
                const param: Param = params.getString(name);
                return param && Security.isId(app.config.security, param.value) ? Security.decodeId(app.config.security, param.value) : undefined;
            }
            case 'integer': {
                const param: Param = params.getInt(name);
                return param ? param.value : undefined;
            }
            case 'float': {
                const param: Param = params.getFloat(name);
                return param ? param.value : undefined;
            }
            case 'date': {
                const param: Param = params.getDate(name);
                return param ? param.value : undefined;
            }
            case 'datetime': {
                const param: Param = params.getDateTime(name);
                return param ? param.value : undefined;
            }
            case 'boolean': {
                const param: Param = params.getBoolean(name);
                return param ? param.value : undefined;
            }
            default: {
                const param: Param = params.getString(name);
                return param ? param.value : undefined;
            }
        }
    }
}

export default BaseController;
