import React from 'react';
import './../assets/css/style.css';
import News from "./news/News";
import NewsBar from "./news/NewsBar";
import PublishNews from "./news/PublishNews";
import Management from "./management/Management";
import UsersManagement from "./management/UsersManagement";
import Alerts from "./Alerts";

export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this._submitNew = this._submitNew.bind(this);
        this._removeAlerts = this._removeAlerts.bind(this);
    }

    _getNews() {
        this.props.getNews();
    }

    _submitNew(data) {
        this.props.submitNew(data);
    }

    _removeAlerts() {
        this.props.removeAlerts();
    }

    render() {


        return (
            <div className="mainWrapper">
                {this.props.modules.main &&
                <div className="bodyWrapper">
                    <div className="newTitle">Welcome to WebApp</div>
                </div>}


                {this.props.alertMessages &&
                <Alerts alertMessages={this.props.alertMessages} removeAlerts={this._removeAlerts}/>}

                {this.props.modules.news && <NewsBar/>}
                {this.props.modules.news && <News getNews={this._getNews} news={this.props.news}/>}
                {this.props.modules.publishNew && <NewsBar/>}
                {this.props.modules.publishNew &&
                <PublishNews submitNew={this._submitNew} userId={this.props.myself.id}/>}
                {this.props.modules.management && <Management myself={this.props.myself}/>}

                {this.props.modules.users && <UsersManagement remoteUsers={this.props.remoteUsers}/>}

            </div>
        );

    }
}