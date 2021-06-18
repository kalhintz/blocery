import React, { useState, useEffect } from 'react';
import {Div, Flex} from '~/styledComponents/shared'

import ComUtil from '~/util/ComUtil'
import { getGoPaxCardEvent } from '~/lib/adminApi'
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

const GoPaxCardEventList = (props) => {
    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "고객번호", field: "consumerNo", width:100},
            {headerName: "이메일", field: "email", width:200},
            {headerName: "주문가격", field: "orderPrice", width:100, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "카드결제액", field: "cardPrice", width:100, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "건당지급금액", field: "payedWon", width:150, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "지급BLY", field: "payedBly", width:120, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "확정당시환율", field: "blctToWon", width:150, cellRenderer: 'formatCurrencyRenderer'},
            {
                headerName: "확정일시", field: "timestamp", width:180,
                valueGetter: function(params) {
                    return ComUtil.utcToString(params.data.timestamp,'YYYY-MM-DD HH:mm');
                }
            }
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
            formatCurrencyRenderer: formatCurrencyRenderer
        },
    })
    const [dataList, setDataList] = useState([]);
    const [totalPayedWon, setTotalPayedWon] = useState(0);

    useEffect(() => {
        search();
    }, [])

    async function search(){
        const {data:res} = await getGoPaxCardEvent();

        setDataList(res);
        sumPayedWon(res);
    }

    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }

    // 지급 bly 금액 합
    function sumPayedWon(res) {
        let sumPayedWon = 0;
        const rows = res.map(({payedWon}) => {
            sumPayedWon += payedWon
        })

        setTotalPayedWon(sumPayedWon)
    }

    return(
        <Div>
            <Flex>지급금액 합 : {ComUtil.addCommas(totalPayedWon)}원</Flex>

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
        </Div>
    )
}

export default GoPaxCardEventList