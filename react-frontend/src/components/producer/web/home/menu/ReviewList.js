import React, { useState, useEffect} from 'react'
import { getGoodsReviewListByProducerNo } from '~/lib/producerApi'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { Link } from 'react-router-dom'
import { IconStarGroup, ImageGalleryModal } from '~/components/common'
import { Server } from '~/components/Properties'

const limitedCount = 10

const ReviewList = () => {

    const [data, setData] = useState()
    const [count, setCount] = useState()
    const [isOpen, setIsOpen] = useState(false)
    const [item, setItem] = useState()

    useEffect(() => {
        getList()
    }, [])

    async function getList(){
        const { status, data } = await getGoodsReviewListByProducerNo()
        console.log({goodsReviewList: data})

        let items = []

        ComUtil.sortDate(data, 'goodsReviewDate', true)

        setCount(data.length)

        if(data.length <= limitedCount)
            items = data
        else
            items = data.slice(0,limitedCount)

        setData(items)
    }
    function toggle(){
        setIsOpen(!isOpen)
    }

    function onClick(param){
        console.log(param)
        setItem(param)
        toggle()
    }


    if(!data) return null

    return(

        <>
        <div className={'d-flex align-items-center mb-3'}>
            <div className={'text-dark'}>
                최근 상품후기
            </div>
            <div className={'ml-auto bg-danger small rounded-lg text-white d-flex align-items-center pl-2 pr-2'}>
                {ComUtil.addCommas(count)}
            </div>
        </div>
        {
            data.map((item, index) =>
                <>
                <div key={'follower_'+index} className={'d-flex align-items-start mb-1'}>
                    <img className={'rounded-sm mr-3'} style={{width: 40, height: 40, objectFit: 'cover'}}
                         src={Server.getThumbnailURL() + item.goodsImages[0].imageUrl} alt="상품사진"/>
                    <div className={'flex-grow-1'}>
                        <div className={'d-flex align-items-center'}>
                            <IconStarGroup score={item.score} />
                            <div className={'f7 text-muted ml-auto'}>{ComUtil.timeFromNow(item.goodsReviewDate)}</div>
                        </div>
                        <div className={'f5 text-dark'}>{item.goodsNm}</div>
                    </div>
                </div>
                <div className={'f5 mb-1'}>
                    <a className={'text-secondary cursor-pointer'} onClick={onClick.bind(this, item)}>{item.goodsReviewContent}</a>
                </div>

                <div className={'d-flex overflow-auto mb-3'}>
                    <ImageGalleryModal
                        imageWidth={100}
                        imageHeight={100}
                        images={item.goodsReviewImages}
                        modalImages={item.goodsReviewImages}
                        className={'flex-shrink-0'}
                    />
                </div>

                </>
            )
        }
        {
            data.length <= 0 && <div className={'text-center f5 text-muted mb-3'}>상품후기가 없습니다</div>
        }
        <div className={'text-center'}>
            <Link to={'/producer/web/goods/goodsReview'} className={'btn btn-info btn-sm'}>전체보기</Link>
        </div>


        {
            item && (
                <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
                    <ModalHeader toggle={toggle}>상품후기</ModalHeader>
                    <ModalBody className={'p-0'}>
                        <div className={'d-flex align-items-center m-4'}>
                            <img className={'rounded-sm mr-3'} style={{width: 40, height: 40, objectFit: 'cover'}}
                                 src={Server.getThumbnailURL() + item.goodsImages[0].imageUrl} alt="상품사진"/>
                            <div>{item.goodsNm}</div>
                            <div className={'ml-auto'}>
                                {ComUtil.timeFromNow(item.goodsReviewDate)}
                            </div>
                        </div>
                        <div className={'m-4'}>
                            <div className={'mb-2'}>
                                <IconStarGroup score={item.score} />
                            </div>
                            <div className={''}>{item.goodsReviewContent}</div>
                        </div>

                        <div>
                            {
                                item.goodsImages.map(image => <img className={'w-100 cursor-pointer'} src={Server.getImageURL() + image.imageUrl} alt="상품사진"/>)
                            }
                        </div>
                    </ModalBody>
                </Modal>
            )
        }

        </>
    )
}
export default ReviewList