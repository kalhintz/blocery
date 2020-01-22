import React, { Component, Fragment } from 'react';
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade } from 'reactstrap'
import ComUtil from "../../../../util/ComUtil"
import { getConsumerByConsumerNo, updateValword } from "~/lib/shopApi";
import { updValword } from "~/lib/producerApi"
import { doLogout } from "~/lib/loginApi"
import { ShopXButtonNav } from '~/components/common'
import { Redirect } from 'react-router-dom'

export default class ModifyValword extends Component {

    constructor(props) {
        super(props)
        this.state = {
            consumerNo: 0,
            producerNo: 0,
            newValword: '',
            fadeValword: false,
            fadeValwordCheck: false,
            redirect: null
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)
        const consumerNo = params.get('consumerNo')
        const producerNo = params.get('producerNo')

        // this.consumerSearch(consumerNo);
        // this.producerSearch(producerNo);


        this.setState({
            consumerNo: consumerNo,
            producerNo: producerNo
        })
    }

    consumerSearch = async (consumerNo) => {
        const consumerInfo = await getConsumerByConsumerNo(consumerNo)

        this.setState({
            consumerNo: consumerNo
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    valwordRegexCheck = (e) => {
        if(!ComUtil.valwordRegex(e.target.value)) {
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

    valwordCheck = (e) => {
        if(e.target.value != this.state.newValword) {
            this.setState({ fadeValwordCheck: true })
        } else {
            this.setState({ fadeValwordCheck: false })
        }
    }

    // 저장버튼 클릭
    onModifyClick = async() => {
        if(this.state.fadeValwordCheck) {
            alert('비밀번호를 다시 확인해주세요.')
            return;
        }

        let data = {};
        data.valword = this.state.newValword;

        // consumerNo=0이면 producer, producerNo=0이면 consumer
        // 생산자 마이페이지 기획 확정시 변경 예정
        if (this.state.producerNo === 0 || this.state.producerNo == null) {
            data.consumerNo = this.state.consumerNo;
            let modified = await updateValword(data);
            console.log(modified)
            if(modified.data === 1) {
                alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
                //this.props.history.push('/myPage');
                await this.doLogout();
                this.setState({
                    redirect: '/mypage'
                })
            } else {
                alert('회원정보 수정 실패. 다시 시도해주세요.')
                return false;
            }
        } else {
            data.producerNo = this.state.producerNo;
            let modified = await updValword(data);
            if(modified.data === 1) {
                alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
                //this.props.history.push('/myPage');
                await this.doLogout();
                this.setState({
                    redirect: '/producer/mypage'
                })
            } else {
                alert('회원정보 수정 실패. 다시 시도해주세요.')
                return false;
            }
        }

    }

    // 비밀번호 변경 후 자동 로그아웃
    doLogout = async () => {
        await doLogout();
        //this.props.history.push('/login')  // 새로고침+로그인 화면으로 이동
    }


    render() {
        if(this.state.redirect) return <Redirect to={this.state.redirect} />
        return(
            <Fragment>
                <ShopXButtonNav back history={this.props.history}>비밀번호 변경</ShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Label>비밀번호</Label>
                                <InputGroup>
                                    <Input type="password" name="newValword" placeholder="새로운 비밀번호를 입력해주세요" onBlur={this.valwordRegexCheck} onChange={this.handleValwordChange} />
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
                    </Row>
                    <br/>
                    <Row>
                        <Col xs={12}>
                            <FormGroup>
                                <Button block color={'info'} onClick={this.onModifyClick}>저장</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )
    }
}