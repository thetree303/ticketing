export type EventStatus =
  | "Draft"
  | "Pending"
  | "Published"
  | "Rejected"
  | "Unpublished"
  | "Cancelled"
  | "Ended";

export type TicketStatus =
  | "Active"
  | "Used"
  | "Cancelled"
  | "Expired"
  | "Refunded";

export type UserRole = "customer" | "organizer" | "admin";
export type UserStatus = "active" | "locked" | "banned";
export type EventApprovalStatus = "Approved" | "Rejected";
export type OrderStatus = "Pending" | "Paid" | "Cancelled" | "Refunded";

export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber?: string;
  fullName?: string;
  role: UserRole;
  avatarUrl?: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TicketType {
  id: number;
  name: string;
  description?: string;
  price: number | string; // Backend trả về string cho kiểu numeric
  initialQuantity: number;
  soldQuantity: number;
  eventId: number;
}

export interface EventApproval {
  id: number;
  status: EventApprovalStatus;
  note: string;
  createdAt: string;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  bannerUrl?: string;
  venueName?: string;
  address?: string;
  startTime: string;
  endTime: string;
  releaseDate?: string;
  closingDate?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  status: EventStatus;
  categoryId: number;
  organizer: User;
  category?: { id: number; name: string };
  ticketTypes: any[];
  eventApprovals?: EventApproval[];
}

export interface OrderItem {
  id: number;
  ticketType: TicketType;
  uniqueCode: string;
  status: TicketStatus;
}

export interface Ticket {
  id: number;
  uniqueCode: string;
  status: TicketStatus;
  seatNumber?: string;
  purchasedAt: string;
  purchaserName?: string;
  purchaserEmail?: string;
  purchaserPhone?: string;
  checkinTime?: string;
  qrCodeUrl?: string;
  ticketType: TicketType;
  event: Event;
  order: Order;
  purchaser: User;
}

export interface Order {
  id: number;
  totalAmount: number | string;
  status: OrderStatus;
  createdAt: string;
  event: Event;
  tickets: Ticket[];
  customerId: number;
}

export interface CustomerOrder {
  id: number;
  status: OrderStatus;
  eventId: number;
  eventTitle: string;
  eventStartTime: string;
  ticketTypeId: number;
  ticketTypeName: string;
  totalAmount: number;
  createdAt: string;
}

export interface AdminEvent {
  id: number;
  title: string;
  bannerUrl?: string;
  status: EventStatus;
  startTime: string;
  venueName?: string;
  createdAt: string;
  organizerId: number;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  categoryName: string;
}

export interface AdminOrder {
  id: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: number;
  eventTitle: string;
}

export interface AdminTicket {
  id: number;
  eventTitle: string;
  ticketTypeName: string;
  price: number;
  seatNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: TicketStatus;
  checkinTime?: string;
  purchasedAt: string;
}

export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoyalCustomer {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  totalSpent: number;
  orderCount: number;
}

export interface EventComparison {
  name: string;
  revenue: number;
  ticketsSold: number;
}

export interface EventPerformance {
  id: number;
  name: string;
  revenue: number;
  soldTickets: number;
  totalTickets: number;
  checkInRate: number;
}
