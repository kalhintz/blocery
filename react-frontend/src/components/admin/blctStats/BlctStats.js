import React, { useState, useEffect } from 'react';
import { Button, Table } from 'reactstrap';

import { getBlctStats, getMonthlyBlctStats, getAllSupportersBlct, getAllBlyTimeRewardBlct, getAllEventRewardBlct, getAllCouponBlct, getAllProducerWithdrawBlct } from "~/lib/adminApi";
import { getTotalSwapBlctToBly, getTotalSwapBlctIn, getSwapTempProducerBlctToBly } from "~/lib/swapApi"
import { getProducerByProducerNo } from '~/lib/producerApi';
import { getManagerBlctBalance } from "~/lib/smartcontractApi"
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/dist/styles/ag-grid.css';
// import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'

const BlctStats = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "기간", field: "startDateTime", cellRenderer: "startEndRenderer",},
            // {headerName: "~까지", field: "endDateTime"},
            // {headerName: "BLCT ECO system", field: "managerBlct"},
            {headerName: "[소비자] BLCT 상품구매", width: 170, field: "totalBlctOrder"},
            {headerName: "[소비자] 구매보상", width: 130, field: "totalConsumerRewardBlct"},
            {headerName: "[팜토리] BLCT 상품판매", width: 170, field: "totalFarmtoryOrderBlct"},
            {headerName: "[팜토리] 판매보상", width: 130, field: "totalFarmtoryRewardBlct"},
            {headerName: "[생산자(팜토리 외)] 상품판매", width: 190, field: "totalProducerOrderBlct"},
            {headerName: "[생산자(팜토리 외)] 판매보상", width: 190, field: "totalProducerRewardBlct"},
            {headerName: "[에스크로] 구매추가 BLCT", width: 180, field: "totalBlctOrder"},
            {headerName: "[에스크로] 정산완료 BLCT", width: 180, field: "totalConsumerOkBlctOrder"},
            {headerName: "Blcery 수익(수수료)", width: 150, field: "totalBloceryOnlyFeeBlct"},
            {headerName: "토큰매출정산완료", width: 180, field: "totalTempProducerSent"},
        ],
        defaultColDef: {
            width: 170,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            startEndRenderer: startEndRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [dataList, setDataList] = useState([]);
    const [producerWithdrawList, setProducerWithdrawList] = useState([]);
    const [excelData, setDataExcel] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [supportersBlct, setSupportersBlct] = useState(0);
    const [blyTimeRewardBlct, setBlyTimeRewardBlct] = useState(0);
    const [eventRewardBlct, setEventRewardBlct] = useState(0);
    const [couponBlct, setCouponBlct] = useState(0);
    const [swapBlctToBly, setSwapBlctToBly] = useState(0);
    const [swapBlctIn, setSwapBlctIn] = useState(0);
    const [tempProducerBlctToBly, setTempProducerBlctToBly] = useState(0);
    const [producerPayoutBlct, setProducerPayoutBlct] = useState(0);
    const [farmtoryPayoutBlct, setFarmtoryPayoutBlct] = useState(0);

    const initialBlctEco = 1137800;
    const addBlctEco = (1000000 + 695262.465).toFixed(3);  // 2020.9월 선물하기용 1,000,000 추가입금 + 2020.9월 토큰현금화과정에서 추가입금
    const mission1EventBlct = 204910;
    const mission2EventBlct = 245250;
    const cobakEventBlct = 74400;  // 4/29일 추가로 400 더 지급함 (74,000 + 400)
    // const supportersBlct = 14500;   // txid: b446b254d1fec8917f3fff47349399ea5e85d128a9cc4b4612d0011c93467af9     6fad71d9558470cafcae535ff879e8af867fa59cfcd3cb548691bfffdb8120f9
    const loss = 131.98 + 197.5 + 330 + 0.825999069958925 - 19.31000024;  // 2020-08-10 포텐타임 옥수수 환불 197.5 추가, 2020-08-24 수박 환불 330 추가
    // const supportersBlct_April = 16250;


    useEffect(()=> {
        // console.log('useEffect dataList : ', dataList)

        async function excelData() {
            await setExcelData();
        }

        excelData();

    }, [dataList]);

    useEffect(() => {

        getTotalData();
        getMonthlyData();

    }, []);


    const getSummaryData =  async (startDate, endDate) => {
        const {data} = await getBlctStats(startDate, endDate);
        // console.log("blctStats",data);

        let {data:managerBlct} = await getManagerBlctBalance();
        data.managerBlct = managerBlct;

        return data;
    }

    const setExcelData = async () => {
        let excelData = await getExcelData();
        setDataExcel(excelData);
    };

    const getExcelData = async() => {
        const columns = [
            '통계 시작일', '통계 종료일', '[소비자] BLCT 상품구매', '[소비자] 구매보상', '[팜토리] BLCT 상품판매', '[팜토리] 판매보상', '[생산자(팜토리 외)] 상품판매',
            '[생산자(팜토리 외)] 판매보상', '[에스크로] 구매추가 BLCT', '[에스크로] 정산완료 BLCT', 'Blcery 수익(수수료)', '토큰매출정산완료'
        ];

        const data = dataList.map((item ,index)=> {
            return [
                item.startDateTime,
                item.endDateTime,
                item.totalBlctOrder,
                item.totalConsumerRewardBlct,
                item.totalFarmtoryOrderBlct,
                item.totalFarmtoryRewardBlct,
                item.totalProducerOrderBlct,
                item.totalProducerRewardBlct,
                item.totalBlctOrder,
                item.totalConsumerOkBlctOrder,
                item.totalBloceryOnlyFeeBlct,
                item.totalTempProducerSent
            ]
        });

        // const result = await Promise.all(data)
        // console.log('result : ', result)

        return [{
            columns: columns,
            data: data
        }]
    };

    function startEndRenderer({value, data:rowData}) {

        return ComUtil.utcToString(rowData.startDateTime) + "~" + ComUtil.utcToString(rowData.endDateTime);

        // return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    }

    const getTodayYYYYMMDD = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = today.getMonth()+1;
        const dd = today.getDate();

        return String(10000 * yyyy + 100 * mm + dd);
    }

    const getTotalData = async() => {

        const {data:swapBlctToBly} = await getTotalSwapBlctToBly();
        setSwapBlctToBly(swapBlctToBly.blctSum)


        // blct구매내역 중 현금 정산한 생산자들의 blct를 현금화한 물량
        const {data} = await getSwapTempProducerBlctToBly();
        const tempProducerBlctToBly = data.blctSum;
        setTempProducerBlctToBly(tempProducerBlctToBly);

        // 팜토리처럼 blct 정산하는 생산자들의 출금내역
        const {data:producerWithdrawList} = await getAllProducerWithdrawBlct();
        setProducerWithdrawList(producerWithdrawList);
        // console.log(producerWithdrawList);

        let totalProducerPayout = 0;
        let totalFarmtoryPayout = 0;
        producerWithdrawList.map(item => {
           totalProducerPayout += item.amount;

           if(item.eventName.includes("팜토리")) {
               totalFarmtoryPayout += item.amount;
           }
        });

        console.log(totalProducerPayout, tempProducerBlctToBly);
        setProducerPayoutBlct(totalProducerPayout + parseFloat(tempProducerBlctToBly));  // blct정산, 현금정산 생산자들의 모든 blct 구매건 정산내역이기에 합이 필요함.
        setFarmtoryPayoutBlct(totalFarmtoryPayout);

        const {data:swapBlctIn} = await getTotalSwapBlctIn();
        setSwapBlctIn(swapBlctIn);

        const {data:_supportersBlct} = await getAllSupportersBlct();
        setSupportersBlct(_supportersBlct);

        const {data:_blyTimeRewardBlct} = await getAllBlyTimeRewardBlct();
        setBlyTimeRewardBlct(_blyTimeRewardBlct);

        const {data:_eventRewardBlct} = await getAllEventRewardBlct();
        let eventAmount = parseFloat((_eventRewardBlct - 11141.67).toFixed(2));  // 2020.10.05 토큰출금실패로 재지급한 토큰양은 이벤트 적립금에 포함되지 않아야해서 수동으로 뺌
        setEventRewardBlct(eventAmount);

        const {data: _couponBlct} = await getAllCouponBlct();
        setCouponBlct(_couponBlct);

        const startDate = '20190901'
        const endDate = getTodayYYYYMMDD();

        getSummaryData(startDate, endDate).then((response) => {

            // console.log(response);

            let summaryData = {}

            let totalEventBlct = mission1EventBlct + mission2EventBlct + cobakEventBlct + _supportersBlct + _blyTimeRewardBlct + eventAmount + _couponBlct;
            const consumerSwapBlctToBly = swapBlctToBly.blctSum - tempProducerBlctToBly; // tempProducer@ezfarm.co.kr에 해당하는 토큰출금내역 빼야함.

            //20201103 beforeMerge summaryData.consumerBlct = totalEventBlct - response.totalBlctOrder + response.totalConsumerRewardBlct - swapBlctToBly.blctSum + swapBlctIn;
            summaryData.consumerBlct = totalEventBlct - response.totalBlctOrder + response.totalConsumerRewardBlct - consumerSwapBlctToBly + swapBlctIn;

            summaryData.farmtoryBlct = response.totalFarmtoryOrderBlct + response.totalFarmtoryRewardBlct - totalFarmtoryPayout;
            console.log(response.totalFarmtoryOrderBlct, response.totalFarmtoryRewardBlct, totalFarmtoryPayout)
            summaryData.producerRewardBlct = response.totalProducerRewardBlct;
            summaryData.escrow = response.totalBlctOrder - response.totalConsumerOkBlctOrder;
            summaryData.bloceryOnlyFee = response.totalBloceryOnlyFeeBlct;
            summaryData.producerOrderBlct = response.totalProducerOrderBlct;
            summaryData.tempProducerSentBlct = response.totalTempProducerSent;

            summaryData.BLCTECOBalance = response.managerBlct - summaryData.escrow;

            // bloceryECO지갑 + 소비자 지갑 + 팜토리 지갑 + 생산자 보상지갑 + 에스크로된 BLCT + 블로서리 수수료 + 팜토리 외 생산자에게 판매된 BLCT 합 + 로스금액 =>> 처음 시작한 토큰양과 같아야 함.
            summaryData.totalSum = summaryData.BLCTECOBalance + summaryData.consumerBlct + summaryData.farmtoryBlct
                + summaryData.producerRewardBlct + summaryData.escrow + summaryData.bloceryOnlyFee + summaryData.producerOrderBlct + loss;

            setSummaryData(summaryData);
            // console.log(summaryData);

        })

    }

    // const getTodayData = () => {
    //     const startDate = getTodayYYYYMMDD();
    //     const endDate = getTodayYYYYMMDD();
    //
    //     getSummaryData(startDate, endDate);
    // }

    const getMonthlyData = async() => {
        const {data} = await getMonthlyBlctStats();
        // console.log("blctStats",data);

        setDataList(data);
    }

    return (
        <div>
            <div className="m-2">
                <div><h5>마켓블리 BLCT 보유현황</h5></div>
                <div className="d-flex">
                    <div className="mr-2" style={{minWidth:'700px'}}>
                        <Table striped>
                            <tbody>
                                <tr>
                                    <td> BLCT ECO system Balance</td>
                                    <td> {ComUtil.toCurrency(summaryData.BLCTECOBalance)} </td>
                                </tr>

                                <tr>
                                    <td> 소비자 지갑 총 합 : 모든 이벤트 지급 - 상품구매 + 구매보상</td>
                                    <td> {ComUtil.toCurrency(summaryData.consumerBlct)} </td>
                                    {/*<td> {summaryData.consumerBlct} </td>*/}
                                </tr>

                                <tr>
                                    <td> 팜토리 생산자 지갑 : 상품판매금액 + 판매보상 - 출금토큰</td>
                                    <td> {ComUtil.toCurrency(summaryData.farmtoryBlct)} </td>
                                </tr>

                                <tr>
                                    <td> 생산자(팜토리 외) 상품판매 </td>
                                    <td> {ComUtil.toCurrency(summaryData.producerOrderBlct)} </td>
                                </tr>

                                <tr>
                                    <td> <div className="ml-3"> 미정산물량 </div></td>
                                    <td> <div className="ml-3">{ComUtil.toCurrency(summaryData.producerOrderBlct - summaryData.tempProducerSentBlct)}</div> </td>
                                </tr>

                                <tr>
                                    <td> <div className="ml-3">정산물량 </div></td>
                                    <td> <div className="ml-3">{ComUtil.toCurrency(summaryData.tempProducerSentBlct)} </div></td>
                                </tr>

                                <tr>
                                    <td> <div className="ml-5"> 현금화 물량 </div></td>
                                    <td> <div className="ml-5">{ComUtil.toCurrency(tempProducerBlctToBly)}</div> </td>
                                </tr>

                                <tr>
                                    <td> <div className="ml-5"> 미현금화 물량 </div></td>
                                    <td> <div className="ml-5">{ComUtil.toCurrency(summaryData.tempProducerSentBlct - tempProducerBlctToBly)} </div></td>
                                </tr>


                                <tr>
                                    <td> 생산자 지갑 : 팜토리 외 판매보상 </td>
                                    <td> {ComUtil.toCurrency(summaryData.producerRewardBlct)} </td>
                                </tr>

                                <tr>
                                    <td> 주문진행중인 에스크로 </td>
                                    <td> {ComUtil.toCurrency(summaryData.escrow)} </td>
                                </tr>

                                <tr>
                                    <td> 블로서리 수수료 수익 </td>
                                    <td> {ComUtil.toCurrency(summaryData.bloceryOnlyFee)} </td>
                                </tr>

                                {/*<tr>*/}
                                    {/*<td> 유실(소비자 취소환불 327.5, 코박 0.7, 테스트2회, 소수점 오차) </td>*/}
                                    {/*<td> {loss} </td>*/}
                                {/*</tr>*/}

                                {/*<tr>*/}
                                    {/*<td> 합계 </td>*/}
                                    {/*<td> {ComUtil.toCurrency(summaryData.totalSum)} </td>*/}
                                {/*</tr>*/}
                            </tbody>
                        </Table>
                        {/*<hr/>*/}
                    </div>

                    <div className="ml-4" style={{minWidth:'500px'}}>
                        <Table striped>
                            <tbody>
                            <tr>
                                <td> 초기 BLCT ECO system </td>
                                <td> {ComUtil.toCurrency(initialBlctEco)} </td>
                            </tr>

                            <tr>
                                <td> 추가된 BLCT ECO system </td>
                                <td> {ComUtil.toCurrency(addBlctEco)} </td>
                            </tr>

                            <tr>
                                <td> 베타오픈 이벤트 지급(2019.12.30 ~ 2020.1.31) </td>
                                <td> {ComUtil.toCurrency(mission1EventBlct)} </td>
                            </tr>

                            <tr>
                                <td> 그랜드오픈 이벤트 지급(2020.3.4 ~ 2020.3.15) </td>
                                <td> {ComUtil.toCurrency(mission2EventBlct)} </td>
                            </tr>

                            <tr>
                                <td> 코박 이벤트 지급(2020.3.18) </td>
                                <td> {ComUtil.toCurrency(cobakEventBlct)} </td>
                            </tr>

                            <tr>
                                <td> 서포터즈 지급</td>
                                <td> {ComUtil.toCurrency(supportersBlct)} </td>
                            </tr>

                            <tr>
                                <td> 블리타임 리워드 지급</td>
                                <td> {ComUtil.toCurrency(blyTimeRewardBlct)} </td>
                            </tr>

                            <tr>
                                <td> 이벤트 적립금 지급</td>
                                <td> {ComUtil.toCurrency(eventRewardBlct)} </td>
                                {/*<td> {eventRewardBlct} </td>*/}
                            </tr>

                            <tr>
                                <td> 쿠폰 지급</td>
                                <td> {ComUtil.toCurrency(couponBlct)} </td>
                            </tr>

                            <tr>
                                <td> 생산자 토큰정산 출금(팜토리포함 모든 생산자) </td>
                                <td> {ComUtil.toCurrency(producerPayoutBlct)} </td>
                            </tr>

                            <tr>
                                <td> 내부 BLY 출금 합계(oep4 -> erc20 swap)</td>
                                <td> {ComUtil.toCurrency(swapBlctToBly)} </td>
                            </tr>

                            <tr>
                                <td> 외부 BLY 입금 합계(erc20 -> oep4 swap)</td>
                                <td> {ComUtil.toCurrency(swapBlctIn)} </td>
                            </tr>

                            </tbody>
                        </Table>
                    </div>

                </div>
            </div>

            <div className="d-flex">
                {/*<div className="m-2">*/}
                    {/*<Button onClick={getTotalData}> 전체데이터 조회 </Button>*/}
                {/*</div>*/}
                {/*<div className="m-2">*/}
                    {/*<Button onClick={getTodayData}> 오늘데이터 조회 </Button>*/}
                {/*</div>*/}


            </div>

            <div className="d-flex">
                <ExcelDownload data={excelData}
                               fileName={"마켓블리 BLCT 보유현황"}
                               button={<Button color={'success'} size={'sm'} block>
                                   <div>
                                       엑셀 다운로드
                                   </div>
                               </Button>}/>
            </div>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    // enableSorting={true}
                    // enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    // enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    frameworkComponents={agGrid.frameworkComponents}
                    rowData={dataList}
                    //onRowClicked={selectRow}
                />
            </div>
        </div>
    )
}

export default BlctStats

