import App from '@dfgpublicidade/node-app-module';
import { HttpStatus } from '@dfgpublicidade/node-result-module';
import axios, { AxiosResponse } from 'axios';
import chai, { expect } from 'chai';
import express, { Express, NextFunction, Request, Response } from 'express';
import http from 'http';
import i18n from 'i18n';
import { after, before, describe, it } from 'mocha';
import moment, { Moment } from 'moment-timezone';
import ical, { CalendarResponse } from 'node-ical';
import CalendarController from '../src/controllers/calendarController';

import ChaiHttp = require('chai-http');

/* Tests */
chai.use(ChaiHttp);

describe('calendarController.ts', (): void => {
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
            config: {}
        });

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

        exp.use(i18n.init);

        exp.get('/', CalendarController.generate(app));

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

    after(async (): Promise<void> => new Promise<void>((
        resolve: () => void
    ): void => {
        httpServer.close((): void => {
            resolve();
        });
    }));

    it('1. generate', async (): Promise<void> => {
        let res: any;

        try {
            await axios({
                method: 'GET',
                url: 'http://localhost:3000/'
            });
        }
        catch (error) {
            res = error.response;
        }

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.badRequest);
        expect(res.data).to.have.property('time');
        expect(res.data).to.have.property('status').eq('warning');
        expect(res.data).to.have.property('content')
            .which.have.property('message').eq(i18n.__('invalidData'));
        expect(res.data).to.have.property('content')
            .which.have.property('errors_validation').not.empty;
    });

    it('2. generate', async (): Promise<void> => {
        const res: AxiosResponse = await axios({
            method: 'GET',
            url: 'http://localhost:3000/',
            params: {
                start: '01/01/2021 10:00',
                end: '01/01/2021 11:00',
                title: 'Test'
            },
            responseType: 'blob'
        });

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.success);
        expect(res).header('Content-Type', 'text/calendar; charset=utf-8');
        expect(res).header('Content-Disposition', 'attachment; filename="test.ics"');

        const events: CalendarResponse = ical.sync.parseICS(res.data);

        for (const eventId of Object.keys(events)) {
            const event: any = events[eventId];

            const startCal: Moment = moment(event.start).tz(process.env.TZ);
            const endCal: Moment = moment(event.start).add(event.duration).tz(process.env.TZ);

            expect(event).to.exist;
            expect(event).to.have.property('summary').eq('Test');
            expect(startCal.format('DD/MM/YYYY HH:mm')).to.deep.eq('01/01/2021 10:00');
            expect(endCal.format('DD/MM/YYYY HH:mm')).to.deep.eq('01/01/2021 11:00');
        }
    });

    it('3. generate', async (): Promise<void> => {
        const res: AxiosResponse = await axios({
            method: 'GET',
            url: 'http://localhost:3000/',
            params: {
                start: '01/01/2021 10:00',
                end: '01/01/2021 11:00',
                title: 'Test',
                description: 'Test description',
                location: 'Test location',
                url: 'http://test.com',
                latitude: '-22.4165503',
                longitude: '-47.5766756',
                categories: 'test,node'
            },
            responseType: 'blob'
        });

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.success);
        expect(res).header('Content-Type', 'text/calendar; charset=utf-8');
        expect(res).header('Content-Disposition', 'attachment; filename="test.ics"');

        const events: CalendarResponse = ical.sync.parseICS(res.data);

        for (const eventId of Object.keys(events)) {
            const event: any = events[eventId];

            const startCal: Moment = moment(event.start).tz(process.env.TZ);
            const endCal: Moment = moment(event.start).add(event.duration).tz(process.env.TZ);

            expect(event).to.exist;
            expect(event).to.have.property('summary').eq('Test');
            expect(startCal.format('DD/MM/YYYY HH:mm')).to.deep.eq('01/01/2021 10:00');
            expect(endCal.format('DD/MM/YYYY HH:mm')).to.deep.eq('01/01/2021 11:00');
            expect(event).to.have.property('description').eq('Test description');
            expect(event).to.have.property('url').eq('http://test.com');
            expect(event).to.have.property('location').eq('Test location');
            expect(event).to.have.property('geo').deep.eq({
                lat: -22.4165503,
                lon: -47.5766756
            });
        }
    });

    it('4. generate', async (): Promise<void> => {
        let res: any;

        try {
            await axios({
                method: 'GET',
                url: 'http://localhost:3000/',
                params: {
                    start: '01/01/2021 10:00',
                    end: '01/01/2021 11:00',
                    title: 'Test',
                    url: 'x'
                },
                responseType: 'blob'
            });
        }
        catch (error) {
            res = error.response;
        }

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.badRequest);
        expect(res.data).to.have.property('time');
        expect(res.data).to.have.property('status').eq('warning');
        expect(res.data).to.have.property('content')
            .which.have.property('message').eq('Dados invalidos!');
        expect(res.data).to.have.property('content')
            .which.have.property('errors_validation').not.empty;
    });

    it('5. generate', async (): Promise<void> => {
        let res: any;

        try {
            await axios({
                method: 'GET',
                url: 'http://localhost:3000/',
                params: {
                    start: '01/01/2021 10:00',
                    end: '01/01/2021 11:00',
                    title: 'Test',
                    url: 'x'
                },
                responseType: 'blob'
            });
        }
        catch (error) {
            res = error.response;
        }

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.badRequest);
        expect(res.data).to.have.property('time');
        expect(res.data).to.have.property('status').eq('warning');
        expect(res.data).to.have.property('content')
            .which.have.property('message').eq(i18n.__('invalidData'));
        expect(res.data).to.have.property('content')
            .which.have.property('errors_validation').not.empty;
    });

    it('6. generate', async (): Promise<void> => {
        const year: any = moment.prototype.year;

        moment.prototype.year = (): void => {
            throw new Error('Error');
        };

        let res: any;

        try {
            await axios({
                method: 'GET',
                url: 'http://localhost:3000/',
                params: {
                    start: '01/01/2021 10:00',
                    end: '01/01/2021 11:00',
                    title: 'Test'
                },
                responseType: 'blob'
            });
        }
        catch (error) {
            res = error.response;
        }

        expect(res).to.exist;
        expect(res.status).eq(HttpStatus.internalError);
        expect(res.data).eq('Error');

        moment.prototype.year = year;
    });
});
