import React, {useEffect, useState} from 'react';
import {Div, Flex} from "~/styledComponents/shared";

import styled from "styled-components";
import {Button, Input} from "~/styledComponents/shared";

import {FaMinusCircle, FaSearchPlus} from "react-icons/fa";
import {getGoodsByGoodsNo} from '~/lib/goodsApi'
import {BsCaretDownFill, BsCaretUpFill} from 'react-icons/bs'

const GoodsSelect = ({goodsNo, producerNo, producerFarmNm, goodsNm,
                         onClick = () => null,
                         onDeleteClick = () => null,
                         onUpClick = () => null,
                         onDownClick = () => null,
                         sort = false, //up, down 화면에 보이게 할지 여부
                     }) => {

    const [goods, setGoods] = useState()

    useEffect(() => {
        try {
            if (goodsNo){
                getGoodsByGoodsNo(goodsNo).then(res => {
                    setGoods(res.data)
                })
            }else{
                setGoods(null)
            }
        }catch (err){

        }


    }, [goodsNo])


    // const goodsSearchModalPopup = () => {
    //     //모달에서 받은값 부모 전달
    //     onChange()
    // }

    // if (!goods) return null

    return(
        <Flex>
            <Input type="text"
                   underLine
                   mr={10}
                   width={70}
                   value={goods ? goods.producerNo : ''}
                   readOnly='readonly'
                   placeholder={'생산자번호'}

            />
            <Input type="text"
                   underLine
                   mr={10}
                   width={150}
                   value={goods ? goods.producerFarmNm : ''}
                   readOnly='readonly'
                   placeholder={'생산자명'}
            />
            {/*<Div width={400}>*/}
            {/*    {goods ? goods.goodsNm : ''}*/}
            {/*</Div>*/}
            <Input type="text"
                   underLine
                   mr={10}
                   width={400}
                   value={goods ? goods.goodsNm : ''}
                   readOnly='readonly'
                   placeholder={'상품명'}
            />
            <Input type="number"
                   underLine
                   mr={10}
                   width={100}
                   value={goodsNo || ''}
                   placeholder={'상품번호'}
            />
            <Button
                bg={'green'} fg={'white'}
                px={10}
                onClick={onClick}
            >
                <FaSearchPlus /> 상품검색
            </Button>

            <Button
                ml={10}
                bg={'danger'} fg={'white'}
                onClick={onDeleteClick}><FaMinusCircle />{' 삭제'}
            </Button>
            {
                sort && (
                    <Div ml={10} fg={'white'}>
                        <Button
                            bg={'secondary'} fg={'white'}
                            px={10}
                            onClick={onUpClick} mr={8}>
                            <BsCaretUpFill/>
                        </Button>
                        <Button
                            bg={'secondary'} fg={'white'}
                            px={10}
                            onClick={onDownClick}>
                            <BsCaretDownFill/>
                        </Button>
                    </Div>
                )
            }
        </Flex>



    )
};

export default GoodsSelect;
