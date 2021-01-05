import React  from 'react'
import PropTypes from 'prop-types'
import { FaImages } from 'react-icons/fa'


export default class ImageUploadButton extends React.Component {
    constructor(props){
        super(props)
    }
    render(){
        return(
        <div className='buttons fadein'>

            <div className='button'>
                <label htmlFor='multi'>
                    <FaImages color='#6d84b4'/>
                </label>
                <input type='file' onChange={this.props.onChange} multiple={this.props.multiple}  accept='image/*'/>
            </div>
        </div>
        )
    }
}

ImageUploadButton.propTypes = {
    multiple: PropTypes.bool,
    onChange: PropTypes.func
}

ImageUploadButton.defaultProps = {
    multiple: false
}