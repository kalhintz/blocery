import React, { Component, PropTypes, lazy, Suspense } from 'react';
import { getInviteFriendCount } from '~/lib/adminApi'
import { Server } from '~/components/Properties';
import axios from 'axios';
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'

export default class InviteFriendCountRenderer extends Component{
    constructor(props) {
        super(props)

        this.state = {
            count: 0
        }
    }

    componentDidMount() {
        const consumerNo = this.props.data.consumerNo
        if (consumerNo > 0)
            getInviteFriendCount(this.props.data.consumerNo).then(({data}) => {
                this.setState({count:data})
            })
    }

    render() {
        return(this.state.count)
    }
}