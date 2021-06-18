import React from 'react';
import {Div, Flex, Span, Coupon, Button} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {AiOutlineInfo} from 'react-icons/ai'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

const GoodsCouponCard = ({title = '', couponBly = 0, minOrderBly, fixedWon = 0}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const toggle = () => {
        setModalState(!modalOpen)
    }
    return(
        <>
            <Coupon bgFrom={'#6BC1BC'} bgTo={'bly'}>
                <Div fontSize={14}>{title}</Div>
                <Div><Span fw={800} fontSize={45} lineHeight={63}>{fixedWon}</Span><Span fontSize={29} ml={6}>원</Span></Div>
                {/*<Div fontSize={12} fg={'light'}>{minOrderBly} BLY 이상 결제시 사용가능</Div>*/}
                <Div fontSize={12} fg={'light'}>구매일 BLY 시세 적용</Div>
                <Flex justifyContent={'center'}
                      absolute
                      bottom={-15}
                      right={-15}
                      bg={'black'} rounded={'50%'} width={45} height={45}
                      cursor={1}
                      onClick={toggle}
                >
                    <AiOutlineInfo size={40} />
                </Flex>
            </Coupon>


            <Modal isOpen={modalOpen} centered>
                <ModalHeader>
                    적립형 쿠폰 사용안내
                </ModalHeader>
                <ModalBody>
                    <Div>
                        <Div mb={16} lineHeight={28}>
                            1. 적립 내역은 [마이페이지 > 쿠폰] 에서 확인 가능합니다. <br/>
                            2. 적립형 쿠폰은 상품 구매 건별로 지급됩니다. <br/>
                            3. 적립형 쿠폰은 BLY 쿠폰으로 표시된 원화의 근사치로 지급됩니다. <br/>
                            4. 단일 상품 결제 시에만 사용 가능합니다. <br/>
                            5. 상품 금액이 쿠폰 금액보다 작은 경우 사용 불가합니다. <br/>
                            6. 구매 취소 시 사용된 쿠폰은 반환되지 않습니다. 단, 생산자 주문 취소에 한하여 동일한 BLY쿠폰이 재발급됩니다. <br/>
                            7. 적립되는 BLY는 구매 시점 기준 시세로 적용됩니다.
                        </Div>
                        <Div textAlign={'center'}>
                            <Button py={5} px={10} bg={'white'} bc={'dark'} onClick={toggle}>닫기</Button>
                        </Div>

                    </Div>
                </ModalBody>
            </Modal>
        </>
    )
}

export default GoodsCouponCard;
