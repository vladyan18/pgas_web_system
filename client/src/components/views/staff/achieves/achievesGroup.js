import React, {Component} from 'react';
import '../../../../style/admin.css';
import NewAchievesTable from "./achievesTable";

class AchievesGroup extends Component {
    constructor(props) {
        super(props);
        this.toggleHide = this.toggleHide.bind(this);
        this.toggleRating = this.toggleRating.bind(this);
    };

    toggleRating() {
        let id = this.props.item.Id;
        console.log('ID: ' + id);
        if (!this.props.item.IsInRating) {

            fetch("/api/AddToRating", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({Id: id})
            }).then((resp) => {
                if (resp.status === 200) {
                    this.props.updater()
                }
            })
                .catch((error) => console.log(error))
        } else {
            fetch("/api/RemoveFromRating", {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({Id: id})
            }).then((resp) => {
                if (resp.status === 200) {
                    this.props.updater()
                }
            })
                .catch((error) => console.log(error))

        }


    }

    componentDidMount() {
        this.setState({hidden: false})
    }

    toggleHide() {
        let state = this.state;
        state.hidden = !state.hidden;
        this.setState(state)
    }

    render() {
        return (
            <div>
                {this.state &&
                <div className="name">
                    <div style={{"width": "100%", "text-align": "center"}} className="input-group">
                        <div className={"nameHeader" + (this.props.item.IsInRating ? " inRating" : '')}
                             style={{"text-align": "center"}}>
                            <i className={"fas fa-chevron-" + (this.state.hidden ? "right" : "down") + " mychevron"}
                               onClick={this.toggleHide}></i>
                        </div>
                        <h3 className={"form-control nameHeader" + (this.props.item.IsInRating ? " inRating" : '')}
                            style={{"border": "0", "box-shadow": "none"}}>
                            <a style={{"color": "white"}} target="_blank" href="/">{this.props.item.user}</a>
                        </h3>
                        <div className="input-group-append">
                            <button type="button" className="btn btn-dark btn-xs newAchievesGroupButton"
                                    onClick={this.toggleRating}>
                                {this.props.item.IsInRating ? "Убрать из рейтинга" : 'Добавить в рейтинг'}</button>
                        </div>
                    </div>
                    <div></div>
                    <div className="cover"></div>
                    {!this.state.hidden && <div className="block">

                        <NewAchievesTable data={this.props.item.Achievements} updater={this.props.updater}/>
                    </div>}
                </div>}
            </div>
        )
    }
}

export default AchievesGroup