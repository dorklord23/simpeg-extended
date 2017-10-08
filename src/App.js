// Copyright 2017 Tri R.A. Wibowo

import React, { Component } from 'react'
/*import logo from './logo.svg'*/
import './App.css'
//import Drawer from 'material-ui/Drawer'
//import MenuItem from 'material-ui/MenuItem'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import Snackbar from 'material-ui/Snackbar'
import {List, ListItem} from 'material-ui/List'
//import {Card, CardActions, CardTitle, CardText} from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
//import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {Toolbar, /*ToolbarGroup, ToolbarSeparator,*/ ToolbarTitle} from 'material-ui/Toolbar'
//import SelectField from 'material-ui/SelectField'
//import Subheader from 'material-ui/Subheader'
import Checkbox from 'material-ui/Checkbox'
import Dialog from 'material-ui/Dialog'

//import Subheader from 'material-ui/Subheader's
//import Avatar from 'material-ui/Avatar';
//import FileFolder from 'material-ui/svg-icons/file/folder'
//import DropDownMenu from 'material-ui/DropDownMenu'

//import moment from 'moment'
import axios from 'axios'

const server_url = 'http://localhost:8080'

class App extends Component
{
    constructor(props)
    {
        super(props)

        this.state =
        {
            is_network_available : true,
            //data_satker : {eselon1 : [], eselon2 : [], eselon3 : [], eselon4 : []}
            data_satker : {}
        }

        this.checked_items = {eselon1 : [], eselon2 : [], eselon3 : [], eselon4 : []}

        this.paper_style =
        {
            height: 10000,
            width: 1200,
            margin: 20,
            textAlign: 'center',
            display: 'inline-block'
        }

        this.content_box =
        {
            margin : '0px auto',
            width : '90%'
        }

        this.content_column =
        {
            float : 'left',
            margin : 0,
            width : '25%'
        }

        //this.struktur_organisasi()
    }

    async struktur_organisasi()
    {
        try
        {
            const structure = await axios.get(server_url + '/api/struktur')

            if (structure.data.status !== 'berhasil')
            {
                return []
            }

            return structure.data.data
        }

        catch(err)
        {
            console.log(err.message)
            return []
        }
    }

    // Do every async request (AJAX, WebSocket, etc) here
    componentDidMount()
    {
        function struktur_callback(data)
        {
            if (data.length === 0)
            {
                this.setState({is_network_available:false})
            }

            else
            {
                //console.dir(data)
                let eselon1 = data.filter(satker=>{return satker.eselon === 1})
                let eselon2 = data.filter(satker=>{return satker.eselon === 2})
                let eselon3 = data.filter(satker=>{return satker.eselon === 3})
                let eselon4 = data.filter(satker=>{return satker.eselon === 4})

                this.setState({data_satker : {eselon1 : eselon1, eselon2 : eselon2, eselon3 : eselon3, eselon4 : eselon4}})
            }
        }

        this.struktur_organisasi().then(struktur_callback.bind(this))
    }

    data_satker(eselon)
    {
        return this.state.data_satker.filter(satker => {return satker.eselon === eselon})
    }

    satker_change(eselon, checked_items = [])
    {
        /*let kdu1 = '00',
            kdu2 = '00',
            kdu3 = '000',
            kdu4 = '000'*/

        this.checked_items['eselon' + eselon] = checked_items
        console.log(this.checked_items.eselon3)

        if (checked_items.length === 0)
        {
            /*let data_satker = this.state.data_satker['eselon' + eselon]
            //return this.state.data_satker.filter(satker => {return satker.eselon === eselon})
            return this.setState({data_satker : data_satker})*/
        }

        // checked_items[0].key === 'checked0100000000'
        /*for (let a = 0; a < checked_items.length; a++)
        {
            kdu1 = checked_items[a].key(7, 9)
            kdu2 = checked_items[a].key(9, 11)
            kdu3 = checked_items[a].key(11, 14)
            kdu4 = checked_items[a].key(14)
        }*/

        let kdu1 = []
        let kdu2 = []
        let kdu3 = []
        let kdu4 = []
        let data_satker = {}

        for (let a = 0; a < this.checked_items.eselon1.length; a++)
        {
            kdu1.push(this.checked_items.eselon1[a].key.slice(7, 9))
        }

        for (let a = 0; a < this.checked_items.eselon2.length; a++)
        {
            kdu2.push(this.checked_items.eselon2[a].key.slice(9, 11))
        }

        for (let a = 0; a < this.checked_items.eselon3.length; a++)
        {
            kdu3.push(this.checked_items.eselon3[a].key.slice(11, 14))
        }

        for (let a = 0; a < this.checked_items.eselon4.length; a++)
        {
            kdu4.push(this.checked_items.eselon1[a].key.slice(14, 17))
        }

        if (eselon === 1)
        {
            data_satker =
            {
                eselon1 : this.state.data_satker.eselon1,
                eselon2 : this.state.data_satker.eselon2,
                eselon3 : this.state.data_satker.eselon3,
                eselon4 : this.state.data_satker.eselon4
            }
        }

        else if (eselon === 2)
        {
            data_satker =
            {
                eselon1 : this.state.data_satker.eselon1,
                eselon2 : this.state.data_satker.eselon2.filter(satker => {return kdu1.includes(satker.kdu1) && satker.kdu2 !== '00' && satker.kdu3 === '000' && satker.kdu4 === '000'}),
                eselon3 : this.state.data_satker.eselon3,
                eselon4 : this.state.data_satker.eselon4
            }
        }

        else if (eselon === 3)
        {
            data_satker =
            {
                eselon1 : this.state.data_satker.eselon1,
                eselon2 : this.state.data_satker.eselon2,
                eselon3 : this.state.data_satker.eselon3.filter(satker => {return kdu1.includes(satker.kdu1) && kdu2.includes(satker.kdu2) && satker.kdu3 !== '000' && satker.kdu4 === '000'}),
                eselon4 : this.state.data_satker.eselon4
            }
        }

        else if (eselon === 4)
        {
            /*console.log(kdu1)
            console.log(kdu2)
            console.log(kdu3)
            console.log(kdu4)*/
            data_satker =
            {
                eselon1 : this.state.data_satker.eselon1,
                eselon2 : this.state.data_satker.eselon2,
                eselon3 : this.state.data_satker.eselon3,
                eselon4 : this.state.data_satker.eselon4//.filter(satker => {return kdu1.includes(satker.kdu1) && kdu2.includes(satker.kdu2) && kdu3.includes(satker.kdu3)/* && satker.kdu4 !== '000'*/})
            }
        }

        this.setState({data_satker : data_satker})
    }

    render()
    {
        const jumlah_eselon = 4

        let dialog = <LoadingDialog />
        let columns = []

        //if (this.state.data_satker.eselon4.length > 0)
        if (Object.keys(this.state.data_satker).length > 0)
        {
            console.dir(this.state.data_satker)
            dialog = ''
        }

        if ( ! this.state.is_network_available)
        {
            dialog = <StructureErrorDialog />
        }

        for (let a = 0; a < jumlah_eselon; a++)
        {
            let column = <div id={"column" + (a + 1)} key={'satker' + (a + 1)} style={this.content_column}><Satker eselon={a + 1} data={this.state.data_satker['eselon' + (a + 1)]} any_change={this.satker_change.bind(this)}/></div>
            {/*this.data_satker(a + 1)*/}

            columns.push(column)
        }

        return (
            <div className="App">
                <AppBar title="Sistem Informasi Jabatan Badan Narkotika Nasional" />
                <br /><br />
                <div className="App-intro">
                    <Paper id="contentBox" style={this.content_box}>
                        <Toolbar>
                            <ToolbarTitle text="Eselonisasi" />
                        </Toolbar>
                        {columns}
                    </Paper>
                    <Paper style={this.content_box}>
                    <Toolbar>
                            <ToolbarTitle text="Jabatan" />
                    </Toolbar>
                    </Paper>
                </div>
                {dialog}
            </div>
        )
    }
}

class Satker extends Component
{
    constructor(props)
    {
        super(props)

        //this.list_items = []
        //this.checked_items = []

        this.state =
        {
            value : 1,
            is_snackbar_open : false,
            snackbar_text : '',
            list_items : [],
            is_list_shown : true,
            checked_items : []
        }

        this.paper_style =
        {
            height: 900,
            width: 600,
            margin: 2,
            textAlign: 'center',
            display: 'inline-block'
        }
    }

    item_checked(event, is_checked)
    {
        const data_eselon = arguments[0]
        const key = 'checked' + data_eselon.kdu1 + data_eselon.kdu2 + data_eselon.kdu4 + data_eselon.kdu4 + data_eselon.nama

        let checked_items = this.state.checked_items
        //let list_items = []
        //return console.dir(this.list_items[0])
        //console.log(is_checked, event)
        //return console.trace(event)
        if (is_checked)
        {
            // Fill checked items
            checked_items.push(<ListItem key={key} primaryText={data_eselon.nama} onClick={this.remove_checked_item.bind(this, key)}/>)

            // Reduce list items
            //list_items = this.state.list_items.filter(item => {return item.props.primaryText !== data_eselon.nama})

            /*const selected_element = this.list_items[this.list_item_index]
            //selected_element.key = 'a'

            console.log(this.list_items.length)
            this.list_items.splice(this.list_item_index, 1)
            console.dir(this.list_items)*/

            const lists =
            {
                checked_items : checked_items//,
                //list_items : list_items
            }

            this.setState(lists)
        }
    }

    remove_checked_item()
    {
        const key = arguments[0]
        let checked_items = this.state.checked_items.filter(item => {return item.key !== key})

        this.setState({checked_items : checked_items})
    }

    update_list(event, new_value)
    {
        const regex = new RegExp(new_value, 'i')
        const filtered_items = this.props.data.filter(cek_nama_satker)

        function cek_nama_satker(satker)
        {
            return regex.test(satker.nama)
        }

        let list_items = []

        // Continue if and only if the characters submitted is longer than one character
        if (new_value.length < 2)
        {
            return false
        }

        // the regex pattern includes the user-submitted data (new_value) and satker's names in this.checked_items
        for (let a = 0; a < this.state.checked_items.length; a++)
        {
            //let nama_satker = this.state.checked_items[a].props.primaryText.replace(/\s/, "\\s")
            //new_value += '|(?!.'+ nama_satker + '*).*'
        }

        console.log(new_value)

        for (let a = 0; a < filtered_items.length; a++)
        {
            const data_eselon =
            {
                nama : filtered_items[a].nama,
                eselon : filtered_items[a].eselon,
                kdu1 : filtered_items[a].kdu1,
                kdu2 : filtered_items[a].kdu2,
                kdu3 : filtered_items[a].kdu3,
                kdu4 : filtered_items[a].kdu4
            }

            const key = 'list' + data_eselon.kdu1 + data_eselon.kdu2 + data_eselon.kdu4 + data_eselon.kdu4 + data_eselon.nama

            list_items.push(<ListItem key={key} primaryText={filtered_items[a].nama} leftCheckbox={<Checkbox onCheck={this.item_checked.bind(this, data_eselon)}/>} />)
        }

        //this.setState({is_snackbar_open : true, snackbar_text : new_value, list_items : list_items})
        this.setState({list_items : list_items})
        this.props.any_change(this.props.eselon, this.state.checked_items)
    }

    componentDidUpdate()
    {
        //this.props.any_change(this.props.eselon, this.state.checked_items)
    }

    /*toggle_list()
    {
        if (this.state.is_list_shown && this.state.list_items.length > 0)
        {
            this.setState({is_list_shown : false})
        }

        else if ( ! this.state.is_list_shown)
        {
            this.setState({is_list_shown : true})
        }
    }*/

    render()
    {
        return (
            <Paper>
                <TextField hintText={'Tingkat eselon ' + this.props.eselon} style={{overflow:'hidden'}} onChange={this.update_list.bind(this)} />{/*onBlur={this.toggle_list.bind(this)} onFocus={this.toggle_list.bind(this)}*/}
                <DaftarSatker list_items={this.state.list_items} is_list_shown={this.state.is_list_shown} checked_items={this.state.checked_items} />
                <Snackbar open={this.state.is_snackbar_open} message={this.state.snackbar_text} autoHideDuration={4000}/>
            </Paper>
        )
    }
}

class DaftarSatker extends Component
{
    /*constructor(props)
    {
        super(props)
    }*/

    render()
    {
        let divider = ''
        let class_name = ''

        if (this.props.checked_items.length > 0)
        {
            divider = <Divider />
        }

        if ( ! this.props.is_list_shown)
        {
            class_name = 'hidden'
        }

        return (
            <List style={{height : '200em', maxHeight: 200, overflow: 'auto'}}>
                {/*<Subheader inset={true}></Subheader>*/}
                <div style={{'background-color' : 'linen'}}>
                {this.props.checked_items}
                </div>
                {divider}
                <div className={class_name}>
                {this.props.list_items}
                </div>
            </List>
        )
    }
}

class LoadingDialog extends Component {
    /*constructor(props)
    {
        super(props)
    }*/

    render()
    {
        return (
            <div>
                <Dialog title="Mohon Tunggu" modal={true} open={true}>
                    Sedang memuat data dari <i lang="en">database</i>
                </Dialog>
            </div>
        )
    }
}

class StructureErrorDialog extends Component {
    reload()
    {
        window.location.replace(window.location.pathname + window.location.search + window.location.hash);
    }

    render() {
        const actions = [<FlatButton label="Reload" primary={true} keyboardFocused={true} onClick={this.reload} />]

        return (
            <div>
                <Dialog title="Connection Error" actions={actions} modal={true} open={true}>
                    Tidak ada jaringan internet. Pastikan ada jaringan terlebih dahulu.
                </Dialog>
            </div>
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
