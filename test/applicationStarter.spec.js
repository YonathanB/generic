let expect = require('chai').expect;


import {applicationStarter} from '../src/model/applicationStarter';

let test_infoFile = [
    'type',
    'protocol',
    'url',
    'translator',
    'timeout',
    'connectionAttempts'
];

describe('ApplicationStarter', function () {

    describe('infoFile', function () {

        it(`ApplicationStarter Should have a property infoFile`, function () {
            expect(applicationStarter).to.have.own.property('infoFile');
        });
        it(`infoFile Should have a property communication`, function () {
            expect(applicationStarter.infoFile).to.have.own.property('communication');
        });

        for (let i = 0; i < test_infoFile.length; i++) {
            it(`communication property in infoFile Should have a property ${test_infoFile[i]}`, function () {
                expect(applicationStarter.infoFile.communication).to.have.own.property(test_infoFile[i]);
            })
        }

    })
})