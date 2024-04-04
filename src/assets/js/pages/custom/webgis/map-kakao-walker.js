export default function KakaoMapWalker(position) {
  //커스텀 오버레이에 사용할 map walker 엘리먼트
  let content = document.createElement('div');
  let figure = document.createElement('div');
  let angleBack = document.createElement('div');

  //map walker를 구성하는 각 노드들의 class명을 지정 - style셋팅을 위해 필요
  content.className = 'MapWalker';
  figure.className = 'figure';
  angleBack.className = 'angleBack';

  content.appendChild(angleBack);
  content.appendChild(figure);

  //커스텀 오버레이 객체를 사용하여, map walker 아이콘을 생성
  const walker = new kakao.maps.CustomOverlay({
    position: position,
    content: content,
    yAnchor: 1
  });

  this.walker = walker;
  this.content = content;
}

//로드뷰의 pan(좌우 각도)값에 따라 map walker의 백그라운드 이미지를 변경 시키는 함수
//background로 사용할 sprite 이미지에 따라 계산 식은 달라 질 수 있음
KakaoMapWalker.prototype.setAngle = function (angle) {
  const threshold = 22.5; //이미지가 변화되어야 되는(각도가 변해야되는) 임계 값
  for (let i = 0; i < 16; i++) {
    //각도에 따라 변화되는 앵글 이미지의 수가 16개
    if (angle > threshold * i && angle < threshold * (i + 1)) {
      //각도(pan)에 따라 아이콘의 class명을 변경
      let className = 'm' + i;
      this.content.className = this.content.className.split(' ')[0];
      this.content.className += ' ' + className;
      break;
    }
  }
};

//map walker의 위치를 변경시키는 함수
KakaoMapWalker.prototype._setPosition = function (position) {
  this.walker.setPosition(position);
};

//map walker를 지도위에 올리는 함수
KakaoMapWalker.prototype._setMap = function (map) {
  this.walker.setMap(map);
};
