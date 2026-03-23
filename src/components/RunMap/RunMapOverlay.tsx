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
  interactionEnabled: boolean;
  mapError: string | null;
  onChangeYear: (_year: string) => void;
  onToggleInteraction: () => void;
  onToggleLights: () => void;
}

const RunMapOverlay = ({
  title,
  thisYear,
  zoom,
  lights,
  runCount,
  isTouchDevice,
  interactionEnabled,
  mapError,
  onChangeYear,
  onToggleInteraction,
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
          <button
            type="button"
            className={`${styles.mapBadge} ${styles.mapBadgeButton} ${
              interactionEnabled ? styles.interactionToggleActive : ''
            }`}
            onClick={onToggleInteraction}
          >
            {interactionEnabled
              ? IS_CHINESE
                ? '地图交互已开启，点此关闭'
                : 'Map gestures on'
              : IS_CHINESE
                ? '单指可滚动页面，点此启用地图交互'
                : 'Single-finger scroll'}
          </button>
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
