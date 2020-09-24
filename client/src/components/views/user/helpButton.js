import React, {Component} from 'react';
import {OverlayTrigger} from 'react-bootstrap';

class HelpButton extends Component {
  constructor(props) {
    super(props);
  };


  render() {
    return (
      <OverlayTrigger trigger={['focus']} placement={this.props.placement}
        overlay={this.props.overlay}>
        <button className={'fas fa-question-circle'}
          style={
            {
              cursor: 'pointer',
              marginLeft: '0.3rem',
              marginTop: '0px',
              border: 'none',
              padding: 0,
              backgroundColor: 'transparent',
              outline: 'none',
                color: '#727272'
            }}
          onClick={(e) => {
            e.preventDefault();
          }}/>
      </OverlayTrigger>
    );
  }
}

export default HelpButton;
