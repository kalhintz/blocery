import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { RadioButtons, SingleImageUploader, ModalConfirm } from '~/components/common'
import Style from './WebGoodsReg.module.scss'
import { addGoods, copyGoodsByGoodsNo } from '~/lib/goodsApi'
import { scOntPayProducerDeposit } from '~/lib/smartcontractApi'
import { getProducer } from '~/lib/producerApi'
import { getGoodsByGoodsNo, deleteGoods, updateConfirmGoods, updateGoodsSalesStop, getGoodsContent, updateSalePaused, getBlyReview } from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import { getLoginProducerUser, checkPassPhraseForProducer } from '~/lib/loginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, PassPhrase, Agricultural } from '~/components/common'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'
import {Span} from "~/styledComponents/shared/Layouts";

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'

import TuiEditor from '~/components/common/toastUI/TuiEditor'
import QullEditor from '~/components/common/quillEditor';

let validatedObj = {}

let bindData = {
    cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],      //배송비 조건 정책
    goodsTypes: [],
    vatFlag: null         // 과세여부
}

export default class WebDirectGoodsReg extends Component {
    editorRef = React.createRef();

    constructor(props) {
        super(props);

        const { goodsNo } = this.props

        this.state = {
            startDate: null,
            endDate: null,
            focusedInput: null,
            isDeliveryFeeTermsOpen: false,//배송정책 종류 dropdown open 여부

            isOpen: false,
            goodsTypeModalOpen: false,
            isDidMounted: false,
            isLoading: {
                temp: false,    //임시저장 버튼에 쓰일 스피너
                update: false   //수정완료 버튼 스피너
            },
            chainLoading: false,    //블록체인 로딩용

            //등록시 사용
            goods: {
                goodsNo: goodsNo || null,
                producerNo: null,          //생산자번호
                goodsNm: '',              //상품명
                goodsImages: [],	        //상품이미지
                searchTag: '',	        //태그
                itemNo: '',	            //품목번호
                itemName: '',	              //품목
                itemKindCode: '',             //품종번호
                itemKindName: '',             //품종명
                //breedNm: '',	          //품종
                productionArea: '',	      //생산지
                //cultivationNo: '',	  //재배방법번호
                cultivationNm: '토지',	  //재배방법명
                saleEnd: null,      //판매마감일
                productionStart: '',      //수확시작일
                expectShippingStart: '',  //예상출하시작일
                expectShippingEnd: '',    //예상출하마감일
                hopeDeliveryFlag:false,     //희망배송여부(소비자용)
                pesticideYn: '무농약',	        //농약유무
                vatFlag: '',            // 과세여부
                packUnit: 'kg',	            //포장단위
                packAmount: '',	        //포장 양
                packCnt: '',	            //판매개수
                // shipPrice: '',	        //출하 후 판매가
                // reservationPrice: '',	    //예약 시 판매가
                // cultivationDiary: '',	    //재배일지
                confirm: false,             //상품목록 노출 여부
                remainedDepositBlct: 0,
                totalDepositBlct: 0,
                remainedCnt: 0,
                discountRate: 0,            //할인율
                consumerPrice: null,           //소비자 가격
                totalPriceStep: 1,          //총 단계
                priceSteps: [
                    {stepNo: 1, until: null, price: 0, discountRate: 0 }
                ],             //단계별 가격

                deliveryFee: 0,             //배송비
                // deliveryQty: 0,          //배송비 정책 : 배송비 무료로 될 수량
                deliveryQty: '',            //배송비 정책 : 배송비 무료로 될 수량
                termsOfDeliveryFee: TERMS_OF_DELIVERYFEE.NO_FREE, //배송비 정책코드
                selfDeposit: false,         // 상품의 미배송보증금을 생산자가 냈는지 여부
                goodsTypeCode: 'none',          //해당없음:none, 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
                goodsTypeName: '',
                directGoods: true,          //즉시판매상품 : true 예약상품 : false

                goodsInfo: [],
                //화면에서만 쓰이는 로컬 스토리지
                goodsInfoData: {
                    A: [],
                    P: [],
                    H: []
                },
                blyReviewConfirm: false     //블리리뷰 노출 여부
            },

            loginUser: {},
            selected: null,
            //202012-selfDeposit제외.  modal: false,                //모달 여부
            //202012-selfDeposit제외.  modalType: '',              //모달 종류
            //202012-selfDeposit제외.  passPhrase: '', //비밀번호 6 자리 PIN CODE
            //202012-selfDeposit제외.  clearPassPhrase: true,
            producerInfo: null

        }
        this.inputPackUnit = React.createRef()
    }

    async componentDidMount() {
        await this.bind()
        const loginUser = await this.setLoginUserInfo();

        const {data:producerInfo} = await getProducer();
        const state = Object.assign({}, this.state)
        state.isDidMounted = true
        state.loginUser = loginUser
        state.producerInfo = producerInfo;
        // state.bindData = bindData

        //신규
        if(!state.goods.goodsNo){

            state.goods.producerNo = loginUser.uniqueNo
            this.setValidatedObj(state)
            this.setState(state)
            return
        }

        //업데이트
        const goods = await this.search()
        console.log({goods})
        goods.currentPrice = goods.defaultCurrentPrice
        //품종세팅
        this.setItemKinds(goods.itemNo)

        goods.vatFlag = this.getIsVatWording(goods.vatFlag);
        state.goods = goods

        //goodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.goods.goodsContent && state.goods.goodsContentFileName != 0) {
            let {data:goodsContent} = await getGoodsContent(state.goods.goodsContentFileName)
            if(goodsContent) {
                state.goods.goodsContent = goodsContent;
            }
            //console.log('goodsContent await:', goodsContent, state.goods.goodsContentFileName)
        }

        this.setValidatedObj(state);
        this.setState(state);
    }

    getIsVatWording = (vatFlag) => {
        if(vatFlag) {
            return '과세'
        }
        return '면세'
    }

    setLoginUserInfo = async() => {
        return await getLoginProducerUser();
    }

    //기초 데이타 바인딩 정보
    bind = async () => {

        const { data: itemsData } = await getItems(true)
        const items =  itemsData.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled}))

        //품목
        // const item = [
        //
        //     { value: 1, label: '청경채' },
        //     { value: 2, label: '시금치' },
        //     { value: 3, label: '고수' },
        //     { value: 4, label: '미나리' }
        // ]

        //재배방법
        const cultivationNm = [
            { value: '토지', label:'토지'},
            { value: '온실', label:'온실'},
            { value: '수경재배', label:'수경재배'},
            { value: '자연산', label:'자연산'},
            { value: '양식', label:'양식'},
            { value: '해당없음', label:'해당사항 없음'}
        ]

        //농약유무
        const pesticideYn = [
            {value: '유기농', label:'유기농'},
            {value: '무농약', label:'무농약'},
            {value: '농약사용', label:'농약사용'},
            {value: '해당없음', label:'해당사항 없음'}
        ]

        const packUnit = [
            {value: 'kg', label:'kg'},
            {value: 'g', label:'g'},
            {value: '근', label:'근'},
            {value: '99', label:'기타'}
        ]

        const priceSteps = [
            {value: 1, label:'상품 단일가'},
            {value: 2, label:'2단계 할인가'},
            {value: 3, label:'3단계 할인가'}
        ]

        const vatFlag = [
            {value: '과세', label: '과세'},
            {value: '면세', label: '면세'}
        ]

        //배송비 조건 넣기
        // const termsOfDeliveryFees = []
        //
        // Object.keys(termsOfDeliveryFeeInfo).map(key => {
        //     termsOfDeliveryFees.push(termsOfDeliveryFeeInfo[key])
        // })

        const termsOfDeliveryFees = [
            { value: TERMS_OF_DELIVERYFEE.NO_FREE, label: '무료배송 없음' },
            { value: TERMS_OF_DELIVERYFEE.FREE, label: '무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_FREE, label: '개 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE, label: '원 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT, label: '개씩 배송요금 부과' },
        ]

        //상품종류 : 상품정보제공 고시 설정에서 사용
        const goodsTypes = [
            { value: 'none', label: '사용안함' },
            { value: 'A', label: '식품(농수산물)' }, //Agricultural food
            { value: 'P', label: '가공식품' },      //Processed food
            { value: 'H', label: '건강기능식품' },   //Health functional food
        ]

        bindData = {
            items,
            itemKinds: [],
            cultivationNm,
            pesticideYn,
            packUnit,
            priceSteps,
            termsOfDeliveryFees,
            goodsTypes,
            vatFlag
        }
    }

    //input name에 사용
    names = {
        goodsNm: 'goodsNm',              //상품명
        // goodsImages: 'goodsImages',	        //상품이미지
        searchTag: 'searchTag',	        //태그
        itemNo: 'itemNo',	            //품목번호
        // itemName: 'itemName',	            //품목
        itemKind: 'itemKind',	                //품종
        productionArea: 'productionArea',	//생산지
        // cultivationNm: 'cultivationNm',	    //재배방법명
        saleEnd: 'saleEnd',                     //판매마감일
        productionStart: 'productionStart',      //수확시작일
        expectShippingStart: 'expectShippingStart',  //예상출하시작일
        expectShippingEnd: 'expectShippingEnd',    //예상출하마감일
        // pesticideYn: 'pesticideYn',	        //농약유무
        // packUnit: 'packUnit',	            //포장단위
        packAmount: 'packAmount',	        //포장 양
        packCnt: 'packCnt',	            //판매개수
        // shipPrice: 'shipPrice',	        //출하 후 판매가
        // reservationPrice: 'reservationPrice',	    //예약 시 판매가 gfrd
        consumerPrice: 'consumerPrice',      //소비자 가격
        currentPrice: 'currentPrice',       //판매가

        deliveryFee: 'deliveryFee',             //배송비
        deliveryQty: 'deliveryQty',          //배송비 정책 : 배송비 무료로 될 수량
        goodsTypeCode: 'goodsTypeCode'      //상품종류 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = ({goods: obj}) => {

        //소비자가격 및 단계별 할인율 체크 end
        validatedObj = {
            // goodsNo: goodsNo || null,
            // producerNo: null,          //생산자번호
            goodsNm: obj.goodsNm.length > 0 ? null : '상품명은 필수 입니다',              //상품명
            goodsImages: obj.goodsImages.length > 0 ? null : '대표 이미지는 최소 1장 이상 필요합니다',	        //상품이미지
            // searchTag: '',	        //태그
            itemNo: obj.itemNo ? null : '품목은 필수 입니다',	            //품목번호
            // itemName: '',	              //품목
            itemKindCode: obj.itemKindCode ? null : '품종은 필수 입니다',	            //품종
            productionArea: obj.productionArea ? null : '생산지는 필수 입니다',	      //생산지
            // cultivationNo: obj.cultivationNo ? null : '재배방법은 필수 입니다',,	  //재배방법번호

            cultivationNm: obj.cultivationNm ? null : '재배방법은 필수 입니다',	  //재배방법명
            pesticideYn: obj.pesticideYn ? null : '농약유무는 필수 입니다',	        //농약유무
            vatFlag: obj.vatFlag? null : '과세여부를 선택해 주시기 바랍니다',              // 과세여부
            packUnit: obj.packUnit ? null : '포장단위는 필수 입니다',	            //포장단위
            packAmount: ComUtil.toNum(obj.packAmount) > 0 ? null : '포장양은 필수 입니다',	        //포장 양
            packCnt: ComUtil.toNum(obj.packCnt) >= 0 ? null : '판매수량은 필수 입니다',	            //판매 수량

            deliveryQty:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE ||
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_FREE ||                   //몇개이상 무료배송
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT ?              //몇개씩 배송요금 부과
                    ComUtil.toNum(obj.deliveryQty) ? null : '무료배송조건을 입력해 주세요' : null,      //배송비 정책 : 배송비 무료로 될 수량

            deliveryFee:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE ?                //무료배송 일 경우 밸리데이션 체크 안함
                    null : ComUtil.toNum(obj.deliveryFee) ? null : '배송비는 필수 입니다',             //배송비

            consumerPrice: ComUtil.toNum(obj.consumerPrice) > 0 ? null : '소비자가를 입력해 주세요',
            currentPrice: ComUtil.toNum(obj.currentPrice) > 0 ? null : '실제 판매되는 가격을 입력해 주세요',
            // priceSteps: priceSteps,

            saleEnd: obj.saleEnd ? null : '판매마감일은 필수 입니다',      //판매마감일
            goodsContent: obj.goodsContent ? null : '상품상세설명은 필수 입니다',
            goodsTypeCode: obj.goodsTypeCode ? null : '상품정보제공 고시 설정은 필수 입니다'
        }
    }

    //조회
    search = async () => {
        if(!this.state.goods.goodsNo)
            return

        const { data: goods } = await getGoodsByGoodsNo(this.state.goods.goodsNo)

        goods.goodsInfoData = {A:[], P:[], H:[]}

        goods.goodsInfoData[goods.goodsTypeCode] = Object.assign([], goods.goodsInfo)

        return goods
    }

    //대표상품 이미지
    onGoodsImageChange = (images) => {

        const goods = Object.assign({}, this.state.goods)
        goods.goodsImages = images

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    onContentImageChange = (images) => {

        const goods = Object.assign({}, this.state.goods)
        goods.contentImages = images

        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //재배방법
    onCultivationNmClick = (item) => {
        const goods = Object.assign({}, this.state.goods)
        goods.cultivationNm = item.value
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //농약유무
    onPesticideYnClick  = (item) => {
        const goods = Object.assign({}, this.state.goods)
        goods.pesticideYn = item.value
        this.setValidatedObj({goods})
        this.setState({goods})
    }
    //포장단위
    onPackUnitChange = (e) => {
        const goods = Object.assign({}, this.state.goods)

        //기타
        if(e.target.value === '99'){
            goods.packUnit = ''
        }else{
            goods.packUnit = e.target.value
        }

        //console.log({target: e.target.value})

        this.setValidatedObj({goods})
        this.setState({goods}, ()=>{
            this.inputPackUnit.current.focus()
        })

    }

    //과세여부
    onVatChange = (e) => {
        const goods = Object.assign({}, this.state.goods);
        goods.vatFlag = e.target.value;

        console.log(e.target.value, goods.vatFlag);

        this.setValidatedObj({goods});
        this.setState({goods})
    }

    onInputPackUnitChange = (e) => {
        const value = e.target.value
        const goods = Object.assign({}, this.state.goods)
        goods.packUnit = value
        this.setState({
            goods: goods
        })
        this.setValidatedObj({goods})
    }

    isEtcPackUnit = () => {
        //기타를 제외한 것을 선택
        const packUnits = bindData.packUnit.filter(item => item.value !== '99')
        const packUnit = packUnits.find(item => item.value === this.state.goods.packUnit)

        if(packUnit){
            return false
        }
        return true
    }

    //예상발송일 달력
    onExpectShippingChange = ({ startDate, endDate })=> {
        const goods = Object.assign({}, this.state.goods)
        goods.expectShippingStart = startDate && startDate.startOf('day')
        goods.expectShippingEnd = endDate && endDate.endOf('day')
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //인풋박스
    onInputChange = (e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        if(name === 'currentPrice'){
            if(goods.consumerPrice === null || goods.consumerPrice === '') {
                alert('소비자가를 먼저 입력해주세요.');
                return;
            }
            const currentPrice = ComUtil.toNum(value)
            const consumerPrice = ComUtil.toNum(goods.consumerPrice)


            if(currentPrice === 0){
                goods.discountRate = 100
            }
            else if(consumerPrice > 0 && currentPrice > 0){
                const discountRate = 100 - ((currentPrice / consumerPrice) * 100)
                goods.discountRate = ComUtil.toNum(discountRate)
            }
        }

        if(name === 'consumerPrice' && goods.currentPrice !== null && ComUtil.toNum(goods.currentPrice) > 0) {
            const currentPrice = ComUtil.toNum(goods.currentPrice);
            const consumerPrice = ComUtil.toNum(value);
            const discountRate = 100 - ((currentPrice / consumerPrice) * 100);
            goods.discountRate = ComUtil.toNum(discountRate);
        }

        goods[name] = value
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //임시저장
    onAddTempGoodsClick = async (e) => {
        this.loadingToggle('temp')
        await this.saveTemp();
        this.loadingToggle('temp')
    }

    saveTemp = async () => {
        const goods = Object.assign({}, this.state.goods)
        if(goods.goodsNm.length <= 0){
            this.notify('상품명은 필수 입니다', toast.error)
            return
        }

        // 과세,면세는 true,false로 변경
        if(goods.vatFlag === '과세') {
            goods.vatFlag = true;
        } else {
            goods.vatFlag = false;
        }

        await this.save(goods)
    }

    loadingToggle = (key) => {
        const isLoading = this.state.isLoading[key]
        this.setState({
            isLoading: {
                [key]: !isLoading
            }
        })
    }

    isPassedValidation = () => {
        const state = Object.assign({}, this.state)
        //에디터의 내용을 state에 미리 저장 후 밸리데이션 체크
        //state.goods.goodsContent = this.editorRef.current.getInstance().getValue()

        //밸리데이션 체크
        this.setValidatedObj(state)
        //밸리데이션을 통과했는지 여부
        const valid = this.isValidatedSuccessful()

        if(!valid.isSuccess){
            this.notify(valid.msg, toast.error)
            return false
        }
        return true
    }

    //상품노출
    onConfirmClick = async () => {

        if(!this.isPassedValidation()) return

        if(!window.confirm('상품을 판매개시 하시겠습니까? 이후 수정되는 항목이 제한 됩니다!')) return

        //임시저장
        await this.saveTemp()

        //노출 업데이트
        await this.confirmSave()
    }

    //상품수정(노출이후)
    onUpdateClick = async () => {
        if(!this.isPassedValidation()) return
        if(!window.confirm('수정되는 상품은 즉시 반영 됩니다')) return
        this.loadingToggle('update')
        await this.saveTemp();
        this.loadingToggle('update')
    }

    //할인율 계산
    getDiscountRate = (goods) => {
        return (100 - ((goods.currentPrice / goods.consumerPrice) * 100)) || 0
    }

    //저장(DB에 selectedStepPrice 가 없어져서, 사용자가 선택한 단계와는 상관없이 단계별 값이 있는 마지막 )
    save = async (goods) => {

        //상품상세
        goods.goodsContent = this.state.goods.goodsContent; //this.editorRef.current.getInstance().getValue()

        //블리리뷰 노출 여부
        goods.blyReviewConfirm = this.state.goods.blyReviewConfirm;

        //확정 전까지 재고수량 동기화
        if(!goods.confirm){
            goods.remainedCnt = goods.packCnt;
        }

        // 생산자가 묶음배송일 경우 '원이상 무료배송'으로 goods에 저장함.
        if(this.state.producerInfo.producerWrapDeliver) {
            goods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE;
            goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
            goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        }

        if(goods.inTimeSalePeriod) {
            goods.discountRate = goods.defaultDiscountRate
        }

        console.log({saveGoods: goods})

        //상품이미지의 imageNo로 정렬
        ComUtil.sortNumber(goods.goodsImages, 'imageNo', false)

        const {data: goodsNo, status} = await addGoods(goods)
        if(status !== 200) {
            alert('등록이 실패 하였습니다')
            return
        }
        else if(goodsNo === -1){
            alert('이미지 및 컨텐츠 사이즈가 10메가를 초과했습니다. 용량을 줄여서 다시 해주세요')
            return
        }
        else if(goodsNo === -2){
            alert('서버에서 컨텐츠를 파일로 저장시 오류가 발생하였습니다.')
            return
        }
        else{
            this.notify('저장되었습니다', toast.success)
            goods.vatFlag = goods.vatFlag ? '과세' : '면세'
            goods.goodsNo = goodsNo
            this.setState({
                goods: goods
            })
        }
    }

    confirmSave = async() => {
        const goods = Object.assign({}, this.state.goods);
        goods.confirm = true; //상품목록에 노출

        let confirmResult = updateConfirmGoods(this.state.goods.goodsNo, goods.confirm);

        if(confirmResult) {
            this.notify('상품이 노출되었습니다', toast.success)
            this.setState({
                goods: goods
            })
        }
    }

    //결재처리 : 202012-selfDeposit 제외 (DirectGoodsReg에서는 원래 필요없었는데 불필요코드였음.
    // modalToggleOk = async () => {
    //     let passPhrase = this.state.passPhrase;
    //     let {data: checkResult} = await checkPassPhrase(passPhrase);
    //     if(!checkResult){
    //         alert('블록체인 비밀번호를 확인해주세요.');
    //
    //         //블록체인 비번 초기화
    //         this.setState({clearPassPhrase: true});
    //
    //         return; //블록체인 비번 오류, stop&stay
    //     }
    //
    //     //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
    //     this.setState({
    //         modal: false
    //     });
    //
    //     this.setState({chainLoading: true}); //스플래시 열기
    //     let result = await scOntPayProducerDeposit(this.state.goods.goodsNo, this.state.goods.totalDepositBlct);
    //     if(!result){
    //         alert('블록체인 기록에 실패하였습니다. 다시 한번 시도해주세요.')
    //
    //     } else {
    //         await this.confirmSave()
    //     }
    //     this.setState({chainLoading: false});
    //
    // }
    // modalToggle = () => {
    //     this.setState(prevState => ({
    //         modal: !prevState.modal
    //     }));
    // };


    //202012-selfDeposit 제외
    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    // onPassPhrase = (passPhrase) => {
    //     //console.log(passPhrase);
    //     this.setState({
    //         passPhrase: passPhrase,
    //         clearPassPhrase: false
    //     });
    // };
    //
    // // 블록체인 비밀번호 힌트
    // findPassPhrase = () => {
    //     this.setState({
    //         modalType: 'passPhrase',
    //         modal: true
    //     })
    // }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    //미리보기
    onPreviewClick = () => {
        this.toggle()
    }
    //만약 모달 창 닫기를 강제로 하려면 아래처럼 넘기면 됩니다
    onPreviewClose = () => {
        this.toggle()
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    // 상품정보제공 고시 설정
    onGoodsTypeModal = (data) => {
        let goods = Object.assign({}, this.state.goods)
        if(data) {
            goods.goodsInfoData[goods.goodsTypeCode] = data

            this.setValidatedObj({goods})
            this.setState({goods})
        }

        this.setState({
            goodsTypeModalOpen: !this.state.goodsTypeModalOpen
        })
    }

    //품목
    onItemChange = (item) => {

        //품종 세팅
        this.setItemKinds(item.value)

        const goods = Object.assign({}, this.state.goods)

        if(item.value !== goods.itemNo){
            goods.itemKindCode = null
            goods.itemKindName = null
        }

        goods.itemNo = item.value
        goods.itemName = item.label
        this.setValidatedObj({goods})
        this.setState({ goods })
    }

    //밸리데이션검증 성공여부
    isValidatedSuccessful = () => {
        let isSuccess = true
        let msg = ''

        //Object.keys(validatedObj)

        Object.keys(validatedObj).some((key) => {
            const _msg = validatedObj[key]
            if(_msg){
                isSuccess = false
                msg = _msg
            }
            return _msg !== null || _msg === undefined || _msg === ''
        })

        return {isSuccess, msg}
    }

    // 상품 삭제
    onDeleteGoodsClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await deleteGoods(this.state.goods.goodsNo)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    // 상품 판매 중단
    onGoodsStopClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await updateGoodsSalesStop(this.state.goods.goodsNo)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    //상품 복사
    onCopyClick = async(isConfirmed) => {
        if(isConfirmed){
            const { status, data: goodsNo } = await copyGoodsByGoodsNo(this.state.goods.goodsNo)

            if(status != 200 || goodsNo <= 0){
                alert('[상품복사실패] 다시 진행해주세요')
                return
            }

            alert('복사가 완료되었습니다. 상품 목록에서 확인해 주세요')
        }
    }

    // 상품 판매 일시중지
    onGoodsPausedClick = async (isConfirmed) => {
        if(isConfirmed) {
            const result = await updateSalePaused(this.state.goods.goodsNo, true)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    // 상품 판매 재개
    onGoodsResumeClick = async (isConfirmed) => {
        if(isConfirmed) {
            const result = await updateSalePaused(this.state.goods.goodsNo, false)
            if(result.data === true) {
                this.props.onClose();
            }
        }
    }

    onDateChange = (date) => {
        const goods = Object.assign({}, this.state.goods)

        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        goods.saleEnd = date

        this.setValidatedObj({goods})

        this.setState({goods})
    }

    //배송정책 드롭다운 클릭
    onTermsOfDeliveryFeeChange = ({value, label}) => {
        // deliveryFeeTerms.find(terms=>terms.value === value).label

        const state = Object.assign({}, this.state)

        //state.termsOfDeliveryFee = value

        switch (value){
            //무료배송
            case TERMS_OF_DELIVERYFEE.FREE :
                state.goods.deliveryFee = 0     //배송비
                state.goods.deliveryQty = ''    //무료배송 조건
                break;
            case TERMS_OF_DELIVERYFEE.NO_FREE :
                state.goods.deliveryQty = ''    //무료배송 조건
                break;
        }

        state.goods.termsOfDeliveryFee = value

        this.setValidatedObj(state)
        this.setState(state)
    }

    // 판매종료일
    onDateChange = (date) => {
        const goods = Object.assign({}, this.state.goods)

        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        goods.saleEnd = date

        this.setValidatedObj({goods})

        this.setState({goods})
    }

    onItemKindChange = (data) => {
        const goods = Object.assign({}, this.state.goods)
        goods.itemKindName = data.label;
        goods.itemKindCode = data.value;
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //품종 세팅
    setItemKinds = (itemNo) => {
        if(itemNo !== this.state.goods.itemNo){
            const item = bindData.items.find(item => item.value === itemNo)
            if(item && item.itemKinds){
                bindData.itemKinds = item.itemKinds.map((itemKind) => ({value: itemKind.code, label: itemKind.name}))
            }
        }
    }

    // 상품정보제공고시
    onGoodsTypeChange = (data) => {
        console.log(data)
        const goods = Object.assign({}, this.state.goods)
        goods.goodsTypeName = data.label;
        goods.goodsTypeCode = data.value;
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    goodsTypeSetting = () => {
        this.setState({ goodsTypeModalOpen: true })
    }

    // 판매 개시 후 상품수량 수정
    modifyPackCnt = () => {
        const goods = Object.assign({}, this.state.goods)
        const inputPackCnt = prompt('판매할 총 수량을 입력하세요. (현재 총 수량: ' + goods.packCnt + ', 현재 잔여수량: ' + goods.remainedCnt + ')', '숫자만 입력')

        const prevRemainedCnt = goods.remainedCnt   // 바뀌기 전 남은 수량

        if(inputPackCnt - goods.packCnt >= 0) {     // 현재수량보다 플러스
            goods.remainedCnt = prevRemainedCnt + (inputPackCnt-goods.packCnt)
            goods.packCnt = inputPackCnt

            console.log(goods.packCnt, goods.remainedCnt)
        } else {                                    // 현재수량보다 마이너스
            if(inputPackCnt < goods.packCnt-goods.remainedCnt) {
                alert('판매완료된 수량보다 작은 수를 입력하실 수 없습니다.')
                return false
            } else {
                goods.remainedCnt = prevRemainedCnt - (goods.packCnt-inputPackCnt)
                goods.packCnt = inputPackCnt
            }
        }

        if(window.confirm('판매수량을 변경하시겠습니까?')) {
            this.setState({ goods })

        }
    }

    // db에 저장된 판매수량 다시 가져오기
    resetPackCnt = async() => {
        const originGoods = await this.search();    // db에 저장되어 있는 goods 정보
        const goods = Object.assign({}, this.state.goods)

        goods.packCnt = originGoods.packCnt
        goods.remainedCnt = originGoods.remainedCnt

        this.setState({ goods })
    }

    //상품 컨텐츠 온체인지 (tui-editor)
    onChangeGoodsContent = (editorHtml) => {
        const goods = Object.assign({}, this.state.goods)
        goods.goodsContent = editorHtml;
        this.setState({goods});
    }

    // 블리리뷰 노출 여부
    onChangeBlyReview = (e) => {
        const state = Object.assign({}, this.state)

        state.goods.blyReviewConfirm = e.target.checked
        this.setState({ state })
    }

    onblyReviewChange = (editorHtml) => {
        const goods = Object.assign({}, this.state.goods)
        goods.blyReview = editorHtml;
        this.setState({goods});
    }

    onHopeDeliveryFlag = (e) => {
        const hopeDeliveryFlag = e.target.checked;
        const state = Object.assign({}, this.state);
        state.goods.hopeDeliveryFlag = hopeDeliveryFlag;
        this.setState(state);
    }


    render(){
        if(!this.state.isDidMounted) return <BlocerySpinner/>

        const { goods } = this.state
        const star = <span className='text-danger'>*</span>

        const saleEndDate = ComUtil.utcToString(goods.saleEnd, 'YYYY-MM-DD');
        const now = ComUtil.utcToString(new Date().getTime(), 'YYYY-MM-DD')

        let saleEnd = false;
        if(saleEndDate) {
            const compareDate = ComUtil.compareDate(saleEndDate, now)
            if (compareDate === -1) {
                saleEnd = true
            } else {
                saleEnd = false
            }
        }

        const salesStopText = goods.saleStopped && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (goods.confirm && !goods.saleStopped) && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !goods.confirm ? <Button className='d-flex align-items-center justify-content-center mr-2' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} color='warning'>임시저장{this.state.isLoading.temp && <Spinner/> }</Button> : null
        const btnConfirm = (goods.goodsNo && !goods.confirm) ?  <Button className='mr-2' onClick={this.onConfirmClick} color={'warning'}>확인(판매개시)</Button> : null
        const btnDelete = (goods.goodsNo && !goods.confirm) ? <ModalConfirm title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}><Button color={'danger'} className='mr-2'>삭제</Button></ModalConfirm> : null
        const btnPreview = goods.goodsNo ? <Button className='mr-2' onClick={this.onPreviewClick}>미리보기</Button> : null
        const btnGoodsStop = (goods.confirm && !goods.saleStopped) ? <ModalConfirm title={'상품을 판매중단 하시겠습니까?'} content={'판매중단된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}><Button color={'danger'} className='mr-2'>판매중단</Button></ModalConfirm> : null
        const btnUpdate = (goods.confirm && !goods.saleStopped) ? <Button className='d-flex align-items-center justify-content-center mr-2'  onClick={this.onUpdateClick} disabled={this.state.isLoading.update} color={'warning'}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        const btnCopy = (goods.goodsNo && goods.confirm )? <ModalConfirm title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/>복사 진행전 저장을 꼭 해 주세요</Fragment>} onClick={this.onCopyClick}><Button className='mr-2' color={'secondary'}>상품복사</Button></ModalConfirm> : null
        const btnPaused = (!goods.salePaused && goods.confirm && !goods.saleStopped && goods.remainedCnt != 0 && !saleEnd) ? <ModalConfirm title={'판매 일시중지'} content={'일시중지 후 다시 판매개시를 할 수 있습니다. 일시중지 하시겠습니까?'} onClick={this.onGoodsPausedClick}><Button>일시중지</Button></ModalConfirm> : null
        const btnResume = (goods.salePaused && goods.confirm && !goods.saleStopped && goods.remainedCnt != 0 && !saleEnd) ? <ModalConfirm title={'판매재개'} content={'해당 상품을 다시 판매개시하시겠습니까?'} onClick={this.onGoodsResumeClick}><Button color='info'>판매재개</Button></ModalConfirm> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label

        const producerWrapDeliver = this.state.producerInfo.producerWrapDeliver;
        if(producerWrapDeliver) {
            termsOfDeliveryFeeLabel = '생산자 묶음배송'
            goods.deliveryQty = this.state.producerInfo.producerWrapLimitPrice;
            goods.deliveryFee = this.state.producerInfo.producerWrapFee;
        }

        return(
            <Fragment>
                <div className={Style.wrap}>
                    {
                        this.state.chainLoading && <BlockChainSpinner/>
                    }
                        <Row>
                            <Col className='border p-0'>
                                {
                                    this.state.validationCnt > 0 && (
                                        <div className={Style.badge}>
                                            <Badge color="danger" pill>필수{this.state.validationCnt}</Badge>
                                        </div>
                                    )
                                }
                                {
                                    salesStopText
                                }
                                {
                                    confirmText
                                }
                                <Container>
                                    <br/>
                                    <h6>즉시상품정보</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>대표 이미지{star}</Label>
                                        <SingleImageUploader images={goods.goodsImages} defaultCount={10} isShownMainText={true} onChange={this.onGoodsImageChange} />

                                        {/*<SingleImageUploader images={goods.goodsImages} defaultCount={10} onChange={this.onGoodsImageChange} />*/}
                                        {/*<ImageUploader onChange={this.onGoodsImageChange} multiple={true} limit={10}/>*/}
                                        <Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>
                                    </FormGroup>
                                    <h6>상세이미지업로드(소비자에게 노출되지 않는 Markdown방식 URL복사용 이미지 입니다)</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>이미지{star}</Label>
                                        <SingleImageUploader
                                            images={goods.contentImages}
                                            defaultCount={10}
                                            isShownMainText={false}
                                            onChange={this.onContentImageChange}
                                            isShownCopyButton={true}
                                            isNoResizing={true}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>상품명{star}</Label>
                                        <Input name={this.names.goodsNm} value={goods.goodsNm} onChange={this.onInputChange}/>
                                        <Fade in={validatedObj.goodsNm? true : false} className="text-danger small mt-1" >{validatedObj.goodsNm}</Fade>
                                    </FormGroup>
                                    {/*<FormGroup>*/}
                                    {/*<Label className={'text-secondary'}>태그</Label>*/}
                                    {/*<Input name={this.names.searchTag} value={goods.searchTag} onChange={this.onInputChange}/>*/}
                                    {/*</FormGroup>*/}
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>기본정보</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>품목{star}</Label>
                                        {
                                            goods.confirm ? <div>{goods.itemName}</div> : (
                                                <Fragment>
                                                    <Select options={bindData.items}
                                                            value={ bindData.items.find(item => item.value === goods.itemNo)}
                                                            onChange={this.onItemChange}
                                                    />
                                                    <Fade in={validatedObj.itemNo? true : false} className="text-danger small mt-1" >{validatedObj.itemNo}</Fade>
                                                </Fragment>
                                            )
                                        }


                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>품종{star}</Label>
                                        {
                                            goods.confirm ? <div>{goods.itemKindName}</div> : (
                                                <Fragment>
                                                    <Select options={bindData.itemKinds}
                                                            value={goods.itemKindCode ? bindData.itemKinds.find(itemKind => itemKind.value === goods.itemKindCode) : null}
                                                            onChange={this.onItemKindChange}
                                                    />
                                                    <Fade in={validatedObj.itemKind? true : false} className="text-danger small mt-1" >{validatedObj.itemKind}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>생산지{star}</Label>
                                        <Input name={this.names.productionArea} value={goods.productionArea} placeholder='ex)전남 여수' onChange={this.onInputChange} />
                                        <Fade in={validatedObj.productionArea? true : false} className="text-danger small mt-1" >{validatedObj.productionArea}</Fade>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>재배방법</Label>
                                        {/*<RadioButtons nameField='cultivationNm' value={goods.cultivationNm} defaultIndex={0} data={bindData.cultivationNm || []} onClick={this.onCultivationNmClick} />*/}
                                        <RadioButtons
                                            value={bindData.cultivationNm.find(item => item.value === goods.cultivationNm)}
                                            options={bindData.cultivationNm} onClick={this.onCultivationNmClick} />
                                        <Fade in={validatedObj.cultivationNm? true : false} className="text-danger small mt-1" >{validatedObj.cultivationNm}</Fade>
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>농약유무</Label>
                                        <RadioButtons
                                            value={bindData.pesticideYn.find(item => item.value === goods.pesticideYn)}
                                            options={bindData.pesticideYn} onClick={this.onPesticideYnClick} />
                                        <Fade in={validatedObj.pesticideYn? true : false} className="text-danger small mt-1" >{validatedObj.pesticideYn}</Fade>
                                        {/*<RadioButtons nameField='pesticideYn' defaultIndex={0} data={bindData.pesticideYn || []} onClick={this.onPesticideYnClick} />*/}
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>과세여부</Label>
                                        <Fragment>
                                            <div className='d-flex align-items-center'>

                                                {
                                                    bindData.vatFlag.map((item, index) => {
                                                            const id = `vatFlag_${index}`
                                                            return(
                                                                <Fragment key={id}>
                                                                    <input
                                                                        checked={goods.vatFlag === item.value ? true : false}
                                                                        className={'mr-2'}
                                                                        type="radio"
                                                                        id={id}
                                                                        name="vatFlag"
                                                                        value={item.value}
                                                                        onChange={this.onVatChange} />
                                                                    <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                                                                </Fragment>
                                                            )
                                                        }
                                                    )
                                                }
                                            </div>

                                            <Fade in={validatedObj.vatFlag? true : false} className="text-danger small mt-1" >{validatedObj.vatFlag}</Fade>
                                        </Fragment>
                                    </FormGroup>
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>상품정보제공 고시 설정</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>분류선택{star}</Label>
                                        {
                                            <Fragment>
                                                <div className='d-flex'>
                                                    <div style={{width:'500px'}}>
                                                        <Select options={bindData.goodsTypes}
                                                                value={ bindData.goodsTypes.find(item => item.value === goods.goodsTypeCode)}
                                                                onChange={this.onGoodsTypeChange}
                                                        />
                                                    </div>
                                                    <div className='d-flex align-items-center justify-content-center'>
                                                        {
                                                            goods.goodsTypeCode != 'none' &&
                                                            <Button className='ml-2' size='sm' color='secondary' onClick={this.goodsTypeSetting}>설정</Button>
                                                        }
                                                    </div>
                                                </div>
                                                <Fade in={validatedObj.goodsTypeCode? true : false} className="text-danger small mt-1" >{validatedObj.goodsTypeCode}</Fade>
                                            </Fragment>
                                        }
                                    </FormGroup>
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>판매정보</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>포장 양{star}</Label>
                                        {
                                            goods.confirm ? <div>{ComUtil.addCommas(goods.packAmount)}</div> : (
                                                <Fragment>
                                                    <Input type="number" className={'mr-1'} name={this.names.packAmount} value={goods.packAmount} onChange={this.onInputChange}/>
                                                    <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>포장 단위{star}</Label>
                                        {
                                            goods.confirm ? <div>{ComUtil.addCommas(goods.packAmount)}</div> : (
                                                <Fragment>
                                                    <div className='d-flex align-items-center'>

                                                        {
                                                            bindData.packUnit.filter(item=>item.value !== '99').map((item, index) => {
                                                                    const id = `packUnit_${index}`
                                                                    return(
                                                                        <Fragment key={id}>
                                                                            <input
                                                                                checked={goods.packUnit === item.value ? true : false}
                                                                                className={'mr-2'}
                                                                                type="radio"
                                                                                id={id}
                                                                                name="packUnit"
                                                                                value={item.value}
                                                                                onChange={this.onPackUnitChange} />
                                                                            <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                                                                        </Fragment>
                                                                    )
                                                                }
                                                            )
                                                        }

                                                        <input
                                                            checked={this.isEtcPackUnit()}
                                                            className={'mr-2'}
                                                            type="radio"
                                                            id={'packUnit_3'}
                                                            name="packUnit"
                                                            value={bindData.packUnit[3].value}
                                                            onChange={this.onPackUnitChange} />
                                                        <label for={'packUnit_3'} className='p-0 m-0 mr-3'>{bindData.packUnit[3].label}</label>

                                                        {
                                                            // goods.packUnitCode === '99' && <input type='text' name='packUnitText' value={goods.packUnit} onChange={this.onInputPackUnitChange} />
                                                        }
                                                    </div>

                                                    <Input
                                                        className={'mt-2'}
                                                        // style={{display: document.getElementById('packUnit_3').checked ? 'block' : 'none'}}
                                                        innerRef={this.inputPackUnit}
                                                        value={goods.packUnit}
                                                        onChange={this.onInputPackUnitChange}
                                                        placeholder={'l(리터), 개, 등의 단위 입력'}
                                                    />

                                                    <Fade in={validatedObj.packUnit? true : false} className="text-danger small mt-1" >{validatedObj.packUnit}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>판매수량{star}</Label>
                                        {
                                            goods.confirm ?
                                                <div className='d-flex'>
                                                    <div className='mr-2'>{goods.packCnt}</div>
                                                    <div className='mr-2'><Button size='sm' onClick={this.modifyPackCnt}>수정</Button></div>
                                                    <div><Button size='sm' onClick={this.resetPackCnt}>수정취소</Button></div>
                                                </div>
                                                :
                                                (
                                                <Fragment>
                                                    <CurrencyInput name={this.names.packCnt} value={goods.packCnt} onChange={this.onInputChange}/>
                                                    <Fade in={validatedObj.packCnt? true : false} className="text-danger small mt-1" >{validatedObj.packCnt}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>가격정보</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>소비자가{star}</Label>
                                        <Fragment>
                                            <InputGroup  size={'md'}>
                                                <CurrencyInput name={this.names.consumerPrice} value={goods.consumerPrice} onChange={this.onInputChange} placeholder={'소비자가'}/>
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>원</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <Fade in={validatedObj.consumerPrice ? true : false} className="text-danger small mt-1" >{validatedObj.consumerPrice}</Fade>
                                        </Fragment>
                                    </FormGroup>
                                    <FormGroup>
                                        <div className={'d-flex'}>
                                            <Label className={'text-secondary small'}>판매가{star}</Label>
                                            <span className={'ml-auto text-secondary small'}>{Math.round(ComUtil.addCommas(goods.discountRate),0)} %
                                                {
                                                    goods.consumerPrice && goods.consumerPrice > 0 && goods.currentPrice && goods.currentPrice > 0 && (
                                                        ` (- ${ ComUtil.addCommas(ComUtil.toNum(goods.consumerPrice) - ComUtil.toNum(goods.currentPrice))} 원) `
                                                    )
                                                }
                                                할인
                                                </span>
                                        </div>
                                        <Fragment>
                                            <InputGroup  size={'md'}>
                                                <CurrencyInput name={this.names.currentPrice} value={goods.currentPrice} onChange={this.onInputChange} placeholder={`판매가`}/>
                                                <InputGroupAddon addonType="append">
                                                    <InputGroupText>원</InputGroupText>
                                                </InputGroupAddon>
                                            </InputGroup>
                                            <Fade in={validatedObj.currentPrice ? true : false} className="text-danger small mt-1" >{validatedObj.currentPrice}</Fade>
                                        </Fragment>
                                    </FormGroup>
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>생산/배송정보</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>무료배송 조건{star}</Label>
                                        {
                                            goods.confirm ? (

                                                <div>
                                                    {
                                                        (goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE) ? null : <span>{goods.deliveryQty}</span>
                                                    }
                                                    <span>{termsOfDeliveryFeeLabel}</span>
                                                </div>

                                            ) : (
                                                <Fragment>
                                                    <InputGroup>
                                                        <CurrencyInput
                                                            disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE} readOnly={producerWrapDeliver}
                                                            style={{width:50}} name={this.names.deliveryQty} value={goods.deliveryQty} onChange={this.onInputChange} placeholder={'배송조건(숫자)'}/>
                                                        <InputGroupButtonDropdown addonType="append" style={{zIndex:0}} isOpen={this.state.isDeliveryFeeTermsOpen} toggle={()=>this.setState({isDeliveryFeeTermsOpen:!this.state.isDeliveryFeeTermsOpen})}>
                                                            <DropdownToggle caret>
                                                                {
                                                                    termsOfDeliveryFeeLabel
                                                                }
                                                            </DropdownToggle>
                                                            { producerWrapDeliver ? null :
                                                                <DropdownMenu>
                                                                    {
                                                                        bindData.termsOfDeliveryFees.map((terms, index) =>
                                                                            <DropdownItem
                                                                                key={'termsOfDeliveryFees' + index}
                                                                                onClick={this.onTermsOfDeliveryFeeChange.bind(this, terms)}>{terms.label}</DropdownItem>)
                                                                    }
                                                                </DropdownMenu>
                                                            }
                                                        </InputGroupButtonDropdown>
                                                    </InputGroup>
                                                    <Fade in={validatedObj.deliveryQty ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryQty}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>배송비{star}</Label>
                                        {
                                            goods.confirm ? (
                                                <div>
                                                    {
                                                        ComUtil.addCommas(Math.round(goods.deliveryFee,0))
                                                    }
                                                </div>
                                            ) : (
                                                <Fragment>
                                                    <CurrencyInput disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}  name={this.names.deliveryFee} value={goods.deliveryFee} onChange={this.onInputChange} placeholder={'배송비'} readOnly={producerWrapDeliver}/>
                                                    <Fade in={validatedObj.deliveryFee ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryFee}</Fade>
                                                </Fragment>
                                            )
                                        }
                                    </FormGroup>
                                    {/*<FormGroup>*/}
                                        {/*<Label className={'text-secondary small'}>발송일{star}</Label>*/}
                                        {/*<div className='d-flex'>*/}
                                            {/*<div className="mr-2">주문접수 후</div>*/}
                                            {/*<div className="mr-2" style={{width:'100px'}}><Input onChange={this.onInputChange}></Input></div>*/}
                                            {/*<div> 일 이내(최대 7일)</div>*/}
                                        {/*</div>*/}
                                        {/*<Fade in={false} className="text-danger small mt-1">7일 이내로 작성해주세요.</Fade>*/}
                                    {/*</FormGroup>*/}
                                </Container>
                                <hr/>
                                <Container>
                                    <h6>판매종료일{star}</h6>
                                    <SingleDatePicker
                                        placeholder="판매종료일"
                                        date={goods.saleEnd ? moment(goods.saleEnd) : null}
                                        onDateChange={this.onDateChange}
                                        focused={this.state['focused']} // PropTypes.bool
                                        onFocusChange={({ focused }) => this.setState({ ['focused']:focused })} // PropTypes.func.isRequired
                                        id={"stepPriceDate"} // PropTypes.string.isRequired,
                                        numberOfMonths={1}
                                        withPortal
                                        small
                                        readOnly
                                        calendarInfoPosition="top"
                                        enableOutsideDays
                                        // daySize={45}
                                        verticalHeight={700}
                                        // renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
                                    />


                                </Container>
                                <hr/>
                                <Container>
                                    <h6>발송일</h6>
                                    <DateRangePicker
                                        startDateId='expectShippingStart'
                                        endDateId='expectShippingEnd'
                                        startDatePlaceholderText="시작일"
                                        endDatePlaceholderText="종료일"
                                        startDate={goods.expectShippingStart ? moment(goods.expectShippingStart) : null}
                                        endDate={goods.expectShippingEnd ? moment(goods.expectShippingEnd) : null}
                                        onDatesChange={this.onExpectShippingChange}
                                        focusedInput={this.state.focusedInput}
                                        onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
                                        numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                        orientation={'horizontal'}
                                        openDirection="up"
                                        withPortal
                                        small
                                        readOnly
                                        showClearDates
                                        calendarInfoPosition="top"
                                        // isDayBlocked={(date)=>{
                                        //     //상품판매기한보다 작거나 같은 일자는 블록처리하여 선택할 수 없도록 함
                                        //     if(date.isSameOrBefore(moment(goods.saleEnd))) return true
                                        //     return false
                                        // }}
                                        // renderCalendarInfo={this.renderExpectShippingCalendarInfo}
                                        // displayFormat={'YYYY.MM.DD'}
                                    />
                                    <Span ml={40}>
                                        <Label check>
                                            <Input type="checkbox" checked={goods.hopeDeliveryFlag ? true:false} onChange={this.onHopeDeliveryFlag} />소비자 희망수령일 기능 적용
                                        </Label>
                                    </Span>
                                </Container>

                                <hr/>

                                {/*<ProducerFullModalPopupWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose}>*/}
                                {/*<Goods goodsNo={goods.goodsNo} />*/}
                                {/*</ProducerFullModalPopupWithNav>*/}
                                <Container>
                                    <h6>상품상세설명{star}</h6>
                                    <FormGroup>
                                        <Label className={'text-secondary small'}>상세설명입력{star}</Label>
                                        <TuiEditor
                                            editorHtml={goods.goodsContent||null}
                                            onChange={this.onChangeGoodsContent}
                                        />
                                        <FormGroup>
                                            <Fade in={validatedObj.goodsContent ? true : false} className="text-danger small mt-1" >{validatedObj.goodsContent}</Fade>
                                        </FormGroup>
                                    </FormGroup>
                                </Container>
                                <hr/>

                                <Container>
                                    <h6>블리리뷰</h6>
                                    <FormGroup>
                                        <div className='d-flex'>
                                            <Label className={'text-secondary small'}>블리리뷰입력</Label>
                                            <Label check className='ml-auto'>
                                                <Input type="checkbox" checked={goods.blyReviewConfirm} onChange={this.onChangeBlyReview} />블리리뷰 노출
                                            </Label>
                                        </div>
                                        <QullEditor
                                            editorHtml={goods.blyReview}
                                            onChange={this.onblyReviewChange}
                                        />
                                    </FormGroup>

                                </Container>
                            </Col>
                        </Row>

                        <br/>
                        {/* 버튼 */}
                        <Container>
                            <Row>
                                <Col className='p-0'>
                                    <div className='d-flex align-items-center justify-content-center'>
                                        {btnAddTempGoods}
                                        {btnConfirm}
                                        {btnDelete}
                                        {btnPreview}
                                        {btnGoodsStop}
                                        {btnUpdate}
                                        {btnCopy}
                                        {btnPaused}
                                        {btnResume}
                                    </div>
                                </Col>
                            </Row>
                        </Container>

                    <ModalWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose} noPadding={true}>
                        <Container>
                            <Row>
                                <Col className='p-0 position-relative'>
                                    <iframe
                                        src={`/goods?goodsNo=${goods.goodsNo}`}
                                        style={{width: '100%', height: 760}}
                                    ></iframe>
                                </Col>
                            </Row>
                        </Container>
                    </ModalWithNav>

                    {/* 상품정보제공 고시 설정 입력 */}
                    <ModalWithNav show={this.state.goodsTypeModalOpen} title={'고시 항목 설정'} onClose={this.onGoodsTypeModal} noPadding={true}>
                        {
                            <Agricultural code={this.state.goods.goodsTypeCode} infoValues={this.state.goods.goodsInfoData[this.state.goods.goodsTypeCode]}/>
                        }
                    </ModalWithNav>

                    {/*202012-selfDeposit 제외.*/}
                    {/* 결제비번 입력 모달 */}
                    {/*<Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.modalToggle} className={this.props.className} centered>*/}
                    {/*    <ModalHeader toggle={this.modalToggle}> 블록체인비밀번호 입력</ModalHeader>*/}
                    {/*    <ModalBody className={'p-0'}>*/}
                    {/*        /!* clearPassPhrase 초기화, onChange 결과값 세팅 *!/*/}
                    {/*        <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>*/}
                    {/*    </ModalBody>*/}
                    {/*    <ModalFooter>*/}
                    {/*        <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>*/}
                    {/*        <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}*/}
                    {/*        <Button color="secondary" onClick={this.modalToggle}>취소</Button>*/}
                    {/*    </ModalFooter>*/}
                    {/*</Modal>*/}
                    {/*/!* 결제비밀번호 조회 *!/*/}
                    {/*<Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>*/}
                    {/*    <ModalHeader>블록체인비밀번호 안내</ModalHeader>*/}
                    {/*    <ModalBody>*/}
                    {/*        마이페이지에서 블록체인비밀번호 힌트 조회 후 이용해주세요.*/}
                    {/*    </ModalBody>*/}
                    {/*    <ModalFooter>*/}
                    {/*        <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>*/}
                    {/*        <Button color="secondary" onClick={this.modalToggle}>취소</Button>*/}
                    {/*    </ModalFooter>*/}
                    {/*</Modal>*/}

                    <ToastContainer />  {/* toast 가 그려질 컨테이너 */}

                </div>
            </Fragment>
        )
    }

}