import React, {Component} from 'react';
import '../../../style/add_portfolio.css';
import criteriasStore from '../../../stores/criteriasStore';
import ReactMarkdown from 'react-markdown';

export default class DescriptionToTermin extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const values = this.props.values;
    const need = false;

    if (values.some((o) => o == 'СДнСК')) {
      return (
        <div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
          <b>СДнСК</b> – С Докладом на Соответствующей Конференции <br/>
          <b>БДнСК</b> – Без Доклада на Соответствующей Конференции<br/>
        </p></div>
      );
    } else if (values.some((o) => o == 'ДСПО') && criteriasStore.learningProfile) {
      return (<div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
        Под профилем обучения понимается: <b>{criteriasStore.learningProfile}</b><br/>
        <span style={{fontSize: 'small', fontWeight: 350}}><i>В тексте критериев используются сокращения ДСПО и ДнСПО</i></span>
      </p></div>);
    } else if (values.some((o) => o.search('Q1') > -1)) {
      return (<div id="descr_'+n+'" className="blue_bg"><p className="desc_selectors" id="desc_criterion_first">
        <b>Q1–Q4 </b> – Квартиль («рейтинг» журнала в SCOPUS или WoS) <br/>
        <a target="_blank" href="http://www.scimagojr.com/journalsearch.php">Узнать квартиль для
                    SCOPUS </a><br/>
        <a target="_blank" href="http://www.isiknowledge.com">Узнать квартиль для WoS</a> <br/>
      </p></div>);
    } else if (values.includes('Международные языки') && criteriasStore.languagesForPublications) {
      return <div id="critDescr" className="blue_bg">
        <p className="desc_selectors" id="desc_criterion_first">
          <ReactMarkdown source={criteriasStore.languagesForPublications} linkTarget={() => '_blank'}/>
        </p>
      </div>
    } else return null;
  }
}
