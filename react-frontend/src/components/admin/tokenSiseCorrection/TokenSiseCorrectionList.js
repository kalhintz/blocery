import React, { useState, useEffect } from 'react';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getReservedOrderByBlctPaid } from "~/lib/adminApi";

const TokenSiseCorrection = (props) => {

    const [agGrid, setAgGrid] = useState({

        // (일자, 생산자, 상품명, 총금액, 결제수단, blct구매금액, 보정토큰양, 구매일, 구매일토큰시세, 구매확정일, 구매확정일 토큰시세)
        columnBlyToDefs: [
            {headerName: "주문번호", width: 120, field: "orderSeq"},
            {headerName: "생산자 ", width: 150, field: "farmName"},
            {headerName: "상품명 ", width: 200, field: "goodsNm"},
            {headerName: "총금액 ", width: 100, field: "orderPrice", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "결제수단 ", width: 100, field: "payMethod"},
            {headerName: "blct구매금액 ", width: 130, field: "blctToken", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "정산토큰(A) ", width: 100, field: "originalPayoutAmountBlct", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "보정토큰(B) ", width: 100, field: "siseCorrectionAmountBlct"},
            {headerName: "실지급토큰(A+B) ", width: 130, field: "payoutAmountBlct", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "구매일 ", width: 150, field: "orderDate", cellRenderer: 'formatDateRenderer'},
            {headerName: "구매일토큰시세 ", width: 130, field: "orderBlctExchangeRate"},
            {headerName: "구매확정일 ", width: 150, field: "consumerOkDate", cellRenderer: 'formatDateRenderer'},
            {headerName: "구매확정일 토큰시세 ", width: 200, field: "consumerOkBlctExchangeRate"},
        ],

        defaultColDef: {
            width: 170,
            resizable: true
        },
        frameworkComponents: {
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateRenderer: formatDateRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [data, setData] = useState([]);
    const [excelData, setExcelData] = useState();
    const [totalCorrectionBlct, setTotalCorrectionBlct] = useState();

    useEffect(() => {
        getData();

    }, []);

    const getData = async() => {
        const {data} = await getReservedOrderByBlctPaid();
        console.log(data);

        let totalCorrectionBlct = 0;
        data.map( orderDetail => {
            totalCorrectionBlct = totalCorrectionBlct + orderDetail.siseCorrectionAmountBlct;
        })

        setData(data);
        setExcelDataFunc(data);
        setTotalCorrectionBlct(totalCorrectionBlct.toFixed(2));
    }


    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        // console.log(excelData);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            '주문번호','생산자','상품명','총금액','결제수단','blct구매금액', '정산토큰(A)', '보정토큰(B)', '실지급토큰(A+B)', '구매일','구매일토큰시세','구매확정일','구매확정일 토큰시세'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {

            let orderDate = ComUtil.utcToString(item.orderDate, 'YYYY-MM-DD HH:mm:ss ')
            let consumerOkDate = ComUtil.utcToString(item.consumerOkDate, 'YYYY-MM-DD HH:mm:ss ')

            return [
                item.orderSeq, item.farmName, item.goodsNm, item.orderPrice, item.payMethod, item.blctToken, item.originalPayoutAmountBlct, item.siseCorrectionAmountBlct,
                item.payoutAmountBlct, orderDate, item.orderBlctExchangeRate, consumerOkDate, item.consumerOkBlctExchangeRate
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }


    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateRenderer({value, data:rowData}) {
        if(value !== null) {
            return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm:ss ')
        } else {
            return '-';
        }
    }

    return (
        <div className="m-2">

            <div className="d-flex p-1">

                <div className="mr-3">
                    총 보정토큰 : {totalCorrectionBlct} BLCT
                </div>
                <ExcelDownload data={excelData}
                               fileName="토큰보정내역"
                               sheetName="토큰보정내역"
                />
                <div className="flex-grow-1 text-right">
                    총 {data.length} 건
                </div>
            </div>

            <div
                className="ag-theme-balham mt-3"
                style={{
                    height: '800px'
                }}
            >
                <AgGridReact
                    enableSorting={true}
                    enableFilter={true}
                    columnDefs={agGrid.columnBlyToDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    frameworkComponents={agGrid.frameworkComponents}
                    rowData={data}
                    //onRowClicked={selectRow}
                />
            </div>
        </div>
    )
}

export default TokenSiseCorrection
