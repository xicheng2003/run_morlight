import React, {useRef, useCallback, useState, useEffect, useMemo} from 'react';
import Map, {Layer, Source, FullscreenControl, NavigationControl, MapRef} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useActivities from '@/hooks/useActivities';
import {
  MAP_LAYER_LIST,
  IS_CHINESE,
  ROAD_LABEL_DISPLAY,
  MAPTILER_KEY,
  MAP_STYLE,
  PROVINCE_FILL_COLOR,
  COUNTRY_FILL_COLOR,
  USE_DASH_LINE,
  LINE_OPACITY,
  MAP_HEIGHT,
  PRIVACY_MODE,
  LIGHTS_ON,
} from '@/utils/const';
import { Coordinate, IViewState, geoJsonForMap } from '@/utils/utils';
import RunMarker from './RunMarker';
import RunMapButtons from './RunMapButtons';
import styles from './style.module.css';
import { FeatureCollection } from 'geojson';
import './mapbox.css';
import LightsControl from "@/components/RunMap/LightsControl";

interface IRunMapProps {
  title: string;
  viewState: IViewState;
  setViewState: (_viewState: IViewState) => void;
  changeYear: (_year: string) => void;
  geoData: FeatureCollection<any>;
  thisYear: string;
}

const RunMap = ({
  title,
  viewState,
  setViewState,
  changeYear,
  geoData,
  thisYear,
}: IRunMapProps) => {
  const { countries, provinces } = useActivities();
  const mapRef = useRef<MapRef>();
  const [lights, setLights] = useState(PRIVACY_MODE ? false : LIGHTS_ON);
  const [mapError, setMapError] = useState<string | null>(null);

  const isDefaultKey = MAPTILER_KEY === 'get-your-key-at-maptiler.com';

  const keepWhenLightsOff = useMemo(() => ['runs2'], []);

  const switchLayerVisibility = useCallback((map: any, lightsOn: boolean) => {
    try {
      const style = map.getStyle();
      if (!style || !style.layers) return;
      style.layers.forEach((layer: any) => {
        if (!keepWhenLightsOff.includes(layer.id)) {
          map.setLayoutProperty(layer.id, 'visibility', lightsOn ? 'visible' : 'none');
        }
      });
    } catch (e) {
      console.warn('Failed to switch layer visibility', e);
    }
  }, [keepWhenLightsOff]);

  const mapRefCallback = useCallback(
    (ref: MapRef) => {
      if (ref !== null) {
        const map = ref.getMap();
        map.on('style.load', () => {
          if (!ROAD_LABEL_DISPLAY) {
            MAP_LAYER_LIST.forEach((layerId) => {
              if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
              }
            });
          }
          mapRef.current = ref;
          switchLayerVisibility(map, lights);
        });
      }
    },
    [lights, switchLayerVisibility]
  );

  useEffect(() => {
    if (mapRef.current) {
      switchLayerVisibility(mapRef.current.getMap(), lights);
    }
  }, [lights, switchLayerVisibility]);

  const filterProvinces = useMemo(() => {
    const p = provinces.slice();
    p.unshift('in', 'name');
    return p;
  }, [provinces]);

  const filterCountries = useMemo(() => {
    const c = countries.slice();
    c.unshift('in', 'name');
    return c;
  }, [countries]);

  const mergedGeoData = useMemo(() => {
    const isBigMap = (viewState.zoom ?? 0) <= 3;
    if (isBigMap && IS_CHINESE) {
      return {
        ...geoData,
        features: geoData.features.concat(geoJsonForMap().features)
      };
    }
    return geoData;
  }, [geoData, viewState.zoom]);

  const isSingleRun = useMemo(() => 
    mergedGeoData.features.length === 1 &&
    mergedGeoData.features[0].geometry.type === 'LineString' &&
    mergedGeoData.features[0].geometry.coordinates.length > 0
  , [mergedGeoData]);

  const startEndPoints = useMemo(() => {
    if (isSingleRun) {
      const points = mergedGeoData.features[0].geometry.coordinates as Coordinate[];
      return {
        startLon: points[0][0],
        startLat: points[0][1],
        endLon: points[points.length - 1][0],
        endLat: points[points.length - 1][1],
      };
    }
    return null;
  }, [isSingleRun, mergedGeoData]);

  const dash = useMemo(() => {
    const isBigMap = (viewState.zoom ?? 0) <= 3;
    return USE_DASH_LINE && !isSingleRun && !isBigMap ? [2, 2] : [2, 0];
  }, [viewState.zoom, isSingleRun]);

  const onMove = useCallback(({ viewState }: { viewState: IViewState }) => {
    setViewState(viewState);
  }, [setViewState]);

  const style: React.CSSProperties = {
    width: '100%',
    height: MAP_HEIGHT,
  };
  const fullscreenButton: React.CSSProperties = {
    position: 'absolute',
    marginTop: '29.2px',
    right: '0px',
    opacity: 0.3,
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (mapRef.current) {
        mapRef.current.getMap().resize();
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const onMapError = useCallback((e: any) => {
    console.error('MapLibre error:', e);
    setMapError(e.error?.message || 'Failed to load map');
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-lg">
      <Map
        {...viewState}
        onMove={onMove}
        style={style}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        ref={mapRefCallback}
        onError={onMapError}
      >
        <RunMapButtons changeYear={changeYear} thisYear={thisYear} />
        <Source id="data" type="geojson" data={mergedGeoData}>
          <Layer
            id="province"
            type="fill"
            paint={{
              'fill-color': PROVINCE_FILL_COLOR,
            }}
            filter={filterProvinces}
          />
          <Layer
            id="countries"
            type="fill"
            paint={{
              'fill-color': COUNTRY_FILL_COLOR,
              'fill-opacity': ["case", ["==", ["get", "name"], '中国'], 0.1, 0.5],
            }}
            filter={filterCountries}
          />
          <Layer
            id="runs2"
            type="line"
            paint={{
              'line-color':  ['get', 'color'],
              'line-width': (viewState.zoom ?? 0) <= 3 && lights ? 1 : 2,
              'line-dasharray': dash as any,
              'line-opacity': isSingleRun || (viewState.zoom ?? 0) <= 3 || !lights ? 1 : LINE_OPACITY,
              'line-blur': 1,
            }}
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
          />
        </Source>
        {startEndPoints && (
          <RunMarker
            startLat={startEndPoints.startLat}
            startLon={startEndPoints.startLon}
            endLat={startEndPoints.endLat}
            endLon={startEndPoints.endLon}
          />
        )}
        <span className={styles.runTitle}>{title}</span>
        <FullscreenControl style={fullscreenButton}/>
        {!PRIVACY_MODE && <LightsControl setLights={setLights} lights={lights}/>}
        <NavigationControl showCompass={false} position={'bottom-right'} style={{opacity: 0.3}}/>
      </Map>
      
      {(isDefaultKey || mapError) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-8 text-center text-white backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-orange-400">
            {mapError ? 'Map Loading Error' : 'MapTiler Key Required'}
          </h3>
          <p className="mb-6 max-w-md text-sm text-gray-300">
            {mapError ? `Error: ${mapError}` : 'To display the map, please register for a free account at maptiler.com and put your API key in src/utils/const.ts.'}
          </p>
          <div className="flex gap-4">
            <a 
              href="https://www.maptiler.com/cloud/" 
              target="_blank" 
              rel="noreferrer"
              className="rounded bg-orange-600 px-4 py-2 text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Get Free Key
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunMap;
