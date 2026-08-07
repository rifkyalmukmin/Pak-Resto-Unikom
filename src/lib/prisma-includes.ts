export const orderInclude = {
  detail_pesanan: { include: { menu: true } },
  meja: true,
  user: {
    select: {
      id_user: true,
      nama_lengkap: true,
      username: true,
      role: true,
    },
  },
  pembayaran: true,
} as const;

export const paymentInclude = {
  user: {
    select: {
      id_user: true,
      nama_lengkap: true,
      username: true,
      role: true,
    },
  },
  pesanan: {
    include: {
      detail_pesanan: { include: { menu: true } },
      meja: true,
    },
  },
} as const;
