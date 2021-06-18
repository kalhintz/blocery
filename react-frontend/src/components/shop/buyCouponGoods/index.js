import React, {useState, useEffect, Fragment} from 'react';
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import {ShopXButtonNav} from "~/components/common";
import styled from "styled-components";
import {Div, Flex, Link, Right, Span, Button} from "~/styledComponents/shared";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {FaGift} from "react-icons/fa";
import {EditRow, ItemDefaultBody, PayInfoRow} from "~/components/shop/buy/BuyStyle";
import {Collapse, Fade, Input} from "reactstrap";
import {getConsumer, getNotDeliveryZipNo} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import ComUtil from "~/util/ComUtil";
import {getDeliveryFee} from "~/util/bzLogic";
import {SingleDatePicker} from "react-dates";
import moment from "moment";
import {BLCT_TO_WON} from "~/lib/exchangeApi";
import {getServerTodayTime} from "~/lib/commonApi";
import {scOntOrderFreeCouponGoodsBlct} from "~/lib/smartcontractApi";
import {withRouter} from 'react-router-dom'
import BlocerySpinner from "~/components/common/Spinner/BlocerySpinner";

const jejuZipNo = [
    "63002","63003","63004","63005","63006","63007","63008","63009","63010","63011","63012","63013","63014","63015","63016","63017","63018","63019","63020",
    "63021","63022","63023","63024","63025","63026","63027","63028","63029","63030","63031","63032","63033","63034","63035","63036","63037","63038","63039",
    "63040","63041","63042","63043","63044","63045","63046","63047","63048","63049","63050","63051","63052","63053","63054","63055","63056","63057","63058",
    "63059","63060","63061","63062","63063","63064","63065","63066","63067","63068","63069","63070","63071","63072","63073","63074","63075","63076","63077",
    "63078","63079","63080","63081","63082","63083","63084","63085","63086","63087","63088","63089","63090","63091","63092","63093","63094","63095","63096",
    "63097","63098","63099","63100","63101","63102","63103","63104","63105","63106","63107","63108","63109","63110","63111","63112","63113","63114","63115",
    "63116","63117","63118","63119","63120","63121","63122","63123","63124","63125","63126","63127","63128","63129","63130","63131","63132","63133","63134",
    "63135","63136","63137","63138","63139","63140","63141","63142","63143","63144","63145","63146","63147","63148","63149","63150","63151","63152","63153",
    "63154","63155","63156","63157","63158","63159","63160","63161","63162","63163","63164","63165","63166","63167","63168","63169","63170","63171","63172",
    "63173","63174","63175","63176","63177","63178","63179","63180","63181","63182","63183","63184","63185","63186","63187","63188","63189","63190","63191",
    "63192","63193","63194","63195","63196","63197","63198","63199","63200","63201","63202","63203","63204","63205","63206","63207","63208","63209","63210",
    "63211","63212","63213","63214","63215","63216","63217","63218","63219","63220","63221","63222","63223","63224","63225","63226","63227","63228","63229",
    "63230","63231","63232","63233","63234","63235","63236","63237","63238","63239","63240","63241","63242","63243","63244","63245","63246","63247","63248",
    "63249","63250","63251","63252","63253","63254","63255","63256","63257","63258","63259","63260","63261","63262","63263","63264","63265","63266","63267",
    "63268","63269","63270","63271","63272","63273","63274","63275","63276","63277","63278","63279","63280","63281","63282","63283","63284","63285","63286",
    "63287","63288","63289","63290","63291","63292","63293","63294","63295","63296","63297","63298","63299","63300","63301","63302","63303","63304","63305",
    "63306","63307","63308","63309","63310","63311","63312","63313","63314","63315","63316","63317","63318","63319","63320","63321","63322","63323","63324",
    "63325","63326","63327","63328","63329","63330","63331","63332","63333","63334","63335","63336","63337","63338","63339","63340","63341","63342","63343",
    "63344","63345","63346","63347","63348","63349","63350","63351","63352","63353","63354","63355","63356","63357","63358","63359","63360","63361","63362",
    "63363","63364","63500","63501","63502","63503","63504","63505","63506","63507","63508","63509","63510","63511","63512","63513","63514","63515","63516",
    "63517","63518","63519","63520","63521","63522","63523","63524","63525","63526","63527","63528","63529","63530","63531","63532","63533","63534","63535",
    "63536","63537","63538","63539","63540","63541","63542","63543","63544","63545","63546","63547","63548","63549","63550","63551","63552","63553","63554",
    "63555","63556","63557","63558","63559","63560","63561","63562","63563","63564","63565","63566","63567","63568","63569","63570","63571","63572","63573",
    "63574","63575","63576","63577","63578","63579","63580","63581","63582","63583","63584","63585","63586","63587","63588","63589","63590","63591","63592",
    "63593","63594","63595","63596","63597","63598","63599","63600","63601","63602","63603","63604","63605","63606","63607","63608","63609","63610","63611",
    "63612","63613","63614","63615","63616","63617","63618","63619","63620","63621","63622","63623","63624","63625","63626","63627","63628","63629","63630",
    "63631","63632","63633","63634","63635","63636","63637","63638","63639","63640","63641","63642","63643","63644","690-003","690-011","690-012","690-021",
    "690-022","690-029","690-031","690-032","690-041","690-042","690-043","690-050","690-061","690-062","690-071","690-072","690-073","690-081","690-082",
    "690-090","690-100","690-110","690-121","690-122","690-130","690-140","690-150","690-161","690-162","690-163","690-170","690-180","690-191","690-192",
    "690-200","690-210","690-220","690-231","690-232","690-241","690-242","690-600","690-610","690-700","690-701","690-703","690-704","690-705","690-706",
    "690-707","690-708","690-709","690-710","690-711","690-712","690-714","690-715","690-717","690-718","690-719","690-720","690-721","690-722","690-723",
    "690-724","690-725","690-726","690-727","690-728","690-729","690-730","690-731","690-732","690-734","690-735","690-736","690-737","690-738","690-739",
    "690-740","690-741","690-742","690-743","690-744","690-747","690-750","690-751","690-755","690-756","690-760","690-762","690-764","690-765","690-766",
    "690-767","690-769","690-770","690-771","690-772","690-773","690-774","690-775","690-776","690-777","690-778","690-779","690-780","690-781","690-782",
    "690-785","690-786","690-787","690-788","690-789","690-790","690-796","690-800","690-801","690-802","690-803","690-804","690-805","690-806","690-807",
    "690-808","690-809","690-810","690-811","690-812","690-813","690-814","690-815","690-816","690-817","690-818","690-819","690-820","690-821","690-822",
    "690-823","690-824","690-825","690-826","690-827","690-828","690-829","690-830","690-831","690-832","690-833","690-834","690-835","690-836","690-837",
    "690-838","690-839","690-840","690-841","690-842","690-843","690-844","690-846","690-847","690-850","690-851","695-789","695-791","695-792","695-793",
    "695-794","695-795","695-796","695-900","695-901","695-902","695-903","695-904","695-905","695-906","695-907","695-908","695-909","695-910","695-911",
    "695-912","695-913","695-914","695-915","695-916","695-917","695-918","695-919","695-920","695-921","695-922","695-923","695-924","695-925","695-926",
    "695-927","695-928","695-929","695-930","695-931","695-932","695-933","695-934","695-940","695-941","695-942","695-943","695-944","695-945","695-946",
    "695-947","695-948","695-949","695-960","695-961","695-962","695-963","695-964","695-965","695-966","695-967","695-968","695-969","695-970","695-971",
    "695-972","695-973","695-974","695-975","695-976","695-977","695-978","695-979","695-980","695-981","695-982","695-983","697-010","697-011","697-012",
    "697-013","697-014","697-020","697-030","697-040","697-050","697-060","697-070","697-080","697-090","697-100","697-110","697-120","697-130","697-301",
    "697-310","697-320","697-330","697-340","697-350","697-360","697-370","697-380","697-600","697-700","697-701","697-703","697-704","697-705","697-706",
    "697-707","697-805","697-806","697-807","697-808","697-819","697-820","697-821","697-822","697-823","697-824","697-825","697-826","697-827","697-828",
    "697-829","697-830","697-831","697-832","697-833","697-834","697-835","697-836","697-837","697-838","697-839","697-840","697-841","697-842","697-843",
    "697-844","697-845","697-846","697-847","697-848","697-849","697-850","697-851","697-852","697-853","697-854","697-855","697-856","697-857","697-858",
    "697-859","697-860","697-861","697-862","697-863","697-864","699-701","699-702","699-900","699-901","699-902","699-903","699-904","699-905","699-906",
    "699-907","699-908","699-910","699-911","699-912","699-913","699-914","699-915","699-916","699-920","699-921","699-922","699-923","699-924","699-925",
    "699-926","699-930","699-931","699-932","699-933","699-934","699-935","699-936","699-937","699-940","699-941","699-942","699-943","699-944","699-945",
    "699-946","699-947","699-948","699-949"
]

export const ItemHeader = styled(Flex)`
    background-color: whitesmoke; 
    padding: 0 ${getValue(16)}; 
    height: ${getValue(54)};
    font-size: ${getValue(14)};
    border: 1px solid ${color.light};
    border-left: 0;
    border-right: 0;
    
    & > div:nth-child(1){
        font-weight: bold;
    }
    
    // & > div:nth-child(2){
    //     margin-left: auto;
    // }
`;

const DateWrapper = styled(Div)`
    
    padding: 2px;
    border: 1px solid ${color.danger};
    border-radius: 6px;
    
    input {
        color: ${color.danger};
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        padding: 0;
    }
`;


const CustomSuspense = ({loading, children}) => {
    if (loading)
        return <Skeleton />
    return children
}

const BuyCouponGoods = (props) => {
    const {couponNo, producerNo, goodsNo} = props.location.state || {couponNo: null, producerNo: null, goodsNo: null}

    // const [gift, setGift] = useState(false)

    const [optGiftMsgValue, setOptGiftMsgValue] = useState('radio1')
    const [optDeliveryMsgValue, setOptDeliveryMsgValue] = useState('radio1')
    const [addressIndex, setAddressIndex] = useState()
    const [loading, setLoading] = useState(true)
    const [dateFocus, setDateFocus] = useState(false)

    const [state, setState] = useState({
        consumer: null,
        goods: null,
        gift: false,
        senderName: '',
        giftMsg: '',
        deliveryMsg: '',
        deliveryFee: 0,            //배송비
        additionalDeliveryFee: 0,  //도서산간지역 배송비
        hopeDeliveryDate: null        //희망배송일
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        // console.log({history: props.history})
        init()
    }, [])


    const init = async () => {
        const res = await Promise.all([
            searchConsumer(),
            searchGoods()
        ])

        console.log({res})

        const consumer = res[0]
        const goods = res[1]


        let index;

        //기본 배송지 조회
        if (consumer.consumerAddresses) {
            index = consumer.consumerAddresses.findIndex(({basicAddress}) => basicAddress === 1)
            //기본 배송지로 설정된 주소가 없을 경우
            if (index === -1) {
                if (consumer.consumerAddresses.length > 0) {
                    //0번째로 세팅
                    index = 0
                    setAddressIndex(index)
                }
            }else {
                setAddressIndex(index)
            }
        }

        const deliveryFee = calcGoodsDeliveryFee(goods)
        let additionalDeliveryFee = 0;

        //도서산간 배송지 조회
        if(index >= 0) {
            const selectedAddress = consumer.consumerAddresses[index]
            additionalDeliveryFee = jejuZipNo.includes(selectedAddress.zipNo) ? 3000 : 0
        }

        console.log({deliveryFee})

        setState({
            ...state,
            consumer: consumer,
            goods: goods,
            senderName: consumer.name,
            deliveryFee: deliveryFee,
            additionalDeliveryFee: additionalDeliveryFee

        })

        setLoading(false)


    }


    //배송비 계산
    const calcGoodsDeliveryFee = (goods) => {
        const qty = 1,                                      //주문수량
            deliveryFee = goods.deliveryFee,                //설정된 배송비
            deliveryQty = goods.deliveryQty,                //배송비 조건 수량 : 배송비 조건 코드와 같이 사용될 조건 수량
            termsOfDeliveryFee = goods.termsOfDeliveryFee,  //배송비 조건 코드 : 배송비 조건 수량과 같이 사용될 조건 코드
            orderPrice = goods.currentPrice * 1;            //실제 내부적으로 결제 해야할 금액 * 주문수량
        const param = {qty, deliveryFee, deliveryQty, termsOfDeliveryFee, orderPrice}
        return getDeliveryFee(param)
    }

    const searchConsumer = async () => {
        let {data} = await getConsumer();
        return data
    }

    const searchGoods = async () => {
        const {data} = await getGoodsByGoodsNo(goodsNo)
        console.log({data})
        return data
    }



    const onGiftChange = () => {
        // setState({...state, gift: !gift})
        changeState('gift', !state.gift)
        // setGift(!gift)
    }

    const onInputChange = ({target}) => {
        const {name,value} = target
        changeState(name, value)
    }

    const onOptGifgMsgChange = ({target}) => {
        // const {selectedOptions} = target
        // changeState('giftMsg', selectedOptions[0].label)

        const {value, selectedOptions} = target

        if (!value || value === 'direct') {
            changeState('giftMsg', '')
        }else{
            changeState('giftMsg', selectedOptions[0].label)
        }

        setOptGiftMsgValue(value)
    }

    //배송메세지 변경
    const onOptDeliveryMsgChange = ({target}) => {
        const {value, selectedOptions} = target
        if (!value || value === 'direct') {
            changeState('deliveryMsg', '')
        }else {
            changeState('deliveryMsg', selectedOptions[0].label)
        }
        setOptDeliveryMsgValue(value)
    }

    const changeState = (name, value) => {
        setState({
            ...state,
            [name]: value
        })
    }

    //배송지 변경
    const onDeliveryAddressChange = (e) => {
        const index = e.target.value
        setAddressIndex(index)
        const selectedAddress = consumer.consumerAddresses[index]
        const additionalDeliveryFee = jejuZipNo.includes(selectedAddress.zipNo) ? 3000 : 0
        changeState('additionalDeliveryFee', additionalDeliveryFee)
    }

    const isValid = async () => {
        const {
            consumer,
            goods,
            gift,
            senderName,
            giftMsg,
            deliveryMsg
        } = state

        let address = (consumer.consumerAddresses && consumer.consumerAddresses.length > 0) ? consumer.consumerAddresses[addressIndex] : null

        if (!address || !address.addr) {
            alert('배송지(주소) 정보를 입력해 주세요.');
            return false
        }

        const {data: res} = await getNotDeliveryZipNo(address.zipNo);
        if (res !== 100) {
            alert('해당 배송지는 도서산간지역으로 배송 서비스를 하지 않습니다. 다른 배송지를 선택해주세요.');
            return false
        }

        //희망수령일 상품이면 체크
        if (goods.hopeDeliveryFlag && !state.hopeDeliveryDate) {
            alert('희망수령일을 선택해야 하는 상품 입니다.')
            return false
        }


        return true
    }

    const onBuyClick = async () => {



        //상품 조회
        const goods = await searchGoods()
        if (goods.remainedCnt <= 0) {
            alert('해당 상품은 품절 되었습니다.');

            return
        }

        //TODO 밸리데이션 체크
        if (!(await isValid())) {

            return
        }

        const selectedAddress = consumer.consumerAddresses[addressIndex] || null

        if (!window.confirm('무료쿠폰으로 구입한 상품은 주문취소시 쿠폰이 반환 되지 않습니다. 결제 하시겠습니까?')) {
            return
        }

        setSaving(true)

        const basicDeliveryFee = calcGoodsDeliveryFee(goods)
        //제주산간지역에 포함되면 배송비 3천원 추가
        const additionalDeliveryFee = jejuZipNo.includes(selectedAddress.zipNo) ? 3000 : 0
        const deliveryFee = basicDeliveryFee
        const orderPrice = goods.currentPrice + deliveryFee + additionalDeliveryFee
        const blctToWon = (await BLCT_TO_WON()).data;
        let { data:serverTodayTime } = await getServerTodayTime();


        console.log({orderPrice, blctToWon})

        //주문상세 데이터 생성
        const saveParams = {
            usedCouponNo: couponNo,
            goodsNo: goods.goodsNo,
            hopeDeliveryDate: state.hopeDeliveryDate,
            deliveryFee: state.deliveryFee,
            additionalDeliveryFee: state.additionalDeliveryFee,

            gift: state.gift,
            senderName: state.senderName,
            giftMsg: state.giftMsg,
            deliveryMsg: state.deliveryMsg,

            receiverName: selectedAddress.receiverName,                                 //수령자
            receiverPhone: selectedAddress.phone,                                       //수령자연락처
            receiverZipNo: selectedAddress.zipNo,                                       //수령자우편번호
            receiverAddr: selectedAddress.addr,                                         //수령자주소
            receiverAddrDetail: selectedAddress.addrDetail,                             //수령자주소상세
            consumerNo: consumer.consumerNo,
        }


        // let ordersParams = {
        //     orderGroup : null,
        //     orderDetailList: [saveOrderDetail]
        // };
        console.log({saveParams})


        let {data : result} = await scOntOrderFreeCouponGoodsBlct(saveParams);

        if (result){
            alert('주문 완료 하였습니다.')
            //쿠폰리스트 페이지로
            props.history.go(-3)
        }else{
            alert('결제가 실패 하였습니다. 다시 시도해 주세요.')
        }

        setSaving(false)
    }

    const getSelectedAddress = () => {
        if (consumer && consumer.consumerAddresses && consumer.consumerAddresses.length > 0) {
            return consumer.consumerAddresses[addressIndex]
        }
        return {
            receiverName: '',
            phone: '',
            zipNo: '',
            addr: '',
            addrDetail: ''
        }
    }

    //희망배송일 지정
    const onDateChange = (date) => {
        changeState('hopeDeliveryDate', date.endOf('day'))
    }

    const renderUntilCalendarInfo = () => {
        return <Div
            // bg={'green'} fg={'white'}
            px={10} py={10} fontSize={13} textAlign={'center'}
            bc={'light'}
            bt={0}
            br={0}
            bl={0}
        >
            {`${ComUtil.utcToString(goods.expectShippingStart)} ~ ${ComUtil.utcToString(goods.expectShippingEnd)} 중 선택`}
        </Div>
    }

    const {consumer, goods, gift, senderName, giftMsg, deliveryMsg} = state

    const address = getSelectedAddress()
    console.log({address})

    return (
        <div>
            {saving && <BlocerySpinner />}

            <ShopXButtonNav fixed historyBack>구매하기</ShopXButtonNav>
            {
                loading ? (
                    <Skeleton.List count={4} />
                ) : (
                    <>
                        <Flex textAlign={'right'} p={16} justifyContent={'flex-end'}
                              bc={'light'}
                              bl={0}
                              br={0}
                              bb={0}
                        >
                            <Checkbox icon={FaGift} bg={'danger'} onChange={onGiftChange} checked={gift} size={'md'}>선물하기</Checkbox>
                        </Flex>
                        <Collapse isOpen={gift}>
                            <div>
                                <ItemHeader>
                                    <div>보내는 사람 정보</div>
                                    <Right>
                                        <small>* 입력해 주신 정보로 카카오톡 <br/> 알림 메시지가 전송됩니다.</small>
                                    </Right>
                                </ItemHeader>

                                <ItemDefaultBody>
                                    <Div fontSize={12}>
                                        <Flex mb={16}>
                                            <Div fg={'adjust'} minWidth={100} >보내는 사람</Div>
                                            <Div flexGrow={1} >
                                                <Input name={'senderName'} value={senderName} onChange={onInputChange} maxLength="10" />
                                            </Div>
                                        </Flex>
                                        <Flex>
                                            <Div fg={'adjust'} minWidth={100}>보내는 메시지</Div>
                                            <Div flexGrow={1}>
                                                <Input type='select' name='optGiftMsg' onChange={onOptGifgMsgChange} value={optGiftMsgValue}>
                                                    <option name='radio1' value='radio1'>감사합니다.</option>
                                                    <option name='radio2' value='radio2'>건강하세요.</option>
                                                    <option name='radio3' value='radio3'>추천합니다.</option>
                                                    <option name='radio4' value='radio4'>생일 축하합니다.</option>
                                                    <option name='radio5' value='radio5'>사랑합니다.</option>
                                                    <option name='radio6' value='radio6'>힘내세요.</option>
                                                    <option name='radio7' value='radio7'>수고했어요.</option>
                                                    <option name='radio8' value='direct'>직접 입력</option>
                                                    <option name='radio9' value=''>없음</option>
                                                </Input>
                                            </Div>
                                        </Flex>
                                    </Div>
                                    {
                                        optGiftMsgValue === 'direct' && (
                                            <Div mt={16}>
                                                <Input type={'text'} name='giftMsg'
                                                       placeholder='보내는 메세지를 입력해 주세요.(최대30자)' value={giftMsg} onChange={onInputChange} maxLength="30" />
                                            </Div>
                                        )
                                    }

                                </ItemDefaultBody>

                            </div>
                        </Collapse>

                        <ItemHeader>
                            <div>배송지 정보</div>
                            <Right>
                                <Link to={'/mypage/addressManagement'}><u>배송지 수정/추가</u></Link>
                            </Right>
                        </ItemHeader>

                        <ItemDefaultBody>

                            <Div mb={16}>
                                <Div mb={8}>
                                    <Div fg={'green'} fontSize={12} mb={5}>배송지</Div>
                                    <Div>
                                        {
                                            (addressIndex === undefined) ?  (
                                                <Div textAlign={'center'}>
                                                    <Link to={'/mypage/addressManagement'} fg={'primary'}><u>배송지 등록을 먼저 해 주세요</u></Link>
                                                </Div>
                                            ) : (
                                                <Input type='select' name='select' id='deliveryAdddresses' block
                                                       onChange={onDeliveryAddressChange}
                                                >
                                                    <option selected disabled name='radio'>배송받으실 주소를 선택해주세요</option>
                                                    {

                                                        consumer.consumerAddresses.map(({addrName, receiverName},index)=> {
                                                            return (
                                                                <option key={'radio'+index} selected={addressIndex === index ? true : false} name='radio' value={index}>배송지 : {addrName}</option>
                                                            )
                                                        })
                                                    }
                                                </Input>
                                            )
                                        }
                                    </Div>
                                </Div>

                                {
                                    (addressIndex >= 0) && (
                                        <Div>
                                            <Div fontSize={12}>
                                                <Div lineHeight={20}>
                                                    <Flex>
                                                        <Div fg={'adjust'} minWidth={100}>받는사람</Div>
                                                        <Div>{address.receiverName}</Div>
                                                    </Flex>
                                                    <Flex>
                                                        <Div fg={'adjust'} minWidth={100}>연락처</Div>
                                                        <Div>{address.phone}</Div>
                                                    </Flex>
                                                    <Flex>
                                                        <Div fg={'adjust'} minWidth={100}>주소</Div>
                                                        <Div>({address.zipNo}){address.addr}{' '}{address.addrDetail}</Div>
                                                    </Flex>
                                                </Div>
                                                {/*<div>*/}
                                                {/*    <Fade in={selectedAddress && this.state.jejuZipNo.includes(consumer.consumerAddresses[addressIndex].zipNo) ? true : false} className="text-danger small">제주도는 추가 배송비(3,000원)가 부과됩니다.</Fade>*/}
                                                {/*</div>*/}
                                            </Div>
                                        </Div>
                                    )
                                }

                            </Div>
                            <Div>
                                <Div fg={'green'} fontSize={12} mb={5}>배송 메세지</Div>
                                <div>
                                    <Input type='select' onChange={onOptDeliveryMsgChange}>
                                        <option name='radio1' value=''>배송 메세지를 선택해 주세요.</option>
                                        <option name='radio2' value='radio1'>문 앞에 놔주세요.</option>
                                        <option name='radio3' value='radio2'>택배함에 놔주세요.</option>
                                        <option name='radio4' value='radio3'>배송 전 연락주세요.</option>
                                        <option name='radio5' value='radio4'>부재 시 연락주세요.</option>
                                        <option name='radio6' value='radio5'>부재 시 경비실에 맡겨주세요.</option>
                                        <option name='radio7' value='direct'>직접 입력</option>
                                    </Input>
                                </div>
                            </Div>
                            {
                                (!optDeliveryMsgValue || optDeliveryMsgValue === 'direct') && (
                                    <Div mt={16}>
                                        <Input type={'text'} name='deliveryMsg' placeholder='배송 메세지를 입력해 주세요.' value={deliveryMsg} onChange={onInputChange}/>
                                    </Div>
                                )
                            }
                        </ItemDefaultBody>


                        <ItemHeader>
                            상품정보
                        </ItemHeader>

                        <Div p={16}>
                            <Flex alignItems={'flex-start'}>
                                <Div width={70}>
                                    <img src={ComUtil.getFirstImageSrc(goods.goodsImages, true)} alt="상품이미지" style={{width: '100%'}}/>
                                </Div>
                                <Div pl={16}>
                                    <Div fontSize={16}>{goods.goodsNm}</Div>
                                    <Div fontSize={13}>구매수량 1건</Div>
                                </Div>
                            </Flex>
                            <Div mt={20} lineHeight={25}>
                                <Flex>
                                    <Div fg={'adjust'} fontSize={12}>배송기간</Div>
                                    <Right>
                                        <Right textAlign={'right'} fontSize={12}>
                                            {
                                                goods.hopeDeliveryFlag ? `희망 수령일에 맞게 배송 예정`:
                                                    goods.directGoods ? `구매 후 3일 이내 발송` : `${ComUtil.utcToString(goods.expectShippingStart)} ~ ${ComUtil.utcToString(goods.expectShippingEnd)}`
                                            }
                                        </Right>
                                    </Right>
                                </Flex>
                                {
                                    (goods.hopeDeliveryFlag) && (
                                        <Div my={10}>
                                            <PayInfoRow
                                                fontSize={12}
                                                lineHeight={20}
                                            >
                                                <Div fg={'black'}>희망 수령일<Span fg={'danger'}>*</Span></Div>
                                                <DateWrapper>
                                                    {/*<Button bg={'green'} fg={'white'} rounded={3} px={5} py={2} onClick={hopeDeliveryDateClick}>직접지정</Button>*/}
                                                    <SingleDatePicker
                                                        placeholder="날짜선택"
                                                        date={state.hopeDeliveryDate ? moment(state.hopeDeliveryDate) : null}
                                                        // date={date}
                                                        onDateChange={onDateChange}
                                                        focused={dateFocus} // PropTypes.bool
                                                        onFocusChange={({ focused }) => setDateFocus(focused)} // PropTypes.func.isRequired
                                                        id={"stepPriceDate_"+goods.goodsNo} // PropTypes.string.isRequired,
                                                        numberOfMonths={1}
                                                        withPortal
                                                        small
                                                        readOnly
                                                        calendarInfoPosition="top"
                                                        enableOutsideDays
                                                        // orientation="vertical"
                                                        //배송시작일의 달을 기본으로 선택 되도록
                                                        initialVisibleMonth={()=> state.hopeDeliveryDate ? state.hopeDeliveryDate : moment(goods.expectShippingStart)}
                                                        // daySize={45}
                                                        verticalHeight={700}
                                                        noBorder
                                                        //달력아래 커스텀 라벨
                                                        renderCalendarInfo={renderUntilCalendarInfo}
                                                        // orientation="vertical"
                                                        //일자 블록처리
                                                        isDayBlocked={(date)=>{

                                                            if (date.isBefore(moment(goods.expectShippingStart)) || date.isAfter(moment(goods.expectShippingEnd))) {
                                                                return true
                                                            }

                                                            // //앞의 단계보다 작은 일자는 블록처리하여 선택할 수 없도록 함
                                                            // let priceStepItem = null
                                                            // switch (stepNo){
                                                            //     case 2 :
                                                            //         //checkDate =  goods.priceSteps[0].until || null
                                                            //
                                                            //         priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 1)
                                                            //
                                                            //         if(priceStepItem && priceStepItem.until){
                                                            //             return date.isSameOrBefore(moment(priceStepItem.until))
                                                            //         }
                                                            //         return false
                                                            //     case 3 :
                                                            //         //3단계에서는 2단계 일자우선, 없을경우 1단계 일자, 없을경우 null 처리
                                                            //         priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 2) || goods.priceSteps.find(priceStep => priceStep.stepNo === 1) || null
                                                            //
                                                            //         if(priceStepItem && priceStepItem.until){
                                                            //             return date.isSameOrBefore(moment(priceStepItem.until))
                                                            //         }
                                                            //         return false
                                                            // }
                                                        }}


                                                        //일자 렌더링
                                                        // ** renderDayContents={this.renderUntilDayContents}
                                                    />
                                                </DateWrapper>
                                            </PayInfoRow>
                                            <Div fg={'secondary'} mt={5} fontSize={12}>실제 수령일은 상황에 따라 차이가 있을 수 있습니다.</Div>
                                        </Div>
                                    )
                                }
                            </Div>
                            <Div mt={20} lineHeight={30}>
                                <Flex>
                                    <Div>상품가격</Div>
                                    <Right>{ComUtil.addCommas(goods.currentPrice)} 원</Right>
                                </Flex>
                                <Flex>
                                    <Div >배송비</Div>
                                    <Right>{ComUtil.addCommas(state.deliveryFee + state.additionalDeliveryFee)} 원</Right>
                                </Flex>
                                <Flex>
                                    <Div >합계</Div>
                                    <Right>{ComUtil.addCommas(goods.currentPrice + goods.deliveryFee)} 원</Right>
                                </Flex>
                                <Flex bold fontSize={18}>
                                    <Div>결제금액</Div>
                                    <Right>0 원</Right>
                                </Flex>
                            </Div>
                        </Div>
                        <Button rounded={0} bg={'green'} fg='white' fontSize={20} block height={56} fw={600} onClick={onBuyClick}>0원 결제하기</Button>
                    </>
                )
            }



        </div>
    );
};

export default withRouter(BuyCouponGoods);
