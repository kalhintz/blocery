import React, { Component, Fragment } from 'react'
import { Container, Button as LoginButton, Form, FormGroup, Label, Input } from 'reactstrap'
import axios from 'axios'
import { Server } from '../Properties'
import { Button, Flex, Right, Div } from '~/styledComponents/shared'
import Style from './AdminLogin.module.scss'
import { Redirect } from 'react-router-dom'
import {smsConfirm, smsSend} from "~/lib/smsApi";

export default class AdminLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email:'',
            valword: null,
            phone: null,
            digit: null,
            redirectToReferrer: false,
            //smsCheckOk: false
        };
        //기본 로그인 메인 페이지
        // this.targetLocation = Server.getAdminShopMainUrl();
    }

    async componentDidMount() {
        //자동 비밀번호 출력 및 비밀번호 하드코딩 - 보안상 제거.
    }

    formValidation = (event) => {
        event.preventDefault();

        let data = {};
        data.email = event.target[0].value;
        data.valword = event.target[1].value;
        data.phone = event.target[3].value;
        data.digit = event.target[4].value;

        if(data.email === ''){
            alert('이메일을 입력해 주세요');
            return false;
        }
        if(data.valword === ''){
            alert('비밀번호를 입력해 주세요');
            return false;
        }

        //사외에서만..
        // if(data.digit === ''){
        //     alert('인증번호를 입력해 주세요');
        //     return false;
        // }

        axios(Server.getRestAPIHost() + '/adminLogin',
            {
                method: "post",
                data:data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                console.log(response);
                if (response.data.status === Server.ERROR) {
                    //100: login ERROR
                    alert('관리자 로그인 오류. 이메일과 비밀번호, 핸드폰번호를 다시입력해주세요');
                }
                else
                {
                    let loginAdminInfo = response.data;
                    localStorage.setItem('adminEmail', data.email) //20200330 - adminEmail 별도 저장.
                    sessionStorage.setItem('adminLogined', 1) //20200330 - adminLogined도 별도 저장..
                    this.setState({
                        redirectToReferrer: true
                    })
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

    onSmsSend = async () => {
        if (!this.state.phone || this.state.phone.length < 10){
            alert('휴대폰 번호를 입력해주세요')
            return false;
        }
        else {
            let {data:result} =  await smsSend('admin', this.state.phone.replaceAll('-', ''));

            if (result === 200) {
                alert(this.state.phone + ' 번호로 인증번호를 전송 중입니다.')
                this.setState({
                    fadeSmsCheck: true
                })
            } else {
                alert('실행중 오류가 발생하였습니다 다시 한번 시도해주세요. ')
            }
        }
    }


    render(){
        //private route 의 router 에서 넘겨주는 이동 해야 할 페이지
        const { from } = this.props.location.state || { from: { pathname: Server.getAdminShopMainUrl() } }
        const { redirectToReferrer } = this.state

        if(redirectToReferrer === true){
            return <Redirect to={from} />
        }

        return(
            <div className='p-3'>
            <Fragment>
                <Container fluid className={Style.wrap}>
                    <p></p>
                    <Form onSubmit={this.formValidation}>
                        <FormGroup row>
                            <Label for="email"><h6>이메일 ID</h6></Label>
                            <Input type="text" name="email" value={this.state.email||''} onChange={this.onInputChange}/>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="valword"><h6>비밀번호</h6></Label>
                            <Input type="password" name="valword" value={this.state.valword||''} onChange={this.onInputChange} />
                        </FormGroup>
                        <FormGroup row>
                            <Label for="phone"><h6>핸드폰번호</h6></Label>
                            <Button type='button' onClick={this.onSmsSend} bc='secondary' px={5} py={2} ml='auto'>인증번호 받기</Button>
                            <Input type="text" name="phone" value={this.state.phone||''} onChange={this.onInputChange} placeholder="** 사외에서만 입력 필수 **"/>
                        </FormGroup>
                        <FormGroup row>
                            <Label for="digit"><h6>인증번호</h6></Label>
                            <Input type="text" name="digit" value={this.state.digit||''} onChange={this.onInputChange} />
                        </FormGroup>
                        <FormGroup row>
                            <LoginButton type='submit' block color='primary'> 로그인 </LoginButton>
                        </FormGroup>
                    </Form>

                </Container>
            </Fragment>
            </div>
        );
    }
}
