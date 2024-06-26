/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import url from 'url';

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {resetControls} from '../../actions/controls';
import {onShowLogin} from '../../actions/login';
import {loadMaps} from '../../actions/maps';
import Page from '../../containers/Page';
import ConfigUtils from '../../utils/ConfigUtils';
import {getCookieValue} from '../../utils/CookieUtils';
import { getToken} from '../../utils/SecurityUtils';

import("../assets/css/maps.css");

const urlQuery = url.parse(window.location.href, true).query;

/**
  * @name Maps
  * @memberof pages
  * @class
  * @classdesc
  * This is the home page of MapStore.
  * Renders plugins and triggers the initial load action for loading contents in the page.
  */
class MapsPage extends React.Component {
    static propTypes = {
        mode: PropTypes.string,
        match: PropTypes.object,
        reset: PropTypes.func,
        loadMaps: PropTypes.func,
        plugins: PropTypes.object,
        loaderComponent: PropTypes.func
    };

    static defaultProps = {
        mode: 'desktop',
        reset: () => {}
    };
    
    static contextTypes = {
        router: PropTypes.object
    };

    state = {};

    UNSAFE_componentWillMount() {
        if (this.props.match.params.mapType && this.props.match.params.mapId) {
            if (this.props.mode === 'mobile') {
                require('../assets/css/mobile.css');
            }
            this.props.reset();
        }
    }

    onLoaded = (pluginsAreLoaded) => {
        const tokens_key = getCookieValue("tokens_key");
        if(tokens_key && sessionStorage.getItem("redirect_url")){
            const redirect_url =  sessionStorage.getItem("redirect_url")
            sessionStorage.removeItem("redirect_url");
            this.context.router.history.push(redirect_url);
        }
        if (pluginsAreLoaded && !this.state.pluginsAreLoaded) {
            if (!tokens_key){
                this.props.onShowLogin();
            }
            this.setState({pluginsAreLoaded: true}, () => {
                this.props.loadMaps();
            });
        }
    }

    render() {
        return (<Page
            id="maps"
            onLoaded={this.onLoaded}
            plugins={this.props.plugins}
            params={this.props.match.params}
            loaderComponent={this.props.loaderComponent}
        />);
    }
}

export default connect((state) => ({
    mode: urlQuery.mobile || state.browser && state.browser.mobile ? 'mobile' : 'desktop'
}),
{
    loadMaps: () => loadMaps(
        ConfigUtils.getDefaults().geoStoreUrl,
        ConfigUtils.getDefaults().initialMapFilter || "*"
    ),
    onShowLogin ,
    reset: resetControls
})(MapsPage);
