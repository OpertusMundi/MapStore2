import { contextResourceSelector } from '@mapstore/selectors/context';
import PropTypes from 'prop-types';
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import FileItem from './FileItem';

class FileGrid extends React.Component {
    static propTypes = {
        fileItem: PropTypes.element,
        files: PropTypes.array,
        column: PropTypes.object,
        currentLocale: PropTypes.string,
        style: PropTypes.object,
    }

    static defaultProps = {
        column: { xs: 12 },
        currentLocale: 'en-US',
        //onLayerAdd: () => { },
        //onPropertiesChange: () => { },
        //onError: () => { },
        files: [],
        //zoomToLayer: true,
        //layerBaseConfig: {},
        //crs: "EPSG:3857"
    };

    renderFileItem = (file) => {
        let Item = this.props.fileItem || FileItem;
        return (
            
            <Col {...this.props.column} >
                <Item
                    name={file.name}
                    path={file.path}
                    modified={file.modified}
                    size={file.size}
                    style={{height: "215px", maxHeight: "215px"}}
                />
            </Col>
        );
    };


    render() {
        if (this.props.files) {
            let mapsList = this.props.files instanceof Array ? this.props.files : [this.props.files];
            
            return (
                <Grid className="record-grid" fluid >
                    <Col xs={12} className="mapstore-topioDrive-head-title-container text-center no-border">
                        <div className="mapstore-topioDrive-head-title" title='Topio Drive'>&nbsp;&nbsp;Topio Drive</div>
                    </Col>
                    <Row>
                        {mapsList.map(this.renderFileItem)}
                    </Row>
                </Grid>
            );
        }

        return null;
    }


}

export default FileGrid