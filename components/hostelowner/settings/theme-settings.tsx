'use client';

import { Sun, Moon, Laptop, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useDashboardTheme, ThemeMode } from '@/hooks/useDashboardTheme';

export default function ThemeSettings({
    storageKey = 'owner-theme-preference',
    title = 'System Theme',
    description = 'Configure the color theme for your dashboard. This setting applies only to your management console.'
}: {
    storageKey?: string;
    title?: string;
    description?: string;
}) {
    const { theme, setTheme, resolvedTheme, mounted } = useDashboardTheme(storageKey);

    return (
        <Card className="border border-border/40 rounded-xl bg-card shadow-xs">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Sparkles size={20} />
                </div>
                <div className="space-y-1">
                    <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-border/60 bg-muted/20">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Theme Preference</p>
                        <p className="text-xs text-muted-foreground">Select light, dark, or automatic system sync.</p>
                    </div>

                    <div className="shrink-0">
                        <Select
                            value={mounted ? theme : "system"}
                            onValueChange={(val) => setTheme(val as ThemeMode)}
                        >
                            <SelectTrigger className="w-full sm:w-[160px] h-9 text-xs font-semibold rounded-lg bg-card border-border shadow-2xs cursor-pointer">
                                <SelectValue placeholder="Select Theme" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border bg-card shadow-lg z-50">
                                <SelectItem value="light" className="text-xs font-medium cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <Sun size={14} className="text-amber-500 shrink-0" />
                                        <span>Light Theme</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="dark" className="text-xs font-medium cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <Moon size={14} className="text-indigo-400 shrink-0" />
                                        <span>Dark Theme</span>
                                    </span>
                                </SelectItem>
                                <SelectItem value="system" className="text-xs font-medium cursor-pointer">
                                    <span className="flex items-center gap-2">
                                        <Laptop size={14} className="text-blue-500 shrink-0" />
                                        <span>System Default</span>
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span>
                        Current active display:{' '}
                        <span className="font-semibold text-foreground capitalize">
                            {mounted ? resolvedTheme : 'Detecting...'}
                        </span>
                        {mounted && theme === 'system' && (
                            <span className="ml-1 text-[11px] text-muted-foreground">(Synchronized with device OS)</span>
                        )}
                    </span>
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        Public pages remain in default light theme
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
