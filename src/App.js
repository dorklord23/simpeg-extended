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
        super(props);
        this.toggle_drawer = this.toggle_drawer.bind(this)
        this.state = {is_drawer_open : false, active_worksheet : ''}
    }

    toggle_drawer(worksheet_name)
    {
        let changed_states = {is_drawer_open : ! this.state.is_drawer_open}

        if (this.state.active_worksheet !== worksheet_name)
        {
            changed_states.active_worksheet = worksheet_name
        }

        this.setState(changed_states)
    }

    load_worksheet()
    {
        let worksheets =
        [
            <Worksheet name="pengumuman_diklat" open={true} />,
            <Worksheet name="verifikasi_dokumen" open={true} />,
            <Worksheet name="daftar_kgb" open={true} />
        ]

        for (let a = 0; a < worksheets.length; a++)
        {
            if (worksheets[a].props.name === this.state.active_worksheet)
            {
                return worksheets[a]
            }
        }
    }

    componentWillUpdate()
    {
        //
    }

    render()
    {
        return (
            <div className="App">
                <AppBar title="Sistem Informasi Manajemen Kepegawaian - Extended -" onLeftIconButtonTouchTap={this.toggle_drawer} />
                <div className="App-intro">
                    {this.load_worksheet()}
                    <Sidebar open={this.state.is_drawer_open} toggle_drawer={this.toggle_drawer} />
                </div>
            </div>
        )
    }
}

class Sidebar extends Component
{
    constructor(props)
    {
        super(props)
    }

    render()
    {
        return (
            <Drawer open={this.props.open} docked={false}>
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="pengumuman_diklat" content="Pengumuman Diklat" />
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="verifikasi_dokumen" content="Verifikasi Dokumen" />
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="riwayat_diklat" content="Riwayat Diklat" />
                <Divider />
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="skp_perorangan" content="SKP Perorangan" />
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="hapus_pegawai" content="Hapus Pegawai" />
                <Divider />
                <SidebarItem toggle_drawer={this.props.toggle_drawer} name="daftar_kgb" content="Daftar KGB" />
            </Drawer>
        )
    }
}

class SidebarItem extends Component
{
    constructor(props)
    {
        super(props)
        this.toggle_form = this.toggle_form.bind(this)
    }

    toggle_form(worksheet_name)
    {
        this.props.toggle_drawer(worksheet_name)
    }
    
    render()
    {
        let style = {'textAlign' : 'left'}
        return (
            <MenuItem style={style} onTouchTap={this.toggle_form.bind(this, this.props.name)}>{this.props.content}</MenuItem>
        )
    }
}

class Worksheet extends Component
{
    get paper_style()
    {
        return {
            height: 500,
            width: '90%',
            margin: 20,
            padding : 20,
            display: 'inline-block'
        }
    }

    constructor(props)
    {
        super(props)

        this.state = {is_open : this.props.open}
    }

    render()
    {
        if (this.state.is_open)
        {
            return (
                <div>
                    {/*<Paper style={this.paper_style} zDepth={1}>*/}
                        <div>{this.props.name}</div><br />
                        {/*<TextField hintText="Hint Text" />*/}
                        <DaftarKGB title="a" />
                    {/*</Paper>*/}
                </div>
            )
        }

        else
        {
            return (<div></div>)
        }
    }
}

class DaftarKGB extends Component
{
    constructor(props)
    {
        super(props)
        this.change_month = this.change_month.bind(this)
        this.state = {selected_month : 0, table_data : [{jmlhari : 0}]}
    }

    get daftar_kgb()
    {
        return axios.get(`${server_url}/api/v1/usulan_kgb`)
    }

    get months()
    {
        return [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
    }

    download_kgb()
    {
        //
    }

    display_table()
    {
        return (
            <Card>
                <CardTitle title={this.props.title} />
                <CardText>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHeaderColumn>NO.</TableHeaderColumn>
                                <TableHeaderColumn>NIP</TableHeaderColumn>
                                <TableHeaderColumn>NAMA</TableHeaderColumn>
                                <TableHeaderColumn>GOLONGAN/PANGKAT</TableHeaderColumn>
                                <TableHeaderColumn>JABATAN</TableHeaderColumn>
                                <TableHeaderColumn><abbr title="MASA KERJA GOLONGAN">MKG</abbr></TableHeaderColumn>
                                <TableHeaderColumn>GAJI POKOK SEKARANG</TableHeaderColumn>
                                <TableHeaderColumn>GAJI POKOK BARU</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>

                        <TableBody showRowHover={true} stripedRows={true}>
                            <TableRow>
                                <TableRowColumn>xxx {this.state.table_data[0].jmlhari}</TableRowColumn>
                            </TableRow>
                            <TableRow selected={true}>
                                {/*<TableRowColumn>1</TableRowColumn>*/}
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardText>
                <CardActions>
                    <FlatButton onTouchTap={this.open_list} label="BACK" />
                    <br />
                    <FlatButton onTouchTap={this.download_kgb} label="DOWNLOAD KGB" />
                </CardActions>
            </Card>
        )
    }

    change_month(event, index, value)
    {
        this.setState({selected_month : value})
    }

    dropdown_menu()
    {
        let year = moment().format('YYYY')
        let list = []

        for (let a = 0; a < 12; a++)
        {
            let month = a.toString().length < 2 ? '0' + a : a

            // Property key is a must
            list[a] = <MenuItem key={a} value={a} primaryText={this.months[a] + ' ' + year} />
        }

        let menu = (
            <DropDownMenu value={this.state.selected_month} onChange={this.change_month}>
                {list.map(menu_item => {return menu_item})}
            </DropDownMenu>
        )

        return menu
    }

    componentWillMount()
    {
        let self = this
        console.log('will mount')

        function set_table_data(response)
        {
            console.log(response.data)
            // Setting states in componentWillMount won't trigger re-rendering
            self.setState({table_data : response.data})
        }

        this.daftar_kgb.then(set_table_data).catch(show_error)
    }

    componentWillUpdate()
    {
    }

    render()
    {
        let list_item_style = {'textAlign' : 'left'}

        return (
            <div>
                {this.dropdown_menu()}
                {this.display_table()}
            </div>
        )
    }
}

export default App
