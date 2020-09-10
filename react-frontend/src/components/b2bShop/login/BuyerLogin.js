import React, { Component, Fragment } from 'react'
import axios from 'axios'
import { Server, Const } from '../../Properties';
import { Container, InputGroup, InputGroupAddon, InputGroupText, Input, Form, Row, Col, FormGroup, Label, Button, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import { Webview } from "../../../lib/webviewApi";
import { getBuyerEmail } from "../../../lib/b2bShopApi";
import { getSellerEmail } from "../../../lib/b2bSellerApi";
import { resetPassword } from "../../../lib/adminApi";
import { EMAIL_RESET_TITLE, getEmailResetContent } from '../../../lib/mailApi';
import { B2bShopXButtonNav, ModalAlert, ModalPopup, NiceFoodLogoColorRectangle } from '../../common'
import Style from './LoginTab.module.scss'
import ComUtil from '~/util/ComUtil'

//Tab제목
// const TabTitle = (props) => {
//     if (props.tabNumber === '1') { //소비자 Tab
//         if (props.activeTab === '1') {
//             return (
//                 <h5> <span style={{color: 'black'}}> 소비자 </span> </h5>
//             );
//         } else {                   //생산자 Tab
//             return (
//                 <h5> 소비자 </h5>
//             );
//         }
//     }
//     else {
//         if (props.activeTab === '2') {
//             return (
//                 <h5> <span style={{color: 'black'}}> 생산자 </span> </h5>
//             );
//         } else {
//             return (
//                 <h5> 생산자 </h5>
//             );
//         }
//     }
// }

//(소비자 or 생산자) 회원가입
// const JoinTitle = (props) => {
//     if (props.activeTab === '1') { //소비자 Tab
//         return (
//             <Button color='link' onClick={props.onClick}>
//                 <small> <span style={{fontWeight:'bold'}}>소비자<br/>회원가입</span> </small>
//             </Button>
//         );
//     } else {                       //생산자 Tab
//         return (
//             <Button color='link' onClick={props.onClick}>
//                 <small> <span style={{fontWeight:'bold'}}>생산자<br/>회원가입</span> </small>
//             </Button>
//         );
//     }
// }

/**
 *  소비자 로그인 / 생산자 로그인 탭 및 화면 - 공통 사용
 */

export default class BuyerLogin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: '1', //소비자탭='1', 생산자탭='2'
            fadeEmail: false, //email 미입력시 에러메시지 여부
            fadeEmailType: false,
            fadePassword: false,
            fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
            autoLogin: true,
            isOpen: false
        }
    }

    componentDidMount(){
        //http로 첫페이지 접속시 https로 자동전환
        if ( window.location.protocol === 'http:' && Server._serverMode() === 'production') {
            window.location = 'https://' + window.location.host + window.location.pathname
        }
    }

    onLoginClicked = async (event) => {

        event.preventDefault();
        //this.storage.setItem('email', 'blocery@ezfarm.co.kr')

        //Fade All reset
        this.setState({
            fadeEmail: false, fadePassword:false, fadeEmailType:false, fadeError:false
        });

        //input ERROR check
        let data = {};
        data.email = event.target[0].value.trim();
        data.valword = event.target[1].value;
        data.userType = 'buyer'

        if (!data.email) {
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

        // data.userType = (this.state.activeTab === '1')? 'consumer': 'producer';

        await axios(Server.getRestAPIHost() + '/b2b/login',
            {
                method: "post",
                data:data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                console.log(response);
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
                    //localStorage.setItem('logined', 1); //1 : true로 이용중

                    sessionStorage.setItem('logined', 1); //1 : true로 이용중

                    console.log('loginInfo : ===========================',loginInfo);
                    //self.closePopup();
                    //this.props.history.push('/')

                    Webview.updateFCMToken({userType: loginInfo.userType, userNo: loginInfo.uniqueNo})

                    //팝업에선 작동한해서 막음: Webview.loginUpdate(); //하단바 update용.
                }
            })
            .catch(function (error) {
                console.log(error);
                alert('로그인 오류:'+error);
            });

        if (!this.state.fadeError) { //로그인 성공이면
            console.log('로그인 성공');
            this.closePopup();
        }
    }

    closePopup = () => { //팝업 close는 axios와 분리.
        Webview.closePopup();  //팝업만 닫음.
        // Webview.closePopupAndMovePage('/');    //팝업닫으면서 홈으로 이동
    }

    autoLoginCheck = (e) => {
        let autoLoginFlag = e.target.checked;
        console.log('autoLoginFlag:' + autoLoginFlag);

        this.setState({autoLogin:autoLoginFlag});
    }
    //아이디 찾기
    onIdSearchClick = () => {
        //console.log('not implemented');
        this.setState({
            type: 'id'
        })
        this.togglePopup()
    }

    //비밀번호 찾기
    onPwSearchClick = () => {
        //console.log('not implemented');
        this.setState({
            type: 'pw'
        })
        this.togglePopup()
    }

    onJoinClick = () => {
        console.log(this.state.activeTab);

        if (this.state.activeTab === '1') {//소비자탭
            //this.props.history.push('/b2b/join');
            Webview.openPopup('/b2b/join');
        }
        else {                               //생산자탭
            //this.props.history.push('/producerJoin');
            // Webview.openPopup('/producerJoin');
            this.setState({
                type: 'join'
            })
            this.togglePopup()
        }
    }

    togglePopup = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }


    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    // 비밀번호 초기화 확인 클릭
    onResetValword = async() => {

        let response;
        let userType;
        if (this.state.activeTab === '1') {
            response = await getBuyerEmail(this.targetEmail.value);
            userType = 'buyer';
        }
        else {
            response = await getSellerEmail(this.targetEmail.value);
            userType = 'seller';
        }

        if (!response.data) { //= (response.data == '' || response.data == null) {     // 없는 이메일
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
                alert("비밀번호 찾기에 실패했습니다. 다시 시도해주세요.")
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

    //생산자 가입 막기 alert
    onClose = () => {
        this.setState({
            isOpen: false
        })
    }

    moveToProducerLogin = () => {
        this.props.history.push('/b2b/seller/login')
    }

    render(){
        return(
            <Fragment>
                {/*<ShopXButtonNav close>로그인</ShopXButtonNav>*/}
                <Container fluid className={Style.wrap}>
                    <div className='d-flex justify-content-center align-items-center'>
                        <NiceFoodLogoColorRectangle className={''} style={{textAlign:'center', width: 120, paddingTop: 10, paddingBottom: 10}}/>
                    </div>
                    <Form onSubmit={this.onLoginClicked}>
                        {/*<Row> /!* Tab *!/*/}
                            {/*<Col sm={"12"}>*/}
                                {/*<br/>*/}
                                {/*<Nav tabs>*/}
                                    {/*<NavItem>*/}
                                        {/*<NavLink*/}
                                            {/*className={classnames({ active: this.state.activeTab === '1' })}*/}
                                            {/*onClick={() => { this.toggle('1'); }}*/}
                                        {/*>*/}
                                            {/*<TabTitle tabNumber='1' activeTab={this.state.activeTab}/>*/}
                                        {/*</NavLink>*/}
                                    {/*</NavItem>*/}
                                    {/*<NavItem>*/}
                                        {/*<NavLink*/}
                                            {/*className={classnames({ active: this.state.activeTab === '2' })}*/}
                                            {/*onClick={() => { this.toggle('2'); }}*/}
                                        {/*>*/}
                                            {/*<TabTitle tabNumber='2' activeTab={this.state.activeTab}/>*/}
                                        {/*</NavLink>*/}
                                    {/*</NavItem>*/}
                                {/*</Nav>*/}
                            {/*</Col>*/}
                        {/*</Row>*/}
                        {/*<Row> /!* blank line *!/*/}
                            {/*<br/>*/}
                        {/*</Row>*/}
                        <Row>
                            <Col xs={12}>
                                <FormGroup>
                                    <InputGroup>
                                        {/*<InputGroupAddon addonType="prepend"><Info/></InputGroupAddon>*/}
                                        <Input className={Style.textBox} placeholder="소비자 아이디(이메일)" />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                            <Col xs={12}>
                                <FormGroup>
                                    <InputGroup>
                                        {/*<InputGroupAddon addonType="prepend">비번</InputGroupAddon>*/}
                                        <Input className={Style.textBox} type="password" placeholder="비밀번호" />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}> {/* 잘못입력 및 로그인 실패시 에러 메시지 */}
                                {
                                    this.state.fadeEmail && <Fade in={true} style={{color:'gray'}}>이메일 주소를 입력해 주세요.</Fade>
                                }
                                {
                                    this.state.fadeEmailType && <Fade in={true} style={{color:'gray'}}>이메일 주소를 양식에 맞게 입력해 주세요.</Fade>
                                }
                                {
                                    this.state.fadePassword && <Fade in={true} style={{color:'gray'}}>비밀번호를 입력해 주세요.</Fade>
                                }
                                {
                                    this.state.fadeError && <Fade in={true} style={{color:'gray'}}>아이디/비밀번호를 확인해 주세요.</Fade>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormGroup>
                                    <Button type='submit' block color={'primary'} size={'lg'} >로그인</Button>
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <FormGroup check>
                                    <Input type="checkbox" name="check" id="autoLogin" onChange={this.autoLoginCheck}/>
                                    <Label for="autoLogin" check> 자동로그인 </Label>
                                </FormGroup>
                            </Col>
                        </Row>
                        <hr/> {/* gray line */}

                            <div className={Style.bottomContainer}>
                                <div onClick={this.onIdSearchClick} className='cursor-pointer'>
                                    <div>아이디</div>
                                    <div>찾기</div>
                                </div>
                                <div onClick={this.onPwSearchClick} className='cursor-pointer'>
                                    <div>비밀번호</div>
                                    <div>찾기</div>
                                </div>
                                <div onClick={this.onJoinClick} className='cursor-pointer'>
                                    {/*<div>{this.state.activeTab === '1' ? '소비자' : '생산자'}</div>*/}
                                    <div>소비자</div>
                                    <div>회원가입</div>
                                </div>
                            </div>
                        {/*<Row>*/}
                            {/*<Col xs={4} className={'text-center'}>*/}
                                {/*<FormGroup>*/}
                                    {/*<Button color={'link'} onClick={this.onIdSearchClick}>*/}
                                        {/*<small>아이디<br/>찾기</small>*/}
                                    {/*</Button>*/}
                                {/*</FormGroup>*/}
                            {/*</Col>*/}

                            {/*<Col xs={4} className={'text-center'}>*/}
                                {/*<FormGroup>*/}
                                    {/*<Button color={'link'} onClick={this.onPwSearchClick}>*/}
                                        {/*<small>비밀번호<br/>찾기</small>*/}
                                    {/*</Button>*/}
                                {/*</FormGroup>*/}
                            {/*</Col>*/}

                            {/*<Col xs={4} className={'text-center'}>*/}
                                {/*<FormGroup>*/}
                                    {/*<JoinTitle activeTab = {this.state.activeTab} onClick={this.onJoinClick}/>*/}
                                {/*</FormGroup>*/}
                            {/*</Col>*/}

                        {/*</Row>*/}
                    </Form>
                    <br/>
                </Container>
                {
                    this.state.isOpen && this.state.type === 'id' && <ModalPopup title={'알림'} color={'primary'} content={'가입 시 입력하신 이름을 적어 고객센터로(cs@blocery.io) 메일을 보내주시면 답신 드리도록 하겠습니다.'} onClick={this.onClose}></ModalPopup>
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
                                <Button color="primary" onClick={this.onResetValword}>확인</Button>
                                <Button color="secondary" onClick={this.onClose}>취소</Button>
                            </ModalFooter>
                        </Modal>
                }
                {
                    this.state.isOpen && this.state.type === 'join' && <ModalPopup title={'알림'} color={'primary'} content={'지금은 생산자 모집 기간이 아닙니다'} onClick={this.onClose}></ModalPopup>
                }

            </Fragment>
        )
    }
}
