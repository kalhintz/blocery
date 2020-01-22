import React, { Component, Fragment } from 'react';
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade } from 'reactstrap'
import ComUtil from "~/util/ComUtil"
import { getBuyerByBuyerNo, updateValword } from "~/lib/b2bShopApi";
import { updValword } from "~/lib/b2bSellerApi"
import { doB2bLogout } from "~/lib/b2bLoginApi"
import { B2bShopXButtonNav } from '~/components/common'
import { Redirect } from 'react-router-dom'

export default class ModifyValword extends Component {

    constructor(props) {
        super(props)
        this.state = {
            buyerNo: 0,
            sellerNo: 0,
            newValword: '',
            fadeValword: false,
            fadeValwordCheck: false,
            redirect: null
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)
        const buyerNo = params.get('buyerNo')
        const sellerNo = params.get('sellerNo')

        // this.buyerSearch(buyerNo);

        this.setState({
            buyerNo: buyerNo,
            sellerNo: sellerNo
        })
    }

    buyerSearch = async (buyerNo) => {
        const buyerInfo = await getBuyerByBuyerNo(buyerNo)

        this.setState({
            buyerNo: buyerNo
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
        let data = {};
        data.valword = this.state.newValword;

        // buyerNo=0이면 seller, sellerNo=0이면 buyer
        // 생산자 마이페이지 기획 확정시 변경 예정
        if (this.state.sellerNo === 0 || this.state.sellerNo == null) {
            data.buyerNo = this.state.buyerNo;
            let modified = await updateValword(data);
            console.log(modified)
            if(modified.data === 1) {
                alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
                //this.props.history.push('/myPage');
                await this.doLogout();
                this.setState({
                    redirect: '/b2b/mypage'
                })
            } else {
                alert('회원정보 수정 실패. 다시 시도해주세요.')
                return false;
            }
        } else {
            data.sellerNo = this.state.sellerNo;
            let modified = await updValword(data);
            if(modified.data === 1) {
                alert('비밀번호 변경이 완료되었습니다. 다시 로그인해주세요.')
                //this.props.history.push('/myPage');
                await this.doLogout();
                this.setState({
                    redirect: '/b2b/seller/mypage'
                })
            } else {
                alert('회원정보 수정 실패. 다시 시도해주세요.')
                return false;
            }
        }

    }

    // 비밀번호 변경 후 자동 로그아웃
    doLogout = async () => {
        await doB2bLogout();
        //this.props.history.push('/b2b/login')  // 새로고침+로그인 화면으로 이동
    }


    render() {
        if(this.state.redirect) return <Redirect to={this.state.redirect} />
        return(
            <Fragment>
                <B2bShopXButtonNav back history={this.props.history}>비밀번호 변경</B2bShopXButtonNav>
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
                                <Button block color={'primary'} onClick={this.onModifyClick}>저장</Button>
                            </FormGroup>
                        </Col>
                    </Row>
                </Container>
            </Fragment>
        )
    }
}