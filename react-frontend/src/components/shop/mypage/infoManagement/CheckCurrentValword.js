import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, FormGroup, Label, InputGroup, Input, Fade, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { ShopXButtonNav } from '../../../common/index'
import { Webview } from "../../../../lib/webviewApi";
import { getConsumerByConsumerNo } from "../../../../lib/shopApi";
import { getProducerByProducerNo } from "../../../../lib/producerApi";
import { Server } from '../../../Properties';
import axios from 'axios'

export default class CheckCurrentValword extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userType: '',
            consumerNo: 0,
            producerNo: 0,
            email: '',
            valword: '',
            hintFront: '',
            fadeValword: false,
            fadeValwordCheck: false,
            fadeError: false,
            flag: 0,     //flag(1:비번변경 2:회원정보수정 3:결제비밀번호힌트)
            modal: false
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)

        // const userType = params.get('userType')
        const consumerNo = params.get('consumerNo')
        const producerNo = params.get('producerNo')

        const flag = params.get('flag')     //flag(1:비번변경 2:회원정보수정 3:결제비밀번호힌트)

        // this.setState({ userType })

        //if (userType == 'consumer') {
            this.searchConsumer(consumerNo);

            this.setState({
                consumerNo: consumerNo,
                flag: flag
            })
        // } else {
        //     this.searchProducer(producerNo);
        //
        //     this.setState({
        //         producerNo: producerNo,
        //         flag: flag
        //     })
        // }
    }

    searchConsumer = async (consumerNo) => {
        const consumerInfo = await getConsumerByConsumerNo(consumerNo)

        this.setState({
            email: consumerInfo.data.email,
            hintFront: consumerInfo.data.hintFront
        })
    }

    searchProducer = async (producerNo) => {
        const producerInfo = await getProducerByProducerNo(producerNo)

        this.setState({
            email: producerInfo.data.email,
            hintFront: producerInfo.data.hintFront
        })
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 확인 클릭시 일치하는 비밀번호인지 체크 후 flag에 따라 화면 전환
    checkValword = async () => {
        const data = Object.assign({}, this.state)

        let loginInfo = {};
        loginInfo.email = data.email;
        loginInfo.valword = data.valword;
        loginInfo.userType = 'consumer';        // 항상 consumer

        await axios(Server.getRestAPIHost() + '/login',
            {
                method: "post",
                data:loginInfo,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then(async(response) => {
                console.log(response)
                if (response.data.status === Server.ERROR)      //100: login Error
                    this.setState({fadeError: true});
                else {
                    this.setState({fadeError: false});
                    // if(data.userType == 'consumer') {
                        if(this.state.flag == 1) {
                            this.props.history.push('/modifyValword?consumerNo='+data.consumerNo);
                        } else if(this.state.flag == 2) {
                            this.props.history.push('/modifyConsumerInfo?consumerNo='+data.consumerNo);
                        } else {    // flag=3, 결제비밀번호 힌트 modal, 비밀번호 확인 후 확인버튼 누르면 /mypage로
                            this.props.history.push('/mypage/hintPassPhrase?consumerNo='+data.consumerNo)
                        }
                    // } else {        // 로그인유저가 producer일 때
                    //     if(this.state.flag == 1) {
                    //         this.props.history.push('/modifyValword?producerNo='+data.producerNo);
                    //     } else if(this.state.flag == 2){
                    //         // this.props.history.push('/modifyConsumerInfo?producerNo='+data.producerNo);
                    //     } else {
                    //         this.setState({
                    //             modal: true
                    //         })
                    //     }
                    // }

                }
            })
    }

    modalToggleOk = () => {
        Webview.closePopup();
    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }))
    }

    //엔터 이벤트 막기
    preventEnter = (e) => {
        e.preventDefault();
    }

    render() {
        return(
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack>비밀번호 확인</ShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>아이디</Label>
                                <InputGroup>
                                    <Input name="email" value={this.state.email} disabled/>
                                </InputGroup>
                            </FormGroup>
                        </Col>
                        <Col xs={12}>
                            <form autoComplete="off" onSubmit={this.preventEnter}>
                            <FormGroup>
                                <Label>비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="valword" value={this.state.valword} onChange={this.handleChange}/>
                                </InputGroup>
                                {
                                    this.state.fadeError && <Fade in={true}>비밀번호가 일치하지 않습니다.</Fade>
                                }
                            </FormGroup>
                            </form>
                        </Col>
                        <br/>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.checkValword}>확인</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>

                {/* 결제비밀번호 힌트 */}
                <Modal isOpen={this.state.modal} centered>
                    {this.state.userType == 'consumer'?<ModalHeader>결제 비밀번호</ModalHeader>:<ModalHeader>환전 비밀번호</ModalHeader>}
                    {
                        this.state.userType == 'consumer'?
                        <ModalBody>회원님의 결제 비밀번호는 '{this.state.hintFront}****' 입니다.</ModalBody>
                        :
                        <ModalBody>회원님의 환전 비밀번호는 '{this.state.hintFront}****' 입니다.</ModalBody>
                    }
                    <ModalBody>비밀번호 관련 문의는 info@blocery.io 로 문의주세요.</ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.modalToggleOk}>확인</Button>
                        <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }


}