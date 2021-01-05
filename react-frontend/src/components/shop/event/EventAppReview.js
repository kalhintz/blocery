import React, { Component, Fragment } from 'react'
import { ShopXButtonNav } from '~/components/common'

export default class EventAppReview extends Component {

    constructor(props){
        super(props)

    }

    render() {

        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>APP 리뷰 이벤트</ShopXButtonNav>
                <div>
                    <img className="w-100" src="https://blocery.com/images/VUJJK4mjs96H.png" alt={''}/>
                </div>
            </Fragment>
        )
    }
}

