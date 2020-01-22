import React, { Component, Fragment, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import TopBar from '../components/b2bShop/header/Header'
import Search from '~/components/b2bShop/search'
import { Event, Login, Main, Foods, BuyFinish, BuyerJoin, InputAddress, JoinComplete, SellerJoin, FarmersDetailActivity, CartList, CartToBuy } from '../components/b2bShop'
import Error from '../components/Error'
import { Mypage, WaesangHistory } from "~/components/b2bShop/mypage";
import { B2bTabBar, BlocerySpinner } from '~/components/common'
import { ShopMenuList, Const } from '../components/Properties'
import { FoodsReview, FoodsReviewList, SellersFoodsList, ProducersFarmDiaryList, ProducersFarmDiary } from '../components/b2bShop'
import { DealDetail, DealList, UpdateAddress, DealCancel } from "../components/b2bShop/mypage/dealList";
import { InfoManagementMenu, CheckCurrentValword, ModifyBuyerInfo, ModifyValword, AddressManagement, HintPassPhrase, AddressModify } from "../components/b2bShop/mypage/infoManagement"
import { FoodsQnaList } from "~/components/b2bShop/mypage/foodsQna"
import { NotificationList } from "~/components/b2bShop/mypage/notificationList";
import { B2bNoticeList } from "~/components/common/b2bNoticeList";
import { RegularShopList } from "~/components/b2bShop/mypage/regularShops"
import { BuyerCenter } from '~/components/b2bShop/mypage/buyerCenter'
import { UseGuide } from '~/components/b2bShop/mypage/useGuide'
import { Setting, TermsOfUse, PrivacyPolicy } from "~/components/b2bShop/mypage/setting"

import { Category } from '~/components/b2bShop/category'
import { FoodsListByItemKind } from '~/components/b2bShop/foodsListByItemKind'


import { PrivateRoute } from "./PrivateRoute";

import Home from '~/components/b2bShop/home/home'
// import BloceryHome from '~/components/BloceryHome'
import FindSeller from '~/components/b2bShop/findSeller'
import SellerDetail from '~/components/b2bShop/sellderDetail'

import { getB2bLoginUserType, getB2bLoginUser } from '~/lib/b2bLoginApi'
import ComUtil from '~/util/ComUtil'
import {b2bQueInfo} from '~/components/common/winOpen'

// const B2bShopPrivateContainer = () => {
//
//     return(
//         <Switch>
//             <Route path={'/b2b/cartToBuy'} component={CartToBuy}/>
//             <Route path={'/b2b/buyFinish'} component={BuyFinish}/>
//             <Route path={'/b2b/inputAddress'} component={InputAddress}/>
//
//             <Route path={'/b2b/mypage/dealList'} component={DealList}/>
//             <Route path={'/b2b/mypage/dealDetail'} component={DealDetail}/>
//             <Route path={'/b2b/mypage/dealCancel'} component={DealCancel}/>
//             <Route path={'/b2b/mypage/infoManagementMenu'} component={InfoManagementMenu}/>
//             <Route path={'/b2b/mypage/foodsQnaList'} component={FoodsQnaList}/>
//             <Route path={'/b2b/mypage/checkCurrentValword'} component={CheckCurrentValword}/>
//             <Route path={'/b2b/mypage/addressManagement'} component={AddressManagement}/>
//             <Route path={'/b2b/mypage/addressModify'} component={AddressModify}/>
//             <Route path={'/b2b/mypage/hintPassPhrase'} component={HintPassPhrase}/>
//             <Route path={'/b2b/mypage/notificationList'} component={NotificationList}/>
//             <Route path={'/b2b/mypage/noticeList'} component={B2bNoticeList}/>
//             <Route path={'/b2b/mypage/regularShopList'} component={RegularShopList}/>
//             <Route path={'/b2b/mypage/setting'} component={Setting}/>
//
//
//             <Route path={'/b2b/waesangHistory'} component={WaesangHistory}/>
//             <Route path={'/b2b/modifyBuyerInfo'} component={ModifyBuyerInfo}/>
//             <Route path={'/b2b/modifyValword'} component={ModifyValword}/>
//             <Route path={'/b2b/dealDetail'} component={DealDetail}/>
//             <Route path={'/b2b/dealList'} component={DealList}/>
//             <Route path={'/b2b/updateAddress'} component={UpdateAddress}/>
//
//             <Route path={'/b2b/foodsReview'} component={FoodsReview} />
//             <Route path={'/b2b/foodsReviewList/:tabId'} component={FoodsReviewList} />
//             <Route component={Error}/>
//         </Switch>
//     )
// }




class B2bShopContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mounted: false
        }
    }

    async componentDidMount(){
        const { data: userType } = await getB2bLoginUserType()

        if(userType){
            const user = await getB2bLoginUser()

            //쿠키 세션 동기화
            localStorage.setItem('userType', userType);
            localStorage.setItem('account', user.account); //geth Account
            localStorage.setItem('email', user.email);
            //valword는 비어있음.  localStorage.setItem('valword', ComUtil.encrypt(user.valword));
            sessionStorage.setItem('logined', 1);

        }else{
            if (localStorage.getItem('autoLogin') != 1) { //로그아웃을 한경우만 지워주면 됨: 로그아웃하면 autoLogin이 지워짐
                localStorage.removeItem('userType');
                localStorage.removeItem('account'); //geth Account
                localStorage.removeItem('email');
                localStorage.removeItem('valword');
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
                    <Route exact path={'/b2b'} render={()=>(<Redirect to={'/b2b/home/1'}/>)} />
                    <Route path='/b2b/b2bQueInfo' component={b2bQueInfo}/>
                    <Route path='/b2b/event' component={Event}/>
                    <Route path='/b2b/login' component={Login}/>
                    <Route path='/b2b/join' component={BuyerJoin}/>
                    <Route path='/b2b/sellerJoin' component={SellerJoin}/>
                    <Route path='/b2b/joinComplete' component={JoinComplete}/>
                    {/*<Route exact path='/' component={BloceryHome} />*/}
                    <Route path='/b2b/mypage/useGuide' component={UseGuide}/>
                    <Route path='/b2b/mypage/buyerCenter' component={BuyerCenter}/>
                    <Route path='/b2b/mypage/termsOfUse' component={TermsOfUse}/>
                    <Route path='/b2b/mypage/privacyPolicy' component={PrivacyPolicy}/>

                    <Route path={'/b2b/home/:id'} component={Home}/>

                    <Route path={'/b2b/category/:itemNo/:itemKindCode'} component={FoodsListByItemKind}/>
                    <Route path={'/b2b/category'} component={Category}/>

                    {/*<Route path={'/finTech/home/:id'} component={FinTechHome}/>*/}

                    <Route path={'/b2b/foods'} component={Foods}/>
                    <Route path={'/b2b/farmersDetailActivity'} component={FarmersDetailActivity}/>
                    <Route path={'/b2b/sellersFoodsList'} component={SellersFoodsList}/>
                    <Route path={'/b2b/producersFarmDiaryList'} component={ProducersFarmDiaryList}/>
                    <Route path={'/b2b/producersFarmDiary'} component={ProducersFarmDiary}/>

                    <Route path={'/b2b/cartList'} component={CartList}/>

                    {/* mypage 같은 경우 로그인창을 바로 띄우게 되면 로그인창을 닫아도 다시 뜨기 때문에 public 으로 처리함 */}
                    <Route exact path={'/b2b/mypage'} component={Mypage}/>
                    <Route exact path={'/b2b/search'} component={Search} />
                    <Route exact path={'/b2b/findSeller'} component={FindSeller} />
                    <Route exact path={'/b2b/sellerDetail'} component={SellerDetail} />

                    {/* private start */}
                    {/* 기존의 PrivateRoute를 제거하고 아래처럼 나열함 */}
                    {/*<PrivateRoute component={B2bShopPrivateContainer} userType={'buyer'}/>*/}

                    <PrivateRoute path={'/b2b/cartToBuy'} component={CartToBuy} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/buyFinish'} component={BuyFinish} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/inputAddress'} component={InputAddress} userType={'buyer'} />

                    <PrivateRoute path={'/b2b/mypage/dealList'} component={DealList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/dealDetail'} component={DealDetail} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/dealCancel'} component={DealCancel} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/infoManagementMenu'} component={InfoManagementMenu} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/foodsQnaList'} component={FoodsQnaList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/checkCurrentValword'} component={CheckCurrentValword} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/addressManagement'} component={AddressManagement} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/addressModify'} component={AddressModify} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/hintPassPhrase'} component={HintPassPhrase} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/notificationList'} component={NotificationList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/noticeList'} component={B2bNoticeList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/regularShopList'} component={RegularShopList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/mypage/setting'} component={Setting} userType={'buyer'} />


                    <PrivateRoute path={'/b2b/waesangHistory'} component={WaesangHistory} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/modifyBuyerInfo'} component={ModifyBuyerInfo} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/modifyValword'} component={ModifyValword} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/dealDetail'} component={DealDetail} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/dealList'} component={DealList} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/updateAddress'} component={UpdateAddress} userType={'buyer'} />

                    <PrivateRoute path={'/b2b/foodsReview'} component={FoodsReview} userType={'buyer'} />
                    <PrivateRoute path={'/b2b/foodsReviewList/:tabId'} component={FoodsReviewList} userType={'buyer'} />
                    {/* private end */}


                    <Route component={Error}/>
                </Switch>
                <B2bTabBar
                    pathname={this.props.history.location.pathname}
                    ignoredPathnames={[
                        '/b2b/foods',
                        '/b2b/buyFinish',
                        '/b2b/orderDetail',
                        '/b2b/orderList',
                        '/b2b/mypage/dealDetail',
                        '/b2b/mypage/dealList',
                        '/b2b/mypage/dealCancel',
                        '/b2b/foodsReview',
                        '/b2b/login',
                        // '/producer/login',
                        '/b2b/farmersDetailActivity',
                        '/b2b/sellersFoodsList',
                        '/b2b/producersFarmDiaryList',
                        '/b2b/producersFarmDiary',
                        '/b2b/cartList',
                        '/b2b/cartToBuy',
                        '/b2b/sellerDetail',
                        '/b2b/b2bQueInfo'
                    ]}
                />
            </Fragment>
        )
    }
}

export default B2bShopContainer
