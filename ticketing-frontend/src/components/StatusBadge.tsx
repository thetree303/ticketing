import { Badge } from "./ui/badge";
import {
  type EventStatus,
  type UserStatus,
  type TicketStatus,
  type EventApprovalStatus,
  type OrderStatus,
  type UserRole,
} from "@/types";
import {
  EVENT_STATUS_BADGE_STYLE,
  USER_STATUS_BADGE_STYLE,
  TICKET_STATUS_BADGE_STYLE,
  EVENT_APPROVAL_STATUS_BADGE_STYLE,
  ORDER_STATUS_BADGE_STYLE,
  USER_ROLE_BADGE_STYLE,
} from "@/lib/statusConstant";

export const StatusBadge = ({
  status,
  type,
}: {
  status:
    | EventStatus
    | UserStatus
    | TicketStatus
    | EventApprovalStatus
    | OrderStatus
    | UserRole;
  type: "event" | "user" | "ticket" | "approval" | "order" | "role";
}) => {
  let style;
  switch (type) {
    case "event":
      style = EVENT_STATUS_BADGE_STYLE[status as EventStatus];
      break;
    case "user":
      style = USER_STATUS_BADGE_STYLE[status as UserStatus];
      break;
    case "ticket":
      style = TICKET_STATUS_BADGE_STYLE[status as TicketStatus];
      break;
    case "approval":
      style = EVENT_APPROVAL_STATUS_BADGE_STYLE[status as EventApprovalStatus];
      break;
    case "order":
      style = ORDER_STATUS_BADGE_STYLE[status as OrderStatus];
      break;
    case "role":
      style = USER_ROLE_BADGE_STYLE[status as UserRole];
      break;
    default:
      style = { color: "gray", label: status };
  }
  return (
    <Badge
      variant="default"
      className={`bg-${style.color}-100 text-${style.color}-700`}
    >
      {style.label}
    </Badge>
  );
};

export default StatusBadge;
