import React, { Component, Fragment } from 'react'
import { Container, Row, Col } from 'reactstrap'
import Style from './NotificationList.module.scss'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


import { ShopXButtonNav } from '~/components/common/index'

import { getConsumer, getNotificationListByUniqueNo } from '~/lib/shopApi'
import { getProducer } from '~/lib/producerApi'
import { getLoginUserType } from '~/lib/loginApi'

import { ToastContainer, toast } from 'react-toastify'     //토스트

export default class NotificationList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loginUser : null,
            notificationList: undefined,
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {

        const loginUserType = await getLoginUserType();

        let loginUser; // = await getConsumer();

        if(loginUserType.data == 'consumer') {
            loginUser = await getConsumer();
        } else if (loginUserType.data == 'producer') {
            loginUser = await getProducer();
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })

        this.getNotificationList();
    }

    getNotificationList = async () => {

        if(this.state.loginUserType === "consumer") {

            let params = {
                uniqueNo: this.state.loginUser.consumerNo,
                userType: this.state.loginUserType
            }

            const {data: notificationList} = await getNotificationListByUniqueNo(params);

            this.setState({
                notificationList: notificationList
            })
        }

        if(this.state.loginUserType === "producer") {

            let params = {
                uniqueNo: this.state.loginUser.producerNo,
                userType: this.state.loginUserType
            }

            const {data: notificationList} = await getNotificationListByUniqueNo(params);

            this.setState({
                notificationList: notificationList
            })
        }
    }


    render() {
        const data = this.state.notificationList;
        return(
            <Fragment>
                <ShopXButtonNav fixed back history={this.props.history}>알림</ShopXButtonNav>
                <Container fluid>
                <Row>
                    <Col style={{padding:0, margin:0}}>
                        {
                            (data && data.length !== 0) ?
                                data.map(({notificationNo, title, body, uniqueNo, userType, notificationType, notificationDate}, index)=>{
                                    return (
                                        <div className={Style.wrap} key={'notificationList'+index}>
                                            <section className={Style.sectionContent}>
                                                <div className='flex-grow-1'>
                                                    <div className={'d-flex'}>
                                                        <div style={{minWidth:'60px'}}>[{title}]</div>
                                                        {/*<div className={'ml-1 mr-1'}> </div>*/}
                                                        <div className='ml-1'>{body}</div>
                                                    </div>
                                                </div>
                                                {/*<div className={Style.listDetail}>*/}
                                                    {/*<div><FontAwesomeIcon icon={faAngleRight} /></div>*/}
                                                {/*</div>*/}
                                            </section>
                                            <section className={Style.sectionDate}>
                                                <div>
                                                    <small>Blocery</small>
                                                    <small>{notificationDate ? ' | '+ComUtil.utcToString(notificationDate):null}</small>
                                                </div>
                                            </section>
                                        </div>
                                    )
                                })
                            :
                                <div className='w-100 h-100 bg-light d-flex justify-content-center align-items-center p-5 text-dark'>{(data===undefined)?'':'알림내역이 없습니다.'}</div>
                        }
                    </Col>
                </Row>
                </Container>

            </Fragment>
        )
    }
}