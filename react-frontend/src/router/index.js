import React, { Component, Suspense } from 'react'
import loadable, {lazy} from "@loadable/component";
import { Link, BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Server } from '~/components/Properties'
import { ProducerPrivateRoute } from "./ProducerPrivateRoute";
import { AdminPrivateRoute } from "./AdminPrivateRoute";
import {exchangeWon2BLCTHome} from '~/lib/exchangeApi'

const ShopContainer = loadable(() => import('./ShopContainer'));
const AdminContainer = loadable(() => import('./AdminContainer'));
const ProducerWebContainer = loadable(() => import('./ProducerWebContainer'));
const SampleContainer = loadable(() => import('./SampleContainer'));
const AdminLogin = loadable(() => import('~/components/admin/AdminLogin'));
const ProducerJoinWeb = loadable(() => import('~/components/shop/join/ProducerJoinWeb'))
const ProducerJoinWebFinish = loadable(() => import('~/components/shop/join/ProducerJoinWebFinish'))
const WebLogin = loadable(() => import('~/components/producer/web/WebLogin'))
const Error = loadable(() => import('~/components/Error'));

const AdminPrivateContainer = () => <AdminPrivateRoute component={AdminContainer} />
const ProducerWebPrivateContainer = () => <ProducerPrivateRoute component={ProducerWebContainer} />

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userType: null
        }
    }

    componentDidMount() {

        //bly 기준가 sessionStorage 에 저장
        exchangeWon2BLCTHome()
    }

    render() {
        return(
            <Router>
                    <Switch>

                        <Route exact path='/producerJoinWeb' component={ProducerJoinWeb}/>
                        <Route exact path='/producerJoinWeb/finish' component={ProducerJoinWebFinish}/>

                        <Route exact path={'/b2c'} render={()=><Redirect to={'/home/1'}/>} />

                        {/* 관리자 로그인 검증*/}
                        <Route path={'/admin/login'} component={AdminLogin} />
                        <Route path={'/admin/:type/:id/:subId'} component={AdminPrivateContainer} />
                        <Route path={'/admin'} render={() => (<Redirect to={Server.getAdminShopMainUrl()}/>)} />

                        {/* 생산자 웹 로그인 검증*/}
                        <Route path={'/producer/web/:id/:subId'} component={ProducerWebPrivateContainer} />
                        {/* producer/ 로 접속 하였을 경우 최초 페이지 지정 */}
                        <Route exact path={'/producer/web'} render={() => (<Redirect to={'/producer/web/home/home'}/>)} />
                        <Route exact path={'/producer/webLogin'} component={WebLogin}/>
                        {/* producer 로 접속 하였을 경우 최초 페이지 지정 */}
                        <Route exact path={'/producer'} render={() =>
                            {
                                return <Redirect to={'/producer/web/home/home'}/>
                            }
                        } />

                        <Route path={'/sample'} component={SampleContainer}/>


                        <Route path={'/'} component={ShopContainer} />

                        <Route component={Error}/>
                    </Switch>
            </Router>

        )
    }
}

export default index