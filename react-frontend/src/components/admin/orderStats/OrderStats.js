import React, { Component, PropTypes, Fragment } from 'react';
import { Button, ButtonGroup, Table } from 'reactstrap'
import "react-table/react-table.css"
import { getAllOrderStats } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment'
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'



export default class OrderStats extends Component {
    constructor(props) {
        super(props);
        this.state = {

            selectedGubun: 'week',
            startDate: null,
            endDate: null,

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
        console.log('OrderStats.js: search')

        // let selectedGubun = this.state.selectedGubun;
        //
        // if (gubun) { //파라미터 입력받으면 변경..
        //     selectedGubun  = gubun;
        // }

        if (searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        const { status, data } = (searchButtonClicked)? await getAllOrderStats( moment(this.state.startDate).format('YYYYMMDD'), //날짜검색
                                                                                moment(this.state.endDate).format('YYYYMMDD'),
                                                                                null)
                                                       : await getAllOrderStats( null, null, this.state.selectedGubun ); //구분검색

        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return;
        }

        console.log(data);
        this.setState({
            data: data
        });

        this.setExcelData();
    }

    //검색 조건들 설정..//////////////
    selectCondition = async (gubun) => {
        console.log('selectCondition', gubun);

        await this.setState({ //gubun이 변경될 때까지 대기필요.
            selectedGubun: gubun
        });

        await this.search();
    }

    onStartDateChange = async (date) => {
        console.log('onStartDateChange', moment(date).format('YYYY-MM-DD'));

        await this.setState({
            startDate: moment(date)
        })

    }
    onEndDateChange = async (date) => {
        console.log('onEndDateChange', moment(date).format('YYYY-MM-DD'));

        await this.setState({
            endDate: moment(date)
        })
    }


    setExcelData = () => {
        let orderExcelData = this.getOrderExcelData();
        let goodsExcelData = this.getGoodsExcelData();

        this.setState({
            orderExcelData: orderExcelData,
            goodsExcelData: goodsExcelData
        })
    }
    getOrderExcelData = () => {
        const columns = [
            '날짜', '신용수량', 'BLCT수량', '카드BLCT수량', '수량합계',
            '신용카드', 'BLCT', '카드BLCT', '매출합계', '정산금액', '판매지원금'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.orderStats.map((item ,index)=> {
            return [
                item.date, item.countCard, item.countBlct, item.countCardBlct, item.countSum,
                item.card,item.blct, item.cardBlct, item.sum, item.simplePayoutAmount, item.saleSupportPrice
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
            '신용카드', 'BLCT', '카드BLCT', '매출합계', '정산금액', '판매지원금'
        ]
        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = this.state.data.goodsStats.map((item ,index)=> {
            return [
                item.index, item.goodsNm, item.countCard, item.countBlct, item.countCardBlct, item.countSum,
                item.card,item.blct, item.cardBlct, item.sum, item.simplePayoutAmount, item.saleSupportPrice
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }



    render() {

        return(
            <div className="ml-3 mt-3 mr-3">
                <br/>
                <div className="pt-3 pb-3">
                    조회
                </div>

                <Table bordered>
                    <tr>
                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 기 간 </td>
                        <td width="800px">

                            <ButtonGroup className="pr-3 mr-3">
                                <Button color="secondary" onClick={() => this.selectCondition('day')} active={this.state.selectedGubun === 'day'}> 오늘 </Button>
                                <Button color="secondary" onClick={() => this.selectCondition('week')} active={this.state.selectedGubun === 'week'}> 1주일 </Button>
                                <Button color="secondary" onClick={() => this.selectCondition('month')} active={this.state.selectedGubun === 'month'}> 1개월 </Button>
                                <Button color="secondary" onClick={() => this.selectCondition('3month')} active={this.state.selectedGubun === '3month'}> 3개월 </Button>
                                <Button color="secondary" onClick={() => this.selectCondition('6month')} active={this.state.selectedGubun === '6month'}> 6개월 </Button>
                                <Button color="secondary" onClick={() => this.selectCondition('all')} active={this.state.selectedGubun === 'all'}> 전체월별 </Button>
                            </ButtonGroup>


                            <SingleDatePicker className="ml-3"
                                            placeholder="검색시작일"
                                            date={ this.state.startDate}
                                            onDateChange={this.onStartDateChange}
                                            focused={this.state[`focused`]} // PropTypes.bool
                                            onFocusChange={({ focused }) => this.setState({ [`focused`]:focused })} // PropTypes.func.isRequired
                                            id={"startDate"} // PropTypes.string.isRequired,
                                            numberOfMonths={1}
                                            withPortal={false}
                                            isOutsideRange={() => false}
                                            small
                                            readOnly
                            /> ~
                            <SingleDatePicker className="mr-3"
                                              placeholder="검색종료일"
                                              date={ this.state.endDate}
                                              onDateChange={this.onEndDateChange}
                                              focused={this.state[`focused2`]} // PropTypes.bool
                                              onFocusChange={({ focused }) => this.setState({ [`focused2`]:focused })} // PropTypes.func.isRequired
                                              id={"endDate"} // PropTypes.string.isRequired,
                                              numberOfMonths={1}
                                              withPortal={false}
                                              isOutsideRange={() => false}
                                              small
                                              readOnly
                            />


                            <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>
                        </td>
                    </tr>
                </Table>



                <br/>
                <br/>
                <div className="pt-3 pb-3">
                    ㅁ 실적현황 ({this.state.data.startDate}~{this.state.data.endDate})
                </div>
                <Table bordered>
                    <tr>
                        <td width="100px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 날짜 </td>
                        <td width="400px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매수량 </td>
                        <td width="400px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매금액 </td>
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
                        <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT </td>
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
                            <td bgcolor="#A3A3A3" align="center"> {ComUtil.addCommas(this.state.data.goodsStats[0].cardBlct)} </td>
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
                                    <td align="center"> {ComUtil.addCommas(stat.cardBlct)} </td>
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
                <div className="pt-3 pb-3">
                    ㅁ 상품별 현황 ({this.state.data.startDate}~{this.state.data.endDate})
                </div>
                <Table bordered>
                    <tr>
                        <td width="50px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > No </td>
                        <td width="350px" rowSpan="2" bgcolor="#F3F3F3" align="center" valign="middle" > 상품명 </td>
                        <td width="200px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매수량 </td>
                        <td width="200px" colSpan="4" bgcolor="#F3F3F3" align="center" valign="middle" > 구매금액 </td>
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
                        <td width="50px" bgcolor="#F3F3F3" align="center" valign="middle" > 카드+BLCT </td>
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
                                        <td width="50px" bgcolor="#A3A3A3" align="center" valign="middle" > {ComUtil.addCommas(stat.cardBlct)} </td>
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
                                    <td align="center"> {ComUtil.addCommas(stat.cardBlct)} </td>
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
            </div>
        );
    }
}