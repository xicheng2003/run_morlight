import { MAP_LAYER_LIST, ROAD_LABEL_DISPLAY, USE_DASH_LINE } from '@/utils/const';
import { geoJsonForMap, type Coordinate, type IViewState } from '@/utils/utils';
import type { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

const BIG_MAP_ZOOM = 3;
const ALWAYS_VISIBLE_LAYER_IDS = ['runs2'];

const isWideOverview = (zoom?: number) => (zoom ?? 0) <= BIG_MAP_ZOOM;

const mergeGeoDataForOverview = (
  geoData: FeatureCollection<Geometry, GeoJsonProperties>,
  zoom?: number,
  includeOverviewLayer?: boolean
) => {
  if (!includeOverviewLayer || !isWideOverview(zoom)) {
    return geoData;
  }

  return {
    ...geoData,
    features: geoData.features.concat(geoJsonForMap().features),
  };
};

const getSingleRunEndpoints = (
  geoData: FeatureCollection<Geometry, GeoJsonProperties>
) => {
  if (
    geoData.features.length !== 1 ||
    geoData.features[0].geometry.type !== 'LineString' ||
    geoData.features[0].geometry.coordinates.length === 0
  ) {
    return null;
  }

  const points = geoData.features[0].geometry.coordinates as Coordinate[];

  return {
    startLon: points[0][0],
    startLat: points[0][1],
    endLon: points[points.length - 1][0],
    endLat: points[points.length - 1][1],
  };
};

const getDashArray = (viewState: IViewState, isSingleRun: boolean) =>
  USE_DASH_LINE && !isSingleRun && !isWideOverview(viewState.zoom) ? [2, 2] : [2, 0];

const applyMapDisplayPreferences = (map: any, lightsOn: boolean) => {
  const style = map.getStyle();
  if (!style?.layers) {
    return;
  }

  if (!ROAD_LABEL_DISPLAY) {
    MAP_LAYER_LIST.forEach((layerId) => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });
  }

  style.layers.forEach((layer: any) => {
    if (!ALWAYS_VISIBLE_LAYER_IDS.includes(layer.id)) {
      map.setLayoutProperty(layer.id, 'visibility', lightsOn ? 'visible' : 'none');
    }
  });
};

export {
  applyMapDisplayPreferences,
  getDashArray,
  getSingleRunEndpoints,
  isWideOverview,
  mergeGeoDataForOverview,
};
