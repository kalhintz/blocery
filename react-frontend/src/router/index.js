import React, { Component, lazy, Suspense } from 'react'
import { Link, BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import ComUtil from '~/util/ComUtil'

import { Server } from '~/components/Properties'
import { BlocerySpinner } from '~/components/common'

import { getLoginUserType } from '~/lib/loginApi'

// import ShopContainer from './ShopContainer'
// import B2bShopContainer from './B2bShopContainer'

// import FinTechContainer from './FinTechContainer'
// import AdminContainer from './AdminContainer'
// import ProducerContainer from './ProducerContainer'
// import SellerContainer from './SellerContainer'
// import SampleContainer from './SampleContainer'
// import Error from '~/components/Error'
// import AdminLogin from "../components/admin/AdminLogin";
// import BloceryHome from '~/components/BloceryHome'

import { PrivateRoute } from "./PrivateRoute";

const AdminPrivateContainer = () => <PrivateRoute component={AdminContainer} userType={'admin'} />
const ProducerPrivateContainer = () => <PrivateRoute component={ProducerContainer} userType={'producer'} />
const ProducerWebPrivateContainer = () => <PrivateRoute component={ProducerWebContainer} userType={'producer'} />
const SellerPrivateContainer = () => <PrivateRoute component={SellerContainer} userType={'seller'} />

const ShopContainer = lazy(() => import('./ShopContainer'));
const B2bShopContainer = lazy(() => import('./B2bShopContainer'));
const AdminContainer = lazy(() => import('./AdminContainer'));
const ProducerContainer = lazy(() => import('./ProducerContainer'));
const ProducerWebContainer = lazy(() => import('./ProducerWebContainer'));
const SellerContainer = lazy(() => import('./SellerContainer'));
const SampleContainer = lazy(() => import('./SampleContainer'));
const Error = lazy(() => import('~/components/Error'));
const AdminLogin = lazy(() => import('~/components/admin/AdminLogin'));
const BloceryHome = lazy(() => import('~/components/BloceryHome'));

const ProducerJoinWeb = lazy(() => import('~/components/shop/join/ProducerJoinWeb'))
const ProducerJoinWebFinish = lazy(() => import('~/components/shop/join/ProducerJoinWebFinish'))

const SellerJoinWeb = lazy(() => import('~/components/b2bShop/join/SellerJoinWeb'))
const SellerJoinWebFinish = lazy(() => import('~/components/b2bShop/join/SellerJoinWebFinish'))

const WebLogin = lazy(() => import('~/components/producer/web/WebLogin'))

class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userType: null
        }
    }

    //



    render() {
        return(
            <Router>
                <Suspense fallback={null}>
                    <Switch>

                        <Route exact path='/producerJoinWeb' component={ProducerJoinWeb}/>
                        <Route exact path='/producerJoinWeb/finish' component={ProducerJoinWebFinish}/>

                        <Route exact path='/b2b/sellerJoinWeb' component={SellerJoinWeb}/>
                        <Route exact path='/b2b/sellerJoinWeb/finish' component={SellerJoinWebFinish}/>

                        <Route exact path={'/b2c'} render={()=><Redirect to={'/home/1'}/>} />

                        <Route path={'/admin/login'} component={AdminLogin} />

                        {/* 관리자 로그인 검증*/}
                        <Route path={'/admin/:type/:id/:subId'} component={AdminPrivateContainer} />

                        <Route path={'/admin'} render={() => (<Redirect to={Server.getAdminShopMainUrl()}/>)} />

                        {/*<Route path={'/producer/login'} component={ProducerLogin} />*/}

                        {/* 생산자 웹 로그인 검증*/}
                        <Route path={'/producer/web/:id/:subId'} component={ProducerWebPrivateContainer} />

                        {/* producer/ 로 접속 하였을 경우 최초 페이지 지정 */}
                        <Route exact path={'/producer/web'} render={() => (<Redirect to={'/producer/web/home/home'}/>)} />

                        <Route exact path={'/producer/webLogin'} component={WebLogin}/>

                        {/* 생산자 로그인 검증*/}
                        <Route exact path={'/producer/:id'} component={ProducerPrivateContainer} />

                        {/* producer 로 접속 하였을 경우 최초 페이지 지정 */}
                        <Route exact path={'/producer'} render={() =>
                            {
                                return ComUtil.isPcWeb() ? (<Redirect to={'/producer/web/home/home'}/>) : (<Redirect to={'/producer/home'}/>);
                            }
                        } />

                        {/* producer/:id 가 있을경우 다시한번 분기를 타기위해 */}

                        {/*<Route path={'/producer/:id'} component={ProducerContainer}/>*/}

                        <Route path={'/sample'} component={SampleContainer}/>

                        <Route exact path='/' component={BloceryHome} />

                        {/* seller 로 접속 하였을 경우 최초 페이지 지정 */}
                        <Route exact path={'/b2b/seller'} render={() => (<Redirect to={'/b2b/seller/home'}/>)} />

                        {/* seller 로그인 검증*/}
                        <Route exact path={'/b2b/seller/:id'} component={SellerPrivateContainer} />

                        <Route path={'/b2b'} component={B2bShopContainer} />

                        <Route path={'/'} component={ShopContainer} />

                        <Route component={Error}/>
                    </Switch>
                </Suspense>
            </Router>

        )
    }
}

export default index