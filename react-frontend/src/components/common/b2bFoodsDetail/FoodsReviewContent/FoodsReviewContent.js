import React, { Fragment } from 'react'
import ComUtil from '~/util/ComUtil'
import FoodsReviewItem from './FoodsReviewItem'
import { NoSearchResultBox, IconStarGroup, HeaderTitle, ModalButton, ImageGalleryModal } from '~/components/common'
import MoreButton from '../MoreButton'
import {Server} from '~/components/Properties'

const FoodsReviewContent = ({foodsReviews, totalCount, isVisibleStar, onMoreClick, isVisibleTitle}) => {
    function getAvgScore() {
        return totalCount === 0 ? 0 : ComUtil.sum(foodsReviews, 'score') / totalCount
    }

    function getRows() {
        const row = []
        foodsReviews.map((foodsReview, index) => {
            if(isVisibleTitle){
                row.push(
                    <div key={'foodsReviewContent'+index}>
                        <hr className='m-0'/>
                        <div  className='m-3'>
                            <span className='d-flex align-items-center text-secondary f6 mb-1 mt-2'>
                                <img className='mr-1 rounded' style={{width: 40, height: 40, objectFit: 'cover'}}
                                     src={Server.getThumbnailURL() + foodsReview.goodsImages[0].imageUrl} alt={'상품사진'} />
                                <span className='ml-2'>{foodsReview.goodsNm}</span>
                            </span>
                        </div>
                    </div>
                )
            } else {
                row.push(
                    <hr key={'foodsReviewContentHr'+index} className='m-0'/>
                )
            }
            row.push(
                <FoodsReviewItem key={'foodsReviewItem'+foodsReview.orderSeq} {...foodsReview}/>
            )
            return row
        })
        return row
    }


    return (
        <Fragment>
            {
                isVisibleStar && (
                    <HeaderTitle
                        sectionLeft={
                            <Fragment>
                                <span className='mr-2'>총 {ComUtil.addCommas(totalCount)}개 후기</span>
                                |<span className='d-flex ml-2 mr-2'><IconStarGroup score={ComUtil.roundDown(getAvgScore(),1)} /></span>
                                <span className='mr-2'>{ComUtil.roundDown(getAvgScore(),1)}</span>
                            </Fragment>
                        }
                        // sectionRight={
                        //
                        //     <ModalButton title={'안내'} label={'후기 작성'} onClick={()=>true}>
                        //         <div className={'p-3 text-center text-secondary'}><span className={'text-dark font-weight-bold'}>마이페이지 > 상품후기</span> 를 작성하고 <br/>최대 <span className={'text-info font-weight-bold'}>20BLCT</span> 적립 하세요</div>
                        //     </ModalButton>
                        // }
                    />
                )
            }
            {
                !isVisibleStar && (
                    <HeaderTitle
                        sectionLeft={
                            <span className='mr-2'>총 {ComUtil.addCommas(totalCount)}개 후기</span>
                        }
                    />
                )
            }
            {
                totalCount === 0 && <hr className='m-0'/>
            }
            {
                getRows()
            }
            {
                foodsReviews.length < totalCount && <MoreButton onClick={onMoreClick}>({foodsReviews.length}/{totalCount})</MoreButton>
            }
            {
                foodsReviews.length <= 0 && <NoSearchResultBox>구매후기가 없습니다</NoSearchResultBox>
            }


            {/*<div className='text-center p-2 ml-2 mr-2 mb-2 border bg-light text-secondary f6' onClick={onMoreClick}>더보기</div>*/}
        </Fragment>
    )
}
export default FoodsReviewContent