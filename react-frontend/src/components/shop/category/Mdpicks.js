import React from 'react'
import Swiper from 'react-id-swiper'
import {Server} from '~/components/Properties'
import {Div, Right, Flex, Span, Img, Sticky, Fixed, Link} from '~/styledComponents/shared'
import {Button} from '~/styledComponents/shared'

const MdPicks = (props) => {
    const {data} = props
    console.log({mdPicks: data})

    function onItemClick(url) {
        const state = {
            type: 'ITEM',
            payload: {
                url: url
            }
        }

        props.onClick(state)
    }
    const params = {
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        spaceBetween: 16,
        freeMode: true,
        scrollbar: {
            el: '.swiper-scrollbar',
            hide: false
        }
    }

    if(!data) return null
    return(

        <>

        <Div fontSize={16} bold mt={32} ml={16} mb={11}>
            진행중인 기획전
        </Div>

        <Swiper {...params}>
            {
                props.data.map((item, index) =>
                    <Link width={250}
                          display={'block'}
                          ml={index === 0 && 16}
                          mb={30}
                          to={`/mdPick/sub?id=${item.mdPickId}`}
                    >
                        <Img contain src={item.mdPickMainImages[0] && Server.getImageURL() + item.mdPickMainImages[0].imageUrl} alt={'기획전사진'} />
                        <Div fontSize={12} fg={'green'} mt={8}>{item.mdPickTitle}</Div>
                        <Div fontSize={14}>{item.mdPickTitle1}</Div>
                        <Div fontSize={19}>{item.mdPickTitle2}</Div>
                    </Link>
                )
            }
            <Button
                bg={'white'}
                width={100}
                height={170}
                mr={16}
                mb={30}
                bc={'light'}
                onClick={props.onClick.bind(this, `/mdPick`)}
                rounded={0}
            >
                전체보기
            </Button>
        </Swiper>
        </>
    )
}
export default MdPicks