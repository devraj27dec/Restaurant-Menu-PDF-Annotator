
export default function Stepper({step}:{step:number}) {
  return (
    <div className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="relative">

          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {[
              {
                number: 1,
                label: "Upload",
                description: "Select your PDF file",
              },
              {
                number: 2,
                label: "Annotate",
                description: "Mark menu items",
              },
              {
                number: 3,
                label: "Review",
                description: "Verify extracted data",
              },
              {
                number: 4,
                label: "Export",
                description: "Download your data",
              },
            ].map((s) => (
              <div
                key={s.number}
                className="flex flex-col items-center"
                style={{ flex: 1 }}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 relative z-10 ${
                    s.number < step
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : s.number === step
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-4 ring-blue-200"
                      : "bg-white border-2 border-gray-300 text-gray-400"
                  }`}
                >
                  {s.number < step ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{s.number}</span>
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-3 text-center">
                  <div
                    className={`text-sm font-semibold transition-colors ${
                      s.number <= step ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-2">
                    {s.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
