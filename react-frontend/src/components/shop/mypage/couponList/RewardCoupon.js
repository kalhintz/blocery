import React, {useState, useEffect, Fragment} from 'react';
import {useModal} from "~/util/useModal";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {B2cGoodsSelSearch} from "~/components/common";
import {getRewardCoupon} from '~/lib/shopApi'
import {Div, Flex, Right, Span, Coupon, Button} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {BLCT_TO_WON, calcBlyToWon} from "~/lib/exchangeApi";

const Item = ({consumerOk, goodsNm, blyAmount, orderDate}) =>
    <Flex my={16} fontSize={12} alignItems={'flex-start'}>
        <Div flexShrink={0} fg={consumerOk ? 'bly' : 'dark'}>{consumerOk ? '적립완료': '적립예정'}</Div>
        <Div mx={10}>{goodsNm}</Div>

        <Right flexShrink={0}>
            <Span>{blyAmount}BLY</Span>
            <Span ml={10}>{ComUtil.utcToString(orderDate)}</Span>
        </Right>
    </Flex>

const ModalContent = ({consumerCoupon}) => {

    const [blctToWon, setBlctToWon] = useState(0);

    useEffect(()=>{
        BLCT_TO_WON().then(res => setBlctToWon(res.data))
    }, [])

    //적립예정 BLY
    let _expectedAmount = 0;
    if (consumerCoupon) {
        consumerCoupon.rewardOrderList.map(rewardOrder => {
            if (!rewardOrder.consumerOk) {
                _expectedAmount = _expectedAmount + rewardOrder.blyAmount
            }
        })
    }

    const couponAmount = consumerCoupon ? consumerCoupon.couponBlyAmount : 0;


    return (
        <Div>
            <Div mr={10} mb={2} textAlign={'right'} fg={'adjust'} fontSize={12}>1 BLY = {ComUtil.addCommas(blctToWon)}원</Div>

            <Div fontSize={15} relative p={10} ml={2} mr={2} bg={'white'} bc={'bly'} style={{borderWidth:1}} rounded={10} fg={'bly'} shadow={'sm'}>
                <Flex>
                    <Div>사용가능</Div>
                    <Right>
                        <Span mr={5}>{`${ComUtil.roundDown(couponAmount,2)}BLY`}</Span>
                        <Span fontSize={13}>({ComUtil.addCommas(ComUtil.roundDown(couponAmount * blctToWon, 0))}원)</Span>
                    </Right>
                </Flex>
                <Flex fg={'darkBlack'} className="mt-1">
                    <Div>적립예정</Div>
                    <Right>
                        <Span mr={5}>{`${ComUtil.roundDown(_expectedAmount,2)}BLY`}</Span>
                        <Span fontSize={13}>({ComUtil.addCommas(ComUtil.roundDown(_expectedAmount * blctToWon, 0))}원)</Span>
                    </Right>
                </Flex>
            </Div>
            <Div>
                {
                    consumerCoupon ? (consumerCoupon.rewardOrderList.map(rewardOrder => <Item key={`item${rewardOrder.orderSeq}`} {...rewardOrder}/>)) : (
                        <Div my={16} textAlign={'center'}>적립 내역이 없습니다.</Div>
                    )
                }
            </Div>
            {/* 안내문구 */}
            <Div bg={'background'} bc={'light'} rounded={5} p={10} fontSize={12}>
                <Flex dot alignItems={'flex-start'}>
                    <Div>적립되는 BLY는 구매 시점 기준 시세로 적용됩니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'} my={8}>
                    <Div>적립예정인 BLY는 구매확정시 사용가능합니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'} my={8}>
                    <Div>쿠폰은 나누어 사용 할 수 없습니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'} my={8}>
                    <Div>사용된 쿠폰은 결제 취소시 소멸되니 주의 바랍니다. 단, 생산자 주문 취소에 한하여 동일한 BLY쿠폰이 재발급됩니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'} my={8}>
                    <Div>쿠폰 유효기간은 적립될때 마다 자동 연장 되며, <br/>유효기간 만료 시 내역에서 삭제됩니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'} my={8}>
                    <Div>상품 구매로 사용된 BLY는 내역에서 삭제 됩니다.</Div>
                </Flex>
                <Flex dot alignItems={'flex-start'}>
                    <Div>쿠폰 금액이 상품 가격보다 작을 경우에만 사용 가능합니다.</Div>
                </Flex>
                {/*TODO: 마일리지 쿠폰은 상품 구매시점 환율로 지급되기 때문에 이 부분을 사용자에게 알려야 할지?? */}
                {/*<Flex dot align입Items={'flex-start'}>*/}
                {/*    <Div>마일리지 쿠폰의 BLY는 상품 구매시점의 환율로 적용 됩니다.</Div>*/}
                {/*</Flex>*/}
            </Div>
        </Div>
    )
}

const RewardCoupon = ({data: rewardCoupon},props) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [consumerCoupon, setConsumerCoupon] = useState()
    const [expectedAmount, setExpectedAmount] = useState(0) //적립예정

    useEffect(() => {
        search()
    }, [])

    const search = async () => {
        const {data} = await getRewardCoupon()

        //적립예정 BLY
        let _expectedAmount = 0;

        if (data) {
            data.rewardOrderList.map(rewardOrder => {
                if (!rewardOrder.consumerOk) {
                    _expectedAmount = _expectedAmount + rewardOrder.blyAmount
                }
            })
            ComUtil.sortNumber(data.rewardOrderList, "orderSeq", true);
        }

        setConsumerCoupon(data)
        setExpectedAmount(_expectedAmount)

    }


    const toggle = () => {
        setModalState(!modalOpen)
    }

    const startDay = rewardCoupon && rewardCoupon.useStartDay ? rewardCoupon.useStartDay.toString() : null;
    const useStartDay = startDay && startDay.substr(0,4) + '.' + startDay.substr(4,2) + '.' + startDay.substr(6,2)
    const endDay = rewardCoupon && rewardCoupon.useEndDay ? rewardCoupon.useEndDay.toString() : null;
    const useEndDay = endDay && endDay.substr(0,4) + '.' + endDay.substr(4,2) + '.' + endDay.substr(6,2)

    return (
        <Div p={20}>
            {/*<Div>*/}
            {/*    /!*<Div fontSize={12} mb={5}>*!/*/}
            {/*    /!*    My 적립 현황*!/*/}
            {/*    /!*</Div>*!/*/}
            {/*    /!*<Flex absolute left={0} top={-12.5} fontSize={12} height={25} bg={'bly'} px={10}>내 마일리지</Flex>*!/*/}
            {/*    <Div*/}
            {/*        cursor={1}*/}
            {/*        relative p={16} bg={'white'} bc={'bly'} style={{borderWidth:3}} rounded={10} fg={'bly'} shadow={'sm'}*/}
            {/*        onClick={toggle}*/}
            {/*    >*/}
            {/*        <Flex absolute cursor={1} rounded={10} px={10} fg={'white'} right={-10} top={-14} bg={'bly'} height={25} fontSize={12} shadow={'sm'}>자세히보기</Flex>*/}
            {/*        <Span textAlign={'center'} fontSize={20}>{`사용가능 ${consumerCoupon ? ComUtil.roundDown(consumerCoupon.couponBlyAmount,2) : 0}BLY`}</Span>*/}
            {/*        <Span mx={10}>|</Span>*/}
            {/*        <Span textAlign={'center'} fontSize={15}>{`적립예정 ${ComUtil.roundDown(expectedAmount,2)}BLY`}</Span>*/}
            {/*        {*/}
            {/*            (consumerCoupon && consumerCoupon.couponBlyAmount > 0) &&*/}
            {/*                <Div mt={8} fontSize={12} textAlign={'center'}>{`유효기간 ${ComUtil.yyyymmdd2DateStr(consumerCoupon.useEndDay)} 까지`}</Div>*/}
            {/*        }*/}
            {/*    </Div>*/}
            {/*</Div>*/}

            <Div my={20} p={20} bc={'light'} bg={'white'} rounded={2}>
                <Div fontSize={20} my={15}><b>차곡차곡 쌓이는 적립형 쿠폰</b></Div>
                {
                    (!useStartDay && !useEndDay) ? null : <Div fontSize={15}>{useStartDay} ~ {useEndDay}</Div>
                }
                {
                    (rewardCoupon && rewardCoupon.minOrderBlyAmount && rewardCoupon.minOrderBlyAmount !== 0) ? (
                        <Div fontSize={15} mb={15}>
                            {ComUtil.addCommas(rewardCoupon.minOrderBlyAmount) + 'BLY 이상 상품구매시 사용가능'}
                        </Div>
                    ) : null
                }
                <Flex fontSize={20}
                      fg={'bly'}><b>{`사용가능 ${(rewardCoupon && rewardCoupon.couponBlyAmount) ? ComUtil.roundDown(rewardCoupon.couponBlyAmount, 2) : 0}BLY`}</b>
                    <Span ml={10} fg={'dark'}
                          fontSize={15}>/ {(rewardCoupon && rewardCoupon.couponBlyAmount) ? ComUtil.addCommas(calcBlyToWon(rewardCoupon.couponBlyAmount)):0}원</Span>
                </Flex>
                <Flex fontSize={15}>{`적립예정 ${ComUtil.roundDown(expectedAmount, 2)}BLY`}
                    <Span ml={10} fg={'dark'} fontSize={15}>/ {ComUtil.addCommas(calcBlyToWon(expectedAmount))}원</Span>
                </Flex>
                {/*<Span textAlign={'center'} fontSize={20} fg={'bly'} bold>{`사용가능 ${consumerCoupon ? ComUtil.roundDown(consumerCoupon.couponBlyAmount,2) : 0}BLY`}</Span>*/}
                {/*<Span mx={10}>|</Span>*/}
                {/*<Span textAlign={'center'} fontSize={15}>{`적립예정 ${ComUtil.roundDown(expectedAmount,2)}BLY`}</Span>*/}
            </Div>
            <Div my={10} textAlign={'center'}>
                <Button onClick={toggle} px={10} bg={'green'} fg={'white'}>자세히보기</Button>
            </Div>


            <Modal
                isOpen={modalOpen}
                toggle={toggle}
                size="lg"
                // style={{maxWidth: '800px', width: '80%'}}
                // onClosed={toggle}
                centered>
                <ModalHeader toggle={toggle}>적립형 쿠폰 상세내역</ModalHeader>

                <ModalBody>
                    <ModalContent consumerCoupon={consumerCoupon}/>
                </ModalBody>
            </Modal>
        </Div>
    );
};

export default RewardCoupon;
