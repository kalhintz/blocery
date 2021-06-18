import React, {Component, Fragment, lazy, Suspense, useState, useEffect} from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ShopXButtonNav, Sticky } from '~/components/common/index'
import ComUtil from '~/util/ComUtil'
import {getConsumer, getRecommenderInfo, updateConsumerRecommenderNo} from '~/lib/shopApi'
import { Webview } from "~/lib/webviewApi";
import {Server} from '~/components/Properties'
import { Button, Div, Span, Flex, Hr, Right, Input } from '~/styledComponents/shared'
import {Modal, ModalBody, ModalFooter, ModalHeader, Row, Col, CardGroup, Card, CardBody, CardTitle, CardText} from "reactstrap";
import styled from "styled-components";
import {color} from '~/styledComponents/Properties'
import HeaderBox from "~/components/shop/goodsReviewList/HeaderBox";

import {IoIosCopy} from 'react-icons/io'
import {getValue} from "~/styledComponents/Util";
import loadable from "@loadable/component";
import CollapseItem from '~/components/common/items/CollapseItem'
// import GradeTable from "./layout/GradeTable";
// import DetailBox from "./layout/DetailBox";

const GradeTable = loadable(() => import('./layout/GradeTable'))
const DetailBox = loadable(() => import('./layout/DetailBox'))


// import CollapseItem from "~/components/shop/mypage/inviteFriend/layout/CollapseItem";
const InviteRanking = loadable(() => import('./InviteRanking'))
const BuyingRanking = loadable(() => import('./BuyingRanking'))

const RoundedContainer = styled(Flex)`
    // justify-content: space-between;
    // border: 1px solid ${color.light};
    border-radius: ${getValue(5)};
    background-color: ${color.background};
    & > div {
        border-right: 1px solid ${color.white};
        flex: 1 1 0; //flex-grow, flex-shrink, flex-basis
        padding: ${getValue(10)};
    }
    
    & > div:last-child {
        border: 0;
    }
`;

// const InviteFriend = (props) => {
//     const [state, setState] = useState({
//         recommenderNo: 0,       // 추천인 소비자 번호
//         inviteCode : '',        // 로그인한 소비자의 친구초대코드
//         consumerNo: 0,
//         name: '',
//         receivePush: false,
//         isOpen: false,       // 추천인코드입력 모달
//         recommenderCode : '',    // 입력한 추천인 코드
//         recommendInfo: {},
//         tabId: '1',
//         rankingData: {}
//     })
//
//     useEffect(() => {
//         await this.search(); //inviteCode 저장 대기.
//
//         this.linkKakaoInvite();
//
//         this.getInviteRanking();
//     }, [])
// }

export default class InviteFriend extends Component {
    constructor(props){
        super(props)
        this.state = {
            recommenderNo: 0,       // 추천인 소비자 번호
            inviteCode : '',        // 로그인한 소비자의 친구초대코드
            consumerNo: 0,
            name: '',
            receivePush: false,
            isOpen: false,       // 추천인코드입력 모달
            recommenderCode : '',    // 입력한 추천인 코드
            recommendInfo: {},
            tabId: '1',
            rankingData: {}
        }
    }

    async componentDidMount() {
        await this.search(); //inviteCode 저장 대기.
        this.linkKakaoInvite();
        alert(`친구 초대 서비스는 일시중단 되었습니다.(불법 이용 감지) ※ 신규 회원가입 쿠폰 지급 이벤트는 계속 진행중입니다.
        친구초대 리워드 서비스 관련해서
        악의적이고 불법적인 방법으로 이용하시는 분들이 확인되어
        기존 회원분들과 타 고객의 피해를 줄이고자
        친구초대 리워드 지급이 잠정 중단되었습니다.
        자세한 내용은 공지사항을 참고해 주세요.`)
    }

    search = async () => {
        const {data:loginUser} = await getConsumer();

        const inviteCode = ComUtil.encodeInviteCode(loginUser.consumerNo)

        const {data: recommendInfo} = await getRecommenderInfo();

        this.setState({
            inviteCode: inviteCode,
            consumerNo: loginUser.consumerNo,
            // name: loginUser.name,
            // receivePush: loginUser.receivePush,
            recommenderNo: loginUser.recommenderNo,
            recommendInfo: recommendInfo,
        });
    }

    linkKakaoInvite = () => {
        //web Test : Web에서는 이 설정이 우선시 적용됨.
        window.Kakao.Link.createDefaultButton({
            container: '#kakao-web-btn',
            objectType: 'feed',
            content: {
                title: '농식품 先구매로 善한 쇼핑몰!',
                description: '추천인코드: ' + this.state.inviteCode,
                imageUrl: 'https://marketbly.com/images/YP8BMgIo98I4.png',
                link: {
                    mobileWebUrl: Server.getFrontURL() + '/?inviteCode=' + this.state.inviteCode, //home에서 inviteCode를 localStorage에 저장 함
                    webUrl: Server.getFrontURL() + '/?inviteCode=' + this.state.inviteCode
                },
                // buttons: [
                //     {
                //         title: '마켓블리로 이동',
                //         link: {
                //             mobileWebUrl: Server.getFrontURL() ,
                //             webUrl: Server.getFrontURL()
                //         },
                //     },
                // ]
            },
        });
    }

    // consumerNo로 추천코드 생성
    createCode = async () => {
        const {data:loginUser} = await getConsumer();

        const inviteCode = ComUtil.encodeInviteCode(loginUser.consumerNo)
        this.setState({inviteCode});
    }

    userAlert = () => alert('친구 초대 서비스는 일시중단 되었습니다. \n공지사항을 참고해 주세요')


    kakaoLinkClick = () => {

        if (this.state.consumerNo != 21530) { //cobak유저는 추천 진행.
            this.userAlert()
            return;
        }

        //mobileApp test.
        //if (ComUtil.isMobileApp()) {      //android + iOS적용
        if (ComUtil.isMobileAppAndroid()) {  //android만 적용시. -20200104(ios검수포기)
            let urlObject = {
                title     : '농식품 先구매로 善한 쇼핑몰!',
                desc      : '추천인코드: ' + this.state.inviteCode,
                url       : Server.getFrontURL() + '/?inviteCode=' + this.state.inviteCode,  //home에서 inviteCode를 localStorage에 저장 함
                imageUrl  : 'https://marketbly.com/images/YP8BMgIo98I4.png',
            };
            Webview.kakaoDetailLink(urlObject);
        }
        else { //ios Only -20200104(ios검수포기)  - //Web에서는 이부분 타고 설정은 componentDidMount를 이용함.

            // if (ComUtil.isMobileAppIos()) {
            //     Webview.openPopup('/mypage/iosKakaoLink?inviteCode=' + this.state.inviteCode);
            Webview.openPopup('/mypage/iosKakaoLink?inviteCode=' + this.state.inviteCode);

            // }
            // else {
            //     window.open('https://sharer.kakao.com/talk/friends/picker/link'); //미사용 코드인듯
            // }
        }
    }

    onCopyCode = () => {

        if (this.state.consumerNo != 21530) { //cobak유저는 추천 진행.
            this.userAlert()
            return;
        }

        ComUtil.copyTextToClipboard(
            this.state.inviteCode,
            '코드가 복사되었습니다',
            '코드 복사에 실패했습니다. text창에서 길게 눌러 복사해 주세요'
        )
    }

    modalEnterCode = async () => {
        this.setState({ isOpen: true })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    onConfirm = async () => {
        let data = {};
        data.consumerNo = this.state.consumerNo;
        data.recommenderNo = ComUtil.decodeInviteCode(this.state.recommenderCode);
        if (!(this.state.recommenderCode) || this.state.recommenderCode.length != 7 || data.recommenderNo === 0) {
            alert('추천인 코드 형식이 잘못되었습니다. 다시한번 확인 바랍니다.')
            return false;
        }
        if (data.consumerNo === data.recommenderNo) {
            alert('본인의 코드는 추천인으로 입력할 수 없습니다.')
            return false;
        }
        let modified = {};
        if(this.state.consumerNo != data.recommenderNo) {
            modified = await updateConsumerRecommenderNo(data)
        }
        if(modified.data === 1) {
            alert('친구의 추천인 코드가 정상적으로 입력되었습니다.')
            this.setState({isOpen:false})
            this.search();
        } else {
            alert('입력하신 추천코드는 사용할 수 없습니다. 친구 추천코드를 다시 한번 확인 후 입력해 주세요.')
            return false;
        }
    }

    onCancel = () => {
        this.setState({
            isOpen: false,
            recommenderCode: ''
        })
    }

    onHeaderClick = (tabId) => {
        this.setState({ tabId })
    }

    render() {

        let isMobileApp = ComUtil.isMobileApp();

        return(
            <Fragment>
                <ShopXButtonNav underline historyBack>친구초대</ShopXButtonNav>

                <Flex flexDirection={'column'} px={16} py={25}>
                    <Div fg={'dark'} fontSize={12}>내 친구초대 코드</Div>
                    <Flex justifyContent={'center'} fontSize={25} mb={20} >
                        <Flex cursor onClick={this.onCopyCode}>
                            <Div fw={500} mr={5}>{this.state.inviteCode}</Div>
                            <IoIosCopy fontSize={22}/>
                        </Flex>
                    </Flex>

                    {isMobileApp &&
                    <Button block bg={'#ffe812'} py={10} onClick={this.kakaoLinkClick}>카카오톡으로 친구 초대하기</Button>
                    }
                    {!isMobileApp &&
                    <Button block bg={'#ffe812'} py={10} id="kakao-web-btn" onClick={this.kakaoLinkClick}>카카오톡으로 친구 초대하기</Button>
                    }
                </Flex>




                <Hr p={0} />

                <Div px={16} py={25}>
                    <Flex mb={10}>
                        <Div fw={500}>내 활동 집계</Div>
                        <Right>
                            {/*<Button bg='white' bc={'light'} fg={'black'} px={10} fontSize={12} onClick={this.modalEnterCode}>추천인 코드 입력</Button>*/}
                            {
                                this.state.recommenderNo != 0 && <span>추천인 코드  :  {ComUtil.encodeInviteCode(this.state.recommenderNo)}</span>
                            }
                        </Right>
                    </Flex>
                    <RoundedContainer>
                        <Div p={5}>
                            <Div fontSize={12}>내 활동 레벨</Div>
                            <Flex justifyContent={'center'} bold textAlign={'center'} minHeight={50}>
                                <Div bold mr={3} fontSize={18}>
                                    {this.state.recommendInfo.recommendLevelStr}
                                </Div>
                            </Flex>
                        </Div>
                        <Div p={5}>
                            <Div fontSize={12}>친구초대 수</Div>
                            <Flex justifyContent={'center'} minHeight={50}>
                                <Div bold mr={3} fontSize={18} >{this.state.recommendInfo.friendCount}</Div>
                                <Div fontSize={12}>명</Div>
                            </Flex>
                        </Div>
                        <Div p={5}>
                            <Div fontSize={12}>총 누적금액</Div>
                            <Flex justifyContent={'center'} minHeight={50} fg={'bly'}>
                                <Div bold mr={3} fontSize={18} >{this.state.recommendInfo.totalReward}</Div>
                                <Div fontSize={12}>BLY</Div>
                            </Flex>
                        </Div>
                    </RoundedContainer>

                    <Div mt={25}>
                        <CollapseItem title={'활동 보상 내역 안내'} >
                            <Div py={16}>
                                <Div fontSize={12} mb={10}>친구초대 시 적립되는 금액은 레벨에 따라 다르게 반영됩니다.</Div>
                                <GradeTable />
                                <br/>
                                <DetailBox />
                            </Div>
                        </CollapseItem>
                    </Div>

                </Div>

                <Hr />
                <Flex cursor>
                    {/*<div className='d-flex bg-white cursor-pointer' style={{boxShadow: '1px 1px 2px gray'}}>*/}
                    <HeaderBox text={`친구초대랭킹`} tabId={this.state.tabId} active={this.state.tabId === '1'} onClick={this.onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`구매랭킹`} tabId={this.state.tabId} active={this.state.tabId === '2'} onClick={this.onHeaderClick.bind(this, '2')}/>
                    {/*</div>*/}
                </Flex>



                <Div>
                    {
                        this.state.tabId === "1" ?
                            <InviteRanking data={this.state.rankingData} /> :
                            <BuyingRanking data={this.state.rankingData}  />
                    }
                </Div>

                {/*웹용 링크*/}
                {/*<p m={10} className='text-center font-weight-bold' id="kakao-web-btn" onClick={this.kakaoLinkClick}>카카오 링크 테스트(web)</p>*/}
                <br/>
                <br/>
                <br/>
                {/*mobileApp용 링크*/}
                {/*<Button bc={'secondary'} onClick={this.kakaoLinkClick}>카카오 링크 테스트2(phoneApp)</Button>*/}
                <br/>
                <br/>

                {/*추천인코드 입력 모달*/}
                {
                    this.state.isOpen &&
                    <Modal isOpen={true} centered>
                        <ModalHeader>추천인 코드 입력</ModalHeader>
                        <ModalBody>
                            {
                                this.state.recommenderNo !== 0 ?
                                    <Div textAlign={'center'} bg={'backgroundDark'} py={10}>
                                        추천인 코드  :  {ComUtil.encodeInviteCode(this.state.recommenderNo)}
                                    </Div>
                                    :
                                    <Div>
                                        <Input block placeholder="추천인 코드를 입력해주세요." name="recommenderCode" onChange={this.handleChange} value={this.state.recommenderCode}
                                        />
                                    </Div>
                            }
                            {/*<Div mt={10} fontSize={12}>- <Span fg={'danger'}>내가 상품 구매시 추천한 친구에게 정해진 % 만큼 적립 됩니다.</Span></Div>*/}

                            <Div mt={10} fontSize={12}>- <u>한번 등록한 추천코드는 변경이 불가능</u>합니다.</Div>
                        </ModalBody>
                        <ModalFooter>
                            {
                                this.state.recommenderNo === 0 && <Button px={10} bg={'bly'} fg={'white'} onClick={this.onConfirm}>저장</Button>
                            }
                            <Button px={10} bg={'white'} bc={'secondary'} onClick={this.onCancel}>닫기</Button>
                        </ModalFooter>
                    </Modal>
                }

            </Fragment>
        )
    }
}