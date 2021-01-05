import moment from 'moment-timezone'
import momentDurationFormatSetup from 'moment-duration-format'
import Compressor from 'compressorjs'
import queryString from 'query-string'
import MobileDetect from 'mobile-detect'
import cloneDeep from "lodash/cloneDeep"; //lodash 전체 라이브러리를 가져오던 초기 호출 방식을 변경 필요한 메서드만 가져옴
import { Server } from '~/components/Properties'
import axios from 'axios'

export default class ComUtil {

    /*******************************************************
     이유: Object.assign()에게도 한가지 문제점이 있는데요.
          복사하려는 객체의 내부에 존재하는 객체는 완전한 복사가 이루어지지않는다는 점
     # Object 객체 복사 (lodash.cloneDeep 이용) :: Deep Clone
     ex) let 복사할 변수 =  ComUtil.objectAssign(복사할 오브젝트);
     *******************************************************/
    static objectAssign(obj){
        return cloneDeep(obj);
    }

    /*******************************************************
     두날짜 비교해서, 같은지 작은지 큰지 return
     @Param : sDate 일자(yyyy-mm-dd) : String
     @Return :
     -1: sDate1 < sDate2
     0 : sDate1 == sDate2
     1 : sDate1 > sDate2
     *******************************************************/
    static compareDate(sDate1, sDate2) {

        let date1 = this.getDate(sDate1);
        let date2 = this.getDate(sDate2);

        let dt1 = ((date1.getTime()/3600000)/24);
        let dt2 = ((date2.getTime()/3600000)/24);

        if (dt1 === dt2) return 0;
        if (dt1 < dt2) return -1;
        else return 1;
    }

    static getDate(strDate){
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        return new Date(pYear, pMonth, pDay);
    }

    static yyyymmdd2DateStr(yyyymmdd) {
        let pYear 	= yyyymmdd.substr(0,4);
        let pMonth 	= yyyymmdd.substr(4,2);
        let pDay 	= yyyymmdd.substr(6,2);
        return pYear + '-'  + pMonth + '-' + pDay;
    }
    /*******************************************************
     날짜 연산 함수 - 날짜 더하기 빼기
     예) addDate('2019-01-05', 5) =>  returns 2019-01-10
        addDate('2019-01-06', -5) =>  returns 2019-01-01
     */
    static addDate(strDate, date) {
        let inputDate = this.getDate(strDate);

        inputDate.setDate( inputDate.getDate() + date);

        let returnDate = inputDate.getFullYear() + '-' + this.zeroPad(inputDate.getMonth() + 1) + '-' + this.zeroPad(inputDate.getDate())

        //console.log(returnDate);
        return returnDate;

    }

    /*******************************************************
     INT 날짜타입 => String 변환
     @Param : intDate, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static intToDateMoment(intDate) {

        let strDate = intDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        const vDate = new Date(pYear, pMonth, pDay);

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess());
    }

    /*******************************************************
     INT 날짜타입 => String 변환
     @Param : intDate, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static intToDateString(intDate, formatter) {

        let strDate = intDate.toString();
        let dateTo = strDate.replace(/\-/g,'').replace(/\./g,'').replace(/\//g,'');

        let pYear 	= dateTo.substr(0,4);
        let pMonth 	= dateTo.substr(4,2) - 1;
        let pDay 	= dateTo.substr(6,2);

        const vDate = new Date(pYear, pMonth, pDay);

        const format = formatter ? formatter : "YYYY-MM-DD";

        const utcDate = moment(vDate);
        return utcDate.tz(moment.tz.guess()).format(format);
    }

    /*******************************************************
     UTC 날짜타입 => String 변환
     @Param : utcTime, formatter
     @Return : yyyy-MM-dd (formatter 형식에 맞게 반환)
     *******************************************************/
    static utcToString(utcTime, formatter) {

        if (!utcTime)
            return null

        const format = formatter ? formatter : "YYYY-MM-DD";

        const utcDate = moment(utcTime);
        return utcDate.tz(moment.tz.guess()).format(format)
    }

    /*******************************************************
     UTC 날짜타입 => number로 변환 [비교 및 sorting용도]
     @Param : utcTime, formatter
     @Return : (long-type) seconds.
     ******************************************************/
    static utcToTimestamp(utcTime) {

        const utcDate = moment(utcTime);
        //console.log('utcToTimestamp:', utcTime, utcDate.unix());
        return utcDate.unix();
    }

    /*******************************************************
     날짜 및 시간-10보다 작은 숫자 호출시 앞에 0 format
     @Param : number
     @Return : number
     *******************************************************/
    static zeroPad(number) {
        if (number < 10) return '0' + number;
        else return number;
    }

    /**
     * 현재시간을 UTCTime으로 가져오기
     */
    static getNow() {
        return new Date().getTime();
    }

    /*******************************************************
     날짜 포맷 세팅
     @Param : time
     @Return : yyyy-MM-ddThh:mm:00(년-월-일T시간:분:초)
     *******************************************************/
    static setDate(time) {
        let date = new Date();
        //return date.getFullYear() + '-' + this.zeroPad(date.getMonth() + 1) + '-' + this.zeroPad(date.getDate()) + 'T' + time + ":00";
        const localDate = date.getFullYear() + '-' + this.zeroPad(date.getMonth() + 1) + '-' + this.zeroPad(date.getDate()) + 'T' + time + ":00";

        return moment.tz(localDate, moment.tz.guess()).format()
    }

    /*******************************************************
     숫자 및 문자(숫자)에 comma 추가
     [잘못된 값 이외엔 항상 0 이상을 반환 하는 함수]
     @Param : 1234567
     @Return : 1,234,567
     *******************************************************/
    static addCommas(value) {
        //숫자로 변환 불가능한 잘못된 값일 경우 null로 리턴 하도록 함
        if((typeof value !== 'number' && !value) || isNaN(value)){
            return null;
        }
        return ComUtil.toNum(value).toLocaleString(undefined, {maximumFractionDigits : 20})
    }
    /*******************************************************
     string, number 판별 후 숫자가 아닌 잘못 된 값이면 0, 올바른 값이면 숫자변환
     [계산시 에러가 나지 않도록 항상 숫자로만 리턴하는 함수]
     @ex :
        가나abc304100마바사 => 304100
        '6,700' => 6700
        undefined => 0
        'undefined' => 0
        null => 0
     @Param : number or string(숫자)
     @Return : number
     *******************************************************/
    static toNum(value, isParsingNumber = true) {
        try{
            let removedValue = value.toString().replace(/\,/g,'')     //콤마제거
            removedValue = removedValue.replace(/\s/gi, '');			//공백제거
            //계산 가능한 숫자인지 판별
            if(isNaN(removedValue) || removedValue === '')
                return 0
            else {
                if (isParsingNumber)
                    return parseFloat(removedValue)
                else
                    return removedValue
            }
        }catch(e){
            return 0
        }
    }

    /*******************************************************
     금액 형식으로 리턴
     [값이 0 보다 작으면 '' 반환]
     @Param : 304100
     @Return :304,100
     *******************************************************/
    static toCurrency(value) {
        const number = ComUtil.toNum(value)
        if(number >= 0)
            return ComUtil.addCommas(number)
        else {
            return ''
        }
    }
    /*******************************************************
     시간에 분 추가
     @Param : dt, minutes
     @Return :
     *******************************************************/
    static addMinutes(dt, minutes) {
        return new Date(dt.getTime() + minutes*60000)
    }

    /*******************************************************
     이미지 파일을 받아 압축율을 적용 (안씀 버그있음)
     @Param : { file, opacity }
     @Return : file
     *******************************************************/
    static imageCompressor({file, quality, callback}) {
        return new Compressor(file, {
            quality: !quality && 0.6,       //압축률
            success(result) {
                const formData = new FormData();
                formData.append('file', result, result.name);
                callback(formData)
            },
            error(err) {
                console.log(err.message);
            },
        }).file;
    }

    /*******************************************************
     이미지 압축
     @Param : file, quality(압축률[0.6 추천])
     @Return : file
     *******************************************************/
    static getCompressoredFile = (file, quality = 0.6) => {
        return new Promise((resolve, reject) => {
            new Compressor(file, {
                quality: quality,
                success: async (result) => {
                    resolve(result)
                },
                error(err) {
                    console.log(err.message);
                    reject(err)
                },
            });
        })
    }

    /*******************************************************
     배송시작일 표시용 날짜 포맷
     @Param : yyyy-MM-dd(date)
     @Return : MM/dd(요일)
     *******************************************************/
    static simpleDate(date) {
        var week = ['일', '월', '화', '수', '목', '금', '토'];
        var dayOfWeek = week[new Date(date).getDay()];
        return date.substring(5,7) + '/' + date.substring(8,10) + '(' + dayOfWeek + ')';
    }

    /*******************************************************
     밸리데이션용 함수(밸리데이션 체크에 걸렸을 경우 alert()을 띄워주며 걸린 키와 함께 결과값을 반환 합니다)
     @Param : 검증할 object, 밸리데이션 체크 해야할 키 Array(key, msg)
     @Return : {result: true or false, inavlidKey: '밸리데이션 체크에 걸린 키'}
     @Usage :

        const data = {name:'jaden', age: null, cell: '010-6679-0080'};

        const validArr = [
                 {key: 'name', msg: '성명'},
                 {key: 'age', msg: '나이'}
             ]

        validate(data, validArr)
     *******************************************************/
    static validate(data, validationArr) {

        let invalidKey;
        let result = true;

        for (let i = 0; i < validationArr.length; i++) {
            const vObj = validationArr[i];
            const key = vObj.key;

            //console.log(key in data);

            if (key in data === false) {
                console.log(`${key} 는 data 필드에 에 없습니다.`);
                invalidKey = key;
                result = false;
                break;
            }

            const value = data[key];

            if (!value) {
                alert(vObj.msg + '를 입력해 주세요');
                invalidKey = key;
                result = false;
                break;
            }

            let type = typeof value;

            if (type === 'string') {
                if (value.length <= 0) {
                    alert(vObj.msg + '를 입력해 주세요')
                    invalidKey = key;
                    result = false;
                    break;
                }
            }
            else if (type === 'number') {
                if (value <= 0) {
                    alert(vObj.msg + '를 입력해 주세요')
                    invalidKey = key;
                    result = false;
                    break;
                }
            }
            else if (type === 'object') {
                if (Array.isArray(value)) {
                    if (value.length <= 0) {
                        alert(vObj.msg + '를 입력해 주세요')
                        invalidKey = key;
                        result = false;
                        break;
                    }

                }
            }
        }
        return {result: result, inavlidKey: invalidKey};
    }

    /*******************************************************
     오브젝트의 attribute들의 value들을 copy,
     @Param : target - 타겟 오브젝트, copy가 필요한 attribute가 존재해야 함
     source - 소스 오브젝트
     *******************************************************/
    static objectAttrCopy(target, source) {
        for (let key in target) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key];  //value만 copty
            }
        }
    }

    /*******************************************************
     email 확인 정규식(ㅁㅁㅁ@ㅁㅁㅁ.co.kr/com 형식)
     @Param : (string)
     @Return : true/false
     *******************************************************/
    static emailRegex(email) {
        if (email && (email.indexOf(',') > 0 || email.indexOf(' ') > 0)) { //콤마, 빈칸 방어.
            return false;
        }
        var emailRule = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;

        return emailRule.test(email)
    }

    /*******************************************************
     valword 형식 확인 정규식(8~16자 영문자, 숫자, 특수문자 필수포함)
     @Param : (string)
     @Return : true/false
     *******************************************************/
    static valwordRegex(valword) {
        var valRule = /^.*(?=^.{8,16}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+*=]).*$/;

        return valRule.test(valword)
    }

    /*******************************************************
     숫자만 입력 정규식
     @Param : Number
     @Return : true/false
     *******************************************************/
    static onlyNumber(number) {
        var onlyNumber = /[^0-9]/g;

        return !onlyNumber.test(number)
    }

    /*******************************************************
     전화번호 입력 정규식
     @Param : Number
     @Return : 전화번호 유형별 정규식
     *******************************************************/
    static phoneRegexChange(phone) {
        console.log(phone)
        if (phone.length == 9) {                     // 02-000-0000
            var phoneNo = phone.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
        } else if (phone.length == 10) {
            if (phone.indexOf('02') == 0) {          // 02-0000-0000
                var phoneNo = phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
            } else {                                // 031-000-0000
                var phoneNo = phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            }
        } else {                                    // 핸드폰 번호 및 031-0000-0000
            var phoneNo = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return phoneNo;
    }

    /*******************************************************
     쿼리스트링을 파상하여 object 로 반환
     @Param : props
     @Return : object
     *******************************************************/
    static getParams(props) {
        return queryString.parse(props.location.search)
    }

    /*******************************************************
     현재부터 미래 날짜 사이의 시간차를 구하여 포맷에 맞게 반환
     @Param : Number(Millisecond), string
     @Return : string
     *******************************************************/
    static setupDone = false;

    static getDateDiffTextBetweenNowAndFuture(date, formatter){

        if (!this.setupDone) { //duration을 formatting 하기위한 plugin초기화.
            momentDurationFormatSetup(moment);
            this.setupDone = true;
        }

        const format = formatter || 'DD[일] HH[시] mm[분] ss[초]';
        let future  = moment(date);
        const now = moment();

        const length = moment.duration( future.diff(now)).format(format).length

        let result
        if(length === 8) {
            result = moment.duration( future.diff(now)).format(format).slice(0,6) + "00:00:" + moment.duration( future.diff(now)).format(format).slice(6,8)
        } else {
            result = moment.duration( future.diff(now)).format(format)
        }

        return result

        //month Diff는 자동으로 되지않아서, 별도로 추가.
        //const monthDiff = moment.utc(moment(future,"YYYY-MM-DD").diff(moment(now,"YYYY-MM-DD"),'months'));

        //monthDiff가 1개월 이상이면  now에 Month를 더해서 비교 - Number()함수 꼭필요.
        // return ((monthDiff > 0)? monthDiff+'개월 ' + moment.duration( future.diff(moment().add(Number(monthDiff),'M'))).format(format)
        //     : ''+ moment.duration( future.diff(now)).format(format) );
    }

    /*******************************************************
     array object 를 정렬하여 반환
     @Param : array object, date Type(정렬 할 key), bool(desc 여부)
     @Return : rowData 자체를 바꿔서 다시 return.(return 없다고 봐도 됨)
     *******************************************************/
    static sortDate = (rowData, key, isDesc) => {

        return rowData.sort((a, b) => {
            const aVal = ComUtil.utcToTimestamp(a[key]);
            const bVal = ComUtil.utcToTimestamp(b[key]);

            if (isDesc)
                return bVal - aVal;
            else
                return aVal - bVal;
        })
    }

    /*******************************************************
     array object 를 숫자키를 이용해 정렬하여 반환
     @Param : array object, number(정렬 할 key), bool(desc 여부)
     @Return :  rowData 자체를 바꿔서 다시 return. (return 없다고 봐도 됨)
     *******************************************************/
    static sortNumber = (rowData, key, isDesc) => {

        return rowData.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (isDesc) {
                return bVal - aVal;
            }
            else {
                return aVal - bVal;
            }
        })
    }

    /**
     * 현재 환경이 모바일 App(React Native App)일 때, true 반환
     */
    static isMobileApp() {
        if (navigator.userAgent.startsWith('BloceryApp')) {
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 App-iOS 이면서 apple사의 검수중일때 kakaoLogin방지용.(애플에서 카카오로그인 하려면 apple로그인도 해야한다고 202004월부터 정책)
     */
    static isMobileAppIosAppleReivew() {
        // alert(navigator.userAgent);

        // if (navigator.userAgent.startsWith('BloceryAppQR-iOS')) {  //test code
        if (navigator.userAgent.startsWith('BloceryAppQR-iOS-apple')) { //real code
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 App(React Native App)이고 QR이 지원되는 경우에만 true 반환
     * (android, ios 모두 가능)
     */
    static isMobileAppAndQrEnabled() {
        if (navigator.userAgent.startsWith('BloceryAppQR')) {
            return true;
        }
        return false;
    }

    /**
     * 현재 환경이 모바일 Web일 때, true 반환
     */
    static isMobileWeb() {
        if (this.isPcWeb() || this.isMobileApp()) {
            return false;
        }
        return true;
    }

    /**
     * 현재 환경이 IOS 모바일 Web일 때, true 반환
     */
    static isMobileWebIos() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i) == null ? false : true;
    }


    /**
     * 현재 환경이 PC용 웹브라우저일 때, true 반환 -> 생산자쪽에서 화면을 크게 그리는데 사용
     */
    static isPcWeb() {
        if (this.isMobileApp())
            return false;
        //console.log(navigator.userAgent);
        let md = new MobileDetect(navigator.userAgent);
        //console.log(md.mobile());

        if (!md.mobile()) //mobile이 아니면 PcWeb으로 인식.
            return true;

        return false; //mobile 브라우저
    }
    /*******************************************************
     소수점 자리수 버림
     @Param : number, midPointRoundingNumber(소수점 자릿수)
     @Return : number
     *******************************************************/
    static roundDown(number, midPointRoundingNumber){
        return this.decimalAdjust('floor', number, midPointRoundingNumber * (-1));
    }

    static decimalAdjust(type, value, exp){
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    /*******************************************************
     배열 숫자 합계
     @Param : number
     @Return : number
     *******************************************************/
    static sum(arr, key){
        var val = 0;
        arr.map(x => val += parseFloat(x[key]) || 0)
        return val;
    }

    /*******************************************************
     정산 기간 조회
     @Param : year, month
     @Return : yyyy.MM.01~yyyy.MM.dd
     *******************************************************/
    static payoutTerm(year, month) {
        var dd;     // 월별 말일
        if(month === 2) {
            dd = 28  //TODO add 29
        } else if (month === 4 || month === 6 || month === 9 || month === 11) {
            dd = 30
        } else {
            dd = 31
        }
        return year+'.'+month+'.01~'+year+'.'+month+'.'+dd
    }

    /*******************************************************
     정산 지급일(예정일) 조회 - 매달 마지막 날 기준 5영업일 후
     @Param : date
     @Return : yyyy.MM.dd
     *******************************************************/
    static payoutDate(date) {
        var year = date.getFullYear();
        var month = date.getMonth()+1;
        var expectDate;

        // 전월 마지막 날짜 구하기
        var firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
        var lastDayOfMonth = new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 1));

        var week = ['일', '월', '화', '수', '목', '금', '토'];
        var dayOfweek = week[new Date(lastDayOfMonth).getDay()];

        if(dayOfweek === '일') {
            expectDate = '05';
        } else if(dayOfweek === '토') {
            expectDate = '06';
        } else {
            expectDate = '07';
        }

        return year + '.' + month + '.' + expectDate;
    }

    /*******************************************************
     현재시간과의 차이 리턴.
     @Param : datte
     @Return : 2시간전 1일전 1달전 1년전 등.
     *******************************************************/
    static timeFromNow(targetTime) {

        //console.log('targetTime : ', targetTime);
        if (!this.setupDone) { //duration을 formatting 하기위한 plugin초기화.
            momentDurationFormatSetup(moment);
            this.setupDone = true;
        }
//moment.duration(future.diff(now)).format(format);

        const past  = moment(targetTime);
        const now = moment();

        const yearDiff = moment.duration(now.diff(past)).format('Y')
        // if (yearDiff > 0) return yearDiff + '년 전';

        const monthDiff = moment.duration(now.diff(past)).format('M')
        // if (monthDiff > 0) return monthDiff + '달 전';

        const dayDiff = moment.duration(now.diff(past)).format('D')
        if (yearDiff > 0 || monthDiff > 0 || dayDiff > 7)
            return ComUtil.utcToString(targetTime);

        if (dayDiff > 0) return dayDiff + '일 전';

        const hourDiff = moment.duration(now.diff(past)).format('H')
        if (hourDiff > 0) return hourDiff + '시간 전';

        const minDiff = moment.duration(now.diff(past)).format('m')
        if (minDiff > 0)
            return minDiff + '분 전';
        else
            return '방금 전';
    }

    //간단한 암호화 - 비번저장용
    static encrypt(str) {   //입력이 length=7자리 정도는 된다고 보면  'ABCDEFG'

        if (!str || str.length < 4) {
            console.log("============ Valword ERROR: " + str);
        }
        //ascii값에 (index+1)더하기.   A+1, B+2, C+3..  G+7
        let rotatedStr = '';
        for (let i = 0; i < str.length; i ++) {
            rotatedStr = rotatedStr + String.fromCharCode(str.charCodeAt(i) + ( i +1 ))
        }
        //로테이션 시키고    //중간에 양념넣기
        let randomDigit = str.length % 10; //한자리
        let tempStr = '0xe' + randomDigit + rotatedStr.substring(3) + 't0n3' + rotatedStr.substring(0,3);  //(4) + 4 + (4) +[3] : DEFG + TEMP + ABC
        return tempStr;

    }

    //간단한 복호화 - 비번복호용
    static decrypt(tempStr) {  //length:11

        //양념빼면서 로테이션 해제  //3+4로 복귀
        let rotatedStr = tempStr.substring(tempStr.length - 3) + tempStr.substring(4, tempStr.length-7 ) ; //뒤 + 앞.

        let str = '';
        for (let i = 0; i < rotatedStr.length; i ++) {
            str = str + String.fromCharCode(rotatedStr.charCodeAt(i) - ( i +1 ));
        }
        return str;
    }

    //max 10개로 cookie에서 관리.
    static saveLastSeenGoods(goodsId) {

        //TEST_CODE localStorage.removeItem('lastSeenGoods')

        let list = this.getLastSeenGoodsList();

        //이미 존재하면 미추가.
        if (list.includes(goodsId)) {
            console.log('lastSeenGoods', goodsId)
            return;
        }

        const MAX_SEEN = 15;

        //list가 15개 넘으면 앞에꺼 제거.
        if (list.length >= MAX_SEEN) {
            //list.unshift();
            list.splice(MAX_SEEN-1, list.length - (MAX_SEEN-1));
        }
        list.splice(0,0,goodsId)

        localStorage.setItem('lastSeenGoods', JSON.stringify(list));
    }

    static getLastSeenGoodsList() {

        let cookieList = localStorage.getItem('lastSeenGoods');
        if (!cookieList) return [];

        let list = JSON.parse(cookieList);

        return list;
    }

    static noScrollBody(){
        let body = document.body
        body.style.overflow = 'hidden'
    }
    static scrollBody(){
        let body = document.body
        body.style.overflow = 'auto'
    }

    static getGroupKeys(arr, groupKey) {
        const keys = [];

        arr.map(item => {
            if (keys.indexOf(item[groupKey]) === -1) {
                keys.push(item[groupKey]);
            }
        })
        return keys;
    }
    //랜덤 array 적용템
    static shuffle(array) {
        let currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // 랜덤 아이
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // 섞기 (랜덤으로 뽑은 아이템과 currentIndex 를 swap)
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    }

    /*******************************************************
     이미지파일 서버 업로드
     @Param : file
     @Return : Image (Back-end dbdata 참조)
     *******************************************************/
    static editorUploadFile = async (file) => {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            // The third parameter is required for server
            formData.append('image', file, file.name);

            const method = '/contentImgFile';

            //서버에 파일 업로드
            axios(Server.getRestAPIFileServerHost() + method, {
                method: 'post',
                data:formData,
                withCredentials: true,
                credentials: 'same-origin'
            }).then((result) => {
                resolve(result.data)
            })
        })
    }
    /*******************************************************
     소수점자리수 8자까지만 허용하고 리턴하 bly 전용 함수
     @Param : number or string
     @Return : number or null
     *******************************************************/
    static getBlyNumber(value) {
        let newValue = ComUtil.toNum(value, false)
        newValue = (newValue.toString()).substring(0, newValue.toString().indexOf('.')+(8+1));

        // newValue = newValue.toString()

        // newValue = ComUtil.roundDown(newValue, 8)

        // const splitNewValue = newValue.split('.')
        //
        // if(splitNewValue.length >= 2) {
        //     console.log(splitNewValue[1].length)
        //     // if (splitNewValue[1].length > 8) {
        //     //     newValue = ComUtil.roundDown(parseFloat(newValue), 8)
        //     newValue = parseFloat(newValue)
        //     // }
        // }

        if (parseFloat(newValue) <= 0) {
            return '';
        }else{
            return newValue
        }
    }

    static doubleAdd(a, b) {
        return (ComUtil.toNum(a) + ComUtil.toNum(b)).toFixed(2);
    }

    static doubleSub(a, b) {
        return (ComUtil.toNum(a) - ComUtil.toNum(b)).toFixed(2);
    }
    static getFirstImageSrc(images, isThumbnail = true) {

        if (images && images.length > 0) {
            const image = images[0]
            const imageTypeUrl = isThumbnail ? Server.getThumbnailURL() : Server.getImageURL()
            const src = imageTypeUrl + image.imageUrl;

            return src
        }
        return 'https://askleo.askleomedia.com/wp-content/uploads/2004/06/no_image-300x245.jpg'
    }

}