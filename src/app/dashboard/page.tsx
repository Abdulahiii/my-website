import Link from 'next/link';

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-black text-2xl font-semibold">Dashboard (Team Member)</h1>
        <p className="text-gray-600">Welcome, [Team Member Name]!</p>
      </header>

      <div className="mt-6">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        <table className="w-full mt-4 border-collapse bg-white shadow-md rounded-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Deadline</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Comments</th>
            </tr>
          </thead>
          <tbody>
            {/* Example row */}
            <tr>
              <td className="p-3 border">Task 1</td>
              <td className="p-3 border">Description</td>
              <td className="p-3 border">Tomorrow</td>
              <td className="p-3 border">High</td>
              <td className="p-3 border">In Progress</td>
              <td className="p-3 border">None</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notification Icon */}
      <Link href="/notifications">
        <img
          src="/notification_icon.svg"
          alt="Notifications"
          className="fixed bottom-6 right-6 w-12 h-12 cursor-pointer"
        />
      </Link>
    </main>
  );
}
