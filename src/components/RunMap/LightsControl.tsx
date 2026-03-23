import styles from './style.module.css';

interface ILightsProps {
  setLights: () => void;
  lights: boolean;
}

const LightsControl = ({ setLights, lights }: ILightsProps) => {
  return (
    <div className={`mapboxgl-ctrl mapboxgl-ctrl-group ${styles.lights}`}>
      <button
        type="button"
        className={`${lights ? styles.lightsOn : styles.lightsOff}`}
        onClick={setLights}
        aria-label={`Turn ${lights ? 'off' : 'on'} the light`}
      >
        <span
          className="mapboxgl-ctrl-icon"
          aria-hidden="true"
          title={`Turn ${lights ? 'off' : 'on'} the Light`}
        />
      </button>
    </div>
  );
};

export default LightsControl;
