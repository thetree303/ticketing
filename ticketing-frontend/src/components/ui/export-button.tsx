import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  data: any[];
  filename: string;
  sheetName?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  data,
  filename,
  sheetName = "Sheet1",
  variant = "outline",
  size = "default",
  className,
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = `${filename}_${timestamp}.xlsx`;

    XLSX.writeFile(wb, finalFilename);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      Export Excel
    </Button>
  );
}
