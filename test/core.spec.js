// import { assert, should, expect } from 'chai';
let should = require('chai').should();
let expect = require('chai').expect;
console.log('coucou');
import {K_Parser} from '../src/core/parsers/ParserFactory';
describe('K_Parser', function () {

    beforeEach(function () {
    });

    it('should have a decode function', function () {
        K_Parser.decode.should.be.a('function');
    });
    it('should have an encode function', function () {
        K_Parser.encode.should.be.a('function');
    });


});


import {deviceCommands} from "../src/core/data/Commands";
describe('K_Commands', function () {

    let specialCommands = [
        'COMMAND_TYPE_P3000',
        'COMMAND_TYPE_Y',
        'COMMAND_ERROR',
        'COMMAND_WARNING',
        'COMMAND_RESTART',
        'commandsByOpCode'];

    for (let i = 0; i < specialCommands.length; i++) {
        it(`Command object should have a property ${specialCommands[i]}`, function () {
            expect(deviceCommands).to.have.own.property(specialCommands[i]);

        });
    }
    it(`Each command should have key, name, opCode, type properties`, function () {
        for (let command in deviceCommands) {
            if (specialCommands.indexOf(command) === -1) {
                expect(deviceCommands[command]).to.have.own.property('key');
                expect(deviceCommands[command]).to.have.own.property('name');
                expect(deviceCommands[command]).to.have.own.property('opCode');
                expect(deviceCommands[command]).to.have.own.property('type');
            }
        }
    });


});