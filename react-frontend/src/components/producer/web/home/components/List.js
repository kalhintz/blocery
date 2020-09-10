import React from 'react'
import classNames from 'classnames'

import { Server } from '~/components/Properties';

const Header = (props) => (
    <header className={'p-3 text-muted d-flex'}>
        {props.children}
    </header>
)

const Img = ({src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTriW0MfGtON97hgnJYkuLJS81-7OsjyNhmaAlamLu9AcLvu9Fy', onClick = () => null}) => (
    <img style={{width: 40, height: 40, objectFit: 'cover'}}
         className={'rounded-sm mr-3 cursor-pointer'}
         onClick={onClick}
         src={src}
         alt=""
    />
)

const Title = ({children, onClick = () => null}) => (
    <a className={'text-secondary cursor-pointer'} onClick={onClick} >{children}</a>
)

const Badge = ({children, onClick = () => null}) => (
    <a className={classNames('ml-auto bg-info text-white rounded-sm f7 p-1', onClick && 'cursor-pointer')} onClick={onClick}>{children}</a>
)

const List = ({
                  header,
                  headerRightSection,
                  onHeaderRightSectionClick =()=> null,
                  data,
                  titleKey,
                  subTitleKey,
                  badgeTextKey,
                  onImgClick =()=> null,
                  onTitleClick =()=> null,
                  onBadgeClick =()=> null
              }) => {
    return(
        <div className={'m-2 bg-white rounded-sm shadow-sm'}>
            <Header>
                <div>{header}</div>
                {
                    headerRightSection && <a className={'ml-auto cursor-pointer'} onClick={onHeaderRightSectionClick}>{headerRightSection}</a>
                }
            </Header>
            {
                data.map((item, index )=>
                    <div key={'listItem_'+index} className={'d-flex align-items-center border-light border-top p-3'}>
                        {
                            item.imageUrl && <Img onClick={onImgClick.bind(this, item)} src={item.imageUrl && Server.getThumbnailURL() + item.imageUrl}/>
                        }
                        <Title onClick={onTitleClick.bind(this, item)}>
                            {/*<div>{item.title}</div>*/}
                            <div>{item[titleKey]}</div>
                            {
                                subTitleKey && <div className={'f7 text-muted'}>{item[subTitleKey]}</div>
                            }
                        </Title>
                        {
                            badgeTextKey && (
                                <Badge onClick={onBadgeClick.bind(this, item)}>
                                    {item[badgeTextKey]}
                                </Badge>
                            )
                        }

                    </div>
                )
            }
        </div>
    )
}

export {
    List
}