import React, {useState, useEffect} from 'react';
import {setConsumerStop, getConsumerByConsumerNo, getConsumerVerifyAuth, getNewAllocateSwapBlyAccount} from "~/lib/adminApi";
import {Div, Flex, Span, Button, Copy, A} from "~/styledComponents/shared";
import styled from 'styled-components'
import { Server } from '~/components/Properties';
import ComUtil from "~/util/ComUtil";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import {getBalanceOfBlctAllAdmin} from '~/lib/smartcontractApi'
import {FaCertificate} from 'react-icons/fa'
import KycView from "~/components/common/contents/KycView";
import adminApi from "~/lib/adminApi";
const Label = styled(Div)`
    min-width: 150px;
`
const ConsumerBasicView = ({consumerNo, onClose}) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [consumer, setConsumer] = useState()
    const [verifyAuthInfo, setVerifyAuthInfo] = useState()
    const [newAllocateSwapBlyAccount, setNewAllocateSwapBlyAccount] = useState()
    const [ethScanUrl, setEthScanUrl] = useState('')
    const [bly, setBly] = useState({
        totalBalance: 0,
        availableBalance: 0,
        lockedBlct: 0,

    });

    useEffect(() => {
        getConsumer()
    }, [])

    useEffect(() => {
        if (consumer) {
            getBly()
        }
    }, [consumer])

    const getConsumer = async () => {
        const {data} = await getConsumerByConsumerNo(consumerNo)
        setConsumer(data)

        const {data:VerifyAuth} = await getConsumerVerifyAuth(consumerNo)
        setVerifyAuthInfo(VerifyAuth)

        const {data:newAllocateSwapBlyAccount} = await getNewAllocateSwapBlyAccount(consumerNo)
        setNewAllocateSwapBlyAccount(newAllocateSwapBlyAccount);

        let ethScanUrl = 'https://etherscan.io/address/';
        if(Server._serverMode() == "stage"){
            ethScanUrl = 'https://ropsten.etherscan.io/address/'
        }
        setEthScanUrl(ethScanUrl)
    }

    const getBly = async () => {
        const {data} = await getBalanceOfBlctAllAdmin(consumerNo)
        setBly(data)
    }

    const copy = (text) => {
        ComUtil.copyTextToClipboard(text, '', '')
    }

    const modalToggle = (modalType) => {
        setSelected(modalType)
        setModalState(!modalOpen)
    }

    const onQuitClick = async () => {

        const stoppedReason = window.prompt("탈퇴 사유를 입력해 주세요(필수)")

        if (!stoppedReason) {
            alert('탈퇴 사유가 입력되지 않아, 탈퇴가 취소 되었습니다')
            return
        }

        if(!window.confirm(`탈퇴 처리 하시겠습니까? \n 사유 : ${stoppedReason}`)) {
            return false
        } else {

            const {status, data} = await setConsumerStop({
                ...consumer,
                stoppedReason
            })

            if(status === 200) {
                alert('회원 탈퇴처리 완료했습니다')

                getConsumer()
            }
        }
    }

    const onUpdateConsumerClick = async() => {
        console.log({consumer})
        const {status, data} = await adminApi.updateConsumer(consumer);
        if (status === 200 && data) {
            alert('저장되었습니다.')
        }
    }

    const onInputChange = ({target}) => {
        const {name, value} = target
        setConsumer({
            ...consumer,
            [name]: value
        })
    }

    if (!consumer) return null

    const {timestamp, name, phone, email, hintFront, hintBack, lastLogin, ip, stoppedUser, stoppedDate, stoppedReason, kycLevel, adminMemo, account} = consumer
    const {totalBalance, availableBalance, lockedBlct} = bly

    return (
        <Div relative>
            <Div absolute top={0} right={0}>
                <Button bg={'danger'} fg='white' px={10} onClick={onUpdateConsumerClick}>기본정보 저장</Button>
            </Div>
            <Flex mb={16}>
                <Label>가입일 / 로그인</Label>
                <Div flexGrow={1}>
                    <Span>{ComUtil.utcToString(timestamp,'YYYY-MM-DD HH:mm:ss')}</Span>
                    <Span ml={20}>
                        {
                            lastLogin ? `${lastLogin ? ComUtil.utcToString(lastLogin,'YYYY-MM-DD HH:mm:ss'):''}`:null
                        }
                    </Span>
                </Div>
            </Flex>
            <Flex mb={16}>
                <Label>접속IP</Label>
                <Div flexGrow={1}>
                    {
                        ip ? `${ip}`:null
                    }
                </Div>
            </Flex>
            <Flex mb={16}>
                <Label>탈퇴일자</Label>
                <Div flexGrow={1}>
                    {
                        stoppedUser ?
                            `${stoppedDate ? ComUtil.intToDateString(stoppedDate):''} ${stoppedReason ? stoppedReason:''}`:
                            <Button bg={'white'} bc={'dark'} onClick={onQuitClick}>탈퇴처리</Button>
                    }
                </Div>
            </Flex>
            <Flex mb={16}>
                <Label>본인인증</Label>
                <Div flexGrow={1}>
                    { verifyAuthInfo && verifyAuthInfo.certOk ? <span>{verifyAuthInfo.name+" "+(verifyAuthInfo.birthDay ? ComUtil.yyyymmdd2DateStr(verifyAuthInfo.birthDay):"") + " ("+(verifyAuthInfo.over19years ? '성인':'미성년자')+")"}</span>:'미인증'}
                </Div>
            </Flex>
            <Flex mb={16}>
                <Label>KYC 인증</Label>
                <Div>
                    {
                        kycLevel !== 0 && <Span mr={5} fg={'green'}><FaCertificate/></Span>
                    }
                    <Button bg={'white'} bc={'dark'} px={10} onClick={modalToggle.bind(this, 'kyc')}>
                        {
                            kycLevel === 0 ? '미인증' : '인증'
                        }
                    </Button>
                </Div>
            </Flex>
            <Flex mb={16}>
                <Label>소비자번호</Label>
                <Flex flexGrow={1}>
                    <Copy onClick={copy.bind(this, consumerNo)}>{consumerNo}</Copy>
                    <Copy ml={20} onClick={copy.bind(this, consumerNo && ComUtil.encodeInviteCode(consumerNo))}>{consumerNo && ComUtil.encodeInviteCode(consumerNo)}</Copy>
                </Flex>
            </Flex>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>회원명</Label>
                <Copy onClick={copy.bind(this, name)}>{name}</Copy>
            </Flex>
            {
                newAllocateSwapBlyAccount &&
                <Flex mb={16} alignItems={'flex-start'}>
                    <Label>회원입금계좌</Label>
                    <Copy onClick={copy.bind(this, newAllocateSwapBlyAccount)}>{newAllocateSwapBlyAccount}</Copy> <Button bg={'white'} px={2} py={2}><A href={`${ethScanUrl}${newAllocateSwapBlyAccount}`} target={'_blank'} fg={'primary'} ml={10} ><u>EthScan</u></A></Button>
                </Flex>
            }
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>연락처/Email</Label>
                <Flex flexGrow={1}>
                    <Copy rounded={4} onClick={copy.bind(this, phone)}>{phone}</Copy>
                    <Copy rounded={4} ml={10} onClick={copy.bind(this, email)}>{email}</Copy>
                </Flex>
            </Flex>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>Ont Account</Label>
                <Div flexGrow={1}>{account}</Div>
            </Flex>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>결제비밀번호</Label>
                <Div flexGrow={1}>{hintFront}**{hintBack}</Div>
            </Flex>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>관리자용 메모</Label>
                <Div flexGrow={1}>
                    <textarea
                        name={'adminMemo'}
                        style={{width:'100%',}}
                        placeholder={'관리자용 메모'} value={adminMemo}
                        onChange={onInputChange}
                    />
                </Div>
            </Flex>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>보유 BLY</Label>
                <Div flexGrow={1}>전체 {ComUtil.addCommas(totalBalance)} / 가용 {ComUtil.addCommas(availableBalance)} / 잠김 {ComUtil.addCommas(lockedBlct)}</Div>
            </Flex>
            {
                modalOpen && <Modal
                    size={'lg'}
                    style={{maxWidth: '100vw', width: '80%'}}
                    isOpen={modalOpen && selected === 'kyc'}
                    toggle={modalToggle}>
                    <ModalHeader toggle={modalToggle}>
                        KYC 인증
                    </ModalHeader>
                    <ModalBody>
                        <KycView
                            consumerNo={consumerNo}
                            callback={() => {
                                getConsumer()
                                modalToggle()
                            }}
                        />
                    </ModalBody>
                </Modal>
            }
        </Div>
    );
};
export default ConsumerBasicView;