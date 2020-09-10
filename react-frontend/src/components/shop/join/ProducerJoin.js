import React, { Component, Fragment } from 'react';
import { Col, Button, FormGroup, Label, Input, Container, InputGroup, Row, Fade, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { getProducerEmail, addProducer } from "../../../lib/producerApi"


import Terms from '../../common/Terms/Terms'
import { ShopXButtonNav } from '../../common/index'
import { PassPhrase } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import ComUtil from '~/util/ComUtil'
import { Webview } from "~/lib/webviewApi";


export default class ProducerJoin extends Component{

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            valword: '',
            name: '',
            passPhrase: '',
            passPhraseCheck: '',
            farmName: '',
            coRegistrationNo: '',
            address: '',
            checkbox0: false,
            checkbox1: false,
            fadeEmail: false,
            fadeOverlapEmail: false,
            fadeValword: false,
            fadeValwordCheck: false,
            fadeCoNo: false,
            fadePassPhraseCheck: false,
            modalPassPhrase: false,
            modalPassPhraseCheck: false,
            terms: [{name:'checkbox0', title:'이용약관', content:'이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다. 이용약관내용입니다.'},
                {name:'checkbox1', title:'개인정보 취급방침', content:'개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다. 개인정보 취급방침 내용입니다.'}]
        }
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
        const response = await getProducerEmail(email)
        if (response.data == '' || response.data == null) {
            this.setState({ fadeOverlapEmail: false })
        } else {
            this.setState({ fadeOverlapEmail: true })
        }
    }

    // email regex
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

    // 사업자등록번호가 10자리인지 체크
    coRegistrationNoCheck = (e) => {
        if (e.target.value.length !== 10 || !ComUtil.onlyNumber(e.target.value)) {
            this.setState({ fadeCoNo: true})
        } else {
            this.setState({ fadeCoNo: false})
        }
    }

    // 입력한 블록체인 비밀번호와 일치하는지 체크
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

    // 회원가입버튼 클릭시 호출하는 validation api
    registProducer = async (state) => {
        this.notify('가입 중입니다. 잠시 기다려주세요', toast.success);

        const response = await addProducer(state)
        // if(response.data === 100) {
        //     alert('가입 오류입니다. 잠시 후 다시 시도해주세요.');
        //     return false;
        // }
        if(response.data === -1) {
            alert('이미 등록된 아이디(이메일)입니다.');
            return false;
        } else {
            let producerNo = response.data;
            Webview.updateFCMToken({userType: 'producer', userNo: producerNo});

            //alert('가입이 정상처리되었습니다.');
            this.props.history.push('/joinComplete?name='+state.name+'&email='+state.email+'&farmName='+state.farmName+'&coRegistrationNo='+state.coRegistrationNo);
        }
    }

    // 회원가입버튼 클릭
    onRegisterClick = () => {
        const state = Object.assign({}, this.state)

        if(state.email == '' || state.valword == '' || state.name == '' || state.farmName == '' || state.coRegistrationNo == '' ||
            state.coRegistrationNo.length !== 10 || state.fadeEmail || state.fadeOverlapEmail || state.fadeValword || state.fadeValwordCheck) {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }
        if(state.passPhrase.length !== 6 || state.fadePassPhraseCheck) {
            alert('블록체인 비밀번호를 정확하게 입력해주세요.')
            return false;
        }
        if(!state.checkbox0 || !state.checkbox1) {
            alert('약관 동의는 필수사항입니다.')
            return false;
        }

        //가입후 자동로그인 용.
        localStorage.setItem('userType', 'producer');
        localStorage.setItem('email', state.email);
        localStorage.setItem('valword', ComUtil.encrypt(state.valword));

        this.registProducer(state);
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

    render(){
        const data = Object.assign({}, this.state)
        return(
            <Fragment>
                <ShopXButtonNav back history={this.props.history}>생산자 회원가입</ShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>아이디</Label>
                                <InputGroup>
                                    <Input name="email" value={this.state.email} placeholder="아이디(이메일)" onBlur={this.emailCheck} onChange={this.handleChange} />
                                </InputGroup>
                                {
                                    this.state.fadeEmail && <Fade in className={'text-danger'}>이메일 형식을 다시 확인해주세요.</Fade>
                                }
                                {
                                    this.state.fadeOverlapEmail && <Fade in className={'text-danger'}>이미 사용중인 이메일입니다.</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="valword" value={this.state.valword} placeholder="영문자, 숫자, 특수문자 필수조합 8~16자" onBlur={this.valwordRegexCheck} onChange={this.handleValwordChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValword && <Fade in className={'text-danger'}>8~16자 영문자, 숫자, 특수문자를 필수 조합해서 사용하세요</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <InputGroup>
                                    <Input type="password" name="valwordCheck" placeholder="비밀번호 확인" onBlur={this.valwordCheck} onChange={this.handleChange} />
                                </InputGroup>
                                {
                                    this.state.fadeValwordCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                }
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>생산자 이름</Label>
                                <InputGroup>
                                    <Input name="name" value={this.state.name} placeholder="생산자 이름" onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>업체명</Label>
                                <InputGroup>
                                    <Input name="farmName" value={this.state.farmName} placeholder="업체명(농장명)" onChange={this.handleChange} />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>사업자등록번호</Label>
                                <InputGroup>
                                    <Input name="coRegistrationNo" value={this.state.coRegistrationNo} placeholder="'-'제외한 숫자만 입력해주세요(10자리)" onBlur={this.coRegistrationNoCheck} onChange={this.handleChange} maxLength={10} />
                                </InputGroup>
                                {
                                    this.state.fadeCoNo && <Fade in className={'text-danger'}>'-'제외한 숫자 10자리 입력해주세요</Fade>
                                }
                            </FormGroup>
                        </Col>
                    </Row>
                    <h6>필수항목 정보를 정확하게 입력해주세요</h6>
                    <br />
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>블록체인 비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="passPhrase" readOnly value={this.state.passPhrase}  onClick={this.modalPassPhrase} placeholder="블록체인 비밀번호(숫자6자리)" maxLength="6" />
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <FormGroup>
                                <InputGroup>
                                    <Input type="password" name="passPhraseCheck" readOnly value={this.state.passPhraseCheck} placeholder="블록체인 비밀번호 확인" onClick={this.modalPassPhraseCheck} maxLength="6" />
                                </InputGroup>
                                {
                                    this.state.fadePassPhraseCheck && <Fade in className={'text-danger'}>비밀번호가 일치하지 않습니다.</Fade>
                                }

                            </FormGroup>
                        </Col>
                    </Row>
                    <h6>BLS/BLCT 환전시 사용할 비밀번호를 숫자 6자리로 입력하세요.</h6>
                    <h6><span className={'text-danger'}>(블록체인 특성상 블록체인 비밀번호는 변경이 불가능합니다. 분실 또는 유출되지 않도록 주의해주세요)</span></h6>

                    <Terms data={this.state.terms} onClickCheck={this.handleCheckbox} onCheckAll={this.onChangeCheckAll} />

                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.onRegisterClick}>회원가입</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>

                <ToastContainer/>

                {/* 블록체인 비밀번호용 modal */}
                <Modal isOpen={this.state.modalPassPhrase} centered>
                    <ModalHeader toggle={this.modalToggle}>블록체인 비밀번호</ModalHeader>
                    <ModalBody className={'p-0'}>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6)?false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

                {/* 블록체인 비밀번호 확인용 modal */}
                <Modal isOpen={this.state.modalPassPhraseCheck} centered>
                    <ModalHeader toggle={this.modalToggleCheck}>블록체인 비밀번호 확인</ModalHeader>
                    <ModalBody className={'p-0'}>
                        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhraseCheck}></PassPhrase>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhraseCheck.length === 6)?false:true}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggleCheck}>취소</Button>
                    </ModalFooter>
                </Modal>

            </Fragment>

        );
    }
}