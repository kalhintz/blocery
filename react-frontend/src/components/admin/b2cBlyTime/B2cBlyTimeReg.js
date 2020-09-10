import React, { Component, PropTypes } from 'react'
import { FormGroup, Label, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment-timezone'

import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearchPlus } from '@fortawesome/free-solid-svg-icons'
import { BlocerySpinner, B2cGoodsSearch } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getTimeSaleAdmin, setBlyTimeSave } from '~/lib/adminApi'
import Style from './B2cBlyTimeReg.module.scss'

export default class B2cBlyTimeReg extends Component {
    constructor(props) {
        super(props);

        const { blyTimeGoodsNo } = this.props;

        this.state = {
            isDidMounted:false,
            focusedInput: null,

            blyTimeStartFocusedInput: null, blyTimeEndFocusedInput: null,
            blyTimeStart:"", blyTimeStartHH:"10", blyTimeStartMM:"00",
            blyTimeEnd:"", blyTimeEndHH:"00", blyTimeEndMM:"00",

            hourOptions: [
                {value:'00',label:'00'},
                {value:'01',label:'01'}, {value:'02',label:'02'}, {value:'03',label:'03'},
                {value:'04',label:'04'}, {value:'05',label:'05'}, {value:'06',label:'06'},
                {value:'07',label:'07'}, {value:'08',label:'08'}, {value:'09',label:'09'},
                {value:'10',label:'10'}, {value:'11',label:'11'}, {value:'12',label:'12'},
                {value:'13',label:'13'}, {value:'14',label:'14'}, {value:'15',label:'15'},
                {value:'16',label:'16'}, {value:'17',label:'17'}, {value:'18',label:'18'},
                {value:'19',label:'19'}, {value:'20',label:'20'}, {value:'21',label:'21'},
                {value:'22',label:'22'}, {value:'23',label:'23'},

            ],
            minuteOptions: [
                {value:'00',label:'00'},
                {value:'05',label:'05'}, {value:'10',label:'10'},
                {value:'15',label:'15'}, {value:'20',label:'20'},
                {value:'25',label:'25'}, {value:'30',label:'30'},
                {value:'35',label:'35'}, {value:'40',label:'40'},
                {value:'45',label:'45'}, {value:'50',label:'50'},
                {value:'55',label:'55'}, {value:'59',label:'59'}
            ],

            blyTimeGoods: {
                goodsNo:blyTimeGoodsNo,    // 블리타임 상품 번호

                blyTimeStart:null,         // 블리타임 시작일(일자T시:분)
                blyTimeEnd:null,           // 블리타임 종료일(일자T시:분)

                producerNo:null,            //생산자번호
                producerFarmNm:"",          //생산자명
                goodsNm:"",                 //상품명
                consumerPrice:0,            //소비자가
                currentPrice:0,             //판매가
                discountRate:0,             //할인율

                blyTimeReward:0,       // 소비자 보상비율
                blyTimeFeeRate:5,          //블리타임 수수료 최소 5%
            },

            goodsSearchModal:false,
            currentGoodsIdx:null,
        };
    }

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    goodsSearchModalOnChange = (obj) => {

        const blyTimeGoods = Object.assign([], this.state.blyTimeGoods);

        blyTimeGoods.producerNo = obj.producerNo;
        blyTimeGoods.producerFarmNm = obj.producerFarmNm;
        blyTimeGoods.goodsNo = obj.goodsNo;
        blyTimeGoods.goodsNm = obj.goodsNm;

        blyTimeGoods.consumerPrice = obj.consumerPrice;
        blyTimeGoods.currentPrice = obj.currentPrice;
        blyTimeGoods.discountRate = obj.discountRate;
        blyTimeGoods.blyTimeFeeRate = obj.feeRate;
        blyTimeGoods.blyTimeReward = obj.blyTimeReward;

        this.setState({
            blyTimeGoods
        });

        this.goodsSearchModalToggle();
    };

    goodsSearchModalToggle = () => {
        this.setState(prevState => ({
            goodsSearchModal: !prevState.goodsSearchModal
        }));
    };

    //밸리데이션 체크
    setValidatedObj = (blyTimeGoods) => {

        let v_startDateTime = this.state.blyTimeStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.blyTimeStartHH;
        let v_startDateMM = this.state.blyTimeStartMM;

        let v_endDateTime = this.state.blyTimeEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');      // 블리타임은 자정에 종료
        let v_endDateHH = this.state.blyTimeEndHH;
        let v_endDateMM = this.state.blyTimeEndMM;

        const startDate = moment(v_startDate + 'T' + v_startDateHH + ':' + v_startDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(v_endDate + 'T' + v_endDateHH + ':' + v_endDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');

        if(!v_startDateTime) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!v_endDateTime) {
            alert("종료일은 필수 입니다.");
            return false;
        }

        if(moment(startDate).format('x') > moment(endDate).format('x')){
            alert('시작일자가 종료일자보다 큽니다!');
            return false;
        }

        if(!blyTimeGoods.goodsNo) {
            alert("상품등록은 필수 입니다.");
            return false;
        }

        if(!blyTimeGoods.blyTimeReward) {
            alert("블리타임 보상율은 필수 입니다.");
            return false;
        }

        if(ComUtil.toNum(blyTimeGoods.blyTimeFeeRate) <= 0 || ComUtil.toNum(blyTimeGoods.blyTimeFeeRate) < 5) {
            alert("블리타임가 수수료는 필수 입니다.(최소 5% 이상)");
            return false;
        }

        return true;

    };

    componentDidMount = async () => {

        if(this.state.blyTimeGoods.goodsNo){
            // 블리타임 정보 조회
            let blyTimeGoods = Object.assign({}, this.state.blyTimeGoods);
            let goodsNo = blyTimeGoods.goodsNo;
            const { status, data } = await getTimeSaleAdmin(goodsNo);
            //console.log("getTimeSaleAdmin==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            blyTimeGoods.producerNo = data.producerNo;
            blyTimeGoods.producerFarmNm = data.producerFarmNm;
            blyTimeGoods.goodsNo = data.goodsNo;
            blyTimeGoods.goodsNm = data.goodsNm;

            blyTimeGoods.consumerPrice = data.consumerPrice;
            blyTimeGoods.currentPrice = data.defaultCurrentPrice;
            blyTimeGoods.discountRate = data.defaultDiscountRate;
            blyTimeGoods.blyTimeReward = data.blyTimeReward;
            blyTimeGoods.blyTimeDiscountRate = data.blyTimeDiscountRate;
            blyTimeGoods.blyTimeFeeRate = data.blyTimeFeeRate;

            let v_startDateTime =  moment(data.blyTimeStart);
            let v_endDateTime = moment(data.blyTimeEnd);
            let v_startDate = moment(v_startDateTime).format('YYYY-MM-DD');
            let v_startDateHH = moment(v_startDateTime).format('HH');
            let v_startDatemm = moment(v_startDateTime).format('mm');
            let v_endDate = moment(v_endDateTime).format('YYYY-MM-DD');
            let v_endDateHH = moment(v_endDateTime).format('HH');
            let v_endDatemm = moment(v_endDateTime).format('mm');

            this.setState({
                blyTimeStart:v_startDate, blyTimeStartHH:v_startDateHH, blyTimeStartMM:v_startDatemm,
                blyTimeEnd:v_endDate, blyTimeEndHH:v_endDateHH, blyTimeEndMM:v_endDatemm,
                blyTimeGoods
            });

        }else{
            let nowDay =  moment().day(); //0:일요일 〜 6:토요일
            if(nowDay < 2) {
                //이번주 화요일 오전10시 일자 구하기
                let nowDate = moment().day(2).hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
                let v_startDate = moment(nowDate).format('YYYY-MM-DD');
                let v_endDate = moment(v_startDate).add("days", 1).format('YYYY-MM-DD');
                this.setState({
                    blyTimeStart: v_startDate, blyTimeEnd: v_endDate
                });
            }else{
                //다음주 화요일 오전10시 일자 구하기
                let next_thurs = moment().weekday(7+2);
                let nowDate = next_thurs.hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
                let v_startDate = moment(nowDate).format('YYYY-MM-DD');
                let v_endDate = moment(v_startDate).add("days", 1).format('YYYY-MM-DD');
                this.setState({
                    blyTimeStart: v_startDate, blyTimeEnd: v_endDate
                });
            }
        }

        this.setState({isDidMounted:true})

    };

    ///블리타임 시작일자 달력
    renderStartCalendarInfo = (stepNo) => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    ///블리타임 종료일자 달력
    renderEndCalendarInfo = (stepNo) => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;

    //블리타임 일자 달력
    onCalendarDatesChange = (gubun, date) => {
        let v_gubun = gubun;
        let v_date = date.endOf('day');
        if(gubun == "start"){
            this.setState({
                blyTimeStart:v_date
            });
        }
        if(gubun == "end"){
            this.setState({
                blyTimeEnd:v_date
            });
        }
    }

    onStartHHChange = (data) => {
        let v_StartHH = data.value;
        this.setState({
            blyTimeStartHH:v_StartHH
        });
    }
    onStartMMChange = (data) => {
        let v_StartMM = data.value;
        this.setState({
            blyTimeStartMM:v_StartMM
        });
    }
    onEndHHChange = (data) => {
        let v_EndHH = data.value;
        this.setState({
            blyTimeEndHH:v_EndHH
        });
    }
    onEndMMChange = (data) => {
        let v_EndMM = data.value;
        this.setState({
            blyTimeEndMM:v_EndMM
        });
    }

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;

        if(name === 'blyTimeReward' || name === 'blyTimeFeeRate') {
            if(value <= 0) {
                alert('해당 값은 0보다 커야합니다.');
                return;
            }
        }
        console.log('name : ', name, ', value : ', value);

        let blyTimeGoods = Object.assign({}, this.state.blyTimeGoods);

        let obj_state = {};
        blyTimeGoods[name] = value;
        obj_state.blyTimeGoods = blyTimeGoods;
        this.setState(obj_state);
    };

    // 상품검색 클릭
    goodsSearchModalPopup = (e) => {
        this.setState({
            goodsSearchModal: true
        })
    };

    //상품 컴포넌트 관련 온체인지
    onInputBlyTimeGoodsChange = (e) => {
        let { name, value } = e.target;
        const blyTimeGoods = Object.assign([], this.state.blyTimeGoods);
        blyTimeGoods[name] = value;
        this.setState({
            blyTimeGoods
        });
    };

    onCancelClick = () => {
        // 기획전 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //기획전 등록 및 수정 처리
        const blyTimeGoods = Object.assign({}, this.state.blyTimeGoods);

        let return_chk = this.setValidatedObj(blyTimeGoods);
        if(!return_chk){
            return false;
        }

        let v_startDateTime = this.state.blyTimeStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.blyTimeStartHH;
        let v_startDateMM = this.state.blyTimeStartMM;

        let v_endDateTime = this.state.blyTimeEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');
        let v_endDateHH = this.state.blyTimeEndHH;
        let v_endDateMM = this.state.blyTimeEndMM;

        const startDate = moment(v_startDate + 'T' + v_startDateHH + ':' + v_startDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(v_endDate + 'T' + v_endDateHH + ':' + v_endDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');

        blyTimeGoods.blyTimeStart = startDate;
        blyTimeGoods.blyTimeEnd = endDate;
        blyTimeGoods.blyTime = true;
        blyTimeGoods.blyTimeReward = ComUtil.toNum(blyTimeGoods.blyTimeReward);
        blyTimeGoods.blyTimeFeeRate = ComUtil.toNum(blyTimeGoods.blyTimeFeeRate);

        let params = blyTimeGoods;

        //console.log("onConfirmClick",params);

        const { status, data } = await setBlyTimeSave(params);
        if(status !== 200){
            alert('블리타임 저장이 실패 하였습니다');
            return
        }
        if(status === 200){
            // 기획전 닫기 및 목록 재조회
            let params = {
                refresh:true
            };
            this.props.onClose(params);
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { blyTimeGoods } = this.state;

        const star = <span className='text-danger'>*</span>;


        return (
            <div className={Style.wrap}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                            설정된 기간에 블리타임이 APP에 노출되오니 정확하게 입력해 주세요.
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                        <div className="d-flex align-items-center">
                            <SingleDatePicker
                                placeholder="시작일"
                                date={this.state.blyTimeStart ? moment(this.state.blyTimeStart) : null}
                                onDateChange={this.onCalendarDatesChange.bind(this,'start')}
                                focused={this.state['blyTimeStartDateFocused']}
                                onFocusChange={({ focused }) => this.setState({ ['blyTimeStartDateFocused']:focused })}
                                id={"blyTimeStartDate"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                calendarInfoPosition="top"
                                enableOutsideDays
                                // daySize={45}
                                verticalHeight={700}
                                renderCalendarInfo={this.renderStartCalendarInfo.bind(this)}
                            />
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'blyTimeStartHH'}
                                    options={this.state.hourOptions}
                                    value={this.state.blyTimeStartHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.blyTimeStartHH) : '00'}
                                    onChange={this.onStartHHChange}
                                />
                            </div>
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'blyTimeStartMM'}
                                    options={this.state.minuteOptions}
                                    value={this.state.blyTimeStartMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.blyTimeStartMM) : '00'}
                                    onChange={this.onStartMMChange}
                                />
                            </div>
                            <div className="pl-1 pr-1"><span>~</span></div>
                            <SingleDatePicker
                                placeholder="종료일"
                                date={this.state.blyTimeEnd ? moment(this.state.blyTimeEnd) : null}
                                onDateChange={this.onCalendarDatesChange.bind(this,'end')}
                                focused={this.state['blyTimeEndDateFocused']}
                                onFocusChange={({ focused }) => this.setState({ ['blyTimeEndDateFocused']:focused })}
                                id={"blyTimeEndDate"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                calendarInfoPosition="top"
                                enableOutsideDays
                                // daySize={45}
                                verticalHeight={700}
                                renderCalendarInfo={this.renderEndCalendarInfo.bind(this)}
                            />
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'blyTimeEndHH'}
                                    options={this.state.hourOptions}
                                    value={this.state.blyTimeEndHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.blyTimeEndHH) : '00'}
                                    onChange={this.onEndHHChange}
                                />
                            </div>
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'blyTimeEndMM'}
                                    options={this.state.minuteOptions}
                                    value={this.state.blyTimeEndMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.blyTimeEndMM) : '00'}
                                    onChange={this.onEndMMChange}
                                />
                            </div>
                        </div>
                        <span className={'small text-secondary'}>
                            * 블리타임이 APP에 노출되는 기간을 선택해 주세요.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>블리타임 상품등록 {star}</Label>
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-1">

                                <div className="d-flex align-items-center mb-1" >
                                    <div className="input-group">
                                        <input type="text"
                                               name={'mdPickProducerNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={blyTimeGoods.producerNo||""}
                                               readOnly='readonly'
                                               placeholder={'생산자번호'}
                                               onChange={this.onInputBlyTimeGoodsChange} />
                                        <input type="text"
                                               name={'mdPickProducerFarmNm'}
                                               className="ml-1"
                                               style={{width:'200px'}}
                                               value={blyTimeGoods.producerFarmNm||""}
                                               readOnly='readonly'
                                               placeholder={'생산자명'}
                                               onChange={this.onInputBlyTimeGoodsChange} />
                                        <input type="text"
                                               name={'mdPickGoodsNm'}
                                               className="ml-1"
                                               style={{width:'300px'}}
                                               value={blyTimeGoods.goodsNm||""}
                                               readOnly='readonly'
                                               placeholder={'상품명'}
                                               onChange={this.onInputBlyTimeGoodsChange} />
                                        <input type="number"
                                               name={'mdPickGoodsNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={blyTimeGoods.goodsNo||""}
                                               readOnly='readonly'
                                               placeholder={'상품번호'}
                                               onChange={this.onInputBlyTimeGoodsChange} />
                                        <div>
                                            <Button color={'info'}
                                                    onClick={this.goodsSearchModalPopup}>
                                                <FontAwesomeIcon icon={faSearchPlus} /> 상품검색
                                            </Button>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>
                        {
                            (blyTimeGoods.goodsNo) && (
                                <div>
                                    <div className="mt-1">소비자가 : {ComUtil.addCommas(blyTimeGoods.consumerPrice)} 원</div>
                                    <div className="mt-1">판매가 : {ComUtil.addCommas(blyTimeGoods.currentPrice)} 원 ({ComUtil.addCommas(Math.round(blyTimeGoods.discountRate,0))}%)</div>
                                    <div className="mt-1">
                                        소비자 보상 : <input type="number"
                                                       name={'blyTimeReward'}
                                                       className="ml-1"
                                                       style={{width:'100px'}}
                                                       value={blyTimeGoods.blyTimeReward||""}
                                                       placeholder={'블리타임보상'}
                                                       onChange={this.onInputChange} /> %
                                    </div>
                                    <div className="mt-1">
                                        <span className="mr-5">
                                        수수료 : <input type="number"
                                                     name={'blyTimeFeeRate'}
                                                     className="ml-1"
                                                     style={{width:'100px'}}
                                                     value={blyTimeGoods.blyTimeFeeRate||""}
                                                     placeholder={'블리타임수수료(5% 이상 입력)'}
                                                     onChange={this.onInputChange} /> %
                                        </span>
                                        <span className="ml-4">
                                            정산가 : {blyTimeGoods.currentPrice * ((100 - blyTimeGoods.blyTimeFeeRate) / 100)}원
                                        </span>
                                    </div>
                                </div>
                            )
                        }

                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>
                        </div>
                    </div>

                </div>


                {/*상품검색 모달 */}
                <Modal size="lg" isOpen={this.state.goodsSearchModal}
                       toggle={this.goodsSearchModalToggle} >
                    <ModalHeader toggle={this.goodsSearchModalToggle}>
                        상품 검색
                    </ModalHeader>
                    <ModalBody>
                        <B2cGoodsSearch onChange={this.goodsSearchModalOnChange} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary"
                                onClick={this.goodsSearchModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </div>
        )
    }
}