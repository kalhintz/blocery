import React, { Component, Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'

import { Header } from '../components/shop/header'
import { Counter, ImageCompressor } from '../components/sample'


class SampleContainer extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return(
            <Fragment>
                <Header/>
                <Switch>
                    <Route path='/sample/mobx' component={Counter} />
                    <Route path='/sample/imageCompressor' component={ImageCompressor} />
                    <Route component={Error}/>
                </Switch>
            </Fragment>
        )
    }
}

export default SampleContainer