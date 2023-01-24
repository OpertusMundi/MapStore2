import React from 'react';
import PropTypes from 'prop-types';

import axios from '../../libs/ajax';

import {getToken} from '../../utils/SecurityUtils';
import Button from '../../components/misc/Button';

import { compose } from 'recompose';;
import { connect } from 'react-redux';	
import ConfigUtils from '../../utils/ConfigUtils';	
import { isAnnotation } from '../../utils/AnnotationsUtils';	
import { geoJSONToLayer } from '../../utils/LayersUtils';	
import { every, get, some } from 'lodash';	
import {	
    MIME_LOOKUPS,	
    checkShapePrj,	
    readJson,	
    readWMC,	
    readZip,	
    recognizeExt,	
    shpToGeoJSON	
} from '../../utils/FileUtils';	

import {setLayers} from '../../actions/mapimport'

import { checkIfLayerFitsExtentForProjection } from '../../utils/CoordinatesUtils';

import { Row, Col, Glyphicon } from 'react-bootstrap';

//const Button =  tooltip(ButtonRB);

const readFile = (file) => {	
    // const ext = recognizeExt(file.name);	
    // const type = file.type || MIME_LOOKUPS[ext];	
    const type = 'application/zip'	
    const projectionDefs = ConfigUtils.getConfigProp('projectionDefs') || [];	
    const supportedProjections = (projectionDefs.length && projectionDefs.map(({ code }) => code) || []).concat(["EPSG:4326", "EPSG:3857", "EPSG:900913"]);	
    if (type === 'application/x-zip-compressed' ||	
        type === 'application/zip') {	
        return readZip(file).then((buffer) => {	
            return checkShapePrj(buffer).then((warnings) => {	
                // if (warnings.length > 0) {	
                //     onWarnings({type: 'warning', filename: file.name, message: 'shapefile.error.missingPrj'});	
                // }	
                const geoJsonArr = shpToGeoJSON(buffer).map(json => ({ ...json, filename: file.name }));	
                const areProjectionsPresent = some(geoJsonArr, geoJson => !!get(geoJson, 'map.projection'));	
                if (areProjectionsPresent) {	
                    const filteredGeoJsonArr = geoJsonArr.filter(item => !!get(item, 'map.projection'));	
                    const areProjectionsValid = every(filteredGeoJsonArr, geoJson => supportedProjections.includes(geoJson.map.projection));	
                    if (areProjectionsValid) {	
                        return geoJsonArr;	
                    }	
                    throw new Error("PROJECTION_NOT_SUPPORTED");	
                }	
                return geoJsonArr;	
            });	
        });	
    }	
    if (type === 'application/json') {	
        return readJson(file).then(f => {	
            const projection = get(f, 'map.projection');	
            if (projection) {	
                if (supportedProjections.includes(projection)) {	
                    return [{ ...f, "fileName": file.name }];	
                }	
                throw new Error("PROJECTION_NOT_SUPPORTED");	
            }	
            return [{ ...f, "fileName": file.name }];	
        });	
    }	
    if (type === 'application/vnd.wmc') {	
        return readWMC(file).then((config) => {	
            return [{ ...config, "fileName": file.name }];	
        });	
    }	
    return null;	
};	
const isGeoJSON = json => json && json.features && json.features.length !== 0;	
const isMap = json => json && json.version && json.map;

class FileItem extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        path: PropTypes.string,
        size: PropTypes.number,
        modified: PropTypes.string,
        type: PropTypes.string,
        changeFolder: PropTypes.func,
        fileLoaded: PropTypes.bool
    };

    async getFile(path){
        const api = axios.create({ withCredentials: true });

        const token = getToken();

        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
            responseType: 'blob',
        };
        const url = 'https://beta.topio.market/api/file-system/files/?path=' + path
        const response = await api.get(url, config);
        let data = await response.data;	
        let metadata = {	
          type: 'application/zip'	
        };	
        const fileName = path.split('/').pop();
        let file = new File([data], fileName, metadata);	
        let result = await readFile(file); 	
        return result	
        .reduce((result, jsonObjects) => ({ // divide files by type	
            layers: (result.layers || [])	
                .concat(	
                    //jsonObjects.filter(json => isGeoJSON(json))	
                        //.map(json => (isAnnotation(json) ?
                        isAnnotation(jsonObjects)?	
                            // annotation GeoJSON to layers	
                            { name: "Annotations", features: jsonObjects?.features || [], filename: jsonObjects.filename} :	
                            // other GeoJSON to layers	
                            {...geoJSONToLayer(jsonObjects), filename: jsonObjects.filename}	
                ),	
            maps: []
            //(result.maps || [])	
                //.concat(	
                //    jsonObjects.filter(json => isMap(json))	
                //)	
        }), {})	
    }	

    addToMap(path) {
        this.getFile(path).then(file=>{
            const valid = file.layers[0].type === "vector" ? checkIfLayerFitsExtentForProjection(file.layers[0]) : true;
            this.props.setLayers(file.layers, []);
            const el = document.getElementById('import-button');
            el.click();
        });	
          
    }

    convertToMB(size) {
        return (size / Math.pow(1024, 2))
    }
    render() {
        var date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let button = this.props.type=='file' && this.props.name && this.props.name.includes('.zip') ? <Button
            onClick={() => this.addToMap(this.props.path)}
            tooltipId="backgroundDialog.removeAdditionalParameterTooltip"
            className="square-button-md add-to-map"
            style={{ borderColor: 'transparent' }}>
            <Glyphicon glyph="plus" />
                </Button> : null
        return (
            <div>
                <Row className='row-content'>
                    <Col xs={4} className="col-name">
                    {button}
                        <div className="col-content" onClick={this.props.type=='folder'? () => this.props.changeFolder(this.props.name) : undefined}>
                            <Glyphicon className='icon' glyph={this.props.type=='folder'? 'folder-close': 'file'}/>{this.props.name}
                        </div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{this.convertToMB(this.props.size).toFixed(2)}&nbsp;MB</div>
                    </Col>
                    <Col xs={4}>
                        <div className="col-content">{new Date(this.props.modified).toLocaleDateString("en-UK", date_options)}</div>
                    </Col>
                </Row>

            </div>
        );
    }
}

//export default FileItem;

export default compose(
            connect(() => {        
            }, {
                setLayers
            })
)(FileItem);