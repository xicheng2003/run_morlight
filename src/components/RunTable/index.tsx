import React, { useMemo, useState } from 'react';
import {
  sortDateFunc,
  sortDateFuncReverse,
  convertMovingTime2Sec,
  Activity,
  RunIds,
} from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from "@/utils/const";

import RunRow from './RunRow';
import styles from './style.module.css';

interface IRunTableProperties {
  runs: Activity[];
  locateActivity: (_runIds: RunIds) => void;
  runIndex: number;
  setRunIndex: (_index: number) => void;
}

type SortFunc = (_a: Activity, _b: Activity) => number;

const RunTable = ({
  runs,
  locateActivity,
  runIndex,
  setRunIndex,
}: IRunTableProperties) => {
  const [sortFuncInfo, setSortFuncInfo] = useState('');
  // TODO refactor?
  const sortKMFunc: SortFunc = (a, b) =>
    sortFuncInfo === 'KM' ? a.distance - b.distance : b.distance - a.distance;
  const sortElevationGainFunc: SortFunc = (a, b) =>
    sortFuncInfo === 'Elevation Gain'
      ? (a.elevation_gain ?? 0) - (b.elevation_gain ?? 0)
      : (b.elevation_gain ?? 0) - (a.elevation_gain ?? 0);
  const sortPaceFunc: SortFunc = (a, b) =>
    sortFuncInfo === 'Pace'
      ? a.average_speed - b.average_speed
      : b.average_speed - a.average_speed;
  const sortBPMFunc: SortFunc = (a, b) => {
    return sortFuncInfo === 'BPM'
      ? (a.average_heartrate ?? 0) - (b.average_heartrate ?? 0)
      : (b.average_heartrate ?? 0) - (a.average_heartrate ?? 0);
  };
  const sortRunTimeFunc: SortFunc = (a, b) => {
    const aTotalSeconds = convertMovingTime2Sec(a.moving_time);
    const bTotalSeconds = convertMovingTime2Sec(b.moving_time);
    return sortFuncInfo === 'Time'
      ? aTotalSeconds - bTotalSeconds
      : bTotalSeconds - aTotalSeconds;
  };
  const sortDateFuncClick =
    sortFuncInfo === 'Date' ? sortDateFunc : sortDateFuncReverse;
  const sortFuncMap = new Map([
    ['KM', sortKMFunc],
    ['Elevation Gain', sortElevationGainFunc],
    ['Pace', sortPaceFunc],
    ['BPM', sortBPMFunc],
    ['Time', sortRunTimeFunc],
    ['Date', sortDateFuncClick],
  ]);
  if (!SHOW_ELEVATION_GAIN){
    sortFuncMap.delete('Elevation Gain')
  }

  const handleClick = (funcName: string) => {
    const f = sortFuncMap.get(funcName);

    setRunIndex(-1);
    setSortFuncInfo(sortFuncInfo === funcName ? '' : funcName);
    if (!f) {
      locateActivity([]);
    }
  };

  const sortedRuns = useMemo(() => {
    if (!sortFuncInfo) {
      return [...runs];
    }
    const f = sortFuncMap.get(sortFuncInfo);
    if (!f) {
      return [...runs];
    }
    return [...runs].sort(f);
  }, [runs, sortFuncInfo]);

  const columns = Array.from(sortFuncMap.keys());

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableToolbar}>
        <div className={styles.sortPills}>
          {columns.map((k) => {
            const active = sortFuncInfo === k;
            return (
              <button
                key={k}
                type="button"
                className={`${styles.sortPill} ${active ? styles.sortPillActive : ''}`}
                onClick={() => handleClick(k)}
              >
                {k}
                <span className={styles.sortIndicator}>{active ? '↑↓' : ''}</span>
              </button>
            );
          })}
        </div>
      </div>

      <table className={styles.runTable} cellSpacing="0" cellPadding="0">
        <thead>
          <tr>
            <th />
            {columns.map((k) => (
              <th key={k}>
                <button
                  type="button"
                  className={`${styles.headerButton} ${
                    sortFuncInfo === k ? styles.headerButtonActive : ''
                  }`}
                  onClick={() => handleClick(k)}
                >
                  <span>{k}</span>
                  <span className={styles.headerArrow}>
                    {sortFuncInfo === k ? '↑↓' : '↕'}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRuns.map((run, elementIndex) => (
            <RunRow
              key={run.run_id}
              elementIndex={elementIndex}
              locateActivity={locateActivity}
              run={run}
              runIndex={runIndex}
              setRunIndex={setRunIndex}
            />
          ))}
        </tbody>
      </table>

      <div className={styles.mobileList}>
        {sortedRuns.map((run, elementIndex) => (
          <RunRow
            key={run.run_id}
            elementIndex={elementIndex}
            locateActivity={locateActivity}
            run={run}
            runIndex={runIndex}
            setRunIndex={setRunIndex}
            compact
          />
        ))}
      </div>
    </div>
  );
};

export default RunTable;
