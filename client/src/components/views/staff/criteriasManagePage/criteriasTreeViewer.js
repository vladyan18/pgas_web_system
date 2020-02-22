import React, {Component} from 'react';
import '../../../../style/user_main.css';
import TreeView from '../../../treeView';

class CriteriasTreeViewer extends Component {
  constructor(props) {
    super(props);
    this.makeTree = this.makeTree.bind(this);
  };


  makeTree(data, i, label) {
    if (!(data instanceof Array)) {
      return <TreeView key={i} nodeLabel={label} defaultCollapsed={true}>
        {
          Object.keys(data).map((crit, index) => {
            return this.makeTree(data[crit], index, crit);
          })
        }
      </TreeView>;
    } else {
      return (
        <TreeView key={i} nodeLabel={label} defaultCollapsed={false}>
          <b>
            {data.toString().replace(/,/g, ' | ')}
          </b>
        </TreeView>
      );
    }
  }

  render() {
    return (
      <section className="container" style={{'height': '100%', 'backgroundColor': '#ececea'}}>

        {this.props.criterias &&
                Object.keys(this.props.criterias).map((crit, index) => {
                  return this.makeTree(this.props.criterias[crit], index, crit);
                })
        }

      </section>
    );
  }
}

export default CriteriasTreeViewer;
