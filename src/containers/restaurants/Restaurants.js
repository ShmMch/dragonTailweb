import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import * as BS from "react-bootstrap";


import ReactTable from 'react-table'
import axios from 'axios';

import 'react-table/react-table.css'
import HighlightCell from "./HighlightCell";
import ActionsCell from "./ActionsCell";
import './Restaurants.css';

const FormProvider = reduxForm()(({ children, ...rest }) => children(rest));

const api = 'http://localhost:3001/restaurants';

export default class Restaurants extends Component {
    state = {
        data: [],
        searchText: '',
        editing: null
    }

    columns = [
        {
            Header: "",
            maxWidth: 90,
            filterable: false,
            getProps: (gridState, rowProps) =>
                (rowProps && {
                    mode: this.state.editing === rowProps.original ? "edit" : "view",
                    actions: {
                        onEdit: () => {
                            this.setState({ editing: rowProps.original })
                        },
                        onCancel: () => this.setState({ editing: null })
                    }
                }) || {},
            Cell: ActionsCell
        },
        {
            Header: 'Name',
            accessor: 'name',
            ...this.editableColumnProps
        }, {
            Header: 'Type',
            accessor: 'type',
            ...this.editableColumnProps
        }, {
            Header: 'Phone',
            accessor: 'phone',
            ...this.editableColumnProps
        }, {
            Header: 'Location',
            accessor: 'formattedAddress',
        },
        {
            Header: 'Delete',
            Cell: (row) => (<input type="checkbox" onChange={() => this.deleteRestaurant(row.original.id)} />)
        }]

    editableComponent = ({ input, editing, value, ...rest }) => {
        const Component = editing ? BS.FormControl : BS.FormControl.Static;
        const children =
            (!editing && <HighlightCell value={value} {...rest} />) || undefined;
        return <Component {...input} {...rest} children={children} />;
    }

    editableColumnProps = {
        Cell: props => {
            const editing = this.state.editing === props.original;
            const fieldProps = {
                component: this.editableComponent,
                editing,
                props
            };

            return <Field name={props.column.id} {...fieldProps} />;
        }
    }

    componentDidMount() {
        this.loadData();
    }

    loadData() {
        fetch(`${api}/`).then(res => res.json())
            .then(res => this.setState({ data: res, editing: null }))
            .catch(() => this.setState({ hasErrors: true, editing: null }));
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

    saveRestaurant(row) {
        axios.post(`${api}/${this.state.editing.id}`, row).then(res => {
            this.loadData();
        });
    }

    render() {
        const { data, hasErrors, searchText, editing } = this.state;
        return hasErrors ? (<div className="Error">Failed to load data</div>) : (
            <React.Fragment>
                <BS.Card bsStyle="primary">
                    <BS.Card.Header>
                        Restaurants
              </BS.Card.Header>
                    <input type="file" name="file" onChange={this.onFileCahnge.bind(this)} />
                    <input type="text" placeholder="serach" onChange={(e) => this.setState({ searchText: e.target.value })} />
                    <FormProvider
                        form="inline"
                        onSubmit={this.saveRestaurant.bind(this)}
                        onSubmitSuccess={() => this.loadData()}
                        initialValues={editing}
                        enableReinitialize>
                        {formProps => {
                            return (
                                <form onSubmit={formProps.handleSubmit}>
                                    <ReactTable
                                        data={data.filter(r => JSON.stringify(r).includes(searchText))}
                                        columns={this.columns} />
                                </form>
                            );
                        }}
                    </FormProvider>
                </BS.Card>
            </React.Fragment>
        );
    }
}
