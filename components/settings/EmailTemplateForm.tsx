"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Editor from "@monaco-editor/react";
import {
    Loader2,
    Save,
    Eye,
    Code,
    ArrowLeft,
    Columns,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { EmailTemplate } from "@/types/email-template";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    alias: z.string().min(2, "Alias must be at least 2 characters").regex(/^[a-z0-9_]+$/, "Alias must be lowercase matching [a-z0-9_]"),
    subject: z.string().min(2, "Subject is required"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    description: z.string().optional(),
    isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface EmailTemplateFormProps {
    initialData?: EmailTemplate;
    isEditing?: boolean;
}

const AVAILABLE_VARIABLES = [
    { key: "customerName", desc: "Customer's full name" },
    { key: "ticketNumber", desc: "Ticket identifier (e.g. TKT-101)" },
    { key: "ticketSubject", desc: "Original subject of the ticket" },
    { key: "ticketStatus", desc: "Current status of the ticket" },
    { key: "ticketLink", desc: "Direct URL to the ticket" },
    { key: "agentName", desc: "Assigned agent's name" },
    { key: "companyName", desc: "Customer's company" },
];

export function EmailTemplateForm({ initialData, isEditing = false }: EmailTemplateFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
    const [previewHtml, setPreviewHtml] = useState("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || "",
            alias: initialData?.alias || "",
            subject: initialData?.subject || "",
            content: initialData?.content || `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: sans-serif; line-height: 1.6; color: #333; }
  .button { background: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; }
</style>
</head>
<body>
  <h2>Ticket Update</h2>
  <p>Hello <strong>{{customerName}}</strong>,</p>
  <p>There has been an update to your ticket <code>{{ticketNumber}}</code>.</p>
  <p><a href="{{ticketLink}}" class="button">View Ticket</a></p>
</body>
</html>`,
            description: initialData?.description || "",
            isActive: initialData?.isActive ?? true,
        },
    });

    const content = form.watch("content");

    useEffect(() => {
        const dummyData = {
            customerName: "Alex Johnson",
            ticketNumber: "TKT-2024-001",
            ticketSubject: "Unable to access VPN",
            ticketStatus: "In Progress",
            agentName: "Sarah Connor",
            ticketLink: "http://example.com/ticket",
            companyName: "TechCorp Inc.",
        };

        let processed = content;
        Object.entries(dummyData).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, "g");
            processed = processed.replace(regex, value);
        });
        setPreviewHtml(processed);
    }, [content]);

    const onSubmit = async (values: FormValues) => {
        setSaving(true);
        try {
            const url = isEditing
                ? `/api/email-templates/${initialData?.id}`
                : "/api/email-templates";

            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Something went wrong");
            }
            toast.success(isEditing ? "Template updated successfully" : "Template created successfully");
            router.push("/admin/email-templates");
            router.refresh();
        } catch (error: unknown) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred");
            }
        } finally {
            setSaving(false);
        }
    };

    const copyVariable = (key: string) => {
        navigator.clipboard.writeText(`{{${key}}}`);
        toast.success(`Copied {{${key}}} to clipboard`);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="container mx-auto max-w-7xl py-8 space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="h-10 w-10 shrink-0" type="button" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEditing ? "Edit Template" : "Create New Template"}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Design and configure your email notification template.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button variant="outline" type="button" onClick={() => router.back()} className="flex-1 sm:flex-none">Cancel</Button>
                        <Button type="submit" disabled={saving} className="flex-1 sm:flex-none min-w-[140px]">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Template
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* General Information (Full Width on Mobile, Main on Desktop) */}
                    <div className="lg:col-span-12 space-y-8">
                        <Card className="border-border/50 shadow-sm">
                            <CardHeader>
                                <CardTitle>Template Information</CardTitle>
                                <CardDescription>Basic configuration for this email template.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Template Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Account Welcome Email" {...field} className="h-10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="alias"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>System Alias</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. account_welcome"
                                                        {...field}
                                                        disabled={isEditing}
                                                        className="font-mono h-10 bg-muted/50"
                                                    />
                                                </FormControl>
                                                <FormDescription>Unique ID used by the system.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="subject"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subject Line</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter the email subject..." {...field} className="h-10 font-medium" />
                                            </FormControl>
                                            <FormDescription>The subject line recipients will see.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Briefly describe when this email is sent..." {...field} className="h-10" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 h-10 mt-[30px]">
                                                <div className="space-y-0.5">
                                                    <FormLabel className="text-sm font-medium">Status Active</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Variables Helper */}
                        <div className="flex flex-wrap gap-2 items-center p-4 bg-muted/30 rounded-lg border border-dashed">
                            <div className="flex items-center text-sm font-medium text-muted-foreground mr-2">
                                <Info className="w-4 h-4 mr-2" />
                                Available Variables:
                            </div>
                            {AVAILABLE_VARIABLES.map((v) => (
                                <TooltipProvider key={v.key}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Badge
                                                variant="secondary"
                                                className="cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors font-mono py-1 px-2"
                                                onClick={() => copyVariable(v.key)}
                                            >
                                                {`{{${v.key}}}`}
                                            </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <p>{v.desc} - Click to copy</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* Editor Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Code className="h-5 w-5 text-primary" />
                                    Template Content
                                </h3>

                                <div className="flex items-center bg-muted rounded-lg p-1">
                                    <Button
                                        type="button"
                                        variant={viewMode === "edit" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("edit")}
                                        className="h-8 px-3 text-xs"
                                    >
                                        <Code className="mr-2 h-3.5 w-3.5" /> Editor Only
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === "split" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("split")}
                                        className="h-8 px-3 text-xs"
                                    >
                                        <Columns className="mr-2 h-3.5 w-3.5" /> Split View
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={viewMode === "preview" ? "secondary" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("preview")}
                                        className="h-8 px-3 text-xs"
                                    >
                                        <Eye className="mr-2 h-3.5 w-3.5" /> Preview Only
                                    </Button>
                                </div>
                            </div>

                            <div className="h-[600px] border rounded-xl overflow-hidden shadow-sm flex bg-background">
                                {(viewMode === "edit" || viewMode === "split") && (
                                    <div className={cn(
                                        "h-full flex flex-col border-r",
                                        viewMode === "split" ? "w-1/2" : "w-full"
                                    )}>
                                        <div className="bg-muted/30 border-b px-4 py-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">HTML Source</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <Editor
                                                height="100%"
                                                defaultLanguage="html"
                                                value={content}
                                                onChange={(value) => form.setValue("content", value || "")}
                                                theme="vs-dark"
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                    lineHeight: 1.5,
                                                    padding: { top: 16, bottom: 16 },
                                                    scrollBeyondLastLine: false,
                                                    wordWrap: "on",
                                                    automaticLayout: true,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {(viewMode === "preview" || viewMode === "split") && (
                                    <div className={cn(
                                        "h-full flex flex-col bg-white",
                                        viewMode === "split" ? "w-1/2" : "w-full"
                                    )}>
                                        <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
                                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Preview Result</span>
                                        </div>
                                        <div className="flex-1 overflow-auto p-8">
                                            <div
                                                className="prose max-w-none prose-slate"
                                                dangerouslySetInnerHTML={{ __html: previewHtml }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-xs text-muted-foreground pt-2">
                                Pro tip: Use the variables listed above to insert dynamic data into your template.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    );
}
