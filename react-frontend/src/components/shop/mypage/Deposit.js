import React, { Component, Fragment } from 'react';
import { ShopXButtonNav } from '../../common'
import { Div, Span, Button, Flex, Hr } from '~/styledComponents/shared'
import { Label } from 'reactstrap';
import { allocateSwapAccount, getBlyBalanceByConsumerNo, swapBlyToBlct, getAlreayDepositBly } from '~/lib/swapApi'
import { BlockChainSpinner } from '~/components/common'
import moment from 'moment'
import {ScrollDummy, scrollIntoView} from '~/components/common/scrollDummy/ScrollDummy'
import { QRCode } from "react-qr-svg";
import ComUtil from '~/util/ComUtil'
import styled from 'styled-components'
import {getValue} from '~/styledComponents/Util'
import {color} from "~/styledComponents/Properties";
import Checkbox from '~/components/common/checkboxes/Checkbox'

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
            agree01: false
        }
    }

    componentDidMount = async() => {

        this.setCountDownDate();
        this.onGetErcAccount();
    }


    setCountDownDate = () => {

        let mmtMidnight = moment().endOf('day');
        // console.log(mmtMidnight);
        this.setState({
            midNightMoment: mmtMidnight
        })

    }

    onGetErcAccount = async() => {

        let {data:result} = await allocateSwapAccount()
        console.log(result);

        this.setState({
            ercAccount: result.swapAccount,
        })
    }

    onCopyErcAccount = () => {
        this.copyTextToClipboard(this.state.ercAccount);
    }

    // 주소를 클립보드에 복사하기
    fallbackCopyTextToClipboard = (text) => {
        let textArea = document.createElement("textarea");
        textArea.value = text;

        document.body.appendChild(textArea);
        textArea.readOnly = true;
        textArea.focus();
        textArea.select();

        try {
            let successful = document.execCommand('copy');
            let msg = successful ? '주소를 복사했습니다' : '주소 복사에 실패했습니다. text창에서 길게눌러 복사해 주세요';
            alert(msg);
            // console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }

        document.body.removeChild(textArea);
    }


    copyTextToClipboard = (text) => {
        if (!navigator.clipboard) {
            this.fallbackCopyTextToClipboard(text);
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                alert("주소가 복사되었습니다");
            })
            .catch(err => {
                // This can happen if the user denies clipboard permissions:
                this.fallbackCopyTextToClipboard(text);
                // alert("주소 복사에 실패했습니다. 다시 복사해주세요."+err.message);
            });
    }

    onGetBlyBalance = async() => {
        // this.setState({
        //     errorText: ""
        // })

        let errorText = ''

        this.setState({errorText: errorText})

        let {data:balance} = await getBlyBalanceByConsumerNo();
        console.log("balance : ", balance);

        let {data} = await getAlreayDepositBly();
        console.log("alreadyDepositBly : ", data);

        const result = parseFloat(data.needDeposit);
        console.log("result : ", result);

        if(result === 0 || result < 0) {
            errorText = "입금된 내역이 없습니다. 확인 후 다시 진행해 주세요."

        } else {

            this.setState({
                // errorText: "",
                chainLoading:true
            })

            let {data:swapResult} = await swapBlyToBlct(data.needDeposit);

            // * 0    controller에서 로그인체크시 Null
            // * 200  성공
            // * 100  스왑진행중
            // * 101  사용자의 BLCT를 manager에게 전송 실패. 사용자가 스왑자체를 다시 요청해야함.

            // let errorText = ""
            switch (swapResult) {
                case 0:
                    errorText = "로그인 해주세요";
                    break;
                case 100 :
                    errorText = "이미 토큰스왑이 진행중입니다. 결과를 기다려주세요.";
                    break;
                case 101 :
                    errorText = "입금중 중 오류가 발생했습니다. 다시 시도해주세요.";
                    break;
                case 200 :
                    errorText = "";
                    // this.setState({
                    //     blyBalance: result,
                    //     chainLoading: false,
                    // })
                    break;
            }

            this.setState({
                // errorText: errorText,
                blyBalance: result,
                chainLoading: false
            }, this.messageAndGoBack(result))
        }

        this.setState({errorText: errorText})

        scrollIntoView(this.messagesEnd)
    }

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
                    <Span>블록체인 네트워크 상태에 따라 자산이 해당 지갑에 완전히 전송되기까지 다소 시간이 걸릴 수 있습니다.</Span>
                </Div>
                <Hr/>

                <Div p={16} bg={'backgroundDark'}>

                    <Card>
                        <Div fontSize={10} fg={'secondary'}>Step. 1</Div>
                        <Div fw={500}>지갑주소</Div>

                        <Flex justifyContent={'center'} mb={16} mt={10}>
                            <QRCode
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="Q"
                                style={{ width: 150 }}
                                value={this.state.ercAccount}
                            />
                        </Flex>

                        <Flex
                            bc={'green'} fg={'darkBlack'} fontSize={10} rounded={5} p={8} justifyContent={'space-between'}
                        >
                            <Div style={{wordBreak: 'break-all'}}>{this.state.ercAccount}</Div>
                            <Div flexShrink={0} cursor={1} onClick={this.onCopyErcAccount}>주소복사</Div>
                        </Flex>

                    </Card>


                    <Card shadow={'sm'}>
                        <Div fontSize={10} fg={'secondary'}>Step. 2</Div>
                        <Div fw={500}>이체</Div>
                        <Div fontSize={12} mt={20}>위에 있는 내 지갑주소로 이체 후 아래 [입금확인 및 수령] 버튼을 눌러주세요.</Div>
                    </Card>


                    <Card shadow={'sm'}>
                        <Div fontSize={10} fg={'secondary'}>Step. 3</Div>
                        <Div mb={5} fw={500}>입금확인</Div>
                        <Div mt={20} mb={10}>
                            <CheckBoxFlex alignItems={'flex-start'}>
                                <Checkbox
                                    id={'agree01'}
                                    bg={'green'} onChange={this.onCheckBoxChange}
                                          size={'sm'}
                                >
                                    <Span fontSize={13} fg={this.state.agree01 ? 'darkBlack' : 'dark'}>타거래소의 출금완료를 확인했습니다.</Span>
                                </Checkbox>
                            </CheckBoxFlex>
                        </Div>
                        <Button disabled={(this.state.ercAccount === '' || !this.state.agree01)} fontSize={16} my={10} py={12} bg={'green'} fg={'white'} block rounded={2} onClick={this.onGetBlyBalance} >입금확인 및 수령</Button>
                        <Div>
                            {
                                (!this.state.errorText && this.state.blyBalance > 0) && (
                                    <Div bold textAlign={'center'}>
                                        <Span fg={'green'}>{`${ComUtil.addCommas(this.state.blyBalance)}`}</Span>
                                        <Span>{`${'가 입금되었습니다'}`}</Span>
                                    </Div>
                                )
                            }
                            <Div fg={'danger'} mt={3} fontSize={14} textAlign={'center'}> {this.state.errorText} </Div>
                        </Div>

                    </Card>
                    <ScrollDummy ref={(el) => this.messagesEnd = el} />

                </Div>

                {/*/!* 결제비밀번호 조회 *!/*/}
                {/*<Modal isOpen={this.state.modal} centered>*/}
                    {/*<ModalHeader>지갑주소 - QR CODE</ModalHeader>*/}
                    {/*<ModalBody>*/}
                        {/*<Flex justifyContent={'center'} mb={16}>*/}
                            {/*<QRCode*/}
                                {/*bgColor="#FFFFFF"*/}
                                {/*fgColor="#000000"*/}
                                {/*level="Q"*/}
                                {/*style={{ width: 150 }}*/}
                                {/*value={this.state.ercAccount}*/}
                            {/*/>*/}
                        {/*</Flex>*/}
                        {/*<Div fontSize={12} textAlign={'center'} fg={'black'}>*/}
                            {/*{this.state.ercAccount}*/}
                        {/*</Div>*/}
                    {/*</ModalBody>*/}
                    {/*<ModalFooter>*/}
                        {/*<Button color="secondary" onClick={this.modalToggle}>닫기</Button>*/}
                    {/*</ModalFooter>*/}
                {/*</Modal>*/}


            </Fragment>
        )
    }
}

