import React, { Component } from "react";
import PropTypes from 'prop-types'
import 'react-month-picker/css/month-picker.css'
import { Input } from 'reactstrap'

class MonthBox extends Component {
    constructor(props, context) {
        super(props, context)

        this.state = {
            value: this.props.value || 'N/A'
        }

        this._handleClick = this._handleClick.bind(this)
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            value: nextProps.value || 'N/A'
        })
    }

    render() {

        return (
            <div>
                <Input name='monthBox' onClick={this._handleClick} value={this.state.value} readOnly/>
            </div>
        )
    }

    _handleClick(e) {
        this.props.onClick && this.props.onClick(e)
    }
}

MonthBox.propTypes = {
    value: PropTypes.string
    , onClick: PropTypes.func
}

export default MonthBox