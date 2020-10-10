import React from 'react';
import {css, jsx} from '@emotion/core';
/** @jsx jsx */
import {ConfirmationColumns} from '../confirmation/ConfirmationColumns';
import {fetchSendWithoutRes} from '../../../services/fetchService';
import userAchievesStore from '../../../stores/userAchievesStore';
import UserMainPanel from '../../common/userMainPanel';
import Table from '../../common/table';


function UserDocuments(props) {
  function deleteCommonConfirmation(confirmation) {
    const usingAchieves = props.achievements.filter((x) => x.confirmations.some((conf) => conf._id === confirmation._id));
    let text = 'Вы уверены? Удаление документа необратимо.';
    if (usingAchieves && usingAchieves.length > 0) {
      text += `\nУдаление затронет ${usingAchieves.length} достижений.`;
    }

    if (!window.confirm(text)) return false;

    fetchSendWithoutRes('/delete_confirmation', {id: confirmation._id}).then(() => {
          userAchievesStore.updateCommonConfirmations();
        },
    );
  }
  let columns = [
    {
      isDummyField: true,
      formatter: (cell, row) => {
        if (!props.achievements) {
          return null;
        }
        if (props.achievements
            .some((x) => x.confirmations.some((conf) => conf._id === row._id))) {
          return <i style={{color: 'grey'}} className="fa fa-paperclip" title="Приложено к достижению"/>;
        }
      },
    },
  ].concat(ConfirmationColumns);
  columns = columns.concat([
    {
      isDummyField: true,
      style: {textAlign: 'right'},
      // eslint-disable-next-line react/display-name
      formatter: (cell, row) => {
        if (!props.achievements) {
          return null;
        }

        if (props.achievements
            .filter((x) => ['Принято', 'Принято с изменениями', 'Отказано'].find((st) => st === x.status))
            .some((x) => x.confirmations.some((conf) => conf._id === row._id))) {
          return null;
        }
        return <>{!props.disabled &&
        <button onClick={() => deleteCommonConfirmation(row)}
            style={
              {
                cursor: 'pointer',
                marginLeft: '0.3rem',
                border: 'none',
                padding: 0,
                backgroundColor: 'transparent',
                outline: 'none',
                color: 'red',
                fontSize: '1.1rem',
              }}><i className="fa fa-trash-alt"/>
        </button>
      }</>;
},
    },
  ]);

  return (<UserMainPanel title={'Мои документы'}>
      <div>
          {props.confirmations && <Table keyField='_id' data={props.confirmations}
                                                  headerClasses={'withoutTopBorder'}
                            columns={columns}
                            bordered={false}/>}
      </div>
  </UserMainPanel>);
}

export default UserDocuments;
