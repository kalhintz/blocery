// https://github.com/securedeveloper/react-data-export#readme

import React from "react";
import { Button } from 'reactstrap'
import ExcelUtil from '~/util/ExcelUtil'

class ExcelDownload extends React.Component {
    constructor(props){
        super(props)
    }

    render() {
        //if(!this.props.data) return null

        return (
            <Button color={'info'} size={this.props.size ? this.props.size : 'sm'} onClick = {() => ExcelUtil.download(this.props.fileName, this.props.data)}>
                <div className="d-flex">
                    {
                        (this.props.buttonName)? this.props.buttonName : '엑셀 다운로드'
                    }
                </div>
            </Button>
        );


        // return (
        //     <ExcelFile element={this.props.button || null}  filename={!this.props.fileName ? "Download" : this.props.fileName} >
        //         <ExcelSheet dataSet={this.props.data} name={!this.props.sheetName ? "Sheet" : this.props.sheetName} />
        //     </ExcelFile>
        // );
    }
}

// ExcelDownload.propTypes = {
//     data: PropTypes.array.isRequired,
//     button: PropTypes.any
// }
// ExcelDownload.defaultProps = {
//     button: Button
// }

export default ExcelDownload