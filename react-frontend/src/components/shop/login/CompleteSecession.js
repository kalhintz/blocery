import React, {Component, Fragment} from 'react'
import {Button, Div, Span} from '~/styledComponents/shared'
import {ShopXButtonNav} from "~/components/common";
import ComUtil from "~/util/ComUtil";
import {FaGift, FaRegSmileBeam} from 'react-icons/fa'

export default class ApplySecession extends Component {
    constructor(props) {
        super(props);
    }



    moveToHome = () => {
        this.props.history.push('/');
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack isVisibleXButton={false}>회원탈퇴 완료</ShopXButtonNav>
                <Div m={16} height='100%'>
                    <Div fontSize={18}>
                        <Span>그동안 마켓블리(MarketBly)를 이용해 주셔서</Span><br/>
                        <Span>진심으로 감사드립니다.</Span><br/>
                        <Span><Span bold>회원탈퇴가 정상적으로 완료</Span> 되었습니다.</Span>
                    </Div>
                    <br/>
                    <Div>
                        <Span><u>동일한 계정으로 재가입은 90일 이후에 가능</u>합니다.</Span><br/>
                        <Span>그동안 보다 다양한 혜택과 좋은 상품 그리고 멋진 서비스로</Span><br/>
                        <Span>다시 돌아올 날을 기대하며 준비하고 있을게요.</Span><br/>
                        <Span>마켓블리를 기억해 주시고, 추후 다시 인사 드릴게요. <FaRegSmileBeam /></Span><br/>
                    </Div>
                    <br/>
                    <Div width='100%' bc={'dark'} py={16} px={30} textAlign={'center'} mb={60}>
                        재가입 가능일 : <Span fg={'green'}>{ComUtil.utcToString(ComUtil.addDate(ComUtil.utcToString(new Date()), 90), `YYYY년 MM월 DD일`)}</Span>
                    </Div>
                </Div>

                <Div m={16} bottom={0}>
                    <Button block py={10} bc={'secondary'} bg={'darkBlack'} fg={'white'} onClick={this.moveToHome}>홈으로 이동</Button>
                </Div>
            </Fragment>
        )
    }
}