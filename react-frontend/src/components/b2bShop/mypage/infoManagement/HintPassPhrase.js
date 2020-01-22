import React, { Fragment, Component } from 'react'
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade } from 'reactstrap'
import ComUtil from "~/util/ComUtil"
import { getBuyerByBuyerNo, updateValword } from "~/lib/b2bShopApi";
import { B2bShopXButtonNav } from '../../../common/index'

export default class HintPassPhrase extends Component {
    constructor(props){
        super(props)
        this.state = {
            buyerNo: 0,
            hintFront: ''
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)

        const buyerNo = params.get('buyerNo')

        this.search(buyerNo)
    }

    search = async(buyerNo) => {
        const buyerInfo = await getBuyerByBuyerNo(buyerNo)

        this.setState({
            hintFront: buyerInfo.data.hintFront
        })
    }

    render() {
        return(
            <Fragment>
                <B2bShopXButtonNav back history={this.props.history}>결제 비밀번호 관리</B2bShopXButtonNav>
                <Container fluid>
                <p></p>
                    <div>
                        <Label>결제 비밀번호 앞 두자리 확인</Label>
                        <div style={{outline:'black solid thin', fontSize:'50px'}} className={'text-center mt-3'}>{this.state.hintFront}****</div>
                        <br/>
                        <div className={'text-center m-2'}>결제 비밀번호 확인이 어려울 경우</div>
                        <div className={'text-center m-2'}><span style={{color:'#007bff'}}>info@blocery.io</span>로 아이디(이메일계정)와 결제 비밀번호 앞 두자리를 보내주시면 추가 비밀번호
                            2자리를 안내해 드리겠습니다.</div>
                    </div>

                </Container>

            </Fragment>
        )
    }
}