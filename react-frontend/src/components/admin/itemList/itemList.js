import React, { Component } from 'react';
import { Button, Input } from 'reactstrap'
import { ProducerFullModalPopupWithNav, Cell, BlocerySpinner, ModalConfirm } from '~/components/common'
import ItemReg from '../itemReg'
import { getItems, updateItemEnabled } from '~/lib/adminApi'
import ReactTable from "react-table"
import "react-table/react-table.css"
import matchSorter from 'match-sorter'
import Checkbox from '~/components/common/checkboxes/Checkbox'
class ItemList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            isOpen: false,
            itemNo: null,
            itemNos: [], //체크된 번호
            showEnabledButton: false,
            showDisabledButton: false
        }
    }
    componentDidMount(){
        this.search()
    }
    search = async() => {
        this.setState({loading: true})
        const {status, data } = await getItems(false)
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        this.setState({
            data: data,
            loading: false,
            itemNos: [],
            showEnabledButton: false,
            showDisabledButton: false
        })
    }
    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onClose = (isSaved) => {
        //저장 했을 경우 재검색
        if(isSaved)
            this.search()

        //창닫기
        this.toggle()
    }

    openItemPop = (itemNo) => {
        console.log(itemNo)
        this.setState({
            itemNo: itemNo || null
        })
        this.toggle()
    }
    onCheckboxChange = (value, e) => {
        const itemNos = Object.assign([], this.state.itemNos)

        if(e.target.checked){
            console.log('push', value)
            itemNos.push(value)
        }else{
            console.log('splice indexof', itemNos.indexOf(value))
            itemNos.splice(itemNos.indexOf(value), 1)
        }

        let showEnabledButton = false
        let showDisabledButton = false

        itemNos.map(itemNo => {
            this.state.data.find(d => d.itemNo === itemNo).enabled ? showDisabledButton = true : showEnabledButton = true
        })


        this.setState({itemNos,
            showEnabledButton,
            showDisabledButton
        })
    }
    onDeleteClick = (response) => {

        if(!response)
            return

        const result = this.state.itemNos.map(async (itemNo) => {
            await updateItemEnabled(itemNo)
        })

        Promise.all(result).then((response) => {
            this.setState({
                itemNos: []
            })

            this.search()
        })
    }
    //비활성
    onDisableItemClick = (response) => {
        if(!response)
            return

        this.updateEnabled(false)
    }
    //활성
    onEnableItemClick = (response) => {
        if(!response)
            return
        this.updateEnabled(true)
    }

    updateEnabled = (enabled) => {
        const result = this.state.itemNos.map(async (itemNo) => {
            await updateItemEnabled(itemNo, enabled)
        })

        Promise.all(result).then((response) => {
            this.setState({
                itemNos: [],
                showEnabledButton: false,
                showDisabledButton: false
            })

            this.search()
        })
    }

    render() {
        const { isOpen, itemNo, itemNos, showEnabledButton, showDisabledButton} = this.state
        return(
            <div>
                {/*<div>*/}
                {/*<Button color={'info'} size={'sm'} onClick={this.openTransportCompanyPop.bind(this, null)}>신규</Button>*/}
                {/*</div>*/}
                <ReactTable
                    ref={(r) => {
                        this.reactTable = r;
                    }}
                    data={this.state.data}
                    filterable
                    loading={this.state.loading}
                    loadingText={<BlocerySpinner/>}
                    showPagenation
                    onFetchData={(state, instance) => {
                        this.search()
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
                            Cell: props =>
                                <div>{props.original.value}
                                    <Checkbox bg={'green'} checked={itemNos.indexOf(props.original.itemNo) > -1 ? true : false} onChange={this.onCheckboxChange.bind(this, props.original.itemNo)} size={'sm'} />
                                </div>,
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
                                return <Cell><a className='text-primary btn' onClick={this.openItemPop.bind(this, original.itemNo)}>{value}</a></Cell>
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
                                        <Button color={'info'} size={'sm'} onClick={this.openItemPop.bind(this, null)}>신규</Button>
                                    </div>
                                    <div className='d-flex'>
                                        {
                                            showDisabledButton && (

                                                <div className="pl-1">
                                                    <ModalConfirm title={'미사용'} content={itemNos.length + '건을 미사용 하시겠습니까?'} onClick={this.onDisableItemClick}>
                                                        <Button block color={'danger'} size={'sm'}>미사용</Button>
                                                    </ModalConfirm>
                                                </div>
                                            )
                                        }
                                        {
                                            showEnabledButton && (
                                                <div className="pl-1">
                                                    <ModalConfirm title={'사용'} content={itemNos.length + '건을 사용 하시겠습니까?'} onClick={this.onEnableItemClick}>
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
                    <ProducerFullModalPopupWithNav show={isOpen} title={itemNo ? '품목 수정': '품목 등록'} onClose={this.onClose}>
                        <ItemReg
                            itemNo={itemNo}
                        />
                    </ProducerFullModalPopupWithNav>
                </div>


            </div>
        );
    }
}
export default ItemList;