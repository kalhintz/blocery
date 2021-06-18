import React, { Fragment, Component } from 'react'
import { ShopXButtonNav, ModalPopup } from '~/components/common'
import { getConsumer } from '~/lib/shopApi'
import { Div, Img, Button, Link } from '~/styledComponents/shared'
import kycSampleImg3 from '~/images/kyc/licence_man_none.svg';

import styled from 'styled-components'

const KycBody = styled(Div)`
    height: calc(100vh - 56px - 54px);
    display: flex;
    align-items: center;
    justify-conttent: center;
`;

export default class KycCertification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: 'notRender',
            modalOpen: false
        }
    }

    async componentDidMount() {
        const {data} = await getConsumer();
        if(!data){
            this.props.history.replace('/mypage');
            return;
        }
        this.setState({
            loginUser: (data) ? data : null
        })
    }

    onHelpClick = () => {
        this.setState({ modalOpen: !this.state.modalOpen })
    }

    onClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>KYC 신원 확인</ShopXButtonNav>
                {
                    this.state.loginUser === 'notRender' ? <Div></Div> :
                        <KycBody>
                            <Div p={40} flexGrow={1} textAlign={'center'}>
                                <Div>
                                    <Img src={kycSampleImg3}></Img>
                                </Div>

                                <Div my={30}>
                                    <Div bold fontSize={20} mb={20}>KYC 신원 확인</Div>
                                    <Div fg={'dark'} fontSize={13}>
                                        <Div mb={15}>회원님의 소중한 정보가 안전하게 </Div>
                                        <Div>보관될 수 있도록 최선의 노력을 다하겠습니다.</Div>
                                    </Div>
                                </Div>
                                <Div my={20}>
                                    <Link to={'/kycDocument'} display={'block'}>
                                        <Button rounded={3} block fg={'white'} bg={'green'} py={18}>시작하기</Button>
                                    </Link>
                                </Div>
                                <Button onClick={this.onHelpClick} fg={'green'} fontSize={13}><u>도움말</u></Button>
                            </Div>
                        </KycBody>
                }
                {
                    this.state.modalOpen &&
                    <ModalPopup title={'KYC 신원 확인 안내'}
                                content={
                                    <div>KYC 신원 확인은 마켓블리(MarketBly) App 내에서 토큰(BLY)출금 등 자산과 관련된 서비스를 이용하는데 있어 필요한 신원 확인 및 보증 절차입니다.
                                    <br/><br/> 현재 계정 보안 자금 세탁과 테러 자금 조달 방지를 위해 출금 금액이 제한되어 있으며, KYC 신원 확인을 완료하면 출금 제한이 상향 조정됩니다.
                                    {/*<br/><br/> -KYC 신원 확인 전 : 일 한도 1,250BLY <br/> -KYC 신원 확인 후 : 일 한도 250,000BLY</div>}*/}
                                    {/*<br/><br/> -KYC 신원 확인 전 : 일 한도 500BLY <br/> -KYC 신원 확인 후 : 일 한도 5,000BLY</div>}*/}
                                    <br/><br/> -KYC 신원 확인 전 : 일 한도 500BLY <br/>
                                    -KYC 신원 확인 후 : <br/>
                                    a. DON에어드랍 이벤트 기간 까지( ~ 3/7) : 한도 제한 없음 <br/>
                                    b. DON에어드랍 이벤트 기간 이후(3/7 ~) : 5,000BLY
                                    </div>
                                    }

                                onClick={this.onClose}>

                    </ModalPopup>
                }

            </Fragment>
        )
    }
}