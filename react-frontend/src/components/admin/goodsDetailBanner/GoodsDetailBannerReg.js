import React, {Component} from 'react'
import { Alert, Button, FormGroup, Label } from 'reactstrap'
import moment from 'moment-timezone'

import { BlocerySpinner, SingleImageUploader, FooterButtonLayer } from '~/components/common'

import { DateRangePicker } from 'react-dates';

import { setGoodsBannerSave, getGoodsBanner } from '~/lib/adminApi'

export default class GoodsDetailBannerReg extends Component {
    constructor(props){
        super(props);
        const { goodsBannerId } = this.props;
        this.state = {
            isDidMounted: false,
            focusedInput: null,

            goodsDetailBanner: {
                goodsBannerId:goodsBannerId,          // 상품상세 배너 ID
                goodsBannerTitle:"",                     // 상품상세 배너 공지 제목
                goodsBannerStartDate:'',                 // 상품상세 배너 시작일
                goodsBannerEndDate:'',                   // 상품상세 배너 종료일

                goodsBannerImages:[],	                // 상품상세 배너 이미지

                goodsBannerList: [],                // 상품상세 배너 상품
            },
        }
    }

    async componentDidMount() {
        if(this.state.goodsDetailBanner.goodsBannerId) {
            // 기획전 정보 조회
            let goodsDetailBanner = Object.assign({}, this.state.goodsDetailBanner);
            let goodsBannerId = this.state.goodsDetailBanner.goodsBannerId;
            const { status, data } = await getGoodsBanner(goodsBannerId);
            console.log("getGoodsBanner==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            data.goodsBannerId = goodsBannerId;
            // let mdPickTitle_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle);
            // let mdPickTitle1_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle1);
            // let mdPickTitle2_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle2);
            //console.log("data===",data)
            goodsDetailBanner = data;
            this.setState({
                // mdPickTitleLenCnt:mdPickTitle_TotalByte,
                // mdPickTitle1LenCnt:mdPickTitle1_TotalByte,
                // mdPickTitle2LenCnt:mdPickTitle2_TotalByte,
                goodsDetailBanner
            })
        }
        this.setState({isDidMounted:true})
    }

    onCancelClick = () => {
        // 상품공지배너 등록 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    }

    onConfirmClick = async () => {
        //상품공지배너 등록 및 수정 처리
        const goodsDetailBanner = Object.assign({}, this.state.goodsDetailBanner);

        this.setValidatedObj(goodsDetailBanner);

        let params = goodsDetailBanner;

        const { status, data } = await setGoodsBannerSave(params);
        if(status !== 200){
            alert('상품공지 배너 저장이 실패 하였습니다');
            return
        }
        if(status === 200){
            // 상품공지 배너 닫기 및 목록 재조회
            let params = {
                refresh:true
            };
            this.props.onClose(params);
        }
    }

    //밸리데이션 체크
    setValidatedObj = (goodsBanner) => {

        if(goodsBanner.goodsBannerTitle.length == 0) {
            alert("공지사항 제목은 필수 입니다.");
            return false;
        }
        if(!goodsBanner.goodsBannerStartDate) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!goodsBanner.goodsBannerEndDate) {
            alert("종료일은 필수 입니다.");
            return false;
        }
        if(goodsBanner.goodsBannerImages.length == 0) {
            alert("이미지는 필수 입니다.");
            return false;
        }

    };

    //글자 길이 (영문:1,한글:1)
    getLengthMaxChkCount = (message, maxlen) => {
        let totalByte = 0;
        for (let index = 0, length = message.length; index < length; index++) {
            let currentByte = message.charCodeAt(index);
            (currentByte > 128) ? totalByte += 1 : totalByte++;
        }
        return totalByte;
    };

    onInputChange = (e) => {
        let {name, value} = e.target;
        let goodsDetailBanner = Object.assign({}, this.state.goodsDetailBanner);

        let obj_state = {};
        goodsDetailBanner[name] = value;

        if(name == "goodsBannerTitle"){
            let totalByte = this.getLengthMaxChkCount(value);
            if(totalByte > 25){
                alert("최대 글자수가 25자를 넘었습니다.");
                return;
            }
            obj_state.goodsBannerTitleCnt = totalByte;
        }

        obj_state.goodsDetailBanner = goodsDetailBanner;
        this.setState(obj_state);
    }

    //기획전 기간 달력 문구 렌더러
    renderGoodsBannerCalendarInfo = () => <Alert className='m-1'>상품공지 배너 노출 시작일 ~ 종료일을 선택해 주세요</Alert>;

    onGoodsBannerImagesChange = (images) => {
        const goodsDetailBanner = Object.assign({}, this.state.goodsDetailBanner);
        goodsDetailBanner.goodsBannerImages = images;
        this.setState({goodsDetailBanner})
    }

    onGoodsBannerDatesChange = ({ startDate, endDate }) => {
        const goodsDetailBanner = Object.assign({}, this.state.goodsDetailBanner);
        goodsDetailBanner.goodsBannerStartDate = startDate && startDate.startOf('day');
        goodsDetailBanner.goodsBannerEndDate = endDate && endDate.endOf('day');
        this.setState({goodsDetailBanner})
    }

    render(){
        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { goodsDetailBanner } = this.state;

        const star = <span className='text-danger'>*</span>;
        const btnCancel = <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>;
        const btnSave = <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>;

        return(
            <div className='position-relative'>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            필수 항목 {star}을 모두 입력해야 등록이 가능합니다.<br/>
                            설정된 기간에 상품상세 배너공지가 APP에 노출되오니 정확하게 입력해 주세요.
                        </Alert>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            공지사항 제목 {star}
                        </Label>
                        <div>
                            <input
                                type="text"
                                name={"goodsBannerTitle"}
                                style={{width:'80%'}}
                                value={goodsDetailBanner.goodsBannerTitle}
                                onChange={this.onInputChange}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 제목은 APP에 노출되는 것은 아니며 관리를 위한 항목입니다.
                        </span>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>기간 {star}</Label>
                        <div>
                            <DateRangePicker
                                startDateId='my-goodsBannerStartDate'
                                endDateId='my-goodsBannerEndDate'
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={this.state.goodsDetailBanner.goodsBannerStartDate ? moment(this.state.goodsDetailBanner.goodsBannerStartDate) : null}
                                endDate={this.state.goodsDetailBanner.goodsBannerEndDate ? moment(this.state.goodsDetailBanner.goodsBannerEndDate) : null}
                                onDatesChange={this.onGoodsBannerDatesChange}
                                focusedInput={this.state.focusedInput}
                                onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
                                numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                orientation={'horizontal'}
                                openDirection="up"
                                withPortal
                                small
                                readOnly
                                showClearDates
                                calendarInfoPositio="top"
                                renderCalendarInfo={this.renderGoodsBannerCalendarInfo}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 상품상세 공지배너가 APP에 노출되는 기간을 선택해 주세요.
                        </span>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>이미지 {star}</Label>
                        <div>
                            <SingleImageUploader
                                images={ goodsDetailBanner.goodsBannerImages}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={this.onGoodsBannerImagesChange}
                                isNoResizing={true}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 실제 노출될 공지사항 이미지를 등록해 주세요.
                        </span>
                    </FormGroup>

                    <FooterButtonLayer data={[
                        btnCancel,
                        btnSave,
                    ]} />

                </div>

            </div>
        )
    }
}