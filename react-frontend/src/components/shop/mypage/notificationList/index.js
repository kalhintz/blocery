import React, { Component, Fragment } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Style from './NotificationList.module.scss'
import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'

import {BodyFullHeight} from '~/components/common/layouts'

import { ShopXButtonNav, LoginLinkCard } from '~/components/common/index'

import { getConsumer, getNotificationListByUniqueNo } from '~/lib/shopApi'
import { getProducer } from '~/lib/producerApi'
import { getLoginUserType } from '~/lib/loginApi'

import { toast } from 'react-toastify'     //토스트
import Skeleton from '~/components/common/cards/Skeleton'

export default class NotificationList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginUser : null,
            notificationList: undefined,
            loading: true
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        const {data: loginUserType} = await getLoginUserType();
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        const notificationList = await this.getNotificationList(loginUserType, loginUser.data);
        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType,
            notificationList: notificationList,
            loading: false
        })
    }

    getNotificationList = async (loginUserType, loginUser) => {
        let notificationList;
        if(loginUserType === "consumer") {
            let params = {
                uniqueNo: loginUser.consumerNo,
                userType: loginUserType
            }
            const {data} = await getNotificationListByUniqueNo(params);
            notificationList = data
        }

        return notificationList
    }


    onNotificationClick = async (title) => {

        if (title.startsWith('배송')) {
            this.props.history.push('/mypage/orderList');
        }
        if (title.startsWith('단골')) {
            this.props.history.push('/home/7');
        }
        if (title.startsWith('상품문의')) {
            this.props.history.push('/mypage/goodsQnaList');
        }
    }

    onLoginClick = () => {
        Webview.openPopup('/login');
    }

    render() {

        const data = this.state.notificationList;

        return(
            <Fragment>
                <ShopXButtonNav underline fixed historyBack>알림</ShopXButtonNav>
                {
                    this.state.loading ? <Skeleton count={4}/> : (
                        !this.state.loginUserType ? (
                            <BodyFullHeight nav bottomTabbar>
                                <LoginLinkCard icon description={'로그인 후 알림 서비스를 이용 하실 수 있습니다'} onClick={this.onLoginClick} />
                            </BodyFullHeight>
                        ) : (
                            <Container fluid>
                                <Row>
                                    <Col style={{padding:0, margin:0}}>
                                        {
                                            (data && data.length <= 0) && <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'알림내역이 없습니다.'}</div>
                                        }
                                        {
                                            !data ? <Skeleton/> : data.map(({notificationNo, title, body, uniqueNo, userType, notificationType, notificationDate}, index) => {
                                                return (

                                                    <div key={'notificationList' + index}
                                                         onClick={() => this.onNotificationClick(title)}>
                                                        <a id="a" className={Style.alert}>
                                                            <div>[{title}]</div>
                                                            <div>{body}</div>
                                                            <span>{notificationDate && ComUtil.utcToString(notificationDate)}</span>

                                                        </a>
                                                    </div>
                                                )
                                            })
                                        }
                                    </Col>
                                </Row>
                            </Container>
                        )
                    )
                }

            </Fragment>
        )
    }
}