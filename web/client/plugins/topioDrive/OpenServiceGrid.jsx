import PropTypes from 'prop-types';
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import { connect } from 'react-redux';

import axios from '../../libs/ajax';

import { getToken } from '../../utils/SecurityUtils';

import xml2js from 'xml2js';

import { getRecords, searchAndPaginate as searchAndPaginateWMS, parseUrl } from '../../api/WMS';
import {getCatalogRecords as getCatalogRecordsWMS , getLayerFromRecord as getLayerFromRecordWMS} from '../../api/catalog/WMS';
import {searchAndPaginate as searchAndPaginateWFS, getCatalogRecords as getCatalogRecordsWFS} from '../../api/catalog/WFS';

import {getCapabilitiesURL} from '../../api/WFS';

import { addLayer } from '../../actions/catalog';

import { bindActionCreators } from 'redux';

import OpenServiceItem from './OpenServiceItem';

const capabilitiesCache = {};

class OpenServiceGrid extends React.Component {
    static propTypes = {
        fileItem: PropTypes.element,
        activeFolder: PropTypes.object,
        column: PropTypes.object,
        currentLocale: PropTypes.string,
        style: PropTypes.object,
    }

    static defaultProps = {
        column: { xs: 12 },
        currentLocale: 'en-US',
        fileLoaded: false
        //onLayerAdd: () => { },
        //onPropertiesChange: () => { },
        //onError: () => { },
        //zoomToLayer: true,
        //layerBaseConfig: {},
        //crs: "EPSG:3857"
    };
    
    state = {
        openWMSRecords: [],
        openWFSRecords: []
    }

    componentDidMount() {
        this.getOpenServices();
    }

    async getOpenServices() {
        const token = getToken();
        const api = axios.create({ withCredentials: false });
        const geodataWMSUrl = 'https://geodata.gov.gr/geoserver/wms' ;
        const parsedWMSUrl = parseUrl(geodataWMSUrl);
        api.get(parsedWMSUrl).then((response) => {
            let json;
            xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
                json = result;
            });
            capabilitiesCache[geodataWMSUrl] = {
                timestamp: new Date().getTime(),
                data: json
            };

            const paginateResponse  =  searchAndPaginateWMS(json, 0, 10, '');

            const openWMSRecords = getCatalogRecordsWMS(paginateResponse, { ...paginateResponse.layerOptions, url: geodataWMSUrl })
            this.setState({openWMSRecords})
        });

        const geodataWFSUrl = 'https://geodata.gov.gr/geoserver/wfs' ;
        api.get(getCapabilitiesURL(geodataWFSUrl, {version:"2.0.0"})).then((response) => {
            let json;
            xml2js.parseString(response.data, { explicitArray: false, stripPrefix: true }, (ignore, result) => {
                json = { ...result, url: geodataWFSUrl };
            });
            /* capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            }; */
            const paginateResponse  = searchAndPaginateWFS(json, 0, 10, '');

            const openWFSRecords = getCatalogRecordsWFS(paginateResponse, { ...paginateResponse.layerOptions, url: geodataWFSUrl })
            this.setState({ openWFSRecords })
        });

    };

    renderServiceItem = (service) => {

        let Service = this.props.service || OpenServiceItem;
        return (

            <Col {...this.props.column} >
                <Service
                    title={service.title}
                    description={service.description}
                    url={service.ogcReferences.url}
                    layerName={service.identifier || service.name} 
                    type={service.serviceType}
                    style={{ height: "215px", maxHeight: "215px" }}
                    addLayer
                />
            </Col>
        );
    };


    render() {

        /*
            <Col xs={12} className="mapstore-topioDrive-head-title-container text-center no-border">
                <div className="mapstore-topioDrive-head-title" title='Topio Drive'>&nbsp;&nbsp;Topio Drive</div>
            </Col> */
        return (
            <Grid className="folder-grid" fluid >
                <Row >
                    <Col xs={5}>
                        <div className="col-title name">Name</div>
                    </Col>
                    <Col xs={2}>
                        <div className="col-title">Type</div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-title">Description</div>
                    </Col>
                </Row>
                <Row>
                    {this.state.openWFSRecords ? this.state.openWFSRecords.map(this.renderServiceItem): null}
                    {this.state.openWMSRecords ? this.state.openWMSRecords.map(this.renderServiceItem): null}
                </Row>
            </Grid>
            
        );
    }


}



const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        addLayer: addLayer.bind(null)
    }, dispatch);
};

export default connect(null, mapDispatchToProps)(OpenServiceGrid);