import App from '@dfgpublicidade/node-app-module';
import Dates from '@dfgpublicidade/node-dates-module';
import Security from '@dfgpublicidade/node-security-module';
import chai, { expect } from 'chai';
import express, { Express } from 'express';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { ObjectId } from 'mongodb';
import { BaseController } from '../src';

import ChaiHttp = require('chai-http');

/* Tests */
type AcceptedTypes = 'objectId' | 'id' | 'string' | 'integer' | 'float' | 'date' | 'datetime' | 'boolean';

class TestController extends BaseController {
    public static getParam(app: App, from: any, name: string, type?: AcceptedTypes): any {
        return super.getParam(app, from, name, type);
    }
}

chai.use(ChaiHttp);

describe('baseController.ts', (): void => {
    let exp: Express;
    let app: App;
    let httpServer: http.Server;
    let data: any;

    before(async (): Promise<void> => {
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
                    allowedHeaders: 'Content-Type, Authorization, Content-Length, X-Requested-With, Client_ID, Ensure-security, Cache-control, Pragma, Expires'
                },
                security: {
                    encodeKey: '123456'
                }
            }
        });

        exp.options('/', TestController.options(app, 'GET'));

        data = {
            name: 'Test A',
            _id: new ObjectId().toHexString(),
            code: Security.encodeId(app.config.security.encodeKey, 1),
            qtty: '1',
            value: '10.5',
            init: '01/01/2021',
            created_at: '01/01/2021 10:00',
            active: 'true'
        };

        return new Promise<void>((
            resolve: () => void
        ): void => {
            httpServer.listen(port, (): void => {
                resolve();
            });
        });
    });

    after(async (): Promise<void> => new Promise<void>((
        resolve: () => void
    ): void => {
        httpServer.close((): void => {
            resolve();
        });
    }));

    it('1. options', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().options('/');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.header['access-control-allow-methods']).to.be.eq('GET');
        expect(res.header['access-control-allow-headers']).to.be.eq(app.config.api.allowedHeaders);
    });

    it('2. getParam', async (): Promise<void> => {
        const value: string = TestController.getParam(app, undefined, undefined);

        expect(value).to.be.undefined;
    });

    it('3. getParam', async (): Promise<void> => {
        const value: string = TestController.getParam(app, data, undefined);

        expect(value).to.be.undefined;
    });

    it('4. getParam', async (): Promise<void> => {
        const value: string = TestController.getParam(app, data, 'name');

        expect(value).to.be.eq(data.name);
    });

    it('5. getParam', async (): Promise<void> => {
        const value: ObjectId = TestController.getParam(app, data, '_id', 'objectId');

        expect(value).to.be.deep.eq(new ObjectId(data._id));
    });

    it('6. getParam', async (): Promise<void> => {
        const value: ObjectId = TestController.getParam(app, data, 'name', 'objectId');

        expect(value).to.be.undefined;
    });

    it('7. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, 'code', 'id');

        expect(value).to.be.eq(Security.decodeId(app.config.security, data.code));
    });

    it('8. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, 'name', 'id');

        expect(value).to.be.undefined;
    });

    it('9. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, 'qtty', 'integer');

        expect(value).to.be.eq(Number.parseInt(data.qtty, 10));
    });

    it('10. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, undefined, 'integer');

        expect(value).to.be.undefined;
    });

    it('11. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, 'value', 'float');

        expect(value).to.be.eq(Number.parseFloat(data.value));
    });

    it('12. getParam', async (): Promise<void> => {
        const value: number = TestController.getParam(app, data, undefined, 'float');

        expect(value).to.be.undefined;
    });

    it('13. getParam', async (): Promise<void> => {
        const value: Date = TestController.getParam(app, data, 'init', 'date');

        expect(value).to.be.deep.eq(Dates.toDate(data.init));
    });

    it('14. getParam', async (): Promise<void> => {
        const value: Date = TestController.getParam(app, data, undefined, 'date');

        expect(value).to.be.undefined;
    });

    it('15. getParam', async (): Promise<void> => {
        const value: Date = TestController.getParam(app, data, 'created_at', 'datetime');

        expect(value).to.be.deep.eq(Dates.toDateTime(data.created_at));
    });

    it('16. getParam', async (): Promise<void> => {
        const value: Date = TestController.getParam(app, data, undefined, 'datetime');

        expect(value).to.be.undefined;
    });

    it('17. getParam', async (): Promise<void> => {
        const value: boolean = TestController.getParam(app, data, 'active', 'boolean');

        expect(value).to.be.eq(data.active === 'true');
    });

    it('18. getParam', async (): Promise<void> => {
        const value: Date = TestController.getParam(app, data, undefined, 'boolean');

        expect(value).to.be.undefined;
    });
});
