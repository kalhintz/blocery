import React, { Component, Fragment } from 'react';

import {
    getConsumer,
    countRegularShop,
    countGoodsReview,
    getOrderDetailCountForMypage,
    getUsableCouponList,
    getRecommenderInfo,
    getAbuser
} from '~/lib/shopApi'
import { autoLoginCheckAndTryAsync } from '~/lib/loginApi'
import { scOntGetBalanceOfBlct } from "~/lib/smartcontractApi";
import {getDonTotal, isAbuser} from '~/lib/donAirDropApi'

import ComUtil from '~/util/ComUtil'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from '~/lib/webviewApi'
import Css from './MyPage.module.scss'
import { LoginLinkCard, ModalPopup } from '~/components/common'
import { B2cHeader } from '~/components/common/headers'
import {BodyFullHeight} from '~/components/common/layouts'
import { getCart } from '~/lib/cartApi'

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
import icCoupon from '~/images/icons/ic_cP_02.svg'
import icInviteFriend from '~/images/icons/plus_friends.svg'
import { FaUserPlus } from 'react-icons/fa'

import {BlocerySymbolGreen} from '~/components/common/logo'
import styled from 'styled-components'

import {Div, Link as StyledLink, Flex} from '~/styledComponents/shared'
import { MdInfo } from 'react-icons/md'
import { color } from "~/styledComponents/Properties";
import Skeleton from '~/components/common/cards/Skeleton'
import {FiEdit} from 'react-icons/fi'
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import BlySise from "~/components/common/blySise";
import SecureApi from "~/lib/secureApi";


const Link = styled(StyledLink)`
    display: block;
`;

export default class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenBalance: '',
            loginUser: undefined,  //로그인 판별여부가 결정날때까지 render방지 -> (로그인 된경우) 로그인 버튼 안그리기.
            regularShopCount:'',
            goodsReviewCount:'',

            //202003추가.
            cartLength: '',
            paymentDoneCount: '',
            inDeliveryCount: '',
            consumerOkCount: '',
            newNotificationBadge: false,
            newNoticeRegBadge: false,
            newCouponBadge: false,
            modalOpen: false,
            loading: true,
            couponCount: 0,
            recommenderInfo: {},

            donnieBalance: '',
            abuser: null,
            abuserInfoModal: false,
        }
    }

    // 화면 로딩시 로그인한 consumer정보 호출
    async componentDidMount() {

        // CSRF 마이페이지에서 한번더 세팅
        SecureApi.setCsrf().then(()=>{
            SecureApi.getCsrf().then(({data})=>{
                localStorage.setItem('xToken',data);
            });
        });

        //////////// consumer push수신시 바로이동용으로 추가: history때문에 항상 mypage거쳐서 가야함.
        //USAGE:  mypage?moveTo=orderList
        const params = new URLSearchParams(this.props.location.search)
        let moveTo = params.get('moveTo');
        if (moveTo)  {
            this.props.history.push('/mypage'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
            this.props.history.push('/mypage/' + moveTo);
        }

        const {loginUser} = await this.refreshCallback(); //로그인 정보 가져오기

        this.setState({
            loginUser: loginUser
        }, () => {

            if (loginUser && loginUser.account)
                this.searchAll({
                    consumerNo: loginUser.consumerNo,
                    account: loginUser.account
                })
        })
    }

    searchAll = async ({account}) => {
        const result = await Promise.all([
            countRegularShop().then((res)=>res.data),
            countGoodsReview().then((res)=>res.data),
            scOntGetBalanceOfBlct(account).then((res)=>res.data),
            getCart().then((res)=>res.data),
            getOrderDetailCountForMypage().then((res)=>res.data),
            getUsableCouponList().then((res)=>res.data),
            getRecommenderInfo().then((res)=>res.data),
            getDonTotal().then((res)=>res.data),
            isAbuser().then((res)=>res.data)
        ]);

        let regularShopCount = result[0];
        let goodsReviewCount = result[1];
        let blyBalance = result[2];
        let cartData = result[3];
        let detailCount = result[4];
        let couponList = result[5];
        let recommenderInfo = result[6];
        let donTotal = result[7];
        let abuser = result[8];

        //console.log('blyBalance : ', blyBalance);
        //console.log('getCart : ', cartData);
        //console.log('detailCount : ', detailCount);

        this.setState({
            tokenBalance: blyBalance,
            regularShopCount: regularShopCount,
            goodsReviewCount: goodsReviewCount,
            couponCount: couponList.length,
            recommenderInfo: recommenderInfo,
            donnieBalance: donTotal,
            abuser: abuser,

            //202003추가.
            cartLength : cartData.length,
            paymentDoneCount: detailCount.paymentDoneCount,
            inDeliveryCount: detailCount.inDeliveryCount,
            consumerOkCount: detailCount.consumerOkCount,
            newNoticeRegBadge: detailCount.newNoticeRegBadge,
            newNotificationBadge: detailCount.newNotificationBadge,
            newCouponBadge: detailCount.newCouponBadge,

            loading: false
        });
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    refreshCallback = async () => {
        await autoLoginCheckAndTryAsync(); //push수신시 자동로그인 test : 20200825
        const {data} = await getConsumer();

        return {
            loginUser: (data) ? data : null,
        }
    }

    onClickLogin = () => {
        Webview.openPopup('/login');    //로그인을 팝업으로 변경.
    }

    clickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/infoManagementMenu');
    }


    getGradeIcon = (level) => {
        if (level === 5) return icRank5;
        if (level === 4) return icRank4;
        if (level === 3) return icRank3;
        if (level === 2) return icRank2;
        if (level === 1) return icRank1;
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

    onAbuserModalToggle = () => {
        this.setState({
            abuserInfoModal: !this.state.abuserInfoModal
        })
    }

    render() {
        if (this.state.loginUser === undefined)
            return null

        if(this.state.loginUser === null){
            return(
                <Fragment>
                    <B2cHeader underline/>
                    <BodyFullHeight nav bottomTabbar>
                        <LoginLinkCard
                            icon
                            regularList
                            description={<div><div>로그인을 하면 마켓블리에서 제공하는</div><div>다양한 서비스와 혜택을 만나실 수 있습니다.</div></div>}
                            style={{width: '80vmin'}}
                            onClick={this.onClickLogin}/>
                    </BodyFullHeight>
                </Fragment>
            )
        }

        return (
            <Fragment>
                <B2cHeader mypage/>
                <div className={Css.wrap}>
                    <div className={Css.greenContainer}>
                        <div>
                            {/*<div className={Css.grade}>{this.state.loginUser.level?this.state.loginUser.level:'5'}등급</div>*/}
                            <Flex flexWrap={'wrap'} flexGrow={1}>
                                <div className={Css.icon}><img  src={this.getGradeIcon(this.state.loginUser.level)} alt={`user level${this.state.loginUser.level}`}/></div>
                                <Flex className={Css.name} ml={3}>{this.state.loginUser.name}{this.state.abuser ? <Div fontSize={12}>(어뷰저)</Div> :''}</Flex>
                                {
                                    this.state.abuser &&
                                        <Div ml={3} mb={1} onClick={this.onAbuserModalToggle}>
                                            <AiOutlineInfoCircle color={color.white}/>
                                        </Div>
                                }
                            </Flex>
                        </div>
                        <Link to={`/mypage/infoManagementMenu`} className={Css.modify}>
                            <Flex>
                                <Div mr={5} fg={'white'}>정보수정</Div>
                                <FiEdit color={'white'} />
                                {/*<img src={icEdit}/>*/}
                            </Flex>
                        </Link>

                    </div>



                    <div className={Css.summaryContainer}>
                        {/*<div className={Css.item}>*/}
                        {/*    <Link to={'/mypage/regularShopList'}>*/}
                        {/*        <div className={Css.number}>{!this.state.loading ? this.state.regularShopCount : <Skeleton.Row width={'50%'} mb={10}/>}</div>*/}
                        {/*        <div>단골상점</div>*/}
                        {/*    </Link>*/}
                        {/*</div>*/}
                        {/*<div className={Css.item}>*/}
                        {/*    <Link to={'/goodsReviewList/1'}>*/}
                        {/*        <div className={Css.number}>{!this.state.loading ? this.state.goodsReviewCount : <Skeleton.Row width={'50%'} mb={10}/>}</div>*/}
                        {/*        <div>상품후기</div>*/}
                        {/*    </Link>*/}
                        {/*</div>*/}
                        <div className={Css.item} style={{textAlign:'center'}}>
                            <Link to={`/tokenHistory`}>
                                <div className={Css.number}>{!this.state.loading ? ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2)):<Skeleton.Row width={'50%'} mb={10}/>}</div>
                                <div>자산(BLY)</div>
                            </Link>
                        </div>
                        <div className={Css.item} style={{textAlign:'center'}}>
                            {
                                this.state.abuser ?
                                    <Div>
                                        <div className={Css.number}>{!this.state.loading ? '-' : <Skeleton.Row width={'50%'} mb={10}/>}</div>
                                        <div>자산(DON)</div>
                                    </Div>
                                    :
                                    <Link to={'/donHistory'}>
                                        <div className={Css.number}>{!this.state.loading ? ComUtil.addCommas(ComUtil.roundDown(this.state.donnieBalance, 2)) : <Skeleton.Row width={'50%'} mb={10}/>}</div>
                                        <div>자산(DON)</div>
                                    </Link>
                            }

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
                                        <div className={classNames(Css.icon, 'mt-2')}><img src={icMoreArrow} alt={'more'}/></div>
                                    </div>
                                    <div className={Css.item}>
                                        <Link to={`/mypage/orderList`}>
                                            <div className={classNames(Css.green, Css.number)}>{this.state.paymentDoneCount}</div>
                                            <div className={Css.text}>결제완료</div>
                                        </Link>
                                        <div className={classNames(Css.icon, 'mt-2')}><img src={icMoreArrow} alt={'more'}/></div>
                                    </div>
                                    <div className={Css.item}>
                                        <Link to={`/mypage/orderList`}>
                                            <div className={classNames(Css.green, Css.number)}>{this.state.inDeliveryCount}</div>
                                            <div className={Css.text}>배송중</div>
                                        </Link>
                                        <div className={classNames(Css.icon, 'mt-2')}><img src={icMoreArrow} alt={'more'}/></div>
                                    </div>
                                    <div className={Css.item}>
                                        <Link to={`/mypage/orderList`}>
                                            <div className={classNames(Css.green, Css.number)}>{this.state.consumerOkCount}</div>
                                            <div className={Css.text}>구매확정</div>
                                        </Link>
                                    </div>

                                </div>
                            )
                        }

                    </div>
                    <div className={Css.listContainer}>
                        <Link to={`/mypage/orderList`}>
                            <div className={Css.item}>
                                <img className={Css.icon} src={icMy1}/>
                                <div className={Css.text}>주문목록
                                    {/*빨간 배지 <span className={Css.circle}></span>*/}
                                </div>
                                <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow} alt={'more'}/></div>
                            </div>
                        </Link>
                        <Link to={'/goodsReviewList/1'}>
                            <div className={Css.item}>
                                <img className={Css.icon} src={icMy2}/>
                                <div className={Css.text}>상품후기</div>
                                <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow} alt={'more'}/></div>
                            </div>
                        </Link>
                        <Link to={'/mypage/goodsQnaList'}>
                            <div className={Css.item}>
                                <img className={Css.icon} src={icMy3}/>
                                <div className={Css.text}>상품문의</div>
                                <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow} alt={'more'}/></div>
                            </div>
                        </Link>
                        <Link to={'/mypage/regularShopList'}>
                            <div className={Css.item}>
                                <img className={Css.icon} src={icMy4}/>
                                <div className={Css.text}>단골상점</div>
                                <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow} alt={'more'}/></div>
                            </div>
                        </Link>
                        <Link to={'/zzimList'}>
                            <div className={Css.item}>
                                <img className={Css.icon} src={icMy5}/>
                                <div className={Css.text}>찜한상품</div>
                                <div className={classNames(Css.right, Css.icon)}><img src={icMoreArrow} alt={'more'}/></div>
                            </div>
                        </Link>
                    </div>
                    <div className={Css.listContainer}>
                        <Link to={`/tokenHistory`}>
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

                        <Link to={'/mypage/couponList'}>
                            <div className={Css.item}>
                                <img className={Css.icon}  src={icCoupon}/>
                                <Div className={Css.text} noti={this.state.newCouponBadge ? 1 : 0} notiRight={-10}>쿠폰</Div>
                                <div className={classNames(Css.right, Css.icon)}>
                                    {
                                        this.state.couponCount > 0 &&
                                        <div>{this.state.couponCount}장</div>
                                    }
                                    <img src={icMoreArrow}/>
                                </div>
                            </div>
                        </Link>

                        <Link to={'/mypage/inviteFriend'}>
                            <div className={Css.item}>
                                <img className={Css.icon}  src={icInviteFriend}/>
                                {/*<FaUserPlus/>*/}
                                <Div className={Css.text}>친구초대</Div>
                                <div className={classNames(Css.right, Css.icon)}>
                                    {
                                        //this.state.friendsCount > 0 &&
                                        <div>{this.state.recommenderInfo.friendCount}명</div>
                                    }
                                    <img src={icMoreArrow}/>
                                </div>
                            </div>
                        </Link>


                        <Link to={'/mypage/notificationList'}>
                            <div className={Css.item}>
                                <img className={Css.icon}  src={icMy7}/>
                                <Div className={Css.text} noti={this.state.newNotificationBadge ? 1 : 0} notiRight={-10}>알림</Div>
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
                            <Link to={'/noticeList'} noti={this.state.newNoticeRegBadge ? 1 : 0}>
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

                {
                    this.state.modalOpen &&
                    <ModalPopup title={'KYC 신원 확인 안내'}
                                content={<div>KYC 신원 확인은 마켓블리(MarketBly) App 내에서 토큰(BLY)출금 등 자산과 관련된 서비스를 이용하는데 있어 필요한 신원 확인 및 보증 절차입니다.
                                    <br/><br/> 계정 보안, 자금 세탁과 테러 자금 조달 방지를 위해 출금 금액이 제한되어 있으며, KYC 신원 확인을 완료하면 출금 제한이 상향 조정됩니다.
                                    {/*<br/><br/> -KYC 신원 확인 전 : 일 한도 1,250BLY <br/> -KYC 신원 확인 후 : 일 한도 250,000BLY</div>}*/}
                                    <br/><br/> -KYC 신원 확인 전 : 일 한도 500BLY <br/> -KYC 신원 확인 후 : 일 한도 5,000BLY</div>}
                                onClick={this.onClose}>

                    </ModalPopup>
                }

                {
                    this.state.abuserInfoModal &&
                    <ModalPopup title={'어뷰저에 대한 안내'}
                                onClick={this.onAbuserModalToggle}
                                content={
                                    <Div lineHeight={20} fontSize={13}>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                어뷰저 등록은 <b>보안로직 감지에 의해 자동 처리</b>되며 사유는 다음과 같습니다. <br/>
                                                - 마켓블리 불법적 접근 <br/>
                                                - 이벤트 부정 참여 <br/>
                                                - 기타 어뷰징에 인정되는 각종 행위
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                어뷰저로 등록된 경우<br/>
                                                - 상품구매 불가 <br/>
                                                - BLY 입/출금 등의 지갑 이용 불가
                                            </Div>
                                        </Flex>
                                        <Flex alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                등의 조치가 되오니 이점 참고 부탁 드립니다.
                                            </Div>
                                        </Flex>
                                    </Div>
                                }
                                />

                                // content={<div>어뷰저 등록은 보안로직 감지에 의해 자동 처리되며 사유는 다음과 같습니다.
                                //     <br/>- 마켓블리 불법적 접근
                                //     <br/>- 이벤트 부정 참여
                                //     <br/>- 기타 어뷰징에 인정되는 각종 행위
                                //     <br/><br/>어뷰저로 등록된 경우
                                //     <br/>- 상품구매 불가
                                //     <br/>- BLY 입/출금 등의 지갑 이용 불가
                                //     <br/>등의 조치가 되오니 이점 참고 부탁 드립니다.</div>}
                                // onClick={this.onAbuserModalToggle}>
                }
            </Fragment>
        )
    }
}