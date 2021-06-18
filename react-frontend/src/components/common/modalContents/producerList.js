import React, {useEffect, useState} from 'react';
import {AgGridReact, AgGridColumn} from "ag-grid-react";
import ComUtil from "~/util/ComUtil";
import {getAllProducers} from '~/lib/adminApi'
import {Button, Div} from "~/styledComponents/shared";


const producerList = ({onClose = () => null}) => {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);

    const gridOptions = {
        // enableSorting: true,                //정렬 여부
        // enableFilter: true,                 //필터링 여부
        // enableColResize: true,              //컬럼 크기 조정
        rowHeight: 35,
        columnDefs: [
            {headerName: "선택", field: "producerNo", cellRenderer: "selectRenderer", pinned: 'left'},
            {headerName: "생산자No", field: "producerNo", width: 90},
            {headerName: "생산자", field: "farmName", width: 140},
            {headerName: "업종", field: "shopBizType", width: 140},
            {headerName: "전화번호", field: "shopPhone", width: 140},
            {headerName: "담당", field: "charger", width: 140},
            {headerName: "담당자번호", field: "chargerPhone", width: 140},
            {headerName: "수수료율%", field: "producerFeeRate", width: 140},
        ],
        defaultColDef: {
            width: 110,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        rowSelection: 'multiple',
        suppressRowClickSelection: false,   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
        frameworkComponents: {
            selectRenderer: selectRenderer,
            // giftSetRenderer: this.giftSetRenderer,
            // primeCostRenderer: this.primeCostRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        // onCellDoubleClicked: this.copy,
        // onGridReady: onGridReady.bind(this),              //그리드 init(최초한번실행)
        // onSelectionChanged: this.onSelectionChanged.bind(this),
    }

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        // search()
    }

    const search = async () => {
        const {data} = await getAllProducers()
        console.log({producers: data})
        setRowData(data)
    }

    function selectRenderer({value, data}) {
        return <Button
            py={2}
            bg={'green'} fg={'white'} px={10}
            onClick={onClose.bind(this, data)}
        >{data.farmName}</Button>
    }

    useEffect(() => {
        search()
    }, [])

    return (
        <Div>

            <div
                className="ag-theme-balham"
                style={{
                    height: '550px'
                }}
            >
                <AgGridReact
                    {...gridOptions}
                    // defaultColDef={gridOptions.defaultColDef}
                    onGridReady={onGridReady}
                    rowData={rowData}
                />
            </div>
        </Div>
    );
};

export default producerList;
