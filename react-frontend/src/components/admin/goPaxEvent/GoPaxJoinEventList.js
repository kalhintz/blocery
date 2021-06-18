import React, { useState, useEffect } from 'react';
import {Div, Flex} from '~/styledComponents/shared'
import {getGoPaxJoinEvent} from '~/lib/adminApi'
import ComUtil from '~/util/ComUtil'

import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";

const GoPaxJoinEventList = (props) => {
    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "고객번호", field: "consumerNo", width:100},
            {headerName: "이메일", field: "email", width:200},
            {headerName: "지급BLY", field: "payedBly", width:100, cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "가입당시환율", field: "blctToWon", width:120, cellRenderer: 'formatCurrencyRenderer'},
            {
                headerName: "가입일", field: "timestamp", width:180,
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

    useEffect(()=>{
        search();
    },[])

    async function search() {
        const {data:res} = await getGoPaxJoinEvent();

        setDataList(res);
    }

    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }

    return (
        <Div>
            <Flex>신규 가입자 : {dataList.length}명</Flex>

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

export default GoPaxJoinEventList