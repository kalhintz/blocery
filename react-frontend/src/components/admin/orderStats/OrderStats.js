import React, { Component } from 'react';
import {Button, ButtonGroup, Input, Table} from 'reactstrap'
import "react-table/react-table.css"
import { getAllOrderStats } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import moment from 'moment'
import { ExcelDownload, BlocerySpinner } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import SearchDates from '~/components/common/search/SearchDates'
import {Div, Flex} from "~/styledComponents/shared";

export default class OrderStats extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            search:{
                selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
                startDate: moment(moment().toDate()),
                endDate: moment(moment().toDate()),
                isConsumerOk: 'N',
                searchType:'3',   //실적현황 및 상품별현황 화면에 보여질 구분자 (1:실적현황,2:상품별현황,3:실적현황및상품별현황)
                isYearMonth:'N'   //실적현황 년월별 구분자
            },
            data: {},
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    search = async (searchButtonClicked) => {
        if (searchButtonClicked) {
            if(this.state.search.selectedGubun !== 'all'){
                if (
                    !this.state.search.startDate || !this.state.search.endDate
                ) {
                    alert('시작일과 종료일을 선택해주세요')
                    return false;
                }
            }
        }
        this.setState({loading: true});

        const params = {
            startDate:this.state.search.startDate ? moment(this.state.search.startDate).format('YYYYMMDD'):null,
            endDate:this.state.search.endDate ? moment(this.state.search.endDate).format('YYYYMMDD'):null,
            isConsumerOk: this.state.search.isConsumerOk == 'Y' ? true:false,
            searchType:this.state.search.searchType,
            isYearMonth:this.state.search.isYearMonth == 'Y' ? true:false
        };
        const { status, data } = await getAllOrderStats(params);

        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }
        this.setState({
            data: data
        });

        this.setExcelData();

        this.setState({loading: false});
    }

    // 확정유무
    onSearchIsConsumerOkChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isConsumerOk = e.target.value;
        await this.setState({
            search: vSearch
        });
        //await this.search();
    }

    // 실적현황 및 상품별현황 구분
    onSearchTypeChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.searchType = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    onIsYearMonthChange = async (e) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.isYearMonth = e.target.value;
        await this.setState({
            search: vSearch
        });
    }

    onDatesChange = async (data) => {
        const vSearch = Object.assign({}, this.state.search);
        vSearch.startDate = data.startDate;
        vSearch.endDate = data.endDate;
        vSearch.selectedGubun = data.gubun;
        await this.setState({
            search: vSearch
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    setExcelData = () => {
        let orderExcelData = null;
        let goodsExcelData = null;
        if(this.state.search.searchType == "1"){
            orderExcelData = this.getOrderExcelData();
        } else if(this.state.search.searchType == "2"){
            goodsExcelData = this.getGoodsExcelData();
        } else if(this.state.search.searchType == "3"){
            orderExcelData = this.getOrderExcelData();
            goodsExcelData = this.getGoodsExcelData();
        }
        this.setState({
            orderExcelData: orderExcelData,
            goodsExcelData: goodsExcelData
        })

    }
    getOrderExcelData = () => {
        const columns = [
            '날짜', '신용수량', 'BLCT수량', '카드BLCT수량', '수량합계',
            '신용카드', 'BLCT', '카드BLCT(카드)', '카드BLCT(BLCT)', '매출합계', '정산금액', '판매지원금'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.orderStats.map((item ,index)=> {
            return [
                item.date, item.countCard, item.countBlct, item.countCardBlct, item.countSum,
                item.card,item.blct, item.cardBlctByCard, item.cardBlct - item.cardBlctByCard, item.sum, item.simplePayoutAmount, item.saleSupportPrice
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    getGoodsExcelData = () => {
        const columns = [
            '번호', '상품명', '신용수량', 'BLCT수량', '카드BLCT수량', '수량합계',
            '신용카드', 'BLCT', '카드BLCT(카드)', '카드BLCT(BLCT)', '매출합계', '정산금액', '판매지원금'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.goodsStats.map((item ,index)=> {
            return [
                item.index, item.goodsNm, item.countCard, item.countBlct, item.countCardBlct, item.countSum,
                item.card,item.blct, item.cardBlctByCard, item.cardBlct - item.cardBlctByCard, item.sum, item.simplePayoutAmount, item.saleSupportPrice
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }



    render() {

        return(
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <div className="ml-3 mt-3 mr-3">

                    <div className="ml-2 mt-2 mr-2">
                        <Flex bc={'secondary'} m={3} p={7}>
                            <Div pl={10} pr={20} py={1}> 기 간 </Div>
                            <Div ml={10} >
                                <Flex>
                                    <SearchDates
                                        gubun={this.state.search.selectedGubun}
                                        startDate={this.state.search.startDate}
                                        endDate={this.state.search.endDate}
                                        isHiddenAll={true}
                                        isNotOnSearch={true}
                                        onChange={this.onDatesChange}
                                    />

                                    <div className='ml-2'>
                                        <Input type='select'
                                               name='searchIsConsumerOk'
                                               id='searchIsConsumerOk'
                                               onChange={this.onSearchIsConsumerOkChange}
                                               value={this.state.search.isConsumerOk}
                                        >
                                            <option name='isConsumerOk' value='N'>주문일기준</option>
                                            <option name='isConsumerOk' value='Y'>구매확정일기준</option>
                                        </Input>
                                    </div>

                                    <div className='ml-2'>
                                        <Input type='select'
                                               name='searchSearchType'
                                               id='searchSearchType'
                                               onChange={this.onSearchTypeChange}
                                               value={this.state.search.searchType}
                                        >
                                            <option name='searchType' value='1'>출력구분:실적현황</option>
                                            <option name='searchType' value='2'>출력구분:상품별현황</option>
                                            <option name='searchType' value='3'>출력구분:실적및상품별현황</option>
                                        </Input>
                                    </div>

                                    {
                                        (this.state.search.searchType == 1 || this.state.search.searchType == 3) &&
                                        <div className='ml-2'>
                                            <Input type='select'
                                                   name='searchIsYearMonth'
                                                   id='searchIsYearMonth'
                                                   onChange={this.onIsYearMonthChange}
                                                   value={this.state.search.isYearMonth}
                                            >
                                                <option name='isYearMonth' value='N'>실적현황(일별)</option>
                                                <option name='isYearMonth' value='Y'>실적현황(월별)</option>
                                            </Input>
                                        </div>
                                    }
                                    <Button className="ml-3" color="primary" onClick={this.search.bind(this,true)}> 검 색 </Button>
                                </Flex>
                            </Div>
                        </Flex>
                    </div>

                    {
                        (this.state.search.searchType == "1" || this.state.search.searchType == "3") &&
                            <>
                                <div className="pt-3 pb-3">
                                    ㅁ 실적현황 ({this.state.data.startDate}~{this.state.data.endDate})
                                </div>
                                <Table bordered>
                                    <tr>
                                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 날짜 </td>
                                        <td width="400px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매수량 </td>
                                        <td width="400px" colSpan="5" bgcolor="#F3F3F3" align="center" valign="middle" > 구매금액 </td>
                                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 정산금액 </td>
                                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 판매지원금 </td>
                                    </tr>
                                    <tr>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 신용카드 </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > BLCT </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 합 계 </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 신용카드 </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > BLCT </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT (카드) </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT (BLCT) </td>
                                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 합 계 </td>
                                    </tr>

                                    {(this.state.data.goodsStats && this.state.data.goodsStats[0] )&&
                                    <tr>
                                        <td bgcolor="#A3A3A3" align="center"> 합계</td>
                                        <td bgcolor="#A3A3A3" align="center"> {this.state.data.goodsStats[0].countCard} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {this.state.data.goodsStats[0].countBlct} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {this.state.data.goodsStats[0].countCardBlct} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {this.state.data.goodsStats[0].countSum} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].card)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].blct)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].cardBlctByCard)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].cardBlct - this.state.data.goodsStats[0].cardBlctByCard)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].sum)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].simplePayoutAmount)} </td>
                                        <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].saleSupportPrice)} </td>
                                    </tr>
                                    }

                                    {
                                        this.state.data.orderStats &&
                                        this.state.data.orderStats.map(stat => {
                                            return (
                                                <tr>
                                                    <td align="center"> {stat.date} </td>
                                                    <td align="center"> {stat.countCard} </td>
                                                    <td align="center"> {stat.countBlct} </td>
                                                    <td align="center"> {stat.countCardBlct} </td>
                                                    <td align="center"> {stat.countSum} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.card)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.blct)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.cardBlctByCard)}</td>
                                                    <td align="center"> {ComUtil.addCommas(stat.cardBlct - stat.cardBlctByCard)}</td>
                                                    <td align="center"> {ComUtil.addCommas(stat.sum)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.simplePayoutAmount)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.saleSupportPrice)} </td>
                                                </tr>
                                            )
                                        })
                                    }

                                </Table>
                                <div align="center">
                                    <ExcelDownload data={this.state.orderExcelData}
                                                   fileName="실적현황"
                                    />
                                </div>
                                <br/>
                                <br/>
                            </>
                    }
                    {
                        (this.state.search.searchType == "2" || this.state.search.searchType == "3") &&
                            <>
                                <div className="pt-3 pb-3">
                                    ㅁ 상품별 현황 ({this.state.data.startDate}~{this.state.data.endDate})
                                </div>
                                <Table bordered>
                                    <tr>
                                        <td width="50px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > No </td>
                                        <td width="350px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 상품명 </td>
                                        <td width="200px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매수량 </td>
                                        <td width="200px" colSpan="5" bgcolor="#F3F3F3" align="center" valign="middle" > 구매금액 </td>
                                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 정산금액 </td>
                                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 판매지원금 </td>
                                    </tr>
                                    <tr>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 신용카드 </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > BLCT </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 합 계 </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 신용카드 </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > BLCT </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT (카드) </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT (BLCT) </td>
                                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 합 계 </td>
                                    </tr>


                                    {
                                        this.state.data.goodsStats &&
                                        this.state.data.goodsStats.map((stat,idx) => {

                                            if (idx == 0)  //합계//////////////
                                                return(
                                                    <tr>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.index} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.goodsNm} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.countCard} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.countBlct} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.countCardBlct} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {stat.countSum} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.card)} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.blct)} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.cardBlctByCard)}</td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.cardBlct - stat.cardBlctByCard)}</td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.sum)} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.simplePayoutAmount)} </td>
                                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.saleSupportPrice)} </td>
                                                    </tr>
                                                );

                                            return (
                                                <tr>
                                                    <td align="center"> {stat.index} </td>
                                                    <td align="center"> {stat.goodsNm} </td>
                                                    <td align="center"> {stat.countCard} </td>
                                                    <td align="center"> {stat.countBlct} </td>
                                                    <td align="center"> {stat.countCardBlct} </td>
                                                    <td align="center"> {stat.countSum} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.card)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.blct)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.cardBlctByCard)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.cardBlct - stat.cardBlctByCard)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.sum)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.simplePayoutAmount)} </td>
                                                    <td align="center"> {ComUtil.addCommas(stat.saleSupportPrice)} </td>
                                                </tr>
                                            )

                                        })
                                    }

                                </Table>
                                <div align="center">
                                    <ExcelDownload data={this.state.goodsExcelData}
                                                   fileName="상품별 실적현황"
                                    />
                                </div>
                                <br/>
                                <br/>
                            </>
                    }
                </div>
            </div>
        );
    }
}