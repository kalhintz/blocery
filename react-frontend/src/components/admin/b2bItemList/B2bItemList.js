import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'reactstrap'
import { ProducerFullModalPopupWithNav, Cell, BlocerySpinner, ModalConfirm } from '~/components/common'
import B2bItemReg from '../b2bItemReg';
import { getB2bItems, updateB2bItemEnabled } from '~/lib/adminApi'
import ReactTable from "react-table"
import "react-table/react-table.css"
import matchSorter from 'match-sorter'
import { Checkbox } from '@material-ui/core'


const B2bItemList = (props) => {

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [itemNo, setItemNo] = useState(null);
    const [itemNos, setItemNos] = useState([]);
    const [showEnabledButton, setShowEnabledButton] = useState(false);
    const [showDisabledButton, setShowDisabledButton] = useState(false);

    const refReactTable = useRef(null);

    useEffect(() => {
        search();
    }, [])

    const search = async() => {
        setLoading(true);
        const {status, data} = await getB2bItems(false);
        console.log('search status : ', status , ', data : ', data);
        if(status !== 200) {
            setLoading(false);
            alert('응답이 실패하였습니다.');
            return
        }

        setData(data);
        setLoading(false);
    }

    const toggle = () => {
        setIsOpen(!isOpen);
    }

    const onClose = (isSaved) => {
        // 저장했을 경우 재검색
        if(isSaved)
            search();

        // 창닫기
        toggle();
    }

    const openItemPop = (itemNo) => {
        console.log(itemNo);
        setItemNo(itemNo);
        toggle();
    }

    const onCheckboxChange = (value, e) => {
        const newItemNos = Object.assign([], itemNos);

        if(e.target.checked) {
            console.log('push ', value);
            newItemNos.push(value);
        } else {
            console.log('splice indexOf ', newItemNos.indexOf(value));
            newItemNos.splice(newItemNos.indexOf(value), 1);
        }

        setShowEnabledButton(false);
        setShowDisabledButton(false);

        newItemNos.map(itemNo => {
            data.find(d => d.itemNo === itemNo).enabled ? setShowDisabledButton(true) : setShowEnabledButton(true)
        })

        setItemNos(newItemNos);
    }

    const onDeleteClick = (response) => {
        if(!response)
            return

        const result = itemNos.map(async(itemNo) => {
            await updateB2bItemEnabled(itemNo)
        })

        Promise.all(result).then((response) => {
            setItemNos([]);
            search();
        })
    }

    // 비활성
    const onDisableItemClick = (response) => {
        if(!response)
            return
        updateEnabled(false);
    }

    // 활성
    const onEnableItemClick = (response) => {
        if(!response)
            return
        updateEnabled(true)
    }

    const updateEnabled = (enabled) => {
        const result = itemNos.map(async (itemNo) => {
            await updateB2bItemEnabled(itemNo, enabled);
        })

        Promise.all(result).then((response) => {
            setItemNos([]);
            setShowEnabledButton(false);
            setShowDisabledButton(false);
            search();
        })
    }

    return(
        <div>
            <ReactTable
                ref={refReactTable}
                data={data}
                filterable
                loading={loading}
                loadingText={<BlocerySpinner/>}
                showPagenation
                onFetchData={(state, instance) => {
                    search()
                }}
                columns={[
                    {
                        Header: '품목번호',
                        accessor: 'itemNo',
                        // Cell: props => <Cell textAlign='center'>{props.value}</Cell>,
                        Cell: props => <Cell>{props.value}</Cell>,
                        filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                        filterAll: true,
                        width: 80
                    },
                    {
                        Header: '선택',
                        accessor: '',
                        Cell: props => <div>{props.original.value}<Checkbox color={'default'} checked={itemNos.indexOf(props.original.itemNo) > -1 ? true : false} onChange={onCheckboxChange.bind(this, props.original.itemNo)}/></div>,
                        // filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                        // filterAll: true,
                        filterable: false,
                        width: 60
                    },
                    {
                        Header: '상태',
                        accessor: 'enabled',
                        Cell: props => <Cell>{props.value ? '사용':'미사용'}</Cell>,
                        filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                        filterAll: true,
                        width: 80
                    },
                    {
                        Header: '품목명',
                        accessor: 'itemName',
                        Cell: props => {
                            const { value, original } = props
                            // return <Button size={'sm'} color='info' onClick={this.openTransportCompanyPop.bind(this, original.transportCompanyNo)}>{value}</Button>
                            return <Cell><a className='text-primary btn' onClick={openItemPop.bind(this, original.itemNo)}>{value}</a></Cell>
                        },
                        filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                        filterAll: true,
                        width: 100
                    },

                    {
                        id: 'itemKinds',
                        Header: '품종명 (,로 분리)',
                        //accessor: d => JSON.stringify(d.itemKinds).replace(/"|null|\[|\]/g, ''), //버터헤드로메인 붙어나오는 현상이 있어서 stringify 추가하고 null,",[,] 제거.
                        accessor: d => {let kinds=''; d.itemKinds.map( oneKind => {kinds += oneKind.name+', '}); return kinds; }, //버터헤드로메인 붙어나오는 현상이 있어서 stringify 추가하고 null,",[,] 제거.
                        Cell: props => <Cell>{props.value}</Cell>,
                        filterMethod: (filter, rows) => matchSorter(rows, filter.value, { keys: [filter.id] }),
                        filterAll: true,
                        width: 500
                    },

                ]}
                defaultPageSize={20}
                className="-striped -highlight"
            >
                {(state, makeTable, instance) => {
                    let recordsInfoText = "";

                    const { filtered, pageRows, pageSize, sortedData, page } = state;

                    if (sortedData && sortedData.length > 0) {
                        let isFiltered = filtered.length > 0;

                        let totalRecords = sortedData.length;

                        let recordsCountFrom = page * pageSize + 1;

                        let recordsCountTo = recordsCountFrom + pageRows.length - 1;

                        if (isFiltered)
                            recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건(필터링됨)`;
                        else
                            recordsInfoText = `${recordsCountFrom}-${recordsCountTo} of ${totalRecords} 건`;
                    } else recordsInfoText = "No records";

                    return (
                        <div className="main-grid">
                            <div className="d-flex p-1">
                                <div className="pl-1">
                                    <Button color={'info'} size={'sm'} onClick={openItemPop.bind(this, null)}>신규</Button>
                                </div>
                                <div className='d-flex'>
                                    {
                                        showDisabledButton && (

                                            <div className="pl-1">
                                                <ModalConfirm title={'미사용'} content={itemNos.length + '건을 미사용 하시겠습니까?'} onClick={onDisableItemClick}>
                                                    <Button block color={'danger'} size={'sm'}>미사용</Button>
                                                </ModalConfirm>
                                            </div>
                                        )
                                    }
                                    {
                                        showEnabledButton && (
                                            <div className="pl-1">
                                                <ModalConfirm title={'사용'} content={itemNos.length + '건을 사용 하시겠습니까?'} onClick={onEnableItemClick}>
                                                    <Button block color={'success'} size={'sm'}>사용</Button>
                                                </ModalConfirm>
                                            </div>
                                        )
                                    }

                                </div>
                                <div className="flex-grow-1 text-right">
                                    {recordsInfoText}
                                </div>
                            </div>
                            {makeTable()}
                        </div>
                    );
                }}
            </ReactTable>
            <div>
                <ProducerFullModalPopupWithNav show={isOpen} title={itemNo ? '품목 수정': '품목 등록'} onClose={onClose}>
                    <B2bItemReg
                        itemNo={itemNo}
                    />
                </ProducerFullModalPopupWithNav>
            </div>


        </div>
    )
}

export default B2bItemList