// Copyright 2017 Tri R.A. Wibowo

import React, { Component } from 'react'
/*import logo from './logo.svg'*/
import './App.css'
import Drawer from 'material-ui/Drawer'
import MenuItem from 'material-ui/MenuItem'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import {List, ListItem} from 'material-ui/List'
import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import SelectField from 'material-ui/SelectField'
import Subheader from 'material-ui/Subheader'
import Checkbox from 'material-ui/Checkbox'

//import Subheader from 'material-ui/Subheader'
import Avatar from 'material-ui/Avatar';
import FileFolder from 'material-ui/svg-icons/file/folder'
import DropDownMenu from 'material-ui/DropDownMenu'

import moment from 'moment'
import axios from 'axios'

const server_url = 'http://localhost:8080'

function show_error(error)
{
    console.log(error.stack)
}

class App extends Component
{
    constructor(props)
    {
        super(props)
        this.state = {is_drawer_open : false, active_worksheet : ''}

        this.paper_style =
        {
            height: 10000,
            width: 1200,
            margin: 20,
            textAlign: 'center',
            display: 'inline-block'
        }
    }

    render()
    {
        return (
            <div className="App">
                <AppBar title="Sistem Informasi Jabatan Badan Narkotika Nasional" />
                <div className="App-intro">
                    <Paper style={this.paper_style}>
                        <Eselonisasi eselon = {1}/>
                    </Paper>
                </div>
            </div>
        )
    }
}

class Eselonisasi extends Component
{
    constructor(props)
    {
        super(props)
        this.state = {value : 1}
        this.handleChange = (event, index, value) => this.setState({value})
    }

    render()
    {
        return (
            <Paper style={{
            height: 20,
            width: 10,
            margin: 2,
            textAlign: 'center',
            display: 'inline-block'
        }}>
            <List>
                <Subheader>Hangout Notifications</Subheader>
                <ListItem primaryText="Notifications" leftCheckbox={<Checkbox />} />
                <ListItem primaryText="Sounds" leftCheckbox={<Checkbox />} />
                <ListItem primaryText="Video sounds" leftCheckbox={<Checkbox />} />
            </List>
            </Paper>
        )
    }
}

export default App
/*<SelectField floatingLabelText={`Eselon ${this.props.eselon}`} value={this.state.value} onChange={this.handleChange}>
                <MenuItem value={1} primaryText="" />
                <MenuItem value={2} primaryText="Every Night" />
                <MenuItem value={3} primaryText="Weeknights" />
                <MenuItem value={4} primaryText="Weekends" />
                <MenuItem value={5} primaryText="Weekly" />
            </SelectField>*/
