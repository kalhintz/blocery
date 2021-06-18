import React, { Fragment, Component } from 'react'
import { Label, Container } from 'reactstrap'
import {getConsumer} from "~/lib/shopApi";
import { ShopXButtonNav } from '../../../common/index'

export default class HintPassPhrase extends Component {
    constructor(props){
        super(props)
        this.state = {
            consumerNo: 0,
            hintFront: ''
        }
    }

    async componentDidMount() {
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        this.search()
    }

    search = async() => {
        const {data:consumerInfo} = await getConsumer();

        this.setState({
            hintFront: consumerInfo.hintFront
        })
    }

    render() {
        return(
            <Fragment>
                <ShopXButtonNav underline historyBack >결제 비밀번호 관리</ShopXButtonNav>
                <Container fluid>
                <p></p>
                    <div>
                        <Label>결제 비밀번호 앞 두자리 확인</Label>
                        <div style={{outline:'black solid thin', fontSize:'50px'}} className={'text-center mt-3'}>{this.state.hintFront}****</div>
                        <br/>
                        <div className={'text-center m-2'}>결제 비밀번호 확인이 어려울 경우</div>
                        <div className={'text-center m-2'}><span style={{color:'#007bff'}}>cs@blocery.io</span>로 추가문의해 주시기 바랍니다.</div>
                    </div>

                </Container>

            </Fragment>
        )
    }
}