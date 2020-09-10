import React, { Component, Fragment } from 'react';

import { getConsumer, addRegularShop, getRegularShop, countRegularShop, countGoodsReview, getOrderDetailCountForMypage, getConsumerKyc } from '~/lib/shopApi'
import { doLogout, getLoginUserType, autoLoginCheckAndTryAsync } from '~/lib/loginApi'
import { scOntGetBalanceOfBlct } from "~/lib/smartcontractApi";
import {Button, Span} from "../../../styledComponents/shared";

import ComUtil from '~/util/ComUtil'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from '../../../lib/webviewApi'
import Css from './MyPage.module.scss'
import { LoginLinkCard, ModalPopup } from '~/components/common'
import { B2cHeader } from '~/components/common/headers'
import {BodyFullHeight} from '~/components/common/layouts'
import { getCart } from '../../../lib/cartApi'

import icEdit from '~/images/icons/ic_edit.svg'
import icMy1 from '~/images/icons/ic_my_1.svg'
import icMy2 from '~/images/icons/ic_my_2.svg'
import icMy3 from '~/images/icons/ic_my_3.svg'
import icMy4 from '~/images/icons/ic_my_4.svg'
import icMy5 from '~/images/icons/ic_my_5.svg'
import icMy6 from '~/images/icons/ic_my_6.svg'
import icMy7 from '~/images/icons/ic_my_7.svg'
import icMy8 from '~/images/icons/ic_my_8.svg'

import icMore12 from '~/images/icons/ic_more_12.svg'
import icMore11 from '~/images/icons/ic_more_11.svg'
import icMore10 from '~/images/icons/ic_more_10.svg'
import icMoreArrow from '~/images/icons/ic_more_arrow_n.svg'
import icRank5 from '~/images/icons/ic_rank_b.svg'  //5등급
import icRank4 from '~/images/icons/ic_rank_s.svg'  //4등급
import icRank3 from '~/images/icons/ic_rank_g.svg'  //3등급
import icRank2 from '~/images/icons/ic_rank_v.svg'  //2등급
import icRank1 from '~/images/icons/ic_rank_vv.svg'  //1등급

import {BlocerySymbolGreen} from '~/components/common/logo'
import styled from 'styled-components'

import {Div, Link as StyledLink, Flex} from '~/styledComponents/shared'
import { MdInfo } from 'react-icons/md'
import { color } from "~/styledComponents/Properties";
import Skeleton from '~/components/common/cards/Skeleton'

const Link = styled(StyledLink)`
    display: block;
`;

export default class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenBalance: '',
            loginUser:'notRender',  //로그인 판별여부가 결정날때까지 render방지 -> (로그인 된경우) 로그인 버튼 안그리기.
            regularShopCount:'',
            goodsReviewCount:'',

            //202003추가.
            cartLength: '',
            paymentDoneCount: '',
            inDeliveryCount: '',
            consumerOkCount: '',
            newNotificationBadge: false,
            newNoticeRegBadge: false,
            kycAuth: null,              // KYC승인 [-1:승인거절, 0:미신청, 1:신청중, 2:승인처리]
            modalOpen: false,
            loading: true
        }
    }

    // 화면 로딩시 로그인한 consumer정보 호출
    async componentDidMount() {


        //////////// consumer push수신시 바로이동용으로 추가: history때문에 항상 mypage거쳐서 가야함.
        //USAGE:  mypage?moveTo=orderList
        const params = new URLSearchParams(this.props.location.search)
        let moveTo = params.get('moveTo');
        if (moveTo)  {
            await autoLoginCheckAndTryAsync(); //push수신시 자동로그인 test : 20200825
            this.props.history.push('/mypage'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
            this.props.history.push('/mypage/' + moveTo);
        }


        await this.refreshCallback(); //로그인 정보 가져오기

        // console.log({loginUser: this.state.loginUser, localStorage: localStorage})
        //
        // console.log('myPage-componentDidMount:', this.state.loginUser);
        if (this.state.loginUser && this.state.loginUser.account) {

            let {data:regularShopCount} = await countRegularShop(this.state.loginUser.consumerNo);
            let {data:goodsReviewCount} = await countGoodsReview(this.state.loginUser.consumerNo);

            let {data:blctBalance} = await scOntGetBalanceOfBlct(this.state.loginUser.account);
            console.log('blctBalance : ', blctBalance);

            let {data:cartData} = await getCart();
            console.log('getCart : ', cartData);

            let {data:detailCount} = await getOrderDetailCountForMypage();
            console.log('detailCount : ', detailCount);

            this.setState({
                tokenBalance: blctBalance,
                regularShopCount: regularShopCount,
                goodsReviewCount: goodsReviewCount,

                //202003추가.
                cartLength : cartData.length,
                paymentDoneCount: detailCount.paymentDoneCount,
                inDeliveryCount: detailCount.inDeliveryCount,
                consumerOkCount: detailCount.consumerOkCount,
                newNoticeRegBadge: detailCount.newNoticeRegBadge,
                newNotificationBadge: detailCount.newNotificationBadge,
                loading: false

            });
        }

        const {data:res} = await getConsumerKyc();
        console.log(res)
        this.setState({ kycAuth: res.kycAuth })

    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    refreshCallback = async () => {
        const loginUserType = await getLoginUserType();
        //console.log('refreshCallback',loginUserType);
        let loginUser; // = await getConsumer();

        if(loginUserType.data == 'consumer') {
            //console.log('loginUserType', loginUserType.data)
            loginUser = await getConsumer();

            console.log(loginUser.data)

            // if(!loginUser){  로그인버튼 제거 시 필요
            //     Webview.openPopup('/login');
            // }
        } else if (loginUserType.data == 'producer') {
            //console.log('loginUserType ERROR================ 메뉴잘못 진입됨. consumer용임. 자동이동시도', loginUserType.data)

            //생산자용 mypage로 자동이동.
            Webview.movePage('/producer/mypage');
        } else{
            //Webview.openPopup('/login', true);
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })
    }

    onClickLogin = () => {
        Webview.openPopup('/login');//, this.refreshCallback); //로그인을 팝업으로 변경.
    }

    onClickLogout = async (isConfirmed) => {
        isConfirmed && await doLogout();
        // if (isConfirmed) {
        //     this.setState({
        //         loginUser: ''
        //     })
        // }
        //자기 페이지 강제 새로고침()
        window.location = this.props.history.location.pathname
    }

    clickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/infoManagementMenu?consumerNo='+loginUser.consumerNo)
    }


    getGradeIcon = (level) => {
        if (level == 5) return icRank5;
        if (level == 4) return icRank4;
        if (level == 3) return icRank3;
        if (level == 2) return icRank2;
        if (level == 1) return icRank1;
    }

    onClickCertification = () => {
        this.props.history.push('/kycCertification')
    }

    //BLY 시세 모달
    onHelpClick = async () => {
        this.setState({
            modalOpen: true
        })
    }


    onClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    render() {
        if(!this.state.loginUser){
            return(
                <Fragment>
                    <B2cHeader underline/>
                    <BodyFullHeight nav bottomTabbar>
                        <LoginLinkCard
                            icon
                            regularList
                            description={'로그인을 하면 마켓블리(MarketBly)에서 제공하는 다양한 서비스와 혜택을 만나실 수 있습니다.'}
                            style={{width: '80vmin'}}
                            onClick={this.onClickLogin}/>
                    </BodyFullHeight>
                </Fragment>
            )
        }

        return (
            <Fragment>
                <B2cHeader mypage/>
                {
                    this.state.loginUser === 'notRender' ? <div></div> : //로그인 여부 판단될 때까지 render방지.
                        <div className={Css.wrap}>
                            <div className={Css.greenContainer}>
                                <div>
                                    {/*<div className={Css.grade}>{this.state.loginUser.level?this.state.loginUser.level:'5'}등급</div>*/}
                                    <div className={Css.icon}><img  src={this.getGradeIcon(this.state.loginUser.level)}/></div>
                                    <Flex>
                                        <div className={Css.name}>{this.state.loginUser.name}님</div>
                                        <Div ml={3} fg={'white'} fontSize={12}> | KYC 신원확인</Div>
                                        {/*TODO : KYC인증 여부 뱃지*/}
                                        {/* KYC승인 [-1:승인거절, 0:미신청, 1:신청중, 2:승인처리] */}
                                        {
                                            this.state.loginUser.kycLevel === 0 ?
                                                <Div>
                                                    {
                                                        this.state.kycAuth === null && <Skeleton.Row width={60} mx={10}/>
                                                    }
                                                    {
                                                        (this.state.kycAuth === 1) && (<Div mr={5} fg={'white'} fontSize={12}>(승인대기중)</Div>)
                                                    }
                                                    {
                                                        (this.state.kycAuth === 0 || this.state.kycAuth === -1 ) && (
                                                            <Flex mr={5} fg={'white'} fontSize={12}>
                                                                <Div mr={5}>(미완료)</Div>
                                                                <Link to={'/kycCertification'}><Button bg={'white'} fg={'green'} py={3} fontSize={10} >인증하기</Button></Link>
                                                            </Flex>
                                                        )
                                                    }

                                                    {/*{*/}
                                                    {/*this.state.kycAuth === 1 ?*/}
                                                    {/*<Div mr={5} fg={'white'} fontSize={12}>승인대기중)</Div>*/}
                                                    {/*:*/}
                                                    {/*<Flex mr={5} fg={'white'} fontSize={12}>*/}
                                                    {/*<Div mr={5}>미완료)</Div>*/}
                                                    {/*<Link to={'/kycCertification'}><Button bg={'white'} fg={'green'} py={3} fontSize={10} >인증하기</Button></Link>*/}
                                                    {/*</Flex>*/}
                                                    {/*}*/}
                                                </Div>
                                                :
                                                <Div mr={5} fg={'white'} fontSize={12}>(완료)</Div>
                                        }

                                        <Div ml={-1} mb={1} onClick={this.onHelpClick}>
                                            <MdInfo color={color.white}/>
                                        </Div>

                                    </Flex>
                                </div>
                                <Link to={`/mypage/infoManagementMenu?consumerNo=${this.state.loginUser.consumerNo}`} className={Css.modify}>
                                    <img src={icEdit}/>
                                </Link>

                            </div>



                            <div className={Css.summaryContainer}>
                                <div className={Css.item}>
                                    <Link to={'/mypage/regularShopList'}>
                                        <div className={Css.number}>{!this.state.loading ? this.state.regularShopCount : <Skeleton.Row width={'50%'} mb={10}/>}</div>
                                        <div>단골상점</div>
                                    </Link>
                                </div>
                                <div className={Css.item}>
                                    <Link to={'/goodsReviewList/1'}>
                                        <div className={Css.number}>{!this.state.loading ? this.state.goodsReviewCount : <Skeleton.Row width={'50%'} mb={10}/>}</div>
                                        <div>상품후기</div>
                                    </Link>
                                </div>
                                <div className={Css.item}>
                                    <Link to={`/tokenHistory?account=${this.state.loginUser.account}`}>
                                        <div className={Css.number}>{!this.state.loading ? ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2)):<Skeleton.Row width={'50%'} mb={10}/>}</div>
                                        <div>자산(BLY)</div>
                                    </Link>
                                </div>
                            </div>


                            <div className={Css.shippingStatusContainer}>
                                <div className={Css.title}>
                                    주문/배송조회
                                </div>

                                {
                                    this.state.loading ? <Skeleton p={0}/> : (
                                        <div className={Css.status}>
                                            <div className={Css.item}>
                                                <Link to={'/cartList'}>
                                                    <div className={classNames(Css.green, Css.number)}>{this.state.cartLength}</div>
                                                    <div className={Css.text}>장바구니</div>
                                                </Link>
                                                <div className={classNames(Css.icon, 'mt-2')}><img  src={icMoreArrow}/></div>
                                            </div>
                                            <div className={Css.item}>
                                                <Link to={`/mypage/orderList?consumerNo=${this.state.loginUser.consumerNo}`}>
                                                    <div className={classNames(Css.green, Css.number)}>{this.state.paymentDoneCount}</div>
                                                    <div className={Css.text}>결제완료</div>
                                                </Link>
                                                <div className={classNames(Css.icon, 'mt-2')}><img  src={icMoreArrow}/></div>
                                            </div>
                                            <div className={Css.item}>
                                                <Link to={`/mypage/orderList?consumerNo=${this.state.loginUser.consumerNo}`}>
                                                    <div className={classNames(Css.green, Css.number)}>{this.state.inDeliveryCount}</div>
                                                    <div className={Css.text}>배송중</div>
                                                </Link>
                                                <div className={classNames(Css.icon, 'mt-2')}><img  src={icMoreArrow}/></div>
                                            </div>
                                            <div className={Css.item}>
                                                <Link to={`/mypage/orderList?consumerNo=${this.state.loginUser.consumerNo}`}>
                                                    <div className={classNames(Css.green, Css.number)}>{this.state.consumerOkCount}</div>
                                                    <div className={Css.text}>구매확정</div>
                                                </Link>
                                            </div>

                                        </div>
                                    )
                                }



                            </div>
                            <div className={Css.listContainer}>
                                <Link to={`/mypage/orderList?consumerNo=${this.state.loginUser.consumerNo}`}>
                                    <div className={Css.item}>
                                        <img className={Css.icon} src={icMy1}/>
                                        <div className={Css.text}>주문목록
                                            {/*빨간 배지 <span className={Css.circle}></span>*/}
                                        </div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                                <Link to={'/goodsReviewList/1'}>
                                    <div className={Css.item}>
                                        <img className={Css.icon} src={icMy2}/>
                                        <div className={Css.text}>상품후기</div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                                <Link to={'/mypage/goodsQnaList'}>
                                    <div className={Css.item}>
                                        <img className={Css.icon} src={icMy3}/>
                                        <div className={Css.text}>상품문의</div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                                <Link to={'/mypage/regularShopList'}>
                                    <div className={Css.item}>
                                        <img className={Css.icon} src={icMy4}/>
                                        <div className={Css.text}>단골상점</div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                                <Link to={'/zzimList'}>
                                    <div className={Css.item}>
                                        <img className={Css.icon} src={icMy5}/>
                                        <div className={Css.text}>찜한상품</div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                            </div>
                            <div className={Css.listContainer}>
                                <Link to={`/tokenHistory?account=${this.state.loginUser.account}`}>
                                    <div className={Css.item}>
                                        <img className={Css.icon}  src={icMy6}/>
                                        <div className={Css.text}>
                                            <span>자산</span>
                                            {/*<span>내지갑</span>*/}
                                            {/*<span className={Css.smallLight}>*/}
                                            {/*<span>|</span>*/}
                                            {/*<span>보유 적립금</span>*/}
                                            {/*</span>*/}
                                        </div>
                                        <div className={classNames(Css.right, Css.icon)}>
                                            <BlocerySymbolGreen style={{width: 13}}/>
                                            <span className={Css.blct}>{(this.state.tokenBalance !== '')?ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2)):'-'}</span>
                                            <span>BLY</span>
                                            <img className={Css.moreArrow} src={icMoreArrow}/>
                                        </div>
                                    </div>
                                </Link>

                                {/*<Link to={'/mypage/tokenSwap'}>*/}
                                {/*<div className={Css.item}>*/}
                                {/*<Div className={Css.text} noti={this.state.newNotificationBadge} notiRight={-10}>>>>> (임시) 토큰스왑 </Div>*/}
                                {/*<div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>*/}
                                {/*</div>*/}
                                {/*</Link>*/}


                                <Link to={'/mypage/notificationList'}>
                                    <div className={Css.item}>
                                        <img className={Css.icon}  src={icMy7}/>
                                        <Div className={Css.text} noti={this.state.newNotificationBadge} notiRight={-10}>알림</Div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                                <Link to={'/mypage/setting'}>
                                    <div onClick={this.onSetting}  className={Css.item}>
                                        <img className={Css.icon}  src={icMy8}/>
                                        <div className={Css.text}>설정</div>
                                        <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow}/></div>
                                    </div>
                                </Link>
                            </div>
                            <div className={Css.infoContainer}>

                                <div className={Css.item}>
                                    {/*<Link to={'/mypage/noticeList'} noti={this.state.newNoticeRegBadge}>*/}
                                    <Link to={'/noticeList'} noti={this.state.newNoticeRegBadge}>
                                        <img className={Css.icon}  src={icMore12}/>
                                        <div>공지사항</div>
                                    </Link>
                                </div>


                                <div className={Css.item}>
                                    <Link to={'/mypage/useGuide'}>
                                        <img className={Css.icon}  src={icMore11}/>
                                        <div>이용안내</div>
                                    </Link>
                                </div>


                                <div className={Css.item}>
                                    <Link to={'/mypage/consumerCenter'}>
                                        <img className={Css.icon}  src={icMore10}/>
                                        <div>고객센터</div>
                                    </Link>
                                </div>

                            </div>

                        </div>
                }

                {
                    this.state.modalOpen &&
                    <ModalPopup title={'KYC 신원 확인 안내'}
                                content={<div>KYC 신원 확인은 마켓블리(MarketBly) App 내에서 토큰(BLY)출금 등 자산과 관련된 서비스를 이용하는데 있어 필요한 신원 확인 및 보증 절차입니다.
                                    <br/><br/> 계정 보안, 자금 세탁과 테러 자금 조달 방지를 위해 출금 금액이 제한되어 있으며, KYC 신원 확인을 완료하면 출금 제한이 상향 조정됩니다.
                                    <br/><br/> -KYC 신원 확인 전 : 일 한도 1,250BLY <br/> -KYC 신원 확인 후 : 일 한도 250,000BLY</div>}
                                onClick={this.onClose}>

                    </ModalPopup>
                }
            </Fragment>
        )
    }
}