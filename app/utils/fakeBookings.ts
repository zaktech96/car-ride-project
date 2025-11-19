export type FakeBooking = {
  id: string;
  serviceType: string;
  pickupLocation: string;
  destination: string;
  date: string;
  time: string;
  passengers: string;
  phoneNumber: string;
  status: string;
  paymentStatus: "paid" | "pending" | "failed" | string;
  driver: {
    name: string;
    phone: string;
    vehicle: string;
    license?: string;
    rating?: number;
  };
  estimatedPrice: string;
  createdAt: string;
};

const STORAGE_KEY = "rahla_fake_bookings";

export function getFakeBookings(): FakeBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FakeBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveFakeBookings(bookings: FakeBooking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function upsertFakeBooking(booking: FakeBooking) {
  const list = getFakeBookings();
  const idx = list.findIndex((b) => b.id === booking.id);
  if (idx >= 0) {
    list[idx] = booking;
  } else {
    list.unshift(booking);
  }
  saveFakeBookings(list);
}


