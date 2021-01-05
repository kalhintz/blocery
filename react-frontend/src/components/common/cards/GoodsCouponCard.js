import React from 'react';
import {Div, Flex, Span, Coupon, Button} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {AiOutlineInfo} from 'react-icons/ai'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

const GoodsCouponCard = ({title = '', couponBly = 0, minOrderBly}) => {
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const toggle = () => {
        setModalState(!modalOpen)
    }
    return(
        <>
            <Coupon bgFrom={'#6BC1BC'} bgTo={'bly'}>
                <Div fontSize={14}>{title}</Div>
                <Div><Span fw={800} fontSize={45} lineHeight={63}>{couponBly}</Span><Span fontSize={29} ml={6}>BLY</Span></Div>
                <Div fontSize={12} fg={'light'}>{minOrderBly} BLY 이상 결제시 사용가능</Div>
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
                    쿠폰 사용안내
                </ModalHeader>
                <ModalBody>
                    <Div>
                        <Div mb={16} lineHeight={28}>
                            1. 상품 결제 후 구매확정시 자동 지급되며 [마이페이지 > 쿠폰] 에서 확인 가능합니다. <br/>
                            2. 동일 상품의 쿠폰은 중복 지급되지 않습니다.<br/>
                            3. 단일 상품 결제시에만 사용 가능합니다.<br/>
                            4. 결제 취소시 사용된 쿠폰은 반납되지 않습니다.
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
