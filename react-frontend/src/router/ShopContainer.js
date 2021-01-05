import React, { Component, Fragment } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import Search from '~/components/shop/search'
import { Event, EventAppReview, Login, Goods, MultiGiftBuy, DirectBuy, CartBuy, BuyFinish, ConsumerJoin, InputAddress, JoinComplete, FarmersDetailActivity, CartList, ZzimList } from '../components/shop'
import Error from '../components/Error'
import { Mypage, TokenHistory, Deposit, Withdraw } from "~/components/shop/mypage";
import { BlocerySpinner } from '~/components/common'
import ShopTabBar from '~/components/common/tabBars/ShopTabBar'

import ComUtil from '../util/ComUtil'
import { GoodsReview, GoodsReviewList, ProducersGoodsList, ProducersFarmDiaryList, ProducersFarmDiary } from '../components/shop'
import { Order, OrderDetail, OrderList, UpdateAddress, OrderCancel } from "../components/shop/mypage/orderList";
import TokenSwap from "~/components/shop/mypage/tokenSwap"
import { InfoManagementMenu, CheckCurrentValword, ModifyConsumerInfo, ModifyValword, AddressManagement, AddressModify, HintPassPhrase } from "../components/shop/mypage/infoManagement"
import GoodsQnaList from "~/components/shop/mypage/goodsQna"
import NotificationList from "~/components/shop/mypage/notificationList";
import { NoticeList } from "~/components/common/noticeList";
import RegularShopList from "~/components/shop/mypage/regularShops"
import ConsumerCenter from '~/components/shop/mypage/consumerCenter'
import UseGuide from '~/components/shop/mypage/useGuide'
import { Setting, TermsOfUse, PrivacyPolicy } from "~/components/shop/mypage/setting"
import { KycCertification, KycDocument, KycFinish } from '~/components/shop/mypage/certification'
import { CouponList } from '~/components/shop/mypage/couponList'

import MdPick from '~/components/shop/mdPick'
import MdPickSub from '~/components/shop/mdPickSub'

import { Category } from '~/components/shop/category'
import GoodsListByItemKind from '~/components/shop/goodsListByItemKind'

import { PrivateRoute } from "./PrivateRoute";

import Home from '~/components/shop/home/home'
import BloceryHome from '~/components/BloceryHome'

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import { Webview } from "~/lib/webviewApi";

import {b2cQueInfo} from '~/components/common/winOpen'
import B2cSidebar from '~/components/common/sideBars/B2cSidebar'
import {Transition} from 'react-spring/renderprops'
import B2cBottomBar from '~/components/common/sideBars/B2cBottombar'

const Wrapper = {
    display: 'flex',
    justifyContent: 'center'
}
const Content = {
    width: 640
}

//사이드바 애니 적용
class SidebarWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sideBarWidth: '90%'
        }
    }

    render(){
        return(
            <Transition
                items={this.props.menuOpen}
                from={{opacity: 0, left: this.state.sideBarWidth}}   //B2cSidebar.module.scss 의  .modal 의 width 와 동일함
                enter={{ opacity: 1, left: '0%'}}
                leave={{ opacity: 0, left: this.state.sideBarWidth}}
                config={{duration: 200, mass: 5, tension: 500, friction: 80
                    //, ...config.stiff
                }}
            >
                {
                    toggle =>
                        toggle && (
                            props =>
                                <div
                                    className={'dom_b2c_sidebar'}
                                    style={{position: 'fixed', opacity: 1, zIndex: 99999, top: 0, bottom: 0, width: '100%'}}
                                    onClick={this.props.onClose}
                                >
                                    <B2cSidebar width={this.state.sideBarWidth} left={props.left} onClose={this.props.onClose} history={this.props.history}/>
                                </div>
                        )
                }
            </Transition>
        )
    }
}

class ShopContainer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mounted: false,
            menuOpen: false
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

    toggleHamburger = (isOpen) => {
        if(isOpen){
            ComUtil.noScrollBody()
        }else{
            ComUtil.scrollBody()
        }
        this.setState({menuOpen: isOpen})
    }

    render() {

        if(!this.state.mounted) return <BlocerySpinner/>

        return(

            <div className={'shopMediaWrapper'}>
                <div className='shopMediaContainer'>
                    <div>

                        {/* 사이드바 : 최신/클래스 분리 */}
                        <SidebarWrapper history={this.props.history} menuOpen={this.state.menuOpen} onClose={this.toggleHamburger.bind(this, false)}/>

                        <Switch>
                            {/* public */}

                            <Route path='/event' component={Event}/>
                            <Route path='/eventAppReview' component={EventAppReview}/>
                            <Route path='/login' component={Login}/>
                            <Route path='/join' component={ConsumerJoin}/>
                            <Route path='/joinComplete' component={JoinComplete}/>
                            {/*<Route exact path='/' component={BloceryHome} />*/}
                            <Route path='/mypage/queInfo' component={b2cQueInfo}/>
                            <Route path='/mypage/consumerCenter' component={ConsumerCenter}/>
                            <Route path='/mypage/useGuide' component={UseGuide}/>
                            <Route path='/mypage/termsOfUse' component={TermsOfUse}/>
                            <Route path='/mypage/privacyPolicy' component={PrivacyPolicy}/>

                            <Route exact path='/b2c' render={()=>(<Redirect to={'/home/1'}/>)} />

                            <Route exact path='/' component={Home}/>
                            <Route path={'/home/:id'} component={Home}/>

                            {/*<Route exact path='/timeSale' component={TimeSale} />*/}
                            {/* 기획전 */}
                            <Route exact path='/mdPick' component={MdPick} />
                            {/* 기획전 상세 */}
                            <Route exact path='/mdPick/sub' component={MdPickSub} />
                            {/*<Route exact path='/mdPick/:id' component={MdPickSub} />*/}



                            <Route path={'/category/:itemNo/:itemKindCode'} component={GoodsListByItemKind}/>
                            <Route path={'/category'} component={Category}/>

                            {/*<Route path={'/finTech/home/:id'} component={FinTechHome}/>*/}

                            <Route path={'/goods'} component={Goods}/>
                            <Route path={'/farmersDetailActivity'} component={FarmersDetailActivity}/>
                            <Route path={'/producersGoodsList'} component={ProducersGoodsList}/>
                            <Route path={'/producersFarmDiaryList'} component={ProducersFarmDiaryList}/>
                            <Route path={'/producersFarmDiary'} component={ProducersFarmDiary}/>
                            <Route path={'/tokenHistory'} component={TokenHistory}/>
                            <Route path={'/deposit'} component={Deposit}/>
                            <Route path={'/withdraw'} component={Withdraw}/>

                            <Route path={'/kycCertification'} component={KycCertification}/>
                            <Route path={'/kycDocument'} component={KycDocument}/>
                            <Route path={'/kycFinish'} component={KycFinish}/>

                            <Route path={'/cartList'} component={CartList}/>
                            <Route path={'/zzimList'} component={ZzimList}/>

                            {/* mypage 같은 경우 로그인창을 바로 띄우게 되면 로그인창을 닫아도 다시 뜨기 때문에 public 으로 처리함 */}
                            <Route exact path={'/mypage'} component={Mypage}/>
                            <Route exact path={'/search'} component={Search} />
                            <Route exact path={'/mypage/notificationList'} component={NotificationList}/>

                            <Route exact path={'/noticeList'} component={NoticeList} />

                            {/* private start */}
                            {/* 기존의 PrivateRoute를 제거하고 아래처럼 나열함 */}
                            <PrivateRoute exact path={'/multiGiftBuy'} component={MultiGiftBuy} />
                            <PrivateRoute exact path={'/directBuy'} component={DirectBuy} />
                            <PrivateRoute exact path={'/cartBuy'} component={CartBuy} />
                            <PrivateRoute exact path={'/buyFinish'} component={BuyFinish} />
                            <PrivateRoute exact path={'/inputAddress'} component={InputAddress} />
                            <PrivateRoute exact path={'/mypage/orderList'} component={OrderList} />
                            <PrivateRoute exact path={'/mypage/orderDetail'} component={Order} />
                            <PrivateRoute exact path={'/mypage/orderCancel'} component={OrderCancel} />
                            <PrivateRoute exact path={'/mypage/infoManagementMenu'} component={InfoManagementMenu} />
                            <PrivateRoute exact path={'/mypage/goodsQnaList'} component={GoodsQnaList} />
                            <PrivateRoute exact path={'/mypage/checkCurrentValword'} component={CheckCurrentValword} />
                            <PrivateRoute exact path={'/mypage/addressManagement'} component={AddressManagement} />
                            <PrivateRoute exact path={'/mypage/addressModify'} component={AddressModify} />
                            <PrivateRoute exact path={'/mypage/hintPassPhrase'} component={HintPassPhrase} />
                            <PrivateRoute exact path={'/mypage/noticeList'} component={NoticeList} />
                            <PrivateRoute exact path={'/mypage/regularShopList'} component={RegularShopList} />
                            <PrivateRoute exact path={'/mypage/tokenSwap'} component={TokenSwap} />
                            <PrivateRoute exact path={'/mypage/couponList'} component={CouponList} userType={'consumer'} />
                            <PrivateRoute exact path={'/mypage/setting'} component={Setting} />
                            <PrivateRoute exact path={'/modifyConsumerInfo'} component={ModifyConsumerInfo} />
                            <PrivateRoute exact path={'/modifyValword'} component={ModifyValword} />
                            <PrivateRoute exact path={'/orderDetail'} component={OrderDetail} />
                            <PrivateRoute exact path={'/orderList'} component={OrderList} />
                            <PrivateRoute exact path={'/updateAddress'} component={UpdateAddress} />
                            <PrivateRoute exact path={'/goodsReview'} component={GoodsReview} />
                            <PrivateRoute exact path={'/goodsReviewList/:tabId'} component={GoodsReviewList} />
                            {/* private end */}

                            <Route component={Error}/>
                        </Switch>



                        <ShopTabBar
                            pathname={this.props.history.location.pathname}
                            ignoredPathnames={[
                                '/goods',
                                '/directBuy',  // 1.0에서 남겨두기
                                '/cartBuy',  // 1.0에서 남겨두기
                                '/cartList',
                                '/buyFinish',
                                // '/orderDetail',
                                // '/orderList',
                                // '/mypage/orderDetail',
                                // '/mypage/orderList',
                                // '/mypage/orderCancel',
                                // '/goodsReview',
                                '/login', // 1.0에서 남겨두기
                                '/farmersDetailActivity',
                                '/kycCertification',
                                '/kycDocument',
                                '/kycFinish',
                                '/tokenHistory',
                                '/deposit',
                                '/withdraw',
                                // '/producersGoodsList',
                                // '/producersFarmDiaryList',
                                // '/producersFarmDiary',
                                // '/queInfo',
                                '/joinComplete'
                            ]}
                            onSidebarClick={this.toggleHamburger}
                            menuOpen={this.state.menuOpen}

                        />

                        <B2cBottomBar />

                    </div>
                </div>
            </div>

        )
    }
}

export default ShopContainer
