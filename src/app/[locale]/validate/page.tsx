"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { validateJson } from "@/lib/json/validate";
import { FileCheck, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { useLocalStorage } from "@/hooks/use-local-storage";

export default function ValidatePage() {
    const t = useTranslations("Validate");
    const tCommon = useTranslations("Common");

    const [input, setInput] = useLocalStorage<string>("jsonkit-validate-input", "");
    const [result, setResult] = useState<{
        isValid: boolean | null;
        message?: string;
        line?: number;
    }>({ isValid: null });

    const handleValidate = () => {
        const { isValid, error } = validateJson(input);
        if (isValid) {
            setResult({ isValid: true, message: t("valid") });
        } else {
            setResult({
                isValid: false,
                message: error?.message,
                line: error?.line,
            });
        }
    };

    const handleClear = () => {
        setInput("");
        setResult({ isValid: null });
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FileCheck className="h-6 w-6" /> {t("title")}
                </h1>
            </div>
            <p className="text-muted-foreground">
                {t("description")}
            </p>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button onClick={handleValidate}>{t("validateBtn")}</Button>
                        <Button variant="outline" onClick={handleClear}>
                            <Trash2 className="h-4 w-4 mr-2" /> {tCommon("clear")}
                        </Button>
                    </div>
                    {result.isValid !== null && (
                        <div
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-md font-medium",
                                result.isValid
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            )}
                        >
                            {result.isValid ? (
                                <>
                                    <CheckCircle2 className="h-5 w-5" /> {t("valid")}
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="h-5 w-5" /> {t("invalid")}
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-h-0 border rounded-md overflow-hidden relative">
                    <JsonEditor value={input} onChange={(v) => setInput(v || "")} />

                    {result.isValid === false && (
                        <div className="absolute bottom-4 left-4 right-4 bg-destructive text-destructive-foreground p-3 rounded-md text-sm shadow-lg animate-in fade-in slide-in-from-bottom-2">
                            <p className="font-bold">{t("errorFound")}</p>
                            <pre className="whitespace-pre-wrap mt-1">{result.message}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
