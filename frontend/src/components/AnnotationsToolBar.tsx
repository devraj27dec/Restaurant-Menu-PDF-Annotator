

export default function AnnotationInstruction() {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold mb-3">🎯 How to Use</h3>

      <ol className="text-sm text-gray-600 space-y-2">
        <li className="flex gap-2">
          <span className="font-bold text-blue-600">1.</span>
          <span>Create a group first</span>
        </li>

        <li className="flex gap-2">
          <span className="font-bold text-blue-600">2.</span>
          <span>Draw a box around each menu item</span>
        </li>

        <li className="flex gap-2">
          <span className="font-bold text-blue-600">3.</span>
          <span>Enter category, name, price, and description</span>
        </li>

         <li className="flex gap-2">
          <span className="font-bold text-blue-600">1.</span>
          <span>Finish the Group</span>
        </li>

        <li className="flex gap-2">
          <span className="font-bold text-blue-600">4.</span>
          <span>Review and edit if needed</span>
        </li>

        <li className="flex gap-2">
          <span className="font-bold text-blue-600">5.</span>
          <span>Save to database</span>
        </li>
      </ol>
    </div>
  );
}

