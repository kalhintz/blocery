import React, {useState, useEffect} from 'react';
import {Button, Div, Flex, Img, Input, Span} from "~/styledComponents/shared";
import {ShopXButtonNav} from "~/components/common";
import certApi from "~/lib/certApi";
import {withRouter} from 'react-router-dom'
import {getConsumer} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import useInterval from "~/hooks/useInterval";
import ComUtil from "~/util/ComUtil";
import Checkbox from '~/components/common/checkboxes/Checkbox'
import {FaGift} from "react-icons/fa";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {useModal} from "~/util/useModal";
import {toast, ToastContainer} from 'react-toastify'                              //토스트
import KakaoPayment from '~/images/icons/sns/kakao_nobg_payment_icon_yellow_large.png'
import SecureApi from "~/lib/secureApi";

const AgreeItem = ({onChange, disabled}) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [checked, setChecked] = useState(false)

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onCheckboxChange = ({target}) => {
        const {checked} = target
        setChecked(checked)
        //부모 콜백
        onChange(checked)
    }

    return (
        <Div>

            <Flex>
                <Checkbox bg={'bly'} disabled={disabled} onChange={onCheckboxChange} checked={checked} size={'md'}></Checkbox>
                <Flex ml={10} fontSize={13}>
                    <Div fg={'bly'} cursor onClick={toggle} bc={'bly'} bt={0} bl={0} br={0}>개인정보 제 3자 제공</Div>
                    에 동의합니다.
                </Flex>
            </Flex>

            <Modal isOpen={modalOpen} toggle={toggle} centered>
                <ModalHeader toggle={toggle}>개인정보 제 3자 제공</ModalHeader>
                <ModalBody>
                    <Div bold fontSize={14}>[필수] 본인인증을 위한 개인 정보 제3자 제공동의</Div>
                    <Div fontSize={13} lineHeight={27} my={10} fw={300}>
                        <Flex dot alignItems={'flex-start'}>
                            개인정보를 제공 받는자의 개인정보 이용 목적 : 본인인증
                        </Flex>
                        <Flex dot alignItems={'flex-start'}>
                            개인정보를 제공 받는 자 : ㈜이지팜
                        </Flex>
                        <Flex dot alignItems={'flex-start'}>
                            제공 받는자의 개인정보 보유, 이용기간 : 제공받은 날로부터 5년
                        </Flex>
                        <Flex dot alignItems={'flex-start'}>
                            제공 항목 : 이름, 생년월일, 휴대폰번호
                        </Flex>
                    </Div>
                    <Div my={10} fontSize={12} fg={'secondary'} fw={100}>※ 귀하는 동의를 거부하실 수 있으나, 이 경우 본인인증을 받으실 수 없습니다.</Div>
                </ModalBody>
                <ModalFooter>
                    <Div textAlign={'center'} flexGrow={1}>
                        <Button color="secondary" onClick={toggle} bg={'white'} fg={'black'} bc={'dark'} px={20}>
                            <Span fw={200}>확인</Span>
                        </Button>
                    </Div>
                </ModalFooter>
            </Modal>

        </Div>
    )
}

const KakaoCert = ({history, refresh}) => {

    const [consumer, setConsumer] = useState({
        name: '',
        phone: '',
        birthday: ''
    })

    //카카오페이 인증하기 클릭 여부
    const [requested, setRequested] = useState(false)
    const [loading, setLoading] = useState()
    const [agree, setAgree] = useState(false)

    useEffect(() => {
        init()
    }, [])

    const init = async () => {
        // 혹시나 CSRF 세팅이 안될 경우 대비 한번더 넣게 처리
        SecureApi.setCsrf().then(()=>{
            SecureApi.getCsrf().then(({data})=>{
                localStorage.setItem('xToken',data);
            });
        });

        const {data} = await getConsumer()
        if (data) {
            setConsumer({
                ...consumer,
                phone: data.phone
            })
        }
    }

    const checkValidation = () => {
        const {name, birthday} = consumer
        if (!name || name.trim().length <= 0) {
            alert('이름을 입력하여 주시기 바랍니다.')
            return false;
        }
        else if (!birthday || birthday.trim().length <= 0) {
            alert('생년월일을 입력하여 주시기 바랍니다.')
            return false;
        }
        else if (birthday.trim().length !== 8) {
            alert('생년월일은 8자리(예: 19930101)로 입력하여 주시기 바랍니다.')
            return false;
        }

        return true
    }

    //인증요청 클릭
    const onRequestAuthClick = async () => {

        if (!checkValidation()){
            return
        }

        const {data} = await certApi.requestAuth({
            name: consumer.name,
            birthday: consumer.birthday
        })

        // long code;              /* 200이면정상적인 처리, 아니면 메시지 확인 */
        // String message;         /* code 값이 200이 아닐경우 나오는 메시지 */
        // String receiptId;       // 본인인증 요청시 반환된 접수아이디

        if (!data) {
            refresh()
        }

        const {code, message, receiptId} = data

        // 성공
        if (code === 200) {

            notify('등록된 휴대전화 번호로 카카오톡 메시지가 발송되었습니다. 메시지 안내에 따라 인증 절차를 완료해 주세요.', toast.info)

            //인증완료 확인 버튼이 보이도록
            setRequested(true)

        }else { //에러
            alert(message)
            return
        }
    }


    //인증완료 확인
    const onRequestDoneCheckClick = async () => {
        const {data} = await certApi.requestDoneCheck()
        if (data) {
            const {code, message, receiptId} = data
            if (code === 200) {
                //부모 페이지 재 조회
                refresh()
            }else{
                alert(message)
            }
            return
        }

        alert('다시 로그인 해 주세요')
        refresh()
    }

    const onInputChange = ({target}) => {
        const {name, value} = target
        setConsumer({
            ...consumer,
            [name]: value
        })
    }


    const agreeChange = (checked) => {
        console.log({checked})
        setAgree(checked)
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };


    return (
        <Div>
            <ShopXButtonNav underline>성인 인증</ShopXButtonNav>
            <Div p={16}>

                <Div px={13} fontSize={13} fw={200} lineHeight={20}>
                    <Flex dot alignItems={'flex-start'}>정부의 암호화폐 관련 정책에 근거하여, 출금 등 디지털 자산의 이용은 성년만 가능합니다. (만 19세 이상, 미성년자는 이용 불가)</Flex>
                    <Flex dot alignItems={'flex-start'}>아래에서 인증 후 이용해 주시기 바랍니다.</Flex>
                    <Flex dot alignItems={'flex-start'}><u>최초 1회만 인증</u></Flex>
                </Div>

                <Div my={25}>
                    <Div>
                        <Div px={13} fontSize={14}>이름</Div>
                        <Input underLine block
                               readOnly={requested}
                               name={'name'}
                               fontSize={19}
                               value={consumer.name} onChange={onInputChange} placeholder={'홍길동'}/>
                    </Div>
                    <Div my={25}>
                        <Div px={13} fontSize={14}>생년월일</Div>
                        <Input type={'number'} maxLength={8} underLine block
                               fontSize={19}
                               name={'birthday'}
                               readOnly={requested}
                               value={consumer.birthday} onChange={onInputChange} placeholder={'8자리 (예:19930101)'}/>
                    </Div>
                    <Div>
                        <Div px={13} fontSize={14}>휴대폰번호(3G 이상 단말기 지원)</Div>
                        <Flex px={13} height={40} fontSize={19}>{consumer ? consumer.phone : '...'}</Flex>
                    </Div>
                </Div>

                <Div my={25}>
                    <AgreeItem onChange={agreeChange} disabled={requested}/>
                </Div>

                <Button onClick={onRequestAuthClick} bg={'kakao'} fg={'black'} block height={54} mb={15} disabled={!agree || requested ? true : false}>
                    <img src={KakaoPayment} style={{display:'inline-block', width: '80px'}} />
                    인증 요청
                </Button>
                {
                    requested && <Button onClick={onRequestDoneCheckClick} bg={'kakao'} height={54} block>
                        인증완료 확인 (유효시간 : 10분이내)
                    </Button>
                }
            </Div>


            <ToastContainer/>

        </Div>
    );
};

export default withRouter(KakaoCert);
