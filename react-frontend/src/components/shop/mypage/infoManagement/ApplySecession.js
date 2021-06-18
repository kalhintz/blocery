import React, { Fragment, Component } from 'react';
import {Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { Div, Span, Input, Flex, Hr, Button } from '~/styledComponents/shared'
import {ShopXButtonNav} from "~/components/common";
import { getConsumer } from '~/lib/shopApi'
import { ModalConfirm } from '~/components/common/index'
import { doLogout } from '~/lib/loginApi'
import { setConsumerStop } from "~/lib/adminApi"

export default class ApplySecession extends Component {
    constructor(props) {
        super(props);
        this.state = {
            consumer: {},
            modalOpen: false,
            isCheck: true,
        }
    }

    async componentDidMount() {
        const loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        const consumer = loginUser.data;
        this.setState({consumer});
    }

    onChangeCheck = (e) => {
        this.setState({
            isCheck: !e.target.checked
        })
    }

    onClickSecession = () => {
        this.setState({modalOpen: true})
    }

    onClickAgree = async () => {
        const {data:res} = await setConsumerStop(this.state.consumer);
        if(res != 0) {
            this.onCancel();
            await doLogout();
            this.props.history.push('/completeSecession');
        } else {
            alert('탈퇴처리가 완료되지 않았습니다. 다시 시도해주세요.')
        }
    }

    onCancel = () => {
        this.setState({modalOpen:false})
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>회원탈퇴</ShopXButtonNav>
                <Div m={16} height='100%'>
                    <Div fontSize={18}>
                        <Span>마켓블리(MarketBly)를 이용해 주셔서 감사합니다.</Span><br/>
                        <Span bold>마켓블리를 탈퇴하시면</Span><br/>
                        <Span bold><Span fg={'danger'}>회원님의 모든 정보가 삭제</Span>됩니다.</Span>
                    </Div>
                    <br/>
                    <Div>
                        <Span>기존등록된 회원정보와 블리(BLY)토큰, 쿠폰 등이 모두 삭제되며, 추후 재가입시에도 복구가 불가능합니다.</Span>
                    </Div>
                    <br/>
                    <Div fontSize={12}>
                        <Span>- 재가입은 <Span bold>90일 이후에 가능</Span>합니다.</Span><br/>
                        <Span>- 거래정보가 있는 경우, 전자상거래 등에서의 소비자 보호에 관한 법률에 따라 계약 또는 청약철회에 관한 기록, 대금결제 및 재화 등의
                            공급에 관한 기록은 <Span bold>5년 동안 보존</Span>됩니다.</Span><br/>
                        <Span>- 보유하셨던 블리(BLY)토큰과 유효기간이 남은 쿠폰은 탈퇴와 함께 삭제되며 환불되지 않습니다.</Span><br/>
                        <Span>- 회원탈퇴 후 마켓블리 서비스에 입력하신 후기 등은 삭제되지 않습니다.</Span><br/>
                        <Span>- 이미 결제가 완료된 건은 탈퇴로 취소되지 않습니다.</Span><br/>
                    </Div>
                </Div>
                <Hr my={20} />
                <Div m={16}>
                    <Flex>
                        <Div mr={10}><Input type="checkbox" onChange={this.onChangeCheck} /></Div>
                        <Span bold>
                            탈퇴 후 본 계정과 관련된 모든 데이터를 복구할 수 없음을 확인했습니다. <br/>
                            위 내용에 숙지하고 동의합니다.
                        </Span>
                    </Flex>
                </Div>
                <Div my={30} mx={16} bottom={0}>
                    <Button block py={10} bc={'secondary'} bg={'darkBlack'} fg={'white'} disabled={this.state.isCheck} onClick={this.onClickSecession}>탈퇴하기</Button>
                </Div>

                <Modal isOpen={this.state.modalOpen} centered>
                    <ModalHeader toggle={this.goodsSearchModalToggle} onClick={this.onClickSecession}>
                        <Span bold fontSize={18}>알림</Span>
                    </ModalHeader>
                    <ModalBody>
                        <Span>탈퇴하시면 회원님의 모든 정보가 삭제되며 추후 재 가입시에도 복구가 불가능합니다.</Span><br/>
                        <Span>(재가입은 90일 이후에 가능)</Span><br/>
                        <Span>정말로 탈퇴하시겠습니까?</Span>
                    </ModalBody>
                    <ModalFooter>
                        <Flex fontSize={12}>
                            <Button fg={'green'} mr={10} onClick={this.onCancel}><u>아니오, 조금 더 이용해 볼게요!</u></Button>
                            <Button fg={'darkBlack'} onClick={this.onClickAgree}><u>네, 탈퇴하겠습니다.</u></Button>
                        </Flex>
                    </ModalFooter>
                </Modal>

            </Fragment>
        )
    }
}