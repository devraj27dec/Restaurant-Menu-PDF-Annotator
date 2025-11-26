
export default function InstructionsPannel() {
  return (
    <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold mb-3 text-sm">📝 Instructions</h3>
        <ol className="text-xs text-gray-600 space-y-2">
            <li>1. Select annotation type</li>
            <li>2. Click "Start New Group"</li>
            <li>3. Draw boxes on menu items</li>
            <li>4. Enter extracted text</li>
            <li>5. Click "Finish Group"</li>
            <li>6. Repeat for all items</li>
        </ol>
    </div>
  )
}