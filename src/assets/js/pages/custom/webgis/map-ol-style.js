import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

export default function OlMapStyle(map, style) {
  this.map = map;
  const [
    arrowStyle,
    lineStyle,
    pointStyle,
    polygonStyle,
    flashStyle
  ] = _onCreateStyle(style);
  this._arrow = arrowStyle;
  this._line = lineStyle;
  this._point = pointStyle;
  this._polygon = polygonStyle;
  this._flash = flashStyle;
  this._overlay = _onCreateOverlay(map);
  this._flashSource = _onCreateFlashSource();
}

function _onCreateStyle(group) {
  const arrows = onInitializeStyleMap('line', function (val) {
    return new Style({
      image: new Icon({
        anchor: [1.5, 0.55],
        color: val.stroke.color,
        scale: 0.6,
        src: '/assets/media/symbols/A01.png',
        rotateWithView: true
      })
    });
  });

  const lines = onInitializeStyleMap('line', function (val) {
    return new Style({
      stroke: new Stroke({
        color: val.stroke.color,
        width: val.stroke.width,
        lineDash: val.stroke.dash
      }),
      text: new Text({
        // overflow: true,
        font: 'bold 0.95rem 맑은 고딕',
        placement: 'line',
        fill: new Fill({
          color: '#00f'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: 3
        })
      }),
      zIndex: Infinity
    });
  });

  const points = onInitializeStyleMap('point', function (val) {
    return new Style({
      image: new Icon({
        opacity: val.image.opacity,
        // 현재 svg 사용하면 IE 사용 불가
        src: `/assets/media/symbols/${val.image.src}.png`,
        scale: val.image.scale,
        rotateWithView: false
      }),
      text: new Text({
        overflow: true,
        font: val.text.font,
        placement: 'point',
        fill: new Fill({
          color: val.text.color
        }),
        stroke: new Stroke({
          color: val.text.stroke,
          width: val.text.width
        }),
        offsetY: val.text.offsetY
      }),
      zIndex: Infinity
    });
  });

  const polygons = onInitializeStyleMap('polygon', function (val) {
    return new Style({
      fill: new Fill({
        color: val.fill.color
      }),
      stroke: new Stroke({
        color: val.stroke.color,
        width: val.stroke.width,
        lineDash: val.stroke.dash
      }),
      text: new Text({
        overflow: true,
        font: val.text.font,
        fill: new Fill({
          color: val.text.color
        }),
        stroke: new Stroke({
          color: val.text.stroke,
          width: val.text.width
        })
      }),
      zIndex: Infinity
    });
  });

  // Higher-order function
  function onInitializeStyleMap(name, callback) {
    let map = new Map();
    let key = Object.keys(group[name]);
    let val = key.map(function (value) {
      return group[name][value];
    });
    for (let i = 0, len = key.length; i < len; i++) {
      map.set(key[i], callback(val[i]));
    }
    return map;
  }

  let flash = function (alpha, radius) {
    return new Style({
      // stroke: new Stroke({
      //   color: `rgba(255, 255, 0, ${alpha})`,
      //   width: 7
      // }),
      image: new Circle({
        radius: radius,
        stroke: new Stroke({
          color: `rgba(255, 0, 0, ${alpha})`,
          width: 3 + alpha
        })
      })
    });
  };

  return [arrows, lines, points, polygons, flash];
}

function _onCreateOverlay(map) {
  return {
    base: new VectorLayer({
      source: new VectorSource(),
      map: map,
      style: new Style({
        fill: new Fill({
          color: '#eeff4180'
        })
      })
    }),
    selected: undefined
  };
}

function _onCreateFlashSource() {
  return new VectorSource({
    wrapX: false
  });
}

/**
 * Public prototype functions
 */
OlMapStyle.prototype = {
  initialize() {
    return [this._arrow, this._line, this._point, this._polygon, this._flash];
  },
  overlays(map) {
    return this._overlay;
  },
  flashSource() {
    return this._flashSource;
  }
};
