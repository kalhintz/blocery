import React, {Fragment, Component} from 'react';
import {Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {getConsumerByConsumerNo, updateConsumerInfo} from "~/lib/shopApi";

import {ShopXButtonNav} from '~/components/common/index'

import AddressManagementContent from './AddressManagementContent'

export default class AddressManagement extends Component {
    constructor(props) {
        super(props);

        const params = new URLSearchParams(this.props.location.search)
        const consumerNo = params.get('consumerNo')
        this.state = {
            consumerNo: consumerNo
        }
    }

    render() {
        if(!this.state.consumerNo) return null
        return (
            <Fragment>
                <ShopXButtonNav underline history={this.props.history} historyBack>배송지 관리</ShopXButtonNav>
                <AddressManagementContent consumerNo={this.state.consumerNo} history={this.props.history}/>
            </Fragment>
        )
    }
}