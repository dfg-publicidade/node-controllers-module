import App from '@dfgpublicidade/node-app-module';
import chai, { expect } from 'chai';
import express, { Express } from 'express';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import UserAgentController from '../src/controllers/userAgentController';

import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

describe('userAgentController.ts', (): void => {
    let exp: Express;
    let httpServer: http.Server;
    let app: App;

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

        exp.get('/', UserAgentController.view(app));

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
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().get('/');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);

        expect(res.body).to.have.property('content')
            .which.have.property('userAgent')
            .contain('node-superagent');
    });
});
