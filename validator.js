const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const btnSignUp = $('.sign-up .sign-up__btn')
const btnLogin = $('.login .login__btn')
const loginForm = $('#form-login')
const signUpForm = $('#form-sign-up')

// Animation form
btnSignUp.onclick = function() {
    loginForm.style.display = 'none'
    signUpForm.style.display = 'block'
    if (loginForm.style.animation && loginForm.style.transition) {} else {
        loginForm.style.transition = '1.2s'
        loginForm.style.animation = 'slideLogIn ease 1.2s'
    }
}
btnLogin.onclick = function() {
    signUpForm.style.display = 'none'
    loginForm.style.display = 'block'
}

// Đối tượng `Validator`
function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    // Biến lưu các rules
    var selectorRules = {}

    // Hàm thực hiện kiểm tra input
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage

        // Lấy ra rule của input
        var rules = selectorRules[rule.selector]

        // Lặp qua từng rule của input và kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for (var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break
        }

        if (errorMessage) {
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        } else {
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }

        // Convert 'errorMesssage' to boolean
        return !errorMessage
    }

    // Lấy element của form
    var formElement = $(options.form)
    if (formElement) {
        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault()

            var isFormValid = true

            // Lặp qua từng rule và validate
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                // Lấy boolean errorMessage từ validate
                var isValid = validate(inputElement, rule)
                if (!isValid) isFormValid = false
            })

            if (isFormValid) {
                // Trường hợp submit với javascript
                if (typeof options.onSubmit === 'function') {
                    // Lấy inputElement dưới dạng NodeList
                    var enableInputs = formElement.querySelectorAll('[name]');
                    // Convert NodeList to Array
                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        values[input.name] = input.value
                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
                // Submit với hành vi mặc định
                else {
                    formElement.submit()
                }
            }
        }

        options.rules.forEach(rule => {

            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            var inputElement = formElement.querySelector(rule.selector)

            // Kiểm tra giá trị input
            if (inputElement) {
                inputElement.onblur = () =>
                    validate(inputElement, rule);
                // Xử lý khi nhập input
                inputElement.oninput = () => {
                    // var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    // errorElement.innerHTML = ''
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            }
        });
    }
}

// Định nghĩa các rules
// Nguyên tắc rules:
// 1. Khi có lỗi => message lỗi
// 2. Khi hợp lệ => do nothing
/**
 * Selector : id của mỗi input
 * test() : hàm kiểm tra input
 */
Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value, message) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}
Validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value, message) {
            const regex =
                /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
        }
    }
}

Validator.isPassWord = function(selector) {
    return {
        selector: selector,
        test: function(value, message) {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/
            return value.match(regex) ? undefined : message || `Mật khẩu cần 6 kí tự gồm chữ in hoa, chữ thường và số`
        }
    }
}
Validator.isConfirmPW = function(selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getConfirmValue() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}