import React, {Component} from 'react';
import '../../../../style/user_main.css';

class treeNode {
    ancestor;
    childs = [];
    label;
    span;

    constructor(anc, childs, label) {
        this.ancestor = anc;
        this.childs = childs;
        this.label = label;
        this.span = 0
    }
}

class CriteriasTableViewer extends Component {
    constructor(props) {
        super(props);
        this.makeTable = this.makeTable.bind(this);
        this.makeHead = this.makeHead.bind(this);
        this.makeHeadRec = this.makeHeadRec.bind(this);
        this.tree = this.tree.bind(this);
        this.incrSpan = this.incrSpan.bind(this);
        this.bodyTree = this.bodyTree.bind(this);
        this.renderList = this.renderList.bind(this)
    };

    tree(tree, curNode, level, headers, spans) {
        Object.keys(tree).map((node) => {
            let a = 0;
            if (!headers[level]) headers.push([]);
            if (node == 'SHIFT') {
                if (headers[level].length == 0 && Object.keys(tree).length > 1) {
                    let newNode = new treeNode(undefined, undefined, '');
                    newNode.span = tree[node];
                    headers[level].push(newNode)
                }
            } else {
                let newNode = new treeNode(curNode, Object.keys(tree[node]), node);
                headers[level].push(newNode);
                this.incrSpan(curNode);
                this.tree(tree[node], newNode, level + 1, headers)
            }
        })
    }

    incrSpan(node) {
        if (node) {
            node.span += 1;
            if (node.ancestor)
                this.incrSpan(node.ancestor)
        }
    }

    makeHead(crits, schema, label) {
        let head = {};
        let shift = {val: 0};
        this.makeHeadRec(crits, schema, label, head, shift);
        let headers = [];
        let spans = [];
        let root = new treeNode(undefined, Object.keys(headers), '');
        this.tree(head, root, 0, headers, spans);
        return (
            headers.map((level) => {
                return (
                    <tr>{
                        level.map((header) => {
                            return (<th colSpan={header.span}
                                        style={{"wordWrap": "breakWord", "font-size": "x-small"}}>{header.label}</th>)
                        })
                    }
                    </tr>
                )
            })
        )
    }

    makeHeadRec(crits, schema, label, buildedHeadSchema, shift) {
        if (!(crits instanceof Array)) {
            if (schema.TYPE == 'c') {
                if (shift.val > 0) {
                    if (!buildedHeadSchema['SHIFT']) buildedHeadSchema['SHIFT'] = shift.val;
                    shift.val = 0
                }
                if (!buildedHeadSchema[label]) buildedHeadSchema[label] = {};

                Object.keys(crits[label]).map((node) => {
                    if (buildedHeadSchema[label]) buildedHeadSchema[label] ['SHIFT'] = buildedHeadSchema['SHIFT'];
                    this.makeHeadRec(crits[label], schema[label], node, buildedHeadSchema[label], shift)
                })
            } else {
                shift.val = shift.val + 1;
                Object.keys(crits[label]).map((node) => {
                    this.makeHeadRec(crits[label], schema[label], node, buildedHeadSchema, shift)
                })
            }
        }
    }


    bodyTree(crits, schema, label, prevNode, nodesWithLists) {
        if (!(crits instanceof Array)) {
            if (schema.TYPE == 'r') {
                let newNode = new treeNode(prevNode, [], label);
                if (prevNode)
                    prevNode.childs.push(newNode);
                Object.keys(crits[label]).map((node) => {
                    this.bodyTree(crits[label], schema[label], node, newNode, nodesWithLists)
                })
            } else {
                if (!(crits[label] instanceof Array))
                    Object.keys(crits[label]).map((node) => {
                        this.bodyTree(crits[label], schema[label], node, prevNode, nodesWithLists)
                    });
                else {
                    this.bodyTree(crits[label], schema[label], 'dummy', prevNode, nodesWithLists)
                }
            }

        } else {
            if (!prevNode.isList) {
                this.incrSpan(prevNode);
                prevNode.isList = true;
                prevNode.lists = [];
                nodesWithLists.push(prevNode)
            }
            prevNode.lists.push(crits)
        }
    }

    renderList(node, childNode, childMarkup, isNewLine) {
        if (node.isList) {
            let markup = (
                <>
                    <th scope='row'>{node.label}</th>
                    {node.lists.map((child) => {
                        return (
                            <td>{child.toString().replace(/,/g, ' | ')}</td>
                        )
                    })}
                </>
            );
            return this.renderList(node.ancestor, node, markup, true)
        } else {
            let markup = childMarkup;
            let needNewLine = false;
            if (node.childs[0] === childNode && isNewLine) {
                if (node.label.toString().replace(/\s+/g, ' ') == "2 (7б)")
                    console.log(childNode.label);
                markup = (
                    <>
                        <th scope="rowgroup" rowSpan={node.span}>{node.label}</th>
                        {childMarkup}
                    </>
                );
                needNewLine = true
            }
            if (!node.ancestor)
                return (<tr>
                    {markup}
                </tr>);
            return this.renderList(node.ancestor, node, markup, needNewLine)
        }
    }

    makeTable(crits, schema, label) {
        let root = new treeNode(undefined, [], label);
        console.log('SCHEMA', schema);
        let nodesWithLists = [];
        this.bodyTree(crits, schema, label, undefined, nodesWithLists);


        return (
            nodesWithLists.map((node) => {
                return this.renderList(node, undefined, undefined)
            })
        )
    }

    render() {
        return (
            <div>
                {Object.keys(this.props.criterias).map((key) => {
                        //if (key != '2 (7б)') return null
                        return (
                            <>
                                <h4 style={{
                                    "textAlign": "center",
                                    "marginTop": "10px",
                                    "backgroundColor": "#07265d"
                                }}>{key}</h4>
                                <table className="table-bordered table-sm"
                                       style={{"wordWrap": "breakWord", "font-size": "x-small"}}>
                                    <thead>
                                    {this.makeHead(this.props.criterias, this.props.schema, key)}
                                    </thead>
                                    <tbody>
                                    {this.makeTable(this.props.criterias, this.props.schema, key)}
                                    </tbody>
                                </table>
                            </>
                        )
                    }
                )}
            </div>

        )
    }
}

export default CriteriasTableViewer