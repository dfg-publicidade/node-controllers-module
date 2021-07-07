import App from '@dfgpublicidade/node-app-module';
import Cache, { CacheLevel } from '@dfgpublicidade/node-cache-module';
import Result, { HttpStatus, ResultStatus } from '@dfgpublicidade/node-result-module';
import axios, { AxiosResponse } from 'axios';
import appDebugger from 'debug';
import { NextFunction, Request, Response } from 'express';
import { Tedis } from 'tedis';
import BaseController from './baseController';

/* Module */
const debug: appDebugger.IDebugger = appDebugger('module:controller-cache');

class CacheController extends BaseController {
    public static clean(app: App): (req: Request, res: Response, next: NextFunction) => Promise<void> {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            debug('Starting cache cleaning');

            try {
                const local: boolean = this.getParam(app, req.query, 'local', 'boolean');

                if (local) {
                    debug('Emptying local cache');

                    await Cache.flush(CacheLevel.L2);
                    await Cache.flush(CacheLevel.L1);
                }
                else {
                    debug('Emptying global cache');

                    const tedis: Tedis = new Tedis(app.config.redis);

                    const keys: string[] = await tedis.keys('*');

                    for (const key of keys) {
                        await tedis.del(key);
                    }
                }

                debug('Cache successful cleaned');

                const result: Result = new Result(ResultStatus.SUCCESS, {
                    message: res.lang ? res.lang('cacheCleaned') : 'Cache successful cleaned'
                });

                res.status(HttpStatus.success);
                res.json(result);
            }
            catch (error) {
                debug('An error has occurred when tried to clear cache');
                next(error);
            }
        };
    }

    public static async requestCleaning(app: App, api: string): Promise<AxiosResponse> {
        return axios({
            method: 'DELETE',
            url: app.config.api.url + app.config.api[api].uri + app.config.api[api].endpoints.cache,
            headers: {
                client_id: app.config.api.clientId
            },
            params: {
                local: true
            }
        });
    }
}

export default CacheController;
