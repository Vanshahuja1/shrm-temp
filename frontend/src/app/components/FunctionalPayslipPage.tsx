import React, { useCallback, useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface PayslipEmployee {
  id: string;
  empNo: string;
  name: string;
  payableDays: string;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
  department: string;
  dateOfJoining: string;
  designation: string;
}

interface FunctionalPayslipPageProps {
  employee: PayslipEmployee | null;
  onClose: () => void;
}

const FunctionalPayslipPage: React.FC<FunctionalPayslipPageProps> = ({
  employee,
  onClose,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const payslipRef = useRef<HTMLDivElement>(null);

  const payslipData = {
    employee: {
      name: employee?.name || "",
      empNo: employee?.id || "",
      dateOfJoining: employee?.dateOfJoining || "Apr 1, 2021",
      department: employee?.department || "Engineering",
      designation: employee?.designation || "Software Engineer",
      id: employee?.id || "",
    },
    company: {
      name: "Keka Technologies Private Limited",
      address:
        "Plot no. 104, Kavuri Hills, Madhapur\nHyderabad Telangana, 500033",
    },
    paymentDetails: {
      paymentMode: "Bank Transfer",
      bankName: "ICICI Bank",
      bankIFSC: "KBKH0000167",
      bankAccount: "101287000434233",
    },
    identifiers: {
      pan: "AHQP8098T",
      uan: "100549985354",
      pfNumber: "APHYD19875344334434438845",
      payCycleDate: "26 Mar - 25 Apr",
    },
    salaryDetails: {
      actualPayableDays: employee?.payableDays
        ? parseInt(employee.payableDays.split("/")[0], 10)
        : 31,
      totalWorkingDays: employee?.payableDays
        ? parseInt(employee.payableDays.split("/")[1], 10)
        : 31,
      lossOfPayDays: 0,
      daysPayable: employee?.payableDays
        ? parseInt(employee.payableDays.split("/")[0], 10)
        : 31,
    },
    earnings: {
      basic: 45000,
      hra: 20000,
      communicationReimbursement: 2000,
      professionalReimbursement: 2000,
      ltc: 2000,
      specialAllowance: 25000,
      total: employee?.totalEarnings || 96000,
    },
    contributions: {
      pfEmployee: 3000,
      total: 3000,
    },
    deductions: {
      professionalTax: 200,
      pfEmployee: 2085,
      total: employee?.totalDeductions || 2285,
    },
    netSalary: employee?.netPay || 90715,
    netSalaryInWords: "Ninety Thousand & Seven Hundred Fifteen Rupees Only",
  };

  const forceRgbStyles = (element: HTMLElement) => {
    const allElements = element.querySelectorAll('*');
    allElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed && computed.color.includes('oklch')) {
        (el as HTMLElement).style.color = 'black';
      }
      if (computed && computed.backgroundColor.includes('oklch')) {
        (el as HTMLElement).style.backgroundColor = 'white';
      }
    });
  };

  const generatePdfFromRef = useCallback(async (action: 'print' | 'download') => {
    if (!payslipRef.current) return;
    setIsLoading(true);

    forceRgbStyles(payslipRef.current);

    try {
      const canvas = await html2canvas(payslipRef.current!, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      if (action === 'download') {
        pdf.save(`Payslip_April_2021_${employee?.name || "employee"}.pdf`);
      } else {
        const pdfBlob = pdf.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            printWindow.onafterprint = () => {
              printWindow.close();
              URL.revokeObjectURL(pdfUrl);
            };
          };
        }
      }
    } catch (err) {
      console.error(`${action} error:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [employee?.name]);

  const handlePrint = useCallback(() => generatePdfFromRef('print'), [generatePdfFromRef]);
  const handleDownload = useCallback(() => generatePdfFromRef('download'), [generatePdfFromRef]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < 2 && setCurrentPage(currentPage + 1);

  return (
    <div className="w-full" ref={payslipRef}>
      <Card className="w-full shadow-none border-none">
        <CardHeader className="bg-gray-800 text-white rounded-t-lg">
          <div className="flex justify-between items-center px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">April 2021</h2>
              <span className="text-sm text-gray-300">{currentPage} / 2</span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                variant="ghost"
                className="text-white hover:bg-gray-700"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownload}
                disabled={isLoading}
                className="text-white hover:bg-gray-700"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePrint}
                disabled={isLoading}
                className="text-white hover:bg-gray-700"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">Payslip</h1>
              <p className="text-sm text-gray-600 mt-1">
                {payslipData.company.name}
              </p>
              <p className="text-xs text-gray-500">
                {payslipData.company.address}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-500">
                ONE AIM IT SOLUTIONS
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">EMP NO</span>
              <p className="font-medium">{payslipData.employee.empNo}</p>
            </div>
            <div>
              <span className="text-gray-500">DOJ</span>
              <p className="font-medium">{payslipData.employee.dateOfJoining}</p>
            </div>
            <div>
              <span className="text-gray-500">Department</span>
              <p className="font-medium">{payslipData.employee.department}</p>
            </div>
            <div>
              <span className="text-gray-500">Designation</span>
              <p className="font-medium">{payslipData.employee.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Mode</span>
              <p className="font-medium">{payslipData.paymentDetails.paymentMode}</p>
            </div>
            <div>
              <span className="text-gray-500">Bank</span>
              <p className="font-medium">{payslipData.paymentDetails.bankName}</p>
            </div>
            <div>
              <span className="text-gray-500">IFSC</span>
              <p className="font-medium">{payslipData.paymentDetails.bankIFSC}</p>
            </div>
            <div>
              <span className="text-gray-500">Account</span>
              <p className="font-medium">{payslipData.paymentDetails.bankAccount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 text-sm break-words">
            <div>
              <p className="text-gray-500 text-xs mb-1">PAN</p>
              <p className="font-medium break-all">{payslipData.identifiers.pan}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">UAN</p>
              <p className="font-medium break-all">{payslipData.identifiers.uan}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-1">PF Number</p>
              <p className="font-medium break-all">{payslipData.identifiers.pfNumber}</p>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <p className="text-gray-500 text-xs mb-1">Pay Cycle Date</p>
              <p className="font-medium">{payslipData.identifiers.payCycleDate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Actual Days</span>
              <p className="font-medium">{payslipData.salaryDetails.actualPayableDays}</p>
            </div>
            <div>
              <span className="text-gray-500">Working Days</span>
              <p className="font-medium">{payslipData.salaryDetails.totalWorkingDays}</p>
            </div>
            <div>
              <span className="text-gray-500">LOP</span>
              <p className="font-medium">{payslipData.salaryDetails.lossOfPayDays}</p>
            </div>
            <div>
              <span className="text-gray-500">Payable Days</span>
              <p className="font-medium">{payslipData.salaryDetails.daysPayable}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold mb-2">Earnings</h3>
              {[
                ["Basic", payslipData.earnings.basic],
                ["HRA", payslipData.earnings.hra],
                ["Comm. Reimburse.", payslipData.earnings.communicationReimbursement],
                ["Prof. Reimburse.", payslipData.earnings.professionalReimbursement],
                ["LTC", payslipData.earnings.ltc],
                ["Special Allow.", payslipData.earnings.specialAllowance],
              ].map(([label, value]) => (
                <div className="flex justify-between text-sm" key={label}>
                  <span>{label}</span>
                  <span>₹ {(value as number).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Earnings</span>
                <span>₹ {payslipData.earnings.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold mb-2">Contribution</h3>
                <div className="flex justify-between text-sm">
                  <span>PF</span>
                  <span>₹ {payslipData.contributions.pfEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹ {payslipData.contributions.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h3 className="font-semibold mb-2">Deductions</h3>
                <div className="flex justify-between text-sm">
                  <span>Prof. Tax</span>
                  <span>₹ {payslipData.deductions.professionalTax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>PF</span>
                  <span>₹ {payslipData.deductions.pfEmployee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹ {payslipData.deductions.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Net Salary</span>
              <span className="text-lg font-bold">₹ {payslipData.netSalary.toLocaleString()}</span>
            </div>
            <p className="text-gray-600 italic text-xs">
              {payslipData.netSalaryInWords}
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between items-center mt-4 px-6">
        <Button
          size="sm"
          variant="outline"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleNextPage}
          disabled={currentPage === 2}
        >
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onClose}
          className="ml-auto"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default FunctionalPayslipPage;