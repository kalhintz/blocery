import React, { Component, Fragment } from 'react'
import { Container, ListGroup, ListGroupItem, Button } from 'reactstrap'

import { getBuyerByBuyerNo } from '~/lib/b2bShopApi'
import { doB2bLogout } from '~/lib/b2bLoginApi'
import { Webview } from '~/lib/webviewApi'

import { faUserAlt, faEnvelope, faUserEdit, faAngleRight, faHome, faLock, faWallet, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { B2bShopXButtonNav, ModalConfirm } from '../../../common'

export default class infoManagementMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            buyerNo: 0,
            loginUser: {}
        }
    }

    async componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)
        const buyerNo = params.get('buyerNo')

        const loginUser = await getBuyerByBuyerNo(buyerNo)

        this.setState({
            buyerNo: buyerNo,
            loginUser: loginUser.data
        })
    }

    // 비밀번호 변경 클릭
    onClickValwordModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/checkCurrentValword?buyerNo='+loginUser.buyerNo+'&flag=1')
    }

    // 회원정보 수정 클릭
    onClickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/checkCurrentValword?buyerNo='+loginUser.buyerNo+'&flag=2')
    }

    // 배송지 관리
    onClickAddressModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/addressManagement?buyerNo='+loginUser.buyerNo)
    }

    // 결제비밀번호 관리
    onClickHintPassPhrase = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/b2b/mypage/checkCurrentValword?buyerNo='+loginUser.buyerNo+'&flag=3')
    }

    // 로그아웃
    onClickLogout = async (isConfirmed) => {
        console.log(isConfirmed)
        if (isConfirmed) {
            await doB2bLogout();
            this.props.history.push('/b2b/login')
        }
    }

    render() {
        return(
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} historyBack> 정보관리 </B2bShopXButtonNav>
                <div className={'m-3'}><h6 className='font-weight-border'>회원정보</h6></div>
                <ListGroup flush>
                    <ListGroupItem><FontAwesomeIcon className={'mr-2'} icon={faUserAlt} />{this.state.loginUser.name}</ListGroupItem>
                    <ListGroupItem><FontAwesomeIcon className={'mr-2'} icon={faEnvelope} />{this.state.loginUser.email}</ListGroupItem>
                </ListGroup>

                <br/>

                <div className={'m-3'}><h6 className='font-weight-border'>개인정보 관리</h6></div>
                <ListGroup flush>
                    <ListGroupItem onClick={this.onClickInfoModify}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faUserEdit} size={'1x'} /></div>
                            <div className={'flex-grow-1'}>
                                <div>개인정보 수정</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>휴대전화 등 내 정보 변경</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem onClick={this.onClickAddressModify}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faHome} size={'1x'} /></div>
                            <div className={'flex-grow-1'}>
                                <div>배송지 관리</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>내가 저장한 배송지 확인 및 변경</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem onClick={this.onClickValwordModify}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faLock} size={'1x'} /></div>
                            <div className={'flex-grow-1'}>비밀번호 변경</div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem onClick={this.onClickHintPassPhrase}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faWallet} size={'1x'} /></div>
                            <div className={'flex-grow-1'}>결제 비밀번호 관리</div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                </ListGroup>

                <br/>

                <ListGroup flush>
                    <ListGroupItem>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faSignOutAlt} size={'1x'} /></div>
                            <div className={'flex-grow-1'}>
                                <ModalConfirm title={'로그아웃'} content={'로그아웃 하시겠습니까?'} onClick={this.onClickLogout}>
                                    <div>로그아웃</div>
                                </ModalConfirm>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                </ListGroup>
                <hr className={'p-0 m-0'}/>



            </Fragment>
        )
    }
}
