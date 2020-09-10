import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, Alert, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter, Table } from 'reactstrap'
import { RadioButtons, ProducerFullModalPopupWithNav, SingleImageUploader, FooterButtonLayer, ModalConfirm } from '~/components/common'
import Style from './WebGoodsReg.module.scss'
import { Server } from '~/components/Properties'
import { addGoods, copyGoodsByGoodsNo } from '~/lib/goodsApi'
import { scOntPayProducerDeposit, scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { exchangeWon2BLCT, GOODS_TOTAL_DEPOSIT_RATE } from '~/lib/exchangeApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import { getGoodsByGoodsNo, deleteGoods, updateConfirmGoods, updateGoodsSalesStop, getGoodsContent, getBlyReview } from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import { getLoginUser, checkPassPhrase } from '~/lib/loginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, ToastUIEditorViewer, PassPhrase, Agricultural, ProcessedFoods, HealthFoods } from '~/components/common'
import { faClock, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Checkbox } from '@material-ui/core'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'

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

export default class WebGoodsReg extends Component {

    editorRef = React.createRef();

    editorRefReview = React.createRef();

    constructor(props) {
        super(props);

        const { goodsNo } = this.props

        this.state = {
            startDate: null,
            endDate: null,
            focusedInput: null,
            isDeliveryFeeTermsOpen: false,//배송정책 종류 dropdown open 여부

            isOpen: false,
            goodsTypeModalOpen: false,      // 상품정보고시 설정 모달
            isDidMounted: false,

            isLoading: {
                temp: false,    //임시저장 버튼 스피너
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
                directGoods: false,          //즉시판매상품 : true 예약상품 : false

                goodsInfo: [],
                //화면에서만 쓰이는 로컬 스토리지
                goodsInfoData: {
                    A: [],
                    P: [],
                    H: []
                },
                blyReviewConfirm: false     // 블리리뷰 노출 여부
            },

            loginUser: {},
            selected: null,
            modal: false,                //모달 여부
            modalType: '',              //모달 종류
            passPhrase: '', //비밀번호 6 자리 PIN CODE
            clearPassPhrase: true
        }

        this.inputPackUnit = React.createRef()
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

        deliveryFee: 'deliveryFee',             //배송비
        deliveryQty: 'deliveryQty',          //배송비 정책 : 배송비 무료로 될 수량
        goodsTypeCode: 'goodsTypeCode'      //상품종류 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = ({goods: obj}) => {
        //소비자가격 및 단계별 할인율 체크 start
        let priceSteps = null;

        //소비자가격이 있을 경우만 체크해야함(소비자가격이 적혀 있지 않을경우에도 기본적으로 RadioButtons 에서는 첫번째 값을 바인딩해 놓기 때문에 index 에러가 유발됨)
        if(obj.consumerPrice){

            for(let i = 0 ; i < obj.priceSteps.length; i++){
                const stepNo = i+1
                const priceStep = obj.priceSteps.find((priceStep) => priceStep.stepNo === stepNo)

                if(!priceStep || !priceStep.until || !priceStep.price){
                    priceSteps = '단계별 날짜, 가격은 필수 입니다'
                    break
                }

                for(let x = i+1; x < obj.priceSteps.length; x++){
                    if(ComUtil.toNum(priceStep.price) === ComUtil.toNum(obj.priceSteps[x].price)){
                        priceSteps = '단계별 중복된 금액이 있습니다'
                    }
                }
            }
        }
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
            vatFlag: obj.vatFlag? null : '과세여부눈 필수 입니다',              // 과세여부
            packUnit: obj.packUnit ? null : '포장단위는 필수 입니다',	            //포장단위
            packAmount: ComUtil.toNum(obj.packAmount) > 0 ? null : '포장양은 필수 입니다',	        //포장 양
            packCnt: ComUtil.toNum(obj.packCnt) > 0 ? null : '판매수량은 필수 입니다',	            //판매 수량
            expectShippingStart: obj.expectShippingStart ? null : '예상발송 시작일은 필수 입니다',  //예상출하시작일
            expectShippingEnd: obj.expectShippingEnd ? null : '예상발송일 종료일은 필수 입니다',  //예상출하종료일

            deliveryQty:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE ||
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.GTE_FREE ||                   //몇개이상 무료배송
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT ?              //몇개씩 배송요금 부과
                    ComUtil.toNum(obj.deliveryQty) ? null : '무료배송조건을 입력해 주세요' : null,      //배송비 정책 : 배송비 무료로 될 수량

            deliveryFee:
                obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE ?                //무료배송 일 경우 밸리데이션 체크 안함
                    null : ComUtil.toNum(obj.deliveryFee) ? null : '배송비는 필수 입니다',             //배송비

            consumerPrice: ComUtil.toNum(obj.consumerPrice) > 0 ? null : '소비자가격은 필수 입니다',
            priceSteps: priceSteps,

            saleEnd: obj.saleEnd ? null : '판매마감일은 필수 입니다',      //판매마감일
            goodsContent: obj.goodsContent ? null : '상품상세설명은 필수 입니다',
            goodsTypeCode: obj.goodsTypeCode ? null : '상품정보제공 고시 설정은 필수 입니다',

            // // cultivationDiary: '',	    //재배일지
            // confirm: false,             //상품목록 노출 여부
            // contentImages: [],          //상세 이미지
            // totalDepositBlct: 0,
            // remainedDepositBlct: 0,
            // remainedCnt: 0,
            // discountRate: 0,            //할인율
            // totalPriceStep: '',         //총 가격단계 수
            // priceSteps: []              //단계별 가격
        }
    }

    async componentDidMount(){

        await this.bind()
        const loginUser = await this.setLoginUserInfo();

        const state = Object.assign({}, this.state)
        state.isDidMounted = true
        state.loginUser = loginUser
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

        //품종세팅
        this.setItemKinds(goods.itemNo)
        goods.vatFlag = this.getIsVatWording(goods.vatFlag);

        state.goods = goods;

        //goodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.goods.goodsContent && state.goods.goodsContentFileName != 0) {
            let {data:goodsContent} = await getGoodsContent(state.goods.goodsContentFileName)
            if(goodsContent) {
                state.goods.goodsContent = goodsContent
            }
        }
        this.setValidatedObj(state)
        this.setState(state)
    }

    getIsVatWording = (vatFlag) => {
        if(vatFlag) {
            return '과세'
        }
        return '면세'
    }

    setLoginUserInfo = async() => {
        return await getLoginUser();
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
            {value: 'g', label:'g(그램)'},
            {value: '근', label:'근'},
            {value: '99', label:'기타'},
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
            { value: 'none', label: '사용안함'},
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

    //상세 이미지
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
    onCultivationChange = (e) => {
        const goods = Object.assign({}, this.state.goods)
        goods.cultivationNm = e.target.value
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
    //과세여부
    onVatChange = (e) => {
        const goods = Object.assign({}, this.state.goods);
        goods.vatFlag = e.target.value;
        this.setValidatedObj({goods});
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

        //소비자 가격 일 경우
        if(name === 'consumerPrice'){
            // const priceSteps = goods.priceSteps.map(item => {
            //     // const tempItem = Object.assign({}, item)
            //     item.discountRate = this.calculatedDiscountRate(value, item.price)
            //     return item
            // })

            // goods.priceSteps = priceSteps
            //value = ComUtil.toNum(value)


            //1단계 ~ 3단계까지 초기값 세팅
            goods.priceSteps = [...Array(goods.totalPriceStep)].map((empty, index) => {
                const stepNo = index+1
                let discountRate;
                if(index === 0) discountRate = 30
                else if(index === 1) discountRate = 20
                else if(index === 2) discountRate = 10

                const until = goods.priceSteps[index] ? goods.priceSteps[index].until : null

                return {
                    until: until,
                    stepNo: stepNo,
                    price: ComUtil.toNum(value) * (1 - (discountRate / 100)),
                    discountRate: discountRate
                }
            })
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

        if(goods.packUnit !== '기타'){
            goods.packUnitText = ''
        }

        // 최종선택된 상품정보제공 분류만 state에 남김
        goods.goodsInfo = Object.assign([], goods.goodsInfoData[goods.goodsTypeCode])

        this.setState({goods})

        console.log(goods)
        // this.saveGoodsInfo();

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
        //state.goods.blyReview = this.editorRefReview.current.getInstance().getValue()

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
        // //에디터의 내용을 state에 미리 저장 후 밸리데이션 체크
        // const state = Object.assign({}, this.state)
        // state.goods.goodsContent = this.editorRef.current.getInstance().getValue()
        //
        // //밸리데이션 체크
        // this.setValidatedObj(state)
        // //밸리데이션을 통과했는지 여부
        // const valid = this.isValidatedSuccessful()
        //
        // if(!valid.isSuccess){
        //     this.notify(valid.msg, toast.error)
        //     return
        // }

        if(!this.isPassedValidation()) return


        if(!window.confirm('상품을 판매개시 하시겠습니까? 이후 수정되는 항목이 제한 됩니다!')) return

        let {data:producer} = await getProducerByProducerNo(this.state.loginUser.uniqueNo);
        this.saveGoodsSelfDeposit(producer.selfDeposit);

        await this.saveTemp();

        if(producer.selfDeposit) {
            let {data:balance} = await scOntGetBalanceOfBlct(this.state.loginUser.account);
            if(balance < this.state.goods.totalDepositBlct){
                // TODO 토큰 구매페이지 이동 혹은 안내 필요
                alert('상품 판매개시에 필요한 미배송보증금의 BLY가 부족합니다');
                return;
            }
        }
        // 현재 생산자 미배송보증금 납부 실패시 1회 재시도 하도록 되어있음. (이미 UI에는 수정 불가 안내메시지가 노출)
        await this.payDepositToken(producer.selfDeposit, this.state.goods.totalDepositBlct);
    }

    //상품수정(노출이후)
    onUpdateClick = async () => {
        if(!this.isPassedValidation()) return
        if(!window.confirm('수정되는 상품은 즉시 반영 됩니다')) return
        this.loadingToggle('update')
        await this.saveTemp();
        this.loadingToggle('update')
    }

    // 상품의 미배송보증금 납부여부 저장(selfDeposit이 true이면 생산자가 납부
    saveGoodsSelfDeposit = (selfDeposit) => {
        const goods = Object.assign({}, this.state.goods);
        goods.selfDeposit = selfDeposit;
        this.setState({
            goods: goods
        })
    };

    //할인율 계산
    getDiscountRate = (goods) => {
        return (100 - ((goods.currentPrice / goods.consumerPrice) * 100)) || 0
    }

    //저장(DB에 selectedStepPrice 가 없어져서, 사용자가 선택한 단계와는 상관없이 단계별 값이 있는 마지막 )
    save = async (goods) => {

        //소비자 가격이 없을 경우 초기화
        if(!goods.consumerPrice && !goods.consumerPrice <= 0){
            goods.priceSteps = []
        }

        //블리리뷰 노출 여부
        goods.blyReviewConfirm = this.state.goods.blyReviewConfirm


        let maxPrice = (goods.priceSteps[goods.priceSteps.length-1]).price;
        // console.log("maxPrice : " , maxPrice);
        goods.totalDepositBlct = await exchangeWon2BLCT(maxPrice * goods.packCnt * GOODS_TOTAL_DEPOSIT_RATE);
        goods.remainedDepositBlct = goods.totalDepositBlct;

        //확정 전까지 재고수량 동기화
        if(!goods.confirm){
            goods.remainedCnt = goods.packCnt;
        }

        // 과세,면세는 true,false로 변경
        if(goods.vatFlag === '과세') {
            goods.vatFlag = true;
        } else {
            goods.vatFlag = false;
        }

        console.log({saveGoods: goods})

        //return false;

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
            this.notify('블록체인에 저장이 완료되었습니다', toast.success)
            this.setState({
                goods: goods
            })
        }
    }

    payDepositToken = async (selfDeposit, depositToken) => {

        if(!selfDeposit) {
            await this.confirmSave()

        } else {
            let payConfirm = window.confirm('보유한 BLCT중 미배송 보증금으로 ' + depositToken + 'BLCT를 예치합니다. ');
            if(payConfirm) {
                //임시저장
                this.setState({
                    modal: true, //결제비번창 오픈.
                    modalType: 'pay'
                });
            } else {
                alert('미배송 보증금을 예치하지 않으면 물품을 등록할 수 없습니다.');
            }
        }
    };

    //결재처리
    modalToggleOk = async () => {
        let passPhrase = this.state.passPhrase;
        let {data: checkResult} = await checkPassPhrase(passPhrase);
        if(!checkResult){
            alert('블록체인 비밀번호를 확인해주세요.');

            //블록체인 비번 초기화
            this.setState({clearPassPhrase: true});

            return; //블록체인 비번 오류, stop&stay
        }

        //결제비번 맞으면 일단 modal off - 여러번 구매를 방지.
        this.setState({
            modal: false
        });

        this.setState({chainLoading: true}); //스플래시 열기
        let result = await scOntPayProducerDeposit(this.state.goods.goodsNo, this.state.goods.totalDepositBlct);
        if(!result){
            alert('블록체인 기록에 실패하였습니다. 다시 한번 시도해주세요.')

        } else {
            await this.confirmSave()
        }
        this.setState({chainLoading: false});

    }

    modalToggle = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    //6자리 인증 비번 PassPhrase(6 CHAR PIN CODE)
    onPassPhrase = (passPhrase) => {
        //console.log(passPhrase);
        this.setState({
            passPhrase: passPhrase,
            clearPassPhrase: false
        });
    };

    // 블록체인 비밀번호 힌트
    findPassPhrase = () => {
        this.setState({
            modalType: 'passPhrase',
            modal: true
        })
    }

    // 마이페이지로 이동
    moveToMypage = () => {
        window.location = '/mypage'
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

    //상품정보제공고시
    onGoodsTypeChange = (data) => {
        const goods = Object.assign({}, this.state.goods)
        goods.goodsTypeName = data.label;
        goods.goodsTypeCode = data.value;
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    goodsTypeSetting = () => {
        this.setState({ goodsTypeModalOpen: true })
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

                // const goods = Object.assign({}, this.state.goods)
                // goods.itemKind = null
                // this.setState({goods})

            }

        }
    }

    //단계선택
    onSelectedPriceStepClick = ({value: stepNo, label}) => {
        const goods = Object.assign({}, this.state.goods)

        const priceSteps = []

        //선택한 단계만큼 배열생성
        for(let i = 0 ; i < stepNo ; i++){
            const no = i+1
            let priceStep = goods.priceSteps.find(priceStep => priceStep.stepNo === no)
            if(!priceStep){
                priceStep = {stepNo: no, until: null, price: 0, discountRate: 0}
            }
            priceSteps.push(priceStep)
        }

        goods.priceSteps = priceSteps
        goods.totalPriceStep = stepNo
        goods.saleEnd = this.getSaleEnd(stepNo, goods)


        if(this.isSameOrBeforeDate(goods.saleEnd, goods.expectShippingStart)){
            goods.expectShippingStart = null
            goods.expectShippingEnd = null
        }

        this.setValidatedObj({goods})

        this.setState(
            {
                goods: goods,
                //selectedPriceStep: stepNo
            })
    }

    isSameOrBeforeDate = (startDate, endDate) => {
        if(moment(startDate) >= moment(endDate)){
            return true
        }
        return false
    }

    //단계별 달력
    onCalendarPriceStepChange = (stepNo, date) => {
        const goods = Object.assign({}, this.state.goods)
        const priceSteps = goods.priceSteps


        const priceStep = priceSteps.find(priceStep => priceStep.stepNo === stepNo)  //reference
        //수정일 경우 해당 속성만 수정
        if(priceStep) priceStep.until = date.endOf('day')
        //신규일 경우 배열 추가
        else priceSteps.push({stepNo: stepNo, until: date, price: '', discountRate: 0})

        //선택한 날짜가 다음 단계의 날짜보다 크거나 같으면 null 처리
        priceSteps.map(pStep => {
            if(stepNo < pStep.stepNo){
                if(pStep.until <= priceStep.until)
                    pStep.until = null
            }
        })

        goods.priceSteps = priceSteps

        //상품판매기한 설정(단계별 날짜중 마지막 선택한 날짜로)
        goods.saleEnd = this.getSaleEnd(stepNo, goods)

        //상품판매기한이 예정발송일보다 큰 경우 예정발송일 클리어
        if(this.isSameOrBeforeDate(goods.saleEnd, goods.expectShippingStart)){
            goods.expectShippingStart = null
            goods.expectShippingEnd = null
        }

        this.setValidatedObj({goods})

        this.setState({goods})
    }

    //단계중 가장 마지막 날짜 가져오기
    getSaleEnd = (stepNo, goods) => {
        let saleEnd = 0;

        for(let i = goods.priceSteps.length ; i > 0; i--){
            const index = i-1
            if(goods.priceSteps[index].until){
                saleEnd = goods.priceSteps[index].until
                break
            }
        }

        ComUtil.utcToString(goods.saleEnd) !== ComUtil.utcToString(saleEnd) && this.notify(saleEnd ? `상품판매기한이 ${ComUtil.utcToString(saleEnd)}로 변경 되었습니다`:`상품판매기한이 미지정 되었습니다`, toast.info)

        return saleEnd
    }


    //단계별 가격, 비율
    onInputPriceStepChange = (stepNo, e) => {

        let { name, value } = e.target
        let price, discountRate
        const goods = Object.assign({}, this.state.goods)
        const consumerPrice = goods.consumerPrice //소비자 가격
        const priceSteps = goods.priceSteps
        const priceStep = priceSteps.find(priceStep => priceStep.stepNo === stepNo)  //reference

        const numValue = ComUtil.toNum(value)

        if(name === 'price'){

            if(ComUtil.toNum(consumerPrice) < numValue){
                this.notify('소비자 가격보다 클 수 없습니다', toast.error)
                // e.target.value = ''
                return
            }
            price =  value
            discountRate = (price > 0 && consumerPrice > 0) ? ComUtil.roundDown((100 - ((numValue / consumerPrice) * 100)), 1) : 100
        }
        else if(name === 'discountRate'){


            if(numValue < 0){
                this.notify('할인이 마이너스 일 수 없습니다', toast.error)
                // e.target.value = ''
                return
            }
            else if(numValue > 100){
                this.notify('할인이 100%를 넘을 수 없습니다', toast.error)
                // e.target.value = ''
                return
            }

            discountRate = value
            price = consumerPrice * (1 - (discountRate / 100))

        }

        //수정일 경우 해당 속성만 수정
        if(priceStep) {
            priceStep.price = price
            priceStep.discountRate = discountRate
        }

        //신규일 경우 배열 추가
        else {
            priceSteps.push({stepNo: stepNo, until: null, price: price, discountRate: discountRate})
        }


        // this.setValidatedObj({goods})
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //상품 삭제
    onDeleteGoodsClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await deleteGoods(this.state.goods.goodsNo)
            if(result.data === true) {
                alert('삭제가 완료되었습니다. 상품목록에서 확인해 주세요')
                this.props.onClose()
            }
        }
    }

    // 상품 판매 중단
    onGoodsStopClick = async(isConfirmed) => {
        if(isConfirmed){
            const result = await updateGoodsSalesStop(this.state.goods.goodsNo)
            if(result.data === true) {
                alert('판매가 중단되었습니다. 상품목록에서 확인해 주세요')
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

            alert('복사가 완료되었습니다. 상품목록에서 확인해 주세요')
        }
    }

    onDateChange = (date, stepNo) => {

        const goods = Object.assign({}, this.state.goods)
        const priceSteps = goods.priceSteps
        const priceStep = priceSteps.find(priceStep => priceStep.stepNo === stepNo)  //reference
        //수정일 경우 해당 속성만 수정
        if(priceStep) priceStep.until = date
        //신규일 경우 배열 추가
        else priceSteps.push({stepNo: stepNo, until: date, price: '', discountRate: 0})

        goods.priceSteps = priceSteps

        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        goods.saleEnd = this.getSaleEnd(goods)

        this.setValidatedObj({goods})

        this.setState({goods})
    }

    //예상발송일 달력 문구 렌더러
    renderExpectShippingCalendarInfo = () => <Alert className='m-1'>예상발송 시작일 ~ 종료일을 선택해 주세요</Alert>

    //단계 달력 문구 렌더러
    renderUntilCalendarInfo = (stepNo) => <Alert className='m-1'>{stepNo} 단계 날짜를 선택해 주세요</Alert>

    //단계 달력 일자 렌더러
    renderUntilDayContents = (date) => {
        const goods = this.state.goods
        const priceStep1 = goods.priceSteps[0]
        const priceStep2 = goods.priceSteps[1]
        const priceStep3 = goods.priceSteps[2]

        //오늘보다 작거나 같으면 일자만 보여주기
        const today = moment().startOf('day')
        if(date.isBefore(today)) return date.dates()

        //단계별 금액 보여주기
        else if(goods.totalPriceStep >= 1 && priceStep1 && date.isSameOrBefore(moment(priceStep1.until))) return  <Fragment><div>{date.dates()}</div><div className='small text-secondary'>{ComUtil.addCommas(Math.round(priceStep1.price,0))}</div></Fragment>
        else if(goods.totalPriceStep >= 2 && priceStep2 && date.isSameOrBefore(moment(priceStep2.until))) return  <Fragment><div>{date.dates()}</div><div className='small text-secondary'>{ComUtil.addCommas(Math.round(priceStep2.price,0))}</div></Fragment>
        else if(goods.totalPriceStep >= 3 && priceStep3 && date.isSameOrBefore(moment(priceStep3.until))) return  <Fragment><div>{date.dates()}</div><div className='small text-secondary'>{ComUtil.addCommas(Math.round(priceStep3.price,0))}</div></Fragment>

        return date.dates()
    }

    //배송정책 드롭다운 클릭
    onTermsOfDeliveryFeeChange = ({value, label}) => {
        // deliveryFeeTerms.find(terms=>terms.value === value).label


        const state = Object.assign({}, this.state)

        state.termsOfDeliveryFee = value


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

    onClickExpectInfo = () => {
        this.setState({
            modalType: 'shippingInfo',
            modal: true
        })
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

    render() {
        if(!this.state.isDidMounted) return <BlocerySpinner/>

        const { goods } = this.state

        const star = <span className='text-danger'>*</span>

        const salesStopText = goods.saleStopped && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (goods.confirm && !goods.saleStopped) && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !goods.confirm ? <Button className='d-flex align-items-center justify-content-center mr-2' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} color='warning'>임시저장{this.state.isLoading.temp && <Spinner/>}</Button> : null
        const btnConfirm = (goods.goodsNo && !goods.confirm) ?  <Button className='mr-2' onClick={this.onConfirmClick} color={'warning'}>확인(판매개시)</Button> : null
        const btnDelete = (goods.goodsNo && !goods.confirm) ? <ModalConfirm title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}><Button className='mr-2' color={'danger'}>삭제</Button></ModalConfirm> : null
        const btnPreview = goods.goodsNo ? <Button className='mr-2' onClick={this.onPreviewClick}>미리보기</Button> : null
        const btnGoodsStop = (goods.confirm && !goods.saleStopped) ? <ModalConfirm color={'danger'} title={'상품을 판매중단 하시겠습니까?'} content={'판매중단된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}><Button color={'danger'} className='mr-2'>판매중단</Button></ModalConfirm> : null
        const btnUpdate = (goods.confirm && !goods.saleStopped) ? <Button className='d-flex align-items-center justify-content-center mr-2'  onClick={this.onUpdateClick} disabled={this.state.isLoading.update} color={'warning'}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        const btnCopy = (goods.goodsNo && goods.confirm )? <ModalConfirm title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/>복사 진행전 저장을 꼭 해 주세요</Fragment>} onClick={this.onCopyClick}><Button className='mr-2' color={'secondary'}>상품복사</Button></ModalConfirm> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label

        return(
            <Fragment>
                {/*{*/}
                {/*this.props.goodsNo || this.props.goodsNo === 0 ?  null : <div className='f1'>상품등록</div>*/}
                {/*}*/}
                {/*<br/>*/}
                <div className={Style.wrap}>
                    {
                        this.state.chainLoading && <BlockChainSpinner/>
                    }
                    {/*<Container fluid>*/}
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
                                <h6>예약상품정보</h6>
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
                                                        this.state.goods.goodsTypeCode != 'none' &&
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
                                                <Input  type="number" className={'mr-1'} name={this.names.packAmount} value={goods.packAmount} onChange={this.onInputChange}/>
                                                <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>포장 단위{star}</Label>
                                    {
                                        goods.confirm ? <div>{goods.packUnit}</div> : (
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
                                        goods.confirm ? <div>{ComUtil.addCommas(goods.packCnt)}</div> : (
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
                                    {
                                        goods.confirm ? <div>{ComUtil.addCommas(goods.consumerPrice)}</div> : (
                                            <Fragment>
                                                <CurrencyInput name={this.names.consumerPrice} value={goods.consumerPrice} onChange={this.onInputChange} placeholder={'할인 전 가격 입니다'}/>
                                                <Fade in={validatedObj.consumerPrice ? true : false} className="text-danger small mt-1" >{validatedObj.consumerPrice}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                            </Container>
                            <Container>
                                <div>
                                    <Alert color={'warning'} className='small'>소비자가격에서 <b>최대 3단계</b>의 <b>할인된 가격을 적용</b> 할 수 있으며 소비자에게는 기간에 따라 <b>단계별 설정된 가격이 노출</b> 됩니다</Alert>

                                    {
                                        goods.confirm ? (
                                            <Fragment>
                                                <FormGroup>
                                                    <Label className={'text-secondary small'}>예약판매가(단계선택){star}</Label>
                                                    <div>
                                                        {ComUtil.addCommas(goods.totalPriceStep)} 단계 할인가
                                                    </div>
                                                </FormGroup>

                                                {
                                                    goods.priceSteps.map(({stepNo, until, price, discountRate}, index) => (
                                                        <div className={'mb-2'} key={'readonly_stepNo'+index}>
                                                            <div className={'d-flex'}>
                                                                <div className={'text-secondary small'}>
                                                                    {stepNo} 단계 가격설정
                                                                </div>
                                                                <div className={'ml-auto text-secondary small'}>
                                                                    {ComUtil.addCommas(Math.round(price - goods.consumerPrice,0))} 원 할인
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className={'mr-2'}>{ComUtil.utcToString(until)} 까지</span>
                                                                <span className={'mr-2'}><span className={'text-danger'}>{ComUtil.addCommas(Math.round(price,0))}</span> 원</span>
                                                                <span className={'mr-2'}><span className={'text-danger'}>{ComUtil.addCommas(Math.round(discountRate,0))}</span> %</span>
                                                                <span className={'mr-2 text-danger'}></span>
                                                            </div>
                                                        </div>
                                                    ))
                                                }
                                            </Fragment>
                                        ) : (
                                            (ComUtil.toNum(goods.consumerPrice) > 0) && (
                                                <Fragment>
                                                    <FormGroup>
                                                        <Label className={'text-secondary small'}>예약판매가(단계선택){star}</Label>
                                                        <RadioButtons
                                                            value={bindData.priceSteps.find(item => item.value === goods.totalPriceStep)}
                                                            options={bindData.priceSteps} onClick={this.onSelectedPriceStepClick} />
                                                    </FormGroup>

                                                    <div>
                                                        {
                                                            goods.priceSteps.map(({stepNo, until, price, discountRate}, index) => {
                                                                return (
                                                                    <FormGroup key={'priceStep'+index}>
                                                                        <Label className={'text-secondary d-flex'}>

                                                                            <div className={'small'}>{stepNo}단계 가격설정{star}</div>
                                                                            {/*<div className='flex-grow-1 text-right text-danger'>{discountRate}%</div>*/}
                                                                            {
                                                                                //할인가, 할인율 둘중 하나라도 값이 있을 경우
                                                                                ComUtil.toNum(price) > 0 && goods.consumerPrice && <div className='flex-grow-1 text-right small'>{ComUtil.addCommas(Math.round(price - goods.consumerPrice,0))} 원 할인</div>
                                                                            }
                                                                        </Label>
                                                                        <div className='d-flex align-items-center'>
                                                                            <div>
                                                                                <SingleDatePicker
                                                                                    placeholder="날짜선택"
                                                                                    date={until ? moment(until) : null}
                                                                                    onDateChange={this.onCalendarPriceStepChange.bind(this, stepNo)}
                                                                                    focused={this.state['focused'+stepNo]} // PropTypes.bool
                                                                                    onFocusChange={({ focused }) => this.setState({ ['focused'+stepNo]:focused })} // PropTypes.func.isRequired
                                                                                    id={"stepPriceDate_"+stepNo} // PropTypes.string.isRequired,
                                                                                    numberOfMonths={1}
                                                                                    withPortal
                                                                                    small
                                                                                    readOnly
                                                                                    calendarInfoPosition="top"
                                                                                    enableOutsideDays
                                                                                    // daySize={45}
                                                                                    verticalHeight={700}
                                                                                    renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
                                                                                    //일자 블록처리
                                                                                    isDayBlocked={(date)=>{

                                                                                        //앞의 단계보다 작은 일자는 블록처리하여 선택할 수 없도록 함
                                                                                        let priceStepItem = null
                                                                                        switch (stepNo){
                                                                                            case 2 :
                                                                                                //checkDate =  goods.priceSteps[0].until || null

                                                                                                priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 1)

                                                                                                if(priceStepItem && priceStepItem.until){
                                                                                                    return date.isSameOrBefore(moment(priceStepItem.until))
                                                                                                }
                                                                                                return false
                                                                                            case 3 :
                                                                                                //3단계에서는 2단계 일자우선, 없을경우 1단계 일자, 없을경우 null 처리
                                                                                                priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 2) || goods.priceSteps.find(priceStep => priceStep.stepNo === 1) || null

                                                                                                if(priceStepItem && priceStepItem.until){
                                                                                                    return date.isSameOrBefore(moment(priceStepItem.until))
                                                                                                }
                                                                                                return false
                                                                                        }
                                                                                    }}

                                                                                    //일자 렌더링
                                                                                    renderDayContents={this.renderUntilDayContents}
                                                                                />

                                                                            </div>
                                                                            <div className='pl-1 pr-1 small'>까지</div>
                                                                            <div className='flex-grow-1'>
                                                                                <InputGroup  size={'sm'}>
                                                                                    <CurrencyInput className='text-danger' name={'price'} value={price} onChange={this.onInputPriceStepChange.bind(this, stepNo)} size={'sm'} placeholder={`할인가`}/>
                                                                                    <InputGroupAddon addonType="append">
                                                                                        <InputGroupText>원</InputGroupText>
                                                                                    </InputGroupAddon>
                                                                                </InputGroup>
                                                                            </div>
                                                                            <div className='flex-grow-1 pl-1'>
                                                                                <InputGroup size={'sm'}>
                                                                                    <CurrencyInput className='text-danger block' name={'discountRate'} value={discountRate} onChange={this.onInputPriceStepChange.bind(this, stepNo)} size={'sm'} placeholder={`할인율`}/>
                                                                                    <InputGroupAddon addonType="append">
                                                                                        <InputGroupText>%</InputGroupText>
                                                                                    </InputGroupAddon>
                                                                                </InputGroup>
                                                                            </div>
                                                                        </div>
                                                                    </FormGroup>
                                                                )
                                                            })

                                                            // bindData.priceSteps.map(priceStep => {
                                                            //         const { stepNo, until, price, discountRate } = goods.priceSteps.find(item => item.stepNo === priceStep.value) || {stepNo: priceStep.value, until: null, price: null, discountRate: ''}
                                                            //
                                                            //         return priceStep.value <= goods.totalPriceStep ? (
                                                            //             null
                                                            //         ): ''
                                                            //     }
                                                            // )
                                                        }
                                                    </div>
                                                    <Fade in={validatedObj.priceSteps ? true : false} className="text-danger small mt-1" >{validatedObj.priceSteps}</Fade>
                                                    <h6 className='text-center text-danger'>
                                                        상품판매 기한 :
                                                        {
                                                            goods.saleEnd ? ` ${ComUtil.utcToString(goods.saleEnd)}` : ` ${goods.totalPriceStep} 번째 단계의 날짜를 지정해 주세요`
                                                        }
                                                    </h6>
                                                    <div className={'small text-secondary text-center'}>
                                                        단계의 마지막 일자로 자동 설정 됩니다
                                                    </div>

                                                </Fragment>
                                            )
                                        )
                                    }

                                    {

                                    }
                                </div>


                                {/*<FormGroup>*/}
                                {/*<Label className={'text-secondary'}>상품판매 기한{star}</Label>*/}
                                {/*<div>*/}
                                {/*<DatePicker*/}
                                {/*onChange={this.onCalendarChange.bind(this, this.names.saleEnd)}*/}
                                {/*value={goods.saleEnd ? new Date(goods.saleEnd) : null}*/}
                                {/*/>*/}
                                {/*<Fade in={validatedObj.saleEnd? true : false} className="text-danger small mt-1" >{validatedObj.saleEnd}</Fade>*/}
                                {/*</div>*/}
                                {/*</FormGroup>*/}
                            </Container>
                            <hr/>
                            <Container>
                                <h6>배송일정</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>예상발송일{star}</Label>
                                    {
                                        goods.confirm ? (<div>{`${ComUtil.utcToString(goods.expectShippingStart)} - ${ComUtil.utcToString(goods.expectShippingEnd)}`}</div>) : (
                                            <Fragment>
                                                <div>
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
                                                        isDayBlocked={(date)=>{
                                                            //상품판매기한보다 작거나 같은 일자는 블록처리하여 선택할 수 없도록 함
                                                            if(date.isSameOrBefore(moment(goods.saleEnd))) return true
                                                            return false
                                                        }}
                                                        renderCalendarInfo={this.renderExpectShippingCalendarInfo}
                                                    />
                                                    <Badge pill color='info' className='ml-2' onClick={this.onClickExpectInfo}> i </Badge>
                                                </div>
                                                {
                                                    goods.saleEnd && <small className={'text-secondary'}>예상발송일은 <span className={'text-danger'}>상품판매기한 이후 ({ComUtil.utcToString(moment(goods.saleEnd).add(1,'day'))})</span> 부터 가능</small>
                                                }

                                                <Fade in={validatedObj.expectShippingStart ? true : false} className="text-danger small mt-1" >{validatedObj.expectShippingStart}</Fade>
                                                <Fade in={validatedObj.expectShippingEnd ? true : false} className="text-danger small mt-1" >{validatedObj.expectShippingEnd}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <h6>배송정책</h6>
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
                                                        disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}
                                                        style={{width:50}} name={this.names.deliveryQty} value={goods.deliveryQty} onChange={this.onInputChange} placeholder={'배송조건(숫자)'}/>
                                                    <InputGroupButtonDropdown addonType="append" style={{zIndex:0}} isOpen={this.state.isDeliveryFeeTermsOpen} toggle={()=>this.setState({isDeliveryFeeTermsOpen:!this.state.isDeliveryFeeTermsOpen})}>
                                                        <DropdownToggle caret>
                                                            {
                                                                termsOfDeliveryFeeLabel
                                                            }
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            {
                                                                bindData.termsOfDeliveryFees.map((terms, index) => <DropdownItem key={'goodsReg_terms_'+index} onClick={this.onTermsOfDeliveryFeeChange.bind(this, terms)}>{terms.label}</DropdownItem>)
                                                            }
                                                        </DropdownMenu>
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
                                                <CurrencyInput disabled={goods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}  name={this.names.deliveryFee} value={goods.deliveryFee} onChange={this.onInputChange} placeholder={'배송비'}/>
                                                <Fade in={validatedObj.deliveryFee ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryFee}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                            </Container>

                            <hr/>
                            <Container>
                                <h6>상품상세설명</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>상세설명입력{star}</Label>
                                    <TuiEditor
                                        editorHtml={goods.goodsContent}
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
                                    {/*<Editor*/}
                                        {/*previewStyle="vertical" //tab | vertical*/}
                                        {/*// viewer={true}*/}
                                        {/*height={800}       //"auto" | {800} 숫자로 해야 내부 scroll이 자동으로 생김.*/}
                                        {/*initialEditType="wysiwyg" //markdown wysiwyg*/}
                                        {/*initialValue={goods.blyReview}*/}
                                        {/*ref={this.editorRefReview}*/}
                                        {/*toolbarItems={[*/}
                                            {/*'heading',*/}
                                            {/*'bold',*/}
                                            {/*'italic',*/}
                                            {/*'strike',*/}
                                            {/*'divider',*/}
                                            {/*'hr',*/}
                                            {/*'quote',*/}
                                            {/*'divider',*/}
                                            {/*'ul',*/}
                                            {/*'ol',*/}
                                            {/*'task',*/}
                                            {/*'indent',*/}
                                            {/*'outdent',*/}
                                            {/*'divider',*/}
                                            {/*'table',*/}
                                            {/*'image',*/}
                                            {/*//'link',*/}
                                            {/*'divider',*/}
                                            {/*'code',*/}
                                            {/*'codeblock',*/}
                                            {/*'divider',*/}
                                        {/*]}*/}
                                    {/*/>*/}

                                </FormGroup>


                            </Container>

                            {/*<ProducerFullModalPopupWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose}>*/}
                            {/*<Goods goodsNo={goods.goodsNo} />*/}
                            {/*</ProducerFullModalPopupWithNav>*/}
                        </Col>

                    </Row>
                    {/*</Container>*/}
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
                                </div>

                            </Col>
                        </Row>
                    </Container>

                    {/* 미리보기 */}
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

                    {/* 발송일 안내 모달 */}
                    <Modal isOpen={this.state.modalType === 'shippingInfo' && this.state.modal} size="lg" toggle={this.modalToggle} centered>
                        <ModalHeader>발송일 안내</ModalHeader>
                        <ModalBody>
                            <span>1. 예약 발송 상품의 <span color='info'>예상되는 발송일을 정확하게 입력</span>해주세요.</span><br/>
                            <span>2. 예상발송일은 실제로 택배가 발송되는 시점을 말하며, <u>운송장번호를 입력하는 날짜를 기준</u>으로 합니다.</span><br/>
                            <span>3. 예상발송일 내 상품이 발송되지 않으면 <b>패널티가 부여</b>될 수 있으니 꼭 정확하게 입력해 주세요.</span><br/>
                            <Table size="sm" bordered className="mt-3 mb-1">
                                <thead>
                                <tr align="center">
                                    <th style={{width:'10%'}}>구분</th>
                                    <th style={{width:'22%'}}>0차</th>
                                    <th style={{width:'22%'}}>1차</th>
                                    <th style={{width:'22%'}}>2차</th>
                                    <th style={{width:'22%'}}>3차</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr align="center">
                                    <th scope="row">배송지연일</th>
                                    <td>배송 지연 발생 전</td>
                                    <td>1일초과 7일 이내</td>
                                    <td>7일초과 14일 이내</td>
                                    <td>15일</td>
                                </tr>
                                <tr align="center">
                                    <th scope="row">조치사항</th>
                                    <td>Blocery 공지</td>
                                    <td>Blocery 공지</td>
                                    <td>2차 배송 예정일 공지</td>
                                    <td>결제금 환급 및 결제금의 10%인 지연보상금 제공</td>
                                </tr>
                                </tbody>
                            </Table>
                            <small>- 미배송 보상금 최대 10%</small>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" className='align-items-center' onClick={this.modalToggle}>확인</Button>
                        </ModalFooter>

                    </Modal>

                    {/* 결제비번 입력 모달 */}
                    <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.modalToggle} className={this.props.className} centered>
                        <ModalHeader toggle={this.modalToggle}> 블록체인비밀번호 입력</ModalHeader>
                        <ModalBody className={'p-0'}>
                            {/* clearPassPhrase 초기화, onChange 결과값 세팅 */}
                            <PassPhrase clearPassPhrase={this.state.clearPassPhrase} onChange={this.onPassPhrase}></PassPhrase>
                        </ModalBody>
                        <ModalFooter>
                            <Button color="link" onClick={this.findPassPhrase}>비밀번호를 잊으셨나요?</Button>
                            <Button color="info" onClick={this.modalToggleOk} disabled={(this.state.passPhrase.length === 6) ? false:true}>확인</Button>{' '}
                            <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                        </ModalFooter>
                    </Modal>
                    {/* 결제비밀번호 조회 */}
                    <Modal isOpen={this.state.modalType === 'passPhrase' && this.state.modal} centered>
                        <ModalHeader>블록체인비밀번호 안내</ModalHeader>
                        <ModalBody>
                            마이페이지에서 블록체인비밀번호 힌트 조회 후 이용해주세요.
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={this.moveToMypage}>마이페이지로 이동</Button>
                            <Button color="secondary" onClick={this.modalToggle}>취소</Button>
                        </ModalFooter>
                    </Modal>

                    <ToastContainer />  {/* toast 가 그려질 컨테이너 */}

                </div>

            </Fragment>
        )
    }

}