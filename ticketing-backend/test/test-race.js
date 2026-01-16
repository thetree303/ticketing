// TEST TRANH VÉ: CÓ 1 VÉ, 2 NGƯỜI CÙNG MUA
const axios = require('axios');

// --- CẤU HÌNH ---
const API_URL = 'http://localhost:3000/orders';
const TICKET_TYPE_ID = 15;
const EVENT_ID = 22;

// Token của User A, B
const TOKEN_USER_A =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgsInVzZXJuYW1lIjoidGVzdGN1czAxIiwiZW1haWwiOiJ0ZXN0Y3VzMDFAZXhhbXBsZS5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJzdGF0dXMiOiJhY3RpdmUiLCJpYXQiOjE3Njc1MjUyNjQsImV4cCI6MTc2NzYxMTY2NH0.dAjPXmA2WjVoC1bJLmyZLA7aJU01iOvhbrhdQ9swJV8';
const TOKEN_USER_B =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjksInVzZXJuYW1lIjoidGVzdGN1czAyIiwiZW1haWwiOiJ0ZXN0Y3VzMDJAYWJjLmNvbSIsInJvbGUiOiJjdXN0b21lciIsInN0YXR1cyI6ImFjdGl2ZSIsImlhdCI6MTc2NzUyNTYzMSwiZXhwIjoxNzY3NjEyMDMxfQ.zw2oxv6me5k8oVXNfSIV2sf4C-SllF7ZkomXelyMpqI';

// Payload đặt vé (Mua 1 vé)
const payload = {
  eventId: EVENT_ID,
  items: [
    {
      ticketTypeId: TICKET_TYPE_ID,
      quantity: 1,
    },
  ],
};

// Hàm gọi API
const createOrder = async (userName, token) => {
  try {
    const response = await axios.post(API_URL, payload, {
      headers: { Authorization: token },
    });
    console.log(`${userName} THÀNH CÔNG: Order ID ${response.data.id}`);
    return { user: userName, status: 'success', data: response.data };
  } catch (error) {
    console.log(
      `${userName} THẤT BẠI: ${error.response?.data?.message || error.message}`,
    );
    return {
      user: userName,
      status: 'failed',
      reason: error.response?.data?.message,
    };
  }
};

const runTest = async () => {
  console.log(`--- BẮT ĐẦU TEST TRANH VÉ (Còn 1 vé) ---`);

  // Chạy đồng thời 2 request đặt vé
  await Promise.all([
    createOrder('User A', TOKEN_USER_A),
    createOrder('User B', TOKEN_USER_B),
  ]);

  console.log(`--- KẾT THÚC TEST ---`);
};

runTest();
