import React, {Component} from 'react';
import {fetchSendWithoutRes} from "../../../services/fetchService";
import userPersonalStore from '../../../stores/userPersonalStore';
import AchievesGroup from "./achievesGroup";


class AchievesComment extends Component {
    constructor(props) {
        super(props);
        this.state = {value: props.row.comment};
        this.handleCommentSubmit = this.handleCommentSubmit.bind(this);
        this.handleCommentChange = this.handleCommentChange.bind(this);
    };

    handleCommentSubmit(e) {
        fetchSendWithoutRes('/api/comment', {Id: this.props.row._id, comment: this.state.value}).then( () => {
                this.setState({focused: false});
                this.props.updater()
            }
        );
        e.preventDefault()
    }

    handleCommentChange(e) {
        this.setState({ value: e.target.value, focused: this.props.row.comment !== e.target.value})
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.row) return;


        if (this.props.row.comment !== prevProps.row.comment && this.state.value !== this.props.row.comment) {
            this.setState({value: this.props.row.comment});
        }
    }

    render () {
        return <div className="input-group commentContainer" style={{height: 'unset', width: '100%'}}>
            <div style={{width: '100%'}}>
            <textarea id={this.props.row._id} className={"form-control" + (this.props.row.comment ? " commentSended" : "")}
                      value={this.state.value} disabled={userPersonalStore.Role === 'Observer'}
                      onChange={this.handleCommentChange} style={{height: "8.2rem", width: '100%'}}/>
                {this.state && this.state.focused && <div  style={{"marginRight": "0px", display: 'flex', justifyContent: 'space-between'}}>
                    <button className="btn btn-danger"
                            style={{"fontSize": "xx-small", "margin": "0px", backgroundColor: "#61363a"}}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                this.setState({ value: this.props.row.comment, focused: false});
                            }}>Отмена
                    </button>
                    <button className="btn btn-info" style={{"fontSize": "xx-small", "margin": "0px",
                        backgroundColor: "#3d5c61", paddingLeft: '20px', paddingRight: '20px'}}
                            onClick={this.handleCommentSubmit}>
                        Ок
                    </button>
                </div>}
            </div>
        </div>
    }
}

export default AchievesComment;