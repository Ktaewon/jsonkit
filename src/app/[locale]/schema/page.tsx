"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { JsonEditor } from "@/components/editor/JsonEditor";
import { Button } from "@/components/ui/button";
import { validateJsonSchema, getExampleSchema, getExampleData } from "@/lib/json/schema";
import { Trash2, Shield, CheckCircle, XCircle, FileText } from "lucide-react";

import { useLocalStorage } from "@/hooks/use-local-storage";

export default function SchemaPage() {
    const t = useTranslations("Schema");
    const tCommon = useTranslations("Common");

    const [data, setData] = useLocalStorage<string>("jsonkit-schema-data", "");
    const [schema, setSchema] = useLocalStorage<string>("jsonkit-schema-schema", "");
    const [isValid, setIsValid] = useState<boolean | null>(null);
    const [errors, setErrors] = useState<Array<{ path: string; message: string; keyword: string }>>([]);
    const [generalError, setGeneralError] = useState<string | null>(null);

    const resetValidationState = () => {
        setIsValid(null);
        setErrors([]);
        setGeneralError(null);
    };

    const handleValidate = () => {
        const result = validateJsonSchema(data, schema);
        if (result.success) {
            setIsValid(result.isValid);
            setErrors(result.errors);
            setGeneralError(null);
        } else {
            setIsValid(null);
            setErrors([]);
            setGeneralError(result.error || t("validationFailed"));
        }
    };

    const handleLoadExample = () => {
        setData(getExampleData());
        setSchema(getExampleSchema());
        resetValidationState();
    };

    const handleClear = () => {
        setData("");
        setSchema("");
        resetValidationState();
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Shield className="h-6 w-6" /> {t("title")}
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleLoadExample}>
                        <FileText className="h-4 w-4 mr-2" />
                        {t("loadExample")}
                    </Button>
                    <Button variant="outline" onClick={handleClear} title={tCommon("clear")}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <p className="text-muted-foreground">
                {t("description")}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
                {/* JSON Data Input */}
                <div className="flex flex-col gap-2 min-h-0">
                    <h2 className="text-sm font-medium text-muted-foreground">{t("jsonData")}</h2>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                        <JsonEditor value={data} onChange={(v) => setData(v || "")} />
                    </div>
                </div>

                {/* JSON Schema Input */}
                <div className="flex flex-col gap-2 min-h-0">
                    <h2 className="text-sm font-medium text-muted-foreground">{t("jsonSchema")}</h2>
                    <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
                        <JsonEditor value={schema} onChange={(v) => setSchema(v || "")} />
                    </div>
                </div>

                {/* Validation Result */}
                <div className="flex flex-col gap-2 min-h-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted-foreground">{t("result")}</h2>
                        <Button onClick={handleValidate}>
                            <Shield className="h-4 w-4 mr-2" />
                            {t("validate")}
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 border rounded-md overflow-auto p-4 bg-muted/30">
                        {isValid === null && !generalError && (
                            <div className="text-muted-foreground text-center py-8">
                                {t("enterDataAndSchema")}
                            </div>
                        )}

                        {generalError && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                                <p className="font-medium">{tCommon("error")}</p>
                                <p className="text-sm mt-1">{generalError}</p>
                            </div>
                        )}

                        {isValid === true && (
                            <div className="bg-green-500/10 text-green-700 dark:text-green-400 p-4 rounded-md flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                <span className="font-medium">{t("valid")}</span>
                            </div>
                        )}

                        {isValid === false && (
                            <div className="space-y-4">
                                <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
                                    <XCircle className="h-5 w-5" />
                                    <span className="font-medium">{t("invalid")} ({errors.length} {t("errors")})</span>
                                </div>

                                <div className="space-y-2">
                                    {errors.map((error, index) => (
                                        <div key={`${index}-${error.path}`} className="bg-background border p-3 rounded-md text-sm">
                                            <div className="font-mono text-xs text-muted-foreground mb-1">
                                                {error.path || "/"} <span className="text-primary">({error.keyword})</span>
                                            </div>
                                            <div>{error.message}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
