import React, { Component, Fragment } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ShopXButtonNav } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'
import {Server} from "~/components/Properties";
import {Button, Div, Span} from "~/styledComponents/shared";
import {getConsumer, getRecommenderInfo} from "~/lib/shopApi";
import {Webview} from "~/lib/webviewApi";

import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";

import GradeTable from "./layout/GradeTable";
import DetailBox from "./layout/DetailBox";

export default class IosKakaoLink extends Component {
    constructor(props) {
        super(props)

        const params = new URLSearchParams(props.location.search)
        let inviteCode = params.get('inviteCode');

        this.state = {
            inviteCode : inviteCode,        // 로그인한 소비자의 친구초대코드
        }
        this.kakaoButton = React.createRef(); //ref setting
    }

    componentDidMount() {
        this.linkKakaoInvite();//초기세팅. -> 실행..

        //console.log(this.kakaoButton)
        // this.kakaoButton.click();
    }

    linkKakaoInvite = () => {

        //ios모바일 앱지미나, web방식 테스트  => 화면 하단에 마켓블리 홈 버튼 살리기 위해서 iFrame테스트 중,

        window.Kakao.Link.createDefaultButton({
            container: '#kakao-link',

            //버튼없이 전송.
            // window.Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: '농식품 先구매로 善한 쇼핑몰!',
                description: '추천인코드: ' + this.state.inviteCode,
                imageUrl: 'https://marketbly.com/images/YP8BMgIo98I4.png',
                link: {
                    mobileWebUrl: Server.getFrontURL() + '/?inviteCode=' + this.state.inviteCode, //home에서 inviteCode를 localStorage에 저장 함
                    webUrl: Server.getFrontURL() + '/?inviteCode=' + this.state.inviteCode
                }
            },
        });

    }

    kakaoLinkClick = () => {
        window.open('https://sharer.kakao.com/talk/friends/picker/link')
    }

    render() {

        return(
            <Div>

                <Div p={16}>


                    {/*<Button ref={this.kakaoButton} block bg={'#ffe812'} py={10} id="kakao-link" onClick={this.linkKakaoInvite} >카카오톡으로 친구 초대하기-IOS</Button>*/}
                    <Button
                        block
                        bg={'#ffe812'}
                        py={10}
                        my={10}
                        ref={(el) => this.kakaoButton = el}
                        id='kakao-link'
                        onClick={this.kakaoLinkClick} >카카오톡으로 친구 초대하기</Button >
                    <Div my={25}>
                        <Div bold>
                            활동 보상 내역 안내
                        </Div>
                        <Div fontSize={12} mb={10}>
                            친구초대 시 적립되는 금액은 레벨에 따라 다르게 반영됩니다.
                        </Div>

                        <GradeTable/>

                    </Div>

                    <DetailBox/>

                </Div>
            </Div>
        )
    }
}