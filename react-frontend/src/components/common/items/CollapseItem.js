import React from 'react';
import {  Div, Flex, Right } from '~/styledComponents/shared'
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import {Collapse} from 'reactstrap'
import {useModal} from "~/util/useModal";

const CollapseItem = ({title, children}) => {
    const [isOpen, setModalOpen, selected, setSelected, setIsOpen] = useModal()

    const handleClick = () => {
        setIsOpen(!isOpen)
    }
    return (
        <>
        <Div block bg={'background'} rounded={3} p={16} cursor onClick={handleClick}>
            <Flex>
                <Div fw={500}>{title}</Div>
                <Right>
                    <Div pb={2}>
                        {
                            !isOpen ? <IoIosArrowDown/> : <IoIosArrowUp/>
                        }
                    </Div>
                </Right>
            </Flex>
        </Div>
           <Collapse isOpen={isOpen}>
               {children}
           </Collapse>
        </>
    );
};

export default CollapseItem;
