import React, { Component, Fragment } from 'react'
import { ListGroup, ListGroupItem } from 'reactstrap'

import { getConsumerByConsumerNo } from '~/lib/shopApi'
import {doLogout, doLogoutChannOut} from '~/lib/loginApi'

import {FaUnlink, FaUserAlt, FaEnvelope, FaUserEdit, FaAngleRight, FaHome, FaLock, FaWallet, FaSignOutAlt} from "react-icons/fa";

import { ShopXButtonNav, ModalConfirm } from '../../../common'

import { Server } from '~/components/Properties'
import { Redirect } from 'react-router-dom'


export default class infoManagementMenu extends Component {
    constructor(props) {
        super(props)
        this.state = {
            consumerNo: 0,
            loginUser: {},
            redirect: null
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
        if(localStorage.getItem('authType') == 1){
            this.props.history.push('/modifyConsumerInfo?consumerNo='+loginUser.consumerNo)
        }else{
            this.props.history.push('/mypage/checkCurrentValword?consumerNo='+loginUser.consumerNo+'&flag=2')
        }
    }

    // 배송지 관리
    onClickAddressModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/addressManagement?consumerNo='+loginUser.consumerNo)
    }

    // 결제비밀번호 관리
    onClickHintPassPhrase = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        if(localStorage.getItem('authType') == 1){
            this.props.history.push('/mypage/hintPassPhrase?consumerNo='+loginUser.consumerNo)
        }else{
            this.props.history.push('/mypage/checkCurrentValword?consumerNo='+loginUser.consumerNo+'&flag=3')
        }
    }

    // 로그아웃
    onClickLogout = async (isConfirmed) => {
        console.log(isConfirmed)
        if (isConfirmed) {
            await doLogout();
            // this.props.history.push('/mypage')
            this.setState({
                redirect: Server.getShopMainUrl()
            })
        }
    }

    // 로그아웃 (카카오채널 연결 끊기 테스트 용)
    onClickLogoutKakaoChannOut = async (isConfirmed) => {
        console.log(isConfirmed)
        if (isConfirmed) {
            await doLogoutChannOut();
            // this.props.history.push('/mypage')
            this.setState({
                redirect: Server.getShopMainUrl()
            })
        }
    }

    render() {
        if(this.state.redirect){
            return <Redirect to={this.state.redirect} />
        }
        return(
            <Fragment>
                <ShopXButtonNav underline historyBack> 정보관리 </ShopXButtonNav>
                <div className={'m-3'}><h6 className='font-weight-border'>회원정보</h6></div>
                <ListGroup flush>
                    <ListGroupItem>
                        <FaUserAlt className={'mr-2'} />{this.state.loginUser.name}
                    </ListGroupItem>
                    {
                        this.state.loginUser.email &&
                        <ListGroupItem>
                            <FaEnvelope className={'mr-2'} />{this.state.loginUser.email}
                        </ListGroupItem>
                    }
                </ListGroup>

                <br/>

                <div className={'m-3'}><h6 className='font-weight-border'>개인정보 관리</h6></div>
                <ListGroup flush>
                    <ListGroupItem onClick={this.onClickInfoModify}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                <FaUserEdit />
                            </div>
                            <div className={'flex-grow-1'}>
                                <div>개인정보 수정</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>휴대전화 등 내 정보 변경</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <FaAngleRight />
                            </div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem onClick={this.onClickAddressModify}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                <FaHome />
                            </div>
                            <div className={'flex-grow-1'}>
                                <div>배송지 관리</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>내가 저장한 배송지 확인 및 변경</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <FaAngleRight />
                            </div>
                        </div>
                    </ListGroupItem>
                    {
                        localStorage.getItem('authType') == 0 &&
                        <ListGroupItem onClick={this.onClickValwordModify}>
                            <div className={'d-flex'}>
                                <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                    <FaLock />
                                </div>
                                <div className={'flex-grow-1'}>
                                    <div>비밀번호 변경</div>
                                    <div style={{color:'gray', fontSize:'0.8em'}}>로그인 비밀번호 변경</div>
                                </div>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <FaAngleRight />
                                </div>
                            </div>
                        </ListGroupItem>
                    }
                    <ListGroupItem onClick={this.onClickHintPassPhrase}>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                <FaWallet />
                            </div>
                            <div className={'flex-grow-1'}>
                                <div>결제 비밀번호 관리</div>
                                <div style={{color:'gray', fontSize:'0.8em'}}>블록체인 비밀번호 확인</div>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <FaAngleRight />
                            </div>
                        </div>
                    </ListGroupItem>
                    <ListGroupItem>
                        <div className={'d-flex'}>
                            <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                <FaSignOutAlt />
                            </div>
                            <div className={'flex-grow-1'}>
                                <ModalConfirm title={'로그아웃'} content={'로그아웃 하시겠습니까?'} onClick={this.onClickLogout}>
                                    <div>로그아웃</div>
                                </ModalConfirm>
                            </div>
                            <div className='d-flex align-items-center justify-content-center'>
                                <FaAngleRight />
                            </div>
                        </div>
                    </ListGroupItem>
                    {
                        Server._serverMode() == 'stage' && localStorage.getItem('authType') == 1 &&
                        <ListGroupItem>
                            <div className={'d-flex'}>
                                <div className={'mr-3 d-flex align-items-center justify-content-center'}>
                                    <FaUnlink />
                                </div>
                                <div className={'flex-grow-1'}>
                                    <ModalConfirm title={'로그아웃(kakao연결해제:테스트용)'} content={'로그아웃 하시겠습니까?'} onClick={this.onClickLogoutKakaoChannOut}>
                                        <div>로그아웃(kakao연결해제:테스트용)</div>
                                    </ModalConfirm>
                                </div>
                                <div className='d-flex align-items-center justify-content-center'>
                                    <FaAngleRight />
                                </div>
                            </div>
                        </ListGroupItem>
                    }
                </ListGroup>
                <hr className={'p-0 m-0'}/>

            </Fragment>
        )
    }
}
