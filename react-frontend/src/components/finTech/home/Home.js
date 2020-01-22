import React, { Fragment, useState, useEffect } from 'react'
import { Route, Switch } from "react-router-dom";
import { Hr, ModalPopup } from '~/components/common'
import { Header } from '~/components/shop/header'
import HeaderSectionTab from './headerSectionTab'
// import Footer from './footer'

import TrendOfMarketPriceInfo from './trendOfMarketPriceInfo'
import DistributionDelarInfo from './distributionDelarInfo'

const Home = (props) => {
    return (
        <Fragment>
            <HeaderSectionTab tabId={props.match.params.id}/>
            <Switch>
                <Route path={'/finTech/home/1'} component={TrendOfMarketPriceInfo}/>
                <Route path={'/finTech/home/2'} component={DistributionDelarInfo}/>
                <Route component={Error}/>
            </Switch>
        </Fragment>
    )
}
export default Home