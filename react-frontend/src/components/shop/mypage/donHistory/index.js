import React, { Component, Fragment } from 'react';
import { getDonTotal, getMyDonAirdropHistory, withdrawDonStatus } from '~/lib/donAirDropApi';
import {getConsumer, getMyTokenHistory} from '~/lib/shopApi'
import {ModalPopup, ShopXButtonNav} from "~/components/common";
import {Button, Div, Flex, Span, Right} from '~/styledComponents/shared'
import Skeleton from "~/components/common/cards/Skeleton";
import ComUtil from "~/util/ComUtil";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {color} from "~/styledComponents/Properties";
import {BsBoxArrowUpRight} from "react-icons/bs";
import {HrHeavyX2, HrThin} from "~/styledComponents/mixedIn";
import {withRouter} from 'react-router-dom'

const HistoryItem = ({bly, date, title, subTitle, gubun}) =>
    <Div>
        <Flex p={16} alignItems={'flex-start'}>
            <Div>
                <Div fontSize={16} mb={4}>{title}</Div>
                {
                    subTitle && <Div fontSize={12} fg={'dark'} mb={4}>{subTitle}</Div>
                }
                <Div fontSize={10} fg={'secondary'}>{ComUtil.utcToString(date, 'YYYY-MM-DD')}</Div>
            </Div>
            {
                <Right bold fontSize={16} fg={'green'} flexShrink={0}>
                    {
                        gubun === -1 ?
                            (<Span fg={'danger'}>- {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                            : (<Span fg='green'>+ {ComUtil.addCommas(ComUtil.toNum(bly).toFixed(2))}</Span>)
                    }
                </Right>
            }
        </Flex>
        <HrThin m={0} />
    </Div>

class DonHistory extends Component {
    constructor(props) {
        super(props)
        this.state = {
            tokenBalance: '',
            donnieBalance: '',
            withdrawStatus: 0,
            donList: null,
            isOpen: false,
        }

    }

    async componentDidMount() {
        const {data: donHistoryData} = await getDonTotal();
        this.setState({
            tokenBalance: donHistoryData
        })

        const {data: tokenHistoryData} = await getMyDonAirdropHistory()

        const {data: withdrawStatus} = await withdrawDonStatus();

        console.log(tokenHistoryData)
        // const tokenHistories = tokenHistoryData.tokenHistories

        ComUtil.sortDate(tokenHistoryData, 'date', true);

        this.setState({
            donList: tokenHistoryData,
            withdrawStatus: withdrawStatus
        })
    }

    modalToggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    //출금클릭
    onWithDrawClick = (type) => {
        if (type === 'ercDon') {

            alert('[IOST와 에어드랍 일정 조율로 인한 출금 지연]\n' +
                '- DON 토큰을 지원하는 거래소의 IOST 에어드랍이 모두 완료되지 않아, DON토큰 출금이 지연되고 있습니다.\n' +
                '완료 후 별도 공지를 통해 소식을 알려드리도록 하겠습니다.');

            return

            //ercDon 오픈시  uncomment
            // this.props.history.push({
            //     pathname: '/kakaoCertCheck',
            //     state: {
            //         tokenName: 'ercDon',
            //     }
            // })
            // return
        }

        this.props.history.push({
            pathname: '/kakaoCertCheck',
            state: {
                tokenName: 'ircDon',
            }
        })
    }

    render() {
        const {
            tokenBalance,       //전체 DON
            availableBalance,   //가용 DON
            withdrawStatus,     //don 출금상태 조회 (1:승인필요 2:승인완료  3:출금완료)
            loginUser,
            account,
            donList,
            copied,
            isOpen,
            onlyIpChul,
        } = this.state
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>자산(DON)</ShopXButtonNav>

                <Div p={30} pb={26}>
                    <Div textAlign={'left'} mb={20}>
                        {
                            (withdrawStatus === 1 || withdrawStatus === 2) &&
                            <Div fontSize={13} bg={'danger'} fg={'white'} rounded={4} display={'inline-block'} px={10} py={3} onClick={()=> alert('관리자 승인 후 출금 됩니다.')}>
                                <Flex>
                                    <Span mr={5}>출금신청중</Span>
                                    <AiOutlineInfoCircle />
                                </Flex>
                            </Div>

                        }
                        <Div bold fontSize={37}>
                            {ComUtil.addCommas(parseFloat(tokenBalance).toFixed(2))} DON
                        </Div>
                    </Div>

                    <Flex fg={'adjust'} fontSize={13}>
                        <Div>
                            <Flex dot alignItems={'flex-start'} mb={5}>
                                <Div>DON 토큰은 보유하고 계신 BLY 토큰을 기준으로 에어드랍이 됩니다.
                                    <Span fg={'primary'} ml={5} cursor onClick={this.modalToggle}><u>자세히 보기</u></Span>
                                </Div>
                            </Flex>
                            <Flex dot alignItems={'flex-start'}>
                                <Div>기간 : 2021년 2월 19일 ~ 2월 28일</Div>
                            </Flex>
                        </Div>
                    </Flex>

                    <Flex mt={20}>
                        <Div flexGrow={1} pr={5}>
                            <Button bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.onWithDrawClick.bind(this, 'ircDon')}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowUpRight size={20}/>
                                    <Div ml={8}>IRC 출금</Div>
                                </Flex>
                            </Button>
                        </Div>
                        <Div flexGrow={1} pl={5}>
                            <Button bg={'white'} bc={'light'} rounded={2} py={10} fontSize={13} block onClick={this.onWithDrawClick.bind(this, 'ercDon')}>
                                <Flex justifyContent={'center'} alignItems={'flex-start'}>
                                    <BsBoxArrowUpRight size={20}/>
                                    <Div ml={8}>ERC 출금</Div>
                                </Flex>
                            </Button>
                        </Div>
                    </Flex>

                </Div>

                <HrHeavyX2 m={0} bc={'background'} />
                {
                    !donList ? <Skeleton.List count={4}/> :
                        (donList.length === 0) ?
                            <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                            donList.map((history, index)=> {
                                if (onlyIpChul) {
                                    if (history.type !== 'in' && history.type !== 'out')
                                        return null
                                }
                                return <HistoryItem key={`token_${index}`} {...history} />
                            })

                }

                {
                    this.state.isOpen &&
                    <ModalPopup title={'DON 토큰 에어드랍 안내'}
                                onClick={this.modalToggle}
                                content={
                                    <Div lineHeight={20} fontSize={13}>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                DON 토큰은 <b>보유하고 계신 BLY 토큰을 기준으로 에어드랍</b>이 됩니다.
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                외부 거래소(지갑)에서 마켓블리 App으로 BLY 토큰을 입금하면 반영이 됩니다.<br/>
                                                <b>※ 최소 입금 금액 : 3,000 BLY</b>
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                매일 23:59:59 이전 입금 완료된 BLY를 기준으로 스냅샷이 진행됩니다.
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                BLY 토큰을 계속 가지고 계시면 가중치가 적용되어 추가 지급됩니다.
                                                <Span lighter>(가중치는 3월 2일 일괄 지급)</Span>
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'} mb={8}>
                                            <Div>
                                                DON 토큰은 3월 2일 부터 출금 가능 예정입니다.<br/>
                                                ※ 최소 출금 금액 : 10DON(추후 조정 가능)<br/>
                                                <Span lighter>단, 10DON 미만인 경우 BLY로 전환하여 지급할 예정입니다.</Span>
                                            </Div>
                                        </Flex>
                                        <Flex dot alignItems={'flex-start'}>
                                            <Div>
                                                에어드랍 비율<br/>
                                                ※ 일 지급 물량 : (보유 BLY / 총입금 BLY) X 20,000 DON<br/>
                                                ※ 가중치 지급 : (총 받은 DON / 200,000DON) X 50,000 DON
                                            </Div>
                                        </Flex>
                                    </Div>

                                }

                    />

                }

            </Fragment>
        )
    }

}
export default withRouter(DonHistory)
