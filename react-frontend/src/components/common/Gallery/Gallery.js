import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Gallery.css'
import { Server } from '../../Properties'
//TODO 나중에 x 버튼을 이미지 위로 올려줘야 할 듯함
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
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
            <div className='gallery-flex'>
                {
                    images.map(({imageNm, imageUrl}, index)=>{
                        return(
                            <img key={'gallery'+index} src={rootUrl+imageUrl} name={imageUrl} style={style} onClick={this.onClick} alt={'사진'}/>
                        )
                    })
                }
            </div>
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