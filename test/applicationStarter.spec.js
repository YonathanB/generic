let expect = require('chai').expect;


import {applicationService} from '../src/core/model/applicationService';

let test_infoFile = [
    'type',
    'protocol',
    'url',
    'translator',
    'timeout',
    'connectionAttempts'
];

describe('ApplicationService', function () {

    describe('infoFile', function () {

        it(`ApplicationService Should have a property infoFile`, function () {
            expect(applicationService).to.have.own.property('infoFile');
        });
        it(`infoFile Should have a property communication`, function () {
            expect(applicationService.infoFile).to.have.own.property('communication');
        });

        for (let i = 0; i < test_infoFile.length; i++) {
            it(`communication property in infoFile Should have a property ${test_infoFile[i]}`, function () {
                expect(applicationService.infoFile.communication).to.have.own.property(test_infoFile[i]);
            })
        }

    });

    describe('Start function', function () {


        it('should have a start function ', function () {
            expect(applicationService.start).to.be.a('function');
        })

        it('Start function should returns a promise', (done) => {
            $.get('/base/test/resources/info', function(data){
                done();
            })
                .fail(done)

        })

    })

})