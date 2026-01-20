"use client";

import { useTranslations } from "next-intl";
import { JsonDiffEditor } from "@/components/editor/JsonDiffEditor";
import { Button } from "@/components/ui/button";
import { GitCompare, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function ComparePage() {
    const t = useTranslations("Compare");
    const tCommon = useTranslations("Common");

    // Using local storage for compare too
    const [original, setOriginal] = useLocalStorage<string>("jsonkit-compare-original", '{\n  "name": "JSONKit",\n  "version": "1.0.0"\n}');
    const [modified, setModified] = useLocalStorage<string>("jsonkit-compare-modified", '{\n  "name": "JSONKit",\n  "version": "2.0.0",\n  "newFeature": true\n}');

    const handleClear = () => {
        setOriginal("");
        setModified("");
    };

    return (
        <div className="container flex flex-col h-[calc(100vh-3.5rem)] py-6 gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <GitCompare className="h-6 w-6" /> {t("title")}
                </h1>
                {/* Actions could go here */}
            </div>

            <div className="flex flex-col gap-2 flex-1 min-h-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground hidden md:block">
                        {t("instruction")}
                    </p>
                    <div className="flex gap-2 ml-auto">
                        <Button variant="ghost" size="sm" onClick={handleClear}>
                            <Trash2 className="h-4 w-4 mr-2" /> {t("clearAll")}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 min-h-0 relative">
                    <JsonDiffEditor
                        original={original}
                        modified={modified}
                    />
                </div>
            </div>
        </div>
    );
}
