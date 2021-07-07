import App from '@dfgpublicidade/node-app-module';
import Cache, { CacheLevel } from '@dfgpublicidade/node-cache-module';
import { HttpStatus } from '@dfgpublicidade/node-result-module';
import { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import expeditousRedis from 'expeditious-engine-redis';
import express, { Express, NextFunction, Request, Response } from 'express';
import { ExpressExpeditiousInstance } from 'express-expeditious';
import http from 'http';
import i18n from 'i18n';
import { after, before, describe, it } from 'mocha';
import { Tedis } from 'tedis';
import CacheController from '../src/controllers/cacheController';

import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

describe('cacheController.ts', (): void => {
    let exp: Express;
    let httpServer: http.Server;
    let app: App;
    let app2: App;
    let count: number = 0;

    before(async (): Promise<void> => {
        if (!process.env.REDIS_TEST_HOST || !process.env.REDIS_TEST_PASSWORD) {
            throw new Error('REDIS_TEST_HOST and REDIS_TEST_PASSWORD must be set.');
        }

        exp = express();
        const port: number = 3000;

        exp.set('port', port);

        httpServer = http.createServer(exp);

        app = new App({
            appInfo: {
                name: 'test',
                version: 'v1'
            },
            config: {
                api: {
                    url: 'http://localhost:3000',
                    clientId: '1234',
                    test: {
                        uri: '/test',
                        endpoints: {
                            cache: '/cache'
                        }
                    }
                },
                cache: {
                    system: {
                        idField: 'identificacao'
                    },
                    ttl: {
                        L1: '1 minute',
                        L2: '5 minutes'
                    }
                },
                redis: {
                    host: process.env.REDIS_TEST_HOST,
                    password: process.env.REDIS_TEST_PASSWORD
                }
            }
        });

        app2 = new App({
            appInfo: {
                name: 'test',
                version: 'v1'
            },
            config: {
                api: {
                    url: 'http://localhost:3000',
                    clientId: '1234',
                    test: {
                        uri: '/test',
                        endpoints: {
                            cache: '/cache2'
                        }
                    }
                },
                cache: {
                    system: {
                        idField: 'identificacao'
                    },
                    ttl: {
                        L1: '1 minute',
                        L2: '5 minutes'
                    }
                },
                redis: {
                    host: process.env.REDIS_TEST_HOST
                }
            }
        });

        delete app2.config.redis.password;

        i18n.configure({
            defaultLocale: 'pt-BR',
            locales: ['pt-BR'],
            directory: 'test/lang',
            autoReload: true,
            updateFiles: false,
            api: {
                __: 'lang',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                __n: 'langN'
            }
        });

        const cacheL1: ExpressExpeditiousInstance = Cache.create(app, CacheLevel.L1);
        const cacheL1R: ExpressExpeditiousInstance = Cache.create(app, CacheLevel.L1, expeditousRedis(app.config));

        exp.get('/hit', cacheL1, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            res.json(count);
        });

        exp.get('/hit2', cacheL1R, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            res.json(count);
        });

        exp.get('/', CacheController.clean(app));

        exp.get('/2', CacheController.clean(app2));

        exp.delete('/test/cache', CacheController.clean(app));

        exp.use(i18n.init);

        exp.delete('/test/cache2', CacheController.clean(app2));

        exp.use((error: any, req: Request, res: Response, next: NextFunction): void => {
            // eslint-disable-next-line no-magic-numbers
            res.status(500);
            res.send(error.message);
        });

        return new Promise<void>((
            resolve: () => void
        ): void => {
            httpServer.listen(port, (): void => {
                resolve();
            });
        });
    });

    after(async (): Promise<void> => {
        const tedis: Tedis = new Tedis(app.config.redis);

        const keys: string[] = await tedis.keys('*');

        for (const key of keys) {
            await tedis.del(key);
        }

        await new Promise<void>((
            resolve: () => void
        ): void => {
            httpServer.close((): void => {
                resolve();
            });
        });
    });

    it('1. clean', async (): Promise<void> => {
        count++;

        let res: ChaiHttp.Response = await chai.request(exp).get('/hit');

        expect(count).to.be.eq(1);
        expect(res.body).to.be.eq(1);

        count++;

        res = await chai.request(exp).get('/hit');

        expect(count).to.be.eq(2);
        expect(res.body).to.be.eq(1);

        res = await chai.request(exp).get('/').query({
            local: true
        });

        count++;

        res = await chai.request(exp).get('/hit');

        // eslint-disable-next-line no-magic-numbers
        expect(count).to.be.eq(3);
        // eslint-disable-next-line no-magic-numbers
        expect(res.body).to.be.eq(3);

        count = 0;

        res = await chai.request(exp).get('/').query({
            local: true
        });
    });

    it('2. clean', async (): Promise<void> => {
        count++;

        let res: ChaiHttp.Response = await chai.request(exp).get('/hit2');

        expect(count).to.be.eq(1);
        expect(res.body).to.be.eq(1);

        count++;

        res = await chai.request(exp).get('/hit2');

        expect(count).to.be.eq(2);
        expect(res.body).to.be.eq(1);

        res = await chai.request(exp).get('/');

        count++;

        res = await chai.request(exp).get('/hit2');

        // eslint-disable-next-line no-magic-numbers
        expect(count).to.be.eq(3);
        // eslint-disable-next-line no-magic-numbers
        expect(res.body).to.be.eq(3);

        count = 0;

        res = await chai.request(exp).get('/');
    });

    it('3. clean', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).get('/2');

        expect(res).status(HttpStatus.internalError);
    });

    it('4. requestCleaning', async (): Promise<void> => {
        const res: AxiosResponse = await CacheController.requestCleaning(app, 'test');

        expect(res).to.exist;
        // eslint-disable-next-line no-magic-numbers
        expect(res).status(200);
        expect(res).to.have.property('data')
            .which.have.property('content')
            .which.have.property('message').eq('Cache successful cleaned');
    });

    it('5. requestCleaning', async (): Promise<void> => {
        const res: AxiosResponse = await CacheController.requestCleaning(app2, 'test');

        expect(res).to.exist;
        // eslint-disable-next-line no-magic-numbers
        expect(res).status(200);
        expect(res).to.have.property('data')
            .which.have.property('content')
            .which.have.property('message').eq(i18n.__('cacheCleaned'));
    });
});
