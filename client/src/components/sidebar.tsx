import { Check } from "lucide-react";

interface SidebarProps {
  currentStep: number;
}

export function Sidebar({ currentStep }: SidebarProps) {
  const steps = [
    { id: 1, title: "Document Upload", icon: Check },
    { id: 2, title: "Entity Information", icon: "2" },
    { id: 3, title: "GDPR Analysis", icon: "3" },
    { id: 4, title: "Compliance Report", icon: "4" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Analysis Steps</h2>
      <div className="space-y-4">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center space-x-3 p-3 rounded-lg border-l-4 ${
              step.id <= currentStep
                ? "bg-blue-50 border-blue-500"
                : step.id === currentStep + 1
                ? "bg-amber-50 border-amber-500"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                step.id <= currentStep
                  ? "bg-blue-500"
                  : step.id === currentStep + 1
                  ? "bg-amber-500"
                  : "bg-gray-300"
              }`}
            >
              {step.id <= currentStep ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <span className="text-white text-xs font-bold">{step.id}</span>
              )}
            </div>
            <span
              className={`text-sm font-medium ${
                step.id <= currentStep
                  ? "text-blue-700"
                  : step.id === currentStep + 1
                  ? "text-amber-700"
                  : "text-gray-500"
              }`}
            >
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
