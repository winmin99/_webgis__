import Collection from 'ol/Collection';
import LayerGroup from 'ol/layer/Group';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
const _workspace = sessionStorage.getItem('workspace');

function createGovTileLayerGroup(opt_options, ...layers) {
  const host = ((window.location.origin).toString()).replace(/3000/gi, '8000');
  const sourceUrl = `${host}/geoserver/${_workspace}/wms`;
  const collection = new Collection([], { unique: true });
  layers.forEach(function (element) {
    const layer = new TileLayer({
      source: new TileWMS({
        url: sourceUrl,
        params: {
          FORMAT: 'image/png',
          LAYERS: `${_workspace}:${element}`,
          VERSION: '1.1.1',
          STYLES: null,
          tiled: false,
        },
        reprojectionErrorThreshold: 50.0,
        hidpi: false,
        wrapX: false,
        transition: 0
      })
    });
    collection.push(layer);
  });
  const layerGroup = new LayerGroup({
    zIndex: 0,
    maxZoom: 19,
    minZoom: opt_options.minZoom
  });
  layerGroup.setLayers(collection);
  return layerGroup;
}

const n3a_a0010000 = createGovTileLayerGroup(
  {
    minZoom: 15
  },
  // 'n3a_a0010000', // 도로
  // 'n3a_b0010000' // 건물
  'lake', // 하천
  'road', // 도로
  'buld_mah', // 건물
);

const geo_line_as = createGovTileLayerGroup(
  {
    minZoom: 15
  },
  'geo_line_as' // 지적선 및 지번
);

const n3p_f0020000 = createGovTileLayerGroup(
  {
    minZoom: 11
  },
  'n3p_f0020000' // 표고점
);

export { n3a_a0010000, geo_line_as, n3p_f0020000 };
