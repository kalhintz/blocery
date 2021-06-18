import React, { Component, PropTypes } from 'react'
import { FormGroup, Label, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import {FaSearchPlus} from 'react-icons/fa'
import { BlocerySpinner, B2cGoodsSelSearch } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getTimeSaleAdmin, setSuperRewardRegist, setSuperRewardUpdate } from '~/lib/adminApi'
import Style from './B2cSuperRewardReg.module.scss'
import {Div, Flex, Span, Input} from '~/styledComponents/shared'

const mb = 10

export default class B2cSuperRewardReg extends Component {
    constructor(props) {
        super(props);

        const { superRewardGoodsNo } = this.props;

        this.state = {
            isReg:superRewardGoodsNo != null ? false:true,
            isDidMounted:false,
            focusedInput: null,

            superRewardStartFocusedInput: null, superRewardEndFocusedInput: null,
            superRewardStart:"", superRewardStartHH:"00", superRewardStartMM:"00",
            superRewardEnd:"", superRewardEndHH:"00", superRewardEndMM:"00",

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

            superRewardGoods: {
                goodsNo:superRewardGoodsNo,    // 수퍼타임 상품 번호

                superRewardStart:null,         // 수퍼타임 시작일(일자T시:분)
                superRewardEnd:null,           // 수퍼타임 종료일(일자T시:분)

                producerNo:null,            // 생산자번호
                producerFarmNm:"",          // 생산자명
                goodsNm:"",                 // 상품명
                consumerPrice:0,            // 소비자가
                currentPrice:0,             // 판매가
                discountRate:0,             // 할인율

                superRewardReward:70,       // 소비자 보상비율(70% default)
                superRewardFeeRate:5,       // 수퍼리워드 수수료 최소 5%

                superRewardTotalCount:0,     // 고정값 (통상 슈퍼리워드는 +5 개 정도 여유를 두기로 함)
                superRewardBackupCount:0     // 202104추가. 17시 종료시 재고수량 더하기.
            },

            goodsSearchModal:false,
            currentGoodsIdx:null,
        };
    }

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    goodsSearchModalOnChange = (obj) => {

        // const superRewardGoods = Object.assign({}, obj)
        //
        //
        // if (!superRewardGoods.superRewardReward)
        //     superRewardGoods.superRewardReward = 70
        //
        // // obj.superRewardFeeRate = obj;
        //
        // this.setState({
        //     superRewardGoods: obj
        // });


        const superRewardGoods = Object.assign([], this.state.superRewardGoods);

        superRewardGoods.producerNo = obj.producerNo;
        superRewardGoods.producerFarmNm = obj.producerFarmNm;
        superRewardGoods.goodsNo = obj.goodsNo;
        superRewardGoods.goodsNm = obj.goodsNm;

        superRewardGoods.consumerPrice = obj.consumerPrice;
        superRewardGoods.currentPrice = obj.currentPrice;
        superRewardGoods.discountRate = obj.discountRate;
        superRewardGoods.superRewardFeeRate = obj.feeRate;
        superRewardGoods.superRewardReward = obj.superRewardReward||70;

        superRewardGoods.remainedCnt = obj.remainedCnt

        console.log({superRewardGoods})

        this.setState({
            superRewardGoods
        });

        this.goodsSearchModalToggle();
    };

    goodsSearchModalToggle = () => {
        this.setState(prevState => ({
            goodsSearchModal: !prevState.goodsSearchModal
        }));
    };

    //밸리데이션 체크
    setValidatedObj = (superRewardGoods) => {

        let v_startDateTime = this.state.superRewardStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.superRewardStartHH;
        let v_startDateMM = this.state.superRewardStartMM;

        let v_endDateTime = this.state.superRewardEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');    // 수퍼타임은 자정에 종료
        let v_endDateHH = this.state.superRewardEndHH;
        let v_endDateMM = this.state.superRewardEndMM;

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

        if(!superRewardGoods.goodsNo) {
            alert("상품등록은 필수 입니다.");
            return false;
        }

        if(!superRewardGoods.superRewardReward) {
            alert("슈퍼리워드 보상율은 필수 입니다.");
            return false;
        }

        if(ComUtil.toNum(superRewardGoods.superRewardFeeRate) <= 0 || ComUtil.toNum(superRewardGoods.superRewardFeeRate) < 5) {
            alert("슈퍼리워드 수수료는 필수 입니다.(최소 5% 이상)");
            return false;
        }

        if(!superRewardGoods.superRewardTotalCount) {
            alert("슈퍼리워드 수량은 필수 입니다.");
            return false;
        }


        return true;

    };

    componentDidMount = async () => {

        if(this.state.superRewardGoods.goodsNo){
            // 블리타임 정보 조회
            let superRewardGoods = Object.assign({}, this.state.superRewardGoods);
            let goodsNo = superRewardGoods.goodsNo;
            const { status, data } = await getTimeSaleAdmin(goodsNo);
            console.log("getTimeSaleAdmin==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            superRewardGoods.producerNo = data.producerNo;
            superRewardGoods.producerFarmNm = data.producerFarmNm;
            superRewardGoods.goodsNo = data.goodsNo;
            superRewardGoods.goodsNm = data.goodsNm;

            superRewardGoods.consumerPrice = data.consumerPrice;
            superRewardGoods.currentPrice = data.defaultCurrentPrice;
            superRewardGoods.discountRate = data.defaultDiscountRate;
            superRewardGoods.superRewardReward = data.superRewardReward;
            //superRewardGoods.superRewardDiscountRate = data.superRewardDiscountRate;
            superRewardGoods.superRewardFeeRate = data.superRewardFeeRate;
            superRewardGoods.remainedCnt = data.remainedCnt;
            superRewardGoods.superRewardTotalCount = data.superRewardTotalCount;
            superRewardGoods.superRewardBackupCount = data.superRewardBackupCount;

            let v_startDateTime =  moment(data.superRewardStart);
            let v_endDateTime = moment(data.superRewardEnd);
            let v_startDate = moment(v_startDateTime).format('YYYY-MM-DD');
            let v_startDateHH = moment(v_startDateTime).format('HH');
            let v_startDatemm = moment(v_startDateTime).format('mm');
            let v_endDate = moment(v_endDateTime).format('YYYY-MM-DD');
            let v_endDateHH = moment(v_endDateTime).format('HH');
            let v_endDatemm = moment(v_endDateTime).format('mm');

            this.setState({
                superRewardStart:v_startDate, superRewardStartHH:v_startDateHH, superRewardStartMM:v_startDatemm,
                superRewardEnd:v_endDate, superRewardEndHH:v_endDateHH, superRewardEndMM:v_endDatemm,
                superRewardGoods
            });

        }else{

            let v_startDate = moment().format('YYYY-MM-DD');
            let v_endDate = moment(v_startDate).add("days", 1).format('YYYY-MM-DD');
            this.setState({
                superRewardStart: v_startDate, superRewardEnd: v_endDate
            });
            //
            // let nowDay =  moment().day(); //0:일요일 〜 6:토요일
            // if(nowDay < 2) {
            //     //이번주 화요일 오전10시 일자 구하기
            //     let nowDate = moment().day(2).hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
            //     let v_startDate = moment(nowDate).format('YYYY-MM-DD');
            //     let v_endDate = moment(v_startDate).add("days", 1).format('YYYY-MM-DD');
            //     this.setState({
            //         superRewardStart: v_startDate, superRewardEnd: v_endDate
            //     });
            // }else{
            //     //다음주 화요일 오전10시 일자 구하기
            //     let next_thurs = moment().weekday(7+2);
            //     let nowDate = next_thurs.hours(10).minutes(0).seconds(0).milliseconds(0).toDate();
            //     let v_startDate = moment(nowDate).format('YYYY-MM-DD');
            //     let v_endDate = moment(v_startDate).add("days", 1).format('YYYY-MM-DD');
            //     this.setState({
            //         superRewardStart: v_startDate, superRewardEnd: v_endDate
            //     });
            // }
        }

        this.setState({isDidMounted:true})

    };

    // 수퍼리워 시작일자 달력
    renderStartCalendarInfo = (stepNo) => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    // 수퍼리워드 종료일자 달력
    renderEndCalendarInfo = (stepNo) => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;

    // 수퍼리워드 일자 달력
    onCalendarDatesChange = (gubun, date) => {
        let v_gubun = gubun;
        let v_date = date.endOf('day');
        if(gubun == "start"){
            // let v_startDate = moment(v_date);
            // let v_endDate = moment(v_startDate).add("days", 1);
            // this.setState({
            //     superRewardStart: v_startDate, superRewardEnd: v_endDate
            // });
            this.setState({
                superRewardStart:v_date
            });
        }
        if(gubun == "end"){
            this.setState({
                superRewardEnd:v_date
            });
        }
    }

    onStartHHChange = (data) => {
        let v_StartHH = data.value;
        this.setState({
            superRewardStartHH:v_StartHH
        });
    }
    onStartMMChange = (data) => {
        let v_StartMM = data.value;
        this.setState({
            superRewardStartMM:v_StartMM
        });
    }
    onEndHHChange = (data) => {
        let v_EndHH = data.value;
        this.setState({
            superRewardEndHH:v_EndHH
        });
    }
    onEndMMChange = (data) => {
        let v_EndMM = data.value;
        this.setState({
            superRewardEndMM:v_EndMM
        });
    }

    onInputChange = ({target}) => {
        const {name, value} = target

        const goods = this.state.superRewardGoods
        goods[name] = value

        this.setState({
            superRewardGoods: goods
        });
    }

    //인풋박스
    onInputChange_bak = (e) => {
        let {name, value} = e.target;

        if(name === 'superRewardReward' || name === 'superRewardFeeRate' || name === 'superRewardTotalCount') {
            if(value <= 0) {
                alert('해당 값은 0보다 커야합니다.');
                return;
            }
        }
        //console.log('name : ', name, ', value : ', value);

        let superRewardGoods = Object.assign({}, this.state.superRewardGoods);

        let obj_state = {};
        superRewardGoods[name] = value;
        obj_state.superRewardGoods = superRewardGoods;
        this.setState(obj_state);
    };

    // 상품검색 클릭
    goodsSearchModalPopup = (e) => {
        this.setState({
            goodsSearchModal: true
        })
    };

    //상품 컴포넌트 관련 온체인지
    onInputSuperRewardGoodsChange = (e) => {
        let { name, value } = e.target;
        const superRewardGoods = Object.assign([], this.state.superRewardGoods);
        superRewardGoods[name] = value;
        this.setState({
            superRewardGoods
        });
    };

    onCancelClick = () => {
        // 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //등록 및 수정 처리
        const superRewardGoods = Object.assign({}, this.state.superRewardGoods);

        let return_chk = this.setValidatedObj(superRewardGoods);
        if(!return_chk){
            return false;
        }

        let v_startDateTime = this.state.superRewardStart;
        let v_startDate = moment(v_startDateTime).startOf('day').format('YYYY-MM-DD');
        let v_startDateHH = this.state.superRewardStartHH;
        let v_startDateMM = this.state.superRewardStartMM;

        let v_endDateTime = this.state.superRewardEnd;
        let v_endDate = moment(v_endDateTime).endOf('day').format('YYYY-MM-DD');
        let v_endDateHH = this.state.superRewardEndHH;
        let v_endDateMM = this.state.superRewardEndMM;

        const startDate = moment(v_startDate + 'T' + v_startDateHH + ':' + v_startDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');
        const endDate = moment(v_endDate + 'T' + v_endDateHH + ':' + v_endDateMM+':00').format('YYYY-MM-DDTHH:mm:ss');

        superRewardGoods.superRewardStart = startDate;
        superRewardGoods.superRewardEnd = endDate;
        superRewardGoods.superReward = true;
        superRewardGoods.superRewardReward = ComUtil.toNum(superRewardGoods.superRewardReward);
        superRewardGoods.superRewardFeeRate = ComUtil.toNum(superRewardGoods.superRewardFeeRate);
        superRewardGoods.superRewardTotalCount = ComUtil.toNum(superRewardGoods.superRewardTotalCount);
        superRewardGoods.superRewardBackupCount = ComUtil.toNum(superRewardGoods.superRewardBackupCount);

        let params = superRewardGoods;

        //console.log("onConfirmClick",params);

        console.log({save: params})

        if(this.state.isReg == true){
            const { status, data } = await setSuperRewardRegist(params);
            if(status !== 200){
                alert('슈퍼리워드 저장이 실패 하였습니다');
                return
            }
            if(status === 200){
                // 닫기 및 목록 재조회
                let params = {
                    refresh:true
                };
                this.props.onClose(params);
            }
        }else{
            const { status, data } = await setSuperRewardUpdate(params);
            if(status !== 200){
                alert('슈퍼리워드 저장이 실패 하였습니다');
                return
            }
            if(status === 200){
                // 닫기 및 목록 재조회
                let params = {
                    refresh:true
                };
                this.props.onClose(params);
            }
        }
    };

    render() {

        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { superRewardGoods } = this.state;

        const star = <span className='text-danger'>*</span>;


        return (
            <div className={Style.wrap}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                            설정된 기간에 슈퍼리워드가 APP에 노출되오니 정확하게 입력해 주세요.
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                        <div className="d-flex align-items-center">
                            <SingleDatePicker
                                placeholder="시작일"
                                date={this.state.superRewardStart ? moment(this.state.superRewardStart) : null}
                                onDateChange={this.onCalendarDatesChange.bind(this,'start')}
                                focused={this.state['superRewardStartDateFocused']}
                                onFocusChange={({ focused }) => this.setState({ ['superRewardStartDateFocused']:focused })}
                                id={"superRewardStartDate"}
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
                                    name={'superRewardStartHH'}
                                    options={this.state.hourOptions}
                                    value={this.state.superRewardStartHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.superRewardStartHH) : '00'}
                                    onChange={this.onStartHHChange}
                                    //isDisabled={true}
                                />
                            </div>
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'superRewardStartMM'}
                                    options={this.state.minuteOptions}
                                    value={this.state.superRewardStartMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.superRewardStartMM) : '00'}
                                    onChange={this.onStartMMChange}
                                    //isDisabled={true}
                                />
                            </div>
                            <div className="pl-1 pr-1"><span>~</span></div>
                            <SingleDatePicker
                                placeholder="종료일"
                                date={this.state.superRewardEnd ? moment(this.state.superRewardEnd) : null}
                                onDateChange={this.onCalendarDatesChange.bind(this,'end')}
                                focused={this.state['superRewardEndDateFocused']}
                                onFocusChange={({ focused }) => this.setState({ ['superRewardEndDateFocused']:focused })}
                                id={"superRewardEndDate"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                //disabled={true}
                                calendarInfoPosition="top"
                                enableOutsideDays
                                // daySize={45}
                                verticalHeight={700}
                                renderCalendarInfo={this.renderEndCalendarInfo.bind(this)}
                            />
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'superRewardEndHH'}
                                    options={this.state.hourOptions}
                                    value={this.state.superRewardEndHH ? this.state.hourOptions.find(itemHH => itemHH.value === this.state.superRewardEndHH) : '00'}
                                    onChange={this.onEndHHChange}
                                    //isDisabled={true}
                                />
                            </div>
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'superRewardEndMM'}
                                    options={this.state.minuteOptions}
                                    value={this.state.superRewardEndMM ? this.state.minuteOptions.find(itemMM => itemMM.value === this.state.superRewardEndMM) : '00'}
                                    onChange={this.onEndMMChange}
                                    //isDisabled={true}
                                />
                            </div>
                        </div>
                        <span className={'small text-secondary'}>
                            * 슈퍼리워드가 APP에 노출되는 기간을 선택해 주세요.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>슈퍼리워드 상품등록 {star}</Label>
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-1">

                                <div className="d-flex align-items-center mb-1" >
                                    <div className="input-group">
                                        <input type="text"
                                               name={'mdPickProducerNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={superRewardGoods.producerNo||""}
                                               readOnly='readonly'
                                               placeholder={'생산자번호'}
                                               onChange={this.onInputSuperRewardGoodsChange} />
                                        <input type="text"
                                               name={'mdPickProducerFarmNm'}
                                               className="ml-1"
                                               style={{width:'200px'}}
                                               value={superRewardGoods.producerFarmNm||""}
                                               readOnly='readonly'
                                               placeholder={'생산자명'}
                                               onChange={this.onInputSuperRewardGoodsChange} />
                                        <input type="text"
                                               name={'mdPickGoodsNm'}
                                               className="ml-1"
                                               style={{width:'300px'}}
                                               value={superRewardGoods.goodsNm||""}
                                               readOnly='readonly'
                                               placeholder={'상품명'}
                                               onChange={this.onInputSuperRewardGoodsChange} />
                                        <input type="number"
                                               name={'mdPickGoodsNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={superRewardGoods.goodsNo||""}
                                               readOnly='readonly'
                                               placeholder={'상품번호'}
                                               onChange={this.onInputSuperRewardGoodsChange} />
                                        <div>
                                            <Button color={'info'}
                                                    onClick={this.goodsSearchModalPopup}>
                                                <FaSearchPlus /> 상품검색
                                            </Button>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>


                        {
                            (superRewardGoods.goodsNo) && (
                                <Div p={16} bc={'light'}>
                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>소비자가</Div>
                                        <Div>
                                            {ComUtil.addCommas(superRewardGoods.consumerPrice)} 원
                                        </Div>
                                    </Flex>
                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>판매가</Div>
                                        <Div>
                                            {ComUtil.addCommas(superRewardGoods.currentPrice)} 원 ({ComUtil.addCommas(Math.round(superRewardGoods.discountRate,0))}%)
                                        </Div>
                                    </Flex>

                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>소비자 Bly 보상</Div>
                                        <Div>
                                            <Input type="number"
                                                   name={'superRewardReward'}
                                                   underLine
                                                   value={superRewardGoods.superRewardReward||""}
                                                   placeholder={'소비자 Bly 보상'}
                                                   onChange={this.onInputChange} /> %
                                        </Div>
                                    </Flex>

                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>수수료</Div>
                                        <Div>
                                            <Input type="number"
                                                   name={'superRewardFeeRate'}
                                                   value={superRewardGoods.superRewardFeeRate||""}
                                                   placeholder={'수수료(5% 이상 입력)'}
                                                   underLine
                                                   onChange={this.onInputChange}
                                                   readOnly={true}
                                                   disabled={true}
                                            /> %
                                        </Div>
                                    </Flex>
                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>정산가</Div>
                                        <Div>
                                            {ComUtil.addCommas(superRewardGoods.currentPrice * ((100 - superRewardGoods.superRewardFeeRate) / 100))}원
                                        </Div>
                                    </Flex>
                                    <Flex>
                                        <Div width={150} mr={20}>번호표 수량</Div>
                                        <Div>
                                            <Span mr={10}>현 재고수량 <Span fg={'danger'} bold>{superRewardGoods.remainedCnt}</Span>개 </Span>
                                            <Span><Input name={'superRewardTotalCount'} underLine value={superRewardGoods.superRewardTotalCount}
                                                         onChange={this.onInputChange}
                                                         placeholder={'현 재고수량과 같이 입력 추천'}
                                            />개 적용</Span>
                                        </Div>
                                    </Flex>

                                    <Flex mb={mb}>
                                        <Div width={150} mr={20}>종료 후 재고추가수량</Div>
                                        <Div>
                                            <Input type="number"
                                                   name={'superRewardBackupCount'}
                                                   underLine
                                                   value={superRewardGoods.superRewardBackupCount||"0"}
                                                   placeholder={'재고추가'}
                                                   onChange={this.onInputChange} /> 개 (17시 종료되는 상품에 한해, 자동으로 재고수량이 늘어남)
                                        </Div>
                                    </Flex>
                                </Div>
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
                        <B2cGoodsSelSearch onChange={this.goodsSearchModalOnChange} />
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