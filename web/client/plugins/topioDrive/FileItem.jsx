import React from 'react';
import PropTypes from 'prop-types';

import SideCard from '../../components/misc/cardgrids/SideCard';
import Toolbar from '../../components/misc/toolbar/Toolbar';
import Moment from 'moment';

import { Button, Glyphicon } from 'react-bootstrap';

//const Button =  tooltip(ButtonRB);

class FileItem extends React.Component {
    static propTypes = {
        name: PropTypes.string,
        path: PropTypes.string,
        size: PropTypes.number,
        modified: PropTypes.string
    };

    addToMap(path){
        console.log(path);
    }

    render() {

        return (
            <div>
                <SideCard
                title={this.props.name}
                description={<span><div className ref={sideCardDesc => {
                    this.sideCardDesc = sideCardDesc;
                }}></div></span>}
                caption={
                    <div>
                        <div className="identifier">Modified: {Moment(this.props.modified).format('MMM Do YYYY')} </div>
                    </div>
                }
                tools={
                    <Toolbar
                        btnDefaultProps={{
                            className: 'square-button-md',
                            bsStyle: 'primary'
                        }}
                        btnGroupProps={{
                            style: {
                                margin: 10
                            }
                        }}
                        buttons={[ {
                            glyph: 'plus',
                            tooltipId: "backgroundSelector.addTooltip",
                            onClick: () => this.addToMap(this.props.path)
                        }
                        ]}
                    />
                }
                />
            </div>
        );
    }
}

export default FileItem;