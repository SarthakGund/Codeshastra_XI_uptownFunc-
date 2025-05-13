"use client";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}

export default function DashboardPage() {
  const user: User = {
    email: "user@example.com",
    firstName: "John",
    lastName: "Doe",
  };

  return (
    <div>
      Welcome, {user.email}!
    </div>
  );
}

