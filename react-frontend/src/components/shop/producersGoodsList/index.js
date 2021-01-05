import  React, { Fragment, useState, useEffect } from 'react';
import { ShopXButtonNav, SlideItemHeaderImage, SlideItemContent, HeaderTitle } from '~/components/common'
import { getConsumerGoodsByProducerNoSorted, getConsumerGoodsByProducerNoAndItemNoSorted } from '~/lib/goodsApi'
import { getItems } from '~/lib/adminApi'
import { Container, Row, Col } from 'reactstrap'
import { ViewButton, NoSearchResultBox, BlocerySpinner } from '~/components/common'
import { MdViewModule, MdViewStream } from "react-icons/md";
import ComUtil from '~/util/ComUtil'
import ModalCheckListGroup from '~/components/common/modals/ModalCheckListGroup'
import { Server } from '~/components/Properties'

const sorters = [
    {value: 1, label: '최신', sorter: {direction: 'DESC', property: 'timestamp'}},
    //TODO: 인기는 현재 적용불가(backend 배치에서 작업해야 할 것으로 보임)
    // {value: 2, label: '인기'},
    {value: 3, label: '예약할인', sorter: {direction: 'DESC', property: 'saleEnd'}},
    {value: 4, label: '낮은가격', sorter: {direction: 'ASC', property: 'currentPrice'}},
    {value: 5, label: '높은가격', sorter: {direction: 'DESC', property: 'currentPrice'}},
    {value: 6, label: '할인율', sorter: {direction: 'DESC', property: 'discountRate'}},
]

const initFilter = {value: -1, label: '전체품목'}
const initSorter = sorters[0].sorter

const ProducersGoodsList = (props) => {
    //const { producerNo } = props.match.params
    const { producerNo } = ComUtil.getParams(props)
    const [goodsList, setGoodsList] = useState([])                          //상품목록
    const [viewIndex, setViewIndex] = useState(0)

    const [loading, setLoading] = useState(true)

    const [filters, setFilters] = useState([initFilter])
    const [filter, setFilter] = useState(initFilter)
    const [sorter, setSorter] = useState(initSorter)

    useEffect(() => {
        async function fetch(){
            const { data } = await getItems(true)       //품목
            const _filters = data.map(item => ({value: item.itemNo, label: item.itemName}))
            setFilters(filters.concat(_filters))

            search(filter, sorters[0].sorter)   //상품조회

            window.scrollTo(0,0)
        }
        fetch()
    }, [])

    async function search(filter, sorter) {
        setLoading(true)

        if(producerNo){
            //필터의 품목이 전체선택일 경우 정렬만 적용하여 상품조회
            if(filter.value === -1){
                const {data} = await getConsumerGoodsByProducerNoSorted(producerNo, sorter)
                setGoodsList(data)
            }
            //필터의 품목이 있을 경우 품목, 정렬 둘다 적용하여 상품조회
            else{
                const {data} = await getConsumerGoodsByProducerNoAndItemNoSorted(producerNo, filter.value, sorter)
                setGoodsList(data)
            }
        }

        setLoading(false)
    }

    function onViewChange(iconIndex) {
        setViewIndex(iconIndex)
    }

    function onFilterChange(item) {
        setFilter(item)         //선택한 필터 저장
        search(item, sorter)
    }

    function onSortChange(item) {
        setSorter(item.sorter)  //선택한 정렬 저장
        search(filter, item.sorter)
    }

    function movePage(goodsNo) {
        // Webview.closePopupAndMovePage(`/goods?goodsNo=${goodsNo}`)
        props.history.push(`/goods?goodsNo=${goodsNo}`)
    }

    return(
        <div>
            {
                loading && <BlocerySpinner/>
            }
            <ShopXButtonNav fixed
                //forceBackUrl={`/farmersDetailActivity?producerNo=${producerNo}`}
                            history={props.history} historyBack>판매상품</ShopXButtonNav>
            <HeaderTitle
                sectionLeft={<div>총 {ComUtil.addCommas(goodsList.length)}개 상품</div>}
                sectionRight={
                    <Fragment>
                        <ModalCheckListGroup
                            title={'필터 설정'}
                            className={'f6 mr-2'}
                            data={filters}
                            value={filters[0].value}
                            onChange={onFilterChange}
                        />
                        <ModalCheckListGroup
                            title={'정렬 설정'}
                            className={'f6 mr-2'}
                            data={sorters}
                            value={sorters[0].value}
                            onChange={onSortChange}
                        />
                        <ViewButton icons={[<MdViewModule />, <MdViewStream />]} onChange={onViewChange} />
                    </Fragment>
                }
            />
            <hr className='mt-0 mb-2'/>
            {
                goodsList.length <= 0 ? <NoSearchResultBox>조회된 내용이 없습니다</NoSearchResultBox> : (
                    <div className='mb-2 ml-2'>
                        <Container>
                            <Row>
                                {
                                    goodsList.map(goods =>
                                        <Col
                                            key={'goods'+goods.goodsNo}
                                            xs={viewIndex === 0 ? 6 : 12}
                                            sm={viewIndex === 0 ? 4 : 12}
                                            lg={viewIndex === 0 ? 3 : 12}
                                            xl={viewIndex === 0 ? 2 : 12}
                                            className='p-0'
                                            onClick={movePage.bind(this, goods.goodsNo)}
                                        >
                                            <div className='mr-2 mb-2 border'
                                                // onClick={movePage.bind(this, {type: 'GOODS_DETAIL', payload: {goodsNo: goods.goodsNo}})}
                                            >
                                                <SlideItemHeaderImage
                                                    imageHeight={viewIndex === 0 ? 150 : 250}
                                                    // saleEnd={goods.saleEnd}
                                                    imageUrl={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}
                                                    discountRate={Math.round(goods.discountRate)}
                                                    remainedCnt={goods.remainedCnt}
                                                    blyReview={goods.blyReviewConfirm}
                                                />
                                                <SlideItemContent
                                                    className={'p-2'}
                                                    directGoods={goods.directGoods}
                                                    goodsNm={goods.goodsNm}
                                                    currentPrice={goods.currentPrice}
                                                    consumerPrice={goods.consumerPrice}
                                                    discountRate={goods.discountRate}
                                                />
                                            </div>
                                        </Col>
                                    )
                                }

                            </Row>
                        </Container>
                    </div>
                )
            }
        </div>
    )
}

export default ProducersGoodsList