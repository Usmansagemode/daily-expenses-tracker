"use client";

import React from "react";
import { Brain, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { createColumns } from "@/app/expenses/columns";
import { DataTable } from "@/app/expenses/data-table";
import { StandardFormatMapping } from "@/components/import-expenses/StandardFormatMapping";
import { StandardWithCategoryMapping } from "@/components/import-expenses/StandardWithCategoryMapping";
import { WideFormatMappingComponent } from "@/components/import-expenses/WideFormatMapping";
import {
  CSVImportProvider,
  DocumentStyle,
  useCSVImport,
} from "@/components/providers/context/CSVImportContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_MEMBERS,
  DEFAULT_TAGS,
} from "@/lib/config";
import { isGeminiConfigured } from "@/lib/gemini";
import { getIsDemoMode } from "@/lib/supabase";

// Step 1: Upload Component
function UploadStep() {
  const {
    documentStyle,
    setDocumentStyle,
    handleFile,
    setStep,
    setMappedData,
  } = useCSVImport();
  const [isProcessingPDF, setIsProcessingPDF] = React.useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onPDFChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingPDF(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-pdf", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 429 || errorData.code === "RATE_LIMIT") {
          toast.error("Rate Limit Exceeded", {
            description:
              errorData.details ||
              "You've hit the API rate limit. Please try again in a few hours.",
          });
          return;
        }

        throw new Error(errorData.error || "Failed to parse PDF");
      }

      const { expenses } = await response.json();
      console.log("Parsed expenses from PDF:", expenses);
      toast.success("PDF Processed Successfully", {
        description: `Found ${expenses.length} ${expenses.length === 1 ? "transaction" : "transactions"}`,
      });
      setMappedData(expenses);
      setStep("preview");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Failed to Process PDF", {
        description: "Please try again with a different file.",
      });
    } finally {
      setIsProcessingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import Expenses</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Upload a CSV file or let AI parse your bank statement PDF
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* CSV Upload Card */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-blue-600" />
              Import CSV
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <div className="space-y-3">
              <Label htmlFor="document-style">Document Style</Label>
              <Select
                value={documentStyle || ""}
                onValueChange={(val) => setDocumentStyle(val as DocumentStyle)}
              >
                <SelectTrigger id="document-style" className="w-full">
                  <SelectValue placeholder="Select document style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">
                    Standard (Bank Statement style)
                  </SelectItem>
                  <SelectItem value="standard-with-category">
                    Standard with Category
                  </SelectItem>
                  <SelectItem value="wide-format">
                    Wide Format (Category Columns)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                {documentStyle === "standard" &&
                  "For CSVs with date, amount, description in separate columns"}
                {documentStyle === "standard-with-category" &&
                  "For CSVs with date, amount, description and category in separate columns"}
                {documentStyle === "wide-format" &&
                  "For CSVs where each category is a column with amounts"}
                {!documentStyle && "Choose based on your CSV structure"}
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <div className="flex gap-2">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={onFileChange}
                  disabled={!documentStyle}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  disabled={isProcessingPDF || isGeminiConfigured() === false}
                  asChild
                  className="shrink-0"
                >
                  <Label htmlFor="csv-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Browse
                  </Label>
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground pt-2 text-sm">
              Select a document style first, then choose your CSV file.
            </p>
          </CardContent>
        </Card>

        {/* PDF Upload Card */}
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Brain className="h-5 w-5 text-purple-600" />
              AI PDF Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-sm text-blue-800">
                Upload your bank statement PDF and AI will automatically extract
                transactions from any bank format.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Label htmlFor="pdf-upload">Upload PDF Statement</Label>
              <div className="flex gap-2">
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={onPDFChange}
                  disabled={isProcessingPDF || isGeminiConfigured() === false}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  disabled={isProcessingPDF || isGeminiConfigured() === false}
                  asChild
                  className="shrink-0"
                  style={{
                    cursor:
                      isGeminiConfigured() === false
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  <Label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Browse
                  </Label>
                </Button>
              </div>
            </div>

            {isProcessingPDF && (
              <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                <div>
                  <p className="text-sm font-medium">Processing PDF with AI</p>
                  <p className="text-muted-foreground text-xs">
                    Extracting transactions from your statement...
                  </p>
                </div>
              </div>
            )}

            <p className="text-muted-foreground pt-2 text-sm">
              AI will automatically extract date, amount, and description for
              each transaction.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Step 2: Mapping Component
function MappingStep() {
  const { documentStyle } = useCSVImport();

  switch (documentStyle) {
    case "standard":
      return <StandardFormatMapping />;
    case "wide-format":
      return <WideFormatMappingComponent />;
    case "standard-with-category":
      return <StandardWithCategoryMapping />;
    default:
      return null;
  }
}

// Step 3: Preview Component
function PreviewStep() {
  const {
    mappedData,
    setStep,
    setMappedData,
    handleSave,

    documentStyle,
  } = useCSVImport();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Preview Imported Data</h2>
      <p className="text-muted-foreground text-sm">
        Review and edit before saving. Found {mappedData.length} expenses.
      </p>

      <DataTable
        data={mappedData}
        columns={createColumns({
          categories: DEFAULT_CATEGORIES,
          members: DEFAULT_MEMBERS,
          onDelete: (id) => {
            setMappedData(mappedData.filter((item) => item.id !== id));
          },
          onUpdate: (id, field, value) => {
            setMappedData(
              mappedData.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
              ),
            );
          },
          tags: DEFAULT_TAGS,
        })}
      />

      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => setStep(documentStyle === null ? "upload" : "map")}
        >
          Back to {documentStyle === null ? "Upload" : "Mapping"}
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSave}
              disabled={mappedData.length === 0 || getIsDemoMode()}
            >
              Save {mappedData.length} Expenses
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {getIsDemoMode()
              ? "Saving is disabled in Demo Mode"
              : "Save imported expenses to your account"}
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// Main component
function ImportWizard() {
  const { step } = useCSVImport();

  const renderStep = () => {
    switch (step) {
      case "upload":
        return <UploadStep />;
      case "map":
        return <MappingStep />;
      case "preview":
        return <PreviewStep />;
      default:
        return null;
    }
  };

  return <div className="space-y-6 p-4">{renderStep()}</div>;
}

// Outer component that provides the context
export default function CSVImportWizard() {
  return (
    <CSVImportProvider>
      <ImportWizard />
    </CSVImportProvider>
  );
}
