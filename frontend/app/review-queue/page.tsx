const cases = [
  {
    name: "Maria R.",
    issue: "Rent assistance request",
    status: "Missing Info",
    risk: "Medium",
  },
  {
    name: "Student Advising Case",
    issue: "Graduation planning support",
    status: "Needs Review",
    risk: "Low",
  },
  {
    name: "Customer Refund Case",
    issue: "Duplicate charge complaint",
    status: "High Priority",
    risk: "High",
  },
];

export default function ReviewQueuePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-4xl font-bold">Review Queue</h1>

        <div className="space-y-4">
          {cases.map((item) => (
            <div
              key={item.name}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-xl font-semibold text-blue-300">
                    {item.name}
                  </h2>
                  <p className="text-slate-300">{item.issue}</p>
                </div>

                <div className="text-sm text-slate-300">
                  <p>Status: {item.status}</p>
                  <p>Risk: {item.risk}</p>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold">
                    View
                  </button>
                  <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold">
                    Approve
                  </button>
                  <button className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold">
                    Request Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}