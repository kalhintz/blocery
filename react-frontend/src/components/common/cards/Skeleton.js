import React from 'react'
import {Div, Flex} from '~/styledComponents/shared/Layouts'
import styled, {keyframes} from 'styled-components'
import {color} from '~/styledComponents/Properties'

const linearGradientAnimation = keyframes`
    0% {
		background-position: 0% 50%;
	}
	50% {
		background-position: 100% 50%;
	}
	100% {
		background-position: 0% 50%;
	}
`;

const SkeletonContainer = styled(Div)`    
    & > div:last-child {
        margin: 0;
    }
`;

const RowDiv = styled(Div)`
    background: linear-gradient(45deg, ${color.white}, ${color.light});
	background-size: 400% 400%;
	animation: ${linearGradientAnimation} 2s ease infinite;
`;

const LoopContainer = (props) => {
    const {count = 1, children, ...rest} = props
    return (
        <SkeletonContainer p={16} bg={'white'} {...rest}>
            {
                [...Array(count)].map((num, index) => (
                    <Div mb={32} key={'skeleton_item'+index}>
                        {children}
                    </Div>
                ))
            }
        </SkeletonContainer>)
}

const Skeleton = (props) => {
    const {count, ...rest} = props
    return (
        <LoopContainer count={count} {...rest}>
            <Row width={'40%'} mb={16}></Row>
            <Row mb={16}></Row>
            <Row mb={16}></Row>
            <Row width={'60%'}></Row>
        </LoopContainer>
    )
}


const Row = (props) => {
    const {...rest} = props
    return <RowDiv bg={'background'} height={16} {...rest}></RowDiv>
}

const List = (props) => {
    const {count, ...rest} = props
    return (
        <LoopContainer count={count} {...rest}>
            <Row mb={16}></Row>
            <Row mb={16}></Row>
            <Row mb={16} ></Row>
            <Row></Row>
        </LoopContainer>
    )
}


const ProductList = props => {
    const {count, circle = false, ...rest} = props
    return (
        <LoopContainer count={count} {...rest}>
            <Flex alignItems={'flex-start'}>
                <RowDiv rounded={circle && '50%'} bg={'light'} width={60} height={60} mr={16}></RowDiv>
                <Div flexGrow={1}>
                    <Row width={'30%'} mb={16}></Row>
                    <Row mb={16}></Row>
                    <Row mb={16}></Row>
                </Div>
            </Flex>
        </LoopContainer>
    )
}

Skeleton.Row = Row
Skeleton.List = List
Skeleton.ProductList = ProductList

export default Skeleton
export {Row, List, ProductList}