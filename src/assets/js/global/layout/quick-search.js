'use strict';

var KTQuickSearch = function () {
  var target;
  var form;
  var input;
  var closeIcon;
  var resultWrapper;
  var resultDropdown;
  var resultDropdownToggle;
  var inputGroup;
  var query = '';
  var role = '';

  var hasResult = false;
  var timeout = false;
  var isProcessing = false;
  var requestTimeout = 200; // ajax request fire timeout in milliseconds
  var spinnerClass =
    'kt-spinner kt-spinner--input kt-spinner--sm kt-spinner--brand kt-spinner--right';
  var resultClass = 'kt-quick-search--has-result';
  var minLength = 2;
  var ps = new kakao.maps.services.Places();
  var gc = new kakao.maps.services.Geocoder();

  var showProgress = function () {
    isProcessing = true;
    KTUtil.addClass(inputGroup, spinnerClass);

    if (closeIcon) {
      KTUtil.hide(closeIcon);
    }
  };

  var hideProgress = function () {
    isProcessing = false;
    KTUtil.removeClass(inputGroup, spinnerClass);

    if (closeIcon) {
      if (input.value.length < minLength) {
        KTUtil.hide(closeIcon);
      } else {
        KTUtil.show(closeIcon, 'flex');
      }
    }
  };

  var showDropdown = function () {
    if (resultDropdownToggle && !KTUtil.hasClass(resultDropdown, 'show')) {
      $(resultDropdownToggle).dropdown('toggle');
      $(resultDropdownToggle).dropdown('update');
    }
  };

  var hideDropdown = function () {
    if (resultDropdownToggle && KTUtil.hasClass(resultDropdown, 'show')) {
      $(resultDropdownToggle).dropdown('toggle');
    }
  };

  var processSearch = function (name) {
    if (hasResult && query === input.value) {
      hideProgress();
      KTUtil.addClass(target, resultClass);
      showDropdown();
      KTUtil.scrollUpdate(resultWrapper);

      return;
    }

    query = input.value;
    role = sessionStorage.getItem('role');

    KTUtil.removeClass(target, resultClass);
    showProgress();
    hideDropdown();

    setTimeout(function () {
      switch (name) {
        case 'kt_quick_search_offcanvas':
          fetch(`${window.location.origin}/api/wtl/search`, {
            headers: {
              'Content-Type': 'application/json',
              'CSRF-Token': $("meta[name='csrf-token']").attr('content')
            },
            method: 'POST',
            body: JSON.stringify({ query: query, role: role })
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error(response.statusText);
              }
              return response.json();
            })
            .then(function (json) {
              hideProgress();
              if (json.rowCount !== undefined) {
                if (json.rowCount > 0) {
                  prepareElement(function (sectionDiv, resultDiv, fragment) {
                    const rows = json.rows;
                    for (const row of rows) {
                      const el = document.createElement('li');
                      let hjd_nam =
                        row['hjd_nam'] == null ? '' : row['hjd_nam'];
                      let bjd_nam =
                        row['bjd_nam'] == null ? '' : row['bjd_nam'];
                      if (hjd_nam === bjd_nam) bjd_nam = '';
                      let fac_nam =
                        row['fac_nam'] == null || row['fac_nam'] === ''
                          ? '이름 없음'
                          : row['fac_nam'];
                      el.innerHTML = `<div class="kt-quick-search__item-wrapper">
                <a href="#" class="kt-quick-search__item-title kt-quick-search__item-title-wtl">${fac_nam}</a>
                <input type="hidden" name="_coordinate" value='${row['coordinate']}'>
                <div class="kt-quick-search__item-desc">${hjd_nam} ${bjd_nam}</div>
                </div>`;
                      el.className = 'kt-quick-search__item';
                      fragment.append(el);
                    }
                    showResult(sectionDiv, resultDiv, fragment);
                  });
                } else {
                  showResultNone();
                }
              }
            })
            .catch(function (error) {
              hasResult = false;
              hideProgress();
              KTUtil.addClass(target, resultClass);
              KTUtil.setHTML(
                resultWrapper,
                `<span class="kt-quick-search__message">${error}</div>`
              );
            })
            .finally(function () {
              KTUtil.scrollUpdate(resultWrapper);
            });
          break;
        case 'kt_quick_search_inline':
          searchAddress()
            .then(searchKeyword)
            .then(function ({ fragment: fragment }) {
              prepareElement(function (sectionDiv, resultDiv) {
                showResult(sectionDiv, resultDiv, fragment);
              });
            })
            .catch(function (err) {
              showResultNone();
            })
            .finally(function () {
              KTUtil.scrollUpdate(resultWrapper);
            });
          break;
        default:
          break;
      }

      function prepareElement(callback) {
        hasResult = true;
        KTUtil.addClass(target, resultClass);
        while (resultWrapper.hasChildNodes()) {
          resultWrapper.removeChild(resultWrapper.lastChild);
        }
        let resultDiv = document.createElement('div');
        resultDiv.className = 'kt-quick-search__result';
        let sectionDiv = document.createElement('ul');
        sectionDiv.className = 'kt-quick-search__section';
        let fragment = document.createDocumentFragment();
        callback(sectionDiv, resultDiv, fragment);
      }

      function searchAddress() {
        return new Promise(function (resolve, reject) {
          gc.addressSearch(query, function (results, statusAddr) {
            hideProgress();
            const fragment = document.createDocumentFragment();
            if (statusAddr === kakao.maps.services.Status.OK) {
              for (const result of results) {
                let address, address_alt, building;
                if (result['address_type'] === 'REGION_ADDR') {
                  address = result['address_name'];
                  address_alt = '';
                  building = '';
                } else if (result['address_type'] === 'ROAD_ADDR') {
                  address = result['address_name'];
                  address_alt = result['address']['address_name'];
                  building =
                    result['road_address']['building_name'] == null
                      ? ''
                      : `${result['road_address']['building_name']}`;
                } else {
                  continue;
                }
                const el = document.createElement('div');
                el.innerHTML = `<div class="kt-quick-search__item-wrapper">
                <a href="javascript:" class="kt-quick-search__item-title kt-quick-search__item-title-addr" style="color: #00695c;">${address}</a>
                <input type="hidden" name="_coordinateX" value='${result['x']}'>
                <input type="hidden" name="_coordinateY" value='${result['y']}'>
                <div class="kt-quick-search__item-desc">${address_alt} ${building}</div>
                </div><hr>`;
                el.className = 'kt-quick-search__item';
                fragment.append(el);
              }
              resolve({ fragment: fragment, statusAddr: statusAddr });
            } else if (statusAddr === kakao.maps.services.Status.ZERO_RESULT) {
              resolve({ fragment: fragment, statusAddr: statusAddr });
            } else if (statusAddr === kakao.maps.services.Status.ERROR) {
              reject();
            }
          });
        });
      }

      function searchKeyword({ fragment: fragment, statusAddr: statusAddr }) {
        return new Promise(function (resolve, reject) {
          ps.keywordSearch(query, function (places, statusKey, pagination) {
            if (statusKey === kakao.maps.services.Status.OK) {
              for (const place of places) {
                const el = document.createElement('div');
                el.innerHTML = `<div class="kt-quick-search__item-wrapper">
                <a href="javascript:" class="kt-quick-search__item-title kt-quick-search__item-title-addr">${place['place_name']}</a>
                <input type="hidden" name="_coordinateX" value='${place['x']}'>
                <input type="hidden" name="_coordinateY" value='${place['y']}'>
                <div class="kt-quick-search__item-desc">${place['road_address_name']}</div>
                </div>`;
                el.className = 'kt-quick-search__item';
                fragment.append(el);
              }
              resolve({ fragment: fragment });
            } else if (statusKey === kakao.maps.services.Status.ZERO_RESULT) {
              if (statusAddr === kakao.maps.services.Status.OK) {
                resolve({ fragment: fragment });
              } else if (
                statusAddr === kakao.maps.services.Status.ZERO_RESULT
              ) {
                reject();
              }
            }
          });
        });
      }

      function showResult(sectionDiv, resultDiv, fragment) {
        sectionDiv.appendChild(fragment);
        resultDiv.appendChild(sectionDiv);
        resultWrapper.appendChild(resultDiv);
        showDropdown();
      }

      function showResultNone() {
        hasResult = false;
        KTUtil.addClass(target, resultClass);
        KTUtil.setHTML(
          resultWrapper,
          '<span class="kt-quick-search__message">검색 결과가 존재하지 않습니다.</div>'
        );
        showDropdown();
      }
    }, 10);
  };

  var handleCancel = function (e) {
    input.value = '';
    query = '';
    hasResult = false;
    KTUtil.hide(closeIcon);
    KTUtil.removeClass(target, resultClass);
    hideDropdown();
  };

  var handleSearch = function (name) {
    if (input.value.length < minLength) {
      hideProgress();
      hideDropdown();

      return;
    }

    if (isProcessing === true) {
      return;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(function () {
      processSearch(name);
    }, requestTimeout);
  };

  return {
    init: function (element, name) {
      // Init
      target = element;
      form = KTUtil.find(target, '.kt-quick-search__form');
      input = KTUtil.find(target, '.kt-quick-search__input');
      closeIcon = KTUtil.find(target, '.kt-quick-search__close');
      resultWrapper = KTUtil.find(target, '.kt-quick-search__wrapper');
      resultDropdown = KTUtil.find(target, '.dropdown-menu');
      resultDropdownToggle = KTUtil.find(target, '[data-toggle="dropdown"]');
      inputGroup = KTUtil.find(target, '.input-group');

      // Attach input keyup handler
      KTUtil.addEvent(input, 'keyup', function () {
        handleSearch(name);
      });
      KTUtil.addEvent(input, 'submit', function () {
        handleSearch(name);
      });

      // Prevent enter click
      form.onkeypress = function (e) {
        var key = e.charCode || e.keyCode || 0;
        if (key === 13) {
          e.preventDefault();
        }
      };

      KTUtil.addEvent(closeIcon, 'click', handleCancel);
    }
  };
};

var KTQuickSearchInline = KTQuickSearch;
var KTQuickSearchOffcanvas = KTQuickSearch;

// Init on page load completed

KTUtil.ready(function () {
  if (KTUtil.get('kt_quick_search_dropdown')) {
    KTQuickSearch().init(KTUtil.get('kt_quick_search_dropdown'));
  }

  // 카카오지도 지명 검색을 위해 비활성화?
  if (KTUtil.get('kt_quick_search_inline')) {
    KTQuickSearchInline().init(
      KTUtil.get('kt_quick_search_inline'),
      'kt_quick_search_inline'
    );
  }

  if (KTUtil.get('kt_quick_search_offcanvas')) {
    KTQuickSearchOffcanvas().init(
      KTUtil.get('kt_quick_search_offcanvas'),
      'kt_quick_search_offcanvas'
    );
  }
});
