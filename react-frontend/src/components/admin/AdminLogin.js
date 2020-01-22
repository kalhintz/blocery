import React, { Component, Fragment } from 'react'
import { Container, Col, Button, Form, FormGroup, Label, Input} from 'reactstrap'
import axios from 'axios'
import { Server } from '../Properties'
import { getLoginAdminUser } from '../../lib/loginApi'
import Style from './AdminLogin.module.scss'

import { Redirect } from 'react-router-dom'

export default class AdminLogin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: (Server._serverMode() === 'stage') ? 'admin@ezfarm.co.kr' :'',
            valword: null,
            redirectToReferrer: false
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

        if(data.email === ''){
            alert('이메일을 입력해 주세요');
            return false;
        }
        if(data.valword === ''){
            alert('비밀번호를 입력해주세 주세요');
            return false;
        }

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
                    alert('관리자 로그인 오류. 이메일과 비밀번호를 다시입력해주세요');
                }
                else
                {
                    let loginAdminInfo = response.data;
                    //쿠키(localStorage)에 login된 userType저장.
                    //localStorage.setItem('loginUserType', loginInfo.userType);
                    localStorage.setItem('userType', 'admin')
                    sessionStorage.setItem('logined', 1)

                    this.setState({
                        redirectToReferrer: true
                    })
                    //localStorage.setItem('account', loginInfo.account);
                    //console.log('loginAdminInfo : ===========================',loginAdminInfo);

                    // this.props.history.push(this.targetLocation); //TopBar의 토큰 update가 안됨
                    //window.location = this.targetLocation;  //LeftBar등이 초기화됨
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
                            <Label for="password" ><h6>비밀번호</h6></Label>
                            <Input type="password" name="valword" value={this.state.valword||''} onChange={this.onInputChange} />
                        </FormGroup>
                        <FormGroup row>
                            <Button type='submit' block color='primary'> 로그인 </Button>
                        </FormGroup>
                    </Form>
                </Container>
            </Fragment>
            </div>
        );
    }
}
