


import * as root from './src/index';
import mocks from 'angular-mocks';

let context = require.context('./test', false, /.spec.js$/);
context.keys().forEach(context);