import React, { Component, Fragment } from 'react'
import { Container, Button, Row, Col, Form, Input, Modal, ModalHeader, ModalBody, ModalFooter, Fade } from 'reactstrap'
import axios from 'axios'
import { Server } from '../../Properties'
import ComUtil from '../../../util/ComUtil'
import { Redirect } from 'react-router-dom'
import { MarketBlyLogoColorRectangle } from '../../common'
import Style from './WebLogin.module.scss'
import ModalPopup from "../../common/modals/ModalPopup";
import {getProducerEmail} from "../../../lib/producerApi";
import {resetPassword} from "../../../lib/adminApi";
import {EMAIL_RESET_TITLE, getEmailResetContent} from "../../../lib/mailApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import classNames from 'classnames'



export default class WebLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: null,
            valword: null,
            redirectToReferrer: false,
            fadeEmail: false, //email 미입력시 에러메시지 여부
            fadeEmailType: false,
            fadePassword: false,
            fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
            autoLogin: false,
            isOpen: false
        };
        //기본 로그인 메인 페이지
        // this.targetLocation = Server.getAdminShopMainUrl();
    }

    async componentDidMount() {

        //http로 첫페이지 접속시 https로 자동전환. 20200220
        if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
            console.log('window.location.protocol:' + window.location.protocol + 'redirecting to Https');
            window.location = 'https://blocery.com/producer/webLogin';  //HARD CODING
        }
    }

    onLoginClicked = (event) => {
        event.preventDefault();

        let data = {};
        data.email = event.target[0].value;
        data.valword = event.target[1].value;
        data.userType = 'producer'

        if(!data.email) {
            this.setState({fadeEmail: true});
            return;
        }

        const emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        if (!emailRule.test(data.email)) {
            this.setState({fadeEmailType: true});
            return;
        }

        if (!data.valword) {
            this.setState({fadePassword: true});
            return;
        }

        axios(Server.getRestAPIHost() + '/login',
            {
                method: "post",
                data:data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                if (response.data.status === Server.ERROR)             //100: login ERROR
                    this.setState({fadeError: true});
                else
                {
                    let loginInfo = response.data;

                    localStorage.clear();

                    //쿠키(localStorage)에 login된 userType저장. - 필요하려나.
                    localStorage.setItem('userType', data.userType);
                    localStorage.setItem('account', loginInfo.account); //geth Account
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('valword', ComUtil.encrypt(data.valword));
                    localStorage.setItem('autoLogin', this.state.autoLogin? 1:0);

                    sessionStorage.setItem('logined', 1);
                    console.log('loginInfo : ===========================',loginInfo);
                    this.props.history.push('/producer/web/home/home')

                }
            })
            .catch(function (error) {
                console.log(error);
                alert('로그인 오류:'+error);
            });
    };

    onInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({
            [name]: value
        });
    };

    autoLoginCheck = (e) => {
        let autoLoginFlag = e.target.checked;

        this.setState({autoLogin:autoLoginFlag});
    }

    //아이디 찾기
    onIdSearchClick = () => {
        this.setState({type: 'id'})
        this.togglePopup()
    }

    //비밀번호 찾기
    onPwSearchClick = () => {
        this.setState({type: 'pw'})
        this.togglePopup()
    }

    onJoinClick = () => {
        this.props.history.push('/mypage/queInfo');
    }

    togglePopup = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    // 비밀번호 초기화 확인 클릭
    onResetValword = async() => {
        let response;
        let userType;

        response = await getProducerEmail(this.targetEmail.value);
        userType = 'producer';

        if(!response.data) {
            alert("가입정보가 없는 이메일입니다.")
        } else {
            let {data:newValword} = await resetPassword(userType, this.targetEmail.value);
            if (newValword.length === 8) {
                this.sendEmail(newValword, this.targetEmail.value);
                alert("변경된 비밀번호가 메일로 발송되었습니다. 시간이 지나도 메일이 수신되지 않을 경우 스팸메일함도 확인해주세요.");

                this.setState({
                    isOpen: !this.state.isOpen
                })
            } else {
                alert("비밀번호 찾기에 실패했습니다. 다시 시도해주세요.");
            }
        }
    }

    // 초기화된 비밀번호 메일 전송
    sendEmail = async(newValword, recipient) => {
        let data = {};

        data.recipient = recipient;
        data.subject = EMAIL_RESET_TITLE;
        data.content = getEmailResetContent(newValword);

        await axios(Server.getRestAPIHost() + '/sendmail',
            {
                method: "post",
                data: data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            });
    }

    onClose = () => {
        this.setState({
            isOpen: false
        })
    }

    render(){

        //private route 의 router 에서 넘겨주는 이동 해야 할 페이지
        // const { from } = this.props.location.state || { from: { pathname: Server.getAdminShopMainUrl() } }
        // const { redirectToReferrer } = this.state

        // if(redirectToReferrer === true){
        //     return <Redirect to={from} />
        // }

        return(
            <div className='d-flex flex-column justify-content-center align-items-center vh-100 w-100'>
                <Fragment>
                    <div style={{width: 400}}>
                        <div className='d-flex justify-content-center align-items-center'>
                            <MarketBlyLogoColorRectangle className={''} style={{textAlign:'center', width: 120, paddingTop: 10, paddingBottom: 10}}/>
                        </div>
                        <p></p>
                        <Form onSubmit={this.onLoginClicked}>

                            <Row>
                                <Col xs={12}>
                                    <Input className={classNames('rounded-0 mb-3', Style.textBox)} placeholder="생산자 아이디(이메일)"/>
                                    {
                                        this.state.fadeEmail && <CustomFade>이메일 주소를 입력해 주세요.</CustomFade>
                                    }
                                    {
                                        this.state.fadeEmailType && <CustomFade>이메일 주소를 양식에 맞게 입력해 주세요.</CustomFade>
                                    }
                                    <Input className={classNames('rounded-0 mb-3', Style.textBox)}  type="password" placeholder="비밀번호"/>
                                    {
                                        this.state.fadePassword && <CustomFade>비밀번호를 입력해 주세요.</CustomFade>
                                    }
                                    {
                                        this.state.fadeError && <CustomFade>아이디/비밀번호를 확인해 주세요.</CustomFade>
                                    }
                                    <Button type='submit' color='info' className={'rounded-0 p-2 mt-4 mb-3'} block ><span className='f17'>로그인</span></Button>

                                    <hr/>
                                    <div class='d-flex justify-content-center f13 text-secondary'>
                                        <span className='mr-2 cursor-pointer' onClick={this.onIdSearchClick}>아이디 찾기</span>
                                        <span className='mr-2'>|</span>
                                        <span className='mr-2 cursor-pointer' onClick={this.onPwSearchClick}>비밀번호 찾기</span>
                                        <span className='mr-2'>|</span>
                                        <span className='mr-2 cursor-pointer' onClick={this.onJoinClick}>생산자 입점문의</span>
                                    </div>
                                </Col>
                            </Row>

                            {/*<FormGroup row>
                                <Label for="email"><h6>이메일 ID</h6></Label>
                                <Input type="text" name="email" value={this.state.email||''} onChange={this.onInputChange}/>
                            </FormGroup>
                            <FormGroup row>
                                <Label for="password" ><h6>비밀번호</h6></Label>
                                <Input type="password" name="valword" value={this.state.valword||''} onChange={this.onInputChange} />
                            </FormGroup>
                            <FormGroup row>
                                <Button type='submit' block color='primary'> 로그인 </Button>
                            </FormGroup>*/}
                        </Form>
                    </div>

                    {
                        this.state.isOpen && this.state.type === 'id' && <ModalPopup title={'알림'} content={'가입 시 입력하신 이름을 적어 고객센터로(cs@blocery.io) 메일을 보내주시면 답신 드리도록 하겠습니다.'} onClick={this.onClose}></ModalPopup>
                    }
                    {
                        this.state.isOpen && this.state.type === 'pw' &&
                        <Modal isOpen={true} centered>
                            <ModalHeader>비밀번호 찾기</ModalHeader>
                            <ModalBody>고객님의 비밀번호를 초기화하여 결과를 이메일 발송해드립니다.</ModalBody>
                            <ModalBody>
                                <Input type="text" placeholder="Email을 입력해주세요"
                                       innerRef = {(email) => {this.targetEmail = email}}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="info" onClick={this.onResetValword}>확인</Button>
                                <Button color="secondary" onClick={this.onClose}>취소</Button>
                            </ModalFooter>
                        </Modal>
                    }
                    {
                        this.state.isOpen && this.state.type === 'join' && <ModalPopup title={'알림'} content={'지금은 생산자 모집 기간이 아닙니다'} onClick={this.onClose}></ModalPopup>
                    }
                </Fragment>
            </div>
        );
    }
}
function CustomFade(props){
    return (
        <div className='mb-3'>
            <Fade in={true} className={'small text-danger'}>{props.children}</Fade>
        </div>
    )
}