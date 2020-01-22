import React, { Component, Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import Error from '~/components/Error'
import { TabBar } from '~/components/common'
import Home from '~/components/finTech/home'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'

class FinTechContainer extends Component {
    constructor(props) {
        super(props);
    }

    render() {

        return(
            <Fragment>

                {/* FinTech Header : 더 상위에 헤더를 넣을지, 더 하위 컴포넌트별로 넣을지 미정(헤더가 달라진다면 하위로 옮겨야 함) */}
                <div className={'position-relative p-2 bg-light'}>
                    <div className={'text-center font-weight-bold f3'}>식자재</div>
                    <div
                        className={'position-absolute p-2 d-flex align-items-center justify-content-center'}
                        style={{top: 0, right: 0, height: 41}}
                    >
                        <FontAwesomeIcon icon={faInfoCircle} />
                    </div>
                </div>
                <Switch>
                    <Route path={'/finTech/home/:id'} component={Home}/>
                    <Route component={Error}/>
                </Switch>
                <TabBar
                    pathname={this.props.history.location.pathname}
                    ignoredPathnames={[
                        '/goods',
                        '/directBuy',
                        '/cartBuy',
                        '/buyFinish',
                        '/orderDetail',
                        '/orderList',
                        '/mypage/orderDetail',
                        '/mypage/orderList',
                        '/mypage/orderCancel',
                        '/goodsReview', '/login', '/producer/login',
                        '/farmersDetailActivity',
                        '/producersGoodsList',
                        '/producersFarmDiaryList',
                        '/producersFarmDiary',
                    ]}
                />
            </Fragment>
        )
    }
}

export default FinTechContainer