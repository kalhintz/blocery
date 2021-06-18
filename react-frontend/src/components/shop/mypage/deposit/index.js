import React, { Component, Fragment } from 'react';
import { ShopXButtonNav } from '../../../common'
import { Div, Span, Button, Flex, Hr } from '~/styledComponents/shared'
import { Label } from 'reactstrap';
import { newAllocateSwapAccount, depositLastCheckDay} from '~/lib/swapApi'  //newDeposit으로 변경하면서 제거 , getBlyBalanceByConsumerNo, getAlreayDepositBly } from '~/lib/swapApi'
import { BlockChainSpinner } from '~/components/common'
import moment from 'moment'
import {ScrollDummy, scrollIntoView} from '~/components/common/scrollDummy/ScrollDummy'
import { QRCode } from "react-qr-svg";
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'
import {getValue} from '~/styledComponents/Util'
import {color} from "~/styledComponents/Properties";
import Checkbox from '~/components/common/checkboxes/Checkbox'
import {getConsumer} from "~/lib/shopApi";
import {isAbuser} from "~/lib/donAirDropApi";

const Card = styled(Div)`
    background: ${color.white};
    border-radius: ${getValue(6)};
    margin-bottom: ${getValue(16)};
    padding: ${getValue(25)} ${getValue(16)};
`;
const CheckBoxFlex = styled(Flex)`
    
    align-items: flex-start;
    
    & > span:first-child {
        padding: 0;
        margin-right: ${getValue(8)};
    }
`;


export default class Deposit extends Component {
    constructor(props){
        super(props)
        this.state = {
            ercAccount : '',
            blyBalance : 0,
            chainLoading: false,
            errorText: "",
            midNightMoment: "",
            // modal: false,
            agree01: false,
            abuser: false
        }
    }

    componentDidMount = async() => {
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        let {data:abuser} = await isAbuser();
        this.setState({
            abuser: abuser
        })

        this.setCountDownDate();
        this.onGetErcAccount();
        depositLastCheckDay();
    }


    setCountDownDate = () => {

        let mmtMidnight = moment().endOf('day');
        // console.log(mmtMidnight);
        this.setState({
            midNightMoment: mmtMidnight
        })

    }

    onGetErcAccount = async() => {

        let {data:result} = await newAllocateSwapAccount()
        //console.log(result);

        this.setState({
            ercAccount: result,
        })
    }

    onCopyErcAccount = () => {
        ComUtil.copyTextToClipboard(
            this.state.ercAccount,
            '주소를 복사했습니다',
            '주소 복사에 실패했습니다. text창에서 길게눌러 복사해 주세요'
        )
    }

    // onGetBlyBalance = async() => {
    //     // this.setState({
    //     //     errorText: ""
    //     // })
    //
    //     let errorText = ''
    //
    //     this.setState({errorText: errorText})
    //
    //     let {data:balance} = await getBlyBalanceByConsumerNo();
    //     //console.log("balance : ", balance);
    //
    //     let {data} = await getAlreayDepositBly();
    //     //console.log("alreadyDepositBly : ", data);
    //
    //     const result = parseFloat(data.needDeposit);
    //     //console.log("result : ", result);
    //
    //     if(result === 0 || result < 0) {
    //         errorText = "입금된 내역이 없습니다. 확인 후 다시 진행해 주세요."
    //
    //     } else {
    //
    //         this.setState({
    //             // errorText: "",
    //             chainLoading:true
    //         })
    //
    //         let {data:swapResult} = await swapBlyToBlct(data.needDeposit);
    //
    //         // * 0    controller에서 로그인체크시 Null
    //         // * 200  성공
    //         // * 100  스왑진행중
    //         // * 101  사용자의 BLCT를 manager에게 전송 실패. 사용자가 스왑자체를 다시 요청해야함.
    //
    //         // let errorText = ""
    //         switch (swapResult) {
    //             case 0:
    //                 errorText = "로그인 해주세요";
    //                 break;
    //             case 100 :
    //                 errorText = "이미 토큰스왑이 진행중입니다. 결과를 기다려주세요.";
    //                 break;
    //             case 101 :
    //                 errorText = "입금중 중 오류가 발생했습니다. 다시 시도해주세요.";
    //                 break;
    //             case 200 :
    //                 errorText = "";
    //                 // this.setState({
    //                 //     blyBalance: result,
    //                 //     chainLoading: false,
    //                 // })
    //                 break;
    //         }
    //
    //         this.setState({
    //             // errorText: errorText,
    //             blyBalance: result,
    //             chainLoading: false
    //         }, this.messageAndGoBack(result))
    //     }
    //
    //     this.setState({errorText: errorText})
    //
    //     scrollIntoView(this.messagesEnd)
    // }

    messageAndGoBack = (result) => {
        setTimeout(() => {
            alert(`${ComUtil.addCommas(result)}가 입금되었습니다!`)
            this.props.history.goBack()
        }, 500)
    }

    // modalToggle = () => this.setState({modal: !this.state.modal})

    onCheckBoxChange = (e) => {
        this.setState({
            [e.target.id]: e.target.checked
        })
    }

    render() {

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <ShopXButtonNav fixed underline historyBack>입금</ShopXButtonNav>
                <Div p={15} bg={'background'} fg={'darkBlack'} fontSize={12} lineHeight={20}>
                    <Span>블록체인 네트워크 상태에 따라 자산이 해당 지갑에 완전히 전송되기까지 상당시간 소요될 수 있습니다.</Span>
                </Div>
                <Hr/>

                <Div p={16} bg={'backgroundDark'}>

                    <Card>
                        {/*<Div fontSize={10} fg={'secondary'}>Step. 1</Div>*/}
                        <Div fw={500}>지갑주소</Div>
                        {this.state.abuser ?
                            <Div fontSize={12} mt={20}>
                                보안로직 자동감지로 인해, 입금이 일시정지 중입니다. 고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.
                            </Div> :
                            <Div>
                                <Flex justifyContent={'center'} mb={16} mt={10}>
                                    <QRCode
                                        bgColor="#FFFFFF"
                                        fgColor="#000000"
                                        level="Q"
                                        style={{width: 150}}
                                        value={this.state.ercAccount}
                                    />
                                </Flex>

                                <Flex
                                    bc={'green'} fg={'darkBlack'} fontSize={10} rounded={5} p={8}
                                    justifyContent={'space-between'}
                                >
                                    <Div style={{wordBreak: 'break-all'}}>{this.state.ercAccount}</Div>
                                    <Div flexShrink={0} cursor={1} onClick={this.onCopyErcAccount}>주소복사</Div>
                                </Flex>
                            </Div>
                        }
                    </Card>

                    <Card shadow={'sm'}>
                        <Div fw={500}>최소 입금 금액 : 200 BLY</Div>
                        <Div fontSize={12} mt={20}>200 BLY 이상 입금시에 자동 처리됩니다.</Div>
                        {/*<Div fw={500}>최소 입금 금액 : 3,000 BLY</Div>  /!* TODO donAirDrop 임시 금액*!/*/}
                        {/*<Div fontSize={12} mt={20}>3,000 BLY 이상 입금시에 자동 처리됩니다.</Div>*/}
                        <Div fontSize={12} mt={20}>입금 주소가 바뀔 수 있으므로, 입금하실 때마다 지갑주소를 확인해 주세요.</Div>
                        <Div fontSize={12} mt={20}>BLY 외에 다른 토큰을 송금하면 유실되며, 마켓블리에서 책임지지 않으니 유의하시기 바랄게요!</Div>
                    </Card>


                {/*    <Card shadow={'sm'}>*/}
                {/*        <Div fontSize={10} fg={'secondary'}>Step. 2</Div>*/}
                {/*        <Div fw={500}>이체</Div>*/}
                {/*        <Div fontSize={12} mt={20}>위에 있는 내 지갑주소로 이체 후 아래 [입금확인 및 수령] 버튼을 눌러주세요.</Div>*/}
                {/*    </Card>*/}


                {/*    <Card shadow={'sm'}>*/}
                {/*        <Div fontSize={10} fg={'secondary'}>Step. 3</Div>*/}
                {/*        <Div mb={5} fw={500}>입금확인</Div>*/}
                {/*        <Div mt={20} mb={10}>*/}
                {/*            <CheckBoxFlex alignItems={'flex-start'}>*/}
                {/*                <Checkbox*/}
                {/*                    id={'agree01'}*/}
                {/*                    bg={'green'} onChange={this.onCheckBoxChange}*/}
                {/*                          size={'sm'}*/}
                {/*                >*/}
                {/*                    <Span fontSize={13} fg={this.state.agree01 ? 'darkBlack' : 'dark'}>타거래소의 출금완료를 확인했습니다.</Span>*/}
                {/*                </Checkbox>*/}
                {/*            </CheckBoxFlex>*/}
                {/*        </Div>*/}
                {/*        <Button disabled={(this.state.ercAccount === '' || !this.state.agree01)} fontSize={16} my={10} py={12} bg={'green'} fg={'white'} block rounded={2} onClick={this.onGetBlyBalance} >입금확인 및 수령</Button>*/}
                {/*        <Div>*/}
                {/*            {*/}
                {/*                (!this.state.errorText && this.state.blyBalance > 0) && (*/}
                {/*                    <Div bold textAlign={'center'}>*/}
                {/*                        <Span fg={'green'}>{`${ComUtil.addCommas(this.state.blyBalance)}`}</Span>*/}
                {/*                        <Span>{`${'가 입금되었습니다'}`}</Span>*/}
                {/*                    </Div>*/}
                {/*                )*/}
                {/*            }*/}
                {/*            <Div fg={'danger'} mt={3} fontSize={14} textAlign={'center'}> {this.state.errorText} </Div>*/}
                {/*        </Div>*/}

                {/*    </Card>*/}
                {/*    <ScrollDummy ref={(el) => this.messagesEnd = el} />*/}

                </Div>



            </Fragment>
        )
    }
}

