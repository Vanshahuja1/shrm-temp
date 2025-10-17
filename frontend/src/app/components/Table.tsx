'use client'

import { motion } from 'framer-motion'

interface TableProps {
  columns: string[]
  data: Record<string, string | number | boolean | null | undefined>[]
}

export default function Table({ columns, data }: TableProps) {
  return (
    <div className="overflow-x-auto rounded-xl shadow">
      <motion.table
        layout
        className="min-w-full bg-white border border-gray-200 text-sm text-gray-800"
      >
        <thead className="bg-red-50">
          <motion.tr layout className="text-left">
            {columns.map((col) => (
              <th
                key={col}
                className="px-4 py-3 font-semibold text-red-600 whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </motion.tr>
        </thead>
        <motion.tbody layout>
          {data.map((row, i) => (
            <motion.tr
              key={i}
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              className="border-t border-gray-100 hover:bg-red-50"
            >
              {columns.map((col) => (
                <td key={col} className="px-4 py-2 whitespace-nowrap">
                  {row[col.toLowerCase()] ?? '-'}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </motion.table>
    </div>
  )
}
