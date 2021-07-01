import chai, { expect } from 'chai';
import express, { Express } from 'express';
import http from 'http';
import { after, before, describe, it } from 'mocha';
import { RootController } from '../src';

import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

describe('baseController.ts', (): void => {
    let exp: Express;
    let httpServer: http.Server;

    before(async (): Promise<void> => {
        exp = express();
        const port: number = 3000;

        exp.set('port', port);

        httpServer = http.createServer(exp);

        exp.get('/', RootController.main());

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

    it('1. main', async (): Promise<void> => {
        const res: ChaiHttp.Response = await chai.request(exp).keepOpen().get('/');

        // eslint-disable-next-line no-magic-numbers
        expect(res).to.have.status(200);
    });
});
