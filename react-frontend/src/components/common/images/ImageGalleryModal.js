import React, { Fragment, useState, useEffect, useRef } from 'react'
import {Server} from '~/components/Properties'
import ModalFull from '~/components/common/modals/ModalFull'
import ImageSwiper from '~/components/common/swipers/ImageSwiper'
const ImageGalleryModal = (props) => {
    const {
        imageWidth = 100,
        imageHeight = 80,
        images = [],
        modalImages = [],
        ...rest
    } = props

    const [isOpen, setIsOpen] = useState(false)

    const [initialSlide, setInitialSlide] = useState(0)

    // console.log({image, modalImages})

    function toggle(index = 0){
        setInitialSlide(index)
        setIsOpen(!isOpen)

    }

    return (
        <>
            {
                images.map((image, index) =>
                    <img
                        key={'imageGallery_'+index}
                        style={{width: imageWidth, height: imageHeight, objectFit: 'cover'}}
                        src={Server.getThumbnailURL() + image.imageUrl}
                        alt="상품사진"
                        onClick={toggle.bind(this, index)}
                        {...rest}
                    />
                )
            }

            <ModalFull show={isOpen} onClose={toggle}>
                <div className={'d-flex overflow-auto mx-auto'}>
                    <ImageSwiper images={modalImages}
                                 initialSlide={initialSlide}
                    />
                </div>
            </ModalFull>
        </>
    )

}
export default ImageGalleryModal