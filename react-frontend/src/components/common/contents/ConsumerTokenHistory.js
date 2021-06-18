import React, {useEffect, useState} from 'react';
import ComUtil from "~/util/ComUtil";
import {getConsumerTokenHistory} from '~/lib/adminApi'
import {Div, Flex, Right} from '~/styledComponents/shared'
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import {Table} from "reactstrap";
import {IoMdRefresh} from 'react-icons/io'
import {Button} from '~/styledComponents/shared/Buttons'

const typeStore = {
    all: {
        code: 'all',
        name: '전체내역'
    },
    paidGoods: {
        code: 'paidGoods',
        name: '상품구매'
    },
    cancelGoods: {
        code: 'cancelGoods',
        name: '상품취소'
    },
    notDeliverDeposit: {
        code: 'notDeliverDeposit',
        name: '미배송보상'
    },
    deliverPenalty: {
        code: 'deliverPenalty',
        name: '지연배송보상'
    },
    goodsConfirmReward: {
        code: 'goodsConfirmReward',
        name: '구매확정'
    },
    missionEvent: {
        code: 'missionEvent',
        name: '미션보상'
    },
    bounty: {
        code: 'bounty',
        name: '바운티'
    },
    out: {
        code: 'out',
        name: '출금'
    },
    rejectedOut: {
        code: 'rejectedOut',
        name: '출금거절'
    },
    in: {
        code: 'in',
        name: '입금'
    }
}

const Item = (props) => {
    const {bly, date, title, subTitle, gubun, type } = props
    return(
        <tr>
            <td>{ComUtil.utcToString(date)}</td>
            <td>{title}</td>
            <td>{subTitle}</td>
            <td>{`${bly * gubun}`}</td>
        </tr>
    )
}

const ConsumerTokenHistory = ({consumerNo}) => {

    const [modalOpen, , , , setModalState] = useModal()

    const [state, setState] = useState()
    const [selected, setSelected] = useState({
        type: 'paidGoods',
        list: []
    })


    // const [tokenHistoryGroup, setTokenHistoryGroup] = useState()


    useEffect(() => {
        getTokenHistory()
    }, [])

    const getTokenHistory = async () => {
        const {data} = await getConsumerTokenHistory(consumerNo)
        const tokenHistories = data.tokenHistories
        ComUtil.sortDate(tokenHistories, 'date', true);
        console.log({data: data})
        setState(data)
    }

    const onHistoryClick = (selectedType) => {

        const {tokenHistories, rejectedTokenHistories} = state

        let list;
        let sum;

        //전체 목록(출금 거절 제외)
        if (selectedType === typeStore.all.code) {
            list = tokenHistories
            sum = state.totalSum
        }
        //거절 목록(관리자의 출금신청 거절)
        else if (selectedType === typeStore.rejectedOut.code){
            list = rejectedTokenHistories
            sum = state.totalSum
        }else{
            list = tokenHistories.filter(t => t.type === selectedType)
            if (selectedType === typeStore.paidGoods.code)
                sum = paidGoodsSum
            else if (selectedType === typeStore.cancelGoods.code)
                sum = cancelGoodsSum
            else if (selectedType === typeStore.notDeliverDeposit.code)
                sum = notDeliverDepositSum
            else if (selectedType === typeStore.deliverPenalty.code)
                sum = deliverPenaltySum
            else if (selectedType === typeStore.goodsConfirmReward.code)
                sum = goodsConfirmRewardSum
            else if (selectedType === typeStore.missionEvent.code)
                sum = missionEventSum
            else if (selectedType === typeStore.bounty.code)
                sum = bountySum
            else if (selectedType === typeStore.out.code)
                sum = outSum
            else if (selectedType === typeStore.rejectedOut.code)
                sum = rejectedOutSum
            else if (selectedType === typeStore.in.code)
                sum = inSum
        }

        setSelected({
            type: selectedType,
            list,
            sum
        })

        setModalState(true)
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }


    if (!state) return null

    const {
        tokenHistories,          //전체 리스트
        totalSum,                //전체 합계
        paidGoodsSum,            //상품구매 지불 (마이너스)
        cancelGoodsSum,          //소비자 취소후 환불받는 blct (플러스)
        notDeliverDepositSum,    //미배송 보상금 (플러스)
        deliverPenaltySum,       //지연배송 보상금 (플러스)
        goodsConfirmRewardSum,   //구매보상금 (플러스)
        missionEventSum,         //미션 이벤트 보상금 (플러스)
        bountySum,               //바운티 히스토리 (플러스)
        outSum,                  // swap 출금 (마이너스)
        rejectedOutSum,          // swap 출금 거절 (마이너스)
        inSum                    // 입금 (플러스)
    } = state

    // const totalInOutBly =
    //     (
    //         cancelGoodsSum + notDeliverDepositSum + deliverPenaltySum + goodsConfirmRewardSum +
    //         missionEventSum + bountySum + inSum
    //     ) - (
    //         paidGoodsSum + outSum
    //     )


    return (
        <Div relative>
            <Div absolute top={0} right={0}>
                <Button bg={'white'} fg={'dark'}>
                    <IoMdRefresh size={30} onClick={getTokenHistory}/>
                </Button>
            </Div>

            <Flex>
                <Div mb={15} display={'inline-block'} onClick={onHistoryClick.bind(this,  'all')} cursor mr={20}>
                    <Div fontSize={12} fg={'dark'} mb={5}>전체 합계</Div>
                    <Div bold fg={'primary'} textAlign={'center'}>
                        {ComUtil.addCommas(ComUtil.roundDown(totalSum, 0))}
                    </Div>
                </Div>
                <Div mb={15} display={'inline-block'} onClick={onHistoryClick.bind(this,  'rejectedOut')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>출금 거절(합계 및 입출금에는 미포함)</Div>
                    <Div textAlign={'center'}>
                        {ComUtil.addCommas(ComUtil.roundDown(rejectedOutSum, 0))}
                    </Div>
                </Div>
            </Flex>

            <Flex mb={15} justifyContent={'space-between'}>
                <Div onClick={onHistoryClick.bind(this,  'paidGoods')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>상품구매</Div>
                    <Div textAlign={'center'} fg={'danger'}>{ComUtil.roundDown(paidGoodsSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'cancelGoods')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>상품취소환불</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(cancelGoodsSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'notDeliverDeposit')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>미배송보상</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(notDeliverDepositSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'deliverPenalty')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>지연배송보상</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(deliverPenaltySum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'goodsConfirmReward')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>구매보상</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(goodsConfirmRewardSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'missionEvent')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>미션이벤트</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(missionEventSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'bounty')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>바운티히스토리</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(bountySum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'in')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>입금</Div>
                    <Div textAlign={'center'} fg={'primary'}>{ComUtil.roundDown(inSum, 0)}</Div>
                </Div>
                <Div onClick={onHistoryClick.bind(this,  'out')} cursor>
                    <Div fontSize={12} fg={'dark'} mb={5}>출금</Div>
                    <Div textAlign={'center'} fg={'danger'}>{ComUtil.roundDown(outSum, 0)}</Div>
                </Div>
            </Flex>


            <Modal size={'lg'} isOpen={modalOpen} toggle={toggle} >
                <ModalHeader toggle={toggle}>{typeStore[selected.type].name}</ModalHeader>
                <ModalBody>
                    {
                        selected && (
                            <>
                                <Div textAlign={'right'} mb={10} fontSize={14}>
                                    합계 {ComUtil.addCommas(selected.sum)} BLY
                                </Div>
                                <Div maxHeight={500} overflow={'auto'}>
                                    <Table striped size={'sm'}>
                                        <tbody>
                                        {
                                            selected.list.map((item, index) =>
                                                <Item key={`item${index}`} {...item}/>
                                            )
                                        }
                                        {
                                            selected.list.length <= 0 && <tr><td>내역이 없습니다</td></tr>
                                        }
                                        </tbody>
                                    </Table>
                                </Div>
                            </>
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    <Button bg={'white'} bc={'dark'} onClick={toggle}>닫기</Button>
                </ModalFooter>

            </Modal>

        </Div>
    );
};

export default ConsumerTokenHistory;
