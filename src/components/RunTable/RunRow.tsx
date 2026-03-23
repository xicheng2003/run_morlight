import {
  formatPace,
  titleForRun,
  formatRunTime,
  locationForRun,
  Activity,
  RunIds,
} from '@/utils/utils';
import { SHOW_ELEVATION_GAIN } from '@/utils/const';
import styles from './style.module.css';

interface IRunRowProperties {
  elementIndex: number;
  locateActivity: (_runIds: RunIds) => void;
  run: Activity;
  runIndex: number;
  setRunIndex: (_ndex: number) => void;
  compact?: boolean;
}

const RunRow = ({
  elementIndex,
  locateActivity,
  run,
  runIndex,
  setRunIndex,
  compact = false,
}: IRunRowProperties) => {
  const distance = (run.distance / 1000.0).toFixed(2);
  const elevation_gain = run.elevation_gain?.toFixed(0);
  const paceParts = run.average_speed ? formatPace(run.average_speed) : null;
  const heartRate = run.average_heartrate;
  const runTime = formatRunTime(run.moving_time);
  const { city, province } = locationForRun(run);
  const isSelected = runIndex === elementIndex;

  const handleClick = () => {
    if (runIndex === elementIndex) {
      setRunIndex(-1);
      locateActivity([]);
      return;
    }
    setRunIndex(elementIndex);
    locateActivity([run.run_id]);
  };

  if (compact) {
    return (
      <button
        type="button"
        className={`${styles.mobileCard} ${isSelected ? styles.selected : ''}`}
        onClick={handleClick}
      >
        <div className={styles.mobileCardHeader}>
          <div className="space-y-1 text-left">
            <h3 className={styles.mobileTitle}>{titleForRun(run)}</h3>
            <p className={styles.mobileMeta}>
              {[city || province, run.start_date_local].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div className={styles.mobileDistance}>{distance} KM</div>
        </div>
        <div className={styles.mobileMetrics}>
          <div>
            <span className={styles.mobileMetricLabel}>Pace</span>
            <strong>{paceParts || '--'}</strong>
          </div>
          <div>
            <span className={styles.mobileMetricLabel}>Time</span>
            <strong>{runTime}</strong>
          </div>
          <div>
            <span className={styles.mobileMetricLabel}>BPM</span>
            <strong>{heartRate ? heartRate.toFixed(0) : '--'}</strong>
          </div>
          {SHOW_ELEVATION_GAIN ? (
            <div>
              <span className={styles.mobileMetricLabel}>Gain</span>
              <strong>{elevation_gain || '--'}m</strong>
            </div>
          ) : null}
        </div>
      </button>
    );
  }

  return (
    <tr
      className={`${styles.runRow} ${isSelected ? styles.selected : ''}`}
      key={run.start_date_local}
      onClick={handleClick}
    >
      <td>{titleForRun(run)}</td>
      <td>{distance}</td>
      {SHOW_ELEVATION_GAIN && <td>{elevation_gain}</td>}
      {paceParts && <td>{paceParts}</td>}
      <td>{heartRate && heartRate.toFixed(0)}</td>
      <td>{runTime}</td>
      <td className={styles.runDate}>{run.start_date_local}</td>
    </tr>
  );
};

export default RunRow;
