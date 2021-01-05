import React, { Component, Fragment } from 'react'
import { Container, Input, Form, Row, Col, Button, Fade, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap'
import axios from 'axios'
import { Server } from '../../Properties';
import { Webview } from "~/lib/webviewApi";
import { doKakaoLogin, getLoginUser } from "~/lib/loginApi";
import { getConsumerEmail } from "~/lib/shopApi";
import { resetPassword } from "~/lib/adminApi";
import { EMAIL_RESET_TITLE, getEmailResetContent } from '~/lib/mailApi';
import { ModalPopup, MarketBlyLogoColorRectangle } from '~/components/common'
import Style from './LoginTab.module.scss'
import {FaCheckCircle} from 'react-icons/fa'
import {RiKakaoTalkFill} from 'react-icons/ri'
import classNames from 'classnames'
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'
import ConsumerKakaoJoin from '~/components/shop/join/ConsumerKakaoJoin'
import {withRouter} from 'react-router-dom'

const KaKaoLoginBtn = styled(Button)`
  color: #783c00;
  background-color: #ffeb00;
  &:hover {
    box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.2);
  }
`;

const DivDivder = styled.div`
    position: relative;
    width: 95%;
    height: 58.5px;
    margin: 0 auto;
    line-height: 58.5px;
    text-align: center;
`
const DivDivderLine = styled.div`
    position: absolute;
    width: 100%;
    height: 1px;
    margin-top: 29.25px;
    background-color: #d2d2d6;
`
const DivDivderText = styled.div`
    position: relative;
    width: 52.5px;
    height: 48.5px;
    padding: 5px 0;
    margin: 0 auto;
    line-height: 58.5px;
    font-size: 11px;
    color: #d2d2d6;
    text-align: center;
    background-color: #fff;
`

class ConsumerLogin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            fadeEmail: false, //email 미입력시 에러메시지 여부
            fadeEmailType: false,
            fadePassword: false,
            fadeError: false,   //email or pw 가 서버에 없을때 에러메시지 여부
            autoLogin: true,
            isOpen: false,
            kakaoJoinOpen: false,
            kakaoJoinInfo:{
                consumerInfo:null,
                token:""
            }
        }
    }

    async componentDidMount(){

        //// RN2.혹시 RN(React Native)로부터 accessKey파라미터로 kakao 로그인호출 되면. /////////////////

        //doKakaoLogin(access_token) 바로 호출.  test필요..
        //USAGE:  login?accessToken="accessToken...."
        console.log('this.props.location:' + this.props.location);
        if (!this.props.location) return;

        const params = new URLSearchParams(this.props.location.search)
        let accessToken = params.get('accessToken');
        if (accessToken) {

            //React Native 에소 호출된 경우.. 로그인 확인 후, 가입페이지로 이동 or 로그인완료 처리.
            //this.kakaoLoginWithAccessKey(accessToken);
            await this.kakaoLoginWithAccessKey(accessToken);
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
        data.userType = 'consumer'

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

        await axios(Server.getRestAPIHost() + '/login',
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

                    console.log(localStorage);

                    //localStorage.clear();

                    localStorage.removeItem('authType');
                    localStorage.removeItem('userType');
                    //localStorage.removeItem('account'); //geth Account
                    localStorage.removeItem('email');
                    localStorage.removeItem('valword');
                    localStorage.removeItem('autoLogin');

                    //쿠키(localStorage)에 login된 userType저장. - 필요하려나.
                    localStorage.setItem('authType', 0);
                    localStorage.setItem('userType', data.userType);
                    //localStorage.setItem('account', loginInfo.account); //geth Account
                    localStorage.setItem('email', data.email);
                    localStorage.setItem('valword', ComUtil.encrypt(data.valword));
                    localStorage.setItem('autoLogin', this.state.autoLogin? 1:0);
                    //localStorage.setItem('today', ComUtil.utcToString(new Date()));

                    sessionStorage.setItem('logined', 1); //1 : true로 이용중

                    console.log('loginInfo : ===========================',loginInfo);
                    //Webview.appLog('Login valword:' + data.valword);
                    //Webview.appLog('LoginlocalStorage Val:' + localStorage.getItem('valword'));

                    Webview.updateFCMToken({userType: loginInfo.userType, userNo: loginInfo.uniqueNo})

                    //팝업에선 작동한해서 막음: Webview.loginUpdate(); //하단바 update용.
                }
            })
            .catch(function (error) {
                console.log(error);
                alert('로그인 오류:'+error);
            });

        if (!this.state.fadeError) { //로그인 성공이면
            console.log('소비자 로그인 성공');
            this.closePopup();
        }
    }

    closePopup = () => { //팝업 close는 axios와 분리.
        Webview.closePopup();  //팝업만 닫음.
        // Webview.closePopupAndMovePage('/');    //팝업닫으면서 홈으로 이동
    }

    autoLoginCheck = (e) => {
        // let autoLoginFlag = e.target.checked;
        // console.log('autoLoginFlag:' + autoLoginFlag);

        this.setState({autoLogin:!this.state.autoLogin});
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
        //미션이벤트용 날짜 check - 베타오픈 후에는 제거해도 됨
        if (Server._serverMode() === 'production') {
            let now = ComUtil.utcToString(ComUtil.getNow());
            console.log(now);

            if (ComUtil.compareDate(now, '2019-12-30') < 0) {

                alert("12월 30일부터 가입과 이벤트참여가 가능합니다");
                return;
            }
        }

        Webview.openPopup('/join');
    }

    togglePopup = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    // 비밀번호 초기화 확인 클릭
    onResetValword = async() => {

        let response = await getConsumerEmail(this.targetEmail.value);
        let userType = 'consumer';

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

    //닫기
    onClose = () => {
        this.setState({
            isOpen: false
        })
    }

    kakaodoJoinSuccessed = async (consumerInfo) => {
        this.setState({
            kakaoJoinOpen: false
        });

        Webview.updateFCMToken({userType: 'consumer', userNo: consumerInfo.consumerNo})
        this.props.history.push('/joinComplete?name='+consumerInfo.name+'&email='+consumerInfo.email);
    }

    KakaoJoinClose = () => {
        this.setState({
            kakaoJoinOpen: false
        })
    }

    KakaoLogin = () => {
        const that = this;

        //RN1. mobileApp이면 ReactNative 호출..
        if(ComUtil.isMobileApp()) { //모바일앱 카카오로그인 - 202012 추가

            Webview.kakaoAppLogin(); //RN호출..

        }else { //웹 카카오로그인 - 202011기존코드

            //RN1-1. mobileApp이 아니면 웹로그인(아래)호출.
            window.Kakao.Auth.login({
                success: async function (response) {
                    console.log(response)
                    const access_token = response.access_token;

                    //202012 RN을 위해 함수로 분리..
                    await that.kakaoLoginWithAccessKey(access_token);


                },
                fail: function (error) {
                    console.log(error)
                },
            })
        }
    }

    //ReactNative(RN)공용사용을 위해  분리. 202012
    kakaoLoginWithAccessKey = async(access_token) => {

        const {data:res} = await doKakaoLogin(access_token);
        console.log("doKakaoLogin===",res)

        const code = res.code;
        if(code == 1){
            //consumerNo (0보다 크면) -  회원가입 중인 consumerNo =>  결제비번 입력창으로.
            this.setState({
                kakaoJoinInfo:{
                    consumer:res.consumer,
                    token:access_token
                },
                kakaoJoinOpen:true
            })

        } else if(code == 0){
            // 로그인 처리
            // 0  - 가져오기 성공 (로그인 성공)
            const consumerInfo = res.consumer;
            // const {data:loginInfo} = await getLoginUser();

            localStorage.removeItem('authType');
            localStorage.removeItem('userType');
            localStorage.removeItem('email');
            localStorage.removeItem('valword');
            localStorage.removeItem('token');

            localStorage.setItem('authType', 1);
            localStorage.setItem('userType', 'consumer');
            localStorage.setItem('token', access_token);
            localStorage.setItem('autoLogin', 1);
            sessionStorage.setItem('logined', 1); //1 : true로 이용중
            Webview.updateFCMToken({userType: 'consumer', userNo: consumerInfo.consumerNo})

            console.log('kakao Login OK: + history.goback');
            this.closePopup();
        }else{
            if(code == -1){
                // -1 - 가져오기 실패
                console.log("-1 카카오톡 정보 가져오기 실패");
            }else{
                console.log("-1 카카오톡 정보 가져오기 실패");
            }
        }

    }


    // 카카오 로그아웃
    KakaoLogout = () => {
        // 카카오 토큰만료
        if (!window.Kakao.Auth.getAccessToken()) {
            console.log('Not logged in.');
            return;
        }
        window.Kakao.Auth.logout(function() {
            console.log(window.Kakao.Auth.getAccessToken());
            //마켓블리 로그아웃 처리 (세션등)
        });
    }

    // 카카오 연결 끊기
    KakaoUnlink = () => {
        window.Kakao.API.request({
            url: '/v1/user/unlink',
            success: function(response) {
                console.log(response);
            },
            fail: function(error) {
                console.log(error);
            },
        });
    }


    render(){

        let appleReviewMode = ComUtil.isMobileAppIosAppleReivew(); //애플 review모드일때는 kakaoLogin숨기기.

        return(
            <Fragment>
                {/*<ShopXButtonNav close>로그인</ShopXButtonNav>*/}
                <Container fluid className={Style.wrap}>
                    <div className='d-flex justify-content-center align-items-center'>
                        <MarketBlyLogoColorRectangle className={''} style={{textAlign:'center', width: 120, paddingTop: 10, paddingBottom: 10}}/>
                    </div>
                    {  !appleReviewMode &&
                        <Row>
                            <Col xs={12}>
                                <KaKaoLoginBtn className={'rounded-0 p-3 mt-3'} block
                                               onClick={this.KakaoLogin}><RiKakaoTalkFill size={30}/><span className='f18'>카카오톡 계정으로 로그인</span></KaKaoLoginBtn>
                                <div>
                                    <DivDivder>
                                        <DivDivderLine/>
                                        <DivDivderText>또는</DivDivderText>
                                    </DivDivder>
                                </div>
                            </Col>
                        </Row>
                    }

                    <Form onSubmit={this.onLoginClicked}>
                        <Row>
                            <Col xs={12}>
                                <Input className={classNames('rounded-0 mb-3', Style.textBox)}  placeholder="소비자 아이디(이메일)" />
                                {
                                    this.state.fadeEmail && <CustomFade>이메일 주소를 입력해 주세요.</CustomFade>
                                }
                                {
                                    this.state.fadeEmailType && <CustomFade>이메일 주소를 양식에 맞게 입력해 주세요.</CustomFade>
                                }
                                <Input className={classNames('rounded-0 mb-3', Style.textBox)}  type="password" placeholder="비밀번호" />

                                {
                                    this.state.fadePassword && <CustomFade>비밀번호를 입력해 주세요.</CustomFade>
                                }
                                {
                                    this.state.fadeError && <CustomFade>아이디/비밀번호를 확인해 주세요.</CustomFade>
                                }
                                <Button type='submit' color={'info'} className={'rounded-0 p-3 mt-4 mb-3'} block ><span className='f20'>로그인</span></Button>

                                <span onClick={this.autoLoginCheck} className='d-flex align-items-center'>
                                    <FaCheckCircle size={16} className={classNames('mr-2', this.state.autoLogin ? 'text-info' : 'text-secondary')} />
                                    <div className='text-dark f13'> 자동로그인 </div>
                                </span>
                                <hr/>
                                <div class='d-flex justify-content-center f13 text-secondary'>
                                    <span className='mr-2 cursor-pointer' onClick={this.onIdSearchClick}>아이디 찾기</span>
                                    <span className='mr-2'>|</span>
                                    <span className='mr-2 cursor-pointer' onClick={this.onPwSearchClick}>비밀번호 찾기</span>
                                    {/*<span className='mr-2'>|</span>*/}
                                    {/*<span className='mr-2 cursor-pointer' onClick={this.onJoinClick}>소비자 회원가입</span>*/}
                                </div>
                            </Col>
                        </Row>


                    </Form>
                </Container>
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
                    this.state.kakaoJoinOpen &&
                        <Modal size="lg" isOpen={true} centered>
                            <ModalHeader>소비자 회원가입</ModalHeader>
                            <ModalBody>
                                <ConsumerKakaoJoin
                                    kakaoJoinInfo={this.state.kakaoJoinInfo}
                                    kakaodoJoinSuccessed={this.kakaodoJoinSuccessed}
                                />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="secondary" onClick={this.KakaoJoinClose}>취소</Button>
                            </ModalFooter>
                        </Modal>
                }
            </Fragment>
        )
    }
}

function CustomFade(props){
    return (
        <div className='mb-3'>
            <Fade in={true} className={'small text-danger'}>{props.children}</Fade>
        </div>
    )
}

export default withRouter(ConsumerLogin);