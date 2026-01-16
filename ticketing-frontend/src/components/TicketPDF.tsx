import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Font,
  Svg,
  Path,
  Rect,
  Circle,
} from "@react-pdf/renderer";

// Đăng ký font tiếng Việt (Roboto) từ Google Fonts
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
  ],
});

// Custom SVG Icons
const TicketIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
    />
    <Path d="M13 5v2" stroke="#ffffff" strokeWidth="2" />
    <Path d="M13 17v2" stroke="#ffffff" strokeWidth="2" />
    <Path d="M13 11v2" stroke="#ffffff" strokeWidth="2" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      ry="2"
      fill="none"
      stroke="#4f46e5"
      strokeWidth="2"
    />
    <Path d="M16 2v4" stroke="#4f46e5" strokeWidth="2" />
    <Path d="M8 2v4" stroke="#4f46e5" strokeWidth="2" />
    <Path d="M3 10h18" stroke="#4f46e5" strokeWidth="2" />
  </Svg>
);

const MapPinIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Path
      d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
      fill="none"
      stroke="#4f46e5"
      strokeWidth="2"
    />
    <Circle
      cx="12"
      cy="10"
      r="3"
      fill="none"
      stroke="#4f46e5"
      strokeWidth="2"
    />
  </Svg>
);

const ArmchairIcon = () => (
  <Svg width="16" height="16" viewBox="0 0 24 24">
    <Path
      d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"
      fill="none"
      stroke="#4f46e5"
      strokeWidth="2"
    />
    <Path
      d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"
      fill="none"
      stroke="#4f46e5"
      strokeWidth="2"
    />
    <Path d="M5 18v2" stroke="#4f46e5" strokeWidth="2" />
    <Path d="M19 18v2" stroke="#4f46e5" strokeWidth="2" />
  </Svg>
);

// Định nghĩa Styles
const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontFamily: "Roboto",
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1e293b",
    padding: 40,
    color: "#ffffff",
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 2,
    marginLeft: 10,
  },
  eventTitle: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  ticketType: {
    fontSize: 14,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mainContent: {
    padding: 40,
    flexDirection: "row",
    gap: 40,
  },
  leftCol: {
    flex: 2,
  },
  rightCol: {
    flex: 1,
    alignItems: "center",
  },
  qrContainer: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 15,
  },
  qrCode: {
    width: 150,
    height: 150,
  },
  uniqueCode: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Courier",
    color: "#1e293b",
    marginTop: 10,
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: 500,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: "#94a3b8",
  },
});

interface TicketDetail {
  uniqueCode: string;
  status: string;
  seatNumber?: string;
  purchasedAt: string;
  ticketType: { name: string; price: string | number };
  event: {
    title: string;
    startTime: string;
    venueName?: string;
    venueAddress?: string;
  };
  order: { id: number };
  purchaser: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
}

interface TicketPDFProps {
  ticket: TicketDetail;
  qrCodeDataUrl: string;
}

const TicketPDF: React.FC<TicketPDFProps> = ({ ticket, qrCodeDataUrl }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <TicketIcon />
            <Text style={styles.logoText}>TICKETEST</Text>
          </View>
          <Text style={styles.eventTitle}>{ticket.event.title}</Text>
          <Text style={styles.ticketType}>{ticket.ticketType.name}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Left Column: Info */}
          <View style={styles.leftCol}>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Chi tiết sự kiện</Text>
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <CalendarIcon />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Thời gian</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(ticket.event.startTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPinIcon />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Địa điểm</Text>
                  <Text style={styles.infoValue}>
                    {ticket.event.venueName || "Đang cập nhật"}
                  </Text>
                  {ticket.event.venueAddress && (
                    <Text
                      style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}
                    >
                      {ticket.event.venueAddress}
                    </Text>
                  )}
                </View>
              </View>

              {ticket.seatNumber && (
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <ArmchairIcon />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Vị trí ghế</Text>
                    <Text style={styles.infoValue}>{ticket.seatNumber}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Thông tin vé & Người đặt</Text>
              <View style={{ flexDirection: "row", gap: 30, marginBottom: 10 }}>
                <View>
                  <Text style={styles.infoLabel}>Loại vé</Text>
                  <Text style={styles.infoValue}>{ticket.ticketType.name}</Text>
                </View>
                <View>
                  <Text style={styles.infoLabel}>Giá vé</Text>
                  <Text
                    style={{
                      ...styles.infoValue,
                      color: "#4f46e5",
                      fontWeight: 700,
                    }}
                  >
                    {Number(ticket.ticketType.price).toLocaleString("vi-VN")} đ
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 30 }}>
                <View>
                  <Text style={styles.infoLabel}>Họ tên người đặt</Text>
                  <Text style={styles.infoValue}>
                    {ticket.purchaser.fullName}
                  </Text>
                </View>
                <View>
                  <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                  <Text style={styles.infoValue}>#{ticket.order.id}</Text>
                </View>
              </View>
              <View style={{ marginTop: 10 }}>
                <Text style={styles.infoLabel}>Email liên hệ</Text>
                <Text style={styles.infoValue}>{ticket.purchaser.email}</Text>
              </View>
            </View>
          </View>

          {/* Right Column: QR Code */}
          <View style={styles.rightCol}>
            <Text style={styles.sectionTitle}>Mã vào cổng</Text>
            <View style={styles.qrContainer}>
              <Image src={qrCodeDataUrl} style={styles.qrCode} />
              <Text style={styles.uniqueCode}>{ticket.uniqueCode}</Text>
            </View>
            <Text
              style={{
                fontSize: 8,
                color: "#94a3b8",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Vui lòng xuất trình mã này tại quầy check-in để vào cổng sự kiện.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Vé này được phát hành bởi TICKETEST. Mọi thắc mắc vui lòng liên hệ
            support@ticketest.com
          </Text>
          <Text style={{ ...styles.footerText, marginTop: 4 }}>
            Copyright © {new Date().getFullYear()} TICKETEST. All rights
            reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TicketPDF;
