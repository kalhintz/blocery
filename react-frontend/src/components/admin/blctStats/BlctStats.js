import React, { useState, useEffect } from 'react';
import { Button, Table } from 'reactstrap';
import { getBlctStats, getMonthlyBlctStats, getAllSupportersBlct, getAllBlyTimeRewardBlct, getAllEventRewardBlct } from "~/lib/adminApi";
import { getTotalSwapBlctToBly, getTotalSwapBlctIn } from "~/lib/swapApi"
import { getManagerBlctBalance } from "~/lib/smartcontractApi"
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
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
            {headerName: "이지팜 외부지갑 송금 BLCT", width: 180, field: "totalTempProducerSent"},
        ],
        defaultColDef: {
            width: 170,
            resizable: true
        },
        frameworkComponents: {
            startEndRenderer: startEndRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [supportersBlct, setSupportersBlct] = useState(0);
    const [blyTimeRewardBlct, setBlyTimeRewardBlct] = useState(0);
    const [eventRewardBlct, setEventRewardBlct] = useState(0);
    const [swapBlctToBly, setSwapBlctToBly] = useState(0);
    const [swapBlctIn, setSwapBlctIn] = useState(0);

    const initialBlctEco = 1137800;
    const mission1EventBlct = 204910;
    const mission2EventBlct = 245250;
    const cobakEventBlct = 74400;  // 4/29일 추가로 400 더 지급함 (74,000 + 400)
    // const supportersBlct = 14500;   // txid: b446b254d1fec8917f3fff47349399ea5e85d128a9cc4b4612d0011c93467af9     6fad71d9558470cafcae535ff879e8af867fa59cfcd3cb548691bfffdb8120f9
    const loss = 131.98 + 197.5 + 330 + 0.825999069958925 - 19.31000024;  // 2020-08-10 포텐타임 수박 환불 197.5 추가, 2020-08-24 수박 환불 330 추가
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
            '[생산자(팜토리 외)] 판매보상', '[에스크로] 구매추가 BLCT', '[에스크로] 정산완료 BLCT', 'Blcery 수익(수수료)', '이지팜 외부지갑 송금 BLCT'
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
        // console.log("swap :::: " + swapBlctToBly);
        setSwapBlctToBly(swapBlctToBly.blctSum)

        const {data:swapBlctIn} = await getTotalSwapBlctIn();
        setSwapBlctIn(swapBlctIn);

        const {data:_supportersBlct} = await getAllSupportersBlct();
        setSupportersBlct(_supportersBlct);

        const {data:_blyTimeRewardBlct} = await getAllBlyTimeRewardBlct();
        setBlyTimeRewardBlct(_blyTimeRewardBlct);

        const {data:_eventRewardBlct} = await getAllEventRewardBlct();
        setEventRewardBlct(_eventRewardBlct);

        const startDate = '20190901'
        const endDate = getTodayYYYYMMDD();

        getSummaryData(startDate, endDate).then((response) => {

            // console.log(response);

            let summaryData = {}
            let totalEventBlct = mission1EventBlct + mission2EventBlct + cobakEventBlct + _supportersBlct + _blyTimeRewardBlct + _eventRewardBlct;
            summaryData.consumerBlct = totalEventBlct - response.totalBlctOrder + response.totalConsumerRewardBlct - swapBlctToBly.blctSum + swapBlctIn;
            summaryData.farmtoryBlct = response.totalFarmtoryOrderBlct + response.totalFarmtoryRewardBlct;
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
                                </tr>

                                <tr>
                                    <td> 팜토리 생산자 지갑 : 상품판매금액 + 판매보상 </td>
                                    <td> {ComUtil.toCurrency(summaryData.farmtoryBlct)} </td>
                                </tr>

                                <tr>
                                    <td> 생산자(팜토리 외) 상품판매 </td>
                                    <td> {ComUtil.toCurrency(summaryData.producerOrderBlct)} </td>
                                </tr>

                                <tr>
                                    <td> (이지팜 외부지갑 송금 토큰 - 현금대납 완료) </td>
                                    <td> ({ComUtil.toCurrency(summaryData.tempProducerSentBlct)}) </td>
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

                                <tr>
                                    <td> 유실(소비자 취소환불 327.5, 코박 0.7, 테스트2회, 소수점 오차) </td>
                                    <td> {loss} </td>
                                </tr>

                                <tr>
                                    <td> 합계 </td>
                                    <td> {ComUtil.toCurrency(summaryData.totalSum)} </td>
                                </tr>
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
                    enableSorting={true}
                    enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    enableColResize={true}
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

