import * as mapboxPolyline from '@mapbox/polyline';
import gcoord from 'gcoord';
import { WebMercatorViewport } from 'viewport-mercator-project';
import { chinaGeojson, RPGeometry } from '@/static/run_countries';
import worldGeoJson from '@surbowl/world-geo-json-zh/world.zh.json';
import { chinaCities } from '@/static/city';
import {
  MAIN_COLOR,
  MUNICIPALITY_CITIES_ARR,
  NEED_FIX_MAP,
  RUN_TITLES,
  ACTIVITY_TYPES,
  RICH_TITLE,
  CYCLING_COLOR,
  HIKING_COLOR,
  WALKING_COLOR,
  SWIMMING_COLOR,
  RUN_COLOR,
  RUN_TRAIL_COLOR,
} from './const';
import { FeatureCollection, LineString } from 'geojson';

export type Coordinate = [number, number];

export type RunIds = Array<number> | [];

export interface Activity {
  run_id: number;
  name: string;
  distance: number;
  moving_time: string;
  type: string;
  subtype: string;
  start_date: string;
  start_date_local: string;
  location_country?: string | null;
  summary_polyline?: string | null;
  average_heartrate?: number | null;
  elevation_gain: number | null;
  average_speed: number;
  streak: number;
}

export interface ProcessedActivity extends Activity {
  path: Coordinate[];
  color: string;
}

const normalizeActivityType = (type = '', subtype = ''): string => {
  const raw = `${type}`.trim().toLowerCase();
  const rawSubtype = `${subtype}`.trim().toLowerCase();

  if (
    raw === 'run' ||
    raw === 'running' ||
    raw === 'virtualrun' ||
    raw === 'virtual_run'
  ) {
    if (rawSubtype === 'trail') return 'trail';
    if (rawSubtype === 'treadmill') return 'treadmill';
    if (raw === 'virtualrun' || raw === 'virtual_run') return 'virtual-run';
    return 'run';
  }

  if (raw === 'ride' || raw === 'cycling' || raw === 'bike') return 'ride';
  if (raw === 'walk' || raw === 'walking') return 'walk';
  if (raw === 'hike' || raw === 'hiking') return 'hike';
  if (raw === 'swim' || raw === 'swimming') return 'swim';
  if (raw.includes('ski')) return 'ski';

  return raw;
};

const titleForShow = (run: Activity): string => {
  const date = run.start_date_local.slice(0, 11);
  const distance = (run.distance / 1000.0).toFixed(2);
  let name = 'Run';
  if (run.name.slice(0, 7) === 'Running') {
    name = 'run';
  }
  if (run.name) {
    name = run.name;
  }
  return `${name} ${date} ${distance} KM ${
    !run.summary_polyline ? '(No map data for this run)' : ''
  }`;
};

const formatPace = (d: number): string => {
  if (Number.isNaN(d)) return '0';
  const pace = (1000.0 / 60.0) * (1.0 / d);
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60.0);
  return `${minutes}'${seconds.toFixed(0).toString().padStart(2, '0')}"`;
};

const convertMovingTime2Sec = (moving_time: string): number => {
  if (!moving_time) {
    return 0;
  }
  // moving_time : '2 days, 12:34:56' or '12:34:56';
  const splits = moving_time.split(', ');
  const days = splits.length == 2 ? parseInt(splits[0]) : 0;
  const time = splits.splice(-1)[0];
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const totalSeconds = ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
  return totalSeconds;
};

const formatRunTime = (moving_time: string): string => {
  const totalSeconds = convertMovingTime2Sec(moving_time);
  const seconds = totalSeconds % 60;
  const minutes = (totalSeconds - seconds) / 60;
  if (minutes === 0) {
    return seconds + 's';
  }
  return minutes + 'min';
};

// for scroll to the map
const scrollToMap = () => {
  const el = document.querySelector('.fl.w-100.w-70-l');
  const rect = el?.getBoundingClientRect();
  if (rect) {
    window.scroll(rect.left + window.scrollX, rect.top + window.scrollY);
  }
};

const extractCities = (str: string): string[] => {
  const locations = [];
  let match;
  const pattern = /([\u4e00-\u9fa5]{2,}(市|自治州|特别行政区|盟|地区))/g;
  while ((match = pattern.exec(str)) !== null) {
    locations.push(match[0]);
  }

  return locations;
};

const extractDistricts = (str: string): string[] => {
  const locations = [];
  let match;
  const pattern = /([\u4e00-\u9fa5]{2,}(区|县))/g;
  while ((match = pattern.exec(str)) !== null) {
    locations.push(match[0]);
  }

  return locations;
};

const extractCoordinate = (str: string): [number, number] | null => {
  const pattern = /'latitude': ([-]?\d+\.\d+).*?'longitude': ([-]?\d+\.\d+)/;
  const match = str.match(pattern);

  if (match) {
    const latitude = parseFloat(match[1]);
    const longitude = parseFloat(match[2]);
    return [longitude, latitude];
  }

  return null;
};

const cities = chinaCities.map((c) => c.name);
const locationCache = new Map<number, ReturnType<typeof locationForRun>>();
// what about oversea?
const locationForRun = (
  run: Activity
): {
  country: string;
  province: string;
  city: string;
  coordinate: [number, number] | null;
} => {
  if (locationCache.has(run.run_id)) {
    return locationCache.get(run.run_id)!;
  }
  let location = run.location_country;
  let [city, province, country] = ['', '', ''];
  let coordinate = null;
  if (location) {
    // Only for Chinese now
    // should filter 臺灣
    const cityMatch = extractCities(location);
    const provinceMatch = location.match(/[\u4e00-\u9fa5]{2,}(省|自治区)/);

    if (cityMatch) {
      city = cities.find((value) => cityMatch.includes(value)) as string;

      if (!city) {
        city = '';
      }
    }
    if (provinceMatch) {
      [province] = provinceMatch;
      // try to extract city coord from location_country info
      coordinate = extractCoordinate(location);
    }
    const l = location.split(',');
    // or to handle keep location format
    let countryMatch = l[l.length - 1].match(
      /[\u4e00-\u9fa5].*[\u4e00-\u9fa5]/
    );
    if (!countryMatch && l.length >= 3) {
      countryMatch = l[2].match(/[\u4e00-\u9fa5].*[\u4e00-\u9fa5]/);
    }
    if (countryMatch) {
      [country] = countryMatch;
    }
  }
  if (MUNICIPALITY_CITIES_ARR.includes(city)) {
    province = city;
    if (location) {
      const districtMatch = extractDistricts(location);
      if (districtMatch.length > 0) {
        city = districtMatch[districtMatch.length - 1];
      }
    }
  }

  const r = { country, province, city, coordinate };
  locationCache.set(run.run_id, r);
  return r;
};

const intComma = (x = '') => {
  if (x.toString().length <= 5) {
    return x;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const pathForRun = (run: Activity): Coordinate[] => {
  try {
    if (!run.summary_polyline) {
      return [];
    }
    const c = mapboxPolyline.decode(run.summary_polyline);
    // reverse lat long for mapbox
    c.forEach((arr) => {
      [arr[0], arr[1]] = !NEED_FIX_MAP
        ? [arr[1], arr[0]]
        : gcoord.transform([arr[1], arr[0]], gcoord.GCJ02, gcoord.WGS84);
    });
    // try to use location city coordinate instead , if runpath is incomplete
    if (c.length === 2 && String(c[0]) === String(c[1])) {
      const { coordinate } = locationForRun(run);
      if (coordinate?.[0] && coordinate?.[1]) {
        return [coordinate, coordinate];
      }
    }
    return c;
  } catch (err) {
    return [];
  }
};

const colorForRun = (run: Activity): string => {
  switch (normalizeActivityType(run.type, run.subtype)) {
    case 'trail':
      return RUN_TRAIL_COLOR;
    case 'run':
    case 'virtual-run':
      return RUN_COLOR;
    case 'ride':
      return CYCLING_COLOR;
    case 'hike':
      return HIKING_COLOR;
    case 'walk':
      return WALKING_COLOR;
    case 'swim':
      return SWIMMING_COLOR;
    default:
      return MAIN_COLOR;
  }
};

const geoJsonForRuns = (runs: Activity[]): FeatureCollection<LineString> => ({
  type: 'FeatureCollection',
  features: runs.map((run) => {
    const points = (run as ProcessedActivity).path || pathForRun(run);
    const color = (run as ProcessedActivity).color || colorForRun(run);
    return {
      type: 'Feature',
      properties: {
        color: color,
      },
      geometry: {
        type: 'LineString',
        coordinates: points,
      },
    };
  }),
});

const geoJsonForMap = (): FeatureCollection<RPGeometry> => ({
  type: 'FeatureCollection',
  features: worldGeoJson.features.concat(chinaGeojson.features),
});

const getActivitySport = (act: Activity): string => {
  const normalizedType = normalizeActivityType(act.type, act.subtype);

  if (
    normalizedType === 'run' ||
    normalizedType === 'trail' ||
    normalizedType === 'treadmill' ||
    normalizedType === 'virtual-run'
  ) {
    if (normalizedType === 'trail') return ACTIVITY_TYPES.RUN_TRAIL_TITLE;
    if (normalizedType === 'treadmill') return ACTIVITY_TYPES.RUN_TREADMILL_TITLE;
    if (normalizedType === 'virtual-run') return ACTIVITY_TYPES.RUN_GENERIC_TITLE;
    if (act.subtype === 'generic' || act.subtype === 'Run' || !act.subtype) {
      const runDistance = act.distance / 1000;
      if (runDistance > 20 && runDistance < 40) {
        return RUN_TITLES.HALF_MARATHON_RUN_TITLE;
      } else if (runDistance >= 40) {
        return RUN_TITLES.FULL_MARATHON_RUN_TITLE;
      }
      return ACTIVITY_TYPES.RUN_GENERIC_TITLE;
    }
    return ACTIVITY_TYPES.RUN_GENERIC_TITLE;
  } else if (normalizedType === 'hike') {
    return ACTIVITY_TYPES.HIKING_TITLE;
  } else if (normalizedType === 'ride') {
    return ACTIVITY_TYPES.CYCLING_TITLE;
  } else if (normalizedType === 'walk') {
    return ACTIVITY_TYPES.WALKING_TITLE;
  } else if (normalizedType === 'ski') {
    return ACTIVITY_TYPES.SKIING_TITLE;
  } else if (normalizedType === 'swim') {
    return 'Swim';
  }
  return '';
};

const titleForRun = (run: Activity): string => {
  if (RICH_TITLE) {
    // 1. try to use user defined name
    if (run.name != '') {
      return run.name;
    }
    // 2. try to use location+type if the location is available, eg. 'Shanghai Run'
    const { city } = locationForRun(run);
    const activity_sport = getActivitySport(run);
    if (city && city.length > 0 && activity_sport.length > 0) {
      return `${city} ${activity_sport}`;
    }
  }
  // 3. use time+length if location or type is not available
  const normalizedType = normalizeActivityType(run.type, run.subtype);
  if (
    normalizedType !== 'run' &&
    normalizedType !== 'trail' &&
    normalizedType !== 'treadmill' &&
    normalizedType !== 'virtual-run'
  ) {
    return getActivitySport(run) || run.type;
  }

  const runDistance = run.distance / 1000;
  const runHour = +run.start_date_local.slice(11, 13);
  if (runDistance > 20 && runDistance < 40) {
    return RUN_TITLES.HALF_MARATHON_RUN_TITLE;
  }
  if (runDistance >= 40) {
    return RUN_TITLES.FULL_MARATHON_RUN_TITLE;
  }
  if (runHour >= 5 && runHour < 9) {
    return RUN_TITLES.MORNING_RUN_TITLE;
  }
  if (runHour >= 9 && runHour < 12) {
    return RUN_TITLES.MORNING_RUN_TITLE; // You can separate into "Morning" and "Late Morning" if needed, but keeping it standard
  }
  if (runHour >= 12 && runHour < 14) {
    return RUN_TITLES.MIDDAY_RUN_TITLE;
  }
  if (runHour >= 14 && runHour < 18) {
    return RUN_TITLES.AFTERNOON_RUN_TITLE;
  }
  if (runHour >= 18 && runHour < 21) {
    return RUN_TITLES.EVENING_RUN_TITLE;
  }
  return RUN_TITLES.NIGHT_RUN_TITLE; // 21:00 to 04:59
};

export interface IViewState {
  longitude?: number;
  latitude?: number;
  zoom?: number;
}

const getBoundsForGeoData = (
  geoData: FeatureCollection<LineString>
): IViewState => {
  const { features } = geoData;
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let hasPoints = false;

  for (const f of features) {
    if (f.geometry.coordinates.length) {
      for (const [lon, lat] of f.geometry.coordinates) {
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      hasPoints = true;
    }
  }

  if (!hasPoints) {
    return { longitude: 105, latitude: 35, zoom: 3 }; // Default center
  }
  if (minLon === maxLon && minLat === maxLat) {
    return { longitude: minLon, latitude: minLat, zoom: 12 };
  }

  const cornersLongLat: [Coordinate, Coordinate] = [
    [minLon, minLat],
    [maxLon, maxLat],
  ];

  try {
    const viewState = new WebMercatorViewport({
      width: typeof window !== 'undefined' ? window.innerWidth : 800,
      height: typeof window !== 'undefined' ? window.innerHeight : 600,
    }).fitBounds(cornersLongLat, { padding: 80 });
    return {
      longitude: viewState.longitude,
      latitude: viewState.latitude,
      // Cap the maximum zoom to avoid zooming too close on single short runs
      zoom: Math.min(viewState.zoom, 14),
    };
  } catch (e) {
    return {
      longitude: (minLon + maxLon) / 2,
      latitude: (minLat + maxLat) / 2,
      zoom: 10,
    };
  }
};

const filterYearRuns = (run: Activity, year: string) => {
  if (run && run.start_date_local) {
    return run.start_date_local.slice(0, 4) === year;
  }
  return false;
};

const filterCityRuns = (run: Activity, city: string) => {
  if (run && run.location_country) {
    return run.location_country.includes(city);
  }
  return false;
};
const filterTitleRuns = (run: Activity, title: string) =>
  titleForRun(run) === title;

const filterAndSortRuns = (
  activities: Activity[],
  item: string,
  filterFunc: (_run: Activity, _bvalue: string) => boolean,
  sortFunc: (_a: Activity, _b: Activity) => number
) => {
  let s = activities;
  if (item !== 'Total') {
    s = activities.filter((run) => filterFunc(run, item));
  }
  return s.sort(sortFunc);
};

const sortDateFunc = (a: Activity, b: Activity) => {
  return (
    new Date(b.start_date_local.replace(' ', 'T')).getTime() -
    new Date(a.start_date_local.replace(' ', 'T')).getTime()
  );
};
const sortDateFuncReverse = (a: Activity, b: Activity) => sortDateFunc(b, a);

export {
  titleForShow,
  formatPace,
  scrollToMap,
  locationForRun,
  normalizeActivityType,
  getActivitySport,
  intComma,
  pathForRun,
  colorForRun,
  geoJsonForRuns,
  geoJsonForMap,
  titleForRun,
  filterYearRuns,
  filterCityRuns,
  filterTitleRuns,
  filterAndSortRuns,
  sortDateFunc,
  sortDateFuncReverse,
  getBoundsForGeoData,
  formatRunTime,
  convertMovingTime2Sec,
};
