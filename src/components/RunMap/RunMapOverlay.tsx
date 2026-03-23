import { IS_CHINESE, PRIVACY_MODE } from '@/utils/const';
import styles from './style.module.css';
import LightsControl from './LightsControl';
import RunMapButtons from './RunMapButtons';

interface RunMapOverlayProps {
  title: string;
  thisYear: string;
  zoom?: number;
  lights: boolean;
  runCount: number;
  isTouchDevice: boolean;
  mapError: string | null;
  onChangeYear: (_year: string) => void;
  onToggleLights: () => void;
}

const RunMapOverlay = ({
  title,
  thisYear,
  zoom,
  lights,
  runCount,
  isTouchDevice,
  mapError,
  onChangeYear,
  onToggleLights,
}: RunMapOverlayProps) => (
  <>
    <div className={styles.overlayStack}>
      <RunMapButtons changeYear={onChangeYear} thisYear={thisYear} />
      <div className={styles.mapBadgeGroup}>
        <span className={styles.mapBadge}>
          {IS_CHINESE ? '当前记录' : 'Visible Runs'} {runCount}
        </span>
        <span className={styles.mapBadge}>
          Zoom {(zoom ?? 0).toFixed(1)}
        </span>
        {isTouchDevice ? (
          <span className={styles.mapBadge}>
            {IS_CHINESE ? '双指移动地图' : 'Use two fingers'}
          </span>
        ) : null}
        {mapError ? (
          <span className={`${styles.mapBadge} ${styles.mapBadgeDanger}`}>
            {IS_CHINESE ? '地图异常' : 'Map Issue'}
          </span>
        ) : null}
      </div>
    </div>

    {title ? <span className={styles.runTitle}>{title}</span> : null}
    {!PRIVACY_MODE ? (
      <LightsControl setLights={onToggleLights} lights={lights} />
    ) : null}
  </>
);

export default RunMapOverlay;
