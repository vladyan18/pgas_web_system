import React, {Component} from 'react';
import '../../../style/user_main.css';
import '../../../style/critTableViewer.css';

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

function cloneObject(obj) {
    var clone = {};
    for (var i in obj) {
        if (obj[i] != null && typeof (obj[i]) == "Object")
            clone[i] = cloneObject(obj[i]);
        else
            clone[i] = obj[i];
    }
    return clone;
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
        this.renderList = this.renderList.bind(this);
        this.getPath = this.getPath.bind(this);
        this.getSubHeaderRows = this.getSubHeaderRows.bind(this)
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

    makeHead(inputCrits, inputSchema, label) {
        let head = {};
        let shift = {val: 0};
        let hasSubTable = {val: false};
        let crits = inputCrits;
        let schema = inputSchema;
        const allCrits = inputCrits;
        const allSchema = inputSchema;
        let firstLevelCritsLabels = Object.keys(allCrits[label]);
        let firstLevelCritsLength = firstLevelCritsLabels.length;
        let clearSchema = {META: allSchema.META};
        let clearCrits = {};
        clearSchema[label] = {META: allSchema[label].META};
        clearCrits[label] = {};
        for (let i = 0; i < firstLevelCritsLength; i++) {
            if (!allSchema[label][firstLevelCritsLabels[i]].META || !allSchema[label][firstLevelCritsLabels[i]].META.isNewSubTable) {
                clearSchema[label][[firstLevelCritsLabels[i]]] = allSchema[label][firstLevelCritsLabels[i]];
                clearCrits[label][[firstLevelCritsLabels[i]]] = allCrits[label][firstLevelCritsLabels[i]]
            } else break
        }
        this.makeHeadRec(clearCrits, clearSchema, label, head, shift);
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
            if (schema.META.type == 'c' && !schema.META.isNewSubTable) {
                if (shift.val > 0) {
                    if (!buildedHeadSchema['SHIFT']) buildedHeadSchema['SHIFT'] = shift.val;
                    shift.val = 0
                }
                if (!buildedHeadSchema[label]) buildedHeadSchema[label] = {};
                Object.keys(crits[label]).map((node) => {
                    if (buildedHeadSchema[label]) buildedHeadSchema[label] ['SHIFT'] = buildedHeadSchema['SHIFT'];
                    this.makeHeadRec(crits[label], schema[label], node, buildedHeadSchema[label], shift)
                })
            } else if (!schema.META.isNewSubTable) {
                shift.val = shift.val + 1;
                Object.keys(crits[label]).map((node) => {
                    this.makeHeadRec(crits[label], schema[label], node, buildedHeadSchema, shift)
                })
            }
        }
    }


    bodyTree(crits, schema, label, prevNode, nodesWithLists, deep = 0) {
        if (!(crits instanceof Array)) {
            if (schema.META && schema.META.type == 'r') {
                let newNode = new treeNode(prevNode, [], label);
                if (schema[label].META && schema[label].META.isNewSubTable) {
                    let headers = [];
                    let spans = [];
                    this.renderSubTableHeader(newNode, headers, spans);
                    newNode.headers = headers;
                    newNode.spans = spans;

                    for (let i = 0; i < headers.length; i++)
                        this.incrSpan(prevNode);
                    newNode.isNewSubTable = schema[label].META.isNewSubTable
                }

                if (prevNode)
                    prevNode.childs.push(newNode);
                if (!(crits[label] instanceof Array)) {
                    Object.keys(crits[label]).map((node) => {
                        this.bodyTree(crits[label], schema[label], node, newNode, nodesWithLists, deep + 1)
                    })
                } else this.bodyTree(crits[label], schema[label], 'dummy', newNode, nodesWithLists, deep)
            } else {

                if (!(crits[label] instanceof Array)) {

                    Object.keys(crits[label]).map((node) => {

                        this.bodyTree(crits[label], schema[label], node, prevNode, nodesWithLists, deep)
                    });
                }
                else {

                    this.bodyTree(crits[label], schema[label], 'dummy', prevNode, nodesWithLists, deep)
                }
            }

        } else {
            if (!prevNode.isList) {
                this.incrSpan(prevNode);
                prevNode.isList = true;
                prevNode.lists = [];
                prevNode.deep = deep;
                nodesWithLists.push(prevNode)
            }
            if (prevNode.label == 'dummy') prevNode.isColumn = false;
            prevNode.lists.push(crits)
        }
    }

    getPath(x, headerNodes) {
        headerNodes.splice(0, 0, x.label);
        if (x.ancestor)
            this.getPath(x.ancestor, headerNodes)
    }

    getSubHeaderRows(schema, label, level, headers, spans) {
        if (schema instanceof Array) return null;

        Object.keys(schema).map((node) => {
            if (node == 'META') return null;

            if (!spans[level]) spans.push({});
            if (!headers[level]) headers.push([]);


            headers[level].push(node);
            if (level > 0) {
                if (!spans[level - 1][label]) spans[level - 1][label] = 0;
                spans[level - 1][label] += 1
            }
            this.getSubHeaderRows(schema[node], node, level + 1, headers, spans)
        })
    }

    renderSubTableHeader(node, headers, spans) {
        let schema = this.props.schema;
        let path = [];
        this.getPath(node, path);
        for (let i = 0; i < path.length; i++)
            schema = schema[path[i]];

        this.getSubHeaderRows(schema, node.label, 0, headers, spans);

    }

    renderList(node, childNode, childMarkup, isNewLine, needDeep = 0) {
        if (node.isList) {
            let th;
            let markup = (
                <>
                    {node.lists.map((child) => {
                        return (
                            <td>{child.toString().replace(/,/g, ' | ')}</td>
                        )
                    })}
                </>
            );

            if (node.isNewSubTable) {

                if (node.deep && needDeep) th = (<th scope='rowgroup' colSpan={needDeep + 1 - node.deep}
                                                     rowSpan={1 + node.headers.length}>{node.label}</th>);
                else th = <th scope='rowgroup' rowSpan={1 + node.headers.length}>{node.label}</th>;

                let m = (<>
                    {this.renderList(node.ancestor, node, (<>{th}{
                        node.headers[0].map((x) => {
                            if (node.spans[0][x])
                                return <td colSpan={node.spans[0][x]}>{x}</td>;
                            else return <td>{x}</td>
                        })
                    }</>), true)}
                </>);

                for (let i = 1; i < node.headers.length; i++) {
                    m = (<>
                        {m}
                        {this.renderList(node.ancestor, node, (<>{
                            node.headers[i].map((x) => {
                                return <td>{x}</td>
                            })
                        }</>), false)}
                    </>)
                }

                return (<>{m}{markup}</>)
            }

            if (node.deep && needDeep) th = (<th scope='row' colSpan={needDeep + 1 - node.deep}>{node.label}</th>);
            else th = <th scope='row'>{node.label}</th>;
            return this.renderList(node.ancestor, node, (<>{th}{markup}</>), true)

        } else {
            let markup = childMarkup;
            let needNewLine = false;
            if (node.childs[0] === childNode && isNewLine) {
                //if (node.label.toString().replace(/\s+/g, ' ') == "2 (7б)")
                //    console.log(childNode.label);
                markup = (
                    <>
                        <th scope="rowgroup" rowSpan={node.span}>{node.label}</th>
                        {childMarkup}
                    </>
                );
                needNewLine = true
            }
            if (!node.ancestor) {

                return (<tr>
                    {markup}
                </tr>);
            }

            return this.renderList(node.ancestor, node, markup, needNewLine)
        }
    }

    makeTable(crits, schema, label) {
        let root = new treeNode(undefined, [], label);
        let nodesWithLists = [];
        this.bodyTree(crits, schema, label, undefined, nodesWithLists);
        let deep = nodesWithLists[0].deep;
        return (
            nodesWithLists.map((node) => {
                return this.renderList(node, undefined, undefined, true, deep)
            })
        )
    }

    render() {
        const limits = this.props.limits;
        console.log('limits', limits);
        console.log(this.props.criterias)
        const areas = ['7', '8', '9', '10', '11'];
        return (
            <div>
                {limits && <><p>Ограничения на максимальную сумму баллов по областям деятельности:</p>
                <table>
                    <thead>
                    <tr>
                        <th>Область</th>
                        <th>Макс. сумма</th>
                    </tr>
                    </thead>
                    <tbody>
                    {
                        limits.map((limit, index) =>
                        <tr key={index}>
                            <td>{areas[index]}</td>
                            <td>{limit}</td>
                        </tr>)
                    }
                    </tbody>
                </table></>}

                {Object.keys(this.props.criterias).map((key) => {
                    //if (key != '6 (9а)') return null;

                    const crits = this.props.criterias;
                    const schema = this.props.schema;
                        return (
                            <>
                                <h4 style={{
                                    "textAlign": "center",
                                    "marginTop": "10px",
                                    "backgroundColor": "#07265d"
                                }}>{key}</h4>
                                <table className="table-bordered table-sm"
                                       style={{"wordWrap": "breakWord", "font-size": "x-small"}}>
                                    <colgroup>
                                        <col className="test"></col>
                                    </colgroup>
                                    <thead>
                                    {this.makeHead(crits, schema, key)}
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