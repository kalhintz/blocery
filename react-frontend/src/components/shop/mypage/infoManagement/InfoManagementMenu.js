import React, { Component, Fragment } from 'react'
import { Container, ListGroup, ListGroupItem, Button } from 'reactstrap'

import { getConsumerByConsumerNo } from '../../../../lib/shopApi'
import { doLogout } from '../../../../lib/loginApi'
import { Webview } from '../../../../lib/webviewApi'

import { faUserAlt, faEnvelope, faUserEdit, faAngleRight, faHome, faLock, faWallet, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ShopXButtonNav, ModalConfirm } from '../../../common'

export default class infoManagementMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            consumerNo: 0,
            loginUser: {}
        }
    }

    async componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)
        const consumerNo = params.get('consumerNo')

        const loginUser = await getConsumerByConsumerNo(consumerNo)

        this.setState({
            consumerNo: consumerNo,
            loginUser: loginUser.data
        })
    }

    // 비밀번호 변경 클릭
    onClickValwordModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/checkCurrentValword?consumerNo='+loginUser.consumerNo+'&flag=1')
    }

    // 회원정보 수정 클릭
    onClickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/checkCurrentValword?consumerNo='+loginUser.consumerNo+'&flag=2')
    }

    // 배송지 관리
    onClickAddressModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/addressManagement?consumerNo='+loginUser.consumerNo)
    }

    // 결제비밀번호 관리
    onClickHintPassPhrase = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/checkCurrentValword?consumerNo='+loginUser.consumerNo+'&flag=3')
    }

    // 로그아웃
    onClickLogout = async (isConfirmed) => {
        console.log(isConfirmed)
        if (isConfirmed) {
            await doLogout();
            this.props.history.push('/mypage')
        }
    }

    render() {
        return(
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack> 정보관리 </ShopXButtonNav>
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
                            <div className={'flex-grow-1'}>
                                <div>비밀번호 변경</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>로그인 비밀번호 변경</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem onClick={this.onClickHintPassPhrase}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}><FontAwesomeIcon icon={faWallet} size={'1x'} /></div>

                            <div className={'flex-grow-1'}>
                                <div>결제 비밀번호 관리</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>블록체인 비밀번호 확인</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'><FontAwesomeIcon icon={faAngleRight} /></div>
                        </div>
                    </ListGroupItem>
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
