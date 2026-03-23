import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import Map, { Layer, Source, FullscreenControl, NavigationControl, MapRef } from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import useActivities from '@/hooks/useActivities';
import {
  IS_CHINESE,
  MAPTILER_KEY,
  MAP_STYLE,
  PROVINCE_FILL_COLOR,
  COUNTRY_FILL_COLOR,
  LINE_OPACITY,
  PRIVACY_MODE,
  LIGHTS_ON,
} from '@/utils/const';
import { IViewState } from '@/utils/utils';
import RunMarker from './RunMarker';
import RunMapOverlay from './RunMapOverlay';
import type { FeatureCollection } from 'geojson';
import './mapbox.css';
import {
  applyMapDisplayPreferences,
  getDashArray,
  getSingleRunEndpoints,
  mergeGeoDataForOverview,
} from './mapLayers';

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
  const mapRef = useRef<MapRef | null>(null);
  const [lights, setLights] = useState(PRIVACY_MODE ? false : LIGHTS_ON);
  const [mapError, setMapError] = useState<string | null>(null);

  const isDefaultKey = MAPTILER_KEY === 'get-your-key-at-maptiler.com';

  const mapRefCallback = useCallback(
    (ref: MapRef) => {
      if (ref !== null) {
        const map = ref.getMap();
        map.on('style.load', () => {
          mapRef.current = ref;
          applyMapDisplayPreferences(map, lights);
        });
      }
    },
    [lights]
  );

  useEffect(() => {
    if (mapRef.current) {
      applyMapDisplayPreferences(mapRef.current.getMap(), lights);
    }
  }, [lights]);

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
    return mergeGeoDataForOverview(geoData, viewState.zoom, IS_CHINESE);
  }, [geoData, viewState.zoom]);

  const startEndPoints = useMemo(
    () => getSingleRunEndpoints(mergedGeoData),
    [mergedGeoData]
  );
  const isSingleRun = Boolean(startEndPoints);
  const dash = useMemo(() => getDashArray(viewState, isSingleRun), [viewState, isSingleRun]);

  const onMove = useCallback(({ viewState }: { viewState: IViewState }) => {
    setViewState(viewState);
  }, [setViewState]);

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };
  const fullscreenButton: React.CSSProperties = {
    position: 'absolute',
    marginTop: '80px',
    right: '20px',
    opacity: 0.5,
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
    <div className="h-full w-full overflow-hidden">
      <Map
        {...viewState}
        onMove={onMove}
        style={style}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        ref={mapRefCallback}
        onError={onMapError}
        scrollZoom={false}
      >
        <RunMapOverlay
          title={title}
          thisYear={thisYear}
          zoom={viewState.zoom}
          lights={lights}
          runCount={geoData.features.length}
          mapError={mapError}
          onChangeYear={changeYear}
          onToggleLights={() => setLights((current) => !current)}
        />
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
              'fill-opacity': ['case', ['==', ['get', 'name'], '中国'], 0.1, 0.5],
            }}
            filter={filterCountries}
          />
          {/* Layer 1: The Outer Glow (Wide & Blurry) */}
          <Layer
            id="runs-glow"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': (viewState.zoom ?? 0) <= 3 && lights ? 2 : 6,
              'line-opacity': isSingleRun || !lights ? 0.4 : 0.15,
              'line-blur': 8,
            }}
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
          />
          {/* Layer 2: The Main Path (Standard) */}
          <Layer
            id="runs2"
            type="line"
            paint={{
              'line-color': ['get', 'color'],
              'line-width': (viewState.zoom ?? 0) <= 3 && lights ? 1 : 2,
              'line-dasharray': dash as any,
              'line-opacity':
                isSingleRun || (viewState.zoom ?? 0) <= 3 || !lights ? 1 : LINE_OPACITY,
              'line-blur': 0.5,
            }}
            layout={{
              'line-join': 'round',
              'line-cap': 'round',
            }}
          />
          {/* Layer 3: The Light Core (Thin & Bright) */}
          <Layer
            id="runs-core"
            type="line"
            paint={{
              'line-color': '#ffffff',
              'line-width': 0.8,
              'line-opacity': isSingleRun ? 0.6 : 0.1,
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
        <FullscreenControl style={fullscreenButton} />
        <NavigationControl
          showCompass={false}
          position={'bottom-right'}
          style={{ opacity: 0.3 }}
        />
      </Map>

      {(isDefaultKey || mapError) && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 p-8 text-center text-white backdrop-blur-sm">
          <h3 className="mb-4 text-xl font-bold text-orange-400">
            {mapError ? 'Map Loading Error' : 'MapTiler Key Required'}
          </h3>
          <p className="mb-6 max-w-md text-sm text-gray-300">
            {mapError
              ? `Error: ${mapError}`
              : 'To display the map, please register for a free account at maptiler.com and put your API key in src/utils/const.ts.'}
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
