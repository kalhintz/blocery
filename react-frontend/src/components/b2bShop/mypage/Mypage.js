import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button, ListGroup, ListGroupItem} from 'reactstrap'
import { faListAlt, faEdit, faAngleRight, faDotCircle, faQuestionCircle, faComments, faBell, faBook, faCog, faUserCog, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Header } from '../header/index'

import { getBuyer, countRegularShop, countFoodsReview, getUnpaidSumByBuyerNo } from '~/lib/b2bShopApi'
import { doB2bLogout, getB2bLoginUserType } from '~/lib/b2bLoginApi'

import ComUtil from '~/util/ComUtil'

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from '~/lib/webviewApi'
import Style from './MyPage.module.scss'
import { LoginLinkCard } from '~/components/common'
export default class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nonePaidWaesang: '',
            loginUser:'notRender',  //로그인 판별여부가 결정날때까지 render방지 -> (로그인 된경우) 로그인 버튼 안그리기.
            regularShopCount:'',
            foodsReviewCount:''
        }
    }

    // 화면 로딩시 로그인한 buyer정보 호출
    async componentDidMount() {
        await this.refreshCallback(); //로그인 정보 가져오기

        console.log({loginUser: this.state.loginUser, localStorage: localStorage})

        console.log('b2b/shop:myPage-componentDidMount:', this.state.loginUser);
        if (this.state.loginUser && this.state.loginUser.account) {

            let {data:regularShopCount} = await countRegularShop(this.state.loginUser.buyerNo);
            let {data:foodsReviewCount} = await countFoodsReview(this.state.loginUser.buyerNo);

            //미지급외상금 구하기
            const { data : sumWaesang } = await getUnpaidSumByBuyerNo(this.state.loginUser.buyerNo);

            this.setState({
                nonePaidWaesang: sumWaesang,
                regularShopCount: regularShopCount,
                foodsReviewCount: foodsReviewCount
            });
        }
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    refreshCallback = async () => {
        const loginUserType = await getB2bLoginUserType();
        //console.log('refreshCallback',loginUserType);
        let loginUser;

        if(loginUserType.data == 'buyer') {
            //console.log('loginUserType', loginUserType.data)
            loginUser = await getBuyer();

            // if(!loginUser){  로그인버튼 제거 시 필요
            //     Webview.openPopup('/b2b/login');
            // }
        }
        //TODO: [1117] back-end merge 후 seller 로 수정요
        else if (loginUserType.data == 'seller') {
            //console.log('loginUserType ERROR================ 메뉴잘못 진입됨. buyer용임. 자동이동시도', loginUserType.data)

            //판매자용 mypage로 자동이동.
            Webview.movePage('/b2b/seller/mypage');
        } else{
            //Webview.openPopup('/b2b/login', true);
        }

        console.log({loginUserType})

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })
    }

    onClickLogin = () => {
        Webview.openPopup('/b2b/login');//, this.refreshCallback); //로그인을 팝업으로 변경.
    }

    onClickLogout = async (isConfirmed) => {
        isConfirmed && await doB2bLogout();
        // if (isConfirmed) {
        //     this.setState({
        //         loginUser: ''
        //     })
        // }
        //자기 페이지 강제 새로고침()
        window.location = this.props.history.location.pathname
    }


    //미지급 외상금 조회
    getWaesangDetail = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/waesangHistory?buyerNo='+loginUser.buyerNo)
    }

    // 주문내역
    getDealList = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/dealList?buyerNo='+loginUser.buyerNo)
    }

    clickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/infoManagementMenu?buyerNo='+loginUser.buyerNo)
    }

    //상품후기
    onFoodsReviewListClick = () => {
        this.props.history.push('/b2b/foodsReviewList/1')
    }

    //상품문의
    onFoodsQnaList = () => {
        this.props.history.push('/b2b/mypage/foodsQnaList')
    }

    // 알림
    getNotificationList = () => {
        this.props.history.push('/b2b/mypage/notificationList')
    }

    // 공지사항
    getNoticeList = () => {
        this.props.history.push('/b2b/mypage/noticeList')
    }

    // 단골상점
    getRegularShops = () => {
        this.props.history.push('/b2b/mypage/regularShopList')
    }

    //이용안내
    onUseGuide = () => {
        this.props.history.push('/b2b/mypage/useGuide')
    }

    //고객센터
    onbuyerCenter = () => {
        this.props.history.push('/b2b/mypage/buyerCenter')
    }

    //설정
    onSetting = () => {
        this.props.history.push('/b2b/mypage/setting')
    }

    render() {
        return (
            <Fragment>
                <Header />
                {
                    this.state.loginUser === 'notRender' ? <div></div> : //로그인 여부 판단될 때까지 render방지.
                    (!this.state.loginUser) ?
                        <div className='p-4'>
                            <LoginLinkCard onClick={this.onClickLogin} />
                        </div>
                        :
                        <div>
                            <div className='d-flex m-3'>
                                <div className={classNames('d-flex justify-content-center align-items-center',Style.circle)}>{this.state.loginUser.level?this.state.loginUser.level:'5'}등급</div>
                                <div className={classNames('ml-3 d-flex align-items-center flex-grow-1')}>
                                    <div className={'flex-grow-1'}>{this.state.loginUser.name}님</div>
                                    <div style={{color:'gray'}} className={'flex-grow-1 text-right cursor-pointer'} onClick={this.clickInfoModify}>
                                        <FontAwesomeIcon icon={faUserCog} color={'gray'} /> 정보관리
                                    </div>
                                </div>
                            </div>
                            <hr/>
                            <div className='d-flex m-3'>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')} onClick={this.getRegularShops}>
                                    <h4 style={{color: 'steelblue'}} className='font-weight-border'><u>{this.state.regularShopCount}</u></h4>
                                    <div>즐겨찾는 업체</div>
                                </div>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')} onClick={this.onFoodsReviewListClick}>
                                    <h4 style={{color: 'steelblue'}} className='font-weight-border'><u>{this.state.foodsReviewCount}</u></h4>
                                    <div>상품후기</div>
                                </div>
                                <div className={classNames(Style.centerAlign, 'flex-grow-1 flex-column cursor-pointer')}  onClick={this.getWaesangDetail}>
                                    <h4 style={{color: 'steelblue'}} className='font-weight-border'><u>{ComUtil.addCommas(this.state.nonePaidWaesang)}</u></h4>
                                    <div>미지급 외상금</div>
                                </div>
                            </div>

                            <Container>
                                {/*<Row>*/}
                                    {/*<Col>*/}
                                        {/*<ListGroup>*/}
                                            {/*<ListGroupItem onClick={this.getRegularShops}>*/}
                                                {/*<div className='d-flex'>*/}
                                                    {/*<div><FontAwesomeIcon icon={faDotCircle} size={'1x'} /></div>*/}
                                                    {/*<div className='ml-2 flex-grow-1'>단골상점</div>*/}
                                                    {/*/!*<div className='ml-2 text-primary'>13</div>*!/*/}
                                                    {/*<div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>*/}
                                                {/*</div>*/}
                                            {/*</ListGroupItem>*/}
                                        {/*</ListGroup>*/}
                                    {/*</Col>*/}
                                {/*</Row>*/}
                                {/*<br/>*/}
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem onClick={this.getDealList} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faListAlt} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>주문내역</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem tag="a" action>
                                                <div className='d-flex' onClick={this.onFoodsReviewListClick}>
                                                    <div><FontAwesomeIcon icon={faEdit} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>상품후기</div>
                                                    <div className='ml-2 text-primary'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem tag="a" action>
                                                <div className='d-flex' onClick={this.onFoodsQnaList}>
                                                    <div><FontAwesomeIcon icon={faComments} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>상품문의</div>
                                                    <div className='ml-2 text-primary'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                        </ListGroup>
                                    </Col>
                                </Row>
                                <br/>
                                <Row>
                                    <Col>
                                        <ListGroup>
                                            <ListGroupItem tag="a" action>
                                                <div className='d-flex' onClick={this.getNotificationList}>
                                                    <div><FontAwesomeIcon icon={faBell} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>알림</div>
                                                    <div className='ml-2 text-primary'></div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem  onClick={this.getNoticeList} tag="a"action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faBullhorn} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>공지사항</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem  onClick={this.onUseGuide} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faBook} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>이용안내</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem  onClick={this.onbuyerCenter} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faQuestionCircle} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>고객센터</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem  onClick={this.onSetting} tag="a" action>
                                                <div className='d-flex'>
                                                    <div><FontAwesomeIcon icon={faCog} size={'1x'} /></div>
                                                    <div className='ml-2 flex-grow-1'>설정</div>
                                                    <div className='ml-2'><FontAwesomeIcon icon={faAngleRight} /></div>
                                                </div>
                                            </ListGroupItem>
                                            <ListGroupItem tag="a" action>
                                                <div onClick={() => {
                                                    if(window.confirm('로그아웃 하시겠습니까?'))
                                                        this.onClickLogout(true)
                                                }}>
                                                    로그아웃
                                                </div>
                                            </ListGroupItem>
                                        </ListGroup>
                                        <br/>
                                    </Col>
                                </Row>
                            </Container>
                            <ToastContainer/>
                        </div>
                }


            </Fragment>

        )
    }
}