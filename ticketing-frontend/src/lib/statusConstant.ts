import {
  type EventStatus,
  type UserStatus,
  type TicketStatus,
  type EventApprovalStatus,
  type OrderStatus,
  type UserRole,
} from "@/types";

export const EVENT_STATUS_BADGE_STYLE: Record<
  EventStatus,
  { color: string; label: string }
> = {
  Draft: { color: "slate", label: "Chưa gửi" },
  Pending: { color: "amber", label: "Chờ duyệt" },
  Published: { color: "lime", label: "Đã mở bán" },
  Rejected: { color: "red", label: "Bị từ chối" },
  Unpublished: { color: "slate", label: "Chưa mở bán" },
  Cancelled: { color: "red", label: "Đã hủy" },
  Ended: { color: "slate", label: "Đã kết thúc" },
};

export const USER_STATUS_BADGE_STYLE: Record<
  UserStatus,
  { color: string; label: string }
> = {
  active: { color: "lime", label: "Hoạt động" },
  locked: { color: "yellow", label: "Tạm khóa" },
  banned: { color: "red", label: "Bị cấm" },
};

export const TICKET_STATUS_BADGE_STYLE: Record<
  TicketStatus,
  { color: string; label: string }
> = {
  Active: { color: "lime", label: "Khả dụng" },
  Used: { color: "slate", label: "Đã check-in" },
  Cancelled: { color: "red", label: "Đã hủy" },
  Expired: { color: "yellow", label: "Hết hạn" },
  Refunded: { color: "blue", label: "Đã hoàn tiền" },
};

export const EVENT_APPROVAL_STATUS_BADGE_STYLE: Record<
  EventApprovalStatus,
  { color: string; label: string }
> = {
  Approved: { color: "lime", label: "Đã duyệt" },
  Rejected: { color: "red", label: "Bị từ chối" },
};

export const ORDER_STATUS_BADGE_STYLE: Record<
  OrderStatus,
  { color: string; label: string }
> = {
  Pending: { color: "yellow", label: "Chờ thanh toán" },
  Paid: { color: "lime", label: "Đã thanh toán" },
  Cancelled: { color: "red", label: "Đã hủy" },
  Refunded: { color: "blue", label: "Đã hoàn tiền" },
};

export const USER_ROLE_BADGE_STYLE: Record<
  UserRole,
  { color: string; label: string }
> = {
  customer: { color: "blue", label: "Khách hàng" },
  organizer: { color: "violet", label: "Nhà tổ chức" },
  admin: { color: "red", label: "Quản trị viên" },
};
