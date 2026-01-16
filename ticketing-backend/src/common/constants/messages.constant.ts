// src/common/constants/messages.constant.ts

export const ERROR_MESSAGES = {
  USER: {
    NOT_FOUND: 'Không tìm thấy người dùng',
    USERNAME_EXISTS: 'Tên đăng nhập đã tồn tại',
    EMAIL_EXISTS: 'Email đã được sử dụng',
    ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
    ACCOUNT_BANNED: 'Tài khoản đã bị cấm',
    INVALID_CREDENTIALS: 'Tên đăng nhập/email hoặc mật khẩu không đúng',
    INVALID_CURRENT_PASSWORD: 'Mật khẩu hiện tại không đúng',
    NO_PASSWORD: 'Người dùng không tồn tại hoặc chưa có mật khẩu',
  },
  EVENT: {
    NOT_FOUND: 'Không tìm thấy sự kiện',
    NOT_FOUND_BY_USER: 'Không tìm thấy sự kiện này của bạn',
    FORBIDDEN: 'Bạn không có quyền truy cập sự kiện này',
    CANNOT_UPDATE: 'Không thể chỉnh sửa sự kiện này',
    CANNOT_DELETE: 'Không thể xóa sự kiện này',
    CANNOT_SUBMIT: 'Không thể gửi sự kiện này để phê duyệt',
    CANNOT_APPROVE: 'Không thể phê duyệt cho sự kiện này',
    CANNOT_REJECT: 'Không thể từ chối sự kiện này',
    CANNOT_CANCEL: 'Không thể hủy sự kiện ở trạng thái hiện tại',
    ORGANIZER_NOT_FOUND: 'Không tìm thấy organizer',
    CATEGORY_NOT_FOUND: 'Không tìm thấy loại sự kiện',
  },
  TICKET: {
    NOT_FOUND: 'Không tìm thấy vé',
    NOT_FOUND_BY_CODE: 'Không tìm thấy vé với mã đã cho',
    INVALID: 'Vé không hợp lệ',
    ALREADY_CHECKED_IN: 'Vé đã được soát vào cửa trước đó',
    CANCELLED: 'Vé đã bị hủy',
    EXPIRED: 'Vé đã hết hạn',
    NOT_ACTIVE: 'Vé chưa được kích hoạt',
    UNAUTHORIZED: 'Bạn không có quyền soát vé cho sự kiện này',
    USED: 'Vé đã được sử dụng',
  },
  ORDER: {
    NOT_FOUND: 'Đơn hàng không tồn tại',
    ALREADY_REFUNDED: 'Đơn hàng đã được hoàn tiền',
    ALREADY_CANCELLED: 'Đơn hàng đã bị hủy trước đó',
    NOT_PENDING: 'Order is not pending payment',
    INVALID_SIGNATURE: 'Invalid signature',
  },
  CATEGORY: {
    NOT_FOUND: 'Category not found',
  },
};

export const SUCCESS_MESSAGES = {
  AUTH: {
    REGISTER_SUCCESS: 'Đăng ký thành công',
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  },
  TICKET: {
    CHECKIN_SUCCESS: 'Soát vé thành công',
  },
};
