import React, { Fragment, Component } from 'react'
import { ShopXButtonNav } from '~/components/common'

import { Webview } from '~/lib/webviewApi'
import { getLoginUserType } from '~/lib/loginApi'
import { getConsumer } from '~/lib/shopApi'

import { Div, Img, Flex, Button, Link } from '~/styledComponents/shared'
import kycSampleImg4 from '~/images/kyc/licence_man_finish.svg';

import styled from 'styled-components'

const Body = styled(Flex)`
    height: calc(100vh - 56px - 53px);
`;

export default class KycCertification extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: 'notRender',
            loginUserType: null
        }
    }

    async componentDidMount() {
        const loginUserType = await getLoginUserType();
        let loginUser;

        if(loginUserType.data === 'consumer') {
            loginUser = await getConsumer();

        } else if (loginUserType.data === 'producer') {
            //생산자용 mypage로 자동이동.
            Webview.movePage('/producer/mypage');
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav isVisibleXButton={false} underline>KYC 신원 확인</ShopXButtonNav>
                {
                    this.state.loginUser === 'notRender' ? <Div></Div> :
                        <Body p={16}>
                            <Div textAlign={'center'}>
                                <Div my={40}><Img width={'50%'} src={kycSampleImg4}></Img></Div>
                                <Div my={20} bold fontSize={18} mt={40}>KYC 신원 확인을 위한 <br/> 서류 제출이 정상적으로 완료 되었습니다.</Div>
                                <Div my={20} fontSize={14} fg={'dark'} mt={10}>
                                    제출하신 서류는 관리자 검토 예정이며(최대 3일 이내)
                                    <Div>승인 후 KYC 신원 확인이 정상적으로 완료됩니다.</Div>
                                    <Div>승인여부는 Push 알림 및 이메일을 통해 안내될 예정입니다.</Div>
                                </Div>

                                <Div>
                                    <Link to={'/home/1'} mr={10}><Button width={100} bg={'white'} bc={'light'} py={10}>홈화면</Button></Link>
                                    <Link to={'/mypage'}><Button width={100} bg={'white'} bc={'light'} py={10}>마이페이지</Button></Link>
                                </Div>
                            </Div>
                        </Body>
                }
            </Fragment>
        )
    }

}