import React, { Component, Fragment } from 'react';
import { Col, Button, FormGroup, Label, Input, Container, InputGroup, Row, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { addConsumer, getConsumerEmail } from "~/lib/shopApi";
import { PassPhrase } from '../../common'
import { ShopXButtonNav } from '../../common'
import Terms from '../../common/Terms/Terms'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import ComUtil from '~/util/ComUtil'
import {FaMobileAlt} from 'react-icons/fa'
import { smsSend, smsConfirm } from '~/lib/smsApi'
import { Webview } from "~/lib/webviewApi";
import { B2cPrivatePolicy, B2cTermsOfUse } from '~/components/common/termsOfUses'
import { SwitchButton } from '~/components/common/switchButton'

import Css from './Join.module.scss'

const Star = () => <span className='text-danger'>*</span>

export default class ConsumerJoin extends Component{
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            valword: '',
            name: '',
            // nickname: '',
            passPhrase: '',
            passPhraseCheck: '',
            checkbox0: false,
            checkbox1: false,
            fadeEmail: false,
            fadeOverlapEmail: false,
            fadeValword: false,
            fadeValwordCheck: false,
            fadePassPhraseCheck: false,
            fadeSmsCheck: false,
            smsCheckOk: false,
            modalPassPhrase: false,
            modalPassPhraseCheck: false,
            modalPush: false,
            terms: [
                {name:'checkbox0', title:'이용약관', content:<B2cTermsOfUse/>},
                {name:'checkbox1', title:'개인정보 처리방침', content:<B2cPrivatePolicy/>
                }],
            receivePush: true
        };
    }

    componentWillMount() {
        // this.tokenGethSC = new TokenGethSC();
        // this.tokenGethSC.initContract('/BloceryTokenSC.json');
    }

    // element의 값이 체인지될 때
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    findOverlapEmail = async (email) => {
        const response = await getConsumerEmail(email)
        if (response.data === '' || response.data == null) {
            this.setState({ fadeOverlapEmail: false })
        } else {
            this.setState({ fadeOverlapEmail: true })
        }
    }

    // email regex(정규식체크, DB에 존재여부 확인)
    emailCheck = (e) => {
        if(!ComUtil.emailRegex(e.target.value)) {
            this.setState({ fadeEmail: true })
        } else {
            this.setState({ fadeEmail: false })
        }

        // db에 이미 있는 아이디인지 체크
        this.findOverlapEmail(e.target.value)
    }

    // valword regex
    valwordRegexCheck = (e) => {
        //console.log('val: onBlur:' + e.target.value );
        if (!ComUtil.valwordRegex(e.target.value)) {
            this.setState({ fadeValword: true })
        } else {
            this.setState({ fadeValword: false })
        }
    }

    handleValwordChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
        //비밀번호가 틀린 상황이면.. RegexCheck 이중화..
        if (this.state.fadeValword) {
            //console.log('val: wrong-onChange:' + e.target.value)
            this.valwordRegexCheck(e);
        }
    }

    // 입력한 비밀번호와 일치하는지 체크
    valwordCheck = (e) => {
        if (e.target.value !== this.state.valword) {
            this.setState({ fadeValwordCheck: true })
        } else {
            this.setState({ fadeValwordCheck: false })
        }
    }

    // 입력한 결제 비밀번호와 일치하는지 체크
    passPhraseCheck = () => {
        if(this.state.passPhraseCheck !== this.state.passPhrase) {
            this.setState({ fadePassPhraseCheck: true })
        } else {
            this.setState({ fadePassPhraseCheck: false })
        }
    }

    // checkbox 클릭시
    handleCheckbox = (e, index) => {
        this.setState({
            [e[index].name]: e[index].checked
        })
    }

    // 약관 전체동의 check/uncheck
    onChangeCheckAll = (e) => {
        this.setState({
            checkbox0: e.target.checked,
            checkbox1: e.target.checked
        })
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }
    // 회원가입버튼 클릭시 호출하는 api
    registConsumer = async (state) => {
        this.notify('가입 중입니다. 잠시 기다려주세요', toast.success);

        const saveState = Object.assign({}, this.state)
        saveState.phone = ComUtil.phoneRegexChange(state.phone)

        const response = await addConsumer(saveState);
        if(response.data === -3) {
            alert('관리자에게 가입문의하시길 바랍니다!');
            return false;
        }
        if(response.data === -2) {
            alert('필수입력값이 존재하지 않습니다!!');
            return false;
        }

        if(response.data === -1) {
            alert('이미 등록된 아이디(이메일)입니다.');
            return false;
        } else {
            let consumerNo = response.data;
            Webview.updateFCMToken({userType: 'consumer', userNo: consumerNo})

            //alert('가입이 정상처리되었습니다.');
            this.props.history.push('/joinComplete?name='+saveState.name+'&email='+saveState.email);
        }
    }

    // 회원가입버튼 클릭
    onRegisterClick = () => {
        const state = Object.assign({}, this.state)

        if(state.email === '' || state.valword === '' || state.name === '' || state.fadeEmail || state.fadeOverlapEmail || state.fadeValword || state.fadeValwordCheck) {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }

        if(!state.phone || !state.smsCheckOk) {
            alert('휴대전화 본인인증을 수행해 주세요')
            return false;
        }

        if(state.passPhrase.length != 6 || state.fadePassPhraseCheck) {
            alert('결제 비밀번호를 정확하게 입력해주세요.')
            return false;
        }
        if(!state.checkbox0 || !state.checkbox1) {
            alert('약관 동의는 필수사항입니다.')
            return false;
        }

        //가입후 자동로그인 용.
        localStorage.setItem('userType', 'consumer');
        localStorage.setItem('email', state.email);
        localStorage.setItem('valword', ComUtil.encrypt(state.valword));
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


    onSmsSend = async() => {
        if (!this.state.phone || this.state.phone.length < 10){
            alert('휴대폰 번호를 확인해 주세요')
        }
        else {
            let {data:result} =  await smsSend('consumer', this.state.phone);
            console.log(result);
            if(result === 300) {
                alert('이미 회원가입이 되어있는 휴대전화 번호입니다. ')
            } else if (result === 200) {
                alert(this.state.phone + ' 번호로 인증번호를 전송 중입니다.')
            } else {
                alert('실행중 오류가 발생하였습니다 다시 한번 시도해주세요. ')
            }
        }
    };

    // * @return 200 - 확인 OK  (확인성공시 db)
    //           100 - 확인 실패
    //           400 - 확인 3번연속 실패 -삭제 되었으니 다시 인증해 주세요
    onSmsConfirm = async () => {

        let {data:confirmCode} = await smsConfirm(this.state.phone, this.state.code);

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
        }
        else if (confirmCode == 400) {
            alert(' 인증코드가 만료되었습니다. 인증번호 받기를 다시 해주세요')
            this.setState({
                code:'',
                fadeSmsCheck: true
            });
        }
    };

    // push 알림 수신 on/off
    pushChange = () => {
        this.setState({
            receivePush: !this.state.receivePush
        })
        this.pushModal();
    }

    pushModal = () => {
        if (this.state.receivePush)
            this.setState({modalPush: true})
    }

    stayNoti = () => {
        this.setState(prevState => ({
            modalPush: !prevState.modalPush,
            receivePush: true
        }));
    }

    cancelNoti = () => {
        this.setState({
            modalPush: false,
            receivePush: false
        })
    }


    render(){
        return(
            <Fragment>
                <ShopXButtonNav backClose>소비자 회원가입</ShopXButtonNav>
                <div className={Css.wrap}>
                    <div className='m-3'>
                        <Container fluid>
                            <Row>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <Label className='lead'>아이디<Star/></Label>
                                        <InputGroup>
                                            <Input name="email" value={this.state.email} placeholder="아이디(이메일)" onBlur={this.emailCheck} onChange={this.handleChange} />
                                        </InputGroup>
                                        {
                                            this.state.fadeEmail && <Fade in className={'text-danger small'}>이메일 형식을 다시 확인해주세요.</Fade>
                                        }
                                        {
                                            this.state.fadeOverlapEmail && <Fade in className={'text-danger small'}>이미 사용중인 이메일입니다.</Fade>
                                        }
                                    </FormGroup>
                                </Col>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <Label className='lead'>비밀번호<Star/></Label>
                                        <InputGroup>
                                            <Input type="password" name="valword" value={this.state.valword} placeholder="영문자, 숫자, 특수문자 필수조합 8~16자리" onBlur={this.valwordRegexCheck} onChange={this.handleValwordChange} />
                                        </InputGroup>
                                        {
                                            this.state.fadeValword && <Fade in className={'text-danger small'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <InputGroup>
                                            <Input type="password" name="valwordCheck" placeholder="비밀번호 확인" onBlur={this.valwordCheck} onChange={this.handleChange} />
                                        </InputGroup>
                                        {
                                            this.state.fadeValwordCheck && <Fade in className={'text-danger small'}>비밀번호가 일치하지 않습니다.</Fade>
                                        }
                                    </FormGroup>
                                </Col>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <Label className='lead'>이름<Star/></Label>
                                        <InputGroup>
                                            <Input name="name" value={this.state.name} placeholder="이름" onChange={this.handleChange} />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                                {/*<Col xs={12}>*/}
                                {/*<FormGroup>*/}
                                {/*<Label>닉네임</Label>*/}
                                {/*<InputGroup>*/}
                                {/*<Input name="nickname" value={this.state.nickname} placeholder="닉네임" onChange={this.handleChange} />*/}
                                {/*</InputGroup>*/}
                                {/*</FormGroup>*/}
                                {/*</Col>*/}
                            </Row>



                            <span className='lead'>휴대전화 본인인증<Star/></span>
                            <div className={'d-flex'}>
                                <div className={'d-flex justify-content-center align-items-center'}><FaMobileAlt className={'mr-2'} /></div>
                                <Input type="number" name="phone" value={this.state.phone} placeholder="전화번호 입력('-'제외)" onChange={this.handleChange}></Input>
                                <Button outline size={'sm'} style={{width:'180px'}} onClick={this.onSmsSend}>인증번호 받기</Button>
                            </div>
                            <div className={'d-flex mt-1'}>
                                <div className={'d-flex justify-content-center align-items-center'}><FaMobileAlt className={'mr-2'} /></div>
                                <Input type="number" name="code" value={this.state.code} placeholder="인증번호 입력" onChange={this.handleChange} />
                                <Button outline size={'sm'} style={{width:'180px'}} onClick={this.onSmsConfirm}>인증번호 확인</Button>
                            </div>
                            {
                                this.state.fadeSmsCheck && <Fade in className={'text-danger'}>휴대전화 본인인증이 일치하지 않습니다.</Fade>
                            }

                            <br />
                            <Row>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <Label className='lead'>결제 비밀번호<Star/></Label>
                                        <InputGroup>
                                            <Input type="password" readOnly name="passPhrase" value={this.state.passPhrase} onClick={this.modalPassPhrase} placeholder="결제 비밀번호(숫자6자리)" maxLength="6" />
                                        </InputGroup>
                                    </FormGroup>
                                </Col>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <InputGroup>
                                            <Input type="password" readOnly name="passPhraseCheck" value={this.state.passPhraseCheck} placeholder="결제 비밀번호 확인" onClick={this.modalPassPhraseCheck} maxLength="6" />
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
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <hr/>

                    <div className='m-3'>
                        <Container>
                            <Row>
                                <Col xs={12}>
                                    <div className='d-flex align-items-center'>
                                        <div className='lead'>
                                            알림 수신
                                        </div>
                                        <div className='ml-auto d-flex align-items-center'>
                                            <SwitchButton checked={this.state.receivePush} onChange={this.pushChange} />
                                        </div>
                                    </div>
                                    <p>
                                        <span className='text-secondary f6'>※ 알림수신에 동의를 하시면, 마켓블리에서 제공하는 다양한 혜택 및 배송 관련 알림을 받을 수 있습니다.</span>
                                    </p>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <hr/>
                    <div className='m-3'>
                        <Container>
                            <Row>
                                <Col xs={12}>
                                    <div className='lead'>
                                        약관동의
                                    </div>
                                    <p>
                                        <Terms data={this.state.terms} onClickCheck={this.handleCheckbox} onCheckAll={this.onChangeCheckAll} />
                                    </p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={12} className='pb-3'>
                                    <FormGroup>
                                        <Button block color={'info'} onClick={this.onRegisterClick}>회원가입</Button>
                                    </FormGroup>
                                </Col>
                            </Row>
                        </Container>
                    </div>

                </div>


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

                {/* push알림 수신동의용 modal */}
                <Modal isOpen={this.state.modalPush} centered>
                    <ModalBody className='text-center'>알림 수신 동의 해제 시 <br/> 주요 소식 및 혜택을 받아 보실 수 없습니다.<br/><br/>
                        <span className='text-secondary text-center'>알림 받기를 유지하시겠습니까?</span>
                    </ModalBody>
                    <ModalFooter>
                        <Button block outline size='sm' color='info' className='m-1' onClick={this.stayNoti}>알림 유지</Button>
                        <Button block outline size='sm' color='secondary' className='m-1' onClick={this.cancelNoti}>알림 해제</Button>
                    </ModalFooter>
                </Modal>
                <ToastContainer/>

            </Fragment>

        );
    }
}