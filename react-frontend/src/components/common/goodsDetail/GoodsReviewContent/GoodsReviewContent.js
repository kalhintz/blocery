import React, { Fragment } from 'react'
import ComUtil from '~/util/ComUtil'
import GoodsReviewItem from './GoodsReviewItem'
import { NoSearchResultBox, IconStarGroup, HeaderTitle, ModalButton, ImageGalleryModal } from '~/components/common'
import MoreButton from '../MoreButton'
import {Server} from '~/components/Properties'

const GoodsReviewContent = ({goodsReviews, totalCount, isVisibleStar, onMoreClick, isVisibleTitle}) => {
    function getAvgScore() {
        return totalCount === 0 ? 0 : ComUtil.sum(goodsReviews, 'score') / totalCount
    }

    function getRows() {
        const row = []
        goodsReviews.map((goodsReview, index) => {
            if(isVisibleTitle){
                row.push(
                    <div key={'goodsReviewContent'+index}>
                        <hr className='m-0'/>
                        <div  className='m-3'>
                            <span className='d-flex align-items-center text-secondary f6 mb-1 mt-2'>
                                <img className='mr-1 rounded' style={{width: 40, height: 40, objectFit: 'cover'}}
                                     src={Server.getThumbnailURL() + goodsReview.goodsImages[0].imageUrl} alt={'상품사진'} />
                                <span className='ml-2'>{goodsReview.goodsNm}</span>
                            </span>
                        </div>
                    </div>
                )
            } else {
                row.push(
                    <hr key={'goodsReviewContentHr'+index} className='m-0'/>
                )
            }
            row.push(
                <GoodsReviewItem key={'goodsReview'+index} {...goodsReview}/>
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
                                <span className='mr-2'>총 {(totalCount == -1)? 0:ComUtil.addCommas(totalCount)}개 후기</span>
                                |<span className='d-flex ml-2 mr-2'><IconStarGroup score={ComUtil.roundDown(getAvgScore(),1)} /></span>
                                <span className='mr-2'>{ComUtil.roundDown(getAvgScore(),1)}</span>
                            </Fragment>
                        }
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
                goodsReviews.length < totalCount && <MoreButton onClick={onMoreClick}>({goodsReviews.length}/{totalCount})</MoreButton>
            }
            {
                goodsReviews.length <= 0 && <NoSearchResultBox>구매후기가 없습니다</NoSearchResultBox>
            }


            {/*<div className='text-center p-2 ml-2 mr-2 mb-2 border bg-light text-secondary f6' onClick={onMoreClick}>더보기</div>*/}
        </Fragment>
    )
}
export default GoodsReviewContent