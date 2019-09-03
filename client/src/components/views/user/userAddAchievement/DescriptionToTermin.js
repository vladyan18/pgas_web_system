import React, {Component} from 'react';
import '../../../../style/add_portfolio.css';

export default class DescriptionToTermin extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        let values = this.props.values;
        let need = false;

        if (values.some(o => o == 'ММК')) {
            return (
                <div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
                    <b>Заруб. изд.</b> – зарубежное издание <br/>
                    <b>ММК</b> – Материалы Международной Конференции<br/>
                    <b>Росс. изд</b> – российское издание<br/>
                </p></div>
            )
        } else if (values.some(o => o == 'СДнСК')) {
            return (
                <div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
                    <b>СДнСК</b> – С Докладом на Соответствующей Конференции <br/>
                    <b>БДнСК</b> – Без Доклада на Соответствующей Конференции<br/>
                </p></div>
            )
        } else if (values.some(o => o == 'УД')) {
            return (<div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
                <b>УД</b> – Устный Доклад <br/>
                <b>СД</b> – Стендовый Доклад<br/>
            </p></div>)
        } else if (values.some(o => o == 'ДСПО')) {
            return (<div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
                <b>ДСПО</b> – Достижение Соответствующее Профилю Обучения (<b>математика, физика, информатика и
                программирование</b>) <br/>
                <b>ДнСПО</b> – Достижение <b>не</b> Соответствующее Профилю Обучения<br/>
            </p></div>)
        } else if (values.some(o => o.search('Q1') > -1)) {
            return (<div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
                <b>Q1–Q4 </b> – Квартиль («рейтинг» журнала в SCOPUS или WoS) <br/>
                <a target="_blank" href="http://www.scimagojr.com/journalsearch.php">Узнать квартиль для
                    SCOPUS </a><br/>
                <a target="_blank" href="http://www.isiknowledge.com">Узнать квартиль для WoS</a> <br/>
            </p></div>)
        } else return null;
    }
}