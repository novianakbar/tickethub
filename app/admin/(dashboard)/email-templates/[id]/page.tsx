import { EmailTemplateForm } from "@/components/settings/EmailTemplateForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditEmailTemplatePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const template = await prisma.emailTemplate.findUnique({
        where: { id },
    });

    if (!template) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <EmailTemplateForm initialData={template} isEditing />
        </div>
    );
}
