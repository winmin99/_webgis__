'use strict';

// Class Definition
var KTLoginGeneral = (function () {
  const host = window.location.origin;

  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');

  const feedbackRequired = '필수 입력 항목입니다.';

  var login = $('#kt_login');

  var showErrorMsg = function (form, type = 'danger', msg) {
    var alert = $(
      `<div class="alert alert-${type} alert-dismissible" role="alert"><div class="alert-text">${msg}</div><div class="alert-close"><i class="flaticon2-cross kt-icon-sm" data-dismiss="alert"></i></div></div>`
    );

    form.find('.alert').remove();
    alert.prependTo(form);
    //alert.animateClass('fadeIn animated');
    KTUtil.animateClass(alert[0], 'fadeIn animated');
    alert.find('span').html(msg);
  };

  // Private Functions
  var displaySignUpForm = function () {
    login.removeClass('kt-login--forgot');
    login.removeClass('kt-login--signin');
    login.removeClass('kt-login--reset');

    login.addClass('kt-login--signup');
    KTUtil.animateClass(login.find('.kt-login__signup')[0], 'flipInX animated');
  };

  var displaySignInForm = function () {
    login.removeClass('kt-login--forgot');
    login.removeClass('kt-login--signup');
    login.removeClass('kt-login--reset');

    login.addClass('kt-login--signin');
    KTUtil.animateClass(login.find('.kt-login__signin')[0], 'flipInX animated');
    //login.find('.kt-login__signin').animateClass('flipInX animated');

    resetForm(login.find('.kt-login__signup form'));
    resetForm(login.find('.kt-login__forgot form'));
    resetForm(login.find('.kt-login__reset form'));

    $('.alert').remove();
  };

  var displayResetForm = function () {
    login.removeClass('kt-login--signin');
    login.removeClass('kt-login--signup');
    login.removeClass('kt-login--forgot');

    login.addClass('kt-login--reset');
    //login.find('.kt-login--forgot').animateClass('flipInX animated');
    KTUtil.animateClass(login.find('.kt-login__reset')[0], 'flipInX animated');
  };

  var displayForgotForm = function () {
    login.removeClass('kt-login--signin');
    login.removeClass('kt-login--signup');
    login.removeClass('kt-login--reset');

    login.addClass('kt-login--forgot');
    //login.find('.kt-login--forgot').animateClass('flipInX animated');
    KTUtil.animateClass(login.find('.kt-login__forgot')[0], 'flipInX animated');
  };

  var addExtraValidationMethod = function () {
    $.validator.addMethod('validatePassword', function (value, element) {
      const regExpPassword = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{9,20}$/;
      return !!value.match(regExpPassword);
    });

    $.validator.addMethod('validateId', function (value, element) {
      var regExpId = /^[0-9a-zA-Z]+$/;
      return !!value.match(regExpId);
    });
  };

  var handleFormSwitch = function () {
    $('#kt_login_signup').click(function (e) {
      e.preventDefault();
      displaySignUpForm();
    });

    $('#kt_login_signup_cancel').click(function (e) {
      e.preventDefault();
      displaySignInForm();
    });

    $('#kt_login_forgot').click(function (e) {
      e.preventDefault();
      displayForgotForm();
    });

    $('#kt_login_forgot_cancel').click(function (e) {
      e.preventDefault();
      displaySignInForm();
    });

    $('#kt_login_reset').click(function (e) {
      e.preventDefault();
      displayResetForm();
    });

    $('#kt_login_reset_cancel').click(function (e) {
      e.preventDefault();
      displaySignInForm();
    });
  };

  var handleSignInFormSubmit = function () {
    $('#kt_login_signin_submit').click(function (e) {
      e.preventDefault();

      var btn = $(this);
      var form = $('#kt-form-signin');

      form.validate({
        rules: {
          LoginName: {
            required: true
          },
          LoginKey: {
            required: true
          }
        },
        messages: {
          UserLastName: feedbackRequired,
          UserFirstName: feedbackRequired,
          LoginNameNew: {
            required: feedbackRequired,
            validateId: '올바른 아이디 형식이 아닙니다.',
            minlength: '4자 이상을 입력하세요.',
            maxlength: '20자 미만을 입력하세요.'
          },
          LoginKeyNew: {
            required: feedbackRequired,
            validatePassword: '올바른 비밀번호 형식이 아닙니다.'
          },
          rLoginKeyNew: {
            required: feedbackRequired,
            equalTo: '비밀번호가 일치하지 않습니다.'
          },
          EmailNew: {
            required: feedbackRequired,
            email: '올바른 이메일 형식이 아닙니다.'
          }
        }
      });

      if (!form.valid()) {
        return;
      }

      btn
        .addClass(
          'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
        )
        .attr('disabled', true);

      form.ajaxSubmit(
        {
          url: `${host}/auth/signin`,
          method: 'POST',
          headers: {
            'CSRF-Token': token
          },
          error: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false);
              showErrorMsg(
                form,
                response.responseJSON.status,
                response.responseJSON.message
              );
            }, 500);
          },
          success: function (response, status, xhr, $form) {
            setRemember();

            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false);
              resetForm(form);

              if (status === 'success') {
                sessionStorage.setItem('role', response['role']);
                sessionStorage.setItem('workspace', response['workspace']);
                window.location.replace('/');
              }
            }, 500);
          }
        },
        null,
        'json',
        null
      );
    });
  };

  var handleSignInFormRemember = function () {
    var userId = getCookie('cookieUserId');
    $("input[id='form-username']").val(userId);

    if ($("input[id='form-username']").val() != '') {
      // Cookie에 만료되지 않은 아이디가 있어 입력됬으면 체크박스가 체크되도록 표시
      $("input[name='remember']").attr('checked', true);
    }
  };

  function setRemember() {
    // Login Form을 Submit할 경우,
    if ($("input[name='remember']").is(':checked')) {
      // ID 기억하기 체크시 쿠키에 저장
      var userId = $("input[id='form-username']").val();
      setCookie('cookieUserId', userId, 30); // 7일동안 쿠키 보관
    } else {
      deleteCookie('cookieUserId');
    }
  }

  function setCookie(cookieName, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var cookieValue =
      escape(value) +
      (exdays == null ? '' : '; expires=' + exdate.toGMTString());
    document.cookie = cookieName + '=' + cookieValue;
  }

  function deleteCookie(cookieName) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() - 1);
    document.cookie =
      cookieName + '= ' + '; expires=' + expireDate.toGMTString();
  }

  function getCookie(cookieName) {
    cookieName = cookieName + '=';
    var cookieData = document.cookie;
    var start = cookieData.indexOf(cookieName);
    var cookieValue = '';
    if (start !== -1) {
      start += cookieName.length;
      var end = cookieData.indexOf(';', start);
      if (end === -1) end = cookieData.length;
      cookieValue = cookieData.substring(start, end);
    }
    return unescape(cookieValue);
  }

  var handleSignUpFormSubmit = function () {
    $('#kt_login_signup_submit').click(function (e) {
      e.preventDefault();

      var btn = $(this);
      var form = $('#kt-form-signup');

      form.validate({
        rules: {
          UserLastName: {
            required: true
          },
          UserFirstName: {
            required: true
          },
          LoginNameNew: {
            required: true,
            minlength: 4,
            maxlength: 20,
            validateId: { validateId: true }
          },
          LoginKeyNew: {
            required: true,
            validatePassword: { validatePassword: true }
          },
          rLoginKeyNew: {
            required: true,
            equalTo: '#kt-login__signup-loginkey'
          },
          EmailNew: {
            required: true,
            email: true
          },
          CompanyName: {
            required: true
          },
          RoleName: {
            required: true
          }
        },
        messages: {
          UserLastName: feedbackRequired,
          UserFirstName: feedbackRequired,
          LoginNameNew: {
            required: feedbackRequired,
            validateId: '올바른 아이디 형식이 아닙니다.',
            minlength: '4자 이상을 입력하세요.',
            maxlength: '20자 미만을 입력하세요.'
          },
          LoginKeyNew: {
            required: feedbackRequired,
            validatePassword: '올바른 비밀번호 형식이 아닙니다.'
          },
          rLoginKeyNew: {
            required: feedbackRequired,
            equalTo: '비밀번호가 일치하지 않습니다.'
          },
          EmailNew: {
            required: feedbackRequired,
            email: '올바른 이메일 형식이 아닙니다.'
          }
        }
      });

      if (!form.valid()) {
        showErrorMsg(form, 'danger', '입력값을 확인하여 주십시오.');
        return;
      }

      btn
        .addClass(
          'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
        )
        .attr('disabled', true);

      form.ajaxSubmit(
        {
          url: `${host}/auth/signup`,
          method: 'POST',
          headers: {
            'CSRF-Token': token
          },
          error: function (response, status, xhr, $form) {
            btn
              .removeClass(
                'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
              )
              .attr('disabled', false);

            showErrorMsg(form, 'danger', response.responseJSON.message);
          },
          success: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false);
              resetForm(form);

              if (status === 'success') {
                // display signup form
                displaySignInForm();

                var signInForm = login.find('.kt-login__signin form');
                resetForm(signInForm);

                showErrorMsg(signInForm, 'success', response.message);
              }
            }, 500);
          }
        },
        null,
        'json',
        null
      );
    });
  };

  var handleSignUpFormCheckDuplicate = function () {
    $('#kt_login_signup_check_duplicate').click(function (e) {
      e.preventDefault();

      const checkName = $("input[id='kt-login__signup-loginname']").val();

      if (
        checkName.length > 3 &&
        checkName.length < 21 &&
        checkName.match(/^[0-9a-zA-Z]+$/)
      ) {
        fetch(`${host}/auth/duplicate`, {
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': token
          },
          method: 'POST',
          body: JSON.stringify({ LoginName: checkName })
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error(response.statusText);
            }
            return response.json();
          })
          .then(function (result) {
            if (result.rowCount === 0) {
              swal.fire({
                icon: 'success',
                html: `<span style="font-weight: bold;text-decoration: underline">${checkName}</span> 는 사용 가능한 아이디입니다.`,
                confirmButtonText: '확인'
              });
            } else {
              swal.fire({
                icon: 'error',
                text: '사용할 수 없는 아이디입니다.',
                confirmButtonText: '확인'
              });
            }
          })
          .catch(function (err) {
            swal.fire({
              icon: 'error',
              title: 'Error',
              html: `<small>${err}</small>`,
              confirmButtonText: '확인'
            });
          });
      }
    });
  };

  var handleResetFormSubmit = function () {
    $('#kt_login_reset_submit').click(function (e) {
      e.preventDefault();

      var btn = $(this);
      var form = $('#kt-form-reset');

      form.validate({
        rules: {
          OldLoginName: {
            required: true
          },
          OldLoginKey: {
            required: true
          },
          NewLoginKey: {
            required: true,
            validatePassword: { validatePassword: true }
          },
          rNewLoginKey: {
            required: true,
            equalTo: '#kt-login__signup-loginkey-new'
          }
        },
        messages: {
          OldLoginName: {
            required: feedbackRequired
          },
          OldLoginKey: {
            required: feedbackRequired
          },
          NewLoginKey: {
            required: feedbackRequired,
            validatePassword: '올바른 비밀번호 형식이 아닙니다.'
          },
          rNewLoginKey: {
            required: feedbackRequired,
            equalTo: '비밀번호가 일치하지 않습니다.'
          }
        }
      });

      if (!form.valid()) {
        showErrorMsg(form, 'danger', '입력값을 확인하여 주십시오.');
        return;
      }

      btn
        .addClass(
          'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
        )
        .attr('disabled', true);

      form.ajaxSubmit(
        {
          url: `${host}/auth/resetKey`,
          method: 'POST',
          headers: {
            'CSRF-Token': token
          },
          error: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false);
              showErrorMsg(
                form,
                response.responseJSON.status,
                response.responseJSON.message // 초기화 에러
              );
            }, 500);
          },
          success: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false); // remove
              resetForm(form);

              // display signup form
              displaySignInForm();
              var signInForm = login.find('.kt-login__signin form');
              resetForm(signInForm);

              showErrorMsg(signInForm, 'success', '비밀번호가 변경되었습니다.');
            }, 500);
          }
        },
        null,
        'json',
        null
      );
    });
  };

  var handleForgotFormSubmit = function () {
    $('#kt_login_forgot_submit').click(function (e) {
      e.preventDefault();

      var btn = $(this);
      var form = $('#kt-form-forgot');

      form.validate({
        rules: {
          LoginName: {
            required: true
          },
          Email: {
            required: true,
            email: true
          }
        }
      });

      if (!form.valid()) {
        showErrorMsg(form, 'danger', '입력값을 확인하여 주십시오.');
        return;
      }

      btn
        .addClass(
          'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
        )
        .attr('disabled', true);

      form.ajaxSubmit(
        {
          url: `${host}/auth/forgot`,
          method: 'POST',
          headers: {
            'CSRF-Token': token
          },
          error: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false);
              showErrorMsg(
                form,
                response.responseJSON.status,
                response.responseJSON.message // 초기화 에러
              );
            }, 500);
          },
          success: function (response, status, xhr, $form) {
            setTimeout(function () {
              btn
                .removeClass(
                  'kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light'
                )
                .attr('disabled', false); // remove
              resetForm(form);

              // display signup form
              displaySignInForm();
              var signInForm = login.find('.kt-login__signin form');
              resetForm(signInForm);

              showErrorMsg(
                signInForm,
                'success',
                '관리자가 초기화한 비밀번호로 재로그인 해주세요.'
              );
            }, 500);
          }
        },
        null,
        'json',
        null
      );
    });
  };

  function resetForm(formElement) {
    formElement.clearForm();
    if (formElement.validate()) {
      formElement.validate().resetForm();
    }
  }

  // Public Functions
  return {
    // public functions
    init: function () {
      addExtraValidationMethod();
      handleFormSwitch();
      handleSignInFormRemember();
      handleSignInFormSubmit();
      handleSignUpFormSubmit();
      handleSignUpFormCheckDuplicate();
      handleResetFormSubmit();
      handleForgotFormSubmit();
    }
  };
})();

// Class Initialization
jQuery(document).ready(function () {
  KTLoginGeneral.init();
});
