import React, { Component, Fragment, useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import Search from '~/components/shop/search'
import { Event, Login, Main, Goods, DirectBuy, CartBuy, BuyFinish, ConsumerJoin, InputAddress, JoinComplete, ProducerJoin, FarmersDetailActivity, CartList } from '../components/shop'
import Error from '../components/Error'
import { Mypage, TokenHistory } from "~/components/shop/mypage";
import { TabBar, BlocerySpinner } from '~/components/common'
import { ShopMenuList, Const } from '../components/Properties'
import ComUtil from '../util/ComUtil'
import { GoodsReview, GoodsReviewList, ProducersGoodsList, ProducersFarmDiaryList, ProducersFarmDiary } from '../components/shop'
import { OrderDetail, OrderList, UpdateAddress, OrderCancel } from "../components/shop/mypage/orderList";
import { InfoManagementMenu, CheckCurrentValword, ModifyConsumerInfo, ModifyValword, AddressManagement, AddressModify, HintPassPhrase } from "../components/shop/mypage/infoManagement"
import { GoodsQnaList } from "~/components/shop/mypage/goodsQna"
import { NotificationList } from "~/components/shop/mypage/notificationList";
import { NoticeList } from "~/components/common/noticeList";
import { RegularShopList } from "~/components/shop/mypage/regularShops"
import { ConsumerCenter } from '~/components/shop/mypage/consumerCenter'
import { UseGuide } from '~/components/shop/mypage/useGuide'
import { Setting, TermsOfUse, PrivacyPolicy } from "~/components/shop/mypage/setting"

import { Category } from '~/components/shop/category'
import { GoodsListByItemKind } from '~/components/shop/goodsListByItemKind'

import { PrivateRoute } from "./PrivateRoute";

import Home from '~/components/shop/home/home'
import BloceryHome from '~/components/BloceryHome'

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import { Webview } from "~/lib/webviewApi";


import {b2cQueInfo} from '~/components/common/winOpen'

// const ShopPrivateContainer = () => {
//
//     return(
//         <Switch>
//             <Route exact path={'/directBuy'} component={DirectBuy}/>
//             <Route exact path={'/cartBuy'} component={CartBuy}/>
//             <Route exact path={'/buyFinish'} component={BuyFinish}/>
//             <Route exact path={'/inputAddress'} component={InputAddress}/>
//
//             <Route exact path={'/mypage/orderList'} component={OrderList}/>
//             <Route exact path={'/mypage/orderDetail'} component={OrderDetail}/>
//             <Route exact path={'/mypage/orderCancel'} component={OrderCancel}/>
//             <Route exact path={'/mypage/infoManagementMenu'} component={InfoManagementMenu}/>
//             <Route exact path={'/mypage/goodsQnaList'} component={GoodsQnaList}/>
//             <Route exact path={'/mypage/checkCurrentValword'} component={CheckCurrentValword}/>
//             <Route exact path={'/mypage/addressManagement'} component={AddressManagement}/>
//             <Route exact path={'/mypage/addressModify'} component={AddressModify}/>
//             <Route exact path={'/mypage/hintPassPhrase'} component={HintPassPhrase}/>
//             <Route exact path={'/mypage/notificationList'} component={NotificationList}/>
//             <Route exact path={'/mypage/noticeList'} component={NoticeList}/>
//             <Route exact path={'/mypage/regularShopList'} component={RegularShopList}/>
//             {/*<Route path={'/mypage/consumerCenter'} component={ConsumerCenter}/>*/}
//             {/*<Route path={'/mypage/useGuide'} component={UseGuide}/>*/}
//             <Route exact path={'/mypage/setting'} component={Setting}/>
//             {/*<Route path={'/mypage/termsOfUse'} component={TermsOfUse}/>*/}
//
//
//
//             <Route exact path={'/modifyConsumerInfo'} component={ModifyConsumerInfo}/>
//             <Route exact path={'/modifyValword'} component={ModifyValword}/>
//             <Route exact path={'/orderDetail'} component={OrderDetail}/>
//             <Route exact path={'/orderList'} component={OrderList}/>
//             <Route exact path={'/updateAddress'} component={UpdateAddress}/>
//
//             <Route exact path={'/goodsReview'} component={GoodsReview} />
//             <Route exact path={'/goodsReviewList/:tabId'} component={GoodsReviewList} />
//             <Route component={Error}/>
//
//         </Switch>
//     )
// }




class ShopContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mounted: false
        }
    }

    async componentDidMount(){
        const { data: userType } = await getLoginUserType()
        console.log({b2c_getLoginUserType: userType})

        if(userType){
            const user = await getLoginUser()

            //쿠키 세션 동기화
            localStorage.setItem('userType', userType);
            localStorage.setItem('account', user.account); //geth Account
            localStorage.setItem('email', user.email);

            Webview.appLog('ShopContainer Router: setValword TEST');
            //valword는 비어있음. localStorage.setItem('valword', ComUtil.encrypt(user.valword));
            sessionStorage.setItem('logined', 1);

        }else{ //login안된 경우.
            Webview.appLog('ShopContainer Router:' + localStorage.getItem('autoLogin'));
            if (localStorage.getItem('autoLogin') != 1) { //로그아웃을 한경우만 지워주면 됨: 로그아웃하면 autoLogin이 지워짐
                localStorage.removeItem('userType');
                localStorage.removeItem('account'); //geth Account
                localStorage.removeItem('email');

                Webview.appLog('ShopContainer Router: + RemoveValword');

                //localStorage.removeItem('valword');
                sessionStorage.removeItem('logined');
            }
        }

        this.setState({
            mounted: true
        })

    }




    render() {


        console.log('this.props.history.location.pathname:',this.props.history)

        // if(!this.state.isCssLoaded) return null

        if(!this.state.mounted) return <BlocerySpinner/>

        return(
            <Fragment>
                <Switch>
                    {/* public */}
                    <Route path='/event' component={Event}/>
                    <Route path='/login' component={Login}/>
                    <Route path='/join' component={ConsumerJoin}/>
                    <Route path='/producerJoin' component={ProducerJoin}/>
                    <Route path='/joinComplete' component={JoinComplete}/>
                    <Route exact path='/' component={BloceryHome} />
                    <Route path='/mypage/queInfo' component={b2cQueInfo}/>
                    <Route path='/mypage/consumerCenter' component={ConsumerCenter}/>
                    <Route path='/mypage/useGuide' component={UseGuide}/>
                    <Route path='/mypage/termsOfUse' component={TermsOfUse}/>
                    <Route path='/mypage/privacyPolicy' component={PrivacyPolicy}/>

                    <Route exact path='/b2c' render={()=>(<Redirect to={'/home/1'}/>)} />
                    <Route path={'/home/:id'} component={Home}/>

                    <Route path={'/category/:itemNo/:itemKindCode'} component={GoodsListByItemKind}/>
                    <Route path={'/category'} component={Category}/>

                    {/*<Route path={'/finTech/home/:id'} component={FinTechHome}/>*/}

                    <Route path={'/goods'} component={Goods}/>
                    <Route path={'/farmersDetailActivity'} component={FarmersDetailActivity}/>
                    <Route path={'/producersGoodsList'} component={ProducersGoodsList}/>
                    <Route path={'/producersFarmDiaryList'} component={ProducersFarmDiaryList}/>
                    <Route path={'/producersFarmDiary'} component={ProducersFarmDiary}/>
                    <Route path={'/tokenHistory'} component={TokenHistory}/>

                    <Route path={'/cartList'} component={CartList}/>

                    {/* mypage 같은 경우 로그인창을 바로 띄우게 되면 로그인창을 닫아도 다시 뜨기 때문에 public 으로 처리함 */}
                    <Route exact path={'/mypage'} component={Mypage}/>
                    <Route exact path={'/search'} component={Search} />

                    {/* private start */}
                    {/* 기존의 PrivateRoute를 제거하고 아래처럼 나열함 */}
                    {/*<PrivateRoute component={ShopPrivateContainer} userType={'consumer'}/>*/}
                    <PrivateRoute exact path={'/directBuy'} component={DirectBuy} userType={'consumer'} />
                    <PrivateRoute exact path={'/cartBuy'} component={CartBuy} userType={'consumer'} />
                    <PrivateRoute exact path={'/buyFinish'} component={BuyFinish} userType={'consumer'} />
                    <PrivateRoute exact path={'/inputAddress'} component={InputAddress} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/orderList'} component={OrderList} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/orderDetail'} component={OrderDetail} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/orderCancel'} component={OrderCancel} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/infoManagementMenu'} component={InfoManagementMenu} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/goodsQnaList'} component={GoodsQnaList} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/checkCurrentValword'} component={CheckCurrentValword} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/addressManagement'} component={AddressManagement} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/addressModify'} component={AddressModify} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/hintPassPhrase'} component={HintPassPhrase} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/notificationList'} component={NotificationList} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/noticeList'} component={NoticeList} userType={'consumer'} />
                    <PrivateRoute exact path={'/mypage/regularShopList'} component={RegularShopList} userType={'consumer'} />
                    {/*<Route path={'/mypage/consumerCenter'} component={ConsumerCenter} userType={'consumer'} />*/}
                    {/*<Route path={'/mypage/useGuide'} component={UseGuide} userType={'consumer'} />*/}
                    <PrivateRoute exact path={'/mypage/setting'} component={Setting} userType={'consumer'} />
                    {/*<Route path={'/mypage/termsOfUse'} component={TermsOfUse} userType={'consumer'} />*/}
                    <PrivateRoute exact path={'/modifyConsumerInfo'} component={ModifyConsumerInfo} userType={'consumer'} />
                    <PrivateRoute exact path={'/modifyValword'} component={ModifyValword} userType={'consumer'} />
                    <PrivateRoute exact path={'/orderDetail'} component={OrderDetail} userType={'consumer'} />
                    <PrivateRoute exact path={'/orderList'} component={OrderList} userType={'consumer'} />
                    <PrivateRoute exact path={'/updateAddress'} component={UpdateAddress} userType={'consumer'} />
                    <PrivateRoute exact path={'/goodsReview'} component={GoodsReview} userType={'consumer'} />
                    <PrivateRoute exact path={'/goodsReviewList/:tabId'} component={GoodsReviewList} userType={'consumer'} />
                    {/* private end */}

                    <Route component={Error}/>
                </Switch>

                <TabBar
                    pathname={this.props.history.location.pathname}
                    ignoredPathnames={[
                        '/goods',
                        '/directBuy',
                        '/cartBuy',
                        '/cartList',
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
                        '/queInfo'
                    ]}
                />

            </Fragment>
        )
    }
}

export default ShopContainer
