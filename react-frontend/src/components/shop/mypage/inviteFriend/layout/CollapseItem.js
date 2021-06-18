import React, {useState} from 'react';
import { Button, Div, Span, Flex, Hr, Right, Input } from '~/styledComponents/shared'
import {IoIosArrowUp, IoIosArrowDown} from 'react-icons/io'
import {Collapse} from 'reactstrap'
import {useModal} from "~/util/useModal";
import GradeTable from "./GradeTable";
import DetailBox from "./DetailBox";

const CollapseItem = (props) => {
    const [isOpen, setModalOpen, selected, setSelected, setIsOpen] = useModal()

    const handleClick = () => {
        setIsOpen(!isOpen)
    }
    return (
        <>
        <Div block bg={'background'} rounded={3} py={16} px={10} onClick={handleClick}
        >
            <Flex>
                <Div>등급별 보상 내역</Div>
                <Right>
                    <Div pb={2}>
                        {
                            isOpen ? <IoIosArrowDown/> : <IoIosArrowUp/>
                        }
                    </Div>
                </Right>
            </Flex>
        </Div>
           <Collapse isOpen={isOpen}>
               <GradeTable/>
               <DetailBox/>
           </Collapse>
        </>
    );
};

export default CollapseItem;
