import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Server } from '../../Properties'
import {Div} from '~/styledComponents/shared/Layouts'
import styled from 'styled-components'

const Wrap = styled(Div)`
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
    
    img {
        margin: 2px;
        border: 1px #cccccc solid;
    }
`;

export default class Gallery extends Component {
    constructor(props) {
        super(props)
    }

    onClick = (e) => {
        this.props.onClick(e)
    }

    render() {
        const { images, style } = this.props
        const rootUrl = Server.getServerURL() + `/${this.props.directory}/`
        return(
            <Wrap>
                {
                    images.map(({imageNm, imageUrl}, index)=>{
                        return(
                            <img key={'gallery'+index} src={rootUrl+imageUrl} name={imageUrl} style={style} onClick={this.onClick} alt={'사진'}/>
                        )
                    })
                }
            </Wrap>
        )
    }
}

Gallery.propTypes = {
    directory: PropTypes.string.isRequired, //images : 원본, thumnail : 썸네일
    style: PropTypes.object
}

Gallery.defaultProps = {
    style: {
        width: 60,
        height: 60
    },
    directory: 'thumbnails'
}