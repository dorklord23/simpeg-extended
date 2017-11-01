// Copyright 2017 Tri R.A. Wibowo

//require('../less/main.less');

var React = require('react');
var ReactDOM = require('react-dom');

import './index.css';
import App from './App'
import BOB from './BOB'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import injectTapEventPlugin from 'react-tap-event-plugin'

injectTapEventPlugin()

ReactDOM.render(<MuiThemeProvider><App /></MuiThemeProvider>, document.getElementById('root'));
