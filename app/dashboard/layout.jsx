import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      {/* SIDEBAR */}
      <div className="w-64 p-5 text-white bg-purple-900">
        <h2 className="mb-6 text-2xl font-bold">Dashboard</h2>

        <div className="flex flex-col space-y-2">
          <Link href="/dashboard/profile">Profile</Link>

          <Link href="/dashboard/account">Account</Link>

          <Link href="/dashboard/settings">Settings</Link>

          <Link href="/dashboard/chat-history">Chat History</Link>

          <Link href="/dashboard/call-history">Call History</Link>
          <Link href="/dashboard/transaction">Transaction</Link>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-6 bg-gray-100">{children}</div>
    </div>
  );
}
