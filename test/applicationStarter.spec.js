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

    });

    describe('Start function', function () {


        it('should have a start function ', function () {
            expect(applicationStarter.start).to.be.a('function');
        })

        it('Start function should returns a promise', (done) => {
            $.get('/base/test/resources/info', function(data){
                done();
            })
                .fail(done)

        })

    })

})