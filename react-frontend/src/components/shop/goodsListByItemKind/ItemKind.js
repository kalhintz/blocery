import React, {useState} from 'react'
import styled from 'styled-components'
import {getValue} from '~/styledComponents/Util'
import {color} from '~/styledComponents/Properties'
import {Div, Mask} from '~/styledComponents/shared'



const Modal = styled(Div)`
    background-color: ${color.white};
    padding: 22px 0;
    & > div{
        margin-bottom: 19px;
    }
    & > div:last-child{
        margin-bottom: 0;
    }
`;

const Item = styled.div`
    font-size: ${getValue(16)};
    color: ${props => props.active ? color.green : color.dark};
    font-weight: ${props => props.active && 'bold'};
    cursor: pointer;
    text-align: center;
`;


const ItemKind = (props) => {

    const [itemKindCode, setItemKindCode] = useState(props.itemKindCode)
    
    function onClick(_itemKindCode) {
        setItemKindCode(_itemKindCode)
        props.onClick(_itemKindCode)
        props.onClose()
    }

    if(!props.item || !props.isOpen) return null
    return(
        <Mask underNav onClick={props.onClose}>
            {/*<Div bg='white' pt={22 - (19/2)} pb={22 - (19/2)}>*/}
            <Modal onClick={(e)=> e.stopPropagation()}>
                <Item active={itemKindCode === 'all'} onClick={onClick.bind(this, 'all')}>{props.item.itemName}(전체)</Item>
                {
                    props.item.itemKinds.map(itemKind =>
                        <Item key={'itemKink'+itemKind.code}
                              active={itemKindCode == itemKind.code}
                              onClick={onClick.bind(this, itemKind.code, itemKind.name)}

                        >
                            {itemKind.name}
                        </Item>
                    )
                }
            </Modal>
            {/*</Div>*/}
        </Mask>
    )
}
export default ItemKind