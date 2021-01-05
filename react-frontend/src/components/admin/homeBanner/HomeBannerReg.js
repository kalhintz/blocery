import React, {Component} from 'react'
import { Alert, Button, FormGroup, Label } from 'reactstrap'
import moment from 'moment-timezone'

import { BlocerySpinner, SingleImageUploader, FooterButtonLayer } from '~/components/common'

import { DateRangePicker } from 'react-dates';

import { setHomeBannerSave, getHomeBanner } from '~/lib/adminApi'

export default class HomeBannerReg extends Component {
    constructor(props){
        super(props);
        const { homeBannerId } = this.props;
        this.state = {
            isDidMounted: false,
            focusedInput: null,

            homeBanner: {
                homeBannerId:homeBannerId,          // 상품상세 배너 ID
                homeBannerTitle:"",                     // 상품상세 배너 공지 제목
                homeBannerStartDate:'',                 // 상품상세 배너 시작일
                homeBannerEndDate:'',                   // 상품상세 배너 종료일

                homeBannerImages:[],	                // 상품상세 배너 이미지
                url: '',                            // 선택시 이동할 url(필수아님)

                homeBannerList: [],                // 상품상세 배너 상품
            },
        }
    }

    async componentDidMount() {
        if(this.state.homeBanner.homeBannerId) {
            // 기획전 정보 조회
            let homeBanner = Object.assign({}, this.state.homeBanner);
            let homeBannerId = this.state.homeBanner.homeBannerId;
            const { status, data } = await getHomeBanner(homeBannerId);
            console.log("getHomeBanner==",data);
            if(status !== 200){
                alert('응답이 실패 하였습니다');
                return
            }

            data.homeBannerId = homeBannerId;
            // let mdPickTitle_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle);
            // let mdPickTitle1_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle1);
            // let mdPickTitle2_TotalByte = this.getLengthMaxChkCount(data.mdPickTitle2);
            //console.log("data===",data)
            homeBanner = data;
            this.setState({
                // mdPickTitleLenCnt:mdPickTitle_TotalByte,
                // mdPickTitle1LenCnt:mdPickTitle1_TotalByte,
                // mdPickTitle2LenCnt:mdPickTitle2_TotalByte,
                homeBanner
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
        const homeBanner = Object.assign({}, this.state.homeBanner);

        this.setValidatedObj(homeBanner);

        let params = homeBanner;

        const { status, data } = await setHomeBannerSave(params);
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
    setValidatedObj = (homeBanner) => {

        if(homeBanner.homeBannerTitle.length == 0) {
            alert("공지사항 제목은 필수 입니다.");
            return false;
        }
        if(!homeBanner.homeBannerStartDate) {
            alert("시작일은 필수 입니다.");
            return false;
        }
        if(!homeBanner.homeBannerEndDate) {
            alert("종료일은 필수 입니다.");
            return false;
        }
        if(homeBanner.homeBannerImages.length == 0) {
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
        let homeBanner = Object.assign({}, this.state.homeBanner);

        let obj_state = {};
        homeBanner[name] = value;

        if(name == "homeBannerTitle"){
            let totalByte = this.getLengthMaxChkCount(value);
            if(totalByte > 25){
                alert("최대 글자수가 25자를 넘었습니다.");
                return;
            }
            obj_state.homeBannerTitleCnt = totalByte;
        }

        obj_state.homeBanner = homeBanner;
        this.setState(obj_state);
    }

    //기획전 기간 달력 문구 렌더러
    renderHomeBannerCalendarInfo = () => <Alert className='m-1'>상품공지 배너 노출 시작일 ~ 종료일을 선택해 주세요</Alert>;

    onHomeBannerImagesChange = (images) => {
        const homeBanner = Object.assign({}, this.state.homeBanner);
        homeBanner.homeBannerImages = images;
        this.setState({homeBanner})
    }

    onHomeBannerDatesChange = ({ startDate, endDate }) => {
        const homeBanner = Object.assign({}, this.state.homeBanner);
        homeBanner.homeBannerStartDate = startDate && startDate.startOf('day');
        homeBanner.homeBannerEndDate = endDate && endDate.endOf('day');
        this.setState({homeBanner})
    }

    render(){
        if(!this.state.isDidMounted) return <BlocerySpinner/>;

        const { homeBanner } = this.state;

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
                                name={"homeBannerTitle"}
                                style={{width:'80%'}}
                                value={homeBanner.homeBannerTitle}
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
                                startDateId='my-homeBannerStartDate'
                                endDateId='my-homeBannerEndDate'
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={this.state.homeBanner.homeBannerStartDate ? moment(this.state.homeBanner.homeBannerStartDate) : null}
                                endDate={this.state.homeBanner.homeBannerEndDate ? moment(this.state.homeBanner.homeBannerEndDate) : null}
                                onDatesChange={this.onHomeBannerDatesChange}
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
                                renderCalendarInfo={this.renderHomeBannerCalendarInfo}
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
                                images={ homeBanner.homeBannerImages}
                                defaultCount={1}
                                isShownMainText={false}
                                onChange={this.onHomeBannerImagesChange}
                                isNoResizing={true}
                            />
                        </div>
                        <span className={'small text-secondary'}>
                            * 실제 노출될 공지사항 이미지를 등록해 주세요.
                        </span>
                    </FormGroup>
                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>
                            배너 선택 시 링크
                        </Label>
                        <div>
                            <input
                                type="text"
                                name={"url"}
                                style={{width:'80%'}}
                                value={homeBanner.url}
                                onChange={this.onInputChange}
                                placeholder={'/url 입력'}
                            />
                        </div>
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