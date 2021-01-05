import React, { Component, Fragment } from 'react';
import { Button, FormGroup, InputGroup, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { doKakaoConsumer } from "~/lib/loginApi";
import { PassPhrase } from '~/components/common'
import {Div, Span, Input as StyledInput} from '~/styledComponents/shared'
import { ToastContainer, toast } from 'react-toastify'  //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from "~/lib/webviewApi";
const Star = () => <span className='text-danger'>*</span>

export default class ConsumerKakaoJoin extends Component{
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: props.kakaoJoinInfo.consumer.consumerNo,
            token: props.kakaoJoinInfo.consumer.token,
            email: props.kakaoJoinInfo.consumer.email||'',
            name: props.kakaoJoinInfo.consumer.name||'',
            phone: props.kakaoJoinInfo.consumer.phone||'',
            passPhrase: '',
            passPhraseCheck: '',
            fadePassPhraseCheck: false,
            modalPassPhrase: false,
            modalPassPhraseCheck: false
        };
    }

    // element의 값이 체인지될 때
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 입력한 결제 비밀번호와 일치하는지 체크
    passPhraseCheck = () => {
        if(this.state.passPhraseCheck !== this.state.passPhrase) {
            this.setState({ fadePassPhraseCheck: true })
        } else {
            this.setState({ fadePassPhraseCheck: false })
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }
    // kakao 회원가입버튼 클릭시 호출하는 api
    registConsumer = async (state) => {
        this.notify('가입 중입니다. 잠시 기다려주세요', toast.success);
        const saveState = Object.assign({}, this.state)
        const params = {
            consumerNo:saveState.consumerNo,
            passPhrase:saveState.passPhrase
        }
        const {data:res} =  await doKakaoConsumer(params);

        if(res  > 0) {
            const v_ConsumerNo = res;
            localStorage.removeItem('authType');
            localStorage.removeItem('userType');
            localStorage.removeItem('account'); //geth Account
            localStorage.removeItem('token'); //geth Account

            localStorage.setItem('authType', 1);
            localStorage.setItem('userType', 'consumer');
            localStorage.setItem('token', saveState.token);
            localStorage.setItem('autoLogin', 1);
            sessionStorage.setItem('logined', 1); //1 : true로 이용중

            Webview.updateFCMToken({userType: 'consumer', userNo: v_ConsumerNo})

            const consumerInfo = {
                name:saveState.name,
                email:saveState.email
            }
            this.props.kakaodoJoinSuccessed(consumerInfo);
        }

    }

    // 회원가입버튼 클릭
    onRegisterClick = () => {
        const state = Object.assign({}, this.state)

        if(state.name.length == 0){
            alert('이름이 존재하지 않으면 회원가입을 하실수 없습니다!, 카카오계정의 닉네임를 등록해 주세요!')
            return false;
        }

        if(state.phone.length == 0){
            alert('휴대전화가 존재하지 않으면 회원가입을 하실수 없습니다!, 카카오계정의 연락처를 등록해 주세요!')
            return false;
        }

        if(state.passPhrase.length != 6 || state.fadePassPhraseCheck) {
            alert('결제 비밀번호를 정확하게 입력해주세요.')
            return false;
        }

        if(state.passPhraseCheck.length != 6){
            alert('결제 비밀번호 확인를 정확하게 입력해주세요.')
            return false;
        }

        this.registConsumer(state);
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modalPassPhrase: !prevState.modalPassPhrase
        }));
    };

    modalToggleCheck = () => {
        this.setState(prevState => ({
            modalPassPhraseCheck: !prevState.modalPassPhraseCheck
        }))
    }

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase:false
        });
    };

    onPassPhraseCheck = (passPhrase) => {
        this.setState({
            passPhraseCheck: passPhrase,
            clearPassPhrase:false
        });
    };

    modalPassPhrase = () => {
        this.setState({
            modalPassPhrase: true
        })
    }

    modalPassPhraseCheck = () => {
        this.setState({
            modalPassPhraseCheck: true
        })
    }

    modalToggleOk = () => {
        if(this.state.modalPassPhrase == true) {
            this.setState({
                modalPassPhrase: false
            });
        } else {
            this.setState({
                modalPassPhraseCheck: false
            });
        }
        if(this.state.passPhrase && this.state.passPhraseCheck) {
            this.passPhraseCheck();
        }
    }

    stayNoti = () => {
        this.setState(prevState => ({
            modalPush: !prevState.modalPush,
            receivePush: true
        }));
    }

    render(){
        return(
            <Fragment>
                <Div>
                    <Div mb={40} bg={'background'} rounded={10} p={16}>
                        <Div textAlign={'center'} mb={16}>
                            <b>카카오 계정</b>
                        </Div>
                        <Div mb={20}>
                            <Div mb={5} fontSize={18.5}>이름<Star/></Div>
                            <Div fontSize={15}>{this.state.name}</Div>
                        </Div>
                        <Div mb={20}>
                            <Div mb={5} fontSize={18.5}>전화번호<Star/></Div>
                            <Div fontSize={15}>
                                {this.state.phone ? this.state.phone:<Span fg={'danger'}>전화번호 없음</Span>}
                            </Div>
                        </Div>
                        <Div>
                            <Div mb={5} fontSize={18.5}>이메일</Div>
                            <Div fontSize={15}>{this.state.email}</Div>
                        </Div>
                    </Div>
                    <Div>
                        <Div mb={20}>
                            <Div mb={5} fontSize={18.5}>결제 비밀번호<Star/></Div>
                            <Div fontSize={15}>
                                <FormGroup>
                                    <InputGroup>
                                        <StyledInput underLine block type="password" readOnly name="passPhrase" value={this.state.passPhrase} onClick={this.modalPassPhrase} placeholder="결제 비밀번호(숫자6자리)" maxLength="6" />
                                    </InputGroup>
                                </FormGroup>
                            </Div>
                        </Div>
                        <Div mb={20}>
                            <Div mb={5} fontSize={18.5}>결제 비밀번호 확인</Div>
                            <Div fontSize={15}>
                                <FormGroup>
                                    <InputGroup>
                                        <StyledInput underLine block type="password" readOnly name="passPhraseCheck" value={this.state.passPhraseCheck} placeholder="결제 비밀번호 확인" onClick={this.modalPassPhraseCheck} maxLength="6" />
                                    </InputGroup>

                                    <p>
                                        <div className='small text-info'>
                                            상품 구매시 사용할 결제 비밀번호 입니다.
                                        </div>
                                        <div className='small text-danger'>
                                            블록체인 특성상 결제 비밀번호는 변경이 불가능합니다. 분실 또는 유출되지 않도록 주의해주세요.
                                        </div>
                                    </p>
                                    {
                                        this.state.fadePassPhraseCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                    }
                                </FormGroup>
                            </Div>
                        </Div>
                        <Div>
                            <Button block color={'info'}
                                    onClick={this.onRegisterClick}
                                    disabled={this.state.phone ? false:true }
                            >
                                회원가입 {!this.state.phone && '(전화번호 필요)' }
                            </Button>
                        </Div>
                    </Div>

                </Div>

                {/* 결제비밀번호용 modal */}
                <Modal isOpen={this.state.modalPassPhrase} centered>
                    <ModalHeader toggle={this.modalToggle}>결제 비밀번호</ModalHeader>
                    <ModalBody className={'p-0'}>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 결제비밀번호 확인용 modal */}
                <Modal isOpen={this.state.modalPassPhraseCheck} centered>
                    <ModalHeader toggle={this.modalToggleCheck}>결제 비밀번호 확인</ModalHeader>
                    <ModalBody className={'p-0'}>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhraseCheck}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhraseCheck.length === 6) ? false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggleCheck}>취소</Button>
                    </ModalFooter>
                </Modal>

                <ToastContainer/>

            </Fragment>

        );
    }
}