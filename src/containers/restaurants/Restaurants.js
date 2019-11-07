import React, { Component } from "react";

import ReactTable from 'react-table'
import axios from 'axios';

import 'react-table/react-table.css'

import './Restaurants.css';

const api = 'http://localhost:3001/restaurants';

export default class Restaurants extends Component {
    state = {
        data: [],
        columns: [{
            Header: 'Name',
            accessor: 'name'
        }, {
            Header: 'Type',
            accessor: 'type'
        }, {
            Header: 'Phone',
             accessor: 'phone'
        }, {
            Header: 'Location',
            accessor: 'formattedAddress',
        },
        {
            Header: 'Delete',
            Cell: (row) => (<input type="checkbox" onChange={() => this.deleteRestaurant(row.original.id)} />)
        }],
        searchText: '',
        editedData: []
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        fetch(`${api}/`).then(res => res.json())
            .then(res => this.setState({ data: res }))
            .catch(() => this.setState({ hasErrors: true }));
    }

    async onFileCahnge(event) {
        const data = new FormData()
        data.append('file', new Blob(event.target.files, { type: 'text/csv' }));
        await axios.post(`${api}/upload`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        this.loadData();
    }

    deleteRestaurant(id) {
        axios.delete(`${api}/${id}`).then(res => {
            this.loadData();
        });
    }

    render() {
        const { data, columns, hasErrors, searchText } = this.state;
        return hasErrors ? (<div className="Error">Failed to load data</div>) : (
            <div className="Restaurants">
                <input type="file" name="file" onChange={this.onFileCahnge.bind(this)} />
                <input type="text" placeholder="serach" onChange={(e) => this.setState({ searchText: e.target.value })} />
                <ReactTable data={data.filter(r => JSON.stringify(r).includes(searchText))} columns={columns} />
            </div>
        );
    }
}
