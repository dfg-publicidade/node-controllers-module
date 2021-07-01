import App from '@dfgpublicidade/node-app-module';
import Dates from '@dfgpublicidade/node-dates-module';
import { HttpStatus } from '@dfgpublicidade/node-result-module';
import chai, { expect } from 'chai';
import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { StatusController as DefaultStatusController } from '../src';

import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

class StatusController extends DefaultStatusController {
    protected static async getAdditionalVariables(app: App, req: Request): Promise<any> {
        return Promise.resolve({
            now: Dates.now()
        });
    }
}

class StatusController2 extends DefaultStatusController {
    protected static async getAdditionalVariables(app: App, req: Request): Promise<any> {
        throw new Error('Error');
    }
}

describe('baseController.ts', (): void => {
    let exp: Express;
    let app: App;
    let httpServer: http.Server;

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
            }
        });

        exp.get('/status', DefaultStatusController.view(app));
        exp.get('/status2', StatusController.view(app));
        exp.get('/status3', StatusController2.view(app));

        exp.use((error: any, req: Request, res: Response, next: NextFunction): void => {
            res.status(HttpStatus.internalError);
            res.json(error.message);
        });

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

    it('1. view', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().get('/status');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.exist;
        expect(res.body).to.have.property('time');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('content');

        expect(res.body).to.have.property('content')
            .which.have.property('api');
        expect(res.body).to.have.property('content')
            .which.have.property('version');
        expect(res.body).to.have.property('content')
            .which.have.property('situation');
        expect(res.body).to.have.property('content')
            .which.have.property('uptime');
        expect(res.body).to.have.property('content')
            .which.have.property('cpuUsage');
        expect(res.body).to.have.property('content')
            .which.have.property('memoryUsage');
        expect(res.body).to.have.property('content')
            .which.have.property('environment');
        expect(res.body).to.have.property('content')
            .which.have.property('variables');
    });

    it('2. view', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().get('/status2');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
        expect(res.body).to.exist;
        expect(res.body).to.have.property('time');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('content');

        expect(res.body).to.have.property('content')
            .which.have.property('api');
        expect(res.body).to.have.property('content')
            .which.have.property('version');
        expect(res.body).to.have.property('content')
            .which.have.property('situation');
        expect(res.body).to.have.property('content')
            .which.have.property('uptime');
        expect(res.body).to.have.property('content')
            .which.have.property('cpuUsage');
        expect(res.body).to.have.property('content')
            .which.have.property('memoryUsage');
        expect(res.body).to.have.property('content')
            .which.have.property('environment');
        expect(res.body).to.have.property('content')
            .which.have.property('variables');
        expect(res.body).to.have.property('content')
            .which.have.property('now');
    });

    it('3. view', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().get('/status3');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(500);
        expect(res.body).to.be.eq('Error');
    });
});
