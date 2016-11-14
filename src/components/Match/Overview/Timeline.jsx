import React from 'react';
import {
  formatSeconds,
  isRadiant,
} from 'utility';
import {
  IconBloodDrop,
  IconRoshan,
  IconBattle,
} from 'components/Icons';
import strings from 'lang';
import ReactTooltip from 'react-tooltip';

import styles from './Timeline.css';

export default ({ match }) => {
  const preHorn = 90; // Seconds before the battle horn

  const obj = [];

  if (match.objectives) {
    // Firstblood
    const fbIndex = match.objectives.findIndex(obj => obj.type === 'CHAT_MESSAGE_FIRSTBLOOD');
    obj.push([{
      type: 'firstblood',
      time: match.objectives[fbIndex].time,
      player_slot: match.objectives[fbIndex].player_slot,
      key: match.players.map(player =>
        player.kills_log.filter(kill =>
          kill.time === match.objectives[fbIndex].time,
        )).filter(String)[0][0].key,
    }]

    // Roshan kills, team 2 = radiant, 3 = dire
    .concat(
      match.objectives
        .filter(obj => obj.type === 'CHAT_MESSAGE_ROSHAN_KILL')
        .map(obj => ({
          type: 'roshan',
          time: obj.time,
          team: obj.team,
        })) || [],
    )

    // Aegis pickups
    .concat(
      match.objectives
        .filter(obj => obj.type === 'CHAT_MESSAGE_AEGIS')
        .map(obj => ({
          type: 'aegis',
          time: obj.time,
          player_slot: obj.player_slot,
        })) || [],
    )

    // Teamfights
    .concat(
      match.teamfights.map(fight => ({
        type: 'teamfight',
        start: fight.start,
        end: fight.end,
        time: (fight.start + fight.end) / 2,
        radiant_gold_delta: fight.radiant_gold_delta,
      })) || [],
    ));
  }

  return (
    <main className={styles.timeline}>
      <section>
        <mark>{strings.general_radiant}</mark>
        <time>-1:30</time>
        <mark>{strings.general_dire}</mark>
      </section>
      <div className={styles.battle}>
        <div className={styles.line}>
          <section style={{ width: '100%' }} />
        </div>
        <div className={styles.events}>
          <mark
            className={styles.battleHorn}
            style={{
              left: `${(preHorn * 100) / (match.duration + preHorn)}%`,
            }}
          />
          {
            obj[0].map((obj, i) => {
              const side = (
                obj.player_slot && isRadiant(obj.player_slot))
                  || (obj.team && obj.team === 2
              ) ? 'radiant' : 'dire';

              const wTeamfight = obj.type === 'teamfight' && (100 * (obj.end - obj.start)) / (match.duration + preHorn);

              return (obj.type !== 'aegis' &&
                <mark
                  key={i}
                  className={obj.type === 'teamfight' ? styles.teamfight : styles[side]}
                  style={{
                    left: obj.time && `${
                      ((100 * (obj.time + preHorn)) / (match.duration + preHorn)) - (wTeamfight / 2)
                    }%`,
                    width: `${wTeamfight}%`,
                    // backgroundColor: obj.type === 'teamfight' && (
                    //   obj.radiant_gold_delta >= 0 ? styles.green : styles.red
                    // ),
                  }}
                >
                  {obj.type === 'firstblood' &&
                    <IconBloodDrop
                      data-tip
                      data-for={`event_${i}`}
                    />
                  }
                  {obj.type === 'roshan' &&
                    <IconRoshan />
                  }
                  {obj.type === 'teamfight' &&
                    <IconBattle style={{ fill: obj.radiant_gold_delta >= 0 ? styles.green : styles.red }} />
                  }
                  <ReactTooltip id={`event_${i}`} effect="solid" place="right">
                    {obj.type === 'firstblood' &&
                      <div>
                        {obj.player_slot}
                        drew first blood by killing
                        {obj.key.split('npc_dota_hero_')[1]}
                      </div>
                    }
                  </ReactTooltip>
                  <time>
                    {obj.type === 'teamfight' ? '' : formatSeconds(obj.time)}
                  </time>
                </mark>
              );
            })
          }
        </div>
      </div>
      <time>{formatSeconds(match.duration)}</time>
    </main>
  );
};
