import React from 'react';
import PropTypes from 'prop-types';

import axios from '../../libs/ajax';

import {getToken} from '../../utils/SecurityUtils';
import Button from '../../components/misc/Button';

import xml2js from 'xml2js';

import {searchAndPaginate, parseUrl} from '../../api/WMS';
import {getCatalogRecords, getLayerFromRecord} from '../../api/catalog/WMS';
import {addLayer} from '../../actions/catalog';

import { bindActionCreators } from 'redux';

import { connect } from 'react-redux';	

import { Row, Col, Glyphicon } from 'react-bootstrap';

const capabilitiesCache = {};


class ServiceItem extends React.Component {
    static propTypes = {
        title: PropTypes.string,
        url: PropTypes.string,
        updated: PropTypes.string,
        type: PropTypes.string,
    };


    async addToMap(url) {
        const token = getToken();
        const api = axios.create();
        const config = {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
              withCredentials: false,
        }; 
        const topioUrl = url.split('?')[0];
        const layerName = url.split('layers=')[1];
        const cached = capabilitiesCache[url];
        /* if (cached && new Date().getTime() < cached.timestamp + (getConfigProp('cacheExpire') || 60) * 1000) {
            return new Promise((resolve) => {
                resolve(searchAndPaginate(cached.data, startPosition, maxRecords, text));
            });
        } */
        const parsedUrl = parseUrl(topioUrl);
        api.get(parsedUrl, config).then((response) => {
            let json;
            xml2js.parseString(response.data, { explicitArray: false }, (ignore, result) => {
                json = result;
            });
            capabilitiesCache[topioUrl] = {
                timestamp: new Date().getTime(),
                data: json
            };

            const paginateResponse  =  searchAndPaginate(json, 0, 100, layerName);

            const catalogRecords = getCatalogRecords(paginateResponse, { ...paginateResponse.layerOptions, url: topioUrl })
            getLayerFromRecord(catalogRecords[0], { ...paginateResponse.layerOptions }, true)
                .then((result) => {
                    if (result.title){
                        result.title = this.props.title;
                    }
                    this.props.addLayer(result, true);
                });
        });
        
    };


    convertToMB(size) {
        return (size / Math.pow(1024, 2))
    }
    render() {
        var date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let button =  <Button
            onClick={() => this.addToMap(this.props.url)}
            tooltipId="backgroundDialog.removeAdditionalParameterTooltip"
            className="square-button-md add-to-map"
            style={{ borderColor: 'transparent' }}>
            <Glyphicon glyph="plus" />
                </Button>
        return (
            <div>
                <Row className='row-content'>
                    <Col xs={4} className="col-name">
                    {button}
                        <div className="col-content" >
                            <Glyphicon className='icon' glyph={'file'}/>{this.props.title}
                        </div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{this.props.type}</div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{new Date(this.props.updated).toLocaleDateString("en-UK", date_options)}</div>
                    </Col>
                </Row>

            </div>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        addLayer: addLayer.bind(null)
    }, dispatch);
};

export default connect(null, mapDispatchToProps)(ServiceItem);

//export default ServiceItem;

/* export default compose(
            connect(() => {        
            }, {
                setLayers
            })
)(FileItem); */