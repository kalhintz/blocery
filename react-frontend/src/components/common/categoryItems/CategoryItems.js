import React from 'react'
// import { Link } from 'react-router-dom'
import {Server} from '~/components/Properties'
import {Icon} from '~/components/common/icons'
import {Div, Flex, Img, Button, Link} from '~/styledComponents/shared'
import {HrThin, HrHeavy, HrHeavyX2} from '~/styledComponents/mixedIn'

import styled, {css} from 'styled-components'

const margin = 33

const FlexColumnLink = styled(Link)`
    // display: block;
    display: flex;
    align-items: center;
    flex-direction: column;
    // margin-bottom: 20px; 
    // cursor: pointer;
    // text-decoration: none;
  
    width: calc(100% / 5);
    @media (max-width: 768px) {
        width: calc(100% / 6);
    }
    @media (max-width: 411px) {
        width: calc(100% / 5);
    }
`;






const CategoryItems = (props) => {
    const {data} = props

    function onClick(url) {
        props.onClick(url)
    }



    return(

        <>

        <Flex justifyContent='center' m={margin} fontSize={16}>
            <Div textAlign='center' mr={margin}>
                <Button bg={'white'} width={69} height={69} shadow mb={6} onClick={onClick.bind(this, '/mdPick')}>
                    <Icon name={'mdPick'}/>
                </Button>
                <Div>기획전</Div>
            </Div>
            <Div textAlign='center' mr={margin}>
                <Button bg={'white'} width={69} height={69} shadow mb={6} onClick={onClick.bind(this, '/home/5')}>
                    <Icon name={'medal'}/>
                </Button>
                <Div>베스트</Div>
            </Div>
            <Div textAlign='center'>
                <Button bg={'white'} width={69} height={69} shadow mb={6} onClick={onClick.bind(this, '/home/6')}>
                    <Icon name={'new'}/>
                </Button>
                <Div>신상품</Div>
            </Div>
        </Flex>
        <HrHeavyX2 bc='background'/>
        <Div>
            <Div fontSize={16} bold m={16} mt={30}>
                카테고리
            </Div>
            <Div m={16} mb={25}>
                <Flex flexWrap='wrap'>
                    {
                        data.map(item =>
                            <FlexColumnLink p={4} bg={'white'} display={'block'} mb={20} to={`/category/${item.itemNo}/all`}>
                                <Div mb={5} width={40} height={40}>
                                    {
                                        item.image ?
                                            <Img src={Server.getImageURL() + item.image.imageUrl}/> :
                                            <Div width='100%' height='100%' bc='background' rounded={3}></Div>
                                    }

                                </Div>
                                <Div fontSize={12}>{item.itemName}</Div>
                            </FlexColumnLink>
                        )
                    }
                </Flex>
            </Div>
            {/*<Div m={16} mb={25}>*/}
                {/*<Flex flexWrap='wrap'>*/}
                    {/*{*/}
                        {/*data.map(item =>*/}
                            {/*<FlexColumnLink to={`/category/${item.itemNo}/all`}>*/}
                                {/*<Div mb={5} width={40} height={40}>*/}
                                    {/*{*/}
                                        {/*item.image ?*/}
                                            {/*<Img src={Server.getImageURL() + item.image.imageUrl}/> :*/}
                                            {/*<Div width='100%' height='100%' bc='background' rounded={3}></Div>*/}

                                    {/*}*/}

                                {/*</Div>*/}
                                {/*<Div fontSize={12}>{item.itemName}</Div>*/}
                            {/*</FlexColumnLink>*/}
                        {/*)*/}
                    {/*}*/}
                {/*</Flex>*/}
            {/*</Div>*/}
            <HrThin/>


        </Div>



        </>
    )
}
export default CategoryItems