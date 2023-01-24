import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { Grid, Row, Col } from 'react-bootstrap';

import axios from '../../libs/ajax';


import xml2js from 'xml2js';

import {searchAndPaginate, parseUrl} from '../../api/WMS';
import ServiceItem from './ServiceItem';
import {getServices, getSubscriptions} from './TopioApi'

import {addLayer} from '../../actions/catalog';

import { bindActionCreators } from 'redux';

const capabilitiesCache = {};

class CatalogueGrid extends React.Component {
    static propTypes = {
        column: PropTypes.object,
        currentLocale: PropTypes.string,
        style: PropTypes.object,
        changeFolder: PropTypes.func,
        fileLoaded: PropTypes.bool
    }

    static defaultProps = {
        column: { xs: 12 },
        currentLocale: 'en-US',
        fileLoaded: false
    };

    state = {
        services: [],
        subscriptions: []
    }

    componentDidMount() {
        getServices().then( (result) => {
            this.setState({services : result});
        });
        getSubscriptions().then( (result) => {
            this.setState({subscriptions : result});
        });
    }

    fetchRecord = (url, config,  startPosition, maxRecords, text) => {
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
            xml2js.parseString(response.data, {explicitArray: false}, (ignore, result) => {
                json = result;
            });
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
                    title={service.title}
                    url={service.ingestData.endpoints[0].uri}
                    updated={service.updatedOn}
                    type={service.ingestData.endpoints[0].type}
                    style={{ height: "215px", maxHeight: "215px" }}
                />
            </Col>
        );
    };

    renderSubscriptionItem = (service) => {
        let Service = this.props.service || ServiceItem;
        return (
            <Col {...this.props.column} >
                <Service
                    title={service.assetTitle}
                    url={service.item.ingestionInfo[0].endpoints[0].uri}
                    updated={service.updatedOn}
                    type={service.item.ingestionInfo[0].endpoints[0].type}
                    style={{ height: "215px", maxHeight: "215px" }}
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
                {this.state.services ? this.state.services.map(this.renderServiceItem): null}
                {this.state.subscriptions ? this.state.subscriptions.map(this.renderSubscriptionItem): null}
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

export default connect(null, mapDispatchToProps)(CatalogueGrid);