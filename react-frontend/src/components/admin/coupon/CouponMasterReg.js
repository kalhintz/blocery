import React, { useState, useEffect } from 'react';
import { FormGroup, Alert, Container, Input, CustomInput, Row, Col, Label, Button, Modal, ModalHeader, ModalBody, ModalFooter  } from 'reactstrap'
import Select from 'react-select'

import { getCouponMaster, saveCouponMaster } from '~/lib/adminApi'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment-timezone'
import ComUtil from '~/util/ComUtil'
import { B2cGoodsSearch } from '~/components/common'

import {FaSearchPlus} from "react-icons/fa";

const CouponMasterReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const p_masterNo = props.masterNo||0;

    const [couponTypeOptions,setCouponTypeOptions] = useState(
        [
            {value: 'memberJoin', label: '회원가입'},
            {value: 'goodsBuyReward', label: '구매 보상쿠폰'},
            {value: 'specialCoupon', label: '스페셜 쿠폰'}
        ]
    );

    // 시작일자 달력
    const renderStartCalendarInfo = () => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    // 종료일자 달력
    const renderEndCalendarInfo = () => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;

    const [startDayFocusedInput,setStartDayFocusedInput] = useState(null);
    const [endDayFocusedInput,setEndDayFocusedInput] = useState(null);

    // 쿠폰 종류 라디오 버튼 (할인금액 or 할인율) radio checked
    // const [radioCouponKind,setRadioCouponKind] = useState('0');

    // 최소 주문 금액 라디오 버튼 (없음, 10000원, 20000원, 30000원, 직접입력) radio checked
    const [radioMinOrderAmtKind,setRadioMinOrderAmtKind] = useState('0');

    // 쿠폰 발급 정보
    const [couponMaster,setCouponMaster] = useState({
        masterNo:p_masterNo,
        couponType:"memberJoin",
        useDuration:30,
        startDay:null,
        endDay:null,
        totalCount:0,
        remainCount:0,
        deleted:false,
        couponTitle:"",
        couponBlyAmount:0,
        minOrderBlyAmount:0,
        targetGoodsNo:0,  // 쿠폰발급상품관련정보
        producerNo:0,
        producerFarmNm:null,
        goodsNm:null,
    });

    const [goodsSearchModal, setGoodsSearchModal] = useState(false)

    const {
        masterNo,
        couponType,
        startDay, endDay,
        totalCount, remainCount,
        couponTitle,
        couponBlyAmount,
        minOrderBlyAmount
    } = couponMaster;

    useEffect(() => {

        async function fetch() {
            await search();
        }

        fetch();
    }, []);

    const search = async () => {
        //수정일경우
        if(p_masterNo > 0){
            const {data:couponMasterInfo} = await getCouponMaster({masterNo:p_masterNo})
            if(couponMasterInfo){

                // 최소주문금액 라디오 버튼 체크
                const v_minOrderBlyAmount = couponMasterInfo.minOrderBlyAmount;
                if(v_minOrderBlyAmount == 0){
                    setRadioMinOrderAmtKind('0');
                } else if(v_minOrderBlyAmount == 10000){
                    setRadioMinOrderAmtKind('1');
                } else if(v_minOrderBlyAmount == 20000){
                    setRadioMinOrderAmtKind('2');
                } else if(v_minOrderBlyAmount == 30000){
                    setRadioMinOrderAmtKind('3');
                } else {
                    setRadioMinOrderAmtKind('9');
                }

                // 쿠폰발급내역 정보 가져오기
                setCouponMaster(couponMasterInfo)
            }
        }
    };

    const onInputChange = (e) => {
        const {name,value} = e.target;

        const newCouponMaster = Object.assign({}, couponMaster)

        newCouponMaster[name] = value

        // setCouponMaster({
        //     ...couponMaster,
        //     [name]:value
        // });

        //임시로 쿠폰BLY와 최소주문BLY 를 같이 사용함
        if (name === 'couponBlyAmount') {
            newCouponMaster.minOrderBlyAmount = value

        }

        setCouponMaster(newCouponMaster)
    };

    // 발급 위치
    const onCouponTypeChange = (data) => {
        let v_CouponType = data.value;

        if(v_CouponType === "goodsBuyReward") {
            setCouponMaster({
                ...couponMaster,
                startDay: "",
                endDay: "",
                couponType:v_CouponType
            });
        } else if(v_CouponType === "memberJoin") {
            setCouponMaster({
                ...couponMaster,
                targetGoodsNo: 0,
                goodsNm: "",
                producerNo: 0,
                producerFarmNm: "",
                couponType: v_CouponType
            });
        } else if(v_CouponType === 'specialCoupon') {
            setCouponMaster({
                ...couponMaster,
                startDay: "",
                endDay: "",
                targetGoodsNo: 0,
                goodsNm: "",
                producerNo: 0,
                producerFarmNm: "",
                couponType:v_CouponType
            })
        }
    };

    // 발급 일자 달력
    const onCalendarDatesChange = (gubun, date) => {
        //console.log("date",date.format('YYYYMMDD'));
        if(gubun == "start"){
            setCouponMaster({
                ...couponMaster,
                startDay:date.format('YYYYMMDD')
            });
        }
        if(gubun == "end"){
            setCouponMaster({
                ...couponMaster,
                endDay:date.format('YYYYMMDD')
            });
        }
    };

    // 최소 주문 금액 (라디오 체크 이벤트)
    const onMinOrderAmtKindRadioChange = (e) => {
        const v_RadioMinOrderAmtKind = e.target.value;
        setRadioMinOrderAmtKind(v_RadioMinOrderAmtKind);

        let v_minOrderBlyAmount = 0;
        if(v_RadioMinOrderAmtKind === '0'){
            v_minOrderBlyAmount = 0;
        } else if(v_RadioMinOrderAmtKind === '1'){
            v_minOrderBlyAmount = 10000;
        } else if(v_RadioMinOrderAmtKind === '2'){
            v_minOrderBlyAmount = 20000;
        } else if(v_RadioMinOrderAmtKind === '3'){
            v_minOrderBlyAmount = 30000;
        }

        setCouponMaster({
            ...couponMaster,
            minOrderBlyAmount: v_minOrderBlyAmount
        });
    };

    const close = () => {
        props.onClose();
    };

    //취소 창닫기
    const onCancelClick = () => {
        close();
    };

    // 쿠폰발급내역 등록 및 수정
    const onSaveClick = async () => {
        const couponMasterInfo = Object.assign({}, couponMaster);

        if(couponMasterInfo.couponTitle.length === 0){
            alert("쿠폰명은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.couponType === 'memberJoin') {
            if (
                couponMasterInfo.startDay === null ||
                couponMasterInfo.startDay === "" ||
                couponMasterInfo.endDay === null ||
                couponMasterInfo.endDay === ""
            ) {
                alert("발급기간은 필수 입력입니다!");
                return false;
            }
        }

        if(couponMasterInfo.couponType === 'goodsBuyReward' && couponMasterInfo.targetGoodsNo === 0) {
            alert("쿠폰상품은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.couponBlyAmount === 0){
            alert("할인금액은 필수 입력입니다!");
            return false;
        }

        if(couponMasterInfo.totalCount === 0){
            alert("총 수량은 필수 입력입니다!");
            return false;
        }

        const params = couponMasterInfo;
        const { data } = await saveCouponMaster(params);

        if (data === 1) {
            alert("쿠폰 발급이 등록(수정) 처리 되었습니다!");
            close();
        } else {
            if (data === -1) {
                alert("세션이 만료 되었습니다 다시 로그인 하시길 바랍니다!");
            } else if (data === -2) {
                alert("소비자가 해당 쿠폰을 발급을 하여 수정을 할 수 없습니다!");
            } else {
                alert("쿠폰발급 등록(수정)중 오류가 발생하였습니다!");
            }
        }

    };

    //상품 컴포넌트 관련 온체인지 (실제로는 readOnly라서 안쓰임)
    const onInputBlyTimeGoodsChange = (e) => {
        // let { name, value } = e.target;
    };

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    const goodsSearchModalOnChange = (obj) => {
        setCouponMaster({
            ...couponMaster,
            targetGoodsNo: obj.goodsNo,
            producerNo: obj.producerNo,
            producerFarmNm: obj.producerFarmNm,
            goodsNm: obj.goodsNm,
        });

        goodsSearchModalToggle();
    };

    const goodsSearchModalToggle = () => {
        setGoodsSearchModal(!goodsSearchModal);
    };

    // 상품검색 클릭
    const goodsSearchModalPopup = (e) => {
        setGoodsSearchModal(true);
    };


    const star = <span className='text-danger'>*</span>;
    return(
        <div>
            <div className='pt-0 pl-2 pr-2 pb-1'>
                <FormGroup>
                    <Alert color={'secondary'} className='small'>
                        아래 모든 항목은 필수 입력 항목입니다.<br/>
                        발급기간 동안에만 쿠폰이 지급되며, 발급기간이 남아도 총 수량이 소진되면 더 이상 지급되지 않습니다.
                    </Alert>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>발급 위치 {star}</Label>
                    <div className="pl-1" style={{width: '300px'}}>
                        <Select
                            name={'couponType'}
                            options={couponTypeOptions}
                            value={couponType ? couponTypeOptions.find(items => items.value === couponType) : 'memberJoin'}
                            onChange={onCouponTypeChange}
                        />
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>
                        쿠폰명 {star}
                    </Label>
                    <div>
                        <Input
                            type="text"
                            name={"couponTitle"}
                            style={{width:'80%'}}
                            value={couponTitle}
                            onChange={onInputChange}
                        />
                    </div>
                </FormGroup>

                {
                    (couponMaster.couponType === 'goodsBuyReward') &&
                    <FormGroup>

                        <Label className={'font-weight-bold text-secondary small'}>
                            쿠폰상품 {star}
                        </Label>
                        <div className="d-flex align-items-center">
                            <Input type="text"
                                   name={'mdPickProducerNo'}
                                   style={{width: '100px'}}
                                   value={couponMaster.producerNo || ""}
                                   readOnly='readonly'
                                   placeholder={'생산자번호'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="text"
                                   name={'mdPickProducerFarmNm'}
                                   className="ml-1"
                                   style={{width: '150px'}}
                                   value={couponMaster.producerFarmNm || ""}
                                   readOnly='readonly'
                                   placeholder={'생산자명'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="text"
                                   name={'mdPickGoodsNm'}
                                   className="ml-1"
                                   style={{width: '250px'}}
                                   value={couponMaster.goodsNm || ""}
                                   readOnly='readonly'
                                   placeholder={'상품명'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <Input type="number"
                                   name={'mdPickGoodsNo'}
                                   className="ml-1"
                                   style={{width: '100px'}}
                                   value={couponMaster.targetGoodsNo || ""}
                                   readOnly='readonly'
                                   placeholder={'상품번호'}
                                   onChange={onInputBlyTimeGoodsChange}/>
                            <div className="ml-1">
                                <Button color={'info'}
                                        onClick={goodsSearchModalPopup}>
                                    <FaSearchPlus /> 상품검색
                                </Button>
                            </div>
                        </div>
                    </FormGroup>
                }

                {
                    (couponMaster.couponType === 'memberJoin') &&

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>발급 기간 {star}</Label>
                        <div className="d-flex align-items-center">
                            <SingleDatePicker
                                placeholder="시작일"
                                date={startDay ? moment(ComUtil.intToDateMoment(startDay)).startOf('day') : null}
                                onDateChange={onCalendarDatesChange.bind(this, 'start')}
                                focused={startDayFocusedInput}
                                onFocusChange={({focused}) => setStartDayFocusedInput(focused)}
                                id={"startDay"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                isOutsideRange={() => false}
                                calendarInfoPosition="top"
                                verticalHeight={700}
                                renderCalendarInfo={renderStartCalendarInfo}
                            />
                            <div className="pl-1 pr-1"><span>~</span></div>
                            <SingleDatePicker
                                placeholder="종료일"
                                date={endDay ? moment(ComUtil.intToDateMoment(endDay)).endOf('day') : null}
                                onDateChange={onCalendarDatesChange.bind(this, 'end')}
                                focused={endDayFocusedInput}
                                id={"endDay"}
                                onFocusChange={({focused}) => setEndDayFocusedInput(focused)}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                isOutsideRange={() => false}
                                calendarInfoPosition="top"
                                verticalHeight={700}
                                renderCalendarInfo={renderEndCalendarInfo}
                            />
                        </div>
                    </FormGroup>
                }
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>쿠폰금액(BLY) {star}</Label>
                    <div className='d-flex align-items-center' style={{width:'40%'}}>
                        <Input
                            type='number'
                            name={'couponBlyAmount'} value={couponBlyAmount}
                            onFocus={(event) => event.target.select()}
                            onChange={onInputChange}/> <span className='ml-2'>BLY</span>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>총 수량 {star}</Label>
                    <div className='d-flex align-items-center' style={{width:'40%'}}>
                        <Input
                            type='number'
                            name={'totalCount'} value={totalCount}
                            onFocus={(event) => event.target.select()}
                            onChange={onInputChange}/> <span className='ml-2'>개</span>
                    </div>
                </FormGroup>
                <FormGroup>
                    <Label className={'font-weight-bold text-secondary small'}>최소 주문 금액 {star}</Label>
                    <div className='d-flex align-items-center' style={{width:'40%'}}>
                        <Input
                            type='number'
                            name={'couponBlyAmount'}
                            value={minOrderBlyAmount}
                            onChange={onInputChange}
                            onFocus={(event) => event.target.select()}
                            readOnly
                        /> <span className='ml-2'>BLY</span>
                    </div>
                </FormGroup>
            </div>
            <div className="d-flex">
                <div className='flex-grow-1 p-1'>
                    <Button onClick={onCancelClick} block color={'warning'}>취소</Button>
                </div>
                <div className='flex-grow-1 p-1'>
                    <Button
                        onClick={onSaveClick} block color={'info'}
                        disabled={ (masterNo > 0) && (totalCount-remainCount) > 0 ? true:false}
                    >저장</Button>
                </div>
            </div>


            {/*상품검색 모달 */}
            <Modal size="lg" isOpen={goodsSearchModal}
                   toggle={goodsSearchModalToggle} >
                <ModalHeader toggle={goodsSearchModalToggle}>
                    상품 검색
                </ModalHeader>
                <ModalBody>
                    <B2cGoodsSearch onChange={goodsSearchModalOnChange} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary"
                            onClick={goodsSearchModalToggle}>취소</Button>
                </ModalFooter>
            </Modal>

        </div>
    )
}

export default CouponMasterReg