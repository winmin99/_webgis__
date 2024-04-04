export default function CustomOverlay() {
  const showAnimation = {
    popup: 'swal2-show',
    backdrop: 'swal2-backdrop-show',
    icon: 'swal2-icon-show'
  };

  const hideAnimation = {
    popup: 'swal2-hide',
    backdrop: 'swal2-backdrop-hide',
    icon: 'swal2-icon-hide'
  };

  // 카카오지도 미표시시 항공지도 기능 불가 안내, 지형도 선택시 일정 줌레벨 필요 안내
  const kakaoHybrid = swal.mixin({
    toast: true,
    position: 'bottom',
    timer: 5000,
    padding: '1.2rem',
    showConfirmButton: true,
    confirmButtonColor: '#0abb87',
    showCancelButton: true,
    cancelButtonText: '취소',
    showClass: showAnimation,
    hideClass: hideAnimation,
    onOpen: function (toast) {
      toast.addEventListener('mouseenter', swal.stopTimer);
      toast.addEventListener('mouseleave', swal.resumeTimer);
    }
  });

  // 로드뷰 실행시 로드뷰 레이어 선택 필요 안내
  const kakaoRoadView = swal.mixin({
    toast: true,
    icon: 'info',
    timer: 2000,
    position: 'bottom',
    padding: '1.2rem',
    // showConfirmButton: false
    confirmButtonColor: '#0abb87',
    showClass: showAnimation,
    hideClass: hideAnimation,
    onOpen: function () {
      document.getElementById('map-container').style.cursor = 'pointer';
    },
    onDestroy: function () {
      document.getElementById('map-container').style.cursor = '';
    }
  });

  const kakaoMeasure = swal.mixin({
    toast: true,
    icon: 'question',
    position: 'bottom',
    padding: '1rem',
    showConfirmButton: false,
    showClass: showAnimation,
    hideClass: hideAnimation
  });

  // 우클릭 주소 선택시 클립보드 복사 안내
  const olAddress = swal.mixin({
    toast: true,
    timer: 5000,
    position: 'bottom',
    padding: '1.2rem',
    showConfirmButton: false,
    showClass: showAnimation,
    hideClass: hideAnimation
  });

  const olInfoNull = swal.mixin({
    toast: true,
    icon: 'error',
    timer: 5000,
    position: 'bottom',
    padding: '1.2rem',
    showConfirmButton: false,
    showClass: showAnimation,
    hideClass: hideAnimation
  });

  this.kakaoHybrid = kakaoHybrid;
  this.kakaoRoadView = kakaoRoadView;
  this.kakaoMeasure = kakaoMeasure;
  this.olAddress = olAddress;
  this.olInfoNull = olInfoNull;
}
