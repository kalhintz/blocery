import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, Alert, InputGroup, InputGroupAddon, InputGroupText, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { RadioButtons, ModalConfirmButton, ProducerFullModalPopupWithNav, SingleImageUploader, FooterButtonLayer } from '~/components/common'
import Style from './DirectGoodsReg.module.scss'

import { addGoods, copyGoodsByGoodsNo } from '~/lib/goodsApi'
import { scOntPayProducerDeposit, scOntGetBalanceOfBlct } from '~/lib/smartcontractApi'
import { exchangeWon2BLCT, GOODS_TOTAL_DEPOSIT_RATE } from '~/lib/exchangeApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import { getGoodsByGoodsNo, deleteGoods, updateConfirmGoods, updateGoodsSalesStop, getGoodsContent } from '~/lib/goodsApi'
import { Webview } from '~/lib/webviewApi'
import { getItems } from '~/lib/adminApi'
import { getLoginUser, checkPassPhrase } from '~/lib/loginApi'
import Goods from '~/components/shop/goods/Goods'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, ToastUIEditorViewer, PassPhrase } from '~/components/common'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'

// import '../../../styles/react_dates_overrides.css'

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
import 'tui-editor/dist/tui-editor-contents.min.css';
import { Editor } from '@toast-ui/react-editor'


let validatedObj = {}

const termsOfDeliveryFeeCode = {
    NO_FREE: 'NO_FREE',
    FREE: 'FREE',
    GTE_FREE: 'GTE_FREE',
    EACH_GROUP_COUNT: 'EACH_GROUP_COUNT',
}


let bindData = {
    cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],      //배송비 조건 정책
    goodsTypes: []
}

export default class DirectGoodsReg extends Component {

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
                pesticideYn: '무농약',	        //농약유무
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
                goodsTypeCode: '',          //식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
                goodsTypeName: '',
                directGoods: true          //즉시판매상품 : true 예약상품 : false
            },

            loginUser: {},
            selected: null,
            modal: false,                //모달 여부
            modalType: '',              //모달 종류
            passPhrase: '', //비밀번호 6 자리 PIN CODE
            clearPassPhrase: true,

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
            packUnit: obj.packUnit ? null : '포장단위는 필수 입니다',	            //포장단위
            packAmount: ComUtil.toNum(obj.packAmount) > 0 ? null : '포장양은 필수 입니다',	        //포장 양
            packCnt: ComUtil.toNum(obj.packCnt) > 0 ? null : '판매수량은 필수 입니다',	            //판매 수량
            // expectShippingStart: obj.expectShippingStart ? null : '예상발송 시작일은 필수 입니다',  //예상출하시작일
            // expectShippingEnd: obj.expectShippingEnd ? null : '예상발송일 종료일은 필수 입니다',  //예상출하종료일

            deliveryQty:
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
        console.log({goods})

        //품종세팅
        this.setItemKinds(goods.itemNo)

        state.goods = goods

        //goodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.goods.goodsContent && state.goods.goodsContentFileName != 0) {
            let {data:goodsContent} = await getGoodsContent(state.goods.goodsContentFileName)
            state.goods.goodsContent = goodsContent
            //console.log('goodsContent await:', goodsContent, state.goods.goodsContentFileName)
        }

        this.setValidatedObj(state)
        this.setState(state)

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
            { value: '수경재배', label:'수경재배'}
        ]

        //농약유무
        const pesticideYn = [
            {value: '유기농', label:'유기농'},
            {value: '무농약', label:'무농약'},
            {value: '농약사용', label:'농약사용'},
        ]

        const packUnit = [
            {value: 'kg', label:'kg'},
            {value: 'g', label:'g'},
            {value: '근', label:'근'},
        ]

        const priceSteps = [
            {value: 1, label:'상품 단일가'},
            {value: 2, label:'2단계 할인가'},
            {value: 3, label:'3단계 할인가'},
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
            { value: TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT, label: '개씩 배송요금 부과' },
        ]

        //상품종류 : 상품정보제공 고시 설정에서 사용
        const goodsTypes = [
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
            goodsTypes
        }
    }
    //조회
    search = async () => {
        if(!this.state.goods.goodsNo)
            return

        const { data: goods } = await getGoodsByGoodsNo(this.state.goods.goodsNo)
        return goods
    }

    //대표상품 이미지
    onGoodsImageChange = (images) => {

        const goods = Object.assign({}, this.state.goods)
        goods.goodsImages = images

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
    onPackUnitClick = (item) => {
        const goods = Object.assign({}, this.state.goods)
        goods.packUnit = item.value
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //예상발송일 달력
    onExpectShippingChange = ({ startDate, endDate })=> {
        const goods = Object.assign({}, this.state.goods)
        goods.expectShippingStart = startDate// && startDate.startOf('day')
        goods.expectShippingEnd = endDate// && endDate.endOf('day')
        this.setValidatedObj({goods})
        this.setState({goods})
    }

    //인풋박스
    onInputChange = (e) => {
        let { name, value } = e.target
        const goods = Object.assign({}, this.state.goods)

        if(name === 'currentPrice'){
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
        state.goods.goodsContent = this.editorRef.current.getInstance().getValue()

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
        goods.goodsContent = this.editorRef.current.getInstance().getValue()

        //확정 전까지 재고수량 동기화
        if(!goods.confirm){
            goods.remainedCnt = goods.packCnt;
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
            this.notify('저장이 완료되었습니다', toast.success)
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

    // //단계선택
    // onSelectedPriceStepClick = ({value: stepNo, label}) => {
    //
    //     const goods = Object.assign({}, this.state.goods)
    //
    //
    //     const priceSteps = []
    //
    //     //선택한 단계만큼 배열생성
    //     for(let i = 0 ; i < stepNo ; i++){
    //         const no = i+1
    //         let priceStep = goods.priceSteps.find(priceStep => priceStep.stepNo === no)
    //         if(!priceStep){
    //             priceStep = {stepNo: no, until: null, price: 0, discountRate: 0}
    //         }
    //         priceSteps.push(priceStep)
    //     }
    //
    //     goods.priceSteps = priceSteps
    //     goods.totalPriceStep = stepNo
    //     goods.saleEnd = this.getSaleEnd(stepNo, goods)
    //
    //
    //     if(this.isSameOrBeforeDate(goods.saleEnd, goods.expectShippingStart)){
    //         goods.expectShippingStart = null
    //         goods.expectShippingEnd = null
    //     }
    //
    //
    //     this.setValidatedObj({goods})
    //
    //     this.setState(
    //         {
    //             goods: goods,
    //             //selectedPriceStep: stepNo
    //         })
    // }

    isSameOrBeforeDate = (startDate, endDate) => {
        if(moment(startDate) >= moment(endDate)){
            return true
        }
        return false
    }

    //단계별 달력
    // onCalendarPriceStepChange = (stepNo, date) => {
    //     const goods = Object.assign({}, this.state.goods)
    //     const priceSteps = goods.priceSteps
    //
    //
    //     const priceStep = priceSteps.find(priceStep => priceStep.stepNo === stepNo)  //reference
    //     //수정일 경우 해당 속성만 수정
    //     if(priceStep) priceStep.until = date.endOf('day')
    //     //신규일 경우 배열 추가
    //     else priceSteps.push({stepNo: stepNo, until: date, price: '', discountRate: 0})
    //
    //     //선택한 날짜가 다음 단계의 날짜보다 크거나 같으면 null 처리
    //     priceSteps.map(pStep => {
    //         if(stepNo < pStep.stepNo){
    //             if(pStep.until <= priceStep.until)
    //                 pStep.until = null
    //         }
    //     })
    //
    //     goods.priceSteps = priceSteps
    //
    //     //상품판매기한 설정(단계별 날짜중 마지막 선택한 날짜로)
    //     goods.saleEnd = this.getSaleEnd(stepNo, goods)
    //
    //     //상품판매기한이 예정발송일보다 큰 경우 예정발송일 클리어
    //     if(this.isSameOrBeforeDate(goods.saleEnd, goods.expectShippingStart)){
    //         goods.expectShippingStart = null
    //         goods.expectShippingEnd = null
    //     }
    //
    //     this.setValidatedObj({goods})
    //
    //     this.setState({goods})
    // }

    //단계중 가장 마지막 날짜 가져오기
    // getSaleEnd = (stepNo, goods) => {
    //     let saleEnd = 0;
    //
    //     for(let i = goods.priceSteps.length ; i > 0; i--){
    //         const index = i-1
    //         if(goods.priceSteps[index].until){
    //             saleEnd = goods.priceSteps[index].until
    //             break
    //         }
    //     }
    //
    //     ComUtil.utcToString(goods.saleEnd) !== ComUtil.utcToString(saleEnd) && this.notify(saleEnd ? `상품판매기한이 ${ComUtil.utcToString(saleEnd)}로 변경 되었습니다`:`상품판매기한이 미지정 되었습니다`, toast.info)
    //
    //     return saleEnd
    // }


    //단계별 가격, 비율
    // onInputPriceStepChange = (stepNo, e) => {
    //
    //     let { name, value } = e.target
    //     let price, discountRate
    //     const goods = Object.assign({}, this.state.goods)
    //     const consumerPrice = goods.consumerPrice //소비자 가격
    //     const priceSteps = goods.priceSteps
    //     const priceStep = priceSteps.find(priceStep => priceStep.stepNo === stepNo)  //reference
    //
    //     const numValue = ComUtil.toNum(value)
    //
    //     if(name === 'price'){
    //
    //         if(ComUtil.toNum(consumerPrice) < numValue){
    //             this.notify('소비자 가격보다 클 수 없습니다', toast.error)
    //             // e.target.value = ''
    //             return
    //         }
    //         price =  value
    //         discountRate = (price > 0 && consumerPrice > 0) ? ComUtil.roundDown((100 - ((numValue / consumerPrice) * 100)), 1) : 100
    //     }
    //     else if(name === 'discountRate'){
    //
    //
    //         if(numValue < 0){
    //             this.notify('할인이 마이너스 일 수 없습니다', toast.error)
    //             // e.target.value = ''
    //             return
    //         }
    //         else if(numValue > 100){
    //             this.notify('할인이 100%를 넘을 수 없습니다', toast.error)
    //             // e.target.value = ''
    //             return
    //         }
    //
    //         discountRate = value
    //         price = consumerPrice * (1 - (discountRate / 100))
    //
    //     }
    //
    //     //수정일 경우 해당 속성만 수정
    //     if(priceStep) {
    //         priceStep.price = price
    //         priceStep.discountRate = discountRate
    //     }
    //
    //     //신규일 경우 배열 추가
    //     else {
    //         priceSteps.push({stepNo: stepNo, until: null, price: price, discountRate: discountRate})
    //     }
    //
    //
    //     // this.setValidatedObj({goods})
    //     this.setValidatedObj({goods})
    //     this.setState({goods})
    // }

    onDeleteGoodsClick = async(isConfirmed) => {
        if(isConfirmed){
            await deleteGoods(this.state.goods.goodsNo)
            this.props.onClose()
        }

    }

    // 상품 판매 중단
    onGoodsStopClick = async(isConfirmed) => {
        if(isConfirmed){
            await updateGoodsSalesStop(this.state.goods.goodsNo)
            this.props.onClose()
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

    onDateChange = (date) => {

        const goods = Object.assign({}, this.state.goods)


        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        goods.saleEnd = date

        this.setValidatedObj({goods})

        this.setState({goods})
    }

    //예상발송일 달력 문구 렌더러
    // renderExpectShippingCalendarInfo = () => <Alert className='m-1'>예상발송 시작일 ~ 종료일을 선택해 주세요</Alert>

    //단계 달력 문구 렌더러
    // renderUntilCalendarInfo = (stepNo) => <Alert className='m-1'>{stepNo} 단계 날짜를 선택해 주세요</Alert>

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

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>

        const { goods } = this.state

        //console.log('goodsContent in Render:', goods.goodsNo, goods.goodsContent)
        const star = <span className='text-danger'>*</span>

        const salesStopText = goods.saleStopped && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (goods.confirm && !goods.saleStopped) && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !goods.confirm ? <Button className='d-flex align-items-center justify-content-center' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} block color='warning'>임시저장{this.state.isLoading.temp && <Spinner/> }</Button> : null
        const btnConfirm = (goods.goodsNo && !goods.confirm) ?  <Button onClick={this.onConfirmClick} block color={'warning'}>확인(판매개시)</Button> : null
        const btnDelete = (goods.goodsNo && !goods.confirm) ? <ModalConfirmButton block color={'danger'} title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}>삭제</ModalConfirmButton> : null
        const btnPreview = goods.goodsNo ? <Button onClick={this.onPreviewClick} block>미리보기</Button> : null
        const btnGoodsStop = (goods.confirm && !goods.saleStopped) ? <ModalConfirmButton block color={'danger'} title={'상품을 판매중단 하시겠습니까?'} content={'판매중단된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}>판매중단</ModalConfirmButton> : null
        const btnUpdate = (goods.confirm && !goods.saleStopped) ? <Button className='d-flex align-items-center justify-content-center'  onClick={this.onUpdateClick} disabled={this.state.isLoading.update} block color={'warning'}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        const btnCopy = (goods.goodsNo && goods.confirm )? <ModalConfirmButton block color={'secondary'} title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/>복사 진행전 저장을 꼭 해 주세요</Fragment>} onClick={this.onCopyClick}>상품복사</ModalConfirmButton> : null
        // <ModalConfirmButton block color={'warning'} title={'상품을 수정 하시겠습니까?'} content={'수정되는 내용은 즉시 반영 됩니다'} onClick={this.onUpdateClick}>수정완료</ModalConfirmButton> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label


        // console.log('filte', bindData.items, goods.itemNo, )

        // if(goods.itemNo){
        //     const itemKinds = bindData.items.find(item => item.value === goods.itemNo).itemKinds
        //
        //     console.log(itemKinds)
        // }


        return(


            <div className={Style.wrap}>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                <Container fluid>
                    <Row>
                        <Col sm={12} lg={6} className='border p-0'>

                            {/*<ProducerXButtonNav name={'상품등록'} onClose={this.props.onClose}/>*/}
                            {
                                this.state.validationCnt > 0 && (
                                    <div className={Style.badge}>
                                        <Badge color="danger" pill>필수{this.state.validationCnt}</Badge>
                                    </div>
                                )
                            }
                            {/*<div>*/}
                            {/*<NavLink className={'text-info'} to={'/producer/goodsList'} >상품목록</NavLink>*/}
                            {/*<NavLink className={'text-info'} to={'/producer/goodsReg'} >상품등록</NavLink>*/}
                            {/*<NavLink className={'text-info'} to={'/producer/orderList'} >주문목록</NavLink>*/}
                            {/*</div>*/}
                            {
                                salesStopText
                            }
                            {
                                confirmText
                            }
                            <Container>
                                <Row>
                                    <Col className='pt-2'>
                                        <Alert color={'secondary'} className='small'>아래 항목 입력 후 먼저 저장을 해주세요.[임시저장]<br/>
                                            확인(판매개시) 버튼 클릭 시 상품 판매가 시작됩니다<br/>[필수{star}] 항목을 모두 입력해야 노출 가능합니다
                                        </Alert>
                                    </Col>
                                </Row>

                                <h6>상품정보</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>대표 이미지{star}</Label>
                                    <SingleImageUploader images={goods.goodsImages} defaultCount={10} isShownMainText={true} onChange={this.onGoodsImageChange} />

                                    {/*<SingleImageUploader images={goods.goodsImages} defaultCount={10} onChange={this.onGoodsImageChange} />*/}
                                    {/*<ImageUploader onChange={this.onGoodsImageChange} multiple={true} limit={10}/>*/}
                                    <Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>
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
                            </Container>
                            <hr/>
                            <Container>
                                <h6>상품정보제공 고시 설정</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>분류선택{star}</Label>
                                    {
                                        // goods.confirm ? <div>{goods.itemName}</div> : (
                                        <Fragment>
                                            <Select options={bindData.goodsTypes}
                                                    value={ bindData.goodsTypes.find(item => item.value === goods.goodsTypeCode)}
                                                    onChange={this.onGoodsTypeChange}
                                            />
                                            <Fade in={validatedObj.goodsTypeCode? true : false} className="text-danger small mt-1" >{validatedObj.goodsTypeCode}</Fade>
                                        </Fragment>
                                        // )
                                    }
                                </FormGroup>
                            </Container>
                            <hr/>
                            <Container>
                                <h6>판매정보</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>포장 양 | 단위{star}</Label>
                                    {
                                        goods.confirm ? <div>{ComUtil.addCommas(goods.packAmount)} {goods.packUnit}</div> : (
                                            <Fragment>
                                                <div className={'d-flex'}>
                                                    <Input className={'mr-1'} name={this.names.packAmount} value={goods.packAmount} onChange={this.onInputChange}/>
                                                    <RadioButtons
                                                        value={bindData.packUnit.find(item => item.value === goods.packUnit)}
                                                        options={bindData.packUnit} onClick={this.onPackUnitClick} />
                                                </div>
                                                <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                                <Fade in={validatedObj.packUnit? true : false} className="text-danger small mt-1" >{validatedObj.packUnit}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>판매수량{star}</Label>
                                    {
                                        goods.confirm ? <div>{goods.packCnt}</div> : (
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
                                                                bindData.termsOfDeliveryFees.map((terms, index) => <DropdownItem key={'termsOfDeliveryFees'+index} onClick={this.onTermsOfDeliveryFeeChange.bind(this, terms)}>{terms.label}</DropdownItem>)
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
                                <h6>판매종료일</h6>
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
                            <br/>
                            <br/>



                            {/*<ProducerFullModalPopupWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose}>*/}
                            {/*<Goods goodsNo={goods.goodsNo} />*/}
                            {/*</ProducerFullModalPopupWithNav>*/}
                        </Col>
                        <Col sm={12} lg={6} className='p-0 mt-2'>
                            <Container>
                                <Row>
                                    <Col>
                                        <h6>상품상세설명{star}</h6>

                                        {
                                            /*

                                                Documentation :
                                                    https://ui.toast.com/tui-editor/
                                                    https://nhn.github.io/tui.editor/api/latest/ToastUIEditor.html
                                                    https://docs.toast.com/ko/Open%20Source/ToastUI%20Editor/ko/opensource-guide/

                                                속성 설명
                                                height: Height in string or auto ex) 300px | auto
                                                initialValue: Initial value. Set Markdown string
                                                initialEditType: Initial type to show markdown | wysiwyg
                                                previewType: Preview style of Markdown mode tab | vertical
                                                usageStatistics: Let us know the hostname. We want to learn from you how you are using the editor. You are free to disable it. true | false
                                            */
                                        }
                                        <Editor
                                            previewStyle="vertical" //tab | vertical
                                            // viewer={true}
                                            height={800}       //"auto" | {800} 숫자로 해야 내부 scroll이 자동으로 생김.
                                            initialEditType="wysiwyg" //markdown wysiwyg
                                            initialValue={goods.goodsContent}
                                            ref={this.editorRef}
                                            toolbarItems={[
                                                'heading',
                                                'bold',
                                                'italic',
                                                'strike',
                                                'divider',
                                                'hr',
                                                'quote',
                                                'divider',
                                                'ul',
                                                'ol',
                                                'task',
                                                'indent',
                                                'outdent',
                                                'divider',
                                                'table',
                                                'image',
                                                //'link',
                                                'divider',
                                                'code',
                                                'codeblock',
                                                'divider',
                                            ]}
                                        />

                                        <FormGroup>
                                            <Fade in={validatedObj.goodsContent ? true : false} className="text-danger small mt-1" >{validatedObj.goodsContent}</Fade>
                                        </FormGroup>


                                    </Col>
                                </Row>
                            </Container>


                            <FooterButtonLayer data={[
                                btnAddTempGoods,
                                btnUpdate,
                                btnCopy,
                                //TODO : 화면 바디에 버튼을 넣고 필요시 별도 구현할 예정
                                btnPreview,
                                btnConfirm,
                                btnDelete,
                                btnGoodsStop
                            ]} />



                        </Col>
                    </Row>
                </Container>
                <ModalWithNav show={this.state.isOpen} title={'상품미리보기'} onClose={this.onPreviewClose} noPadding={true}>
                    <Container>
                        <Row>
                            <Col sm={12} lg={6} className='p-0 position-relative'>
                                <iframe
                                    src={`/goods?goodsNo=${goods.goodsNo}`}
                                    style={{width: '100%', height: 760}}
                                ></iframe>
                            </Col>
                        </Row>
                    </Container>
                </ModalWithNav>

                {/* 결제비번 입력 모달 */}
                <Modal isOpen={this.state.modalType === 'pay' && this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                    <ModalHeader toggle={this.modalToggle}> 블록체인비밀번호 입력</ModalHeader>
                    <ModalBody>
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
        )
    }
}
