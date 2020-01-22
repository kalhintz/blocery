import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Input, FormGroup, Label, Button, Fade, Badge, Alert, InputGroup, InputGroupAddon, InputGroupText, CustomInput, DropdownMenu, InputGroupButtonDropdown, DropdownToggle, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import { RadioButtons, ModalConfirmButton, ProducerFullModalPopupWithNav, SingleImageUploader, FooterButtonLayer } from '~/components/common'
import Style from './DirectFoodsReg.module.scss'

import { addFoods, copyFoodsByFoodsNo, getFoodsByFoodsNo, deleteFoods, updateConfirmFoods, updateFoodsSalesStop, getFoodsContent } from '~/lib/b2bFoodsApi'

import { getB2bItems } from '~/lib/adminApi'
import { getB2bLoginUser, checkB2bPassPhrase } from '~/lib/b2bLoginApi'
import { getSeller } from '~/lib/b2bSellerApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import ComUtil from '~/util/ComUtil'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/initialize';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, ToastUIEditorViewer, PassPhrase } from '~/components/common'

import CurrencyInput from '~/components/common/inputs/CurrencyInput'

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'

import 'codemirror/lib/codemirror.css';
import 'tui-editor/dist/tui-editor.min.css';
import 'tui-editor/dist/tui-editor-contents.min.css';
import { Editor } from '@toast-ui/react-editor'

import { faTimes, faCheck, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Textarea from 'react-textarea-autosize'

import { getStandardUnitPrice } from '~/util/bzLogic'

let validatedObj = {};

let bindData = {
    // cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],
    goodsTypes: [],
}

export default class DirectFoodsReg extends Component {

    editorRef = React.createRef();

    constructor(props) {
        super(props);

        const { foodsNo } = this.props;

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

            seller: {

            },

            //등록시 사용
            foods: {
                foodsNo: foodsNo || null,
                sellerNo: null,          //판매자번호
                goodsNm: '',             //상품명
                goodsImages: [],	     //상품이미지
                searchTag: '',	         //태그
                itemNo: '',	             //품목번호
                itemName: '',	              //품목
                itemKindCode: '',             //품종번호
                itemKindName: '',             //품종명
                //breedNm: '',	          //품종
                productionArea: '',	      //생산지
                //cultivationNo: '',	  //재배방법번호
                // cultivationNm: '',	  //재배방법명
                saleEnd: null,      //판매마감일
                pesticideYn: '',	        //농약유무
                packUnit: 'kg',	            //포장단위
                packAmount: '',	        //포장 양
                packCnt: '',	            //판매개수
                // shipPrice: '',	        //출하 후 판매가
                // reservationPrice: '',	    //예약 시 판매가
                // cultivationDiary: '',	    //재배일지
                confirm: false,             //상품목록 노출 여부
                remainedCnt: 0,
                discountRate: 0,            //할인율
                consumerPrice: null,           //소비자 가격
                totalPriceStep: 1,          //총 단계
                priceSteps: [
                    {stepNo: 1, until: null, price: 0, discountRate: 0 }
                ],             //단계별 가격

                deliveryFee: 0,             //배송비
                freeDeliveryAmount: '',     //조건부 무료배송 금액

                termsOfDeliveryFee: '', //배송비 정책코드
                goodsTypeCode: '',          //식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
                goodsTypeName: '',

                standardUnit: '1kg',	                    //기준단가단위
                standardUnitPrice: 1000,	                //기준단가가격
                directDelivery: true,	                    //직배송 여부
                taekbaeDelivery: false,	                    //택배송 여부
                deliveryText: '',	                        //배송 문구
                waesangDeal: true,	                        //외상결제 여부
                cardDeal: true,	                            //카드결제 여부
                foodsQty: '',                                //제공수량(ea)

            },

            loginUser: {},
            selected: null,

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
        // pesticideYn: 'pesticideYn',	        //농약유무
        // packUnit: 'packUnit',	            //포장단위
        packAmount: 'packAmount',	        //포장 양
        packCnt: 'packCnt',	            //판매개수
        // shipPrice: 'shipPrice',	        //출하 후 판매가
        // reservationPrice: 'reservationPrice',	    //예약 시 판매가 gfrd
        consumerPrice: 'consumerPrice',      //소비자 가격
        currentPrice: 'currentPrice',       //판매가

        deliveryFee: 'deliveryFee',             //배송비
        deliveryQty: 'deliveryQty',             //개당 배송비책정에 사용
        freeDeliveryAmount: 'freeDeliveryAmount',         //조건부 무료배송 금액
        goodsTypeCode: 'goodsTypeCode',      //상품종류 식품(농수산물) : A, 가공식품 : P,  건강기능식품 : H
        foodsQty: 'foodsQty',                //제공수량(ea)
        deliveryText: 'deliveryText'         //배송문구
    }

    getDeliveryQtyValidate(obj){
        const { foods } = this.state
        if(foods.directDelivery){
            return null
        }else{
            if(foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT){
                return ComUtil.toNum(obj.deliveryQty) ? null : '배송조건을 입력해 주세요'
            }
            else{
                return null
            }
        }
    }

    getDeliveryFeeValidate(obj){
        const { foods } = this.state
        if(foods.directDelivery){
            if(obj.deliveryFee.length <= 0)
                return '배송비는 필수 입니다'
            else
                return null
        } else{
            if(foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT || foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE){
                if(ComUtil.toNum(obj.deliveryFee) <= 0)
                    return '배송비는 필수 입니다'
                else
                    return null
            }

        }
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = ({foods: obj}) => {

        //소비자가격 및 단계별 할인율 체크 end
        validatedObj = {
            goodsNm: obj.goodsNm.length > 0 ? null : '상품명은 필수 입니다',              //상품명
            goodsImages: obj.goodsImages.length > 0 ? null : '대표 이미지는 최소 1장 이상 필요합니다',	        //상품이미지

            itemNo: obj.itemNo ? null : '품목은 필수 입니다',	            //품목번호
            // itemName: '',	              //품목
            itemKindCode: obj.itemKindCode ? null : '품종은 필수 입니다',	            //품종
            productionArea: obj.productionArea ? null : '생산지는 필수 입니다',	      //생산지

            packUnit: obj.packUnit ? null : '포장단위는 필수 입니다',	            //포장단위
            packAmount: ComUtil.toNum(obj.packAmount) > 0 ? null : '중량은 필수 입니다',	        //포장 양
            packCnt: ComUtil.toNum(obj.packCnt) > 0 ? null : '재고수량은 필수 입니다',	            //재고수량

            // freeDeliveryAmount: ComUtil.toNum(obj.freeDeliveryAmount) > 0 ? null : '조건부 무료배송 금액은 필수 입니다',

            deliveryQty: this.getDeliveryQtyValidate(obj),
            // deliveryQty: obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT ?              //몇개씩 배송요금 부과
            //         ComUtil.toNum(obj.deliveryQty) ? null : '배송조건을 입력해 주세요' : null,      //배송비 정책 : 배송비 무료로 될 수량

            deliveryFee: this.getDeliveryFeeValidate(obj),

            // deliveryFee: this.state.directDelivery && ComUtil.toNum(obj.deliveryFee) > 0 ? null :
            //     obj.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE ?                //무료배송 일 경우 밸리데이션 체크 안함
            //         null : ComUtil.toNum(obj.deliveryFee) ? null : '배송비는 필수 입니다',             //배송비

            consumerPrice: ComUtil.toNum(obj.consumerPrice) > 0 ? null : '소비자가를 입력해 주세요',
            currentPrice: ComUtil.toNum(obj.currentPrice) > 0 ? null : '실제 판매되는 가격을 입력해 주세요',

            saleEnd: obj.saleEnd ? null : '판매종료일은 필수 입니다',      //판매마감일
            goodsContent: obj.goodsContent ? null : '상품상세설명은 필수 입니다',
            goodsTypeCode: obj.goodsTypeCode ? null : '상품정보제공 고시 설정은 필수 입니다',

            foodsQty: ComUtil.toNum(obj.foodsQty) > 0 ? null : '수량은 필수 입니다',	        //제공수량(ea)
            deliveryText: obj.deliveryText ? null : '배송안내 문구는 필수 입니다'
        }
    }

    async componentDidMount(){

        await this.bind();
        const loginUser = await this.setLoginUserInfo();

        const state = Object.assign({}, this.state);
        state.isDidMounted = true;
        state.loginUser = loginUser;
        // state.bindData = bindData

        const { data: seller }= await getSeller()
        state.seller = seller

        console.log({seller})

        //신규
        if(!state.foods.foodsNo){
            state.foods.sellerNo = loginUser.uniqueNo;

            state.foods.waesangDeal = state.seller.waesangDeal

            //판매자 기준정보에 있는 내용으로 초기값 세팅
            state.foods.directDelivery = seller.directDelivery || false
            state.foods.taekbaeDelivery = seller.taekbaeDelivery || false



            //택배송 판매자일 경우 값을 세팅
            if(seller.taekbaeDelivery){
                state.foods.termsOfDeliveryFee = TERMS_OF_DELIVERYFEE.FREE
            }

            //조건부 무료배송 금액
            // state.foods.freeDeliveryAmount = seller.freeDeliveryAmount
            //직배송 일 경우 직배송비를 가져온다
            state.foods.deliveryFee = seller.directDelivery ? seller.directDeliveryFee : 0
            //배송안내
            state.foods.deliveryText = seller.deliveryText

            this.setValidatedObj(state);
            this.setState(state);
            return
        }

        //업데이트
        const foods = await this.search();
        console.log({foods});

        //품종세팅
        this.setItemKinds(foods.itemNo);

        state.foods = foods;

        //foodsContent 분리되었으므로 다시 가져오기, 가끔 data가 없을경우 fileName이 null이나 0인 경우가 있어서 제외
        if (!state.foods.goodsContent && state.foods.goodsContentFileName != 0) {
            let {data:foodsContent} = await getFoodsContent(state.foods.goodsContentFileName);
            state.foods.goodsContent = foodsContent;
            //console.log('goodsContent await:', goodsContent, state.foods.goodsContentFileName)
        }

        this.setValidatedObj(state);
        this.setState(state);

    }

    setLoginUserInfo = async() => {
        return await getB2bLoginUser();
    }

    //기초 데이타 바인딩 정보
    bind = async () => {

        const { data: itemsData } = await getB2bItems(true);
        const items =  itemsData.map(item => ({value: item.itemNo, label: item.itemName, itemKinds: item.itemKinds, enabled: item.enabled}));

        //품목
        // const item = [
        //
        //     { value: 1, label: '청경채' },
        //     { value: 2, label: '시금치' },
        //     { value: 3, label: '고수' },
        //     { value: 4, label: '미나리' }
        // ]

        //재배방법
        // const cultivationNm = [
        //     {value: '', label:'해당없음'},
        //     { value: '토지', label:'토지'},
        //     { value: '온실', label:'온실'},
        //     { value: '수경재배', label:'수경재배'}
        // ]

        //농약유무
        const pesticideYn = [
            {value: '', label:'해당없음'},
            {value: '유기농', label:'유기농'},
            {value: '무농약', label:'무농약'},
            {value: '농약사용', label:'농약사용'},
        ]

        const packUnit = [
            {value: 'kg', label:'kg'},
            {value: 'g', label:'g'},
            {value: 'L', label:'L'},
            {value: 'ml', label:'ml'},
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
            // { value: TERMS_OF_DELIVERYFEE.GTE_FREE, label: '개 이상 무료배송' },
            { value: TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT, label: '개씩 배송요금 부과' },
            // { value: TERMS_OF_DELIVERYFEE.GTE_PRICE_FREE, label: '원 이상 무료배송' },
        ]

        //상품종류 : 상품정보제공 고시 설정에서 사용
        const goodsTypes = [
            { value: 'A', label: '식품(농수산물)' }, //Agricultural food
            { value: 'P', label: '가공식품' },      //Processed food
            { value: 'H', label: '건강기능식품' },   //Health functional food
        ]

        // const deliveryTypes = [
        //     {value: 'directDelivery', label:'직배송'},
        //     {value: 'taekbaeDelivery', label:'택배송'}
        // ]

        bindData = {
            items,
            itemKinds: [],
            // cultivationNm,
            pesticideYn,
            packUnit,
            priceSteps,
            termsOfDeliveryFees,
            goodsTypes,
            // deliveryTypes
        }
    }
    //조회
    search = async () => {
        if(!this.state.foods.foodsNo)
            return

        const { data: foods } = await getFoodsByFoodsNo(this.state.foods.foodsNo);
        return foods
    }

    //대표상품 이미지
    onGoodsImageChange = (images) => {

        const foods = Object.assign({}, this.state.foods);
        foods.goodsImages = images;

        this.setValidatedObj({foods});
        this.setState({foods});
    }

    //배송방법
    onDeliveryTypeClick = (item) => {
        const foods = Object.assign({}, this.state.foods)

        if(item.value === 'directDelivery'){
            foods.directDelivery = true
            foods.taekbaeDelivery = false
        }
        else{
            foods.directDelivery = false
            foods.taekbaeDelivery = true
        }

        this.setValidatedObj({foods});
        this.setState({foods});
    }

    //농약유무
    onPesticideYnClick  = (item) => {
        const foods = Object.assign({}, this.state.foods);
        foods.pesticideYn = item.value;
        this.setValidatedObj({foods});
        this.setState({foods});
    }
    //포장단위
    onPackUnitClick = (item) => {
        const foods = Object.assign({}, this.state.foods);
        foods.packUnit = item.value;
        this.setValidatedObj({foods});
        this.setState({foods});
    }

    //인풋박스
    onInputChange = (e) => {
        let { name, value } = e.target;
        const foods = Object.assign({}, this.state.foods);

        if(name === 'currentPrice'){
            const currentPrice = ComUtil.toNum(value);
            const consumerPrice = ComUtil.toNum(foods.consumerPrice);


            if(currentPrice === 0){
                foods.discountRate = 100
            }
            else if(consumerPrice > 0 && currentPrice > 0){
                const discountRate = 100 - ((currentPrice / consumerPrice) * 100);
                foods.discountRate = ComUtil.toNum(discountRate)
            }
        }

        foods[name] = value;
        this.setValidatedObj({foods});
        this.setState({foods});
    }

    // //체크박스
    // onCheckBoxChange = (e) => {
    //     let { name, checked } = e.target;
    //     const foods = Object.assign({}, this.state.foods);
    //     foods[name] = checked;
    //     this.setValidatedObj({foods});
    //     this.setState({foods});
    // }

    //임시저장
    onAddTempGoodsClick = async (e) => {
        this.loadingToggle('temp');
        await this.saveTemp();
        this.loadingToggle('temp');
    }

    saveTemp = async () => {
        const foods = Object.assign({}, this.state.foods);

        if(foods.goodsNm.length <= 0){
            this.notify('상품명은 필수 입니다', toast.error);
            return
        }

        //100g, 100l, 당 단가계산
        const {standardUnit, standardUnitPrice} = getStandardUnitPrice({
            packAmount: foods.packAmount,
            packUnit: foods.packUnit,
            foodsQty: foods.foodsQty,
            currentPrice: foods.currentPrice
        })

        foods.standardUnit = standardUnit
        foods.standardUnitPrice = standardUnitPrice

        console.log({foods})


        await this.save(foods)
    }

    loadingToggle = (key) => {
        const isLoading = this.state.isLoading[key];
        this.setState({
            isLoading: {
                [key]: !isLoading
            }
        })
    }

    isPassedValidation = () => {
        const state = Object.assign({}, this.state);
        //에디터의 내용을 state에 미리 저장 후 밸리데이션 체크
        state.foods.goodsContent = this.editorRef.current.getInstance().getValue();

        //밸리데이션 체크
        this.setValidatedObj(state)
        //밸리데이션을 통과했는지 여부
        const valid = this.isValidatedSuccessful();

        if(!valid.isSuccess){
            this.notify(valid.msg, toast.error);
            return false
        }
        return true
    }

    //상품노출
    onConfirmClick = async () => {

        if(this.state.seller.waesangDeal === false && this.state.foods.waesangDeal === true){
            alert('업체정보에 외상거래 불가능으로 되어있습니다. 상품의 외상거래를 체크 해제 후 시도해 주세요')
            return
        }

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
        this.loadingToggle('update');
        await this.saveTemp();
        this.loadingToggle('update');
    }

    //할인율 계산
    getDiscountRate = (foods) => {
        return (100 - ((foods.currentPrice / foods.consumerPrice) * 100)) || 0
    }

    //저장(DB에 selectedStepPrice 가 없어져서, 사용자가 선택한 단계와는 상관없이 단계별 값이 있는 마지막 )
    save = async (foods) => {

        //상품상세
        foods.goodsContent = this.editorRef.current.getInstance().getValue();

        //확정 전까지 재고수량 동기화
        if(!foods.confirm){
            foods.remainedCnt = foods.packCnt;
        }

        console.log({foods});

        //상품이미지의 imageNo로 정렬
        ComUtil.sortNumber(foods.goodsImages, 'imageNo', false)

        const {data: foodsNo, status} = await addFoods(foods);
        if(status !== 200) {
            alert('등록이 실패 하였습니다');
            return
        }
        else if(foodsNo === -1){
            alert('이미지 및 컨텐츠 사이즈가 10메가를 초과했습니다. 용량을 줄여서 다시 해주세요');
            return
        }
        else if(foodsNo === -2){
            alert('서버에서 컨텐츠를 파일로 저장시 오류가 발생하였습니다.');
            return
        }
        else{
            this.notify('저장되었습니다', toast.success);
            foods.foodsNo = foodsNo;
            this.setState({
                foods: foods
            })
        }
    }

    confirmSave = async() => {
        const foods = Object.assign({}, this.state.foods);
        foods.confirm = true; //상품목록에 노출

        let confirmResult = updateConfirmFoods(this.state.foods.foodsNo, foods.confirm);

        if(confirmResult) {
            this.notify('저장이 완료되었습니다', toast.success);
            this.setState({
                foods: foods
            })
        }
    }

    //밸리데이션검증 성공여부
    isValidatedSuccessful = () => {
        let isSuccess = true;
        let msg = '';

        //Object.keys(validatedObj)

        Object.keys(validatedObj).some((key) => {
            const _msg = validatedObj[key];
            if(_msg){
                isSuccess = false;
                msg = _msg;
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
        this.setItemKinds(item.value);

        const foods = Object.assign({}, this.state.foods);

        if(item.value !== foods.itemNo){
            foods.itemKindCode = null;
            foods.itemKindName = null;
        }

        foods.itemNo = item.value;
        foods.itemName = item.label;
        this.setValidatedObj({foods});
        this.setState({ foods });
    }

    //상품정보제공고시
    onGoodsTypeChange = (data) => {
        const foods = Object.assign({}, this.state.foods);
        foods.goodsTypeName = data.label;
        foods.goodsTypeCode = data.value;
        this.setValidatedObj({foods});
        this.setState({foods});
    }

    onItemKindChange = (data) => {
        const foods = Object.assign({}, this.state.foods);
        foods.itemKindName = data.label;
        foods.itemKindCode = data.value;
        this.setValidatedObj({foods});
        this.setState({foods});
    }

    //품종 세팅
    setItemKinds = (itemNo) => {
        if(itemNo !== this.state.foods.itemNo){
            const item = bindData.items.find(item => item.value === itemNo);
            if(item && item.itemKinds){
                bindData.itemKinds = item.itemKinds.map((itemKind) => ({value: itemKind.code, label: itemKind.name}))

                // const goods = Object.assign({}, this.state.goods)
                // goods.itemKind = null
                // this.setState({goods})

            }

        }
    }

    onDeleteGoodsClick = async(isConfirmed) => {
        if(isConfirmed){
            await deleteFoods(this.state.foods.foodsNo);
            this.props.onClose()
        }

    }

    // 상품 판매 중단
    onGoodsStopClick = async(isConfirmed) => {
        if(isConfirmed){
            await updateFoodsSalesStop(this.state.foods.foodsNo);
            this.props.onClose()
        }
    }

    //상품 복사
    onCopyClick = async(isConfirmed) => {
        if(isConfirmed){
            const { status, data: foodsNo } = await copyFoodsByFoodsNo(this.state.foods.foodsNo)

            if(status != 200 || foodsNo <= 0){
                alert('[상품복사실패] 다시 진행해주세요')
                return
            }

            alert('복사가 완료되었습니다. 상품 목록에서 확인해 주세요')
        }
    }

    onDateChange = (date) => {

        const foods = Object.assign({}, this.state.foods);


        //상품판매기한 설정(마지막 선택한 단계의 날짜로)
        foods.saleEnd = date;

        this.setValidatedObj({foods});

        this.setState({foods});
    }

    //배송정책 드롭다운 클릭
    onTermsOfDeliveryFeeChange = ({value, label}) => {
        // deliveryFeeTerms.find(terms=>terms.value === value).label

        const state = Object.assign({}, this.state)

        state.termsOfDeliveryFee = value

        switch (value){
            //무료배송
            case TERMS_OF_DELIVERYFEE.FREE :
                state.foods.deliveryFee = 0     //배송비
                state.foods.deliveryQty = ''    //무료배송 조건
                break;
            case TERMS_OF_DELIVERYFEE.NO_FREE :
                state.foods.deliveryQty = ''    //무료배송 조건
                break;
        }

        state.foods.termsOfDeliveryFee = value


        this.setValidatedObj(state)
        this.setState(state)
    }


    //외상거래 클릭
    onWaesangDealClick = () => {

        if(this.state.foods.confirm) {
            alert('확정되어 수정 불가능 합니다')
            return
        }

        if(this.state.seller.waesangDeal === false && this.state.foods.waesangDeal === false){
            return
        }
        else{
            const foods = Object.assign({}, this.state.foods)
            foods.waesangDeal = !foods.waesangDeal
            this.setState({
                foods: foods
            })

        }
    }

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { foods } = this.state;

        //console.log('goodsContent in Render:', goods.goodsNo, goods.goodsContent)
        const star = <span className='text-danger'>*</span>

        const salesStopText = foods.saleStopped && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매중단되어 판매가 불가능 합니다</div>
        const confirmText = (foods.confirm && !foods.saleStopped) && <div className='p-3 text-center text-danger ml-1 mr-1'>상품이 판매개시되어 수정내용이 제한됩니다</div>
        const btnAddTempGoods = !foods.confirm ? <Button className='d-flex align-items-center justify-content-center' onClick={this.onAddTempGoodsClick} disabled={this.state.isLoading.temp} block color='warning'>임시저장{this.state.isLoading.temp && <Spinner/> }</Button> : null
        const btnConfirm = (foods.foodsNo && !foods.confirm) ?  <Button onClick={this.onConfirmClick} block color={'warning'}>확인(판매개시)</Button> : null
        const btnDelete = (foods.foodsNo && !foods.confirm) ? <ModalConfirmButton block color={'danger'} title={'상품을 삭제 하시겠습니까?'} content={'삭제된 상품은 복구가 불가능 합니다'} onClick={this.onDeleteGoodsClick}>삭제</ModalConfirmButton> : null
        const btnPreview = foods.foodsNo ? <Button onClick={this.onPreviewClick} block>미리보기</Button> : null
        const btnGoodsStop = (foods.confirm && !foods.saleStopped) ? <ModalConfirmButton block color={'danger'} title={'상품을 판매중단 하시겠습니까?'} content={'판매중단된 상품은 다시 판매가 불가능 합니다'} onClick={this.onGoodsStopClick}>판매중단</ModalConfirmButton> : null
        const btnUpdate = (foods.confirm && !foods.saleStopped) ? <Button className='d-flex align-items-center justify-content-center'  onClick={this.onUpdateClick} disabled={this.state.isLoading.update} block color={'warning'}>수정완료{this.state.isLoading.update && <Spinner/>}</Button> : null
        const btnCopy = (foods.foodsNo && foods.confirm )? <ModalConfirmButton block color={'secondary'} title={'상품복사를 진행 하시겠습니까?'} content={<Fragment>마지막 저장된 내용을 기준으로 복사가 진행 됩니다<br/>복사 진행전 저장을 꼭 해 주세요</Fragment>} onClick={this.onCopyClick}>상품복사</ModalConfirmButton> : null
        // <ModalConfirmButton block color={'warning'} title={'상품을 수정 하시겠습니까?'} content={'수정되는 내용은 즉시 반영 됩니다'} onClick={this.onUpdateClick}>수정완료</ModalConfirmButton> : null

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === foods.termsOfDeliveryFee)
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
                                    <SingleImageUploader images={foods.goodsImages} defaultCount={10} isShownMainText={true} onChange={this.onGoodsImageChange} />

                                    {/*<SingleImageUploader images={foods.goodsImages} defaultCount={10} onChange={this.onGoodsImageChange} />*/}
                                    {/*<ImageUploader onChange={this.onGoodsImageChange} multiple={true} limit={10}/>*/}
                                    <Fade in={validatedObj.goodsImages ? true : false} className="text-danger small mt-1" >{validatedObj.goodsImages}</Fade>
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>상품명{star}</Label>
                                    <Input name={this.names.goodsNm} value={foods.goodsNm} onChange={this.onInputChange}/>
                                    <Fade in={validatedObj.goodsNm? true : false} className="text-danger small mt-1" >{validatedObj.foods}</Fade>
                                </FormGroup>
                                <FormGroup>

                                    <span className='mr-2'>
                                        <FontAwesomeIcon icon={faCheckCircle} className={'text-info mr-1'}/>카드거래
                                    </span>
                                    <span className='mr-2 cursor-pointer' onClick={this.onWaesangDealClick}>
                                        <FontAwesomeIcon icon={faCheckCircle} className={this.state.foods.waesangDeal ? 'mr-1 text-info' : 'mr-1 text-secondary'} />외상거래
                                    </span>
                                    {
                                        (!this.state.seller.waesangDeal && !this.state.foods.waesangDeal) && (
                                            <div className='small'>
                                                외상거래는 <span className='text-info font-weight-normal'>업체정보/상점관리</span> 에서 설정 후 선택 가능합니다
                                            </div>
                                        )
                                    }

                                </FormGroup>
                                {/*<FormGroup>*/}
                                {/*<Label className={'text-secondary'}>태그</Label>*/}
                                {/*<Input name={this.names.searchTag} value={foods.searchTag} onChange={this.onInputChange}/>*/}
                                {/*</FormGroup>*/}
                            </Container>
                            <hr/>
                            <Container>
                                <h6>기본정보</h6>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>품목{star}</Label>
                                    {
                                        foods.confirm ? <div>{foods.itemName}</div> : (
                                            <Fragment>
                                                <Select options={bindData.items}
                                                        value={ bindData.items.find(item => item.value === foods.itemNo)}
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
                                        foods.confirm ? <div>{foods.itemKindName}</div> : (
                                            <Fragment>
                                                <Select options={bindData.itemKinds}
                                                        value={foods.itemKindCode ? bindData.itemKinds.find(itemKind => itemKind.value === foods.itemKindCode) : null}
                                                        onChange={this.onItemKindChange}
                                                />
                                                <Fade in={validatedObj.itemKind? true : false} className="text-danger small mt-1" >{validatedObj.itemKind}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>생산지{star}</Label>
                                    <Input name={this.names.productionArea} value={foods.productionArea} placeholder='ex)전남 여수' onChange={this.onInputChange} />
                                    <Fade in={validatedObj.productionArea? true : false} className="text-danger small mt-1" >{validatedObj.productionArea}</Fade>
                                </FormGroup>

                                <FormGroup>
                                    <Label className={'text-secondary small'}>농약유무</Label>
                                    <RadioButtons
                                        value={bindData.pesticideYn.find(item => item.value === foods.pesticideYn)}
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
                                        // foods.confirm ? <div>{foods.itemName}</div> : (
                                        <Fragment>
                                            <Select options={bindData.goodsTypes}
                                                    value={ bindData.goodsTypes.find(item => item.value === foods.goodsTypeCode)}
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
                                    <Label className={'text-secondary small'}>제공 중량/수량{star} (제품 하나에 제공될 정보)</Label>

                                    <div className={'d-flex align-items-center'}>
                                        <Input className={'mr-1'} name={this.names.packAmount} value={foods.packAmount} onChange={this.onInputChange} placeholder={'중량'}/>
                                        <span className='mr-1'>
                                                <RadioButtons
                                                    value={bindData.packUnit.find(item => item.value === foods.packUnit)}
                                                    options={bindData.packUnit} onClick={this.onPackUnitClick} />
                                            </span>
                                        <FontAwesomeIcon className='mr-1' icon={faTimes}/>
                                        <InputGroup  size={'md'}>
                                            <CurrencyInput name={this.names.foodsQty} value={foods.foodsQty} onChange={this.onInputChange} placeholder={'수량'}/>
                                            <InputGroupAddon addonType="append">
                                                <InputGroupText>개</InputGroupText>
                                            </InputGroupAddon>
                                        </InputGroup>
                                    </div>
                                    <Fade in={validatedObj.packAmount? true : false} className="text-danger small mt-1" >{validatedObj.packAmount}</Fade>
                                    <Fade in={validatedObj.packUnit? true : false} className="text-danger small mt-1" >{validatedObj.packUnit}</Fade>
                                    <Fade in={validatedObj.foodsQty? true : false} className="text-danger small mt-1" >{validatedObj.foodsQty}</Fade>
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>재고수량{star} (소진시 자동 판매종료 됩니다)</Label>
                                    {
                                        foods.confirm ? <div>{foods.packCnt}</div> : (
                                            <Fragment>
                                                <CurrencyInput name={this.names.packCnt} value={foods.packCnt} onChange={this.onInputChange}/>
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
                                            <CurrencyInput name={this.names.consumerPrice} value={foods.consumerPrice} onChange={this.onInputChange} placeholder={'소비자가'}/>
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
                                        <span className={'ml-auto text-secondary small'}>{Math.round(ComUtil.addCommas(foods.discountRate),0)} %
                                            {
                                                foods.consumerPrice && foods.consumerPrice > 0 && foods.currentPrice && foods.currentPrice > 0 && (
                                                    ` (- ${ ComUtil.addCommas(ComUtil.toNum(foods.consumerPrice) - ComUtil.toNum(foods.currentPrice))} 원) `
                                                )
                                            }
                                            할인
                                            </span>
                                    </div>
                                    <Fragment>
                                        <InputGroup  size={'md'}>
                                            <CurrencyInput name={this.names.currentPrice} value={foods.currentPrice} onChange={this.onInputChange} placeholder={`판매가`}/>
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
                                    <span className='small text-secondary'>
                                        <div> - <span className='text-info'>{foods.directDelivery ? '직배송' : '택배송'}</span> 판매자 입니다</div>
                                        <div> - 상품 총금액 <span className='text-info'>{this.state.seller.freeDeliveryAmount}</span>원 이상 무료배송 자동적용</div>
                                        {/*<div> - 단, <span className='text-info'>개씩 배송비용</span> 선택시 <span className='text-info'>무료배송 제외</span></div>*/}
                                    </span>
                                </FormGroup>

                                {
                                    foods.taekbaeDelivery && (
                                        <FormGroup>
                                            <Label className={'text-secondary small mr-2'}>배송조건 선택{star}</Label>
                                            <InputGroup>
                                                <CurrencyInput
                                                    disabled={foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.NO_FREE || foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}
                                                    style={{width:50}} name={this.names.deliveryQty} value={foods.deliveryQty} onChange={this.onInputChange} placeholder={'배송조건(숫자)'}/>
                                                <InputGroupButtonDropdown addonType="append" style={{zIndex:0}} isOpen={this.state.isDeliveryFeeTermsOpen} toggle={()=>this.setState({isDeliveryFeeTermsOpen:!this.state.isDeliveryFeeTermsOpen})}>
                                                    <DropdownToggle caret>
                                                        {
                                                            termsOfDeliveryFeeLabel
                                                        }
                                                    </DropdownToggle>
                                                    <DropdownMenu>
                                                        {
                                                            bindData.termsOfDeliveryFees.map(terms => <DropdownItem key={terms.value} onClick={this.onTermsOfDeliveryFeeChange.bind(this, terms)}>{terms.label}</DropdownItem>)
                                                        }
                                                    </DropdownMenu>
                                                </InputGroupButtonDropdown>
                                            </InputGroup>
                                            {
                                                foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT && <div className='small text-info'>무료배송에서 제외됩니다</div>
                                            }
                                            <Fade in={validatedObj.deliveryQty ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryQty}</Fade>
                                        </FormGroup>
                                    )
                                }



                                <FormGroup>
                                    <Label className={'text-secondary small'}>배송비{star}</Label>
                                    {
                                        foods.directDelivery ? (
                                            <Fragment>
                                                <CurrencyInput name={this.names.deliveryFee} value={foods.deliveryFee} onChange={this.onInputChange} placeholder={'배송비'}/>
                                                <Fade in={validatedObj.deliveryFee ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryFee}</Fade>
                                            </Fragment>
                                        ) : (
                                            <Fragment>
                                                <CurrencyInput disabled={foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.FREE}  name={this.names.deliveryFee} value={foods.deliveryFee} onChange={this.onInputChange} placeholder={'배송비'}/>
                                                <Fade in={validatedObj.deliveryFee ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryFee}</Fade>
                                            </Fragment>
                                        )
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <Label className={'text-secondary small'}>배송문구{star}</Label>
                                    {/*<Input name="deliveryText" value={foods.deliveryText} placeholder='' onChange={this.onInputChange} />*/}

                                    <Textarea
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        className={'border'}
                                        name={'deliveryText'}
                                        rows={5}
                                        onChange={this.onInputChange}
                                        value={foods.deliveryText}
                                        placeholder='배송문구'
                                    />
                                    <Fade in={validatedObj.deliveryText ? true : false} className="text-danger small mt-1" >{validatedObj.deliveryText}</Fade>
                                </FormGroup>
                            </Container>
                            <hr/>
                            {/*<Container>*/}
                            {/*<h6>결제방법</h6>*/}
                            {/*<FormGroup>*/}
                            {/*<div>*/}
                            {/*<CustomInput type="checkbox" name="waesangDeal" id="waesangDeal" bsSize="lg" label="외상결제" inline onChange={this.onCheckBoxChange} checked={foods.waesangDeal} />*/}
                            {/*<CustomInput type="checkbox" name="cardDeal" id="cardDeal" bsSize="lg" label="카드결제" inline onChange={this.onCheckBoxChange} checked={foods.cardDeal} />*/}
                            {/*</div>*/}
                            {/*</FormGroup>*/}
                            {/*</Container>*/}
                            <Container>
                                <h6>판매종료일</h6>
                                <SingleDatePicker
                                    placeholder="판매종료일"
                                    date={foods.saleEnd ? moment(foods.saleEnd) : null}
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
                            {/*<Foods foodsNo={foods.goodsNo} />*/}
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
                                            initialValue={foods.goodsContent}
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
                                    src={`/b2b/foods?foodsNo=${foods.foodsNo}`}
                                    style={{width: '100%', height: 760}}
                                ></iframe>
                            </Col>
                        </Row>
                    </Container>
                </ModalWithNav>

                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}

            </div>
        )
    }
}

