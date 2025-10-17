"use client"

import ChartSection from "./chart/page";
import TableSection from "./table/page";
import StatsSection from "./stats/page";

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      

      <div className="grid grid-cols-1  gap-6">
        <div className="md:col-span-2">
          <ChartSection />
        </div>

        <div>
          <StatsSection />
        </div>
      </div>

      <div className="mt-6">
        <TableSection />
      </div>
    </div>
  )
}
