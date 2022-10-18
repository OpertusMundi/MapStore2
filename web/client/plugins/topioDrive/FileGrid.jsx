import PropTypes from 'prop-types';
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';
import FileItem from './FileItem';

class FileGrid extends React.Component {
    static propTypes = {
        fileItem: PropTypes.element,
        activeFolder: PropTypes.object,
        column: PropTypes.object,
        currentLocale: PropTypes.string,
        style: PropTypes.object,
        changeFolder: PropTypes.func
    }

    static defaultProps = {
        column: { xs: 12 },
        currentLocale: 'en-US',
        //onLayerAdd: () => { },
        //onPropertiesChange: () => { },
        //onError: () => { },
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
                    type={file.type}
                    changeFolder={this.props.changeFolder}
                    style={{ height: "215px", maxHeight: "215px" }}
                />
            </Col>
        );
    };


    render() {
        if (this.props.activeFolder) {
            let contents = []
            this.props.activeFolder.files.forEach(file=> {
                let fileJson = file
                fileJson['type'] = 'file';
                contents.push(fileJson);
            })
            this.props.activeFolder.folders.forEach(folder=> {
                let folderJson = folder
                folderJson['type'] = 'folder';
                contents.push(folderJson);
            })
            /*
                <Col xs={12} className="mapstore-topioDrive-head-title-container text-center no-border">
                    <div className="mapstore-topioDrive-head-title" title='Topio Drive'>&nbsp;&nbsp;Topio Drive</div>
                </Col> */
            return (
                <Grid className="folder-grid" fluid >
                    <Row >
                        <Col xs={4}>
                            <div className="col-title name">Name</div>
                        </Col>
                        <Col xs={4}>
                            <div className="col-title">Size</div>
                        </Col>
                        <Col xs={4}>
                            <div className="col-title">Modified</div>
                        </Col>
                    </Row>
                    <Row>
                        {contents.map(this.renderFileItem)}
                    </Row>
                </Grid>
            );
        }

        return null;
    }


}

export default FileGrid