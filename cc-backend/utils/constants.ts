export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/
export const STATE_REGEX = /^[A-Z]{2}$/
export const ZIPCODE_REGEX = /^\d{5}(?:[-\s]\d{4})?$/
export const COUNTRY_REGEX = /^[A-Z]{2,3}$/


export const STATUS_CODE = {
    HTTP_OK: 200,
    HTTP_CREATED: 201,
    HTTP_BAD_REQUEST: 400,
    HTTP_UNAUTHORIZED: 401,
    HTTP_FORBIDDEN: 403,
    HTTP_NOT_FOUND: 404,
    HTTP_INTERNAL_SERVER_ERROR: 500
}