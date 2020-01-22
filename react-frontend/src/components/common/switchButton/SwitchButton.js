import React, { Component } from 'react'
import Switch from "react-switch";

export default class SwitchButton extends Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }

    render() {
        return (
            <Switch className={'text-info'} onChange={this.props.onChange} checked={this.props.checked} />
        )
    }

}