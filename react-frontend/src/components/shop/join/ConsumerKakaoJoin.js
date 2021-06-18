import React, { Component, Fragment } from 'react';
import { Button, FormGroup, InputGroup, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { doKakaoConsumer } from "~/lib/loginApi";
import {BlocerySpinner, PassPhrase} from '~/components/common'
import {Div, Flex, Span, Input as StyledInput, Button as StyledButton} from '~/styledComponents/shared'
import { ToastContainer, toast } from 'react-toastify'  //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from "~/lib/webviewApi";
import ComUtil from '~/util/ComUtil'
import {smsConfirm, smsSend} from "~/lib/smsApi";


const Star = () => <span className='text-danger'>*</span>

export default class ConsumerKakaoJoin extends Component{
    constructor(props) {
        super(props);
        this.state = {
            consumerNo: props.kakaoJoinInfo.consumer.consumerNo,
            token: props.kakaoJoinInfo.consumer.token,
            refreshToken: props.kakaoJoinInfo.consumer.refreshToken,
            email: props.kakaoJoinInfo.consumer.email||'',
            name: props.kakaoJoinInfo.consumer.name||'',
            phone: props.kakaoJoinInfo.consumer.phone||'',
            passPhrase: '',
            passPhraseCheck: '',
            fadePassPhraseCheck: false,
            modalPassPhrase: false,
            modalPassPhraseCheck: false,
            inviteCode:'',
            confirmCode: '', //휴대폰 본인인증 코드
            fadeSmsCheck: false,
            smsCheckOk: false,
            loading: false,  //스플래시 로딩용
        };
    }

    componentDidMount() {
        let inviteCode = localStorage.getItem("inviteCode");
        if (inviteCode) {
            //console.log('ConsumerKakaoJoin - inviteCode:' + inviteCode);
            //회원가입 완료 하였을때 클리어 하도록 이동
            // localStorage.removeItem("inviteCode");

            this.setState({
                inviteCode: inviteCode
            })
        }
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
        localStorage.removeItem("inviteCode");
        const saveState = Object.assign({}, this.state)

        //초대코드를 consumerNo로 변환.
        const recommenderNo = ComUtil.decodeInviteCode(saveState.inviteCode);
        //console.log('inviteCode:' + saveState.inviteCode + ' recommenderNo:' + recommenderNo);
        const params = {
            consumerNo:saveState.consumerNo,
            passPhrase:saveState.passPhrase,
            recommenderNo:recommenderNo  //consumerNo로 변환해서 전송.
        }
        this.setState({loading: true});
        const {data:res} = await doKakaoConsumer(params);
        if(res == -9){
            this.setState({loading: false});
            alert('이미 등록된 사용자입니다. 카카오로그인을 하시길 바랍니다.');
            return false;
        }
        if(res  > 0) {
            this.setState({loading: false});
            const v_ConsumerNo = res;
            localStorage.removeItem('authType');
            localStorage.removeItem('userType');
            localStorage.removeItem('account'); //geth Account
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');

            localStorage.setItem('authType', 1);
            localStorage.setItem('userType', 'consumer');
            localStorage.setItem('token', saveState.token);
            localStorage.setItem('refreshToken', saveState.refreshToken);
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

        if(!state.phone || state.phone.length === 0){
            alert('휴대전화가 존재하지 않으면 회원가입을 하실수 없습니다!, 카카오계정의 연락처를 등록해 주세요!')
            return false;
        }

        if(!state.smsCheckOk) {
            alert('휴대전화 본인인증을 수행해 주세요')
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

        // if (state.inviteCode && (state.inviteCode.length != 7 || isNaN(ComUtil.decodeInviteCode(state.inviteCode)))) {
        //     alert('입력하신 초대코드가 잘못되었습니다. 다시 확인 바랍니다.');
        //     return false;
        // }

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

    onSmsSend = async() => {
        if (!this.state.phone || this.state.phone.length < 10){
            alert('휴대폰 번호가 있어야 가입이 가능 합니다')
        }
        else {
            let {data:result} =  await smsSend('consumer',
                this.state.phone.replaceAll('-', '')
            );
            //console.log(result);
            if(result === 300) {
                alert('이미 회원가입이 되어있는 휴대전화 번호입니다. ')
            } else if (result === 200) {
                alert(this.state.phone + ' 번호로 인증번호를 전송 중입니다.')
                this.setState({
                    fadeSmsCheck: true
                })
            } else {
                alert('실행중 오류가 발생하였습니다 다시 한번 시도해주세요. ')
            }
        }
    };

    // * @return 200 - 확인 OK  (확인성공시 db)
    //           100 - 확인 실패
    //           400 - 확인 3번연속 실패 -삭제 되었으니 다시 인증해 주세요
    onSmsConfirm = async () => {

        let {data:confirmCode} = await smsConfirm(this.state.phone, this.state.confirmCode);

        if (confirmCode == 200) { //같으면 성공. state: false
            alert(' 인증코드 확인완료')
            this.setState({
                fadeSmsCheck: false,
                smsCheckOk: true
            });
        } else if (confirmCode == 100) {
            alert(' 인증코드가 일치하지 않습니다. 다시 확인해 주세요')
            this.setState({
                fadeSmsCheck: true
            });
        } else if (confirmCode == 400) {
            alert(' 인증코드가 만료되었습니다. 인증번호 받기를 다시 해주세요')
            this.setState({
                code:'',
                fadeSmsCheck: true
            });
        }
    };

    onCellAuthNoChange = ({target}) => {
        this.setState({
            confirmCode: target.value
        })
    }

    render(){
        return(
            <Fragment>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <Div>
                    <Div mb={20} bg={'background'} rounded={10} p={16}>
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
                            <Div mb={5} fontSize={18.5}>본인인증<Star/></Div>
                            <Div mb={5} fontSize={15}>
                                {this.state.phone}
                            </Div>
                            <Div fontSize={15}>
                                <FormGroup>
                                    <InputGroup>
                                        <Flex flexGrow={1}>
                                            <Div mr={'5px'} flexShrink={0}>
                                                <StyledButton height={40} px={20} block bg={'white'} bc={'dark'} onClick={this.onSmsSend}>인증번호 받기</StyledButton>
                                            </Div>
                                            <Div flexGrow={1}>
                                                <StyledInput underLine block name="confirmCode" value={this.state.cellAuthNo} onChange={this.onCellAuthNoChange} placeholder="인증 문자" />
                                            </Div>
                                        </Flex>
                                    </InputGroup>
                                </FormGroup>
                            </Div>
                        </Div>
                    </Div>

                    {
                        this.state.fadeSmsCheck && (
                            <Div mb={20}>
                                <StyledButton px={20} block bg={'white'} bc={'dark'} py={10}
                                              onClick={this.onSmsConfirm}>인증번호 확인</StyledButton>
                            </Div>
                        )
                    }

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
                        {
                            this.state.inviteCode && this.state.inviteCode === "AAAAA" ?
                                <Div mb={20}>
                                    <Div mb={5} fontSize={18.5}>초대 코드</Div>
                                    <Div fontSize={15}>
                                        <FormGroup>
                                            <InputGroup>
                                                <StyledInput underLine block type="text" name="inviteCode"
                                                             value={this.state.inviteCode}
                                                             onChange={this.handleChange}
                                                             placeholder="초대받은경우 입력(7자리)"
                                                             readOnly={true}
                                                             maxLength="7" />
                                            </InputGroup>
                                        </FormGroup>
                                    </Div>
                                </Div>:null
                        }
                        <Div>

                            {/*<Div fg={'secondary'} textAlign={'center'} mb={10}>*/}
                            {/*    친구추천 리워드 이벤트는 종료 되었습니다.*/}
                            {/*</Div>*/}

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