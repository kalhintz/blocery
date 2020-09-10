import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'

export default class EventKakao extends Component {

    constructor(props){
        super(props)

    }

    render() {

        return (
            <Fragment>
                <ShopXButtonNav underline history={this.props.history} back>카카오톡 채널 이벤트</ShopXButtonNav>
                <div>
                    <img className="w-100" src="https://blocery.com/images/Vaom0ZXrBo33.png"/>
                </div>
            </Fragment>
        )
    }
}

