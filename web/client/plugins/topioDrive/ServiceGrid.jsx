import PropTypes from 'prop-types';
import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import { connect } from 'react-redux';

import axios from '../../libs/ajax';

import { getToken } from '../../utils/SecurityUtils';

import xml2js from 'xml2js';

import { getRecords, searchAndPaginate, parseUrl } from '../../api/WMS';
import { getCatalogRecords, getLayerFromRecord } from '../../api/catalog/WMS';

import { addLayer } from '../../actions/catalog';

import { bindActionCreators } from 'redux';

import ServiceItem from './ServiceItem';

const capabilitiesCache = {};

class ServiceGrid extends React.Component {
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

    componentDidMount() {
        this.getOpenData();
    }

    async getOpenData() {
        const token = getToken();
        const api = axios.create({ withCredentials: false });
        const config = {
            headers: { 'Authorization': `Bearer ${token}` },
            withCredentials: false,
        };
        for (let page = 0; page < 11; page++) {
            const url = 'https://beta.topio.market/api/catalogue?page=' + page + '&size=20&orderBy=PUBLICATION_DATE&order=DESC&text=&openDataset=true';
            api.get(url, config)
                .then(function (response) {
                    const items = response.data.result.items;
                    //console.log(items);
                    items.map(i => {
                        if (i.ingestionInfo) {
                            console.log(i);
                        }
                    });
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        /* this.fetchRecords(url, '', 0, 100, '')
        .then ((response) => {
            const service = response.service;
            const catalogRecords = getCatalogRecords(response, {...response.layerOptions, url: url })
            getLayerFromRecord(catalogRecords[0], {    ...response.layerOptions}, true )
            .then( (result) => {
                this.props.addLayer(result, catalogRecords[0]);
            });
         })
         .catch(function (error) {
              console.log(error);
             });  */

    };

    fetchRecords = (url, config, startPosition, maxRecords, text) => {
        const S1api = axios.create();
        const cached = capabilitiesCache[url];
        /* if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text));
            });
        } */
        //return axios.get(parseUrl(url)).then((response) => {
        return S1api.get(parseUrl(url), config).then((response) => {
            let json;
            xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
                json = result;
            });
            const records = json.WMS_Capabilities.Capability.Layer.Layer;
            capabilitiesCache[url] = {
                timestamp: new Date().getTime(),
                data: json
            };
            return searchAndPaginate(json, startPosition, maxRecords, text);
        });
    };

    renderServiceItem = (service) => {

        let Service = this.props.service || ServiceItem;
        return (

            <Col {...this.props.column} >
                <Service
                    name={service.name}
                    path={service.path}
                    modified={service.modified}
                    size={service.size}
                    type={service.type}
                    style={{ height: "215px", maxHeight: "215px" }}
                    addLayer
                />
            </Col>
        );
    };


    render() {

        const contents = [];
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
                        <div className="col-title">Type</div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-title">Modified</div>
                    </Col>
                </Row>
                <Row>
                    {contents.map(this.renderServiceItem)}
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

export default connect(null, mapDispatchToProps)(ServiceGrid);