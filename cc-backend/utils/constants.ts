export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[a-zA-Z\d!@#$%^&*(),.?":{}|<>]{8,}$/
export const PHONE_NUMBER_REGEX = /^\+?[1-9]\d{1,14}$/
export const MIN_PASSWORD_LENGTH = 8
export const MIN_NAME_LENGTH = 2
export const MAX_NAME_LENGTH = 100
export const MIN_PHONE_NUMBER_LENGTH = 10
export const MAX_PHONE_NUMBER_LENGTH = 15

export const STATUS_CODE = {
    HTTP_OK: 200,
    HTTP_CREATED: 201,
    HTTP_BAD_REQUEST: 400,
    HTTP_UNAUTHORIZED: 401,
    HTTP_FORBIDDEN: 403,
    HTTP_NOT_FOUND: 404,
    HTTP_INTERNAL_SERVER_ERROR: 500
}