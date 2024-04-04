/* eslint-disable no-fallthrough,no-undef */

'use strict';

import AppStorage from '../../../global/components/utils/local-storage';
import WebWorker from '../../../global/components/base/web-worker';
import MapWorker from './map-worker';
import config from './map-ol-config.json';
import OlView from 'ol/View';
import OlMap from 'ol/Map';
import Feature from 'ol/Feature';
import Collection from 'ol/Collection';
import Projection from 'ol/proj/Projection';
import proj4 from 'proj4';
import { fromLonLat, toLonLat } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import LayerGroup from 'ol/layer/Group';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import OlOverlay from 'ol/Overlay';
import GeometryType from 'ol/geom/GeometryType';
import { Point } from 'ol/geom';
import { Circle, Fill, Stroke, Style } from 'ol/style';
import { createDefaultStyle } from 'ol/style/Style';
import { getCenter } from 'ol/extent';
import { defaults as defaultControls } from 'ol/control';
import { defaults as defaultInteractions, MouseWheelZoom, Select as OlSelect } from 'ol/interaction';
import CustomOverlay from './map-ui';
import OlStyle from './map-ol-style';
import KakaoMapWalker from './map-kakao-walker';
import { geo_line_as, n3a_a0010000, n3p_f0020000 } from './map-gov';
// import progressBar from './map-ol-progressbar';

const _workspace = sessionStorage.getItem('workspace');
const appStorage = new AppStorage(_workspace);
const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute('content');

/**
 * kakao 지도
 */
const kakaoContainer = document.getElementById('map-kakao');
const kakaoRvContainer = document.getElementById('map-kakao-roadview'); // 로드뷰를 표시할 div
const kakaoOption = {
  center: new kakao.maps.LatLng(
    appStorage.get('lat') || 35.919317,
    appStorage.get('lng') || 128.2810479
  ),
  level: 3,
  draggable: false,
  disableDoubleClick: true,
  disableDoubleClickZoom: true,
  scrollwheel: false,
  tileAnimation: false
};
const kakaoMap = new kakao.maps.Map(kakaoContainer, kakaoOption);
const kakaoMarkers = [];
const geoCoder = new kakao.maps.services.Geocoder();
const rv = new kakao.maps.Roadview(kakaoRvContainer); // 로드뷰 객체
const rvClient = new kakao.maps.RoadviewClient(); // 좌표로부터 로드뷰 파노 ID 를 가져올 로드뷰 helper 객체
const rvWalker = new KakaoMapWalker(null);
let isRoadView;
kakaoMap.setMinLevel(1);
kakaoMap.setMaxLevel(9);

/**
 * Object 로는 저장할 수 없기에 json 변환해 저장, 불러오기한다.
 * let loc = {lat: center.getLat(), lng: center.getLng()};
 * storage['loc'] = JSON.stringify(loc);
 * const lat = (JSON.parse(storage['loc']))['lat'];
 */
kakao.maps.event.addListener(kakaoMap, 'tilesloaded', function () {
  const center = kakaoMap.getCenter();
  appStorage.set('lat', _round(center.getLat()));
  appStorage.set('lng', _round(center.getLng()));
  appStorage.save();
});

/**
 * OpenLayers 지도
 */
const mapContainer = document.getElementById('map-container');
const webWorker = new WebWorker();
const request = new Map([
  ['baseUrl', window.location.origin],
  ['url', ''],
  ['payload', { table: '', query: '' }],
  ['mediaType', '']
]);
proj4.defs([config.espg.east]);
register(proj4);
const olProjection = new Projection({
  code: 'EPSG:5187',
  extent: [-415909.65, -426336.34, 649203.95, 865410.62]
});
const projectionCode = olProjection.getCode();
const host = ((window.location.origin).toString()).replace(/3000/gi, '8000');
const geoJson = new GeoJSON({
  dataProjection: olProjection,
  featureProjection: olProjection
});
const regExpDot = /[^.]+/;
const olLayers = new Map();
const olGovLayers = new Map();
let isKakaoTerrain;
let olZoom;
let oldX = 0;
let selectDiv;

const featureFilter = new Set([
  'geo_line_as',
  'n3a_a0010000',
  'n3a_b0010000',
  'n3p_f0020000',
  'swl_hmpipe_ls',
  'swl_pipe_as',
  'wtl_cap_ps',
  'wtl_taper_ps',
  'wtl_userlabel_ps',
  'wtl_wspipe_ls'
]);
const valueFilter = new Set([
  'id',
  'geom',
  'geometry',
  '레이어',
  'layer',
  '방향각',
  '회전방향'
]);
const rotationFilter = new Set([
  'wtl_cap_ps',
  'wtl_taper_ps',
  '가정오수받이',
  '갑압변',
  '배기변',
  '상수맨홀',
  '스케일부스터',
  '오수맨홀',
  '오수받이',
  '우수맨홀',
  '우수받이',
  '이토변',
  '제수변',
  '지수전',
  '차집맨홀',
  '토구',
  '펌프시설',
  '하수펌프장',
  '합류맨홀'
]);
const directionFilter = new Set([
  '도수관',
  '송수관',
  '오수관',
  '우수관',
  '차집관',
  '합류관'
]);
const selectFeature = new Feature();
const selectLineStyle = new Style({
  stroke: new Stroke({
    color: '#f00',
    width: 4.5
  })
});
const styleSelectPointCircle = new Style({
  image: new Circle({
    stroke: new Stroke({
      color: '#ff1744',
      width: 4
    })
  })
});
const styleSelectPolygonFill = new Fill({ color: '#eeff4180' });
const styleClosedPipe = new Style({
  stroke: new Stroke({
    color: '#ff0000',
    width: 1.5,
    lineDash: [10, 5]
  })
});

const customOverlay = new CustomOverlay();

const olLayerGroup = new LayerGroup();

const olView = new OlView({
  projection: olProjection,
  center: fromLonLat([_position('lng'), _position('lat')], olProjection),
  zoom: 12.3,
  constrainResolution: false,
  constrainRotation: false,
  rotation: -0.02307
});

const olSelect = new OlSelect({
  hitTolerance: 10,
  filter: function (feature, layer) {
    if (layer === null) return false;
    return !featureFilter.has(layer.getClassName());
  },
  style: function (feature) {
    switch (feature.getGeometry().getType()) {
      case GeometryType.LINE_STRING:
      case GeometryType.MULTI_LINE_STRING:
        _toggleOverlay(null);
        return selectLineStyle;
      case GeometryType.POINT:
      case GeometryType.MULTI_POINT: {
        const selectPointStyle = styleFunction(feature).clone();
        styleSelectPointCircle
          .getImage()
          .setRadius(selectPointStyle.getImage().getScale() * 20);
        selectFeature.setStyle(styleSelectPointCircle);
        selectFeature.setGeometry(feature.getGeometry());
        _toggleOverlay(selectFeature);
        return selectPointStyle;
      }
      case GeometryType.POLYGON:
      case GeometryType.MULTI_POLYGON: {
        _toggleOverlay(null);
        const selectPolygonStyle = styleFunction(feature).clone();
        selectPolygonStyle.setFill(styleSelectPolygonFill);
        return selectPolygonStyle;
      }
    }
  }
});

const olMap = new OlMap({
  target: 'map-openlayers',
  layers: [n3a_a0010000, olLayerGroup],
  view: olView,
  controls: defaultControls({
    zoom: false,
    rotate: false,
    attribution: false
  }),
  interactions: defaultInteractions({
    altShiftDragRotate: false,
    doubleClickZoom: false,
    shiftDragZoom: false,
    pinchRotate: false,
    dragPan: true,
    zoomDelta: 1,
    zoomDuration: 0
  }).extend([
    olSelect,
    new MouseWheelZoom({
      constrainResolution: true,
      maxDelta: 1,
      duration: 0,
      // useAnchor: true 고정, Enable zooming using the mouse's location as the anchor
      useAnchor: true
    })
  ]),
  moveTolerance: 20
});

const olPopover = new OlOverlay({
  element: document.getElementById('popup')
});
olMap.addOverlay(olPopover);

const olStyle = new OlStyle(olMap, config.style);
const [
  arrowStyle,
  lineStyleSet,
  pointStyleSet,
  polygonStyleSet
  // flashStyle
] = olStyle.initialize();
// let olFlash = olStyle.flashSource();

function olToggleLayers(layerArray, { addOnly: add, removeOnly: remove }) {
  if (layerArray === undefined || layerArray.length < 1) {
    return;
  }
  layerArray.forEach(function (table) {
    if (olLayers.has(table) && !add) {
      olLayers.delete(table);
      $(`.kt-menu__nav #${table}`).removeClass('kt-menu__item--active');
    } else if (!remove) {
      let layer = olVectorLayer(table);
      olLayers.set(table, layer);
      $(`.kt-menu__nav #${table}`).addClass('kt-menu__item--active');
    }
  });
  olLayerGroup.setLayers(new Collection(Array.from(olLayers.values())));
}

const styleFunction = function (feature) {
  let layer =
    feature.get('레이어') ||
    feature.get('layer') ||
    feature.getId().match(regExpDot)[0];
  if (layer === undefined) {
    return createDefaultStyle(feature, 0);
  } else {
    layer = layer.trim();
    switch (feature.getGeometry().getType()) {
      case GeometryType.LINE_STRING:
        if (feature.get('폐관일자')) {
          return styleClosedPipe;
        } else {
          const lineStyle = lineStyleSet.get(layer);
          if (layer === '가정급수관' || layer === 'swl_hmpipe_ls') {
            return lineStyle;
          } else {
            lineStyle.getText().setText(feature.get('관라벨'));
          }
          if (!directionFilter.has(layer)) {
            return lineStyle;
          } else {
            let segments = [];
            const _style = arrowStyle.get(layer);
            feature.getGeometry().forEachSegment(function (start, end) {
              _style.setGeometry(new Point(end));
              _style.getImage().setRotation(fromPoints(start, end, false));
              segments.push(_style);
            });
            return [lineStyle, segments.pop()];
          }
        }
      case GeometryType.MULTI_LINE_STRING:
        if (feature.get('폐관일자')) {
          return styleClosedPipe;
        } else {
          const lineStyle = lineStyleSet.get(layer);
          if (layer === '가정급수관' || layer === 'swl_hmpipe_ls')
            return lineStyle;
          else lineStyle.getText().setText(feature.get('관라벨'));
          return lineStyle;
        }
      case GeometryType.POINT:
      case GeometryType.MULTI_POINT: {
        let pointStyle = pointStyleSet.get(layer);
        // noinspection JSNonASCIINames,FallThroughInSwitchStatementJS
        switch (layer) {
          case '가압장':
          case '배수지':
            pointStyle.getText().setText(feature.get(`${layer}명`));
            break;
          case '블럭유량계':
            pointStyle.getText().setText(feature.get('유량계명칭'));
            break;
          case '제수변': {
            const valve1State = feature.get('개폐여부');
            if (valve1State === '개' || valve1State === '미분류') break;
            if (valve1State === '반개')
              pointStyle = pointStyleSet.get('제수변_반개');
            else pointStyle = pointStyleSet.get('제수변_폐');
            break;
          }
          case '경계변': {
            const valve2State = feature.get('개폐여부');
            if (valve2State === '개' || valve2State === '미분류') break;
            if (valve2State === '반개')
              pointStyle = pointStyleSet.get('경계변_반개');
            else pointStyle = pointStyleSet.get('경계변_폐');
            break;
          }
          case '지수전': {
            const valve2State = feature.get('개폐여부');
            if (valve2State === '개' || valve2State === '미분류') break;
            if (valve2State === '반개')
              pointStyle = pointStyleSet.get('지수전_반개');
            else pointStyle = pointStyleSet.get('지수전_폐');
            break;
          }
          case '펌프시설':
          case '하수펌프장':
            pointStyle.getText().setText(feature.get('하수펌프장명'));
            break;
          case 'wtl_userlabel_ps':
            pointStyle.getText().setText(feature.get('주기명'));
            break;
          default:
            break;
        }
        if (rotationFilter.has(layer) && feature.get('방향각') !== undefined) {
          pointStyle.getImage().setRotation(
            fromDegree(
            // CS(=MySql)의 방향각은 왼쪽 회전이 기본이며, ol 은 오른쪽회전이 기본임
              feature.get('방향각').toString(),
              false
            )
          );
        }
        return pointStyle;
      }
      case GeometryType.POLYGON:
      case GeometryType.MULTI_POLYGON: {
        const polygonStyle = polygonStyleSet.get(layer);
        switch (layer) {
          case '가압장':
          case '배수지':
          case '정수장':
          case '하수처리장':
            polygonStyle.getText().setText(feature.get(`${layer}명`));
            break;
          case 'viw_wtl_wtsa_as':
            polygonStyle.getText().setText(feature.get('급수구역명'));
            break;
          case 'viw_wtl_wtssa_as':
            polygonStyle.getText().setText(feature.get('급수분구명'));
            break;
          case 'viw_wtl_wtsba_as':
            polygonStyle.getText().setText(feature.get('급수블럭명'));
            break;
          case 'viw_swl_aodr_as':
            polygonStyle.getText().setText(feature.get('배수구역명'));
            break;
          case 'viw_swl_dodr_as':
            polygonStyle.getText().setText(feature.get('배수분구명'));
            break;
          case 'viw_swl_aodp_as':
            polygonStyle.getText().setText(feature.get('처리구역명'));
            break;
          case 'viw_swl_dodp_as':
            polygonStyle.getText().setText(feature.get('처리분구명'));
            break;
          default:
            break;
        }
        return polygonStyle;
      }
      default: {
        return createDefaultStyle(feature, 0);
      }
    }
  }

  // To convert radians to degrees, divide by (Math.PI / 180). Multiply by this to convert the other way.
  function fromDegree(degree, clockwise = true) {
    return degree * 0.01745 * (clockwise ? 1 : -1);
  }

  // The angle in radians between the positive x-axis and the ray from (0,0) to the point.
  function fromPoints(start, end, clockwise = true) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    return Math.atan2(dy, dx) * (clockwise ? 1 : -1);
  }
};

export function olVectorLayer(layer) {
  return new VectorLayer({
    className: layer,
    maxZoom: config.property[layer].maxZ,
    minZoom: config.property[layer].minZ,
    declutter: false,
    source: sourceFunction(layer),
    style: styleFunction,
    renderBuffer: 50,
    renderOrder: null,
  });
}

function sourceFunction(layer) {
  const vectorSource = new VectorSource({
    format: geoJson,
    overlaps: false,
    loader: function () {
      if (window.Worker) {
        const url = createRequestUrl(layer);
        const mapWorker = new MapWorker();
        mapWorker.postMessage(url);
        mapWorker.onmessage = function (response) {
          (async function () {
            vectorSource.addFeatures(
              vectorSource.getFormat().readFeatures(response.data)
            );
          })()
            .catch(function (error) {})
            .finally(function () {
              mapWorker.terminate();
            });
        };
      }
    }
  });
  return vectorSource;
}

function createRequestUrl(layer) {
  const params = {
    service: 'WFS',
    version: '2.0.0',
    typename: `${_workspace}:${layer}`,
    request: 'GetFeature',
    outputFormat: 'application/json',
    propertyName: `${config.property[layer].propertyName}`
  };
  const encoded = Object.entries(params).map(function([key,value]) {
    return `${key}=${encodeURIComponent(value)}`;
  }).join('&');
  return `${host}/geoserver/${_workspace}/wfs?${encoded}`;
}

function olToggleGovLayers(name, opt_element) {
  let layer;
  switch (name) {
    case 'n3a_a0010000':
      layer = n3a_a0010000;
      break;
    case 'geo_line_as':
      layer = geo_line_as;
      break;
    case 'n3p_f0020000':
      layer = n3p_f0020000;
      if (isKakaoTerrain === true) {
        kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
      } else {
        if (Math.floor(olView.getZoom()) < 11) {
          customOverlay.kakaoHybrid
            .fire({
              confirmButtonText: '확대',
              icon: 'error',
              titleText: '표고점을 보시려면 지도를 확대해주세요'
            })
            .then(function (result) {
              if (result.value) {
                olView.setZoom(11.3);
              }
            });
          return;
        } else {
          kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);
        }
      }
      isKakaoTerrain = !isKakaoTerrain;
      break;
    default:
      return;
  }
  if (olGovLayers.has(name)) {
    olMap.removeLayer(layer);
    olGovLayers.delete(name);
    opt_element.removeClass('kt-menu__item--active');
  } else {
    olMap.addLayer(layer);
    olGovLayers.set(name, layer);
    opt_element.addClass('kt-menu__item--active');
  }
}

const role = sessionStorage.getItem('role');
const baseLayers = config.map.baseLayers[role];
olGovLayers.set('n3a_a0010000', n3a_a0010000);
olToggleLayers(baseLayers, {});

const olOverlay = olStyle.overlays(olMap);

window.addEventListener(
  'resize',
  function (event) {
    kakaoMap.relayout();
  },
  { passive: true }
);

document.getElementById('kt-header__topbar-item-home').addEventListener(
  'click',
  function (event) {
    olView.setCenter(config.map.home[_workspace]);
  },
  { passive: true }
);

olView.on('change:center', function () {
  let lonLat = toLonLat(olView.getCenter(), projectionCode);
  kakaoMap.setCenter(
    new kakao.maps.LatLng(
      (Math.floor(lonLat[1] * 100000) / 100000),
      (Math.floor(lonLat[0] * 100000) / 100000)
    ));
});

olSelect.on('select', function (event) {
  event.preventDefault();
  if (event.selected.length === 0) {
    _toggleOverlay(null);
  } else {
    olShowInfoModal(event.selected[0]);
  }
});

olMap.on('contextmenu', onContextMenu);

function onContextMenu(event) {
  event.preventDefault();
  customOverlay.olAddress.fire({
    icon: 'info',
    titleText: '주소를 클릭하시면 클립보드에 저장됩니다'
  });
  const element = olPopover.getElement();
  const _coordinate = event.coordinate;
  $(element).popover('dispose');
  olPopover.setPosition(_coordinate);
  _callLatLng(_coordinate, function (pos) {
    geoCoder.coord2Address(pos.getLng(), pos.getLat(), function (res, status) {
      if (status === kakao.maps.services.Status.OK) {
        let addr_road = res[0].road_address;
        let addr_lot = res[0].address.address_name;
        let content;
        if (addr_road) {
          content = `<p class="addr">도로명&nbsp;주소: <a href="#" class="addr-clipboard">${addr_road.address_name}</a></p>`;
          content += `<p class="addr">지&nbsp;&nbsp;&nbsp;&nbsp;번&nbsp;주소: <a href="#" class="addr-clipboard">${addr_lot}</a> </p>`;
        } else {
          content = `<p class="addr">지번&nbsp;주소: <a href="#" class="addr-clipboard">${addr_lot}</a> </p>`;
        }
        $(element).popover({
          animation: true,
          placement: 'auto',
          html: true,
          content: `<span>${content}</span>`,
          sanitize: true,
          trigger: 'focus click'
        });
        $(element).popover('show');
      }
    });
  });
}

$(document).on('click', '.addr-clipboard', function () {
  const el = document.createElement('textarea');
  el.value = $(this).text() || '';
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  customOverlay.olAddress.fire({
    icon: 'success',
    titleText: '선택한 주소가 클립보드에 저장되었습니다'
  });
  const element = olPopover.getElement();
  $(element).popover('dispose');
});

olMap.on('moveend', onMoveEnd);

function onMoveEnd() {
  let newZoom = Math.floor(olView.getZoom()); // 12.3 -> 12
  if (newZoom !== olZoom) {
    if (newZoom <= 14) {
      switch (newZoom) {
        case 5:
          _toggleOverlay(undefined);
        case 14:
          if (kakaoContainer.style.display !== 'block') {
            kakaoContainer.style.display = 'block';
          }
        case 13:
        case 12:
        case 11:
        case 10:
        case 9:
        case 8:
        case 7:
        case 6:
          kakaoMap.setLevel(15 - newZoom);
          olView.setZoom(newZoom + 0.3);
          break;
        default: {
          olView.setZoom(5.3);
          newZoom = 5;
          olView.setCenter(config.map.home[_workspace]);
          break;
        }
      }
    } else {
      if (kakaoContainer.style.display !== 'none') {
        kakaoContainer.style.display = 'none';
      }
      if (newZoom > 18) {
        olView.setZoom(18.3);
      }
    }
    olZoom = newZoom;
  }
}

/**
 * 레이어 컨트롤
 */
$('.ol-table-code-gov').on('click', function () {
  _toggleOverlay(undefined);
  const select = $(this);
  olToggleGovLayers(select.attr('id'), select);
});

$('.ol-table-code-wtl').on('click', function () {
  _toggleOverlay(undefined);
  const select = $(this);
  const id = select.attr('id');
  olToggleLayers([id], {});
});

$('.ol-table-code-swl').on('click', function () {
  _toggleOverlay(undefined);
  const select = $(this);
  const id = select.attr('id');
  olToggleLayers([id], {});
});

/**
 * 주소 시설물 검색
 */

$(document).on('click', '.kt-quick-search__item-title-wtl', function () {
  if (Math.floor(olView.getZoom()) < 9) {
    olView.setZoom(9.3);
  }
  olFocusFeature(geoJson.readFeature($(this).next().attr('value')));
  if (selectDiv) {
    let style = selectDiv.prop('style');
    style.removeProperty('color');
    style.removeProperty('font-weight');
  }
  $(this).css({
    color: 'red',
    'font-weight': 'bold'
  });
  selectDiv = $(this);
});

$(document).on('click', '.kt-quick-search__item-title-addr', function () {
  kakaoMarkers.forEach(function (marker) {
    marker.setMap(null);
  });
  if (Math.floor(olView.getZoom()) < 9) {
    olView.setZoom(9.3);
  }
  const object = $(this);
  let newLng = object.next().attr('value');
  let newLat = object.next().next().attr('value');
  let target = KTUtil.get('kt_quick_search_inline');
  KTUtil.find(target, '.kt-quick-search__input').value = object.text();
  let marker = new kakao.maps.Marker({
    position: new kakao.maps.LatLng(newLat, newLng)
  });
  marker.setMap(kakaoMap);
  kakaoMarkers.push(marker);
  let newCenter = fromLonLat([_round(newLng), _round(newLat)], olProjection);
  if (olZoom < 12) {
    olView.setZoom(12.3);
  }
  olView.setCenter(newCenter);
});

function olFocusFeature(feature) {
  olView.adjustCenter([0.00001, 0.00001]);
  let extent = getCenter(feature.getGeometry().getExtent());
  let centerX = Math.round(mapContainer.clientWidth / 2);
  let centerY = Math.round(mapContainer.clientHeight / 2);
  olView.centerOn(extent, olMap.getSize(), [centerX, centerY]);
  // olFlash.clear({ fast: false });
  // olFlash.addFeature(feature);
}

// olFlash.on('addfeature', function (event) {
//   let start = new Date().getTime();
//   let feature = event.feature;
//   let key = olLayers.values().next().value.on('postrender', animate);
//
//   function animate(event) {
//     let vectorContext = getVectorContext(event);
//     let frameState = event.frameState;
//     let flashGeom = feature.getGeometry().clone();
//     let elapsed = frameState.time - start;
//     let elapsedRatio = elapsed / 2000;
//     // radius will be 5 at start and 30 at end.
//     let radius = easeOut(elapsedRatio) * 30 + 10;
//     let opacity = easeOut(1 - elapsedRatio);
//     vectorContext.setStyle(flashStyle(opacity, radius));
//     vectorContext.drawGeometry(flashGeom);
//     if (elapsed > 2000) {
//       unByKey(key);
//       return;
//     }
//     olMap.render();
//   }
// });

/**
 * Ajax
 */

function onAjax(request) {
  return new Promise(function (resolve, reject) {
    request.set('csrf', token);
    webWorker.postMessage(request);
    webWorker.onmessage = function (message) {
      let result = message.data;
      if (!result || result instanceof Error) {
        reject();
      } else {
        if (result.rowCount) {
          resolve(result.rows);
        } else {
          resolve(result);
        }
      }
      resetRequest(request);
    };
  });
}

function resetRequest(map) {
  map.set('csrf', null);
  map.set('url', null);
  map.set('payload', null);
  map.set('mediaType', null);
}

/**
 * 정보창
 */

let _feature, _layer, _layer_sub, _idn, _cnt_idn;
const infoModal = $('#kt_chat_modal');
const detailModal = $('#kt_modal_info');
const rowDiw = document.getElementById('ol-info-rows');

function olShowInfoModal(feature) {
  if (feature === undefined) return;
  _feature = feature;
  _layer =
    _feature.get('레이어') ||
    _feature.get('layer') ||
    _feature.get('시설물구분');
  if (_layer === undefined) return;
  _layer = _layer.trim();
  _layer_sub = _layer === '보수공사' ? _feature.get('시설물구분') : _layer;
  const infoTitle = document.getElementById('ol-info-title');
  const infoUsageBadge = document.getElementById('ol-info-usage-badge');
  const infoUsageText = document.getElementById('ol-info-usage-text');
  infoTitle.innerHTML = `${_layer} 정보`;
  if (feature.get('폐관일자')) {
    infoUsageBadge.classList.replace('kt-badge--success', 'kt-badge--danger');
    infoUsageText.innerHTML = '&nbsp;&nbsp;폐관';
    infoUsageText.style.color = 'red';
  } else {
    infoUsageBadge.classList.replace('kt-badge--danger', 'kt-badge--success');
    infoUsageText.innerHTML = '&nbsp;&nbsp;사용 중';
    infoUsageText.style.color = 'green';
  }
  infoUsageText.style.fontSize = '1rem';

  _idn = _feature.get('관리번호') || _feature.get('ftr_idn');
  _cnt_idn = feature.get('공사번호') || feature.get('cnt_num');
  // TODO: ftr_idn 값을 직접 받아오는 레이어가 있는지 확인
  request.set('url', 'api/wtl/info');
  request.set('payload', {
    table: _feature.get('layer') || _feature.getId().match(/[^.]+/)[0],
    query: _idn
  });
  onAjax(request)
    .then(function (result) {
      let trDiv = '';
      JSON.stringify(result[0], function (key, value) {
        if (valueFilter.has(key)) {
          return undefined;
        } else {
          if (key === '') {
            trDiv = '';
          } else {
            trDiv += `<tr class="tr-striped"><th scope="row">${key}</th><td>${value}</td></tr>`;
          }
          return value;
        }
      });
      rowDiw.innerHTML = trDiv;
    })
    .finally(function () {
      // olFocusFeature(_feature);
      rowDiw.scrollIntoView();
      infoModal.modal('show');
    });
}

infoModal.on('shown.bs.modal', function () {
  rowDiw.scrollIntoView();
});

infoModal.on('hidden.bs.modal', function () {
  _feature = null;
  _layer = null;
  _idn = null;
  _cnt_idn = null;
});

document.getElementById('ol-info-location').addEventListener(
  'click',
  function (event) {
    olFocusFeature(_feature);
  },
  { passive: true }
);

document.getElementById('ol-info-close').addEventListener(
  'click',
  function (event) {
    _toggleOverlay(undefined);
  },
  { passive: true }
);

const imageMap = new Map();

document.getElementById('ol-info-history').addEventListener(
  'click',
  function (event) {
    addSpinner(this);
    olShowDetailModal(this);
  },
  { passive: true }
);

document.getElementById('ol-info-photo').addEventListener(
  'click',
  function (event) {
    addSpinner(this);
    olShowDetailModal(this);
  },
  { passive: true }
);

/**
 * viw_wtt_st_image: 시설물 자체의 "현황" 사진
 * viw_web_wutl_ht_img: 조회시스템의 '보수내역' 기능에 연결된 테이블. viw_swt_subimge_et 를 포함한다.
 * viw_swt_subimge_et: 시설물 자체의 "유지이력" 사진
 * viw_wtt_subimge_et_re: 일반 시설물과는 별도로 추가된 "보수공사" 레이어에서 '사진보기' 기능에 연결된 사진 테이블
 *
 * @param element
 */
function olShowDetailModal(element) {
  let tableName;
  switch (element.id) {
    case 'ol-info-history':
      tableName = 'viw_web_wutl_ht_img';
      break;
    case 'ol-info-photo':
      if (_layer === '보수공사') {
        tableName = 'viw_wtt_subimge_et_re';
      } else if (_layer === '가정연결관' || _layer === '가정오수받이') {
        tableName = 'viw_swt_bs_img_et';
        _layer_sub = '하수받이';
        _idn = _cnt_idn;
      } else {
        tableName = 'viw_wtt_st_image';
      }
      break;
  }
  request.set('url', 'api/wtl/detail');
  request.set('payload', {
    table: { name: tableName, image: '사진' },
    query: { layer: _layer_sub.replace('블럭', ''), id: _idn }
  });
  request.set('mediaType', 'image/jpg');
  onAjax(request)
    .then(function (result) {
      return { result: result, id: element.id };
    })
    .then(_setModal)
    .then(_setCarousel)
    .then(function () {
      detailModal.modal('show', element);
      removeSpinner(false, element);
    })
    .then(_setTable2)
    .catch(function () {
      customOverlay.olInfoNull.fire({
        titleText: '등록된 정보가 없습니다'
      });
      removeSpinner(true, element);
    });
}

function _setModal({ result: result, id: id }) {
  return new Promise(function (resolve, reject) {
    if (result.length === 0) {
      reject();
    } else {
      document.getElementById(
        'ol-modal-title'
      ).innerHTML = _feature.get(`${_layer}명`) ? _feature.get(`${_layer}명`) : _layer;
      const modal = document.getElementById('kt_modal_info').firstElementChild;
      const rows = document.getElementById('kt_modal_info_row').children;
      switch (id) {
        case 'ol-info-photo':
          modal.classList.replace('modal-xl', 'modal-lg');
          rows[0].classList.replace('col-xl-6', 'col-xl-12');
          rows[1].classList.remove('d-flex');
          rows[1].style.setProperty('display', 'none');
          break;
        case 'ol-info-history':
          modal.classList.replace('modal-lg', 'modal-xl');
          rows[0].classList.replace('col-xl-12', 'col-xl-6');
          rows[1].classList.add('d-flex');
          rows[1].style.removeProperty('display');
          _setTable1(result);
          break;
        default:
          reject();
          break;
      }
      resolve(result);
    }

    function _setTable1(result) {
      const tableEl = document.getElementById('ol-modal-info-table');
      const caption = tableEl.querySelector('caption');
      const body = tableEl.querySelector('tbody');
      for (let i = 0, len = result.length; i < len; i++) {
        const data = result[i];
        let desc = data['유지보수내용'];
        if (desc.length > 10) {
          caption.innerHTML = desc;
          desc = `${desc.slice(0, 10)}...`;
        }
        let node = document.createElement('tr');
        node.innerHTML = `<th scope="row">${data['유지보수일련번호']}</th>
<td>${data['유지보수일자'].slice(0, 10)}</td>
<td>${data['유지보수구분']}</td>
<td>${data['유지보수사유']}</td>
<td>${data['시공자명']}</td>
<td>${desc}</td>
<td>${data['사진일련번호']}</td>`;
        body.appendChild(node);
      }
    }
  });
}

function _setCarousel(result) {
  return new Promise(function (resolve, reject) {
    const carousel = document.getElementById('carousel-inner');
    const item = carousel.querySelector('.carousel-item');
    for (let i = 0, len = result.length; i < len; i++) {
      const image = result[i]['사진'];
      const title = `사진${result[i]['사진일련번호']}:&nbsp;${result[i]['사진명칭']}`;
      imageMap.set(i, { title: title, image: image });
      if (i === 0) {
        const imgEl = item.querySelector('img');
        const button = item.querySelector('div > button');
        if (image !== null) {
          imgEl.src = image;
          button.innerHTML = title;
        } else {
          imgEl.src = './assets/media/bg/bg-9.jpg';
          button.innerHTML = '등록된 사진이 없습니다';
        }
        item.classList.add('active');
      } else {
        const node = item.cloneNode(true);
        node.classList.remove('active');
        node.querySelector('img').src = image;
        node.querySelector('div > button').innerHTML = title;
        carousel.appendChild(node);
      }
    }
    resolve(result);
  });
}

function _setTable2() {
  request.set('url', 'api/wtl/cons');
  request.set('payload', {
    query: { number: _feature.get('공사번호') }
  });
  onAjax(request).then(function (res) {
    if (res.length !== 0) {
      document.getElementById(
        'ol-modal-info-cons-name'
      ).innerHTML = `${res[0]['공사명']}<small>시공내역</small>`;
      const contactEl = document.getElementById('ol-modal-info-cons-contact')
        .children;
      for (let i = 0, len = contactEl.length; i < len; i++) {
        contactEl[i].querySelector('a').innerText =
          res[0][`${contactEl[i].querySelector('span').innerText}`];
      }
      document
        .getElementById('ol-modal-info-cons')
        .style.removeProperty('display');
    }
  });
}

function addSpinner(element) {
  element.classList.add('kt-spinner', 'kt-spinner--md', 'kt-spinner--danger');
  const selector = element.querySelector('i');
  if (selector !== null) {
    selector.remove();
  }
  const btnGroup = document.getElementById('ol-info-button-group').children;
  for (let i = 0, len = btnGroup.length; i < len; i++) {
    btnGroup[i].classList.add('disabled');
    const attr = document.createAttribute('disabled');
    btnGroup[i].setAttributeNode(attr);
  }
}

function removeSpinner(enable, element) {
  if (enable === true) {
    const btnGroup = document.getElementById('ol-info-button-group').children;
    for (let i = 0, len = btnGroup.length; i < len; i++) {
      btnGroup[i].classList.remove('disabled');
      const attr = btnGroup[i].getAttributeNode('disabled');
      btnGroup[i].removeAttributeNode(attr);
    }
  }
  if (element) {
    element.classList.remove(
      'kt-spinner',
      'kt-spinner--md',
      'kt-spinner--danger'
    );
    if (element.getElementsByTagName('i').length < 1) {
      const iconClass = [];
      switch (element.id) {
        case 'ol-info-photo':
          iconClass.push('la', 'la-file-photo-o');
          break;
        case 'ol-info-history':
          iconClass.push('la', 'la-file-text-o');
          break;
        default:
          break;
      }
      const icon = document.createElement('i');
      icon.classList.add(...iconClass);
      icon.style.setProperty('padding', '0');
      element.prepend(icon);
    }
  }
}

let degrees = 0;
$(document).on('click', '.carousel-item.active div button', function () {
  const url = document
    .getElementById('carousel-inner')
    .querySelector('.carousel-item.active img')
    .getAttribute('src');
  window.open(url, 'Popup', 'location,resizable');
  // popup.resizeTo(img[0].naturalWidth, img[0].naturalHeight);
});

detailModal.on('hidden.bs.modal', function () {
  degrees = 0;
  imageMap.forEach(function (value) {
    URL.revokeObjectURL(value);
  });
  imageMap.clear();
  const innerEl = document.getElementById('carousel-inner');
  while (innerEl.children.length > 1) {
    innerEl.removeChild(innerEl.lastChild);
  }
  const table = document.getElementById('ol-modal-info-table');
  const tbody = table.querySelector('tbody');
  while (tbody.children.length > 0) {
    tbody.removeChild(tbody.lastChild);
  }
  table.querySelector('caption').innerHTML = '';
  removeSpinner(true);
});

/**
 * 우측 툴바
 */

function checkOlViewZoomLevel({
  confirm: confirm,
  message: message,
  callback: callback,
  fallback: fallback
}) {
  if (Math.floor(olView.getZoom()) > 14) {
    customOverlay.kakaoHybrid
      .fire({
        confirmButtonText: confirm,
        icon: 'error',
        titleText: message,
        onRender: fallback
      })
      .then(function (result) {
        if (result.value) {
          olView.setZoom(14.3);
          callback();
        }
      });
  } else {
    callback();
  }
}

$(document).on('click', '.kt-sticky-toolbar__item', function () {
  const element = $(this);
  const id = element.attr('id');
  const button = element.children('.btn');
  switch (id) {
    case 'ol-zoom-in':
      olView.adjustZoom(1.0);
      break;
    case 'ol-zoom-out':
      olView.adjustZoom(-1.0);
      break;
    case 'kakao-maptype-toggle':
      onKakaoMapTypeToggle(button);
      break;
    case 'kakao-roadview-toggle':
      button.toggleClass('btn-primary btn-outline-primary');
      onKakaoRoadViewToggle();
      break;
    case 'map-kakao-distance':
      checkOlViewZoomLevel({
        confirm: '축소',
        message: '지도를 축소하여 기능을 사용해주세요',
        callback: function () {
          toggleMeasure(true);
        },
        fallback: function () {
          isDistanceOn = false;
          unListenMeasure(true);
          distanceButton.removeClass('btn-success');
        }
      });
      break;
    case 'map-kakao-area':
      checkOlViewZoomLevel({
        confirm: '축소',
        message: '지도를 축소하여 기능을 사용해주세요',
        callback: function () {
          toggleMeasure(false);
        },
        fallback: function () {
          isAreaOn = false;
          unListenMeasure(false);
          areaButton.removeClass('btn-success');
        }
      });
      break;
    default:
      break;
  }
});

/**
 * 기본/위성 지도 전환
 */

function onKakaoMapTypeToggle(button) {
  switch (kakaoMap.getMapTypeId()) {
    case kakao.maps.MapTypeId.ROADMAP: {
      checkOlViewZoomLevel({
        confirm: '실행',
        message: '항공 지도를 보시려면 지도를 축소해주세요',
        callback: function () {
          button.addClass('btn-primary');
          button.removeClass('btn-outline-primary');
          kakaoMap.setMapTypeId(kakao.maps.MapTypeId.HYBRID);
        },
        fallback: function () {
          button.addClass('btn-outline-primary');
          button.removeClass('btn-primary');
        }
      });
      break;
    }
    case kakao.maps.MapTypeId.HYBRID: {
      button.addClass('btn-outline-primary');
      button.removeClass('btn-primary');
      kakaoMap.setMapTypeId(kakao.maps.MapTypeId.ROADMAP);
      break;
    }
  }
}

/**
 * 측정
 */

let isDistanceOn = false,
  isAreaOn = false,
  flagDistance = false,
  flagArea = false,
  moveLine,
  clickLine,
  dots = {},
  drawingPolygon,
  polygon,
  areaOverlay; // 다각형의 면적정보를 표시할 커스텀오버레이 입니다
var distanceOverlay; // 선의 거리정보를 표시할 커스텀오버레이 입니다
let distanceButton = $('#map-kakao-distance').children('button');
let areaButton = $('#map-kakao-area').children('button');

function toggleMeasure(isDistanceClick) {
  const element = olPopover.getElement();
  $(element).popover('dispose');
  infoModal.modal('hide');
  detailModal.modal('hide');

  removeMeasure({ line: isDistanceOn, area: isAreaOn });
  if (isDistanceClick) {
    if (isDistanceOn === false) {
      unListenMeasure(false);
      prepareMeasure(true);
    } else {
      unListenMeasure(true);
    }
    isDistanceOn = !isDistanceOn;
    areaButton.addClass('btn-outline-success');
    areaButton.removeClass('btn-success');
    distanceButton.toggleClass('btn-success btn-outline-success');
  } else {
    if (isAreaOn === false) {
      unListenMeasure(true);
      prepareMeasure(false);
    } else {
      unListenMeasure(false);
    }
    isAreaOn = !isAreaOn;
    distanceButton.addClass('btn-outline-success');
    distanceButton.removeClass('btn-success');
    areaButton.toggleClass('btn-success btn-outline-success');
  }
}

function prepareMeasure(forDistance) {
  olMap.getTargetElement().style.cursor = 'pointer';
  customOverlay.kakaoMeasure.fire({
    titleText: '새로 측정: 마우스 왼쪽'
  });
  olSelect.setActive(false);
  olMap.un('contextmenu', onContextMenu);
  if (forDistance === true) {
    olMap.on('singleclick', onLineStart);
    olMap.on('pointermove', onLineMove);
    olMap.on('contextmenu', onLineEnd);
    isAreaOn = false;
  } else {
    olMap.on('singleclick', onAreaStart);
    olMap.on('pointermove', onAreaMove);
    olMap.on('contextmenu', onAreaEnd);
    isDistanceOn = false;
  }
}

function unListenMeasure(forDistance) {
  olMap.getTargetElement().style.cursor = '';
  customOverlay.kakaoMeasure.close();
  removeMeasure({ line: isDistanceOn, area: isAreaOn });
  if (forDistance) {
    olMap.un('singleclick', onLineStart);
    olMap.un('pointermove', onLineMove);
    olMap.un('contextmenu', onLineEnd);
  } else {
    olMap.un('singleclick', onAreaStart);
    olMap.un('pointermove', onAreaMove);
    olMap.un('contextmenu', onAreaEnd);
  }
  olSelect.setActive(true);
  olMap.on('contextmenu', onContextMenu);
}

function removeMeasure({ line: isLine, area: isArea }) {
  if (isLine === true) {
    deleteLine();
  }
  if (isArea === true) {
    [polygon, drawingPolygon, areaOverlay].forEach(function (element) {
      if (element !== undefined && element !== null) {
        element.setMap(null);
        element = null;
      }
    });
  }
}

function deleteLine() {
  [distanceOverlay, clickLine, moveLine].forEach(function (element) {
    if (element !== undefined && element !== null) {
      element.setMap(null);
      element = null;
    }
  });
  for (let i = 0, len = dots.length; i < len; i++) {
    if (dots[i].circle) {
      dots[i].circle.setMap(null);
    }
    if (dots[i].distance) {
      dots[i].distance.setMap(null);
    }
  }
  dots = [];
}

function onLineStart(event) {
  _callLatLng(event.coordinate, function (clickPosition) {
    if (!flagDistance) {
      flagDistance = true;
      deleteLine();
      clickLine = new kakao.maps.Polyline({
        map: kakaoMap, // 선을 표시할 지도입니다
        path: [clickPosition], // 선을 구성하는 좌표 배열입니다 클릭한 위치를 넣어줍니다
        strokeWeight: 3, // 선의 두께입니다
        strokeColor: '#db4040', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
      });
      moveLine = new kakao.maps.Polyline({
        strokeWeight: 3, // 선의 두께입니다
        strokeColor: '#db4040', // 선의 색깔입니다
        strokeOpacity: 0.5, // 선의 불투명도입니다 0에서 1 사이값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
      });
      displayCircleDot(clickPosition, 0);
    } else {
      let path = clickLine.getPath();
      path.push(clickPosition);
      clickLine.setPath(path);
      let distance = Math.round(clickLine.getLength());
      displayCircleDot(clickPosition, distance);
    }
  });
}

function onLineMove(event) {
  if (flagDistance) {
    _callLatLng(event.coordinate, function (mousePosition) {
      let path = clickLine.getPath();
      let movePath = [path[path.length - 1], mousePosition];
      moveLine.setPath(movePath);
      moveLine.setMap(kakaoMap);
      let distance = Math.round(clickLine.getLength() + moveLine.getLength()); // 선의 총 거리를 계산합니다
      let content = `<div class="dotOverlay distanceInfo">총거리 <span class="number">${distance}</span>m</div>`;
      showDistance(content, mousePosition);
    });
  }
}

function onLineEnd(event) {
  event.preventDefault();
  if (flagDistance) {
    moveLine.setMap(null);
    moveLine = null;
    let path = clickLine.getPath();
    if (path.length > 1) {
      // 마지막 클릭 지점에 대한 거리 정보 커스텀 오버레이를 지웁니다
      if (dots[dots.length - 1].distance) {
        dots[dots.length - 1].distance.setMap(null);
        dots[dots.length - 1].distance = null;
      }
      let distance = Math.round(clickLine.getLength()); // 선의 총 거리를 계산합니다
      let content = `<div class="dotOverlay distanceInfo"><span class="label">총거리</span><span> </span><span class="number">${distance}</span>m</div>`;
      showDistance(content, path[path.length - 1]);
    } else {
      deleteLine();
    }
    flagDistance = false;
  }
}

function showDistance(content, position) {
  customOverlay.kakaoMeasure.update({
    titleText: '새로 측정: 마우스 왼쪽'
  });
  if (distanceOverlay) {
    distanceOverlay.setPosition(position);
    distanceOverlay.setContent(content);
  } else {
    distanceOverlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      content: content,
      position: position,
      xAnchor: 0,
      yAnchor: 0,
      zIndex: 3
    });
  }
}

function displayCircleDot(position, distance) {
  customOverlay.kakaoMeasure.update({
    titleText: '측정 완료: 마우스 오른쪽'
  });
  var circleOverlay = new kakao.maps.CustomOverlay({
    content: '<span class="dot"></span>',
    position: position,
    zIndex: 1
  });
  circleOverlay.setMap(kakaoMap);
  if (distance > 0) {
    // DO NOT CHANGE TO "let"!!!
    var tempOverlay = new kakao.maps.CustomOverlay({
      content: `<div class="dotOverlay">거리 <span class="number">${distance}</span>m</div>`,
      position: position,
      yAnchor: 1,
      zIndex: 2
    });
    tempOverlay.setMap(kakaoMap);
  }
  dots.push({ circle: circleOverlay, distance: tempOverlay });
}

function onAreaStart(event) {
  _callLatLng(event.coordinate, function (clickPosition) {
    if (!flagArea) {
      flagArea = true;
      if (polygon) {
        polygon.setMap(null);
        polygon = null;
      }
      if (areaOverlay) {
        areaOverlay.setMap(null);
        areaOverlay = null;
      }
      drawingPolygon = _kakaoPolygon(clickPosition);
      drawingPolygon.setMap(kakaoMap);
      polygon = _kakaoPolygon(clickPosition);
    } else {
      let drawingPath = drawingPolygon.getPath();
      drawingPath.push(clickPosition);
      drawingPolygon.setPath(drawingPath);
      let path = polygon.getPath();
      path.push(clickPosition);
      polygon.setPath(path);
    }
  });

  function _kakaoPolygon(position) {
    return new kakao.maps.Polygon({
      path: [position],
      strokeWeight: 3,
      strokeColor: '#00a0e9',
      strokeOpacity: 1,
      strokeStyle: 'solid',
      fillColor: '#00a0e9',
      fillOpacity: 0.2
    });
  }
}

function onAreaMove(event) {
  if (flagArea) {
    customOverlay.kakaoMeasure.update({
      titleText: '측정 완료: 마우스 오른쪽'
    });
    _callLatLng(event.coordinate, function (mousePosition) {
      let path = drawingPolygon.getPath();
      if (path.length > 1) {
        path.pop();
      }
      path.push(mousePosition);
      drawingPolygon.setPath(path);
    });
  }
}

function onAreaEnd(event) {
  event.preventDefault();
  if (flagArea) {
    customOverlay.kakaoMeasure.fire({
      titleText: '새로 측정: 마우스 왼쪽'
    });
    drawingPolygon.setMap(null);
    drawingPolygon = null;
    let path = polygon.getPath();
    if (path.length > 2) {
      polygon.setMap(kakaoMap);
      let area = Math.round(polygon.getArea());
      let content = `<div class="info">총면적 <span class="number-area"> ${area}</span> m<sup>2</sup></div>`;
      areaOverlay = new kakao.maps.CustomOverlay({
        map: kakaoMap,
        content: content,
        xAnchor: 0,
        yAnchor: 0,
        position: path[path.length - 1]
      });
    } else {
      polygon = null;
    }
    flagArea = false;
  }
}

/**
 * 구역 선택
 */

let _prop;
const _selMap = new Map();

document.getElementById('kt-notification-section-l-sel').addEventListener(
  'click',
  function (event) {
    onSectionPopulateAll('viw_wtl_wtsa_as');
  },
  { passive: true }
);

document.getElementById('kt-notification-section-m-sel').addEventListener(
  'click',
  function (event) {
    onSectionPopulateAll('viw_wtl_wtssa_as');
  },
  { passive: true }
);

document.getElementById('kt-notification-section-s-sel').addEventListener(
  'click',
  function (event) {
    onSectionPopulateAll('viw_wtl_wtsba_as');
  },
  { passive: true }
);

function onSectionPopulateAll(table) {
  if (_selMap.get(table) !== true) {
    _prop = config.property[table];
    request.set('url', 'api/wtl/wtsAll');
    request.set('payload', { table: table, query: _prop.column });
    onAjax(request).then(function (result) {
      let trDiv = '';
      result.forEach(function (res) {
        JSON.stringify(res, function (key, value) {
          if (key === _prop.column) {
            trDiv += _rowDiv(table, value);
          }
          return value;
        });
      });
      let dom = document.getElementById(_prop.elementId);
      dom.innerHTML = trDiv;
      if (result.length > 20) {
        dom.style.setProperty('height', '600px');
      }
      _selMap.set(table, true);
    });
  }
}

$('.kt-notification').on('click', '.ol-table-code-wtl-section', function (
  event
) {
  onSectionSelect(event)
    .then(changeChild)
    .then(populateChild)
    .then(focusSection)
    .then(changeParent)
    .then(changeZoom);
});

function _rowDiv(name, value) {
  return `<a href="javascript:;" class="kt-notification__item kt-notification__item-compact ol-table-code-wtl-section" id="${name}:${value}">
  <div class="kt-notification__item-details">
    <div class="kt-notification__item-title">${value}</div>
  </div></a>`;
}

function _setDiv(id, innerHtml, isSelected) {
  let dom = document.getElementById(id);
  dom.innerHTML = innerHtml;
  if (isSelected === true) {
    dom.classList.add('kt-header__topbar-user-selected');
  } else {
    dom.classList.remove('kt-header__topbar-user-selected');
  }
  dom = null;
}

function onSectionSelect(event) {
  const array = event.currentTarget.id.split(':'); // viw_wtl_wtsa_as:감포대블럭
  const [table, name] = [array[0], array[1]];
  _prop = config.property[table];
  request.set('url', 'api/wtl/wtsChild');
  request.set('payload', {
    table: { name: table, column: _prop.column },
    query: name
  });
  return new Promise(function (resolve) {
    onAjax(request).then(function (result) {
      JSON.stringify(result[0], function (key, value) {
        let feature = geoJson.readFeature(value['coordinate']);
        olFocusFeature(feature);
        _toggleOverlay(feature);
        resolve({ table: table, name: name });
      });
    });
  });
}

function changeChild({ table: table, name: name }) {
  return new Promise(function (resolve) {
    switch (table) {
      case 'viw_wtl_wtsa_as':
        request.set('url', 'api/wtl/wtsa');
        _setDiv(`${_prop.childTable}_sel`, '중블럭', false);
        _setDiv('viw_wtl_wtsba_as_sel', '소블럭', false);
        _selMap.set('viw_wtl_wtsba_as', false);
        olToggleLayers(['viw_wtl_wtssa_as', 'viw_wtl_wtsba_as'], {
          removeOnly: true
        });
        break;
      case 'viw_wtl_wtssa_as':
        request.set('url', 'api/wtl/wtssa');
        _setDiv(`${_prop.childTable}_sel`, '소블럭', false);
        olToggleLayers(['viw_wtl_wtsa_as', 'viw_wtl_wtsba_as'], {
          removeOnly: true
        });
        break;
      case 'viw_wtl_wtsba_as':
        olToggleLayers(['viw_wtl_wtsa_as', 'viw_wtl_wtssa_as'], {
          removeOnly: true
        });
        break;
      default:
        return;
    }
    olToggleLayers([table], { addOnly: true });
    resolve({ table: table, name: name });
  });
}

function populateChild({ table: table, name: name }) {
  let childElement = document.getElementById(_prop.childElementId);
  request.set('payload', { query: name });
  return new Promise(function (resolve) {
    onAjax(request)
      .then(function (result) {
        if (result.length < 15) {
          childElement.style.removeProperty('height');
        } else {
          childElement.style.setProperty('height', '600px');
        }
        let trDivNew = '';
        result.forEach(function (res) {
          JSON.stringify(res, function (key, value) {
            if (key === _prop.childColumn) {
              trDivNew += _rowDiv(_prop.childTable, value);
            }
            return value;
          });
        });
        childElement.innerHTML = trDivNew;
        _selMap.set(_prop.childTable, true);
        resolve({ table: table, name: name });
      })
      .catch(function () {
        resolve({ table: table, name: name });
      });
  });
}

function focusSection({ table: table, name: name }) {
  return new Promise(function (resolve) {
    _setDiv(`${table}_sel`, name, true);
    resolve({ table: table, name: name });
  });
}

function changeParent({ table: table, name: name }) {
  if (table === 'viw_wtl_wtsa_as') {
    return;
  }
  request.set('apiUrl', 'wtl/wtsParent');
  request.set('payload', {
    table: { name: table, column: _prop.column },
    query: name
  });
  return new Promise(function (resolve) {
    onAjax(request).then(function (result) {
      JSON.stringify(result[0], function (key, value) {
        _setDiv('viw_wtl_wtsa_as_sel', value['급수구역명'], true);
        _setDiv('viw_wtl_wtssa_as_sel', value['급수분구명'], true);
      });
      resolve();
    });
  });
}

function changeZoom() {
  olView.setZoom(_prop.selZ);
  _prop = null;
}

document.getElementById('kt-notification-section-reset').addEventListener(
  'click',
  function (event) {
    [
      { table: 'viw_wtl_wtsa_as', name: '대블럭' },
      { table: 'viw_wtl_wtssa_as', name: '중블럭' },
      { table: 'viw_wtl_wtsba_as', name: '소블럭' }
    ].forEach(function (object) {
      _setDiv(`${object.table}_sel`, object.name, false);
      _selMap.set(object.table, false);
      olToggleLayers([object.table], { removeOnly: true });
    });
    _prop = null;
    _toggleOverlay(null);
  },
  { passive: true }
);

/**
 * 로드뷰
 */

kakao.maps.event.addListener(rv, 'init', function () {
  rvWalker._setMap(kakaoMap);

  kakao.maps.event.addListener(rv, 'viewpoint_changed', function () {
    const viewpoint = rv.getViewpoint();
    rvWalker.setAngle(viewpoint.pan);
  });

  kakao.maps.event.addListener(rv, 'position_changed', function () {
    const rvPosition = rv.getPosition();
    rvWalker._setPosition(rvPosition);
    const newCenter = fromLonLat(
      [_round(rvPosition['La']), _round(rvPosition['Ma'])],
      olProjection
    );
    olView.setCenter(newCenter);
  });
});

function onKakaoRoadViewToggle() {
  if (isRoadView) {
    olMap.getTargetElement().style.cursor = '';
    customOverlay.kakaoRoadView.close();
    adjustView(false).then(function () {
      olMap.un('singleclick', onRoadViewClick);
      rvWalker._setMap(null);
      _callLatLng(olView.getCenter(), function (latLng) {
        kakaoMap.setCenter(latLng);
        kakaoMap.removeOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
      });
    });
  } else {
    olMap.getTargetElement().style.cursor = 'pointer';
    adjustView(true).then(function () {
      olMap.on('singleclick', onRoadViewClick);
      _callLatLng(olView.getCenter(), function (latLng) {
        kakaoMap.setCenter(latLng);
        rvWalker._setMap(kakaoMap);
        rvWalker._setPosition(kakaoMap.getCenter());
        kakaoMap.addOverlayMapTypeId(kakao.maps.MapTypeId.ROADVIEW);
        rvClient.getNearestPanoId(kakaoMap.getCenter(), 10, function (panoId) {
          if (panoId !== null) {
            rv.setPanoId(panoId, kakaoMap.getCenter());
          } else {
            customOverlay.kakaoRoadView
              .fire({
                titleText: '로드뷰 정보가 있는 도로 위를 클릭하세요'
              })
              .then(function (result) {
                if (result.value) {
                  // 확인 클릭
                }
              });
            customOverlay.kakaoRoadView.stopTimer();
          }
        });
      });
    });
  }
}

function adjustView(isActive) {
  return new Promise(function (resolve) {
    if (Math.floor(olView.getZoom()) > 14) {
      olView.setZoom(14.3);
    }
    setTimeout(function () {
      olSelect.setActive(!isActive);
      isRoadView = isActive;
      mapContainer.className = isActive ? 'grid-parent parent' : 'parent';
      window.dispatchEvent(new Event('resize'));
      resolve();
    }, 200);
  });
}

function onRoadViewClick(event) {
  event.preventDefault();
  _callLatLng(event.coordinate, function (rvPosition) {
    rvClient.getNearestPanoId(rvPosition, 10, function (panoId) {
      if (panoId !== null) {
        customOverlay.kakaoRoadView.resumeTimer();
        rv.setPanoId(panoId, rvPosition);
      }
    });
  });
}

$(function () {
  const nav = $('.kt-menu__nav');

  nav.find('.ol-table-code-gov').each(function (index, element) {
    if (olLayers.has($(element).attr('id'))) {
      $(element).addClass('kt-menu__item--active');
    }
  });

  nav.find('.ol-table-code-wtl').each(function (index, element) {
    if (olLayers.has($(element).attr('id'))) {
      $(element).addClass('kt-menu__item--active');
    }
  });

  nav.find('.ol-table-code-swl').each(function (index, element) {
    if (olLayers.has($(element).attr('id'))) {
      $(element).addClass('kt-menu__item--active');
    }
  });

  switch (role) {
    case '상수':
      nav.find('.kt-menu__item--wtl').each(function (index, element) {
        $(element).addClass('kt-menu__item--open');
      });
      break;
    case '하수':
      nav.find('.kt-menu__item--swl').each(function (index, element) {
        $(element).addClass('kt-menu__item--open');
      });
      break;
    default:
      break;
  }

  kakao.maps.event.preventMap();
});

/**
 * Utility functions
 */
function _position(key) {
  const value = appStorage.get(key);
  return value || (key === 'lat' ? 35.919317 : 128.2810479);
}

function _toggleOverlay(feature) {
  if (feature !== olOverlay.selected) {
    if (olOverlay.selected) {
      olOverlay.base.getSource().removeFeature(olOverlay.selected);
    }
    if (feature) {
      olOverlay.base.getSource().addFeature(feature);
    }
    olOverlay.selected = feature;
  }
}

function _callLatLng(coordinate, callback) {
  const lonLat = toLonLat(coordinate, projectionCode);
  callback(new kakao.maps.LatLng(lonLat[1], lonLat[0]));
}

function _round(value, opt_decimals) {
  const number = Math.pow(10, (opt_decimals || 7) - 1);
  return Math.round(value * number) / number;
}
