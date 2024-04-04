'use strict';

if (!sessionStorage.getItem('workspace')) {
  window.location.replace('/auth/signout');
}

import randomize from 'randomatic';

$.fn.modal.Constructor.prototype._enforceFocus = function () {};

const regExpPassword = /^(?=.*[0-9])(?=.*[~!@#$%^&()_+={};,.])[a-zA-Z0-9~!@#$%^&()_+={};,.]{1,20}$/;

var KTUserListDatatable = (function () {
  const host = window.location.origin;

  // variables
  var datatable;

  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');

  // init
  var init = function () {
    // init the datatables. Learn more: https://keenthemes.com/metronic/?page=docs&section=datatable
    datatable = $('#kt_apps_user_list_datatable').KTDatatable({
      // datasource definition
      data: {
        type: 'remote',
        source: {
          read: {
            url: `${host}/api/account`,
            headers: {
              'CSRF-Token': token
            }
          }
        },
        pageSize: 1, // display 20 records per page
        serverPaging: false,
        serverFiltering: true,
        serverSorting: true
      },

      // layout definition
      layout: {
        scroll: true, // enable/disable datatable scroll both horizontal and vertical when needed.
        footer: false // display/hide footer
      },

      // column sorting
      sortable: false, // TODO: 정렬 안됨

      pagination: true,

      // search: {
      //   input: $('#generalSearch'),
      //   delay: 400
      // },

      // columns definition
      columns: [
        {
          field: 'RecordID',
          title: '#',
          sortable: false,
          width: 20,
          selector: {
            class: 'kt-checkbox--solid'
          },
          textAlign: 'center'
        },
        {
          field: 'RoleName',
          width: 'auto',
          title: '구분',
          autoHide: false,
          textAlign: 'center',
          template: function (row) {
            // noinspection NonAsciiCharacters
            var status = {
              상수: { title: '상수도', state: 'primary' },
              하수: { title: '하수도', state: 'success' },
              기타: { title: '기타', state: 'danger' }
            };
            return `<span
    class="kt-font-bold kt-font-${status[row['RoleName']].state}">${
              status[row['RoleName']].title
            }</span>`;
          }
        },
        {
          field: 'Name',
          title: '성명',
          width: 'auto'
          // width: 100,
        },
        {
          field: 'LoginName',
          title: '계정',
          width: 'auto'
        },
        {
          field: 'Email',
          title: '이메일',
          overflow: 'visible',
          width: 'auto'
        },
        {
          field: 'Status',
          title: '상태',
          textAlign: 'center',
          width: 'auto',
          template: function (row) {
            // noinspection NonAsciiCharacters
            var status = {
              정상: {
                title: '사용 중',
                class: ' kt-badge kt-badge--success kt-badge--inline'
              },
              대기: {
                title: '승인 대기 중',
                class: ' kt-badge kt-badge--warning kt-badge--inline'
              },
              리셋: {
                title: '초기화 대기 중',
                class: ' kt-badge kt-badge--brand kt-badge--inline'
              },
              중지: {
                title: '사용 중지',
                class: ' kt-badge kt-badge--danger kt-badge--inline'
              }
            };
            return `<span class="btn btn-sm btn-pill btn-font-md ${
              status[row['Status']].class
            }">${status[row['Status']].title}</span>`;
          }
        }
      ]
    });
  };

  // search
  var search = function () {
    $('#kt_form_status').on('change', function () {
      datatable.search($(this).val().toLowerCase(), 'Status');
    });
  };

  // selection
  var selection = function () {
    // init form controls
    //$('#kt_form_status, #kt_form_type').selectpicker();

    // event handler on check and uncheck on records
    datatable.on(
      'kt-datatable--on-check kt-datatable--on-uncheck kt-datatable--on-layout-updated',
      function (e) {
        var checkedNodes = datatable.rows('.kt-datatable__row--active').nodes(); // get selected records
        var count = checkedNodes.length; // selected records count

        $('#kt_subheader_group_selected_rows').html(count);

        if (count > 0) {
          // $('#kt_subheader_search').addClass('kt-hidden');
          // $('#kt_subheader_group_actions').removeClass('kt-hidden');
          $('#kt_subheader_group_actions')
            .find('button')
            .removeClass('disabled');
        } else {
          // $('#kt_subheader_search').removeClass('kt-hidden');
          // $('#kt_subheader_group_actions').addClass('kt-hidden');
          $('#kt_subheader_group_actions').find('button').addClass('disabled');
        }
      }
    );
  };

  // selected records status update
  var selectedStatusActivate = function () {
    $('#kt_subheader_group_actions_activate').on('click', function () {
      // fetch selected IDs
      const ids = findSelectedIds();

      if (ids.length > 0) {
        swal
          .fire({
            icon: 'question',
            title: '계정의 사용을 승인하시겠습니까?',
            confirmButtonText: '예, 승인합니다',
            showCancelButton: true,
            cancelButtonText: '취소',
            customClass: {
              confirmButton: 'btn btn-sm btn-bold btn-success',
              cancelButton: 'btn btn-sm btn-bold btn-secondary'
            }
          })
          .then(function (result) {
            if (result.value) {
              onAjax(
                `${host}/auth/update`,
                {
                  ids: ids,
                  newValue: undefined,
                  isActive: true,
                  isReset: false
                },
                function () {
                  swal.fire({
                    text: '계정의 사용이 승인되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#0abb87'
                  });
                }
              );
            }
          });
      }
    });
  };

  var selectedStatusUpdate = function () {
    var status = {
      상수도: { title: '상수도과', id: 1 },
      하수도: { title: '하수도과', id: 2 },
      기타: { title: '기타', statusId: 0 }
    };

    $(
      '#kt_subheader_group_actions_status_change_1, #kt_subheader_group_actions_status_change_2'
    ).on('click', function () {
      var select = $(this).find('span').html();

      // fetch selected IDs
      const ids = findSelectedIds();

      if (ids.length > 0) {
        swal
          .fire({
            icon: 'question',
            title: `계정을 ${status[select].title}로 이동하시겠습니까?`,
            confirmButtonText: '예, 이동합니다',
            showCancelButton: true,
            cancelButtonText: '취소',
            customClass: {
              confirmButton: 'btn btn-sm btn-bold btn-brand',
              cancelButton: 'btn btn-sm btn-bold btn-secondary'
            }
          })
          .then(function (result) {
            if (result.value) {
              onAjax(
                `${host}/auth/update`,
                {
                  ids: ids,
                  newValue: status[select].id,
                  isActive: undefined,
                  isReset: undefined
                },
                function () {
                  swal.fire({
                    text: `계정이 이동되었습니다.`,
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#0abb87'
                  });
                }
              );
            }
          });
      }
    });
  };

  // selected records delete
  var selectedStatusReset = function () {
    $('#kt_subheader_group_actions_reset').on('click', function () {
      // fetch selected IDs
      const ids = findSelectedIds();

      if (ids.length === 1) {
        swal
          .fire({
            icon: 'question',
            title: '비밀번호를 초기화하시겠습니까?',
            confirmButtonText: '예, 초기화합니다',
            showCancelButton: true,
            cancelButtonText: '취소',
            customClass: {
              confirmButton: 'btn btn-sm btn-bold btn-brand',
              cancelButton: 'btn btn-sm btn-bold btn-secondary'
            },
            allowOutsideClick: false
          })
          .then(function (result) {
            if (result.value) {
              // 비번 생성
              let newValue = generateKey();
              while (!newValue.match(regExpPassword)) {
                newValue = generateKey();
              }
              onAjax(
                `${host}/auth/reset`,
                {
                  ids: ids,
                  newValue: newValue,
                  isActive: undefined,
                  isReset: undefined
                },
                function () {
                  swal.fire({
                    title: '계정의 비밀번호가 초기화되었습니다.',
                    text: `초기 비밀번호: ${newValue}`,
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#0abb87',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false
                  });
                }
              );
            }
          });
      } else if (ids.length > 1) {
        swal.fire({
          padding: '0',
          icon: 'info',
          text: '한 번에 하나의 계정만 초기화하실 수 있습니다.',
          confirmButtonText: '확인',
          confirmButtonColor: '#0abb87'
        });
      }
    });
  };

  function generateKey() {
    return randomize('Aa0!', 9, { exclude: '0oOiIlL1_-' });
  }

  // selected records delete
  var selectedStatusDeactivate = function () {
    $('#kt_subheader_group_actions_deactivate').on('click', function () {
      // fetch selected IDs
      const ids = findSelectedIds();

      if (ids.length > 0) {
        swal
          .fire({
            icon: 'question',
            title: '계정의 사용을 중지하시겠습니까?',
            text: '사용 중지한 계정은 이후 재사용이 가능합니다.',
            confirmButtonText: '예, 중지합니다',
            showCancelButton: true,
            cancelButtonText: '취소',
            customClass: {
              confirmButton: 'btn btn-sm btn-bold btn-warning',
              cancelButton: 'btn btn-sm btn-bold btn-secondary'
            }
          })
          .then(function (result) {
            if (result.value) {
              onAjax(
                `${host}/auth/update`,
                {
                  ids: ids,
                  newValue: '',
                  isActive: false,
                  isReset: false
                },
                function () {
                  swal.fire({
                    text: `계정의 사용이 중지되었습니다.`,
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#0abb87'
                  });
                }
              );
            }
          });
      }
    });
  };

  var selectedDelete = function () {
    $('#kt_subheader_group_actions_delete').on('click', function () {
      // fetch selected IDs
      const ids = findSelectedIds();

      if (ids.length === 1) {
        swal
          .fire({
            icon: 'warning',
            title: '계정을 삭제하시겠습니까?',
            text: '삭제한 계정은 복구할 수 없습니다.',
            confirmButtonText: '예, 삭제합니다',
            showCancelButton: true,
            cancelButtonText: '취소',
            customClass: {
              confirmButton: 'btn btn-sm btn-bold btn-danger',
              cancelButton: 'btn btn-sm btn-bold btn-secondary'
            },
            allowOutsideClick: false
          })
          .then(function (result) {
            if (result.value) {
              onAjax(
                `${host}/auth/delete`,
                {
                  ids: ids,
                  newValue: undefined,
                  isActive: undefined,
                  isReset: undefined
                },
                function () {
                  swal.fire({
                    text: '계정이 삭제되었습니다.',
                    icon: 'success',
                    confirmButtonText: '확인',
                    confirmButtonColor: '#0abb87'
                  });
                }
              );
            }
          });
      } else if (ids.length > 1) {
        swal.fire({
          padding: '0',
          icon: 'info',
          text: '한 번에 하나의 계정만 삭제하실 수 있습니다.',
          confirmButtonText: '확인',
          confirmButtonColor: '#0abb87'
        });
      }
    });
  };

  var updateTotal = function () {
    datatable.on('kt-datatable--on-layout-updated', function () {
      //$('#kt_subheader_total').html(datatable.getTotalRows() + ' Total');
    });
  };

  function findSelectedIds() {
    return datatable
      .rows('.kt-datatable__row--active')
      .nodes()
      .find('.kt-checkbox--single > [type="checkbox"]')
      .map(function (i, chk) {
        return $(chk).val();
      });
  }

  function onAjax(url, { ids, newValue, isActive, isReset }, callback) {
    const array = [];
    for (var i = 0, len = ids.length; i < len; i++) {
      array.push({
        id: ids[i],
        newValue: newValue,
        active: isActive,
        reset: isReset
      });
    }

    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token
      },
      method: 'POST',
      body: JSON.stringify(array)
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(function (result) {
        callback();
      })
      .catch(function (err) {
        swal.fire({
          icon: 'error',
          title: 'Error',
          html: `<small>${err}</small>`,
          confirmButtonText: '확인'
        });
      })
      .finally(function () {
        datatable.reload();
      });
  }

  return {
    // public functions
    init: function () {
      init();
      // search();
      selection();
      selectedStatusActivate();
      selectedStatusUpdate();
      selectedStatusReset();
      selectedStatusDeactivate();
      selectedDelete();
      updateTotal();
    }
  };
})();

const accountModal = $('#kt_modal_account');

$('#kt-notification__item-details-account').on('click', function (event) {
  accountModal.modal('show');
});

accountModal.on('shown.bs.modal', function () {
  KTUserListDatatable.init();
});
